//
//    █████╗ ██╗  ██╗██╗██╗     ███████╗███████╗███████╗
//   ██╔══██╗██║ ██╔╝██║██║     ██╔════╝██╔════╝╚══███╔╝
//   ███████║█████╔╝ ██║██║     █████╗  █████╗    ███╔╝
//   ██╔══██║██╔═██╗ ██║██║     ██╔══╝  ██╔══╝   ███╔╝
//   ██║  ██║██║  ██╗██║███████╗███████╗███████╗███████╗
//   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚══════╝╚══════╝

// Assemble Requirements
// ///////////////////////////////////////////////////////////////////////////////

var assemble     = require('assemble');
var preen        = require('../nodes/preen');
var cbi          = require('../nodes/clean-bower-installer');
var bowerBrowser = require('../nodes/bower-browser');
var browserSync  = require('../nodes/browser-sync');
var reload       = browserSync.reload;

// Environment
// ///////////////////////////////////////////////////////////////////////////////

var env   = assemble.get('BUILD_ENV');
var stage = assemble.get('BUILD_STAGE');
var flag  = (env === "production" && stage === "prod");

// Browser-Sync
// ///////////////////////////////////////////////////////////////////////////////

// REMINDER: setup multiple configs for browserSync dealing with the env.
assemble.task('server', function () {
  if (!flag) {
    browserSync({
      server: {
        baseDir: 'build'
      },
      watchOptions: {
        debounceDelay: 5000
      },
      notify: false,
      minify: false
    });
  } else {
    browserSync({
      server: {
        baseDir: 'build'
      },
      watchOptions: {
        debounceDelay: 5000
      },
      notify: false,
      minify: false,
      proxy: 'local.dev'
    });
  }

  assemble.watch([
    'index.html',
    'assets/css/*.css',
    'assets/js/*.js'
  ], {cwd: 'build'}, reload);
});

// Bower related processing
// ///////////////////////////////////////////////////////////////////////////////

// bower-browser -- manage bower via browser
assemble.task('bowerserve', function () {
  bowerBrowser({
    // path: 'path/to/project',  // Location of bower.json. default: null (use process.cwd())
    // port: 8080,               // Port number. default: 3010
    // cache: 0,                 // Cache TTL. Set 0 to force to fetch API. default: 86400 (24hrs)
    // open: false,              // Prevent opening browser. default: true (open automatically)
    silent: true              // Print nothing to stdout. default: false
  })
  .on('close', function() {
    console.log('Closing bower-browser!');
  });
});

// clean up bower components. basically remove everything that
// is not listed and needed for my project. This needs to be configured either
// in the bower.json file or in the function here.
assemble.task('preen', function() {
  preen.preen({
    // options here
  }, function (err) {
    console.log(err);
  });
})

// REMINDER: expand clean-bower-installer to operationally do all bower tasks.
assemble.task('cbi', function () {
  cbi.run();
});