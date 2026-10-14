package org.arcanum.nativehost.hope

import androidx.test.platform.app.InstrumentationRegistry
import java.util.Base64
import org.junit.Assert.*
import org.junit.Test

/** Memory-only synthetic format tests; never open a participant vault or key alias. */
class HopeBackupFormatAcceptanceTest {
    @Test fun formatCompatibilityAndFailureIsolation() {
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        check(context.packageName == "org.arcanum.nativehost.a19qualification")
        val expected = Base64.getDecoder().decode("ICBQdWJsaWMgc3ludGhldGljIGludGVyb3BlcmFiaWxpdHkgdmVjdG9yIPCfjL8KRXhhY3QgYnl0ZXMuCQ==")
        val vector = Base64.getDecoder().decode("SE9QRUJLUCEBAAECAwQFBgcICQoLAAAAPWcihm6niat4rTLu5cWBHRnqtaddng86DlcXgPd8C2neaGTX3Nmkcewb1l8dFwuXMqshAe4u9sGjS/JZNxGTRJD+X7nSsMV6y6arHMZK")
        val publicTestCode = "HBP1:AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8"
        assertArrayEquals(expected, HopeBackupFormat.open(vector, publicTestCode))
        val sealed = HopeBackupFormat.seal(expected)
        assertArrayEquals(expected, HopeBackupFormat.open(sealed.encryptedBytes, sealed.recoveryCode))
        val altered = sealed.encryptedBytes.clone()
        altered[altered.lastIndex] = (altered.last().toInt() xor 1).toByte()
        for ((bytes, code) in listOf(altered to sealed.recoveryCode, sealed.encryptedBytes to publicTestCode, vector.copyOf(vector.size - 1) to publicTestCode)) {
            try { HopeBackupFormat.open(bytes, code); fail("Invalid synthetic backup accepted") }
            catch (error: HopeBackupFormatException) { assertNull(error.cause) }
        }
    }
}
