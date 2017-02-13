var clientIO = require("socket.io-client");
var config = require("../Config");

var path = config.clientConfig.host + ":" + config.clientConfig.port;

var clientSocket = clientIO.connect(path);

function sendMessageToAllUser(data) {
        clientSocket.emit('send message', data, '');
}

function sendMessageToSpecificUser(data, user) {
        clientSocket.emit('send message', data, user);
}

module.exports = {
    sendMessageToAllUser : sendMessageToAllUser,
    sendMessageToSpecificUser : sendMessageToSpecificUser
};