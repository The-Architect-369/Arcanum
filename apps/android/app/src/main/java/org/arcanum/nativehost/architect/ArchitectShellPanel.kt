package org.arcanum.nativehost.architect

import android.content.Context
import android.graphics.Color
import android.view.Gravity
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.TextView

/**
 * Minimal native Architect destination for CE-W04-A07.
 *
 * This is intentionally a shell surface only. It does not start a model, broker,
 * network request, repository mutation, or command execution. Later bounded
 * Architect capabilities can mount here without changing global navigation.
 */
class ArchitectShellPanel(context: Context) : LinearLayout(context) {
    init {
        orientation = VERTICAL
        gravity = Gravity.START
        setPadding(dp(20), dp(18), dp(20), dp(18))
        setBackgroundColor(Color.argb(232, 8, 8, 8))
        visibility = GONE

        addView(
            TextView(context).apply {
                text = "Architect"
                setTextColor(Color.WHITE)
                textSize = 28f
            },
            LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT,
            ),
        )

        addView(
            TextView(context).apply {
                text = "Seed Node Alpha · local Architect surface"
                setTextColor(Color.LTGRAY)
                textSize = 16f
                setPadding(0, dp(8), 0, 0)
            },
            LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT,
            ),
        )

        addView(
            TextView(context).apply {
                text =
                    "Presentation only · authorityEffect=none\n" +
                        "Bounded runtime and Termux broker actions will attach here in a later implementation arc."
                setTextColor(Color.GRAY)
                textSize = 14f
                setPadding(0, dp(14), 0, 0)
            },
            LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT,
            ),
        )
    }

    private fun dp(value: Int): Int =
        (value * resources.displayMetrics.density).toInt()
}
