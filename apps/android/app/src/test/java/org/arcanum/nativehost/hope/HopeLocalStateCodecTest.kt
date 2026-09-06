package org.arcanum.nativehost.hope

import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class HopeLocalStateCodecTest {
    private val reflectionJson =
        """{"version":"hope.reflection.v0.1","id":"hope:test","createdAt":"2026-09-06T11:00:00Z","mode":"reflection","prompt":"private prompt","userText":"private body","hopeText":"Your reflection is held locally.","visibility":"local_private","receiptStatus":"local_only","authority":"advisory_only","interpretation":null}"""

    @Test
    fun localReceiptBindsDigestWithoutPrivateBody() {
        val receipt =
            HopeLocalStateCodec.createReceipt(
                reflectionJson = reflectionJson,
                persistedAt = "2026-09-06T11:00:01Z",
            )
        val serialized = receipt.toJson().toString()

        assertEquals("hope:test", receipt.reflectionId)
        assertEquals("local", receipt.scope)
        assertFalse(receipt.signed)
        assertTrue(receipt.signerRef == null)
        assertTrue(receipt.signature == null)
        assertFalse(receipt.privateBodyIncluded)
        assertFalse(serialized.contains("private body"))
        assertFalse(serialized.contains("private prompt"))
        assertFalse(serialized.contains("Your reflection is held locally."))
        assertTrue(receipt.contentDigestSha256.matches(Regex("[0-9a-f]{64}")))
    }

    @Test
    fun encryptedPayloadCodecPreservesExactCanonicalReflection() {
        val receipt =
            HopeLocalStateCodec.createReceipt(
                reflectionJson = reflectionJson,
                persistedAt = "2026-09-06T11:00:01Z",
            )
        val restored =
            HopeLocalStateCodec.decode(
                HopeLocalStateCodec.encode(HopeLocalState(reflectionJson, receipt)),
            )

        assertEquals(reflectionJson, restored.reflectionJson)
        assertEquals(receipt, restored.receipt)
    }

    @Test(expected = IllegalArgumentException::class)
    fun alteredDigestBindingIsRejected() {
        val receipt =
            HopeLocalStateCodec.createReceipt(
                reflectionJson = reflectionJson,
                persistedAt = "2026-09-06T11:00:01Z",
            )
        val encoded =
            JSONObject()
                .put("stateVersion", 1)
                .put("reflectionJson", reflectionJson.replace("private body", "changed body"))
                .put("receipt", receipt.toJson())
                .toString()
                .toByteArray()

        HopeLocalStateCodec.decode(encoded)
    }
}
