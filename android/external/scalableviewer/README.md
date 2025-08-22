# ScalableVideoView - Vendored Library Module

## Overview

This is a **vendored copy** of the Android ScalableVideoView library, integrated as a local Gradle module to avoid dependency conflicts and build issues.

**Original Source**: [Android-ScalableVideoView](https://github.com/yqritc/Android-ScalableVideoView)  
**Original Version**: 1.0.4  
**Vendored Date**: 2025-08-22  
**Integration Method**: Local Gradle module (no symlinks)

## Why Vendored?

1. **Build Reliability**: Eliminates symlink-related infinite nesting issues
2. **Dependency Resolution**: Remote artifacts are no longer available in public repositories
3. **Version Control**: Provides consistent behavior across all development environments
4. **CI/CD Compatibility**: No special handling required in automated build systems

## Module Configuration

- **Plugin**: `com.android.library`
- **Compile SDK**: 30
- **Min SDK**: 21
- **Target SDK**: 30
- **Dependencies**: androidx.appcompat:appcompat:1.3.1

## Integration

The module is automatically included in the main app build through:

```gradle
// android/settings.gradle
include ':scalableviewer'
project(':scalableviewer').projectDir = new File(rootProject.projectDir, 'external/scalableviewer')

// android/app/build.gradle
dependencies {
    implementation project(':scalableviewer')
}
```

## Updating the Library

### When to Update
- Security patches in the original library
- Bug fixes that affect functionality
- New features required by the app

### Update Process
1. **Backup Current**: Copy current module to a backup location
2. **Download New**: Get the latest version from the original repository
3. **Copy Library**: Replace the `library/` folder contents
4. **Update Config**: Modify `build.gradle` if needed (SDK versions, dependencies)
5. **Test Build**: Ensure the module builds successfully
6. **Update Docs**: Update this README with new version information

### Example Update Commands
```bash
# Backup current version
cp -r android/external/scalableviewer android/external/scalableviewer_backup_v1.0.4

# Copy new version (adjust paths as needed)
cp -r /path/to/new/Android-ScalableVideoView/library/* android/external/scalableviewer/

# Test build
cd android
./gradlew clean
./gradlew assembleDebug
```

## Modifications Made

The original library has been modified for integration:

- ✅ **SDK Versions**: Updated to match main app requirements
- ✅ **Dependencies**: Modernized to use androidx and implementation
- ✅ **Build Tasks**: Removed problematic Javadoc and publishing tasks
- ✅ **Artifacts**: Removed bintray and android-artifacts references

## File Structure

```
scalableviewer/
├── build.gradle              # Module build configuration
├── src/                      # Library source code
│   └── main/
│       ├── java/            # Java source files
│       ├── res/             # Resources
│       └── AndroidManifest.xml
└── README.md                # This file
```

## Dependencies

The module provides the following classes:
- `com.yqritc.scalablevideoview.ScalableVideoView`
- `com.yqritc.scalablevideoview.ScalableType`

## Build Status

- ✅ **Module Build**: Successfully builds as Android library
- ✅ **Integration**: Successfully integrated with main app
- ✅ **Dependencies**: No conflicts with other modules

## Notes

- This module is **not** a git submodule
- Changes to the module should be committed to the main repository
- The module is designed to be self-contained and portable
- No external dependencies beyond standard Android libraries

## Support

For issues related to:
- **Module Build**: Check the module's build.gradle and dependencies
- **Integration**: Verify settings.gradle and app/build.gradle configuration
- **Original Library**: Refer to the original repository documentation

---

**Last Updated**: 2025-08-22  
**Maintainer**: Development Team  
**Status**: Active Integration

