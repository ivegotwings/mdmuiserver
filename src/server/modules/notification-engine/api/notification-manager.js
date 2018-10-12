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

function sendMessageToSpecificUser(data, userInfo) {
        if (socketManager.sendMessage) {

                logger.debug("NOTIFICATION_CALL_TO_BROWSER", { detail: { notificationObj: data, user: userInfo.userId, tenant: userInfo.tenantId } }, "notification-service");
                socketManager.sendMessage(data, userInfo);
        }
        else {
                logger.warn('Server socket is not available', data);
        }
}

async function setNotificationCountByService(serviceName) {
        let key = this.getNotificationCountCacheKey(serviceName);
        let currentCount = await this.getNotificationCountByService(serviceName);

        if (currentCount && currentCount[serviceName] != undefined) {
                currentCount[serviceName]++;
                return await stateManager.set(key, currentCount);
        } else {
                let value = {};
                value[serviceName] = 1;
                return await stateManager.set(key, value);
        }
}

async function getNotificationCountByService(serviceName) {
        let key = this.getNotificationCountCacheKey(serviceName);
        return await stateManager.get(key);
}

async function getAllNotificationCount(keys) {
        return await stateManager.mget(keys);
}

function getNotificationCountCacheKey(serviceName) {
        return "notification-" + serviceName + "-count";
}

module.exports = {
        sendMessageToAllUser: sendMessageToAllUser,
        sendMessageToSpecificUser: sendMessageToSpecificUser,
        setNotificationCountByService: setNotificationCountByService,
        getNotificationCountByService: getNotificationCountByService,
        getAllNotificationCount: getAllNotificationCount,
        getNotificationCountCacheKey: getNotificationCountCacheKey
};
