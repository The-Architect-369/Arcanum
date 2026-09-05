package org.arcanum.nativehost.tempus

import org.json.JSONObject

object TempusLifecycleContract {
    const val WIRE_VERSION: Int = 1
    const val AUTHORITY_EFFECT: String = "none"
    const val RECEIPT_SCOPE_LOCAL: String = "local"
}

data class LocalReceiptPresentation(
    val receiptId: String,
    val scope: String,
    val signed: Boolean,
    val contentDigestSha256: String,
)

data class TempusLifecyclePresentation(
    val operation: String,
    val anchorId: String,
    val capturedAt: String,
    val sourceKind: String,
    val persisted: Boolean,
    val recovered: Boolean,
    val persistedDigestSha256: String,
    val receipt: LocalReceiptPresentation?,
) {
    fun statusLabel(): String =
        when (operation) {
            "capture-persist" ->
                "Tempus · captured + persisted · $capturedAt · local-only · authorityEffect=none"
            "recover" ->
                "Tempus · recovered · $capturedAt · local-only · authorityEffect=none"
            else -> "Tempus lifecycle unavailable · authorityEffect=none"
        }

    fun receiptLabel(): String =
        receipt?.let { value ->
            "receipt ${value.receiptId} · scope=${value.scope} · unsigned · sha256=${value.contentDigestSha256.take(16)}…"
        } ?: "anchor $anchorId · sha256=${persistedDigestSha256.take(16)}… · no receipt reissued"

    companion object {
        fun fromJson(raw: String): TempusLifecyclePresentation {
            val json = JSONObject(raw)
            require(json.getInt("wireVersion") == TempusLifecycleContract.WIRE_VERSION) {
                "unsupported Tempus lifecycle wire version"
            }
            require(json.getString("authorityEffect") == TempusLifecycleContract.AUTHORITY_EFFECT) {
                "Tempus lifecycle authority boundary changed"
            }
            require(!json.getBoolean("networkUsed")) {
                "Tempus lifecycle unexpectedly used network"
            }
            require(!json.getBoolean("protocolFinality")) {
                "Tempus lifecycle cannot claim protocol finality"
            }

            val operation = json.getString("operation")
            require(operation == "capture-persist" || operation == "recover") {
                "unknown Tempus lifecycle operation"
            }
            val anchorId = json.getString("anchorId")
            require(anchorId.isNotBlank()) { "Tempus lifecycle anchor ID is empty" }
            val capturedAt = json.getString("capturedAt")
            require(capturedAt.isNotBlank()) { "Tempus lifecycle capture time is empty" }
            require(json.getString("sourceKind") == "system-clock") {
                "W02.4 accepts system-clock anchors only"
            }
            require(json.getBoolean("persisted")) { "Tempus anchor was not persisted" }

            val digest = json.getString("persistedDigestSha256")
            require(digest.matches(Regex("[0-9a-f]{64}"))) {
                "Tempus persisted digest is malformed"
            }

            val receipt =
                if (json.isNull("receipt")) {
                    null
                } else {
                    val receiptJson = json.getJSONObject("receipt")
                    LocalReceiptPresentation(
                        receiptId = receiptJson.getString("receiptId"),
                        scope = receiptJson.getString("scope"),
                        signed = receiptJson.getBoolean("signed"),
                        contentDigestSha256 = receiptJson.getString("contentDigestSha256"),
                    ).also { value ->
                        require(value.receiptId.isNotBlank()) { "local receipt ID is empty" }
                        require(value.scope == TempusLifecycleContract.RECEIPT_SCOPE_LOCAL) {
                            "receipt escaped local scope"
                        }
                        require(!value.signed) { "W02.4 cannot expose a signed receipt" }
                        require(value.contentDigestSha256 == digest) {
                            "receipt digest does not match persisted anchor bytes"
                        }
                    }
                }

            if (operation == "capture-persist") {
                require(receipt != null) { "capture must expose its local receipt" }
            } else {
                require(receipt == null) { "recovery must not reissue a persistence receipt" }
            }

            return TempusLifecyclePresentation(
                operation = operation,
                anchorId = anchorId,
                capturedAt = capturedAt,
                sourceKind = "system-clock",
                persisted = true,
                recovered = json.getBoolean("recovered"),
                persistedDigestSha256 = digest,
                receipt = receipt,
            )
        }
    }
}
