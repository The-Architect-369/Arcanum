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
import org.json.JSONObject

/**
 * Native Architect local development console for CE-W04-A11.
 *
 * A11 keeps the A09/A10 command ceiling intact while adding an authenticated,
 * Human-mediated native-client session boundary to the local Termux broker.
 */
class ArchitectShellPanel(context: Context) : LinearLayout(context) {
    private val brokerClient = ArchitectBrokerClient(context.applicationContext)
    private val operatorBridge = TermuxOperatorBridge(context.applicationContext)

    private val workspaceStatus: TextView
    private val workspaceButton: Button
    private val pairingStatus: TextView
    private val pairingButton: Button
    private val clearPairingButton: Button
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
                text = "Seed Node Alpha · local development console\nVerified A11 runtime session"
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
                setOnClickListener { requestPairingCode() }
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
        probeBroker()
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

    private fun refreshPairingState() {
        val paired = brokerClient.hasPairing()
        pairingStatus.text =
            if (paired) {
                "Native pairing · stored in app-private AndroidKeyStore-protected storage"
            } else {
                "Native pairing · required before authenticated Architect actions"
            }
        pairingButton.text =
            if (paired) {
                "Replace local pairing"
            } else {
                "Pair local broker"
            }
        clearPairingButton.visibility =
            if (paired) View.VISIBLE else View.GONE
    }

    private fun requestPairingCode() {
        val input =
            EditText(context).apply {
                hint = "64-character pairing code"
                inputType =
                    InputType.TYPE_CLASS_TEXT or
                    InputType.TYPE_TEXT_VARIATION_VISIBLE_PASSWORD
                isSingleLine = true
                setSelectAllOnFocus(true)
            }

        AlertDialog.Builder(context)
            .setTitle("Pair local Architect broker")
            .setMessage(
                "Start scripts/mobile/arcanum-broker.sh in Termux. " +
                    "Enter the 64-hex-character pairing code generated there. " +
                    "The decoded secret is encrypted at rest with AndroidKeyStore.",
            )
            .setView(input)
            .setNegativeButton("Cancel", null)
            .setPositiveButton("Pair") { _, _ ->
                runCatching {
                    brokerClient.pair(input.text.toString())
                }.fold(
                    onSuccess = {
                        refreshPairingState()
                        probeBroker()
                    },
                    onFailure = { error ->
                        brokerStatus.text =
                            "Pairing rejected · ${error.message ?: error::class.java.simpleName}"
                    },
                )
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
            requestPairingCode()
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
            requestPairingCode()
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

    private fun compactSha(value: String?): String = value?.take(12) ?: "unknown"
    private fun compactId(value: String?): String = value?.take(12) ?: "unknown"
    private fun dp(value: Int): Int = (value * resources.displayMetrics.density).toInt()
}
