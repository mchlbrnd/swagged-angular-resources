var gulp = require('gulp');
var rename = require('gulp-rename');
var del = require('del');

gulp.task('clean', function(cb) {
  return del(['.bin'], cb);
});

gulp.task('copy', ['clean'], function() {
  return gulp.src('src/swagged-angular-resources.coffee')
    .pipe(rename('swagged-angular-resources'))
    .pipe(gulp.dest('.bin'));
});

gulp.task('watch', function() {
  return gulp.watch(['src/*'], ['default']);
});

gulp.task('default', ['copy']);
