import gulp from 'gulp';
import exportTo from 'vinyl-source-stream';
import bufferize from 'vinyl-buffer';
import { exec } from 'child_process';
import notifier from 'node-notifier';

import postcss from 'gulp-postcss';
import postcss_import from 'postcss-import';
import postcss_cssnext from 'postcss-cssnext';
import postcss_nested from 'postcss-nested';
import postcss_discard_comments from 'postcss-discard-comments';
import postcss_cssnano from 'cssnano';
import browserify from 'browserify';
import uglify from 'gulp-uglify';

let path = {
  src: {
    html: '*.html',
    js: 'src/js/**/*.js',
    mainJs: 'src/js/main.js',
    css: 'src/css/**/*.css'
  },
  dist: {
    js: 'dist/js',
    css: 'dist/css'
  }
};

gulp.task('css:watch', (done) =>
  gulp
  .src(path.src.css)
  .pipe(postcss([ postcss_import, postcss_cssnext, postcss_nested ]))
  .on('error', (err) => {
    notifier.notify({
      'title': 'Failed CSS make...',
      'message': err.stack || err
    });
    done();
  })
  .pipe(gulp.dest(path.dist.css))
  .on('end', () => {
    notifier.notify({
      'title': 'CSS maked!',
      'message': 'CSS maked!'
    });
  })
);

gulp.task('css:build', () =>
  gulp
  .src(path.src.css)
  .pipe(postcss([
    postcss_import, postcss_cssnext, postcss_nested,
    postcss_discard_comments({ removeAll: true }),
    postcss_cssnano()
  ]))
  .pipe(gulp.dest(path.dist.css))
);

gulp.task('js:watch', () =>
  browserify({ entries: path.src.mainJs, debug: true })
  .transform('babelify', {
    presets: [ 'es2015' ],
    plugins: [
      'syntax-async-functions',
      'transform-async-to-generator'
    ]
  })
  .plugin('licensify')
  .bundle()
  .on('error', function(err) {
    console.error(err.stack || err);
    notifier.notify({
      'title': 'Failed JS make...',
      'message': err.stack || err
    });
    this.emit('end');
  })
  .pipe(exportTo('bundle.js'))
  .pipe(gulp.dest(path.dist.js))
  .on('end', () => {
    notifier.notify({
      'title': 'JS maked!',
      'message': 'JS maked!'
    });
  })
);

gulp.task('js:build', () =>
  browserify({ entries: path.src.mainJs, debug: true })
  .transform('babelify', {
    presets: [ 'es2015' ],
    plugins: [
      'syntax-async-functions',
      'transform-async-to-generator'
    ]
  })
  .plugin('licensify')
  .bundle()
  .pipe(exportTo('bundle.js'))
  .pipe(bufferize())
  .pipe(uglify({ preserveComments: 'license' }))
  .pipe(gulp.dest(path.dist.js))
);

gulp.task('watch', () => {
  exec('livereloadx -s -p 8000 --include "dist/**/*" --exclude "src/**/*" .');
  gulp.watch(path.src.css, ['css:watch']);
  gulp.watch(path.src.js, ['js:watch']);
});

gulp.task('build', ['css:build', 'js:build']);
