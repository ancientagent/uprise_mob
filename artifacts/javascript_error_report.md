# JavaScript Error Report - Uprise Mobile App

## Error Summary
**Error Type:** `TypeError: Cannot read property 'source' of undefined`  
**JavaScript Engine:** Hermes  
**Timestamp:** Detected during Metro bundling and app startup  

## Error Details

### Metro Console Output
```
ERROR  TypeError: Cannot read property 'source' of undefined, js engine: hermes
```

### Context from Metro Logs
```
warn Package react-native-track-player has been ignored because it contains invalid configuration. Reason: Cannot find module 'react-native-track-player\package.json'
...
LOG  Firebase messaging disabled (no default app): No Firebase App '[DEFAULT]' has been created - call firebase.initializeApp()
LOG  Running "Uprise" with {"rootTag":1}
ERROR  TypeError: Cannot read property 'source' of undefined, js engine: hermes
LOG  redux-persist: no inbound state, skipping migration
LOG  FCM disabled (no default Firebase app)
```

## Analysis

### Root Cause
The error `Cannot read property 'source' of undefined` suggests that:
1. Some code is trying to access a `source` property on an undefined object
2. This is likely related to image assets, navigation, or component props
3. The error occurs after the app starts running but before the main UI loads

### Related Issues
1. **TrackPlayer Warning**: `react-native-track-player` package is missing or misconfigured
2. **Firebase Messaging**: Properly disabled as intended
3. **Redux Persist**: Working correctly (no migration needed)

### Potential Sources
This error commonly occurs in:
- Image components with undefined `source` prop
- Navigation components with undefined route/screen definitions
- Component props that expect an object with `source` property
- Asset loading issues

## Next Steps
1. **Identify the specific component** causing the error
2. **Check image imports** and asset references
3. **Review navigation configuration** for undefined routes
4. **Add error boundaries** to isolate the problematic component
5. **Check component props** for undefined values being passed to `source`

## Environment
- **Platform:** Android Emulator
- **React Native:** 0.66.x
- **Metro:** 0.66.2
- **JavaScript Engine:** Hermes
- **Build Type:** Debug
- **TrackPlayer:** Disabled
- **Firebase Messaging:** Disabled
