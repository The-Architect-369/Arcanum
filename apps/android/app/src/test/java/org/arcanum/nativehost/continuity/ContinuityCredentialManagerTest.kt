package org.arcanum.nativehost.continuity

import org.junit.Assert.*
import org.junit.Test
import java.io.File
import java.security.KeyPair
import java.security.KeyPairGenerator
import java.security.Signature
import java.security.interfaces.ECPublicKey
import java.security.spec.ECGenParameterSpec

class ContinuityCredentialManagerTest {
    private class Storage : ContinuityCredentialStorage {
        var bytes: ByteArray? = null
        var writes = 0
        var failBefore = 0
        var failAfter = 0
        override fun read() = bytes?.copyOf()
        override fun writeAtomically(bytes: ByteArray) {
            writes++
            if (writes == failBefore) error("qualification fault before persistence")
            this.bytes = bytes.copyOf()
            if (writes == failAfter) error("qualification lost acknowledgment")
        }
        override fun <T> locked(action: () -> T): T = synchronized(this) { action() }
    }
    private class Keys : ContinuityKeyProvider {
        val pairs = mutableMapOf<String, KeyPair>()
        val overrides = mutableMapOf<String, KeyObservation>()
        var creates = 0
        var signs = 0
        var failCreateBefore = false
        var failCreateAfter = false
        var badSignature = false
        var namespaceUnavailable = false
        override fun namespaceState(): ContinuityNamespaceState = when {
            namespaceUnavailable -> ContinuityNamespaceState.UNAVAILABLE
            pairs.keys.any { it.startsWith("org.arcanum.nativehost.continuity.signing.v1.") } -> ContinuityNamespaceState.PRESENT
            else -> ContinuityNamespaceState.EMPTY
        }
        override fun observe(alias: String): KeyObservation {
            overrides[alias]?.let { return it }
            val key = pairs[alias]?.public as? ECPublicKey ?: return KeyObservation.Missing
            fun c(v: java.math.BigInteger): ByteArray {
                val b = v.toByteArray(); val u = if (b.size == 33) b.copyOfRange(1, 33) else b
                return ByteArray(32 - u.size) + u
            }
            return KeyObservation.Available(byteArrayOf(4) + c(key.w.affineX) + c(key.w.affineY), ContinuitySecurityLevel.SOFTWARE, true)
        }
        override fun create(alias: String) {
            creates++
            if (failCreateBefore) error("qualification before effect")
            check(!pairs.containsKey(alias))
            pairs[alias] = KeyPairGenerator.getInstance("EC").also { it.initialize(ECGenParameterSpec("secp256r1")) }.generateKeyPair()
            if (failCreateAfter) error("qualification after effect")
        }
        override fun sign(alias: String, message: ByteArray): ByteArray {
            signs++
            if (badSignature) return byteArrayOf(1)
            return Signature.getInstance("SHA256withECDSA").also { it.initSign(pairs.getValue(alias).private); it.update(message) }.sign()
        }
    }
    private class Fixture {
        val storage = Storage()
        val keys = Keys()
        fun manager() = ContinuityCredentialManager(storage, keys, { 1234L })
        val decision = ContinuityDecision("explicit-provision", 1000)
        fun provision() = manager().provision(decision)
    }
    private fun rejected(action: () -> Unit) {
        try { action(); fail("Expected blocked action") } catch (_: IllegalStateException) { } catch (_: IllegalArgumentException) { }
    }
    private fun receipt(record: ContinuityCredential): ByteArray {
        val root = System.getProperty("arcanum.repoRoot") ?: File("../..").canonicalPath
        val dir = File(root, "docs/specs/runtime/fixtures/a16-v1")
        val message = decodeHex(File(dir, "recording-minimal.message.hex").readText().trim())
        val oldPublic = decodeHex(File(dir, "recording-minimal.public-key.hex").readText().trim())
        fun replace(old: ByteArray, fresh: ByteArray) {
            val matches = (0..message.size - old.size).filter { i -> old.indices.all { j -> message[i+j] == old[j] } }
            require(matches.size == 1)
            fresh.copyInto(message, matches.single())
        }
        replace(continuityFingerprint(oldPublic), decodeHex(record.fingerprint))
        replace(ByteArray(16) { it.toByte() }, decodeHex(record.generation))
        return message
    }
    @Test fun readRecoveryNeverCreatesSignsOrRepairsAndExplicitProvisionIsIdempotent() {
        val f = Fixture()
        repeat(3) { assertEquals(ContinuityCredentialPhase.NOT_PROVISIONED, f.manager().recover().phase) }
        assertEquals(0, f.keys.creates); assertEquals(0, f.storage.writes)
        val first = f.provision()
        assertEquals(first, f.provision())
        assertEquals(ContinuitySecurityLevel.SOFTWARE, first.securityLevel)
        assertEquals(1, f.keys.creates)
        assertEquals(ContinuityCredentialPhase.READY, f.manager().recover().phase)
        assertEquals(0, f.keys.signs)
        rejected { f.manager().provision(ContinuityDecision("another", 1001)) }
    }
    @Test fun replacementRetainsOldKeyAndReportsDiscontinuityWithStaleDecisionsBlocked() {
        val f = Fixture(); val old = f.provision()
        val decision = ContinuityDecision("explicit-replace", 1100)
        val replacement = f.manager().replace(decision, old.generation)
        assertEquals(old.generation, replacement.previousGeneration)
        assertNotEquals(old.generation, replacement.generation)
        assertNotEquals(old.fingerprint, replacement.fingerprint)
        assertEquals(2, f.keys.pairs.size)
        assertEquals(replacement, f.manager().replace(decision, old.generation))
        rejected { f.manager().replace(ContinuityDecision("stale", 1200), old.generation) }
        assertEquals(2, f.keys.creates)
    }
    @Test fun missingInvalidatedUnavailableMismatchAndOrphanedNeverTriggerRecreation() {
        for (observation in listOf(KeyObservation.Missing, KeyObservation.Invalidated, KeyObservation.Unavailable)) {
            val f = Fixture(); val record = f.provision()
            f.keys.overrides[record.alias] = observation
            val phase = when (observation) {
                KeyObservation.Missing -> ContinuityCredentialPhase.MISSING_KEY
                KeyObservation.Invalidated -> ContinuityCredentialPhase.INVALIDATED
                else -> ContinuityCredentialPhase.UNAVAILABLE
            }
            assertEquals(phase, f.manager().recover().phase)
            rejected { f.manager().provision(f.decision) }
            assertEquals(1, f.keys.creates)
            if (observation !== KeyObservation.Unavailable) {
                val replacement = f.manager().replace(ContinuityDecision("replace-lost", 1200), record.generation)
                assertEquals(record.generation, replacement.previousGeneration)
            } else rejected { f.manager().replace(ContinuityDecision("unsafe", 1200), record.generation) }
        }
        val f = Fixture(); val record = f.provision()
        f.keys.overrides[record.alias] = KeyObservation.Available(ByteArray(65), ContinuitySecurityLevel.UNKNOWN, true)
        assertEquals(ContinuityCredentialPhase.KEY_MISMATCH, f.manager().recover().phase)
        rejected { f.manager().replace(ContinuityDecision("mismatch", 1200), record.generation) }
        f.keys.overrides.clear(); f.storage.bytes = null
        assertEquals(ContinuityCredentialPhase.ORPHANED_KEY, f.manager().recover().phase)
        rejected { f.provision() }
        assertEquals(1, f.keys.creates)
    }
    @Test fun corruptRegistryIsPreservedAndDoesNotBecomeEmptyState() {
        val f = Fixture(); f.provision()
        f.storage.bytes!![10] = (f.storage.bytes!![10].toInt() xor 1).toByte()
        val before = f.storage.bytes!!.copyOf()
        assertEquals(ContinuityCredentialPhase.CORRUPT, f.manager().recover().phase)
        rejected { f.provision() }
        assertArrayEquals(before, f.storage.bytes)
        assertEquals(1, f.keys.creates)
    }
    @Test fun interruptionBeforeIntentOrCreationAndAfterCreationRequiresBoundedReconciliation() {
        for (boundary in listOf("intent-before", "intent-after", "key-before", "key-after", "final-before", "final-after")) {
            val f = Fixture()
            when (boundary) {
                "intent-before" -> f.storage.failBefore = 1
                "intent-after" -> f.storage.failAfter = 1
                "key-before" -> f.keys.failCreateBefore = true
                "key-after" -> f.keys.failCreateAfter = true
                "final-before" -> f.storage.failBefore = 2
                "final-after" -> f.storage.failAfter = 2
            }
            rejected { f.provision() }
            val creates = f.keys.creates; val writes = f.storage.writes
            val state = f.manager().recover()
            assertEquals(creates, f.keys.creates); assertEquals(writes, f.storage.writes)
            f.storage.failBefore = 0; f.storage.failAfter = 0
            f.keys.failCreateBefore = false; f.keys.failCreateAfter = false
            when (boundary) {
                "intent-before" -> { assertEquals(ContinuityCredentialPhase.NOT_PROVISIONED, state.phase); f.provision() }
                "final-after" -> { assertEquals(ContinuityCredentialPhase.READY, state.phase); assertEquals(state.current, f.provision()) }
                else -> {
                    assertEquals(ContinuityCredentialPhase.PROVISION_PENDING, state.phase)
                    val pending = state.pending!!
                    rejected { f.provision() }
                    rejected { f.manager().completePending(ContinuityDecision("wrong", 1400), "00".repeat(16)) }
                    val reconcile = ContinuityDecision("explicit-reconcile", 1500)
                    if (state.pendingKeyState == ContinuityPendingKeyState.MISSING) {
                        rejected { f.manager().completePending(reconcile, pending.generation) }
                        f.manager().resumeAbsentPendingCreation(reconcile, pending.generation)
                    } else {
                        rejected { f.manager().resumeAbsentPendingCreation(reconcile, pending.generation) }
                        f.manager().completePending(reconcile, pending.generation)
                    }
                    val current = f.manager().recover().current!!
                    assertEquals(f.decision.id, current.decisionId)
                    assertEquals(f.decision.decidedAtMs, current.decidedAtMs)
                    assertEquals(reconcile.id, current.reconciliationDecisionId)
                    assertEquals(reconcile.decidedAtMs, current.reconciledAtMs)
                    assertEquals(current, f.manager().completePending(reconcile, pending.generation))
                }
            }
            assertEquals(1, f.keys.pairs.size)
            assertEquals(ContinuityCredentialPhase.READY, f.manager().recover().phase)
        }
    }
    @Test fun pendingReplacementKeepsPreviousGenerationAndKey() {
        val f = Fixture(); val old = f.provision()
        f.keys.failCreateAfter = true
        rejected { f.manager().replace(ContinuityDecision("replace", 1100), old.generation) }
        val state = f.manager().recover()
        assertEquals(ContinuityCredentialPhase.REPLACEMENT_PENDING, state.phase)
        assertEquals(old, state.current)
        assertEquals(ContinuityPendingKeyState.AVAILABLE, state.pendingKeyState)
        val next = f.manager().completePending(ContinuityDecision("reconcile", 1200), state.pending!!.generation)
        assertEquals(old.generation, next.previousGeneration)
        assertEquals(2, f.keys.creates); assertEquals(2, f.keys.pairs.size)
    }
    @Test fun signatureBindsExactMessageDecisionOperationFingerprintAndGeneration() {
        val f = Fixture(); val record = f.provision(); val message = receipt(record)
        val approval = ContinuitySigningDecision("fixture-operation", continuityDigest(message).continuityHex(), record.generation)
        val signed = f.manager().sign(message, approval)
        val verifier = Signature.getInstance("SHA256withECDSA")
        verifier.initVerify(continuityPublicKey(signed.publicKey)); verifier.update(message)
        assertTrue(verifier.verify(signed.signatureDer))
        assertEquals(1, f.keys.signs)
        rejected { f.manager().sign(message, approval.copy(generation = "00".repeat(16))) }
        rejected { f.manager().sign(message, approval.copy(operationId = "different")) }
        val changed = message.copyOf(); changed[30] = 0
        rejected { f.manager().sign(changed, approval) }
        rejected { f.manager().sign(message + byteArrayOf(0), approval.copy(messageDigest = continuityDigest(message + byteArrayOf(0)).continuityHex())) }
        assertEquals(1, f.keys.signs)
        f.keys.badSignature = true
        rejected { f.manager().sign(message, approval) }
    }
    @Test fun parserAgreesWithAllIndependentVectorsAndRejectsMalformedEncodings() {
        val root = System.getProperty("arcanum.repoRoot") ?: File("../..").canonicalPath
        for (name in listOf("recording-minimal", "recording-rich", "human-adoption")) {
            val message = decodeHex(File(root, "docs/specs/runtime/fixtures/a16-v1/$name.message.hex").readText().trim())
            assertTrue(ContinuitySigningRequest.parse(message).operationId.isNotEmpty())
            for (size in 0 until message.size) rejected { ContinuitySigningRequest.parse(message.copyOf(size)) }
            rejected { ContinuitySigningRequest.parse(message + byteArrayOf(0)) }
            val nonminimal = byteArrayOf(0x98.toByte(), 20) + message.copyOfRange(1, message.size)
            rejected { ContinuitySigningRequest.parse(nonminimal) }
        }
    }
    @Test fun cooperatingConcurrentProvisionersCreateExactlyOneGeneration() {
        val f = Fixture()
        val gate = java.util.concurrent.CountDownLatch(1)
        val pool = java.util.concurrent.Executors.newFixedThreadPool(2)
        try {
            val jobs = (0..1).map { pool.submit<ContinuityCredential> { gate.await(); f.provision() } }
            gate.countDown()
            assertEquals(jobs[0].get(), jobs[1].get())
            assertEquals(1, f.keys.creates)
            assertEquals(1, f.keys.pairs.size)
        } finally { pool.shutdownNow() }
    }
    @Test fun strictDerAndUnqualifiedPrivateKeyObservationsFailClosed() {
        val f = Fixture(); val record = f.provision(); val message = receipt(record)
        val signature = f.manager().sign(message, ContinuitySigningDecision("fixture-operation", continuityDigest(message).continuityHex(), record.generation)).signatureDer
        assertTrue(continuityStrictDer(signature))
        assertFalse(continuityStrictDer(signature + byteArrayOf(0)))
        assertFalse(continuityStrictDer(byteArrayOf(0x30, 6, 2, 1, 0, 2, 1, 1)))
        assertFalse(continuityStrictDer(byteArrayOf(0x30, 7, 2, 2, 0, 1, 2, 1, 1)))
        assertFalse(continuityStrictDer(byteArrayOf(0x30, 6, 2, 1, 0x80.toByte(), 2, 1, 1)))
        val observation = f.keys.observe(record.alias) as KeyObservation.Available
        f.keys.overrides[record.alias] = KeyObservation.Available(observation.publicKey, observation.securityLevel, false)
        assertEquals(ContinuityCredentialPhase.UNAVAILABLE, f.manager().recover().phase)
        rejected { f.manager().sign(message, ContinuitySigningDecision("fixture-operation", continuityDigest(message).continuityHex(), record.generation)) }
        assertEquals(1, f.keys.signs)
    }

    @Test fun lostRegistryAndInitialKeyCannotHideRetainedLaterGenerationOrUnknownNamespace() {
        val f = Fixture(); val old = f.provision()
        f.manager().replace(ContinuityDecision("replace", 1100), old.generation)
        f.storage.bytes = null
        f.keys.pairs.remove(old.alias)
        assertEquals(ContinuityCredentialPhase.ORPHANED_KEY, f.manager().recover().phase)
        rejected { f.provision() }
        assertEquals(2, f.keys.creates)
        assertEquals(1, f.keys.pairs.size)
        val unavailable = Fixture()
        unavailable.keys.namespaceUnavailable = true
        assertEquals(ContinuityCredentialPhase.UNAVAILABLE, unavailable.manager().recover().phase)
        rejected { unavailable.provision() }
        assertEquals(0, unavailable.keys.creates)
    }

}
