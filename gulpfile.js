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

const nodemon = require('gulp-nodemon');
let tinylr = require('tiny-lr');
const babel = require("gulp-babel");
let argv = require('yargs').argv;

const eslint = require('gulp-eslint');
const polymerJson = require('./polymer.json');

const buildDirectory = 'build/ui-platform';
const serverPath = path.join(buildDirectory, 'web-server');
//const nginxDirectory = '/usr/local/etc/nginx';
const liveReloadPort = 35729;

function waitFor(stream) {
  return new Promise((resolve, reject) => {
    stream.on('end', resolve);
    stream.on('error', reject);
  });
}

function deleteFolder(path) {
  return new Promise((resolve) => {
    del([path])
      .then(() => {
        resolve();
      });
  })
}

function serverBuild(buildPath) {
  return new Promise((resolve) => {
    console.log(`BuildPath : ${buildPath} ...`);
    let serverSources = polymerJson.serverSources;
    gulp.src(serverSources, {
      base: '.'
    }).pipe(gulp.dest(buildPath));
    //console.log(`Completed : ${buildPath} !`);
    resolve();
  });
}

async function copyPolymerOverrides(buildPath) {
  return await true; //gulp.src('./src/polymer-overrides/**/*').pipe(gulp.dest(buildPath + '/bower_components/polymer/'));
}

gulp.task('eslint-src', function() {
  return gulp.src(['src/**/*.*'])
    .pipe(eslint())
    .pipe(eslint.format());
    //.pipe(eslint.failAfterError());
});

gulp.task('prod-delete', function () {
  return Promise.all([
    deleteFolder(buildDirectory)
  ]);
});

gulp.task('build-server', function () {
  return Promise.all([
    serverBuild(serverPath)
  ]);
});

gulp.task('build-wrap-up', function () {
  return new Promise((resolve) => {
    console.log('Build complete!!');
    resolve();
  });
});

gulp.task('copy-polymer-overrides', async function() {
  return await copyPolymerOverrides('.');
});

gulp.task('dev-build', gulp.series('eslint-src', 'prod-delete', 'build-server', 'copy-polymer-overrides'));
gulp.task('default', gulp.series('build-server', 'copy-polymer-overrides', 'build-wrap-up'));

//gulp.task('default', gulp.series('prod-delete', 'prod-server-build', 'prod-es5-bundled-build', 'prod-es6-bundled-build', 'prod-build-wrap-up'));

let lr = null;

//DEV build just runs nodemon right into source code and thats all...no compilation, no bundling, no babel..
gulp.task('app-nodemon', function (cb) {
  let started = false;
  let appPath = "./app.js"; //default load app from build/unbundled path

  let runOffline = (argv.runOffline !== undefined) ? argv.runOffline : 'false';
  let lrEnabled = true;

  console.log('appPath ', appPath);

  if (lrEnabled) {
    lr = tinylr();
    lr.listen(liveReloadPort);
  }

  let stream = nodemon({
    script: appPath, // run ES5 code
    nodeArgs: ['--inspect'],
    env: {
      'RUN_OFFLINE': runOffline,
      'NODE_CONFIG_DIR': './src/server/config',
      'NODE_ENV': 'development',
      'NODE_MON_PROCESS': true
    }, // set env variables
    //nodeArgs:['--debug'], // set node args
    watch: polymerJson.serverSources, // watch ES2015 code
    ext: 'js html css json jpg jpeg png gif',
    tasks: function (changedFiles) { // compile synchronously onChange
      let tasks = [];
      if (!changedFiles || !lrEnabled) {
        return tasks;
      }
      //compileChangedDevFiles(changedFiles);
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
