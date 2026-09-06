package org.arcanum.nativehost.application

import android.content.Context
import android.graphics.Color
import android.view.Gravity
import android.widget.LinearLayout
import android.widget.TextView

class ArcanumLaunchPanel(
    context: Context,
    launch: NativeApplicationLaunch,
) : LinearLayout(context) {
    init {
        orientation = VERTICAL
        gravity = Gravity.CENTER_HORIZONTAL
        setPadding(24, 24, 24, 24)

        addView(
            TextView(context).apply {
                setTextColor(Color.WHITE)
                textSize = 14.0f
                text =
                    when (launch) {
                        is NativeApplicationLaunch.Ready ->
                            "Arcanum · Hope · local/private · authorityEffect=none"
                        is NativeApplicationLaunch.Blocked ->
                            "Arcanum · Hope unavailable · fail-closed · authorityEffect=none"
                    }
            },
        )
    }
}
