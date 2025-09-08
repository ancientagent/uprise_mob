# APK Smoke Test Plan

## APK Details
- **File**: app-debug.apk
- **Size**: 50.3 MB
- **Build**: Debug configuration
- **Package**: com.app.uprise

## Smoke Test Commands (for local testing)
```bash
# 1. Start Android emulator (API 31)
emulator -avd API_31_Emulator -no-snapshot-load

# 2. Install APK
adb install -r app-debug.apk

# 3. Launch app
adb shell monkey -p com.app.uprise -c android.intent.category.LAUNCHER 1

# 4. Capture logs
adb logcat -v time -d | tee first-launch.log

# 5. Check for crashes
adb logcat -b crash -d
```

## Expected Results
- App launches without crashes
- Onboarding or home screen appears
- No critical errors in logcat
- Hermes engine initializes properly
- React Native bridge connects

## Notes
- APK successfully built with disabled modules excluded (track-player, jitsi-meet, lottie)
- Using React Native 0.66.4 with Hermes enabled
- Debug signing configuration active