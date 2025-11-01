module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './',
            '@components': './components',
            '@services': './services',
            '@utils': './utils',
            '@hooks': './hooks',
            '@types': './types',
            '@constants': './constants',
          },
        },
      ],
    ],
  };
};

