//
//    █████╗ ██╗  ██╗██╗██╗     ███████╗███████╗███████╗
//   ██╔══██╗██║ ██╔╝██║██║     ██╔════╝██╔════╝╚══███╔╝
//   ███████║█████╔╝ ██║██║     █████╗  █████╗    ███╔╝
//   ██╔══██║██╔═██╗ ██║██║     ██╔══╝  ██╔══╝   ███╔╝
//   ██║  ██║██║  ██╗██║███████╗███████╗███████╗███████╗
//   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚══════╝╚══════╝

// Assemble Requirements
// ///////////////////////////////////////////////////////////////////////////////

var assemble  = require('assemble');
var fs        = require('fs');
var concat    = require('gulp-concat');
var uglify    = require('gulp-uglify');
var rename    = require('gulp-rename');
var chkif     = require('gulp-if');
var modernizr = require('../nodes/customizr');

// JS settings and env variables
// ///////////////////////////////////////////////////////////////////////////////

var env   = assemble.get('BUILD_ENV');
var stage = assemble.get('BUILD_STAGE');
var state = (env === "production");
var flag  = (
      (env === "development" && stage === "dev") ||
      (env === "production" && stage === "test")
    );

var globJQBootstrap = [
  'scripts/jquery/jquery.js',
  'scripts/jquery/bootstrap/transition.js',
  'scripts/jquery/bootstrap/alert.js',
  'scripts/jquery/bootstrap/button.js',
  'scripts/jquery/bootstrap/carousel.js',
  'scripts/jquery/bootstrap/collapse.js',
  'scripts/jquery/bootstrap/dropdown.js',
  'scripts/jquery/bootstrap/modal.js',
  'scripts/jquery/bootstrap/tooltip.js',
  'scripts/jquery/bootstrap/popover.js',
  'scripts/jquery/bootstrap/scrollspy.js',
  'scripts/jquery/bootstrap/tab.js',
  'scripts/jquery/bootstrap/affix.js'
];

var globJQPlugins = 'scripts/jquery/plugins/*.js';
var globLIBS      = 'scripts/libs/**/*.js';
var globDEV       = 'scripts/dev/*.js';
var globMAIN      = 'scripts/views/sources/*.js';

// JS processing (routing, concatenation, minifying & renaming)
// ///////////////////////////////////////////////////////////////////////////////

assemble.task('scripts', function () {

  if (flag) {
    assemble.run('scripts:bootstrap');
    assemble.run('scripts:plugins');
    assemble.run('scripts:libs');
    assemble.run('scripts:main');
    assemble.run('scripts:development');
  } else {
    assemble.run('scripts:development');
    return assemble
      .src([
        'scripts/jquery/jquery.js',
        'scripts/jquery/bootstrap/transition.js',
        'scripts/jquery/bootstrap/alert.js',
        'scripts/jquery/bootstrap/button.js',
        'scripts/jquery/bootstrap/carousel.js',
        'scripts/jquery/bootstrap/collapse.js',
        'scripts/jquery/bootstrap/dropdown.js',
        'scripts/jquery/bootstrap/modal.js',
        'scripts/jquery/bootstrap/tooltip.js',
        'scripts/jquery/bootstrap/popover.js',
        'scripts/jquery/bootstrap/scrollspy.js',
        'scripts/jquery/bootstrap/tab.js',
        'scripts/jquery/bootstrap/affix.js',
        'scripts/jquery/plugins/*.js',
        'scripts/libs/**/*.js',
        'scripts/views/sources/*.js',
      ])
      .pipe(concat('scripts.js'))
      .pipe(chkif(state, uglify()))
      .pipe(chkif(state, rename('scripts-min.js')))
      .pipe(assemble.dest('assets/js'))
  }
});

// JS Tasks
// ///////////////////////////////////////////////////////////////////////////////

// concatenate jquery and bootstrap files
assemble.task('scripts:bootstrap', function () {
  if (flag) {
    return assemble
    .src(globJQBootstrap)
    .pipe(concat('bootstrap.js'))
    .pipe(chkif(state, uglify()))
    .pipe(chkif(state, rename('bootstrap-min.js')))
    .pipe(assemble.dest('assets/js'));
  } else {
    return assemble
      .run('scripts');
  }
  // return concatenation(globJQbootstrap, bootsDest);
});

// concatenate jquery plugins and libraries other than bootstrap
assemble.task('scripts:plugins', function () {
  if (flag) {
    return assemble
    .src(globJQPlugins)
    .pipe(concat('plugins.js'))
    .pipe(chkif(state, uglify()))
    .pipe(chkif(state, rename('plugins-min.js')))
    .pipe(assemble.dest('assets/js'));
  } else {
    return assemble
    .run('scripts');
  }
  // return concatenation(glob.sync('scripts/jquery/plugins/*.js'), 'assets/js/plugins.js');
});

// concatenate native javascript files and libraries
assemble.task('scripts:libs', function () {
  if (flag) {
    return assemble
    .src(globLIBS)
    .pipe(concat('libs.js'))
    .pipe(chkif(state, uglify()))
    .pipe(chkif(state, rename('libs-min.js')))
    .pipe(assemble.dest('assets/js'));
  } else {
    return assemble
    .run('scripts');
  }
  // return concatenation(glob.sync('scripts/libs/*.js', 'scripts/libs/**/*.js'), 'assets/js/libs.js')
});

// concatenate main site file
assemble.task('scripts:main', function () {
  if (flag) {
    return assemble
    .src(globMAIN)
    .pipe(concat('main.js'))
    .pipe(chkif(state, uglify()))
    .pipe(chkif(state, rename('main-min.js')))
    .pipe(assemble.dest('assets/js'));
  } else {
    return assemble
    .run('scripts');
  }
})

// concatenate development file
assemble.task('scripts:development', function () {

  if (!state) {
    return assemble
      .src(globDEV)
      .pipe(concat('dev.js'))
      .pipe(assemble.dest('assets/js'));
  }
  // return concatenation(glob.sync('scripts/dev/*.js'), 'assets/js/dev.js');
});

// Modernizr process
// ///////////////////////////////////////////////////////////////////////////////

assemble.task('modernizr', function () {
  modernizr({
    "cache" : true,
    "devFile" : 'scripts/views/configs/modernizr-dev.js',
    "dest" : 'assets/js/modernizr.js',
    "options" : [
        "setClasses",
        "addTest",
        "html5printshiv",
        "testProp",
        "fnBind"
    ],
    "uglify" : false,
    "tests" : [],
    "excludeTests": [],
    "crawl" : true,
    "useBuffers": false,
    "files" : {
        "src": [
            "assets/{js,css}/*.{js,css}",
            "!assets/js/modernizr.js"
        ]
    },
    "customTests" : []
  }, function () {
    // all done!
  })
});

// the beginnings of the file wait state
assemble.task('stats', function () {
  fs.stat('assets/js/modernizr.js', function (err, stats) {
    if (stats) console.log('file exists!');
    if (err) console.log('no file at present location.');
  });
});

// uglify-js test run
// assemble.task('mash', function (){
//   var files = ugly.minify(['assets/js/bootstrap.js'], {output: {comments: true}});
//   return fs.writeFileSync('assets/js/main.min.js', files.code );
// })

// function concatenation (src, dest) {
//   concatenate(src, dest, function (err) {
//     if (err !== (null || undefined)) console.log(err);
//   });
// }
    // concatenation(globJQBootstrap, bootsDest);
    // concatenation(glob.sync('scripts/jquery/plugins/*.js'), 'assets/js/plugins.js');
    // concatenation(glob.sync('scripts/libs/*.js', 'scripts/libs/**/*.js'), 'assets/js/libs.js');
    // concatenation(glob.sync('scripts/views/sources/*.js'), 'assets/js/main.js');
    // concatenation(glob.sync('scripts/dev/*.js'), 'assets/js/dev.js');