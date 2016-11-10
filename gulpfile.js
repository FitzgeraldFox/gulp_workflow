'use strict'

var gulp = require('gulp'),
    gutil = require('gulp-util'),
    path = require('path'),
    browserify = require('gulp-browserify'),
    compass = require('gulp-compass'),
    connect = require('gulp-connect'),
    gulpif = require('gulp-if'),
    uglify = require('gulp-uglify'),
    minifyHTML = require('gulp-minify-html'),
    jsonminify = require('gulp-jsonminify'),
    imagemin = require('gulp-imagemin'),
    pngcrush = require('imagemin-pngcrush'),
    concat = require('gulp-concat'),
    pug = require('gulp-pug'),
    cleanCSS = require('gulp-clean-css'),
    sourcemaps = require('gulp-sourcemaps');

var env,
    jsSources,
    sassSources,
    htmlSources,
    jsonSources,
    outputDir,
    sassStyle;

env = process.env.NODE_ENV || 'development';

if (env==='development') {
  outputDir = 'builds/development/';
  sassStyle = 'expanded';
} else {
  outputDir = 'builds/production/';
  sassStyle = 'compressed';
}

var jsSources = ['components/scripts/**/*.js'],
    sassSources = ['components/sass/style.scss'],
    cssVendors = ['components/css/vendors/**/*.css'],
    jsVendors = ['components/js/vendors/**/*.js'],
    devHTML = [outputDir + '**/*.html'],
    devJSON = [outputDir + 'json/**/*.json'],
    jsonDirPath = [outputDir + 'json/'],
    devScss = ['components/sass/*.scss'],
    devPug = ['components/pug/**/*.jade'],
    devImg = ['builds/development/images/**/*.*'],
    devFonts = ['builds/development/fonts/**/*.*'];

gulp.task('js', function() {
  gulp.src(jsSources)
    .pipe(concat('script.js'))
    .pipe(browserify())
    .pipe(gulpif(env === 'production', uglify()))
    .pipe(gulp.dest(outputDir + 'js'))
    .pipe(connect.reload())
});

gulp.task('compass', function() {
  gulp.src(sassSources)
    .pipe(compass({
      sass: 'components/sass',
      image: outputDir + 'images',
      style: sassStyle
    })
    .on('error', gutil.log))
    .pipe(gulp.dest(outputDir + 'css'))
    .pipe(connect.reload())
});

gulp.task('watch', function() {
  gulp.watch(jsSources, ['js']);
  gulp.watch(devScss, ['compass']);
  gulp.watch(devPug, ['pug']);
  gulp.watch(devHTML, ['html']);
  gulp.watch(devJSON, ['json']);
  gulp.watch(devImg, ['images']);
  gulp.watch(devFonts, ['fonts']);
  gulp.watch(cssVendors, ['cssVendors']);
  gulp.watch(jsVendors, ['jsVendors']);
});

gulp.task('connect', function() {
  connect.server({
    root: outputDir,
    livereload: true
  });
});

gulp.task('pug', function() {
    gulp.src('components/pug/**/*.jade')
        .pipe(pug({'pretty': true}))
        .pipe(gulp.dest('builds/development/'))
});

gulp.task('html', function() {
  gulp.src('builds/development/*.html')
    .pipe(gulpif(env === 'production', minifyHTML()))
    .pipe(gulpif(env === 'production', gulp.dest(outputDir)))
    .pipe(connect.reload())
});

gulp.task('images', function() {
  gulp.src('builds/development/images/**/*.*')
    .pipe(gulpif(env === 'production', imagemin({
      progressive: true,
      svgoPlugins: [{ removeViewBox: false }],
      use: [pngcrush()]
    })))
    .pipe(gulpif(env === 'production', gulp.dest(outputDir + 'images')))
    .pipe(connect.reload())
});

gulp.task('fonts', function(){
    gulp.src('builds/development/fonts/**/*.*')
    .pipe(gulpif(env === 'production', gulp.dest(outputDir + 'fonts')))
    .pipe(connect.reload())
});

gulp.task('json', function() {
  gulp.src('builds/development/json/*.json')
    .pipe(gulpif(env === 'production', jsonminify()))
    .pipe(gulpif(env === 'production', gulp.dest('builds/production/json')))
    .pipe(connect.reload())
});

gulp.task('cssVendors', function(){
    gulp.src(cssVendors)
        .pipe(concat('vendors.css'))
        .pipe(cleanCSS({compability: 'ie10'}))
        .pipe(gulp.dest(outputDir + 'css'))
        .pipe(connect.reload())
});

gulp.task('jsVendors', function(){
    gulp.src(jsVendors)
        .pipe(concat('vendors.js'))
        .pipe(browserify())
        .pipe(gulpif(env === 'production', uglify()))
        .pipe(gulp.dest(outputDir + 'js'))
        .pipe(connect.reload())
});

gulp.task('build', ['pug', 'html', 'json', 'jsVendors', 'js', 'compass', 'cssVendors', 'images', 'fonts']);
gulp.task('server', ['connect', 'watch']);
gulp.task('default', ['pug', 'html', 'json', 'jsVendors', 'js', 'compass', 'cssVendors', 'images', 'fonts', 'connect', 'watch']);
