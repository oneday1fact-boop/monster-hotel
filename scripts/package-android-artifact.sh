#!/usr/bin/env bash
# Verify and prepare the same downloadable bundle locally and on GitHub Actions.
set -euo pipefail
project_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
source "$project_root/scripts/android-env.sh"
apk_path="$project_root/artifacts/monster-hotel-midnight-check-in-debug.apk"
verifier="${ANDROID_HOME:?Configure ANDROID_HOME first}/build-tools/35.0.0/apksigner"
if [[ ! -s "$apk_path" || ! -x "$verifier" ]]; then
  printf 'Build the APK first and install Android Build-Tools 35.0.0.\n' >&2
  exit 1
fi
if ! "$verifier" verify "$apk_path" > "$project_root/artifacts/apk-verification.txt" 2>&1; then
  cat "$project_root/artifacts/apk-verification.txt" >&2
  exit 1
fi
python3 - "$project_root" <<'PY'
import hashlib, json, os, pathlib, subprocess, sys
root = pathlib.Path(sys.argv[1])
apk = root / 'artifacts/monster-hotel-midnight-check-in-debug.apk'
digest = hashlib.sha256(apk.read_bytes()).hexdigest()
metadata = {
    'apk': apk.name,
    'bytes': apk.stat().st_size,
    'sha256': digest,
    'build': 'Android debug test APK',
    'commit': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=root, text=True).strip(),
    'device_tested': False,
}
if os.environ.get('GITHUB_RUN_ID') and os.environ.get('GITHUB_REPOSITORY'):
    metadata['workflow_run'] = '{}/{}/actions/runs/{}'.format(
        os.environ.get('GITHUB_SERVER_URL', 'https://github.com'),
        os.environ['GITHUB_REPOSITORY'], os.environ['GITHUB_RUN_ID'])
(root / 'artifacts/build-info.json').write_text(json.dumps(metadata, indent=2) + '\n')
(root / 'artifacts/SHA256SUMS.txt').write_text(f'{digest}  {apk.name}\n')
(root / 'artifacts/INSTALL-ANDROID.txt').write_bytes((root / 'docs/android-install.zh-Hant.md').read_bytes())
print(f'Verified download bundle: {apk.name} ({apk.stat().st_size} bytes)')
PY
