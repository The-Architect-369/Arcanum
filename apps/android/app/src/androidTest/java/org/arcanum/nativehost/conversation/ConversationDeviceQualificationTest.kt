package org.arcanum.nativehost.conversation

import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import org.arcanum.nativehost.BuildConfig
import org.arcanum.nativehost.MainActivity
import org.arcanum.nativehost.memory.*
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream
import java.util.UUID
import android.content.Intent

/** Explicitly invoked methods only; all disclosed content is public synthetic evidence. */
@RunWith(AndroidJUnit4::class)
class ConversationDeviceQualificationTest {
    private val instrumentation get() = InstrumentationRegistry.getInstrumentation()
    private val context get() = instrumentation.targetContext
    private val marker get() = File(context.noBackupFilesDir, "a18-live-request.json")
    private fun journal() = ConversationJournal(File(context.noBackupFilesDir, "a18-test-journal"), AndroidMemoryKeyProvider("org.arcanum.a18.test-journal"), ::syncMemoryDirectory)
    private fun client() = ConversationClient(File(context.noBackupFilesDir, "a18-qualification-key").readText().trim())
    @Before fun bindIsolatedTarget() {
        check(context.packageName == "org.arcanum.nativehost.a18qualification")
        check(BuildConfig.ARCANUM_SOURCE_COMMIT.matches(Regex("[0-9a-f]{40}")))
        val installed = context.classLoader.loadClass("org.arcanum.nativehost.BuildConfig")
        assertEquals(BuildConfig.ARCANUM_SOURCE_COMMIT, installed.getField("ARCANUM_SOURCE_COMMIT").get(null))
        assertEquals("CE-W04-A18", installed.getField("ARCANUM_IMPLEMENTATION_ARC").get(null))
    }
    @Test fun showConversationUi() {
        val activity = instrumentation.startActivitySync(Intent(context, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
        instrumentation.runOnMainSync { ConversationPanel(activity).show() }
        instrumentation.waitForIdleSync()
    }
    @Test fun selectedPublicEvidenceThroughHomeGateway() {
        check(!marker.exists()) { "Original operation may exist; reconcile rather than repeating." }
        val c = client(); val profile = c.profile()
        val record = DevelopmentRecord(UUID.randomUUID().toString(), MemoryKind.EVIDENCE,
            "Public qualification fixture: host tests passed; physical conversation testing is in progress. This is a report, not proof of A18 closure.",
            "public:a18-physical-fixture", BuildConfig.ARCANUM_SOURCE_COMMIT, EvidenceClass.REPORT, ExecutionClaim.UNKNOWN, null,
            System.currentTimeMillis(), UUID.randomUUID().toString())
        val vault = MemoryVault(0, listOf(record), emptySet(), emptyList())
        val draft = ConversationDraft.prepare(profile, "Explain in three English sentences what this evidence establishes and what remains unknown.", vault, listOf(record.id))
        draft.verifyFresh(vault, c.profile())
        val journal = journal(); journal.record(draft, System.currentTimeMillis())
        check(marker.createNewFile())
        FileOutputStream(marker).use { it.write(JSONObject().put("requestId", draft.id).put("requestDigest", draft.digest).put("source", BuildConfig.ARCANUM_SOURCE_COMMIT).toString().toByteArray()); it.fd.sync() }
        syncMemoryDirectory(context.noBackupFilesDir)
        val reply = c.send(draft)
        assertTrue(reply.text.isNotBlank()); assertFalse("Inspect response quality before closure", reply.truncated)
        val status = c.status(draft.id)
        assertEquals("response_observed", status.getString("state")); assertEquals(draft.digest, status.getString("requestDigest"))
        // Public fixture response only; never use this test for personal context.
        FileOutputStream(File(context.noBackupFilesDir, "a18-public-response.txt")).use { it.write(reply.text.toByteArray()); it.fd.sync() }
        assertEquals(draft.id, journal.latest()!!.getString("requestId"))
    }
    @Test fun reconcileOriginalAfterRestart() {
        val prior = JSONObject(marker.readText())
        val status = client().status(prior.getString("requestId"))
        assertEquals(prior.getString("requestDigest"), status.getString("requestDigest"))
        assertEquals(prior.getString("requestId"), journal().latest()!!.getString("requestId"))
        assertEquals("response_observed", status.getString("state"))
    }
    @Test fun cancellationBeforeSendHasNoDispatch() {
        val c = client(); c.cancel()
        try { c.profile(); fail("Cancelled client must not connect") } catch (_: IllegalStateException) {}
    }
}
