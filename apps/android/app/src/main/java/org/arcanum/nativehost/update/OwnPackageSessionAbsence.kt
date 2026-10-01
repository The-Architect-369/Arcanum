package org.arcanum.nativehost.update

/** Observe removal after an explicit abandonment; never abandon or submit here. */
object OwnPackageSessionAbsence {
    fun await(
        sessionsAbsent: () -> Boolean,
        nowMillis: () -> Long = { System.nanoTime() / 1_000_000 },
        pause: (Long) -> Unit = { Thread.sleep(it) },
        timeoutMillis: Long = 2_000,
        pollMillis: Long = 50,
    ): Boolean {
        require(timeoutMillis >= 0 && pollMillis > 0)
        val started = nowMillis()
        while (true) {
            if (sessionsAbsent()) return true
            val remaining = timeoutMillis - (nowMillis() - started)
            if (remaining <= 0) return false
            pause(minOf(pollMillis, remaining))
        }
    }
}
