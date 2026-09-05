package org.arcanum.nativehost.geometry

import java.io.File
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class ProjectionContractTest {
    private val geometryDir: File =
        File(
            requireNotNull(System.getProperty("arcanum.repoRoot")) {
                "Gradle must provide arcanum.repoRoot"
            },
            "docs/specs/geometry",
        )

    @Test
    fun nativeProjectionConsumesCanonicalReferenceVectors() {
        val contracts = loadContracts()
        assertTrue(contracts.verifyReferenceVectors())
        assertEquals("arcnet-coordinate-frame", contracts.sourceFrameId)
    }

    @Test
    fun nativeHostPreservesAuthorityAndGeometryFreeBoundary() {
        val contracts = loadContracts()
        assertEquals("none", contracts.authorityEffect)
        assertTrue(contracts.geometryFreeEquivalentRequired)
    }

    private fun loadContracts(): CanonicalContracts =
        CanonicalContracts.parse(
            sourceJson = readCanonical(CanonicalContracts.SOURCE_ASSET),
            projectionJson = readCanonical(CanonicalContracts.PROJECTION_ASSET),
            vectorJson = readCanonical(CanonicalContracts.VECTOR_ASSET),
        )

    private fun readCanonical(name: String): String =
        File(geometryDir, name).readText(Charsets.UTF_8)
}
