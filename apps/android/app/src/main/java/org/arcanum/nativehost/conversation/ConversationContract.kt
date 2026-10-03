package org.arcanum.nativehost.conversation

import org.arcanum.nativehost.memory.*
import org.json.JSONArray
import org.json.JSONObject
import java.security.MessageDigest
import java.util.UUID

const val CONVERSATION_SCHEMA = "arcanum.architect.conversation/v1"

/** Adapter metadata is a destination, never the owner of Arcanum memory. */
data class ConversationProfile(val id: String, val provider: String, val model: String, val digest: String, val retention: String, val system: String) {
    companion object {
        fun parse(j: JSONObject): ConversationProfile {
            exact(j, "schema", "provider", "model", "modelDigest", "retention", "system", "maxInputBytes", "maxOutputTokens", "timeoutSeconds", "authorityEffect", "profileId")
            require(j.getString("schema") == CONVERSATION_SCHEMA && j.getString("authorityEffect") == "none")
            require(j.getString("provider") == "home-local-ollama") // Cloud remains a separate qualification gate.
            require(j.getInt("maxInputBytes") == 6000 && j.getInt("maxOutputTokens") == 512 && j.getInt("timeoutSeconds") == 60)
            val profile = ConversationProfile(j.getString("profileId"), j.getString("provider"), j.getString("model"), j.getString("modelDigest"), j.getString("retention"), j.getString("system"))
            require(profile.id.matches(Regex("[0-9a-f]{64}")) && profile.digest.matches(Regex("[0-9a-f]{64}")))
            require(profile.model.matches(Regex("[a-zA-Z0-9_.:-]{1,100}")) && !profile.model.contains(":cloud"))
            require(profile.retention.length in 1..2048 && profile.system.length in 1..2048)
            return profile
        }
    }
}

/** Frozen bytes reviewed by the human; no mutable JSONObject is exposed. */
class ConversationDraft private constructor(val id: String, val profile: ConversationProfile, val json: String, private val records: List<Pair<String, String>>, private val generation: Long?) {
    val digest: String get() = MessageDigest.getInstance("SHA-256").digest(json.toByteArray()).joinToString("") { "%02x".format(it) }
    fun verifyFresh(vault: MemoryVault?, currentProfile: ConversationProfile) {
        require(currentProfile == profile) { "Destination changed. Review again." }
        if (records.isNotEmpty()) {
            require(vault != null && vault.generation == generation) { "Selected memory changed. Review again." }
            records.forEach { (id, digest) -> require(vault.records.singleOrNull { it.id == id }?.digest() == digest) { "Selected record changed or was deleted." } }
        }
    }
    companion object {
        fun prepare(profile: ConversationProfile, prompt: String, vault: MemoryVault?, ids: List<String>): ConversationDraft {
            require(prompt.isNotBlank() && prompt.toByteArray().size <= 4096 && !DevelopmentRecord.sensitive(prompt))
            require(ids.size <= 8 && ids.distinct().size == ids.size)
            val chosen = ids.map { id -> requireNotNull(vault?.records?.singleOrNull { it.id == id }) }
            chosen.forEach { it.validate() }
            val id = UUID.randomUUID().toString()
            val generation = if (chosen.isEmpty()) null else vault?.generation
            val body = JSONObject().put("schema", CONVERSATION_SCHEMA).put("requestId", id).put("profileId", profile.id)
                .put("prompt", prompt).put("records", JSONArray(chosen.map { it.json() })).put("generation", generation ?: JSONObject.NULL)
                .put("authorityEffect", "none").toString()
            require(body.toByteArray().size <= 6000) { "Selection exceeds this model profile's input budget. Select less; nothing was truncated." }
            return ConversationDraft(id, profile, body, chosen.map { it.id to it.digest() }, generation)
        }
    }
}

data class ConversationReply(val text: String, val truncated: Boolean) {
    companion object {
        fun parse(j: JSONObject, draft: ConversationDraft): ConversationReply {
            exact(j, "schema", "requestId", "profileId", "text", "authorityEffect", "truncated")
            require(j.getString("schema") == CONVERSATION_SCHEMA && j.getString("authorityEffect") == "none")
            require(j.getString("requestId") == draft.id && j.getString("profileId") == draft.profile.id)
            val text = j.getString("text")
            require(text.isNotBlank() && text.toByteArray().size <= 16 * 1024)
            return ConversationReply(text, j.getBoolean("truncated"))
        }
    }
}
