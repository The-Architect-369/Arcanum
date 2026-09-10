package org.arcanum.nativehost.geometry

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class ViewerOrbitStateTest {
    @Test
    fun neutralStateIsExactAndStable() {
        val neutral = ViewerOrbitReducer.neutral
        assertEquals(ViewerOrbitState(), neutral)
        assertTrue(neutral.isNeutral())
        assertEquals(neutral, ViewerOrbitReducer.reduce(neutral, ViewerOrbitAction.Reset))
    }

    @Test
    fun dragChangesOnlyViewerAnglesWithinBounds() {
        val initial = ViewerOrbitState(zoom = 1.2)
        val next =
            ViewerOrbitReducer.reduce(
                initial,
                ViewerOrbitAction.Drag(
                    deltaYawDegrees = 225.0,
                    deltaPitchDegrees = 100.0,
                ),
            )

        assertEquals(-135.0, next.yawDegrees, 0.0)
        assertEquals(ViewerOrbitReducer.MAX_PITCH_DEGREES, next.pitchDegrees, 0.0)
        assertEquals(1.2, next.zoom, 0.0)
    }

    @Test
    fun zoomIsFinitePositiveAndClamped() {
        val high = ViewerOrbitReducer.reduce(ViewerOrbitState(), ViewerOrbitAction.ZoomBy(10.0))
        val low = ViewerOrbitReducer.reduce(ViewerOrbitState(), ViewerOrbitAction.ZoomBy(0.01))

        assertEquals(ViewerOrbitReducer.MAX_ZOOM, high.zoom, 0.0)
        assertEquals(ViewerOrbitReducer.MIN_ZOOM, low.zoom, 0.0)
    }

    @Test(expected = IllegalArgumentException::class)
    fun rejectsNonPositiveZoomFactor() {
        ViewerOrbitReducer.reduce(ViewerOrbitState(), ViewerOrbitAction.ZoomBy(0.0))
    }

    @Test
    fun resetReturnsBitwiseEquivalentNeutralValues() {
        val moved = ViewerOrbitState(yawDegrees = 42.5, pitchDegrees = -31.0, zoom = 1.37)
        val reset = ViewerOrbitReducer.reduce(moved, ViewerOrbitAction.Reset)

        assertEquals(0.0.toBits(), reset.yawDegrees.toBits())
        assertEquals(0.0.toBits(), reset.pitchDegrees.toBits())
        assertEquals(1.0.toBits(), reset.zoom.toBits())
    }

    @Test
    fun reducerCannotMutateCanonicalInputCoordinates() {
        val canonical =
            listOf(
                Vec3(1.0, 0.0, 0.0),
                Vec3(-1.0, 0.0, 0.0),
                Vec3(0.0, 1.0, 0.0),
                Vec3(0.0, -1.0, 0.0),
                Vec3(0.0, 0.0, 1.0),
                Vec3(0.0, 0.0, -1.0),
            )
        val before = canonical.map { Triple(it.x.toBits(), it.y.toBits(), it.z.toBits()) }

        var state = ViewerOrbitReducer.neutral
        state = ViewerOrbitReducer.reduce(state, ViewerOrbitAction.Drag(37.0, -18.0))
        state = ViewerOrbitReducer.reduce(state, ViewerOrbitAction.ZoomBy(1.25))

        val after = canonical.map { Triple(it.x.toBits(), it.y.toBits(), it.z.toBits()) }
        assertEquals(before, after)
        assertEquals(37.0, state.yawDegrees, 0.0)
        assertEquals(-18.0, state.pitchDegrees, 0.0)
        assertEquals(1.25, state.zoom, 0.0)
    }
}
