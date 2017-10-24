var config = require('config');
var socketManager = require('../socket.js');
var logger = require('../../common/logger/logger-service');

function sendMessageToAllUser(data) {
        if(socketManager.sendMessage) {  

                logger.debug("Sending notification to all user", {detail: {notificationObj:data}}, "notification-service");
                socketManager.sendMessage(data);
        }
        else {
                logger.info('Server socket is not available');
        }
}

function sendMessageToSpecificUser(data, userId) {
        if(socketManager.sendMessage) { 
                
                logger.debug("Sending notification to user", {detail: {notificationObj:data,user:userId}}, "notification-service"); 
                socketManager.sendMessage(data, userId);
        }
        else {
                logger.info('Server socket is not available');
        }
}

module.exports = {
        sendMessageToAllUser: sendMessageToAllUser,
        sendMessageToSpecificUser: sendMessageToSpecificUser
};
