package org.arcanum.nativehost.tempus

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class TempusLifecycleContractTest {
    private val digest = "a".repeat(64)

    @Test
    fun capturePayloadIsLocalUnsignedAndAuthorityFree() {
        val presentation =
            TempusLifecyclePresentation.fromJson(
                """{"wireVersion":1,"operation":"capture-persist","anchorId":"ce-w02-tempus-1","capturedAt":"2026-09-05T11:15:00Z","sourceKind":"system-clock","persisted":true,"recovered":false,"persistedDigestSha256":"$digest","authorityEffect":"none","networkUsed":false,"protocolFinality":false,"receipt":{"receiptId":"receipt-ce-w02-tempus-1","scope":"local","signed":false,"contentDigestSha256":"$digest"}}""",
            )

        assertTrue(presentation.persisted)
        assertFalse(presentation.recovered)
        assertEquals("local", presentation.receipt?.scope)
        assertFalse(presentation.receipt?.signed ?: true)
        assertEquals(digest, presentation.receipt?.contentDigestSha256)
    }

    @Test
    fun recoveryDoesNotReissueReceipt() {
        val presentation =
            TempusLifecyclePresentation.fromJson(
                """{"wireVersion":1,"operation":"recover","anchorId":"ce-w02-tempus-1","capturedAt":"2026-09-05T11:15:00Z","sourceKind":"system-clock","persisted":true,"recovered":true,"persistedDigestSha256":"$digest","authorityEffect":"none","networkUsed":false,"protocolFinality":false,"receipt":null}""",
            )

        assertTrue(presentation.recovered)
        assertNull(presentation.receipt)
    }

    @Test(expected = IllegalArgumentException::class)
    fun signedReceiptIsRejected() {
        TempusLifecyclePresentation.fromJson(
            """{"wireVersion":1,"operation":"capture-persist","anchorId":"ce-w02-tempus-1","capturedAt":"2026-09-05T11:15:00Z","sourceKind":"system-clock","persisted":true,"recovered":false,"persistedDigestSha256":"$digest","authorityEffect":"none","networkUsed":false,"protocolFinality":false,"receipt":{"receiptId":"receipt-ce-w02-tempus-1","scope":"local","signed":true,"contentDigestSha256":"$digest"}}""",
        )
    }
}
