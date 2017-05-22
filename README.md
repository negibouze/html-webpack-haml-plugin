Haml extension for the HTML Webpack Plugin
========================================

Installation
------------
Install the plugin with npm:

```shell
$ npm install --save-dev html-webpack-haml-plugin
```

Install the plugin with yarn:

```shell
$ yarn add --dev html-webpack-haml-plugin
```

Usage
-----
Require the plugin in your webpack config:

```javascript
var HtmlWebpackHamlPlugin = require('html-webpack-haml-plugin');
```

ES2015

```es2015
import HtmlWebpackHamlPlugin from 'html-webpack-haml-plugin';
```

Add the plugin to your webpack config as follows:

```javascript
// Please specify filetype 'haml' or filename '*.haml'.
plugins: [
  new HtmlWebpackPlugin({
    filetype: 'haml'
  }),
  new HtmlWebpackPlugin({
    filename: 'output.haml'
  }),
  new HtmlWebpackHamlPlugin()
]  
```

Even if you generate multiple files make sure that you add the HtmlWebpackHamlPlugin **only once**:

```javascript
plugins: [
  new HtmlWebpackPlugin({
    template: 'src/views/test.haml',
    filetype: 'haml'
  }),
  new HtmlWebpackPlugin({
    template: 'src/views/test.haml',
    filename: 'test.haml'
  }),
  new HtmlWebpackHamlPlugin()
]  
```

Output Example
--------------

```haml
!!! 5
%html
  %head
    %meta{ :charset => "utf-8" }
    %link{ :href => "bundle.css", :rel => "stylesheet"}
  %body
    %script{ :src => "bundle.js" }
```

If you are interested, look at examples.

License
-------

This project is licensed under [MIT](https://github.com/negibouze/html-webpack-haml-plugin/blob/master/LICENSE).
