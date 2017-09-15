/**
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

'use strict';

const path = require('path');
const del = require('del');
const gulp = require('gulp');
const gulpif = require('gulp-if');
const debug = require('gulp-debug');
const browserSync = require('browser-sync');
const reload = browserSync.reload;
const nodemon = require('gulp-nodemon');
var tinylr = require('tiny-lr');
var replace = require('gulp-replace');
const babel = require("gulp-babel");
var argv = require('yargs').argv;

const HtmlSplitter = require('polymer-build').HtmlSplitter,
  sourcesHtmlSplitter = new HtmlSplitter(),
  babelPresetES2015 = require('babel-preset-es2015'),
  babelPresetES2015NoModules = babelPresetES2015.buildPreset({}, { modules: false });

const mergeStream = require('merge-stream');
const polymerBuild = require('polymer-build');

// Here we add tools that will be used to process our source files.
// const imagemin = require('gulp-imagemin');
const { generateCountingSharedBundleUrlMapper,
  generateSharedDepsMergeStrategy } = require('polymer-bundler');

// !!! IMPORTANT !!! //
// Keep the global.config above any of the gulp-tasks that depend on it
global.config = {
  polymerJsonPath: path.join(process.cwd(), 'polymer.json'),
  build: {
    rootDirectory: 'build',
    bundledDirectory: 'bundled/ui-platform',
    unbundledDirectory: 'unbundled/ui-platform',
    devDirectory: 'dev/ui-platform',
    // devDirectory: 'default',
    // Accepts either 'bundled', 'unbundled', or 'both'
    // A bundled version will be vulcanized and sharded. An unbundled version
    // will not have its files combined (this is for projects using HTTP/2
    // server push). Using the 'both' option will create two output projects,
    // one for bundled and one for unbundled
    bundleType: 'both',
    serverFilePaths: ['app.js', 'src/server/**/*.js', 'src/shared/**/*.js'],
    clientFilePaths: ['src/main-app*.*', 'src/elements/**/*.{js,css,html}', 'src/data/**/*.*', 'src/shared/**/*.js'],
    liveReloadPort: 35729
  },
  // Path to your service worker, relative to the build root directory
  serviceWorkerPath: 'service-worker.js',
  // Service Worker precache options based on
  // https://github.com/GoogleChrome/sw-precache#options-parameter
  swPrecacheConfig: {
    navigateFallback: '/',
  },

  elementsSourcePath: './src/elements/**/*',
};
// Additional plugins can be used to optimize your source files after splitting.
// Before using each plugin, install with `npm i --save-dev <package-name>`
// const uglify = require('gulp-uglify');
// const cssSlam = require('css-slam').gulp;
// const htmlMinifier = require('gulp-html-minifier');

const swPrecacheConfig = require('./sw-precache-config.js');
const polymerJson = require(global.config.polymerJsonPath);
const polymerProject = new polymerBuild.PolymerProject(polymerJson);
const buildDirectory = 'build/dev';

const devPath = path.join(global.config.build.rootDirectory, global.config.build.devDirectory);
const bundledPath = path.join(global.config.build.rootDirectory, global.config.build.bundledDirectory);
const unbundledPath = path.join(global.config.build.rootDirectory, global.config.build.unbundledDirectory);

/**
 * Waits for the given ReadableStream
 */
function waitFor(stream) {
  return new Promise((resolve, reject) => {
    stream.on('end', resolve);
    stream.on('error', reject);
  });
}

function devBuild() {
  return new Promise((resolve, reject) => { // eslint-disable-line no-unused-vars

    // Lets create some inline code splitters in case you need them later in your build.
    let sourcesStreamSplitter = new polymerBuild.HtmlSplitter();
    let dependenciesStreamSplitter = new polymerBuild.HtmlSplitter();


    gulp.src([
      './bower_components/polymer/**/*.html'
    ]).pipe(sourcesHtmlSplitter.split())
      .pipe(gulpif(/\.js$/, babel({ "presets": [babelPresetES2015NoModules] })))
      .pipe(sourcesHtmlSplitter.rejoin())
      .pipe(gulp.dest('./bower_components/polymer'));

    // gulp.src([
    //   './src/elements/**/*.html'
    // ]).pipe(sourcesHtmlSplitter.split())
    //   .pipe(gulpif(/\.js$/, babel({ "presets": [babelPresetES2015NoModules] })))
    //   .pipe(sourcesHtmlSplitter.rejoin())
    //   .pipe(gulp.dest('./src/elements'));

    // gulp.src([
    //   './bower_components/**/*.html',
    // ]).pipe(sourcesHtmlSplitter.split())
    //   .pipe(gulpif(/\.js$/, babel({ "presets": [babelPresetES2015NoModules] })))
    //   .pipe(sourcesHtmlSplitter.rejoin())
    //   .pipe(gulp.dest('./bower_components'));

    gulp.src([
      './bower_components/webcomponentsjs/**/*.html',
    ]).pipe(sourcesHtmlSplitter.split())
      .pipe(gulpif(/\.js$/, babel({ "presets": [babelPresetES2015NoModules] })))
      .pipe(sourcesHtmlSplitter.rejoin())
      .pipe(gulp.dest('./bower_components/webcomponentsjs'));

    // Okay, so first thing we do is clear the build directory
    console.log(`Deleting ${devPath} directory...`);
    del([devPath])
      .then(() => {

        // Let's start by getting your source files. These are all the files
        // in your `src/` directory, or those that match your polymer.json
        // "sources"  property if you provided one.
        let sourcesStream = polymerProject.sources()

          // If you want to optimize, minify, compile, or otherwise process
          // any of your source code for production, you can do so here before
          // merging your sources and dependencies together.
          //   .pipe(gulpif(/\.(png|gif|jpg|svg)$/, imagemin()))

          // The `sourcesStreamSplitter` created above can be added here to
          // pull any inline styles and scripts out of their HTML files and
          // into seperate CSS and JS files in the build stream. Just be sure
          // to rejoin those files with the `.rejoin()` method when you're done.
          .pipe(sourcesStreamSplitter.split())
          // Uncomment these lines to add a few more example optimizations to your
          // source files, but these are not included by default. For installation, see
          // the require statements at the beginning.
          // .pipe(gulpif(/\.js$/, uglify())) // Install gulp-uglify to use
          // .pipe(gulpif(/\.css$/, cssSlam())) // Install css-slam to use
          // .pipe(gulpif(/\.html$/, htmlMinifier())) // Install gulp-html-minifier to use
          //.pipe(gulpif('**/*.js', babel()))
          // Remember, you need to rejoin any split inline code when you're done.
          .pipe(sourcesStreamSplitter.rejoin());
        //.pipe(debug({title:"After join"}));


        // Similarly, you can get your dependencies seperately and perform
        // any dependency-only optimizations here as well.
        let dependenciesStream = polymerProject.dependencies()
          .pipe(dependenciesStreamSplitter.split())
          //.pipe(gulpif(['**/*.js', '!bower_components/web-component-tester/**/*'], babel()))
          // Add any dependency optimizations here.
          .pipe(dependenciesStreamSplitter.rejoin());


        // Okay, now let's merge your sources & dependencies together into a single build stream.
        let buildStream = mergeStream(sourcesStream, dependenciesStream)
          .once('data', () => {
            console.log('Analyzing build dependencies...');
          });

        // If you want bundling, pass the stream to polymerProject.bundler.
        // This will bundle dependencies into your fragments so you can lazy
        // load them.
        // buildStream = buildStream.pipe(polymerProject.bundler({
        //     project: polymerProject,
        //     buildRoot: devPath,
        //     rewriteUrlsInTemplates:true,
        //     bundled: true,
        // }));//.pipe(debug({title:"buildStream:"}));

        // buildStream = buildStream.pipe(polymerProject.bundler({
        //   bundle: false,
        // bundle: {
        //   // excludes: ["src/shared/dataobject-falcor-util.js", "src/shared/enums-util.js"],
        //   stripComments: true,
        //   inlineCss: true,
        // },
        // js: {compile: false}
        // }));//.pipe(debug({title:"bundler:"}));

        // buildStream = buildStream.pipe(polymerProject.bundler({
        //                 excludes: ['bower_components/web-component-tester'],
        //                 sourcemaps: false,
        //                 rewriteUrlsInTemplates: true,
        //                 stripComments: true,
        //                 // strategy: generateSharedDepsMergeStrategy(3),
        //                 // urlMapper: generateCountingSharedBundleUrlMapper('shared/bundle_')
        //               }));

        // Now let's generate the HTTP/2 Push Manifest
        buildStream = buildStream.pipe(polymerProject.addPushManifest());

        // Okay, time to pipe to the build directory
        buildStream = buildStream.pipe(gulp.dest(devPath));//.pipe(debug({title:"Copy:"}));;

        // waitFor the buildStream to complete
        return waitFor(buildStream);
      })
      // .then(() => {
      //   // Okay, now let's generate the Service Worker
      //   console.log('Generating the Service Worker...');
      //   return polymerBuild.addServiceWorker({
      //     project: polymerProject,
      //     buildRoot: devPath,
      //     bundled: true,
      //     swPrecacheConfig: global.config.swPrecacheConfig
      //   });
      // })
      .then(() => {
        // You did it!
        console.log('Build complete!');
        resolve();
      });
  });
}
var lr = null;

gulp.task('app-nodemon', function (cb) {
  var started = false;
  var appPath = devPath + "/app.js"; //default load app from build/unbundled path
  appPath = (argv.appPath !== undefined) ? argv.appPath : appPath;

  var projectPath = appPath.replace('/app.js', '');

  var runOffline = (argv.runOffline !== undefined) ? argv.runOffline : 'false';
  var lrEnabled = true;

  if (appPath === "build/bundled") {
    projectPath = bundledPath;
    appPath = bundledPath + "/app.js";
    lrEnabled = false;
  }
  else if (appPath === "build/unbundled") {
    projectPath = unbundledPath;
    appPath = unbundledPath + "/app.js";
    lrEnabled = false;
  }

  console.log('appPath ', appPath);
  console.log('projectPath ', projectPath);

  if (lrEnabled) {
    lr = tinylr();
    lr.listen(global.config.build.liveReloadPort);
  }

  var stream = nodemon({
    script: appPath, // run ES5 code
    env: {
      'RUN_OFFLINE': runOffline,
      'PROJECT_PATH': projectPath,
      'NODE_CONFIG_DIR': './src/server/config',
      'NODE_ENV': 'development'
    }, // set env variables
    //nodeArgs:['--debug'], // set node args
    watch: global.config.build.serverFilePaths, // watch ES2015 code
    ext: 'js html css json jpg jpeg png gif',
    tasks: function (changedFiles) { // compile synchronously onChange
      var tasks = [];
      if (!changedFiles || !lrEnabled)
        return tasks;
      // compileChangedDevFiles(changedFiles);
      // stackLiveReload(changedFiles);
      return tasks;
    }
  });

  stream.on('start', function () {
    if (!started) {
      cb();
      started = true;
    }
  });

  return stream;
});

gulp.task('watch-element-changes', function () {
  gulp.watch(global.config.build.clientFilePaths).on('change', function (fpath) {
    console.log('file changed...', JSON.stringify(fpath));
    return gulp.src(fpath, { base: '.' })
      .pipe(gulp.dest(devPath));
  });
});

gulp.task('copy-node-modules', function () {
  const bundleType = global.config.build.bundleType;
  const nodeModulesPath = '/node_modules/**/*.*';
  return gulp.src(nodeModulesPath, { base: '.' }).pipe(gulp.dest(unbundledPath));
});

gulp.task('dev', gulp.series(devBuild, 'app-nodemon', 'watch-element-changes'));

function unbundledBuild() {
  return new Promise((resolve, reject) => { // eslint-disable-line no-unused-vars

    // Lets create some inline code splitters in case you need them later in your build.
    let sourcesStreamSplitter = new polymerBuild.HtmlSplitter();
    let dependenciesStreamSplitter = new polymerBuild.HtmlSplitter();

    // Okay, so first thing we do is clear the build directory
    console.log(`Deleting ${unbundledPath} directory...`);
    del([unbundledPath])
      .then(() => {

        // Let's start by getting your source files. These are all the files
        // in your `src/` directory, or those that match your polymer.json
        // "sources"  property if you provided one.
        let sourcesStream = polymerProject.sources()

          // If you want to optimize, minify, compile, or otherwise process
          // any of your source code for production, you can do so here before
          // merging your sources and dependencies together.
          //   .pipe(gulpif(/\.(png|gif|jpg|svg)$/, imagemin()))

          // The `sourcesStreamSplitter` created above can be added here to
          // pull any inline styles and scripts out of their HTML files and
          // into seperate CSS and JS files in the build stream. Just be sure
          // to rejoin those files with the `.rejoin()` method when you're done.
          .pipe(sourcesStreamSplitter.split())
          // Uncomment these lines to add a few more example optimizations to your
          // source files, but these are not included by default. For installation, see
          // the require statements at the beginning.
          // .pipe(gulpif(/\.js$/, uglify())) // Install gulp-uglify to use
          // .pipe(gulpif(/\.css$/, cssSlam())) // Install css-slam to use
          // .pipe(gulpif(/\.html$/, htmlMinifier())) // Install gulp-html-minifier to use
          //.pipe(gulpif('**/*.js', babel()))
          // Remember, you need to rejoin any split inline code when you're done.
          .pipe(sourcesStreamSplitter.rejoin());
        //.pipe(debug({title:"After join"}));


        // Similarly, you can get your dependencies seperately and perform
        // any dependency-only optimizations here as well.
        let dependenciesStream = polymerProject.dependencies()
          .pipe(dependenciesStreamSplitter.split())
          // Add any dependency optimizations here.
          .pipe(dependenciesStreamSplitter.rejoin());


        // Okay, now let's merge your sources & dependencies together into a single build stream.
        let buildStream = mergeStream(sourcesStream, dependenciesStream)
          .once('data', () => {
            console.log('Analyzing build dependencies...');
          });

        // Now let's generate the HTTP/2 Push Manifest
        buildStream = buildStream.pipe(polymerProject.addPushManifest());

        // Okay, time to pipe to the build directory
        buildStream = buildStream.pipe(gulp.dest(unbundledPath));//.pipe(debug({title:"Copy:"}));;

        // waitFor the buildStream to complete
        return waitFor(buildStream);
      })
      .then(() => {
        // You did it!
        console.log('Build complete!');
        resolve();
      });
  });
}
gulp.task('default', gulp.series(unbundledBuild, 'copy-node-modules'));