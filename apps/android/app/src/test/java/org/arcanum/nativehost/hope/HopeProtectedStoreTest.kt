package org.arcanum.nativehost.hope

import java.io.File
import javax.crypto.spec.SecretKeySpec
import org.junit.Assert.assertArrayEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Assert.fail
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder

class HopeProtectedStoreTest {
    @get:Rule
    val temporaryFolder = TemporaryFolder()

    private val contract =
        HopeRuntimeContract(
            namespace = "hope",
            recordVersion = "hope.reflection.v0.1",
            storageRelativePath = "hope/reflections.v0.1.enc",
            visibility = "local_private",
            authority = "advisory_only",
            receiptScope = "local",
            signingRequired = false,
            authorityEffect = "none",
            networkRequired = false,
        )
    private val key = SecretKeySpec(ByteArray(32) { index -> (index + 1).toByte() }, "AES")
    private val provider = HopeSecretKeyProvider { key }

    @Test
    fun protectedStateRoundTripsExactly() {
        val store = HopeProtectedStore(temporaryFolder.root, provider, contract)
        val plaintext = "{\"version\":\"hope.reflection.v0.1\",\"userText\":\"private\"}".toByteArray()

        store.persistExact(plaintext)

        assertArrayEquals(plaintext, store.recoverExact())
        assertTrue(storageFile().isFile)
    }

    @Test
    fun encryptionUsesFreshProviderGeneratedIv() {
        val store = HopeProtectedStore(temporaryFolder.root, provider, contract)
        val plaintext = "private reflection".toByteArray()

        store.persistExact(plaintext)
        val firstIv = readIv(storageFile().readBytes())
        store.persistExact(plaintext)
        val secondIv = readIv(storageFile().readBytes())

        assertFalse(firstIv.contentEquals(secondIv))
        assertArrayEquals(plaintext, store.recoverExact())
    }

    @Test
    fun missingStateFailsClosed() {
        val store = HopeProtectedStore(temporaryFolder.root, provider, contract)

        try {
            store.recoverExact()
            fail("missing Hope state must fail closed")
        } catch (_: HopeStateMissingException) {
        }
    }

    @Test
    fun tamperedCiphertextFailsClosed() {
        val store = HopeProtectedStore(temporaryFolder.root, provider, contract)
        store.persistExact("private reflection".toByteArray())
        val bytes = storageFile().readBytes()
        bytes[bytes.lastIndex] = (bytes.last().toInt() xor 0x01).toByte()
        storageFile().writeBytes(bytes)

        try {
            store.recoverExact()
            fail("tampered Hope state must fail closed")
        } catch (_: HopeStateCorruptException) {
        }
    }

    @Test
    fun truncatedEnvelopeFailsClosed() {
        val store = HopeProtectedStore(temporaryFolder.root, provider, contract)
        store.persistExact("private reflection".toByteArray())
        val bytes = storageFile().readBytes()
        storageFile().writeBytes(bytes.copyOf(12))

        try {
            store.recoverExact()
            fail("truncated Hope state must fail closed")
        } catch (_: HopeStateCorruptException) {
        }
    }

    private fun readIv(envelope: ByteArray): ByteArray {
        val ivLength = envelope[9].toInt() and 0xff
        return envelope.copyOfRange(14, 14 + ivLength)
    }

    private fun storageFile(): File = File(temporaryFolder.root, contract.storageRelativePath)
}
