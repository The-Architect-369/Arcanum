package org.arcanum.nativehost.memory

import java.io.File
import java.io.FileOutputStream
import java.io.RandomAccessFile
import java.nio.file.Files
import java.nio.file.LinkOption
import java.nio.file.StandardCopyOption
import javax.crypto.Cipher
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec
import org.json.JSONObject

interface MemoryKeyProvider { fun existing(): SecretKey?; fun create(): SecretKey }
enum class MemoryPhase { NOT_INITIALIZED, SETUP_PENDING, READY, WRITE_PENDING, MISSING_KEY, BLOCKED }
data class MemoryInspection(val phase: MemoryPhase, val vault: MemoryVault? = null)

/** Protected Android host custody. Plaintexts never become files. No Hope store or network dependency. */
class DevelopmentMemoryStore(
    val directory: File,
    private val keys: MemoryKeyProvider,
    private val syncDirectory: (File) -> Unit,
    private val boundary: (String) -> Unit = {},
) {
    private val target get() = File(directory, "vault.enc")
    private val pending get() = File(directory, "pending.enc")
    private val setup get() = File(directory, "setup.intent")
    private val aad = "org.arcanum.architect.development-memory/v1".toByteArray()
    private val magic = "ARCMEM01".toByteArray()
    init {
        if (!directory.exists()) memoryRequire(directory.mkdirs())
        memoryRequire(Files.isDirectory(directory.toPath(), LinkOption.NOFOLLOW_LINKS))
    }
    fun inspect(): MemoryInspection = guarded {
        when {
            File(directory, "publishing.enc").exists() && !pending.exists() -> MemoryInspection(MemoryPhase.BLOCKED)
            (target.exists() || pending.exists()) && keys.existing() == null -> MemoryInspection(MemoryPhase.MISSING_KEY)
            pending.exists() -> { readPending(); MemoryInspection(MemoryPhase.WRITE_PENDING) }
            target.exists() -> MemoryInspection(MemoryPhase.READY, load())
            setup.exists() -> { memoryRequire(setup.readText() == "a17-setup-v1"); MemoryInspection(MemoryPhase.SETUP_PENDING) }
            keys.existing() != null -> MemoryInspection(MemoryPhase.BLOCKED)
            else -> MemoryInspection(MemoryPhase.NOT_INITIALIZED)
        }
    }
    /** Explicit setup/complete-setup consent. Marker freezes intent before key creation. */
    fun initialize(operation: String, at: Long): MemoryVault = guarded {
        memoryRequire(operation.matches(DevelopmentRecord.UUID_PATTERN) && at > 0)
        if (pending.exists()) throw MemoryFailure("Reconcile original pending write first")
        if (target.exists()) return@guarded load()
        if (!setup.exists()) {
            memoryRequire(keys.existing() == null)
            newBytes(setup, "a17-setup-v1".toByteArray()); syncDirectory(directory)
        }
        memoryRequire(setup.readText() == "a17-setup-v1")
        if (keys.existing() == null) keys.create()
        val v = MemoryVault(0, emptyList(), emptySet(), listOf(MemoryAudit(operation, "initialize", at)))
        commit(null, v)
        memoryRequire(setup.delete()); syncDirectory(directory); v
    }
    fun retain(record: DevelopmentRecord, expectedGeneration: Long, operation: String, at: Long): MemoryVault = guarded {
        record.validate(); val v = ready(expectedGeneration)
        memoryRequire(record.id !in v.deleted && v.records.none { it.id == record.id })
        memoryRequire(record.retentionDecision == operation && record.recordedAt == at)
        val next = v.copy(generation = v.generation + 1, records = v.records + record, audit = v.audit + MemoryAudit(operation, "retain", at))
        commit(target.readBytes(), next); next
    }
    fun delete(ids: List<String>, expectedGeneration: Long, operation: String, at: Long): MemoryVault = guarded {
        val v = ready(expectedGeneration)
        memoryRequire(ids.isNotEmpty() && ids.distinct().size == ids.size && ids.all { id -> v.records.any { it.id == id } })
        val next = v.copy(generation = v.generation + 1, records = v.records.filterNot { it.id in ids }, deleted = v.deleted + ids,
            audit = v.audit + MemoryAudit(operation, "delete", at))
        commit(target.readBytes(), next); next
    }
    fun preview(ids: List<String>, expectedGeneration: Long, decision: String): SelectedMemoryContext = guarded {
        selectedMemoryContext(ready(expectedGeneration), ids, decision)
    }
    /** Reconcile only the original encrypted pending snapshot against its exact predecessor. */
    fun reconcile(): MemoryVault = guarded {
        val (base, next) = readPending()
        val current = if (target.exists()) memoryDigest(readFile(target)) else "absent"
        if (current != base) {
            // Rename may have committed before its acknowledgment/cleanup was lost.
            memoryRequire(target.exists() && load() == next)
            memoryRequire(!File(directory, "publishing.enc").exists())
            memoryRequire(pending.delete()); syncDirectory(directory)
            return@guarded next
        }
        // Pending envelope includes the complete original transaction; never rebuild from caller content.
        publish(next)
        memoryRequire(pending.delete()); syncDirectory(directory)
        next
    }
    private fun ready(expected: Long): MemoryVault {
        memoryRequire(!pending.exists() && !File(directory, "publishing.enc").exists()); return load().also { memoryRequire(it.generation == expected) }
    }
    private fun load(): MemoryVault = MemoryVault.decode(decrypt(readFile(target)))
    private fun commit(base: ByteArray?, next: MemoryVault) {
        memoryRequire(!pending.exists()); val body = next.bytes()
        val transaction = JSONObject().put("base", base?.let(::memoryDigest) ?: "absent").put("next", body.toString(Charsets.UTF_8)).toString().toByteArray()
        val encrypted = encrypt(transaction)
        // Reject oversized envelopes before creating a pending transaction we cannot read.
        memoryRequire(encrypted.size <= 2 * MemoryVault.MAX_VAULT_BYTES)
        newBytes(pending, encrypted); syncDirectory(directory); boundary("pending")
        publish(next); boundary("published")
        memoryRequire(pending.delete()); syncDirectory(directory); boundary("finished")
    }
    private fun readPending(): Pair<String, MemoryVault> {
        val j = JSONObject(decrypt(readFile(pending)).toString(Charsets.UTF_8)); exact(j, "base", "next")
        return j.getString("base") to MemoryVault.decode(j.getString("next").toByteArray())
    }
    private fun publish(v: MemoryVault) {
        val staging = File(directory, "publishing.enc")
        // A previously interrupted publication is reconciled by its authenticated content.
        if (staging.exists()) {
            val staged = MemoryVault.decode(decrypt(readFile(staging)))
            memoryRequire(staged == v)
        } else newBytes(staging, encrypt(v.bytes()))
        Files.move(staging.toPath(), target.toPath(), StandardCopyOption.ATOMIC_MOVE, StandardCopyOption.REPLACE_EXISTING)
        syncDirectory(directory)
    }
    private fun encrypt(b: ByteArray): ByteArray {
        val key = keys.existing() ?: throw MemoryFailure("Memory key is unavailable; no replacement was created")
        return Cipher.getInstance("AES/GCM/NoPadding").run {
            init(Cipher.ENCRYPT_MODE, key); memoryRequire(iv.size == 12); updateAAD(aad)
            magic + iv + doFinal(b)
        }
    }
    private fun decrypt(b: ByteArray): ByteArray {
        memoryRequire(b.size >= 36 && b.copyOfRange(0, 8).contentEquals(magic))
        val key = keys.existing() ?: throw MemoryFailure("Memory key is unavailable; no replacement was created")
        return try { Cipher.getInstance("AES/GCM/NoPadding").run {
            init(Cipher.DECRYPT_MODE, key, GCMParameterSpec(128, b.copyOfRange(8, 20))); updateAAD(aad); doFinal(b, 20, b.size - 20)
        } } catch (_: Exception) { throw MemoryFailure("Memory authentication failed; preserved without reset") }
    }
    private fun readFile(f: File): ByteArray {
        memoryRequire(Files.isRegularFile(f.toPath(), LinkOption.NOFOLLOW_LINKS) && f.length() <= 2 * MemoryVault.MAX_VAULT_BYTES)
        return f.inputStream().use { input ->
            val out = java.io.ByteArrayOutputStream(); val chunk = ByteArray(8192)
            while (true) { val n = input.read(chunk); if (n < 0) break; memoryRequire(out.size() + n <= 2 * MemoryVault.MAX_VAULT_BYTES); out.write(chunk, 0, n) }
            out.toByteArray()
        }
    }
    private fun newBytes(f: File, b: ByteArray) {
        memoryRequire(f.createNewFile()); FileOutputStream(f).use { it.write(b); it.fd.sync() }
    }
    private fun <T> guarded(block: () -> T): T {
        memoryRequire(directory.listFiles()?.all { it.name in setOf("vault.enc", "pending.enc", "publishing.enc", "setup.intent", "lock") } == true)
        val lock = File(directory, "lock")
        memoryRequire(!lock.exists() || Files.isRegularFile(lock.toPath(), LinkOption.NOFOLLOW_LINKS))
        return RandomAccessFile(lock, "rw").use { f ->
            val held = try { f.channel.tryLock() } catch (_: java.nio.channels.OverlappingFileLockException) { null }
            if (held == null) throw MemoryFailure("Memory is busy")
            try { block() } finally { held.release() }
        }
    }
}
