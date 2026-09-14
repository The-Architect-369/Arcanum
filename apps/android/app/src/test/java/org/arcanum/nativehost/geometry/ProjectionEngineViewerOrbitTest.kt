package org.arcanum.nativehost.geometry

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class ProjectionEngineViewerOrbitTest {
    private val profile =
        ProjectionProfile(
            model =
                ModelSpec(
                    translation = Vec3(0.0, 0.0, 0.0),
                    scale = 1.0,
                    rotation =
                        Mat3(
                            rows =
                                listOf(
                                    Vec3(1.0, 0.0, 0.0),
                                    Vec3(0.0, 1.0, 0.0),
                                    Vec3(0.0, 0.0, 1.0),
                                ),
                        ),
                ),
            camera =
                CameraSpec(
                    eye = Vec3(0.0, 0.0, 5.0),
                    target = Vec3(0.0, 0.0, 0.0),
                    upReference = Vec3(0.0, 1.0, 0.0),
                ),
            perspective = PerspectiveSpec(fovYDegrees = 60.0, near = 0.1, far = 100.0),
            referenceViewport = ViewportSpec(x0 = 0.0, y0 = 0.0, width = 1000.0, height = 1000.0),
        )

    @Test
    fun explicitNeutralOrbitIsBitwiseEquivalentToInheritedProjection() {
        val engine = ProjectionEngine(profile)
        val point = Vec3(0.75, -0.25, 0.5)

        val inherited = requireNotNull(engine.project(point, profile.referenceViewport))
        val neutral =
            requireNotNull(
                engine.project(
                    point,
                    profile.referenceViewport,
                    ViewerOrbitReducer.neutral,
                ),
            )

        assertEquals(inherited.screenX.toBits(), neutral.screenX.toBits())
        assertEquals(inherited.screenY.toBits(), neutral.screenY.toBits())
        assertEquals(inherited.viewDepth.toBits(), neutral.viewDepth.toBits())
    }

    @Test
    fun nonNeutralOrbitChangesViewerProjectionWithoutMutatingCanonicalPoint() {
        val engine = ProjectionEngine(profile)
        val canonical = Vec3(1.0, 0.25, 0.0)
        val before = Triple(canonical.x.toBits(), canonical.y.toBits(), canonical.z.toBits())
        val neutral = requireNotNull(engine.project(canonical, profile.referenceViewport))
        val moved =
            requireNotNull(
                engine.project(
                    canonical,
                    profile.referenceViewport,
                    ViewerOrbitState(yawDegrees = 35.0, pitchDegrees = -20.0, zoom = 1.2),
                ),
            )
        val after = Triple(canonical.x.toBits(), canonical.y.toBits(), canonical.z.toBits())

        assertEquals(before, after)
        assertTrue(
            neutral.screenX.toBits() != moved.screenX.toBits() ||
                neutral.screenY.toBits() != moved.screenY.toBits() ||
                neutral.viewDepth.toBits() != moved.viewDepth.toBits(),
        )
    }

    @Test
    fun zoomChangesCameraDistanceWithoutMovingCanonicalOrigin() {
        val engine = ProjectionEngine(profile)
        val origin = Vec3(0.0, 0.0, 0.0)
        val neutral = requireNotNull(engine.project(origin, profile.referenceViewport))
        val zoomed =
            requireNotNull(
                engine.project(
                    origin,
                    profile.referenceViewport,
                    ViewerOrbitState(zoom = 1.5),
                ),
            )

        assertEquals(neutral.screenX.toBits(), zoomed.screenX.toBits())
        assertEquals(neutral.screenY.toBits(), zoomed.screenY.toBits())
        assertNotEquals(neutral.viewDepth.toBits(), zoomed.viewDepth.toBits())
        assertTrue(zoomed.viewDepth < neutral.viewDepth)
        assertEquals(0.0.toBits(), origin.x.toBits())
        assertEquals(0.0.toBits(), origin.y.toBits())
        assertEquals(0.0.toBits(), origin.z.toBits())
    }

    @Test
    fun segmentProjectionAlsoRespectsViewerOrbit() {
        val engine = ProjectionEngine(profile)
        val first = Vec3(-0.5, 0.0, 0.0)
        val second = Vec3(0.5, 0.0, 0.0)
        val neutral = requireNotNull(engine.clipSegment(first, second, profile.referenceViewport))
        val moved =
            requireNotNull(
                engine.clipSegment(
                    first,
                    second,
                    profile.referenceViewport,
                    ViewerOrbitState(yawDegrees = 25.0, pitchDegrees = 15.0, zoom = 1.1),
                ),
            )

        assertTrue(
            neutral.firstX.toBits() != moved.firstX.toBits() ||
                neutral.firstY.toBits() != moved.firstY.toBits() ||
                neutral.secondX.toBits() != moved.secondX.toBits() ||
                neutral.secondY.toBits() != moved.secondY.toBits(),
        )
    }
}
