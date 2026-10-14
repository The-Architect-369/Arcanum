package org.arcanum.nativehost.hope

import androidx.test.platform.app.InstrumentationRegistry
import java.io.File
import org.junit.Assert.*
import org.junit.Test

/** Explicit phases for a separate synthetic installation on two physical phones.
 * Never run a whole class: source seeding and destination verification have different gates.
 * Actual export, document-provider selection and restore are participant operations.
 */
class HopeBackupPhysicalAcceptanceTest {
    private val context = InstrumentationRegistry.getInstrumentation().targetContext
    private fun bound() {
        check(context.packageName == "org.arcanum.nativehost.a19backupqualification")
    }
    private fun store(): HopeCollectionStore {
        bound()
        return HopeCollectionStore(context.filesDir, AndroidHopeKeyManager(), HopeRuntimeBridge.contract())
    }
    private fun fixture(id: String): HopeLocalState {
        val reflection = HopeRuntimeBridge.buildReflection(id, "2026-10-14T12:00:00Z", null,
            "  Synthetic two-phone mémoire 🌿\nExact trailing spaces.  ", null,
            HopeTempusProvenance("synthetic-clock", "2026-10-14T12:00:00Z", "system-clock"))
        return HopeLocalState(reflection, HopeLocalStateCodec.createReceipt(reflection, "2026-10-14T12:01:00Z"))
    }
    private fun fresh() {
        bound()
        assertNull("Destination has no prior Hope key", AndroidHopeKeyManager().getExisting())
        val dir = File(context.filesDir, "hope")
        assertTrue("No existing or ambiguous custody", !dir.exists() ||
            dir.listFiles()?.all { it.name == "collection.lock" && it.isFile } == true)
    }
    @Test fun assertFreshDestination() { fresh() }
    @Test fun seedSource() {
        fresh() // Never replace or reset an existing vault, even synthetic.
        val source = store()
        source.save(fixture("physical-active"))
        source.save(fixture("physical-archived")); source.archive("physical-archived")
        source.save(fixture("physical-deleted"))
        source.delete(source.prepareDelete("physical-deleted", false), true)
        verifyCollection()
    }
    @Test fun verifyRestored() { verifyCollection() }
    private fun verifyCollection() {
        val restored = store()
        val active = restored.browse().single()
        val archived = restored.browse(true).single()
        val expectedActive = fixture("physical-active")
        val expectedArchived = fixture("physical-archived")
        assertTrue("Active synthetic bytes and receipt preserved", active == expectedActive)
        assertTrue("Archived synthetic bytes and receipt preserved", archived == expectedArchived)
        assertNull("Device key remains non-exportable", AndroidHopeKeyManager().getExisting()!!.encoded)
        var refused = false
        try { restored.save(fixture("physical-deleted")) } catch (_: IllegalArgumentException) { refused = true }
        assertTrue("Deleted ID remains retired", refused)
        assertEquals(1, restored.browse().size)
        assertEquals(1, restored.browse(true).size)
    }
}
