package org.arcanum.nativehost

import android.app.Activity
import android.os.Bundle
import org.arcanum.nativehost.geometry.ArcnetRendererView
import org.arcanum.nativehost.runtime.NativeRuntimeBridge

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
    }
}
