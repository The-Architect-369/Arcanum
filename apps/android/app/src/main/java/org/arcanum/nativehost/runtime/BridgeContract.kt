package org.arcanum.nativehost.runtime

object BridgeContract {
    const val ABI_VERSION: Int = 1
    const val CAP_TEMPUS_SYSTEM_CLOCK_PROBE: Long = 1L shl 0
    const val ALLOWED_CAPABILITY_MASK: Long = CAP_TEMPUS_SYSTEM_CLOCK_PROBE
    const val STATUS_OK: Int = 0
}

data class BridgeStatus(
    val abiVersion: Int,
    val capabilityMask: Long,
    val tempusClockProbeStatus: Int,
) {
    val ready: Boolean
        get() =
            abiVersion == BridgeContract.ABI_VERSION &&
                capabilityMask == BridgeContract.ALLOWED_CAPABILITY_MASK &&
                tempusClockProbeStatus == BridgeContract.STATUS_OK

    fun presentationLabel(): String =
        if (ready) {
            "runtime bridge · ABI $abiVersion · local Tempus probe ready · authorityEffect=none"
        } else {
            "runtime bridge unavailable · authorityEffect=none"
        }
}
