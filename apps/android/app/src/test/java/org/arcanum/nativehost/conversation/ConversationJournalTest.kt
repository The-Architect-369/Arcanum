package org.arcanum.nativehost.conversation

import org.arcanum.nativehost.memory.MemoryKeyProvider
import org.junit.Assert.*
import org.junit.Test
import java.nio.file.Files
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey

class ConversationJournalTest {
    private class Keys : MemoryKeyProvider {
        var value: SecretKey? = null
        override fun existing() = value
        override fun create() = KeyGenerator.getInstance("AES").apply { init(256) }.generateKey().also { value = it }
    }
    private fun draft() = ConversationDraft.prepare(ConversationProfile("a".repeat(64), "home-local-ollama", "qwen3:4b", "b".repeat(64), "Session only", "Advisory"), "Distinctive private prompt never stored", null, emptyList())
    @Test fun encryptedIntentSurvivesReopenAndDuplicateIsRejected() {
        val dir = Files.createTempDirectory("a18-journal").toFile()
        try {
            val keys = Keys(); val d = draft(); var synced = false
            val journal = ConversationJournal(dir, keys) { synced = true }
            journal.record(d, 1)
            assertTrue(synced)
            val reopened = ConversationJournal(dir, keys) {}
            assertEquals(d.id, reopened.latest()!!.getString("requestId"))
            assertEquals("unknown", reopened.latest()!!.getString("state"))
            assertFalse(dir.listFiles()!!.any { it.readText().contains("Distinctive private prompt") || it.readText().contains(d.digest) })
            try { reopened.record(d, 2); fail("replay") } catch (_: IllegalArgumentException) {}
            keys.value = null
            try { reopened.latest(); fail("missing key") } catch (_: IllegalArgumentException) {}
            try { reopened.record(draft(), 3); fail("replacement key") } catch (_: IllegalArgumentException) {}
            assertNull(keys.value)
        } finally { dir.deleteRecursively() }
    }
    @Test fun corruptedIntentBlocksFurtherSends() {
        val dir = Files.createTempDirectory("a18-journal").toFile()
        try {
            val keys = Keys(); val journal = ConversationJournal(dir, keys) {}; val d = draft()
            journal.record(d, 1)
            java.io.File(dir, "${d.id}.enc").writeBytes(byteArrayOf(1,2,3))
            try { journal.record(draft(), 2); fail("corrupt intent") } catch (_: IllegalArgumentException) {}
            assertEquals(1, dir.listFiles()!!.count { it.extension == "enc" })
        } finally { dir.deleteRecursively() }
    }
}
