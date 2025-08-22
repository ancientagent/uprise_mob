# ADR-0001: Avoid Symlinks, Use Gradle Modules for External Dependencies

## Status
**Accepted** - 2025-08-22

## Context

The Uprise Mobile App requires integration with the ScalableVideoView library, which was previously managed as a git submodule. During development, we encountered several challenges:

1. **Symlink Issues**: Previous attempts to use symlinks resulted in infinite nesting problems and build failures
2. **Build Reliability**: Symlinks can cause issues across different development environments and CI/CD pipelines
3. **Dependency Management**: Remote artifacts for ScalableVideoView are no longer available in public repositories
4. **Version Control**: Git submodules can complicate the development workflow and cause merge conflicts

## Decision

We will **vendor external libraries as local Gradle modules** instead of using symlinks or git submodules.

### Approach
1. **Local Integration**: Copy the library source code into the project structure
2. **Gradle Module**: Treat the vendored library as a proper Gradle subproject
3. **Version Control**: Include the vendored code in the main repository
4. **Build Integration**: Wire the module through standard Gradle dependency management

## Consequences

### Positive
- **Build Reliability**: Eliminates symlink-related build failures
- **Environment Consistency**: Works consistently across different development setups
- **Version Control**: Single source of truth for the library code
- **Dependency Resolution**: Gradle handles all dependency management automatically
- **CI/CD Compatibility**: No special handling required in automated build systems

### Negative
- **Repository Size**: Increases the main repository size
- **Maintenance**: Manual updates required when library versions change
- **Code Duplication**: Library code exists in multiple locations if not properly managed

### Neutral
- **Build Time**: Minimal impact on build performance
- **Development Workflow**: Standard Gradle development practices apply

## Implementation Details

### File Structure
```
android/
├── external/
│   └── scalableviewer/          # Vendored library module
│       ├── build.gradle         # Module build configuration
│       ├── src/                 # Library source code
│       └── AndroidManifest.xml # Module manifest
├── app/
│   └── build.gradle            # Main app with module dependency
└── settings.gradle             # Module inclusion
```

### Gradle Configuration
```gradle
// settings.gradle
include ':scalableviewer'
project(':scalableviewer').projectDir = new File(rootProject.projectDir, 'external/scalableviewer')

// app/build.gradle
dependencies {
    implementation project(':scalableviewer')
    // ... other dependencies
}
```

### Module Modernization
- Update compileSdk, minSdk, and targetSdk to match main app
- Replace legacy `compile` dependencies with `implementation`
- Remove unnecessary build artifacts and tasks
- Ensure AndroidX compatibility

## Alternatives Considered

### 1. Git Submodules
- **Pros**: Version control, easy updates
- **Cons**: Complex workflow, merge conflicts, CI/CD complications
- **Decision**: Rejected due to workflow complexity

### 2. Symlinks
- **Pros**: Minimal repository size, easy updates
- **Cons**: Infinite nesting issues, environment-specific problems
- **Decision**: Rejected due to reliability issues

### 3. Remote Artifacts
- **Pros**: Standard dependency management
- **Cons**: Artifacts no longer available, version control issues
- **Decision**: Rejected due to availability

### 4. Manual Copy (Current Approach)
- **Pros**: Reliable, simple, full control
- **Cons**: Repository size, manual maintenance
- **Decision**: Accepted as best balance of reliability and simplicity

## Future Considerations

### Library Updates
1. **Version Tracking**: Document the vendored library version in the module
2. **Update Process**: Establish a process for updating the vendored library
3. **Change Logging**: Track changes made to the vendored code

### Alternative Solutions
1. **Fork Management**: Consider maintaining a fork of the original library
2. **Package Publishing**: Evaluate publishing our own version of the library
3. **Modern Alternatives**: Research newer libraries that provide similar functionality

## References

- [Gradle Multi-Project Builds](https://docs.gradle.org/current/userguide/multi_project_builds.html)
- [Android Library Modules](https://developer.android.com/studio/projects/android-library)
- [React Native Android Integration](https://reactnative.dev/docs/integration-with-existing-apps)

## Related Decisions

- **ADR-0002**: React Native Video Integration Strategy (Future)
- **ADR-0003**: Android Build Configuration Management (Future)

---

**Approved By**: Development Team  
**Review Date**: 2025-08-22  
**Next Review**: 2026-01-22 (6 months)

