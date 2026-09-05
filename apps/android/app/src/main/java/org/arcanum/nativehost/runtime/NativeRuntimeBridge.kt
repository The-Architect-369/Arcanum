package org.arcanum.nativehost.runtime

object NativeRuntimeBridge {
    init {
        System.loadLibrary("arcanum_android_bridge")
    }

    private external fun nativeAbiVersion(): Int

    private external fun nativeCapabilityMask(): Long

    private external fun nativeTempusClockProbe(): Int

    fun status(): BridgeStatus =
        BridgeStatus(
            abiVersion = nativeAbiVersion(),
            capabilityMask = nativeCapabilityMask(),
            tempusClockProbeStatus = nativeTempusClockProbe(),
        )
}
