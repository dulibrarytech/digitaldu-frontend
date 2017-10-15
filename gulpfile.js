var gulp = require('gulp'),
    uglify = require('gulp-uglify-es').default,
    plumber = require('gulp-plumber');

gulp.task('default', function () {
    return 0;
});

gulp.task('dependancies', function () {
    return gulp.src('./public/assets/js/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('./public/dist/assets/js/'));
});

gulp.task("libs", function () {
    return gulp.src("./libs/*.js")
        .pipe(uglify(/* options */))
        // .pipe(rename("bundle.min.js"))
        .pipe(gulp.dest("./public/dist/libs/"));
});