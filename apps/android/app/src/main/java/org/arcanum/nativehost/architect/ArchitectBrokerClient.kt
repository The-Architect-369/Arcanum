package org.arcanum.nativehost.architect

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.security.MessageDigest
import java.time.Instant
import java.util.UUID
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec

/**
 * Native bridge to the local Termux Architect broker.
 *
 * CE-W04-A11 preserves the A09/A10 fixed action allowlist and loopback-only
 * transport while authenticating each native request/response against a
 * Human-mediated app-private pairing secret and one ephemeral broker session.
 */
class ArchitectBrokerClient(
    context: Context,
    private val baseUrl: String = LOOPBACK_BASE_URL,
) {
    private val pairingStore = ArchitectPairingStore(context.applicationContext)

    enum class Action(
        val commandId: String,
        val label: String,
        val description: String,
        val expectedRisk: String,
    ) {
        GIT_STATUS("git_status", "Repository status", "Show concise working-tree and index state.", "read_only"),
        GIT_BRANCH("git_branch", "Current branch", "Show the checked-out Git branch.", "read_only"),
        GIT_HEAD("git_head", "Current commit", "Show the exact checked-out commit SHA.", "read_only"),
        GIT_LOG_10("git_log_10", "Recent commits", "Show the ten most recent commits in compact form.", "read_only"),
        GIT_DIFF_NAMES("git_diff_names", "Changed filenames", "Show filenames changed in the unstaged working tree.", "read_only"),
        GIT_DIFF_STAT("git_diff_stat", "Diff statistics", "Show a summary of unstaged repository differences.", "read_only"),
        VERIFY_SYNC("verify_sync", "Verify synchronization", "Run the canonical repository synchronization verifier.", "verification"),
    }

    data class HumanApproval(
        val approvalId: String,
        val approvedAt: String,
        val surface: String = "native_dialog",
    ) {
        companion object {
            fun now(): HumanApproval =
                HumanApproval(
                    approvalId = UUID.randomUUID().toString(),
                    approvedAt = Instant.now().toString(),
                )
        }
    }

    data class BrokerStatus(
        val branch: String?,
        val commit: String?,
        val repository: String?,
        val sessionId: String?,
        val registeredActionCount: Int,
        val startedAt: String?,
        val authenticated: Boolean,
    )

    data class ExecutionResult(
        val action: Action,
        val branch: String?,
        val commit: String?,
        val exitCode: Int,
        val durationMs: Double?,
        val startedAt: String?,
        val completedAt: String?,
        val stdout: String,
        val stderr: String,
        val stdoutTruncated: Boolean,
        val stderrTruncated: Boolean,
        val receiptId: String?,
        val requestId: String?,
        val sessionId: String?,
        val approvalId: String?,
        val requestSha256: String?,
        val resultSha256: String?,
        val responseSha256: String,
    )

    fun hasPairing(): Boolean = pairingStore.hasPairing()

    fun pair(pairingCode: String) {
        pairingStore.savePairingCode(pairingCode)
    }

    fun clearPairing() {
        pairingStore.clear()
    }

    fun probe(): Result<BrokerStatus> = runCatching {
        val health = fetchHealth()
        val secret = pairingStore.loadSecret()
            ?: return@runCatching health.toStatus(authenticated = false)

        try {
            val request = newBoundRequest(health)
            val authenticated =
                postAuthenticated(
                    path = "/session",
                    body = request.body,
                    secret = secret,
                    clientId = CLIENT_ID,
                    sessionId = request.sessionId,
                    requestId = request.requestId,
                    requestedAt = request.requestedAt,
                    nonce = request.nonce,
                )

            val receipt = authenticated.json
            require(receipt.optString("receiptType") == "architect_session_receipt") {
                "Broker did not return an authenticated session receipt"
            }
            require(receipt.optString("status") == "pass") {
                "Broker session verification did not pass"
            }
            require(receipt.optString("sessionId") == request.sessionId) {
                "Session receipt is bound to a different broker session"
            }
            require(receipt.optString("requestId") == request.requestId) {
                "Session receipt is bound to a different request"
            }
            require(receipt.optString("requestSha256") == authenticated.requestSha256) {
                "Session receipt request digest does not match exact sent bytes"
            }
            verifyResultDigest(receipt)

            health.toStatus(authenticated = true)
        } finally {
            secret.fill(0)
        }
    }

    fun execute(
        action: Action,
        approval: HumanApproval,
    ): Result<ExecutionResult> = runCatching {
        require(approval.surface == "native_dialog") {
            "Architect execution approval must originate from the native dialog"
        }

        val health = fetchHealth()
        val commands = health.json.optJSONArray("commands")
            ?: error("Broker did not publish its registered action set")
        val registered =
            (0 until commands.length())
                .asSequence()
                .mapNotNull { commands.optJSONObject(it) }
                .firstOrNull { it.optString("id") == action.commandId }

        require(registered != null) {
            "Selected Architect action is not registered by the local broker"
        }
        require(registered.optString("risk") == action.expectedRisk) {
            "Broker action risk does not match the native allowlist"
        }

        // A11 rejects the legacy source pattern approvedByHumanArchitect", true as authorization.
        val secret = pairingStore.loadSecret()
            ?: error("Architect broker is not paired with this native app")

        try {
            val request = newBoundRequest(health)
            request.body
                .put("commandId", action.commandId)
                .put(
                    "approval",
                    JSONObject()
                        .put("approvalId", approval.approvalId)
                        .put("approvedAt", approval.approvedAt)
                        .put("surface", approval.surface),
                )

            val authenticated =
                postAuthenticated(
                    path = "/execute",
                    body = request.body,
                    secret = secret,
                    clientId = CLIENT_ID,
                    sessionId = request.sessionId,
                    requestId = request.requestId,
                    requestedAt = request.requestedAt,
                    nonce = request.nonce,
                )
            val receipt = authenticated.json

            require(receipt.optString("receiptType") == "architect_execution_receipt") {
                "Broker did not return an execution receipt"
            }
            require(receipt.optString("sessionId") == request.sessionId) {
                "Execution receipt is bound to a different broker session"
            }
            require(receipt.optString("requestId") == request.requestId) {
                "Execution receipt is bound to a different request"
            }
            require(receipt.optString("requestSha256") == authenticated.requestSha256) {
                "Execution receipt request digest does not match exact sent bytes"
            }
            require(receipt.optString("stdoutSha256") == sha256Hex(receipt.optString("stdout").toByteArray(Charsets.UTF_8))) {
                "Execution stdout digest verification failed"
            }
            require(receipt.optString("stderrSha256") == sha256Hex(receipt.optString("stderr").toByteArray(Charsets.UTF_8))) {
                "Execution stderr digest verification failed"
            }
            verifyResultDigest(receipt)

            if (receipt.optString("status") != "pass") {
                val stderr = receipt.optString("stderr")
                error("Registered Architect action failed${if (stderr.isBlank()) "" else ": $stderr"}")
            }

            ExecutionResult(
                action = action,
                branch = receipt.optString("branch").takeIf { it.isNotBlank() } ?: health.branch,
                commit = receipt.optString("commitAfter").takeIf { it.isNotBlank() } ?: health.commit,
                exitCode = receipt.optInt("exitCode", -1),
                durationMs = if (receipt.has("durationMs")) receipt.optDouble("durationMs") else null,
                startedAt = receipt.optString("startedAt").ifBlank { null },
                completedAt = receipt.optString("completedAt").ifBlank { null },
                stdout = receipt.optString("stdout"),
                stderr = receipt.optString("stderr"),
                stdoutTruncated = receipt.optBoolean("stdoutTruncated", false),
                stderrTruncated = receipt.optBoolean("stderrTruncated", false),
                receiptId = receipt.optString("receiptId").ifBlank { null },
                requestId = receipt.optString("requestId").ifBlank { null },
                sessionId = receipt.optString("sessionId").ifBlank { null },
                approvalId = receipt.optJSONObject("approval")?.optString("approvalId")?.ifBlank { null },
                requestSha256 = receipt.optString("requestSha256").ifBlank { null },
                resultSha256 = receipt.optString("resultSha256").ifBlank { null },
                responseSha256 = authenticated.responseSha256,
            )
        } finally {
            secret.fill(0)
        }
    }

    private fun fetchHealth(): Health {
        val response = requestUnsigned("GET", "/health")
        val json = response.json
        require(json.optString("schemaVersion") == SCHEMA_VERSION) { "Unexpected Architect broker schema version" }
        require(json.optString("service") == SERVICE_NAME) { "Unexpected local broker service" }
        require(json.optString("status") == "ready") { "Local Architect broker is not ready" }
        require(json.optBoolean("authRequired", false)) { "Local Architect broker did not require A11 authentication" }
        require(json.optString("authAlgorithm") == AUTH_ALGORITHM) { "Unexpected Architect broker authentication algorithm" }
        require(json.optString("clientId") == CLIENT_ID) { "Local broker is bound to a different native client" }
        val commands = json.optJSONArray("commands") ?: error("Broker did not publish its registered action set")
        return Health(
            json = json,
            repository = json.optString("repository").ifBlank { null },
            branch = json.optString("branch").ifBlank { null },
            commit = json.optString("commit").ifBlank { null },
            sessionId = json.optString("sessionId").ifBlank { null },
            registeredActionCount = commands.length(),
            startedAt = json.optString("startedAt").ifBlank { null },
        )
    }

    private fun newBoundRequest(health: Health): BoundRequest {
        val repository = requireNotNull(health.repository) { "Broker health did not publish repository identity" }
        val branch = requireNotNull(health.branch) { "Broker health did not publish an active branch" }
        val head = requireNotNull(health.commit) { "Broker health did not publish an exact HEAD" }
        val sessionId = requireNotNull(health.sessionId) { "Broker health did not publish a session ID" }
        val requestId = UUID.randomUUID().toString()
        val nonce = UUID.randomUUID().toString().replace("-", "")
        val requestedAt = Instant.now().toString()
        val body =
            JSONObject()
                .put("schemaVersion", SCHEMA_VERSION)
                .put("clientId", CLIENT_ID)
                .put("sessionId", sessionId)
                .put("requestId", requestId)
                .put("nonce", nonce)
                .put("requestedAt", requestedAt)
                .put("repository", repository)
                .put("targetBranch", branch)
                .put("targetHead", head)
        return BoundRequest(body, sessionId, requestId, requestedAt, nonce)
    }

    private fun requestUnsigned(method: String, path: String): UnsignedResponse {
        val connection = openConnection(method, path)
        try {
            val code = connection.responseCode
            val bytes = readResponseBytes(connection, code)
            val text = bytes.toString(Charsets.UTF_8)
            if (code !in 200..299) throw brokerError(code, text)
            return UnsignedResponse(JSONObject(text))
        } finally {
            connection.disconnect()
        }
    }

    private fun postAuthenticated(
        path: String,
        body: JSONObject,
        secret: ByteArray,
        clientId: String,
        sessionId: String,
        requestId: String,
        requestedAt: String,
        nonce: String,
    ): AuthenticatedResponse {
        val bodyBytes = body.toString().toByteArray(Charsets.UTF_8)
        val requestSha = sha256Hex(bodyBytes)
        val requestAuth = hmacHex(secret, requestAuthMaterial(path, clientId, sessionId, requestId, requestedAt, nonce, requestSha))
        val connection = openConnection("POST", path)
        connection.doOutput = true
        connection.setRequestProperty("Content-Type", "application/json")
        connection.setRequestProperty(HEADER_CLIENT_ID, clientId)
        connection.setRequestProperty(HEADER_SESSION_ID, sessionId)
        connection.setRequestProperty(HEADER_REQUEST_ID, requestId)
        connection.setRequestProperty(HEADER_REQUEST_SHA256, requestSha)
        connection.setRequestProperty(HEADER_AUTH, requestAuth)
        try {
            connection.outputStream.use { it.write(bodyBytes) }
            val code = connection.responseCode
            val responseBytes = readResponseBytes(connection, code)
            val responseSha = connection.getHeaderField(HEADER_RESPONSE_SHA256).orEmpty()
            val responseAuth = connection.getHeaderField(HEADER_AUTH).orEmpty()
            val responseClient = connection.getHeaderField(HEADER_CLIENT_ID).orEmpty()
            val responseSession = connection.getHeaderField(HEADER_SESSION_ID).orEmpty()
            val responseRequest = connection.getHeaderField(HEADER_REQUEST_ID).orEmpty()
            require(responseClient == clientId) { "Broker response client binding mismatch" }
            require(responseSession == sessionId) { "Broker response session binding mismatch" }
            require(responseRequest == requestId) { "Broker response request binding mismatch" }
            require(responseSha == sha256Hex(responseBytes)) { "Broker response digest verification failed" }
            val expectedResponseAuth = hmacHex(secret, responseAuthMaterial(code, path, clientId, sessionId, requestId, responseSha))
            require(constantTimeEquals(expectedResponseAuth, responseAuth)) { "Broker response authentication failed" }
            val text = responseBytes.toString(Charsets.UTF_8)
            val json = JSONObject(text)
            if (code !in 200..299) throw brokerError(code, text)
            return AuthenticatedResponse(json, requestSha, responseSha)
        } finally {
            connection.disconnect()
        }
    }

    private fun openConnection(method: String, path: String): HttpURLConnection {
        val url = URL("$baseUrl$path")
        require(baseUrl == LOOPBACK_BASE_URL) { "Architect broker endpoint must remain compile-time loopback" }
        require(url.protocol == "http" && url.host == LOOPBACK_HOST && url.port == LOOPBACK_PORT) {
            "Architect broker transport must remain loopback-only"
        }
        return (url.openConnection() as HttpURLConnection).apply {
            requestMethod = method
            connectTimeout = CONNECT_TIMEOUT_MS
            readTimeout = READ_TIMEOUT_MS
            instanceFollowRedirects = false
            useCaches = false
            setRequestProperty("Accept", "application/json")
        }
    }

    private fun readResponseBytes(connection: HttpURLConnection, code: Int): ByteArray {
        val stream = if (code in 200..299) connection.inputStream else connection.errorStream
        return stream?.use { it.readBytes() } ?: ByteArray(0)
    }

    private fun brokerError(code: Int, body: String): IllegalStateException {
        val json = runCatching { JSONObject(body) }.getOrNull()
        val error = json?.optString("error").orEmpty()
        val detail = json?.optString("detail").orEmpty()
        val presentation = listOf(error, detail).filter { it.isNotBlank() }.joinToString(": ")
        return IllegalStateException("Local broker request failed ($code)${if (presentation.isBlank()) "" else ": $presentation"}")
    }

    private fun verifyResultDigest(receipt: JSONObject) {
        val expected = receipt.optString("resultSha256")
        require(expected.length == 64) { "Broker receipt result digest is missing" }
        val keys = mutableListOf<String>()
        val iterator = receipt.keys()
        while (iterator.hasNext()) {
            val key = iterator.next()
            if (key != "resultSha256") keys += key
        }
        keys.sort()
        val withoutDigest = JSONObject()
        for (key in keys) withoutDigest.put(key, receipt.get(key))
        val actual = sha256Hex(canonicalJson(withoutDigest).toByteArray(Charsets.UTF_8))
        require(constantTimeEquals(expected, actual)) { "Broker receipt result digest verification failed" }
    }

    private fun canonicalJson(value: Any?): String =
        when (value) {
            null, JSONObject.NULL -> "null"
            is JSONObject -> {
                val keys = mutableListOf<String>()
                val iterator = value.keys()
                while (iterator.hasNext()) keys += iterator.next()
                keys.sort()
                keys.joinToString(prefix = "{", postfix = "}", separator = ",") { key ->
                    "${JSONObject.quote(key)}:${canonicalJson(value.get(key))}"
                }
            }
            is JSONArray -> (0 until value.length()).joinToString(prefix = "[", postfix = "]", separator = ",") { canonicalJson(value.get(it)) }
            is String -> JSONObject.quote(value)
            is Boolean -> if (value) "true" else "false"
            is Number -> value.toString()
            else -> JSONObject.quote(value.toString())
        }

    private fun requestAuthMaterial(path: String, clientId: String, sessionId: String, requestId: String, requestedAt: String, nonce: String, bodySha256: String): ByteArray =
        listOf("ARCANUM-A11-REQUEST", "POST", path, clientId, sessionId, requestId, requestedAt, nonce, bodySha256).joinToString("\n").toByteArray(Charsets.UTF_8)

    private fun responseAuthMaterial(status: Int, path: String, clientId: String, sessionId: String, requestId: String, bodySha256: String): ByteArray =
        listOf("ARCANUM-A11-RESPONSE", status.toString(), path, clientId, sessionId, requestId, bodySha256).joinToString("\n").toByteArray(Charsets.UTF_8)

    private fun hmacHex(secret: ByteArray, material: ByteArray): String {
        val mac = Mac.getInstance("HmacSHA256")
        mac.init(SecretKeySpec(secret, "HmacSHA256"))
        return mac.doFinal(material).toHex()
    }

    private fun sha256Hex(value: ByteArray): String = MessageDigest.getInstance("SHA-256").digest(value).toHex()
    private fun ByteArray.toHex(): String = joinToString(separator = "") { "%02x".format(it.toInt() and 0xff) }
    private fun constantTimeEquals(expected: String, actual: String): Boolean =
        MessageDigest.isEqual(expected.toByteArray(Charsets.US_ASCII), actual.toByteArray(Charsets.US_ASCII))

    private data class Health(
        val json: JSONObject,
        val repository: String?,
        val branch: String?,
        val commit: String?,
        val sessionId: String?,
        val registeredActionCount: Int,
        val startedAt: String?,
    ) {
        fun toStatus(authenticated: Boolean): BrokerStatus =
            BrokerStatus(branch, commit, repository, sessionId, registeredActionCount, startedAt, authenticated)
    }

    private data class BoundRequest(val body: JSONObject, val sessionId: String, val requestId: String, val requestedAt: String, val nonce: String)
    private data class UnsignedResponse(val json: JSONObject)
    private data class AuthenticatedResponse(val json: JSONObject, val requestSha256: String, val responseSha256: String)

    companion object {
        const val LOOPBACK_HOST = "127.0.0.1"
        const val LOOPBACK_PORT = 8765
        const val LOOPBACK_BASE_URL = "http://127.0.0.1:8765"
        const val SCHEMA_VERSION = "1.1"
        private const val SERVICE_NAME = "arcanum-termux-broker"
        private const val CLIENT_ID = "org.arcanum.nativehost"
        private const val AUTH_ALGORITHM = "HMAC-SHA256"
        private const val HEADER_CLIENT_ID = "X-Arcanum-Client-Id"
        private const val HEADER_SESSION_ID = "X-Arcanum-Session-Id"
        private const val HEADER_REQUEST_ID = "X-Arcanum-Request-Id"
        private const val HEADER_REQUEST_SHA256 = "X-Arcanum-Request-Sha256"
        private const val HEADER_RESPONSE_SHA256 = "X-Arcanum-Response-Sha256"
        private const val HEADER_AUTH = "X-Arcanum-Auth"
        private const val CONNECT_TIMEOUT_MS = 1500
        private const val READ_TIMEOUT_MS = 310000
    }
}
