var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    plumber = require('gulp-plumber');

gulp.task('default', function () {
    return gulp.src('./public/assets/js/*.js')
        .pipe(plumber())
        .pipe(uglify())
        .pipe(gulp.dest('./public/dist'));
});