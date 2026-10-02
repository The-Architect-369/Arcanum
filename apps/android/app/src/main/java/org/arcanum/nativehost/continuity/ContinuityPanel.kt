package org.arcanum.nativehost.continuity

import android.app.AlertDialog
import android.content.Context
import android.widget.Button
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import java.io.File
import java.util.UUID
import org.arcanum.nativehost.architect.ArchitectObservationPrivacy

/** Synthetic-only surface; opening/refreshing performs observation, never enrollment or signing. */
class ContinuityPanel(private val host: Context) {
    private val layout = LinearLayout(host).apply { orientation = LinearLayout.VERTICAL; setPadding(24, 16, 24, 16) }
    private val status = TextView(host).also { ArchitectObservationPrivacy.markPrivateText(it) }
    private val actions = mutableListOf<Button>()
    private var manager: ContinuityCredentialManager? = null
    private var controller: ContinuityOperationController? = null
    private var state: ContinuityCredentialState? = null
    private var flow: ContinuityFlowState? = null
    private var active = false
    private lateinit var dialog: AlertDialog

    fun show() {
        layout.addView(TextView(host).apply {
            text = "Local continuity signs local records with a separate device credential. It grants no identity, permissions or rights. Hope does not require it.\n\nOnly this public test text is used here:\nA16 public synthetic qualification sample v1"
        })
        layout.addView(status)
        val provision = action("Provision local credential") {
            confirm("Provision local credential?", "Create a separate AndroidKeyStore signing key on this device. Private signing material stays here. This action does not register a global identity.") {
                managerOrFail().provision(it)
            }
        }
        val replace = action("Replace local credential") {
            val generation = state?.current?.generation ?: return@action
            confirm("Replace local credential?", "Create a new generation and retain the previous key. This records a discontinuity. Previous receipts remain verifiable with their original public keys.") {
                managerOrFail().replace(it, generation)
            }
        }
        val reconcile = action("Complete pending credential") {
            val pending = state?.pending ?: return@action
            val missing = state?.pendingKeyState == ContinuityPendingKeyState.MISSING
            confirm("Reconcile pending credential?", if (missing) "The provider observes this pending alias absent. Explicitly resume its original creation intent. An unavailable key is not treated as absent." else "Bind the already existing pending key to its original intent. No new key will be created.") {
                if (missing) managerOrFail().resumeAbsentPendingCreation(it, pending.generation)
                else managerOrFail().completePending(it, pending.generation)
            }
        }
        val record = action("Record signed public sample") {
            val generation = state?.current?.generation ?: return@action
            confirm("Record this public sample?", "Sign and save the displayed synthetic text as a local recording. Its original producer remains a public test fixture. No private reflection is selected or exported.") { controllerOrFail().createSample(false, generation, it.decidedAtMs) }
        }
        val adopt = action("Adopt public sample") {
            val generation = state?.current?.generation ?: return@action
            confirm("Adopt this public sample?", "Your confirmation will be recorded as a later local adoption of the displayed fixture, with its actual confirmation time. Original attribution stays with the fixture. This is not a claim of historical Human authorship or export consent.") { controllerOrFail().createSample(true, generation, it.decidedAtMs) }
        }
        val resume = action("Resume original unsigned sample") {
            confirm("Resume original operation?", "Continue the preserved operation only if no signing attempt was started. A missing signature acknowledgment does not authorize another signature.") { controllerOrFail().resumeUnsigned() }
        }
        val publish = action("Finish saving original signed sample") {
            confirm("Save the original signature?", "Verify and publish the existing staged receipt under its original operation ID. The original signature will be reused; this does not sign again.") { controllerOrFail().publishExisting() }
        }
        action("Refresh local state") { refresh() }
        dialog = AlertDialog.Builder(host).setTitle("Local continuity").setView(ScrollView(host).apply { addView(layout) }).setNegativeButton("Close", null).create()
        dialog.setOnDismissListener { active = false }
        dialog.show(); active = true
        work {
            val keyManager = ContinuityCredentialManager(AndroidContinuityCredentialStorage(host), AndroidContinuityKeyProvider())
            val port = ContinuityNativeBridge.port(File(host.noBackupFilesDir.canonicalFile, "continuity-synthetic.v1"))
            manager = keyManager
            controller = ContinuityOperationController(keyManager, port, ContinuityOperationJournal(AndroidContinuityCredentialStorage(host, ContinuityStorageSlot.OPERATIONS)))
            refreshState()
        }
        layout.setTag(RENDER_TAG, Runnable {
            val phase = state?.phase
            provision.isEnabled = phase == ContinuityCredentialPhase.NOT_PROVISIONED
            replace.isEnabled = phase in listOf(ContinuityCredentialPhase.READY, ContinuityCredentialPhase.MISSING_KEY, ContinuityCredentialPhase.INVALIDATED) && state?.pending == null
            reconcile.isEnabled = state?.pending != null && state?.pendingKeyState in listOf(ContinuityPendingKeyState.MISSING, ContinuityPendingKeyState.AVAILABLE)
            val ready = phase == ContinuityCredentialPhase.READY && flow?.phase in listOf(ContinuityFlowPhase.NO_SAMPLE, ContinuityFlowPhase.COMMITTED)
            record.isEnabled = ready; adopt.isEnabled = ready
            resume.isEnabled = phase == ContinuityCredentialPhase.READY && flow?.phase == ContinuityFlowPhase.UNSIGNED_PENDING
            publish.isEnabled = flow?.phase == ContinuityFlowPhase.PUBLICATION_PENDING
        })
    }
    private fun action(label: String, onClick: () -> Unit): Button = Button(host).apply {
        text = label; setOnClickListener { onClick() }; actions += this; this@ContinuityPanel.layout.addView(this)
    }
    private fun confirm(title: String, detail: String, action: (ContinuityDecision) -> Any?) {
        AlertDialog.Builder(host).setTitle(title).setMessage(detail).setNegativeButton("Cancel", null)
            .setPositiveButton("Confirm") { _, _ -> val confirmation = decision(); work { action(confirmation); refreshState() } }.show()
    }
    private fun refresh() = work { refreshState() }
    private fun refreshState() {
        state = managerOrFail().recover()
        flow = controllerOrFail().recover()
    }
    private fun work(action: () -> Unit) {
        actions.forEach { it.isEnabled = false }
        status.text = "Continuity · working locally…"
        Thread {
            val result = runCatching(action)
            layout.post {
                if (!active) return@post
                if (result.isFailure) {
                    status.text = "Continuity unavailable or interrupted. Evidence preserved. Refresh to reconcile the original operation."
                    actions.lastOrNull()?.isEnabled = true
                } else {
                    val current = state?.current
                    status.text = "Credential: ${state?.phase}\nSecurity observed at provisioning: ${current?.securityLevel ?: "unknown"}\nCredential generation: ${current?.generation ?: state?.pending?.generation ?: "none"}\nFingerprint: ${current?.fingerprint ?: "unknown"}\nSample: ${flow?.phase}\nReceipt generation: ${flow?.intent?.generation ?: "none"}\nSample operation: ${flow?.intent?.operationId ?: "none"}\nValid receipt signature does not establish content truth or permission."
                    (layout.getTag(RENDER_TAG) as? Runnable)?.run()
                    actions.lastOrNull()?.isEnabled = true
                }
            }
        }.start()
    }
    private fun managerOrFail() = manager ?: error("Credential manager unavailable")
    private fun controllerOrFail() = controller ?: error("Continuity JNI unavailable")
    private fun decision() = ContinuityDecision(UUID.randomUUID().toString(), System.currentTimeMillis())
    private companion object { const val RENDER_TAG = 0x7f0a0016 }
}
