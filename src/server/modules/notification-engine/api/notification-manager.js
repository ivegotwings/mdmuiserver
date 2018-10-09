let config = require('config');
let socketManager = require('../socket.js');
let logger = require('../../common/logger/logger-service');
let stateManager = require('../../common/state-manager/state-manager');

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

async function setNotificationCountByService(serviceName) {
        let currentCount = await this.getNotificationCountByService(serviceName);

        if (currentCount) {
                currentCount = 0;
        }

        await stateManager.set('notification-' + serviceName + '-count', currentCount++);
}

async function getNotificationCountByService(serviceName) {
        return await stateManager.get('notification-' + serviceName + '-count');
}

module.exports = {
        sendMessageToAllUser: sendMessageToAllUser,
        sendMessageToSpecificUser: sendMessageToSpecificUser,
        setNotificationCountByService: setNotificationCountByService,
        getNotificationCountByService: getNotificationCountByService
};
