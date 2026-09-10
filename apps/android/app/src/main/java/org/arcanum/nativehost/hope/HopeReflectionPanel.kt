package org.arcanum.nativehost.hope

import android.content.Context
import android.graphics.Color
import android.text.InputType
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import java.time.Instant
import java.util.UUID
import org.arcanum.nativehost.architect.ArchitectObservationPrivacy
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
            ArchitectObservationPrivacy.markPrivateText(this)
        }
    private val status =
        TextView(context).apply {
            setTextColor(Color.LTGRAY)
            textSize = 12.0f
        }
    private val recalled =
        TextView(context).apply {
            setTextColor(Color.WHITE)
            textSize = 13.0f
            visibility = View.GONE
            ArchitectObservationPrivacy.markPrivateText(this)
        }
    private val receipt =
        TextView(context).apply {
            setTextColor(Color.GRAY)
            textSize = 10.0f
            visibility = View.GONE
        }
    private val editor =
        LinearLayout(context).apply {
            orientation = VERTICAL
            visibility = View.GONE
        }

    init {
        orientation = VERTICAL
        gravity = Gravity.CENTER_HORIZONTAL
        setPadding(dp(18), dp(14), dp(18), dp(14))
        setBackgroundColor(Color.argb(238, 0, 0, 0))

        addView(
            TextView(context).apply {
                setTextColor(Color.WHITE)
                textSize = 16.0f
                text = "Hope · local reflection"
                contentDescription = "Hope local reflection. Private on this device. Advisory only. Authority effect none."
            },
        )
        addView(status, LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT))

        val actionRow =
            LinearLayout(context).apply {
                orientation = HORIZONTAL
                gravity = Gravity.CENTER
            }

        actionRow.addView(
            Button(context).apply {
                text = "Reflect"
                contentDescription = "Open private local reflection editor"
                setOnClickListener {
                    recalled.visibility = View.GONE
                    editor.visibility = if (editor.visibility == View.VISIBLE) View.GONE else View.VISIBLE
                }
            },
            LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1.0f),
        )
        actionRow.addView(
            Button(context).apply {
                text = "Recall"
                contentDescription = "Recall the protected local Hope reflection"
                setOnClickListener { recallReflection(showPrivate = true) }
            },
            LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1.0f),
        )
        addView(actionRow, LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT))

        editor.addView(
            input,
            LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT),
        )
        editor.addView(
            Button(context).apply {
                text = "Hold locally"
                contentDescription = "Persist this private reflection locally"
                setOnClickListener { captureReflection() }
            },
            LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT),
        )
        addView(editor, LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT))
        addView(recalled, LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT))
        addView(receipt, LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT))

        recallReflection(showPrivate = false)
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
            editor.visibility = View.GONE
            renderState(state, CURATED_PRESENCE, showPrivate = false)
        }.onFailure { failure ->
            renderFailure(failure)
        }
    }

    private fun recallReflection(showPrivate: Boolean) {
        runCatching {
            val contract = HopeRuntimeBridge.contract()
            val store = HopeProtectedStore(context.filesDir, AndroidHopeKeyManager(), contract)
            HopeLocalStateCodec.decode(store.recoverExact())
        }.onSuccess { state ->
            renderState(state, "Your local reflection is available.", showPrivate)
        }.onFailure { failure ->
            when (failure) {
                is HopeStateMissingException -> {
                    status.text = "No local reflection yet."
                    recalled.text = ""
                    recalled.visibility = View.GONE
                    receipt.text = ""
                    receipt.visibility = View.GONE
                }
                else -> renderFailure(failure)
            }
        }
    }

    private fun renderState(
        state: HopeLocalState,
        message: String,
        showPrivate: Boolean,
    ) {
        val reflection = JSONObject(state.reflectionJson)
        status.text = message
        recalled.text = "Recalled: ${reflection.getString("userText")}"
        recalled.visibility = if (showPrivate) View.VISIBLE else View.GONE
        receipt.text =
            "local receipt · scope=${state.receipt.scope} · unsigned · sha256=${state.receipt.contentDigestSha256.take(16)}…"
        receipt.visibility = View.GONE
        contentDescription =
            "$message Local receipt scope ${state.receipt.scope}. Private content is hidden until explicitly recalled."
    }

    private fun renderFailure(failure: Throwable) {
        status.text =
            when (failure) {
                is HopeStateCorruptException ->
                    "Protected Hope state could not be authenticated. No state was reset."
                else -> "Hope local reflection unavailable · fail-closed"
            }
        recalled.text = ""
        recalled.visibility = View.GONE
        receipt.text = ""
        receipt.visibility = View.GONE
    }

    private fun dp(value: Int): Int =
        (value * resources.displayMetrics.density).toInt()

    companion object {
        const val CURATED_PRESENCE: String = "Your reflection is held locally."
    }
}
