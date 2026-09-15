package org.arcanum.nativehost.architect

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

/**
 * App-private CE-W04-A11 pairing-secret storage.
 *
 * The Human Architect transfers the broker's one-time 64-hex-character pairing
 * code into the native app. The decoded 32-byte secret is encrypted at rest with
 * an AndroidKeyStore AES-GCM key and never written back to external storage.
 */
class ArchitectPairingStore(
    context: Context,
) {
    private val preferences =
        context.applicationContext.getSharedPreferences(
            PREFERENCES_NAME,
            Context.MODE_PRIVATE,
        )

    fun hasPairing(): Boolean =
        preferences.contains(PREF_IV) &&
            preferences.contains(PREF_CIPHERTEXT) &&
            keyStore().containsAlias(KEY_ALIAS)

    fun savePairingCode(pairingCode: String) {
        val normalized = pairingCode.trim().lowercase()
        require(PAIRING_CODE_PATTERN.matches(normalized)) {
            "Pairing code must be exactly 64 hexadecimal characters"
        }

        val secret = normalized.chunked(2).map { it.toInt(16).toByte() }.toByteArray()
        try {
            val cipher = Cipher.getInstance(CIPHER_TRANSFORMATION)
            cipher.init(Cipher.ENCRYPT_MODE, getOrCreateKey())
            val ciphertext = cipher.doFinal(secret)

            preferences
                .edit()
                .putInt(PREF_VERSION, STORAGE_VERSION)
                .putString(PREF_IV, Base64.encodeToString(cipher.iv, Base64.NO_WRAP))
                .putString(PREF_CIPHERTEXT, Base64.encodeToString(ciphertext, Base64.NO_WRAP))
                .apply()
        } finally {
            secret.fill(0)
        }
    }

    fun loadSecret(): ByteArray? {
        if (!hasPairing()) {
            return null
        }

        return runCatching {
            require(preferences.getInt(PREF_VERSION, -1) == STORAGE_VERSION) {
                "Unsupported Architect pairing storage version"
            }

            val iv =
                Base64.decode(
                    requireNotNull(preferences.getString(PREF_IV, null)),
                    Base64.NO_WRAP,
                )
            val ciphertext =
                Base64.decode(
                    requireNotNull(preferences.getString(PREF_CIPHERTEXT, null)),
                    Base64.NO_WRAP,
                )

            val key = keyStore().getKey(KEY_ALIAS, null) as? SecretKey
                ?: error("Architect pairing key is unavailable")

            val cipher = Cipher.getInstance(CIPHER_TRANSFORMATION)
            cipher.init(
                Cipher.DECRYPT_MODE,
                key,
                GCMParameterSpec(GCM_TAG_BITS, iv),
            )
            cipher.doFinal(ciphertext).also { secret ->
                require(secret.size == SECRET_BYTES) {
                    "Architect pairing secret has an invalid length"
                }
            }
        }.getOrNull()
    }

    fun clear() {
        preferences.edit().clear().apply()
        runCatching {
            keyStore().apply {
                if (containsAlias(KEY_ALIAS)) {
                    deleteEntry(KEY_ALIAS)
                }
            }
        }
    }

    private fun getOrCreateKey(): SecretKey {
        val store = keyStore()
        val existing = store.getKey(KEY_ALIAS, null)
        if (existing is SecretKey) {
            return existing
        }

        val generator =
            KeyGenerator.getInstance(
                KeyProperties.KEY_ALGORITHM_AES,
                KEYSTORE_PROVIDER,
            )
        val specification =
            KeyGenParameterSpec.Builder(
                KEY_ALIAS,
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

    private fun keyStore(): KeyStore =
        KeyStore.getInstance(KEYSTORE_PROVIDER).apply {
            load(null)
        }

    companion object {
        private const val STORAGE_VERSION = 1
        private const val SECRET_BYTES = 32
        private const val GCM_TAG_BITS = 128
        private const val KEYSTORE_PROVIDER = "AndroidKeyStore"
        private const val CIPHER_TRANSFORMATION = "AES/GCM/NoPadding"
        private const val KEY_ALIAS =
            "org.arcanum.nativehost.architect.broker.pairing.v1"
        private const val PREFERENCES_NAME =
            "org.arcanum.nativehost.architect.broker.pairing"
        private const val PREF_VERSION = "version"
        private const val PREF_IV = "iv"
        private const val PREF_CIPHERTEXT = "ciphertext"

        private val PAIRING_CODE_PATTERN = Regex("^[0-9a-f]{64}$")
    }
}
