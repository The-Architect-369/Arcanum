package org.arcanum.nativehost.hope

import java.io.File
import java.io.InputStream
import java.util.UUID
import javax.crypto.SecretKey
import javax.crypto.spec.SecretKeySpec
import org.json.JSONObject
import org.junit.Assert.*
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder

/** Host tests use an empty synthetic snapshot validator. Real Rust semantics run on the S23. */
class HopeBackupControlsTest {
    @get:Rule val temporary = TemporaryFolder()
    private val contract = HopeRuntimeContract("hope", "hope.reflection.v0.1", "hope/reflections.v0.1.enc", "local_private", "advisory_only", "local", false, "none", false)
    private val snapshot = """{"version":"hope.collection.v0.1","nextSequence":0,"entries":[],"retiredIds":[]}"""
    private val command: (String, String, String) -> String = { state, op, _ ->
        if (op != "new") require(JSONObject(state).getJSONArray("entries").length() == 0)
        when (op) { "new" -> snapshot; "validate" -> "{}"; "browse", "browse-archived" -> "[]"; else -> error("Unexpected synthetic operation") }
    }
    private class Keys : HopeSecretKeyProvider {
        var key: SecretKey? = null; var creates = 0
        override fun getExisting() = key
        override fun getOrCreate(): SecretKey { key?.let { return it }; creates++; return SecretKeySpec(ByteArray(32).also(java.security.SecureRandom()::nextBytes), "AES").also { key = it } }
    }
    private fun backup() = HopeBackupFormat.seal(HopeCollectionCodec.encode(HopeCollectionState(snapshot, emptyMap(), UUID.randomUUID().toString())))
    private fun store(dir: File, keys: Keys, checkpoint: (String) -> Unit = {}) = HopeCollectionStore(dir, keys, contract, command, checkpoint)
    private fun fails(action: () -> Unit) { try { action(); fail("Expected refusal") } catch (_: Exception) { } }

    @Test fun previewAndCancelNeverCreateCustody() {
        val root = temporary.newFolder(); val keys = Keys(); val s = store(root, keys); val b = backup()
        s.previewBackup(b.encryptedBytes, b.recoveryCode).use { s.restoreBackup(it, false) }
        assertEquals(0, keys.creates); assertTrue(root.listFiles()!!.isEmpty())
    }
    @Test fun freshRestoreReencryptsAndExportDoesNotMutate() {
        val root = temporary.newFolder(); val keys = Keys(); val s = store(root, keys); val b = backup()
        s.previewBackup(b.encryptedBytes, b.recoveryCode).use { s.restoreBackup(it, true) }
        assertEquals(1, keys.creates)
        val file = File(root, "hope/collection.v0.1.enc"); val before = file.readBytes()
        val exported = s.exportBackup()
        assertArrayEquals(before, file.readBytes())
        val original = JSONObject(String(HopeBackupFormat.open(b.encryptedBytes, b.recoveryCode)))
        val restored = JSONObject(String(HopeBackupFormat.open(exported.encryptedBytes, exported.recoveryCode)))
        assertEquals(original.getString("snapshot"), restored.getString("snapshot"))
        assertNotEquals(original.getString("revision"), restored.getString("revision"))
        fails { s.previewBackup(b.encryptedBytes, b.recoveryCode).use { s.restoreBackup(it, true) } }
        assertArrayEquals(before, file.readBytes())
    }
    @Test fun everyAmbiguousDestinationRefusedBeforeKeyCreation() {
        for (name in listOf("collection.initialized", "reflections.v0.1.enc", "collection.v0.1.enc", "collection.v0.1.enc.tmp", "backup-import.pending", "unknown")) {
            val root = temporary.newFolder(); val keys = Keys(); val s = store(root, keys); val b = backup()
            val file = File(root, "hope/$name"); file.parentFile!!.mkdirs(); file.writeText("synthetic preserved")
            s.previewBackup(b.encryptedBytes, b.recoveryCode).use { preview -> fails { s.restoreBackup(preview, true) } }
            assertEquals("synthetic preserved", file.readText()); assertEquals(0, keys.creates)
        }
        val root = temporary.newFolder(); val keys = Keys(); keys.getOrCreate(); val s = store(root, keys); val b = backup()
        s.previewBackup(b.encryptedBytes, b.recoveryCode).use { fails { s.restoreBackup(it, true) } }
        assertEquals(1, keys.creates)
    }
    @Test fun destinationChangedAfterPreviewIsRefused() {
        val root = temporary.newFolder(); val keys = Keys(); val s = store(root, keys); val b = backup()
        s.previewBackup(b.encryptedBytes, b.recoveryCode).use {
            File(root, "hope").mkdirs(); File(root, "hope/collection.initialized").writeBytes(byteArrayOf(1))
            fails { s.restoreBackup(it, true) }
        }
        assertEquals(0, keys.creates)
    }
    @Test fun interruptionNeverReplaysAndOnlyCompleteCiphertextCanFinalize() {
        for (phase in listOf("import-pending", "marker-written", "import-key-created", "import-written", "import-verified")) {
            val root = temporary.newFolder(); val keys = Keys(); val b = backup()
            val s = store(root, keys) { if (it == phase) error("Synthetic interruption") }
            s.previewBackup(b.encryptedBytes, b.recoveryCode).use { fails { s.restoreBackup(it, true) } }
            val next = store(root, keys)
            fails { next.browse() }
            next.previewBackup(b.encryptedBytes, b.recoveryCode).use { fails { next.restoreBackup(it, true) } }
            if (phase == "import-written" || phase == "import-verified") {
                next.finishInterruptedRestore(); assertTrue(next.browse().isEmpty())
                assertFalse(File(root, "hope/backup-import.pending").exists())
            } else {
                fails { next.finishInterruptedRestore() }; assertTrue(File(root, "hope/backup-import.pending").isFile)
            }
        }
    }
    @Test fun incompleteOrCorruptReconciliationPreservesBytes() {
        val root = temporary.newFolder(); val keys = Keys(); val b = backup()
        val s = store(root, keys) { if (it == "import-written") error("Synthetic interruption") }
        s.previewBackup(b.encryptedBytes, b.recoveryCode).use { fails { s.restoreBackup(it, true) } }
        val file = File(root, "hope/collection.v0.1.enc"); val bad = file.readBytes(); bad[bad.lastIndex] = (bad.last().toInt() xor 1).toByte(); file.writeBytes(bad)
        fails { store(root, keys).finishInterruptedRestore() }; assertArrayEquals(bad, file.readBytes())
        keys.key = null; fails { store(root, keys).finishInterruptedRestore() }; assertEquals(1, keys.creates)
    }
    @Test fun invalidAuthenticatedPayloadAndWrongCodeLeaveNoFiles() {
        val root = temporary.newFolder(); val keys = Keys(); val s = store(root, keys)
        for (value in listOf("{}", "{\"version\":1,\"version\":1}", "[]", "{\"snapshot\":\"invalid\"}")) {
            val b = HopeBackupFormat.seal(value.toByteArray()); fails { s.previewBackup(b.encryptedBytes, b.recoveryCode) }
        }
        val b = backup(); fails { s.previewBackup(b.encryptedBytes, backup().recoveryCode) }
        assertTrue(root.listFiles()!!.isEmpty()); assertEquals(0, keys.creates)
    }
    @Test fun boundedStreamAndNestedDuplicateRejection() {
        val input = object : InputStream() { var count = 0; override fun read(): Int = if (count++ <= HopeBackupFormat.MAX_FILE_BYTES) 0 else -1 }
        fails { HopeBackupPayload.readBounded(input) }
        for (text in listOf("{\"a\":{\"b\":1,\"b\":2}}", "{}{}", "[1,]", "{\"a\":NaN}", "[".repeat(34) + "]".repeat(34))) fails { HopeBackupPayload.validateJson(text.toByteArray()) }
        HopeBackupPayload.validateJson("{\"a\":[true,1.5,null,\"escaped \\\" text\"]}".toByteArray())
    }
    @Test fun exportRequiresSuccessfulCloseAndIdenticalReadback() {
        val bytes = backup().encryptedBytes
        val output = java.io.ByteArrayOutputStream()
        HopeBackupPayload.writeVerified(bytes, { output }, { output.toByteArray().inputStream() })
        assertArrayEquals(bytes, output.toByteArray())
        fails { HopeBackupPayload.writeVerified(bytes, { null }, { bytes.inputStream() }) }
        fails { HopeBackupPayload.writeVerified(bytes, { java.io.ByteArrayOutputStream() }, { byteArrayOf(1).inputStream() }) }
        val full = object : java.io.OutputStream() { override fun write(value: Int) { throw java.io.IOException("Synthetic full storage") } }
        fails { HopeBackupPayload.writeVerified(bytes, { full }, { bytes.inputStream() }) }
        val closeFailure = object : java.io.ByteArrayOutputStream() { override fun close() { throw java.io.IOException("Synthetic close failure") } }
        fails { HopeBackupPayload.writeVerified(bytes, { closeFailure }, { bytes.inputStream() }) }
    }
    @Test fun previewCloseAndDiagnosticsArePrivate() {
        val root = temporary.newFolder(); val keys = Keys(); val s = store(root, keys); val b = backup()
        val preview = s.previewBackup(b.encryptedBytes, b.recoveryCode)
        assertEquals("HopeRestorePreview([private])", preview.toString()); preview.close()
        fails { s.restoreBackup(preview, true) }; assertTrue(root.listFiles()!!.isEmpty())
    }
}
