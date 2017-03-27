var socketIo = require('socket.io');
var api = require('./api/notification-manager');
var userManager = require('../users/user-management');

function initSockets(server) {
    var io = socketIo.listen(server, {origins:'*:*'});
    
    var users = [];
    var connections = [];
    var userConnectionId = [];
    
    console.log('notification engine running . . .');

    io.sockets.on('connection', function(socket) {

        //Connected
        socket.on('connected', function(userId) {
            connections.push(socket);
            console.log('Connected: %s sockets Connected %s', connections.length, socket.id);
        });
                
        //Disconnect
        socket.on('disconnect', function(data){
            
            if(socket.userName)
            {
                userManager.removeConnectionIdByUser(socket.userName, socket.id);
            }
            
            connections.splice(connections.indexOf(socket), 1);

            console.log('Disconnected: %s sockets Connected', connections.length);
        });

        //Send Message
        socket.on('send message', function(data, user){
            
            var currentUserSocketIds = [];

            if(user)
            {               
                userConnectionId.forEach(function(element) {
                    if(element.user == user) {
                        currentUserSocketIds.push(element.socketId);
                    }
                }, this);

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
        socket.on('send user', function(userId) {
            socket.userName = userId;
            userManager.addUserConnectionIds(userId, socket.id);
        });

    });
};

module.exports = {
    initSockets : initSockets
};