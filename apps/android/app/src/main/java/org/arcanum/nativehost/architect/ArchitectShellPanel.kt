package org.arcanum.nativehost.architect

import android.app.AlertDialog
import android.content.Context
import android.graphics.Color
import android.text.InputType
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.EditText
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import org.arcanum.nativehost.BuildConfig
import org.json.JSONObject
import java.io.File
import java.security.MessageDigest

/**
 * Native Architect local development console through CE-W04-A13.5.
 *
 * A13.5 closes the native mobile operator UX and installed-artifact handoff without
 * adding a Termux operation, broker action, repository mutation path, or autonomous effect.
 */
class ArchitectShellPanel(context: Context) : LinearLayout(context) {
    private val appContext = context.applicationContext
    private val brokerClient = ArchitectBrokerClient(appContext)
    private val operatorBridge = TermuxOperatorBridge(context.applicationContext)

    private val handoffStatus: TextView
    private val workspaceStatus: TextView
    private val workspaceButton: Button
    private val verificationStatus: TextView
    private val verifyWorkspaceButton: Button
    private val pairingStatus: TextView
    private val pairingButton: Button
    private val clearPairingButton: Button
    private val startBrokerButton: Button
    private val stopBrokerButton: Button
    private val probeButton: Button
    private val actionButton: Button
    private val proposalButton: Button
    private val brokerStatus: TextView
    private val executionSummary: TextView
    private val executionProvenance: TextView
    private val rawOutputButton: Button
    private val rawOutput: TextView

    private var rawOutputVisible = false
    private var rawOutputLabel = "raw output · broker-bounded"

    init {
        orientation = VERTICAL
        setBackgroundColor(Color.argb(244, 8, 8, 8))
        visibility = GONE

        val scroll =
            ScrollView(context).apply {
                isFillViewport = true
                overScrollMode = OVER_SCROLL_IF_CONTENT_SCROLLS
            }

        val content =
            LinearLayout(context).apply {
                orientation = VERTICAL
                gravity = Gravity.START
                setPadding(dp(20), dp(18), dp(20), dp(28))
            }

        content.addView(
            TextView(context).apply {
                text = "Architect"
                setTextColor(Color.WHITE)
                textSize = 28f
            },
            LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT,
            ),
        )

        content.addView(
            TextView(context).apply {
                text =
                    "Seed Node Alpha · local development console\n" +
                        "CE-W04-A13.5 native operator handoff\n" +
                        "Verified A11 runtime session"
                setTextColor(Color.LTGRAY)
                textSize = 16f
                setPadding(0, dp(8), 0, 0)
            },
        )

        content.addView(
            TextView(context).apply {
                text =
                    "Human-approved local operations · authorityEffect=none\n" +
                        "A11 authenticates exact-byte requests and responses to one broker " +
                        "session, repository, branch, and target HEAD without widening the " +
                        "registered action set."
                setTextColor(Color.GRAY)
                textSize = 14f
                setPadding(0, dp(14), 0, dp(14))
            },
        )

        handoffStatus =
            TextView(context).apply {
                text =
                    "A13.5 artifact handoff · awaiting installed application receipt\n" +
                        "arc=${BuildConfig.ARCANUM_IMPLEMENTATION_ARC} · " +
                        "version=${BuildConfig.VERSION_NAME} (${BuildConfig.VERSION_CODE})\n" +
                        "authorityEffect=none · repositoryMutation=false"
                setTextColor(Color.LTGRAY)
                textSize = 13f
                setTextIsSelectable(true)
                setPadding(0, 0, 0, dp(14))
            }
        content.addView(handoffStatus)

        workspaceStatus =
            TextView(context).apply {
                text =
                    "A13.1 workspace · not checked\n" +
                        "Human-confirmed probe only · authorityEffect=none"
                setTextColor(Color.LTGRAY)
                textSize = 13f
                setTextIsSelectable(true)
                setPadding(0, 0, 0, dp(8))
            }
        content.addView(workspaceStatus)

        workspaceButton =
            Button(context).apply {
                text = "Connect local workspace"
                setOnClickListener { requestWorkspaceProbe() }
            }
        content.addView(
            workspaceButton,
            LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT,
            ),
        )

        verificationStatus =
            TextView(context).apply {
                text =
                    "A13.4 workspace verification · not run\n" +
                        "Human-confirmed canonical verify-sync only · authorityEffect=none"
                setTextColor(Color.LTGRAY)
                textSize = 13f
                setTextIsSelectable(true)
                setPadding(0, dp(14), 0, dp(8))
            }
        content.addView(verificationStatus)

        verifyWorkspaceButton =
            Button(context).apply {
                text = "Verify local workspace"
                setOnClickListener { requestWorkspaceVerification() }
            }
        content.addView(
            verifyWorkspaceButton,
            LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT,
            ),
        )

        pairingStatus =
            TextView(context).apply {
                setTextColor(Color.LTGRAY)
                textSize = 13f
                setTextIsSelectable(true)
                setPadding(0, dp(14), 0, dp(8))
            }
        content.addView(pairingStatus)

        pairingButton =
            Button(context).apply {
                setOnClickListener { requestNativePairing() }
            }
        content.addView(
            pairingButton,
            LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT,
            ),
        )

        clearPairingButton =
            Button(context).apply {
                text = "Clear local pairing"
                setOnClickListener { requestClearPairing() }
            }
        content.addView(
            clearPairingButton,
            LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT,
            ).apply {
                topMargin = dp(6)
            },
        )

        brokerStatus =
            TextView(context).apply {
                text =
                    "Broker status · not checked\n" +
                        "Transport remains compile-time loopback 127.0.0.1:8765."
                setTextColor(Color.LTGRAY)
                textSize = 13f
                setTextIsSelectable(true)
                setPadding(0, dp(14), 0, dp(10))
            }

        content.addView(
            brokerStatus,
            LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT,
            ),
        )

        startBrokerButton =
            Button(context).apply {
                text = "Start local broker"
                setOnClickListener { requestBrokerStart() }
            }
        content.addView(
            startBrokerButton,
            LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT,
            ),
        )

        stopBrokerButton =
            Button(context).apply {
                text = "Stop local broker"
                setOnClickListener { requestBrokerStop() }
            }
        content.addView(
            stopBrokerButton,
            LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT,
            ).apply {
                topMargin = dp(6)
            },
        )

        probeButton =
            Button(context).apply {
                text = "Check local broker"
                setOnClickListener { probeBroker() }
            }

        content.addView(
            probeButton,
            LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT,
            ),
        )

        actionButton =
            Button(context).apply {
                text = "Choose local action"
                setOnClickListener { chooseAction() }
            }

        content.addView(
            actionButton,
            LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT,
            ).apply {
                topMargin = dp(8)
            },
        )

        proposalButton =
            Button(context).apply {
                text = "Review proposal envelope"
                setOnClickListener { requestProposalEnvelope() }
            }

        content.addView(
            proposalButton,
            LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT,
            ).apply {
                topMargin = dp(8)
            },
        )

        executionSummary =
            TextView(context).apply {
                text = "No Architect action has run in this console session."
                setTextColor(Color.WHITE)
                textSize = 15f
                setTextIsSelectable(true)
                setPadding(0, dp(18), 0, dp(6))
            }

        content.addView(
            executionSummary,
            LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT,
            ),
        )

        executionProvenance =
            TextView(context).apply {
                text =
                    "Execution provenance appears here after a Human-approved authenticated registered action."
                setTextColor(Color.LTGRAY)
                textSize = 12f
                setTextIsSelectable(true)
            }

        content.addView(
            executionProvenance,
            LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT,
            ),
        )

        rawOutputButton =
            Button(context).apply {
                text = "Show raw output · broker-bounded"
                visibility = GONE
                setOnClickListener { toggleRawOutput() }
            }

        content.addView(
            rawOutputButton,
            LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT,
            ).apply {
                topMargin = dp(12)
            },
        )

        rawOutput =
            TextView(context).apply {
                text = ""
                visibility = GONE
                setTextColor(Color.LTGRAY)
                textSize = 12f
                setTextIsSelectable(true)
                setPadding(0, dp(10), 0, dp(10))
            }

        content.addView(
            rawOutput,
            LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT,
            ),
        )

        content.addView(
            TextView(context).apply {
                text =
                    "Capability ceiling · no arbitrary shell · no repository mutation · " +
                        "no autonomous approval · no model provider"
                setTextColor(Color.GRAY)
                textSize = 11f
                setPadding(0, dp(18), 0, 0)
            },
        )

        scroll.addView(
            content,
            FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT,
            ),
        )

        addView(
            scroll,
            LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT,
            ),
        )

        refreshPairingState()
    }

    fun onPresented() {
        visibility = VISIBLE
        refreshPairingState()
        refreshArtifactHandoff()
        probeBroker()
    }

    private fun refreshArtifactHandoff() {
        handoffStatus.text =
            "A13.5 artifact handoff · inspecting installed application…\n" +
                "authorityEffect=none · repositoryMutation=false"

        Thread {
            val receipt =
                runCatching {
                    require(BuildConfig.ARCANUM_IMPLEMENTATION_ARC == "CE-W04-A13.5") {
                        "installed implementation arc is not CE-W04-A13.5"
                    }
                    require(BuildConfig.VERSION_NAME == "0.1.13-cew04-a13-5") {
                        "installed versionName is not the A13.5 closure build"
                    }
                    require(BuildConfig.VERSION_CODE == 18) {
                        "installed versionCode is not 18"
                    }

                    val source = BuildConfig.ARCANUM_SOURCE_COMMIT
                    require(Regex("^[0-9a-f]{40}$").matches(source)) {
                        "installed source commit is not exact-head bound"
                    }

                    val installedApk = File(appContext.applicationInfo.sourceDir)
                    require(installedApk.isFile) {
                        "installed APK path is unavailable"
                    }
                    val installedApkSha256 = sha256File(installedApk)

                    buildString {
                        appendLine("A13.5 artifact handoff · PASS")
                        appendLine("arc=${BuildConfig.ARCANUM_IMPLEMENTATION_ARC}")
                        appendLine("version=${BuildConfig.VERSION_NAME} (${BuildConfig.VERSION_CODE})")
                        appendLine("source=$source")
                        appendLine("installedApkSha256=$installedApkSha256")
                        appendLine("operatorRegistry=5 fixed native operations")
                        append("authorityEffect=none · repositoryMutation=false")
                    }
                }

            post {
                handoffStatus.text =
                    receipt.fold(
                        onSuccess = { it },
                        onFailure = { error ->
                            "A13.5 artifact handoff · FAIL\n" +
                                (error.message ?: error::class.java.simpleName) +
                                "\nauthorityEffect=none · repositoryMutation=false"
                        },
                    )
            }
        }.apply {
            name = "arcanum-a13-5-artifact-handoff"
            isDaemon = true
            start()
        }
    }

    private fun requestWorkspaceProbe() {
        AlertDialog.Builder(context)
            .setTitle("Run read-only workspace probe?")
            .setMessage(
                "A13.1 will ask Termux to run one fixed repository-owned probe at " +
                    "~/Arcanum/scripts/mobile/arcanum-operator.sh. " +
                    "It reads repository identity, branch, HEAD, cleanliness, and legacy checkout presence. " +
                    "It cannot apply changes, commit, push, merge, or run arbitrary shell text.",
            )
            .setNegativeButton("Cancel", null)
            .setPositiveButton("Probe") { _, _ ->
                workspaceButton.isEnabled = false
                workspaceStatus.text = "A13.1 workspace · probing canonical ~/Arcanum…"

                operatorBridge.probeWorkspace { result ->
                    post {
                        workspaceButton.isEnabled = true
                        workspaceStatus.text =
                            result.fold(
                                onSuccess = { probe ->
                                    buildString {
                                        appendLine("A13.1 workspace · connected")
                                        appendLine("repository=${probe.repositoryId}")
                                        appendLine("branch=${probe.branch}")
                                        appendLine("commit=${compactSha(probe.head)}")
                                        appendLine(
                                            "workingTree=${if (probe.clean) "clean" else "local changes present"}",
                                        )
                                        if (probe.legacyWorkspacePresent) {
                                            appendLine(
                                                "Legacy checkout detected · " +
                                                    "${probe.legacyWorkspacePath ?: "~/work/Arcanum"}",
                                            )
                                            appendLine(
                                                "legacyBranch=${probe.legacyWorkspaceBranch ?: "unknown"} · " +
                                                    "legacyHead=${compactSha(probe.legacyWorkspaceHead)}",
                                            )
                                        }
                                        append("authorityEffect=none · repositoryMutation=false")
                                    }
                                },
                                onFailure = { error ->
                                    "A13.1 workspace probe unavailable · ${error.message ?: error::class.java.simpleName}\n" +
                                        "One-time setup may be required: run scripts/mobile/arcanum-operator-setup.sh " +
                                        "in Termux and grant Arcanum the 'Run commands in Termux environment' permission."
                                },
                            )
                    }
                }
            }
            .show()
    }

    private fun requestWorkspaceVerification() {
        AlertDialog.Builder(context)
            .setTitle("Run canonical workspace verification?")
            .setMessage(
                "A13.4 will ask Termux to run only the fixed verify_workspace operation. " +
                    "It requires a clean canonical ~/Arcanum checkout, runs only repository-owned " +
                    "scripts/verify-sync.sh, writes one private 0600 log outside the repository, " +
                    "then revalidates origin, branch, HEAD, and cleanliness. It does not require " +
                    "the broker or pairing and cannot stage, commit, push, merge, apply a proposal, " +
                    "or run caller-supplied shell text.",
            )
            .setNegativeButton("Cancel", null)
            .setPositiveButton("Verify workspace") { _, _ ->
                verifyWorkspaceButton.isEnabled = false
                verificationStatus.text =
                    "A13.4 workspace verification · running canonical verify-sync…"

                operatorBridge.verifyWorkspace { result ->
                    post {
                        verifyWorkspaceButton.isEnabled = true
                        verificationStatus.text =
                            result.fold(
                                onSuccess = { verification ->
                                    buildString {
                                        appendLine(
                                            "A13.4 workspace verification · " +
                                                verification.status.uppercase(),
                                        )
                                        appendLine("repository=${verification.repositoryId}")
                                        appendLine("branch=${verification.branch ?: "unknown"}")
                                        appendLine("commit=${compactSha(verification.head)}")
                                        appendLine(
                                            "checks=${verification.passedChecks ?: 0}/" +
                                                "${verification.totalChecks} · " +
                                                "exit=${verification.verifyExitCode ?: "not-run"} · " +
                                                "${verification.durationMs}ms",
                                        )
                                        appendLine(
                                            "cleanBefore=${verification.cleanBefore} · " +
                                                "cleanAfter=${verification.cleanAfter}",
                                        )
                                        appendLine(
                                            "logSha256=${compactSha(verification.logSha256)} · " +
                                                verification.logPath,
                                        )
                                        verification.reason?.let { reason ->
                                            appendLine("reason=$reason")
                                        }
                                        appendLine("runtimeEffect=${verification.runtimeEffect}")
                                        append(
                                            "authorityEffect=none · " +
                                                "repositoryMutation=${verification.repositoryMutation}",
                                        )
                                    }
                                },
                                onFailure = { error ->
                                    "A13.4 workspace verification unavailable · " +
                                        (error.message ?: error::class.java.simpleName)
                                },
                            )
                    }
                }
            }
            .show()
    }

    private fun refreshPairingState() {
        val paired = brokerClient.hasPairing()
        pairingStatus.text =
            if (paired) {
                "A13.2 native pairing · stored in app-private AndroidKeyStore-protected storage"
            } else {
                "A13.2 native pairing · not established"
            }
        pairingButton.text =
            if (paired) {
                "Replace native pairing"
            } else {
                "Pair native client"
            }
        clearPairingButton.visibility =
            if (paired) View.VISIBLE else View.GONE
    }

    private fun requestNativePairing() {
        val replacing = brokerClient.hasPairing()

        AlertDialog.Builder(context)
            .setTitle(
                if (replacing) {
                    "Replace native pairing from Termux?"
                } else {
                    "Pair native client from Termux?"
                },
            )
            .setMessage(
                "A13.2 will ask Termux to run the fixed pair_native_client operation. " +
                    "Termux may create or reuse only ~/.config/arcanum/architect-broker.secret, " +
                    "then return that pairing material through the app-private one-shot result channel. " +
                    "The pairing code is never displayed or copied by the Human and is encrypted at rest " +
                    "with AndroidKeyStore. This does not start the broker, mutate the repository, " +
                    "or grant arbitrary shell authority.",
            )
            .setNegativeButton("Cancel", null)
            .setPositiveButton(if (replacing) "Replace pairing" else "Pair") { _, _ ->
                pairingButton.isEnabled = false
                pairingStatus.text = "A13.2 native pairing · requesting fixed Termux operation…"

                operatorBridge.pairNativeClient { result ->
                    post {
                        pairingButton.isEnabled = true
                        result.fold(
                            onSuccess = { pairing ->
                                runCatching {
                                    brokerClient.pair(pairing.pairingCode)
                                }.fold(
                                    onSuccess = {
                                        refreshPairingState()
                                        pairingStatus.text =
                                            buildString {
                                                appendLine("A13.2 native pairing · connected")
                                                appendLine("repository=${pairing.repositoryId}")
                                                appendLine("branch=${pairing.branch}")
                                                appendLine("commit=${compactSha(pairing.head)}")
                                                appendLine(
                                                    "secret=${if (pairing.secretCreated) "created" else "reused"} · " +
                                                        pairing.pairingSecretPath,
                                                )
                                                append("authorityEffect=none · repositoryMutation=false")
                                            }
                                        brokerStatus.text =
                                            "Native pairing transferred securely. " +
                                                "Broker start/stop requires a separate explicit A13.3 Human confirmation."
                                    },
                                    onFailure = { error ->
                                        pairingStatus.text =
                                            "A13.2 pairing storage rejected · " +
                                                (error.message ?: error::class.java.simpleName)
                                    },
                                )
                            },
                            onFailure = { error ->
                                pairingStatus.text =
                                    "A13.2 native pairing unavailable · " +
                                        (error.message ?: error::class.java.simpleName)
                            },
                        )
                    }
                }
            }
            .show()
    }

    private fun requestClearPairing() {
        AlertDialog.Builder(context)
            .setTitle("Clear local Architect pairing?")
            .setMessage(
                "This removes only the native app's local pairing material. " +
                    "It does not modify the repository or Termux broker secret.",
            )
            .setNegativeButton("Cancel", null)
            .setPositiveButton("Clear") { _, _ ->
                brokerClient.clearPairing()
                refreshPairingState()
                brokerStatus.text = "Native pairing cleared."
            }
            .show()
    }

    private fun requestBrokerStart() {
        if (!brokerClient.hasPairing()) {
            brokerStatus.text =
                "A13.3 broker start requires native pairing first. Pairing will not auto-start the broker."
            requestNativePairing()
            return
        }

        AlertDialog.Builder(context)
            .setTitle("Start local broker?")
            .setMessage(
                "A13.3 will ask Termux to run only the fixed start_broker operation. " +
                    "It validates the canonical workspace and private pairing secret, then starts only " +
                    "~/Arcanum/scripts/architect/termux-broker.py on fixed loopback 127.0.0.1:8765. " +
                    "Starting the broker does not approve any broker action; A11 still requires separate " +
                    "authenticated Human approval for each registered action. No repository mutation or " +
                    "arbitrary shell authority is granted.",
            )
            .setNegativeButton("Cancel", null)
            .setPositiveButton("Start broker") { _, _ ->
                startBrokerButton.isEnabled = false
                stopBrokerButton.isEnabled = false
                probeButton.isEnabled = false
                brokerStatus.text = "A13.3 broker lifecycle · starting owned local broker…"

                operatorBridge.startBroker { result ->
                    post {
                        startBrokerButton.isEnabled = true
                        stopBrokerButton.isEnabled = true
                        probeButton.isEnabled = true
                        brokerStatus.text =
                            result.fold(
                                onSuccess = { lifecycle ->
                                    buildString {
                                        appendLine("A13.3 broker lifecycle · ${lifecycle.brokerState}")
                                        appendLine("branch=${lifecycle.branch}")
                                        appendLine("commit=${compactSha(lifecycle.head)}")
                                        appendLine(
                                            "session=${compactId(lifecycle.brokerSessionId)} · " +
                                                "pid=${lifecycle.brokerPid ?: "none"} · " +
                                                "port=${lifecycle.brokerPort}",
                                        )
                                        appendLine("runtimeEffect=${lifecycle.runtimeEffect}")
                                        append("authorityEffect=none · repositoryMutation=false")
                                    }
                                },
                                onFailure = { error ->
                                    "A13.3 broker start failed closed · " +
                                        (error.message ?: error::class.java.simpleName)
                                },
                            )
                    }
                }
            }
            .show()
    }

    private fun requestBrokerStop() {
        AlertDialog.Builder(context)
            .setTitle("Stop local broker?")
            .setMessage(
                "A13.3 will ask Termux to run only the fixed stop_broker operation. " +
                    "It may signal only the process whose PID, /proc start time, and exact broker argv " +
                    "match the private A13.3 lifecycle state. An unowned process on port 8765 is never " +
                    "signaled. This does not mutate the repository or clear native pairing.",
            )
            .setNegativeButton("Cancel", null)
            .setPositiveButton("Stop broker") { _, _ ->
                startBrokerButton.isEnabled = false
                stopBrokerButton.isEnabled = false
                probeButton.isEnabled = false
                brokerStatus.text = "A13.3 broker lifecycle · stopping owned local broker…"

                operatorBridge.stopBroker { result ->
                    post {
                        startBrokerButton.isEnabled = true
                        stopBrokerButton.isEnabled = true
                        probeButton.isEnabled = true
                        brokerStatus.text =
                            result.fold(
                                onSuccess = { lifecycle ->
                                    buildString {
                                        appendLine("A13.3 broker lifecycle · ${lifecycle.brokerState}")
                                        appendLine("branch=${lifecycle.branch}")
                                        appendLine("commit=${compactSha(lifecycle.head)}")
                                        appendLine(
                                            "session=${compactId(lifecycle.brokerSessionId)} · " +
                                                "pid=${lifecycle.brokerPid ?: "none"} · " +
                                                "port=${lifecycle.brokerPort}",
                                        )
                                        appendLine("runtimeEffect=${lifecycle.runtimeEffect}")
                                        append("authorityEffect=none · repositoryMutation=false")
                                    }
                                },
                                onFailure = { error ->
                                    "A13.3 broker stop failed closed · " +
                                        (error.message ?: error::class.java.simpleName)
                                },
                            )
                    }
                }
            }
            .show()
    }

    private fun probeBroker() {
        probeButton.isEnabled = false
        brokerStatus.text =
            "Broker status · checking authenticated session at 127.0.0.1:8765…"

        Thread {
            val result = brokerClient.probe()

            post {
                probeButton.isEnabled = true
                refreshPairingState()

                brokerStatus.text =
                    result.fold(
                        onSuccess = { status ->
                            buildString {
                                appendLine(
                                    if (status.authenticated) {
                                        "Broker ready · authenticated A11 session"
                                    } else {
                                        "Broker ready · pairing required"
                                    },
                                )
                                appendLine("branch=${status.branch ?: "unknown"}")
                                appendLine("commit=${compactSha(status.commit)}")
                                appendLine("session=${compactId(status.sessionId)}")
                                append("${status.registeredActionCount} registered broker action(s)")
                            }
                        },
                        onFailure = { error ->
                            "Broker unavailable or authentication rejected · ${
                                error.message ?: error::class.java.simpleName
                            }\nStart/inspect the repo-owned Termux broker, pairing, and active branch."
                        },
                    )
            }
        }.apply {
            name = "arcanum-architect-broker-probe"
            isDaemon = true
            start()
        }
    }

    private fun chooseAction() {
        if (!brokerClient.hasPairing()) {
            requestNativePairing()
            return
        }

        val actions = ArchitectBrokerClient.Action.entries

        AlertDialog.Builder(context)
            .setTitle("Architect local actions")
            .setItems(actions.map { it.label }.toTypedArray()) { _, which ->
                requestApproval(actions[which])
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun requestProposalEnvelope() {
        if (!brokerClient.hasPairing()) {
            requestNativePairing()
            return
        }

        val input =
            EditText(context).apply {
                hint = "Paste CE-W04-A12 proposal envelope JSON"
                inputType =
                    InputType.TYPE_CLASS_TEXT or
                    InputType.TYPE_TEXT_FLAG_MULTI_LINE
                gravity = Gravity.TOP
                minLines = 10
                setHorizontallyScrolling(false)
            }

        AlertDialog.Builder(context)
            .setTitle("Review proposal envelope")
            .setMessage(
                "Paste one deterministic CE-W04-A12 proposal envelope. " +
                    "The next native dialog will show the exact permitted paths for Human scope confirmation. " +
                    "Review never applies the candidate.",
            )
            .setView(input)
            .setNegativeButton("Cancel", null)
            .setPositiveButton("Continue") { _, _ ->
                runCatching {
                    val proposal = JSONObject(input.text.toString())
                    require(proposal.optString("schemaVersion") == "1.0") {
                        "Proposal schemaVersion must be 1.0"
                    }
                    require(proposal.optString("envelopeType") == "architect_proposal") {
                        "Envelope type must be architect_proposal"
                    }
                    val permittedArray =
                        proposal.optJSONArray("permittedPaths")
                            ?: error("Proposal permittedPaths are missing")
                    val permitted =
                        (0 until permittedArray.length()).map { index ->
                            permittedArray.getString(index)
                        }
                    require(permitted.isNotEmpty()) {
                        "Proposal permittedPaths must not be empty"
                    }
                    confirmProposalScope(proposal, permitted)
                }.onFailure { error ->
                    executionSummary.text = "REJECTED · proposal envelope"
                    executionProvenance.text =
                        error.message ?: error::class.java.simpleName
                }
            }
            .show()
    }

    private fun confirmProposalScope(
        proposal: JSONObject,
        permittedPaths: List<String>,
    ) {
        val touchedArray = proposal.optJSONArray("touchedPaths")
        val touched =
            if (touchedArray == null) {
                emptyList()
            } else {
                (0 until touchedArray.length()).map { index -> touchedArray.optString(index) }
            }

        AlertDialog.Builder(context)
            .setTitle("Confirm proposal review scope?")
            .setMessage(
                buildString {
                    appendLine("Base: ${compactSha(proposal.optString("baseCommit"))}")
                    appendLine()
                    appendLine("Permitted review scope:")
                    permittedPaths.forEach { appendLine("• $it") }
                    appendLine()
                    appendLine("Candidate touches:")
                    if (touched.isEmpty()) {
                        appendLine("(none declared)")
                    } else {
                        touched.forEach { appendLine("• $it") }
                    }
                    appendLine()
                    append(
                        "This confirms only the exact file scope for read-only verification. " +
                            "It does not approve or apply the proposal, create a commit, push, merge, or deploy.",
                    )
                },
            )
            .setNegativeButton("Cancel", null)
            .setPositiveButton("Verify candidate") { _, _ ->
                reviewProposal(
                    proposal,
                    ArchitectBrokerClient.ProposalScope.now(permittedPaths),
                )
            }
            .show()
    }

    private fun reviewProposal(
        proposal: JSONObject,
        scope: ArchitectBrokerClient.ProposalScope,
    ) {
        proposalButton.isEnabled = false
        actionButton.isEnabled = false
        probeButton.isEnabled = false
        executionSummary.text = "Reviewing proposal candidate · no apply path"
        executionProvenance.text =
            "Awaiting authenticated exact-base verification receipt…"
        rawOutputVisible = false
        rawOutput.visibility = GONE
        rawOutputButton.visibility = GONE

        Thread {
            val result = brokerClient.reviewProposal(proposal, scope)

            post {
                proposalButton.isEnabled = true
                actionButton.isEnabled = true
                probeButton.isEnabled = true
                result.fold(
                    onSuccess = { review ->
                        presentProposalReview(proposal, review)
                    },
                    onFailure = { error ->
                        executionSummary.text = "REJECTED · proposal candidate"
                        executionProvenance.text =
                            "Authenticated A12 review failed closed. No candidate was applied.\n" +
                                (error.message ?: error::class.java.simpleName)
                        rawOutput.text = ""
                        rawOutput.visibility = GONE
                        rawOutputButton.visibility = GONE
                        rawOutputVisible = false
                    },
                )
            }
        }.apply {
            name = "arcanum-architect-proposal-review"
            isDaemon = true
            start()
        }
    }

    private fun presentProposalReview(
        proposal: JSONObject,
        review: ArchitectBrokerClient.ProposalReviewResult,
    ) {
        executionSummary.text = "Verified candidate · not approved · not applied"
        executionProvenance.text =
            buildString {
                appendLine("base=${compactSha(review.baseCommit)}")
                appendLine("headBefore=${compactSha(review.headBefore)}")
                appendLine("headAfter=${compactSha(review.headAfter)}")
                appendLine("scope=${review.scopeId ?: "unavailable"}")
                appendLine("touched=${review.touchedPaths.joinToString(", ")}")
                appendLine("request=${review.requestId ?: "unavailable"}")
                appendLine("receipt=${review.receiptId ?: "unavailable"}")
                appendLine("diffSha256=${review.diffSha256}")
                appendLine("proposalSha256=${review.proposalSha256}")
                appendLine("resultSha256=${review.resultSha256 ?: "unavailable"}")
                appendLine("responseSha256=${review.responseSha256}")
                append("authorityEffect=none · applied=false")
            }

        rawOutput.text = proposal.optString("unifiedDiff")
        rawOutputLabel = "proposal diff · read-only"
        rawOutputButton.visibility = View.VISIBLE
        rawOutputButton.text = "Show $rawOutputLabel"
    }

    private fun requestApproval(action: ArchitectBrokerClient.Action) {
        AlertDialog.Builder(context)
            .setTitle("Approve ${action.label.lowercase()}?")
            .setMessage(
                "${action.description}\n\n" +
                    "Registered action: ${action.commandId}\n" +
                    "Risk class: ${action.expectedRisk}\n" +
                    "Transport: 127.0.0.1 only\n" +
                    "Session: authenticated HMAC-SHA256\n\n" +
                    "This native dialog creates one signed approval assertion for this " +
                    "request. It does not grant arbitrary shell or repository mutation.",
            )
            .setNegativeButton("Cancel", null)
            .setPositiveButton("Run") { _, _ ->
                executeAction(
                    action,
                    ArchitectBrokerClient.HumanApproval.now(),
                )
            }
            .show()
    }

    private fun executeAction(
        action: ArchitectBrokerClient.Action,
        approval: ArchitectBrokerClient.HumanApproval,
    ) {
        actionButton.isEnabled = false
        proposalButton.isEnabled = false
        probeButton.isEnabled = false

        executionSummary.text =
            "Running · ${action.label}"
        executionProvenance.text =
            "Awaiting authenticated bounded execution receipt…"

        rawOutputVisible = false
        rawOutput.visibility = GONE
        rawOutputButton.visibility = GONE

        Thread {
            val result = brokerClient.execute(action, approval)

            post {
                actionButton.isEnabled = true
                proposalButton.isEnabled = true
                probeButton.isEnabled = true

                result.fold(
                    onSuccess = { execution ->
                        presentExecution(execution)
                    },
                    onFailure = { error ->
                        presentExecutionFailure(action, error)
                    },
                )
            }
        }.apply {
            name = "arcanum-architect-broker-${action.commandId}"
            isDaemon = true
            start()
        }
    }

    private fun presentExecution(execution: ArchitectBrokerClient.ExecutionResult) {
        executionSummary.text =
            buildString {
                appendLine("PASS · ${execution.action.label}")
                append("exit=${execution.exitCode}")
                execution.durationMs?.let { duration -> append(" · ${duration.toLong()}ms") }
                if (execution.stdoutTruncated || execution.stderrTruncated) {
                    append(" · broker output bounded")
                }
            }

        executionProvenance.text =
            buildString {
                appendLine("branch=${execution.branch ?: "unknown"}")
                appendLine("commit=${compactSha(execution.commit)}")
                appendLine("session=${compactId(execution.sessionId)}")
                appendLine("request=${execution.requestId ?: "unavailable"}")
                appendLine("approval=${execution.approvalId ?: "unavailable"}")
                appendLine("receipt=${execution.receiptId ?: "unavailable"}")
                appendLine("requestSha256=${execution.requestSha256 ?: "unavailable"}")
                appendLine("resultSha256=${execution.resultSha256 ?: "unavailable"}")
                append("responseSha256=${execution.responseSha256}")
            }

        rawOutput.text = formatRawExecution(execution)
        rawOutputLabel = "raw output · broker-bounded"
        rawOutputButton.visibility = View.VISIBLE
        rawOutputButton.text = "Show $rawOutputLabel"
    }

    private fun presentExecutionFailure(action: ArchitectBrokerClient.Action, error: Throwable) {
        executionSummary.text = "FAIL · ${action.label}"
        executionProvenance.text =
            "Authenticated Architect request was rejected or failed.\n" +
                "Inspect pairing, broker session, repository/HEAD binding, and receipt details.\n" +
                (error.message ?: error::class.java.simpleName)
        rawOutput.text = ""
        rawOutput.visibility = GONE
        rawOutputButton.visibility = GONE
        rawOutputVisible = false
    }

    private fun toggleRawOutput() {
        rawOutputVisible = !rawOutputVisible
        rawOutput.visibility = if (rawOutputVisible) View.VISIBLE else View.GONE
        rawOutputButton.text =
            if (rawOutputVisible) {
                "Hide $rawOutputLabel"
            } else {
                "Show $rawOutputLabel"
            }
    }

    private fun formatRawExecution(execution: ArchitectBrokerClient.ExecutionResult): String =
        buildString {
            appendLine("action=${execution.action.commandId}")
            appendLine("startedAt=${execution.startedAt ?: "unknown"}")
            appendLine("completedAt=${execution.completedAt ?: "unknown"}")
            if (execution.stdout.isBlank()) {
                appendLine()
                appendLine("stdout:")
                appendLine("(no output)")
            } else {
                appendLine()
                appendLine("stdout:")
                appendLine(execution.stdout.trimEnd())
            }
            if (execution.stderr.isNotBlank()) {
                appendLine()
                appendLine("stderr:")
                appendLine(execution.stderr.trimEnd())
            }
            if (execution.stdoutTruncated || execution.stderrTruncated) {
                appendLine()
                appendLine("Broker bounded one or more streams at its configured 256 KiB ceiling.")
            }
        }.trim()

    private fun sha256File(file: File): String {
        val digest = MessageDigest.getInstance("SHA-256")
        file.inputStream().use { input ->
            val buffer = ByteArray(64 * 1024)
            while (true) {
                val count = input.read(buffer)
                if (count < 0) {
                    break
                }
                if (count > 0) {
                    digest.update(buffer, 0, count)
                }
            }
        }
        return digest.digest().joinToString("") { byte ->
            "%02x".format(byte.toInt() and 0xff)
        }
    }

    private fun compactSha(value: String?): String = value?.take(12) ?: "unknown"
    private fun compactId(value: String?): String = value?.take(12) ?: "unknown"
    private fun dp(value: Int): Int = (value * resources.displayMetrics.density).toInt()
}
