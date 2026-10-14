package org.arcanum.nativehost.hope

import androidx.test.platform.app.InstrumentationRegistry
import java.io.File
import java.util.UUID
import org.junit.Assert.*
import org.junit.Test

/** Independent synthetic vaults and key aliases. Never reads the participant's Hope directory. */
class HopeBackupControlsAcceptanceTest {
    private val context = InstrumentationRegistry.getInstrumentation().targetContext
    private fun root(): File {
        check(context.packageName == "org.arcanum.nativehost.a19qualification")
        return File(context.filesDir, "backup-synthetic/${UUID.randomUUID()}").also { check(it.mkdirs()) }
    }
    private fun key() = AndroidHopeKeyManager("arcanum.backup.synthetic.${UUID.randomUUID()}")
    private fun store(root: File, keys: AndroidHopeKeyManager, checkpoint: (String) -> Unit = {}) =
        HopeCollectionStore(root, keys, HopeRuntimeBridge.contract(), checkpoint = checkpoint)
    private fun fixture(id: String): HopeLocalState {
        val reflection = HopeRuntimeBridge.buildReflection(id, "2026-10-14T12:00:00Z", null,
            "  Synthetic mémoire 🌿\nExact trailing spaces.  ", null,
            HopeTempusProvenance("synthetic-clock", "2026-10-14T12:00:00Z", "system-clock"))
        return HopeLocalState(reflection, HopeLocalStateCodec.createReceipt(reflection, "2026-10-14T12:01:00Z"))
    }
    private fun fails(action: () -> Unit) { try { action(); fail("Expected bounded refusal") } catch (_: Exception) { } }
    private fun same(expected: HopeLocalState, actual: HopeLocalState) {
        assertTrue("Synthetic bytes preserved", expected.reflectionJson == actual.reflectionJson)
        assertTrue("Synthetic receipt preserved", expected.receipt == actual.receipt)
    }

    @Test fun independentCustodyRoundTripAndRefusals() {
        val sourceRoot = root(); val sourceKeys = key(); val source = store(sourceRoot, sourceKeys)
        val active = fixture("backup-active"); val archived = fixture("backup-archived"); val deleted = fixture("backup-deleted")
        source.save(active); source.save(archived); source.archive(archived.receipt.reflectionId)
        source.save(deleted); source.delete(source.prepareDelete(deleted.receipt.reflectionId, false), true)
        val sourceFile = File(sourceRoot, "hope/collection.v0.1.enc"); val before = sourceFile.readBytes()
        val backup = source.exportBackup()
        assertArrayEquals(before, sourceFile.readBytes())
        assertNull(sourceKeys.getExisting()!!.encoded)
        val destRoot = root(); val destKeys = key(); val dest = store(destRoot, destKeys)
        dest.previewBackup(backup.encryptedBytes, backup.recoveryCode).use { preview ->
            assertEquals(1, preview.activeCount); assertEquals(1, preview.archivedCount)
            assertNull(destKeys.getExisting()); assertTrue(destRoot.listFiles()!!.isEmpty())
            dest.restoreBackup(preview, false); assertNull(destKeys.getExisting())
            dest.restoreBackup(preview, true)
            fails { dest.restoreBackup(preview, true) }
        }
        assertNull(destKeys.getExisting()!!.encoded)
        val reopened = store(destRoot, destKeys)
        same(active, reopened.browse().single()); same(archived, reopened.browse(true).single())
        fails { reopened.save(deleted) }
        val destFile = File(destRoot, "hope/collection.v0.1.enc"); val destBefore = destFile.readBytes()
        fails { HopeProtectedStore(destRoot, sourceKeys, HopeRuntimeBridge.contract(), "hope/collection.v0.1.enc").recoverExact() }
        assertArrayEquals(destBefore, destFile.readBytes())
        // Occupied, archived-only and initialized-but-empty states all retain their ciphertext.
        reopened.archive(active.receipt.reflectionId)
        for (empty in listOf(false, true)) {
            if (empty) {
                reopened.delete(reopened.prepareDelete(active.receipt.reflectionId, true), true)
                reopened.delete(reopened.prepareDelete(archived.receipt.reflectionId, true), true)
            }
            val unchanged = destFile.readBytes()
            reopened.previewBackup(backup.encryptedBytes, backup.recoveryCode).use { fails { reopened.restoreBackup(it, true) } }
            assertArrayEquals(unchanged, destFile.readBytes())
        }
        assertArrayEquals(before, sourceFile.readBytes())
    }

    @Test fun interruptionAndMalformedInputPreserveCustody() {
        val source = store(root(), key()); source.save(fixture("backup-interruption")); val backup = source.exportBackup()
        for (phase in listOf("import-pending", "import-key-created", "import-written", "import-verified")) {
            val dir = root(); val keys = key()
            val interrupted = store(dir, keys) { if (it == phase) error("Synthetic interruption") }
            interrupted.previewBackup(backup.encryptedBytes, backup.recoveryCode).use { fails { interrupted.restoreBackup(it, true) } }
            val next = store(dir, keys); fails { next.browse() }
            next.previewBackup(backup.encryptedBytes, backup.recoveryCode).use { fails { next.restoreBackup(it, true) } }
            if (phase == "import-written" || phase == "import-verified") {
                next.finishInterruptedRestore(); same(fixture("backup-interruption"), next.browse().single())
            } else fails { next.finishInterruptedRestore() }
        }
        val dir = root(); val keys = key(); val fresh = store(dir, keys)
        val tampered = backup.encryptedBytes.copyOf(); tampered[tampered.lastIndex] = (tampered.last().toInt() xor 1).toByte()
        fails { fresh.previewBackup(tampered, backup.recoveryCode) }
        fails { fresh.previewBackup(backup.encryptedBytes, HopeBackupFormat.seal(byteArrayOf(1)).recoveryCode) }
        val invalid = HopeBackupFormat.seal("{}".toByteArray())
        fails { fresh.previewBackup(invalid.encryptedBytes, invalid.recoveryCode) }
        assertNull(keys.getExisting()); assertTrue(dir.listFiles()!!.isEmpty())
        fresh.previewBackup(backup.encryptedBytes, backup.recoveryCode).use {
            fresh.save(fixture("concurrent-save")); val file = File(dir, "hope/collection.v0.1.enc"); val before = file.readBytes()
            fails { fresh.restoreBackup(it, true) }; assertArrayEquals(before, file.readBytes())
        }
    }

    @Test fun participantSelectionValidationAndCancellation() {
        val source = store(root(), key()); source.save(fixture("ui-synthetic")); val backup = source.exportBackup()
        val file = File(root(), "synthetic.hopebackup"); file.writeBytes(backup.encryptedBytes)
        val instrumentation = InstrumentationRegistry.getInstrumentation()
        val result = android.app.Instrumentation.ActivityResult(android.app.Activity.RESULT_OK,
            android.content.Intent().setData(android.net.Uri.fromFile(file)))
        val monitor = instrumentation.addMonitor(android.content.IntentFilter(android.content.Intent.ACTION_OPEN_DOCUMENT), result, true)
        val activity = instrumentation.startActivitySync(android.content.Intent(context, HopeBackupActivity::class.java).addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK))
        fun views(view: android.view.View): List<android.view.View> = listOf(view) +
            if (view is android.view.ViewGroup) (0 until view.childCount).flatMap { views(view.getChildAt(it)) } else emptyList()
        fun click(label: String) = instrumentation.runOnMainSync {
            views(activity.window.decorView).filterIsInstance<android.widget.Button>().single { it.text == label }.performClick()
        }
        fun awaitText(value: String) {
            val until = System.nanoTime() + 10_000_000_000L
            while (System.nanoTime() < until) {
                var found = false
                instrumentation.runOnMainSync { found = views(activity.window.decorView).filterIsInstance<android.widget.TextView>().any { it.text.toString() == value } }
                if (found) return
                Thread.sleep(50)
            }
            fail("Synthetic UI transition timed out")
        }
        try {
            click("Select backup to restore"); awaitText("Validate backup")
            instrumentation.runOnMainSync {
                val code = views(activity.window.decorView).filterIsInstance<android.widget.EditText>().single()
                assertFalse(code.isSaveEnabled)
                assertTrue(org.arcanum.nativehost.architect.ArchitectObservationPrivacy.isPrivateText(code))
                code.setText(backup.recoveryCode)
            }
            click("Validate backup"); awaitText("Confirm restore into new vault")
            instrumentation.runOnMainSync {
                val counts = views(activity.window.decorView).filterIsInstance<android.widget.TextView>().single { it.text == "1 active; 0 archived" }
                assertTrue(org.arcanum.nativehost.architect.ArchitectObservationPrivacy.isPrivateText(counts))
            }
            click("Cancel restore"); awaitText("Restore cancelled. Vault unchanged.")
            assertEquals(1, monitor.hits)
        } finally {
            instrumentation.removeMonitor(monitor)
            instrumentation.runOnMainSync { activity.finish() }
        }
    }

    @Test fun participantScreenIsPrivateAndDoesNotOpenVault() {
        val instrumentation = InstrumentationRegistry.getInstrumentation()
        val activity = instrumentation.startActivitySync(android.content.Intent(context, HopeBackupActivity::class.java).addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK))
        instrumentation.runOnMainSync {
            assertTrue(activity.window.attributes.flags and android.view.WindowManager.LayoutParams.FLAG_SECURE != 0)
            fun views(view: android.view.View): List<android.view.View> = listOf(view) +
                if (view is android.view.ViewGroup) (0 until view.childCount).flatMap { views(view.getChildAt(it)) } else emptyList()
            val buttons = views(activity.window.decorView).filterIsInstance<android.widget.Button>().map { it.text.toString() }
            assertTrue(buttons.contains("Prepare encrypted backup")); assertTrue(buttons.contains("Select backup to restore"))
            activity.finish()
        }
    }
}
