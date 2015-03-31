//
//    █████╗ ██╗  ██╗██╗██╗     ███████╗███████╗███████╗
//   ██╔══██╗██║ ██╔╝██║██║     ██╔════╝██╔════╝╚══███╔╝
//   ███████║█████╔╝ ██║██║     █████╗  █████╗    ███╔╝
//   ██╔══██║██╔═██╗ ██║██║     ██╔══╝  ██╔══╝   ███╔╝
//   ██║  ██║██║  ██╗██║███████╗███████╗███████╗███████╗
//   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚══════╝╚══════╝

// Assemble Requirements
// ///////////////////////////////////////////////////////////////////////////////

const assemble = require('assemble')
const series   = require('gulp-sync')(assemble)

// Assemble Options, Configurations & Tasks
// ///////////////////////////////////////////////////////////////////////////////

require('./app/assemble-config.js')   // base options, helpers and env variables
require('./app/assemble-preload.js')  // preloading layouts/partials/data
require('./app/assemble-images.js')   // image processing. placeholder.
require('./app/assemble-scripts.js')  // js concatenation and uglification
require('./app/assemble-styles.js')   // less -> css processing
require('./app/assemble-site.js')     // site files generation
require('./app/assemble-server.js')   // browser/bower related items
require('./app/assemble-support.js')  // copy/delete/rsync/gzip/revision

// Assemble Jobs
// ///////////////////////////////////////////////////////////////////////////////

assemble.task('default', series.sync(['build:base', 'serve']))
assemble.task('init', series.sync(['init:base', 'build:base', 'serve']))
assemble.task('serve', series.sync(['watch', 'server']))
assemble.task('build:base', series.sync([
  'preload',
  'site:base'
]))

assemble.task('preload', series.sync([
  'preload:data',
  'preload:layouts'
]))

assemble.task('preload:data', series.sync([
  'setManifests', // build file manifests
  'setMap',       // build YFM file for site pages
  'setConfig'     // preload site data
]))

assemble.task('preload:layouts', series.sync([
  'setLayouts'    // preload layouts and partials
]))

assemble.task('site:base', series.sync([
  ['site1', 'site2'],  // build site section 1 & 2
  'pretty'             // beautify html files
]))

assemble.task('site:aux', series.sync([
  'sitemap',
  'pretty'
]))

assemble.task('init:base', series.sync([
  'clean:build',           // remove files from build directory
  'clean:init',            // remove files from assets/css and js
  'copy:build',            // create asset directory structure in build
  'styles',                // process LESS to CSS
  'scripts',               // process Javascript files
  'delay',                 // add 4 second delay to allow for css & js compilation
  'sync:static',           // copy over static assets
  'sync:css',              // copy css files to build
  'sync:js',               // copy js files to build
]))

assemble.task('init:dev', series.sync([
  'styles',                // process LESS to CSS
  'scripts',               // concatenate Javascript files
  'delay',                 // 4 second delay to allow for processing
  'build:base'             // generate site
]))

assemble.task('init:prod', series.sync([
  'clean:dist',            // remove files from dist directory
  'init:base',             // initialize site generation
  'build:aux',             // generate auxillary site files
  'images',                // process images (crush)
  'uncss',                 // remove unnecessary css
  'copy:dist',             // copy build to dist
  'rev',                   // file revision
  'sync:post',             // rsync files not included in revision
  'compress'               // gzip everything
]))

assemble.task('images', series.sync([['crush:png', 'crush:jpg', 'crush:svg'], 'crush']))
assemble.task('mapsite', series.sync(['setMap', 'setConfig', 'setLayouts', 'sitemap', 'pretty']))
assemble.task('sync:static', ['sync:img', 'sync:fonts', 'sync:ico'])

// Assemble Watch
// ///////////////////////////////////////////////////////////////////////////////

assemble.task('watch', function() {
  // Config and Site files
  assemble.watch([
    'config/*.cson',
    'layouts/{globals,regions,sectors}/**/*.hbs'
  ], series.sync(['build:base']))
  assemble.watch([
    'layouts/templates/{src,views}/*.hbs',
    'modules/**/*.hbs'
  ], series.sync(['preload:data', 'site:base']))
  // Static Assets
  assemble.watch(['assets/css/*.css'], series.sync(['sync:css', 'set:css']))
  assemble.watch(['assets/js/*.js'], series.sync(['sync:js', 'set:js']))
  assemble.watch(['assets/img/**/*.*'], series.sync(['sync:img', 'set:img']))
  assemble.watch(['assets/fonts/*.*'], series.sync(['sync:fonts']))
  assemble.watch(['assets/ico/*.*'], series.sync(['sync:ico', 'set:img']))
  // Less files
  assemble.watch([
    'styles/bootstrap.less',
    'styles/bootstrap/**',
    'styles/bootstrap/**/*.less'
    ], series.sync(['styles:framework']))
  assemble.watch([
    'styles/theme.less',
    'styles/theme/**',
    'styles/theme/**/*.less'
    ], series.sync(['styles:theme']))
  assemble.watch([
    'styles/vendor.less',
    'styles/vendor/**',
    'styles/vendor/**/*.less'
    ], series.sync(['styles:vendor']))
  assemble.watch([
    'styles/development.less',
    'styles/development/**',
    'styles/development/**/*.less'
    ], series.sync(['styles:development']))
  // Javascript files
  assemble.watch([
    'scripts/jquery/jquery.js',
    'scripts/jquery/bootstrap/*.js'
    ], series.sync(['scripts:bootstrap']))
  assemble.watch([
    'scripts/jquery/**/*.js',
    '!scripts/jquery/jquery.js',
    '!scripts/jquery/bootstrap/*.js'
    ], series.sync(['scripts:plugins']))
  assemble.watch([
    'scripts/libs/*.js',
    'scripts/libs/**/*.js'
    ], series.sync(['scripts:libs']))
  assemble.watch([
    'scripts/dev/*.js'
    ], series.sync(['scripts:development']))
  // Helpers
  assemble.watch('helpers/*.js', series.sync(['helpers', 'build:base']))
})
