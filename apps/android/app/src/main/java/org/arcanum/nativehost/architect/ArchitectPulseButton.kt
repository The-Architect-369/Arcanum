package org.arcanum.nativehost.architect

import android.app.Activity
import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Path
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import android.widget.PopupMenu
import org.arcanum.nativehost.hope.HopeReflectionPanel
import org.arcanum.nativehost.tempus.TempusLifecyclePanel

/**
 * CE-W04-A07 persistent Arcanum shell control.
 *
 * This preserves the inherited host mounting contract by replacing the temporary
 * "A" pulse presentation in place. The control is navigation/presentation only:
 * no model, network, broker, repository, or authority-bearing action is implied.
 */
class ArchitectPulseButton(
    context: Context,
    private val onPulse: () -> Unit,
    private val onShare: () -> Unit,
) : View(context) {
    private var architectPanel: ArchitectShellPanel? = null

    private val stroke =
        Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.WHITE
            style = Paint.Style.STROKE
            strokeWidth = dp(2.0f)
            strokeJoin = Paint.Join.ROUND
            strokeCap = Paint.Cap.ROUND
        }

    private val fill =
        Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.WHITE
            style = Paint.Style.FILL
        }

    init {
        isClickable = true
        isFocusable = true
        alpha = 0.92f
        contentDescription =
            "Arcanum menu. Tap for Hope, Architect, or local observation capture. Touch and hold to share a fresh privacy-redacted observation."
        setOnClickListener { showMenu() }
        setOnLongClickListener {
            onShare()
            true
        }
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        val w = width.toFloat()
        val h = height.toFloat()
        if (w <= 0f || h <= 0f) return

        // Monochrome reconstruction of the frozen Arcanum crest reference.
        val outer =
            Path().apply {
                moveTo(w * 0.18f, h * 0.84f)
                lineTo(w * 0.50f, h * 0.10f)
                lineTo(w * 0.82f, h * 0.84f)
                lineTo(w * 0.50f, h * 0.61f)
                close()
            }
        canvas.drawPath(outer, stroke)

        canvas.drawLine(w * 0.28f, h * 0.70f, w * 0.41f, h * 0.39f, stroke)
        canvas.drawLine(w * 0.72f, h * 0.70f, w * 0.59f, h * 0.39f, stroke)

        val star =
            Path().apply {
                moveTo(w * 0.50f, h * 0.23f)
                lineTo(w * 0.54f, h * 0.43f)
                lineTo(w * 0.67f, h * 0.47f)
                lineTo(w * 0.54f, h * 0.51f)
                lineTo(w * 0.50f, h * 0.67f)
                lineTo(w * 0.46f, h * 0.51f)
                lineTo(w * 0.33f, h * 0.47f)
                lineTo(w * 0.46f, h * 0.43f)
                close()
            }
        canvas.drawPath(star, fill)
    }

    private fun showMenu() {
        PopupMenu(context, this, Gravity.END).apply {
            menu.add(0, MENU_HOPE, 0, "Hope")
            menu.add(0, MENU_ARCHITECT, 1, "Architect")
            menu.add(0, MENU_CAPTURE, 2, "Capture observation")
            setOnMenuItemClickListener { item ->
                when (item.itemId) {
                    MENU_HOPE -> showHope()
                    MENU_ARCHITECT -> showArchitect()
                    MENU_CAPTURE -> onPulse()
                    else -> return@setOnMenuItemClickListener false
                }
                true
            }
            show()
        }
    }

    private fun showHope() {
        val activity = context as? Activity ?: return
        activity.findViews<HopeReflectionPanel>().forEach { it.visibility = VISIBLE }
        activity.findViews<TempusLifecyclePanel>().forEach { it.visibility = VISIBLE }
        architectPanel?.visibility = GONE
    }

    private fun showArchitect() {
        val activity = context as? Activity ?: return
        activity.findViews<HopeReflectionPanel>().forEach { it.visibility = GONE }
        activity.findViews<TempusLifecyclePanel>().forEach { it.visibility = GONE }

        val panel =
            architectPanel ?: ArchitectShellPanel(activity).also { created ->
                val content = activity.findViewById<FrameLayout>(android.R.id.content)
                val params =
                    FrameLayout.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.WRAP_CONTENT,
                        Gravity.CENTER,
                    ).apply {
                        leftMargin = dp(20f).toInt()
                        rightMargin = dp(20f).toInt()
                    }
                content.addView(created, params)
                architectPanel = created
            }
        panel.visibility = VISIBLE
    }

    private inline fun <reified T : View> Activity.findViews(): List<T> {
        val result = mutableListOf<T>()

        val pending = ArrayDeque<View>()
        pending.add(findViewById(android.R.id.content))

        while (pending.isNotEmpty()) {
            val view = pending.removeFirst()
            if (view is T) {
                result += view
            }
            if (view is ViewGroup) {
                for (index in 0 until view.childCount) {
                    pending.addLast(view.getChildAt(index))
                }
            }
        }

        return result
    }

    private fun dp(value: Float): Float = value * resources.displayMetrics.density

    private companion object {
        const val MENU_HOPE = 1
        const val MENU_ARCHITECT = 2
        const val MENU_CAPTURE = 3
    }
}
