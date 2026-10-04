package org.arcanum.nativehost.conversation

import org.arcanum.nativehost.memory.*
import java.util.UUID

/** A separately reviewed local outcome; neither Send nor a model answer authorizes retention. */
class ConversationRetention private constructor(val record: DevelopmentRecord, val generation: Long) {
    fun save(store: DevelopmentMemoryStore): MemoryVault =
        store.retain(record, generation, record.retentionDecision, record.recordedAt)

    companion object {
        fun review(draft: ConversationDraft, reply: ConversationReply, selectedText: String, vault: MemoryVault, at: Long): ConversationRetention {
            // Stable per-response identity rejects duplicate saves, including after deletion.
            val record = DevelopmentRecord(draft.id, MemoryKind.NOTE, selectedText,
                "architect-conversation:${draft.id}; provider=${draft.profile.provider}; model=${draft.profile.model}; modelDigest=${draft.profile.digest}",
                "request-sha256:${draft.digest}; response-sha256:${memoryDigest(reply.text.toByteArray())}",
                EvidenceClass.INFERENCE, ExecutionClaim.NOT_APPLICABLE, null, at, UUID.randomUUID().toString())
            record.validate()
            require(record.id !in vault.deleted && vault.records.none { it.id == record.id }) { "This outcome was already retained or deleted." }
            return ConversationRetention(record, vault.generation)
        }
    }
}
