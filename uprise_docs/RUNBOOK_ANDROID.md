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
1. **Setup**: JDK 11 (Temurin), Android SDK, Node.js 18
2. **Dependencies**: `yarn install --frozen-lockfile`
3. **Build**: `./gradlew --no-daemon clean assembleDebug`
4. **Artifacts**: app-debug.apk, dependency reports, Gradle reports

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
