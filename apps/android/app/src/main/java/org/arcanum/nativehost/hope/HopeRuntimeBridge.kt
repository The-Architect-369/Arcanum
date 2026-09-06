package org.arcanum.nativehost.hope

import org.json.JSONObject

data class HopeRuntimeContract(
    val namespace: String,
    val recordVersion: String,
    val storageRelativePath: String,
    val visibility: String,
    val authority: String,
    val receiptScope: String,
    val signingRequired: Boolean,
    val authorityEffect: String,
    val networkRequired: Boolean,
) {
    companion object {
        fun fromJson(raw: String): HopeRuntimeContract {
            val json = JSONObject(raw)
            require(json.isNull("interpretation")) { "Hope contract interpretation must remain null" }
            return HopeRuntimeContract(
                namespace = json.getString("namespace"),
                recordVersion = json.getString("recordVersion"),
                storageRelativePath = json.getString("storageRelativePath"),
                visibility = json.getString("visibility"),
                authority = json.getString("authority"),
                receiptScope = json.getString("receiptScope"),
                signingRequired = json.getBoolean("signingRequired"),
                authorityEffect = json.getString("authorityEffect"),
                networkRequired = json.getBoolean("networkRequired"),
            ).also { contract ->
                require(contract.namespace == "hope")
                require(contract.recordVersion == "hope.reflection.v0.1")
                require(contract.storageRelativePath == "hope/reflections.v0.1.enc")
                require(contract.visibility == "local_private")
                require(contract.authority == "advisory_only")
                require(contract.receiptScope == "local")
                require(!contract.signingRequired)
                require(contract.authorityEffect == "none")
                require(!contract.networkRequired)
            }
        }
    }
}

data class HopeTempusProvenance(
    val anchorId: String,
    val capturedAt: String,
    val sourceKind: String,
)

object HopeRuntimeBridge {
    init {
        System.loadLibrary("arcanum_android_hope_jni")
    }

    private external fun nativeContract(): String

    private external fun nativeBuildReflection(
        id: String,
        createdAt: String,
        prompt: String,
        userText: String,
        hopeText: String,
        tempusAnchorId: String,
        tempusCapturedAt: String,
        tempusSourceKind: String,
    ): String

    fun contract(): HopeRuntimeContract = HopeRuntimeContract.fromJson(nativeContract())

    fun buildReflection(
        id: String,
        createdAt: String,
        prompt: String?,
        userText: String,
        hopeText: String?,
        tempus: HopeTempusProvenance?,
    ): String =
        nativeBuildReflection(
            id,
            createdAt,
            prompt.orEmpty(),
            userText,
            hopeText.orEmpty(),
            tempus?.anchorId.orEmpty(),
            tempus?.capturedAt.orEmpty(),
            tempus?.sourceKind.orEmpty(),
        )
}
