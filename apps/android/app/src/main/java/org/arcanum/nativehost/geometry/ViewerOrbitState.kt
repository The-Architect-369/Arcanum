package org.arcanum.nativehost.geometry

import kotlin.math.abs

data class ViewerOrbitState(
    val yawDegrees: Double = 0.0,
    val pitchDegrees: Double = 0.0,
    val zoom: Double = 1.0,
) {
    fun isNeutral(tolerance: Double = 1e-12): Boolean =
        abs(yawDegrees) <= tolerance &&
            abs(pitchDegrees) <= tolerance &&
            abs(zoom - 1.0) <= tolerance
}

sealed interface ViewerOrbitAction {
    data class Drag(
        val deltaYawDegrees: Double,
        val deltaPitchDegrees: Double,
    ) : ViewerOrbitAction

    data class ZoomBy(val factor: Double) : ViewerOrbitAction

    data object Reset : ViewerOrbitAction
}

object ViewerOrbitReducer {
    const val MIN_PITCH_DEGREES = -70.0
    const val MAX_PITCH_DEGREES = 70.0
    const val MIN_ZOOM = 0.75
    const val MAX_ZOOM = 1.60

    val neutral = ViewerOrbitState()

    fun reduce(
        state: ViewerOrbitState,
        action: ViewerOrbitAction,
    ): ViewerOrbitState =
        when (action) {
            is ViewerOrbitAction.Drag ->
                ViewerOrbitState(
                    yawDegrees = normalizeYaw(state.yawDegrees + action.deltaYawDegrees),
                    pitchDegrees =
                        (state.pitchDegrees + action.deltaPitchDegrees)
                            .coerceIn(MIN_PITCH_DEGREES, MAX_PITCH_DEGREES),
                    zoom = state.zoom,
                )

            is ViewerOrbitAction.ZoomBy -> {
                require(action.factor.isFinite() && action.factor > 0.0) {
                    "viewer zoom factor must be finite and positive"
                }
                state.copy(zoom = (state.zoom * action.factor).coerceIn(MIN_ZOOM, MAX_ZOOM))
            }

            ViewerOrbitAction.Reset -> neutral
        }

    private fun normalizeYaw(value: Double): Double {
        require(value.isFinite()) { "viewer yaw must be finite" }
        var normalized = value % 360.0
        if (normalized > 180.0) normalized -= 360.0
        if (normalized <= -180.0) normalized += 360.0
        return normalized
    }
}
