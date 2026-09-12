package org.arcanum.nativehost.geometry

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class ViewerOrbitGesturePolicyTest {
    private val scene =
        SceneViewport(
            x0 = 10.0,
            y0 = 20.0,
            width = 100.0,
            height = 200.0,
            constrainedByControls = false,
        )

    @Test
    fun sceneAcceptanceHonorsHardViewportBoundary() {
        assertTrue(ViewerOrbitGesturePolicy.acceptsScenePoint(scene, 10.0, 20.0))
        assertTrue(ViewerOrbitGesturePolicy.acceptsScenePoint(scene, 110.0, 220.0))
        assertFalse(ViewerOrbitGesturePolicy.acceptsScenePoint(scene, 9.999, 20.0))
        assertFalse(ViewerOrbitGesturePolicy.acceptsScenePoint(scene, 10.0, 220.001))
    }

    @Test
    fun dragMappingIsDeterministicAndPresentationOnly() {
        val action = ViewerOrbitGesturePolicy.dragAction(distanceX = -50.0, distanceY = 25.0)
        assertEquals(9.0, action.deltaYawDegrees, 1e-12)
        assertEquals(4.5, action.deltaPitchDegrees, 1e-12)
    }

    @Test
    fun zoomMappingPreservesScaleFactor() {
        val action = ViewerOrbitGesturePolicy.zoomAction(1.25)
        assertEquals(1.25, action.factor, 1e-12)
    }
}
