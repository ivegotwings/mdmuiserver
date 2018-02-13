'use strict';

var redis = require("async-redis");
var config = require('config');
var client = null;
var isStateServerEnabled = config.get('modules.stateServer.enabled');
var isEmpty = require('../utils/isEmpty');

if (isStateServerEnabled) {
    var connectionConfig = config.get('modules.stateServer.connection');
    var redisUrl = "redis://" + connectionConfig.host + ":" + connectionConfig.port;

    client = redis.createClient(redisUrl);

    client.on("error", function (err) {
        console.log("Redis error " + err);
    });
}

var localStorage = {};

async function get(key) {
    var data;
    var cacheKey = getCacheKey(key);

    if (isStateServerEnabled && client) {
        var promise = client.get(cacheKey).then(function (dataString) {
            //console.log('received data from redis: ', dataString);
            data = dataString;
        });

        await Promise.resolve(promise);
    }
    else if (localStorage[cacheKey]) {
        data = await localStorage[cacheKey];
    }

    return data;
}

async function set(key, value) {
    var cacheKey = getCacheKey(key);

    if (isStateServerEnabled && client) {
        return await client.set(cacheKey, value);
    }
    else {
        localStorage[cacheKey] = value;
    }
}

async function remove(key) {
    var cacheKey = getCacheKey(key);
    if (isStateServerEnabled && client) {
        await client.del(cacheKey);
    }
    else if (localStorage[cacheKey]) {
        delete localStorage[cacheKey];
    }
}

function getCacheKey(key) {
    return "state_" + key;
}

module.exports = {
    get: get,
    set: set,
    remove: remove
}