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
var extname  = require('gulp-extname');
var beautify = require('gulp-jsbeautifier');
var replace  = require('gulp-replace');
var fs       = require('fs');
var path     = require('path');
var glob     = require('../nodes/glob');

var filesets1 = [
  "layouts/templates/src/alerts.hbs",
  "layouts/templates/src/assemble.hbs",
  "layouts/templates/src/badges.hbs",
  "layouts/templates/src/code.hbs",
  "layouts/templates/src/compose.hbs"
];




// Assemble Tasks (Base Site) Still testing.
// ///////////////////////////////////////////////////////////////////////////////

assemble.task('site1', function () {
  return assemble
  .src(filesets1)
  .pipe(extname())
  .pipe(assemble.dest('build'));
});

assemble.task('site2', function () {
  return assemble
    .src("layouts/templates/views/*.hbs")
    .pipe(extname())
    .pipe(assemble.dest('build'));
});

assemble.task('pretty', function() {
  return assemble
    .src(['build/*.html', 'build/*.xml'])
    .pipe(beautify({config: '.jsbeautifyrc'}))
    // fixspaces
    .pipe(replace(/(<\/(a|span|strong|em|h1|h2|h3|h4|h5|h6)>(?!(,|\.|!|\?|;|:)))/g, "$1 "))
    // condense new lines
    .pipe(replace(/(\r\n|\n){2,}/g, "\n"))
    // pad comments
    .pipe(replace(/(\s*(?:<!--|\/\*)\s*)(?:(?!.+(\s*(?:<!--|\/\*)\s*)))/g, "\n$1"))
    // make <li><a></li> on one line, but only when li > a
    // .pipe(replace(/(<li>)(\s*)(<a .+)(\s*)(<\/li>)/g, '$1$3$5'))
    .pipe(assemble.dest('build/'));
});

// Assemble Tasks (Aux Site)
// ///////////////////////////////////////////////////////////////////////////////

// sitemap
assemble.task('sitemap', function () {
  return assemble.src('layouts/templates/site/sitemap.hbs', {layout: "layout-sitemap"})
    .pipe(extname('xml'))
    .pipe(assemble.dest('build'));
});

// REMINDER: add error pages, humans/robots.txt, policy, server configs, etc.
// follow hbp5 model...

// Testing ...
// ///////////////////////////////////////////////////////////////////////////////

// testing glob and render. trying to bypass assemble.src and render
// directly. Not working yet. missing some components/parameters.
assemble.task('site3', function () {
  assembleGlob = glob.sync('templates/views/*.hbs');
  function renderGlob (files) {
    files.forEach(function (f) {
      var fn = path.basename(f, path.extname(f));
      var fc = fs.readFileSync(f, 'utf8');
      assemble.render(fc, this.context, function (err, content) {
        fs.writeFileSync('build/' + fn + '.html', content);
      });
    });
  }
  return renderGlob(assembleGlob);
});

// testing glob and render
assemble.task('site4', function () {
  assembleGlob = glob.sync('templates/src/*.hbs');
  return renderGlob(assembleGlob);
});
