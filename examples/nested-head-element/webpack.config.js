var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var HtmlWebpackHamlPlugin = require('../..');
var webpackMajorVersion = require('webpack/package.json').version.split('.')[0];

module.exports = {
  entry: './example.js',
  output: {
    path: path.join(__dirname, 'dist/webpack-' + webpackMajorVersion),
    publicPath: '',
    filename: 'bundle.js'
  },
  module: {
    rules: [
      { test: /\.css$/, use: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader' }) },
      { test: /\.png$/, use: 'file-loader' }
    ]
  },
  plugins: [
    new ExtractTextPlugin('styles.css'),
    new HtmlWebpackPlugin({
      template: 'template.haml',
      filename: 'layout.haml',
      inject: 'head'
    }),
    new HtmlWebpackPlugin({
      template: 'template2.haml',
      filename: 'layout2.haml',
      inject: 'body'
    }),
    new HtmlWebpackPlugin({
      template: 'template2-tab.haml',
      filename: 'index-tab.haml'
    }),
    new HtmlWebpackHamlPlugin()
  ]
};
