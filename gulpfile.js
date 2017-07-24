var gulp = require('gulp');
var less = require('gulp-less');
var webserver = require('gulp-webserver');

gulp.task('less',function(){
    gulp.src('./src/less/*.less')
    .pipe(less())
    .pipe(gulp.dest('./build/css/'))
});

gulp.task('watch',function(){
    gulp.watch('./src/less/*.less',['less']);
});

gulp.task('webserver', function() {
  gulp.src('./build/')
    .pipe(webserver({
      port:3000,
      livereload: true,
      directoryListing: false,
      open: true
    }));
});

gulp.task('default',['less','watch','webserver']);

