package org.arcanum.nativehost.hope

import org.junit.Assert.*
import org.junit.Test

class HopeBackupReadFailureTest {
    @Test fun readFailuresHaveBoundedDiagnosticsWithoutRecoveryInstructions() {
        val privateDetail = "private URI and recovery material"
        for ((error, code) in listOf(
            SecurityException(privateDetail) to "PERMISSION",
            java.io.FileNotFoundException(privateDetail) to "NOT_FOUND",
            java.io.IOException(privateDetail) to "IO",
            HopeBackupFormatException() to "FORMAT",
            IllegalStateException(privateDetail) to "UNEXPECTED",
        )) {
            val message = HopeBackupReadFailure.message(error)
            assertTrue(message.contains("[BACKUP_READ_$code]"))
            assertTrue(message.contains("Vault unchanged"))
            assertFalse(message.contains(privateDetail))
            assertFalse(message.contains("Finish interrupted restore"))
            assertFalse(message.contains("partial export"))
        }
    }
}
