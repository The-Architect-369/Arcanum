package org.arcanum.nativehost.hope

import java.io.File
import java.io.FileOutputStream
import java.io.IOException
import java.nio.ByteBuffer
import java.nio.charset.StandardCharsets
import java.nio.file.Files
import java.nio.file.StandardCopyOption
import java.security.GeneralSecurityException
import javax.crypto.AEADBadTagException
import javax.crypto.Cipher
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

fun interface HopeSecretKeyProvider {
    fun getOrCreate(): SecretKey
}

open class HopeStoreException(message: String, cause: Throwable? = null) : Exception(message, cause)

class HopeStateMissingException(message: String) : HopeStoreException(message)

class HopeStateCorruptException(message: String, cause: Throwable? = null) :
    HopeStoreException(message, cause)

class HopeStatePersistenceException(message: String, cause: Throwable? = null) :
    HopeStoreException(message, cause)

class HopeProtectedStore(
    private val rootDir: File,
    private val keyProvider: HopeSecretKeyProvider,
    private val contract: HopeRuntimeContract,
) {
    init {
        require(contract.namespace == "hope")
        require(contract.recordVersion == "hope.reflection.v0.1")
        require(contract.storageRelativePath == "hope/reflections.v0.1.enc")
        require(contract.visibility == "local_private")
        require(contract.authority == "advisory_only")
        require(!contract.signingRequired)
        require(!contract.networkRequired)
    }

    private val targetFile: File
        get() = File(rootDir, contract.storageRelativePath)

    fun persistExact(plaintext: ByteArray) {
        require(plaintext.isNotEmpty()) { "Hope protected state must not be empty" }
        val parent = targetFile.parentFile ?: throw HopeStatePersistenceException("Hope storage parent unavailable")
        if (!parent.exists() && !parent.mkdirs()) {
            throw HopeStatePersistenceException("Hope storage directory could not be created")
        }

        val key = keyProvider.getOrCreate()
        val encrypted =
            try {
                Cipher.getInstance(CIPHER).run {
                    // AndroidKeyStore keys created with randomized encryption required must
                    // generate their own encryption IV. Supplying a caller-generated IV here
                    // is rejected by the platform. The returned IV is serialized into the
                    // existing v0.1 envelope and is still supplied explicitly for decryption.
                    init(Cipher.ENCRYPT_MODE, key)
                    val generatedIv = iv?.copyOf()
                        ?: throw HopeStatePersistenceException("Hope encryption IV unavailable")
                    if (generatedIv.size != IV_LENGTH) {
                        throw HopeStatePersistenceException("Hope encryption IV length is invalid")
                    }
                    updateAAD(aad())
                    EncryptedPayload(
                        iv = generatedIv,
                        ciphertext = doFinal(plaintext),
                    )
                }
            } catch (error: HopeStatePersistenceException) {
                throw error
            } catch (error: GeneralSecurityException) {
                throw HopeStatePersistenceException("Hope encryption failed", error)
            }

        val envelope =
            ByteBuffer.allocate(HEADER_LENGTH + encrypted.iv.size + encrypted.ciphertext.size)
                .put(MAGIC)
                .put(VERSION.toByte())
                .put(encrypted.iv.size.toByte())
                .putInt(encrypted.ciphertext.size)
                .put(encrypted.iv)
                .put(encrypted.ciphertext)
                .array()

        val tempFile = File(parent, "${targetFile.name}.tmp")
        try {
            FileOutputStream(tempFile).use { output ->
                output.write(envelope)
                output.flush()
                output.fd.sync()
            }
            Files.move(
                tempFile.toPath(),
                targetFile.toPath(),
                StandardCopyOption.ATOMIC_MOVE,
                StandardCopyOption.REPLACE_EXISTING,
            )
        } catch (error: IOException) {
            throw HopeStatePersistenceException("Hope atomic persistence failed", error)
        } finally {
            if (tempFile.exists()) {
                tempFile.delete()
            }
        }
    }

    fun recoverExact(): ByteArray {
        if (!targetFile.isFile) {
            throw HopeStateMissingException("Hope protected state is missing")
        }
        val envelope =
            try {
                targetFile.readBytes()
            } catch (error: IOException) {
                throw HopeStatePersistenceException("Hope protected state could not be read", error)
            }
        if (envelope.size < HEADER_LENGTH + IV_LENGTH + MIN_GCM_TAG_BYTES) {
            throw HopeStateCorruptException("Hope protected state is truncated")
        }

        val buffer = ByteBuffer.wrap(envelope)
        val magic = ByteArray(MAGIC.size).also { bytes -> buffer.get(bytes) }
        if (!magic.contentEquals(MAGIC)) {
            throw HopeStateCorruptException("Hope protected state magic is invalid")
        }
        val version = buffer.get().toInt() and 0xff
        if (version != VERSION) {
            throw HopeStateCorruptException("Hope protected state version is unsupported")
        }
        val ivLength = buffer.get().toInt() and 0xff
        if (ivLength != IV_LENGTH) {
            throw HopeStateCorruptException("Hope protected state IV length is invalid")
        }
        val ciphertextLength = buffer.int
        if (ciphertextLength < MIN_GCM_TAG_BYTES || buffer.remaining() != ivLength + ciphertextLength) {
            throw HopeStateCorruptException("Hope protected state length is invalid")
        }

        val iv = ByteArray(ivLength).also { bytes -> buffer.get(bytes) }
        val ciphertext = ByteArray(ciphertextLength).also { bytes -> buffer.get(bytes) }
        val key = keyProvider.getOrCreate()
        return try {
            Cipher.getInstance(CIPHER).run {
                init(Cipher.DECRYPT_MODE, key, GCMParameterSpec(TAG_BITS, iv))
                updateAAD(aad())
                doFinal(ciphertext)
            }
        } catch (error: AEADBadTagException) {
            throw HopeStateCorruptException("Hope protected state authentication failed", error)
        } catch (error: GeneralSecurityException) {
            throw HopeStateCorruptException("Hope protected state decryption failed", error)
        }
    }

    private fun aad(): ByteArray =
        "namespace=${contract.namespace}|record=${contract.recordVersion}|path=${contract.storageRelativePath}"
            .toByteArray(StandardCharsets.UTF_8)

    private data class EncryptedPayload(
        val iv: ByteArray,
        val ciphertext: ByteArray,
    )

    companion object {
        private val MAGIC = "ARCHOPE1".toByteArray(StandardCharsets.US_ASCII)
        private const val VERSION = 1
        private const val IV_LENGTH = 12
        private const val TAG_BITS = 128
        private const val MIN_GCM_TAG_BYTES = TAG_BITS / 8
        private const val HEADER_LENGTH = 8 + 1 + 1 + 4
        private const val CIPHER = "AES/GCM/NoPadding"
    }
}
