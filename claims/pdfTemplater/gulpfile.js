"use strict";
var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var webpack = require('webpack');
var gutil = require('gulp-util');
var path = require("path")
var jshint = require('gulp-jshint')
var config = require('./webpack.config.js');
var exec = require('child_process').exec;
var fs = require("fs")

var paths = {
    watch: ["./src/*,", "./src/**/*"],
    jshint: ["src/*.js,", "src/**/*.js"]
}


gulp.task('jshint', function () {
    return gulp.src(paths.jshint)
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});


gulp.task('server', function () {
    browserSync.init({
        server: {
            baseDir: "./dist/"
        },
        https: true
    });
});

gulp.task('publish', function (done) {
    exec('rm -R dist', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);

        exec('mkdir dist', function (err, stdout, stderr) {
            console.log(stdout);
            console.log(stderr);

            // run webpack
            webpack(config, function (err, stats) {
                if (err) throw new gutil.PluginError('webpack:build', err);
                gutil.log('[webpack:build]', stats.toString({
                    colors: true
                }));

                // exec('cp node_modules/e1js-components/dist/image-renderer-lib.js docs/image-renderer-lib.js', function (err, stdout, stderr) {
                // 	console.log(stdout);
                // 	console.log(stderr);
                // })

            });
        });
    });
});

const watch = () => {
    return gulp.watch(`src/*`).on(`all`, gulp.parallel("jshint", "publish"))
}

gulp.task(`watch`, gulp.parallel(watch))
gulp.task("default", gulp.parallel("server", "jshint", "publish", "watch"))
