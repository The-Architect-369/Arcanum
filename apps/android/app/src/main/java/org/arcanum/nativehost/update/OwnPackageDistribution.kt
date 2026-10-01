package org.arcanum.nativehost.update

import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import com.android.apksig.ApkVerifier
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.net.URI
import java.security.MessageDigest
import java.util.zip.ZipFile
import javax.net.ssl.HttpsURLConnection
import org.arcanum.nativehost.update.OwnPackageUpdatePolicy.Identity
import org.arcanum.nativehost.update.OwnPackageUpdatePolicy.Inspection

/** Fixed origin and signer; downloaded documents never establish trust roots. */
class OwnPackageDistribution(private val context: Context) {
    data class Staged(val file: File, val inspection: Inspection, val manifestSha256: String)

    fun inspectAndStage(manifestUrl: String, apkUrl: String): Staged {
        val manifestUri = checkedUrl(manifestUrl)
        val apkUri = checkedUrl(apkUrl)
        require(manifestUri != apkUri) { "Manifest and APK URLs must differ" }
        val directory = File(context.filesDir, "own-package-update").apply { mkdirs() }
        val manifestFile = File(directory, "manifest.partial")
        val stagedFile = File(directory, "candidate.partial")
        try {
            retrieve(manifestUri, manifestFile, 16 * 1024L)
            val raw = manifestFile.readBytes()
            val json = manifestFromBytes(raw)
            closed(json, "schemaVersion", "manifestType", "package", "artifact", "build", "compatibility")
            require(json.getString("schemaVersion") == "1.0" && json.getString("manifestType") == "arcanum-own-package-update")
            val pkg = json.getJSONObject("package")
            closed(pkg, "applicationId", "versionCode", "versionName")
            val artifact = json.getJSONObject("artifact")
            closed(artifact, "sha256", "sizeBytes", "publisherSignerSha256")
            val build = json.getJSONObject("build")
            closed(build, "repository", "sourceCommit", "promotionBranch", "promotionCommit", "channel")
            require(build.getString("repository") == "The-Architect-369/Arcanum" && build.getString("promotionBranch") == "main" && build.getString("channel") == "pre-genesis")
            require(Regex("[0-9a-f]{40}").matches(build.getString("sourceCommit")) && Regex("[0-9a-f]{40}").matches(build.getString("promotionCommit")))
            val expected = Identity(pkg.getString("applicationId"), positiveLong(pkg, "versionCode"), artifact.getString("sha256"), artifact.getString("publisherSignerSha256"))
            require(expected.applicationId == OwnPackageUpdatePolicy.APPLICATION_ID && expected.signerSha256 == TRUSTED_SIGNER)
            require(Regex("[0-9a-f]{64}").matches(expected.apkSha256))
            val size = positiveLong(artifact, "sizeBytes")
            require(size <= MAX_APK_BYTES)
            val compatibility = json.getJSONObject("compatibility")
            closed(compatibility, "abis", "companion", "dataContracts", "minSdk", "targetSdk")
            require(positiveLong(compatibility, "minSdk") <= Build.VERSION.SDK_INT)
            val abiList = strings(compatibility.getJSONArray("abis"))
            require(abiList == abiList.sorted() && abiList.any { it in Build.SUPPORTED_ABIS })
            require(strings(compatibility.getJSONArray("dataContracts")) == listOf("hope.reflection.v0.1", "tempus-anchor/0.1.0"))
            val companion = compatibility.getJSONObject("companion")
            closed(companion, "brokerContract", "operatorContract", "nativeOperations")
            require(companion.getString("brokerContract") == "arcanum-termux-broker/1.1" && companion.getString("operatorContract") == "ce-w04-a13.5/five-op-v1")
            require(strings(companion.getJSONArray("nativeOperations")) == listOf("probe_workspace", "pair_native_client", "start_broker", "stop_broker", "verify_workspace"))
            retrieve(apkUri, stagedFile, size)
            require(stagedFile.length() == size)
            val observed = inspectApk(stagedFile)
            require(observed == expected) { "Downloaded APK identity mismatch" }
            @Suppress("DEPRECATION")
            val info = context.packageManager.getPackageArchiveInfo(stagedFile.path, 0) ?: error("APK metadata unavailable")
            require(info.versionName == pkg.getString("versionName"))
            require(info.applicationInfo!!.minSdkVersion.toLong() == positiveLong(compatibility, "minSdk") && info.applicationInfo!!.targetSdkVersion.toLong() == positiveLong(compatibility, "targetSdk"))
            val actualAbis = ZipFile(stagedFile).use { zip ->
                zip.entries().asSequence().map { it.name }.filter { it.startsWith("lib/") && it.endsWith(".so") }.map { it.split('/')[1] }.distinct().sorted().toList()
            }
            require(actualAbis == abiList) { "APK ABI metadata mismatch" }
            val destination = File(directory, "candidate.apk")
            require(stagedFile.renameTo(destination)) { "Cannot finalize staged bytes" }
            return Staged(destination, Inspection(observed, System.currentTimeMillis(), true, true), sha256(raw))
        } catch (failure: Exception) {
            stagedFile.delete()
            throw failure
        } finally {
            manifestFile.delete()
        }
    }

    fun installedIdentity(): Identity {
        @Suppress("DEPRECATION")
        val info = context.packageManager.getPackageInfo(OwnPackageUpdatePolicy.APPLICATION_ID, 0)
        require(info.splitNames.isNullOrEmpty()) { "Split installation unsupported" }
        return inspectApk(File(info.applicationInfo!!.sourceDir))
    }

    fun inspectApk(file: File): Identity {
        val result = ApkVerifier.Builder(file).setMinCheckedPlatformVersion(Build.VERSION.SDK_INT).setMaxCheckedPlatformVersion(Build.VERSION.SDK_INT).build().verify()
        require(result.isVerified && result.signerCertificates.size == 1) { "APK signature verification failed" }
        val signer = sha256(result.signerCertificates.single().encoded)
        require(signer == TRUSTED_SIGNER) { "Untrusted APK signer" }
        @Suppress("DEPRECATION")
        val info = context.packageManager.getPackageArchiveInfo(file.path, 0) ?: error("APK metadata unavailable")
        require(info.packageName == OwnPackageUpdatePolicy.APPLICATION_ID && info.splitNames.isNullOrEmpty())
        val code = if (Build.VERSION.SDK_INT >= 28) info.longVersionCode else info.versionCode.toLong()
        return Identity(info.packageName, code, file.inputStream().use { input ->
            val digest = MessageDigest.getInstance("SHA-256")
            val buffer = ByteArray(64 * 1024)
            while (true) { val n = input.read(buffer); if (n < 0) break; digest.update(buffer, 0, n) }
            hex(digest.digest())
        }, signer)
    }

    private fun retrieve(uri: URI, destination: File, limit: Long) {
        val connection = uri.toURL().openConnection() as HttpsURLConnection
        connection.instanceFollowRedirects = false
        connection.connectTimeout = 15_000
        connection.readTimeout = 15_000
        connection.setRequestProperty("Accept-Encoding", "identity")
        try {
            require(connection.responseCode == 200) { "Direct HTTPS 200 required" }
            require(connection.getHeaderField("Content-Encoding").let { it == null || it == "identity" })
            val cache = connection.getHeaderField("Cache-Control").orEmpty().lowercase().split(',').map { it.trim() }
            require("no-store" in cache && "max-age=0" in cache) { "Zero-age cache policy required" }
            require(connection.contentLengthLong <= limit)
            var total = 0L
            connection.inputStream.use { input -> destination.outputStream().use { output ->
                val buffer = ByteArray(64 * 1024)
                while (true) {
                    if (Thread.currentThread().isInterrupted) error("Staging interrupted")
                    val count = input.read(buffer); if (count < 0) break
                    total += count; require(total <= limit) { "Response exceeds bounded size" }
                    output.write(buffer, 0, count)
                }
            } }
        } finally { connection.disconnect() }
    }

    companion object {
        const val TRUSTED_SIGNER = "9841fbeda4d7d0c63b1663360fb0415218a08f063b5629317274076dfbb6b844"
        const val MAX_APK_BYTES = 256 * 1024 * 1024L
        fun checkedUrl(value: String): URI = URI(value).also {
            require(it.scheme == "https" && it.host == "updates.the-arcanum.net" && it.port == -1 && it.rawUserInfo == null && it.rawQuery == null && it.rawFragment == null && it.rawPath.matches(Regex("/updates/[A-Za-z0-9._/-]+")) && it.rawPath.split('/').none { segment -> segment == "." || segment == ".." }) { "Controlled update origin required" }
        }
        internal fun manifestFromBytes(raw: ByteArray): JSONObject {
            require(raw.size <= 16 * 1024) { "Manifest exceeds bounded size" }
            val json = JSONObject(raw.toString(Charsets.UTF_8))
            require(canonical(json).toByteArray(Charsets.UTF_8).contentEquals(raw)) { "Manifest is not canonical JSON" }
            return json
        }
        private fun closed(value: JSONObject, vararg keys: String) { require(value.keys().asSequence().toSet() == keys.toSet()) }
        private fun positiveLong(value: JSONObject, key: String): Long {
            val raw = value.get(key)
            require(raw is Int || raw is Long) { "Integer required" }
            return (raw as Number).toLong().also { require(it > 0) }
        }
        private fun strings(value: JSONArray): List<String> = (0 until value.length()).map { value.get(it).also { item -> require(item is String) } as String }.also { require(it == it.distinct()) }
        private fun canonical(value: Any?): String = when (value) {
            is JSONObject -> value.keys().asSequence().toList().sorted().joinToString(",", "{", "}") { JSONObject.quote(it) + ":" + canonical(value.get(it)) }
            is JSONArray -> (0 until value.length()).joinToString(",", "[", "]") { canonical(value.get(it)) }
            is String -> JSONObject.quote(value).replace("\\/", "/")
            is Int, is Long, is Boolean -> value.toString()
            else -> error("Unsupported manifest value")
        }
        private fun sha256(bytes: ByteArray) = hex(MessageDigest.getInstance("SHA-256").digest(bytes))
        private fun hex(bytes: ByteArray) = bytes.joinToString("") { "%02x".format(it) }
    }
}
