package org.arcanum.nativehost.continuity

import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.io.DataInputStream
import java.io.DataOutputStream
import java.security.AlgorithmParameters
import java.security.KeyFactory
import java.security.SecureRandom
import java.security.Signature
import java.security.spec.ECGenParameterSpec
import java.security.spec.ECParameterSpec
import java.security.spec.ECPoint
import java.security.spec.ECPublicKeySpec
import java.math.BigInteger

/** Storage and provider contracts never expose private keys. No automatic get-or-create API. */
interface ContinuityCredentialStorage {
    fun read(): ByteArray?
    fun writeAtomically(bytes: ByteArray)
    fun <T> locked(action: () -> T): T
}
enum class ContinuityNamespaceState { EMPTY, PRESENT, UNAVAILABLE }
interface ContinuityKeyProvider {
    fun namespaceState(): ContinuityNamespaceState
    fun observe(alias: String): KeyObservation
    fun create(alias: String)
    fun sign(alias: String, message: ByteArray): ByteArray
}
enum class ContinuitySecurityLevel { SOFTWARE, HARDWARE_UNSPECIFIED, TRUSTED_ENVIRONMENT, STRONGBOX, UNKNOWN }
sealed class KeyObservation {
    object Missing : KeyObservation()
    object Invalidated : KeyObservation()
    object Unavailable : KeyObservation()
    class Available(val publicKey: ByteArray, val securityLevel: ContinuitySecurityLevel, val nonExportable: Boolean) : KeyObservation()
}
data class ContinuityDecision(val id: String, val decidedAtMs: Long)
data class ContinuityCredential(
    val generation: String, val alias: String, val publicKeyHex: String, val fingerprint: String,
    val decisionId: String, val decidedAtMs: Long, val finalizedAtMs: Long,
    val previousGeneration: String?, val securityLevel: ContinuitySecurityLevel,
    val reconciliationDecisionId: String?, val reconciledAtMs: Long?,
)
data class ContinuityPending(
    val generation: String, val alias: String, val decisionId: String, val decidedAtMs: Long,
    val previousGeneration: String?,
)
enum class ContinuityCredentialPhase {
    NOT_PROVISIONED, READY, PROVISION_PENDING, REPLACEMENT_PENDING, MISSING_KEY,
    INVALIDATED, UNAVAILABLE, CORRUPT, ORPHANED_KEY, KEY_MISMATCH,
}
enum class ContinuityPendingKeyState { MISSING, AVAILABLE, INVALIDATED, UNAVAILABLE, UNQUALIFIED }
data class ContinuityCredentialState(
    val phase: ContinuityCredentialPhase, val current: ContinuityCredential? = null,
    val pending: ContinuityPending? = null, val pendingKeyState: ContinuityPendingKeyState? = null,
)
data class ContinuitySigningDecision(
    val operationId: String, val messageDigest: String, val generation: String,
)
class ContinuityPublicSignature(val publicKey: ByteArray, val signatureDer: ByteArray)
class ContinuityCustodyException(val reason: String) : IllegalStateException(reason)

/**
 * Decisions are caller assertions from a future explicit native action, not proof of Human presence.
 * recover() never creates, signs, replaces, deletes, or repairs. Retained generations are local facts.
 */
class ContinuityCredentialManager(
    private val storage: ContinuityCredentialStorage,
    private val keys: ContinuityKeyProvider,
    private val clock: () -> Long = System::currentTimeMillis,
    private val random: SecureRandom = SecureRandom(),
) {
    companion object {
        const val INITIAL_ALIAS = "org.arcanum.nativehost.continuity.signing.v1.initial"
        private const val PREFIX = "org.arcanum.nativehost.continuity.signing.v1.generation."
        private const val MAX_REGISTRY = 64 * 1024
        private const val MAX_GENERATIONS = 128
    }
    private data class Ledger(val history: List<ContinuityCredential>, val pending: ContinuityPending?)

    fun recover(): ContinuityCredentialState = try {
        storage.locked { state(load()) }
    } catch (_: BadRegistry) {
        ContinuityCredentialState(ContinuityCredentialPhase.CORRUPT)
    } catch (_: Exception) {
        ContinuityCredentialState(ContinuityCredentialPhase.UNAVAILABLE)
    }

    fun provision(decision: ContinuityDecision): ContinuityCredential = storage.locked {
        validate(decision)
        val ledger = load()
        val current = ledger?.history?.lastOrNull()
        if (current != null && current.previousGeneration == null && current.decisionId == decision.id && current.decidedAtMs == decision.decidedAtMs) {
            requireReady(ledger); return@locked current
        }
        if (state(ledger).phase != ContinuityCredentialPhase.NOT_PROVISIONED) fail("Provisioning requires observed absence")
        val pending = pending(decision, null, INITIAL_ALIAS)
        val intent = Ledger(emptyList(), pending)
        save(intent) // intent survives key creation; no repeated effect on read/recovery
        createAbsent(pending)
        finish(intent)
    }

    fun replace(decision: ContinuityDecision, expectedGeneration: String): ContinuityCredential = storage.locked {
        validate(decision)
        val ledger = load() ?: fail("No credential record")
        val current = ledger.history.lastOrNull() ?: fail("No credential record")
        if (ledger.pending == null && current.previousGeneration == expectedGeneration && current.decisionId == decision.id && current.decidedAtMs == decision.decidedAtMs) {
            requireReady(ledger); return@locked current
        }
        if (current.generation != expectedGeneration || ledger.pending != null) fail("Stale replacement decision")
        if (ledger.history.any { it.decisionId == decision.id || it.reconciliationDecisionId == decision.id }) fail("Decision ID already used")
        val phase = state(ledger).phase
        if (phase !in listOf(ContinuityCredentialPhase.READY, ContinuityCredentialPhase.MISSING_KEY, ContinuityCredentialPhase.INVALIDATED)) fail("Credential cannot be reconciled for replacement")
        if (ledger.history.size >= MAX_GENERATIONS) fail("Credential history bound reached")
        val fresh = generation()
        val pending = ContinuityPending(fresh, PREFIX + fresh, decision.id, decision.decidedAtMs, current.generation)
        val intent = ledger.copy(pending = pending)
        save(intent)
        createAbsent(pending)
        finish(intent)
    }

    /** Explicit reconciliation of an existing pending key. Never creates a missing key. */
    fun completePending(decision: ContinuityDecision, expectedPendingGeneration: String): ContinuityCredential = storage.locked {
        validate(decision)
        val ledger = load() ?: fail("No pending intent")
        val pending = ledger.pending
        if (pending == null) {
            val current = ledger.history.lastOrNull() ?: fail("No pending intent")
            if (current.generation != expectedPendingGeneration || current.reconciliationDecisionId != decision.id || current.reconciledAtMs != decision.decidedAtMs) fail("Stale pending decision")
            requireReady(ledger); return@locked current
        }
        if (pending.generation != expectedPendingGeneration) fail("Stale pending decision")
        validateReconciliation(ledger, pending, decision)
        // The original decision/time stay in the intent; reconciliation has its own factual coordinates.
        finish(ledger, decision)
    }

    /** Explicit retry is allowed only after the provider observes the pending alias absent. */
    fun resumeAbsentPendingCreation(decision: ContinuityDecision, expectedPendingGeneration: String): ContinuityCredential = storage.locked {
        validate(decision)
        val ledger = load() ?: fail("No pending intent")
        val pending = ledger.pending ?: fail("No pending intent")
        if (pending.generation != expectedPendingGeneration) fail("Stale pending decision")
        validateReconciliation(ledger, pending, decision)
        createAbsent(pending)
        finish(ledger, decision)
    }

    fun sign(message: ByteArray, decision: ContinuitySigningDecision): ContinuityPublicSignature = storage.locked {
        val frozen = message.copyOf()
        val request = ContinuitySigningRequest.parse(frozen)
        val ledger = load() ?: fail("Credential not provisioned")
        val current = requireReady(ledger)
        if (request.operationId != decision.operationId || continuityDigest(frozen).continuityHex() != decision.messageDigest ||
            current.generation != decision.generation || request.generation.continuityHex() != current.generation ||
            request.fingerprint.continuityHex() != current.fingerprint) fail("Signing decision does not bind this receipt and credential")
        val publicKey = decodeHex(current.publicKeyHex)
        val signature = keys.sign(current.alias, frozen)
        if (!continuityStrictDer(signature)) fail("Signer result format")
        val verifier = Signature.getInstance("SHA256withECDSA")
        verifier.initVerify(continuityPublicKey(publicKey)); verifier.update(frozen)
        if (!verifier.verify(signature)) fail("Signer result verification")
        ContinuityPublicSignature(publicKey, signature.copyOf())
    }

    private fun validateReconciliation(ledger: Ledger, pending: ContinuityPending, decision: ContinuityDecision) {
        if (pending.decisionId == decision.id || ledger.history.any { it.decisionId == decision.id || it.reconciliationDecisionId == decision.id }) fail("Reconciliation requires a distinct decision ID")
    }
    private fun createAbsent(pending: ContinuityPending) {
        if (keys.observe(pending.alias) !== KeyObservation.Missing) fail("Key creation requires observed absence")
        keys.create(pending.alias)
    }
    private fun finish(ledger: Ledger, reconciliation: ContinuityDecision? = null): ContinuityCredential {
        val pending = ledger.pending ?: fail("No pending intent")
        val observed = keys.observe(pending.alias) as? KeyObservation.Available ?: fail("Pending key is not available; reconcile without recreation")
        val publicKey = observed.publicKey.copyOf()
        if (!observed.nonExportable) fail("Private key custody is not qualified")
        continuityPublicKey(publicKey)
        val record = ContinuityCredential(pending.generation, pending.alias, publicKey.continuityHex(), continuityFingerprint(publicKey).continuityHex(),
            pending.decisionId, pending.decidedAtMs, clock(), pending.previousGeneration, observed.securityLevel, reconciliation?.id, reconciliation?.decidedAtMs)
        save(Ledger(ledger.history + record, null))
        return record
    }
    private fun requireReady(ledger: Ledger?): ContinuityCredential {
        val recovered = state(ledger)
        if (recovered.phase != ContinuityCredentialPhase.READY) fail("Credential is not ready")
        return recovered.current ?: fail("Credential missing")
    }
    private fun state(ledger: Ledger?): ContinuityCredentialState {
        if (ledger == null) {
            val phase = when (keys.observe(INITIAL_ALIAS)) {
                KeyObservation.Missing -> when (keys.namespaceState()) {
                    ContinuityNamespaceState.EMPTY -> ContinuityCredentialPhase.NOT_PROVISIONED
                    ContinuityNamespaceState.PRESENT -> ContinuityCredentialPhase.ORPHANED_KEY
                    ContinuityNamespaceState.UNAVAILABLE -> ContinuityCredentialPhase.UNAVAILABLE
                }
                KeyObservation.Unavailable -> ContinuityCredentialPhase.UNAVAILABLE
                else -> ContinuityCredentialPhase.ORPHANED_KEY
            }
            return ContinuityCredentialState(phase)
        }
        val current = ledger.history.lastOrNull()
        ledger.pending?.let {
            val keyState = when (val observed = keys.observe(it.alias)) {
                KeyObservation.Missing -> ContinuityPendingKeyState.MISSING
                KeyObservation.Invalidated -> ContinuityPendingKeyState.INVALIDATED
                KeyObservation.Unavailable -> ContinuityPendingKeyState.UNAVAILABLE
                is KeyObservation.Available -> if (observed.nonExportable) ContinuityPendingKeyState.AVAILABLE else ContinuityPendingKeyState.UNQUALIFIED
            }
            return ContinuityCredentialState(if (it.previousGeneration == null) ContinuityCredentialPhase.PROVISION_PENDING else ContinuityCredentialPhase.REPLACEMENT_PENDING, current, it, keyState)
        }
        if (current == null) throw BadRegistry()
        val phase = when (val observed = keys.observe(current.alias)) {
            KeyObservation.Missing -> ContinuityCredentialPhase.MISSING_KEY
            KeyObservation.Invalidated -> ContinuityCredentialPhase.INVALIDATED
            KeyObservation.Unavailable -> ContinuityCredentialPhase.UNAVAILABLE
            is KeyObservation.Available -> {
                if (!observed.nonExportable) ContinuityCredentialPhase.UNAVAILABLE
                else if (observed.publicKey.continuityHex() != current.publicKeyHex) ContinuityCredentialPhase.KEY_MISMATCH
                else ContinuityCredentialPhase.READY
            }
        }
        return ContinuityCredentialState(phase, current)
    }
    private fun pending(decision: ContinuityDecision, previous: String?, alias: String) =
        ContinuityPending(generation(), alias, decision.id, decision.decidedAtMs, previous)
    private fun generation(): String = ByteArray(16).also(random::nextBytes).continuityHex()
    private fun validate(decision: ContinuityDecision) { if (decision.id.isEmpty() || decision.id.toByteArray(Charsets.UTF_8).size > 128) fail("Decision ID bound") }
    private fun fail(reason: String): Nothing = throw ContinuityCustodyException(reason)
    private class BadRegistry : IllegalStateException("Credential metadata is corrupt; evidence preserved")

    private fun save(ledger: Ledger) {
        val bytes = encode(ledger)
        if (bytes.size > MAX_REGISTRY) fail("Credential history size bound")
        storage.writeAtomically(bytes)
        if (storage.read()?.contentEquals(bytes) != true) fail("Credential metadata acknowledgment unavailable")
    }
    private fun load(): Ledger? {
        val bytes = storage.read() ?: return null
        try {
            require(bytes.size in 32..MAX_REGISTRY)
            val body = bytes.copyOfRange(0, bytes.size - 32)
            require(continuityDigest(body).contentEquals(bytes.copyOfRange(bytes.size - 32, bytes.size)))
            val input = DataInputStream(ByteArrayInputStream(body))
            require(input.readUTF() == "arcanum-continuity-custody-v1")
            val count = input.readInt(); require(count in 0..MAX_GENERATIONS)
            val history = (0 until count).map {
                ContinuityCredential(input.readUTF(), input.readUTF(), input.readUTF(), input.readUTF(), input.readUTF(), input.readLong(), input.readLong(), readOptional(input), ContinuitySecurityLevel.valueOf(input.readUTF()), readOptional(input), if (input.readBoolean()) input.readLong() else null)
            }
            val pending = if (input.readBoolean()) ContinuityPending(input.readUTF(), input.readUTF(), input.readUTF(), input.readLong(), readOptional(input)) else null
            require(input.available() == 0)
            require(history.isNotEmpty() || pending != null)
            history.forEachIndexed { i, record ->
                validateRecord(record.generation, record.alias, record.decisionId, record.previousGeneration, history.getOrNull(i - 1)?.generation)
                val key = decodeHex(record.publicKeyHex); continuityPublicKey(key)
                require(record.fingerprint == continuityFingerprint(key).continuityHex())
                require((record.reconciliationDecisionId == null) == (record.reconciledAtMs == null))
                record.reconciliationDecisionId?.let { validate(ContinuityDecision(it, 0)) }
            }
            pending?.let { validateRecord(it.generation, it.alias, it.decisionId, it.previousGeneration, history.lastOrNull()?.generation) }
            val generations = history.map { it.generation } + listOfNotNull(pending?.generation)
            val decisions = history.map { it.decisionId } + listOfNotNull(pending?.decisionId)
            require(generations.distinct().size == generations.size && decisions.distinct().size == decisions.size)
            val ledger = Ledger(history, pending)
            require(encode(ledger).contentEquals(bytes))
            return ledger
        } catch (_: Exception) { throw BadRegistry() }
    }
    private fun validateRecord(generation: String, alias: String, id: String, previous: String?, expectedPrevious: String?) {
        require(generation.matches(Regex("[0-9a-f]{32}")))
        require(previous == expectedPrevious)
        require(alias == if (previous == null) INITIAL_ALIAS else PREFIX + generation)
        validate(ContinuityDecision(id, 0))
    }
    private fun encode(ledger: Ledger): ByteArray {
        val bytes = ByteArrayOutputStream()
        DataOutputStream(bytes).use { out ->
            out.writeUTF("arcanum-continuity-custody-v1"); out.writeInt(ledger.history.size)
            for (r in ledger.history) {
                out.writeUTF(r.generation); out.writeUTF(r.alias); out.writeUTF(r.publicKeyHex); out.writeUTF(r.fingerprint)
                out.writeUTF(r.decisionId); out.writeLong(r.decidedAtMs); out.writeLong(r.finalizedAtMs)
                writeOptional(out, r.previousGeneration); out.writeUTF(r.securityLevel.name)
                writeOptional(out, r.reconciliationDecisionId); out.writeBoolean(r.reconciledAtMs != null); r.reconciledAtMs?.let(out::writeLong)
            }
            out.writeBoolean(ledger.pending != null)
            ledger.pending?.let { p -> out.writeUTF(p.generation); out.writeUTF(p.alias); out.writeUTF(p.decisionId); out.writeLong(p.decidedAtMs); writeOptional(out, p.previousGeneration) }
        }
        val body = bytes.toByteArray(); return body + continuityDigest(body)
    }
    private fun writeOptional(out: DataOutputStream, value: String?) { out.writeBoolean(value != null); if (value != null) out.writeUTF(value) }
    private fun readOptional(input: DataInputStream): String? = if (input.readBoolean()) input.readUTF() else null
}

internal fun decodeHex(hex: String): ByteArray {
    require(hex.length % 2 == 0 && hex.matches(Regex("[0-9a-f]*")))
    return ByteArray(hex.length / 2) { hex.substring(it * 2, it * 2 + 2).toInt(16).toByte() }
}
internal fun continuityCurve(): ECParameterSpec = AlgorithmParameters.getInstance("EC").also { it.init(ECGenParameterSpec("secp256r1")) }.getParameterSpec(ECParameterSpec::class.java)
internal fun continuityPublicKey(bytes: ByteArray): java.security.PublicKey {
    require(bytes.size == 65 && bytes[0] == 4.toByte())
    val curve = continuityCurve()
    val x = BigInteger(1, bytes.copyOfRange(1, 33)); val y = BigInteger(1, bytes.copyOfRange(33, 65))
    val p = (curve.curve.field as java.security.spec.ECFieldFp).p
    require(x < p && y < p)
    require(y.multiply(y).mod(p) == x.multiply(x).multiply(x).add(curve.curve.a.multiply(x)).add(curve.curve.b).mod(p))
    return KeyFactory.getInstance("EC").generatePublic(ECPublicKeySpec(ECPoint(x, y), curve))
}

internal fun continuityStrictDer(bytes: ByteArray): Boolean = try {
    require(bytes.size in 8..72 && bytes[0] == 0x30.toByte() && bytes[1].toInt() == bytes.size - 2)
    var cursor = 2
    repeat(2) {
        require(cursor + 2 <= bytes.size && bytes[cursor++] == 2.toByte())
        val size = bytes[cursor++].toInt() and 255
        require(size in 1..33 && size <= bytes.size - cursor)
        val integer = bytes.copyOfRange(cursor, cursor + size)
        require((integer[0].toInt() and 128) == 0)
        require(size == 1 || integer[0] != 0.toByte() || (integer[1].toInt() and 128) != 0)
        val value = BigInteger(1, integer)
        require(value.signum() > 0 && value < continuityCurve().order)
        cursor += size
    }
    require(cursor == bytes.size)
    true
} catch (_: Exception) { false }
