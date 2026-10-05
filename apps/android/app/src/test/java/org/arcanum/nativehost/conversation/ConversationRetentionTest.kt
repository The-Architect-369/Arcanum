package org.arcanum.nativehost.conversation

import org.arcanum.nativehost.memory.*
import org.junit.Assert.*
import org.junit.Test
import java.nio.file.Files
import java.util.UUID
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey

class ConversationRetentionTest {
    private val profile = ConversationProfile("a".repeat(64), "home-local-ollama", "fixture", "b".repeat(64), "local", "advisory")
    private fun store(): DevelopmentMemoryStore {
        val keys = object : MemoryKeyProvider {
            var key: SecretKey? = null
            override fun existing() = key
            override fun create(): SecretKey = KeyGenerator.getInstance("AES").apply { init(256) }.generateKey().also { key = it }
        }
        return DevelopmentMemoryStore(Files.createTempDirectory("retention").toFile(), keys, {})
    }
    @Test fun reviewDoesNotWriteAndSavePreservesProvenanceAcrossRestart() {
        val s = store(); val v = s.initialize(UUID.randomUUID().toString(), 1)
        val d = ConversationDraft.prepare(profile, "Explain public evidence", v, emptyList())
        val r = ConversationRetention.review(d, ConversationReply("A proposed improvement", false), "Selected improvement", v, 2)
        assertEquals(0, s.inspect().vault!!.records.size)
        val saved = r.save(s).records.single()
        assertEquals("Selected improvement", saved.text)
        assertEquals(EvidenceClass.INFERENCE, saved.evidence); assertEquals(ExecutionClaim.NOT_APPLICABLE, saved.execution)
        assertTrue(saved.source.contains(d.id)); assertTrue(saved.sourceRevision!!.contains(d.digest))
        assertEquals(saved, s.inspect().vault!!.records.single())
        assertTrue(runCatching { r.save(s) }.isFailure)
        s.delete(listOf(saved.id), 1, UUID.randomUUID().toString(), 3)
        assertTrue(runCatching { ConversationRetention.review(d, ConversationReply("A proposed improvement", false), "Same outcome", s.inspect().vault!!, 4) }.isFailure)
    }
    @Test fun staleReviewAndSensitiveOrOversizeOutcomeFailWithoutRetention() {
        val s = store(); val v = s.initialize(UUID.randomUUID().toString(), 1)
        val d = ConversationDraft.prepare(profile, "Explain", v, emptyList()); val reply = ConversationReply("Advisory", false)
        for (bad in listOf("", "password=not-for-memory", "x".repeat(4097))) {
            assertTrue(runCatching { ConversationRetention.review(d, reply, bad, v, 2) }.isFailure)
        }
        val first = ConversationRetention.review(d, reply, "Reviewed", v, 2)
        val other = ConversationRetention.review(ConversationDraft.prepare(profile, "Other", v, emptyList()), reply, "Other", v, 3)
        other.save(s)
        assertTrue(runCatching { first.save(s) }.isFailure)
        assertEquals(1, s.inspect().vault!!.records.size)
    }
}
