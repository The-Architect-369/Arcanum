#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SPEC = ROOT / "docs/specs/app/hope-local-reflection.v0.1.json"


def require(condition: bool, label: str) -> None:
    if not condition:
        raise SystemExit(f"❌ {label}")
    print(f"✅ {label}")


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def main() -> None:
    spec = json.loads(SPEC.read_text(encoding="utf-8"))
    require(spec["contractId"] == "hope-local-reflection.v0.1", "F66/F68 native Hope interaction contract ID")
    require(spec["constructionEra"] == "CE-W03" and spec["tranche"] == "W03.4", "F66/F68 interaction tranche identity")

    interaction = spec["interaction"]
    require(interaction["capture"] is True, "F66 reflection capture enabled")
    require(interaction["recall"] == "latest_protected_reflection", "F65/F66 protected recall bounded")
    require(interaction["silenceValid"] is True, "F68 silence/non-use remains valid")
    require(interaction["curatedPresence"] == "Your reflection is held locally.", "F68 curated Hope presence fixed")
    require(all(interaction[key] is False for key in ["conversationalModelRequired", "remoteModelRequired", "localModelRequired"]), "F68 curated interaction has no model dependency")

    persistence = spec["persistence"]
    require(persistence["protected"] is True and persistence["exactRoundTripRequired"] is True, "F65 protected exact round-trip required")
    require(persistence["missingStateIsExplicit"] is True and persistence["corruptionFailsClosed"] is True and persistence["silentResetForbidden"] is True, "F65 recovery failures explicit and fail closed")

    receipt = spec["receipt"]
    require(receipt["scope"] == "local" and receipt["signed"] is False, "F66 truthful local unsigned receipt")
    require(receipt["signerRef"] is None and receipt["signature"] is None, "F66 no fabricated signer or signature")
    require(receipt["authorityEffect"] == "none" and receipt["privateBodyIncluded"] is False, "F66 receipt authority/private-body firewall")
    require(set(receipt["forbiddenFields"]) == {"userText", "prompt", "hopeText", "reflectionBody", "privateContent"}, "F66 private receipt fields explicitly forbidden")
    require("contentDigestSha256" in receipt["requiredFields"] and "reflectionId" in receipt["requiredFields"], "F66 bounded receipt binding fields required")

    tempus = spec["tempus"]
    require(tempus["optional"] is True and tempus["sourceKind"] == "system-clock", "F67 Tempus provenance optional/factual")
    require(tempus["fields"] == ["anchorId", "capturedAt", "sourceKind"], "F67 Tempus provenance field ceiling exact")
    require(tempus["interpretation"] is None and tempus["causalMeaningAllowed"] is False and tempus["failureMayFabricateContext"] is False, "F67 Tempus interpretation/fabrication firewall")

    hope = spec["hope"]
    require(hope["authority"] == "advisory_only" and hope["authorityEffect"] == "none", "F68 Hope remains advisory only")
    require(all(hope[key] is False for key in ["canExecute", "canRatify", "canConfirmReadiness", "profiling", "scoring", "streaks", "ranking"]), "F68 Hope UX authority/pressure firewall")
    require(all(value is False for value in spec["capabilityCeiling"].values()), "F71 W03.4 offline/identity/signing/model ceiling closed")

    codec = read("apps/android/app/src/main/java/org/arcanum/nativehost/hope/HopeLocalStateCodec.kt")
    require("data class HopeLocalReceipt(" in codec, "F66 native local receipt type present")
    require('val scope: String = "local"' in codec and "val signed: Boolean = false" in codec, "F66 local/unsigned receipt defaults")
    require("val signerRef: String? = null" in codec and "val signature: String? = null" in codec, "F66 signer/signature remain absent")
    require('val authorityEffect: String = "none"' in codec and "val privateBodyIncluded: Boolean = false" in codec, "F66 receipt authority/private-body defaults")
    require('MessageDigest.getInstance("SHA-256")' in codec, "F66 SHA-256 content binding present")
    require('reflection.getString("id") == state.receipt.reflectionId' in codec, "F66 receipt binds reflection ID")
    require('reflection.getString("version") == state.receipt.recordVersion' in codec, "F66 receipt binds record version")
    to_json = codec.split("fun toJson(): JSONObject =", 1)[1].split("companion object", 1)[0]
    require(all(f'.put("{field}"' not in to_json for field in ["userText", "prompt", "hopeText", "reflectionBody", "privateContent"]), "F66 receipt serialization excludes private reflection fields")
    require('.put("privateBodyIncluded", false)' in to_json, "F66 receipt declares private body absent")

    panel = read("apps/android/app/src/main/java/org/arcanum/nativehost/hope/HopeReflectionPanel.kt")
    require('text = "Hope · local reflection"' in panel, "F68 Hope is native experiential center")
    require('text = "Private on this device · advisory only · authorityEffect=none"' in panel, "F68 truthful privacy/authority presentation")
    require('status.text = "Silence is welcome. Nothing was recorded."' in panel, "F68 silence is valid")
    require('const val CURATED_PRESENCE: String = "Your reflection is held locally."' in panel, "F68 curated static presence implemented")
    require("HopeRuntimeBridge.buildReflection(" in panel, "F63/F66 reflection constructed through Rust-owned contract")
    require("HopeProtectedStore(context.filesDir, AndroidHopeKeyManager(), contract)" in panel, "F64/F65 reflection uses protected local store")
    require("store.persistExact(encoded)" in panel and "store.recoverExact()" in panel and "recoveredBytes.contentEquals(encoded)" in panel, "F65 capture proves exact immediate protected recovery")
    require("TempusLifecycleBridge.captureAndPersist(context.filesDir)" in panel and ".getOrNull()" in panel, "F67 Tempus optional and omitted on failure")
    require("sourceKind = presentation.sourceKind" in panel, "F67 Tempus provenance remains factual source data")
    require('is HopeStateCorruptException ->' in panel and "No state was reset." in panel, "F65 corruption UX fails closed without reset")
    require(all(token not in panel for token in ["java.net", "okhttp", "retrofit", "OpenAI", "chatCompletion", "languageModel", "embedding"]), "F71 Hope panel has no network/model dependency")
    require(all(token.lower() not in panel.lower() for token in ["score:", "streak", "rank:", "readiness score", "profile user"]), "F68 Hope panel has no scoring/ranking/profiling mechanics")

    tests = read("apps/android/app/src/test/java/org/arcanum/nativehost/hope/HopeLocalStateCodecTest.kt")
    for test_name in ["localReceiptBindsDigestWithoutPrivateBody", "encryptedPayloadCodecPreservesExactCanonicalReflection", "alteredDigestBindingIsRejected"]:
        require(f"fun {test_name}()" in tests, f"F66 receipt/state test {test_name}")

    activity = read("apps/android/app/src/main/java/org/arcanum/nativehost/MainActivity.kt")
    require("setContentView(ArcnetRendererView(this, bridgeLabel))" in activity, "F61 inherited renderer host still preserved")
    require("ArcanumLaunchPanel(this, appLaunch)" in activity, "F62 Arcanum launch panel still mounted")
    require("HopeReflectionPanel(this)" in activity, "F66/F68 Hope reflection panel mounted")
    require("TempusLifecyclePanel(this)" in activity, "F61 inherited Tempus panel still mounted")

    print("✅ CE-W03 W03.4 Hope reflection, receipt, Tempus, authority, and capability invariants verified")


if __name__ == "__main__":
    main()
