var socketIo = require('socket.io');
var api = require('./api/notification-manager');
var userManager = require('./api/user-manager');
var executionManager = require('../common/context-manager/execution-context');
var defaultUserId = "unassigned";

function initSockets(server) {
    var io = socketIo.listen(server, { origins: '*:*' });
    console.log('notification engine running . . .');

    io.sockets.on('connect', function (socket) {
        userManager.addUserConnectionIds(defaultUserId, socket.id);

        //Disconnect
        socket.on('disconnect', function (data) {
            if (socket.userName) {
                userManager.removeConnectionIdByUser(socket.userName, socket.id);
            } else {
                userManager.removeConnectionIdByUser(defaultUserId, socket.id);
            }
        });

        //Send Message
        socket.on('send message', function (data, userId) {

            var currentUserSocketIds = [];

            if (userId) {
                currentUserSocketIds = userManager.getConnectionIdsOfUser(userId);
                //console.log('------------------ socket: current user socket id ---------------------');
                //console.log(JSON.stringify(currentUserSocketIds));
                //console.log('-------------------------------------------------------------------\n\n');
                
                if (currentUserSocketIds) {
                    currentUserSocketIds.forEach(function (id) {
                        //console.log('------------------ socket: send message to browser ---------------------');
                        //console.log('socket connection id ', id, ' data ', JSON.stringify(data));
                        //console.log('-------------------------------------------------------------------\n\n');
                        io.to(id).emit('new message', data);
                    }, this);
                }
            }
            else {
                io.sockets.emit('new message', data);
            }
        });

        //New user
        socket.on('Connect new user', function (userId) {
            socket.userName = userId;
            userManager.addUserConnectionIds(userId, socket.id);
            userManager.removeConnectionIdByUser(defaultUserId, socket.id);
        });

    });
};

module.exports = {
    initSockets: initSockets
};