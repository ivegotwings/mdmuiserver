'use strict';

let redis = require("async-redis");
let config = require('config');
let client = null;
let isStateServerEnabled = config.get('modules.stateServer.enabled');
let isEmpty = require('../utils/isEmpty');

if (isStateServerEnabled) {
    let connectionConfig = config.get('modules.stateServer.connection');
    let redisUrl = "redis://" + connectionConfig.host + ":" + connectionConfig.port;

    client = redis.createClient(redisUrl);

    client.on("error", function (err) {
        console.log("Redis error " + err);
    });
}

let localStorage = {};

async function get(key) {
    let data = undefined;
    let cacheKey = getCacheKey(key);
    let redisError = false;
    if (isStateServerEnabled && client) {
        try {
            data = await client.get(cacheKey);
            if (!isEmpty(data)) {
                //console.log('data: ', 'cache key:', cacheKey, 'value:', data);
                data = JSON.parse(data);
                //console.log('data parsed: ', 'cache key:', cacheKey, 'value:', data);
            }
        }
        catch (err) {
            console.log('redis fetch failed', err);
            redisError = true;
        }
    }

    if (!(isStateServerEnabled && client) && localStorage[cacheKey] || redisError) {
        data = await localStorage[cacheKey];
    }

    return data;
}

async function mget(keys) {
    let data = [];
    let cacheKeys = [];

    if(keys) {
        keys.forEach(key => {
            cacheKeys.push(getCacheKey(key));
        });
    }

    let redisError = false;
    if (isStateServerEnabled && client) {
        try {
            let resData = await client.mget(cacheKeys);

            if(resData) {
                resData.forEach(item => {
                    if(!isEmpty(item)) {
                        data.push(JSON.parse(item));
                    } else {
                        data.push("");
                    }
                });
            }
        }
        catch (err) {
            console.log('redis fetch failed', err);
            redisError = true;
        }
    }

    return data;
}

async function set(key, value) {
    let cacheKey = getCacheKey(key);

    if (isStateServerEnabled && client) {
        return await client.set(cacheKey, JSON.stringify(value));
    }
    else {
        localStorage[cacheKey] = value;
    }
}

async function remove(key) {
    let cacheKey = getCacheKey(key);
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
    mget: mget,
    remove: remove
}
