package org.arcanum.nativehost.continuity

import org.junit.Assert.*
import org.junit.Test
import java.io.ByteArrayOutputStream
import java.io.File
import java.nio.ByteBuffer
import java.security.KeyPair
import java.security.KeyPairGenerator
import java.security.Signature
import java.security.interfaces.ECPublicKey
import java.security.spec.ECGenParameterSpec

class ContinuityOperationControllerTest {
    private class Storage : ContinuityCredentialStorage {
        var bytes: ByteArray? = null
        var fail = false
        override fun read() = bytes?.copyOf()
        override fun writeAtomically(bytes: ByteArray) { if (fail) error("qualification storage failure"); this.bytes = bytes.copyOf() }
        override fun <T> locked(action: () -> T): T = synchronized(this) { action() }
    }
    private class Keys : ContinuityKeyProvider {
        val keys = mutableMapOf<String, KeyPair>()
        var signs = 0; var creates = 0
        override fun namespaceState() = if (keys.isEmpty()) ContinuityNamespaceState.EMPTY else ContinuityNamespaceState.PRESENT
        override fun observe(alias: String): KeyObservation {
            val pair = keys[alias] ?: return KeyObservation.Missing
            val key = pair.public as ECPublicKey
            fun coordinate(value: java.math.BigInteger): ByteArray { val b = value.toByteArray(); val u = if (b.size == 33) b.copyOfRange(1, 33) else b; return ByteArray(32 - u.size) + u }
            return KeyObservation.Available(byteArrayOf(4) + coordinate(key.w.affineX) + coordinate(key.w.affineY), ContinuitySecurityLevel.SOFTWARE, true)
        }
        override fun create(alias: String) { creates++; check(alias !in keys); keys[alias] = KeyPairGenerator.getInstance("EC").also { it.initialize(ECGenParameterSpec("secp256r1")) }.generateKeyPair() }
        override fun sign(alias: String, message: ByteArray): ByteArray { signs++; return Signature.getInstance("SHA256withECDSA").also { it.initSign(keys.getValue(alias).private); it.update(message) }.sign() }
    }
    private class Native : ContinuityNativePort {
        var phase = ContinuityOperationPhase.NOT_FOUND
        var frozen: ByteArray? = null
        var failPrepare = false; var failCommit = false; var failAfterStage = false; var failAfterPublish = false
        var prepares = 0; var commits = 0; var publications = 0
        override fun prepare(intent: ContinuityOperationIntent): ContinuityNativePresentation {
            prepares++; if (failPrepare) error("qualification before prepare")
            frozen = frozen ?: message(intent)
            if (phase == ContinuityOperationPhase.NOT_FOUND) phase = ContinuityOperationPhase.RECEIPT_PENDING
            return presentation()
        }
        override fun inspect(operationId: String) = phase
        override fun commit(operationId: String, message: ByteArray, signature: ContinuityPublicSignature): ContinuityNativePresentation {
            commits++; check(message.contentEquals(frozen))
            if (failCommit) error("qualification signature acknowledgment lost")
            phase = ContinuityOperationPhase.PUBLISH_PENDING
            if (failAfterStage) error("qualification stage acknowledgment lost")
            phase = ContinuityOperationPhase.COMMITTED
            if (failAfterPublish) error("qualification publication acknowledgment lost")
            return presentation()
        }
        override fun publishOriginal(operationId: String, wrapper: ByteArray): ContinuityNativePresentation { publications++; assertArrayEquals(byteArrayOf(42), wrapper); phase = ContinuityOperationPhase.COMMITTED; return presentation() }
        override fun recover(operationId: String): ContinuityNativePresentation { check(phase == ContinuityOperationPhase.COMMITTED); return presentation() }
        fun presentation() = ContinuityNativePresentation(phase, frozen ?: error("no intent"), if (phase in listOf(ContinuityOperationPhase.PUBLISH_PENDING, ContinuityOperationPhase.COMMITTED)) byteArrayOf(42) else null)
    }
    private class Fixture {
        val keys = Keys(); val metadata = Storage(); val intents = Storage(); val native = Native()
        val manager = ContinuityCredentialManager(metadata, keys, { 900L })
        val credential = manager.provision(ContinuityDecision("test-provision", 800L))
        fun controller() = ContinuityOperationController(manager, native, ContinuityOperationJournal(intents), { 1234L }, { "01".repeat(16) })
        fun create(adoption: Boolean = false) = controller().createSample(adoption, credential.generation, 1000L)
    }
    private fun blocked(action: () -> Unit) { try { action(); fail("expected blocked operation") } catch (_: IllegalStateException) { } catch (_: IllegalArgumentException) { } }
    @Test fun observationNeverCreatesSignsPreparesOrPublishesAndCompletedRetryIsReadOnly() {
        val f = Fixture(); assertEquals(ContinuityFlowPhase.NO_SAMPLE, f.controller().recover().phase)
        assertEquals(0, f.keys.signs); assertEquals(0, f.native.prepares)
        f.create(); assertEquals(ContinuityFlowPhase.COMMITTED, f.controller().recover().phase)
        repeat(3) { f.controller().recover() }
        assertEquals(1, f.keys.signs); assertEquals(1, f.native.commits); assertEquals(1, f.keys.creates)
    }
    @Test fun signingUnknownCannotBeAutomaticallyRepeatedOrOverwritten() {
        val f = Fixture(); f.native.failCommit = true; blocked { f.create() }
        assertEquals(ContinuityFlowPhase.SIGNING_UNKNOWN, f.controller().recover().phase)
        blocked { f.controller().resumeUnsigned() }; blocked { f.create() }
        assertEquals(1, f.keys.signs); assertEquals(1, f.native.commits)
        assertTrue(ContinuityOperationJournal(f.intents).latest()!!.signingStarted)
    }
    @Test fun existingStagedSignaturePublishesWithoutAnotherSignerCall() {
        val f = Fixture(); f.native.failAfterStage = true; blocked { f.create() }
        assertEquals(ContinuityFlowPhase.PUBLICATION_PENDING, f.controller().recover().phase)
        f.controller().publishExisting()
        assertEquals(1, f.keys.signs); assertEquals(1, f.native.publications)
        assertEquals(ContinuityFlowPhase.COMMITTED, f.controller().recover().phase)
    }
    @Test fun missingPublicationAcknowledgmentRecoversOriginalWithoutRepeating() {
        val f = Fixture(); f.native.failAfterPublish = true; blocked { f.create() }
        assertEquals(ContinuityFlowPhase.COMMITTED, f.controller().recover().phase)
        assertEquals(1, f.keys.signs); assertEquals(1, f.native.commits)
    }
    @Test fun unsignedIntentSurvivesPrepareFailureAndKeepsActualConfirmationTime() {
        val f = Fixture(); f.native.failPrepare = true; blocked { f.create(true) }
        assertEquals(ContinuityFlowPhase.UNSIGNED_PENDING, f.controller().recover().phase)
        val intent = ContinuityOperationJournal(f.intents).latest()!!
        assertEquals(1000L, intent.confirmedAtMs); assertTrue(intent.adoption); assertFalse(intent.signingStarted)
        f.native.failPrepare = false; f.controller().resumeUnsigned()
        assertEquals(1000L, ContinuityOperationJournal(f.intents).latest()!!.confirmedAtMs)
        assertEquals(1, f.keys.signs)
    }
    @Test fun lostKeyDoesNotPreventOldReceiptRecoveryAndStalePreviewCannotSign() {
        val f = Fixture(); f.create(); f.keys.keys.clear()
        val state = f.controller().recover()
        assertEquals(ContinuityCredentialPhase.MISSING_KEY, state.credential.phase)
        assertEquals(ContinuityFlowPhase.COMMITTED, state.phase)
        assertEquals(1, f.keys.signs)
        val g = Fixture(); blocked { g.controller().createSample(false, "00".repeat(16), 1000) }
        assertNull(ContinuityOperationJournal(g.intents).latest()); assertEquals(0, g.keys.signs)
    }
    @Test fun malformedNativePacketAndCorruptOperationJournalRemainBlocked() {
        val root = System.getProperty("arcanum.repoRoot") ?: File("../..").canonicalPath
        val message = decodeHex(File(root, "docs/specs/runtime/fixtures/a16-v1/recording-minimal.message.hex").readText().trim())
        val packet = ByteBuffer.allocate(10 + message.size).put(1).put(2).putInt(message.size).put(message).putInt(0).array()
        assertEquals(ContinuityOperationPhase.RECEIPT_PENDING, ContinuityNativePresentation.fromPacket(packet).phase)
        blocked { ContinuityNativePresentation.fromPacket(packet + byteArrayOf(0)) }
        blocked { ContinuityNativePresentation.fromPacket(packet.copyOf().also { it[1] = 4 }) }
        blocked { ContinuityNativePresentation.fromPacket(packet.copyOf().also { it[0] = 2 }) }
        val f = Fixture(); f.create(); f.intents.bytes!![5] = 0
        blocked { f.controller().recover() }; assertEquals(1, f.keys.signs)
    }
    companion object {
        private fun message(intent: ContinuityOperationIntent): ByteArray {
            val out = ByteArrayOutputStream()
            fun head(type: Int, n: Long) { if (n < 24) out.write(type * 32 + n.toInt()) else if (n < 256) { out.write(type * 32 + 24); out.write(n.toInt()) } else { out.write(type * 32 + 25); out.write((n shr 8).toInt()); out.write(n.toInt()) } }
            fun text(s: String) { val b = s.toByteArray(); head(3, b.size.toLong()); out.write(b) }
            fun bytes(b: ByteArray) { head(2, b.size.toLong()); out.write(b) }
            fun nil() { out.write(246) }
            head(4, 20); text("org.arcanum.continuity.receipt"); head(0, 1); text(if (intent.adoption) "human-adoption" else "local-recording"); text("local-only"); text(intent.operationId); text("synthetic-${intent.operationId}"); text("arcanum.public-synthetic-text/v1"); text("sha256"); bytes(ByteArray(32)); bytes(decodeHex(intent.fingerprint)); bytes(decodeHex(intent.generation)); text("ecdsa-p256-sha256-der"); nil()
            head(4, if (intent.adoption) 1 else 0)
            if (intent.adoption) { head(4, 4); text("human-adoption-evidence"); text("native-confirmation:${intent.operationId}"); nil(); nil() }
            nil(); nil(); head(0, intent.confirmedAtMs); if (intent.adoption) head(0, intent.confirmedAtMs) else nil(); nil(); text("test")
            return out.toByteArray()
        }
    }
}
