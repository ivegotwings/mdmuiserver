/**
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// This generated service worker JavaScript will precache your site's resources.
// The code needs to be saved in a .js file at the top-level of your site, and registered
// from your pages in order to be used. See
// https://github.com/googlechrome/sw-precache/blob/master/demo/app/js/service-worker-registration.js
// for an example of how you can register this script and handle various service worker events.

/* eslint-env worker, serviceworker */
/* eslint-disable indent, no-unused-vars, no-multiple-empty-lines, max-nested-callbacks, space-before-function-paren */
'use strict';





/* eslint-disable quotes, comma-spacing */
var PrecacheConfig = [["build/unbundled/bower_components/app-layout/app-drawer-layout/app-drawer-layout.html","21cd30c752f21f263821f2cde18c5888"],["build/unbundled/bower_components/app-layout/app-drawer/app-drawer.html","f86acd181e09523554f08e2844d04b33"],["build/unbundled/bower_components/app-layout/app-header-layout/app-header-layout.html","d51e93bbbf13fc3d52ff5f7751407e08"],["build/unbundled/bower_components/app-layout/app-header/app-header.html","e596b7503aa629069cea0a582f83e54b"],["build/unbundled/bower_components/app-layout/app-scroll-effects/app-scroll-effects-behavior.html","8d45e04a72bd81fa3213d81864968395"],["build/unbundled/bower_components/app-layout/app-scroll-effects/app-scroll-effects.html","334eac7f54a828baedbe8f09574571b7"],["build/unbundled/bower_components/app-layout/app-scroll-effects/effects/blend-background.html","53ab90982adbe7457d8603d722c98d2f"],["build/unbundled/bower_components/app-layout/app-scroll-effects/effects/fade-background.html","593bd7855bcc277f33e8c256c45ef039"],["build/unbundled/bower_components/app-layout/app-scroll-effects/effects/material.html","09fc23898ebd40bf11160760df03de86"],["build/unbundled/bower_components/app-layout/app-scroll-effects/effects/parallax-background.html","d50c47e6d50fe8a33e65d10a9c189684"],["build/unbundled/bower_components/app-layout/app-scroll-effects/effects/resize-snapped-title.html","86b6f2dbdfb27e423e30fac70525e479"],["build/unbundled/bower_components/app-layout/app-scroll-effects/effects/resize-title.html","13f8a0807b1bc3364a24b1f14890adda"],["build/unbundled/bower_components/app-layout/app-scroll-effects/effects/waterfall.html","0d19840e1b4112985dacaf8a99513abe"],["build/unbundled/bower_components/app-layout/app-toolbar/app-toolbar.html","0f1e0b29d1769e45fe9ca9fc84dc955e"],["build/unbundled/bower_components/app-layout/helpers/helpers.html","c3e82580bbb4c5e4ac5ebf5c22647016"],["build/unbundled/bower_components/app-route/app-location.html","d87d3ba9436f8da88cbb6ecf5dcde63e"],["build/unbundled/bower_components/app-route/app-route-converter-behavior.html","f0a18330f445ccaead183e1e379635e5"],["build/unbundled/bower_components/app-route/app-route.html","27014edb928c071473f5de170ac78211"],["build/unbundled/bower_components/iron-a11y-keys-behavior/iron-a11y-keys-behavior.html","26309806bc5a08dab92ec43a33bf85ad"],["build/unbundled/bower_components/iron-behaviors/iron-button-state.html","477c03ed546186de581ee1b2495bef3f"],["build/unbundled/bower_components/iron-behaviors/iron-control-state.html","c206f87dd46f347d33c37004913a24b1"],["build/unbundled/bower_components/iron-flex-layout/iron-flex-layout.html","98da82570410cf19e8867b3518e065a5"],["build/unbundled/bower_components/iron-icon/iron-icon.html","8880ba119077cf8dfd62a0a9e620b728"],["build/unbundled/bower_components/iron-iconset-svg/iron-iconset-svg.html","cdb48e4e9d023536ebee0a401bc739b2"],["build/unbundled/bower_components/iron-location/iron-location.html","7f5a7ca3877a9f7a8b92520a71ebc8e3"],["build/unbundled/bower_components/iron-location/iron-query-params.html","e8e72d86b7241373bce2b45669c98f3c"],["build/unbundled/bower_components/iron-media-query/iron-media-query.html","65ec581bf71b4acffa3703a5964e1232"],["build/unbundled/bower_components/iron-meta/iron-meta.html","9a240eda67672e29b82e15898a9619d1"],["build/unbundled/bower_components/iron-pages/iron-pages.html","82d5debc56ced36961be39a181280795"],["build/unbundled/bower_components/iron-resizable-behavior/iron-resizable-behavior.html","e22494690a6d3affa8dbb051c4822641"],["build/unbundled/bower_components/iron-scroll-target-behavior/iron-scroll-target-behavior.html","26d4d006432567d14daec5c8f4defef8"],["build/unbundled/bower_components/iron-selector/iron-multi-selectable.html","c3a5407e403189d9ffbb26a94253cac9"],["build/unbundled/bower_components/iron-selector/iron-selectable.html","a179d62580cfdf7c022dcdf24841487a"],["build/unbundled/bower_components/iron-selector/iron-selection.html","3343a653dfada7e893aad0571ceb946d"],["build/unbundled/bower_components/iron-selector/iron-selector.html","eaec85c290f2dfa24f778a676bf56e15"],["build/unbundled/bower_components/paper-behaviors/paper-inky-focus-behavior.html","07276537aed6235c4126ff8f2f38db6a"],["build/unbundled/bower_components/paper-behaviors/paper-ripple-behavior.html","26f84434724812da0631633cdd54676e"],["build/unbundled/bower_components/paper-icon-button/paper-icon-button.html","d2302a27079e142d6cf27ecb26e21e06"],["build/unbundled/bower_components/paper-ripple/paper-ripple.html","4a6cb07bfe82301eea120ff244bfa40f"],["build/unbundled/bower_components/paper-styles/color.html","731b5f7949a2c3f26ce829fd9be99c2d"],["build/unbundled/bower_components/paper-styles/default-theme.html","9e845d4da61bd65308eb8e4682cd8506"],["build/unbundled/bower_components/polymer/polymer-micro.html","af8229e6bda270a7e63d680064b6422f"],["build/unbundled/bower_components/polymer/polymer-mini.html","14d11d812e0805aa93403d7139cd11a5"],["build/unbundled/bower_components/polymer/polymer.html","2836f833d44245a45ded3b29e00fd800"],["build/unbundled/bower_components/ruf-main-os-navmenu/ruf-main-os-navmenu.html","0e90db2f4dffdeb00260f22f125f9ba1"],["build/unbundled/index.html","e72684107df02cd146c2ece478b52e20"],["build/unbundled/src/my-app.html","f2fd0d2ebdea832eee2cd32be6f4ec4c"],["build/unbundled/src/my-icons.html","ed7d2887893f037fb289349db1772f55"],["build/unbundled/src/my-view1.html","82aa76b087cec18dcfac6cbe0b3bc78e"],["build/unbundled/src/my-view2.html","e46dbdf49776696a991413ed48eead31"],["build/unbundled/src/my-view3.html","c60d7af3d3c735de7912f80164ac7a6a"],["build/unbundled/src/my-view404.html","1a868308b2e49a6682f39b7bc87ce374"],["build/unbundled/src/shared-styles.html","ff87aa73b361d93288d28b4d58a6bf9a"]];
/* eslint-enable quotes, comma-spacing */
var CacheNamePrefix = 'sw-precache-v1--' + (self.registration ? self.registration.scope : '') + '-';


var IgnoreUrlParametersMatching = [/^utm_/];



var addDirectoryIndex = function (originalUrl, index) {
    var url = new URL(originalUrl);
    if (url.pathname.slice(-1) === '/') {
      url.pathname += index;
    }
    return url.toString();
  };

var getCacheBustedUrl = function (url, param) {
    param = param || Date.now();

    var urlWithCacheBusting = new URL(url);
    urlWithCacheBusting.search += (urlWithCacheBusting.search ? '&' : '') +
      'sw-precache=' + param;

    return urlWithCacheBusting.toString();
  };

var isPathWhitelisted = function (whitelist, absoluteUrlString) {
    // If the whitelist is empty, then consider all URLs to be whitelisted.
    if (whitelist.length === 0) {
      return true;
    }

    // Otherwise compare each path regex to the path of the URL passed in.
    var path = (new URL(absoluteUrlString)).pathname;
    return whitelist.some(function(whitelistedPathRegex) {
      return path.match(whitelistedPathRegex);
    });
  };

var populateCurrentCacheNames = function (precacheConfig,
    cacheNamePrefix, baseUrl) {
    var absoluteUrlToCacheName = {};
    var currentCacheNamesToAbsoluteUrl = {};

    precacheConfig.forEach(function(cacheOption) {
      var absoluteUrl = new URL(cacheOption[0], baseUrl).toString();
      var cacheName = cacheNamePrefix + absoluteUrl + '-' + cacheOption[1];
      currentCacheNamesToAbsoluteUrl[cacheName] = absoluteUrl;
      absoluteUrlToCacheName[absoluteUrl] = cacheName;
    });

    return {
      absoluteUrlToCacheName: absoluteUrlToCacheName,
      currentCacheNamesToAbsoluteUrl: currentCacheNamesToAbsoluteUrl
    };
  };

var stripIgnoredUrlParameters = function (originalUrl,
    ignoreUrlParametersMatching) {
    var url = new URL(originalUrl);

    url.search = url.search.slice(1) // Exclude initial '?'
      .split('&') // Split into an array of 'key=value' strings
      .map(function(kv) {
        return kv.split('='); // Split each 'key=value' string into a [key, value] array
      })
      .filter(function(kv) {
        return ignoreUrlParametersMatching.every(function(ignoredRegex) {
          return !ignoredRegex.test(kv[0]); // Return true iff the key doesn't match any of the regexes.
        });
      })
      .map(function(kv) {
        return kv.join('='); // Join each [key, value] array into a 'key=value' string
      })
      .join('&'); // Join the array of 'key=value' strings into a string with '&' in between each

    return url.toString();
  };


var mappings = populateCurrentCacheNames(PrecacheConfig, CacheNamePrefix, self.location);
var AbsoluteUrlToCacheName = mappings.absoluteUrlToCacheName;
var CurrentCacheNamesToAbsoluteUrl = mappings.currentCacheNamesToAbsoluteUrl;

function deleteAllCaches() {
  return caches.keys().then(function(cacheNames) {
    return Promise.all(
      cacheNames.map(function(cacheName) {
        return caches.delete(cacheName);
      })
    );
  });
}

self.addEventListener('install', function(event) {
  event.waitUntil(
    // Take a look at each of the cache names we expect for this version.
    Promise.all(Object.keys(CurrentCacheNamesToAbsoluteUrl).map(function(cacheName) {
      return caches.open(cacheName).then(function(cache) {
        // Get a list of all the entries in the specific named cache.
        // For caches that are already populated for a given version of a
        // resource, there should be 1 entry.
        return cache.keys().then(function(keys) {
          // If there are 0 entries, either because this is a brand new version
          // of a resource or because the install step was interrupted the
          // last time it ran, then we need to populate the cache.
          if (keys.length === 0) {
            // Use the last bit of the cache name, which contains the hash,
            // as the cache-busting parameter.
            // See https://github.com/GoogleChrome/sw-precache/issues/100
            var cacheBustParam = cacheName.split('-').pop();
            var urlWithCacheBusting = getCacheBustedUrl(
              CurrentCacheNamesToAbsoluteUrl[cacheName], cacheBustParam);

            var request = new Request(urlWithCacheBusting,
              {credentials: 'same-origin'});
            return fetch(request).then(function(response) {
              if (response.ok) {
                return cache.put(CurrentCacheNamesToAbsoluteUrl[cacheName],
                  response);
              }

              console.error('Request for %s returned a response status %d, ' +
                'so not attempting to cache it.',
                urlWithCacheBusting, response.status);
              // Get rid of the empty cache if we can't add a successful response to it.
              return caches.delete(cacheName);
            });
          }
        });
      });
    })).then(function() {
      return caches.keys().then(function(allCacheNames) {
        return Promise.all(allCacheNames.filter(function(cacheName) {
          return cacheName.indexOf(CacheNamePrefix) === 0 &&
            !(cacheName in CurrentCacheNamesToAbsoluteUrl);
          }).map(function(cacheName) {
            return caches.delete(cacheName);
          })
        );
      });
    }).then(function() {
      if (typeof self.skipWaiting === 'function') {
        // Force the SW to transition from installing -> active state
        self.skipWaiting();
      }
    })
  );
});

if (self.clients && (typeof self.clients.claim === 'function')) {
  self.addEventListener('activate', function(event) {
    event.waitUntil(self.clients.claim());
  });
}

self.addEventListener('message', function(event) {
  if (event.data.command === 'delete_all') {
    console.log('About to delete all caches...');
    deleteAllCaches().then(function() {
      console.log('Caches deleted.');
      event.ports[0].postMessage({
        error: null
      });
    }).catch(function(error) {
      console.log('Caches not deleted:', error);
      event.ports[0].postMessage({
        error: error
      });
    });
  }
});


self.addEventListener('fetch', function(event) {
  if (event.request.method === 'GET') {
    var urlWithoutIgnoredParameters = stripIgnoredUrlParameters(event.request.url,
      IgnoreUrlParametersMatching);

    var cacheName = AbsoluteUrlToCacheName[urlWithoutIgnoredParameters];
    var directoryIndex = 'index.html';
    if (!cacheName && directoryIndex) {
      urlWithoutIgnoredParameters = addDirectoryIndex(urlWithoutIgnoredParameters, directoryIndex);
      cacheName = AbsoluteUrlToCacheName[urlWithoutIgnoredParameters];
    }

    var navigateFallback = '/index.html';
    // Ideally, this would check for event.request.mode === 'navigate', but that is not widely
    // supported yet:
    // https://code.google.com/p/chromium/issues/detail?id=540967
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1209081
    if (!cacheName && navigateFallback && event.request.headers.has('accept') &&
        event.request.headers.get('accept').includes('text/html') &&
        /* eslint-disable quotes, comma-spacing */
        isPathWhitelisted([], event.request.url)) {
        /* eslint-enable quotes, comma-spacing */
      var navigateFallbackUrl = new URL(navigateFallback, self.location);
      cacheName = AbsoluteUrlToCacheName[navigateFallbackUrl.toString()];
    }

    if (cacheName) {
      event.respondWith(
        // Rely on the fact that each cache we manage should only have one entry, and return that.
        caches.open(cacheName).then(function(cache) {
          return cache.keys().then(function(keys) {
            return cache.match(keys[0]).then(function(response) {
              if (response) {
                return response;
              }
              // If for some reason the response was deleted from the cache,
              // raise and exception and fall back to the fetch() triggered in the catch().
              throw Error('The cache ' + cacheName + ' is empty.');
            });
          });
        }).catch(function(e) {
          console.warn('Couldn\'t serve response for "%s" from cache: %O', event.request.url, e);
          return fetch(event.request);
        })
      );
    }
  }
});




