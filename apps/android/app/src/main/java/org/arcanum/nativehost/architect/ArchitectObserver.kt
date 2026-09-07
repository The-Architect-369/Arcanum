package org.arcanum.nativehost.architect

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Rect
import android.os.Looper
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import android.widget.TextView
import java.io.File
import java.io.FileOutputStream
import java.security.MessageDigest
import java.time.Instant
import org.json.JSONArray
import org.json.JSONObject

data class ArchitectObservationResult(
    val manifestFile: File,
    val imageFile: File,
    val redactedViewCount: Int,
    val imageSha256: String,
)

class ArchitectObserver(
    private val context: Context,
    private val runtimeBridgeLabel: String,
    private val applicationState: String,
) {
    fun capture(
        root: View,
        trigger: String,
    ): ArchitectObservationResult {
        check(Looper.myLooper() == Looper.getMainLooper()) {
            "Architect observation must capture the Android view tree on the main thread"
        }
        check(root.width > 0 && root.height > 0) {
            "Architect observation requires a laid-out root view"
        }

        val capturedAt = Instant.now().toString()
        val privateViews = mutableListOf<View>()
        val semanticTree = observeView(root, root, "root", privateViews)
        val viewsToMask = privateViews.filter(ArchitectObservationPrivacy::shouldMaskPixels)
        val bitmap = Bitmap.createBitmap(root.width, root.height, Bitmap.Config.ARGB_8888)

        try {
            val canvas = Canvas(bitmap)
            root.draw(canvas)
            redactPrivatePixels(canvas, root, viewsToMask)

            val observationDirectory =
                File(context.filesDir, OBSERVATION_DIRECTORY).apply {
                    check(exists() || mkdirs()) {
                        "Unable to create Architect observation directory"
                    }
                }
            val imageFile = File(observationDirectory, IMAGE_FILE_NAME)
            val manifestFile = File(observationDirectory, MANIFEST_FILE_NAME)
            persistBitmap(bitmap, imageFile)
            val imageSha256 = sha256(imageFile)

            val manifest =
                JSONObject()
                    .put("schemaVersion", ArchitectObservationContract.SCHEMA_VERSION)
                    .put("observationType", ArchitectObservationContract.OBSERVATION_TYPE)
                    .put("scope", ArchitectObservationContract.SCOPE)
                    .put("authorityEffect", ArchitectObservationContract.AUTHORITY_EFFECT)
                    .put("capturedAt", capturedAt)
                    .put("trigger", trigger)
                    .put("retention", ArchitectObservationContract.RETENTION)
                    .put(
                        "capabilityBoundary",
                        JSONObject()
                            .put("transport", ArchitectObservationContract.TRANSPORT)
                            .put("networkRequired", ArchitectObservationContract.NETWORK_REQUIRED)
                            .put("modelDependency", ArchitectObservationContract.MODEL_DEPENDENCY),
                    ).put(
                        "privacy",
                        JSONObject()
                            .put("policy", "private-local-redacted-v1")
                            .put("privateReflectionContentIncluded", false)
                            .put("semanticPrivateTextRedacted", true)
                            .put("rawUnredactedFramePersisted", false)
                            .put("redactedViewCount", viewsToMask.size),
                    ).put(
                        "viewport",
                        JSONObject()
                            .put("widthPx", root.width)
                            .put("heightPx", root.height)
                            .put("density", context.resources.displayMetrics.density)
                            .put("orientation", context.resources.configuration.orientation),
                    ).put(
                        "runtime",
                        JSONObject()
                            .put("bridge", runtimeBridgeLabel)
                            .put("applicationState", applicationState),
                    ).put(
                        "image",
                        JSONObject()
                            .put("file", IMAGE_FILE_NAME)
                            .put("format", "png")
                            .put("sha256", imageSha256)
                            .put("privacyRedacted", true),
                    ).put("viewTree", semanticTree)

            persistText(manifest.toString(2), manifestFile)
            return ArchitectObservationResult(
                manifestFile = manifestFile,
                imageFile = imageFile,
                redactedViewCount = viewsToMask.size,
                imageSha256 = imageSha256,
            )
        } finally {
            bitmap.recycle()
        }
    }

    private fun observeView(
        root: View,
        view: View,
        path: String,
        privateViews: MutableList<View>,
    ): JSONObject {
        if (ArchitectObservationPrivacy.isPrivateText(view)) {
            privateViews += view
        }

        val bounds = boundsInRoot(root, view)
        val node =
            JSONObject()
                .put("path", path)
                .put("class", view.javaClass.name)
                .put("visibility", visibilityLabel(view.visibility))
                .put("enabled", view.isEnabled)
                .put("clickable", view.isClickable)
                .put("focusable", view.isFocusable)
                .put("alpha", view.alpha.toDouble())
                .put(
                    "boundsPx",
                    JSONObject()
                        .put("left", bounds.left)
                        .put("top", bounds.top)
                        .put("right", bounds.right)
                        .put("bottom", bounds.bottom),
                )

        val resourceName = resourceName(view)
        if (resourceName != null) {
            node.put("resourceName", resourceName)
        }
        view.contentDescription?.toString()?.takeIf(String::isNotBlank)?.let {
            node.put("contentDescription", it)
        }

        if (view is TextView) {
            node.put("text", ArchitectObservationPrivacy.textForObservation(view))
            view.hint?.toString()?.takeIf(String::isNotBlank)?.let { hint ->
                node.put("hint", hint)
            }
            node.put("textSizePx", view.textSize.toDouble())
            if (view is EditText) {
                node.put("participantEditable", true)
            }
        }

        if (view is ViewGroup) {
            val children = JSONArray()
            for (index in 0 until view.childCount) {
                val child = view.getChildAt(index)
                children.put(
                    observeView(
                        root = root,
                        view = child,
                        path = "$path/$index:${child.javaClass.simpleName}",
                        privateViews = privateViews,
                    ),
                )
            }
            node.put("children", children)
        }

        return node
    }

    private fun redactPrivatePixels(
        canvas: Canvas,
        root: View,
        privateViews: List<View>,
    ) {
        val fill =
            Paint(Paint.ANTI_ALIAS_FLAG).apply {
                color = Color.rgb(24, 24, 24)
                style = Paint.Style.FILL
            }
        val label =
            Paint(Paint.ANTI_ALIAS_FLAG).apply {
                color = Color.LTGRAY
                textSize = 12.0f * context.resources.displayMetrics.scaledDensity
            }

        privateViews.forEach { view ->
            val rect = boundsInRoot(root, view)
            if (!rect.intersect(0, 0, root.width, root.height)) {
                return@forEach
            }
            canvas.drawRect(rect, fill)
            if (rect.width() >= 120 && rect.height() >= label.textSize + 8.0f) {
                canvas.drawText(
                    "private local content",
                    rect.left + 8.0f,
                    rect.centerY() - (label.ascent() + label.descent()) / 2.0f,
                    label,
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

    private fun resourceName(view: View): String? {
        if (view.id == View.NO_ID) {
            return null
        }
        return runCatching { context.resources.getResourceName(view.id) }.getOrNull()
    }

    private fun visibilityLabel(visibility: Int): String =
        when (visibility) {
            View.VISIBLE -> "visible"
            View.INVISIBLE -> "invisible"
            View.GONE -> "gone"
            else -> "unknown:$visibility"
        }

    private fun persistBitmap(
        bitmap: Bitmap,
        target: File,
    ) {
        val temporary = File(target.parentFile, ".${target.name}.tmp")
        FileOutputStream(temporary).use { output ->
            check(bitmap.compress(Bitmap.CompressFormat.PNG, 100, output)) {
                "Architect observation PNG encoding failed"
            }
            output.fd.sync()
        }
        replaceFile(temporary, target)
    }

    private fun persistText(
        content: String,
        target: File,
    ) {
        val temporary = File(target.parentFile, ".${target.name}.tmp")
        temporary.writeText(content, Charsets.UTF_8)
        replaceFile(temporary, target)
    }

    private fun replaceFile(
        temporary: File,
        target: File,
    ) {
        if (target.exists()) {
            check(target.delete()) { "Unable to replace ${target.name}" }
        }
        if (!temporary.renameTo(target)) {
            temporary.copyTo(target, overwrite = true)
            check(temporary.delete()) { "Unable to remove temporary ${temporary.name}" }
        }
    }

    private fun sha256(file: File): String {
        val digest = MessageDigest.getInstance("SHA-256")
        file.inputStream().buffered().use { input ->
            val buffer = ByteArray(DEFAULT_BUFFER_SIZE)
            while (true) {
                val count = input.read(buffer)
                if (count < 0) {
                    break
                }
                digest.update(buffer, 0, count)
            }
        }
        return digest.digest().joinToString(separator = "") { byte -> "%02x".format(byte) }
    }

    private companion object {
        const val OBSERVATION_DIRECTORY = "architect/observation"
        const val IMAGE_FILE_NAME = "latest.png"
        const val MANIFEST_FILE_NAME = "latest.json"
    }
}
