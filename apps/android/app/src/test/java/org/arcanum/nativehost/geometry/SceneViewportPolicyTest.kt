package org.arcanum.nativehost.geometry

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class SceneViewportPolicyTest {
    @Test
    fun `scene stays between occupied participant bands`() {
        val viewport =
            SceneViewportPolicy.resolve(
                widthPx = 1080,
                heightPx = 2340,
                topOccupiedPx = 220,
                bottomOccupiedPx = 720,
                horizontalInsetPx = 32,
                minimumHeightPx = 600,
            )

        assertEquals(32.0, viewport.x0, 0.0)
        assertEquals(220.0, viewport.y0, 0.0)
        assertEquals(1016.0, viewport.width, 0.0)
        assertEquals(1400.0, viewport.height, 0.0)
        assertTrue(viewport.y0 + viewport.height <= 2340.0 - 720.0)
    }

    @Test
    fun `scene remains positive under extreme accessibility pressure`() {
        val viewport =
            SceneViewportPolicy.resolve(
                widthPx = 1080,
                heightPx = 1200,
                topOccupiedPx = 500,
                bottomOccupiedPx = 650,
                horizontalInsetPx = 48,
                minimumHeightPx = 500,
            )

        assertTrue(viewport.width > 0.0)
        assertTrue(viewport.height > 0.0)
        assertTrue(viewport.y0 >= 0.0)
    }
}
