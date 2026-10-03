package org.arcanum.nativehost.continuity

import java.nio.ByteBuffer
import java.nio.charset.CodingErrorAction
import java.security.MessageDigest

/** Custody boundary parser only. Rust remains the receipt codec/verifier authority. */
internal class ContinuitySigningRequest private constructor(
    val operationId: String, val fingerprint: ByteArray, val generation: ByteArray,
) {
    companion object {
        fun parse(message: ByteArray): ContinuitySigningRequest {
            require(message.size <= 64 * 1024) { "Receipt exceeds bound" }
            val r = Reader(message)
            r.array(20)
            require(r.text() == "org.arcanum.continuity.receipt")
            require(r.head(0) == 1L)
            val type = r.text()
            require(type == "local-recording" || type == "human-adoption")
            require(r.text() == "local-only")
            val operation = r.text(128)
            r.text(128); r.text()
            require(r.text() == "sha256")
            r.bytes(32)
            val fingerprint = r.bytes(32)
            val generation = r.bytes(16)
            require(r.text() == "ecdsa-p256-sha256-der")
            if (!r.nil()) { r.array(2); r.text(); r.text() }
            val count = r.head(4)
            require(count <= 16)
            var previous: ByteArray? = null
            var adoptionEvidence = false
            repeat(count.toInt()) {
                val start = r.offset
                r.array(4)
                if (r.text() == "human-adoption-evidence") adoptionEvidence = true
                r.text()
                if (!r.nil()) r.text()
                if (!r.nil()) r.bytes(32)
                val encoded = message.copyOfRange(start, r.offset)
                previous?.let { require(compareUnsigned(it, encoded) < 0) }
                previous = encoded
            }
            if (!r.nil()) r.time()
            if (!r.nil()) r.time()
            r.time()
            val adopted = !r.nil()
            if (adopted) r.time()
            require(if (type == "human-adoption") adopted && adoptionEvidence else !adopted)
            if (!r.nil()) r.bytes(32)
            r.text()
            require(r.offset == message.size)
            return ContinuitySigningRequest(operation, fingerprint, generation)
        }
        private fun compareUnsigned(a: ByteArray, b: ByteArray): Int {
            for (i in 0 until minOf(a.size, b.size)) {
                val d = (a[i].toInt() and 255) - (b[i].toInt() and 255)
                if (d != 0) return d
            }
            return a.size.compareTo(b.size)
        }
    }
    private class Reader(val data: ByteArray) {
        var offset = 0
        fun byte(): Int { require(offset < data.size); return data[offset++].toInt() and 255 }
        fun head(type: Int): Long {
            val first = byte()
            require(first shr 5 == type)
            val low = first and 31
            if (low < 24) return low.toLong()
            val width = when (low) { 24 -> 1; 25 -> 2; 26 -> 4; 27 -> 8; else -> error("Unsupported CBOR") }
            var value = 0L
            repeat(width) {
                val next = byte()
                require(value <= (Long.MAX_VALUE - next) / 256)
                value = value * 256 + next
            }
            val min = when (width) { 1 -> 24L; 2 -> 256L; 4 -> 65536L; else -> 4294967296L }
            require(value >= min)
            return value
        }
        fun array(size: Int) { require(head(4) == size.toLong()) }
        fun nil(): Boolean {
            require(offset < data.size)
            if ((data[offset].toInt() and 255) != 246) return false
            offset++; return true
        }
        fun bytes(size: Int): ByteArray {
            require(head(2) == size.toLong()); return take(size)
        }
        fun take(size: Int): ByteArray {
            require(size >= 0 && size <= data.size - offset)
            val result = data.copyOfRange(offset, offset + size); offset += size; return result
        }
        fun text(limit: Int = 2048): String {
            val size = head(3)
            require(size in 1..limit.toLong())
            return Charsets.UTF_8.newDecoder().onMalformedInput(CodingErrorAction.REPORT)
                .onUnmappableCharacter(CodingErrorAction.REPORT).decode(ByteBuffer.wrap(take(size.toInt()))).toString()
        }
        fun time() {
            require(offset < data.size)
            val type = (data[offset].toInt() and 255) shr 5
            require(type == 0 || type == 1)
            head(type) // negative value -1-n; n <= Long.MAX_VALUE, including Long.MIN_VALUE
        }
    }
}

internal fun continuityDigest(bytes: ByteArray): ByteArray = MessageDigest.getInstance("SHA-256").digest(bytes)
internal fun continuityFingerprint(key: ByteArray): ByteArray =
    continuityDigest("org.arcanum.continuity.key.v1\u0000".toByteArray(Charsets.US_ASCII) + key)
internal fun ByteArray.continuityHex(): String = joinToString("") { "%02x".format(it.toInt() and 255) }
