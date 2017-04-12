var clientIO = require("socket.io-client");
var config = require("../config");

var path = config.clientConfig.host + ":" + config.clientConfig.port;

var clientSocket = clientIO.connect(path);

function sendMessageToAllUser(data) {
        clientSocket.emit('send message', data, '');
}

function sendMessageToSpecificUser(data, userId) {
        clientSocket.emit('send message', data, userId);
}

module.exports = {
        sendMessageToAllUser: sendMessageToAllUser,
        sendMessageToSpecificUser: sendMessageToSpecificUser
};