package org.arcanum.nativehost.hope

import java.nio.ByteBuffer
import java.security.SecureRandom
import java.util.Base64
import javax.crypto.Cipher
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.SecretKeySpec

/** Private outputs: never log, serialize to diagnostics, or send to Architect context. */
class HopeSealedBackup(val encryptedBytes: ByteArray, val recoveryCode: String) {
    override fun toString(): String = "HopeSealedBackup([private])"
}

class HopeBackupFormatException : RuntimeException("Hope backup could not be opened")

/** Authenticated byte envelope only. Collection validation and vault import are separate gates. */
object HopeBackupFormat {
    const val MAX_PLAINTEXT_BYTES: Int = 16 * 1024 * 1024
    const val HEADER_BYTES: Int = 25
    const val MAX_FILE_BYTES: Int = MAX_PLAINTEXT_BYTES + HEADER_BYTES + 16
    private val magic = "HOPEBKP!".toByteArray(Charsets.US_ASCII)
    private val codePattern = Regex("HBP1:[A-Za-z0-9_-]{43}")

    /** Each invocation creates a new independent recovery key and nonce. No caller-chosen IV. */
    fun seal(plaintext: ByteArray): HopeSealedBackup {
        require(plaintext.size in 1..MAX_PLAINTEXT_BYTES) { "Hope backup size outside supported bounds" }
        val random = SecureRandom()
        val key = ByteArray(32).also(random::nextBytes)
        val nonce = ByteArray(12).also(random::nextBytes)
        try {
            val header = ByteBuffer.allocate(HEADER_BYTES).put(magic).put(1.toByte())
                .put(nonce).putInt(plaintext.size).array()
            val cipher = Cipher.getInstance("AES/GCM/NoPadding")
            cipher.init(Cipher.ENCRYPT_MODE, SecretKeySpec(key, "AES"), GCMParameterSpec(128, nonce))
            cipher.updateAAD(header)
            val encrypted = cipher.doFinal(plaintext)
            val code = "HBP1:" + Base64.getUrlEncoder().withoutPadding().encodeToString(key)
            return HopeSealedBackup(header + encrypted, code)
        } finally {
            key.fill(0)
        }
    }

    /** Returns bytes only after tag verification. Does not decode a collection or touch storage. */
    fun open(encrypted: ByteArray, recoveryCode: String): ByteArray {
        var key: ByteArray? = null
        try {
            if (encrypted.size !in (HEADER_BYTES + 17)..MAX_FILE_BYTES) throw HopeBackupFormatException()
            val header = encrypted.copyOfRange(0, HEADER_BYTES)
            if (!header.copyOfRange(0, 8).contentEquals(magic) || header[8] != 1.toByte()) throw HopeBackupFormatException()
            val length = ByteBuffer.wrap(header, 21, 4).int
            if (length !in 1..MAX_PLAINTEXT_BYTES || encrypted.size != HEADER_BYTES + length + 16) throw HopeBackupFormatException()
            if (!codePattern.matches(recoveryCode)) throw HopeBackupFormatException()
            key = Base64.getUrlDecoder().decode(recoveryCode.substring(5))
            if (key.size != 32 || "HBP1:" + Base64.getUrlEncoder().withoutPadding().encodeToString(key) != recoveryCode) throw HopeBackupFormatException()
            val cipher = Cipher.getInstance("AES/GCM/NoPadding")
            cipher.init(Cipher.DECRYPT_MODE, SecretKeySpec(key, "AES"), GCMParameterSpec(128, header.copyOfRange(9, 21)))
            cipher.updateAAD(header)
            return cipher.doFinal(encrypted, HEADER_BYTES, encrypted.size - HEADER_BYTES)
        } catch (_: Exception) {
            // No input, recovery material, provider message or cause in public diagnostics.
            throw HopeBackupFormatException()
        } finally {
            key?.fill(0)
        }
    }
}
