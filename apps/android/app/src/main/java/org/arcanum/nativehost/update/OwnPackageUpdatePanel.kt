package org.arcanum.nativehost.update

import android.app.AlertDialog
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.provider.Settings
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView

/** Explicit actions only; construction, refresh and permission return never submit an install. */
class OwnPackageUpdatePanel(context: Context) : LinearLayout(context) {
    private val appContext = context.applicationContext
    private val installer = OwnPackageInstaller(appContext)
    private var staged: OwnPackageDistribution.Staged? = null
    private val controls = mutableListOf<Button>()
    private val status = TextView(context).apply { setTextColor(Color.LTGRAY); setTextIsSelectable(true); text = "A15 update candidate · no action run" }
    private val manifest = EditText(context).apply { setTextColor(Color.WHITE); setSingleLine(); setText("https://updates.the-arcanum.net/updates/a14-2/manifest.json") }
    private val apk = EditText(context).apply { setTextColor(Color.WHITE); setSingleLine(); setText("https://updates.the-arcanum.net/updates/a14-2/arcanum-ce-w04-a14-2-d2e30b2.apk") }

    init {
        orientation = VERTICAL
        addView(TextView(context).apply { text = "Own-package update · A15 candidate"; setTextColor(Color.WHITE); textSize = 18f })
        addView(TextView(context).apply { text = "Inspect an exact update, review its identity, then confirm with Android. Existing version19 is a historical inspection target; it cannot advance a newer installation."; setTextColor(Color.GRAY) })
        addView(manifest); addView(apk); addView(status)
        button("Inspect and stage update") {
            val manifestUrl = manifest.text.toString()
            val apkUrl = apk.text.toString()
            AlertDialog.Builder(context).setTitle("Inspect this update?")
                .setMessage("Download these exact URLs to app-private staging. No installation occurs.\n$manifestUrl\n$apkUrl")
                .setNegativeButton("Cancel", null).setPositiveButton("Inspect") { _, _ ->
                    work {
                        require(installer.read() == null && appContext.packageManager.packageInstaller.mySessions.isEmpty()) { "Reconcile previous attempt first" }
                        staged = null
                        val distribution = OwnPackageDistribution(appContext)
                        val candidate = distribution.inspectAndStage(manifestUrl, apkUrl)
                        val prior = distribution.installedIdentity()
                        val decision = OwnPackageUpdatePolicy.decide(prior, candidate.inspection, distribution.inspectApk(candidate.file), System.currentTimeMillis(), OwnPackageUpdatePolicy.AttemptState.NONE)
                        if (decision == OwnPackageUpdatePolicy.Decision.READY_FOR_USER_CONFIRMATION) staged = candidate
                        "Inspection complete · ${decision.name}\nversion=${candidate.inspection.identity.versionCode}\nsha256=${candidate.inspection.identity.apkSha256}\nsigner=${candidate.inspection.identity.signerSha256}\nmanifestSha256=${candidate.manifestSha256}\ninstallPerformed=false"
                    }
                }.show()
        }
        button("Allow Android installation permission") {
            context.startActivity(Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:${appContext.packageName}")))
        }
        button("Review and request update") {
            val candidate = staged
            if (candidate == null) { status.text = "Inspect a fresh advancing candidate first" }
            else AlertDialog.Builder(context).setTitle("Request this own-package update?")
                .setMessage("Version ${candidate.inspection.identity.versionCode}\nSHA-256 ${candidate.inspection.identity.apkSha256}\nAndroid will ask you to confirm. This does not update Termux or grant control permissions.")
                .setNegativeButton("Cancel", null).setPositiveButton("Request update") { _, _ ->
                    work { val attempt = installer.submit(candidate); staged = null; "operation=${attempt.operationId}\nstate=${attempt.state}\nAndroid confirmation pending" }
                }.show()
        }
        button("Refresh installation receipt") { work { installer.reconcile() } }
        button("Open pending Android session") {
            var details: Intent? = null
            work(afterSuccess = { context.startActivity(requireNotNull(details)) }) {
                details = installer.resumeConfirmation()
                "Opened existing Android session details; no new submission"
            }
        }
        button("Cancel sessions and settle attempt") {
            AlertDialog.Builder(context).setTitle("Settle this update attempt?")
                .setMessage("Abandon this app's installer sessions, observe installed identity, and archive the receipt. Local participant data stays in place. No update is retried.")
                .setNegativeButton("Keep", null).setPositiveButton("Settle") { _, _ -> work { staged = null; installer.cancelAndSettle() } }.show()
        }
    }

    private fun button(label: String, action: () -> Unit) {
        val button = Button(context).apply { text = label; setOnClickListener { action() } }
        controls.add(button); addView(button)
    }

    private fun work(afterSuccess: (() -> Unit)? = null, action: () -> String) {
        controls.forEach { it.isEnabled = false }
        manifest.isEnabled = false; apk.isEnabled = false
        status.text = "Working · no automatic retry"
        OwnPackageInstaller.worker.execute {
            val result = runCatching(action)
            post {
                // Activity launches must be caught on the UI thread where they execute.
                // Posting them from the worker without this guard bypasses its error handling.
                status.text = result.mapCatching { message -> afterSuccess?.invoke(); message }
                    .getOrElse { "Blocked · ${it.message.orEmpty().take(160)}\nRefresh and reconcile before retrying" }
                controls.forEach { it.isEnabled = true }
                manifest.isEnabled = true; apk.isEnabled = true
            }
        }
    }
}
