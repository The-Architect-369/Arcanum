package org.arcanum.nativehost.architect

import android.app.Activity
import android.content.ClipData
import android.content.Intent
import android.net.Uri

class ArchitectObservationBridge(
    private val activity: Activity,
) {
    fun share(observation: ArchitectObservationResult) {
        val uris =
            arrayListOf(
                ArchitectObservationProvider.uriFor(activity, observation.imageFile),
                ArchitectObservationProvider.uriFor(activity, observation.manifestFile),
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
                    "Privacy-redacted local Architect observation · scope=local · authorityEffect=none",
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
    }
}
