package org.arcanum.nativehost.architect

import android.app.Activity
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import org.json.JSONObject
import java.util.UUID

/**
 * CE-W04-A13.1 fixed Android -> Termux operator transport.
 *
 * The UI may select only a compile-time Operation. It cannot supply command text,
 * executable paths, work directories, stdin, environment variables, or arbitrary argv.
 */
class TermuxOperatorBridge(
    context: Context,
) {
    private val appContext = context.applicationContext

    enum class Operation(
        val wireId: String,
        val label: String,
        val description: String,
    ) {
        PROBE_WORKSPACE(
            wireId = "probe_workspace",
            label = "Connect local workspace",
            description = "Read canonical Arcanum workspace identity, branch, HEAD, and cleanliness.",
        ),
        PAIR_NATIVE_CLIENT(
            wireId = "pair_native_client",
            label = "Pair native client",
            description = "Create or reuse the canonical local broker secret and transfer it only to the native app.",
        ),
    }

    data class WorkspaceProbe(
        val repositoryId: String,
        val path: String,
        val origin: String,
        val branch: String,
        val head: String,
        val clean: Boolean,
        val legacyWorkspacePresent: Boolean,
        val legacyWorkspacePath: String?,
        val legacyWorkspaceBranch: String?,
        val legacyWorkspaceHead: String?,
    )

    data class PairingMaterial(
        val repositoryId: String,
        val workspacePath: String,
        val branch: String,
        val head: String,
        val pairingSecretPath: String,
        val secretCreated: Boolean,
        val pairingCode: String,
    )

    fun probeWorkspace(callback: (Result<WorkspaceProbe>) -> Unit) {
        val operation = Operation.PROBE_WORKSPACE

        val readiness = runCatching { requireTermuxBridgeReady() }
        if (readiness.isFailure) {
            callback(Result.failure(requireNotNull(readiness.exceptionOrNull())))
            return
        }

        val nonce = UUID.randomUUID().toString()
        val executionId =
            TermuxOperatorResultService.register(
                operationId = operation.wireId,
                nonce = nonce,
            ) { raw ->
                callback(raw.mapCatching { parseWorkspaceProbe(it) })
            }

        val resultIntent =
            Intent(appContext, TermuxOperatorResultService::class.java)
                .putExtra(TermuxOperatorResultService.EXTRA_EXECUTION_ID, executionId)
                .putExtra(TermuxOperatorResultService.EXTRA_OPERATION_ID, operation.wireId)
                .putExtra(TermuxOperatorResultService.EXTRA_NONCE, nonce)

        val pendingFlags =
            PendingIntent.FLAG_ONE_SHOT or
                PendingIntent.FLAG_UPDATE_CURRENT or
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    PendingIntent.FLAG_MUTABLE
                } else {
                    0
                }

        val pendingResult =
            PendingIntent.getService(
                appContext,
                executionId,
                resultIntent,
                pendingFlags,
            )

        val commandIntent =
            Intent()
                .setClassName(TERMUX_PACKAGE, TERMUX_RUN_COMMAND_SERVICE)
                .setAction(TERMUX_RUN_COMMAND_ACTION)
                .putExtra(TERMUX_EXTRA_COMMAND_PATH, OPERATOR_PATH)
                .putExtra(TERMUX_EXTRA_ARGUMENTS, arrayOf(operation.wireId))
                .putExtra(TERMUX_EXTRA_WORKDIR, WORKSPACE_PATH)
                .putExtra(TERMUX_EXTRA_BACKGROUND, true)
                .putExtra(TERMUX_EXTRA_COMMAND_LABEL, "Arcanum workspace probe")
                .putExtra(
                    TERMUX_EXTRA_COMMAND_DESCRIPTION,
                    "Human-confirmed CE-W04-A13.1 read-only canonical workspace probe.",
                )
                .putExtra(TERMUX_EXTRA_PENDING_INTENT, pendingResult)

        runCatching {
            require(appContext.packageManager.resolveService(commandIntent, 0) != null) {
                "Termux RunCommandService is unavailable"
            }
            requireNotNull(appContext.startService(commandIntent)) {
                "Android did not start the Termux command service"
            }
        }.onFailure { error ->
            TermuxOperatorResultService.cancel(executionId)
            callback(Result.failure(error))
        }
    }

    fun pairNativeClient(callback: (Result<PairingMaterial>) -> Unit) {
        val operation = Operation.PAIR_NATIVE_CLIENT

        val readiness = runCatching { requireTermuxBridgeReady() }
        if (readiness.isFailure) {
            callback(Result.failure(requireNotNull(readiness.exceptionOrNull())))
            return
        }

        val nonce = UUID.randomUUID().toString()
        val executionId =
            TermuxOperatorResultService.register(
                operationId = operation.wireId,
                nonce = nonce,
            ) { raw ->
                callback(raw.mapCatching { parsePairingMaterial(it) })
            }

        val resultIntent =
            Intent(appContext, TermuxOperatorResultService::class.java)
                .putExtra(TermuxOperatorResultService.EXTRA_EXECUTION_ID, executionId)
                .putExtra(TermuxOperatorResultService.EXTRA_OPERATION_ID, operation.wireId)
                .putExtra(TermuxOperatorResultService.EXTRA_NONCE, nonce)

        val pendingFlags =
            PendingIntent.FLAG_ONE_SHOT or
                PendingIntent.FLAG_UPDATE_CURRENT or
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    PendingIntent.FLAG_MUTABLE
                } else {
                    0
                }

        val pendingResult =
            PendingIntent.getService(
                appContext,
                executionId,
                resultIntent,
                pendingFlags,
            )

        val commandIntent =
            Intent()
                .setClassName(TERMUX_PACKAGE, TERMUX_RUN_COMMAND_SERVICE)
                .setAction(TERMUX_RUN_COMMAND_ACTION)
                .putExtra(TERMUX_EXTRA_COMMAND_PATH, OPERATOR_PATH)
                .putExtra(TERMUX_EXTRA_ARGUMENTS, arrayOf(operation.wireId))
                .putExtra(TERMUX_EXTRA_WORKDIR, WORKSPACE_PATH)
                .putExtra(TERMUX_EXTRA_BACKGROUND, true)
                .putExtra(TERMUX_EXTRA_COMMAND_LABEL, operation.label)
                .putExtra(TERMUX_EXTRA_COMMAND_DESCRIPTION, operation.description)
                .putExtra(TERMUX_EXTRA_PENDING_INTENT, pendingResult)

        runCatching {
            require(appContext.packageManager.resolveService(commandIntent, 0) != null) {
                "Termux RunCommandService is unavailable"
            }
            requireNotNull(appContext.startService(commandIntent)) {
                "Android did not start the Termux command service"
            }
        }.onFailure { error ->
            TermuxOperatorResultService.cancel(executionId)
            callback(Result.failure(error))
        }
    }

    private fun requireTermuxBridgeReady() {
        runCatching {
            @Suppress("DEPRECATION")
            appContext.packageManager.getPackageInfo(TERMUX_PACKAGE, 0)
        }.getOrElse {
            error("Termux is not installed or is not visible to Arcanum")
        }

        require(
            appContext.checkSelfPermission(TERMUX_RUN_COMMAND_PERMISSION) ==
                PackageManager.PERMISSION_GRANTED,
        ) {
            "Grant Arcanum the Termux 'Run commands in Termux environment' permission"
        }
    }

    private fun parseWorkspaceProbe(raw: TermuxOperatorResultService.CommandResult): WorkspaceProbe {
        require(raw.termuxErrorCode == Activity.RESULT_OK) {
            "Termux rejected the operator request: ${raw.termuxErrorMessage.ifBlank { "unknown error" }}"
        }
        require(raw.exitCode == 0) {
            "Workspace operator exited with code ${raw.exitCode}: ${raw.stderr}"
        }
        require(!raw.stdoutTruncated && !raw.stderrTruncated) {
            "Workspace operator output was truncated"
        }
        require(raw.stderr.isBlank()) {
            "Workspace operator returned stderr: ${raw.stderr}"
        }

        val text = raw.stdout.trim()
        require(text.startsWith("{") && text.endsWith("}") && text.count { it == '\n' } == 0) {
            "Workspace operator did not return exactly one JSON document"
        }

        val json = JSONObject(text)
        require(json.length() == EXPECTED_RESULT_FIELDS) {
            "Workspace operator returned an unexpected result shape"
        }
        require(json.getString("schemaVersion") == "1.0") {
            "Workspace operator schema is unsupported"
        }
        require(json.getString("operationId") == Operation.PROBE_WORKSPACE.wireId) {
            "Workspace operator result is bound to a different operation"
        }
        require(json.getString("authorityEffect") == "none") {
            "Workspace operator reported an authority effect"
        }
        require(!json.getBoolean("repositoryMutation")) {
            "Workspace operator reported repository mutation"
        }
        require(json.getString("repositoryId") == CANONICAL_REPOSITORY_ID) {
            "Workspace operator reported a different repository identity"
        }
        require(json.getString("path") == WORKSPACE_PATH) {
            "Workspace operator reported a different canonical path"
        }
        require(json.getString("status") == "pass") {
            "Workspace probe failed closed: ${json.optString("reason", "unknown")}"
        }

        val head = json.getString("head")
        require(HEAD_PATTERN.matches(head)) {
            "Workspace operator returned an invalid HEAD"
        }
        val branch = json.getString("branch")
        require(branch.isNotBlank()) {
            "Workspace operator returned an empty branch"
        }

        val legacy = json.getJSONObject("legacyWorkspace")
        val origin = json.getString("origin")

        return WorkspaceProbe(
            repositoryId = json.getString("repositoryId"),
            path = json.getString("path"),
            origin = origin,
            branch = branch,
            head = head,
            clean = json.getBoolean("clean"),
            legacyWorkspacePresent = legacy.getBoolean("present"),
            legacyWorkspacePath = legacy.optNullableString("path"),
            legacyWorkspaceBranch = legacy.optNullableString("branch"),
            legacyWorkspaceHead = legacy.optNullableString("head"),
        )
    }

    private fun parsePairingMaterial(raw: TermuxOperatorResultService.CommandResult): PairingMaterial {
        require(raw.termuxErrorCode == Activity.RESULT_OK) {
            "Termux rejected the pairing request: ${raw.termuxErrorMessage.ifBlank { "unknown error" }}"
        }
        require(raw.exitCode == 0) {
            "Pairing operator exited with code ${raw.exitCode}: ${raw.stderr}"
        }
        require(!raw.stdoutTruncated && !raw.stderrTruncated) {
            "Pairing operator output was truncated"
        }
        require(raw.stderr.isBlank()) {
            "Pairing operator returned stderr: ${raw.stderr}"
        }

        val text = raw.stdout.trim()
        require(text.startsWith("{") && text.endsWith("}") && text.count { it == '\n' } == 0) {
            "Pairing operator did not return exactly one JSON document"
        }

        val json = JSONObject(text)
        require(json.length() == EXPECTED_PAIRING_RESULT_FIELDS) {
            "Pairing operator returned an unexpected result shape"
        }
        require(json.getString("schemaVersion") == "1.0") {
            "Pairing operator schema is unsupported"
        }
        require(json.getString("operationId") == Operation.PAIR_NATIVE_CLIENT.wireId) {
            "Pairing result is bound to a different operation"
        }
        require(json.getString("authorityEffect") == "none") {
            "Pairing operator reported an authority effect"
        }
        require(!json.getBoolean("repositoryMutation")) {
            "Pairing operator reported repository mutation"
        }
        require(json.getString("repositoryId") == CANONICAL_REPOSITORY_ID) {
            "Pairing operator reported a different repository identity"
        }
        require(json.getString("workspacePath") == WORKSPACE_PATH) {
            "Pairing operator reported a different canonical workspace"
        }
        require(json.getString("pairingSecretPath") == PAIRING_SECRET_PATH) {
            "Pairing operator reported an unexpected secret path"
        }
        require(json.getString("status") == "pass") {
            "Native pairing failed closed: ${json.optString("reason", "unknown")}"
        }

        val head = json.getString("head")
        require(HEAD_PATTERN.matches(head)) {
            "Pairing operator returned an invalid HEAD"
        }
        val branch = json.getString("branch")
        require(branch.isNotBlank()) {
            "Pairing operator returned an empty branch"
        }
        val pairingCode = json.getString("pairingCode")
        require(PAIRING_CODE_PATTERN.matches(pairingCode)) {
            "Pairing operator returned invalid pairing material"
        }

        return PairingMaterial(
            repositoryId = json.getString("repositoryId"),
            workspacePath = json.getString("workspacePath"),
            branch = branch,
            head = head,
            pairingSecretPath = json.getString("pairingSecretPath"),
            secretCreated = json.getBoolean("secretCreated"),
            pairingCode = pairingCode,
        )
    }

    private fun JSONObject.optNullableString(key: String): String? {
        if (!has(key) || isNull(key)) {
            return null
        }
        return getString(key).takeIf { it.isNotBlank() }
    }

    companion object {
        private const val TERMUX_PACKAGE = "com.termux"
        private const val TERMUX_RUN_COMMAND_SERVICE = "com.termux.app.RunCommandService"
        private const val TERMUX_RUN_COMMAND_ACTION = "com.termux.RUN_COMMAND"
        private const val TERMUX_RUN_COMMAND_PERMISSION = "com.termux.permission.RUN_COMMAND"

        private const val TERMUX_EXTRA_COMMAND_PATH = "com.termux.RUN_COMMAND_PATH"
        private const val TERMUX_EXTRA_ARGUMENTS = "com.termux.RUN_COMMAND_ARGUMENTS"
        private const val TERMUX_EXTRA_WORKDIR = "com.termux.RUN_COMMAND_WORKDIR"
        private const val TERMUX_EXTRA_BACKGROUND = "com.termux.RUN_COMMAND_BACKGROUND"
        private const val TERMUX_EXTRA_COMMAND_LABEL = "com.termux.RUN_COMMAND_COMMAND_LABEL"
        private const val TERMUX_EXTRA_COMMAND_DESCRIPTION =
            "com.termux.RUN_COMMAND_COMMAND_DESCRIPTION"
        private const val TERMUX_EXTRA_PENDING_INTENT = "com.termux.RUN_COMMAND_PENDING_INTENT"

        private const val WORKSPACE_PATH = "/data/data/com.termux/files/home/Arcanum"
        private const val OPERATOR_PATH =
            "/data/data/com.termux/files/home/Arcanum/scripts/mobile/arcanum-operator.sh"
        private const val PAIRING_SECRET_PATH =
            "/data/data/com.termux/files/home/.config/arcanum/architect-broker.secret"
        private const val CANONICAL_REPOSITORY_ID = "The-Architect-369/Arcanum"
        private const val EXPECTED_RESULT_FIELDS = 13
        private const val EXPECTED_PAIRING_RESULT_FIELDS = 13

        private val HEAD_PATTERN = Regex("^[0-9a-f]{40}$")
        private val PAIRING_CODE_PATTERN = Regex("^[0-9a-f]{64}$")
    }
}
