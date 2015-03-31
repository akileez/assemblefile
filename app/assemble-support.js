//
//    █████╗ ██╗  ██╗██╗██╗     ███████╗███████╗███████╗
//   ██╔══██╗██║ ██╔╝██║██║     ██╔════╝██╔════╝╚══███╔╝
//   ███████║█████╔╝ ██║██║     █████╗  █████╗    ███╔╝
//   ██╔══██║██╔═██╗ ██║██║     ██╔══╝  ██╔══╝   ███╔╝
//   ██║  ██║██║  ██╗██║███████╗███████╗███████╗███████╗
//   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚══════╝╚══════╝

// Assemble Requirements
// ///////////////////////////////////////////////////////////////////////////////

var assemble = require('assemble');
var shell    = require('gulp-shell');
var revall   = require('gulp-rev-all');
var del      = require('del');
var argv     = require('argh').argv;

// Paths
// ///////////////////////////////////////////////////////////////////////////////

var paths = {
  src  : {
    img   : "assets/img/",
    pdf   : "assets/pdf/",
    ico   : "assets/ico/",
    fonts : "assets/fonts/",
    js    : "assets/js/",
    css   : "assets/css/"
  },
  dest : {
    img    : "build/assets/img",
    pdf    : "build/assets/pdf",
    ico    : "build/assets/ico",
    fonts  : "build/assets/fonts",
    js     : "build/assets/js",
    css    : "build/assets/css",
    dico   : "dist/assets/ico",
    dfonts : "dist/assets/fonts"
  }
};

// Rsync assets ==> stage to build dir
// ///////////////////////////////////////////////////////////////////////////////

// Rsync - folder syncs between asset staging and asset build directories
// i.e., 'rsync assets/img/ build/assets/img --recursive --delete-before --verbose --update --prune-empty-dirs --exclude=".DS_Store"'
var rsyncopts =
  '--recursive --delete-before --verbose --update --prune-empty-dirs --exclude=".DS_Store"';

assemble.task('sync:js', shell.task([
  'rsync ' + paths.src.js + ' ' + paths.dest.js + ' ' + rsyncopts
]));

assemble.task('sync:css', shell.task([
  'rsync ' + paths.src.css + ' ' + paths.dest.css + ' ' + rsyncopts
]));

assemble.task('sync:img', shell.task([
  'rsync ' + paths.src.img + ' ' + paths.dest.img + ' ' + rsyncopts
]));

assemble.task('sync:ico', shell.task([
  'rsync ' + paths.src.ico + ' ' + paths.dest.ico + ' ' + rsyncopts
]));

assemble.task('sync:fonts', shell.task([
  'rsync ' + paths.src.fonts + ' ' + paths.dest.fonts + ' ' + rsyncopts
]));

assemble.task('sync:pdf', shell.task([
  'rsync ' + paths.src.pdf + ' ' + paths.dest.pdf + ' ' + rsyncopts
]));

assemble.task('sync:post', shell.task([
  'rsync ' + paths.src.fonts + ' ' + paths.dest.dfonts + ' ' + rsyncopts ,
  'rsync ' + paths.src.ico + ' ' + paths.dest.dico + ' ' + rsyncopts

]));

// Delete files
// ///////////////////////////////////////////////////////////////////////////////

// Clean the assets directory. Wipe it clean.
// REMINDER: need a process to delete development files/folders in build directory
assemble.task('clean:init', function (cb) {
  del([
    'assets/css/*.*',
    'assets/js/*.*'
  ], cb);
});

assemble.task('clean:build', function (cb) {
  del([
    'build/**/*',
    'build/*.*'
  ], cb);
});

assemble.task('clean:dist', function (cb) {
  del([
    'dist/**/*',
    'dist/*.*'
  ], cb);
});

// Copy files
// ///////////////////////////////////////////////////////////////////////////////

// Copy directories. Right now only creating directory structure. No files.
// use assemble.copy for actual copying of file assets.
assemble.task('copy:build', function () {
  return assemble.src('assets/**/*', {read: false})
    .pipe(assemble.dest('build/assets'));
});

assemble.task('testcopy', function () {
  return assemble.copy('assets/img/*.*', 'zztest/');
});

// command line is just so simple. I love the command line but I love
// javascript as well.
assemble.task('copy:dist', shell.task([
  'cp -a build/ dist/'
]));

// Asset Revision
// ///////////////////////////////////////////////////////////////////////////////

assemble.task('rev', function () {
  return assemble
    .src(['dist/**', '!dist/assets/fonts/**'])
    .pipe(revall({
      ignore: [/\.html/g]
    }))
    .pipe(assemble.dest('dist'));
});

// Delay messages
// ///////////////////////////////////////////////////////////////////////////////

// Add some delay -- allowing for less and js processes to complete
// re-write this section using javascript
assemble.task('delay', shell.task([
  'echo',
  'echo --------------------------------------------',
  'echo Waiting for files to process....',
  'sleep 4 && echo Finished! [ ' + argv.argv + ' ] will now continue',
  'echo --------------------------------------------',
  'echo'
]));

assemble.task('delay:init', shell.task([
  'echo',
  'echo --------------------------------------------',
  'echo Waiting for files to process....',
  'sleep 0.5 && echo Finished! [ ' + argv.argv + ' ] will now continue',
  'echo --------------------------------------------',
  'echo'
]));

// function sleep (ms) {
//   var start = new Date().getTime();
//   while (new Date().getTime() < start + ms);
// }

// Gzip compression
// ///////////////////////////////////////////////////////////////////////////////

// Compress files (gzip) for distribution
assemble.task('compress', shell.task([
  '/usr/bin/gzip -nkv *.html',
  '/usr/bin/gzip -nkv **/*.{html,css,js}'
], {
  cwd: 'dist'
}));

