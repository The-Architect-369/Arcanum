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
        gravity = Gravity.CENTER_VERTICAL
        setPadding(20, 12, 12, 12)

        addView(
            TextView(context).apply {
                setTextColor(Color.WHITE)
                textSize = 17.0f
                text =
                    when (launch) {
                        is NativeApplicationLaunch.Ready -> "Hope"
                        is NativeApplicationLaunch.Blocked -> "Hope unavailable"
                    }
                contentDescription =
                    when (launch) {
                        is NativeApplicationLaunch.Ready ->
                            "Hope is available locally and privately. Authority effect none."
                        is NativeApplicationLaunch.Blocked ->
                            "Hope is unavailable and fail-closed. Authority effect none."
                    }
            },
        )
    }
}
