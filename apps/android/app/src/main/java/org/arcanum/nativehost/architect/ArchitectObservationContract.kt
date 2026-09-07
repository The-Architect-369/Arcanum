package org.arcanum.nativehost.architect

object ArchitectObservationContract {
    const val SCHEMA_VERSION: String = "0.2"
    const val OBSERVATION_TYPE: String = "architect_local_visual_pulse"
    const val SCOPE: String = "local"
    const val AUTHORITY_EFFECT: String = "none"
    const val RETENTION: String = "latest-only"
    const val TRANSPORT: String = "none"
    const val EXPORT_CAPABILITY: String = "human_selected_android_share_sheet"
    const val VISUAL_DIAGNOSTICS_VERSION: String = "0.1"
    const val REDACTED_TEXT: String = "<private-local-redacted>"
    const val NETWORK_REQUIRED: Boolean = false
    const val MODEL_DEPENDENCY: Boolean = false
    const val AUTO_EXPORT: Boolean = false
}
