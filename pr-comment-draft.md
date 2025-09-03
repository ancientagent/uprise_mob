## What changed

Fixed Android Debug Build CI failure caused by missing debug keystore file.

**Key fixes:**
- Added `debug.keystore` file for Android debug builds (resolves `:app:validateSigningDebug` task failure)
- Updated `.gitignore` to allow debug.keystore (safe for development, non-sensitive)
- Enhanced CI workflow with RN config artifact upload and detailed Gradle logging (`--stacktrace --info`)

## Why

The build was failing at the signing step with:
```
> Keystore file '/home/runner/work/uprise_mob/uprise_mob/android/app/debug.keystore' not found for signing config 'debug'.
```

This was **not** the originally suspected SDK dependency issue - `react-native-video` and `react-native-track-player` were already properly disabled via `react-native.config.js`.

## Next steps

After this PR is green:
- Plan a separate branch to bump to SDK/targetSdk 33+ and re-enable modern versions of video/audio libraries one-by-one
- Continue with track-player re-enablement as outlined in the CCPM framework tasks

---
*🤖 Generated with [Claude Code](https://claude.ai/code)*