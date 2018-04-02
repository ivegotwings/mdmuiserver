
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
const gulpnoop = require('gulp-noop');
const debug = require('gulp-debug');
const uglify = require('gulp-uglify-es').default;

const nodemon = require('gulp-nodemon');
var rename = require("gulp-rename");

var tinylr = require('tiny-lr');
var replace = require('gulp-replace');

const babel = require("gulp-babel");

var argv = require('yargs').argv;

const mergeStream = require('merge-stream');
const polymerBuild = require('polymer-build');
const forkStream = require('polymer-build').forkStream;

const polyBundler = require('polymer-bundler');
const crisper = require('gulp-crisper');

// Additional plugins can be used to optimize your source files after splitting.
// Before using each plugin, install with `npm i --save-dev <package-name>`
// const uglify = require('gulp-uglify');
//const cssSlam = require('css-slam').gulp;
const htmlMin = require('gulp-htmlmin');
const swPrecacheConfig = require('./sw-precache-config.js');
const polymerJson = require('./polymer.json');

const buildDirectory = 'build/ui-platform';
const serverPath = path.join(buildDirectory, 'web-server');
//const nginxDirectory = '/usr/local/etc/nginx';
const es6BundledPath = 'static/es6-bundled';
const es5BundledPath = 'static/es5-bundled';
const es6unBundledPath = 'static/es6-unbundled';

const liveReloadPort = 35729;

let uglifyOptions ={
  parse: {
      ecma:6
  },
  compress: {
    ecma:6,
    drop_console: true,
    passes: 3,
    toplevel:false,
    top_retain: false,
    unsafe: false
      // compress options
  },
  mangle:{
    toplevel:false,
  },
  ecma: 6, // specify one of: 5, 6, 7 or 8
  keep_classnames: false,
  keep_fnames: false,
  ie8: false,
  nameCache: null, // or specify a name cache object
  safari10: false,
  toplevel: false,
  warnings: false,
};

function waitFor(stream) {
  return new Promise((resolve, reject) => {
    stream.on('end', resolve);
    stream.on('error', reject);
  });
}

function deleteFolder(path) {
  return new Promise((resolve, reject) => {
    del([path])
      .then(() => {
        resolve();
      });
  })
}

function serverBuild(buildPath) {
  return new Promise((resolve, reject) => {
    console.log(`BuildPath : ${buildPath} ...`);
    var serverSources = polymerJson.serverSources;
    gulp.src(serverSources, { base: '.' }).pipe(gulp.dest(buildPath));
    //console.log(`Completed : ${buildPath} !`);
    resolve();
  });
}

function clientBuild(relativeBuildPath, bundle, isES5, isDev) {
  return new Promise((resolve, reject) => {

    const polymerProject = new polymerBuild.PolymerProject(polymerJson);

    console.log(`BuildPath : ${relativeBuildPath} ...`);
    
    var buildPath = path.join(buildDirectory, relativeBuildPath);
    //var nginxPath = path.join(nginxDirectory, relativeBuildPath);

    del([buildPath])
    .then(() => {

      let sourcesStream = polymerProject.sources();
      let dependenciesStream = polymerProject.dependencies();        

      let sourcesStreamSplitter = new polymerBuild.HtmlSplitter();
      let dependenciesStreamSplitter = new polymerBuild.HtmlSplitter();

      sourcesStream = sourcesStream.pipe(sourcesStreamSplitter.split());
      dependenciesStream = dependenciesStream.pipe(dependenciesStreamSplitter.split());

      if (isES5) {
        console.log('Transpiling javascripts to ES5... ');
        sourcesStream = sourcesStream.pipe(gulpif('**/*.js', babel({ 'presets': [['es2015', { 'modules': false, 'compact': false, 'allowReturnOutsideFunction': true }]] })));
        dependenciesStream = dependenciesStream.pipe(gulpif(['**/*.js',"!bower_components/pdfjs-dist/**/*.js", "!bower_components/mocha/mocha.js", "!bower_components/jsoneditor/dist/jsoneditor.min.js", "!bower_components/resize-observer-polyfill/**/*.js"], babel({'presets': [['es2015', {'modules': false, 'compact': false, 'allowReturnOutsideFunction': true}]]})));
      }

      if(bundle && !isDev) { 
        sourcesStream = sourcesStream
        .pipe(gulpif("**/*.html", htmlMin({collapseWhitespace: true, minifyCSS: true})))
        .pipe(gulpif("**/*.js", (babel({
          plugins: ["transform-class-properties"]
          }))))
        .pipe(gulpif("**/*.js", uglify(uglifyOptions)))
        
        dependenciesStream = dependenciesStream
        .pipe(gulpif("**/*.html", htmlMin({collapseWhitespace: true, minifyCSS: true})))
        .pipe(gulpif(['**/*.js', "!bower_components/pdfjs-dist/**/*.js", "!bower_components/mocha/mocha.js", "!bower_components/jsoneditor/dist/jsoneditor.min.js", "!bower_components/resize-observer-polyfill/**/*.js"], (babel({
          plugins: ["transform-class-properties"]
          }))))
        .pipe(gulpif(["**/*.js", "!bower_components/resize-observer-polyfill/**/*.js"], uglify(uglifyOptions)))
    }

      sourcesStream = sourcesStream.pipe(sourcesStreamSplitter.rejoin());
      dependenciesStream = dependenciesStream.pipe(dependenciesStreamSplitter.rejoin());
      
      let buildStream = mergeStream(sourcesStream, dependenciesStream)
        .once('data', () => {
          console.log('Analyzing dependencies... ');
        });

      if(bundle) {
        var bundleExcludes = [];

        buildStream = buildStream
          .pipe(polymerProject.bundler({
            excludes: bundleExcludes,
            inlineScripts: true,
            inlineCss: true,
            rewriteUrlsInTemplates: false,
            sourcemaps: false,
            stripComments: true,
            // Merge shared dependencies into a single bundle when
            // they have at least three dependents
            strategy: generateShellOnlyMergeStrategy(polymerJson.shell, 3),
            // Shared bundles will be named:
            // `shared/bundle_1.html`, `shared/bundle_2.html`, etc...
            urlMapper: polyBundler.generateCountingSharedBundleUrlMapper('src/elements/shared-bundles/bundle_')
          }))
          .once('data', () => { console.log('Bundling resources... '); });

        waitFor(buildStream);

        buildStream = buildStream.pipe(gulpif("**/*.html", crisper({
          scriptInHead: false, // true is default 
          onlySplit: false
        })))
        .once('data', () => { console.log('Crisping resources... '); });
      }

      // Now let's generate the HTTP/2 Push Manifest
      //buildStream = buildStream.pipe(polymerProject.addPushManifest());

      buildStream = buildStream.pipe(gulp.dest(buildPath));

      // let build stream finish his work..
      return waitFor(buildStream).then(function (){
              // console.log('Generating the service worker... ');

              // /*gulp task to settimeout all script tags*/
              //  gulp.src(["./build/ui-platform/static/es6-bundled/src/elements/*/*.html"]) 
              //  .pipe(replace(/<script>([\s\S]*?)<\/script>/gm,
              //       function(match, p1, offset, string) { 
              //       if(match.indexOf("saulis") !== -1 || match.indexOf("RUFBehaviors.DataChannel") !== -1 || match.indexOf("window.RUFBehaviors") !== -1 || match.indexOf("window.Polymer") !== -1){
              //         return match;                                        
              //       }
              //       return "<script>" + "setTimeout("+"(function(){" + match.substring(8,match.length-9)+ "})(),0.5)" + "</script>";;  
              //     }
              //   ))
              //  .pipe(gulp.dest('./build/ui-platform/static/es6-bundled/src/elements'));

              //  gulp.src(["./build/ui-platform/static/es6-bundled/src/shared-bundles/*.html"]) 
              //  .pipe(replace(/<script>([\s\S]*?)<\/script>/gm,
              //       function(match, p1, offset, string) {
              //      if(match.indexOf("saulis") !== -1 || match.indexOf("RUFBehaviors.DataChannel") !== -1 || match.indexOf("window.RUFBehaviors") !== -1 || match.indexOf("window.Polymer") !== -1){
              //       return match;                                        
              //      }
              //       return "<script>" + "setTimeout("+"(function(){" + match.substring(8,match.length-9)+ "})(),0.5)" + "</script>";;  
              //     }
              //   ))
              //  .pipe(gulp.dest('./build/ui-platform/static/es6-bundled/src/shared-bundles'));
          resolve();
      });

      resolve();
    });
  });
};

function generateShellOnlyMergeStrategy(shell, maybeMinEntrypoints) {
  const minEntrypoints = maybeMinEntrypoints === undefined ? 2 : maybeMinEntrypoints;
  if (minEntrypoints < 0) {
    throw new Error(`Minimum entrypoints argument must be non-negative`);
  }
  
  return polyBundler.composeStrategies([
    // Merge all bundles that are direct dependencies of the shell into the
    // shell.
    polyBundler.generateEagerMergeStrategy(shell),
    // Create a new bundle which contains the contents of all bundles which
    // either...
    polyBundler.generateMatchMergeStrategy((bundle) => {
      // ...contain the shell file
      return (!bundle.files.has(shell)) &&
          // or are dependencies of at least the minimum number of entrypoints
          // and are not entrypoints themselves.
          bundle.entrypoints.size >= minEntrypoints;
          //&& !getBundleEntrypoint(bundle);
    }),
    // Don't link to the shell from other bundles.
    polyBundler.generateNoBackLinkStrategy([shell]),
  ]);
}

function getBundleEntrypoint(bundle) {
  for (const entrypoint of bundle.entrypoints) {
    if (bundle.files.has(entrypoint)) {
      return entrypoint;
    }
  }

  return null;
}

gulp.task('prod-delete', function () {
  return Promise.all([
    deleteFolder(buildDirectory)
  ]);
});

gulp.task('prod-server-build', function () {
  return Promise.all([
    serverBuild(serverPath)
  ]);
});

gulp.task('prod-es6-bundled-build', function () {
  return Promise.all([
    clientBuild(es6BundledPath, true, false, false)
  ]);
});

gulp.task('dev-es6-bundled-build', function(){
  return Promise.all([
    clientBuild(es6BundledPath, true, false, true)
  ]);  
})

gulp.task('prod-es6-unbundled-build', function () {
  return Promise.all([
    clientBuild(es6unBundledPath, false, false)
  ]);
});

gulp.task('prod-es5-bundled-build', function () {
  return Promise.all([
    clientBuild(es5BundledPath, true, true)
  ]);
});

gulp.task('prod-build-wrap-up', function() {
  return new Promise((resolve, reject) => {
      console.log('Build complete!!');
      resolve();
    });
  }
);

gulp.task('copy-node-modules', function () {
  const nodeModulesPath = '/node_modules/**/*.*';
  return gulp.src(nodeModulesPath, { base: '.' }).pipe(gulp.dest(unbundledPath));
});

gulp.task('prod-client-build', gulp.series('prod-es5-bundled-build', 'prod-es6-bundled-build', 'prod-es6-unbundled-build'));
gulp.task('dev-build', gulp.series('prod-delete', 'prod-server-build', 'prod-es5-bundled-build', 'dev-es6-bundled-build', 'prod-es6-unbundled-build'));
gulp.task('default', gulp.series('prod-delete', 'prod-server-build', 'prod-es6-bundled-build', 'prod-es6-unbundled-build', 'prod-build-wrap-up'));

//gulp.task('default', gulp.series('prod-delete', 'prod-server-build', 'prod-es5-bundled-build', 'prod-es6-bundled-build', 'prod-build-wrap-up'));

var lr = null;

//DEV build just runs nodemon right into source code and thats all...no compilation, no bundling, no babel..
gulp.task('app-nodemon', function (cb) {
  var started = false;
  var appPath = "./app.js"; //default load app from build/unbundled path

  var runOffline = (argv.runOffline !== undefined) ? argv.runOffline : 'false';
  var lrEnabled = true;

  console.log('appPath ', appPath);

  if (lrEnabled) {
    lr = tinylr();
    lr.listen(liveReloadPort);
  }

  var stream = nodemon({
    script: appPath, // run ES5 code
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
      var tasks = [];
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
