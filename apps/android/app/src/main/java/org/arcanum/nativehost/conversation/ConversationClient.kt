package org.arcanum.nativehost.conversation

import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.atomic.AtomicBoolean

/** A session credential, never compiled into the APK or persisted in transcript storage. */
class ConversationClient(private val token: String) {
    private val stopped = AtomicBoolean(false)
    @Volatile private var connection: HttpURLConnection? = null
    init { require(token.matches(Regex("[0-9a-f]{64}"))) }
    fun cancel() { stopped.set(true); connection?.disconnect() }
    fun profile() = ConversationProfile.parse(request("/v1/profile", null, 5_000))
    fun send(draft: ConversationDraft) = ConversationReply.parse(request("/v1/chat", draft.json, 65_000), draft)
    fun status(id: String): JSONObject {
        require(id.matches(org.arcanum.nativehost.memory.DevelopmentRecord.UUID_PATTERN))
        return request("/v1/requests/$id", null, 5_000)
    }
    private fun request(path: String, body: String?, timeout: Int): JSONObject {
        check(!stopped.get())
        val conn = URL("http://127.0.0.1:18765$path").openConnection(java.net.Proxy.NO_PROXY) as HttpURLConnection
        connection = conn
        val expired = AtomicBoolean(false)
        val timer = java.util.Timer(true)
        timer.schedule(object : java.util.TimerTask() {
            override fun run() { expired.set(true); conn.disconnect() }
        }, timeout.toLong())
        try {
            check(!stopped.get())
            conn.instanceFollowRedirects = false
            conn.connectTimeout = 5_000
            conn.readTimeout = timeout
            conn.useCaches = false
            conn.setRequestProperty("Authorization", "Bearer $token")
            conn.setRequestProperty("Content-Type", "application/json")
            if (body != null) {
                conn.requestMethod = "POST"
                conn.doOutput = true
                val bytes = body.toByteArray()
                conn.setFixedLengthStreamingMode(bytes.size)
                conn.outputStream.use { it.write(bytes) }
            }
            check(conn.responseCode == 200) { "Gateway did not return a valid response. Check original request status; do not resend automatically." }
            val bytes = conn.inputStream.use { input ->
                val out = java.io.ByteArrayOutputStream()
                val buffer = ByteArray(2048)
                while (true) {
                    val count = input.read(buffer)
                    if (count < 0) break
                    check(out.size() + count <= 32 * 1024 && !stopped.get())
                    out.write(buffer, 0, count)
                }
                out.toByteArray()
            }
            check(bytes.size <= 32 * 1024 && !stopped.get() && !expired.get())
            return JSONObject(bytes.toString(Charsets.UTF_8))
        } finally { timer.cancel(); connection = null; conn.disconnect() }
    }
}
