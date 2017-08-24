var clientIO = require("socket.io-client");
var config = require('config');

var path = config.get('modules.notificationEngine.url');
console.log(path);

var clientSocket = clientIO.connect(path);

console.log('client loaded');

clientSocket.on('connect', function(data) {
        console.log('client socket is connected ', data);
});

function sendMessageToAllUser(data) {
        clientSocket.emit('send message', data, '');
}

function sendMessageToSpecificUser(data, userId) {
        console.log('send msg to sepecific user', path);
        
        clientSocket.emit('xxx', data, userId);
}

module.exports = {
        sendMessageToAllUser: sendMessageToAllUser,
        sendMessageToSpecificUser: sendMessageToSpecificUser
};