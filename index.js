/**
 * @format
 */

import { AppRegistry } from 'react-native';
// TEMP DISABLE: track-player - Commented out to prevent startup crashes
// import TrackPlayer from 'react-native-track-player';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';

// Register background handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});

AppRegistry.registerComponent(appName, () => App);
// TEMP DISABLE: track-player - Commented out to prevent startup crashes
// eslint-disable-next-line global-require
// TrackPlayer.registerPlaybackService(() => require('./service'));
