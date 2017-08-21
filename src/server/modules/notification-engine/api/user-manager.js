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

if(isStateServerEnabled) {
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
       
        if(!connections) {
            connections = [];
        }
        
        connections.push(connectionId);
         
        if(connections && connections.length > 0) {
            setData(userId, connections);
        }
    }
    //console.log('User connections ', JSON.stringify(connections));
}

async function removeConnectionIdByUser(userId, connectionId) {
    if (userId && connectionId) {
      
        var connections = await getData(userId);
       
        if(connections) {
            arrayRemove(connections, connectionId);
            setData(userId, connections);
        }
    }
}

async function removeUserConnectionIds(userId) {
    if (userId) {
        var connections = await client.get(cacheKey);
        if (connections) {
            deleteData(userId);
        }
    }
}

async function getConnectionIdsOfUser(userId) {
    var connections = [];

    if (userId) {
        var result = await getData(userId);
        if(result) {
            connections = result;
        }
    }

    return connections;
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
    if(isStateServerEnabled && client) {
        var cacheKey = "socket_conn_usr_" + userId;
        return await client.get(cacheKey);
    }
    else if(localStorage[cacheKey]){
        return localStorage[cacheKey];
    }
    else {
        return undefined;
    }
}

async function setData(userId, connections) {
    if(isStateServerEnabled && client) {
        var cacheKey = "socket_conn_usr_" + userId;
        return await client.set(cacheKey, connections);
    }
    else {
        localStorage[userId] = connections;
    }
}

async function deleteData(userId) {
     if(isStateServerEnabled && client) {
        var cacheKey = "socket_conn_usr_" + userId;
        await client.del(cacheKey);
    }
    else if(localStorage[userId]){
        delete localStorage[userId];
    }
}

module.exports = {
    addUserConnectionIds: addUserConnectionIds,
    getConnectionIdsOfUser: getConnectionIdsOfUser,
    removeConnectionIdByUser: removeConnectionIdByUser,
    removeUserConnectionIds: removeUserConnectionIds
}