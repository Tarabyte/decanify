/*jshint mocha:true*/
'use strict';
require('chai').should();
var decanify = require('../');
var debowerify = require('debowerify');
var browserify = require('browserify');
var totalFileLength = 458059; //magic number;

describe.skip('full transform', function(){
  var b = browserify();
  b.add('./test/full/_full.js');
  b.transform(decanify);
  b.transform(debowerify);
  
  it('should browserify', function(done){
    this.timeout(10000); //it takes some time
    
    b.bundle(function(err, buf){
      if(err) {
        console.log(err.message);
        false.should.be.ok;
      }
      else {
        buf.length.should.be.equal(totalFileLength);
      }
      
      done();
    });//.pipe(fs.createWriteStream('result.js'));
  });
});
