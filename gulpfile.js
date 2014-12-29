/*jshint node: true*/
'use strict';
var gulp = require('gulp');
var lint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var mocha = require('gulp-mocha');

var source = './index.js';
var tests = './test/**/[^_]*.js';
var allTests = './test/**/*';

gulp.task('lint', function(){
  return gulp.src(source)
    .pipe(lint())
    .pipe(lint.reporter(stylish));
});

gulp.task('test', function() {
  return gulp.src(tests)
    .pipe(mocha({
      reporter: 'spec',
      ui: 'bdd'
    }));
});

gulp.task('watch', function() {
  gulp.watch(source, ['lint', 'test']);
  gulp.watch(allTests, ['test']);
});

gulp.task('default', ['lint', 'test', 'watch']);
