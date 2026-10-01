package org.arcanum.nativehost.update

/** Pure decision layer. Inputs must come from independently inspected bytes/device state. */
object OwnPackageUpdatePolicy {
    const val APPLICATION_ID = "org.arcanum.nativehost"

    data class Identity(
        val applicationId: String,
        val versionCode: Long,
        val apkSha256: String,
        val signerSha256: String,
    )

    data class Inspection(
        val identity: Identity,
        val observedAtMillis: Long,
        val directHttpsVerified: Boolean,
        val signatureVerified: Boolean,
    )

    enum class AttemptState { NONE, PREPARED, SUBMITTED, AWAITING_USER, UNKNOWN, CANCELLED, FAILED, VERIFIED }

    enum class Decision {
        READY_FOR_USER_CONFIRMATION, WRONG_PACKAGE, INVALID_IDENTITY, STALE_INSPECTION,
        UNVERIFIED_DISTRIBUTION, BYTES_CHANGED, SIGNER_CHANGED, NOT_ADVANCING,
        RECONCILE_PRIOR_ATTEMPT,
    }

    fun decide(
        installed: Identity,
        inspection: Inspection,
        staged: Identity,
        nowMillis: Long,
        priorAttempt: AttemptState,
    ): Decision {
        if (priorAttempt != AttemptState.NONE) return Decision.RECONCILE_PRIOR_ATTEMPT
        val candidate = inspection.identity
        if (listOf(installed, candidate, staged).any { it.applicationId != APPLICATION_ID }) {
            return Decision.WRONG_PACKAGE
        }
        if (listOf(installed, candidate, staged).any { !valid(it) }) return Decision.INVALID_IDENTITY
        if (inspection.observedAtMillis < 0 || nowMillis < inspection.observedAtMillis ||
            nowMillis - inspection.observedAtMillis > 600_000L
        ) return Decision.STALE_INSPECTION
        if (!inspection.directHttpsVerified || !inspection.signatureVerified) {
            return Decision.UNVERIFIED_DISTRIBUTION
        }
        if (staged != candidate) return Decision.BYTES_CHANGED
        if (candidate.signerSha256 != installed.signerSha256) return Decision.SIGNER_CHANGED
        if (candidate.versionCode <= installed.versionCode) return Decision.NOT_ADVANCING
        return Decision.READY_FOR_USER_CONFIRMATION
    }

    enum class Recovery { TARGET_OBSERVED, PRIOR_OBSERVED_OUTCOME_UNKNOWN, UNEXPECTED_STATE }

    /** Observed target bytes do not establish attribution or fabricate an installation receipt. */
    fun reconcile(prior: Identity, target: Identity, observed: Identity): Recovery =
        when {
            !valid(prior) || !valid(target) || !valid(observed) ||
                listOf(prior, target, observed).any { it.applicationId != APPLICATION_ID } ->
                Recovery.UNEXPECTED_STATE
            observed == target -> Recovery.TARGET_OBSERVED
            observed == prior -> Recovery.PRIOR_OBSERVED_OUTCOME_UNKNOWN
            else -> Recovery.UNEXPECTED_STATE
        }

    private fun valid(identity: Identity): Boolean =
        identity.versionCode > 0 && digest.matches(identity.apkSha256) && digest.matches(identity.signerSha256)

    private val digest = Regex("[0-9a-f]{64}")
}
