#!/usr/bin/env bash
# Build an owner-signed Google Play bundle, or explicitly check an unsigned build.
set -euo pipefail
project_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
source "$project_root/scripts/android-env.sh"
cd "$project_root"
bundle_mode="${1:-}"
if [[ "$bundle_mode" != '' && "$bundle_mode" != '--unsigned-check' ]]; then
  printf 'Usage: bash scripts/build-play-bundle.sh [--unsigned-check]\n' >&2; exit 2
fi
if [[ "$bundle_mode" != '--unsigned-check' ]]; then
  for variable_name in MONSTER_UPLOAD_STORE_FILE MONSTER_UPLOAD_STORE_PASSWORD MONSTER_UPLOAD_KEY_ALIAS MONSTER_UPLOAD_KEY_PASSWORD; do
    if [[ -z "${!variable_name:-}" ]]; then
      printf 'Missing signing configuration: %s. Set it securely outside Git.\n' "$variable_name" >&2; exit 1
    fi
  done
  if [[ "$MONSTER_UPLOAD_STORE_FILE" != /* ]]; then
    printf 'Use an absolute path for MONSTER_UPLOAD_STORE_FILE.\n' >&2; exit 1
  fi
  if [[ ! -f "$MONSTER_UPLOAD_STORE_FILE" ]]; then
    printf 'The configured upload keystore is not a file.\n' >&2; exit 1
  fi
fi
npm run build
npx cap sync android
if [[ "$bundle_mode" == '--unsigned-check' ]]; then
  # Never silently consume an owner key for a compile-only check.
  unset MONSTER_UPLOAD_STORE_FILE MONSTER_UPLOAD_STORE_PASSWORD MONSTER_UPLOAD_KEY_ALIAS MONSTER_UPLOAD_KEY_PASSWORD
fi
(cd android && ./gradlew --no-daemon --max-workers="${ANDROID_BUILD_WORKERS:-3}" bundleRelease)
mkdir -p artifacts
bundle_source=android/app/build/outputs/bundle/release/app-release.aab
if [[ "$bundle_mode" == '--unsigned-check' ]]; then
  bundle_target=artifacts/monster-hotel-UNSIGNED-NOT-FOR-UPLOAD.aab
else
  bundle_target=artifacts/monster-hotel-release.aab
  signature_report=artifacts/play-bundle-signature.txt
  "${JAVA_HOME:?Configure a full JDK}/bin/jarsigner" -J-Duser.language=en -J-Duser.country=US -verify -verbose -certs "$bundle_source" > "$signature_report" 2>&1
  if ! rg -q 'jar verified' "$signature_report"; then
    printf 'Bundle signature verification failed; see the local verification report.\n' >&2; exit 1
  fi
fi
cp "$bundle_source" "$bundle_target"
sha256sum "$bundle_target" > "$bundle_target.sha256"
printf 'Built: %s\n' "$bundle_target"
if [[ "$bundle_mode" == '--unsigned-check' ]]; then printf 'Compile check only: UNSIGNED; this file cannot be uploaded to Google Play.\n'; fi
