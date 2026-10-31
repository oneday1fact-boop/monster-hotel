#!/usr/bin/env bash
# Workspace-local setup for the Debian amd64 cloud machine. Keeps TLS and package verification.
set -euo pipefail
if [[ "$(uname -m)" != x86_64 || ! -r /usr/share/keyrings/debian-archive-keyring.gpg ]]; then
  printf 'This helper requires Debian amd64; use Android Studio and JDK 21 on other hosts.\n' >&2
  exit 1
fi
tool_root=/workspace/.tooling
mkdir -p "$tool_root/android-sdk/cmdline-tools" "$tool_root/android-user" "$tool_root/gradle-home"
if [[ ! -x "$tool_root/android-sdk/cmdline-tools/latest/bin/android" ]]; then
  if [[ -e "$tool_root/android-sdk/cmdline-tools/latest" ]]; then
    printf 'Existing command-line tools differ from this helper; preserving them. Configure that SDK manually.\n' >&2
    exit 1
  fi
  archive="$(mktemp /tmp/midnight-sdk.XXXXXX)"
  curl --fail --location https://dl.google.com/android/repository/commandlinetools-linux-16111833_latest.zip -o "$archive"
  # Published in Google's repository2-1.xml for cmdline-tools;23.0, Linux.
  printf 'e025545c62a8e64c7559119566a569fb1dec5f60  %s\n' "$archive" | sha1sum --check --status
  unpack="$(mktemp -d /tmp/midnight-sdk-unpack.XXXXXX)"
  unzip -q "$archive" -d "$unpack"
  mv "$unpack/cmdline-tools" "$tool_root/android-sdk/cmdline-tools/latest"
  rm -f "$archive"
  rmdir "$unpack"
fi
export ANDROID_HOME="$tool_root/android-sdk" ANDROID_USER_HOME="$tool_root/android-user"
"$ANDROID_HOME/cmdline-tools/latest/bin/android" --no-metrics sdk install 'platforms;android-35' 'build-tools;34.0.0' 'build-tools;35.0.0' platform-tools
if [[ ! -x "$tool_root/jdk21/usr/lib/jvm/java-21-openjdk-amd64/bin/javac" ]]; then
  mkdir -p "$tool_root/apt/"{etc/empty.d,etc/preferences.d,state/lists/partial,cache/archives/partial} "$tool_root/jdk-download" "$tool_root/jdk21"
  cat > "$tool_root/apt/apt.conf" <<'APT'
Dir::Etc "/workspace/.tooling/apt/etc";
Dir::Etc::main "-";
Dir::Etc::parts "empty.d";
Dir::State "/workspace/.tooling/apt/state";
Dir::State::status "/var/lib/dpkg/status";
Dir::Cache "/workspace/.tooling/apt/cache";
APT::Architecture "amd64";
APT::Sandbox::User "agent";
Acquire::http::Proxy "http://proxy:8080";
Acquire::https::Proxy "http://proxy:8080";
APT
  cat > "$tool_root/apt/etc/sources.list" <<'APT'
deb [signed-by=/usr/share/keyrings/debian-archive-keyring.gpg] https://deb.debian.org/debian trixie main
deb [signed-by=/usr/share/keyrings/debian-archive-keyring.gpg] https://security.debian.org/debian-security trixie-security main
APT
  export APT_CONFIG="$tool_root/apt/apt.conf"
  apt-get update
  (cd "$tool_root/jdk-download" && apt-get download openjdk-21-jdk-headless openjdk-21-jre-headless)
  for package in "$tool_root/jdk-download/"*.deb; do dpkg-deb -x "$package" "$tool_root/jdk21"; done
fi
if [[ ! -f "$tool_root/gradle-home/gradle.properties" ]]; then
  cat > "$tool_root/gradle-home/gradle.properties" <<'GRADLE'
systemProp.http.proxyHost=proxy
systemProp.http.proxyPort=8080
systemProp.https.proxyHost=proxy
systemProp.https.proxyPort=8080
systemProp.http.nonProxyHosts=localhost|127.*
org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
GRADLE
fi
"$tool_root/jdk21/usr/lib/jvm/java-21-openjdk-amd64/bin/javac" -version
printf 'Workspace Android toolchain is configured.\n'
