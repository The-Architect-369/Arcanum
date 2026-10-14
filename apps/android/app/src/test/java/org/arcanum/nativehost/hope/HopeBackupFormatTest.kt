package org.arcanum.nativehost.hope

import java.io.File
import java.nio.ByteBuffer
import java.util.Base64
import org.json.JSONObject
import org.junit.Assert.*
import org.junit.Test

class HopeBackupFormatTest {
    private val text = "  Synthetic reflection 🌿\nNo normalization.\t".toByteArray(Charsets.UTF_8)
    private fun reject(bytes: ByteArray, code: String) {
        try { HopeBackupFormat.open(bytes, code); fail("Invalid backup accepted") }
        catch (error: HopeBackupFormatException) {
            assertEquals("Hope backup could not be opened", error.message)
            assertNull(error.cause)
        }
    }

    @Test fun exactBytesAndIndependentRecoveryKeys() {
        val a = HopeBackupFormat.seal(text); val b = HopeBackupFormat.seal(text)
        assertArrayEquals(text, HopeBackupFormat.open(a.encryptedBytes, a.recoveryCode))
        assertFalse(a.encryptedBytes.contentEquals(b.encryptedBytes))
        assertNotEquals(a.recoveryCode, b.recoveryCode)
        assertEquals("HopeSealedBackup([private])", a.toString())
    }

    @Test fun independentPythonVectorDecrypts() {
        val file = File(System.getProperty("arcanum.repoRoot"), "docs/specs/runtime/hope-portable-backup-v1.vectors.json")
        val vector = JSONObject(file.readText()).getJSONArray("vectors").getJSONObject(0)
        assertArrayEquals(Base64.getDecoder().decode(vector.getString("plaintextBase64")), HopeBackupFormat.open(Base64.getDecoder().decode(vector.getString("fileBase64")), vector.getString("recoveryCode")))
    }

    @Test fun eachByteIsAuthenticatedOrStructurallyRejected() {
        val b = HopeBackupFormat.seal(text)
        for (i in b.encryptedBytes.indices) {
            val altered = b.encryptedBytes.clone(); altered[i] = (altered[i].toInt() xor 1).toByte()
            reject(altered, b.recoveryCode)
        }
    }

    @Test fun truncationAndTrailingBytesFail() {
        val b = HopeBackupFormat.seal(text)
        for (size in b.encryptedBytes.indices) reject(b.encryptedBytes.copyOf(size), b.recoveryCode)
        reject(b.encryptedBytes + byteArrayOf(0), b.recoveryCode)
    }

    @Test fun wrongAndMalformedRecoveryCodesFail() {
        val b = HopeBackupFormat.seal(text)
        for (code in listOf("", b.recoveryCode + "=", " " + b.recoveryCode, b.recoveryCode.lowercase(), "HBP2:" + b.recoveryCode.substring(5), HopeBackupFormat.seal(text).recoveryCode)) reject(b.encryptedBytes, code)
        val last = b.recoveryCode.last()
        val alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
        val nonCanonical = b.recoveryCode.dropLast(1) + alphabet[alphabet.indexOf(last) or 1]
        reject(b.encryptedBytes, nonCanonical)
    }

    @Test fun invalidLengthAndUnsupportedVersionFailBeforeDecrypt() {
        val b = HopeBackupFormat.seal(text)
        for (length in listOf(-1, 0, Int.MAX_VALUE, HopeBackupFormat.MAX_PLAINTEXT_BYTES + 1)) {
            val bytes = b.encryptedBytes.clone(); ByteBuffer.wrap(bytes, 21, 4).putInt(length); reject(bytes, b.recoveryCode)
        }
        val version = b.encryptedBytes.clone(); version[8] = 2; reject(version, b.recoveryCode)
    }

    @Test fun sizeCeilingAndEmptyInput() {
        for (size in listOf(0, HopeBackupFormat.MAX_PLAINTEXT_BYTES + 1)) {
            try { HopeBackupFormat.seal(ByteArray(size)); fail("Out-of-bounds input accepted") }
            catch (_: IllegalArgumentException) { }
        }
        val maximum = ByteArray(HopeBackupFormat.MAX_PLAINTEXT_BYTES) { 0x5a }
        val b = HopeBackupFormat.seal(maximum)
        assertEquals(HopeBackupFormat.MAX_FILE_BYTES, b.encryptedBytes.size)
        assertArrayEquals(maximum, HopeBackupFormat.open(b.encryptedBytes, b.recoveryCode))
        reject(ByteArray(HopeBackupFormat.MAX_FILE_BYTES + 1), b.recoveryCode)
    }

    @Test fun authenticatedBytesAreNotClaimedToBeValidCollections() {
        val arbitrary = byteArrayOf(0, -1, 4)
        val b = HopeBackupFormat.seal(arbitrary)
        assertArrayEquals(arbitrary, HopeBackupFormat.open(b.encryptedBytes, b.recoveryCode))
        // Semantic validation belongs to the guarded import coordinator, not this byte envelope.
    }
}
