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
        START_BROKER(
            wireId = "start_broker",
            label = "Start local broker",
            description = "Start only the canonical repo-owned Architect broker on fixed loopback 127.0.0.1:8765.",
        ),
        STOP_BROKER(
            wireId = "stop_broker",
            label = "Stop local broker",
            description = "Stop only the broker process proven to be owned by the A13.3 lifecycle state.",
        ),
        VERIFY_WORKSPACE(
            wireId = "verify_workspace",
            label = "Verify local workspace",
            description = "Run only the canonical read-only repository verify-sync contract and attest unchanged Git state.",
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

    data class BrokerLifecycleResult(
        val repositoryId: String,
        val workspacePath: String,
        val branch: String,
        val head: String,
        val brokerState: String,
        val brokerPid: Long?,
        val brokerPort: Int,
        val brokerSessionId: String?,
        val lifecycleStatePath: String,
        val logPath: String,
        val runtimeEffect: String,
    )

    data class WorkspaceVerificationResult(
        val repositoryId: String,
        val workspacePath: String,
        val status: String,
        val reason: String?,
        val branch: String?,
        val head: String?,
        val cleanBefore: Boolean,
        val cleanAfter: Boolean,
        val verifyExitCode: Int?,
        val passedChecks: Int?,
        val totalChecks: Int,
        val durationMs: Long,
        val logPath: String,
        val logSha256: String?,
        val runtimeEffect: String,
        val repositoryMutation: Boolean,
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

    fun startBroker(callback: (Result<BrokerLifecycleResult>) -> Unit) {
        runBrokerLifecycle(Operation.START_BROKER, callback)
    }

    fun stopBroker(callback: (Result<BrokerLifecycleResult>) -> Unit) {
        runBrokerLifecycle(Operation.STOP_BROKER, callback)
    }

    fun verifyWorkspace(callback: (Result<WorkspaceVerificationResult>) -> Unit) {
        val operation = Operation.VERIFY_WORKSPACE

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
                callback(raw.mapCatching { parseWorkspaceVerification(it) })
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

    private fun runBrokerLifecycle(
        operation: Operation,
        callback: (Result<BrokerLifecycleResult>) -> Unit,
    ) {
        require(
            operation == Operation.START_BROKER ||
                operation == Operation.STOP_BROKER,
        ) {
            "Lifecycle bridge accepts only start_broker or stop_broker"
        }

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
                callback(raw.mapCatching { parseBrokerLifecycle(it, operation) })
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

    private fun parseBrokerLifecycle(
        raw: TermuxOperatorResultService.CommandResult,
        expectedOperation: Operation,
    ): BrokerLifecycleResult {
        require(raw.termuxErrorCode == Activity.RESULT_OK) {
            "Termux rejected the lifecycle request: ${raw.termuxErrorMessage.ifBlank { "unknown error" }}"
        }
        require(raw.exitCode == 0) {
            "Lifecycle operator exited with code ${raw.exitCode}: ${raw.stderr}"
        }
        require(!raw.stdoutTruncated && !raw.stderrTruncated) {
            "Lifecycle operator output was truncated"
        }
        require(raw.stderr.isBlank()) {
            "Lifecycle operator returned stderr: ${raw.stderr}"
        }

        val text = raw.stdout.trim()
        require(text.startsWith("{") && text.endsWith("}") && text.count { it == '\n' } == 0) {
            "Lifecycle operator did not return exactly one JSON document"
        }

        val json = JSONObject(text)
        require(json.length() == EXPECTED_LIFECYCLE_RESULT_FIELDS) {
            "Lifecycle operator returned an unexpected result shape"
        }
        require(json.getString("schemaVersion") == "1.0") {
            "Lifecycle operator schema is unsupported"
        }
        require(
            expectedOperation == Operation.START_BROKER ||
                expectedOperation == Operation.STOP_BROKER,
        ) {
            "Unexpected lifecycle operation"
        }
        require(json.getString("operationId") == expectedOperation.wireId) {
            "Lifecycle result is bound to a different operation"
        }
        require(json.getString("authorityEffect") == "none") {
            "Lifecycle operator reported an authority effect"
        }
        require(!json.getBoolean("repositoryMutation")) {
            "Lifecycle operator reported repository mutation"
        }
        require(json.getString("repositoryId") == CANONICAL_REPOSITORY_ID) {
            "Lifecycle operator reported a different repository identity"
        }
        require(json.getString("workspacePath") == WORKSPACE_PATH) {
            "Lifecycle operator reported a different canonical workspace"
        }
        require(json.getInt("brokerPort") == BROKER_PORT) {
            "Lifecycle operator reported a different broker port"
        }
        require(json.getString("lifecycleStatePath") == BROKER_LIFECYCLE_STATE_PATH) {
            "Lifecycle operator reported an unexpected state path"
        }
        require(json.getString("logPath") == BROKER_LOG_PATH) {
            "Lifecycle operator reported an unexpected log path"
        }
        require(json.getString("status") == "pass") {
            "Broker lifecycle failed closed: ${json.optString("reason", "unknown")}"
        }

        val branch = json.getString("branch")
        require(branch.isNotBlank()) {
            "Lifecycle operator returned an empty branch"
        }
        val head = json.getString("head")
        require(HEAD_PATTERN.matches(head)) {
            "Lifecycle operator returned an invalid HEAD"
        }

        val brokerState = json.getString("brokerState")
        val allowedStates =
            if (expectedOperation == Operation.START_BROKER) {
                setOf("started", "already_running")
            } else {
                setOf("stopped", "already_stopped")
            }
        require(brokerState in allowedStates) {
            "Lifecycle operator returned an invalid broker state"
        }

        val expectedRuntimeEffect =
            when (brokerState) {
                "started" -> "broker_started"
                "stopped" -> "broker_stopped"
                else -> "none"
            }
        val runtimeEffect = json.getString("runtimeEffect")
        require(runtimeEffect == expectedRuntimeEffect) {
            "Lifecycle runtime effect does not match the broker state"
        }

        val brokerPid =
            if (json.isNull("brokerPid")) {
                null
            } else {
                json.getLong("brokerPid").also {
                    require(it > 1L) { "Lifecycle operator returned an invalid broker PID" }
                }
            }
        val brokerSessionId = json.optNullableString("brokerSessionId")

        if (expectedOperation == Operation.START_BROKER) {
            require(brokerPid != null) {
                "Started broker result is missing the owned PID"
            }
            require(!brokerSessionId.isNullOrBlank()) {
                "Started broker result is missing the session ID"
            }
        }
        if (brokerState == "stopped") {
            require(brokerPid != null && !brokerSessionId.isNullOrBlank()) {
                "Stopped broker result is missing the prior owned identity"
            }
        }

        return BrokerLifecycleResult(
            repositoryId = json.getString("repositoryId"),
            workspacePath = json.getString("workspacePath"),
            branch = branch,
            head = head,
            brokerState = brokerState,
            brokerPid = brokerPid,
            brokerPort = json.getInt("brokerPort"),
            brokerSessionId = brokerSessionId,
            lifecycleStatePath = json.getString("lifecycleStatePath"),
            logPath = json.getString("logPath"),
            runtimeEffect = runtimeEffect,
        )
    }

    private fun parseWorkspaceVerification(
        raw: TermuxOperatorResultService.CommandResult,
    ): WorkspaceVerificationResult {
        require(raw.termuxErrorCode == Activity.RESULT_OK) {
            "Termux rejected the verification request: ${raw.termuxErrorMessage.ifBlank { "unknown error" }}"
        }
        require(raw.exitCode == 0) {
            "Workspace verification operator exited with code ${raw.exitCode}: ${raw.stderr}"
        }
        require(!raw.stdoutTruncated && !raw.stderrTruncated) {
            "Workspace verification operator output was truncated"
        }
        require(raw.stderr.isBlank()) {
            "Workspace verification operator returned stderr: ${raw.stderr}"
        }

        val text = raw.stdout.trim()
        require(text.startsWith("{") && text.endsWith("}") && text.count { it == '\n' } == 0) {
            "Workspace verification operator did not return exactly one JSON document"
        }

        val json = JSONObject(text)
        require(json.length() == EXPECTED_VERIFICATION_RESULT_FIELDS) {
            "Workspace verification operator returned an unexpected result shape"
        }
        require(json.getString("schemaVersion") == "1.0") {
            "Workspace verification schema is unsupported"
        }
        require(json.getString("operationId") == Operation.VERIFY_WORKSPACE.wireId) {
            "Workspace verification result is bound to a different operation"
        }
        require(json.getString("authorityEffect") == "none") {
            "Workspace verification reported an authority effect"
        }
        require(json.getString("repositoryId") == CANONICAL_REPOSITORY_ID) {
            "Workspace verification reported a different repository identity"
        }
        require(json.getString("workspacePath") == WORKSPACE_PATH) {
            "Workspace verification reported a different canonical workspace"
        }
        require(json.getString("logPath") == WORKSPACE_VERIFICATION_LOG_PATH) {
            "Workspace verification reported an unexpected log path"
        }

        val status = json.getString("status")
        require(status == "pass" || status == "fail") {
            "Workspace verification returned an invalid status"
        }
        val reason = json.optNullableString("reason")
        val branch = json.optNullableString("branch")
        val head = json.optNullableString("head")
        if (head != null) {
            require(HEAD_PATTERN.matches(head)) {
                "Workspace verification returned an invalid HEAD"
            }
        }

        val cleanBefore = json.getBoolean("cleanBefore")
        val cleanAfter = json.getBoolean("cleanAfter")
        val repositoryMutation = json.getBoolean("repositoryMutation")
        val runtimeEffect = json.getString("runtimeEffect")
        require(runtimeEffect == "none" || runtimeEffect == "verification_log_written") {
            "Workspace verification returned an invalid runtime effect"
        }

        val verifyExitCode = json.optNullableInt("verifyExitCode")
        val passedChecks = json.optNullableInt("passedChecks")
        val totalChecks = json.getInt("totalChecks")
        require(totalChecks == VERIFY_SYNC_TOTAL_CHECKS) {
            "Workspace verification reported an unexpected check count"
        }
        val durationMs = json.getLong("durationMs")
        require(durationMs >= 0L) {
            "Workspace verification returned an invalid duration"
        }
        val logSha256 = json.optNullableString("logSha256")
        if (logSha256 != null) {
            require(SHA256_PATTERN.matches(logSha256)) {
                "Workspace verification returned an invalid log digest"
            }
        }

        if (status == "pass") {
            require(reason == null) { "Passing workspace verification returned a failure reason" }
            require(!repositoryMutation) { "Passing workspace verification reported repository mutation" }
            require(cleanBefore && cleanAfter) { "Passing workspace verification was not clean before and after" }
            require(!branch.isNullOrBlank()) { "Passing workspace verification returned an empty branch" }
            require(head != null && HEAD_PATTERN.matches(head)) {
                "Passing workspace verification returned an invalid HEAD"
            }
            require(verifyExitCode == 0) { "Passing workspace verification returned a non-zero exit" }
            require(passedChecks == totalChecks) { "Passing workspace verification did not pass all checks" }
            require(runtimeEffect == "verification_log_written") {
                "Passing workspace verification did not bind its private log"
            }
            require(logSha256 != null) { "Passing workspace verification is missing its log digest" }
        } else {
            require(!reason.isNullOrBlank()) { "Failed workspace verification is missing a reason" }
        }

        return WorkspaceVerificationResult(
            repositoryId = json.getString("repositoryId"),
            workspacePath = json.getString("workspacePath"),
            status = status,
            reason = reason,
            branch = branch,
            head = head,
            cleanBefore = cleanBefore,
            cleanAfter = cleanAfter,
            verifyExitCode = verifyExitCode,
            passedChecks = passedChecks,
            totalChecks = totalChecks,
            durationMs = durationMs,
            logPath = json.getString("logPath"),
            logSha256 = logSha256,
            runtimeEffect = runtimeEffect,
            repositoryMutation = repositoryMutation,
        )
    }

    private fun JSONObject.optNullableInt(key: String): Int? {
        if (!has(key) || isNull(key)) {
            return null
        }
        return getInt(key)
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
        private const val BROKER_LIFECYCLE_STATE_PATH =
            "/data/data/com.termux/files/home/.config/arcanum/architect-broker.lifecycle.json"
        private const val BROKER_LOG_PATH =
            "/data/data/com.termux/files/home/.config/arcanum/architect-broker.log"
        private const val WORKSPACE_VERIFICATION_LOG_PATH =
            "/data/data/com.termux/files/home/.config/arcanum/architect-workspace-verification.log"
        private const val BROKER_PORT = 8765
        private const val CANONICAL_REPOSITORY_ID = "The-Architect-369/Arcanum"
        private const val VERIFY_SYNC_TOTAL_CHECKS = 15
        private const val EXPECTED_RESULT_FIELDS = 13
        private const val EXPECTED_PAIRING_RESULT_FIELDS = 13
        private const val EXPECTED_LIFECYCLE_RESULT_FIELDS = 17
        private const val EXPECTED_VERIFICATION_RESULT_FIELDS = 19

        private val HEAD_PATTERN = Regex("^[0-9a-f]{40}$")
        private val PAIRING_CODE_PATTERN = Regex("^[0-9a-f]{64}$")
        private val SHA256_PATTERN = Regex("^[0-9a-f]{64}$")
    }
}
