/* eslint-env node */

const reactNativePreset = require('@react-native/jest-preset');

module.exports = {
  ...reactNativePreset,
  preset: 'react-native',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFiles: ['./jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native'
      + '|@react-native'
      + '|@react-navigation'
      + '|@react-native-google-signin'
      + '|@react-native-firebase'
      + ')/)',
  ],
};
