package org.arcanum.nativehost.continuity

import java.io.ByteArrayOutputStream
import java.io.File
import java.math.BigInteger
import java.security.AlgorithmParameters
import java.security.KeyFactory
import java.security.MessageDigest
import java.security.Signature
import java.security.spec.ECGenParameterSpec
import java.security.spec.ECParameterSpec
import java.security.spec.ECPoint
import java.security.spec.ECPublicKeySpec
import org.junit.Assert.assertArrayEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/** Independent JVM interop qualification; no Android custody or host action. */
class ContinuityReceiptVectorTest {
    private val root = File(requireNotNull(System.getProperty("arcanum.repoRoot")), "docs/specs/runtime/fixtures/a16-v1")

    private fun vector(name: String, field: String): ByteArray =
        File(root, "$name.$field.hex").readText().trim().chunked(2).map { it.toInt(16).toByte() }.toByteArray()

    private fun hash(bytes: ByteArray): ByteArray = MessageDigest.getInstance("SHA-256").digest(bytes)

    private fun message(name: String): List<Any?> {
        val publicKey = vector(name, "public-key")
        val fingerprint = hash("org.arcanum.continuity.key.v1\u0000".toByteArray() + publicKey)
        val fields = mutableListOf<Any?>(
            "org.arcanum.continuity.receipt", 1L, "local-recording", "local-only",
            "fixture-operation", "fixture-object", "synthetic.bytes.v1", "sha256",
            hash(vector(name, "object")), fingerprint, ByteArray(16) { it.toByte() },
            "ecdsa-p256-sha256-der", null, emptyList<Any?>(), null, null, 0L, null, null, "a16-fixture-v1",
        )
        when (name) {
            "recording-rich" -> {
                fields[4] = "fixture-rich"
                fields[5] = "fixture-object-rich"
                fields[12] = listOf("assistant", "fixture-codex")
                // Encoded byte order: the 6-byte source kind precedes the 7-byte kind.
                fields[13] = listOf(
                    listOf("source", "fixture:source", null, null),
                    listOf("machine", "fixture:measurement", "v1", hash("measurement".toByteArray())),
                )
                fields[14] = Long.MIN_VALUE
                fields[15] = Long.MAX_VALUE
                fields[16] = -24L
                fields[18] = hash("synthetic custody declaration".toByteArray())
                fields[19] = "runtime-é-e\u0301"
            }
            "human-adoption" -> {
                fields[2] = "human-adoption"
                fields[4] = "fixture-adoption"
                fields[12] = listOf("assistant", "fixture-original-producer")
                fields[13] = listOf(listOf("human-adoption-evidence", "fixture:explicit-adoption", null, hash("synthetic adoption evidence".toByteArray())))
                fields[14] = 123L
                fields[15] = 456L
                fields[16] = 789L
                fields[17] = 788L
            }
        }
        return fields
    }

    private fun verify(name: String, bytes: ByteArray, signature: ByteArray): Boolean {
        val publicKey = vector(name, "public-key")
        val parameters = AlgorithmParameters.getInstance("EC").apply { init(ECGenParameterSpec("secp256r1")) }
            .getParameterSpec(ECParameterSpec::class.java)
        val point = ECPoint(BigInteger(1, publicKey.copyOfRange(1, 33)), BigInteger(1, publicKey.copyOfRange(33, 65)))
        val key = KeyFactory.getInstance("EC").generatePublic(ECPublicKeySpec(point, parameters))
        return Signature.getInstance("SHA256withECDSA").run {
            initVerify(key)
            update(bytes)
            verify(signature)
        }
    }

    @Test
    fun canonicalMessagesAndWrappersMatchFrozenIndependentVectors() {
        for (name in listOf("recording-minimal", "recording-rich", "human-adoption")) {
            val bytes = encode(message(name))
            assertArrayEquals(name, vector(name, "message"), bytes)
            assertArrayEquals(name, vector(name, "wrapper"), encode(listOf(bytes, vector(name, "public-key"), vector(name, "signature"))))
        }
    }

    @Test
    fun jcaVerifiesCompleteMessageAndRejectsEveryFieldMutationAndDoubleHash() {
        for (name in listOf("recording-minimal", "recording-rich", "human-adoption")) {
            val bytes = vector(name, "message")
            val signature = vector(name, "signature")
            assertTrue(name, verify(name, bytes, signature))
            assertFalse(name, verify(name, hash(bytes), signature))
            for (i in bytes.indices) {
                val changed = bytes.copyOf()
                changed[i] = (changed[i].toInt() xor 1).toByte()
                assertFalse("$name byte $i", verify(name, changed, signature))
            }
        }
    }

    // Bounded reference encoder used only for fixed typed test inputs. Runtime
    // semantics, malformed-input rejection and canonical parsing belong to Rust.
    private fun encode(value: Any?): ByteArray {
        val output = ByteArrayOutputStream()
        fun head(major: Int, unsigned: Long) {
            val count = when {
                unsigned < 24 -> 0
                unsigned <= 255 -> 1
                unsigned <= 65535 -> 2
                unsigned <= 4294967295L -> 4
                else -> 8
            }
            output.write((major shl 5) or when (count) { 0 -> unsigned.toInt(); 1 -> 24; 2 -> 25; 4 -> 26; else -> 27 })
            for (index in count - 1 downTo 0) output.write((unsigned ushr (8 * index)).toInt() and 255)
        }
        when (value) {
            null -> output.write(0xf6)
            is Long -> if (value >= 0) head(0, value) else head(1, -(value + 1))
            is String -> { val bytes = value.toByteArray(Charsets.UTF_8); head(3, bytes.size.toLong()); output.write(bytes) }
            is ByteArray -> { head(2, value.size.toLong()); output.write(value) }
            is List<*> -> { head(4, value.size.toLong()); for (item in value) output.write(encode(item)) }
            else -> error("Unsupported fixture type")
        }
        return output.toByteArray()
    }
}
