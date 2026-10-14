package org.arcanum.nativehost.hope

import java.io.File
import java.io.FileOutputStream
import java.io.RandomAccessFile
import java.util.UUID

class HopeDeleteSelection internal constructor(internal val id: String, internal val archived: Boolean, internal val revision: String) {
    override fun toString(): String = "HopeDeleteSelection([private])"
}

/** A single encrypted collection. Corruption affects the whole vault; no silent reconstruction. */
class HopeCollectionStore(
    private val root: File,
    private val keys: HopeSecretKeyProvider,
    private val contract: HopeRuntimeContract,
    private val command: (String, String, String) -> String = HopeRuntimeBridge::collection,
    private val checkpoint: (String) -> Unit = {},
) {
    private val directory = File(root, "hope")
    private val target = File(root, "hope/collection.v0.1.enc")
    private val marker = File(directory, "collection.initialized")
    private val legacyFile = File(root, contract.storageRelativePath)
    private val protected = HopeProtectedStore(root, keys, contract, "hope/collection.v0.1.enc")

    // Serialize all instances in this process and cooperating processes before reading state.
    private fun <T> locked(action: () -> T): T = synchronized(MUTEX) {
        if (!directory.exists() && !directory.mkdirs()) throw HopeStatePersistenceException("Hope directory unavailable")
        RandomAccessFile(File(directory, "collection.lock"), "rw").use { file ->
            file.channel.lock().use { action() }
        }
    }

    fun browse(archived: Boolean = false): List<HopeLocalState> = locked {
        val state = open(false) ?: return@locked emptyList()
        HopeCollectionCodec.entries(state, command(state.snapshot, if (archived) "browse-archived" else "browse", ""))
    }

    fun save(record: HopeLocalState) = locked {
        HopeLocalStateCodec.encode(record)
        command(command("", "new", ""), "save", record.reflectionJson)
        val state = open(true)!!
        val snapshot = command(state.snapshot, "save", record.reflectionJson)
        commit(HopeCollectionState(snapshot, state.receipts + (record.receipt.reflectionId to record.receipt), UUID.randomUUID().toString()))
    }

    fun archive(id: String) = change("archive", id)
    fun restore(id: String) = change("restore", id)
    private fun change(operation: String, id: String) = locked {
        val state = open(false) ?: throw HopeStateMissingException("Hope collection missing")
        commit(HopeCollectionState(command(state.snapshot, operation, id), state.receipts, UUID.randomUUID().toString()))
    }

    fun prepareDelete(id: String, archived: Boolean): HopeDeleteSelection = locked {
        val state = open(false) ?: throw HopeStateMissingException("Hope collection missing")
        val entries = HopeCollectionCodec.entries(state, command(state.snapshot, if (archived) "browse-archived" else "browse", ""))
        require(entries.any { it.receipt.reflectionId == id }) { "Hope selection unavailable" }
        HopeDeleteSelection(id, archived, state.revision)
    }

    fun delete(selection: HopeDeleteSelection, confirmed: Boolean) = locked {
        if (!confirmed) return@locked
        val state = open(false) ?: throw HopeStateMissingException("Hope collection missing")
        require(state.revision == selection.revision) { "Hope deletion selection is stale" }
        val snapshot = command(state.snapshot, if (selection.archived) "delete-archived" else "delete-active", selection.id)
        commit(HopeCollectionState(snapshot, state.receipts - selection.id, UUID.randomUUID().toString()))
    }

    private fun open(create: Boolean): HopeCollectionState? {
        if (target.exists()) {
            val state = HopeCollectionCodec.decode(protected.recoverExact(), command)
            markInitialized()
            cleanupLegacy()
            return state
        }
        // Never infer a new vault or re-import an old record after a collection existed.
        if (marker.exists()) throw HopeStateMissingException("Initialized Hope collection missing; preserved data requires recovery")
        if (legacyFile.exists()) {
            val bytes = HopeProtectedStore(root, keys, contract).recoverExact()
            val old = try { HopeLocalStateCodec.decode(bytes) } catch (_: Exception) {
                throw HopeStateCorruptException("Legacy Hope record validation failed")
            }
            val empty = command("", "new", "")
            val migrated = HopeCollectionState(command(empty, "save", old.reflectionJson), mapOf(old.receipt.reflectionId to old.receipt), UUID.randomUUID().toString())
            checkpoint("legacy-validated")
            // Write the presence marker first: an interrupted first write fails closed and
            // preserves legacy bytes, rather than guessing whether migration ever committed.
            markInitialized()
            commit(migrated)
            checkpoint("collection-verified")
            cleanupLegacy()
            return migrated
        }
        if (keys.getExisting() != null) throw HopeStateMissingException("Hope files missing for existing key")
        if (!create) return null
        keys.getOrCreate()
        markInitialized()
        val empty = HopeCollectionState(command("", "new", ""), emptyMap(), UUID.randomUUID().toString())
        commit(empty)
        return empty
    }

    private fun commit(state: HopeCollectionState) {
        val bytes = HopeCollectionCodec.encode(state)
        if (bytes.size > MAX_BYTES) throw HopeStatePersistenceException("Hope storage capacity reached; retained reflections unchanged")
        HopeCollectionCodec.decode(bytes, command)
        checkpoint("before-write")
        protected.persistExact(bytes)
        checkpoint("after-write")
        val recovered = protected.recoverExact()
        if (!bytes.contentEquals(recovered)) throw HopeStateCorruptException("Hope committed state could not be verified")
        HopeCollectionCodec.decode(recovered, command)
    }

    private fun markInitialized() {
        if (!marker.exists()) {
            FileOutputStream(marker).use { it.write(1); it.fd.sync() }
            syncDirectory(directory)
            checkpoint("marker-written")
        }
    }

    private fun cleanupLegacy() {
        for (file in listOf(legacyFile, File(directory, "${legacyFile.name}.tmp"), File(directory, "${target.name}.tmp"))) {
            if (file.exists() && !file.delete()) throw HopeStatePersistenceException("Hope migration cleanup incomplete")
        }
        syncDirectory(directory)
    }

    companion object {
        private val MUTEX = Any()
        private const val MAX_BYTES = 16 * 1024 * 1024
    }
}
