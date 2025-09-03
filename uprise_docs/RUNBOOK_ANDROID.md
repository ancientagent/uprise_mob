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
1. **Setup**: JDK 17 (for SDK), JDK 11 (for Gradle), Android SDK, Node.js 18
2. **Dependencies**: `npm install --legacy-peer-deps`
3. **Build**: `./gradlew :app:assembleDebug :app:assembleRelease`
4. **Smoke Test**: Android emulator with dual-attempt boot strategy
5. **Artifacts**: debug APK, release APK, smoke logs, run IDs

### CI Environment
- **Runner**: ubuntu-latest (ubuntu-22.04 for smoke test)
- **JDK**: Temurin 17 (SDK setup), Temurin 11 (Gradle build)
- **Android SDK**: API 31 with build-tools 31.0.0
- **Metro Compatibility**: `NODE_OPTIONS=--openssl-legacy-provider` (global env)

### CI Smoke Test
The smoke test job runs after successful APK build to validate app installation and launch.

**Emulator Configuration**:
- **API Level**: 31 (Android 12)
- **Architecture**: x86_64
- **Profile**: pixel_5
- **Target**: google_apis

**Dual-Attempt Boot Strategy**:
1. **Attempt 1** (optimized for speed):
   - GPU: `swiftshader_indirect`
   - Memory: 2GB
   - Features: animations disabled, no snapshot save
   - Timeout: 10 minutes

2. **Attempt 2** (conservative fallback):
   - GPU: `off`
   - Acceleration: `off`
   - Memory: 2GB
   - Features: no audio, no snapshot
   - Timeout: 10 minutes

**Artifacts Generated**:
- `smoke-logs`: logcat, dumpsys activity, dumpsys package
- Always uploaded even on emulator failure

**Local Emulator Replication**:
```bash
# Replicate CI emulator (fallback mode)
$ANDROID_HOME/emulator/emulator -avd Pixel_5_API_31 \
  -no-snapshot -noaudio -no-boot-anim -gpu off -accel off \
  -camera-back none -qemu -m 2048
```

**Switching to API 30** (if API 31 proves unstable):
```yaml
# In workflow file, change:
api-level: 31  # -> api-level: 30
packages: "platforms;android-31 ..."  # -> "platforms;android-30 ..."
```

### CI Smoke Test (Stable Path)
The smoke test uses a **proven, stable configuration** from successful Run #99.

**Stable Configuration (DO NOT CHANGE without strong reason)**:
- **API Level**: 30 (Android 11) - more stable than 31
- **Architecture**: x86_64 
- **Profile**: pixel_5
- **Target**: default (omitted, uses defaults)
- **Emulator Options**: `-no-snapshot -noaudio -no-window -gpu swiftshader_indirect -accel off -camera-back none -qemu -m 2048`

**Rationale**: 
- API 30 has proven reliability in CI environment
- Single emulator attempt keeps complexity low
- swiftshader_indirect provides good performance without requiring hardware acceleration
- Configuration validated by automated guardrails

**Process**:
1. Install PulseAudio libraries (prevents libpulse.so.0 errors)
2. Boot emulator with stable flags  
3. Ensure build-tools available (for aapt)
4. Install debug APK
5. **Dynamic Detection**: Extract package name (aapt/apkanalyzer) and resolve actual LAUNCHER activity
6. Launch detected activity using `cmd package resolve-activity`
7. **Assertions**: detects 'ReactNativeJS' within 90s; verifies main activity has focus
8. Collect deep diagnostics (full logcat, bugreport, dumpsys)

**Guardrails**:
Every CI run validates critical configuration hasn't drifted:
- API level must be 30
- Required emulator flags must be present
- Architecture and profile must match proven setup

**Changing Configuration**:
If changes are needed:
1. Document strong technical reason
2. Update guardrail checks in same PR
3. Test thoroughly before merging

**Reading Smoke Summary**:
1. **Check Job Summary First**: GitHub displays a "Smoke Summary" with key results:
   - ✅/❌ ReactNativeJS detection status
   - Notable log signals (FATAL EXCEPTIONs, ANRs, errors)
   - APK package name and version
2. **Download smoke-logs artifact** for full forensics if needed:
   - `logcat_reactnative.txt`: Quick ReactNative-only logs
   - `bugreport.zip`: Complete Android debugging bundle
   - ANR/tombstone files: Crash-specific diagnostics

**Local Emulator Replication**:
```bash
# Replicate CI emulator settings
$ANDROID_HOME/emulator/emulator -avd Pixel_5_API_30 \
  -no-snapshot -noaudio -no-window -gpu swiftshader_indirect \
  -accel off -camera-back none -qemu -m 2048
```

### CI Quality Gates
The CI pipeline includes automated quality gates to catch regressions early.

**APK Signing Verification**:
- Release APKs verified with `apksigner verify --print-certs`
- Ensures signing configuration is working correctly
- Critical for production deployments

**APK Size Guardrails**:
- **Debug APK**: Soft threshold at 120MB (warning above this size)
- **Release APK**: Soft threshold at 80MB (warning above this size)  
- Prevents unexpected binary bloat
- Size displayed in Step Summary for easy monitoring

**SDK Sanity Checks**:
- Extracts and validates `minSdkVersion` and `targetSdkVersion` from manifest
- Ensures build targets correct API levels
- Prevents unintentional SDK version drift

**TTJS Performance Metric**:
- **Time-to-first-ReactNativeJS**: Measures app launch to JS runtime initialization
- Baseline performance metric for detecting startup regressions
- Displayed in Step Summary as "TTJS (launch → first ReactNativeJS): **[X]s**"

**Quality Gate Locations**:
- Implemented in `.github/workflows/android-debug-build.yml`
- All gates run on both debug and release builds
- Results visible in job logs and Step Summary
- Artifacts retained for 14 days for historical analysis

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

## Local ↔ CI Parity

To ensure local builds match CI environment:

**Local Build Script**: See `scripts/local-build.ps1` for Windows-based local build automation that mirrors CI workflow steps, including artifact generation matching CI output shapes.

**CI Canonical Emulator Configuration**:
- **API Level**: 31 (Android 12)
- **Device**: Pixel 4
- **Acceleration**: HVF (Hardware Virtualization Framework) on macOS runners
- **Profile**: Default Google APIs system image

The local build script generates artifacts in the same structure as CI:
- `ci-artifacts/app-debug-apk/` - Debug APK output
- `ci-artifacts/app-release-apk/` - Release APK output  
- `ci-artifacts/smoke-logs/` - Smoke test logs and diagnostics

This ensures local development closely matches the CI pipeline behavior documented in PR [#10](https://github.com/ancientagent/uprise_mob/pull/10).
