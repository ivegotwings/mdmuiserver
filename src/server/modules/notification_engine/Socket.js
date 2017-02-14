var socketio = require('socket.io');
var api = require('./api/NotificationManager');

function initSockets(server) {
    var io = socketio.listen(server, {origins:'*:*'});
    
    var users = [];
    var connections = [];
    var userConnectionId = [];
    
    console.log('notification engine running . . .');

    io.sockets.on('connection', function(socket) {

        connections.push(socket);
        console.log('Connected: %s sockets Connected %s', connections.length, socket.id);
        
        //Disconnect
        socket.on('disconnect', function(data){
            
            if(users.length)
            {
                users.splice(users.indexOf(socket.userName), 1);
                updateUsernames();
            }
            connections.splice(connections.indexOf(socket), 1);

            console.log('Disconnected: %s sockets Connected', connections.length);
        });

        //Send Message
        socket.on('send message', function(data, user){
            
            var currentuserSocketIds = [];

            if(user)
            {               
                userConnectionId.forEach(function(element) {
                    if(element.user == user) {
                        currentuserSocketIds.push(element.socketId);
                    }
                }, this);

                currentuserSocketIds.forEach(function(id){
                    io.to(id).emit('new message', data);
                }, this);
            }
            else
            {
                io.sockets.emit('new message', data);                
            }
        });

        //New user
        socket.on('send user', function(data, callback) {
            callback(true); // needs to be removed after full integration.
            socket.userName = data;
            users.push(socket.userName);
            
            userConnectionId.push({
                socketId: socket.id,
                user: socket.userName
            });
            
            updateUsernames();
        });

        function updateUsernames(){

            io.sockets.emit('get users', users);
        }
    });
};

module.exports = {
    initSockets : initSockets
};