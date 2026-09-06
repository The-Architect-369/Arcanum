package org.arcanum.nativehost.application

import org.arcanum.nativehost.runtime.BridgeContract
import org.arcanum.nativehost.runtime.BridgeStatus

data class NativeApplicationDescriptor(
    val appId: String,
    val displayName: String,
    val launchSurface: String,
    val requiredRuntimeAbi: Int,
    val requiredCapabilityMask: Long,
    val allowedCapabilityMask: Long,
    val authorityEffect: String,
    val protocolAuthority: Boolean,
    val networkRequired: Boolean,
    val modelDependency: Boolean,
    val geometryOptional: Boolean,
)

sealed interface NativeApplicationLaunch {
    data class Ready(val descriptor: NativeApplicationDescriptor) : NativeApplicationLaunch

    data class Blocked(val reason: String) : NativeApplicationLaunch
}

object NativeApplicationRegistry {
    val arcanum =
        NativeApplicationDescriptor(
            appId = "arcanum",
            displayName = "Arcanum",
            launchSurface = "hope",
            requiredRuntimeAbi = BridgeContract.ABI_VERSION,
            requiredCapabilityMask = BridgeContract.CAP_TEMPUS_SYSTEM_CLOCK_PROBE,
            allowedCapabilityMask = BridgeContract.ALLOWED_CAPABILITY_MASK,
            authorityEffect = "none",
            protocolAuthority = false,
            networkRequired = false,
            modelDependency = false,
            geometryOptional = true,
        )

    fun launch(status: BridgeStatus): NativeApplicationLaunch {
        val descriptor = arcanum
        if (!status.ready) {
            return NativeApplicationLaunch.Blocked("runtime_not_ready")
        }
        if (status.abiVersion != descriptor.requiredRuntimeAbi) {
            return NativeApplicationLaunch.Blocked("runtime_abi_mismatch")
        }
        if (status.capabilityMask != descriptor.requiredCapabilityMask) {
            return NativeApplicationLaunch.Blocked("runtime_capability_mismatch")
        }
        if ((status.capabilityMask and descriptor.allowedCapabilityMask.inv()) != 0L) {
            return NativeApplicationLaunch.Blocked("runtime_capability_ceiling_exceeded")
        }
        return NativeApplicationLaunch.Ready(descriptor)
    }
}
