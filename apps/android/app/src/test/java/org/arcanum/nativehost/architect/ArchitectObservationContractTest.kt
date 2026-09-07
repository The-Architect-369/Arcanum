package org.arcanum.nativehost.architect

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Test

class ArchitectObservationContractTest {
    @Test
    fun observationBoundaryRemainsLocalAndNonAuthoritative() {
        assertEquals("local", ArchitectObservationContract.SCOPE)
        assertEquals("none", ArchitectObservationContract.AUTHORITY_EFFECT)
        assertEquals("none", ArchitectObservationContract.TRANSPORT)
        assertEquals("latest-only", ArchitectObservationContract.RETENTION)
        assertFalse(ArchitectObservationContract.NETWORK_REQUIRED)
        assertFalse(ArchitectObservationContract.MODEL_DEPENDENCY)
    }

    @Test
    fun privateTextUsesFixedRedactionMarker() {
        assertEquals(
            "<private-local-redacted>",
            ArchitectObservationContract.REDACTED_TEXT,
        )
    }
}
