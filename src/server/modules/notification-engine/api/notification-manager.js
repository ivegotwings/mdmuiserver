var config = require('config');
var socketManager = require('../socket.js');

function sendMessageToAllUser(data) {
        if(socketManager.sendMessage) {  
                socketManager.sendMessage(data);
        }
        else {
                console.log('server socket is not available');
        }
}

function sendMessageToSpecificUser(data, userId) {
        if(socketManager.sendMessage) {  
                socketManager.sendMessage(data, userId);
        }
        else {
                console.log('server socket is not available');
        }
}

module.exports = {
        sendMessageToAllUser: sendMessageToAllUser,
        sendMessageToSpecificUser: sendMessageToSpecificUser
};