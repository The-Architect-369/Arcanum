package org.arcanum.nativehost.architect

import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL
import java.time.Instant

/**
 * Native bridge to the local Termux Architect broker.
 *
 * CE-W04-A10 preserves the A09.2 fixed action allowlist and loopback-only
 * transport while exposing factual broker/receipt metadata to the local
 * development console.
 */
class ArchitectBrokerClient(
    private val baseUrl: String = LOOPBACK_BASE_URL,
) {
    enum class Action(
        val commandId: String,
        val label: String,
        val description: String,
        val expectedRisk: String,
    ) {
        GIT_STATUS(
            "git_status",
            "Repository status",
            "Show concise working-tree and index state.",
            "read_only",
        ),
        GIT_BRANCH(
            "git_branch",
            "Current branch",
            "Show the checked-out Git branch.",
            "read_only",
        ),
        GIT_HEAD(
            "git_head",
            "Current commit",
            "Show the exact checked-out commit SHA.",
            "read_only",
        ),
        GIT_LOG_10(
            "git_log_10",
            "Recent commits",
            "Show the ten most recent commits in compact form.",
            "read_only",
        ),
        GIT_DIFF_NAMES(
            "git_diff_names",
            "Changed filenames",
            "Show filenames changed in the unstaged working tree.",
            "read_only",
        ),
        GIT_DIFF_STAT(
            "git_diff_stat",
            "Diff statistics",
            "Show a summary of unstaged repository differences.",
            "read_only",
        ),
        VERIFY_SYNC(
            "verify_sync",
            "Verify synchronization",
            "Run the canonical repository synchronization verifier.",
            "verification",
        ),
    }

    data class BrokerStatus(
        val branch: String?,
        val commit: String?,
        val registeredActionCount: Int,
        val startedAt: String?,
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
        val requestSha256: String?,
        val resultSha256: String?,
    )

    fun probe(): Result<BrokerStatus> = runCatching {
        require(baseUrl == LOOPBACK_BASE_URL) {
            "Architect broker endpoint must remain compile-time loopback"
        }

        val health = request("GET", "/health", null)
        require(health.optString("service") == "arcanum-termux-broker") {
            "Unexpected local broker service"
        }
        require(health.optString("status") == "ready") {
            "Local Architect broker is not ready"
        }

        val commands = health.optJSONArray("commands")
            ?: error("Broker did not publish its registered action set")

        BrokerStatus(
            branch = health.optString("branch").ifBlank { null },
            commit = health.optString("commit").ifBlank { null },
            registeredActionCount = commands.length(),
            startedAt = health.optString("startedAt").ifBlank { null },
        )
    }

    fun execute(action: Action): Result<ExecutionResult> = runCatching {
        require(baseUrl == LOOPBACK_BASE_URL) {
            "Architect broker endpoint must remain compile-time loopback"
        }

        val health = request("GET", "/health", null)
        require(health.optString("service") == "arcanum-termux-broker") {
            "Unexpected local broker service"
        }
        require(health.optString("status") == "ready") {
            "Local Architect broker is not ready"
        }

        val commands = health.optJSONArray("commands")
        require(commands != null) {
            "Broker did not publish its registered action set"
        }

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

        val requestBody =
            JSONObject()
                .put("schemaVersion", SCHEMA_VERSION)
                .put("commandId", action.commandId)
                .put("approvedByHumanArchitect", true)
                .put("requestedAt", Instant.now().toString())

        val receipt = request("POST", "/execute", requestBody)

        require(receipt.optString("receiptType") == "architect_execution_receipt") {
            "Broker did not return an execution receipt"
        }

        require(receipt.optString("status") == "pass") {
            val stderr = receipt.optString("stderr").take(MAX_PRESENTATION_CHARS)
            "Registered Architect action failed${
                if (stderr.isBlank()) "" else ": $stderr"
            }"
        }

        ExecutionResult(
            action = action,
            branch =
                receipt.optString("branch")
                    .ifBlank { health.optString("branch").ifBlank { null } },
            commit =
                receipt.optString("commitAfter")
                    .ifBlank { health.optString("commit").ifBlank { null } },
            exitCode = receipt.optInt("exitCode", -1),
            durationMs =
                if (receipt.has("durationMs")) {
                    receipt.optDouble("durationMs")
                } else {
                    null
                },
            startedAt = receipt.optString("startedAt").ifBlank { null },
            completedAt = receipt.optString("completedAt").ifBlank { null },
            stdout = receipt.optString("stdout").take(MAX_PRESENTATION_CHARS),
            stderr = receipt.optString("stderr").take(MAX_PRESENTATION_CHARS),
            stdoutTruncated = receipt.optBoolean("stdoutTruncated", false),
            stderrTruncated = receipt.optBoolean("stderrTruncated", false),
            receiptId = receipt.optString("receiptId").ifBlank { null },
            requestSha256 = receipt.optString("requestSha256").ifBlank { null },
            resultSha256 = receipt.optString("resultSha256").ifBlank { null },
        )
    }

    private fun request(
        method: String,
        path: String,
        body: JSONObject?,
    ): JSONObject {
        val url = URL("$baseUrl$path")

        require(
            url.protocol == "http" &&
                url.host == LOOPBACK_HOST &&
                url.port == LOOPBACK_PORT,
        ) {
            "Architect broker transport must remain loopback-only"
        }

        val connection =
            (url.openConnection() as HttpURLConnection).apply {
                requestMethod = method
                connectTimeout = CONNECT_TIMEOUT_MS
                readTimeout = READ_TIMEOUT_MS
                instanceFollowRedirects = false
                useCaches = false
                setRequestProperty("Accept", "application/json")

                if (body != null) {
                    doOutput = true
                    setRequestProperty("Content-Type", "application/json")
                }
            }

        try {
            if (body != null) {
                connection.outputStream.use { stream ->
                    stream.write(body.toString().toByteArray(Charsets.UTF_8))
                }
            }

            val code = connection.responseCode
            val input =
                if (code in 200..299) {
                    connection.inputStream
                } else {
                    connection.errorStream
                }

            val text =
                input?.use { stream ->
                    BufferedReader(
                        InputStreamReader(stream, Charsets.UTF_8),
                    ).readText()
                }.orEmpty()

            if (code !in 200..299) {
                val json = runCatching { JSONObject(text) }.getOrNull()
                val error = json?.optString("error").orEmpty()
                val detail = json?.optString("detail").orEmpty()

                val presentation =
                    listOf(error, detail)
                        .filter { it.isNotBlank() }
                        .joinToString(": ")

                error(
                    "Local broker request failed ($code)${
                        if (presentation.isBlank()) "" else ": $presentation"
                    }",
                )
            }

            return JSONObject(text)
        } finally {
            connection.disconnect()
        }
    }

    companion object {
        const val LOOPBACK_HOST = "127.0.0.1"
        const val LOOPBACK_PORT = 8765
        const val LOOPBACK_BASE_URL = "http://127.0.0.1:8765"
        const val SCHEMA_VERSION = "1.0"

        private const val CONNECT_TIMEOUT_MS = 1500
        private const val READ_TIMEOUT_MS = 310000
        private const val MAX_PRESENTATION_CHARS = 4000
    }
}
