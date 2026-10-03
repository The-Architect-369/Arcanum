package org.arcanum.nativehost.memory

import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import org.arcanum.nativehost.BuildConfig
import org.arcanum.nativehost.MainActivity
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream
import java.security.KeyStore
import android.content.Intent
import android.security.keystore.KeyInfo
import javax.crypto.SecretKeyFactory

@RunWith(AndroidJUnit4::class)
class MemoryDeviceQualificationTest {
    private val instrumentation get() = InstrumentationRegistry.getInstrumentation()
    private val context get() = instrumentation.targetContext
    private val baseline get() = File(context.noBackupFilesDir, "a17-qualification.json")
    private lateinit var store: DevelopmentMemoryStore
    @Before fun bindIsolatedTarget() {
        check(context.packageName == "org.arcanum.nativehost.a17qualification")
        check(BuildConfig.ARCANUM_SOURCE_COMMIT.matches(Regex("[0-9a-f]{40}")))
        val installed = context.classLoader.loadClass("org.arcanum.nativehost.BuildConfig")
        assertEquals(BuildConfig.ARCANUM_SOURCE_COMMIT, installed.getField("ARCANUM_SOURCE_COMMIT").get(null))
        assertEquals("CE-W04-A17", installed.getField("ARCANUM_IMPLEMENTATION_ARC").get(null))
        store = androidDevelopmentMemory(context)
    }
    private fun saved() = JSONObject(baseline.readText())
    private fun persist(j: JSONObject) { FileOutputStream(baseline).use { it.write(j.toString().toByteArray()); it.fd.sync() } }
    private fun block(action: () -> Any?) { try { action(); fail("Expected denial") } catch (_: MemoryFailure) { } }
    @Test fun showMemoryUi() {
        val activity = instrumentation.startActivitySync(Intent(context, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
        instrumentation.runOnMainSync { DevelopmentMemoryPanel(activity).show() }
        instrumentation.waitForIdleSync()
    }
    @Test fun seed() {
        assertEquals(28, context.packageManager.getPackageInfo(context.packageName, 0).longVersionCode.toInt())
        check(!baseline.exists()) { "Seed may already exist; do not repeat" }
        assertEquals(MemoryPhase.NOT_INITIALIZED, store.inspect().phase)
        store.initialize(memoryId(), System.currentTimeMillis())
        val first = DevelopmentRecord(memoryId(), MemoryKind.NOTE, "A17 synthetic note for selected context", "synthetic:a17-device", "v1", EvidenceClass.REPORT, ExecutionClaim.UNKNOWN, null, System.currentTimeMillis(), memoryId())
        val second = first.copy(id = memoryId(), kind = MemoryKind.QUESTION, text = "A17 synthetic unselected question", retentionDecision = memoryId())
        val third = first.copy(id = memoryId(), kind = MemoryKind.EVIDENCE, text = "A17 synthetic pending operation reference", execution = ExecutionClaim.PENDING, retentionDecision = memoryId())
        listOf(first, second, third).forEachIndexed { n, r -> store.retain(r, n.toLong(), r.retentionDecision, r.recordedAt) }
        val key = AndroidMemoryKeyProvider().existing()!!; assertNull(key.encoded)
        val info = SecretKeyFactory.getInstance(key.algorithm, "AndroidKeyStore").getKeySpec(key, KeyInfo::class.java) as KeyInfo
        val v = store.inspect().vault!!; assertEquals(3, v.records.size)
        assertFalse(File(store.directory, "vault.enc").readText().contains(first.text))
        check(baseline.createNewFile())
        persist(JSONObject().put("source", BuildConfig.ARCANUM_SOURCE_COMMIT).put("first", first.id).put("second", second.id).put("third", third.id)
            .put("firstDigest", first.digest()).put("thirdDigest", third.digest()).put("originalDigest", memoryDigest(v.bytes())).put("deleted", false).put("securityLevel", info.securityLevel))
    }
    @Test fun recoverAfterRestart() {
        val b = saved(); assertEquals(b.getString("source"), BuildConfig.ARCANUM_SOURCE_COMMIT)
        val v = store.inspect().vault!!
        if (!b.getBoolean("deleted")) { assertEquals(3, v.records.size); assertEquals(b.getString("originalDigest"), memoryDigest(v.bytes())) }
        else { assertEquals(2, v.records.size); assertTrue(b.getString("second") in v.deleted); assertFalse(v.records.any { it.id == b.getString("second") }) }
        assertEquals(b.getString("firstDigest"), v.records.single { it.id == b.getString("first") }.digest())
        assertEquals(b.getString("thirdDigest"), v.records.single { it.id == b.getString("third") }.digest())
        assertEquals(ExecutionClaim.UNKNOWN, v.records.single { it.id == b.getString("first") }.execution)
        assertEquals(ExecutionClaim.PENDING, v.records.single { it.id == b.getString("third") }.execution)
    }
    @Test fun selectedContextAndPrivacy() {
        val b = saved(); val v = store.inspect().vault!!
        val preview = store.preview(listOf(b.getString("first")), v.generation, memoryId())
        assertTrue(preview.json.contains("A17 synthetic note")); assertFalse(preview.json.contains("unselected question")); assertFalse(preview.json.contains("pending operation reference"))
        assertTrue(preview.json.contains("UNKNOWN")); assertTrue(preview.json.contains("local-preview"))
        val example = v.records.first()
        block { store.retain(example.copy(id = memoryId(), namespace = "hope"), v.generation, example.retentionDecision, example.recordedAt) }
        block { store.retain(example.copy(id = memoryId(), text = "api_key=synthetic-denial-only"), v.generation, example.retentionDecision, example.recordedAt) }
        assertEquals(v, store.inspect().vault)
    }
    @Test fun deleteSelectedRecord() {
        val b = saved(); check(!b.getBoolean("deleted")); val v = store.inspect().vault!!
        store.delete(listOf(b.getString("second")), v.generation, memoryId(), System.currentTimeMillis())
        block { store.preview(listOf(b.getString("second")), v.generation, memoryId()) }
        b.put("deleted", true); persist(b); recoverAfterRestart()
    }
    @Test fun recoverAfterCompatibleUpdate() {
        assertEquals(29, context.packageManager.getPackageInfo(context.packageName, 0).longVersionCode.toInt())
        check(saved().getBoolean("deleted")); recoverAfterRestart()
        val b = saved(); val v = store.inspect().vault!!; val r = v.records.first().copy(id = b.getString("second"), retentionDecision = memoryId())
        block { store.retain(r, v.generation, r.retentionDecision, r.recordedAt) }
    }
    @Test fun interruptionAndMissingKey() {
        // Dedicated extra stores/aliases; do not damage the UI's retained demonstration records.
        for (label in listOf("pending", "published", "finished", "tamper", "missing")) {
            val dir = File(context.noBackupFilesDir, "a17-fault-$label")
            check(!dir.exists()) { "Original fault run may exist; reconcile, do not repeat" }
            val alias = AndroidMemoryKeyProvider.ALIAS + ".qualification." + label
            val provider = AndroidMemoryKeyProvider(alias)
            val secondary = DevelopmentMemoryStore(dir, provider, ::syncMemoryDirectory)
            secondary.initialize(memoryId(), System.currentTimeMillis())
            val r = DevelopmentRecord(memoryId(), MemoryKind.NOTE, "Public synthetic fault fixture", "synthetic:a17-fault", null, EvidenceClass.OBSERVATION, ExecutionClaim.UNKNOWN, null, System.currentTimeMillis(), memoryId())
            secondary.retain(r, 0, r.retentionDecision, r.recordedAt)
            when (label) {
                "tamper" -> { val f = File(dir, "vault.enc"); val bytes = f.readBytes(); bytes[bytes.lastIndex] = (bytes.last().toInt() xor 1).toByte(); f.writeBytes(bytes); block { secondary.inspect() }; assertArrayEquals(bytes, f.readBytes()) }
                "missing" -> { KeyStore.getInstance("AndroidKeyStore").apply { load(null); deleteEntry(alias) }; assertEquals(MemoryPhase.MISSING_KEY, secondary.inspect().phase); assertNull(provider.existing()) }
                else -> {
                    val fault = DevelopmentMemoryStore(dir, provider, ::syncMemoryDirectory, { if (it == label) throw MemoryFailure("Synthetic interruption") })
                    block { fault.delete(listOf(r.id), 1, memoryId(), System.currentTimeMillis()) }
                    if (secondary.inspect().phase == MemoryPhase.WRITE_PENDING) secondary.reconcile()
                    val v = secondary.inspect().vault!!; assertTrue(v.records.isEmpty()); assertTrue(r.id in v.deleted); assertEquals(3, v.audit.size)
                }
            }
        }
        recoverAfterRestart()
    }
}
