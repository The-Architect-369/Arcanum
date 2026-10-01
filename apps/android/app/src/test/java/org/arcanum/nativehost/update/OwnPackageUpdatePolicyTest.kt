package org.arcanum.nativehost.update

import org.junit.Assert.assertEquals
import org.junit.Test
import org.arcanum.nativehost.update.OwnPackageUpdatePolicy.Identity
import org.arcanum.nativehost.update.OwnPackageUpdatePolicy.Inspection
import org.arcanum.nativehost.update.OwnPackageUpdatePolicy.AttemptState
import org.arcanum.nativehost.update.OwnPackageUpdatePolicy.Decision
import org.arcanum.nativehost.update.OwnPackageUpdatePolicy.Recovery
import org.arcanum.nativehost.update.OwnPackageUpdatePolicy.APPLICATION_ID
import org.arcanum.nativehost.update.OwnPackageUpdatePolicy.decide
import org.arcanum.nativehost.update.OwnPackageUpdatePolicy.reconcile

class OwnPackageUpdatePolicyTest {
    private val prior = Identity(APPLICATION_ID, 19, "a".repeat(64), "b".repeat(64))
    private val target = prior.copy(versionCode = 20, apkSha256 = "c".repeat(64))
    private val inspection = Inspection(target, 1_000L, true, true)

    @Test fun advancingInspectedBytesRequireUserConfirmation() {
        assertEquals(Decision.READY_FOR_USER_CONFIRMATION, decide(prior, inspection, target, 2_000L, AttemptState.NONE))
    }

    @Test fun installedVersionCannotBeReplayedAsAnUpgrade() {
        assertEquals(Decision.NOT_ADVANCING, decide(prior, inspection.copy(identity = prior), prior, 2_000L, AttemptState.NONE))
    }

    @Test fun changedBytesAndSignerFailClosed() {
        assertEquals(Decision.BYTES_CHANGED, decide(prior, inspection, target.copy(apkSha256 = "d".repeat(64)), 2_000L, AttemptState.NONE))
        val foreign = target.copy(signerSha256 = "d".repeat(64))
        assertEquals(Decision.SIGNER_CHANGED, decide(prior, inspection.copy(identity = foreign), foreign, 2_000L, AttemptState.NONE))
    }

    @Test fun staleFutureAndUnverifiedInspectionFailClosed() {
        assertEquals(Decision.STALE_INSPECTION, decide(prior, inspection, target, 601_001L, AttemptState.NONE))
        assertEquals(Decision.STALE_INSPECTION, decide(prior, inspection, target, 999L, AttemptState.NONE))
        assertEquals(Decision.UNVERIFIED_DISTRIBUTION, decide(prior, inspection.copy(signatureVerified = false), target, 2_000L, AttemptState.NONE))
    }

    @Test fun everyPriorAttemptRequiresSeparateReconciliation() {
        AttemptState.values().filter { it != AttemptState.NONE }.forEach {
            assertEquals(Decision.RECONCILE_PRIOR_ATTEMPT, decide(prior, inspection, target, 2_000L, it))
        }
    }

    @Test fun recoveryDoesNotAuthorizeRetryOrClaimAttribution() {
        assertEquals(Recovery.TARGET_OBSERVED, reconcile(prior, target, target))
        assertEquals(Recovery.PRIOR_OBSERVED_OUTCOME_UNKNOWN, reconcile(prior, target, prior))
        assertEquals(Recovery.UNEXPECTED_STATE, reconcile(prior, target, target.copy(apkSha256 = "e".repeat(64))))
    }

    @Test fun unrelatedPackagesAndMalformedDigestsAreRejected() {
        assertEquals(Decision.WRONG_PACKAGE, decide(prior.copy(applicationId = "other"), inspection, target, 2_000L, AttemptState.NONE))
        assertEquals(Decision.INVALID_IDENTITY, decide(prior.copy(apkSha256 = "bad"), inspection, target, 2_000L, AttemptState.NONE))
    }
}
