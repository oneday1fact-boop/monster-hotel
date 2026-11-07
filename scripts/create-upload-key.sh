#!/usr/bin/env bash
# Owner-operated, never overwrites a key. Run in a trusted terminal, not in chat.
set -euo pipefail
umask 077
: "${MONSTER_UPLOAD_STORE_FILE:?Set an absolute keystore path in your own secure storage.}"
if [[ "$MONSTER_UPLOAD_STORE_FILE" != /* || -e "$MONSTER_UPLOAD_STORE_FILE" ]]; then
  printf 'Choose a new absolute path. Existing keys are never overwritten.\n' >&2; exit 1
fi
if [[ ! -t 0 && -z "${MONSTER_NEW_UPLOAD_PASSWORD:-}" ]]; then
  printf 'Use a trusted interactive terminal, or provide MONSTER_NEW_UPLOAD_PASSWORD through secure environment settings.\n' >&2; exit 1
fi
if [[ -z "${MONSTER_NEW_UPLOAD_PASSWORD:-}" ]]; then
  read -r -s -p 'New upload keystore password (at least 12 characters): ' MONSTER_NEW_UPLOAD_PASSWORD
  printf '\n'
  read -r -s -p 'Confirm password: ' monster_password_confirm
  printf '\n'
  [[ "$MONSTER_NEW_UPLOAD_PASSWORD" == "$monster_password_confirm" ]] || { printf 'Passwords do not match.\n' >&2; exit 1; }
  unset monster_password_confirm
fi
[[ ${#MONSTER_NEW_UPLOAD_PASSWORD} -ge 12 ]] || { printf 'Use at least 12 characters.\n' >&2; exit 1; }
export MONSTER_NEW_UPLOAD_PASSWORD
trap 'unset MONSTER_NEW_UPLOAD_PASSWORD' EXIT
mkdir -p -- "$(dirname -- "$MONSTER_UPLOAD_STORE_FILE")"
keytool -genkeypair -keystore "$MONSTER_UPLOAD_STORE_FILE" -storetype PKCS12 -storepass:env MONSTER_NEW_UPLOAD_PASSWORD -keypass:env MONSTER_NEW_UPLOAD_PASSWORD -alias monster-upload -keyalg RSA -keysize 3072 -validity 10000 -dname 'CN=Monster Hotel Upload'
printf 'Upload key created. Back up the keystore and password in your own secure storage. Alias: monster-upload\n'
