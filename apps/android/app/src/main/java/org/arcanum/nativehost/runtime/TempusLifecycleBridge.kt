package org.arcanum.nativehost.runtime

object TempusLifecycleBridge {
    init {
        System.loadLibrary("arcanum_android_lifecycle_jni")
    }

    private external fun nativeLifecycleAbiVersion(): Int

    private external fun nativeLifecycleCapabilityMask(): Long

    private external fun nativeCapturePersist(
        rootPath: String,
        anchorId: String,
    ): String?

    private external fun nativeRecover(
        rootPath: String,
        anchorId: String,
    ): String?

    fun status(): TempusLifecycleStatus =
        TempusLifecycleStatus(
            abiVersion = nativeLifecycleAbiVersion(),
            capabilityMask = nativeLifecycleCapabilityMask(),
        )

    fun capturePersist(
        rootPath: String,
        anchorId: String,
    ): String {
        if (!status().ready) {
            return "error · Tempus lifecycle ABI mismatch · local only · authorityEffect=none"
        }
        return nativeCapturePersist(rootPath, anchorId)
            ?: "error · Tempus lifecycle JNI string failure · local only · authorityEffect=none"
    }

    fun recover(
        rootPath: String,
        anchorId: String,
    ): String {
        if (!status().ready) {
            return "error · Tempus lifecycle ABI mismatch · local only · authorityEffect=none"
        }
        return nativeRecover(rootPath, anchorId)
            ?: "error · Tempus lifecycle JNI string failure · local only · authorityEffect=none"
    }
}
