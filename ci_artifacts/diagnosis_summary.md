# CI Failure Diagnosis: Runs #205 and #206

## Summary
Both runs failed at the **Build Debug & Release APKs** job during SDK setup, preventing the smoke test from running.

### Root Cause: JDK Version Mismatch
**Issue**: `android-actions/setup-android@v3` now requires JDK 17+, but workflow was setting JDK 11 before SDK setup.

**Error Message**:
```
This tool requires JDK 17 or later. Your version was detected as 11.0.28.
To override this check, set SKIP_JDK_VERSION_CHECK.
Error: The process '/usr/local/lib/android/sdk/cmdline-tools/16.0/bin/sdkmanager' failed with exit code 1
```

### Run Details

#### Run #205 (ci/hvf-smoke-ttjs)
- **URL**: https://github.com/ancientagent/uprise_mob/actions/runs/17419491774
- **Branch**: ci/hvf-smoke-ttjs  
- **Conclusion**: failure
- **Failing Job**: Build Debug & Release APKs
- **Smoke Test**: skipped (dependent job failed)
- **Artifacts**: No smoke artifacts (build failed)

#### Run #206 (docs/local-build-linkbacks) 
- **URL**: https://github.com/ancientagent/uprise_mob/actions/runs/17421027906
- **Branch**: docs/local-build-linkbacks
- **Conclusion**: failure  
- **Failing Job**: Build Debug & Release APKs
- **Smoke Test**: skipped (dependent job failed)
- **Artifacts**: No smoke artifacts (build failed)

### Fix Applied
1. **JDK Sequencing**: Setup JDK 17 → Android SDK → Switch to JDK 11 for Gradle
2. **Emulator Improvements**: 
   - Extended boot timeout to 420s
   - Added retry logic for failed boots
   - Cold boot configuration with 2GB RAM
   - Enhanced emulator flags for stability

### Files Changed
- `.github/workflows/android-debug-build.yml`: JDK setup sequence and emulator reliability improvements