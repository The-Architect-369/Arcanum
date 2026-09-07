package org.arcanum.nativehost.architect

import android.graphics.Rect
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import org.json.JSONArray
import org.json.JSONObject

object ArchitectVisualDiagnostics {
    private const val MIN_TOUCH_TARGET_DP = 48.0
    private const val MAX_REPORTED_ITEMS = 64

    fun inspect(
        root: View,
        density: Float,
    ): JSONObject {
        val nodes = mutableListOf<DiagnosticNode>()
        collect(root = root, view = root, path = "root", output = nodes)
        val safeDensity = density.takeIf { it > 0.0f } ?: 1.0f
        val visible = nodes.filter { it.visible }
        val clickable = visible.filter { it.clickable }
        val text = visible.filter { it.textView }

        val smallTouchTargets =
            clickable.filter { node ->
                node.bounds.width() / safeDensity < MIN_TOUCH_TARGET_DP ||
                    node.bounds.height() / safeDensity < MIN_TOUCH_TARGET_DP
            }
        val clippedViews =
            visible.filter { node ->
                node.bounds.left < 0 ||
                    node.bounds.top < 0 ||
                    node.bounds.right > root.width ||
                    node.bounds.bottom > root.height
            }
        val overlapCandidates = mutableListOf<JSONObject>()
        for (leftIndex in text.indices) {
            for (rightIndex in leftIndex + 1 until text.size) {
                val left = text[leftIndex]
                val right = text[rightIndex]
                if (!Rect.intersects(left.bounds, right.bounds)) {
                    continue
                }
                val intersection = Rect(left.bounds)
                if (!intersection.intersect(right.bounds) || intersection.isEmpty) {
                    continue
                }
                overlapCandidates +=
                    JSONObject()
                        .put("firstPath", left.path)
                        .put("secondPath", right.path)
                        .put("intersectionPx", boundsJson(intersection))
                        .put("intersectionAreaPx", intersection.width() * intersection.height())
                if (overlapCandidates.size >= MAX_REPORTED_ITEMS) {
                    break
                }
            }
            if (overlapCandidates.size >= MAX_REPORTED_ITEMS) {
                break
            }
        }

        return JSONObject()
            .put("version", ArchitectObservationContract.VISUAL_DIAGNOSTICS_VERSION)
            .put("minimumTouchTargetDp", MIN_TOUCH_TARGET_DP)
            .put("visibleViewCount", visible.size)
            .put("textViewCount", text.size)
            .put("clickableViewCount", clickable.size)
            .put("smallTouchTargetCount", smallTouchTargets.size)
            .put("clippedVisibleViewCount", clippedViews.size)
            .put("textOverlapCandidateCount", overlapCandidates.size)
            .put(
                "smallTouchTargets",
                JSONArray().apply {
                    smallTouchTargets.take(MAX_REPORTED_ITEMS).forEach { node ->
                        put(
                            JSONObject()
                                .put("path", node.path)
                                .put("class", node.className)
                                .put("boundsPx", boundsJson(node.bounds))
                                .put("widthDp", node.bounds.width() / safeDensity)
                                .put("heightDp", node.bounds.height() / safeDensity),
                        )
                    }
                },
            ).put(
                "clippedViews",
                JSONArray().apply {
                    clippedViews.take(MAX_REPORTED_ITEMS).forEach { node ->
                        put(
                            JSONObject()
                                .put("path", node.path)
                                .put("class", node.className)
                                .put("boundsPx", boundsJson(node.bounds)),
                        )
                    }
                },
            ).put("textOverlapCandidates", JSONArray(overlapCandidates))
    }

    private fun collect(
        root: View,
        view: View,
        path: String,
        output: MutableList<DiagnosticNode>,
    ) {
        output +=
            DiagnosticNode(
                path = path,
                className = view.javaClass.name,
                bounds = boundsInRoot(root, view),
                visible =
                    view.visibility == View.VISIBLE &&
                        view.width > 0 &&
                        view.height > 0 &&
                        view.alpha > 0.0f,
                clickable = view.isClickable,
                textView = view is TextView,
            )

        if (view is ViewGroup) {
            for (index in 0 until view.childCount) {
                val child = view.getChildAt(index)
                collect(
                    root = root,
                    view = child,
                    path = "$path/$index:${child.javaClass.simpleName}",
                    output = output,
                )
            }
        }
    }

    private fun boundsInRoot(
        root: View,
        view: View,
    ): Rect {
        val rootLocation = IntArray(2)
        val viewLocation = IntArray(2)
        root.getLocationOnScreen(rootLocation)
        view.getLocationOnScreen(viewLocation)
        val left = viewLocation[0] - rootLocation[0]
        val top = viewLocation[1] - rootLocation[1]
        return Rect(left, top, left + view.width, top + view.height)
    }

    private fun boundsJson(bounds: Rect): JSONObject =
        JSONObject()
            .put("left", bounds.left)
            .put("top", bounds.top)
            .put("right", bounds.right)
            .put("bottom", bounds.bottom)

    private data class DiagnosticNode(
        val path: String,
        val className: String,
        val bounds: Rect,
        val visible: Boolean,
        val clickable: Boolean,
        val textView: Boolean,
    )
}
