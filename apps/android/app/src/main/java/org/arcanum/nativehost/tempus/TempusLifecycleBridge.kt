package org.arcanum.nativehost.tempus

import java.io.File

object TempusLifecycleBridge {
    init {
        System.loadLibrary("arcanum_android_tempus_lifecycle_jni")
    }

    private external fun nativeCapturePersist(storageRoot: String): String

    private external fun nativeRecover(
        storageRoot: String,
        anchorId: String,
    ): String

    fun captureAndPersist(filesDir: File): TempusLifecyclePresentation =
        TempusLifecyclePresentation.fromJson(nativeCapturePersist(filesDir.absolutePath))

    fun recover(
        filesDir: File,
        anchorId: String,
    ): TempusLifecyclePresentation {
        require(anchorId.isNotBlank()) { "anchor ID must not be blank" }
        return TempusLifecyclePresentation.fromJson(
            nativeRecover(filesDir.absolutePath, anchorId),
        )
    }
}
