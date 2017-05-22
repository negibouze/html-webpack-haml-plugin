// Webpack require:
var partial = require('html-loader!./partial.haml');
var universal = require('./universial.js');

// Export a function / promise / or a string:
module.exports = '!!! 5\n\
%html{ :lang => "en" }\n\
  %body\n\
    ' + universal() + new Date().toISOString() + '\n' + partial;