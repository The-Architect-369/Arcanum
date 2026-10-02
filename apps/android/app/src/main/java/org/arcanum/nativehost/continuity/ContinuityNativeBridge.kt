package org.arcanum.nativehost.continuity

import java.io.File

object ContinuityNativeBridge {
    init { System.loadLibrary("arcanum_android_continuity_jni") }
    private external fun nativeWireVersion(): Int
    private external fun nativePrepare(root: String, operationId: String, fingerprint: ByteArray, generation: ByteArray, confirmedAtMs: Long, adoption: Boolean): ByteArray
    private external fun nativeInspect(root: String, operationId: String): Int
    private external fun nativeCommit(root: String, operationId: String, message: ByteArray, publicKey: ByteArray, signature: ByteArray): ByteArray
    private external fun nativePublish(root: String, operationId: String, wrapper: ByteArray): ByteArray
    private external fun nativeRecover(root: String, operationId: String): ByteArray
    fun port(privateRoot: File): ContinuityNativePort {
        check(nativeWireVersion() == 1) { "Continuity JNI version unavailable" }
        return object : ContinuityNativePort {
            override fun prepare(intent: ContinuityOperationIntent) = ContinuityNativePresentation.fromPacket(nativePrepare(privateRoot.absolutePath, intent.operationId, decodeHex(intent.fingerprint), decodeHex(intent.generation), intent.confirmedAtMs, intent.adoption))
            override fun inspect(operationId: String) = ContinuityOperationPhase.entries.getOrNull(nativeInspect(privateRoot.absolutePath, operationId)) ?: error("Continuity phase unavailable")
            override fun commit(operationId: String, message: ByteArray, signature: ContinuityPublicSignature) = ContinuityNativePresentation.fromPacket(nativeCommit(privateRoot.absolutePath, operationId, message, signature.publicKey, signature.signatureDer))
            override fun publishOriginal(operationId: String, wrapper: ByteArray) = ContinuityNativePresentation.fromPacket(nativePublish(privateRoot.absolutePath, operationId, wrapper))
            override fun recover(operationId: String) = ContinuityNativePresentation.fromPacket(nativeRecover(privateRoot.absolutePath, operationId))
        }
    }
}
