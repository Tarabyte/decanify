/*jshint mocha:true*/
'use strict';
var decanify = require('../index.js');
var fs = require('fs');
var path = require('path');
require('chai').should();

function Test(name) {
  this.file = path.join(__dirname, 'data', name);
  this.expected = path.join(__dirname, 'data', 
                            path.basename(name, '.js') + '.expect.js');
}

Test.prototype.run = function(done) {
  var stream = decanify(this.file),
      expected = fs.readFileSync(this.expected, 'utf-8');
  
  it('should be called', function() {
    true.should.be.ok;
  });
  
  it('should return a stream', function() {
    stream.on.should.be.a('function');
    stream.pipe.should.be.a('function');
  });
  
  it('should be transformed', function() {
    var result = "";
    
    stream.on('data', function(buf) {
      result += buf;
    }).on('end', function() {
      result.should.be.equal(expected);
      done();
    });
    
    fs.createReadStream(this.file).pipe(stream);
  });
  
};

Test.prototype.description = function() {
  return path.basename(this.file, '.js')
    .replace(/-|_/g, function() {
      return " "; 
    });
};

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
      
      var run = 0,
          report = function() {
            run++;
            if(run === cases.length) {
              done();
            }
        };

      var cases = files.filter(function(name) {
        return name.indexOf('.expect') < 0;
      }).map(function(name) {
        return new Test(name);  
      });
            
      cases.forEach(function(test){
        describe(test.description(), function() {
          test.run(report);
        });
      });
    });
  });
});
