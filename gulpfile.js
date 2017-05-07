var gulp = require('gulp');
var babel = require('gulp-babel');

gulp.task('bundle', bundle);

function bundle () {
  gulp.src('./src/*.js')
      .pipe(babel({
        presets: ['es2015', 'react']
      }))
      .pipe(gulp.dest('./dist'));
}

gulp.task('build', ['bundle']);
