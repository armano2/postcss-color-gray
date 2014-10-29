/*!
 * postcss-filter-declarations | MIT (c) Shinnosuke Watanabe
 * https://github.com/shinnn/postcss-filter-declarations
*/

'use strict';

var color = require('color');
var reduceFunctionCall = require('reduce-function-call');

function gnuMessage(message, source) {
  var fileName = source.file || '<css input>';
  return fileName + ':' + source.start.line + ':' + source.start.column + ' ' + message;
}

function parseGray(value, source) {
  return reduceFunctionCall(value, 'gray', function(argString) {
    var args = argString.split(',');

    var rgb = args[0] + ',' + args[0] + ',' + args[0];
    var alpha = args[1];
    if (alpha) {
      alpha = alpha.trim();
      var match = alpha.match(/^[1-9](\d|\.)+?%$/);
      if (match && match[0] === alpha) {
        alpha = parseFloat(alpha) * 0.01;
      }
    }

    var parsedColor;

    try {
      if (alpha === undefined) {
        parsedColor = color('rgb' + '(' + rgb + ')');
      } else {
        parsedColor = color('rgba' + '(' + rgb + ',' + alpha + ')');
      }
      return parsedColor.rgbString();

    } catch (e) {
      e.message = e.message.replace(/rgba?\(.*\)/, 'gray(' + args + ')');
      throw new Error(gnuMessage(e.message, source));
    }
  });
}

function transformDecl(decl) {
  if (decl.value && decl.value.indexOf('gray(') !== -1) {
    decl.value = parseGray(decl.value, decl.source);
  }
}

module.exports = function pluginColorGray() {
  return function(style) {
    style.eachDecl(transformDecl);
  };
};
