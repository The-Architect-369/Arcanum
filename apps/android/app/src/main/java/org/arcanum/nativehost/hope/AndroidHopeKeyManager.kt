package org.arcanum.nativehost.hope

import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import java.security.KeyStore
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey

class AndroidHopeKeyManager(
    private val alias: String = DEFAULT_ALIAS,
) : HopeSecretKeyProvider {
    override fun getOrCreate(): SecretKey {
        val keyStore =
            KeyStore.getInstance(KEYSTORE_PROVIDER).apply {
                load(null)
            }
        val existing = keyStore.getKey(alias, null)
        if (existing is SecretKey) {
            return existing
        }

        val generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, KEYSTORE_PROVIDER)
        val specification =
            KeyGenParameterSpec.Builder(
                alias,
                KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT,
            )
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .setKeySize(256)
                .setRandomizedEncryptionRequired(true)
                .build()
        generator.init(specification)
        return generator.generateKey()
    }

    companion object {
        private const val KEYSTORE_PROVIDER = "AndroidKeyStore"
        private const val DEFAULT_ALIAS = "org.arcanum.nativehost.hope.reflections.v0.1"
    }
}
