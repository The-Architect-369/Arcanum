# A16 native UI/JNI integration and physical qualification candidate

This continuation of the [receipt contract](ce-w04-a16-local-continuity-receipts.md)
and [transaction/custody slice](ce-w04-a16-transaction-and-custody.md) is authorized
by the Human instruction to begin UI/JNI integration and physical device
qualification on 2026-10-02. It prepares the bounded native candidate and device
protocol. Installation, physical execution and canonical closure remain separately
observed effects. Neither a host test nor an APK build qualifies physical custody.

## Native surface

The native host exposes a Local continuity dialog. Opening or refreshing observes
state; only explicit confirmation provisions/replaces a credential, records/adopts
the displayed public fixture, resumes an unsigned intent or publishes an existing
signature. Work occurs off the UI thread. Status includes credential and receipt
generations separately, observed provisioning security, fingerprint and pending
state. Participant continuity metadata is redacted from Architect observation.
The fixture is exactly `A16 public synthetic qualification sample v1\n`.
Hope/Journey contents and provider intake are outside this integration.

The original three-export base JNI ABI and capability mask remain intact. A
separate library, `libarcanum_android_continuity_jni.so`, has six exports under
`Java_org_arcanum_nativehost_continuity_ContinuityNativeBridge_`:
`nativeWireVersion`, `nativePrepare`, `nativeInspect`, `nativeCommit`,
`nativePublish`, `nativeRecover`. Wire version 1 carries a phase byte, a big-endian
u32 message length and canonical message, then a big-endian u32 wrapper length
and optional original wrapper. Message/wrapper bounds remain 64/66 KiB. Operation
IDs are 32 lowercase hexadecimal characters; roots must be absolute. JNI bounds
inputs before copying, contains unwinding and reports controlled exceptions.
The Rust facade verifies signatures, fingerprints, object digests and the fixed
synthetic schema before publication and again at recovery.

The app-private no-backup credential ledger is unchanged. A separately locked,
checksummed, bounded operation journal preserves up to 64 operation intents at
`continuity-ui.v1`. The synthetic store resides at `continuity-synthetic.v1`.
Intent fixes operation ID, credential generation/fingerprint, action and actual
confirmation time before preparation. A signing-started marker is durably written
before calling the signing manager. Missing acknowledgment after that marker
leaves SIGNING_UNKNOWN and blocks another signing attempt or a new sample.
Recovery does not provision, sign or publish. A staged original wrapper can be
published by an explicit action without signing again. Corrupt/partial state is
preserved. Checksums do not establish rollback protection.

Adoption records the later confirmation time and retains fixture attribution;
occurrence and observation remain unknown. A UI confirmation is an application
assertion, not biometric or independent Human-presence proof. Receipt validity
grants no authority, content truth, permissions, worth or identity.

## Qualification artifacts

Native app version 26 identifies this integration candidate. The A16 native CI
job builds both supported ABIs with all four libraries, verifies the six A16 JNI
exports, runs native JVM tests, and prepares these same-run, same-source artifacts:

- `arcanum-a16-qualification-26.apk`: isolated baseline app;
- `arcanum-a16-qualification-27.apk`: compatible update;
- `arcanum-a16-qualification-tests.apk`: separately invoked instrumentation.

The package is `org.arcanum.nativehost.a16qualification`; its UID, storage and
AndroidKeyStore namespace are separate from `org.arcanum.nativehost`. CI checks
package/version, instrumentation target, both ABIs, all four libraries and equal
verified signer certificate digests. It supplies actual source-head, APK hashes,
package metadata and public signer observations. A development-unbound APK is
refused by device tests. Instrumentation inspects the installed target's build
record through its class loader as well as its own constants. Seed requires and
records installed version 26; update recovery requires 27. The CI debug signer is
for this isolated candidate only;
the artifact expires and is not a publisher or participant signing identity.
Other inherited CI APKs do not include the fourth library and cannot qualify A16.

## Physical execution protocol

First review the downloaded artifact hashes, source, signer and chosen ADB serial.
Obtain the applicable exact-target installation and qualification-effect grant
before execution. That grant must cover installation/update of this isolated
package, synthetic credential creation/replacement and deletion of its test key.
No production uninstall, data clearing, private-store export or broad log capture
is part of this protocol. If a prior isolated install or original baseline exists,
reconcile it before repeating seed; never reset merely to obtain a passing test.

Use an explicitly selected physical device supporting a packaged ABI. Record
device model, API/ABI, test event times, artifact coordinates and each command's
result. Confirm the device is physical. Set `qualification_serial` and
`qualification_artifacts` to the reviewed target and directory. These commands
are a prepared protocol, not an execution record:

```bash
adb -s "$qualification_serial" install "$qualification_artifacts/arcanum-a16-qualification-26.apk"
adb -s "$qualification_serial" install "$qualification_artifacts/arcanum-a16-qualification-tests.apk"
adb -s "$qualification_serial" shell am instrument -w -e class org.arcanum.nativehost.continuity.ContinuityDeviceQualificationTest#seed org.arcanum.nativehost.a16qualification.test/androidx.test.runner.AndroidJUnitRunner
adb -s "$qualification_serial" shell am force-stop org.arcanum.nativehost.a16qualification
adb -s "$qualification_serial" shell am instrument -w -e class org.arcanum.nativehost.continuity.ContinuityDeviceQualificationTest#recoverAfterRestart org.arcanum.nativehost.a16qualification.test/androidx.test.runner.AndroidJUnitRunner
adb -s "$qualification_serial" install -r "$qualification_artifacts/arcanum-a16-qualification-27.apk"
adb -s "$qualification_serial" shell am instrument -w -e class org.arcanum.nativehost.continuity.ContinuityDeviceQualificationTest#recoverAfterCompatibleUpdate org.arcanum.nativehost.a16qualification.test/androidx.test.runner.AndroidJUnitRunner
adb -s "$qualification_serial" shell am instrument -w -e class org.arcanum.nativehost.continuity.ContinuityDeviceQualificationTest#rejectTamperedReceipt org.arcanum.nativehost.a16qualification.test/androidx.test.runner.AndroidJUnitRunner
adb -s "$qualification_serial" shell am instrument -w -e class org.arcanum.nativehost.continuity.ContinuityDeviceQualificationTest#loseQualificationKey org.arcanum.nativehost.a16qualification.test/androidx.test.runner.AndroidJUnitRunner
adb -s "$qualification_serial" shell am instrument -w -e class org.arcanum.nativehost.continuity.ContinuityDeviceQualificationTest#replaceMissingQualificationKey org.arcanum.nativehost.a16qualification.test/androidx.test.runner.AndroidJUnitRunner
adb -s "$qualification_serial" shell am instrument -w -e class org.arcanum.nativehost.continuity.ContinuityDeviceQualificationTest#rotateReadyQualificationKey org.arcanum.nativehost.a16qualification.test/androidx.test.runner.AndroidJUnitRunner
```

Invoke methods individually in this order; an unordered whole-class invocation
is unsupported. Inspect instrumentation assertions, not merely ADB exit status.
Stop on failed/unknown acknowledgments and reconcile original state. Tests retain
a public synthetic baseline only inside the isolated package and check unchanged
original receipt bytes after process restart, compatible update, tampering, key
loss and rotation. Deletion is guarded by the isolated package and exact original
generation. No old receipt is re-signed or attributed to the new generation.

Manually launch the isolated app and exercise Continuity: cancellation, explicit
record/adoption, scrolling/accessibility and unchanged Hope/Tempus navigation.
Check that opening/refreshing does not create keys or receipts, adoption preserves
producer attribution, and unavailable JNI fails closed. Record selected synthetic
observations only. Process force-stop qualification does not establish device
reboot, power-loss, hardware-backed custody, biometric proof, backup recovery or
private-content qualification. Report measured AndroidKeyStore security as
observed; absence of hardware evidence remains unknown.

A16 and CE-W04 remain open until applicable physical evidence and the Human
Architect's canonical adoption/closure gate are met.
