module.exports = {
  "stories": [
    "../stories/**/*.stories.mdx",
    "../stories/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials"
  ],

  webpackFinal: async (config, { configType }) => {
    config.devtool = 'inline-source-map';

    config.module.rules = config.module.rules.filter((f) => {
      return f.test.toString().match(/png/ig) === null
    });

    config.module.rules.push({
      test: [/\.png$/, /\.aomesh$/],
      loaders: ['arraybuffer-loader'],
      enforce: 'pre',
    });

    return config;
  }

}
