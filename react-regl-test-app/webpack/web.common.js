const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const Dotenv = require('dotenv-webpack');


module.exports = {
  entry: {
    react_example: ['./src/react_example.tsx'],
    deferred_example: ['./src/deferred_example.ts']
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: path.resolve(__dirname, '../tsconfig.json'),
          }
        }
      }
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
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

  plugins: [
    new CleanWebpackPlugin(),
    new Dotenv({
      path: path.resolve(__dirname, './.env'),
      systemvars: true,
    }),
    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve(__dirname, '../public/react_example.html'),
      chunks: ['react_example']
    }),

    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve(__dirname, '../public/deferred_example.html'),
      filename: "deferred_example.html",
      chunks: ['deferred_example']
    }),
  ],
};
