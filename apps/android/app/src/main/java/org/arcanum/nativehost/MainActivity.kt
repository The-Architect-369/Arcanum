package org.arcanum.nativehost

import android.app.Activity
import android.os.Bundle
import android.view.Gravity
import android.view.ViewGroup
import android.widget.FrameLayout
import org.arcanum.nativehost.geometry.ArcnetRendererView
import org.arcanum.nativehost.runtime.NativeRuntimeBridge
import org.arcanum.nativehost.tempus.TempusLifecyclePanel

class MainActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val bridgeLabel =
            runCatching { NativeRuntimeBridge.status() }
                .fold(
                    onSuccess = { status -> status.presentationLabel() },
                    onFailure = { "runtime bridge unavailable · authorityEffect=none" },
                )

        setContentView(ArcnetRendererView(this, bridgeLabel))
        addContentView(
            TempusLifecyclePanel(this),
            FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT,
                Gravity.BOTTOM,
            ),
        )
    }
}
