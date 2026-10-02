package org.arcanum.nativehost.continuity

import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import org.arcanum.nativehost.BuildConfig
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.json.JSONObject
import java.io.File
import java.security.KeyStore
import java.util.UUID

/** Explicit per-method device protocol. Refuses the participant application's package. */
@RunWith(AndroidJUnit4::class)
class ContinuityDeviceQualificationTest {
    private val context get() = InstrumentationRegistry.getInstrumentation().targetContext
    private val baseline get() = File(context.noBackupFilesDir, "a16-device-qualification-baseline.json")
    private lateinit var manager: ContinuityCredentialManager
    private lateinit var native: ContinuityNativePort
    private lateinit var controller: ContinuityOperationController
    @Before fun assertIsolatedBoundTarget() {
        check(context.packageName == "org.arcanum.nativehost.a16qualification") { "Physical tests require the isolated qualification package" }
        check(BuildConfig.ARCANUM_SOURCE_COMMIT.matches(Regex("[0-9a-f]{40}"))) { "Qualification APK must bind its actual source" }
        check(BuildConfig.ARCANUM_IMPLEMENTATION_ARC == "CE-W04-A16")
        manager = ContinuityCredentialManager(AndroidContinuityCredentialStorage(context), AndroidContinuityKeyProvider())
        native = ContinuityNativeBridge.port(File(context.noBackupFilesDir, "continuity-synthetic.v1"))
        controller = ContinuityOperationController(manager, native, ContinuityOperationJournal(AndroidContinuityCredentialStorage(context, ContinuityStorageSlot.OPERATIONS)))
    }
    private fun decision(label: String) = ContinuityDecision("qualification-$label-${UUID.randomUUID()}", System.currentTimeMillis())
    private fun saved(): JSONObject { check(baseline.isFile); return JSONObject(baseline.readText()) }
    private fun wrapperHash(operation: String) = continuityDigest(native.recover(operation).originalWrapper ?: error("Original receipt missing")).continuityHex()
    @Test fun seed() {
        check(!baseline.exists()) { "Original seed may already exist; reconcile, do not repeat" }
        assertEquals(ContinuityCredentialPhase.NOT_PROVISIONED, manager.recover().phase)
        assertEquals(ContinuityFlowPhase.NO_SAMPLE, controller.recover().phase)
        val credential = manager.provision(decision("provision"))
        val observed = AndroidContinuityKeyProvider().observe(credential.alias) as KeyObservation.Available
        assertTrue(observed.nonExportable)
        assertEquals(ContinuityCredentialPhase.READY, manager.recover().phase)
        val receipt = controller.createSample(false, credential.generation, System.currentTimeMillis())
        val state = controller.recover()
        assertEquals(ContinuityOperationPhase.COMMITTED, receipt.phase)
        val operation = state.intent!!.operationId
        val bytes = JSONObject().put("source", BuildConfig.ARCANUM_SOURCE_COMMIT)
            .put("generation", credential.generation).put("fingerprint", credential.fingerprint)
            .put("operation", operation).put("wrapperDigest", wrapperHash(operation))
            .put("securityLevel", credential.securityLevel.name).toString().toByteArray()
        check(baseline.createNewFile())
        java.io.FileOutputStream(baseline).use { it.write(bytes); it.fd.sync() }
    }
    @Test fun recoverAfterRestart() {
        val original = saved()
        assertEquals(original.getString("source"), BuildConfig.ARCANUM_SOURCE_COMMIT)
        val credential = manager.recover()
        assertEquals(ContinuityCredentialPhase.READY, credential.phase)
        assertEquals(original.getString("generation"), credential.current!!.generation)
        assertEquals(original.getString("fingerprint"), credential.current!!.fingerprint)
        assertEquals(ContinuityFlowPhase.COMMITTED, controller.recover().phase)
        assertEquals(original.getString("wrapperDigest"), wrapperHash(original.getString("operation")))
    }
    @Test fun recoverAfterCompatibleUpdate() {
        @Suppress("DEPRECATION")
        val installed = context.packageManager.getPackageInfo(context.packageName, 0).versionCode
        assertEquals(27, installed)
        recoverAfterRestart()
    }
    @Test fun rejectTamperedReceipt() {
        val original = saved(); val operation = original.getString("operation")
        val receipt = native.recover(operation)
        val tampered = receipt.originalWrapper!!.copyOf(); tampered[tampered.lastIndex] = (tampered.last().toInt() xor 1).toByte()
        try { native.publishOriginal(operation, tampered); fail("Tampered receipt accepted") } catch (_: IllegalStateException) { }
        assertEquals(original.getString("wrapperDigest"), wrapperHash(operation))
    }
    @Test fun loseQualificationKey() {
        check(context.packageName == "org.arcanum.nativehost.a16qualification")
        val original = saved(); val before = manager.recover()
        assertEquals(ContinuityCredentialPhase.READY, before.phase)
        assertEquals(original.getString("generation"), before.current!!.generation)
        val store = KeyStore.getInstance("AndroidKeyStore").also { it.load(null) }
        // This destructive step is explicitly selected and affects this isolated UID only.
        store.deleteEntry(before.current!!.alias)
        repeat(3) { assertEquals(ContinuityCredentialPhase.MISSING_KEY, manager.recover().phase) }
        assertEquals(ContinuityFlowPhase.COMMITTED, controller.recover().phase)
        assertEquals(original.getString("wrapperDigest"), wrapperHash(original.getString("operation")))
        assertFalse(store.containsAlias(before.current!!.alias))
    }
    @Test fun replaceMissingQualificationKey() {
        val original = saved(); val before = manager.recover()
        assertEquals(ContinuityCredentialPhase.MISSING_KEY, before.phase)
        val next = manager.replace(decision("replace-missing"), before.current!!.generation)
        assertEquals(before.current!!.generation, next.previousGeneration)
        assertNotEquals(before.current!!.generation, next.generation)
        assertEquals(ContinuityCredentialPhase.READY, manager.recover().phase)
        assertEquals(original.getString("wrapperDigest"), wrapperHash(original.getString("operation")))
    }
    @Test fun rotateReadyQualificationKey() {
        val before = manager.recover()
        assertEquals(ContinuityCredentialPhase.READY, before.phase)
        val store = KeyStore.getInstance("AndroidKeyStore").also { it.load(null) }
        assertTrue(store.containsAlias(before.current!!.alias))
        val next = manager.replace(decision("rotate-ready"), before.current!!.generation)
        assertEquals(before.current!!.generation, next.previousGeneration)
        assertTrue(store.containsAlias(before.current!!.alias))
        assertTrue(store.containsAlias(next.alias))
        val original = saved()
        assertEquals(original.getString("wrapperDigest"), wrapperHash(original.getString("operation")))
    }
}
