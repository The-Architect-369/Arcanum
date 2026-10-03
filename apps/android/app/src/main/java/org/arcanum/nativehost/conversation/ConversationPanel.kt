package org.arcanum.nativehost.conversation

import android.app.AlertDialog
import android.content.Context
import android.text.InputType
import android.view.View
import android.view.WindowManager
import android.widget.*
import org.arcanum.nativehost.architect.ArchitectObservationPrivacy
import org.arcanum.nativehost.memory.*
import java.io.File

/** First A18 surface: one explicitly reviewed English request, no automatic history/context capture. */
class ConversationPanel(private val host: Context) {
    private val root = LinearLayout(host).apply { orientation = LinearLayout.VERTICAL; setPadding(24, 16, 24, 16) }
    private val status = TextView(host)
    private val token = EditText(host).apply { hint = "Private home gateway pairing key"; inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_PASSWORD }
    private val question = EditText(host).apply { hint = "Ask Architect in English"; minLines = 3; inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_FLAG_MULTI_LINE or InputType.TYPE_TEXT_FLAG_NO_SUGGESTIONS }
    private val evidence = LinearLayout(host).apply { orientation = LinearLayout.VERTICAL }
    private val answer = TextView(host)
    private val buttons = mutableListOf<Button>()
    private val selected = linkedSetOf<String>()
    private val memory = androidDevelopmentMemory(host)
    private val journal = ConversationJournal(File(host.noBackupFilesDir, "architect-conversation.v1"), AndroidMemoryKeyProvider("org.arcanum.architect.conversation-journal.v1"), ::syncMemoryDirectory)
    private var vault: MemoryVault? = null
    private var profile: ConversationProfile? = null
    private var latest: org.json.JSONObject? = null
    @Volatile private var active = false
    private val cancelled = java.util.concurrent.atomic.AtomicBoolean(false)
    private var credential = ""
    private var busy = false
    @Volatile private var client: ConversationClient? = null

    fun show() {
        root.addView(TextView(host).apply { text = "Architect · Conversation\nAsk about selected development evidence or explore an idea. Each request is reviewed separately. Answers are advisory text. Prior answers are not automatically sent or saved.\nConnection: this device's loopback port 18765, through the development tunnel to your home computer." })
        listOf(token, question, answer, status).forEach { privateView(it) }
        root.addView(token); root.addView(status)
        action("Connect and refresh selection") {
            work {
                val c = newClient()
                val p = c.profile(); val state = memory.inspect(); val last = journal.latest()
                root.post { if (active) { profile = p; vault = state.vault; latest = last; render() } }
                "Connected. Review the destination and exact contents before Send."
            }
        }
        root.addView(evidence); root.addView(question)
        action("Review request") { review() }
        action("Check previous request") {
            val last = latest ?: run { status.text = "No locally recorded request."; return@action }
            work {
                val result = newClient().status(last.getString("requestId"))
                require(result.getString("requestId") == last.getString("requestId"))
                if (!result.isNull("requestDigest")) require(result.getString("requestDigest") == last.getString("requestDigest"))
                "Original request: ${result.getString("state")}\nThis check does not resend or recover response text. Not recorded is an observation, not proof that a dispatch cannot still arrive."
            }
        }
        root.addView(Button(host).apply { text = "Stop waiting"; setOnClickListener { cancelled.set(true); client?.cancel(); status.text = "Stopped waiting. A dispatched model request may still complete. Check the original request; it has not been resent." } })
        root.addView(answer)
        val dialog = AlertDialog.Builder(host).setTitle("Architect").setView(ScrollView(host).apply { addView(root) }).setNegativeButton("Close", null).create()
        dialog.setOnDismissListener {
            active = false; cancelled.set(true); client?.cancel(); client = null; credential = ""; token.text.clear(); question.text.clear(); answer.text = ""; status.text = ""
            evidence.removeAllViews(); selected.clear(); vault = null; profile = null; latest = null
        }
        dialog.show(); dialog.window?.addFlags(WindowManager.LayoutParams.FLAG_SECURE); active = true
        status.text = "Disconnected. Local Arcanum features remain available without this connection."
    }
    private fun render() {
        evidence.removeAllViews(); selected.clear()
        val p = profile ?: return
        status.text = "${p.provider} · ${p.model}\nModel digest: ${p.digest}\n${p.retention}"
        vault?.records?.forEach { record ->
            evidence.addView(CheckBox(host).apply {
                text = "${record.kind} · ${record.evidence} · ${record.execution}\n${record.text}\nSource: ${record.source}"
                privateView(this)
                setOnCheckedChangeListener { _, checked -> if (checked) selected.add(record.id) else selected.remove(record.id) }
            })
        }
    }
    private fun review() {
        val p = profile ?: run { status.text = "Connect to inspect the destination first."; return }
        val draft = runCatching { ConversationDraft.prepare(p, question.text.toString(), vault, selected.toList()) }.getOrElse {
            status.text = "Review blocked. Check the selection, input budget, and sensitive content. Nothing sent."; return
        }
        val layout = LinearLayout(host).apply { orientation = LinearLayout.VERTICAL; setPadding(24, 12, 24, 12) }
        val text = TextView(host).apply {
            this.text = "Destination: ${p.provider} / ${p.model}\nDigest: ${p.digest}\nOne request, up to 512 output tokens, 60 seconds of model waiting; no retries or cloud fallback.\n\n${p.retention}\n\nFixed model instruction:\n${p.system}\n\nExact request:\n${draft.json}"
            privateView(this)
        }
        val consent = CheckBox(host).apply { this.text = "Send exactly this request to my home model. It contains no credentials or private Hope content. Retain encrypted request identity/hash metadata for recovery; retain no transcript." }
        layout.addView(text); layout.addView(consent)
        val dialog = AlertDialog.Builder(host).setTitle("Review disclosure").setView(ScrollView(host).apply { addView(layout) }).setNegativeButton("Cancel", null).setPositiveButton("Send", null).create()
        dialog.show(); dialog.window?.addFlags(WindowManager.LayoutParams.FLAG_SECURE)
        dialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener {
            if (!consent.isChecked) { consent.error = "Review and authorize this send"; return@setOnClickListener }
            dialog.dismiss()
            work {
                val c = newClient()
                draft.verifyFresh(memory.inspect().vault, c.profile())
                journal.record(draft, System.currentTimeMillis())
                val last = journal.latest()
                root.post { if (active) latest = last }
                val reply = c.send(draft)
                root.post { if (active) answer.text = "Architect · advisory response\n${reply.text}" + if (reply.truncated) "\n\nOutput budget reached." else "" }
                "Response received. No action was executed. The transcript clears when this surface closes."
            }
        }
    }
    private fun newClient(): ConversationClient {
        check(!cancelled.get() && active)
        return ConversationClient(credential).also {
            client = it
            if (cancelled.get() || !active) { it.cancel(); error("Cancelled") }
        }
    }
    private fun work(task: () -> String) {
        if (busy) return
        busy = true; cancelled.set(false); credential = token.text.toString().trim(); buttons.forEach { it.isEnabled = false }; token.isEnabled = false; question.isEnabled = false
        status.text = "Working…"
        Thread {
            val result = runCatching(task)
            root.post {
                busy = false; credential = ""; client = null
                if (!active) return@post
                buttons.forEach { it.isEnabled = true }; token.isEnabled = true; question.isEnabled = true
                status.text = result.getOrElse { "No verified response. If dispatch began, its outcome is unknown. Check the original request before deciding on another send; nothing is retried automatically." }
            }
        }.start()
    }
    private fun action(label: String, task: () -> Unit) { Button(host).also { it.text = label; it.setOnClickListener { task() }; buttons += it; root.addView(it) } }
    private fun privateView(view: TextView) {
        ArchitectObservationPrivacy.markPrivateText(view)
        view.importantForAutofill = View.IMPORTANT_FOR_AUTOFILL_NO_EXCLUDE_DESCENDANTS
        if (view is EditText) view.imeOptions = view.imeOptions or android.view.inputmethod.EditorInfo.IME_FLAG_NO_PERSONALIZED_LEARNING
    }
}
