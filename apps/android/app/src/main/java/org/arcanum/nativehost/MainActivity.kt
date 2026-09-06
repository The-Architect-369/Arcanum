package org.arcanum.nativehost

import android.app.Activity
import android.os.Bundle
import android.view.Gravity
import android.view.ViewGroup
import android.widget.FrameLayout
import org.arcanum.nativehost.application.ArcanumLaunchPanel
import org.arcanum.nativehost.application.NativeApplicationLaunch
import org.arcanum.nativehost.application.NativeApplicationRegistry
import org.arcanum.nativehost.geometry.ArcnetRendererView
import org.arcanum.nativehost.runtime.NativeRuntimeBridge
import org.arcanum.nativehost.tempus.TempusLifecyclePanel

class MainActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val bridgeStatus = runCatching { NativeRuntimeBridge.status() }
        val bridgeLabel =
            bridgeStatus.fold(
                onSuccess = { status -> status.presentationLabel() },
                onFailure = { "runtime bridge unavailable · authorityEffect=none" },
            )
        val appLaunch =
            bridgeStatus.fold(
                onSuccess = { status -> NativeApplicationRegistry.launch(status) },
                onFailure = { NativeApplicationLaunch.Blocked("runtime_bridge_unavailable") },
            )

        setContentView(ArcnetRendererView(this, bridgeLabel))
        addContentView(
            ArcanumLaunchPanel(this, appLaunch),
            FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT,
                Gravity.TOP,
            ),
        )
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
