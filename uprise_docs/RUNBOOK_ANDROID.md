# UPRISE Android Build & CI Runbook

## Overview
This document provides step-by-step instructions for building, testing, and deploying the UPRISE Android application.

## Prerequisites

### System Requirements
- **OS**: Windows 10/11
- **JDK**: OpenJDK 11 (Temurin) - `C:\Program Files\Eclipse Adoptium\jdk-11.0.28.6-hotspot`
- **Node.js**: 20.19.0 - `C:\tools\node-v20.19.0-win-x64`
- **Android SDK**: Located at `$env:LOCALAPPDATA\Android\Sdk`
- **Package Manager**: Yarn (yarn.lock must be committed)

### Environment Variables
```powershell
# Add to system PATH

## Windows preflight helper

Run the local Android preflight to prepare Node/Yarn, adjust env, soft-build the APK if possible, and wire ADB/Metro:

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File .\scripts\runbook-android-preflight.ps1
```

Outputs:
- artifacts/yarn_install.log, artifacts/gradle_build_full.log
- artifacts/net_boot.txt, artifacts/backend_health_win.txt (when available)
- docs/runbook_android.md and docs/CHANGELOG.md with a line per run

$env:PATH += ";C:\tools\node-v20.19.0-win-x64"
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-11.0.28.6-hotspot"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"

# Metro compatibility
$env:NODE_OPTIONS = "--openssl-legacy-provider"
```

## Build Configuration

### Version Matrix (RN 0.66.x Baseline)
- **React Native**: 0.66.4
- **Gradle**: 7.0.2
- **Android Gradle Plugin**: 7.0.4
- **Kotlin**: 1.5.31
- **compileSdkVersion**: 31
- **targetSdkVersion**: 31
- **minSdkVersion**: 21

### Key Properties
```properties
# android/gradle.properties
android.useAndroidX=true
android.enableJetifier=true
HermesEnabled=true
```

## Build Process

### 1. Clean Build
```powershell
cd android
.\gradlew.bat clean assembleDebug
```

### 2. Install Debug APK
```powershell
.\gradlew.bat installDebug
```

### 3. Start Metro
```powershell
cd ..
yarn start
# or with legacy OpenSSL support
$env:NODE_OPTIONS="--openssl-legacy-provider"; yarn start
```

### 4. Launch App
```powershell
# Forward Metro port
adb reverse tcp:8081 tcp:8081

# Launch app
adb shell monkey -p com.app.uprise.dev -c android.intent.category.LAUNCHER 1
```

## CI/CD Pipeline

### Workflow File
`.github/workflows/android-debug-build.yml`

### CI Steps
1. **Setup**: JDK 11 (Temurin), Android SDK, Node.js 18
2. **Dependencies**: `yarn install --frozen-lockfile`
3. **Build**: `./gradlew --no-daemon clean assembleDebug`
4. **Artifacts**: app-debug.apk, dependency reports, Gradle reports

### CI Prerequisites
- **sdkmanager must run under JDK 17**; Gradle remains on JDK 11 (RN 0.66.x). build-tools pinned to 31.0.0.
- **Android cmdline-tools pinned: r8 (8092744)** to ensure SDK XML v2 for AGP 7.0.x.

### CI Environment
- **Runner**: ubuntu-latest
- **JDK**: Temurin 11
- **Android SDK**: Latest via android-actions/setup-android@v3
- **Metro Compatibility**: NODE_OPTIONS=--openssl-legacy-provider

## Troubleshooting

### Common Issues

#### 1. Metro Port Conflicts
```powershell
# Kill existing Metro processes
Get-Process -Name "node" | Stop-Process -Force

# Start on alternative port
$env:NODE_OPTIONS="--openssl-legacy-provider"
yarn start --port 8082
adb reverse tcp:8082 tcp:8082
```

#### 2. Build Failures
```powershell
# Clean and rebuild
cd android
.\gradlew.bat clean
.\gradlew.bat assembleDebug --stacktrace
```

#### 3. Track-Player Issues
Track-player is temporarily disabled with TEMP DISABLE markers. To re-enable:
1. Uncomment track-player imports in service.js, index.js, App.js
2. Add fallback implementations for useProgress() and playbackState
3. Test thoroughly before re-enabling

### Debug Commands
```powershell
# Check device connection
adb devices

# View logs
adb logcat

# Check app status
adb shell dumpsys activity activities | findstr "uprise"

# Verify Metro connection
adb shell curl http://localhost:8081/status
```

## Security & Compliance

### Firebase Credentials
- **Location**: `android/app/src/**/google-services.json`
- **Git Status**: Excluded via .gitignore
- **CI**: Use secrets for production builds

### Keystores
- **Debug**: Automatically generated
- **Release**: Use secure keystore management
- **Git Status**: Excluded via .gitignore

### Package Manager
- **Primary**: Yarn (yarn.lock committed)
- **Prohibited**: package-lock.json (deleted if present)

## Monitoring & Maintenance

### Build Health Checks
- [ ] APK generates successfully (target: ~47MB)
- [ ] Hermes enabled in logs
- [ ] Metro bundle loads without errors
- [ ] No track-player crashes
- [ ] Firebase services operational

### Regular Maintenance
- [ ] Update dependencies monthly
- [ ] Verify CI pipeline weekly
- [ ] Test build process on clean environment
- [ ] Monitor APK size changes
- [ ] Review security exclusions

## Emergency Procedures

### Critical Build Failure
1. Revert to last working commit
2. Check dependency conflicts
3. Verify environment setup
4. Test on clean environment
5. Document root cause

### Metro Issues
1. Kill all Node processes
2. Clear Metro cache: `yarn start --reset-cache`
3. Use alternative port if needed
4. Check firewall/antivirus settings

### Track-Player Re-enable
1. Ensure all fallbacks implemented
2. Test on multiple devices
3. Monitor crash reports
4. Gradual rollout with feature flags

## Local Smoke Testing

### CI Smoke Test Summary
- **Latest Run**: 17355198212 (PR #14) - TTJS: 4.2s, Debug APK: 53.9MB, Release APK: 42.2MB

### Local Smoke (PowerShell)
1) Ensure SDK tools on PATH for the session:
   - %UserProfile%\AppData\Local\Android\Sdk\platform-tools
   - %UserProfile%\AppData\Local\Android\Sdk\cmdline-tools\latest\bin
2) Build: `./gradlew --no-daemon clean :app:assembleDebug`
3) Boot emulator; wait for `sys.boot_completed=1` in a loop.
4) Clean uninstall: `adb shell pm list packages | findstr /i uprise` → `adb uninstall <pkg>`
5) Install: `adb install -r app\build\outputs\apk\debug\app-debug.apk`
6) Launch: detect component via `aapt dump badging` (fallback `com.app.uprise/.MainActivity`)
7) Confirm in logcat: look for `ActivityTaskManager: Displayed <component>`
[2025-09-02 19:36] Android RUNBOOK update:
- macOS HVF smoke test parameters:
  - AVD: API 30; google_apis; x86_64; profile=pixel_5
  - Flags: -no-snapshot -no-snapshot-save -no-window -no-audio -no-boot-anim -gpu swiftshader_indirect -memory 1024 -netfast -no-metrics
  - ADB hygiene: portable loops (no GNU timeout), 120s emulator appearance, 5 recovery attempts
  - Boot wait: portable 6-minute timeout with early exit
  - TTJS collection: logcat watch for 'ReactNativeJS', environment variable extraction
  - Artifacts: ids (RUN_ID.txt, RUN_URL.txt), summary (summary.json), smoke-logs, APKs

[2025-09-04] macOS smoke test update:
- **Background emulator**: Runs in background with PID tracking, no snapshots
- **Dynamic APP_ID**: Detects package name from built debug APK using aapt/apkanalyzer
- **Unified flow**: Same uninstall/install/launch sequence as Ubuntu smoke test
- **ADB restart**: Kills and restarts ADB server before emulator operations
- **summary.json**: Includes app_id, boot_ok, ttjs_s (null), debug/release APK sizes, run_id, run_url

## Smoke Test (CI) – Debug & Release Parity (2025-09-04)

### Unified CI Flow
The CI pipeline now builds and tests both debug and release APK variants with complete parity:

**Build Process**:
- **Debug APK**: Built with `assembleDebug` (Metro prebundled)
- **Release APK**: Built with `assembleRelease` (optimized, signed)
- **Parallel Builds**: Both variants built simultaneously for efficiency

**Emulator Configuration**:
- **API Level**: 31 (Android 12)
- **Architecture**: x86_64 with google_apis
- **Ports**: 5554 (console), 5555 (adb)
- **Resources**: 2 CPU cores, 2GB RAM
- **Acceleration**: Off (Ubuntu), HVF optional (macOS)

**APP_ID Detection**:
- **Primary Method**: `aapt dump badging <apk>` extracts package name
- **Fallback**: `apkanalyzer manifest application-id <apk>`
- **Dynamic Resolution**: No hardcoded package names

**Pre-Installation Cleanup**:
- **Base Package**: Uninstalls `com.app.uprise` (release variant)
- **Debug Package**: Uninstalls `com.app.uprise.dev` (debug variant)
- **Clean State**: Ensures no package conflicts before installation

**Installation Process**:
- **3-Attempt Strategy**: `adb install -r -t` with retry logic
- **Error Handling**: Captures and logs installation failures
- **Verification**: Confirms successful installation before launch

**Launcher Resolution**:
- **Primary Method**: `adb shell cmd package resolve-activity <package> -c LAUNCHER`
- **Fallback**: `monkey -p <package> -c android.intent.category.LAUNCHER 1`
- **Activity Detection**: Dynamically finds launchable activity

**Launch Process**:
- **Both Variants**: Launches debug and release APKs
- **Verification**: Confirms app startup and ReactNativeJS initialization
- **Performance**: Measures Time-to-JavaScript (TTJS) metrics

**Artifact Collection**:
- **Logcat**: Complete system and app logs
- **Dumpsys**: Package and activity manager state
- **Process Info**: App PID and memory usage
- **Summary**: JSON file with test results and metrics

### Troubleshooting

| Issue | Root Cause | Solution |
|-------|------------|----------|
| `INSTALL_FAILED_ALREADY_EXISTS` | Package collision | Pre-uninstall both base and .debug variants |
| `INSTALL_FAILED_INSUFFICIENT_STORAGE` | Emulator storage full | Clean emulator data, increase storage |
| `INSTALL_FAILED_INVALID_APK` | Corrupted APK | Rebuild APK, check build logs |
| `INSTALL_FAILED_NO_MATCHING_ABIS` | Architecture mismatch | Use x86_64 emulator for x86_64 APK |
| No launcher component | Missing LAUNCHER intent | Check AndroidManifest.xml for MAIN/LAUNCHER |
| Package not found | Wrong APP_ID | Verify aapt dump badging output |
| Metro connection failed | Debug APK prebundled | Release APK requires Metro server running |

**Metro Note**: Debug APKs are prebundled and don't require Metro server. Release APKs may need Metro for development builds.

### Expected Artifacts

**APK Artifacts**:
- `app-debug-apk/`: Debug APK files
- `app-release-apk/`: Release APK files

**Smoke Test Outputs**:
- `artifacts/smoke/logcat.txt`: Complete system logs
- `artifacts/smoke/dumpsys-package.txt`: Package manager state
- `artifacts/smoke/dumpsys-activity.txt`: Activity manager state
- `artifacts/smoke/pid.txt`: App process information
- `artifacts/smoke/summary.json`: Test results and metrics

**Summary JSON Structure**:
```json
{
  "app_id": "com.app.uprise",
  "boot_ok": true,
  "ttjs_s": 4.2,
  "debug_apk_size": 53938883,
  "release_apk_size": 42156789,
  "run_id": "17355198212",
  "run_url": "https://github.com/.../actions/runs/17355198212"
}
```
