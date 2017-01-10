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
    unboxJsonObject: unboxJsonObject
};