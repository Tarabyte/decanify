/*jshint node: true*/
var gulp = require('gulp');
var lint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var mocha = require('gulp-mocha');

var source = './index.js';
var tests = './test/**/[^_]*.js';

gulp.task('lint', function(){
  return gulp.src(source)
    .pipe(lint())
    .pipe(lint.reporter(stylish));
});

gulp.task('test', function() {
  return gulp.src(tests)
    .pipe(mocha({
      reporter: 'nyan',
      ui: 'bdd'
    }));
});

gulp.task('watch', function() {
  gulp.watch(source, ['lint', 'test']);
  gulp.watch(tests, ['test']);
});

gulp.task('default', ['lint', 'test', 'watch']);
