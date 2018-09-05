module.exports = {
  module: {
    rules: [
      {
        test: /\.stories\.jsx?$/,
        loaders: [require.resolve('@storybook/addon-storysource/loader')],
        enforce: 'pre',
      },
    {
      test: /\.png$/,
      loaders: ['arraybuffer-loader'],
      enforce: 'pre',
    },
    ],
  },
};
