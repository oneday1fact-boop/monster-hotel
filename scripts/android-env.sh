#!/usr/bin/env bash
# Source this file; it selects retained cloud tools without changing HOME or system files.
if [[ -z "${ANDROID_HOME:-}" && -d /workspace/.tooling/android-sdk ]]; then
  export ANDROID_HOME=/workspace/.tooling/android-sdk
fi
if [[ "${ANDROID_HOME:-}" == /workspace/.tooling/android-sdk ]]; then
  export ANDROID_USER_HOME="${ANDROID_USER_HOME:-/workspace/.tooling/android-user}"
  export GRADLE_USER_HOME="${GRADLE_USER_HOME:-/workspace/.tooling/gradle-home}"
fi
if [[ ! -x "${JAVA_HOME:-}/bin/javac" && -x /workspace/.tooling/jdk21/usr/lib/jvm/java-21-openjdk-amd64/bin/javac ]]; then
  export JAVA_HOME=/workspace/.tooling/jdk21/usr/lib/jvm/java-21-openjdk-amd64
fi
