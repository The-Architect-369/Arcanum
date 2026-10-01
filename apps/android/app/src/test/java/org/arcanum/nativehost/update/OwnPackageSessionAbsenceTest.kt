package org.arcanum.nativehost.update

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class OwnPackageSessionAbsenceTest {
    @Test fun alreadyAbsentDoesNotWait() {
        assertTrue(OwnPackageSessionAbsence.await({ true }, { 0 }, { error("Unexpected wait") }))
    }

    @Test fun delayedRemovalIsObservedWithinTheOriginalAction() {
        var time = 0L
        var reads = 0
        val absent = OwnPackageSessionAbsence.await({ reads++; time >= 150 }, { time }, { time += it })
        assertTrue(absent)
        assertEquals(150L, time)
        assertEquals(4, reads)
    }

    @Test fun persistentSessionStopsAtTheBoundWithoutClaimingAbsence() {
        var time = 0L
        assertFalse(OwnPackageSessionAbsence.await({ false }, { time }, { time += it }, 125, 50))
        assertEquals(125L, time)
    }

    @Test fun absenceAtDeadlineIsObservedWithoutAnotherWait() {
        var time = 0L
        assertTrue(OwnPackageSessionAbsence.await({ time == 125L }, { time }, { time += it }, 125, 50))
        assertEquals(125L, time)
    }

    @Test(expected = IllegalStateException::class)
    fun observationFailureCannotEstablishAbsence() {
        OwnPackageSessionAbsence.await({ error("Session query failed") }, { 0 }, { error("Unexpected wait") })
    }

    @Test(expected = InterruptedException::class)
    fun interruptedWaitCannotEstablishAbsence() {
        OwnPackageSessionAbsence.await({ false }, { 0 }, { throw InterruptedException("Interrupted") })
    }
}
