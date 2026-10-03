package org.arcanum.nativehost.conversation

import org.arcanum.nativehost.memory.MemoryKeyProvider
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream
import java.io.RandomAccessFile
import java.nio.file.Files
import java.nio.file.LinkOption
import javax.crypto.Cipher
import javax.crypto.spec.GCMParameterSpec

/** Append-only encrypted send-intent metadata. Never stores conversation or credential bodies. */
class ConversationJournal(private val directory: File, private val keys: MemoryKeyProvider, private val syncDirectory: (File) -> Unit) {
    private val aad = "org.arcanum.architect.conversation-journal/v1".toByteArray()
    init {
        if (!directory.exists()) {
            require(directory.mkdirs())
            syncDirectory(requireNotNull(directory.parentFile))
        }
        require(Files.isDirectory(directory.toPath(), LinkOption.NOFOLLOW_LINKS))
    }
    private fun <T> locked(block: () -> T): T = RandomAccessFile(File(directory, "journal.lock"), "rw").use { file ->
        file.channel.lock().use { block() }
    }
    fun record(draft: ConversationDraft, at: Long) = locked {
        val files = entries()
        require(files.size < 1000 && at > 0)
        // Existing encrypted evidence without its key must never create a replacement key.
        val key = keys.existing() ?: run { require(files.isEmpty()); keys.create() }
        readLatest(files, key) // Authenticate every prior intent before allowing another send.
        val target = File(directory, "${draft.id}.enc")
        require(!target.exists())
        val body = JSONObject().put("requestId", draft.id).put("requestDigest", draft.digest).put("profileId", draft.profile.id)
            .put("at", at).put("state", "unknown").toString().toByteArray()
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.ENCRYPT_MODE, key); cipher.updateAAD(aad)
        require(cipher.iv.size == 12)
        require(target.createNewFile())
        FileOutputStream(target).use { it.write(cipher.iv + cipher.doFinal(body)); it.fd.sync() }
        syncDirectory(directory)
        // Any failure above blocks send. A partial journal remains preserved and blocks subsequent use.
    }
    fun latest(): JSONObject? = locked {
        val files = entries()
        if (files.isEmpty()) return@locked null
        val key = requireNotNull(keys.existing()) { "Journal key unavailable" }
        readLatest(files, key)
    }
    private fun readLatest(files: List<File>, key: javax.crypto.SecretKey): JSONObject? =
        files.map { file ->
            require(file.length() in 29..2048 && Files.isRegularFile(file.toPath(), LinkOption.NOFOLLOW_LINKS))
            val bytes = file.readBytes()
            val cipher = Cipher.getInstance("AES/GCM/NoPadding")
            cipher.init(Cipher.DECRYPT_MODE, key, GCMParameterSpec(128, bytes.copyOfRange(0,12))); cipher.updateAAD(aad)
            JSONObject(cipher.doFinal(bytes.copyOfRange(12,bytes.size)).toString(Charsets.UTF_8)).also {
                require(it.getString("requestId") + ".enc" == file.name)
            }
        }.maxByOrNull { it.getLong("at") }
    private fun entries(): List<File> = requireNotNull(directory.listFiles()).filter { it.name != "journal.lock" }.also {
        require(it.size <= 1000 && it.all { file -> file.name.matches(Regex("[0-9a-f-]{36}\\.enc")) })
    }
}
