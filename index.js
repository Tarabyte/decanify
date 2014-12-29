/*jahint node: true*/
'use strict';
var through = require('through2');

/**
 * Transform AMD style CanJS packages to CommonJS format.
 *
 * @param {String} file File name to be processed.
 * @return {Stream} Transformed stream.
 */
module.exports = function(file) {
  var contents = '',
      stream = through(collect, transform);
  

  function collect(data, enc, next) {
    contents += data;
    next();
  }
  
  function transform(next) {
    stream.push(contents);
    //actual transform goes here.
    next();
  }
  
  return stream;
   
};