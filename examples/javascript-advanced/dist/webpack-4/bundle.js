!function(e){var n={};function r(t){if(n[t])return n[t].exports;var o=n[t]={i:t,l:!1,exports:{}};return e[t].call(o.exports,o,o.exports,r),o.l=!0,o.exports}r.m=e,r.c=n,r.d=function(e,n,t){r.o(e,n)||Object.defineProperty(e,n,{configurable:!1,enumerable:!0,get:t})},r.r=function(e){Object.defineProperty(e,"__esModule",{value:!0})},r.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(n,"a",n),n},r.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},r.p="",r(r.s=1)}([function(module,exports,__webpack_require__){"use strict";eval("// This file is used for frontend and backend\n\n\n// If compiled by the html-webpack-plugin\n// HTML_WEBPACK_PLUGIN is set to true:\nvar backend = typeof HTML_WEBPACK_PLUGIN !== 'undefined';\n\nmodule.exports = function () {\n  return 'Hello World from ' + (backend ? 'backend' : 'frontend');\n};\n\n\n//# sourceURL=webpack:///./universial.js?")},function(module,exports,__webpack_require__){eval("__webpack_require__(6);\n\nvar universal = __webpack_require__(0);\nvar h1 = document.createElement('h1');\nh1.innerHTML = universal();\n\ndocument.body.appendChild(h1);\n\n\n//# sourceURL=webpack:///./example.js?")},,,,,function(module,exports){eval("// removed by extract-text-webpack-plugin\n\n//# sourceURL=webpack:///./main.css?")}]);