package org.arcanum.nativehost

import android.app.Activity
import android.os.Bundle
import org.arcanum.nativehost.geometry.ArcnetRendererView
import org.arcanum.nativehost.runtime.NativeRuntimeBridge
import org.arcanum.nativehost.runtime.TempusLifecycleCoordinator

class MainActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val bridgeLabel =
            runCatching { NativeRuntimeBridge.status() }
                .fold(
                    onSuccess = { status -> status.presentationLabel() },
                    onFailure = { "runtime bridge unavailable · authorityEffect=none" },
                )

        val lifecycleLabel =
            runCatching { TempusLifecycleCoordinator(this).resumeOrCapture() }
                .getOrElse {
                    "Tempus local unavailable · local only · authorityEffect=none"
                }

        setContentView(ArcnetRendererView(this, bridgeLabel, lifecycleLabel))
    }
}
