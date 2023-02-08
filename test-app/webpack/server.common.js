'use strict';
const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const nodeExternals = require('webpack-node-externals');
const Dotenv = require('dotenv-webpack');

module.exports = {
  target: "node",
  externals: [ nodeExternals() ],
  context: path.resolve(__dirname, "../src"),
  entry: './server.ts',

  resolve: {
    extensions: [ '.tsx', '.ts' , '.js'],
  },

  output: {
    path: path.resolve(__dirname, '../build'),
    filename: 'server.js'
  },

  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },

  module: {
    //https://github.com/webpack/webpack/issues/138#issuecomment-160638284
    noParse: /node_modules\/json-schema\/lib\/validate\.js/,

    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options:{
            configFile: path.resolve(__dirname, '../server.tsconfig.json'),
          }
        }
      },

      {
        test: /\.kiwi$/,
        exclude: /node_modules/,
        use: [
          'raw-loader',
        ]
      },

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

    ]
  },

  plugins: [
    new webpack.NormalModuleReplacementPlugin(
      /implementation\.browser$/,
      './implementation.worker_threads.ts'
    ),
    new Dotenv({
      path: path.resolve(__dirname, './.env'),
      systemvars: true,
    }),
    new webpack.BannerPlugin({
      banner: 'require("source-map-support").install();',
      raw: true,
      entryOnly: false
    }),
  ]
};
