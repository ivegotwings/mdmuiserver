var config = require('config');
var socketManager = require('../socket.js');
var logger = require('../../common/logger/logger-service');

function sendMessageToAllUser(data) {
        if (socketManager.sendMessage) {

                logger.debug("NOTIFICATION_CALL_TO_BROWSER", { detail: { notificationObj: data } }, "notification-service");
                socketManager.sendMessage(data);
        }
        else {
                logger.warn('Server socket is not available', data);
        }
}

function sendMessageToSpecificUser(data, userId) {
        if (socketManager.sendMessage) {

                logger.debug("NOTIFICATION_CALL_TO_BROWSER", { detail: { notificationObj: data, user: userId } }, "notification-service");
                socketManager.sendMessage(data, userId);
        }
        else {
                logger.warn('Server socket is not available', data);
        }
}

module.exports = {
        sendMessageToAllUser: sendMessageToAllUser,
        sendMessageToSpecificUser: sendMessageToSpecificUser
};
