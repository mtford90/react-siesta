var open = require('open'),
    express = require('express'),
    gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    livereload = require('gulp-livereload'),
    jsx = require('gulp-react');

gulp.task('build', function () {
    gulp.src('./index.jsx')
        .pipe(jsx({sourceMap: true}))
        .pipe(rename('react-siesta.js'))
        .pipe(gulp.dest('dist'))
        .pipe(livereload());
});

gulp.task('build-test', function () {
    gulp.src('./test.jsx')
        .pipe(jsx({sourceMap: true}))
        .pipe(rename('test.js'))
        .pipe(gulp.dest('dist'))
        .pipe(livereload());
});

gulp.task('compile', ['build'], function () {
    gulp.src('dist/react-siesta.js')
        .pipe(uglify())
        .pipe(rename('react-siesta.min.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('watch', ['build', 'build-test'], function () {
    livereload.listen(40347);
    gulp.watch(['test.jsx'], ['build-test']);
    gulp.watch(['index.jsx'], ['build']);
    express()
        .use('/', express.static(__dirname))
        .use(express.static(__dirname))
        .listen(4753);
    open('http://localhost:4753/mocha.html');
});