const gulp = require('gulp'),
      uglify = require('gulp-uglify-es').default;

var minify_js = function() {
  return gulp.src('./public/assets/js/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('./public/dist/assets/js/'));
}
exports.minify_js = minify_js;

var deploy_js = function() {
  return gulp.src('./public/dist/assets/js/*.js')
    .pipe(gulp.dest('./public/assets/js/'));
}
exports.deploy_js = deploy_js;

gulp.task('deploy_all', gulp.series(minify_js, deploy_js))