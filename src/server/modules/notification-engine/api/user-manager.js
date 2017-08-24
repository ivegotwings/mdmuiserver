/*
User connection ids:

{

    "userId1": ["connection ids"],
    "userId2": ["connection ids"]
}
*/

var redis = require("async-redis");
var config = require('config');
var client = null;
var isStateServerEnabled = config.get('modules.stateServer.enabled');
var isEmpty = require('../../common/utils/isEmpty');

if (isStateServerEnabled) {
    var redisConnection = config.get('modules.stateServer.connection');
    client = redis.createClient(redisConnection.port, redisConnection.host);

    client.on("error", function (err) {
        console.log("Redis error " + err);
    });
}

var localStorage = {};

async function addUserConnectionIds(userId, connectionId) {
    if (userId && connectionId) {
        var connections = await getData(userId);

        if (isEmpty(connections)) {
            connections = [];
        }

        connections.push(connectionId);

        if (connections) {
            setData(userId, connections);
        }
    }
    //console.log('User connections ', JSON.stringify(connections));
}

async function removeConnectionIdByUser(userId, connectionId) {
    if (userId && connectionId) {

        var connections = await getData(userId);
        //console.log("Remove connection id by user ---->", userId);
        if (connections) {
            //console.log("Remove connection id by user: connections ---->", JSON.stringify(connections));            
            arrayRemove(connections, connectionId);
            setData(userId, connections);
        }
    }
}

async function removeUserConnectionIds(userId) {
    if (userId) {
        var connections = await client.get(cacheKey);
        //console.log("Remove user from list ---->", userId);
        if (connections) {
            //console.log("Remove user from list: connections ---->", JSON.stringify(connections));
            deleteData(userId);
        }
    }
}

async function getConnectionIdsOfUser(userId) {
    if (userId) {
        return await getData(userId);
    }
}

function arrayRemove(arr, val) {
    var index = -1;
    index = arr.indexOf(val);
    while (index >= 0) {
        arr.splice(index, 1);
        index = arr.indexOf(val);
    }
}

async function getData(userId) {
    var data = [];

    if (isStateServerEnabled && client) {
        var cacheKey = "socket_conn_usr_" + userId;
        var promise = client.get(cacheKey).then(function (dataString) {
            if(!isEmpty(dataString)) {
                data = dataString.split("#@#");
            }
        });

        await Promise.resolve(promise);
    }
    else if (localStorage[cacheKey]) {
        data = await localStorage[cacheKey];
    }

    return data;
}

async function setData(userId, connections) {
    if (isStateServerEnabled && client) {
        var cacheKey = "socket_conn_usr_" + userId;
        var connectionIds = connections.join("#@#");
        return await client.set(cacheKey, connectionIds);
    }
    else {
        localStorage[userId] = connections;
    }
}

async function deleteData(userId) {
    if (isStateServerEnabled && client) {
        var cacheKey = "socket_conn_usr_" + userId;
        await client.del(cacheKey);
    }
    else if (localStorage[userId]) {
        delete localStorage[userId];
    }
}

module.exports = {
    addUserConnectionIds: addUserConnectionIds,
    getConnectionIdsOfUser: getConnectionIdsOfUser,
    removeConnectionIdByUser: removeConnectionIdByUser,
    removeUserConnectionIds: removeUserConnectionIds
}