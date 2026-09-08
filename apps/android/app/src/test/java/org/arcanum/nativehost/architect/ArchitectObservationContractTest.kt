package org.arcanum.nativehost.architect

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class ArchitectObservationContractTest {
    @Test
    fun observationBoundaryRemainsLocalAndNonAuthoritative() {
        assertEquals("local", ArchitectObservationContract.SCOPE)
        assertEquals("none", ArchitectObservationContract.AUTHORITY_EFFECT)
        assertEquals("none", ArchitectObservationContract.TRANSPORT)
        assertEquals(
            "latest-local-plus-bounded-frozen-exports",
            ArchitectObservationContract.RETENTION,
        )
        assertEquals(
            "human_selected_android_share_sheet",
            ArchitectObservationContract.EXPORT_CAPABILITY,
        )
        assertEquals(
            "capture-bound-max-3-prune-after-24h",
            ArchitectObservationContract.EXPORT_RETENTION,
        )
        assertEquals("observation.zip", ArchitectObservationContract.EXPORT_BUNDLE_FILE)
        assertEquals(600L, ArchitectObservationContract.EXPORT_GRANT_TTL_SECONDS)
        assertEquals(3, ArchitectObservationContract.MAX_FROZEN_EXPORTS)
        assertTrue(ArchitectObservationContract.IMMUTABLE_EXPORT)
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
        assertEquals("0.2", ArchitectObservationContract.VISUAL_DIAGNOSTICS_VERSION)
    }

    @Test
    fun observationSchemaCarriesFrozenExportAndBuildProvenanceRevision() {
        assertEquals("0.3", ArchitectObservationContract.SCHEMA_VERSION)
    }
}
