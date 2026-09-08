package org.arcanum.nativehost

import android.app.Activity
import android.graphics.Color
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.view.WindowInsets
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.Toast
import org.arcanum.nativehost.application.ArcanumLaunchPanel
import org.arcanum.nativehost.application.NativeApplicationLaunch
import org.arcanum.nativehost.application.NativeApplicationRegistry
import org.arcanum.nativehost.architect.ArchitectObservationBridge
import org.arcanum.nativehost.architect.ArchitectObservationResult
import org.arcanum.nativehost.architect.ArchitectObserver
import org.arcanum.nativehost.architect.ArchitectPulseButton
import org.arcanum.nativehost.geometry.ArcnetRendererView
import org.arcanum.nativehost.hope.HopeReflectionPanel
import org.arcanum.nativehost.runtime.NativeRuntimeBridge
import org.arcanum.nativehost.tempus.TempusLifecyclePanel

class MainActivity : Activity() {
    private lateinit var architectObserver: ArchitectObserver
    private lateinit var architectBridge: ArchitectObservationBridge

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        window.statusBarColor = Color.BLACK
        window.navigationBarColor = Color.BLACK

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
        architectBridge = ArchitectObservationBridge(this)

        setContentView(ArcnetRendererView(this, bridgeLabel))

        val topBar =
            LinearLayout(this).apply {
                orientation = LinearLayout.HORIZONTAL
                gravity = Gravity.CENTER_VERTICAL
                setBackgroundColor(Color.argb(242, 0, 0, 0))
            }
        topBar.addView(
            ArcanumLaunchPanel(this, appLaunch),
            LinearLayout.LayoutParams(
                0,
                ViewGroup.LayoutParams.WRAP_CONTENT,
                1.0f,
            ),
        )
        topBar.addView(
            ArchitectPulseButton(
                context = this,
                onPulse = {
                    captureArchitectPulse(trigger = "human_pulse", announce = true)
                },
                onShare = {
                    shareArchitectPulse()
                },
            ),
            LinearLayout.LayoutParams(dp(48), dp(48)).apply {
                marginEnd = dp(12)
            },
        )
        val topBarParams =
            FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT,
                Gravity.TOP,
            )
        addContentView(topBar, topBarParams)

        val hopePanel = HopeReflectionPanel(this)
        val hopeParams =
            FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT,
                Gravity.CENTER,
            )
        addContentView(hopePanel, hopeParams)

        val tempusPanel = TempusLifecyclePanel(this)
        val tempusParams =
            FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT,
                Gravity.BOTTOM,
            )
        addContentView(tempusPanel, tempusParams)

        installInsetSafeLayout(
            topBar = topBar,
            topBarParams = topBarParams,
            hopePanel = hopePanel,
            hopeParams = hopeParams,
            tempusPanel = tempusPanel,
            tempusParams = tempusParams,
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

    private fun installInsetSafeLayout(
        topBar: View,
        topBarParams: FrameLayout.LayoutParams,
        hopePanel: View,
        hopeParams: FrameLayout.LayoutParams,
        tempusPanel: View,
        tempusParams: FrameLayout.LayoutParams,
    ) {
        val contentRoot = findViewById<View>(android.R.id.content)
        contentRoot.setOnApplyWindowInsetsListener { _, insets ->
            applySafeInsets(
                insets = insets,
                topBar = topBar,
                topBarParams = topBarParams,
                hopePanel = hopePanel,
                hopeParams = hopeParams,
                tempusPanel = tempusPanel,
                tempusParams = tempusParams,
            )
            insets
        }
        contentRoot.requestApplyInsets()
        contentRoot.post {
            contentRoot.rootWindowInsets?.let { insets ->
                applySafeInsets(
                    insets = insets,
                    topBar = topBar,
                    topBarParams = topBarParams,
                    hopePanel = hopePanel,
                    hopeParams = hopeParams,
                    tempusPanel = tempusPanel,
                    tempusParams = tempusParams,
                )
            }
        }
    }

    private fun applySafeInsets(
        insets: WindowInsets,
        topBar: View,
        topBarParams: FrameLayout.LayoutParams,
        hopePanel: View,
        hopeParams: FrameLayout.LayoutParams,
        tempusPanel: View,
        tempusParams: FrameLayout.LayoutParams,
    ) {
        val left = insets.systemWindowInsetLeft
        val top = insets.systemWindowInsetTop
        val right = insets.systemWindowInsetRight
        val bottom = insets.systemWindowInsetBottom

        topBarParams.leftMargin = left
        topBarParams.topMargin = top
        topBarParams.rightMargin = right
        topBar.layoutParams = topBarParams

        hopeParams.leftMargin = left
        hopeParams.topMargin = top
        hopeParams.rightMargin = right
        hopeParams.bottomMargin = bottom
        hopePanel.layoutParams = hopeParams

        tempusParams.leftMargin = left
        tempusParams.rightMargin = right
        tempusParams.bottomMargin = bottom
        tempusPanel.layoutParams = tempusParams
    }

    private fun captureArchitectPulse(
        trigger: String,
        announce: Boolean,
    ): ArchitectObservationResult? {
        val result =
            runCatching {
                architectObserver.capture(
                    root = window.decorView.rootView,
                    trigger = trigger,
                )
            }
        if (announce) {
            result.fold(
                onSuccess = { observation ->
                    Toast.makeText(
                        this,
                        "Architect pulse saved locally · ${observation.redactedViewCount} private region(s) protected · hold A to share",
                        Toast.LENGTH_LONG,
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
        return result.getOrNull()
    }

    private fun shareArchitectPulse() {
        val observation =
            captureArchitectPulse(
                trigger = "human_share",
                announce = false,
            )
        if (observation == null) {
            Toast.makeText(
                this,
                "Architect share unavailable · fresh local pulse could not be captured",
                Toast.LENGTH_SHORT,
            ).show()
            return
        }

        runCatching {
            architectBridge.share(observation)
        }.onFailure { failure ->
            Toast.makeText(
                this,
                "Architect share unavailable · ${failure.message ?: failure::class.java.simpleName}",
                Toast.LENGTH_SHORT,
            ).show()
        }
    }

    private fun dp(value: Int): Int =
        (value * resources.displayMetrics.density).toInt()
}
