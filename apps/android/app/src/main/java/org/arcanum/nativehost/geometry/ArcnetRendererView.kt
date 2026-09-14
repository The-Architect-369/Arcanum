package org.arcanum.nativehost.geometry

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.RectF
import android.os.Bundle
import android.view.GestureDetector
import android.view.MotionEvent
import android.view.ScaleGestureDetector
import android.view.View
import android.view.accessibility.AccessibilityNodeInfo
import kotlin.math.abs

class ArcnetRendererView(
    context: Context,
    private val runtimeBridgeLabel: String,
) : View(context) {
    private val outerLinePaint =
        Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.WHITE
            style = Paint.Style.STROKE
            strokeWidth = 1.25f
            alpha = 58
        }
    private val innerLinePaint =
        Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.WHITE
            style = Paint.Style.STROKE
            strokeWidth = 2.25f
            alpha = 228
        }
    private val seedPaint =
        Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.WHITE
            style = Paint.Style.STROKE
            strokeWidth = 1.25f
            alpha = 74
        }
    private val outerPointPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = Color.WHITE; style = Paint.Style.FILL; alpha = 76 }
    private val innerPointPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = Color.WHITE; style = Paint.Style.FILL; alpha = 238 }
    private val centerPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = Color.WHITE; style = Paint.Style.FILL }
    private val errorPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = Color.RED; textSize = 28.0f }

    private var topOccupiedPx: Int = dp(96)
    private var bottomOccupiedPx: Int = dp(280)
    private var viewerOrbitState: ViewerOrbitState = ViewerOrbitReducer.neutral
    private var gestureAccepted = false

    private val gestureDetector =
        GestureDetector(
            context,
            object : GestureDetector.SimpleOnGestureListener() {
                override fun onDown(e: MotionEvent): Boolean = true

                override fun onScroll(
                    e1: MotionEvent?,
                    e2: MotionEvent,
                    distanceX: Float,
                    distanceY: Float,
                ): Boolean {
                    if (!gestureAccepted) return false
                    dispatchViewerAction(
                        ViewerOrbitGesturePolicy.dragAction(
                            distanceX = distanceX.toDouble(),
                            distanceY = distanceY.toDouble(),
                        ),
                    )
                    return true
                }

                override fun onDoubleTap(e: MotionEvent): Boolean {
                    if (!gestureAccepted) return false
                    dispatchViewerAction(ViewerOrbitAction.Reset)
                    return true
                }
            },
        )

    private val scaleGestureDetector =
        ScaleGestureDetector(
            context,
            object : ScaleGestureDetector.SimpleOnScaleGestureListener() {
                override fun onScale(detector: ScaleGestureDetector): Boolean {
                    if (!gestureAccepted) return false
                    dispatchViewerAction(
                        ViewerOrbitGesturePolicy.zoomAction(detector.scaleFactor.toDouble()),
                    )
                    return true
                }
            },
        )

    private val contractsResult: Result<CanonicalContracts> by lazy {
        runCatching {
            CanonicalContracts.fromAssets(context.assets).also { contracts ->
                require(contracts.verifyReferenceVectors()) {
                    "canonical F25 projection vectors do not match native projection"
                }
            }
        }
    }

    private val seedOverlayResult: Result<HopeSeedOverlay> by lazy {
        runCatching {
            HopeSeedOverlay.fromAssets(context.assets).also { overlay ->
                val vectors = context.assets.open(HopeSeedOverlay.VECTOR_ASSET).bufferedReader().use { it.readText() }
                require(overlay.verifyReferenceVectors(vectors)) {
                    "CE-W03 Seed overlay vectors do not match presentation mapping"
                }
            }
        }
    }

    init {
        contentDescription =
            "Hope is centered in a bounded ARCnet scene. Outer ARCnet geometry is visually subordinate. " +
                "Viewer transform is presentation-only and has authorityEffect none. " +
                "Drag to orbit, pinch to zoom, double tap to reset. $runtimeBridgeLabel"
        importantForAccessibility = IMPORTANT_FOR_ACCESSIBILITY_YES
        isFocusable = true
    }

    fun setOccupiedBands(topPx: Int, bottomPx: Int) {
        val nextTop = topPx.coerceAtLeast(0)
        val nextBottom = bottomPx.coerceAtLeast(0)
        if (nextTop == topOccupiedPx && nextBottom == bottomOccupiedPx) return
        topOccupiedPx = nextTop
        bottomOccupiedPx = nextBottom
        invalidate()
    }

    fun setViewerOrbitState(state: ViewerOrbitState) {
        if (state == viewerOrbitState) return
        viewerOrbitState = state
        invalidate()
    }

    fun getViewerOrbitState(): ViewerOrbitState = viewerOrbitState

    override fun onTouchEvent(event: MotionEvent): Boolean {
        when (event.actionMasked) {
            MotionEvent.ACTION_DOWN -> {
                gestureAccepted = isInsideInteractiveScene(event.x, event.y)
                if (!gestureAccepted) return false
            }
            MotionEvent.ACTION_CANCEL,
            MotionEvent.ACTION_UP,
            -> if (!gestureAccepted) return false
        }

        if (!gestureAccepted) return false
        scaleGestureDetector.onTouchEvent(event)
        gestureDetector.onTouchEvent(event)

        if (event.actionMasked == MotionEvent.ACTION_CANCEL || event.actionMasked == MotionEvent.ACTION_UP) {
            gestureAccepted = false
        }
        return true
    }

    override fun onInitializeAccessibilityNodeInfo(info: AccessibilityNodeInfo) {
        super.onInitializeAccessibilityNodeInfo(info)
        info.addAction(AccessibilityNodeInfo.AccessibilityAction(ACTION_ORBIT_LEFT, "Rotate view left"))
        info.addAction(AccessibilityNodeInfo.AccessibilityAction(ACTION_ORBIT_RIGHT, "Rotate view right"))
        info.addAction(AccessibilityNodeInfo.AccessibilityAction(ACTION_ORBIT_UP, "Rotate view up"))
        info.addAction(AccessibilityNodeInfo.AccessibilityAction(ACTION_ORBIT_DOWN, "Rotate view down"))
        info.addAction(AccessibilityNodeInfo.AccessibilityAction(ACTION_ZOOM_IN, "Zoom view in"))
        info.addAction(AccessibilityNodeInfo.AccessibilityAction(ACTION_ZOOM_OUT, "Zoom view out"))
        info.addAction(AccessibilityNodeInfo.AccessibilityAction(ACTION_RESET_VIEW, "Reset view"))
    }

    override fun performAccessibilityAction(action: Int, arguments: Bundle?): Boolean =
        when (action) {
            ACTION_ORBIT_LEFT -> dispatchAccessibilityAction(ViewerOrbitAction.Drag(-ACCESSIBILITY_ROTATION_STEP, 0.0))
            ACTION_ORBIT_RIGHT -> dispatchAccessibilityAction(ViewerOrbitAction.Drag(ACCESSIBILITY_ROTATION_STEP, 0.0))
            ACTION_ORBIT_UP -> dispatchAccessibilityAction(ViewerOrbitAction.Drag(0.0, ACCESSIBILITY_ROTATION_STEP))
            ACTION_ORBIT_DOWN -> dispatchAccessibilityAction(ViewerOrbitAction.Drag(0.0, -ACCESSIBILITY_ROTATION_STEP))
            ACTION_ZOOM_IN -> dispatchAccessibilityAction(ViewerOrbitAction.ZoomBy(ACCESSIBILITY_ZOOM_FACTOR))
            ACTION_ZOOM_OUT -> dispatchAccessibilityAction(ViewerOrbitAction.ZoomBy(1.0 / ACCESSIBILITY_ZOOM_FACTOR))
            ACTION_RESET_VIEW -> dispatchAccessibilityAction(ViewerOrbitAction.Reset)
            else -> super.performAccessibilityAction(action, arguments)
        }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        canvas.drawColor(Color.BLACK)

        val contracts = contractsResult.getOrElse { failure -> drawFailClosed(canvas, failure); return }
        val seedOverlay = seedOverlayResult.getOrElse { failure -> drawFailClosed(canvas, failure); return }
        if (width <= 0 || height <= 0) return

        val scene = resolveSceneViewport()
        val viewport = scene.asProjectionViewport()
        val engine = ProjectionEngine(contracts.profile)
        val viewerOrbit = viewerOrbitState

        val restoreCount = canvas.save()
        canvas.clipRect(RectF(scene.x0.toFloat(), scene.y0.toFloat(), (scene.x0 + scene.width).toFloat(), (scene.y0 + scene.height).toFloat()))

        contracts.groups.firstOrNull { it.id == "outerCube" }?.let { group ->
            drawCanonicalEdges(canvas, engine, viewport, viewerOrbit, group, outerLinePaint)
            drawPoints(canvas, engine, viewport, viewerOrbit, group, outerPointPaint, 3.0f)
        }
        contracts.groups.firstOrNull { it.id == "innerOctahedron" }?.let { group ->
            drawCanonicalEdges(canvas, engine, viewport, viewerOrbit, group, innerLinePaint)
            drawPoints(canvas, engine, viewport, viewerOrbit, group, innerPointPaint, 4.5f)
        }

        engine.project(contracts.origin.q, viewport, viewerOrbit)?.let { projected ->
            seedOverlay.mapToScreen(projected.screenX, projected.screenY, viewport.width, viewport.height).forEach { circle ->
                canvas.drawCircle(circle.centerX.toFloat(), circle.centerY.toFloat(), circle.radius.toFloat(), seedPaint)
            }
            canvas.drawCircle(projected.screenX.toFloat(), projected.screenY.toFloat(), 7.0f, centerPaint)
        }
        canvas.restoreToCount(restoreCount)
    }

    private fun resolveSceneViewport(): SceneViewport {
        val runtimeViewport =
            ViewportSpec(
                x0 = 0.0,
                y0 = 0.0,
                width = width.toDouble(),
                height = height.toDouble(),
            )
        return SceneViewportPolicy.resolve(
            widthPx = runtimeViewport.width.toInt(),
            heightPx = runtimeViewport.height.toInt(),
            topOccupiedPx = topOccupiedPx,
            bottomOccupiedPx = bottomOccupiedPx,
            horizontalInsetPx = dp(16),
            minimumHeightPx = dp(300),
        )
    }

    private fun isInsideInteractiveScene(x: Float, y: Float): Boolean {
        if (width <= 0 || height <= 0) return false
        return ViewerOrbitGesturePolicy.acceptsScenePoint(
            scene = resolveSceneViewport(),
            x = x.toDouble(),
            y = y.toDouble(),
        )
    }

    private fun dispatchViewerAction(action: ViewerOrbitAction) {
        setViewerOrbitState(ViewerOrbitReducer.reduce(viewerOrbitState, action))
    }

    private fun dispatchAccessibilityAction(action: ViewerOrbitAction): Boolean {
        dispatchViewerAction(action)
        announceForAccessibility(
            when (action) {
                ViewerOrbitAction.Reset -> "View reset"
                is ViewerOrbitAction.Drag -> "View rotated"
                is ViewerOrbitAction.ZoomBy -> "View zoom changed"
            },
        )
        return true
    }

    private fun drawCanonicalEdges(
        canvas: Canvas,
        engine: ProjectionEngine,
        viewport: ViewportSpec,
        viewerOrbit: ViewerOrbitState,
        group: GeometryGroup,
        paint: Paint,
    ) {
        for (firstIndex in group.points.indices) {
            for (secondIndex in firstIndex + 1 until group.points.size) {
                val first = group.points[firstIndex]
                val second = group.points[secondIndex]
                if (!sameLength((first.q - second.q).norm(), group.edgeLength)) continue
                val segment = engine.clipSegment(first.q, second.q, viewport, viewerOrbit) ?: continue
                canvas.drawLine(segment.firstX.toFloat(), segment.firstY.toFloat(), segment.secondX.toFloat(), segment.secondY.toFloat(), paint)
            }
        }
    }

    private fun drawPoints(
        canvas: Canvas,
        engine: ProjectionEngine,
        viewport: ViewportSpec,
        viewerOrbit: ViewerOrbitState,
        group: GeometryGroup,
        paint: Paint,
        radius: Float,
    ) {
        group.points.forEach { point ->
            engine.project(point.q, viewport, viewerOrbit)?.let { projected ->
                canvas.drawCircle(projected.screenX.toFloat(), projected.screenY.toFloat(), radius, paint)
            }
        }
    }

    private fun drawFailClosed(canvas: Canvas, failure: Throwable) {
        canvas.drawText("ARCnet projection unavailable", 24.0f, 40.0f, errorPaint)
        canvas.drawText(failure.message ?: failure::class.java.simpleName, 24.0f, 76.0f, errorPaint)
    }

    private fun sameLength(observed: Double, expected: Double): Boolean =
        abs(observed - expected) <= 1e-9 * maxOf(1.0, abs(observed), abs(expected))

    private fun dp(value: Int): Int = (value * resources.displayMetrics.density).toInt()

    companion object {
        private const val ACCESSIBILITY_ROTATION_STEP = 15.0
        private const val ACCESSIBILITY_ZOOM_FACTOR = 1.15
        private const val ACTION_ORBIT_LEFT = 0x02010001
        private const val ACTION_ORBIT_RIGHT = 0x02010002
        private const val ACTION_ORBIT_UP = 0x02010003
        private const val ACTION_ORBIT_DOWN = 0x02010004
        private const val ACTION_ZOOM_IN = 0x02010005
        private const val ACTION_ZOOM_OUT = 0x02010006
        private const val ACTION_RESET_VIEW = 0x02010007
    }
}
