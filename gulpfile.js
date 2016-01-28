var gulp = require('gulp');
var browserify = require('gulp-browserify');
var concat = require('gulp-concat');
var less = require('gulp-less');
var refresh = require('gulp-livereload');
var lr = require('tiny-lr');
var server = lr();

gulp.task('scripts', function() {
	//source files here
    gulp.src(["js/three.min.js",
      "js/renderers/Projector.js",
      "js/libs/stats.min.js",
     // "js/howler.js",
      "user/defs.js",
      "user/object-util.js",
      "user/weapons.js",
      "user/collisionwall.js",
      "user/platform.js",
      "user/ramp.js",
      "user/ceiling.js",
      "user/projectiles.js",
      "user/centity.js",
      "user/pentity.js",
      "user/controls.js",
      "user/scene.js",
      "user/socket.js"])
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