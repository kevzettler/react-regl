const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./web.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'eval-source-map',
  cache: false,
  devServer:{
    static: path.resolve(__dirname, '../public'),
    port: 3000,
    host: 'localhost',
    hot: true,
  },
});
