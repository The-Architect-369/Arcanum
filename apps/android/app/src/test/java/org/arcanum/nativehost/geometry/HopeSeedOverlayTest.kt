package org.arcanum.nativehost.geometry

import java.io.File
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class HopeSeedOverlayTest {
    private val repoRoot = File(System.getProperty("arcanum.repoRoot"))
    private val contractFile = File(repoRoot, "docs/specs/geometry/hope-seed-overlay.v0.1.json")
    private val vectorsFile = File(repoRoot, "docs/specs/geometry/hope-seed-overlay.vectors.v0.1.json")

    @Test
    fun overlayRemainsSymbolicAndNonAuthoritative() {
        val overlay = HopeSeedOverlay.parse(contractFile.readText())
        assertEquals("symbolic-presentation-overlay", overlay.type)
        assertFalse(overlay.exactMappingSpecified)
        assertFalse(overlay.mathematicalIdentityClaimed)
        assertEquals("none", overlay.authorityEffect)
        assertTrue(overlay.geometryFreeEquivalentRequired)
        assertEquals(7, overlay.centers.size)
    }

    @Test
    fun referenceVectorsAreDeterministic() {
        val overlay = HopeSeedOverlay.parse(contractFile.readText())
        assertTrue(overlay.verifyReferenceVectors(vectorsFile.readText()))
    }

    @Test
    fun viewportScaleIsPresentationOnlyAndDeterministic() {
        val overlay = HopeSeedOverlay.parse(contractFile.readText())
        val circles = overlay.mapToScreen(500.0, 500.0, 1000.0, 1000.0)
        assertEquals(80.0, circles.first().radius, 1e-9)
        assertEquals(500.0, circles.first().centerX, 1e-9)
        assertEquals(500.0, circles.first().centerY, 1e-9)
        assertEquals(580.0, circles[1].centerX, 1e-9)
    }
}
