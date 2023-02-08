const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./server.common.js');

module.exports = merge(common, {
  mode: 'development',
  watch: true,
  devtool: 'eval-source-map',
  cache: false,
});
