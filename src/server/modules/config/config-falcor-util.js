'use strict';

var jsonGraph = require('falcor-json-graph'),
    $ref = jsonGraph.ref,
    $error = jsonGraph.error,
    $atom = jsonGraph.atom,
    expireTime = -60 * 60 * 1000; // 60 mins

function createPath(pathSet, value, expires) {
    return {
        'path': pathSet,
        'value': value,
        '$expires': expires !== undefined ? expires : expireTime
    };
}

function mergePathSets(pathSet1, pathSet2){
    //console.log('mergePathSets called with pathSet1: ', pathSet1, " pathSet2: ", pathSet2);
    return pathSet1.concat(pathSet2);
}

function mergeAndCreatePath(basePath, pathSet, value, expires) {
    var mergedPathSet = mergePathSets(basePath, pathSet);
    return createPath(mergedPathSet, value, expires);
}

function unboxConfigData(config) {
   return config;
}

function unboxJsonObject(obj) {
    if (obj && obj.$type) {
        return obj.value;
    } else {
        return obj;
    }
}

module.exports = {
    createPath: createPath,
    unboxConfigData: unboxConfigData,
    unboxJsonObject: unboxJsonObject,
    mergePathSets: mergePathSets,
    mergeAndCreatePath: mergeAndCreatePath
};