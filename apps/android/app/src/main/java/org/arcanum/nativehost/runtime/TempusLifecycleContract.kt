package org.arcanum.nativehost.runtime

object TempusLifecycleContract {
    const val ABI_VERSION: Int = 1
    const val CAP_TEMPUS_PERSIST: Long = 1L shl 0
    const val CAP_TEMPUS_RECOVER: Long = 1L shl 1
    const val CAP_LOCAL_RECEIPT_PRESENT: Long = 1L shl 2
    const val ALLOWED_CAPABILITY_MASK: Long =
        CAP_TEMPUS_PERSIST or CAP_TEMPUS_RECOVER or CAP_LOCAL_RECEIPT_PRESENT
    const val SUCCESS_PREFIX: String = "ok · "
    const val AUTHORITY_SUFFIX: String = "authorityEffect=none"

    fun isSuccessfulPresentation(value: String): Boolean =
        value.startsWith(SUCCESS_PREFIX) && value.contains(AUTHORITY_SUFFIX)
}

data class TempusLifecycleStatus(
    val abiVersion: Int,
    val capabilityMask: Long,
) {
    val ready: Boolean
        get() =
            abiVersion == TempusLifecycleContract.ABI_VERSION &&
                capabilityMask == TempusLifecycleContract.ALLOWED_CAPABILITY_MASK
}
