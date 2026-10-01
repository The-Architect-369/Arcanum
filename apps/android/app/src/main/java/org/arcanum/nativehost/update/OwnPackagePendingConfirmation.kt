package org.arcanum.nativehost.update

/** Process-local platform capability. Never reconstruct it from a journal or session details. */
class OwnPackagePendingConfirmation<T> {
    private data class Entry<T>(val operationId: String, val sessionId: Int, val value: T)
    private var entry: Entry<T>? = null

    fun retain(operationId: String, sessionId: Int, value: T) {
        entry = Entry(operationId, sessionId, value)
    }

    fun existing(operationId: String, sessionId: Int): T {
        val saved = entry
        require(saved != null && saved.operationId == operationId && saved.sessionId == sessionId) {
            "Original Android confirmation unavailable; refresh, then cancel sessions and settle the attempt"
        }
        return saved.value
    }

    fun clear() { entry = null }
}
