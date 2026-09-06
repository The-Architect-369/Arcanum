package org.arcanum.nativehost.application

import org.arcanum.nativehost.runtime.BridgeContract
import org.arcanum.nativehost.runtime.BridgeStatus
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class NativeApplicationRegistryTest {
    @Test
    fun arcanumRegistrationIsBoundedAndHopeCentered() {
        val app = NativeApplicationRegistry.arcanum
        assertEquals("arcanum", app.appId)
        assertEquals("Hope".lowercase(), app.launchSurface)
        assertEquals(BridgeContract.ABI_VERSION, app.requiredRuntimeAbi)
        assertEquals(BridgeContract.CAP_TEMPUS_SYSTEM_CLOCK_PROBE, app.requiredCapabilityMask)
        assertEquals(BridgeContract.ALLOWED_CAPABILITY_MASK, app.allowedCapabilityMask)
        assertEquals("none", app.authorityEffect)
        assertFalse(app.protocolAuthority)
        assertFalse(app.networkRequired)
        assertFalse(app.modelDependency)
        assertTrue(app.geometryOptional)
    }

    @Test
    fun readyInheritedRuntimeLaunchesArcanum() {
        val launch =
            NativeApplicationRegistry.launch(
                BridgeStatus(
                    abiVersion = BridgeContract.ABI_VERSION,
                    capabilityMask = BridgeContract.ALLOWED_CAPABILITY_MASK,
                    tempusClockProbeStatus = BridgeContract.STATUS_OK,
                ),
            )
        assertTrue(launch is NativeApplicationLaunch.Ready)
    }

    @Test
    fun runtimeMismatchFailsClosed() {
        val wrongAbi =
            NativeApplicationRegistry.launch(
                BridgeStatus(
                    abiVersion = BridgeContract.ABI_VERSION + 1,
                    capabilityMask = BridgeContract.ALLOWED_CAPABILITY_MASK,
                    tempusClockProbeStatus = BridgeContract.STATUS_OK,
                ),
            )
        val extraCapability =
            NativeApplicationRegistry.launch(
                BridgeStatus(
                    abiVersion = BridgeContract.ABI_VERSION,
                    capabilityMask = BridgeContract.ALLOWED_CAPABILITY_MASK or (1L shl 8),
                    tempusClockProbeStatus = BridgeContract.STATUS_OK,
                ),
            )
        assertTrue(wrongAbi is NativeApplicationLaunch.Blocked)
        assertTrue(extraCapability is NativeApplicationLaunch.Blocked)
    }
}
