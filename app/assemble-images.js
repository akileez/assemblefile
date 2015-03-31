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
const favicons = require('favicons')
const shell    = require('gulp-shell')

// Favicons generation
// ///////////////////////////////////////////////////////////////////////////////

assemble.task('favicons', function () {
  favicons({
    files: {
        src: null,                // Path(s) for file to produce the favicons. `string` or `object`
        dest: null,               // Path for writing the favicons to. `string`
        html: null,               // Path(s) for HTML file to write or append metadata. `string` or `array`
        iconsPath: null,          // Path for overriding default icons path. `string`
        androidManifest: null,    // Path for an existing android_chrome_manifest.json. `string`
        browserConfig: null,      // Path for an existing browserconfig.xml. `string`
        firefoxManifest: null,    // Path for an existing manifest.webapp. `string`
        yandexManifest: null      // Path for an existing yandex-browser-manifest.json. `string`
    },
    icons: {
        android: true,            // Create Android homescreen icon. `boolean`
        appleIcon: true,          // Create Apple touch icons. `boolean`
        appleStartup: true,       // Create Apple startup images. `boolean`
        coast: true,              // Create Opera Coast icon. `boolean`
        favicons: true,           // Create regular favicons. `boolean`
        firefox: true,            // Create Firefox OS icons. `boolean`
        opengraph: true,          // Create Facebook OpenGraph. `boolean`
        windows: true,            // Create Windows 8 tiles. `boolean`
        yandex: true              // Create Yandex browser icon. `boolean`
    },
    settings: {
        appName: null,            // Your application's name. `string`
        appDescription: null,     // Your application's description. `string`
        developer: null,          // Your (or your developer's) name. `string`
        developerURL: null,       // Your (or your developer's) URL. `string`
        version: 1.0,             // Your application's version number. `number`
        background: null,         // Background colour for flattened icons. `string`
        index: null,              // Path for the initial page on the site. `string`
        url: null,                // URL for your website. `string`
        silhouette: false,        // Turn the logo into a white silhouette for Windows 8. `boolean`
        logging: false            // Print logs to console? `boolean`
    },
    favicon_generation: null,     // Complete JSON overwrite for the favicon_generation object. `object`
  }, function (err, metadata) {
    if (err) throw err;
    console.log(metadata, 'Metadata produced during the build process')
  })
})

// Image minification
// ///////////////////////////////////////////////////////////////////////////////

// Using command line binaries in lieu of gulp-imagemin. More control and
// less dependencies

assemble.task('crush:png', shell.task([
  'echo Starting pngquant ... png images',
  'pngquant -f --ext .png --speed 1 --quality 70-95 *.png',
  'echo Finished pngquant'
], {cwd: 'build/assets/img'}))

assemble.task('crush:jpg', shell.task([
  'echo Starting adept ... jpg imgages',
  'for x in *.jpg; do adept $x; done',
  'echo Finished adept'
], {cwd: 'build/assets/img'}))

assemble.task('crush:svg', shell.task([
  'svgo -f svg'
], {cwd: 'build/assets/img'}))

assemble.task('crush', shell.task([
  'echo Starting ImageOptim ... final processing',
  'open -a ImageOptim .',
  'echo Background processing started.'
], {cwd: 'build/assets/img'}))


