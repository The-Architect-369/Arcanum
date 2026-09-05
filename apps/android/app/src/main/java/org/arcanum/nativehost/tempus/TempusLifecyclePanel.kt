package org.arcanum.nativehost.tempus

import android.content.Context
import android.graphics.Color
import android.view.Gravity
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView

class TempusLifecyclePanel(context: Context) : LinearLayout(context) {
    private val preferences =
        context.getSharedPreferences(PREFERENCES_NAME, Context.MODE_PRIVATE)
    private val statusView =
        TextView(context).apply {
            setTextColor(Color.WHITE)
            textSize = 14.0f
            text = "Tempus · local lifecycle ready · authorityEffect=none"
        }
    private val receiptView =
        TextView(context).apply {
            setTextColor(Color.LTGRAY)
            textSize = 12.0f
            text = "No local Tempus anchor recovered yet"
        }
    private val captureButton =
        Button(context).apply {
            text = "Capture local Tempus"
            contentDescription = "Capture and persist a local Tempus system-clock anchor"
        }
    private var recoveryStarted = false

    init {
        orientation = VERTICAL
        gravity = Gravity.START
        setPadding(dp(16), dp(12), dp(16), dp(12))
        setBackgroundColor(Color.argb(220, 0, 0, 0))
        addView(statusView, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT))
        addView(receiptView, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT))
        addView(captureButton, LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT))

        captureButton.setOnClickListener {
            launchOperation(
                workingLabel = "Tempus · capturing factual local time…",
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
            receiptView.text = "No prior local Tempus anchor reference"
            return
        }

        launchOperation(
            workingLabel = "Tempus · recovering local anchor…",
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
                    onFailure = { failure ->
                        statusView.text = "Tempus lifecycle unavailable · authorityEffect=none"
                        receiptView.text =
                            failure.message ?: failure::class.java.simpleName
                    },
                )
            }
        }.start()
    }

    private fun showPresentation(presentation: TempusLifecyclePresentation) {
        statusView.text = presentation.statusLabel()
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
