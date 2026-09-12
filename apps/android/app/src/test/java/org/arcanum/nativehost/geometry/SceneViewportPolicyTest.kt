package org.arcanum.nativehost.geometry

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class SceneViewportPolicyTest {
    @Test
    fun occupiedBandsAreHardSceneExclusions() {
        val scene =
            SceneViewportPolicy.resolve(
                widthPx = 1080,
                heightPx = 2340,
                topOccupiedPx = 220,
                bottomOccupiedPx = 620,
                horizontalInsetPx = 32,
                minimumHeightPx = 600,
            )

        assertEquals(32.0, scene.x0, 0.0)
        assertEquals(220.0, scene.y0, 0.0)
        assertEquals(1016.0, scene.width, 0.0)
        assertEquals(1500.0, scene.height, 0.0)
        assertFalse(scene.constrainedByControls)
        assertEquals(1720.0, scene.y0 + scene.height, 0.0)
    }

    @Test
    fun constrainedSceneNeverFallsThroughBottomControls() {
        val scene =
            SceneViewportPolicy.resolve(
                widthPx = 1080,
                heightPx = 1200,
                topOccupiedPx = 300,
                bottomOccupiedPx = 700,
                horizontalInsetPx = 16,
                minimumHeightPx = 500,
            )

        assertTrue(scene.constrainedByControls)
        assertEquals(200.0, scene.height, 0.0)
        assertEquals(500.0, scene.y0 + scene.height, 0.0)
    }

    @Test
    fun horizontalInsetIsBoundedAndRuntimeDimensionsRemainAuthoritative() {
        val scene =
            SceneViewportPolicy.resolve(
                widthPx = 400,
                heightPx = 800,
                topOccupiedPx = 0,
                bottomOccupiedPx = 0,
                horizontalInsetPx = 999,
                minimumHeightPx = 1,
            )

        assertEquals(100.0, scene.x0, 0.0)
        assertEquals(200.0, scene.width, 0.0)
        assertEquals(800.0, scene.height, 0.0)
        assertFalse(scene.constrainedByControls)
    }
}
