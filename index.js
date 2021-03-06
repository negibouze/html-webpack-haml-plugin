'use strict';

var assert = require('assert');

function HtmlWebpackHamlPlugin (options) {
  assert.equal(options, undefined, 'The HtmlWebpackHamlPlugin does not accept any options');
}

HtmlWebpackHamlPlugin.prototype.apply = function (compiler) {
  var self = this;
  // Hook into the html-webpack-plugin processing
  var beforeProcessing = {
    name: 'html-webpack-plugin-before-html-processing',
    cb: function (htmlPluginData, callback) {
      self.preProcessHtml(htmlPluginData, callback);
    }
  }
  var afterProcessing = {
    name: 'html-webpack-plugin-after-html-processing',
    cb: function (htmlPluginData, callback) {
      self.postProcessHtml(htmlPluginData, callback);
    }
  }
  if (compiler.hooks) {
    // setup hooks for webpack 4
    compiler.hooks.compilation.tap('HtmlWebpackHamlPlugin', function (compilation) {
      compilation.hooks.htmlWebpackPluginBeforeHtmlProcessing.tapAsync(beforeProcessing.name, beforeProcessing.cb);
      compilation.hooks.htmlWebpackPluginAfterHtmlProcessing.tapAsync(afterProcessing.name, afterProcessing.cb);
    });
  } else {
    compiler.plugin('compilation', function (compilation) {
      compilation.plugin(beforeProcessing.name, beforeProcessing.cb);
      compilation.plugin(afterProcessing.name, afterProcessing.cb);
    });
  }
};

/**
 * Is it processing target
 * @param htmlPluginData
 * @return bool processing target -> true
 */
HtmlWebpackHamlPlugin.prototype.isProcessingTarget = function (htmlPluginData) {
  var target = ['haml'];
  var ext = htmlPluginData.outputName.split('.').pop();
  var fileType = htmlPluginData.plugin.options.filetype;
  // If the plugin configuration set `filename` extension or `filetype` to 'haml'
  return target.indexOf(ext) >= 0 || target.indexOf(fileType) >= 0;
};

/**
 * Process the generated HTML（before assets injection）
 */
HtmlWebpackHamlPlugin.prototype.preProcessHtml = function (htmlPluginData, callback) {
  var self = this;
  var options = htmlPluginData.plugin.options;
  if (self.isProcessingTarget(htmlPluginData)) {
    htmlPluginData.html = self.adjustElementsIndentation(htmlPluginData.html);
  }
  callback(null, htmlPluginData);
};

/**
 * Process the generated HTML（after assets injection）
 */
HtmlWebpackHamlPlugin.prototype.postProcessHtml = function (htmlPluginData, callback) {
  var self = this;
  var options = htmlPluginData.plugin.options;
  // If the plugin configuration set `inject` to true and (set `filename` extension or `filetype` to 'haml')
  if (options.inject && self.isProcessingTarget(htmlPluginData)) {
    if (options.filename === 'index.html') {
      htmlPluginData.outputName = 'index.haml';
      htmlPluginData.plugin.childCompilationOutputName = 'index.haml';
      htmlPluginData.plugin.options.filename = 'index.haml';
    }
    htmlPluginData.html = self.injectAssetsIntoFile(htmlPluginData);
  }
  callback(null, htmlPluginData);
};

/**
 * Adjust elements indentation
 * @param html htmlPluginData.html (Haml)
 */
HtmlWebpackHamlPlugin.prototype.adjustElementsIndentation = function (html) {
  var self = this;
  html = self.deleteExtraNewlines(html);
  html = self.adjustHeadElementsIndentation(html);
  html = self.adjustBodyElementsIndentation(html);
  return html;
};

/**
 * Delete trailing extra newlines
 * e.g.
 *  before
 *   %div{ :id =>'footer' }
 *     Footer content
 *
 *
 *  after
 *   %div{ :id =>'footer' }
 *     Footer content
 *
 * @param html htmlPluginData.html (Haml)
 */
HtmlWebpackHamlPlugin.prototype.deleteExtraNewlines = function (html) {
  return html.replace(/(\r?\n){2,}$/im, '$1');
}

/**
 * Adjust head elements indentation
 * e.g.
 *  before
 *    %html{ :lang => 'en' }
 *      %head
 *        %meta{ :charset => 'utf-8' }
 *    %meta{ 'http-equiv' => 'X-UA-Compatible', :content => 'IE=edge' }
 *    %meta{ :name => 'viewport', :content => 'width=device-width, initial-scale=1' }
 *    %meta{ :name => 'description', :content => 'Webpack App' }
 *        %title
 *          - if i.odd?
 *            HtmlWebpackPlugin example
 *          - else
 *            Webpack App
 *        %link{ :href => "styles.css", :rel => "stylesheet" }
 *  after
 *    %html{ :lang => 'en' }
 *      %head
 *        %meta{ :charset => 'utf-8' }
 *        %meta{ 'http-equiv' => 'X-UA-Compatible', :content => 'IE=edge' }
 *        %meta{ :name => 'viewport', :content => 'width=device-width, initial-scale=1' }
 *        %meta{ :name => 'description', :content => 'Webpack App' }
 *        %title
 *          - if i.odd?
 *            HtmlWebpackPlugin example
 *          - else
 *            Webpack App
 *        %link{ :href => "styles.css", :rel => "stylesheet" }
 * @param html htmlPluginData.html (Haml)
 */
HtmlWebpackHamlPlugin.prototype.adjustHeadElementsIndentation = function (html) {
  var self = this;
  var regExp = /^([ |\t]*%head\n)([ |\t]*)([\s\S]*)(\n[ |\t]*%body)/im;
  var match = regExp.exec(html);
  if (match) {
    var indent = match[2];
    var elements = match[3].split('\n').map(function(v) {
      var m = /^([\s]*).*$/g.exec(v);
      return (m[1] === '' ? indent : '') + v.replace(/[ 　]+$/, '');
    });
    html = html.replace(regExp, match[1] + elements.join('\n') + match[4]);
  }
  return html;
}

/**
 * Adjust body elements indentation
 * !Operation guarantee of this function is limited 
 * e.g.
 *  before
 *      %body#body.main
 *        %h1 Main
 *        %img{ :src => 'logo.png' }
 *        %h2 Markup examples
 *    #content
 *      %h2 Welcome to our site!
 *      %p print_information
 *    %div{ :id =>'footer' }
 *      Footer content
 *  after
 *      %body#body.main
 *        %h1 Main
 *        %img{ :src => 'logo.png' }
 *        %h2 Markup examples
 *        #content
 *          %h2 Welcome to our site!
 *          %p print_information
 *        %div{ :id =>'footer' }
 *          Footer content
 * @param html htmlPluginData.html (Haml)
 */
HtmlWebpackHamlPlugin.prototype.adjustBodyElementsIndentation = function (html) {
  var self = this;
  var regExp = function(html) {
    var h = /^([ |\t]*)%head/im.exec(html);
    var topSpace = h ? h[1] : '[ |\t]*';
    return new RegExp('^(' + topSpace + ')(%body.*\\n)([ |\t]*[\\s\\S]*)', 'im');;
  }(html);
  var match = regExp.exec(html);
  if (match) {
    var padding = false;
    var indent = match[1];
    var addIndent = indent.repeat(2);
    var elements = match[3].split('\n');
    var newElements = [];
    for (var i = 0; i < elements.length; i++) {
      var elm = elements[i];
      // Skip first element
      if (i === 0) {
        newElements.push(elm);
        continue;
      }
      // Skip blank element
      if (elm.trim() === '') {
        newElements.push(elm.trim());
        continue;
      }
      var m = /^([ |\t]*).*$/i.exec(elm);
      // If the indentation is shallower than the body
      if (padding || (m && (m[1].length < indent.length))) {
        // After that, add indentation to all elements
        padding = true;
        elm = addIndent + elm;
      }
      newElements.push(elm);
    }
    html = html.replace(regExp, match[1] + match[2] + newElements.join('\n'));
  }
  return html;
}

/**
 * Create a tag of haml format
 */
HtmlWebpackHamlPlugin.prototype.createHamlTag = function (tag) {
  var t = function(tag) {
    if (tag.startsWith('%')) { return tag; }
    return '%' + tag;
  }(tag);
  if (t.search(/=/i) === -1) { return t };
  var regExp = / ([\w\-]+="[\w\/\-\. ]+")/;
  var items = t.split(regExp).filter(function(v) { return v != undefined && v.trim() !== '' });
  return items.join(', :').replace(',', '{').replace(/=/g, ' => ') + ' }';
};

/**
 * Injects the assets into the given file string
 */
HtmlWebpackHamlPlugin.prototype.injectAssetsIntoFile = function (htmlPluginData) {
  var self = this;
  var options = htmlPluginData.plugin.options;
  var assets = htmlPluginData.assets
  var html = htmlPluginData.html;
  var hasTemplate = self.hasTemplate(options.template);
  if (!hasTemplate) {
    html = html.replace(/\r?\n[ ]*/g, '');
  }

  var styles = self.headExtraction(html).map(function (e) {
    return e.match(/title>.*<\/title/i) ? '%title ' + options.title : e;
  });
  var scripts = htmlPluginData.plugin.options.inject !== 'head' ? self.bodyExtraction(html) : [];
  var file = hasTemplate ? self.removeUnnecessaryTags(html) : self.defaultTemplate();

  styles = styles.map(self.createHamlTag);
  scripts = scripts.map(self.createHamlTag);

  return self.injectAssets(file, styles, scripts, assets);
};

/**
 * Is a valid template file set?
 * @param filename template file name
 */
HtmlWebpackHamlPlugin.prototype.hasTemplate = function (filename) {
  var ext = filename.split('.').pop();
  return ['haml', 'js'].indexOf(ext) >= 0;
};

/**
 * Default template
 */
HtmlWebpackHamlPlugin.prototype.defaultTemplate = function () {
  return '\
!!! 5\n\
%html\n\
  %head\n\
  %body';
};

/**
 * Extract the style tags from head
 */
HtmlWebpackHamlPlugin.prototype.headExtraction = function (html) {
  var regExp = /<head><(.*)><\/head>/i;
  var match = regExp.exec(html);
  if (!match || match.length < 2) {
    return [];
  }
  return match[1].split('><').filter(function(v) { return !v.startsWith('/') });
};

/**
 * Extract the script tags from body
 */
HtmlWebpackHamlPlugin.prototype.bodyExtraction = function (html) {
  var regExp = /<(script.*)><\/script>/i;
  var match = regExp.exec(html);
  if (!match || match.length < 2) {
    return [];
  }
  return match[1].split('></script><');
};

/**
 * Remove html format tags
 */
HtmlWebpackHamlPlugin.prototype.removeUnnecessaryTags = function (html) {
  var headRegExp = /<head><(.*)><\/head>/i;
  var bodyRegExp = /<(script.*)><\/script>/i;
  return html.replace(headRegExp, '').replace(bodyRegExp, '');
};

/**
 * Injects the assets into the given string
 * @param html htmlPluginData.html (Haml)
 * @param head inject in the head tag (e.g. style tag)
 * @param body inject in the body tag (e.g. script tag)
 * @param assets
 */
HtmlWebpackHamlPlugin.prototype.injectAssets = function (html, head, body, assets) {
  var self = this;
  var regExp = function(html) {
    var h = /^([ |\t]*)%head/im.exec(html);
    var topSpace = h ? h[1] : '[ |\t]*';
    return new RegExp('^(' + topSpace + ')(%body)\\b', 'im');;
  }(html);
  var match = regExp.exec(html);
  if (match) {
    var headSpace = match[1];
    var hlSpace = function(space, html) {
      // delete extra space (left space of html tag)
      var m = /^([ |\t]*)%html/im.exec(html);
      return m ? space.replace(m[1], '') : space;
    }(headSpace.repeat(2), html);
    if (head.length) {
      head = head.map(function(v) {
        return hlSpace + v;
      });
      if (!/head/.test(html)) {
        head = [headSpace + '%head'].concat(head)
      }
      // Append assets to head element
      html = html.replace(regExp, head.join('\n') + '\n' + match[0]);
    }

    if (body.length) {
      body = body.map(function(v) {
        return hlSpace + v;
      });
      // Append scripts to the end of the html:
      if (html[html.length-1] != '\n') {
        html += '\n'
      }
      html += body.join('\n');
    }
  }

  // Inject manifest into the opening html tag
  html = self.injectManifest(html, assets);
  return html;
};

/**
 * Inject manifest into the opening html tag
 * @param html htmlPluginData.html (Haml)
 * @param assets
 */
HtmlWebpackHamlPlugin.prototype.injectManifest = function (html, assets) {
  if (!assets.manifest) {
    return html;
  }
  return html.replace(/^([ |\t]*%html.*)$/im, function (match, p1) {
    // Append the manifest only if no manifest was specified
    if (/\s:manifest\s*=>/.test(match)) {
      return match;
    }
    var regExp = /^([ |\t]*%html[^{]*)({[^}]*)?(})?$/i;
    var match = regExp.exec(p1);
    if (match) {
      var elements = match.filter(function(v) { return v != undefined });
      if (elements.length <= 3) {
        return elements[1] + '{ :manifest => "' + assets.manifest + '" }';
      };
      return elements[1] + elements[2].trim() + ', :manifest => "' + assets.manifest + '" ' + elements[3];
    }
    return match;
  });
};

module.exports = HtmlWebpackHamlPlugin;
