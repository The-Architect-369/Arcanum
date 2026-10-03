package org.arcanum.nativehost.memory

import java.nio.file.Files
import java.io.File
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import org.junit.Assert.*
import org.junit.Test

class DevelopmentMemoryStoreTest {
    private class Keys : MemoryKeyProvider {
        var key: SecretKey? = null
        override fun existing() = key
        override fun create(): SecretKey = KeyGenerator.getInstance("AES").apply { init(256) }.generateKey().also { key = it }
    }
    private fun record(id: String = memoryId(), op: String = memoryId(), text: String = "Synthetic development note"): DevelopmentRecord =
        DevelopmentRecord(id, MemoryKind.NOTE, text, "synthetic:qualification", "v1", EvidenceClass.REPORT, ExecutionClaim.UNKNOWN, null, 1, op)
    private fun fixture(block: (File, Keys, DevelopmentMemoryStore) -> Unit) {
        val root = Files.createTempDirectory("a17-memory-").toFile(); val keys = Keys(); val store = DevelopmentMemoryStore(root, keys, {})
        try { block(root, keys, store) } finally { root.deleteRecursively() }
    }
    private fun blocked(action: () -> Any?) { try { action(); fail("Expected rejection") } catch (_: MemoryFailure) { } }
    @Test fun openDoesNotProvisionAndMissingKeyNeverRecreates() = fixture { root, keys, store ->
        assertEquals(MemoryPhase.NOT_INITIALIZED, store.inspect().phase); assertNull(keys.key)
        store.initialize(memoryId(), 1); keys.key = null
        assertEquals(MemoryPhase.MISSING_KEY, store.inspect().phase); assertNull(keys.key)
        blocked { store.initialize(memoryId(), 1) }; assertTrue(File(root, "vault.enc").exists()); assertNull(keys.key)
    }
    @Test fun encryptedMultipleRecordsSurviveReopenWithOriginalAttribution() = fixture { root, keys, store ->
        store.initialize(memoryId(), 1)
        val a = record(); val b = record(text = "Another selected decision").copy(kind = MemoryKind.DECISION, evidence = EvidenceClass.PROPOSAL)
        store.retain(a, 0, a.retentionDecision, 1); store.retain(b, 1, b.retentionDecision, 1)
        val saved = DevelopmentMemoryStore(root, keys, {}).inspect().vault!!
        assertEquals(listOf(a, b), saved.records); assertEquals(ExecutionClaim.UNKNOWN, saved.records.first().execution)
        assertFalse(File(root, "vault.enc").readText().contains(a.text))
    }
    @Test fun deletionRemovesContentAndRejectsResurrectionAndStalePreview() = fixture { root, keys, store ->
        store.initialize(memoryId(), 1); val r = record(); store.retain(r, 0, r.retentionDecision, 1)
        assertTrue(store.preview(listOf(r.id), 1, memoryId()).json.contains(r.text))
        store.delete(listOf(r.id), 1, memoryId(), 2)
        val reopened = DevelopmentMemoryStore(root, keys, {})
        assertTrue(reopened.inspect().vault!!.records.isEmpty()); assertTrue(r.id in reopened.inspect().vault!!.deleted)
        blocked { reopened.retain(r, 2, r.retentionDecision, 1) }
        blocked { reopened.preview(listOf(r.id), 1, memoryId()) }
        blocked { reopened.preview(listOf(r.id), 2, memoryId()) }
        assertFalse(root.listFiles()!!.any { it.name.endsWith(".enc") && it.readText().contains(r.text) })
    }
    @Test fun privateNamespacesAndObviousCredentialsAreDenied() = fixture { _, _, store ->
        store.initialize(memoryId(), 1)
        for (r in listOf(record().copy(namespace = "hope"), record(text = "password=not-a-real-password"), record().copy(source = "hope/reflections"))) {
            blocked { store.retain(r, 0, r.retentionDecision, 1) }
        }
        assertTrue(store.inspect().vault!!.records.isEmpty())
    }
    @Test fun previewContainsOnlySelectionAndCannotInventExecutionSuccess() = fixture { _, _, store ->
        store.initialize(memoryId(), 1); val a = record(); val b = record(text = "Unselected synthetic note")
        store.retain(a, 0, a.retentionDecision, 1); store.retain(b, 1, b.retentionDecision, 1)
        val preview = store.preview(listOf(a.id), 2, memoryId())
        assertTrue(preview.json.contains(a.text)); assertFalse(preview.json.contains(b.text)); assertTrue(preview.json.contains("UNKNOWN")); assertTrue(preview.json.contains("local-preview"))
        blocked { store.preview(listOf(a.id, a.id), 2, memoryId()) }
    }
    @Test fun interruptedDeletionReconcilesOriginalBeforeOrAfterPublication() {
        for (boundary in listOf("pending", "published", "finished")) fixture { root, keys, store ->
            store.initialize(memoryId(), 1); val r = record(); store.retain(r, 0, r.retentionDecision, 1)
            val failing = DevelopmentMemoryStore(root, keys, {}, { if (it == boundary) throw MemoryFailure("Injected interruption") })
            blocked { failing.delete(listOf(r.id), 1, memoryId(), 2) }
            val reopened = DevelopmentMemoryStore(root, keys, {})
            if (boundary == "finished") assertEquals(MemoryPhase.READY, reopened.inspect().phase)
            else { assertEquals(MemoryPhase.WRITE_PENDING, reopened.inspect().phase); reopened.reconcile() }
            val v = reopened.inspect().vault!!; assertTrue(v.records.isEmpty()); assertTrue(r.id in v.deleted); assertEquals(3, v.audit.size)
        }
    }
    @Test fun tamperingFailsClosedWithoutReset() = fixture { root, _, store ->
        store.initialize(memoryId(), 1); val p = File(root, "vault.enc"); val bytes = p.readBytes(); bytes[bytes.lastIndex] = (bytes.last().toInt() xor 1).toByte(); p.writeBytes(bytes)
        blocked { store.inspect() }; assertArrayEquals(bytes, p.readBytes())
    }
    @Test fun staleRetentionAndDuplicateIdNeverOverwriteHistory() = fixture { _, _, store ->
        store.initialize(memoryId(), 1); val r = record(); store.retain(r, 0, r.retentionDecision, 1)
        blocked { store.retain(record(), 0, memoryId(), 1) }
        blocked { store.retain(r, 1, r.retentionDecision, 1) }
        assertEquals(listOf(r), store.inspect().vault!!.records)
    }
    @Test fun corruptPendingIsPreservedAndNeverRebuiltFromANewRequest() = fixture { root, keys, store ->
        store.initialize(memoryId(), 1)
        val r = record()
        val fault = DevelopmentMemoryStore(root, keys, {}, { if (it == "pending") throw MemoryFailure("interrupted") })
        blocked { fault.retain(r, 0, r.retentionDecision, 1) }
        val pending = File(root, "pending.enc"); val b = pending.readBytes(); b[b.lastIndex] = (b.last().toInt() xor 1).toByte(); pending.writeBytes(b)
        blocked { store.reconcile() }; blocked { store.retain(r, 0, r.retentionDecision, 1) }
        assertArrayEquals(b, pending.readBytes())
    }
    @Test fun noPlaintextOrDeletedSourceIsRetainedInLogicalVault() = fixture { _, _, store ->
        store.initialize(memoryId(), 1); val r = record(); store.retain(r, 0, r.retentionDecision, 1)
        store.delete(listOf(r.id), 1, memoryId(), 2)
        val bytes = store.inspect().vault!!.bytes().toString(Charsets.UTF_8)
        assertFalse(bytes.contains(r.text)); assertFalse(bytes.contains(r.source))
    }

}
