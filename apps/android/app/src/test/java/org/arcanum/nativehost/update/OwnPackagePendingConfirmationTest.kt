package org.arcanum.nativehost.update

import org.junit.Assert.assertSame
import org.junit.Assert.assertThrows
import org.junit.Test

class OwnPackagePendingConfirmationTest {
    @Test fun returnsOnlyTheOriginalCapabilityForItsOperationAndSession() {
        val cache = OwnPackagePendingConfirmation<Any>()
        val original = Any()
        cache.retain("first", 7, original)
        assertSame(original, cache.existing("first", 7))
        assertThrows(IllegalArgumentException::class.java) { cache.existing("other", 7) }
        assertThrows(IllegalArgumentException::class.java) { cache.existing("first", 8) }
        assertSame(original, cache.existing("first", 7))
    }

    @Test fun processRestartCannotReconstructConfirmation() {
        val oldProcess = OwnPackagePendingConfirmation<Any>()
        oldProcess.retain("first", 7, Any())
        val newProcess = OwnPackagePendingConfirmation<Any>()
        assertThrows(IllegalArgumentException::class.java) { newProcess.existing("first", 7) }
    }

    @Test fun terminalResultOrSettlementRevokesTheCapability() {
        val cache = OwnPackagePendingConfirmation<Any>()
        cache.retain("first", 7, Any())
        cache.clear()
        assertThrows(IllegalArgumentException::class.java) { cache.existing("first", 7) }
    }

    @Test fun aLaterAttemptCannotReuseTheEarlierCapability() {
        val cache = OwnPackagePendingConfirmation<Any>()
        cache.retain("first", 7, Any())
        val next = Any()
        cache.retain("second", 8, next)
        assertThrows(IllegalArgumentException::class.java) { cache.existing("first", 7) }
        assertSame(next, cache.existing("second", 8))
    }
}
