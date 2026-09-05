package org.arcanum.nativehost.runtime

import android.content.Context
import java.util.UUID

class TempusLifecycleCoordinator(
    private val context: Context,
) {
    fun resumeOrCapture(): String {
        val status = TempusLifecycleBridge.status()
        if (!status.ready) {
            return "error · Tempus lifecycle unavailable · local only · authorityEffect=none"
        }

        val rootPath = context.filesDir.absolutePath
        val preferences =
            context.getSharedPreferences(PREFERENCES_NAME, Context.MODE_PRIVATE)
        val priorAnchorId = preferences.getString(KEY_LAST_ANCHOR_ID, null)

        if (priorAnchorId != null) {
            // Recovery failures remain visible; never replace durable truth silently.
            return TempusLifecycleBridge.recover(rootPath, priorAnchorId)
        }

        val anchorId = "ce-w02-${UUID.randomUUID()}"
        val presentation = TempusLifecycleBridge.capturePersist(rootPath, anchorId)
        if (TempusLifecycleContract.isSuccessfulPresentation(presentation)) {
            val pointerPersisted =
                preferences.edit().putString(KEY_LAST_ANCHOR_ID, anchorId).commit()
            if (!pointerPersisted) {
                return "error · Tempus local pointer persistence failed · anchor remains runtime-owned · authorityEffect=none"
            }
        }
        return presentation
    }

    private companion object {
        const val PREFERENCES_NAME = "ce_w02_tempus_lifecycle"
        const val KEY_LAST_ANCHOR_ID = "last_anchor_id"
    }
}
