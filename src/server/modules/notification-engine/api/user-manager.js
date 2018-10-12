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

async function addUserConnectionIds(userInfo, connectionId) {
    if (userInfo && connectionId) {
        let connections = await getData(userInfo);

        if (isEmpty(connections)) {
            connections = [];
        }

        connections.push(connectionId);

        if (connections) {
            setData(userInfo, connections);
        }
    }
    //console.log('User connections ', userId, ' --- ' , JSON.stringify(connections));
}

async function removeConnectionIdByUser(userInfo, connectionId) {
    if (userInfo && connectionId) {

        let connections = await getData(userInfo);
        //console.log("Remove connection id by user ---->", userId);
        if (connections) {
            //console.log("Remove connection id by user: connections ---->", JSON.stringify(connections));            
            arrayRemove(connections, connectionId);
            setData(userInfo, connections);
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

async function getConnectionIdsOfUser(userInfo) {
    if (userInfo) {
        return await getData(userInfo);
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

async function getData(userInfo) {
    let data = [];

    if (userInfo) {
        if (isStateServerEnabled && client) {
            if (userInfo.userId && userInfo.tenantId) {
                let cacheKey = "socket_conn_tenant_" + userInfo.tenantId + "_user_" + userInfo.userId;
                let promise = client.get(cacheKey).then(function (dataString) {
                    if (!isEmpty(dataString)) {
                        data = dataString.split("#@#");
                    }
                });

                await Promise.resolve(promise);
            } else if (userInfo.tenantId) {
                let keys = await _getKeysForTenant(userInfo.tenantId);

                if (keys) {
                    let stateData = await client.mget(keys);

                    if (stateData) {
                        stateData.forEach(item => {
                            if (!isEmpty(item)) {
                                item.split("#@#").forEach(id => {
                                    data.push(id);
                                });
                            }
                        });
                    }
                }
            }

        }
        else {
            if (userInfo.userId && userInfo.tenantId) {
                if (localStorage[userInfo.tenantId + "_" + userInfo.userId]) {
                    data = await localStorage[userInfo.tenantId + "_" + userInfo.userId];
                }
            } else if (userInfo.tenantId) {
                let keys = await _getKeysForTenant(userInfo.tenantId);

                if(keys) {
                    keys.forEach(key => {
                        if(!isEmpty(localStorage[key])) {
                            localStorage[key].forEach(id => {
                                data.push(id);
                            });
                        }
                    })
                }
            }
        }
    }

    return data;
}

async function _getKeysForTenant(tenantId) {
    let keys = [];
    if (tenantId) {
        if (isStateServerEnabled && client) {
            keys = await client.keys("socket_conn_tenant_" + tenantId + "*");
        } else {
            let regex = new RegExp('^' + tenantId);
            keys = Object.keys(localStorage).reduce(function (sum, key) {
                if (regex.test(key)) {
                    sum.push(key);
                }
                return sum;
            }, []);
        }
    }

    return keys;
}

async function setData(userInfo, connections) {
    if (userInfo && connections) {
        if (isStateServerEnabled && client) {
            let cacheKey = "socket_conn_tenant_" + userInfo.tenantId + "_user_" + userInfo.userId;
            let connectionIds = connections.join("#@#");
            return await client.set(cacheKey, connectionIds);
        }
        else {
            localStorage[userInfo.tenantId + "_" + userInfo.userId] = connections;
        }
    }
}

async function deleteData(userInfo) {
    if (userInfo) {
        if (isStateServerEnabled && client) {
            let cacheKey = "socket_conn_tenant_" + userInfo.tenantId + "_user_" + userInfo.userId;
            await client.del(cacheKey);
        }
        else if (localStorage[userInfo.tenantId + "_" + userInfo.userId]) {
            delete localStorage[userInfo.tenantId + "_" + userInfo.userId];
        }
    }
}

module.exports = {
    addUserConnectionIds: addUserConnectionIds,
    getConnectionIdsOfUser: getConnectionIdsOfUser,
    removeConnectionIdByUser: removeConnectionIdByUser,
    removeUserConnectionIds: removeUserConnectionIds
}