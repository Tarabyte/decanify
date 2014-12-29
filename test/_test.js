/*jshint node: true*/
'use strict';
var path = require('path');
var fs = require('fs');
var decanify = require('../');

/**
 * Test constructor.
 * @param {String} name File path.
 */
function Test(name) {
  var ext = path.extname(name);

  this.extension = ext;
  this.file = name;
  this.expected = path.join(
    path.dirname(name),
    path.basename(name, ext) + '.expect' + ext);
}

/**
 * Run file transform and comparison.
 */
Test.prototype.run = function() {
  var file = this.file,
      stream = decanify(file),
      expected = fs.readFileSync(this.expected, 'utf-8');
  
  it('should be called', function() {
    true.should.be.ok;
  });
  
  it('should return a stream', function() {
    stream.on.should.be.a('function');
    stream.pipe.should.be.a('function');
  });
  
  it('should be transformed', function(next) {
    var result = '';
    
    stream.on('data', function(buf) {
      result += buf;
    }).on('end', function() {    
      result.should.be.equal(expected);
      next();
    });
    
    fs.createReadStream(file).pipe(stream);
  });
  
};

/**
 * Nice looking description.
 */
Test.prototype.description = function() {
  return path.basename(this.file, '.js')
    .replace(/-|_/g, function() {
      return " "; 
    });
};

module.exports = Test;