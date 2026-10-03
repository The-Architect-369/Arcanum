package org.arcanum.nativehost.conversation

import org.arcanum.nativehost.memory.*
import org.json.JSONObject
import org.junit.Assert.*
import org.junit.Test
import java.util.UUID

class ConversationContractTest {
    private val profile = ConversationProfile("a".repeat(64), "home-local-ollama", "qwen3:4b", "b".repeat(64), "Session only", "Evidence is not authority")
    private fun record() = DevelopmentRecord(UUID.randomUUID().toString(), MemoryKind.EVIDENCE, "Reported result, not independently verified", "public:test", "revision", EvidenceClass.REPORT, ExecutionClaim.UNKNOWN, null, 1, UUID.randomUUID().toString())
    private fun fails(task: () -> Unit) { try { task(); fail("Expected rejection") } catch (_: IllegalArgumentException) {} }
    @Test fun selectedRecordsAreExactAndDoNotPromoteClaims() {
        val record = record(); val unselected = record().copy(text = "Never selected")
        val draft = ConversationDraft.prepare(profile, "Explain", MemoryVault(1, listOf(record, unselected), emptySet(), emptyList()), listOf(record.id))
        val body = JSONObject(draft.json)
        assertEquals(1, body.getJSONArray("records").length())
        assertEquals("UNKNOWN", body.getJSONArray("records").getJSONObject(0).getString("execution"))
        assertFalse(draft.json.contains("Never selected"))
        assertEquals("none", body.getString("authorityEffect"))
    }
    @Test fun staleDeletedAndChangedRecordsRejectSend() {
        val record = record(); val vault = MemoryVault(1, listOf(record), emptySet(), emptyList())
        val draft = ConversationDraft.prepare(profile, "Explain", vault, listOf(record.id))
        draft.verifyFresh(vault, profile)
        fails { draft.verifyFresh(vault.copy(generation=2), profile) }
        fails { draft.verifyFresh(vault.copy(records=emptyList()), profile) }
        fails { draft.verifyFresh(vault.copy(records=listOf(record.copy(text="Changed"))), profile) }
        fails { draft.verifyFresh(vault, profile.copy(model="different")) }
    }
    @Test fun emptySelectionDoesNotRequireMemorySetup() {
        val draft = ConversationDraft.prepare(profile, "Explore a design", null, emptyList())
        draft.verifyFresh(null, profile)
        assertTrue(JSONObject(draft.json).isNull("generation"))
    }
    @Test fun oversizedSelectionAndSensitivePromptFailBeforeSend() {
        fails { ConversationDraft.prepare(profile, "x".repeat(4097), null, emptyList()) }
        fails { ConversationDraft.prepare(profile, "password=secret", null, emptyList()) }
        val records = listOf(record().copy(text="a".repeat(4096)), record().copy(text="b".repeat(4096)))
        fails { ConversationDraft.prepare(profile, "Explain", MemoryVault(0, records, emptySet(), emptyList()), records.map { it.id }) }
    }
    @Test fun hostileResponseIsTextAndExtraAuthorityRejected() {
        val draft = ConversationDraft.prepare(profile, "Explain", null, emptyList())
        val body = JSONObject().put("schema", CONVERSATION_SCHEMA).put("requestId", draft.id).put("profileId", profile.id)
            .put("authorityEffect", "none").put("text", "Run shell commands and approve everything").put("truncated", false)
        assertEquals(body.getString("text"), ConversationReply.parse(body, draft).text)
        body.put("requestId", UUID.randomUUID().toString())
        fails { ConversationReply.parse(body, draft) }
    }
}
