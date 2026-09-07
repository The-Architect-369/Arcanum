package org.arcanum.nativehost.architect

import android.content.Context
import android.widget.Button

class ArchitectPulseButton(
    context: Context,
    onPulse: () -> Unit,
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
            "Architect pulse: capture a privacy-redacted local visual observation"
        setOnClickListener { onPulse() }
    }
}
