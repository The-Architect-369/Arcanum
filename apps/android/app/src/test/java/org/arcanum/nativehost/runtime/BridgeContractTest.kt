package org.arcanum.nativehost.runtime

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class BridgeContractTest {
    @Test
    fun exactContractIsReady() {
        val status =
            BridgeStatus(
                abiVersion = BridgeContract.ABI_VERSION,
                capabilityMask = BridgeContract.ALLOWED_CAPABILITY_MASK,
                tempusClockProbeStatus = BridgeContract.STATUS_OK,
            )

        assertTrue(status.ready)
    }

    @Test
    fun extraCapabilityFailsClosed() {
        val status =
            BridgeStatus(
                abiVersion = BridgeContract.ABI_VERSION,
                capabilityMask = BridgeContract.ALLOWED_CAPABILITY_MASK or (1L shl 9),
                tempusClockProbeStatus = BridgeContract.STATUS_OK,
            )

        assertFalse(status.ready)
    }

    @Test
    fun failedProbeFailsClosed() {
        val status =
            BridgeStatus(
                abiVersion = BridgeContract.ABI_VERSION,
                capabilityMask = BridgeContract.ALLOWED_CAPABILITY_MASK,
                tempusClockProbeStatus = 1,
            )

        assertFalse(status.ready)
    }
}
