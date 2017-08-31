var userManager = require('./api/user-manager');
var config = require('config');

var defaultUserId = "unassigned";
var serverSocket;
var io;

function initSockets(http) {
    io = require('socket.io')(http, { origins: '*:*', transports: ['websocket', 'polling'] });

    var isStateServerEnabled = config.get('modules.stateServer.enabled');

    if (isStateServerEnabled) {
        var redis = require('socket.io-redis');
        io.adapter(redis(config.get('modules.stateServer.connection')));
    }

    //console.log('notification engine running . . .');

    io.on('connection', function (socket) {
        //console.log('socket connected ', socket.server.path());
        //userManager.addUserConnectionIds(defaultUserId, socket.id);

        //New user
        socket.on('Connect new user', function (userId) {
            //console.log('new user connected ', userId);
            socket.userName = userId;
            userManager.addUserConnectionIds(userId, socket.id);
            io.emit('send message', {}, userId);
            //userManager.removeConnectionIdByUser(defaultUserId, socket.id);
        });

        //Disconnect
        socket.on('disconnect', function (data) {
            console.log('user disconnected ', socket.userName);

            if (socket.userName) {
                userManager.removeConnectionIdByUser(socket.userName, socket.id);
            } else {
                //userManager.removeConnectionIdByUser(defaultUserId, socket.id);
            }
        });   
    });
};

function sendMessage(data, userId) {
    //console.log('socket.js send message called with user id ', userId);

    if(!io) {
        throw "Socket.io service is not initialized or is unavailable right now";
    }

    var currentUserSocketIds = [];

    if (userId) {
        userManager.getConnectionIdsOfUser(userId).then(function (currentUserSocketIds) {
            // console.log('------------------ socket: current user socket id ---------------------');
            // console.log(JSON.stringify(currentUserSocketIds));
            // console.log('-------------------------------------------------------------------\n\n');

            if (currentUserSocketIds) {
                currentUserSocketIds.forEach(function (id) {
                    // console.log('------------------ socket: send message to browser ---------------------');
                    // console.log('socket connection id ', id, ' data ', JSON.stringify(data));
                    // console.log('-------------------------------------------------------------------\n\n');
                    io.to(id).emit('new message', data);
                }, this);
            }
        });
    }
    else {
        io.emit('new message', data);
    }    
}

module.exports = {
    initSockets: initSockets,
    sendMessage: sendMessage
};