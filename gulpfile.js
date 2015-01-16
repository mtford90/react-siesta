var open = require('open'),
    express = require('express'),
    gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    livereload = require('gulp-livereload'),
    handlebars = require('gulp-compile-handlebars'),
    glob = require('glob'),
    jsx = require('gulp-react');

gulp.task('build', function () {
    gulp.src('./index.jsx')
        .pipe(jsx({sourceMap: true}))
        .pipe(rename('react-siesta.js'))
        .pipe(gulp.dest('dist'))
        .pipe(livereload());
});

gulp.task('preprocess-tests', function () {
    gulp.src('./**/*.spec.jsx')
        .pipe(jsx({sourceMap: true}))
        .pipe(gulp.dest('dist'));
});

gulp.task('build-test', ['preprocess-tests'], function () {
    var handleBarOpts = {};
    // Computed property means that the glob will not be applied until the hbs file is being parsed.
    Object.defineProperty(handleBarOpts, 'specs', {
        get: function () {
            return glob.sync('./**/*.spec.js', {cwd: './dist'});
        },
        enumerable: true
    });
    gulp.src('./mocha.hbs')
        .pipe(handlebars(handleBarOpts))
        .pipe(rename('mocha.html'))
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
    gulp.watch(['./**/*.spec.jsx', 'mocha.hbs'], ['build-test']);
    gulp.watch(['index.jsx'], ['build']);
    express()
        .use('/', express.static(__dirname))
        .use(express.static(__dirname))
        .listen(4753);
    open('http://localhost:4753/dist/mocha.html');
});