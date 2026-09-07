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
        assertEquals(
            "human_selected_android_share_sheet",
            ArchitectObservationContract.EXPORT_CAPABILITY,
        )
        assertFalse(ArchitectObservationContract.AUTO_EXPORT)
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

    @Test
    fun visualDiagnosticsHaveVersionedContract() {
        assertEquals("0.1", ArchitectObservationContract.VISUAL_DIAGNOSTICS_VERSION)
    }
}
