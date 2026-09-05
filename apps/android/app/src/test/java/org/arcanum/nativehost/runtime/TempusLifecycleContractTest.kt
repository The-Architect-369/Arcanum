package org.arcanum.nativehost.runtime

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class TempusLifecycleContractTest {
    @Test
    fun exactCapabilitySetIsReady() {
        val status =
            TempusLifecycleStatus(
                abiVersion = TempusLifecycleContract.ABI_VERSION,
                capabilityMask = TempusLifecycleContract.ALLOWED_CAPABILITY_MASK,
            )

        assertTrue(status.ready)
    }

    @Test
    fun extraCapabilityFailsClosed() {
        val status =
            TempusLifecycleStatus(
                abiVersion = TempusLifecycleContract.ABI_VERSION,
                capabilityMask = TempusLifecycleContract.ALLOWED_CAPABILITY_MASK or (1L shl 9),
            )

        assertFalse(status.ready)
    }

    @Test
    fun presentationMustDeclareSuccessAndNoAuthorityEffect() {
        assertTrue(
            TempusLifecycleContract.isSuccessfulPresentation(
                "ok · Tempus local · recovered · authorityEffect=none",
            ),
        )
        assertFalse(
            TempusLifecycleContract.isSuccessfulPresentation(
                "error · Tempus not-found · local only · authorityEffect=none",
            ),
        )
        assertFalse(
            TempusLifecycleContract.isSuccessfulPresentation(
                "ok · Tempus local · recovered",
            ),
        )
    }
}
