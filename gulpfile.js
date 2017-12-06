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

const mergeStream = require('merge-stream');
const polymerBuild = require('polymer-build');

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
function deleteFolder(path){
    return new Promise((resolve, reject) => {
        del([path])
        .then(() => {
            resolve();
        });
    })
}
function appBuild(buildPath, mode, env){
  if(!mode){
    mode = "es6";
  }
  if(!env){
    env = "prod";
  }
  return new Promise((resolve, reject) => {
      let sourcesStreamSplitter = new polymerBuild.HtmlSplitter();
      let dependenciesStreamSplitter = new polymerBuild.HtmlSplitter();
      console.log(`BuildPath is ${buildPath} ..`);
      var finalPath = (mode == "es5") ? path.join(buildPath, "es5-unbundled") : buildPath;
      var delPromise = del([finalPath])
        .then(() => {
            let sourcesStream = polymerProject.sources().pipe(sourcesStreamSplitter.split());
            let dependenciesStream = polymerProject.dependencies().pipe(dependenciesStreamSplitter.split());
            if(mode == "es5"){
              sourcesStream = sourcesStream.pipe(gulpif('**/*.js', babel({'presets': [['es2015', {'modules': false, 'compact': false, 'allowReturnOutsideFunction': true}]]})));
              dependenciesStream = dependenciesStream.pipe(gulpif(['**/*.js', "!bower_components/pdfjs-dist/**/*.js", "!bower_components/mocha/mocha.js", "!bower_components/jsoneditor/dist/jsoneditor.min.js", "!bower_components/resize-observer-polyfill/**/*.js"], babel({'presets': [['es2015', {'modules': false, 'compact': false, 'allowReturnOutsideFunction': true}]]})));
            }
            
            sourcesStream = sourcesStream.pipe(sourcesStreamSplitter.rejoin());
            dependenciesStream = dependenciesStream.pipe(dependenciesStreamSplitter.rejoin());

            let buildStream = mergeStream(sourcesStream, dependenciesStream)
              .once('data', () => {
                console.log('Analyzing '+mode+' build dependencies...');
              });
            buildStream = buildStream.pipe(polymerProject.addPushManifest())
                                      .pipe(gulp.dest(finalPath));
            return waitFor(buildStream)
        });
        if(env == "prod"){
          delPromise = delPromise.then(() => {
            // Okay, now let's generate the Service Worker
            console.log('Generating the Service Worker...');
            return polymerBuild.addServiceWorker({
              project: polymerProject,
              buildRoot: finalPath,
              bundled: false,
              swPrecacheConfig: swPrecacheConfig
            });
          })
        }
        delPromise = delPromise.then(() => {
          console.log(mode+' Build complete!');
          resolve();
        });
  });
};

function watchElementBuild(fpath, mode){
  var finalPath = (mode == "es5") ? path.join(devPath, "es5-unbundled") : devPath;
  return new Promise((resolve, reject) => {
        return gulp.src(fpath, {base:'.'})
          .pipe(gulp.dest(finalPath));
    })
};

function compileChangedDevFiles(changedFiles){
    var tasks = [
                  watchElementBuild(changedFiles),
                  watchElementBuild(changedFiles, "es5")
                ];
    return Promise.all(tasks);
}
var lr = null;

gulp.task('app-nodemon', function (cb) {
  var started = false;
  var appPath = devPath + "/app.js"; //default load app from build/unbundled path
  appPath = (argv.appPath !== undefined) ? argv.appPath : appPath;

  var projectPath = appPath.replace('/app.js', '');

  var runOffline = (argv.runOffline !== undefined) ? argv.runOffline : 'false';
  var lrEnabled = true;

  if(appPath === "build/bundled") {
    projectPath = bundledPath;
    appPath = bundledPath + "/app.js";
    lrEnabled = false;
  }
  else if(appPath === "build/unbundled") {
    projectPath = unbundledPath;
    appPath = unbundledPath + "/app.js";
    lrEnabled = false;
  }

  console.log('appPath ', appPath);
  console.log('projectPath ', projectPath);

  if(lrEnabled) {
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
                    if (!changedFiles || !lrEnabled) {
                      return tasks;
                    }
                    compileChangedDevFiles(changedFiles);
                    // stackLiveReload(changedFiles);
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
      compileChangedDevFiles(fpath)
  });
});

gulp.task('copy-node-modules', function () { 
  const bundleType = global.config.build.bundleType;
  const nodeModulesPath = '/node_modules/**/*.*';
  return gulp.src(nodeModulesPath, {base: '.'}).pipe(gulp.dest(unbundledPath));
});

gulp.task('dev-env', function(){
    var tasks = [appBuild(devPath, "es6", "dev")];
    if(argv.es5){
      tasks.push(appBuild(devPath, "es5", "dev"))
    }
    return Promise.all(tasks)
});

gulp.task('dev-delete', function(){
    return Promise.all([
        deleteFolder(devPath)
    ]);
});

gulp.task('dev', gulp.series('dev-delete', 'dev-env', 'app-nodemon', 'watch-element-changes'));

gulp.task('prod-env', function(){
    var tasks = [
                  appBuild(unbundledPath),
                  appBuild(unbundledPath, "es5")
                ];
    return Promise.all(tasks)
});

gulp.task('prod-delete', function(){
    return Promise.all([
        deleteFolder(unbundledPath)
    ]);
});
gulp.task('default', gulp.series('prod-delete', 'prod-env' , 'copy-node-modules'));