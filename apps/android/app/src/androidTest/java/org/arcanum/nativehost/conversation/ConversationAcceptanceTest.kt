package org.arcanum.nativehost.conversation

import android.app.Activity
import android.app.AlertDialog
import android.content.Intent
import android.os.SystemClock
import android.view.View
import android.view.ViewGroup
import android.widget.*
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import androidx.test.runner.lifecycle.*
import org.arcanum.nativehost.BuildConfig
import org.arcanum.nativehost.MainActivity
import org.arcanum.nativehost.memory.*
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import java.io.File
import java.util.UUID
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicReference

/** Explicitly bound public fixtures in separate test custody. Never reads Hope or production memory. */
@RunWith(AndroidJUnit4::class)
class ConversationAcceptanceTest {
    private val i get() = InstrumentationRegistry.getInstrumentation()
    private val c get() = i.targetContext
    private val args get() = InstrumentationRegistry.getArguments()
    private val root get() = File(c.noBackupFilesDir, "a18-acceptance")
    private fun client() = ConversationClient(File(root, "pairing-key").readText().trim())
    private fun store() = DevelopmentMemoryStore(File(root, "memory"), AndroidMemoryKeyProvider("org.arcanum.a18.acceptance.memory"), ::syncMemoryDirectory)
    private fun journal() = ConversationJournal(File(root, "journal"), AndroidMemoryKeyProvider("org.arcanum.a18.acceptance.journal"), ::syncMemoryDirectory)
    @Before fun bind() {
        check(c.packageName == "org.arcanum.nativehost")
        check(args.getString("acceptanceSource") == BuildConfig.ARCANUM_SOURCE_COMMIT)
        check(BuildConfig.ARCANUM_IMPLEMENTATION_ARC == "CE-W04-A18")
        root.mkdirs()
    }
    private fun main(block: () -> Unit) = i.runOnMainSync(block)
    private fun await(seconds: Int = 15, block: () -> Boolean) {
        val until = SystemClock.elapsedRealtime() + seconds * 1000
        while (SystemClock.elapsedRealtime() < until) { var ok = false; main { ok = block() }; if (ok) return; SystemClock.sleep(100) }
        fail("Bounded UI condition not observed")
    }
    private fun views(v: View): List<View> = listOf(v) + if (v is ViewGroup) (0 until v.childCount).flatMap { views(v.getChildAt(it)) } else emptyList()
    private fun dialogViews(d: AlertDialog) = views(d.window!!.decorView)
    private fun button(d: AlertDialog, text: String) = dialogViews(d).filterIsInstance<Button>().single { it.text.toString() == text }
    // Window roots are limited to this instrumentation target process; no screenshots or hierarchy export.
    private fun topDialog(): AlertDialog = dialogs().last { it.isShowing }
    private val activeDialogs = mutableListOf<AlertDialog>()
    private fun dialogs(): List<AlertDialog> {
        val field = ConversationPanel::class.java.getDeclaredField("childDialogs").apply { isAccessible = true }
        @Suppress("UNCHECKED_CAST")
        return activeDialogs + (field.get(panel) as List<AlertDialog>)
    }
    private lateinit var panel: ConversationPanel
    private fun open(): AlertDialog {
        val latch = CountDownLatch(1); val activity = AtomicReference<Activity>()
        val monitor = ActivityLifecycleMonitorRegistry.getInstance()
        val callback = ActivityLifecycleCallback { a, stage -> if (a is MainActivity && stage == Stage.RESUMED) { activity.set(a); latch.countDown() } }
        try {
            main { monitor.addLifecycleCallback(callback); c.startActivity(Intent(c, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)) }
            assertTrue(latch.await(10, TimeUnit.SECONDS))
        } finally { main { monitor.removeLifecycleCallback(callback) } }
        lateinit var d: AlertDialog
        main { panel = ConversationPanel(activity.get(), store(), journal()); d = panel.show(); activeDialogs += d }
        return d
    }
    @Test fun liveReviewedOutcomeLoop() {
        check(args.getString("mode") == "live")
        val marker = File(root, "live-ui-started")
        check(marker.createNewFile()) { "Reconcile previous live operation; do not repeat" }
        val s = store(); check(s.inspect().phase == MemoryPhase.NOT_INITIALIZED)
        val v = s.initialize(UUID.randomUUID().toString(), System.currentTimeMillis())
        val now = System.currentTimeMillis()
        val record = DevelopmentRecord(UUID.randomUUID().toString(), MemoryKind.EVIDENCE,
            "Observed qualification result: original version 32 conversation UI test passed in 1.972 seconds, including FLAG_SECURE. Human separately confirmed Recall preserved their reflection. These do not establish A18 closure.",
            "repo:docs/evidence/ce-w04-a18-local-20261003/review.md", "558e070526120cdc54f9f30299e78ba37ca17583", EvidenceClass.REPORT, ExecutionClaim.UNKNOWN, null, now, UUID.randomUUID().toString())
        s.retain(record, v.generation, record.retentionDecision, now)
        val d = open()
        try {
            main {
                dialogViews(d).filterIsInstance<EditText>().single { it.hint.toString().contains("pairing key") }.setText(File(root, "pairing-key").readText().trim())
                button(d, "Connect and refresh selection").performClick()
            }
            await { dialogViews(d).filterIsInstance<CheckBox>().any { it.text.contains(record.text) } }
            main {
                dialogViews(d).filterIsInstance<CheckBox>().single { it.text.contains(record.text) }.isChecked = true
                dialogViews(d).filterIsInstance<EditText>().single { it.hint.toString().contains("Ask Architect") }.setText("Explain what this actual verification result establishes, what remains unverified, and propose one clearer workspace verification card. English, three short sentences.")
                button(d, "Review request").performClick()
                val review = topDialog()
                assertTrue(dialogViews(review).filterIsInstance<TextView>().any { it.text.contains(record.text) && it.text.contains(record.sourceRevision!!) })
                review.getButton(AlertDialog.BUTTON_NEGATIVE).performClick()
            }
            assertNull(journal().latest())
            main {
                button(d, "Review request").performClick(); val review = topDialog()
                dialogViews(review).filterIsInstance<CheckBox>().single().isChecked = true
                review.getButton(AlertDialog.BUTTON_POSITIVE).performClick()
            }
            await(80) { dialogViews(d).filterIsInstance<TextView>().any { it.text.startsWith("Architect · home-local-ollama") } }
            main {
                val answer = dialogViews(d).filterIsInstance<TextView>().single { it.text.startsWith("Architect · home-local-ollama") }.text.toString()
                File(root, "public-response.txt").writeText(answer)
                button(d, "Review outcome for memory").performClick(); topDialog().getButton(AlertDialog.BUTTON_NEGATIVE).performClick()
            }
            assertEquals(1, s.inspect().vault!!.records.size)
            main {
                button(d, "Review outcome for memory").performClick(); val editor = topDialog()
                dialogViews(editor).filterIsInstance<CheckBox>().single().isChecked = true
                editor.getButton(AlertDialog.BUTTON_POSITIVE).performClick()
            }
            await { topDialog().getButton(AlertDialog.BUTTON_POSITIVE).text == "Save" }
            main { topDialog().getButton(AlertDialog.BUTTON_POSITIVE).performClick() }
            await { dialogViews(d).filterIsInstance<TextView>().any { it.text.startsWith("Outcome saved") } }
            val saved = s.inspect().vault!!.records.single { it.id != record.id }
            assertEquals(EvidenceClass.INFERENCE, saved.evidence); assertEquals(ExecutionClaim.NOT_APPLICABLE, saved.execution)
            assertTrue(saved.source.contains(journal().latest()!!.getString("requestId")))
            File(root, "saved-id").writeText(saved.id)
            main { d.dismiss() }
            assertEquals(saved, store().inspect().vault!!.records.single { it.id == saved.id })
        } finally { main { d.dismiss() } }
    }
    @Test fun restartThenDeleteReviewedOutcome() {
        val s = store(); val v = s.inspect().vault!!; val id = File(root, "saved-id").readText()
        assertTrue(v.records.any { it.id == id })
        s.delete(listOf(id), v.generation, UUID.randomUUID().toString(), System.currentTimeMillis())
        val after = store().inspect().vault!!; assertTrue(id in after.deleted); assertFalse(after.records.any { it.id == id })
    }
    @Test fun offlineKeepsLocalMemoryAvailable() {
        check(args.getString("mode") == "offline")
        assertTrue(runCatching { client().profile() }.isFailure)
        assertEquals(MemoryPhase.READY, store().inspect().phase)
    }
    @Test fun failureAndCancellationRemainReconcileable() {
        val mode = args.getString("mode")!!; check(mode in listOf("provider-error", "timeout", "cancel-after-dispatch", "hostile"))
        val api = client(); val profile = api.profile()
        val draft = ConversationDraft.prepare(profile, "Public deterministic device fixture", null, emptyList())
        val marker = File(root, "$mode-started"); check(marker.createNewFile()) { "Reconcile original attempt first" }; marker.writeText(draft.id)
        journal().record(draft, System.currentTimeMillis())
        val reply = AtomicReference<ConversationReply>(); val failure = AtomicReference<Throwable>(); val done = CountDownLatch(1)
        Thread { try { reply.set(api.send(draft)) } catch (e: Throwable) { failure.set(e) } finally { done.countDown() } }.start()
        if (mode == "cancel-after-dispatch") {
            val deadline = SystemClock.elapsedRealtime() + 10000
            while (client().status(draft.id).getString("state") == "not_recorded" && SystemClock.elapsedRealtime() < deadline) SystemClock.sleep(100)
            assertEquals("unknown", client().status(draft.id).getString("state")); api.cancel()
        }
        assertTrue(done.await(80, TimeUnit.SECONDS))
        if (mode == "hostile") {
            assertTrue(reply.get().text.contains("execute"))
            assertEquals("response_observed", client().status(draft.id).getString("state"))
            assertEquals(MemoryPhase.READY, store().inspect().phase)
        } else { assertNotNull(failure.get()); assertEquals("unknown", client().status(draft.id).getString("state")) }
        assertEquals(draft.id, journal().latest()!!.getString("requestId"))
        assertTrue(runCatching { client().send(draft) }.isFailure) // duplicate rejected; never provider redispatch
    }
}
