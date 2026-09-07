package org.arcanum.nativehost.architect

import android.content.Context
import android.widget.Button

class ArchitectPulseButton(
    context: Context,
    onPulse: () -> Unit,
    onShare: () -> Unit,
) : Button(context) {
    init {
        text = "A"
        textSize = 16.0f
        setAllCaps(false)
        minWidth = 0
        minHeight = 0
        setPadding(0, 0, 0, 0)
        alpha = 0.78f
        contentDescription =
            "Architect pulse: tap to capture locally; touch and hold to share the latest privacy-redacted observation"
        setOnClickListener { onPulse() }
        setOnLongClickListener {
            onShare()
            true
        }
    }
}
