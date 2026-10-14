package org.arcanum.nativehost.hope

/** Fixed, non-sensitive operation diagnostics. Never include provider exception text or URIs. */
object HopeBackupReadFailure {
    fun message(error: Throwable): String = when (error) {
        is SecurityException -> "Android denied access to the selected file. Select the local backup again. Vault unchanged. [BACKUP_READ_PERMISSION]"
        is java.io.FileNotFoundException -> "The selected backup could not be opened. Check that it is saved locally, then select it again. Vault unchanged. [BACKUP_READ_NOT_FOUND]"
        is java.io.IOException -> "The selected backup could not be read. Select the local file again. Vault unchanged. [BACKUP_READ_IO]"
        is HopeBackupFormatException -> "The selected file could not be read within backup limits. Choose a complete backup file. Vault unchanged. [BACKUP_READ_FORMAT]"
        else -> "The selected backup could not be read. Vault unchanged. [BACKUP_READ_UNEXPECTED]"
    }
}
