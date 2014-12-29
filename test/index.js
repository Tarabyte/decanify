/*jshint mocha:true*/
'use strict';
var decanify = require('../');
var fs = require('fs');
var path = require('path');
require('chai').should();
var Test = require('./_test.js');

/**
 * Invoke cb after times calls.
 */
function count(times, cb) {
  return function() {
    times--;
    if(!times) {
      cb();
    }
  };
}


describe('decanify', function() {
  it('should be defined', function() {
    decanify.should.be.defined;
  });
  
  it('should be a function', function() {
    decanify.should.be.a('function');
  });
  
  describe('cases', function(done){    
    fs.readdir(path.join(__dirname, 'data'), function(err, files) {
      if(err) {
        return console.log('Unable to read directory: ./test/data');
      }      

      var cases = files.filter(function(name) {
        return name.indexOf('.expect.') < 0;
      }).map(function(name) {
        return new Test(name);  
      });
      
      var report = count(cases.length, done);
            
      cases.forEach(function(test){
        describe(test.description(), function() {
          test.run(report);
        });
      });
    });
  });
});
