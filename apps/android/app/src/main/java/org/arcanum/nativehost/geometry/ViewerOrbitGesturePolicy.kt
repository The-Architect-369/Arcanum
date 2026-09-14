package org.arcanum.nativehost.geometry

object ViewerOrbitGesturePolicy {
    const val DRAG_DEGREES_PER_PX = 0.18

    fun dragAction(
        distanceX: Double,
        distanceY: Double,
    ): ViewerOrbitAction.Drag {
        require(distanceX.isFinite() && distanceY.isFinite()) {
            "viewer drag deltas must be finite"
        }
        return ViewerOrbitAction.Drag(
            deltaYawDegrees = -distanceX * DRAG_DEGREES_PER_PX,
            deltaPitchDegrees = distanceY * DRAG_DEGREES_PER_PX,
        )
    }

    fun zoomAction(scaleFactor: Double): ViewerOrbitAction.ZoomBy {
        require(scaleFactor.isFinite() && scaleFactor > 0.0) {
            "viewer scale factor must be finite and positive"
        }
        return ViewerOrbitAction.ZoomBy(scaleFactor)
    }

    fun acceptsScenePoint(
        scene: SceneViewport,
        x: Double,
        y: Double,
    ): Boolean =
        x.isFinite() &&
            y.isFinite() &&
            x >= scene.x0 &&
            x <= scene.x0 + scene.width &&
            y >= scene.y0 &&
            y <= scene.y0 + scene.height
}
