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
const path     = require('path')
const glob     = require('../nodes/glob')
const matter   = require('../nodes/gray-matter')
const moment   = require('../nodes/moment')
const cson     = require('../nodes/cson')

// File Manifests
// ///////////////////////////////////////////////////////////////////////////////

function ftree (filenames) {
  var parsed = {}, json
  filenames.forEach(function (f) {
    var bname = path.basename(f, path.extname(f))
    var bpath = path.dirname(f) + '/' +  path.basename(f)
    parsed[bname] = bpath
  })
  // json = JSON.stringify(parsed)
  // return json
  return parsed
}

// create json objects with the contents of:
// {basename: path + basename}
// allows for calling files without using a
// long string in helpers, i.e., {{img img.phone}} as
// opposed to {{img 'assets/img/dir/to/phone.png'}}
assemble.task('setManifests', function() {
  var globmod = glob.sync('modules/**/*.hbs')
  var globjs  = glob.sync('assets/js/*.js')
  var globcss = glob.sync('assets/css/*.css')
  var globimg = glob.sync('assets/{img,ico}/**/*.{png,jpeg,jpg,gif,svg,ico,pdf}')
  var globsty = glob.sync('styles/*.less')
  var globsrc = glob.sync('scripts/**/*.js')

  var fmo = {}, fjs = {}, fcss = {}, fimg = {}, fstyl = {}, fscrp = {};

  // here I am namespacing the separate globs as if
  // they are individual json files loaded via assemble.data
  fmo['mo']         = ftree(globmod); // JSON.parse(ftree(globmod));
  fjs['js']         = ftree(globjs);  // JSON.parse(ftree(globjs));
  fcss['css']       = ftree(globcss); // JSON.parse(ftree(globcss));
  fimg['img']       = ftree(globimg); // JSON.parse(ftree(globimg));
  fstyl['less']     = ftree(globsty); // JSON.parse(ftree(globsty));
  fscrp['code']     = ftree(globsrc); // JSON.parse(ftree(globsrc));

  assemble.data([fmo, fjs, fcss, fimg, fstyl, fscrp]);
  // console.log(fmodule, fjs, fcss);
});

// settings for assemble.watch to update data object when files are added.
assemble.task('set:img', function () {
  var fimg    = {};
  var globimg = glob.sync('assets/{img,ico}/**/*.{png,jpeg,jpg,gif,svg,ico,pdf}');
  fimg['img'] = ftree(globimg); // JSON.parse(ftree(globimg));
  assemble.data(fimg);
});

assemble.task('set:css', function () {
  var fcss    = {};
  var globcss = glob.sync('assets/css/*.css');
  fcss['css'] = ftree(globcss); // JSON.parse(ftree(globcss));
  assemble.data(fcss);
});

assemble.task('set:js', function () {
  var fjs       = {}, fscrp = {};
  var globjs    = glob.sync('assets/js/*.js');
  var globsrc   = glob.sync('scripts/**/*.js');
  fjs['js']     = ftree(globjs); // JSON.parse(ftree(globjs));
  fscrp['code'] = ftree(globsrc); // JSON.parse(ftree(globsrc));
  assemble.data([fjs, fscrp]);
});

// File Map of YFM
// ///////////////////////////////////////////////////////////////////////////////

function fmap (filenames, bdir) {
  var parsed = {}, json;
  filenames.forEach(function (f) {

    var bname = path.dirname(f).split( path.sep ).slice( -1 )[0]
      + '-'
      +  path.basename(f, path.extname(f));

    var mdata = matter.read(f).data;

    if (mdata) {

      if (mdata.date) mdata.iso8601Date = moment(mdata.date).format();

      mdata.parentPath   = path.dirname(f)
        + '/'
        + f.split( path.sep )
        .slice( -1 )[0]
        .replace(/\.hbs/,'.html')
        ;
      mdata.parentDir    = path.dirname(f).split( path.sep ).slice( 3 )[0];
      mdata.buildDir     = path.dirname(f)
        // enter regexs to remove path items which will not translate
        // to the build directory.
        .replace(/layouts\//,'')
        .replace(/templates\//,'')
        .replace(/views/,'')
        .replace(/src/,'')
        ;
      if (mdata.buildDir) {
          mdata.buildDirFileExt = mdata.buildDir
            + '/'
            + path.basename(f)
            .replace(/\.hbs/,'.html')
            ;
      } else {
          mdata.buildDirFileExt = path.basename(f).replace(/\.hbs/,'.html');
      }

      mdata.buildFileExt = path.basename(f).replace(/\.hbs/,'.html');
      mdata.buildFile    = path.basename(f, path.extname(f));
      mdata.buildExt     = path.extname(f).replace(/\.hbs/,'.html');
      mdata.buildDest    = bdir + mdata.buildDirFileExt;
      mdata.autolink     = '../' +  mdata.buildDirFileExt;
    }

    parsed[bname] = mdata;
  });
  // json = JSON.stringify(parsed);
  // return json;
  return parsed;
};

// create a map of the YFM from each hbs file to be published.
// This aids in the automated generation of navigation and
// sitemaps -- among other things like collections. Use case -- building a site in separate
// tasks while needing access to session data for all files.
// Can also build maps for other sets of file, i.e., blogs, articles, etc.
// as need arises.
assemble.task('setMap', function () {
  var bdir          = 'build/';
  var ftemplates    = {};
  var globtmpls     = glob.sync('layouts/templates/**/*.hbs');

  // ftemplates['map'] = JSON.parse(fmap(globtmpls, bdir));
  ftemplates['map'] = fmap(globtmpls, bdir);
  assemble.data([ftemplates]);
  // console.log(ftemplates);
});

// Assemble Context Generation
// ///////////////////////////////////////////////////////////////////////////////

// I write my configs in CSON then convert to JSON/YAML. this new
// process drops the conversion/assemble read method by converting straight
// to assemble.data. prior process used gulp plugins -->
// [gulp-cson, gulp-json-format and gulp-rename, write pretty json file, assemble read file]
assemble.task('setConfig', function () {
  var parsed = {};
  var globCSONdata = glob.sync('config/*.cson');

  globCSONdata.forEach(function (f) {
    var filename = path.basename(f, path.extname(f));
    parsed[filename] = cson.parseFile(f);
    assemble.data(parsed);
  })
});

// Preloading Assemble Layouts & Partials
// ///////////////////////////////////////////////////////////////////////////////

assemble.task('setLayouts', function () {
  assemble.layouts('layouts/{globals,regions}/*.hbs');
  assemble.partials('layouts/sectors/**/*.hbs');
});

// Reloading Assemble Helpers
// ///////////////////////////////////////////////////////////////////////////////

function extend (a, b) {
  for (var key in b) {
    if (b.hasOwnProperty(key)) {
      a[key] = b[key];
    }
  }
  return a;
}

// reloading of helpers doesn't work. require caches the initial load.
// wanted to try it anyway.
assemble.task('helpers', function () {
  var globHelpers = glob.sync('helpers/*.js');
  var helpers = globHelpers.reduce(function (acc, fp) {
    return extend(acc, require(path.resolve(fp)));
  }, {});
  console.log(helpers);
  assemble.helpers(helpers);
});
