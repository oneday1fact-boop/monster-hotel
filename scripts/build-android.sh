#!/usr/bin/env bash
set -euo pipefail
project_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
source "$project_root/scripts/android-env.sh"
cd "$project_root"
npm run build
npx cap sync android
(cd android && ./gradlew --no-daemon --max-workers="${ANDROID_BUILD_WORKERS:-3}" assembleDebug)
mkdir -p artifacts
cp android/app/build/outputs/apk/debug/app-debug.apk artifacts/monster-hotel-midnight-check-in-debug.apk
printf 'Debug APK: %s/artifacts/monster-hotel-midnight-check-in-debug.apk\n' "$project_root"
