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
const fs = require('fs');
const gulp = require('gulp');
const gulpif = require('gulp-if');
const debug = require('gulp-debug');
const browserSync = require('browser-sync');
const reload = browserSync.reload;
const HtmlSplitter = require('polymer-build').HtmlSplitter;

const nodemon = require('gulp-nodemon');
var tinylr = require('tiny-lr');
var replace = require('gulp-replace');
const babel = require("gulp-babel");
var argv = require('yargs').argv;
const hogan = require("hogan.js");
const mergeStream = require('merge-stream');
const forkStream = require('polymer-build').forkStream;
const polymerBuild = require('polymer-build')

// Here we add tools that will be used to process our source files.
// const imagemin = require('gulp-imagemin');
const {generateCountingSharedBundleUrlMapper,
       generateSharedDepsMergeStrategy} = require('polymer-bundler');

// !!! IMPORTANT !!! //
// Keep the global.config above any of the gulp-tasks that depend on it
global.config = {
  polymerJsonPath: path.join(process.cwd(), 'polymer.json'),
  build: {
    rootDirectory: 'build',
    mainDirectory: 'main',
    unbundledDirectory: 'unbundled/ui-platform',
    devDirectory: 'dev',
    bundleType: 'both',
    serverFilePaths: ['app.js', 'src/server/**/*.js'],
    clientFilePaths: ['src/main-app*.*', 'src/elements/**/*.{js,css,html}', 'src/data/**/*.*', 'src/shared/**/*.js'],
    liveReloadPort: 35729
  },
  // Path to your service worker, relative to the build root directory
  serviceWorkerPath: 'service-worker.js',
  swPrecacheConfig: {
    navigateFallback: '/',
  },
  
  elementsSourcePath: './src/elements/**/*',
};

const swPrecacheConfig = require('./sw-precache-config.js');
const polymerJson = require(global.config.polymerJsonPath);
const polymerProject = new polymerBuild.PolymerProject(polymerJson);
const buildDirectory = 'build/dev';
const devPath = path.join(global.config.build.rootDirectory, global.config.build.devDirectory);
const mainPath = path.join(global.config.build.rootDirectory, global.config.build.mainDirectory);
const unbundledPath = path.join(global.config.build.rootDirectory, global.config.build.unbundledDirectory);

var lr = null;

function waitFor(stream) {
  return new Promise((resolve, reject) => {
    stream.on('end', resolve);
    stream.on('error', reject);
  });
}

gulp.task('build-main', function() {
  let dependeciesHtmlSplitter = new HtmlSplitter();
  return del([mainPath])
    .then(() => {
      polymerProject.sources()
        .pipe(gulp.dest(mainPath));
      polymerProject.dependencies()
        .pipe(gulp.dest(mainPath + "/src/static/es6"));
      polymerProject.dependencies()
        .pipe(dependeciesHtmlSplitter.split())
        .pipe(gulpif('**/*.js', babel({'presets': [['es2015', {'modules': false, 'compact': false, 'allowReturnOutsideFunction': true}]]})))
        .pipe(dependeciesHtmlSplitter.rejoin())
        .pipe(gulp.dest(mainPath + "/src/static/es5"))
    })
});

gulp.task('build-dev', function() {
  let dependeciesHtmlSplitter = new HtmlSplitter();
  return del([devPath])
    .then(() => {
      polymerProject.sources()
        .pipe(gulp.dest(devPath));
      polymerProject.dependencies()
        .pipe(gulp.dest(devPath + "/src/static/es6"));
      polymerProject.dependencies()
        .pipe(dependeciesHtmlSplitter.split())
        .pipe(gulpif('**/*.js', babel({'presets': [['es2015', {'modules': false, 'compact': false, 'allowReturnOutsideFunction': true }]]})))
        .pipe(dependeciesHtmlSplitter.rejoin())
        .pipe(gulp.dest(devPath + "/src/static/es5"))
    })
});

gulp.task('run-dev', function (cb) {
  var started = false;
  var appPath = devPath + "/app.js"; //default load app from build/unbundled path
  appPath = (argv.appPath !== undefined) ? argv.appPath : appPath;

  var projectPath = appPath.replace('/app.js', '');

  var runOffline = (argv.runOffline !== undefined) ? argv.runOffline : 'false';
  var lrEnabled = true;
  if(lrEnabled) {
    lr = tinylr();
    lr.listen(global.config.build.liveReloadPort);
  }  
  console.log("appPath", appPath);
  var stream = nodemon({
                  script: appPath,
                  env: { 
                    'RUN_OFFLINE': runOffline, 
                    'PROJECT_PATH': projectPath,
                    'NODE_CONFIG_DIR': './src/server/config',
                    'NODE_ENV': 'development',
                    'BUILD_PATH': 'dev'
                   }
              });
              
    stream.on('start', function() {
      console.log('start');
      if(!started) {
        cb();
        started = true;  
      }
    });

  return stream;
});

gulp.task('run-main', function (cb) {
  var started = false;
  var appPath = mainPath + "/app.js"; //default load app from build/unbundled path
  appPath = (argv.appPath !== undefined) ? argv.appPath : appPath;

  var projectPath = appPath.replace('/app.js', '');

  var runOffline = (argv.runOffline !== undefined) ? argv.runOffline : 'false';
  var lrEnabled = true;

  if(appPath === "build/main") {
    projectPath = bundledPath;
    appPath = bundledPath + "/app.js";
    lrEnabled = false;
  }
  else if(appPath === "build/unbundled") {
    projectPath = unbundledPath;
    appPath = unbundledPath + "/app.js";
    lrEnabled = false;
  }

  if(lrEnabled) {
    lr = tinylr();
    lr.listen(global.config.build.liveReloadPort);
  }  

  console.log("appPath", appPath);
  console.log("projectPath", projectPath);

  var stream = nodemon({
                  script: appPath,
                  env: { 
                    'RUN_OFFLINE': runOffline, 
                    'PROJECT_PATH': projectPath,
                    'NODE_CONFIG_DIR': './src/server/config',
                    'NODE_ENV': 'development',
                    'BUILD_PATH': 'main'
                   }, // set env variables
                  //nodeArgs:['--debug'], // set node args
                  watch: global.config.build.serverFilePaths, // watch ES2015 code
                  ext: 'js html css json jpg jpeg png gif',
                  tasks: function (changedFiles) { // compile synchronously onChange
                    console.log("files changed");
                    var tasks = [];
                    if (!changedFiles || !lrEnabled) {
                      return tasks;
                    }
                     compileChangedDevFiles(changedFiles);
                    // stackLiveReload(changedFiles);
                    
                    return tasks;
                  }
              });
              
    stream.on('start', function() {
      console.log('start');
      if(!started) {
        cb();
        started = true;  
      }
    });

  return stream;
});

gulp.task('watch-dev', function () {  
  gulp.watch(global.config.build.clientFilePaths).on('change', function (fpath) {    
    copyStaticFiles(fpath);
  });
  gulp.watch(global.config.build.serverFilePaths).on('change', function (fpath) {    
    copyServerFiles(fpath);
  });
});

function copyStaticFiles(fpath){
  let dependeciesHtmlSplitter = new HtmlSplitter();
  console.log('Change detected:',fpath);
  gulp.src(fpath)
    .pipe(gulp.dest('build/dev/src/static/es6/' + fpath.substring(0, fpath.lastIndexOf("/"))));
    console.log('► Copying new file to ES6 folder ');
    console.log('► Copying and compiling new file to ES5 folder ');
  return gulp.src(fpath)
    .pipe(dependeciesHtmlSplitter.split())
    .pipe(gulpif('**/*.js', babel({'presets': [['es2015', {'modules': false, 'compact': false, 'allowReturnOutsideFunction': true}]]})))
    .pipe(dependeciesHtmlSplitter.rejoin())
    .pipe(gulp.dest('build/dev/src/static/es5/' + fpath.substring(0, fpath.lastIndexOf("/"))));
}

function copyServerFiles(fpath){
  let dependeciesHtmlSplitter = new HtmlSplitter();
  console.log('Change detected:',fpath);
  console.log('► Copying new server file to /build/dev folder');
  return gulp.src(fpath)
    .pipe(gulp.dest('build/dev/' + fpath.substring(0, fpath.lastIndexOf("/"))));
    
}

gulp.task('copy-node-modules', function () { 
  const bundleType = global.config.build.bundleType;
  const nodeModulesPath = '/node_modules/**/*.*';
  return gulp.src(nodeModulesPath, {base: '.'}).pipe(gulp.dest(unbundledPath));
});

gulp.task('dev', gulp.series('build-dev', 'run-dev', 'watch-dev'));

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
          // .pipe(gulpif('**/*.js', babel()))
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
        // Okay, now let's generate the Service Worker
        console.log('Generating the Service Worker...');
        return polymerBuild.addServiceWorker({
          project: polymerProject,
          buildRoot: unbundledPath,
          bundled: false,
          swPrecacheConfig: swPrecacheConfig
        });
      })
      .then(() => {
        // You did it!
        console.log('Build complete!');
        resolve();
      });
  });
}

gulp.task('default', gulp.series(unbundledBuild, 'copy-node-modules'));