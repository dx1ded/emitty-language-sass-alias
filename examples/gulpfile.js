const gulp = require('gulp')
const gulpIf = require('gulp-if')
const gulpSass = require('gulp-sass')
const sassCompiler = require('sass')
const SassAlias = require('sass-alias')
const del = require('del')

const through2 = require('through2')
const emitty = require('@emitty/core').configure()

const sass = gulpSass(sassCompiler)

const aliases = {
  '@modules': 'src/modules'
}

emitty.language({
  extensions: ['.scss'],
  parser: require('emitty-language-sass-alias').parse.bind(this, aliases)
})

global.watch = false
global.changedFile = {
  styles: undefined
}

const getFilter = () => (
  through2.obj(function(file, _, callback) {
    emitty
      .filter(file.path, global.changedFile['styles'])
      .then((result) => {
        if (result) {
          this.push(file)
        }

        callback()
      })
  })
)

const styles = () => (
  gulp.src(['src/styles/main.scss', 'src/styles/pages/*.scss'])
    .pipe(gulpIf(global.watch, getFilter()))
    .pipe(sass({
      importer: new SassAlias(aliases)
        .getImporter()
    }))
    .pipe(gulp.dest('dist/styles'))
)

const stylesWatch = () => {
  gulp.watch('src/**/*.scss', styles)
    .on('all', (_, filePath) => {
      global.changedFile.styles = filePath
    })
}

const emittyInit = (callback) => {
  global.watch = true

  callback()
}

const clean = () => del('dist')

exports.default = gulp.series(
  emittyInit,
  clean,
  styles,
  stylesWatch
)
