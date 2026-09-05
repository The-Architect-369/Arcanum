package org.arcanum.nativehost.geometry

import kotlin.math.PI
import kotlin.math.max
import kotlin.math.min
import kotlin.math.tan

data class Vec4(
    val x: Double,
    val y: Double,
    val z: Double,
    val w: Double,
) {
    operator fun plus(other: Vec4) = Vec4(x + other.x, y + other.y, z + other.z, w + other.w)
    operator fun minus(other: Vec4) = Vec4(x - other.x, y - other.y, z - other.z, w - other.w)
    operator fun times(scale: Double) = Vec4(x * scale, y * scale, z * scale, w * scale)
}

data class ProjectedPoint(
    val screenX: Double,
    val screenY: Double,
    val viewDepth: Double,
)

data class ProjectedSegment(
    val firstX: Double,
    val firstY: Double,
    val secondX: Double,
    val secondY: Double,
)

class ProjectionEngine(
    private val profile: ProjectionProfile,
) {
    fun project(
        q: Vec3,
        viewport: ViewportSpec = profile.referenceViewport,
    ): ProjectedPoint? {
        val world = model(q)
        val view = view(world)
        val clip = perspectiveClip(view, viewport)
        if (!insideClip(clip)) {
            return null
        }
        val screen = screenFromClip(clip, viewport)
        return ProjectedPoint(
            screenX = screen.first,
            screenY = screen.second,
            viewDepth = -view.z,
        )
    }

    fun clipSegment(
        firstQ: Vec3,
        secondQ: Vec3,
        viewport: ViewportSpec = profile.referenceViewport,
    ): ProjectedSegment? {
        val firstClip = perspectiveClip(view(model(firstQ)), viewport)
        val secondClip = perspectiveClip(view(model(secondQ)), viewport)
        val clipped = clipHomogeneousSegment(firstClip, secondClip) ?: return null
        val first = screenFromClip(clipped.first, viewport)
        val second = screenFromClip(clipped.second, viewport)
        return ProjectedSegment(first.first, first.second, second.first, second.second)
    }

    private fun model(q: Vec3): Vec3 =
        profile.model.translation + profile.model.rotation.apply(q) * profile.model.scale

    private fun cameraBasis(): Triple<Vec3, Vec3, Vec3> {
        val forward = (profile.camera.target - profile.camera.eye).normalized()
        val right = forward.cross(profile.camera.upReference).normalized()
        val up = right.cross(forward)
        require(up.norm() > 0.0) { "degenerate camera up basis" }
        return Triple(right, up, forward)
    }

    private fun view(world: Vec3): Vec3 {
        val (right, up, forward) = cameraBasis()
        val relative = world - profile.camera.eye
        return Vec3(
            right.dot(relative),
            up.dot(relative),
            -forward.dot(relative),
        )
    }

    private fun perspectiveClip(
        view: Vec3,
        viewport: ViewportSpec,
    ): Vec4 {
        require(viewport.width > 0.0 && viewport.height > 0.0) { "positive viewport required" }
        val near = profile.perspective.near
        val far = profile.perspective.far
        val fovYRadians = profile.perspective.fovYDegrees * PI / 180.0
        require(fovYRadians > 0.0 && fovYRadians < PI) { "vertical FOV out of range" }
        require(near > 0.0 && near < far) { "near/far range invalid" }

        val aspect = viewport.width / viewport.height
        val t = 1.0 / tan(fovYRadians / 2.0)
        return Vec4(
            x = (t / aspect) * view.x,
            y = t * view.y,
            z =
                ((far + near) / (near - far)) * view.z +
                    ((2.0 * far * near) / (near - far)),
            w = -view.z,
        )
    }

    private fun insideClip(clip: Vec4): Boolean =
        clip.w > 0.0 &&
            clip.x >= -clip.w &&
            clip.x <= clip.w &&
            clip.y >= -clip.w &&
            clip.y <= clip.w &&
            clip.z >= -clip.w &&
            clip.z <= clip.w

    private fun screenFromClip(
        clip: Vec4,
        viewport: ViewportSpec,
    ): Pair<Double, Double> {
        require(clip.w > 0.0) { "perspective divide requires positive w" }
        val ndcX = clip.x / clip.w
        val ndcY = clip.y / clip.w
        return Pair(
            viewport.x0 + (ndcX + 1.0) * viewport.width / 2.0,
            viewport.y0 + (1.0 - ndcY) * viewport.height / 2.0,
        )
    }

    private fun clipHomogeneousSegment(
        first: Vec4,
        second: Vec4,
    ): Pair<Vec4, Vec4>? {
        val planes: List<(Vec4) -> Double> =
            listOf(
                { point -> point.w },
                { point -> point.w + point.x },
                { point -> point.w - point.x },
                { point -> point.w + point.y },
                { point -> point.w - point.y },
                { point -> point.w + point.z },
                { point -> point.w - point.z },
            )

        var enter = 0.0
        var exit = 1.0
        for (plane in planes) {
            val firstValue = plane(first)
            val secondValue = plane(second)
            if (firstValue < 0.0 && secondValue < 0.0) {
                return null
            }
            if (firstValue >= 0.0 && secondValue >= 0.0) {
                continue
            }

            val crossing = firstValue / (firstValue - secondValue)
            if (firstValue < 0.0) {
                enter = max(enter, crossing)
            } else {
                exit = min(exit, crossing)
            }
            if (enter > exit) {
                return null
            }
        }

        val delta = second - first
        val clippedFirst = first + delta * enter
        val clippedSecond = first + delta * exit
        if (clippedFirst.w <= 0.0 || clippedSecond.w <= 0.0) {
            return null
        }
        return Pair(clippedFirst, clippedSecond)
    }
}
