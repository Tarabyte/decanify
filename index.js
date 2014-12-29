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
    callee.type === 'Identifier' &&
    callee.name === 'define';      
}

function isReturn(node) {
  return node.type === 'ReturnStatement';
}

function isFirstExpression(parents) {  
  return parents.length === 2 &&
    parents[0].type === 'Program' &&
    parents[1].type === 'ExpressionStatement';
}

function isOverallReturn(parents) {
  //Program/Expression/*Define*/Function/Body
  return parents.length === 5 && isDefine(parents[2]);  
}

function wrapWithProgram(body) {
  return {type: 'Program', body: body};
}

/**
 * Wraps param with `module.exports = obj`
 * @param obj Expression to be wrapped
 */
function createModuleExport(obj) {
  return { type: 'ExpressionStatement',
    expression: 
     { type: 'AssignmentExpression',
       operator: '=',
       left: 
        { type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'module' },
          property: { type: 'Identifier', name: 'exports' } },
       right: obj } };
}

/**
 * Convert literal to another literal.
 * can/path --> canjs/amd/can/path.js
 */
function resolve(literal) {  
    var value = literal.value;
    if(value.indexOf('can') === 0) {
      value = 'canjs/amd/' + value + '.js';
    }
    
    return {
      type: 'Literal',
      value: value
    };
}

/**
 * literal --> require(literal)
 */
function callRequire(literal) {
  return {
    type: 'CallExpression',
    callee: {
        type: 'Identifier',
        name: 'require'
      },
    arguments: [literal]
  };
}

/**
 * Unwraps function expression assigning params by resolving deps.
 * 
 * define(['a', 'b'], function(a) {body}) -->
 *    var a = require('a')
 *    require('b')
 *    body
 */
function resolveDependencies(deps, factory) {
  var args = factory.params,
      vars = [],
      requires = [],
      result = [];
  
  deps = deps.elements.map(resolve);
  
  vars = deps.filter(function(_, i) {
    return i < args.length;
  }).map(function(item, i) {
    //a = require('a')
    return {
      type: 'VariableDeclarator',
      id: {
        type: 'Identifier',
        name: args[i].name
      },
      init: callRequire(item)
    };
  });
  
  requires = deps.filter(function(_, i) {
    return i >= args.length;
  }).map(function(item) {
    //require('a')
    return {
      type: 'ExpressionStatement',
      expression: callRequire(item)
    };
  });
  
  if(vars.length) {
    //var a = require('a')
    result.push({
      type: 'VariableDeclaration',
      kind: 'var',
      declarations: vars
    });
  }
  
  if(requires.length) {
    result = result.concat(requires);
  }
  
  if(result.length) {
    return result.concat(factory.body.body);
  }
  
  return factory.body.body;
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
        tast;
    
    traverse.replace(ast, {
      enter: function(node) {
        if(isDefine(node)) { //define(...) found
          //need to check we are not too deep
          if(isFirstExpression(this.parents())) { 
            shouldTransform = true;
          }          
        }
        
      },
      leave: function(node) {
        var args, factory, deps, len;
        if(isDefine(node)) {
          args = node.arguments;
          len = args.length;
          factory = args.pop();
          deps = args[0];
          
          //define(function())
          if(len === 1 && factory.type === 'FunctionExpression') { 
            tast = wrapWithProgram(factory.body.body);
            this.break();
            
          }
          //define([deps], function(args))
          else if(len === 2 && 
                  deps.type === 'ArrayExpression' && 
                  factory.type === 'FunctionExpression') {
            tast = wrapWithProgram(resolveDependencies(deps, factory));
            this.break();
          }
          //define(name, [deps], function(args))
          else if(len === 3 &&
                 deps.type === 'Literal' &&
                 factory.type === 'FunctionExpression' &&
                 args[1].type === 'ArrayExpression') {
            tast = wrapWithProgram(resolveDependencies(args[1], factory));
            this.break();
          }

        }
        else if (isReturn(node)&& shouldTransform) {//return blah
          if(isOverallReturn(this.parents())) {
            return createModuleExport(node.argument);
          }
        }
      }
    });
   
    
    if(shouldTransform) {
      result = escodegen.generate(tast||ast);
    }
    
    stream.push(result);
    next();
  }
  
  return stream;
   
};