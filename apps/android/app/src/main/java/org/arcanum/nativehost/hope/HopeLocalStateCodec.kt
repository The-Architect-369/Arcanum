package org.arcanum.nativehost.hope

import java.nio.charset.StandardCharsets
import java.security.MessageDigest
import org.json.JSONObject

data class HopeLocalReceipt(
    val receiptId: String,
    val reflectionId: String,
    val contentDigestSha256: String,
    val persistedAt: String,
    val recordVersion: String = "hope.reflection.v0.1",
    val scope: String = "local",
    val signed: Boolean = false,
    val signerRef: String? = null,
    val signature: String? = null,
    val authorityEffect: String = "none",
    val privateBodyIncluded: Boolean = false,
) {
    init {
        require(receiptId.isNotBlank())
        require(reflectionId.isNotBlank())
        require(contentDigestSha256.matches(Regex("[0-9a-f]{64}")))
        require(persistedAt.isNotBlank())
        require(recordVersion == "hope.reflection.v0.1")
        require(scope == "local")
        require(!signed)
        require(signerRef == null)
        require(signature == null)
        require(authorityEffect == "none")
        require(!privateBodyIncluded)
    }

    fun toJson(): JSONObject =
        JSONObject()
            .put("receiptId", receiptId)
            .put("reflectionId", reflectionId)
            .put("contentDigestSha256", contentDigestSha256)
            .put("persistedAt", persistedAt)
            .put("recordVersion", recordVersion)
            .put("scope", scope)
            .put("signed", false)
            .put("signerRef", JSONObject.NULL)
            .put("signature", JSONObject.NULL)
            .put("authorityEffect", "none")
            .put("privateBodyIncluded", false)

    companion object {
        fun fromJson(json: JSONObject): HopeLocalReceipt =
            HopeLocalReceipt(
                receiptId = json.getString("receiptId"),
                reflectionId = json.getString("reflectionId"),
                contentDigestSha256 = json.getString("contentDigestSha256"),
                persistedAt = json.getString("persistedAt"),
                recordVersion = json.getString("recordVersion"),
                scope = json.getString("scope"),
                signed = json.getBoolean("signed"),
                signerRef = if (json.isNull("signerRef")) null else json.getString("signerRef"),
                signature = if (json.isNull("signature")) null else json.getString("signature"),
                authorityEffect = json.getString("authorityEffect"),
                privateBodyIncluded = json.getBoolean("privateBodyIncluded"),
            )
    }
}

data class HopeLocalState(
    val reflectionJson: String,
    val receipt: HopeLocalReceipt,
)

object HopeLocalStateCodec {
    private const val STATE_VERSION = 1

    fun createReceipt(
        reflectionJson: String,
        persistedAt: String,
    ): HopeLocalReceipt {
        val reflection = JSONObject(reflectionJson)
        require(reflection.getString("version") == "hope.reflection.v0.1")
        require(reflection.getString("visibility") == "local_private")
        require(reflection.getString("receiptStatus") == "local_only")
        require(reflection.getString("authority") == "advisory_only")
        require(reflection.isNull("interpretation"))
        val reflectionId = reflection.getString("id")
        return HopeLocalReceipt(
            receiptId = "receipt:$reflectionId",
            reflectionId = reflectionId,
            contentDigestSha256 = sha256Hex(reflectionJson.toByteArray(StandardCharsets.UTF_8)),
            persistedAt = persistedAt,
        )
    }

    fun encode(state: HopeLocalState): ByteArray {
        validateBinding(state)
        return JSONObject()
            .put("stateVersion", STATE_VERSION)
            .put("reflectionJson", state.reflectionJson)
            .put("receipt", state.receipt.toJson())
            .toString()
            .toByteArray(StandardCharsets.UTF_8)
    }

    fun decode(bytes: ByteArray): HopeLocalState {
        require(bytes.isNotEmpty()) { "Hope local state is empty" }
        val json = JSONObject(String(bytes, StandardCharsets.UTF_8))
        require(json.getInt("stateVersion") == STATE_VERSION) { "unsupported Hope local state version" }
        val state =
            HopeLocalState(
                reflectionJson = json.getString("reflectionJson"),
                receipt = HopeLocalReceipt.fromJson(json.getJSONObject("receipt")),
            )
        validateBinding(state)
        return state
    }

    private fun validateBinding(state: HopeLocalState) {
        val reflection = JSONObject(state.reflectionJson)
        require(reflection.getString("id") == state.receipt.reflectionId) {
            "Hope receipt reflection binding mismatch"
        }
        require(reflection.getString("version") == state.receipt.recordVersion) {
            "Hope receipt record-version binding mismatch"
        }
        require(
            sha256Hex(state.reflectionJson.toByteArray(StandardCharsets.UTF_8)) ==
                state.receipt.contentDigestSha256,
        ) { "Hope receipt digest binding mismatch" }
        require(state.receipt.scope == "local")
        require(!state.receipt.signed)
        require(state.receipt.signerRef == null)
        require(state.receipt.signature == null)
        require(state.receipt.authorityEffect == "none")
        require(!state.receipt.privateBodyIncluded)
    }

    private fun sha256Hex(bytes: ByteArray): String =
        MessageDigest.getInstance("SHA-256")
            .digest(bytes)
            .joinToString("") { byte -> "%02x".format(byte.toInt() and 0xff) }
}
