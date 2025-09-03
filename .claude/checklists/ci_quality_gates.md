# CI Quality Gates Checklist

Use this checklist to verify all quality gates are functioning in the CI pipeline.

## Build-Level Gates
- [ ] **Debug APK Generated**: `app-debug.apk` created and under 120MB (soft threshold)
- [ ] **Release APK Generated**: `app-release.apk` created and under 80MB (soft threshold)
- [ ] **Release Signing Verified**: `apksigner verify --print-certs` passes for release APK
- [ ] **SDK Sanity Check**: `minSdkVersion` and `targetSdkVersion` extracted from manifest
- [ ] **Build-Tools Available**: `aapt` and `apksigner` accessible (auto-install if missing)

## Smoke Test Gates (When Emulator Works)
- [ ] **Package Detection**: Dynamic package name extraction via `aapt dump badging`
- [ ] **Activity Resolution**: Launchable activity resolved via `cmd package resolve-activity`
- [ ] **App Installation**: Debug APK installs successfully on emulator
- [ ] **App Launch**: Main activity launches and PID tracked
- [ ] **ReactNativeJS Detection**: "ReactNativeJS" appears in logcat within 90s
- [ ] **Activity Focus**: Main activity has window focus via `dumpsys window`
- [ ] **TTJS Captured**: Time-to-first-ReactNativeJS measured and logged

## Forensics & Artifacts
- [ ] **Deep Diagnostics**: logcat, device props, dumpsys (activity/window/package)
- [ ] **Crash Collection**: ANR and tombstone files collected from `/data/`
- [ ] **Bugreport**: Complete Android bugreport.zip generated
- [ ] **Artifact Upload**: `smoke-logs` artifact uploaded with all diagnostics
- [ ] **Retention**: Artifacts retained for 14 days for historical analysis

## Step Summary (Human-Readable)
- [ ] **ReactNativeJS Status**: ✅/❌ indicator with clear messaging  
- [ ] **TTJS Performance**: "TTJS (launch → first ReactNativeJS): **[X]s**"
- [ ] **APK Metadata**: Package name, version, and sizes displayed
- [ ] **Notable Signals**: Key errors/exceptions highlighted automatically
- [ ] **Artifact Links**: Links to downloadable `smoke-logs` for forensics

## Guardrails (Config Protection)
- [ ] **API Level Lock**: Emulator must use API 30 (validated automatically)
- [ ] **Flag Verification**: Required emulator flags present in workflow
- [ ] **Architecture Check**: x86_64 architecture confirmed
- [ ] **Profile Validation**: pixel_5 profile locked in place

## Success Criteria
**Green Status**: All checkboxes checked, no regressions
**Partial Success**: Build gates pass, smoke gates may fail on emulator issues  
**Red Status**: Build gates fail or critical regressions detected

## Notes
- Emulator boot timeouts are known issues - focus on build-level gates first
- TTJS and smoke gates depend on emulator stability improvements
- Prioritize fixing config drift before adding new features