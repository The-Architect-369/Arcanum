package org.arcanum.nativehost.architect

import android.app.AlertDialog
import android.content.Context
import android.graphics.Color
import android.view.Gravity
import android.view.ViewGroup
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView

/**
 * Native Architect destination for CE-W04-A09.
 *
 * A09 expands the Architect from one read-only inspection into a small fixed
 * Human-approved action registry. Every execution remains loopback-only,
 * registered, receipt-bearing, and non-shell-text.
 */
class ArchitectShellPanel(context: Context) : LinearLayout(context) {
    private val brokerClient = ArchitectBrokerClient()
    private val brokerStatus: TextView
    private val actionButton: Button

    init {
        orientation = VERTICAL
        gravity = Gravity.START
        setPadding(dp(20), dp(18), dp(20), dp(18))
        setBackgroundColor(Color.argb(232, 8, 8, 8))
        visibility = GONE

        addView(
            TextView(context).apply {
                text = "Architect"
                setTextColor(Color.WHITE)
                textSize = 28f
            },
            LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT,
            ),
        )

        addView(
            TextView(context).apply {
                text = "Seed Node Alpha · local Architect surface"
                setTextColor(Color.LTGRAY)
                textSize = 16f
                setPadding(0, dp(8), 0, 0)
            },
            LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT,
            ),
        )

        addView(
            TextView(context).apply {
                text =
                    "Human-approved local operations · authorityEffect=none\n" +
                        "A09 exposes a fixed bounded action registry through the loopback Termux broker."
                setTextColor(Color.GRAY)
                textSize = 14f
                setPadding(0, dp(14), 0, dp(14))
            },
            LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT,
            ),
        )

        actionButton =
            Button(context).apply {
                text = "Choose local action"
                setOnClickListener { chooseAction() }
            }
        addView(
            actionButton,
            LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT,
            ),
        )

        brokerStatus =
            TextView(context).apply {
                text =
                    "Broker idle.\n" +
                        "This surface cannot execute arbitrary shell commands, cannot mutate the repository, or contact a model provider."
                setTextColor(Color.LTGRAY)
                textSize = 13f
                setPadding(0, dp(14), 0, 0)
                setTextIsSelectable(true)
            }
        addView(
            brokerStatus,
            LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT,
            ),
        )
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
            .setPositiveButton("Run") { _, _ -> executeAction(action) }
            .show()
    }

    private fun executeAction(action: ArchitectBrokerClient.Action) {
        actionButton.isEnabled = false
        brokerStatus.text = "Running ${action.label.lowercase()} through local Termux broker…"

        Thread {
            val result = brokerClient.execute(action)
            post {
                actionButton.isEnabled = true
                brokerStatus.text =
                    result.fold(
                        onSuccess = { execution -> formatExecution(execution) },
                        onFailure = { error ->
                            "Local broker unavailable or Architect action failed.\n" +
                                "Start the repo-owned Termux broker, then try again.\n" +
                                "${error.message ?: error::class.java.simpleName}"
                        },
                    )
            }
        }.apply {
            name = "arcanum-architect-broker-${action.commandId}"
            isDaemon = true
            start()
        }
    }

    private fun formatExecution(execution: ArchitectBrokerClient.ExecutionResult): String =
        buildString {
            appendLine("Architect action passed · ${execution.action.label}")
            appendLine("branch=${execution.branch ?: "unknown"}")
            appendLine("commit=${execution.commit ?: "unknown"}")
            if (execution.stdout.isBlank()) {
                appendLine("result=(no output)")
            } else {
                appendLine("result:")
                appendLine(execution.stdout.trimEnd())
            }
            if (execution.stderr.isNotBlank()) {
                appendLine("stderr:")
                appendLine(execution.stderr.trimEnd())
            }
            execution.receiptId?.let { appendLine("receipt=$it") }
            execution.resultSha256?.let { append("resultSha256=$it") }
        }.trim()

    private fun dp(value: Int): Int =
        (value * resources.displayMetrics.density).toInt()
}