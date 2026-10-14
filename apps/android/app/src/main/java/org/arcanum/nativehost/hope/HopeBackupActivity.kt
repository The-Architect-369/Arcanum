package org.arcanum.nativehost.hope

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.text.InputType
import android.view.View
import android.view.WindowManager
import android.widget.Button
import android.widget.CheckBox
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import org.arcanum.nativehost.architect.ArchitectObservationPrivacy
import java.util.concurrent.Executors

/** Participant-only screen. No private state, URI, or recovery material enters saved instance state. */
class HopeBackupActivity : Activity() {
    private lateinit var body: LinearLayout
    private lateinit var status: TextView
    private lateinit var code: EditText
    private val worker = Executors.newSingleThreadExecutor()
    private var busy = false
    private var sealed: HopeSealedBackup? = null
    private var selected: ByteArray? = null
    private var preview: HopeRestorePreview? = null
    private fun store() = HopeCollectionStore(filesDir, AndroidHopeKeyManager(), HopeRuntimeBridge.contract())

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.addFlags(WindowManager.LayoutParams.FLAG_SECURE)
        body = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; setPadding(24, 24, 24, 24) }
        setContentView(ScrollView(this).apply { addView(body) })
        home(if (savedInstanceState == null) "" else "Selection expired. Review the vault before starting again.")
    }

    private fun text(value: String, private: Boolean = false): TextView = TextView(this).apply {
        text = value; isSaveEnabled = false
        if (private) ArchitectObservationPrivacy.markPrivateText(this)
        body.addView(this)
    }
    private fun button(label: String, action: () -> Unit): Button = Button(this).apply {
        text = label; setOnClickListener { if (!busy) action() }; body.addView(this)
    }
    private fun codeField(value: String = "", editable: Boolean = true): EditText = EditText(this).apply {
        inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_VISIBLE_PASSWORD or InputType.TYPE_TEXT_FLAG_NO_SUGGESTIONS
        isSingleLine = false; isSaveEnabled = false
        importantForAutofill = View.IMPORTANT_FOR_AUTOFILL_NO_EXCLUDE_DESCENDANTS
        ArchitectObservationPrivacy.markPrivateText(this)
        setText(value); isFocusableInTouchMode = editable; isFocusable = editable
        // No automatic copy or password-manager persistence.
        isLongClickable = false; setTextIsSelectable(false)
        body.addView(this)
    }
    private fun clearPrivate() {
        if (::code.isInitialized) code.text.clear()
        sealed?.encryptedBytes?.fill(0); sealed = null
        selected?.fill(0); selected = null
        preview?.close(); preview = null
    }
    private fun home(message: String = "") {
        clearPrivate(); body.removeAllViews()
        text("Hope backup and restore")
        text("Save an encrypted copy manually. Keep its recovery code separately. Both are required to restore. No automatic upload.")
        status = text(message)
        button("Prepare encrypted backup") {
            work({ store().exportBackup() }) { backup ->
                sealed = backup; body.removeAllViews()
                text("This backup includes all retained active and archived reflections, original receipts and deletion records. Archived reflections remain archived.")
                text("It captures the collection at preparation time. Later changes are not included. Save this recovery code separately from the backup file.")
                code = codeField(backup.recoveryCode, false)
                val acknowledged = CheckBox(this).apply { text = "I saved the recovery code separately"; body.addView(this) }
                status = text("")
                button("Choose backup destination") {
                    if (!acknowledged.isChecked) { status.text = "Save the recovery code separately first."; return@button }
                    launch(Intent(Intent.ACTION_CREATE_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE)
                        .setType("application/octet-stream").putExtra(Intent.EXTRA_TITLE, "Hope.hopebackup")
                        .putExtra(Intent.EXTRA_LOCAL_ONLY, true), EXPORT)
                }
                button("Cancel") { home("Backup cancelled. No file written.") }
            }
        }
        button("Select backup to restore") {
            launch(Intent(Intent.ACTION_OPEN_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE)
                .setType("application/octet-stream").putExtra(Intent.EXTRA_LOCAL_ONLY, true), IMPORT)
        }
        button("Finish interrupted restore") {
            work({ store().finishInterruptedRestore() }) { home("Stored restore verified and finalized. No backup was replayed.") }
        }
        button("Back to Hope") { finish() }
    }
    private fun launch(intent: Intent, request: Int) {
        try { @Suppress("DEPRECATION") startActivityForResult(intent, request) }
        catch (_: Exception) { home("Document selection unavailable. Vault unchanged.") }
    }

    @Deprecated("Platform document picker result for API 26 and later")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode != EXPORT && requestCode != IMPORT) return
        val uri = data?.data
        if (resultCode != RESULT_OK || uri == null) { home("Document selection cancelled. Vault unchanged."); return }
        if (requestCode == EXPORT) {
            val bytes = sealed?.encryptedBytes?.copyOf() ?: run { home("Backup selection expired. Prepare a new backup."); return }
            work({
                try {
                    HopeBackupPayload.writeVerified(bytes,
                        { contentResolver.openOutputStream(uri, "wt") },
                        { contentResolver.openInputStream(uri) })
                } finally { bytes.fill(0) }
            }) { home("Encrypted backup written and read back successfully. Keep the separately saved recovery code.") }
        } else {
            work({ contentResolver.openInputStream(uri)?.use(HopeBackupPayload::readBounded) ?: throw HopeBackupFormatException() }, HopeBackupReadFailure::message) { bytes ->
                clearPrivate(); selected = bytes; body.removeAllViews()
                text("Enter the separately saved recovery code. Validation will not write to the vault.")
                code = codeField()
                status = text("")
                button("Validate backup") {
                    val recovery = code.text.toString(); code.text.clear()
                    val encrypted = selected?.copyOf() ?: return@button
                    work({ try { store().previewBackup(encrypted, recovery) } finally { encrypted.fill(0) } }) { validated ->
                        preview?.close(); preview = validated; selected?.fill(0); selected = null
                        body.removeAllViews()
                        text("Backup validated", true)
                        text("${validated.activeCount} active; ${validated.archivedCount} archived", true)
                        text("An older backup can contain reflections deleted later. Restore requires a new, uninitialized vault. Existing vaults, including empty initialized vaults, will be preserved.")
                        status = text("")
                        button("Confirm restore into new vault") {
                            work({ store().restoreBackup(validated, true) }) { home("Restore verified under this device’s key. Archived reflections remain archived.") }
                        }
                        button("Cancel restore") { home("Restore cancelled. Vault unchanged.") }
                    }
                }
                button("Cancel") { home("Restore cancelled. Vault unchanged.") }
            }
        }
    }

    private fun <T> work(action: () -> T, readFailure: ((Throwable) -> String)? = null, success: (T) -> Unit) {
        if (busy) return
        busy = true; status.text = "Working…"
        worker.execute {
            val result = runCatching(action)
            runOnUiThread {
                busy = false
                if (isDestroyed) {
                    (result.getOrNull() as? HopeRestorePreview)?.close()
                    (result.getOrNull() as? HopeSealedBackup)?.encryptedBytes?.fill(0)
                    return@runOnUiThread
                }
                result.fold(success, { error ->
                    status.text = readFailure?.invoke(error) ?: when (error) {
                        is HopeRestoreRefusedException -> "Restore refused: existing or unresolved vault state. Nothing was replaced."
                        is HopeKeyUnavailableException -> "Device key unavailable. Data preserved."
                        else -> "Operation could not be verified. Existing data is preserved. A partial export may remain at the chosen destination. For an interrupted restore, use Finish interrupted restore; never reset the vault."
                    }
                })
            }
        }
    }
    @Deprecated("Back navigation is guarded while storage is in progress")
    override fun onBackPressed() { if (!busy) { clearPrivate(); super.onBackPressed() } }
    override fun onDestroy() { clearPrivate(); worker.shutdown(); super.onDestroy() }
    companion object { private const val EXPORT = 731; private const val IMPORT = 732 }
}
