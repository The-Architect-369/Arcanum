package org.arcanum.nativehost.geometry

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.view.View
import kotlin.math.abs

class ArcnetRendererView(
    context: Context,
    private val runtimeBridgeLabel: String,
    private val runtimeLifecycleLabel: String,
) : View(context) {
    private val linePaint =
        Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.WHITE
            style = Paint.Style.STROKE
            strokeWidth = 2.0f
        }

    private val pointPaint =
        Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.WHITE
            style = Paint.Style.FILL
        }

    private val labelPaint =
        Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.LTGRAY
            textSize = 28.0f
        }

    private val runtimePaint =
        Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.LTGRAY
            textSize = 20.0f
        }

    private val errorPaint =
        Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.RED
            textSize = 28.0f
        }

    private val contractsResult: Result<CanonicalContracts> by lazy {
        runCatching {
            CanonicalContracts.fromAssets(context.assets).also { contracts ->
                require(contracts.verifyReferenceVectors()) {
                    "canonical F25 projection vectors do not match native projection"
                }
            }
        }
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        canvas.drawColor(Color.BLACK)

        // Runtime truth remains legible even if geometry fails closed.
        canvas.drawText(runtimeBridgeLabel, 24.0f, 76.0f, runtimePaint)
        canvas.drawText(runtimeLifecycleLabel, 24.0f, 104.0f, runtimePaint)

        val contracts =
            contractsResult.getOrElse { failure ->
                drawFailClosed(canvas, failure)
                return
            }

        if (width <= 0 || height <= 0) {
            return
        }

        val viewport =
            ViewportSpec(
                x0 = 0.0,
                y0 = 0.0,
                width = width.toDouble(),
                height = height.toDouble(),
            )
        val engine = ProjectionEngine(contracts.profile)

        contracts.groups.forEach { group ->
            drawCanonicalEdges(canvas, engine, viewport, group)
        }

        contracts.groups
            .flatMap { it.points }
            .forEach { point ->
                engine.project(point.q, viewport)?.let { projected ->
                    canvas.drawCircle(
                        projected.screenX.toFloat(),
                        projected.screenY.toFloat(),
                        5.0f,
                        pointPaint,
                    )
                }
            }

        engine.project(contracts.origin.q, viewport)?.let { projected ->
            canvas.drawCircle(
                projected.screenX.toFloat(),
                projected.screenY.toFloat(),
                8.0f,
                pointPaint,
            )
        }

        canvas.drawText(
            "ARCnet · canonical projection · authorityEffect=none",
            24.0f,
            40.0f,
            labelPaint,
        )
    }

    private fun drawCanonicalEdges(
        canvas: Canvas,
        engine: ProjectionEngine,
        viewport: ViewportSpec,
        group: GeometryGroup,
    ) {
        for (firstIndex in group.points.indices) {
            for (secondIndex in firstIndex + 1 until group.points.size) {
                val first = group.points[firstIndex]
                val second = group.points[secondIndex]
                if (!sameLength((first.q - second.q).norm(), group.edgeLength)) {
                    continue
                }
                val segment = engine.clipSegment(first.q, second.q, viewport) ?: continue
                canvas.drawLine(
                    segment.firstX.toFloat(),
                    segment.firstY.toFloat(),
                    segment.secondX.toFloat(),
                    segment.secondY.toFloat(),
                    linePaint,
                )
            }
        }
    }

    private fun drawFailClosed(
        canvas: Canvas,
        failure: Throwable,
    ) {
        canvas.drawText("ARCnet projection unavailable", 24.0f, 148.0f, errorPaint)
        canvas.drawText(
            failure.message ?: failure::class.java.simpleName,
            24.0f,
            184.0f,
            errorPaint,
        )
    }

    private fun sameLength(
        observed: Double,
        expected: Double,
    ): Boolean = abs(observed - expected) <= 1e-9 * maxOf(1.0, abs(observed), abs(expected))
}
