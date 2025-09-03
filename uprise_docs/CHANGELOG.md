## 2025-09-03 - Documentation: Local Build Tools and CI Parity Linkbacks

### Cross-linked Local Tooling to CI Documentation
**PR**: [#10](https://github.com/ancientagent/uprise_mob/pull/10) - CI: macOS HVF emulator smoke test + TTJS + artifacts + ADB hygiene

**Updates**:
- **RUNBOOK_ANDROID.md**: Added "Local ↔ CI Parity" section documenting:
  - Local build script `scripts/local-build.ps1` for Windows development
  - CI canonical emulator configuration (API 31, Pixel 4, HVF)
  - Artifact structure matching between local and CI environments
- **Impact**: Ensures local development closely matches CI pipeline behavior
- **Artifacts**: Both local and CI generate same structure (app-debug-apk/, app-release-apk/, smoke-logs/)

---

## 2025-09-02 01:20 UTC - CI: Build-Tools Version Alignment Fix

### Fixed Smoke Test Run #194 Failure
**Issue**: Build job used `build-tools;31.0.0` while smoke test tried to install `build-tools;30.0.3`, causing "Broken pipe" sdkmanager failure.

**Fix**: Aligned smoke test to use same build-tools version as build job (31.0.0).

**Results**:
- **RUN_ID**: 17390326556
- **Build APKs**: ✅ Completed successfully in 8m56s  
- **Build-tools alignment**: ✅ "Ensure build-tools for apksigner/aapt" step now passes
- **Artifacts generated**: app-debug-apk, app-release-apk, build-metadata
- **Smoke test**: Running (emulator boot in progress)

**Files Changed**:
- `.github/workflows/android-debug-build.yml`: Line 445 updated from `build-tools;30.0.3` to `build-tools;31.0.0`
- `.github/workflows/android-debug-build.yml`: Line 447 updated path from `30.0.3` to `31.0.0`

**Key Learning**: Maintain consistent build-tools versions across all workflow jobs to prevent sdkmanager conflicts.

---

## 2025-09-01 11:45 UTC - CI: Smoke Job Moved to macOS HVF

### Emulator Runs on macOS-13 with Hardware Acceleration
**Change**: Build remains on Ubuntu (faster, stable); Smoke now runs on macOS-13 with HVF.

**Key Changes**:
- **Build Job**: Unchanged on `ubuntu-latest` (produces APKs)
- **Smoke Job**: Now runs on `macos-13` with HVF acceleration
- **API Level**: Kept at 30 with google_apis x86_64
- **Emulator Flags**: `-no-snapshot -noaudio -no-boot-anim -no-window -gpu swiftshader_indirect`
- **Removed**: Linux-specific `-accel off` workaround (HVF handles natively)
- **Timeout**: Reduced to 25 minutes total (HVF boots faster)

**Preserved Features**:
- Dynamic package & activity detection
- ReactNativeJS assertions with TTJS metric
- Activity focus validation
- ANR/tombstone collection
- Step Summary with all quality gates
- All artifacts: app-debug-apk, app-release-apk, smoke-logs

**Expected Impact**:
- Emulator boots within 2-3 minutes (vs 5-10 on Linux)
- More reliable ADB connections
- Native hardware acceleration on macOS
- Same comprehensive smoke assertions

---

## 2025-09-01 09:30 UTC - CI Emulator Boot Reliability Fix

### Robust Emulator Boot with Retry Logic
**Fix**: Implemented robust emulator boot strategy with watchdog and safe retry mechanism.

**Key Changes**:
- **SDK Preflight**: Ensures all required SDK components installed before boot
- **Enhanced Caching**: Added system-images to cache for consistency
- **Boot Watchdog**: Polls `sys.boot_completed`, `dev.bootcomplete`, `service.bootanim.exit`
- **Safe Retry**: If attempt 1 fails, kills emulator cleanly and retries with cooler GPU flags
- **Boot Forensics**: Always captures emulator version, adb devices, and boot logs
- **Config Guardrails**: Validates API 30, x86_64, pixel_5, and required flags

**Retry Strategy**:
- **Attempt 1**: Uses `-gpu swiftshader_indirect` (optimal performance)
- **Attempt 2**: Falls back to `-gpu off` (maximum compatibility)
- **Timeouts**: 15 min for attempt 1, 12 min for attempt 2
- **Cleanup**: Kills emulator process and ADB server between attempts

**Step Summary Enhancement**:
- Shows "Emulator Boot: ✅ success (attempt X) in **Ys**"
- On failure: "❌ failed to boot after 2 attempts"

**New Artifacts**:
- `emu-boot-logs`: Contains emulator version, adb devices, boot diagnostics
- Retained for 14 days for troubleshooting

**Expected Impact**:
- Reduced CI flakiness from emulator boot timeouts
- Clear visibility into boot success/failure patterns
- Faster recovery with targeted retry logic

---

## 2025-09-01 08:35 UTC - CI Validation Trigger

### Triggering CI Run to Validate Quality Gates
**Trigger**: Modified CHANGELOG.md to initiate CI run for comprehensive validation.

**Gates to Validate**:
- APK signing verification (release builds)
- Size guardrails (120MB debug, 80MB release)
- SDK sanity checks (minSdk/targetSdk extraction)
- TTJS performance metric (launch → first ReactNativeJS)
- Comprehensive smoke test with forensics

**Expected Results**:
- Step Summary showing TTJS timing
- APK sizes logged and compared to thresholds
- SDK versions extracted from manifest
- Artifacts: app-debug-apk, app-release-apk, smoke-logs
- 14-day retention for historical analysis

---

## 2025-09-01 08:30 UTC - Quality Gates: Signing • Size • SDK • TTJS Performance

### Comprehensive Quality Gates Added
**Addition**: Automated quality gates in CI pipeline to catch regressions early and provide baseline metrics.

**APK Signing Verification**:
- **Release APK Verification**: Uses `apksigner verify --print-certs` to validate signing integrity
- **Critical for Production**: Ensures release builds are properly signed before deployment
- **Early Detection**: Catches signing config issues in CI rather than production

**APK Size Guardrails**:
- **Debug Threshold**: 120MB soft limit with warning (prevents debug bloat)
- **Release Threshold**: 80MB soft limit with warning (production binary monitoring)
- **Size Tracking**: APK sizes displayed in Step Summary for easy monitoring
- **Historical Analysis**: 14-day artifact retention for size trend analysis

**SDK Sanity Checks**:
- **Dynamic Extraction**: Pulls `minSdkVersion` and `targetSdkVersion` from built APK manifest
- **Version Validation**: Ensures build targets expected API levels (prevents drift)
- **Build Verification**: Confirms SDK configuration matches project requirements

**TTJS Performance Baseline**:
- **Time-to-first-ReactNativeJS**: Measures app launch → JS runtime initialization
- **Performance Monitoring**: Baseline for detecting startup performance regressions  
- **Human-Readable**: Displayed as "TTJS (launch → first ReactNativeJS): **[X]s**" in Step Summary
- **Real-World Metric**: Captures actual user-perceived app startup time

**Build-Tools Reliability**:
- **Auto-Ensure**: Automatically installs build-tools 30.0.3 if `aapt`/`apksigner` missing
- **Tool Availability**: Prevents quality gate failures due to missing SDK components
- **CI Stability**: Robust toolchain setup for consistent builds

**Key Benefits**:
- **Early Detection**: Catches signing, size, SDK, and performance issues in CI
- **Baseline Metrics**: Establishes performance and size baselines for monitoring
- **Historical Tracking**: 14-day artifact retention for trend analysis
- **Zero Overhead**: Added to existing stable smoke test pipeline

---

## 2025-09-01 08:20 UTC - Robust Package + Activity Detection

### Bulletproof App Detection & Launch
**Addition**: Resilient package and launchable activity detection with multiple fallbacks.

**Robust Detection**:
- **Package Detection**: `aapt` preferred, `apkanalyzer` fallback, error if neither available
- **Activity Resolution**: Uses `adb shell cmd package resolve-activity` to find actual LAUNCHER activity
- **Smart Fallback**: Falls back to `PackageName/.MainActivity` if resolution fails
- **Build-tools Ensured**: Auto-installs build-tools 30.0.3 if `aapt` missing

**Key Benefits**:
- **No Hardcoded Assumptions**: Dynamically detects both package name and launch activity
- **Handles Activity Changes**: Won't break if app uses different main activity name
- **Multiple Tool Support**: Works with both `aapt` and `apkanalyzer` toolchains
- **Enhanced Step Summary**: Shows resolved package name and launch activity for debugging

**Step Summary Enhancements**:
- **Resolved Package**: Displays actual detected package name
- **Launch Activity**: Shows the activity that was used for app launch
- **APK Version**: Extracts and displays versionName from manifest

---

## 2025-09-01 08:00 UTC - Added Smoke Summary + ANR/Tombstone Collection

### Human-Friendly Smoke Results
**Addition**: GitHub Step Summary displays at-a-glance smoke test results and crash collection.

**Step Summary Features**:
- **✅/❌ ReactNativeJS Status**: Clear indicator if JS runtime initialized
- **Notable Log Signals**: Auto-highlights FATAL EXCEPTIONs, ANRs, ReactNative errors
- **APK Metadata**: Package name and version from build
- **Quick Access**: Links to full logs in smoke-logs artifact

**Enhanced Crash Detection**:
- **ANR Collection**: Pulls Application Not Responding traces from `/data/anr/`
- **Tombstone Collection**: Captures native crash dumps from `/data/tombstones/`
- **Directory Listings**: Catalogs available crash artifacts for investigation

**Key Benefits**:
- **No Log Hunting**: Critical info visible in job summary
- **Comprehensive Coverage**: ANRs, tombstones, and bugreport in one artifact
- **Zero Complexity**: Added to proven API 30 stable configuration

---

## 2025-09-01 07:50 UTC - Added JS Boot Assertions & Deep Forensics to Stable Config

### Enhanced Smoke Test Validation
**Addition**: Lightweight assertions and comprehensive diagnostics on proven API 30 configuration.

**New Assertions**:
- **ReactNativeJS Detection**: 90-second timeout validates JS runtime actually initialized
- **Main Activity Focus**: Verifies main activity has window focus using dumpsys
- **APK Metadata**: Logs app version and package details for diagnostics

**Deep Forensics Collection**:
- **logcat_full.txt**: Complete logcat history since boot
- **logcat_reactnative.txt**: Filtered ReactNative-only logs for quick analysis
- **System State**: getprop, settings (global/system), dumpsys (activity/window/package)
- **App Process**: PID tracking and ANR directory listing
- **bugreport.zip**: Full Android bugreport (~10-30MB) for comprehensive debugging

**Key Benefits**:
- Hard evidence JS runtime booted (not just install/launch)
- Always-upload forensics on success/failure
- Simple pipeline (no dual attempts, no extra branches)
- Maintains proven API 30 emulator stability

---

## 2025-09-01 07:35 UTC - Smoke Test Reverted to Proven Run #99 Config + Guardrails

### Reverted to Stable Emulator Configuration
**Problem**: Complex dual-attempt emulator logic caused regression from working Run #99 setup.

**Solution**: Restored proven working configuration from successful Run #99:
- **API Level 30** (more stable than 31)
- **Single emulator attempt** (not dual-attempt complexity)  
- **Proven flags**: `-no-snapshot -noaudio -no-window -gpu swiftshader_indirect -accel off`
- **Simple script**: wait for boot → install APK → launch app → collect diagnostics

**Guardrails Added**:
- **Config drift protection**: Automated check that validates critical emulator settings
- **AVD caching**: Speeds up subsequent runs with API 30 cache key
- **PulseAudio libraries**: Maintained for emulator compatibility

**Key Learning**: When something works (Run #99), investigate what changed rather than over-engineering new solutions.

**Guardrail checks**:
- API level must be 30
- Architecture must be x86_64 
- Profile must be pixel_5
- Required flags: -no-snapshot, -noaudio, -no-window, swiftshader_indirect, -accel off

---

## 2025-09-01 07:00 UTC - Smoke Test Assertions & Deep Forensics

### Enhanced Smoke Test Validation
**Addition**: Real assertions that JS runtime initialized and the app's main activity is alive.

**New Assertions**:
- **ReactNativeJS Detection**: 90-second timeout waiting for "ReactNativeJS" in logcat
- **Activity Focus Check**: Validates main activity is currently focused using dumpsys window
- **Enhanced Error Reporting**: Clear success/failure indicators with specific error messages

**Deep Forensics Collection**:
- **Device Properties**: Complete getprop output for hardware/OS analysis
- **System Settings**: Global and system settings for debugging environment issues  
- **Full Logcat**: Complete logcat history instead of just tail
- **Bugreport**: Full Android bugreport.zip (~10-30MB) for comprehensive debugging

**Soft-Fail Toggle**: 
- Manual workflow dispatch input `smoke_soft_fail` allows marking smoke test as neutral
- Preserves full log artifacts while avoiding PR blocking during known flaky periods
- Default: false (normal failure behavior)

**Local Helper**: Added `scripts/check-rn-js.ps1` for Windows developers to replicate RN JS detection locally.

---

## 2025-09-01 06:54 UTC - CI Emulator Boot Stabilization

### Robust Emulator Startup with Dual-Attempt Retry
**Problem**: Smoke tests consistently timing out due to emulator boot failures on GitHub Actions runners.

**Solution**: Replaced manual emulator startup with `reactivecircus/android-emulator-runner@v2` action featuring:
- **Attempt 1**: Optimized flags for speed (GPU swiftshader_indirect, 2GB RAM)
- **Attempt 2**: Conservative fallback flags (GPU off, accel off) for reliability
- **AVD Caching**: Speeds up subsequent runs by caching emulator system images
- **Guaranteed Logs**: Smoke logs always uploaded even on emulator failure

**Technical Details**:
- Global `NODE_OPTIONS=--openssl-legacy-provider` for Metro bundling compatibility
- 10-minute boot timeout per attempt (600s) with proper cleanup between attempts
- Enhanced APK handling with proper package name detection
- Always-run log capture: logcat, dumpsys activity, dumpsys package

**Repository Changes**:
- Updated `.github/workflows/android-debug-build.yml` with robust emulator handling
- Maintained existing build artifacts (debug + release APKs, IDs)
- Added AVD cache key for performance improvements

**Expected Outcome**: Smoke tests should boot emulator on first or second attempt and provide diagnostic logs on any failure.

---

## 2025-08-31 09:22 UTC - Android CI Pipeline Implementation

### Minimal CI Pipeline (JDK 11 + Gradle 7.0.2 + Android SDK 31)

**Environment Setup:**
- Java: JDK 11 for Gradle compatibility with RN 0.66.4 + AGP 7.0.4
- Android SDK: API 31, build-tools 31.0.0 (CI parity)
- Gradle: 7.0.2 (enforced for React Native 0.66 compatibility)
- Application ID: com.app.uprise (auto-detected)

**Workflow Implementation:**
1. **Build Job**: 
   - JDK 17 for Android SDK setup (command-line tools requirement)
   - Switch to JDK 11 for Gradle build
   - Build both debug and release APKs: `./gradlew :app:clean :app:assembleDebug :app:assembleRelease`
   - Upload artifacts: app-debug-apk, app-release-apk

2. **Smoke Test Job**:
   - API 31 emulator (google_apis, x86_64)
   - Install debug APK and launch MainActivity
   - Capture logs and diagnostics
   - Upload artifacts: smoke-logs, smoke-diags, ids

**Repository Changes:**
- Removed jcenter() from android/build.gradle, kept google() + mavenCentral()
- Updated google-services plugin to 4.3.15

**Artifacts Generated:**
- app-debug-apk: Debug APK files
- app-release-apk: Release APK files (unsigned)
- smoke-logs: launch.log, logcat.txt
- smoke-diags: dumpsys.txt, props.txt
- ids: RUN_ID.txt, JOB_ID.txt

**Commands Used:**
```bash
# Environment verification
java -version  # JDK 11.0.28+6 (confirmed)
./gradlew -v   # Gradle 7.0.2 (confirmed)

# NDK check (not required)
grep -R "ndkVersion" android  # No hits - NDK not needed

# Application ID detection  
grep -m1 "applicationId " android/app/build.gradle  # com.app.uprise

# Build testing (would require local SDK setup)
export JAVA_TOOL_OPTIONS=""
./gradlew :app:clean :app:assembleDebug :app:assembleRelease --no-daemon --stacktrace
```

## 2025-08-31 23:50 UTC - CI Build Validation & Workspace Cleanup

### CI Run Status
- **Run ID**: 17355198212 (feat/ccpm-framework branch)
- **Status**: Failed - Gradle build error during APK assembly
- **Job ID**: 49267133526 (Build APKs)
- **Application ID**: com.app.uprise (confirmed via build.gradle)

### Workspace Hygiene
- Added .gitignore entries for local Android SDK and temp outputs:
  - `/android-sdk/`, `/cmdline-tools/`, `/platform-tools/`
  - `/licenses/`, `/outputs/`
  - `android/local.properties`

### Next Steps
- Investigate Gradle build failure in CI (likely dependency resolution issue)
- Smoke test markers not available due to build failure
- Consider reverting to simpler build command or checking dependency versions

**Workflow Status:** In progress - fixing syntax issues
- Initial runs failed on JDK version mismatch (Android SDK tools require JDK 17+)
- Fixed by using JDK 17 for SDK setup, JDK 11 for Gradle
- Fixed Android SDK packages syntax (space-separated vs multiline YAML)

**Next Steps:** Monitor workflow completion and document final results

---

## 2025-08-26  CCPM pilot (Codespaces)

### Executed Commands and Outcomes

1. **PRD Parse**: Read `.claude/prds/android-reliability.md` containing Android build reliability and track-player re-enablement requirements
   - Status:  Successfully parsed

2. **Epic Creation**: Created Epic #1 from PRD
   - Title: "Epic: Android Build Reliability & Track-Player Re-enable"
   - Labels: `epic`, `priority:p1`
   - URL: https://github.com/ancientagent/uprise_mob/issues/1
   - Status:  Created

3. **Task Creation**: Created 5 child tasks linked to Epic #1
   - Task #2: CI: Confirm debug build artifacts on main (`priority:p0`)
   - Task #3: Re-enable Track-Player: Phase 1 (core service + minimal UI) (`priority:p1`)
   - Task #4: Add CI release job (assembleRelease) with artifact (`priority:p1`)
   - Task #5: Embed BuildConfig stamp (commit SHA/time) in app (`priority:p1`)
   - Task #6: Docs: finalize RUNBOOK for Metro + JDK11 pin; update CHANGELOG (`priority:p1`)
   - Status:  All tasks created

4. **Labels Created**:
   - `epic` (FFD700): High-level initiative
   - `task` (3CB371): Work item
   - `blocked` (FF0000): Blocked by dependency
   - `priority:p0` (8B0000): Immediate
   - `priority:p1` (CD5C5C): Soon

5. **Epic-Task Linkage**: Added checklist comment to Epic #1 with all task references
   - Status:  Linked

### Summary
Successfully executed CCPM pilot workflow in Codespaces using GitHub CLI. Created 1 epic and 5 tasks with proper labels and linkages.

---

## 2025-08-27 04:24 UTC - Android CI Debug Build Stabilization (Codespaces)

### Context
- **Branch**: feat/ccpm-framework
- **Workflow**: Android Debug Build 
- **Task**: CI fix + artifact retrieval for Android Debug Build
- **Initial Run**: 17257070069 (failed - SDK license issues)

### Issues Identified and Fixed

1. **SDK License Acceptance Failure** (Run 17257070069)
   - **Issue**: Interactive `yes` command timeout during license acceptance
   - **Fix**: Replaced interactive license acceptance with prewritten license files
   - **Commit**: 10cc1dc - "ci(android): fix SDK license acceptance with prewritten license files"

2. **Package Manager Cache Issue** (Run 17257135637)
   - **Issue**: Missing yarn.lock file, workflow used yarn with cache
   - **Fix**: Switched to npm install without caching
   - **Commit**: 1b1f2c1 - "ci(android): switch from yarn to npm install, remove cache"

3. **Dependency Conflict** (Run 17257153465)
   - **Issue**: npm peer dependency conflicts with react-native packages
   - **Fix**: Added --legacy-peer-deps flag to npm install
   - **Commit**: 087bc7c - "ci(android): use --legacy-peer-deps for npm install"

4. **Android SDK Path Conflict** (Run 17257165900, 17257212779)
   - **Issue**: System ANDROID_HOME conflicts with custom ANDROID_SDK_ROOT
   - **Fix**: Explicitly set ANDROID_HOME in gradle build step
   - **Commit**: e931ce9 - "ci(android): override ANDROID_HOME in build step"

### Final Status
- **Latest Run**: 17257212779 (failed at gradle build step)
- **Progress**: Successfully fixed SDK installation, npm install, and path conflicts
- **Remaining Issue**: react-native-video package compatibility (Gradle 7.0.2 + deprecated `provided()` method)

### Workflow Improvements Applied
- Manual cmdline-tools installation with prewritten license files
- Dual JDK setup (JDK 17 for sdkmanager, JDK 11 for Gradle)
- Proper Android SDK environment variable management
- Legacy npm dependency resolution for React Native 0.66.4

### Next Steps
- Address react-native-video compatibility or find alternative
- Complete build process to generate APK artifacts
- Test artifact download functionality

---

## 2025-08-28 20:50 UTC - Fixed Android Debug Build CI Keystore Issue

### Context
- **Branch**: feat/ccpm-framework
- **PR**: #7 
- **Failed Run**: 17307438532
- **Root Cause**: Missing debug.keystore file causing signing failure

### Issue Diagnosed
- **Failure Point**: :app:validateSigningDebug task
- **Error**: `Keystore file '/home/runner/work/uprise_mob/uprise_mob/android/app/debug.keystore' not found for signing config 'debug'`
- **Not a SDK dependency issue**: react-native-video and react-native-track-player were already properly disabled via react-native.config.js

### Fix Applied
1. **Generated debug.keystore**: Created standard Android debug keystore using keytool
   - Location: `android/app/debug.keystore`
   - Keystore password: `android`
   - Key alias: `androiddebugkey`
   - Key password: `android`
   - Validity: 10,000 days

2. **Enhanced CI workflow**: Added RN config artifact and improved logging
   - Added RN config upload artifact for forensics
   - Enhanced Gradle build with --stacktrace --info flags

### Files Modified
- `android/app/debug.keystore` (generated)
- `.github/workflows/android-debug-build.yml` (enhanced)

### Status
- Ready for CI testing
- Build should now pass :app:validateSigningDebug task
- All SDK 31 compatibility already maintained