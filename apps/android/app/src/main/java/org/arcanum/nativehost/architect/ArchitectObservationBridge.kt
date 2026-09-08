package org.arcanum.nativehost.architect

import android.app.Activity
import android.content.ClipData
import android.content.Intent
import android.net.Uri
import android.os.Handler
import android.os.Looper
import java.io.File
import java.io.FileOutputStream
import java.security.MessageDigest
import java.util.zip.ZipEntry
import java.util.zip.ZipOutputStream

data class ArchitectFrozenObservationExport(
    val captureId: String,
    val imageFile: File,
    val manifestFile: File,
    val bundleFile: File,
)

class ArchitectObservationBridge(
    private val activity: Activity,
) {
    fun share(observation: ArchitectObservationResult) {
        val frozen = freeze(observation)
        val uris =
            arrayListOf(
                ArchitectObservationProvider.uriFor(activity, frozen.imageFile),
                ArchitectObservationProvider.uriFor(activity, frozen.manifestFile),
                ArchitectObservationProvider.uriFor(activity, frozen.bundleFile),
            )

        val clipData =
            ClipData.newUri(
                activity.contentResolver,
                "Seed Node Alpha Architect pulse",
                uris.first(),
            )
        uris.drop(1).forEach { uri ->
            clipData.addItem(ClipData.Item(uri))
        }

        val shareIntent =
            Intent(Intent.ACTION_SEND_MULTIPLE).apply {
                type = "*/*"
                putParcelableArrayListExtra(Intent.EXTRA_STREAM, uris)
                putExtra(Intent.EXTRA_SUBJECT, "Seed Node Alpha · Architect Pulse")
                putExtra(
                    Intent.EXTRA_TEXT,
                    "Privacy-redacted local Architect observation · " +
                        "scope=local · authorityEffect=none · " +
                        "captureId=${observation.captureId} · " +
                        "imageSha256=${observation.imageSha256} · frozenExport=true",
                )
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                this.clipData = clipData
            }

        activity.startActivity(
            Intent.createChooser(
                shareIntent,
                "Share Architect pulse",
            ),
        )
        scheduleGrantRevocation(uris)
    }

    private fun freeze(observation: ArchitectObservationResult): ArchitectFrozenObservationExport {
        val observationRoot =
            observation.imageFile.parentFile?.canonicalFile
                ?: error("Architect observation root unavailable")
        check(observation.manifestFile.parentFile?.canonicalFile == observationRoot) {
            "Architect observation pair must share one bounded root"
        }

        val exportRoot =
            File(observationRoot, EXPORT_DIRECTORY).apply {
                check(exists() || mkdirs()) {
                    "Unable to create frozen Architect export root"
                }
            }.canonicalFile
        pruneExpiredExports(exportRoot)

        val captureDirectory = File(exportRoot, observation.captureId).canonicalFile
        check(captureDirectory.parentFile == exportRoot) {
            "Architect capture identifier escaped the bounded export root"
        }
        check(!captureDirectory.exists() && captureDirectory.mkdirs()) {
            "Unable to create frozen Architect export directory"
        }

        val frozenImage = File(captureDirectory, IMAGE_FILE_NAME)
        val frozenManifest = File(captureDirectory, MANIFEST_FILE_NAME)
        val frozenBundle = File(captureDirectory, ArchitectObservationContract.EXPORT_BUNDLE_FILE)
        copyExact(observation.imageFile, frozenImage)
        copyExact(observation.manifestFile, frozenManifest)
        check(sha256(frozenImage) == observation.imageSha256) {
            "Frozen Architect image does not match captured image digest"
        }
        createIntegrityBundle(frozenBundle, frozenImage, frozenManifest)
        captureDirectory.setLastModified(System.currentTimeMillis())
        pruneOverflowExports(exportRoot, observation.captureId)

        return ArchitectFrozenObservationExport(
            captureId = observation.captureId,
            imageFile = frozenImage,
            manifestFile = frozenManifest,
            bundleFile = frozenBundle,
        )
    }

    private fun copyExact(
        source: File,
        target: File,
    ) {
        source.inputStream().buffered().use { input ->
            FileOutputStream(target).use { output ->
                input.copyTo(output)
                output.fd.sync()
            }
        }
    }

    private fun createIntegrityBundle(
        target: File,
        image: File,
        manifest: File,
    ) {
        FileOutputStream(target).use { output ->
            ZipOutputStream(output).use { zip ->
                listOf(image, manifest).forEach { file ->
                    val entry = ZipEntry(file.name).apply { time = 0L }
                    zip.putNextEntry(entry)
                    file.inputStream().buffered().use { input -> input.copyTo(zip) }
                    zip.closeEntry()
                }
            }
        }
    }

    private fun pruneExpiredExports(exportRoot: File) {
        val cutoff = System.currentTimeMillis() - EXPORT_RETENTION_MS
        exportRoot.listFiles()
            .orEmpty()
            .filter { it.isDirectory && it.lastModified() < cutoff }
            .forEach { stale -> stale.deleteRecursively() }
    }

    private fun pruneOverflowExports(
        exportRoot: File,
        keepCaptureId: String,
    ) {
        val directories =
            exportRoot.listFiles()
                .orEmpty()
                .filter(File::isDirectory)
                .sortedByDescending(File::lastModified)
        if (directories.size <= ArchitectObservationContract.MAX_FROZEN_EXPORTS) {
            return
        }
        directories
            .drop(ArchitectObservationContract.MAX_FROZEN_EXPORTS)
            .filter { it.name != keepCaptureId }
            .forEach { stale -> stale.deleteRecursively() }
    }

    private fun scheduleGrantRevocation(uris: List<Uri>) {
        Handler(Looper.getMainLooper()).postDelayed(
            {
                uris.forEach { uri ->
                    runCatching {
                        activity.revokeUriPermission(
                            uri,
                            Intent.FLAG_GRANT_READ_URI_PERMISSION,
                        )
                    }
                }
            },
            ArchitectObservationContract.EXPORT_GRANT_TTL_SECONDS * 1_000L,
        )
    }

    private fun sha256(file: File): String {
        val digest = MessageDigest.getInstance("SHA-256")
        file.inputStream().buffered().use { input ->
            val buffer = ByteArray(DEFAULT_BUFFER_SIZE)
            while (true) {
                val count = input.read(buffer)
                if (count < 0) {
                    break
                }
                digest.update(buffer, 0, count)
            }
        }
        return digest.digest().joinToString(separator = "") { byte -> "%02x".format(byte) }
    }

    private companion object {
        const val EXPORT_DIRECTORY = "export"
        const val IMAGE_FILE_NAME = "latest.png"
        const val MANIFEST_FILE_NAME = "latest.json"
        const val EXPORT_RETENTION_MS = 24L * 60L * 60L * 1_000L
    }
}
