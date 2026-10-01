package org.arcanum.nativehost.update

import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.pm.PackageInstaller
import android.os.Build
import android.util.AtomicFile
import org.json.JSONObject
import java.io.File
import java.util.UUID
import java.util.concurrent.Executors
import org.arcanum.nativehost.update.OwnPackageUpdatePolicy.Identity
import org.arcanum.nativehost.update.OwnPackageUpdatePolicy.AttemptState

/** Session effects are reachable only from the user-confirmed panel action. */
class OwnPackageInstaller(private val context: Context) {
    private val distribution = OwnPackageDistribution(context)
    private val installer get() = context.packageManager.packageInstaller
    private val root = File(context.filesDir, "own-package-update").apply { mkdirs() }
    private val journal = AtomicFile(File(root, "attempt.json"))

    data class Attempt(
        val operationId: String,
        val prior: Identity,
        val target: Identity,
        val sessionId: Int,
        val state: AttemptState,
        val observation: String,
    )

    fun read(): Attempt? = synchronized(lock) {
        if (!journal.baseFile.exists() && !File(root, "attempt.json.bak").exists() && !File(root, "attempt.json.new").exists()) null else {
            val value = JSONObject(journal.openRead().use { it.readBytes().toString(Charsets.UTF_8) })
            require(Regex("[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}").matches(value.getString("operationId"))) { "Invalid journal operation ID" }
            require(value.getInt("sessionId") >= -1 && value.getString("authorityEffect") == "none") { "Invalid attempt journal" }
            Attempt(value.getString("operationId"), identity(value.getJSONObject("prior")), identity(value.getJSONObject("target")), value.getInt("sessionId"), AttemptState.valueOf(value.getString("state")), value.getString("observation"))
        }
    }

    private fun write(value: Attempt) {
        val json = JSONObject().put("operationId", value.operationId).put("prior", json(value.prior)).put("target", json(value.target)).put("sessionId", value.sessionId).put("state", value.state.name).put("observation", value.observation).put("updatedAtMillis", System.currentTimeMillis()).put("authorityEffect", "none")
        val stream = journal.startWrite()
        try { stream.write(json.toString().toByteArray(Charsets.UTF_8)); journal.finishWrite(stream) }
        catch (failure: Exception) { journal.failWrite(stream); throw failure }
    }

    fun submit(staged: OwnPackageDistribution.Staged): Attempt = synchronized(lock) {
        require(read() == null) { "Reconcile the previous attempt first" }
        require(installer.mySessions.isEmpty()) { "Unjournaled installer session requires recovery" }
        require(context.packageManager.canRequestPackageInstalls()) { "Enable Android installation permission, then confirm again" }
        val prior = distribution.installedIdentity()
        val freshlyObserved = distribution.inspectApk(staged.file)
        val decision = OwnPackageUpdatePolicy.decide(prior, staged.inspection, freshlyObserved, System.currentTimeMillis(), AttemptState.NONE)
        require(decision == OwnPackageUpdatePolicy.Decision.READY_FOR_USER_CONFIRMATION) { decision.name }
        val operationId = UUID.randomUUID().toString()
        // Persist intent before session creation; a crash cannot erase the attempt.
        var attempt = Attempt(operationId, prior, freshlyObserved, -1, AttemptState.PREPARED, "No session submitted")
        write(attempt)
        try {
            val params = PackageInstaller.SessionParams(PackageInstaller.SessionParams.MODE_FULL_INSTALL).apply {
                setAppPackageName(OwnPackageUpdatePolicy.APPLICATION_ID)
                setSize(staged.file.length())
                if (Build.VERSION.SDK_INT >= 31) setRequireUserAction(PackageInstaller.SessionParams.USER_ACTION_REQUIRED)
            }
            val sessionId = installer.createSession(params)
            attempt = attempt.copy(sessionId = sessionId)
            write(attempt)
            installer.openSession(sessionId).use { session ->
                session.openWrite("base.apk", 0, staged.file.length()).use { output ->
                    staged.file.inputStream().use { it.copyTo(output) }
                    session.fsync(output)
                }
                // Re-inspect source after copy; private immutable staging is owned by this module.
                require(distribution.inspectApk(staged.file) == attempt.target) { "Staged bytes changed" }
                require(distribution.installedIdentity() == attempt.prior) { "Installed predecessor changed" }
                val callback = Intent(context, OwnPackageInstallReceiver::class.java).apply {
                    action = "org.arcanum.nativehost.UPDATE_RESULT.$operationId"
                    putExtra("operationId", operationId)
                }
                val flags = PendingIntent.FLAG_UPDATE_CURRENT or if (Build.VERSION.SDK_INT >= 31) PendingIntent.FLAG_MUTABLE else 0
                val pending = PendingIntent.getBroadcast(context, sessionId, callback, flags)
                attempt = attempt.copy(state = AttemptState.SUBMITTED, observation = "Session commit requested; outcome pending")
                write(attempt)
                session.commit(pending.intentSender)
            }
            attempt
        } catch (failure: Exception) {
            // Commit may have succeeded before an exception; never retry here.
            write(attempt.copy(state = AttemptState.UNKNOWN, observation = "Submission interrupted; reconcile session and installed bytes"))
            throw failure
        }
    }

    fun reconcile(): String = synchronized(lock) {
        val attempt = read()
        val sessions = installer.mySessions
        if (attempt == null) return@synchronized if (sessions.isEmpty()) "No installation attempt" else "Unjournaled session detected; cancel it explicitly before proceeding"
        val recovery = OwnPackageUpdatePolicy.reconcile(attempt.prior, attempt.target, distribution.installedIdentity())
        val sessionPresent = sessions.any { it.sessionId == attempt.sessionId }
        val observation = "${recovery.name}; sessionPresent=$sessionPresent; callbackState=${attempt.state.name}"
        write(attempt.copy(observation = observation))
        "operation=${attempt.operationId}\n$observation\nauthorityEffect=none"
    }

    /** User action cancels owned sessions, verifies absence and prior bytes, then archives. */
    fun cancelAndSettle(): String = synchronized(lock) {
        val attempt = read()
        val sessions = installer.mySessions
        sessions.forEach { installer.abandonSession(it.sessionId) }
        require(installer.mySessions.isEmpty()) { "Session absence not established" }
        if (attempt != null) {
            val observed = distribution.installedIdentity()
            val recovery = OwnPackageUpdatePolicy.reconcile(attempt.prior, attempt.target, observed)
            require(recovery != OwnPackageUpdatePolicy.Recovery.UNEXPECTED_STATE) { "Unexpected installed identity; recovery blocked" }
            val settled = attempt.copy(
                state = if (recovery == OwnPackageUpdatePolicy.Recovery.TARGET_OBSERVED) attempt.state else AttemptState.CANCELLED,
                observation = "User settled attempt; ${recovery.name}; owned sessions absent; attribution unchanged",
            )
            write(settled)
            val archive = File(root, "attempt-${attempt.operationId}.json")
            require(!archive.exists() && journal.baseFile.copyTo(archive).length() > 0)
            journal.delete()
        }
        File(root, "candidate.apk").delete()
        File(root, "candidate.partial").delete()
        confirmations.clear()
        "Owned sessions absent; attempt archived; no automatic retry"
    }

    fun callback(intent: Intent): Intent? = synchronized(lock) {
        val attempt = read() ?: return@synchronized null
        if (intent.action != "org.arcanum.nativehost.UPDATE_RESULT.${attempt.operationId}" || intent.getStringExtra("operationId") != attempt.operationId || intent.getIntExtra(PackageInstaller.EXTRA_SESSION_ID, -1) != attempt.sessionId) return@synchronized null
        if (attempt.state !in listOf(AttemptState.SUBMITTED, AttemptState.AWAITING_USER, AttemptState.UNKNOWN)) return@synchronized null
        when (intent.getIntExtra(PackageInstaller.EXTRA_STATUS, Int.MIN_VALUE)) {
            PackageInstaller.STATUS_PENDING_USER_ACTION -> {
                write(attempt.copy(state = AttemptState.AWAITING_USER, observation = "Android confirmation required"))
                @Suppress("DEPRECATION")
                val confirmation = intent.getParcelableExtra<Intent>(Intent.EXTRA_INTENT)
                requireNotNull(confirmation) { "Missing Android confirmation intent" }
                confirmations.retain(attempt.operationId, attempt.sessionId, Intent(confirmation))
                confirmation
            }
            PackageInstaller.STATUS_SUCCESS -> {
                confirmations.clear()
                val observed = distribution.installedIdentity()
                val matches = OwnPackageUpdatePolicy.reconcile(attempt.prior, attempt.target, observed) == OwnPackageUpdatePolicy.Recovery.TARGET_OBSERVED
                write(attempt.copy(state = if (matches) AttemptState.VERIFIED else AttemptState.UNKNOWN, observation = if (matches) "Android success callback and target bytes independently verified" else "Success callback conflicts with installed bytes"))
                null
            }
            PackageInstaller.STATUS_FAILURE_ABORTED -> {
                confirmations.clear()
                write(attempt.copy(state = OwnPackageInstallFailure.stateFor(PackageInstaller.STATUS_FAILURE_ABORTED), observation = "Android reported aborted installation; reconcile before another attempt")); null
            }
            else -> {
                confirmations.clear()
                val status = intent.getIntExtra(PackageInstaller.EXTRA_STATUS, Int.MIN_VALUE)
                val state = OwnPackageInstallFailure.stateFor(status)
                write(attempt.copy(state = state, observation = "Android reported status=$status; reconcile before another attempt")); null
            }
        }
    }

    fun resumeConfirmation(): Intent = synchronized(lock) {
        val attempt = requireNotNull(read())
        require(attempt.state == AttemptState.AWAITING_USER) { "Original attempt is not awaiting Android confirmation; refresh and reconcile" }
        require(installer.mySessions.any { it.sessionId == attempt.sessionId }) { "Original Android session absent; refresh and settle the attempt" }
        require(distribution.installedIdentity() == attempt.prior) { "Installed identity changed; refresh and reconcile" }
        Intent(confirmations.existing(attempt.operationId, attempt.sessionId))
    }

    companion object {
        private val lock = Any()
        private val confirmations = OwnPackagePendingConfirmation<Intent>()
        val worker = Executors.newSingleThreadExecutor()
        private fun json(value: Identity) = JSONObject().put("applicationId", value.applicationId).put("versionCode", value.versionCode).put("apkSha256", value.apkSha256).put("signerSha256", value.signerSha256)
        private fun identity(value: JSONObject) = Identity(value.getString("applicationId"), value.getLong("versionCode"), value.getString("apkSha256"), value.getString("signerSha256"))
    }
}

class OwnPackageInstallReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val pending = goAsync()
        OwnPackageInstaller.worker.execute {
            try {
                val confirmation = OwnPackageInstaller(context).callback(intent)
                if (confirmation != null) {
                    try { context.startActivity(confirmation.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)) }
                    catch (_: Exception) { /* Retain the original confirmation for an explicit UI action. */ }
                }
            } catch (_: Exception) {
                // Preserve journal state on callback failure. A fresh reconciliation is required.
            } finally { pending.finish() }
        }
    }
}
