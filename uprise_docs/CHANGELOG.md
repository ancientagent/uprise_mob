# Uprise Mobile App - Changelog

## [Unreleased] - 2025-08-22

### Added
- **ScalableVideoView Module Integration**: Successfully integrated the Android ScalableVideoView library as a local Gradle module
  - Vendored from `android/scalable_backup/library/` to `android/external/scalableviewer/`
  - Updated build.gradle with modern Android configurations (compileSdk 30, minSdk 21, targetSdk 30)
  - Replaced legacy `compile` dependencies with `implementation`
  - Removed problematic Javadoc tasks and build artifacts
  - Wired as Gradle subproject in settings.gradle and app/build.gradle

### Changed
- **Build Configuration**: Updated Android build pipeline to use vendored ScalableVideoView instead of remote artifact
- **Dependency Management**: Temporarily disabled react-native-track-player autolinking to resolve ExoPlayer conflicts

### Technical Details
- **Module Location**: `android/external/scalableviewer/`
- **Build Status**: Module builds successfully, main app build fully working
- **APK Generation**: Debug APK generated successfully
- **Current Status**: All major blockers resolved, build pipeline stable

### Next Steps
1. Re-enable react-native-track-player with proper ExoPlayer version compatibility
2. Re-enable react-native-video when needed (ScalableVideoView module ready)
3. Continue development with stable Android build pipeline

### Files Modified
- `android/settings.gradle` - Added scalableviewer module
- `android/app/build.gradle` - Added scalableviewer dependency  
- `android/external/scalableviewer/build.gradle` - Modernized configuration
- `react-native.config.js` - Disabled react-native-track-player autolinking
- `android/app/debug.keystore` - Created debug keystore for APK signing

---

## Previous Entries
*No previous entries yet*
