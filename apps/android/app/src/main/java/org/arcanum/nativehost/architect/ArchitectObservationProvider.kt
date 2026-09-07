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
        val columns = projection ?: arrayOf(OpenableColumns.DISPLAY_NAME, OpenableColumns.SIZE)
        val cursor = MatrixCursor(columns)
        val row = cursor.newRow()
        columns.forEach { column ->
            when (column) {
                OpenableColumns.DISPLAY_NAME -> row.add(file.name)
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
        val name = resolveName(uri)
        val root = File(providerContext.filesDir, OBSERVATION_DIRECTORY).canonicalFile
        val target = File(root, name).canonicalFile
        if (target.parentFile != root || !target.isFile) {
            throw FileNotFoundException("Architect observation is unavailable")
        }
        return target
    }

    private fun resolveName(uri: Uri): String {
        if (uri.pathSegments.size != 1) {
            throw FileNotFoundException("Unsupported Architect observation path")
        }
        return uri.lastPathSegment?.takeIf(ALLOWED_FILES::contains)
            ?: throw FileNotFoundException("Unsupported Architect observation file")
    }

    companion object {
        private const val OBSERVATION_DIRECTORY = "architect/observation"
        private const val IMAGE_FILE_NAME = "latest.png"
        private const val MANIFEST_FILE_NAME = "latest.json"
        private val ALLOWED_FILES = setOf(IMAGE_FILE_NAME, MANIFEST_FILE_NAME)

        fun authority(context: Context): String =
            "${context.packageName}.architect.observation"

        fun uriFor(
            context: Context,
            file: File,
        ): Uri {
            require(file.name in ALLOWED_FILES) {
                "Only bounded Architect observation files may be shared"
            }
            return Uri.Builder()
                .scheme("content")
                .authority(authority(context))
                .appendPath(file.name)
                .build()
        }
    }
}
