var userConnectionIds = {};
var clientSocket;

/*
User connection ids:

{

    "userId1": ["connection ids"],
    "userId2": ["connection ids"]

}
*/

function addUserConnectionIds(userId, connectionId) {
    if (userId && connectionId) {
        if (userConnectionIds[userId]) {
            userConnectionIds[userId].push(connectionId);
        } else {
            userConnectionIds[userId] = [];
            userConnectionIds[userId].push(connectionId);
        }
    }
    //console.log('User connections ', JSON.stringify(userConnectionIds));
}

function removeConnectionIdByUser(userId, connectionId) {
    if (userId && connectionId) {
        if (userConnectionIds[userId]) {
            arrayRemove(userConnectionIds[userId], connectionId);
        }
    }
    //console.log('User connections ', JSON.stringify(userConnectionIds));
}

function removeUserConnectionIds(userId) {
    if (userId && connectionId) {
        if (userConnectionIds[userId]) {
            delete userConnectionIds[userId];
        }
    }
    //console.log('User connections ', JSON.stringify(userConnectionIds));
}

function getConnectionIdsOfUser(userId) {
    if (userId) {
        if (userConnectionIds[userId]) {
            return userConnectionIds[userId];
        }
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

module.exports = {
    addUserConnectionIds: addUserConnectionIds,
    getConnectionIdsOfUser: getConnectionIdsOfUser,
    removeConnectionIdByUser: removeConnectionIdByUser,
    removeUserConnectionIds: removeUserConnectionIds
}