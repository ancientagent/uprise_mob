# UPRISE Project – CHANGELOG

## 2025-08-29 – Android CI: Stable Smoke Preset
- Replaced CI workflow with stability-first emulator config (API 30 default x86_64; no-snapshot, noaudio, no-window, gpu swiftshader_indirect, accel off).
- Forced bash shell; removed /bin/sh pipefail issues.
- Smoke step uninstalls any existing *uprise* packages to prevent INSTALL_FAILED_UPDATE_INCOMPATIBLE.
- Auto-detect launchable activity via aapt when available; fallback to com.app.uprise/.MainActivity.
- Artifacts: smoke-logcat.txt, dumpsys.txt, pm-packages.txt.
- Guardrails honored: JDK 17 for sdkmanager; JDK 11 for Gradle/AGP 7.0.x; npm --legacy-peer-deps; no elevation.
