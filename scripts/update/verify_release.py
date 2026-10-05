#!/usr/bin/env python3
"""Verify the shared reviewed release listing against its immutable local artifact."""
import hashlib
import json
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[2]
PUBLIC = ROOT / 'apps/web/public'
SIGNER = '9841fbeda4d7d0c63b1663360fb0415218a08f063b5629317274076dfbb6b844'

def verify():
    raw = (PUBLIC / 'updates/release.json').read_bytes()
    r = json.loads(raw)
    assert raw == json.dumps(r, sort_keys=True, separators=(',', ':')).encode()
    assert set(r) == {'schemaVersion','manifestUrl','apkUrl','versionCode','versionName','sourceCommit','sha256','signerSha256'}
    assert r['schemaVersion'] == '1.0' and r['signerSha256'] == SIGNER
    paths = []
    for value in [r['manifestUrl'], r['apkUrl']]:
        u = urlsplit(value)
        assert u.scheme == 'https' and u.netloc == 'updates.the-arcanum.net' and not u.query and not u.fragment
        assert u.path.startswith('/updates/') and '..' not in u.path.split('/')
        paths.append(PUBLIC / u.path.lstrip('/'))
    manifest_path, apk = paths
    assert manifest_path.parent == apk.parent
    m = json.loads(manifest_path.read_text())
    assert m['package'] == dict(applicationId='org.arcanum.nativehost', versionCode=r['versionCode'], versionName=r['versionName'])
    assert m['build']['sourceCommit'] == r['sourceCommit']
    assert m['artifact']['sha256'] == r['sha256'] == hashlib.sha256(apk.read_bytes()).hexdigest()
    assert m['artifact']['sizeBytes'] == apk.stat().st_size
    assert m['artifact']['publisherSignerSha256'] == SIGNER
    assert f"{r['sha256']}  {apk.name}" in (apk.parent / 'SHA256SUMS').read_text()
    print(f"PASS shared release listing: version {r['versionCode']}, immutable artifact and manifest agree")

if __name__ == '__main__':
    verify()
