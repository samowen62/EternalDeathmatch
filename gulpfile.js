var gulp = require('gulp');
var browserify = require('gulp-browserify');
var concat = require('gulp-concat');
var less = require('gulp-less');
var refresh = require('gulp-livereload');
var lr = require('tiny-lr');
var server = lr();

gulp.task('scripts', function() {
	//source files here
    gulp.src(["js/three.min.js","js/renderers/Projector.js","js/libs/stats.min.js","user/main.js"])
       // .pipe(browserify())
        .pipe(concat('dest.js'))
        .pipe(gulp.dest('assets/js'))
        .pipe(refresh(server))
});


gulp.task('default', function() {
  gulp.run('scripts');

  gulp.watch('js/**', function(event) {
        gulp.run('scripts');
    })

  gulp.watch('user/*.js', function(event) {
        gulp.run('scripts');
    })
});