package org.arcanum.nativehost.update

import android.content.pm.PackageInstaller
import org.arcanum.nativehost.update.OwnPackageUpdatePolicy.AttemptState

/** Failure callbacks cannot establish success or authorize a new submission. */
object OwnPackageInstallFailure {
    fun stateFor(status: Int): AttemptState = when (status) {
        PackageInstaller.STATUS_FAILURE_ABORTED -> AttemptState.CANCELLED
        PackageInstaller.STATUS_FAILURE,
        PackageInstaller.STATUS_FAILURE_BLOCKED,
        PackageInstaller.STATUS_FAILURE_INVALID,
        PackageInstaller.STATUS_FAILURE_CONFLICT,
        PackageInstaller.STATUS_FAILURE_STORAGE,
        PackageInstaller.STATUS_FAILURE_INCOMPATIBLE,
        PackageInstaller.STATUS_FAILURE_TIMEOUT -> AttemptState.FAILED
        else -> AttemptState.UNKNOWN
    }
}
