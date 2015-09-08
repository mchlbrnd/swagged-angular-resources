var gulp = require('gulp');
var rename = require('gulp-rename');
var coffee = require('gulp-coffee');
var gutil  = require('gulp-util');

var del = require('del');

gulp.task('clean', function(cb) {
  return del(['.bin'], cb);
});

gulp.task('copy', ['clean'], function() {
  return gulp.src('src/swagged-angular-resources.coffee')
    .pipe(coffee({bare: true})).on('error', console.error)
    .pipe(rename({extname: ''}))
    .pipe(gulp.dest('.bin'));
});

gulp.task('watch', function() {
  return gulp.watch(['src/*'], ['default']);
});

gulp.task('test', function(){
  return gulp.src('*')
})

gulp.task('default', ['copy']);
