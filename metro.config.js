const { getDefaultConfig } = require('metro-config');

module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts },
  } = await getDefaultConfig();
  return {
    transformer: {
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: false,
        },
      }),
      babelTransformerPath: require.resolve('react-native-svg-transformer'),
    },
    resolver: {
      assetExts: assetExts.filter(ext => ext !== 'svg'),
      sourceExts: [...sourceExts, 'svg', 'ts',
        'tsx',
        'js'],
    },
  };
})();

// NOTE: alias react-native-video to stub for CI
// Add under resolver.extraNodeModules: {'react-native-video': path.resolve(__dirname, 'stubs/react-native-video.js')}

