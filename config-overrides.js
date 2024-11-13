const path = require('path');

module.exports = {
  webpack: function (config) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      stream: require.resolve('stream-browserify'),
      vm: require.resolve('vm-browserify'),
      process: require.resolve('process/browser'),
    };
    return config;
  },
};
