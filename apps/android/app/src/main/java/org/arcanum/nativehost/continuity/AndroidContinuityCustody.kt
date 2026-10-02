package org.arcanum.nativehost.continuity

import android.content.Context
import android.os.Build
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyInfo
import android.security.keystore.KeyPermanentlyInvalidatedException
import android.security.keystore.KeyProperties
import android.system.Os
import android.system.OsConstants
import java.io.File
import java.io.FileOutputStream
import java.io.RandomAccessFile
import java.security.KeyFactory
import java.security.KeyPairGenerator
import java.security.KeyStore
import java.security.Signature
import java.security.interfaces.ECPublicKey
import java.security.spec.ECGenParameterSpec

/** Separate signing purpose/alias. Never reuses publisher, encryption, or broker keys. */
class AndroidContinuityKeyProvider : ContinuityKeyProvider {
    private fun store(): KeyStore = KeyStore.getInstance("AndroidKeyStore").also { it.load(null) }
    override fun namespaceState(): ContinuityNamespaceState = try {
        val aliases = store().aliases()
        var present = false
        while (aliases.hasMoreElements()) {
            if (aliases.nextElement().startsWith("org.arcanum.nativehost.continuity.signing.v1.")) present = true
        }
        if (present) ContinuityNamespaceState.PRESENT else ContinuityNamespaceState.EMPTY
    } catch (_: Exception) { ContinuityNamespaceState.UNAVAILABLE }
    override fun observe(alias: String): KeyObservation = try {
        requireContinuityAlias(alias)
        val store = store()
        if (!store.containsAlias(alias)) KeyObservation.Missing
        else {
            val privateKey = store.getKey(alias, null) as? java.security.PrivateKey
                ?: return KeyObservation.Unavailable
            val publicKey = store.getCertificate(alias)?.publicKey as? ECPublicKey
                ?: return KeyObservation.Unavailable
            val curve = continuityCurve()
            val params = publicKey.params
            require(params.curve == curve.curve && params.generator == curve.generator && params.order == curve.order && params.cofactor == curve.cofactor)
            val info = KeyFactory.getInstance("EC", "AndroidKeyStore").getKeySpec(privateKey, KeyInfo::class.java)
            require(info.purposes == KeyProperties.PURPOSE_SIGN && info.digests.contentEquals(arrayOf(KeyProperties.DIGEST_SHA256)))
            val level = if (Build.VERSION.SDK_INT >= 31) when (info.securityLevel) {
                KeyProperties.SECURITY_LEVEL_SOFTWARE -> ContinuitySecurityLevel.SOFTWARE
                KeyProperties.SECURITY_LEVEL_TRUSTED_ENVIRONMENT -> ContinuitySecurityLevel.TRUSTED_ENVIRONMENT
                KeyProperties.SECURITY_LEVEL_STRONGBOX -> ContinuitySecurityLevel.STRONGBOX
                else -> ContinuitySecurityLevel.UNKNOWN
            } else {
                @Suppress("DEPRECATION")
                if (info.isInsideSecureHardware) ContinuitySecurityLevel.HARDWARE_UNSPECIFIED else ContinuitySecurityLevel.SOFTWARE
            }
            val bytes = byteArrayOf(4) + coordinate(publicKey.w.affineX) + coordinate(publicKey.w.affineY)
            continuityPublicKey(bytes)
            KeyObservation.Available(bytes, level, privateKey.format == null && privateKey.encoded == null)
        }
    } catch (_: KeyPermanentlyInvalidatedException) { KeyObservation.Invalidated }
      catch (_: Exception) { KeyObservation.Unavailable }

    override fun create(alias: String) {
        requireContinuityAlias(alias)
        if (observe(alias) !== KeyObservation.Missing) throw ContinuityCustodyException("Key creation requires observed absence")
        val spec = KeyGenParameterSpec.Builder(alias, KeyProperties.PURPOSE_SIGN)
            .setAlgorithmParameterSpec(ECGenParameterSpec("secp256r1"))
            .setDigests(KeyProperties.DIGEST_SHA256)
            .setUserAuthenticationRequired(false)
            .build()
        KeyPairGenerator.getInstance(KeyProperties.KEY_ALGORITHM_EC, "AndroidKeyStore").also { it.initialize(spec) }.generateKeyPair()
    }
    override fun sign(alias: String, message: ByteArray): ByteArray {
        requireContinuityAlias(alias)
        val request = ContinuitySigningRequest.parse(message)
        val observed = observe(alias) as? KeyObservation.Available
            ?: throw ContinuityCustodyException("Signing key unavailable")
        require(request.fingerprint.contentEquals(continuityFingerprint(observed.publicKey)))
        val key = store().getKey(alias, null) as? java.security.PrivateKey
            ?: throw ContinuityCustodyException("Signing key unavailable")
        return Signature.getInstance("SHA256withECDSA").also { it.initSign(key); it.update(message) }.sign()
    }
    private fun coordinate(value: java.math.BigInteger): ByteArray {
        val bytes = value.toByteArray()
        val unsigned = if (bytes.size == 33 && bytes[0] == 0.toByte()) bytes.copyOfRange(1, 33) else bytes
        require(unsigned.size <= 32 && value.signum() >= 0)
        return ByteArray(32 - unsigned.size) + unsigned
    }
    private fun requireContinuityAlias(alias: String) {
        require(alias == ContinuityCredentialManager.INITIAL_ALIAS || alias.matches(Regex("org\\.arcanum\\.nativehost\\.continuity\\.signing\\.v1\\.generation\\.[0-9a-f]{32}")))
    }
}

/** One bounded app-private registry slot; partial writes stay blocked and preserved. No backup import. */
enum class ContinuityStorageSlot(val directory: String) { CREDENTIALS("identity/continuity.v1"), OPERATIONS("continuity-ui.v1") }
class AndroidContinuityCredentialStorage(context: Context, slot: ContinuityStorageSlot = ContinuityStorageSlot.CREDENTIALS) : ContinuityCredentialStorage {
    // Resolve the platform-owned root once; reject aliases below that trusted root.
    private val privateRoot = context.noBackupFilesDir.canonicalFile
    private val root = File(privateRoot, slot.directory)
    private val registry get() = File(root, "registry.bin")
    private val partial get() = File(root, "registry.bin.partial")
    init {
        check(root.canonicalFile == root.absoluteFile) { "Credential namespace must not be a symlink" }
        check(root.mkdirs() || root.isDirectory)
        syncDirectory(root)
        syncDirectory(root.parentFile!!)
        syncDirectory(privateRoot)
    }
    override fun <T> locked(action: () -> T): T {
        check(root.canonicalFile == root.absoluteFile)
        val lock = File(root, "writer.lock")
        check(lock.canonicalFile == lock.absoluteFile)
        RandomAccessFile(lock, "rw").use { file ->
            val held = file.channel.tryLock() ?: throw ContinuityCustodyException("Credential writer busy")
            held.use { return action() }
        }
    }
    override fun read(): ByteArray? {
        check(!partial.exists()) { "Interrupted registry write; preserve and reconcile" }
        if (!registry.exists()) return null
        check(registry.canonicalFile == registry.absoluteFile && registry.isFile)
        check(registry.length() <= 64 * 1024)
        return registry.inputStream().use { input ->
            val bytes = input.readBytesBounded(64 * 1024)
            bytes
        }
    }
    override fun writeAtomically(bytes: ByteArray) {
        require(bytes.size <= 64 * 1024)
        check(registry.canonicalFile == registry.absoluteFile && partial.canonicalFile == partial.absoluteFile)
        check(partial.createNewFile()) { "Interrupted registry write; preserve and reconcile" }
        FileOutputStream(partial).use { file -> file.write(bytes); file.fd.sync() }
        Os.rename(partial.absolutePath, registry.absolutePath)
        syncDirectory(root)
        check(read()?.contentEquals(bytes) == true) { "Credential metadata acknowledgment unavailable" }
    }
    private fun java.io.InputStream.readBytesBounded(limit: Int): ByteArray {
        val output = java.io.ByteArrayOutputStream()
        val buffer = ByteArray(4096)
        while (true) {
            val count = read(buffer)
            if (count < 0) break
            check(output.size() + count <= limit)
            output.write(buffer, 0, count)
        }
        return output.toByteArray()
    }
    private fun syncDirectory(dir: File) {
        check(dir.isDirectory && dir.canonicalFile == dir.absoluteFile)
        val fd = Os.open(dir.absolutePath, OsConstants.O_RDONLY, 0)
        try { Os.fsync(fd) } finally { Os.close(fd) }
    }
}
