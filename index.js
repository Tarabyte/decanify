/*jahint node: true*/
'use strict';
var through = require('through2');
var esprima = require('esprima');
var escodegen = require('escodegen');
var traverse = require('estraverse');
var path = require('path');

function isDefine(node) {
  var callee = node.callee;
  
  return callee && 
    node.type === 'CallExpression' &&
    callee.name === 'define';
}

function lookupDefine(root) {
  var define = null;
  
  traverse.traverse(root, {
    enter: function(node) {
      if(isDefine(node)) {
        define = node;
        return traverse.VisitorOption.Break;
      }
    }
  });
  
  return define;
}

/**
 * Transform AMD style CanJS packages to CommonJS format.
 * Supported file extensions: js, coffee
 * @param {String} file File name to be processed.
 * @return {Stream} Transformed stream.
 */
module.exports = function(file) {
  var contents = '',
      stream;
  
  if(!/\.js|coffee/.test(path.extname(file))) { //check extension
    return through();    
  }
  
  stream = through(collect, transform);
  

  function collect(data, enc, next) {
    contents += data;
    next();
  }
  
  function transform(next) {
    var ast = esprima.parse(contents),
        result = contents,
        shouldTransform = false,
        tast, define;
    
    define = lookupDefine(ast);
    
    if(define) {
      console.log(define.arguments);
      shouldTransform = true;
      tast = ast;
    }
    
    if(shouldTransform) {      
      result = escodegen.generate(tast);
    }
    
    stream.push(result);
    next();
  }
  
  return stream;
   
};