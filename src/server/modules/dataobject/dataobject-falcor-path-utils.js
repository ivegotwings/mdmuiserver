'use strict';

var isObject = require('../common/utils/isObject');
var defaultExpiryDurationInMs = - (480 * 60 * 1000); // 480 mins...means 8 hours..

function createPath(pathSet, value, expires) {
    if (isObject(value)) {
        value.$timestamp = (Date.now() / 1000 | 0);
        value.$expires = expires !== undefined ? expires : defaultExpiryDurationInMs;
    }

    return {
        'path': pathSet,
        'value': value
    };
}

function prepareValueJson(value, expires) {
    if (isObject(value)) {
        value.$timestamp = (Date.now() / 1000 | 0);
        value.$expires = expires !== undefined ? expires : defaultExpiryDurationInMs;
    }
    
    return value;
}

function mergePathSets() {
    var mergedPathSets = [];
    var args = Array.prototype.splice.call(arguments, 0);
    var mergedPathSets = Array.prototype.concat.apply([], args);
    return mergedPathSets;
}

function mergeAndCreatePath(basePath, pathSet, value, expires) {
    var mergedPathSet = mergePathSets(basePath, pathSet);
    return createPath(mergedPathSet, value, expires);
}

module.exports = {
    createPath: createPath,
    mergeAndCreatePath: mergeAndCreatePath,
    mergePathSets: mergePathSets,
    prepareValueJson: prepareValueJson
};