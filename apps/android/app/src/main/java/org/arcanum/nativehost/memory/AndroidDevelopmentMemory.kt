package org.arcanum.nativehost.memory

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.system.Os
import android.system.OsConstants
import java.io.File
import java.security.KeyStore
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey

/** A separate AES key; never reuse Hope's key or A16's signing credential. */
class AndroidMemoryKeyProvider(private val alias: String = ALIAS) : MemoryKeyProvider {
    override fun existing(): SecretKey? {
        val store = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
        if (!store.containsAlias(alias)) return null
        return store.getKey(alias, null) as? SecretKey ?: throw MemoryFailure("Memory key is inaccessible")
    }
    override fun create(): SecretKey {
        memoryRequire(existing() == null)
        return KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore").run {
            init(KeyGenParameterSpec.Builder(alias, KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT)
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM).setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .setKeySize(256).setRandomizedEncryptionRequired(true).build())
            generateKey()
        }
    }
    companion object { const val ALIAS = "org.arcanum.architect.development-memory.v1" }
}
fun androidDevelopmentMemory(context: Context): DevelopmentMemoryStore = DevelopmentMemoryStore(
    File(context.noBackupFilesDir, "architect-development.v1"), AndroidMemoryKeyProvider(), ::syncMemoryDirectory,
)
fun syncMemoryDirectory(dir: File) {
    val fd = Os.open(dir.absolutePath, OsConstants.O_RDONLY, 0)
    try { Os.fsync(fd) } finally { Os.close(fd) }
}
