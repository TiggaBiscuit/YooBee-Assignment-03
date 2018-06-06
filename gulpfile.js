// Load all the modules from package.json
var gulp = require('gulp');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var useref = require('gulp-useref');
var concat = require('gulp-concat');
var deporder = require('gulp-deporder');
var stripdebug = require('gulp-strip-debug');
var rename = require('gulp-rename');


// Default error handler
var onError = function (err) {
  console.log('An error occured:', err.message);
  this.emit('end');
}

// This task creates two files, the regular and
// the minified one. It automatically reloads browser as well.
// gulp.task('scss', function () {
//   return gulp.src('stylesheets/main.scss')
//     .pipe(plumber({ errorHandler: onError }))
//     .pipe(sass())
//     .pipe(gulp.dest('./css'))
//     // Normal done, time to do minified (style.min.css)
//     // remove the following 3 lines if you don't want it
//     .pipe(minifycss())
//     .pipe(rename({ suffix: '.min' }))
//     .pipe(gulp.dest('./dist/css'))
//     .pipe(connect.reload());
// });


// Start the livereload server and watch files for change
// gulp.task('watch', function () {
//   connect.server({
//     livereload: true
//   });


// don't listen to whole js folder, it'll create an infinite loop
// gulp.watch( [ './JS/**/*.js', '!./JS/dist/*.js' ], [ 'scripts' ] )

// gulp.watch('./stylesheets/**/*.scss', ['scss']);
// });

// gulp.task('useref', function(){
//   return gulp.src('*.html')
//     .pipe(useref())
//     // Minifies only if it's a JavaScript file
//     .pipe(gulpIf('*.js', uglify()))
//     .pipe(gulp.dest('DIST'))
// });

// gulp.task('js-fef', function(){
//   return gulp.src(['JS/main.js', 'JS/secondary.js'])
//       .pipe(concat('concat.js'))
//       .pipe(gulp.dest('DIST'))
//       .pipe(rename('uglify.js'))
//       .pipe(uglify())
//       .pipe(gulp.dest('DIST'));
// });

gulp.task('concat', function () {
  return gulp.src(['JS/main.js', 'JS/secondary.js'])
    .pipe(concat('concat.js'))
    .pipe(gulp.dest('DIST'))
});

gulp.task('default', ['concat'], function () {
  // Does nothing in this task, just triggers the dependent 'watch'
});
