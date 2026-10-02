package org.arcanum.nativehost.continuity

import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.io.DataInputStream
import java.io.DataOutputStream
import java.nio.ByteBuffer
import java.util.UUID

enum class ContinuityOperationPhase { NOT_FOUND, CONTENT_PENDING, RECEIPT_PENDING, PUBLISH_PENDING, COMMITTED, BLOCKED_CORRUPT }
class ContinuityNativePresentation(val phase: ContinuityOperationPhase, val message: ByteArray, val originalWrapper: ByteArray?) {
    companion object {
        fun fromPacket(bytes: ByteArray): ContinuityNativePresentation {
            require(bytes.size in 10..(10 + 64 * 1024 + 66 * 1024))
            val input = ByteBuffer.wrap(bytes)
            require(input.get().toInt() == 1)
            val phase = ContinuityOperationPhase.entries.getOrNull(input.get().toInt()) ?: error("Unsupported native phase")
            val messageLength = input.int
            require(messageLength in 1..64 * 1024 && messageLength <= input.remaining() - 4)
            val message = ByteArray(messageLength).also(input::get)
            ContinuitySigningRequest.parse(message)
            val wrapperLength = input.int
            require(wrapperLength in 0..66 * 1024 && wrapperLength == input.remaining())
            val wrapper = if (wrapperLength == 0) null else ByteArray(wrapperLength).also(input::get)
            require((phase in listOf(ContinuityOperationPhase.PUBLISH_PENDING, ContinuityOperationPhase.COMMITTED)) == (wrapper != null))
            require(phase !in listOf(ContinuityOperationPhase.NOT_FOUND, ContinuityOperationPhase.BLOCKED_CORRUPT))
            return ContinuityNativePresentation(phase, message, wrapper)
        }
    }
}
interface ContinuityNativePort {
    fun prepare(intent: ContinuityOperationIntent): ContinuityNativePresentation
    fun inspect(operationId: String): ContinuityOperationPhase
    fun commit(operationId: String, message: ByteArray, signature: ContinuityPublicSignature): ContinuityNativePresentation
    fun publishOriginal(operationId: String, wrapper: ByteArray): ContinuityNativePresentation
    fun recover(operationId: String): ContinuityNativePresentation
}
data class ContinuityOperationIntent(
    val operationId: String, val fingerprint: String, val generation: String,
    val confirmedAtMs: Long, val adoption: Boolean, val signingStarted: Boolean,
)
/** Dedicated synthetic-operation journal. Reads never fabricate a missing intent. */
class ContinuityOperationJournal(private val storage: ContinuityCredentialStorage) {
    fun <T> exclusive(action: () -> T): T = storage.locked(action)
    fun latest(): ContinuityOperationIntent? = load().lastOrNull()
    fun save(intent: ContinuityOperationIntent) {
        validate(intent)
        val history = load().toMutableList()
        if (history.lastOrNull()?.operationId == intent.operationId) {
            val prior = history.last()
            check(prior.copy(signingStarted = intent.signingStarted) == intent && (!prior.signingStarted || intent.signingStarted)) { "Frozen operation intent conflict" }
            history[history.lastIndex] = intent
        } else {
            check(history.none { it.operationId == intent.operationId } && history.size < 64) { "Operation history bound or conflict" }
            history += intent
        }
        val bytes = encode(history)
        storage.writeAtomically(bytes)
        check(storage.read()?.contentEquals(bytes) == true) { "Operation intent acknowledgment unavailable" }
    }
    private fun validate(intent: ContinuityOperationIntent) {
        require(intent.operationId.matches(Regex("[0-9a-f]{32}")))
        require(intent.fingerprint.matches(Regex("[0-9a-f]{64}")))
        require(intent.generation.matches(Regex("[0-9a-f]{32}")))
    }
    private fun load(): List<ContinuityOperationIntent> {
        val bytes = storage.read() ?: return emptyList()
        require(bytes.size in 32..64 * 1024)
        val body = bytes.copyOfRange(0, bytes.size - 32)
        check(continuityDigest(body).contentEquals(bytes.copyOfRange(bytes.size - 32, bytes.size))) { "Operation metadata corrupt; preserve evidence" }
        val input = DataInputStream(ByteArrayInputStream(body))
        require(input.readUTF() == "arcanum-continuity-ui-v1")
        val count = input.readInt(); require(count in 1..64)
        val history = (0 until count).map { ContinuityOperationIntent(input.readUTF(), input.readUTF(), input.readUTF(), input.readLong(), input.readBoolean(), input.readBoolean()).also(::validate) }
        require(input.available() == 0 && history.map { it.operationId }.distinct().size == count)
        require(encode(history).contentEquals(bytes))
        return history
    }
    private fun encode(history: List<ContinuityOperationIntent>): ByteArray {
        val output = ByteArrayOutputStream()
        DataOutputStream(output).use { data ->
            data.writeUTF("arcanum-continuity-ui-v1"); data.writeInt(history.size)
            history.forEach { data.writeUTF(it.operationId); data.writeUTF(it.fingerprint); data.writeUTF(it.generation); data.writeLong(it.confirmedAtMs); data.writeBoolean(it.adoption); data.writeBoolean(it.signingStarted) }
        }
        val body = output.toByteArray(); return body + continuityDigest(body)
    }
}
enum class ContinuityFlowPhase { NO_SAMPLE, UNSIGNED_PENDING, SIGNING_UNKNOWN, PUBLICATION_PENDING, COMMITTED, BLOCKED_CORRUPT }
data class ContinuityFlowState(val phase: ContinuityFlowPhase, val intent: ContinuityOperationIntent?, val credential: ContinuityCredentialState)

/** Explicit action coordinator. No effects are dispatched by recover or by view attachment. */
class ContinuityOperationController(
    private val credentials: ContinuityCredentialManager,
    private val native: ContinuityNativePort,
    private val journal: ContinuityOperationJournal,
    private val clock: () -> Long = System::currentTimeMillis,
    private val operationId: () -> String = { UUID.randomUUID().toString().replace("-", "") },
) {
    fun recover(): ContinuityFlowState = journal.exclusive {
        val credential = credentials.recover()
        val intent = journal.latest() ?: return@exclusive ContinuityFlowState(ContinuityFlowPhase.NO_SAMPLE, null, credential)
        val phase = when (native.inspect(intent.operationId)) {
            ContinuityOperationPhase.COMMITTED -> { validate(native.recover(intent.operationId), intent); ContinuityFlowPhase.COMMITTED }
            ContinuityOperationPhase.PUBLISH_PENDING -> ContinuityFlowPhase.PUBLICATION_PENDING
            ContinuityOperationPhase.BLOCKED_CORRUPT -> ContinuityFlowPhase.BLOCKED_CORRUPT
            else -> if (intent.signingStarted) ContinuityFlowPhase.SIGNING_UNKNOWN else ContinuityFlowPhase.UNSIGNED_PENDING
        }
        ContinuityFlowState(phase, intent, credential)
    }
    fun createSample(adoption: Boolean, expectedGeneration: String, confirmedAtMs: Long = clock()): ContinuityNativePresentation = journal.exclusive {
        journal.latest()?.let { check(native.inspect(it.operationId) == ContinuityOperationPhase.COMMITTED) { "Reconcile the original operation before another sample" } }
        val state = credentials.recover()
        check(state.phase == ContinuityCredentialPhase.READY)
        val current = state.current ?: error("Credential not available")
        check(current.generation == expectedGeneration) { "Credential changed after preview" }
        val intent = ContinuityOperationIntent(operationId(), current.fingerprint, current.generation, confirmedAtMs, adoption, false)
        journal.save(intent) // exact confirmation coordinates survive process loss
        finishUnsigned(intent)
    }
    fun resumeUnsigned(): ContinuityNativePresentation = journal.exclusive {
        val intent = journal.latest() ?: error("No original operation")
        check(!intent.signingStarted) { "Signing result unknown; automatic repetition prohibited" }
        finishUnsigned(intent)
    }
    fun publishExisting(): ContinuityNativePresentation = journal.exclusive {
        val intent = journal.latest() ?: error("No original operation")
        val prepared = native.prepare(intent)
        validate(prepared, intent)
        if (prepared.phase == ContinuityOperationPhase.COMMITTED) return@exclusive native.recover(intent.operationId).also { validate(it, intent) }
        check(prepared.phase == ContinuityOperationPhase.PUBLISH_PENDING)
        native.publishOriginal(intent.operationId, prepared.originalWrapper ?: error("Original signature unavailable")).also { validate(it, intent); check(it.phase == ContinuityOperationPhase.COMMITTED) }
    }
    private fun finishUnsigned(intent: ContinuityOperationIntent): ContinuityNativePresentation {
        val prepared = native.prepare(intent)
        validate(prepared, intent)
        check(prepared.phase == ContinuityOperationPhase.RECEIPT_PENDING) { "Reconcile existing prepared signature" }
        journal.save(intent.copy(signingStarted = true)) // do not infer absence after missing signature acknowledgment
        val signature = credentials.sign(prepared.message, ContinuitySigningDecision(intent.operationId, continuityDigest(prepared.message).continuityHex(), intent.generation))
        return native.commit(intent.operationId, prepared.message, signature).also { validate(it, intent); check(it.phase == ContinuityOperationPhase.COMMITTED) }
    }
    private fun validate(presentation: ContinuityNativePresentation, intent: ContinuityOperationIntent) {
        val request = ContinuitySigningRequest.parse(presentation.message)
        check(request.operationId == intent.operationId && request.fingerprint.continuityHex() == intent.fingerprint && request.generation.continuityHex() == intent.generation) { "Native operation binding mismatch" }
    }
}
