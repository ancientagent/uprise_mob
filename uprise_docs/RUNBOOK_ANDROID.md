# Android Build Runbook - Uprise Mobile App

## Prerequisites

### Java Development Kit (JDK) Requirements
- **React Native 0.66.x**: Use JDK 11
- **React Native 0.72.x+**: Use JDK 17

### Current Project Configuration
- **React Native Version**: 0.66.4
- **Required JDK**: OpenJDK 11.0.28 (Temurin)
- **JDK Path**: `C:\Program Files\Eclipse Adoptium\jdk-11.0.28.6-hotspot`

## Environment Setup

### 1. Set Java Environment (PowerShell)
```powershell
# Set JAVA_HOME for React Native 0.66.x
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-11.0.28.6-hotspot"

# Add Java to PATH
$env:Path = "$env:JAVA_HOME\bin;$env:Path"

# Verify Java version
java -version
```

**Expected Output**:
```
openjdk version "11.0.28" 2025-07-15
OpenJDK Runtime Environment Temurin-11.0.28+6 (build 11.0.28+6)
OpenJDK 64-Bit Server VM Temurin-11.0.28+6 (build 11.0.28+6, mixed mode)
```

### 2. Set Node.js Path (if not in system PATH)
```powershell
# Add Node.js to PATH for React Native CLI
$env:Path = "C:\tools\node-v20.19.0-win-x64;$env:Path"

# Verify Node.js
node --version
```

## Build Commands

### Clean Build
```powershell
cd android
.\gradlew --stop
.\gradlew clean --no-daemon
```

### Debug APK Build
```powershell
cd android
.\gradlew assembleDebug --no-daemon --stacktrace
```

### Full Build with Clean
```powershell
cd android
.\gradlew --stop
.\gradlew clean --no-daemon
.\gradlew assembleDebug --no-daemon --stacktrace
```

## Troubleshooting

### Common Issues

#### 1. Java Version Mismatch
**Symptoms**: Build fails with Java compatibility errors
**Solution**: Ensure correct JDK is set for React Native version
```powershell
# For RN 0.66.x
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-11.0.28.6-hotspot"

# For RN 0.72.x+
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-17.0.16.8-hotspot"
```

#### 2. Node.js Not Found
**Symptoms**: `Cannot run program "node"` error during build
**Solution**: Add Node.js to PATH or update gradle.properties
```properties
# In android/gradle.properties
nodeExecutableAndArgs=C:\\tools\\node-v20.19.0-win-x64\\node.exe
```

#### 3. Gradle Daemon Issues
**Symptoms**: Build hangs or fails with daemon errors
**Solution**: Stop and restart Gradle daemon
```powershell
.\gradlew --stop
# Wait a few seconds, then retry build
```

### Build Status Check
```powershell
# Check if build is successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "Build SUCCESSFUL" -ForegroundColor Green
} else {
    Write-Host "Build FAILED" -ForegroundColor Red
}
```

## Module Integration

### ScalableVideoView Module
- **Location**: `android/external/scalableviewer/`
- **Status**: Successfully integrated as local Gradle module
- **Dependencies**: Automatically included in app build

### React Native Video
- **Status**: Temporarily disabled during ScalableVideoView integration
- **Re-enable**: After confirming successful APK build

## File Locations

### Key Configuration Files
- **Project Root**: `D:\uprise_mob\`
- **Android Build**: `D:\uprise_mob\android\`
- **Gradle Properties**: `android/gradle.properties`
- **App Build**: `android/app/build.gradle`
- **Settings**: `android/settings.gradle`

### Generated Files
- **Debug APK**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Build Logs**: Check console output for detailed error messages

## Performance Tips

### Gradle Optimization
```properties
# In android/gradle.properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m
org.gradle.parallel=true
org.gradle.caching=true
```

### Build Variants
- **Debug**: Faster build, includes debugging symbols
- **Release**: Optimized build, smaller APK size

## Support

### Logs and Debugging
- Use `--stacktrace` flag for detailed error information
- Check `BUILD_LOG.md` for current build status
- Review console output for specific error messages

### Version Compatibility
- **Gradle**: 7.0.2
- **Android Gradle Plugin**: 4.2.2
- **Compile SDK**: 30
- **Target SDK**: 30
- **Min SDK**: 21

