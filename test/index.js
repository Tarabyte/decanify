/*jshint mocha:true*/
'use strict';
var decanify = require('../');
var fs = require('fs');
var path = require('path');
require('chai').should();
var Test = require('./_test.js');


describe('decanify', function() {  
  it('should be a function', function() {
    decanify.should.be.a('function');
  });
  
  
  fs.readdir(path.join(__dirname, 'data'), function(err, files) {
    if(err) {
      return console.log('Unable to read directory: ./test/data');
    }      

    files.filter(function(name) {
      return name.indexOf('.expect.') < 0;
    })
    .map(function(name) {
      return new Test(path.join(__dirname, 'data', name));  
    })
    .forEach(function(test){
      describe(test.description(), test.run.bind(test));
    });
  });
});
