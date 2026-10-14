package org.arcanum.nativehost.hope

import androidx.test.platform.app.InstrumentationRegistry
import java.io.File
import java.security.KeyStore
import org.junit.Assert.*
import org.junit.Test
import org.json.JSONObject

/** Only explicitly selected phases run. Fixtures are synthetic and isolated from the app vault. */
class HopeCollectionAcceptanceTest {
    private val context = InstrumentationRegistry.getInstrumentation().targetContext
    private fun root(name: String = "continuity"): File {
        check(context.packageName == "org.arcanum.nativehost.a19qualification")
        return File(context.filesDir, "a19-synthetic/$name").also { it.mkdirs() }
    }
    private fun keys(name: String = "continuity") = AndroidHopeKeyManager("arcanum.a19.synthetic.$name")
    private fun store(name: String = "continuity", checkpoint: (String) -> Unit = {}) =
        HopeCollectionStore(root(name), keys(name), HopeRuntimeBridge.contract(), checkpoint = checkpoint)
    private fun fixture(id: String, day: Int): HopeLocalState {
        val text = HopeRuntimeBridge.buildReflection("synthetic-$id", "2026-10-${day}T12:00:00Z", null,
            "Synthetic test $id\nExact spacing retained.  ", null,
            HopeTempusProvenance("synthetic-clock-$id", "2026-10-${day}T12:00:00Z", "system-clock"))
        return HopeLocalState(text, HopeLocalStateCodec.createReceipt(text, "2026-10-${day}T12:01:00Z"))
    }
    private fun same(expected: HopeLocalState, actual: HopeLocalState) {
        assertTrue("Exact synthetic text preserved", expected.reflectionJson == actual.reflectionJson)
        assertTrue("Exact synthetic receipt preserved", expected.receipt == actual.receipt)
    }
    private inline fun <reified T: Throwable> fails(block: () -> Unit) {
        try { block(); fail("Expected bounded failure") } catch (error: Throwable) {
            assertTrue("Failure category", error is T)
        }
    }

    @Test fun seedLegacy() {
        val directory = root()
        check(directory.listFiles()?.isEmpty() == true)
        val old = fixture("legacy", 10)
        HopeProtectedStore(directory, keys(), HopeRuntimeBridge.contract()).persistExact(HopeLocalStateCodec.encode(old))
        same(old, HopeLocalStateCodec.decode(HopeProtectedStore(directory, keys(), HopeRuntimeBridge.contract()).recoverExact()))
    }

    @Test fun migrateAndSave() {
        val collection = store()
        same(fixture("legacy", 10), collection.browse().single())
        assertFalse(File(root(), "hope/reflections.v0.1.enc").exists())
        collection.save(fixture("second", 11)); collection.save(fixture("third", 12))
        collection.archive("synthetic-second")
        verifyRetained()
    }

    @Test fun verifyRetained() {
        val active = store().browse()
        assertEquals(2, active.size)
        val encrypted = File(root(), "hope/collection.v0.1.enc").readBytes().toString(Charsets.ISO_8859_1)
        assertFalse(encrypted.contains("synthetic-legacy"))
        assertFalse(encrypted.contains("Synthetic test"))
        assertFalse(encrypted.contains("2026-10-10"))
        same(fixture("legacy", 10), active[0]); same(fixture("third", 12), active[1])
        same(fixture("second", 11), store().browse(true).single())
    }

    @Test fun deleteAndRestore() {
        val collection = store()
        val stale = collection.prepareDelete("synthetic-second", true)
        collection.restore("synthetic-second")
        fails<IllegalArgumentException> { collection.delete(stale, true) }
        same(fixture("second", 11), collection.browse()[1])
        collection.delete(collection.prepareDelete("synthetic-legacy", false), false)
        assertEquals(3, collection.browse().size)
        collection.delete(collection.prepareDelete("synthetic-legacy", false), true)
        collection.archive("synthetic-third")
        collection.delete(collection.prepareDelete("synthetic-third", true), true)
        verifyDeleted()
    }

    @Test fun verifyDeleted() {
        val collection = store()
        same(fixture("second", 11), collection.browse().single())
        assertTrue(collection.browse(true).isEmpty())
        // An interrupted legacy cleanup cannot resurrect a deleted migrated reflection.
        HopeProtectedStore(root(), keys(), HopeRuntimeBridge.contract()).persistExact(HopeLocalStateCodec.encode(fixture("legacy", 10)))
        same(fixture("second", 11), store().browse().single())
        assertFalse(File(root(), "hope/reflections.v0.1.enc").exists())
        fails<IllegalArgumentException> { collection.save(fixture("legacy", 10)) }
    }

    @Test fun uiControlsAndPrivacy() {
        check(context.packageName == "org.arcanum.nativehost.a19qualification")
        check(!File(context.filesDir, "hope").exists())
        val instrumentation = InstrumentationRegistry.getInstrumentation()
        instrumentation.runOnMainSync {
            val panel = HopeReflectionPanel(context)
            fun views(view: android.view.View): List<android.view.View> = listOf(view) +
                if (view is android.view.ViewGroup) (0 until view.childCount).flatMap { views(view.getChildAt(it)) } else emptyList()
            fun click(label: String) { (views(panel).filterIsInstance<android.widget.Button>().single { it.text == label }).performClick() }
            val input = views(panel).filterIsInstance<android.widget.EditText>().single()
            click("Reflect")
            input.setText("  Synthetic UI reflection preserved exactly.  ")
            click("Hold locally")
            val collection = HopeCollectionStore(context.filesDir, AndroidHopeKeyManager(), HopeRuntimeBridge.contract())
            val saved = collection.browse().single()
            assertTrue(JSONObject(saved.reflectionJson).getString("userText") == "  Synthetic UI reflection preserved exactly.  ")
            click("Browse")
            val timestamp = JSONObject(saved.reflectionJson).getString("createdAt")
            val privateButton = views(panel).filterIsInstance<android.widget.Button>().single { it.text == timestamp }
            assertTrue(org.arcanum.nativehost.architect.ArchitectObservationPrivacy.isPrivateText(privateButton))
            assertFalse(org.arcanum.nativehost.architect.ArchitectObservationPrivacy.textForObservation(privateButton).contains(timestamp))
            click("Back to Hope")
            collection.archive(saved.receipt.reflectionId)
            click("Archive")
            assertEquals(1, views(panel).filterIsInstance<android.widget.Button>().count { it.text == timestamp })
            click("Back to Hope")
            click("Browse")
            assertEquals(0, views(panel).filterIsInstance<android.widget.Button>().count { it.text == timestamp })
            collection.restore(saved.receipt.reflectionId)
        }
    }

    @Test fun recoveryAndInterruption() {
        for (phase in listOf("legacy-validated", "marker-written", "before-write", "after-write", "collection-verified")) {
            val name = "interrupt-$phase"
            val dir = root(name)
            check(dir.listFiles()?.isEmpty() == true)
            val old = fixture("interruption", 10)
            val legacy = HopeProtectedStore(dir, keys(name), HopeRuntimeBridge.contract())
            legacy.persistExact(HopeLocalStateCodec.encode(old))
            fails<IllegalStateException> { store(name) { if (it == phase) error("Synthetic interruption") }.browse() }
            if (phase == "marker-written" || phase == "before-write") {
                fails<HopeStateMissingException> { store(name).browse() }
                same(old, HopeLocalStateCodec.decode(legacy.recoverExact()))
            } else {
                same(old, store(name).browse().single())
                same(old, store(name).browse().single())
                assertFalse(File(dir, "hope/reflections.v0.1.enc").exists())
            }
        }
        for (kind in listOf("corrupt", "missing-key", "unsupported", "missing-file", "write-failure")) {
            val name = "failure-$kind"
            val dir = root(name)
            check(dir.listFiles()?.isEmpty() == true)
            store(name).save(fixture("recovery", 10))
            val file = File(dir, "hope/collection.v0.1.enc")
            var before = file.readBytes()
            when (kind) {
                "corrupt" -> { before[before.lastIndex] = (before.last().toInt() xor 1).toByte(); file.writeBytes(before) }
                "unsupported" -> { before[8] = 99; file.writeBytes(before) }
                "missing-key" -> KeyStore.getInstance("AndroidKeyStore").apply { load(null) }.deleteEntry("arcanum.a19.synthetic.$name")
                "missing-file" -> check(file.renameTo(File(dir, "preserved-synthetic-envelope")))
                "write-failure" -> {
                    fails<IllegalStateException> { store(name) { if (it == "before-write") error("Synthetic failure") }.save(fixture("not-saved", 11)) }
                    assertTrue(before.contentEquals(file.readBytes()))
                    same(fixture("recovery", 10), store(name).browse().single())
                }
            }
            if (kind == "write-failure") continue
            repeat(2) {
                when (kind) {
                    "missing-key" -> fails<HopeKeyUnavailableException> { store(name).browse() }
                    "missing-file" -> fails<HopeStateMissingException> { store(name).browse() }
                    "unsupported" -> fails<HopeUnsupportedVersionException> { store(name).browse() }
                    else -> fails<HopeStateCorruptException> { store(name).browse() }
                }
            }
            if (kind != "missing-file") assertTrue("Failed recovery preserves ciphertext", before.contentEquals(file.readBytes()))
            if (kind == "missing-key") assertNull(keys(name).getExisting())
        }
    }
}
