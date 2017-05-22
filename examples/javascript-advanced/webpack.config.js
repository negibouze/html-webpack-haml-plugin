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
    loaders: [
      { test: /\.css$/, loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader' }) },
      { test: /\.png$/, loader: 'file-loader?name=[name].[ext]' },
      { test: /\.html$/, loader: 'html-loader' }
    ]
  },
  devtool: 'eval',
  plugins: [
    new ExtractTextPlugin('styles.css'),
    new HtmlWebpackPlugin({
      template: 'template-html.js'
    }),
    new HtmlWebpackPlugin({
      template: 'template-haml.js',
      filetype: 'haml'
    }),
    new HtmlWebpackHamlPlugin()
  ]
};
