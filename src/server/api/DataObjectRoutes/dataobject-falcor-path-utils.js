'use strict';

var isObject = require('../Utils/isObject');
var expireTime = -60 * 60 * 1000; // 60 mins

function createPath(pathSet, value, expires) {    
    if(isObject(value)) {
        value.$timestamp = (Date.now() / 1000 | 0);
        value.$expires = expires !== undefined ? expires : expireTime;
    }
    
    return {
        'path': pathSet,
        'value': value
    };
}

function mergePathSets(pathSet1, pathSet2){
    return pathSet1.concat(pathSet2);
}

function mergeAndCreatePath(basePath, pathSet, value, expires) {
    var mergedPathSet = mergePathSets(basePath, pathSet);
    return createPath(mergedPathSet, value, expires);
}

module.exports = {
    createPath: createPath,
    mergeAndCreatePath: mergeAndCreatePath,
    mergePathSets: mergePathSets
};