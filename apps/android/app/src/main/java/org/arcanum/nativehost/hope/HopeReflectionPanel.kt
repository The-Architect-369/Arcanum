package org.arcanum.nativehost.hope

import android.content.Context
import android.graphics.Color
import android.text.InputType
import android.view.Gravity
import android.view.ViewGroup
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import java.time.Instant
import java.util.UUID
import org.arcanum.nativehost.tempus.TempusLifecycleBridge
import org.json.JSONObject

class HopeReflectionPanel(
    context: Context,
) : LinearLayout(context) {
    private val input =
        EditText(context).apply {
            hint = "What is present for you?"
            setHintTextColor(Color.GRAY)
            setTextColor(Color.WHITE)
            inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_FLAG_MULTI_LINE
            minLines = 2
            maxLines = 5
        }
    private val status =
        TextView(context).apply {
            setTextColor(Color.WHITE)
            textSize = 14.0f
        }
    private val recalled =
        TextView(context).apply {
            setTextColor(Color.LTGRAY)
            textSize = 13.0f
        }
    private val receipt =
        TextView(context).apply {
            setTextColor(Color.GRAY)
            textSize = 11.0f
        }

    init {
        orientation = VERTICAL
        gravity = Gravity.CENTER_HORIZONTAL
        setPadding(32, 24, 32, 24)

        addView(
            TextView(context).apply {
                setTextColor(Color.WHITE)
                textSize = 18.0f
                text = "Hope · local reflection"
            },
        )
        addView(
            TextView(context).apply {
                setTextColor(Color.LTGRAY)
                textSize = 12.0f
                text = "Private on this device · advisory only · authorityEffect=none"
            },
        )
        addView(
            input,
            LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT),
        )
        addView(
            Button(context).apply {
                text = "Reflect locally"
                setOnClickListener { captureReflection() }
            },
        )
        addView(
            Button(context).apply {
                text = "Recall local reflection"
                setOnClickListener { recallReflection() }
            },
        )
        addView(status)
        addView(recalled)
        addView(receipt)

        recallReflection()
    }

    private fun captureReflection() {
        val userText = input.text.toString().trim()
        if (userText.isEmpty()) {
            status.text = "Silence is welcome. Nothing was recorded."
            return
        }

        runCatching {
            val contract = HopeRuntimeBridge.contract()
            val tempus =
                runCatching { TempusLifecycleBridge.captureAndPersist(context.filesDir) }
                    .getOrNull()
                    ?.let { presentation ->
                        HopeTempusProvenance(
                            anchorId = presentation.anchorId,
                            capturedAt = presentation.capturedAt,
                            sourceKind = presentation.sourceKind,
                        )
                    }
            val reflectionJson =
                HopeRuntimeBridge.buildReflection(
                    id = "hope:${UUID.randomUUID()}",
                    createdAt = Instant.now().toString(),
                    prompt = "What is present for you?",
                    userText = userText,
                    hopeText = CURATED_PRESENCE,
                    tempus = tempus,
                )
            val localReceipt =
                HopeLocalStateCodec.createReceipt(
                    reflectionJson = reflectionJson,
                    persistedAt = Instant.now().toString(),
                )
            val state = HopeLocalState(reflectionJson, localReceipt)
            val encoded = HopeLocalStateCodec.encode(state)
            val store = HopeProtectedStore(context.filesDir, AndroidHopeKeyManager(), contract)
            store.persistExact(encoded)
            val recoveredBytes = store.recoverExact()
            check(recoveredBytes.contentEquals(encoded)) {
                "protected Hope state did not round-trip exactly"
            }
            HopeLocalStateCodec.decode(recoveredBytes)
        }.onSuccess { state ->
            input.text.clear()
            renderState(state, CURATED_PRESENCE)
        }.onFailure { failure ->
            renderFailure(failure)
        }
    }

    private fun recallReflection() {
        runCatching {
            val contract = HopeRuntimeBridge.contract()
            val store = HopeProtectedStore(context.filesDir, AndroidHopeKeyManager(), contract)
            HopeLocalStateCodec.decode(store.recoverExact())
        }.onSuccess { state ->
            renderState(state, "Your local reflection was recovered.")
        }.onFailure { failure ->
            when (failure) {
                is HopeStateMissingException -> {
                    status.text = "No local reflection has been recorded yet."
                    recalled.text = ""
                    receipt.text = ""
                }
                else -> renderFailure(failure)
            }
        }
    }

    private fun renderState(
        state: HopeLocalState,
        message: String,
    ) {
        val reflection = JSONObject(state.reflectionJson)
        status.text = message
        recalled.text = "Recalled: ${reflection.getString("userText")}"
        receipt.text =
            "local receipt · scope=${state.receipt.scope} · unsigned · sha256=${state.receipt.contentDigestSha256.take(16)}…"
    }

    private fun renderFailure(failure: Throwable) {
        status.text =
            when (failure) {
                is HopeStateCorruptException ->
                    "Protected Hope state could not be authenticated. No state was reset."
                else -> "Hope local reflection unavailable · fail-closed · authorityEffect=none"
            }
        recalled.text = ""
        receipt.text = ""
    }

    companion object {
        const val CURATED_PRESENCE: String = "Your reflection is held locally."
    }
}
