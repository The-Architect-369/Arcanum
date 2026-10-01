package org.arcanum.nativehost.update

import android.content.pm.PackageInstaller
import org.junit.Assert.assertEquals
import org.junit.Test
import org.arcanum.nativehost.update.OwnPackageUpdatePolicy.AttemptState

class OwnPackageInstallFailureTest {
    private val prior = OwnPackageUpdatePolicy.Identity(OwnPackageUpdatePolicy.APPLICATION_ID, 22, "a".repeat(64), "b".repeat(64))
    private val target = prior.copy(versionCode = 23, apkSha256 = "c".repeat(64))
    private val inspection = OwnPackageUpdatePolicy.Inspection(target, 100, true, true)

    private fun assertReconciliationRequired(state: AttemptState) {
        assertEquals(OwnPackageUpdatePolicy.Decision.RECONCILE_PRIOR_ATTEMPT,
            OwnPackageUpdatePolicy.decide(prior, inspection, target, 100, state))
    }

    @Test fun knownInstallFailuresRemainFailedAndBlockFreshSubmission() {
        val failures = listOf(PackageInstaller.STATUS_FAILURE, PackageInstaller.STATUS_FAILURE_BLOCKED,
            PackageInstaller.STATUS_FAILURE_INVALID, PackageInstaller.STATUS_FAILURE_CONFLICT,
            PackageInstaller.STATUS_FAILURE_STORAGE, PackageInstaller.STATUS_FAILURE_INCOMPATIBLE,
            PackageInstaller.STATUS_FAILURE_TIMEOUT)
        for (status in failures) {
            val state = OwnPackageInstallFailure.stateFor(status)
            assertEquals(AttemptState.FAILED, state)
            assertReconciliationRequired(state)
        }
    }

    @Test fun cancellationRemainsSeparateFromOtherFailuresAndRequiresSettlement() {
        val state = OwnPackageInstallFailure.stateFor(PackageInstaller.STATUS_FAILURE_ABORTED)
        assertEquals(AttemptState.CANCELLED, state)
        assertReconciliationRequired(state)
    }

    @Test fun missingUnexpectedAndNonFailureStatusesCannotCreateSuccess() {
        for (status in listOf(Int.MIN_VALUE, -99, 9, PackageInstaller.STATUS_PENDING_USER_ACTION, PackageInstaller.STATUS_SUCCESS)) {
            val state = OwnPackageInstallFailure.stateFor(status)
            assertEquals(AttemptState.UNKNOWN, state)
            assertReconciliationRequired(state)
        }
    }
}
