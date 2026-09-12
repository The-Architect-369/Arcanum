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
 * Native Architect destination for CE-W04-A08.
 *
 * A08 attaches the first Human-approved operational capability: a read-only
 * repository inspection through the fixed-command local Termux broker.
 */
class ArchitectShellPanel(context: Context) : LinearLayout(context) {
    private val brokerClient = ArchitectBrokerClient()
    private val brokerStatus: TextView
    private val inspectButton: Button

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
                        "A08 permits one registered read-only action through the loopback Termux broker."
                setTextColor(Color.GRAY)
                textSize = 14f
                setPadding(0, dp(14), 0, dp(14))
            },
            LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT,
            ),
        )

        inspectButton =
            Button(context).apply {
                text = "Inspect local repository"
                setOnClickListener { requestRepositoryInspection() }
            }
        addView(
            inspectButton,
            LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT,
            ),
        )

        brokerStatus =
            TextView(context).apply {
                text =
                    "Broker idle.\n" +
                        "This surface cannot execute arbitrary shell commands, mutate the repository, or contact a model provider."
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

    private fun requestRepositoryInspection() {
        AlertDialog.Builder(context)
            .setTitle("Approve local inspection?")
            .setMessage(
                "Run the registered read-only git_status action through the Termux broker on 127.0.0.1? " +
                    "This action produces a broker receipt and cannot mutate the repository.",
            )
            .setNegativeButton("Cancel", null)
            .setPositiveButton("Run") { _, _ -> executeRepositoryInspection() }
            .show()
    }

    private fun executeRepositoryInspection() {
        inspectButton.isEnabled = false
        brokerStatus.text = "Connecting to local Termux broker…"

        Thread {
            val result = brokerClient.inspectRepository()
            post {
                inspectButton.isEnabled = true
                brokerStatus.text =
                    result.fold(
                        onSuccess = { inspection ->
                            buildString {
                                appendLine("Local repository inspection passed")
                                appendLine("branch=${inspection.branch ?: "unknown"}")
                                appendLine("commit=${inspection.commit ?: "unknown"}")
                                appendLine("working tree:")
                                appendLine(inspection.workingTree)
                                inspection.receiptId?.let { appendLine("receipt=$it") }
                                inspection.resultSha256?.let { append("resultSha256=$it") }
                            }.trim()
                        },
                        onFailure = { error ->
                            "Local broker unavailable or inspection failed.\n" +
                                "Start the repo-owned Termux broker, then try again.\n" +
                                "${error.message ?: error::class.java.simpleName}"
                        },
                    )
            }
        }.apply {
            name = "arcanum-architect-broker-inspection"
            isDaemon = true
            start()
        }
    }

    private fun dp(value: Int): Int =
        (value * resources.displayMetrics.density).toInt()
}
