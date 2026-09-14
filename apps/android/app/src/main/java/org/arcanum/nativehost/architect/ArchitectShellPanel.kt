package org.arcanum.nativehost.architect

import android.app.AlertDialog
import android.content.Context
import android.graphics.Color
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView

/**
 * Native Architect local development console for CE-W04-A10.
 *
 * A10 improves presentation and observability over the certified A09.2 execution
 * spine. It does not widen the registered command set, repository authority,
 * model authority, or loopback-only transport boundary.
 */
class ArchitectShellPanel(context: Context) : LinearLayout(context) {
    private val brokerClient = ArchitectBrokerClient()

    private val probeButton: Button
    private val actionButton: Button
    private val brokerStatus: TextView
    private val executionSummary: TextView
    private val executionProvenance: TextView
    private val rawOutputButton: Button
    private val rawOutput: TextView

    private var rawOutputVisible = false

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
                text = "Seed Node Alpha · local development console"
                setTextColor(Color.LTGRAY)
                textSize = 16f
                setPadding(0, dp(8), 0, 0)
            },
        )

        content.addView(
            TextView(context).apply {
                text =
                    "Human-approved local operations · authorityEffect=none\n" +
                        "A10 presents broker state, compact execution summaries, receipts, " +
                        "and opt-in raw output without widening A09.2 command authority."
                setTextColor(Color.GRAY)
                textSize = 14f
                setPadding(0, dp(14), 0, dp(14))
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
                setPadding(0, 0, 0, dp(10))
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
                    "Execution provenance appears here after a Human-approved registered action."
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
                text = "Show raw output"
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
    }

    fun onPresented() {
        visibility = VISIBLE
        probeBroker()
    }

    private fun probeBroker() {
        probeButton.isEnabled = false
        brokerStatus.text =
            "Broker status · checking 127.0.0.1:8765…"

        Thread {
            val result = brokerClient.probe()

            post {
                probeButton.isEnabled = true

                brokerStatus.text =
                    result.fold(
                        onSuccess = { status ->
                            buildString {
                                appendLine("Broker ready · local loopback")
                                appendLine("branch=${status.branch ?: "unknown"}")
                                appendLine("commit=${compactSha(status.commit)}")
                                append("${status.registeredActionCount} registered broker action(s)")
                            }
                        },
                        onFailure = { error ->
                            "Broker unavailable · ${
                                error.message ?: error::class.java.simpleName
                            }\nStart the repo-owned Termux broker, then check again."
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
        val actions = ArchitectBrokerClient.Action.entries

        AlertDialog.Builder(context)
            .setTitle("Architect local actions")
            .setItems(actions.map { it.label }.toTypedArray()) { _, which ->
                requestApproval(actions[which])
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun requestApproval(action: ArchitectBrokerClient.Action) {
        AlertDialog.Builder(context)
            .setTitle("Approve ${action.label.lowercase()}?")
            .setMessage(
                "${action.description}\n\n" +
                    "Registered action: ${action.commandId}\n" +
                    "Risk class: ${action.expectedRisk}\n" +
                    "Transport: 127.0.0.1 only\n\n" +
                    "This action produces a broker receipt and does not accept arbitrary shell text.",
            )
            .setNegativeButton("Cancel", null)
            .setPositiveButton("Run") { _, _ ->
                executeAction(action)
            }
            .show()
    }

    private fun executeAction(action: ArchitectBrokerClient.Action) {
        actionButton.isEnabled = false
        probeButton.isEnabled = false

        executionSummary.text =
            "Running · ${action.label}"
        executionProvenance.text =
            "Awaiting bounded execution receipt…"

        rawOutputVisible = false
        rawOutput.visibility = GONE
        rawOutputButton.visibility = GONE

        Thread {
            val result = brokerClient.execute(action)

            post {
                actionButton.isEnabled = true
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

    private fun presentExecution(
        execution: ArchitectBrokerClient.ExecutionResult,
    ) {
        executionSummary.text =
            buildString {
                appendLine("PASS · ${execution.action.label}")
                append("exit=${execution.exitCode}")

                execution.durationMs?.let { duration ->
                    append(" · ${duration.toLong()}ms")
                }

                if (execution.stdoutTruncated || execution.stderrTruncated) {
                    append(" · output bounded")
                }
            }

        executionProvenance.text =
            buildString {
                appendLine("branch=${execution.branch ?: "unknown"}")
                appendLine("commit=${compactSha(execution.commit)}")
                appendLine("receipt=${execution.receiptId ?: "unavailable"}")
                appendLine("requestSha256=${execution.requestSha256 ?: "unavailable"}")
                append("resultSha256=${execution.resultSha256 ?: "unavailable"}")
            }

        rawOutput.text =
            formatRawExecution(execution)

        rawOutputButton.visibility = View.VISIBLE
        rawOutputButton.text = "Show raw output"
    }

    private fun presentExecutionFailure(
        action: ArchitectBrokerClient.Action,
        error: Throwable,
    ) {
        executionSummary.text =
            "FAIL · ${action.label}"

        executionProvenance.text =
            "Registered Architect action failed.\n" +
                "Start or inspect the repo-owned Termux broker, then try again.\n" +
                (error.message ?: error::class.java.simpleName)

        rawOutput.text = ""
        rawOutput.visibility = GONE
        rawOutputButton.visibility = GONE
        rawOutputVisible = false
    }

    private fun toggleRawOutput() {
        rawOutputVisible = !rawOutputVisible
        rawOutput.visibility =
            if (rawOutputVisible) View.VISIBLE else View.GONE

        rawOutputButton.text =
            if (rawOutputVisible) {
                "Hide raw output"
            } else {
                "Show raw output"
            }
    }

    private fun formatRawExecution(
        execution: ArchitectBrokerClient.ExecutionResult,
    ): String =
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
        }.trim()

    private fun compactSha(value: String?): String =
        value?.take(12) ?: "unknown"

    private fun dp(value: Int): Int =
        (value * resources.displayMetrics.density).toInt()
}
