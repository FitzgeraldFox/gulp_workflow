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
    pug = require('gulp-pug');

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

var jsSources = ['components/scripts/*.js'],
    sassSources = ['components/sass/style.scss'],
    htmlSources = [outputDir + '*.html'],
    jsonSources = [outputDir + 'json/*.json'],
    jsonDirPath = [outputDir + 'json/'];

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
  gulp.watch('components/sass/*.scss', ['compass']);
  gulp.watch('components/pug/**/*.jade', ['pug']);
  gulp.watch('builds/development/*.html', ['html']);
  gulp.watch('builds/development/json/*.json', ['json']);
  gulp.watch('builds/development/images/**/*.*', ['images']);
  gulp.watch('builds/development/fonts/**/*.*', ['fonts']);
});

gulp.task('connect', function() {
  connect.server({
    root: outputDir,
    livereload: true
  });
});

gulp.task('pug', function() {
    gulp.src('components/pug/**/*.jade')
        .pipe(pug())
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

gulp.task('build', ['pug', 'html', 'json', 'js', 'compass', 'images', 'fonts']);
gulp.task('server', ['connect', 'watch']);
gulp.task('default', ['pug', 'html', 'json', 'js', 'compass', 'images', 'fonts', 'connect', 'watch']);
