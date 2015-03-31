//
//    █████╗ ██╗  ██╗██╗██╗     ███████╗███████╗███████╗
//   ██╔══██╗██║ ██╔╝██║██║     ██╔════╝██╔════╝╚══███╔╝
//   ███████║█████╔╝ ██║██║     █████╗  █████╗    ███╔╝
//   ██╔══██║██╔═██╗ ██║██║     ██╔══╝  ██╔══╝   ███╔╝
//   ██║  ██║██║  ██╗██║███████╗███████╗███████╗███████╗
//   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚══════╝╚══════╝

// Assemble Requirements
// ///////////////////////////////////////////////////////////////////////////////

var assemble           = require('assemble');
var fs                 = require('fs');
var path               = require('path');
var glob               = require('../nodes/glob');
var Less               = require('../nodes/less');
var lessPlugAutoPrefix = require('../nodes/less-plugin-autoprefix');
var lessPlugInlineUrls = require('../nodes/less-plugin-inline-urls');
var lessPlugCssComb    = require('../nodes/less-plugin-csscomb');
var lessPlugCleanCss   = require('../nodes/less-plugin-clean-css');
var uncss              = require('gulp-uncss');

// LESS configuration
// ///////////////////////////////////////////////////////////////////////////////

// Less variable initalization
var ext, globFiles, PLUGINS;

// Autoprefix variables
var AUTOPREFIXER_BROWSERS = [
  'ie >= 10',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];

// LESS plugins configuration
var autoprefix = new lessPlugAutoPrefix({
  browsers: AUTOPREFIXER_BROWSERS
});
var cclean   = new lessPlugCleanCss({
  // keepBreaks: true
});
var ccomb      = new lessPlugCssComb('./.csscomb.json');
var inlineUrls = lessPlugInlineUrls;

// LESS build configuration

var env      = assemble.get('BUILD_ENV');
var stage    = assemble.get('BUILD_STAGE');
var lessFlag = (
      (env === 'development' && stage === 'test') ||
      (env === 'production' && stage === 'prod')
    );

if (env === 'development') {
  if (stage === 'dev') {
    PLUGINS = [autoprefix, ccomb];
    globFiles = 'styles/{framework,vendor,theme,development}.less';
    ext = '.css';
  } else  {
    PLUGINS = [autoprefix, inlineUrls, ccomb];
    globFiles = 'styles/{styles,development}.less';
    ext = '.css';
  }
} else {
  if (stage !== 'prod') {
    PLUGINS = [autoprefix, ccomb, cclean];
    globFiles = 'styles/{framework,vendor,theme}.less';
    ext = '-min.css';
  } else {
    PLUGINS = [autoprefix, inlineUrls, ccomb, cclean];
    ext = '-min.css';
    globFiles = 'styles/styles.less';
  }
}

// LESS engine
// ///////////////////////////////////////////////////////////////////////////////

// Only using less.render along with plugins to achieve output instead
// of the individual cli evquivalents or gulp plugins...

// write to said destination
function saveFile (io, fn, xx) { // io = input/output; fn = filename; xx = extension
  return fs.writeFileSync('assets/css/' + fn + xx, io);
}

// get file name and content then process
function processLess (files) {
  files.forEach(function (f) {
    var fn = path.basename(f, path.extname(f)); // fn = filename
    var fc = fs.readFileSync(f, 'utf8');        // fc = file content

    Less.render(fc, {
      plugins: PLUGINS
    }, function (err, res) {
        if (err) console.log(err);
        if (res.css) saveFile(res.css, fn, ext);
    });
  })
}

// LESS processing
// ///////////////////////////////////////////////////////////////////////////////

// General LESS processing
assemble.task('styles', function () {
  var globLess = glob.sync(globFiles);
  // do it.
  return processLess(globLess);
});

// Just in case I need to generate this file when not in
// the proper environment or stage.
assemble.task('styles:styles', function () {
  var globLess = glob.sync('styles/styles.less');
  // do it.
  return processLess(globLess);
});

// LESS processing via assemble.watch task to handle individual sections
assemble.task('styles:framework', function () {

  if (lessFlag) {
    var globLess = glob.sync('styles/styles.less');
  } else {
    var globLess = glob.sync('styles/framework.less');
  }

  // do it.
  return processLess(globLess);
});

assemble.task('styles:theme', function () {

  if (lessFlag) {
    var globLess = glob.sync('styles/styles.less');
  } else {
    var globLess = glob.sync('styles/theme.less');
  }

  // do it.
  return processLess(globLess);
});

assemble.task('styles:vendor', function () {

  if (lessFlag) {
    var globLess = glob.sync('styles/styles.less');
  } else {
    var globLess = glob.sync('styles/vendor.less');
  }

  // do it.
  return processLess(globLess);
});

// LESS processing development files
assemble.task('styles:development', function () {
  var globLess = glob.sync('styles/development.less');
  // do it.
  return processLess(globLess);
});

// Uncss processing
// ///////////////////////////////////////////////////////////////////////////////

// REMINDER: further configuration of this process along with the operational jobs
assemble.task('uncss', function () {
  if (lessFlag) {
    return assemble
      .src('build/assets/css/styles*.css')
      .pipe(uncss({
        html: ['build/*.html']
      }))
      .pipe(assemble.dest('build/assets/css'));
  } else {
    return assemble
      .src('build/assets/css/*.css')
      .pipe(uncss({
        html: ['build/*.html'],
      }))
      .pipe(assemble.dest('build/assets/css'));
  }
});
