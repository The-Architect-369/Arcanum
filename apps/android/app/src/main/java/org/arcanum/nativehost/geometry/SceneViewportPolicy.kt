package org.arcanum.nativehost.geometry

import kotlin.math.max

data class SceneViewport(
    val x0: Double,
    val y0: Double,
    val width: Double,
    val height: Double,
    val constrainedByControls: Boolean,
) {
    fun asProjectionViewport(): ViewportSpec = ViewportSpec(x0, y0, width, height)
}

object SceneViewportPolicy {
    fun resolve(
        widthPx: Int,
        heightPx: Int,
        topOccupiedPx: Int,
        bottomOccupiedPx: Int,
        horizontalInsetPx: Int,
        minimumHeightPx: Int,
    ): SceneViewport {
        require(widthPx > 0 && heightPx > 0) { "scene viewport requires positive dimensions" }

        val horizontal = horizontalInsetPx.coerceAtLeast(0).coerceAtMost(widthPx / 4)
        val x0 = horizontal.toDouble()
        val usableWidth = max(1, widthPx - horizontal * 2).toDouble()

        val top = topOccupiedPx.coerceAtLeast(0).coerceAtMost(heightPx - 1)
        val bottom = bottomOccupiedPx.coerceAtLeast(0).coerceAtMost(heightPx - top - 1)
        val available = max(1, heightPx - top - bottom)
        val requestedMinimum = minimumHeightPx.coerceAtLeast(1).coerceAtMost(heightPx)

        // Occupied participant surfaces are a hard exclusion boundary. When the
        // remaining scene is smaller than the preferred minimum, report the
        // constraint instead of drawing canonical geometry behind controls.
        return SceneViewport(
            x0 = x0,
            y0 = top.toDouble(),
            width = usableWidth,
            height = available.toDouble(),
            constrainedByControls = available < requestedMinimum,
        )
    }
}
