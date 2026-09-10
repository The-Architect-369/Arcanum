package org.arcanum.nativehost.tempus

import android.content.Context
import android.graphics.Color
import android.view.Gravity
import android.view.View
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView

class TempusLifecyclePanel(context: Context) : LinearLayout(context) {
    private val preferences =
        context.getSharedPreferences(PREFERENCES_NAME, Context.MODE_PRIVATE)
    private val statusView =
        TextView(context).apply {
            setTextColor(Color.LTGRAY)
            textSize = 12.0f
            text = "Tempus · local"
        }
    private val receiptView =
        TextView(context).apply {
            setTextColor(Color.GRAY)
            textSize = 10.0f
            visibility = View.GONE
        }
    private val captureButton =
        Button(context).apply {
            text = "Capture Tempus"
            contentDescription = "Capture and persist a local Tempus system-clock anchor"
        }
    private var recoveryStarted = false

    init {
        orientation = HORIZONTAL
        gravity = Gravity.CENTER_VERTICAL
        setPadding(dp(16), dp(8), dp(16), dp(8))
        setBackgroundColor(Color.argb(232, 0, 0, 0))
        addView(statusView, LayoutParams(0, LayoutParams.WRAP_CONTENT, 1.0f))
        addView(captureButton, LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT))
        addView(receiptView, LayoutParams(0, 0))

        captureButton.setOnClickListener {
            launchOperation(
                workingLabel = "Tempus · capturing…",
                operation = { TempusLifecycleBridge.captureAndPersist(context.filesDir) },
                onSuccess = { presentation ->
                    preferences.edit().putString(LAST_ANCHOR_ID_KEY, presentation.anchorId).apply()
                    showPresentation(presentation)
                },
            )
        }
    }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        if (recoveryStarted) {
            return
        }
        recoveryStarted = true

        val lastAnchorId = preferences.getString(LAST_ANCHOR_ID_KEY, null)
        if (lastAnchorId.isNullOrBlank()) {
            statusView.text = "Tempus · no local anchor"
            return
        }

        launchOperation(
            workingLabel = "Tempus · recovering…",
            operation = { TempusLifecycleBridge.recover(context.filesDir, lastAnchorId) },
            onSuccess = ::showPresentation,
        )
    }

    private fun launchOperation(
        workingLabel: String,
        operation: () -> TempusLifecyclePresentation,
        onSuccess: (TempusLifecyclePresentation) -> Unit,
    ) {
        captureButton.isEnabled = false
        statusView.text = workingLabel

        Thread {
            val result = runCatching(operation)
            post {
                captureButton.isEnabled = true
                result.fold(
                    onSuccess = onSuccess,
                    onFailure = {
                        statusView.text = "Tempus · unavailable"
                        contentDescription = "Tempus lifecycle unavailable. Authority effect none."
                    },
                )
            }
        }.start()
    }

    private fun showPresentation(presentation: TempusLifecyclePresentation) {
        statusView.text =
            when (presentation.operation) {
                "capture-persist" -> "Tempus · captured"
                "recover" -> "Tempus · recovered"
                else -> "Tempus · local"
            }
        receiptView.text = presentation.receiptLabel()
        contentDescription = "${presentation.statusLabel()}. ${presentation.receiptLabel()}"
    }

    private fun dp(value: Int): Int =
        (value * resources.displayMetrics.density).toInt()

    private companion object {
        const val PREFERENCES_NAME = "arcanum-tempus-lifecycle"
        const val LAST_ANCHOR_ID_KEY = "last-anchor-id"
    }
}
