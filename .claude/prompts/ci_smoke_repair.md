# CI Smoke Test Repair - Proven API 30 Recipe

## Context
**Problem**: Android emulator boot timeouts in CI causing smoke test failures
**Solution**: Proven API 30 single-emulator configuration from successful runs

## Proven Configuration (DO NOT CHANGE)
**API Level**: 30 (Android 11) - more stable than API 31
**Architecture**: x86_64
**Profile**: pixel_5
**Target**: default (omitted)

**Emulator Flags** (EXACT):
```bash
-no-snapshot -noaudio -no-window -gpu swiftshader_indirect -accel off -camera-back none -qemu -m 2048
```

## Required CI Steps
1. **PulseAudio Libraries**: `sudo apt-get install -y libpulse0 pulseaudio`
2. **Emulator Boot**: Use flags above with timeout
3. **APK Install**: `adb install -r app-debug.apk`
4. **Dynamic Detection**: Extract package name with `aapt dump badging`
5. **Activity Resolution**: `adb shell cmd package resolve-activity`
6. **Launch**: `adb shell am start -n <detected_activity>`
7. **JS Assertion**: Wait up to 90s for "ReactNativeJS" in logcat
8. **Focus Assertion**: Verify main activity has window focus
9. **Forensics**: Collect logcat, bugreport, ANR/tombstones

## Guardrails (Automated Validation)
**Config Drift Protection**:
- API level must be 30
- Architecture must be x86_64
- Profile must be pixel_5
- Required flags must all be present

## Validation Commands
```bash
# Emulator replication (local testing)
$ANDROID_HOME/emulator/emulator -avd Pixel_5_API_30 \
  -no-snapshot -noaudio -no-window -gpu swiftshader_indirect \
  -accel off -camera-back none -qemu -m 2048

# ReactNativeJS detection (PowerShell)
$deadline = (Get-Date).AddSeconds(90)
do {
  $log = adb logcat -d | Select-String -SimpleMatch "ReactNativeJS"
  if ($log) { Write-Host "✅ ReactNativeJS detected"; exit 0 }
  Start-Sleep -Seconds 5
} while ((Get-Date) -lt $deadline)
```

## Anti-Pattern Warning
**DO NOT**:
- Use dual-attempt emulator logic (causes complexity/regressions)
- Change API level without strong technical reason
- Modify proven emulator flags without validation
- Skip guardrail checks

## Success Metrics
- Emulator boots within 10 minutes
- ReactNativeJS detected within 90 seconds of app launch
- Main activity has focus
- Comprehensive forensics collected
- Artifacts uploaded with 14-day retention