package org.arcanum.nativehost.memory

import android.app.AlertDialog
import android.content.Context
import android.text.InputType
import android.view.WindowManager
import android.widget.*
import org.arcanum.nativehost.architect.ArchitectObservationPrivacy

/** Explicit local retention and disclosure previews. No external context delivery. */
class DevelopmentMemoryPanel(private val host: Context) {
    private val store = androidDevelopmentMemory(host)
    private val content = LinearLayout(host).apply { orientation = LinearLayout.VERTICAL; setPadding(24, 16, 24, 16) }
    private val status = TextView(host)
    private val entries = LinearLayout(host).apply { orientation = LinearLayout.VERTICAL }
    private val buttons = mutableListOf<Button>()
    private var snapshot: MemoryInspection? = null
    private var active = false
    private val selected = linkedSetOf<String>()
    fun show() {
        content.addView(TextView(host).apply { text = "Development memory\nKeep selected notes, decisions, questions and evidence on this device. Hope stays separate. Nothing here sends data to a provider. Sources and statuses are retained claims; saving does not verify them." })
        content.addView(status)
        action("Set up protected memory") { confirm("Set up memory?", "Create a separate device encryption key and a no-backup memory store. No notes are imported.") { store.initialize(memoryId(), System.currentTimeMillis()) } }
        action("New development record") { editor() }
        action("Preview selected context") {
            val v = snapshot?.vault ?: return@action
            if (selected.isEmpty()) { message("Select records", "Choose the records you want to preview."); return@action }
            val ids = selected.toList()
            confirm("Preview selected records?", "Destination: this device only. Preview exactly ${ids.size} selected records, including their sources and evidence classes. This does not send them anywhere.") {
                val preview = store.preview(ids, v.generation, memoryId())
                content.post { if (active) message("Selected context · local only", preview.json) }
            }
        }
        action("Delete selected records") {
            val v = snapshot?.vault ?: return@action
            if (selected.isEmpty()) { message("Select records", "Choose records to delete."); return@action }
            val ids = selected.toList()
            confirm("Delete selected records?", "Remove ${ids.size} records and their text/source metadata from this store. Encrypted ID tombstones prevent the same records being saved again. This does not erase screenshots, copies outside the app or whole-device backups.") { store.delete(ids, v.generation, memoryId(), System.currentTimeMillis()) }
        }
        action("Reconcile pending save") { confirm("Reconcile original save?", "Validate the original encrypted transaction. If publication already happened, only complete its acknowledgment. No new record or external action is created.") { store.reconcile() } }
        action("Refresh memory") { refresh() }
        content.addView(entries)
        val dialog = AlertDialog.Builder(host).setTitle("Architect · Memory").setView(ScrollView(host).apply { addView(content) }).setNegativeButton("Close", null).create()
        dialog.setOnDismissListener { active = false; selected.clear(); snapshot = null; entries.removeAllViews(); status.text = "" }
        dialog.show(); dialog.window?.addFlags(WindowManager.LayoutParams.FLAG_SECURE); active = true; refresh()
    }
    private fun editor() {
        val v = snapshot?.vault ?: return
        val form = LinearLayout(host).apply { orientation = LinearLayout.VERTICAL; setPadding(24, 12, 24, 12) }
        val kind = Spinner(host).apply { adapter = ArrayAdapter(host, android.R.layout.simple_spinner_dropdown_item, MemoryKind.values().map { it.name }) }
        val evidence = Spinner(host).apply { adapter = ArrayAdapter(host, android.R.layout.simple_spinner_dropdown_item, EvidenceClass.values().map { it.name }) }
        val execution = Spinner(host).apply { adapter = ArrayAdapter(host, android.R.layout.simple_spinner_dropdown_item, ExecutionClaim.values().map { it.name }) }
        val body = EditText(host).apply { hint = "Development note or selected evidence"; minLines = 3; inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_FLAG_MULTI_LINE or InputType.TYPE_TEXT_FLAG_NO_SUGGESTIONS }
        val source = EditText(host).apply { hint = "Source reference (required)"; setText("human:manual-development-note"); inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_FLAG_NO_SUGGESTIONS }
        val revision = EditText(host).apply { hint = "Exact source revision (optional)"; inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_FLAG_NO_SUGGESTIONS }
        val consent = CheckBox(host).apply { text = "I reviewed this selection. Retain it as development memory. It contains no credentials or private Hope/Journey content." }
        listOf(kind, evidence, execution, body, source, revision, consent).forEach { form.addView(it) }
        listOf(body, source, revision).forEach {
            ArchitectObservationPrivacy.markPrivateText(it)
            it.importantForAutofill = android.view.View.IMPORTANT_FOR_AUTOFILL_NO_EXCLUDE_DESCENDANTS
            it.imeOptions = it.imeOptions or android.view.inputmethod.EditorInfo.IME_FLAG_NO_PERSONALIZED_LEARNING
        }
        val dialog = AlertDialog.Builder(host).setTitle("New development record").setView(ScrollView(host).apply { addView(form) }).setNegativeButton("Cancel", null).setPositiveButton("Review save", null).create()
        dialog.setOnDismissListener { body.text.clear(); source.text.clear(); revision.text.clear() }
        dialog.show(); dialog.window?.addFlags(WindowManager.LayoutParams.FLAG_SECURE)
        dialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener {
            if (!consent.isChecked) { consent.error = "Review and explicitly authorize retention"; return@setOnClickListener }
            val operation = memoryId(); val at = System.currentTimeMillis()
            val r = DevelopmentRecord(memoryId(), MemoryKind.values()[kind.selectedItemPosition], body.text.toString().trim(), source.text.toString().trim(), revision.text.toString().trim().ifEmpty { null },
                EvidenceClass.values()[evidence.selectedItemPosition], ExecutionClaim.values()[execution.selectedItemPosition], null, at, operation)
            if (runCatching { r.validate() }.isFailure) { body.error = "Check size, source and prohibited sensitive material"; return@setOnClickListener }
            confirm("Save this record?", "${r.kind} · ${r.evidence} · ${r.execution}\nSource: ${r.source}\n\n${r.text}\n\nEncrypted local retention only.") {
                val confirmedAt = System.currentTimeMillis()
                store.retain(r.copy(recordedAt = confirmedAt), v.generation, operation, confirmedAt)
                content.post { dialog.dismiss() }
            }
        }
    }
    private fun action(label: String, task: () -> Unit) { Button(host).also { it.text = label; it.setOnClickListener { task() }; buttons += it; content.addView(it) } }
    private fun confirm(title: String, text: String, task: () -> Any?) {
        val dialog = AlertDialog.Builder(host).setTitle(title).setMessage(text).setNegativeButton("Cancel", null).setPositiveButton("Confirm") { _, _ -> work { task(); snapshot = store.inspect() } }.create()
        dialog.show(); dialog.window?.addFlags(WindowManager.LayoutParams.FLAG_SECURE)
        dialog.findViewById<TextView>(android.R.id.message)?.let { ArchitectObservationPrivacy.markPrivateText(it) }
    }
    private fun message(title: String, text: String) {
        val dialog = AlertDialog.Builder(host).setTitle(title).setMessage(text).setPositiveButton("Close", null).create()
        dialog.show(); dialog.window?.addFlags(WindowManager.LayoutParams.FLAG_SECURE)
        dialog.findViewById<TextView>(android.R.id.message)?.let { ArchitectObservationPrivacy.markPrivateText(it) }
    }
    private fun refresh() = work { snapshot = store.inspect() }
    private fun work(task: () -> Unit) {
        buttons.forEach { it.isEnabled = false }; entries.removeAllViews(); status.text = "Checking local memory…"
        Thread {
            val result = runCatching(task)
            content.post {
                if (!active) return@post
                selected.clear(); entries.removeAllViews()
                if (result.isFailure) { snapshot = null; status.text = "Memory unavailable or interrupted. Original evidence retained. Refresh before any retry."; buttons.last().isEnabled = true }
                else render()
            }
        }.start()
    }
    private fun render() {
        val s = snapshot ?: return
        val v = s.vault
        status.text = "State: ${s.phase}\nRecords: ${v?.records?.size ?: "unavailable"} · Deleted IDs: ${v?.deleted?.size ?: "unavailable"}\nGeneration: ${v?.generation ?: "unknown"}"
        buttons[0].isEnabled = s.phase in listOf(MemoryPhase.NOT_INITIALIZED, MemoryPhase.SETUP_PENDING)
        for (i in 1..3) buttons[i].isEnabled = s.phase == MemoryPhase.READY
        buttons[4].isEnabled = s.phase == MemoryPhase.WRITE_PENDING
        buttons[5].isEnabled = true
        v?.records?.forEach { r ->
            entries.addView(CheckBox(host).apply {
                text = "${r.kind} · ${r.evidence} · ${r.execution}\n${r.text}\nSource: ${r.source}\nRecorded: ${java.time.Instant.ofEpochMilli(r.recordedAt)}"
                ArchitectObservationPrivacy.markPrivateText(this)
                setOnCheckedChangeListener { _, checked -> if (checked) selected.add(r.id) else selected.remove(r.id) }
            })
        }
    }
}
