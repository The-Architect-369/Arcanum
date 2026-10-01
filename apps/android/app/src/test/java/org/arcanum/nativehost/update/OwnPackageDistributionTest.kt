package org.arcanum.nativehost.update

import org.junit.Assert.assertEquals
import org.junit.Assert.assertThrows
import org.junit.Test

class OwnPackageDistributionTest {
    @Test fun controlledDirectUrlIsAccepted() {
        assertEquals("updates.the-arcanum.net", OwnPackageDistribution.checkedUrl("https://updates.the-arcanum.net/updates/a15/manifest.json").host)
    }

    @Test fun alternateOriginsAndAmbiguousCoordinatesReject() {
        listOf(
            "http://updates.the-arcanum.net/updates/x",
            "https://other.example/updates/x",
            "https://user@updates.the-arcanum.net/updates/x",
            "https://updates.the-arcanum.net:443/updates/x",
            "https://updates.the-arcanum.net/updates/x?token=1",
            "https://updates.the-arcanum.net/updates/x#fragment",
            "https://updates.the-arcanum.net/manifest.json",
            "https://updates.the-arcanum.net/updates/../manifest.json",
            "https://updates.the-arcanum.net/updates/%2e%2e/x",
        ).forEach { value -> assertThrows(IllegalArgumentException::class.java) { OwnPackageDistribution.checkedUrl(value) } }
    }

    @Test fun canonicalManifestBytesAreRequired() {
        assertEquals(1, OwnPackageDistribution.manifestFromBytes("{\"a\":1}".toByteArray()).getInt("a"))
        listOf("{\"a\":1}\n", "{\"a\":1,\"a\":2}", "{\"b\":2,\"a\":1}", "{\"a\":1.0}").forEach {
            assertThrows(Exception::class.java) { OwnPackageDistribution.manifestFromBytes(it.toByteArray()) }
        }
        assertThrows(IllegalArgumentException::class.java) { OwnPackageDistribution.manifestFromBytes(ByteArray(16 * 1024 + 1)) }
        assertThrows(Exception::class.java) { OwnPackageDistribution.manifestFromBytes(byteArrayOf(0xff.toByte())) }
    }
}
