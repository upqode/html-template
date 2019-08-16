const gulp = require("gulp");
const server = require("browser-sync").create();
const nunjucksRender = require("gulp-nunjucks-render");
const plumber = require("gulp-plumber");
const prettify = require("gulp-jsbeautifier");
const concat = require("gulp-concat");
const sass = require("gulp-sass");
const autoprefixer = require("gulp-autoprefixer");
const sourcemaps = require("gulp-sourcemaps");
const uglify = require("gulp-uglify");
const cleanCSS = require("gulp-clean-css");

// 1. path
// 2. styles
// 3. html
// 4. scripts
// 5. serve
// 6. watch
// 7. build

const paths = {
  styles: {
    src: "src/sass/*.scss",
    watch: "src/sass/**/*.scss",
    dest: "dist/css"
  },
  scripts: {
    src: "src/js/*.js",
    watch: "src/js/**/*.js",
    dest: "dist/js"
  },
  html: {
    src: "src/pages/**/*.njk",
    watch: "src/**/*.njk",
    dest: "dist"
  }
};

function styles() {
  return gulp
    .src(paths.styles.src)
    .pipe(sourcemaps.init())
    .pipe(
      sass({
        outputStyle: "expanded",
        includePaths: ["node_modules"]
      })
    )
    .on("error", sass.logError)
    .pipe(autoprefixer())
    .pipe(cleanCSS({ debug: true }))
    .pipe(sourcemaps.write("/maps"))
    .pipe(gulp.dest(paths.styles.dest))
    .on("end", server.reload);
}

function html() {
  return gulp
    .src(paths.html.src)
    .pipe(plumber())
    .pipe(
      nunjucksRender({
        path: ["src/templates/"]
      })
    )
    .pipe(
      prettify({
        indent_size: 2,
        preserve_newlines: true,
        max_preserve_newlines: 0
      })
    ) // html beautify
    .pipe(gulp.dest(paths.html.dest))
    .on("end", server.reload);
}

function scripts() {
  return gulp
    .src(paths.scripts.src)
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(concat("script.min.js"))
    .pipe(sourcemaps.write("/maps"))
    .pipe(gulp.dest(paths.scripts.dest))
    .on("end", server.reload);
}

function reload(done) {
  server.reload();
  done();
}

function serve(done) {
  server.init({
    server: {
      baseDir: "dist"
    }
  });
  done();
}

function watch() {
  gulp.watch(paths.styles.watch, gulp.series(styles, reload));
  gulp.watch(paths.html.watch, gulp.series(html, reload));
  gulp.watch(paths.scripts.watch, gulp.series(scripts, reload));
}

exports.default = gulp.series(html, styles, scripts, serve, watch);
