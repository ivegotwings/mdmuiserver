var socketIo = require('socket.io');
var api = require('./api/notification-manager');
var userManager = require('./api/user-manager');
var executionManager = require('../common/context-manager/execution-context');
var defaultUserId = "unassigned";

function initSockets(server) {
    var io = socketIo.listen(server, {origins:'*:*'});
    console.log('notification engine running . . .');

    io.sockets.on('connect', function(socket) {
        userManager.addUserConnectionIds(defaultUserId, socket.id);

        //Disconnect
        socket.on('disconnect', function(data){
            if(socket.userName) {
                userManager.removeConnectionIdByUser(socket.userName, socket.id);
            } else {
                userManager.removeConnectionIdByUser(defaultUserId, socket.id);
            }
        });

        //Send Message
        socket.on('send message', function(data, userId){
            
            var currentUserSocketIds = [];
            
            if(userId)
            {      
                currentUserSocketIds = userManager.getConnectionIdsOfUser(userId);
                //console.log(JSON.stringify(currentUserSocketIds));
                currentUserSocketIds.forEach(function(id){
                    io.to(id).emit('new message', data);
                }, this);
            }
            else
            {
                io.sockets.emit('new message', data);                
            }
        });

        //New user
        socket.on('Connect new user', function(userId) {
            socket.userName = userId;
            userManager.addUserConnectionIds(userId, socket.id);
            userManager.removeConnectionIdByUser(defaultUserId, socket.id);
        });

    });
};

module.exports = {
    initSockets : initSockets
};