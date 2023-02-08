const path = require('path');
const autoprefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');


module.exports = {
  entry: {
    app:  ['./src/index.tsx'],
    play: ['./src/play.ts']
  },

  module: {
    noParse: /kiwi-schema.kiwi\.js/,
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options:{
            configFile: path.resolve(__dirname, '../web.tsconfig.json'),
          }
        }
      },

      // Kiwi Schemas
      // https://github.com/evanw/kiwi
      {
        test: /\.kiwi$/,
        exclude: /node_modules/,
        use: [
          'raw-loader',
        ]
      },

      // GLSL files
      {
        test: /\.(glsl|frag|vert)$/,
        exclude: /node_modules/,
        use: [
          'glslify-import-loader',
          'raw-loader',
          'glslify-loader',
        ]
      },

      {
        test: /\.(png|jpeg)$/,
        exclude: /node_modules/,
        use: [
          'arraybuffer-loader',
        ]
      },

      {
        test: /\.css$/i,
        include: [/react\-tabs\.css$/i],
        use: [
          "style-loader",
          {
            loader: "css-loader",
          }
        ]
      },

      {
        test: /\.css$/i,
        exclude: /node_modules/,
        use: [
          "style-loader",
          "@teamsupercell/typings-for-css-modules-loader",
          {
            loader: "css-loader",
            options: { modules: true }
          }
        ]
      },

    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
    fallback: {
      "util": require.resolve("util/"),
      'assert': require.resolve('assert/'),
      "stream": require.resolve("stream-browserify"),
      'process': require.resolve('process'),
      'zlib': require.resolve('browserify-zlib')
    },
  },

  output: {
    filename: '[name].bundle.js',
    chunkFilename: '[name].chunk.js',
    publicPath: '/',
    path: path.resolve(__dirname, '../build'),
  },

  plugins:[
    new CleanWebpackPlugin(),
    new Dotenv({
      path: path.resolve(__dirname, './.env'),
      systemvars: true,
    }),
    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve(__dirname, '../public/index.html'),
      chunks: ['app']
    }),
    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve(__dirname, '../public/play.html'),
      filename: "play.html",
      chunks: ['play']
    }),

    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process',
      "worker_threads": null,
      chunks: ['play']
    }),

  ],
};
