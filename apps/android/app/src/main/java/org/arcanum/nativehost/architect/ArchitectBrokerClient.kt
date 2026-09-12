package org.arcanum.nativehost.architect

import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL
import java.time.Instant

/**
 * Native read-only bridge to the local Termux Architect broker.
 *
 * The endpoint is compile-time pinned to loopback. The caller may request only
 * registered broker command IDs; A08 exposes git_status only.
 */
class ArchitectBrokerClient(
    private val baseUrl: String = LOOPBACK_BASE_URL,
) {
    data class RepositoryInspection(
        val branch: String?,
        val commit: String?,
        val workingTree: String,
        val receiptId: String?,
        val resultSha256: String?,
    )

    fun inspectRepository(): Result<RepositoryInspection> = runCatching {
        require(baseUrl == LOOPBACK_BASE_URL) { "Architect broker endpoint must remain compile-time loopback" }

        val health = request("GET", "/health", null)
        require(health.optString("service") == "arcanum-termux-broker") {
            "Unexpected local broker service"
        }
        require(health.optString("status") == "ready") {
            "Local Architect broker is not ready"
        }

        val requestBody =
            JSONObject()
                .put("schemaVersion", SCHEMA_VERSION)
                .put("commandId", COMMAND_GIT_STATUS)
                .put("approvedByHumanArchitect", true)
                .put("requestedAt", Instant.now().toString())

        val receipt = request("POST", "/execute", requestBody)
        require(receipt.optString("receiptType") == "architect_execution_receipt") {
            "Broker did not return an execution receipt"
        }
        require(receipt.optString("status") == "pass") {
            val stderr = receipt.optString("stderr").take(MAX_PRESENTATION_CHARS)
            "Registered repository inspection failed${if (stderr.isBlank()) "" else ": $stderr"}"
        }

        RepositoryInspection(
            branch = health.optString("branch").ifBlank { null },
            commit = health.optString("commit").ifBlank { null },
            workingTree = receipt.optString("stdout").ifBlank { "working tree clean" }.take(MAX_PRESENTATION_CHARS),
            receiptId = receipt.optString("receiptId").ifBlank { null },
            resultSha256 = receipt.optString("resultSha256").ifBlank { null },
        )
    }

    private fun request(method: String, path: String, body: JSONObject?): JSONObject {
        val url = URL("$baseUrl$path")
        require(url.protocol == "http" && url.host == LOOPBACK_HOST && url.port == LOOPBACK_PORT) {
            "Architect broker transport must remain loopback-only"
        }

        val connection = (url.openConnection() as HttpURLConnection).apply {
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
            val input = if (code in 200..299) connection.inputStream else connection.errorStream
            val text =
                input?.use { stream ->
                    BufferedReader(InputStreamReader(stream, Charsets.UTF_8)).readText()
                }.orEmpty()

            if (code !in 200..299) {
                val detail = runCatching { JSONObject(text).optString("error") }.getOrNull().orEmpty()
                error("Local broker request failed ($code)${if (detail.isBlank()) "" else ": $detail"}")
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
        const val COMMAND_GIT_STATUS = "git_status"
        private const val CONNECT_TIMEOUT_MS = 1500
        private const val READ_TIMEOUT_MS = 5000
        private const val MAX_PRESENTATION_CHARS = 4000
    }
}
