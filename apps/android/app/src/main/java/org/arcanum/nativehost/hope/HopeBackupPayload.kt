package org.arcanum.nativehost.hope

import java.io.ByteArrayOutputStream
import java.io.InputStream
import java.security.MessageDigest
import org.json.JSONTokener

class HopeRestoreRefusedException : HopeStoreException("Restore requires a new, uninitialized vault; existing data preserved")

class HopeRestorePreview internal constructor(private val payload: ByteArray, val activeCount: Int, val archivedCount: Int) : AutoCloseable {
    private var closed = false
    @Synchronized internal fun copyPayload(): ByteArray { check(!closed) { "Restore preview expired" }; return payload.copyOf() }
    @Synchronized override fun close() { closed = true; payload.fill(0) }
    override fun toString(): String = "HopeRestorePreview([private])"
}

object HopeBackupPayload {
    fun digest(bytes: ByteArray): ByteArray = MessageDigest.getInstance("SHA-256").digest(bytes)

    /** A write is complete only after close and independent bounded readback. */
    fun writeVerified(bytes: ByteArray, output: () -> java.io.OutputStream?, input: () -> InputStream?) {
        require(bytes.size in 1..HopeBackupFormat.MAX_FILE_BYTES)
        output()?.use { it.write(bytes); it.flush() } ?: throw HopeStatePersistenceException("Backup destination unavailable")
        val observed = input()?.use(::readBounded) ?: throw HopeStatePersistenceException("Backup verification unavailable")
        if (!bytes.contentEquals(observed)) throw HopeStatePersistenceException("Backup verification failed")
    }

    /** Bounds even providers without trustworthy size metadata. Does not close the caller's stream. */
    fun readBounded(input: InputStream): ByteArray {
        val output = ByteArrayOutputStream()
        val buffer = ByteArray(8192)
        while (true) {
            val size = input.read(buffer)
            if (size < 0) return output.toByteArray()
            if (size == 0) throw HopeBackupFormatException()
            if (output.size().toLong() + size > HopeBackupFormat.MAX_FILE_BYTES) throw HopeBackupFormatException()
            output.write(buffer, 0, size)
        }
    }

    /** Reject duplicate keys, trailing data and excessive nesting on both Android and the JVM. */
    fun validateJson(bytes: ByteArray) {
        val text = Charsets.UTF_8.newDecoder().decode(java.nio.ByteBuffer.wrap(bytes)).toString()
        val tokens = JSONTokener(text)
        fun value(depth: Int) {
            require(depth <= 32)
            when (val start = tokens.nextClean()) {
                '{' -> {
                    val seen = HashSet<String>()
                    if (tokens.nextClean() == '}') return
                    tokens.back()
                    while (true) {
                        require(tokens.nextClean() == '"')
                        require(seen.add(tokens.nextString('"')))
                        require(tokens.nextClean() == ':')
                        value(depth + 1)
                        when (tokens.nextClean()) { '}' -> return; ',' -> Unit; else -> error("Invalid private JSON") }
                    }
                }
                '[' -> {
                    if (tokens.nextClean() == ']') return
                    tokens.back()
                    while (true) {
                        value(depth + 1)
                        when (tokens.nextClean()) { ']' -> return; ',' -> Unit; else -> error("Invalid private JSON") }
                    }
                }
                '"' -> { tokens.nextString('"'); Unit }
                else -> {
                    require(start != '\u0000')
                    val primitive = StringBuilder().append(start)
                    while (true) {
                        val next = tokens.next()
                        if (next == '\u0000') break
                        if (next in charArrayOf(',', '}', ']', ' ', '\n', '\r', '\t')) { tokens.back(); break }
                        primitive.append(next)
                    }
                    require(primitive.toString().matches(Regex("true|false|null|-?(0|[1-9][0-9]*)(\\.[0-9]+)?([eE][+-]?[0-9]+)?")))
                }
            }
        }
        try { value(0); require(tokens.nextClean() == '\u0000') }
        catch (_: Exception) { throw HopeStateCorruptException("Backup JSON validation failed") }
    }
}
