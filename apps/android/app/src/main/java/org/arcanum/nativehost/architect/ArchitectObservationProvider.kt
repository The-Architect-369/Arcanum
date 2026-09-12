package org.arcanum.nativehost.architect

import android.content.ContentProvider
import android.content.ContentValues
import android.content.Context
import android.database.Cursor
import android.database.MatrixCursor
import android.net.Uri
import android.os.ParcelFileDescriptor
import android.provider.OpenableColumns
import java.io.File
import java.io.FileNotFoundException

class ArchitectObservationProvider : ContentProvider() {
    override fun onCreate(): Boolean = true

    override fun getType(uri: Uri): String =
        when (resolveName(uri)) {
            IMAGE_FILE_NAME -> "image/png"
            MANIFEST_FILE_NAME -> "application/json"
            ArchitectObservationContract.EXPORT_BUNDLE_FILE -> "application/zip"
            else -> throw FileNotFoundException("Unsupported Architect observation file")
        }

    override fun openFile(
        uri: Uri,
        mode: String,
    ): ParcelFileDescriptor {
        if (mode != "r") {
            throw FileNotFoundException("Architect observations are read-only")
        }
        return ParcelFileDescriptor.open(
            resolveFile(uri),
            ParcelFileDescriptor.MODE_READ_ONLY,
        )
    }

    override fun query(
        uri: Uri,
        projection: Array<out String>?,
        selection: String?,
        selectionArgs: Array<out String>?,
        sortOrder: String?,
    ): Cursor {
        val file = resolveFile(uri)
        val captureId = resolveCaptureId(uri)
        val columns = projection ?: arrayOf(OpenableColumns.DISPLAY_NAME, OpenableColumns.SIZE)
        val cursor = MatrixCursor(columns)
        val row = cursor.newRow()
        columns.forEach { column ->
            when (column) {
                OpenableColumns.DISPLAY_NAME -> row.add(displayName(captureId, file.name))
                OpenableColumns.SIZE -> row.add(file.length())
                else -> row.add(null)
            }
        }
        return cursor
    }

    override fun insert(
        uri: Uri,
        values: ContentValues?,
    ): Uri? = throw UnsupportedOperationException("Architect observation provider is read-only")

    override fun delete(
        uri: Uri,
        selection: String?,
        selectionArgs: Array<out String>?,
    ): Int = throw UnsupportedOperationException("Architect observation provider is read-only")

    override fun update(
        uri: Uri,
        values: ContentValues?,
        selection: String?,
        selectionArgs: Array<out String>?,
    ): Int = throw UnsupportedOperationException("Architect observation provider is read-only")

    private fun resolveFile(uri: Uri): File {
        val providerContext = context ?: throw FileNotFoundException("Provider context unavailable")
        val expectedAuthority = authority(providerContext)
        if (uri.scheme != "content" || uri.authority != expectedAuthority) {
            throw FileNotFoundException("Unsupported Architect observation URI")
        }

        val captureId = resolveCaptureId(uri)
        val name = resolveName(uri)
        val root =
            File(providerContext.filesDir, "$OBSERVATION_DIRECTORY/$EXPORT_DIRECTORY").canonicalFile
        val captureDirectory = File(root, captureId).canonicalFile
        val target = File(captureDirectory, name).canonicalFile
        if (
            captureDirectory.parentFile != root ||
            target.parentFile != captureDirectory ||
            !target.isFile
        ) {
            throw FileNotFoundException("Architect frozen observation is unavailable")
        }
        return target
    }

    private fun resolveCaptureId(uri: Uri): String {
        if (uri.pathSegments.size != 2) {
            throw FileNotFoundException("Unsupported Architect observation path")
        }
        val captureId = uri.pathSegments[0]
        if (!CAPTURE_ID.matches(captureId)) {
            throw FileNotFoundException("Unsupported Architect capture identifier")
        }
        return captureId
    }

    private fun resolveName(uri: Uri): String {
        if (uri.pathSegments.size != 2) {
            throw FileNotFoundException("Unsupported Architect observation path")
        }
        return uri.pathSegments[1].takeIf(ALLOWED_FILES::contains)
            ?: throw FileNotFoundException("Unsupported Architect observation file")
    }

    private fun displayName(
        captureId: String,
        fileName: String,
    ): String =
        when (fileName) {
            IMAGE_FILE_NAME -> "architect-pulse-$captureId.png"
            MANIFEST_FILE_NAME -> "architect-pulse-$captureId.json"
            ArchitectObservationContract.EXPORT_BUNDLE_FILE -> "architect-pulse-$captureId.zip"
            else -> fileName
        }

    companion object {
        private const val OBSERVATION_DIRECTORY = "architect/observation"
        private const val EXPORT_DIRECTORY = "export"
        private const val IMAGE_FILE_NAME = "latest.png"
        private const val MANIFEST_FILE_NAME = "latest.json"
        private val CAPTURE_ID = Regex("^[A-Za-z0-9-]{8,64}$")
        private val ALLOWED_FILES =
            setOf(
                IMAGE_FILE_NAME,
                MANIFEST_FILE_NAME,
                ArchitectObservationContract.EXPORT_BUNDLE_FILE,
            )

        fun authority(context: Context): String =
            "${context.packageName}.architect.observation"

        fun uriFor(
            context: Context,
            file: File,
        ): Uri {
            val root =
                File(context.filesDir, "$OBSERVATION_DIRECTORY/$EXPORT_DIRECTORY").canonicalFile
            val canonicalFile = file.canonicalFile
            val captureDirectory = canonicalFile.parentFile
            require(canonicalFile.name in ALLOWED_FILES) {
                "Only bounded Architect observation files may be shared"
            }
            require(captureDirectory?.parentFile == root) {
                "Only capture-bound frozen Architect exports may be shared"
            }
            val captureId = captureDirectory.name
            require(CAPTURE_ID.matches(captureId)) {
                "Invalid Architect capture identifier"
            }
            return Uri.Builder()
                .scheme("content")
                .authority(authority(context))
                .appendPath(captureId)
                .appendPath(canonicalFile.name)
                .build()
        }
    }
}
