const { merge } = require('webpack-merge');
const TerserPlugin = require("terser-webpack-plugin");
const common = require('./web.common.js');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          ecma: undefined,
          parse: {},
          compress: {},
          mangle: false, // Note `mangle.properties` is `false` by default.
          module: false,
          // Deprecated
          output: null,
          format: null,
          toplevel: false,
          nameCache: null,
          ie8: false,
          keep_classnames: true,
          keep_fnames: false,
          safari10: false,
        },
      }),
    ],
  },
});
