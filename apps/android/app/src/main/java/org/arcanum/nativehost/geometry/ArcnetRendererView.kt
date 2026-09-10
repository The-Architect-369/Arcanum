package org.arcanum.nativehost.geometry

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.RectF
import android.view.View
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
                "This view is presentation-only and has authorityEffect none. $runtimeBridgeLabel"
        importantForAccessibility = IMPORTANT_FOR_ACCESSIBILITY_YES
    }

    fun setOccupiedBands(topPx: Int, bottomPx: Int) {
        val nextTop = topPx.coerceAtLeast(0)
        val nextBottom = bottomPx.coerceAtLeast(0)
        if (nextTop == topOccupiedPx && nextBottom == bottomOccupiedPx) return
        topOccupiedPx = nextTop
        bottomOccupiedPx = nextBottom
        invalidate()
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        canvas.drawColor(Color.BLACK)

        val contracts = contractsResult.getOrElse { failure -> drawFailClosed(canvas, failure); return }
        val seedOverlay = seedOverlayResult.getOrElse { failure -> drawFailClosed(canvas, failure); return }
        if (width <= 0 || height <= 0) return

        // Preserve the inherited runtime viewport ownership invariant. A05 derives a smaller
        // presentation viewport from this physical View; canonical geometry remains unchanged.
        val runtimeViewport =
            ViewportSpec(
                x0 = 0.0,
                y0 = 0.0,
                width = width.toDouble(),
                height = height.toDouble(),
            )
        val scene =
            SceneViewportPolicy.resolve(
                widthPx = runtimeViewport.width.toInt(),
                heightPx = runtimeViewport.height.toInt(),
                topOccupiedPx = topOccupiedPx,
                bottomOccupiedPx = bottomOccupiedPx,
                horizontalInsetPx = dp(16),
                minimumHeightPx = dp(300),
            )
        val viewport = scene.asProjectionViewport()
        val engine = ProjectionEngine(contracts.profile)

        val restoreCount = canvas.save()
        canvas.clipRect(RectF(scene.x0.toFloat(), scene.y0.toFloat(), (scene.x0 + scene.width).toFloat(), (scene.y0 + scene.height).toFloat()))

        contracts.groups.firstOrNull { it.id == "outerCube" }?.let { group ->
            drawCanonicalEdges(canvas, engine, viewport, group, outerLinePaint)
            drawPoints(canvas, engine, viewport, group, outerPointPaint, 3.0f)
        }
        contracts.groups.firstOrNull { it.id == "innerOctahedron" }?.let { group ->
            drawCanonicalEdges(canvas, engine, viewport, group, innerLinePaint)
            drawPoints(canvas, engine, viewport, group, innerPointPaint, 4.5f)
        }

        engine.project(contracts.origin.q, viewport)?.let { projected ->
            seedOverlay.mapToScreen(projected.screenX, projected.screenY, viewport.width, viewport.height).forEach { circle ->
                canvas.drawCircle(circle.centerX.toFloat(), circle.centerY.toFloat(), circle.radius.toFloat(), seedPaint)
            }
            canvas.drawCircle(projected.screenX.toFloat(), projected.screenY.toFloat(), 7.0f, centerPaint)
        }
        canvas.restoreToCount(restoreCount)
    }

    private fun drawCanonicalEdges(canvas: Canvas, engine: ProjectionEngine, viewport: ViewportSpec, group: GeometryGroup, paint: Paint) {
        for (firstIndex in group.points.indices) {
            for (secondIndex in firstIndex + 1 until group.points.size) {
                val first = group.points[firstIndex]
                val second = group.points[secondIndex]
                if (!sameLength((first.q - second.q).norm(), group.edgeLength)) continue
                val segment = engine.clipSegment(first.q, second.q, viewport) ?: continue
                canvas.drawLine(segment.firstX.toFloat(), segment.firstY.toFloat(), segment.secondX.toFloat(), segment.secondY.toFloat(), paint)
            }
        }
    }

    private fun drawPoints(canvas: Canvas, engine: ProjectionEngine, viewport: ViewportSpec, group: GeometryGroup, paint: Paint, radius: Float) {
        group.points.forEach { point ->
            engine.project(point.q, viewport)?.let { projected ->
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
}
