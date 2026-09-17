package org.arcanum.nativehost.architect

import android.app.Service
import android.content.Intent
import android.os.Bundle
import android.os.IBinder
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.atomic.AtomicInteger

/**
 * App-private one-shot result receiver for CE-W04-A13.1 Termux operator calls.
 *
 * The service is non-exported in AndroidManifest.xml. Termux can invoke it only through
 * the explicit PendingIntent created for a Human-confirmed operator request.
 */
class TermuxOperatorResultService : Service() {
    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(
        intent: Intent?,
        flags: Int,
        startId: Int,
    ): Int {
        val executionId = intent?.getIntExtra(EXTRA_EXECUTION_ID, -1) ?: -1
        val operationId = intent?.getStringExtra(EXTRA_OPERATION_ID)
        val nonce = intent?.getStringExtra(EXTRA_NONCE)

        val result =
            runCatching {
                require(executionId >= 0) {
                    "Termux result is missing its execution ID"
                }
                require(!operationId.isNullOrBlank()) {
                    "Termux result is missing its operation ID"
                }
                require(!nonce.isNullOrBlank()) {
                    "Termux result is missing its request nonce"
                }

                val bundle =
                    intent.getBundleExtra(TERMUX_RESULT_BUNDLE)
                        ?: error("Termux result bundle is missing")

                CommandResult(
                    stdout = bundle.getString(TERMUX_RESULT_STDOUT, ""),
                    stderr = bundle.getString(TERMUX_RESULT_STDERR, ""),
                    stdoutTruncated =
                        originalLength(bundle, TERMUX_RESULT_STDOUT_ORIGINAL_LENGTH) >
                            bundle.getString(TERMUX_RESULT_STDOUT, "").length,
                    stderrTruncated =
                        originalLength(bundle, TERMUX_RESULT_STDERR_ORIGINAL_LENGTH) >
                            bundle.getString(TERMUX_RESULT_STDERR, "").length,
                    exitCode = bundle.getInt(TERMUX_RESULT_EXIT_CODE, Int.MIN_VALUE),
                    termuxErrorCode = bundle.getInt(TERMUX_RESULT_ERROR_CODE, Int.MIN_VALUE),
                    termuxErrorMessage = bundle.getString(TERMUX_RESULT_ERROR_MESSAGE, ""),
                )
            }

        complete(
            executionId = executionId,
            operationId = operationId,
            nonce = nonce,
            result = result,
        )

        stopSelf(startId)
        return START_NOT_STICKY
    }

    private fun originalLength(
        bundle: Bundle,
        key: String,
    ): Int =
        when (val value = bundle.get(key)) {
            is Int -> value
            is Long -> value.coerceAtMost(Int.MAX_VALUE.toLong()).toInt()
            is String -> value.toIntOrNull() ?: 0
            else -> 0
        }

    data class CommandResult(
        val stdout: String,
        val stderr: String,
        val stdoutTruncated: Boolean,
        val stderrTruncated: Boolean,
        val exitCode: Int,
        val termuxErrorCode: Int,
        val termuxErrorMessage: String,
    )

    private data class Registration(
        val operationId: String,
        val nonce: String,
        val callback: (Result<CommandResult>) -> Unit,
    )

    companion object {
        const val EXTRA_EXECUTION_ID =
            "org.arcanum.nativehost.architect.operator.execution_id"
        const val EXTRA_OPERATION_ID =
            "org.arcanum.nativehost.architect.operator.operation_id"
        const val EXTRA_NONCE =
            "org.arcanum.nativehost.architect.operator.nonce"

        private const val TERMUX_RESULT_BUNDLE = "result"
        private const val TERMUX_RESULT_STDOUT = "stdout"
        private const val TERMUX_RESULT_STDOUT_ORIGINAL_LENGTH = "stdout_original_length"
        private const val TERMUX_RESULT_STDERR = "stderr"
        private const val TERMUX_RESULT_STDERR_ORIGINAL_LENGTH = "stderr_original_length"
        private const val TERMUX_RESULT_EXIT_CODE = "exitCode"
        private const val TERMUX_RESULT_ERROR_CODE = "err"
        private const val TERMUX_RESULT_ERROR_MESSAGE = "errmsg"

        private val nextExecutionId = AtomicInteger(131000)
        private val registrations = ConcurrentHashMap<Int, Registration>()

        fun register(
            operationId: String,
            nonce: String,
            callback: (Result<CommandResult>) -> Unit,
        ): Int {
            while (true) {
                val executionId = nextExecutionId.getAndIncrement()
                val prior =
                    registrations.putIfAbsent(
                        executionId,
                        Registration(operationId, nonce, callback),
                    )
                if (prior == null) {
                    return executionId
                }
            }
        }

        fun cancel(executionId: Int) {
            registrations.remove(executionId)
        }

        private fun complete(
            executionId: Int,
            operationId: String?,
            nonce: String?,
            result: Result<CommandResult>,
        ) {
            val registration = registrations.remove(executionId) ?: return
            if (
                registration.operationId != operationId ||
                registration.nonce != nonce
            ) {
                registration.callback(
                    Result.failure(
                        IllegalStateException(
                            "Termux operator result binding does not match the registered request",
                        ),
                    ),
                )
                return
            }
            registration.callback(result)
        }
    }
}
