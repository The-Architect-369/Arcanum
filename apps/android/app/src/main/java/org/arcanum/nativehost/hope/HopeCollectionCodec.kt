package org.arcanum.nativehost.hope

import org.json.JSONArray
import org.json.JSONObject
import java.util.UUID

/** Private plaintext boundary. Never place this state in diagnostics or model context. */
class HopeCollectionState(val snapshot: String, val receipts: Map<String, HopeLocalReceipt>, val revision: String) {
    override fun toString(): String = "HopeCollectionState([private])"
}

object HopeCollectionCodec {
    fun encode(state: HopeCollectionState): ByteArray {
        val receipts = JSONObject()
        state.receipts.forEach { (id, receipt) -> receipts.put(id, receipt.toJson()) }
        return JSONObject().put("version", 1).put("snapshot", state.snapshot)
            .put("receipts", receipts).put("revision", state.revision).toString().toByteArray(Charsets.UTF_8)
    }

    fun decode(bytes: ByteArray, command: (String, String, String) -> String): HopeCollectionState {
        try {
            val json = JSONObject(String(bytes, Charsets.UTF_8))
            if (json.getInt("version") != 1) throw HopeUnsupportedVersionException()
            val snapshot = json.getString("snapshot")
            if (JSONObject(snapshot).getString("version") != "hope.collection.v0.1") throw HopeUnsupportedVersionException()
            command(snapshot, "validate", "")
            val revision = json.getString("revision")
            require(UUID.fromString(revision).toString() == revision)
            val records = JSONObject(snapshot).getJSONArray("entries")
            val receiptsJson = json.getJSONObject("receipts")
            require(records.length() == receiptsJson.length())
            val receipts = mutableMapOf<String, HopeLocalReceipt>()
            for (i in 0 until records.length()) {
                val entry = records.getJSONObject(i)
                val id = entry.getString("id")
                val receipt = HopeLocalReceipt.fromJson(receiptsJson.getJSONObject(id))
                // Verify exact historical bytes against the unchanged local receipt.
                HopeLocalStateCodec.encode(HopeLocalState(entry.getString("reflectionJson"), receipt))
                receipts[id] = receipt
            }
            return HopeCollectionState(snapshot, receipts, revision)
        } catch (error: HopeUnsupportedVersionException) { throw error
        } catch (_: Exception) { throw HopeStateCorruptException("Hope collection validation failed") }
    }

    fun entries(state: HopeCollectionState, ids: String): List<HopeLocalState> {
        val byId = mutableMapOf<String, String>()
        val entries = JSONObject(state.snapshot).getJSONArray("entries")
        for (i in 0 until entries.length()) {
            val entry = entries.getJSONObject(i)
            byId[entry.getString("id")] = entry.getString("reflectionJson")
        }
        val order = JSONArray(ids)
        return (0 until order.length()).map { i ->
            val id = order.getString(i)
            HopeLocalState(byId.getValue(id), state.receipts.getValue(id))
        }
    }
}
