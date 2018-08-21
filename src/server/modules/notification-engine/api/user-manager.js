/*
User connection ids:

{

    "userId1": ["connection ids"],
    "userId2": ["connection ids"]
}
*/

let redis = require("async-redis");
let config = require('config');
let client = null;
let isStateServerEnabled = config.get('modules.stateServer.enabled');
let isEmpty = require('../../common/utils/isEmpty');

if (isStateServerEnabled) {
    let connectionConfig = config.get('modules.stateServer.connection');
    let redisUrl = "redis://" + connectionConfig.host + ":" + connectionConfig.port;

    client = redis.createClient(redisUrl);

    client.on("error", function (err) {
        console.log("Redis error " + err);
    });
}

let localStorage = {};

async function addUserConnectionIds(userId, connectionId) {
    if (userId && connectionId) {
        let connections = await getData(userId);

        if (isEmpty(connections)) {
            connections = [];
        }

        connections.push(connectionId);

        if (connections) {
            setData(userId, connections);
        }
    }
    //console.log('User connections ', userId, ' --- ' , JSON.stringify(connections));
}

async function removeConnectionIdByUser(userId, connectionId) {
    if (userId && connectionId) {

        let connections = await getData(userId);
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
        let cacheKey = "socket_conn_usr_" + userId;
        let connections = await client.get(cacheKey);
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
    let index = -1;
    index = arr.indexOf(val);
    while (index >= 0) {
        arr.splice(index, 1);
        index = arr.indexOf(val);
    }
}

async function getData(userId) {
    let data = [];

    if (isStateServerEnabled && client) {
        let cacheKey = "socket_conn_usr_" + userId;
        let promise = client.get(cacheKey).then(function (dataString) {
            if(!isEmpty(dataString)) {
                data = dataString.split("#@#");
            }
        });

        await Promise.resolve(promise);
    }
    else if (localStorage[userId]) {
        data = await localStorage[userId];
    }

    return data;
}

async function setData(userId, connections) {
    if (isStateServerEnabled && client) {
        let cacheKey = "socket_conn_usr_" + userId;
        let connectionIds = connections.join("#@#");
        return await client.set(cacheKey, connectionIds);
    }
    else {
        localStorage[userId] = connections;
    }
}

async function deleteData(userId) {
    if (isStateServerEnabled && client) {
        let cacheKey = "socket_conn_usr_" + userId;
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