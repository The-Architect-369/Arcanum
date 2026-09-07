package org.arcanum.nativehost

import android.app.Activity
import android.os.Bundle
import android.view.Gravity
import android.view.ViewGroup
import android.widget.FrameLayout
import android.widget.Toast
import org.arcanum.nativehost.application.ArcanumLaunchPanel
import org.arcanum.nativehost.application.NativeApplicationLaunch
import org.arcanum.nativehost.application.NativeApplicationRegistry
import org.arcanum.nativehost.architect.ArchitectObserver
import org.arcanum.nativehost.architect.ArchitectPulseButton
import org.arcanum.nativehost.geometry.ArcnetRendererView
import org.arcanum.nativehost.hope.HopeReflectionPanel
import org.arcanum.nativehost.runtime.NativeRuntimeBridge
import org.arcanum.nativehost.tempus.TempusLifecyclePanel

class MainActivity : Activity() {
    private lateinit var architectObserver: ArchitectObserver

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
        val applicationState =
            when (appLaunch) {
                is NativeApplicationLaunch.Ready -> "ready:${appLaunch.descriptor.appId}"
                is NativeApplicationLaunch.Blocked -> "blocked:${appLaunch.reason}"
            }

        architectObserver =
            ArchitectObserver(
                context = this,
                runtimeBridgeLabel = bridgeLabel,
                applicationState = applicationState,
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
            HopeReflectionPanel(this),
            FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT,
                Gravity.CENTER,
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
        addContentView(
            ArchitectPulseButton(this) {
                captureArchitectPulse(trigger = "human_pulse", announce = true)
            },
            FrameLayout.LayoutParams(dp(44), dp(44), Gravity.TOP or Gravity.END).apply {
                topMargin = dp(12)
                marginEnd = dp(12)
            },
        )

        window.decorView.post {
            captureArchitectPulse(trigger = "initial_render", announce = false)
        }
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus && ::architectObserver.isInitialized) {
            window.decorView.post {
                captureArchitectPulse(trigger = "window_focus", announce = false)
            }
        }
    }

    private fun captureArchitectPulse(
        trigger: String,
        announce: Boolean,
    ) {
        val result =
            runCatching {
                architectObserver.capture(
                    root = window.decorView.rootView,
                    trigger = trigger,
                )
            }
        if (!announce) {
            return
        }
        result.fold(
            onSuccess = { observation ->
                Toast.makeText(
                    this,
                    "Architect pulse captured locally · ${observation.redactedViewCount} private region(s) protected",
                    Toast.LENGTH_SHORT,
                ).show()
            },
            onFailure = { failure ->
                Toast.makeText(
                    this,
                    "Architect pulse unavailable · ${failure.message ?: failure::class.java.simpleName}",
                    Toast.LENGTH_SHORT,
                ).show()
            },
        )
    }

    private fun dp(value: Int): Int =
        (value * resources.displayMetrics.density).toInt()
}
