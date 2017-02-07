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
const gulp = require('gulp');
const gulpif = require('gulp-if');
const debug = require('gulp-debug');
const browserSync = require('browser-sync');
const reload = browserSync.reload;
const nodemon = require('gulp-nodemon');
var tinylr = require('tiny-lr');
var replace = require('gulp-replace');

const babel = require("gulp-babel");
const uglify = require('gulp-uglify');
const htmlmin = require('gulp-htmlmin');
const cleanCSS = require('gulp-clean-css');

var argv = require('yargs').argv;

// Got problems? Try logging 'em
// const logging = require('plylog');
// logging.setVerbose();

// !!! IMPORTANT !!! //
// Keep the global.config above any of the gulp-tasks that depend on it
global.config = {
  polymerJsonPath: path.join(process.cwd(), 'polymer.json'),
  build: {
    rootDirectory: 'build',
    bundledDirectory: 'bundled/ui-platform',
    unbundledDirectory: 'unbundled/ui-platform',
    devDirectory: 'dev/ui-platform',
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

// Add your own custom gulp tasks to the gulp-tasks directory
// A few sample tasks are provided for you
// A task should return either a WriteableStream or a Promise
const clean = require('./gulp-tasks/clean.js');
const images = require('./gulp-tasks/images.js');
const project = require('./gulp-tasks/project.js');

// The source task will split all of your source files into one
// big ReadableStream. Source files are those in src/** as well as anything
// added to the sourceGlobs property of polymer.json.
// Because most HTML Imports contain inline CSS and JS, those inline resources
// will be split out into temporary files. You can use gulpif to filter files
// out of the stream and run them through specific tasks. An example is provided
// which filters all images and runs them through imagemin
function source() {
  return project.splitSource()
    // Add your own build tasks here!
    //.pipe(gulpif('**/*.{png,gif,jpg,svg}', images.minify()))
    //.pipe(gulpif('**/*.css', cleanCSS()))
    // .pipe(gulpif('**/*.html', htmlmin({
    //    collapseWhitespace: true,
    //    removeComments: true,
    //    minifyCSS: true,
    //    uglifyJS: true
    //  })))
    .pipe(gulpif('**/*.js', babel()))
    //.pipe(gulpif('**/*.js', uglify()))
    .pipe(project.rejoin()); // Call rejoin when you're finished
}

// This source task will process dev build
function devSource() {
  return project.splitSource()
    .pipe(gulpif('**/*.js', babel()))
    .pipe(project.rejoin()); // Call rejoin when you're finished
}

// The dependencies task will split all of your bower_components files into one
// big ReadableStream
// You probably don't need to do anything to your dependencies but it's here in
// case you need it :)
function dependencies() {
  return project.splitDependencies()
    // .pipe(gulpif('**/*.{png,gif,jpg,svg}', images.minify()))
    // .pipe(gulpif('**/*.css', cleanCSS()))
    // .pipe(gulpif('**/*.html', htmlmin({
    //    collapseWhitespace: true,
    //    removeComments: true,
    //    minifyCSS: true,
    //    uglifyJS: true
    //  })))
    .pipe(gulpif('**/*.js', babel()))
    //.pipe(gulpif('**/*.js', uglify()))
    .pipe(project.rejoin());
}

// The dependencies task will split all of your bower_components files into one
// big ReadableStream
// You probably don't need to do anything to your dependencies but it's here in
// case you need it :)
function devDependencies() {
  //var depsPath = path.join(project.devPath, 'bower_components');
  //gulp.src('bower_components/**/*').pipe(gulp.dest(depsPath));

  return project.splitDependencies()
    //.pipe(gulpif('**/*.js', babel()))
    .pipe(project.rejoin());
}

// This source task will split all the changed files into one big ReadableStream.
// Because most HTML Imports contain inline CSS and JS, those inline resources
// will be split out into temporary files. You can use gulpif to filter files
// out of the stream and run them through specific tasks.
function compileChangedDevFiles(changedFiles) {
  return project.splitChangedSource(changedFiles)
    .pipe(gulpif('**/*.js', babel()))
    .pipe(project.rejoin())
    .pipe(gulp.dest(project.devPath));
}

// Clean the build directory, split all source and dependency files into streams
// and process them, and output bundled and unbundled versions of the project
// with their own service workers
gulp.task('default', gulp.series([
  clean.build,
  project.merge(source, dependencies),
  project.serviceWorker,
  project.copyunbundledNodeModules
]));

// Clean the dev build directory, split all source and dependency files into streams
// and process them, and output bundled and unbundled versions of the project
// with their own service workers
gulp.task('dev', gulp.series([
  clean.devBuild,
  project.devMerge(devSource, devDependencies)
]));

gulp.task('sync-browser-run', function() {
  browserSync({
    port: 5000,
    notify: true,
    reloadOnRestart: true,
    logPrefix: 'RS',
    snippetOptions: {
      rule: {
        match: '<span id="browser-sync-binding"></span>',
        fn: function(snippet) { return snippet; }
      }
    },
    https: false,
    files: [".tmp/**/*.*", "src/**/*.*"],
    proxy: 'http://localhost:8080',
  });

  //gulp.watch(['src/**/*'], gulp.series([project.copyReusableComponents, reload]));
  gulp.watch(['src/**/*'], reload);
});

gulp.task("copyX", gulp.series([project.copyReusableComponents]));

// a timeout variable
var timer = null;
var lr = null;

function stackLiveReload(changedFiles) {
    // Stop timeout function to run livereload if this function is ran within the last 250ms
    if (timer) clearTimeout(timer);
    // Check if any gulp task is still running
    if (!gulp.isRunning) {
        timer = setTimeout(function() {
            console.log('live reloading file...', changedFiles);
            if(!lr) return;
            lr.changed({
                        body: {
                          files: changedFiles 
                        }
                    });
        }, 250);
    }
}

gulp.task('app-nodemon', function (cb) {
  var started = false;
  var appPath = project.devPath + "/app.js"; //default load app from build/unbundled path
  var lrEnabled = true;
  var appPath = (argv.appPath !== undefined) ? argv.appPath : appPath;
  var runOffline = (argv.runOffline !== undefined) ? argv.runOffline : 'false';

  if(appPath === "build/bundled") {
    appPath = project.bundledPath + "/app.js";
    lrEnabled = false;
  }
  else if(appPath === "build/unbundled") {
    appPath = project.unbundledPath + "/app.js";
    lrEnabled = false;
  }

  if(lrEnabled) {
    lr = tinylr();
    lr.listen(global.config.build.liveReloadPort);
  }

  var stream = nodemon({
                  script: appPath, // run ES5 code
                  env: { 'RUN_OFFLINE': runOffline }, // set env variables
                  //nodeArgs:['--debug'], // set node args
                  watch: global.config.build.serverFilePaths, // watch ES2015 code
                  ext: 'js html css json jpg jpeg png gif',
                  tasks: function (changedFiles) { // compile synchronously onChange
                    var tasks = [];
                    if (!changedFiles || !lrEnabled) 
                      return tasks;
                    compileChangedDevFiles(changedFiles);
                    stackLiveReload(changedFiles);
                    return tasks;
                  } 
              });
              
    stream.on('start', function(){    
      if(!started) {
        cb();
        started = true;  
      }
    });

  return stream;
});

gulp.task('watch-element-changes', function () {  
  gulp.watch(global.config.build.clientFilePaths).on('change', function (fpath) {
    console.log('file changed...', JSON.stringify(fpath));
    compileChangedDevFiles(fpath);
    stackLiveReload(fpath);    
  });
});

gulp.task('nodemodules', project.copyunbundledNodeModules);
gulp.task('app', gulp.series(['dev',gulp.parallel(['app-nodemon', 'watch-element-changes'])]));
gulp.task('app-monitor', gulp.series([gulp.parallel(['app-nodemon', 'watch-element-changes'])]));
gulp.task('app-prod', gulp.series(['app-nodemon']));

//This should not be used almost all the time..kept it just for fall back in case when compiled dev does not work for whatever reason..
gulp.task('app-nocompile', function (cb) {
  var started = false;
  var appPath = "app.js";
  
  var appPath = (argv.appPath !== undefined) ? argv.appPath : appPath;
  var runOffline = (argv.runOffline !== undefined) ? argv.runOffline : 'false';

  //console.log(appPath, runOffline);

  if(appPath === "build/bundled") {
    appPath = 'build/bundled/ui-platform/app.js';
  } else if(appPath === "build/unbundled") {
    appPath = 'build/unbundled/ui-platform/app.js';
  }

  return nodemon({
    script: appPath,
    nodeArgs:['--debug'],
    env: { 'RUN_OFFLINE': runOffline }
  }).on('start', function () {
    // to avoid nodemon being started multiple times
    if (!started) {
      cb();
      started = true;
    }
  });
});