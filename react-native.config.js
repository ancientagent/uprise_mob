module.exports = {
  project: {
    ios: {},
    android: {}, // grouped into "project"
  },
  assets: ['./assets/fonts/'], // stays the same
  dependencies: {
    'react-native-video': {
      platforms: {
        android: null, // Disable autolinking for Android
      },
    },
    'react-native-track-player': {
      platforms: {
        android: null, // Disable autolinking for Android temporarily
      },
    },
  },
};
