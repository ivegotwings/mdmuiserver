'use strict';

const DFServiceBase = require('../service-base/DFServiceBase'),
    OfflineRestService = require('./OfflineRestService'),
    executionContext = require('../../common/context-manager/execution-context'),
    notificationUtil = require('../../../../shared/dataobject-notification-util'),
    moment = require('moment');

var SERVICE_CONFIG = require('./df-rest-service-config.js').SERVICE_CONFIG;

var offlineRestService = null;
var notifyUtil = notificationUtil.DataObjectNotificationUtil;

var DFRestService = function (options) {
    DFServiceBase.call(this, options);

    offlineRestService = new OfflineRestService(options);

    this.post = async function (url, request, offlineCallback = this.defaultOfflineCallback) {
        //console.log('DFRestService url', url);
        //console.log('DFRestService request', JSON.stringify(request));
        var serviceConfig = SERVICE_CONFIG.services[url];
        //console.log('DFRestService serviceConfig', JSON.stringify(serviceConfig));

        var actualUrl = serviceConfig.url,
            configMode = serviceConfig.mode;
            
        // set timeout option if found in service config
        if(serviceConfig.timeout) {
            request.timeout = serviceConfig.timeout;
        }

        if (configMode === "disabled") {
            throw "Requested service url " + url + " is disabled / not available.";
        }
        else {
            var mode = options && options.runOffline && options.runOffline === "true" ? "offline" : configMode;

            if (mode == "online") {
                _updateRequestObject(request);
                return await this.requestJson(actualUrl, request);
            }
            else {
                return await offlineCallback(url, request);
            }
        }
    };

    this.defaultOfflineCallback = async function (url, request) {
        return await offlineRestService.post(url, request);
    };
};

// Since workflow transition is using pass through we have to add this request update function in DFResetService
var _updateRequestObject = function (request) {
    var timeStamp = moment().toISOString();
    var securityContext = executionContext.getSecurityContext();
    var callerContext = executionContext.getCallerContext();
    var clientUrl = "";

    if (callerContext) {
        clientUrl = "http://" + callerContext.hostName + ":5005/api/notify";
    }

    if (notifyUtil && securityContext) {
        //console.log('sec context to be updated ', JSON.stringify(securityContext));
        notifyUtil.updateRequestObjectForNotification(request, securityContext.headers.userId, timeStamp, clientUrl);
    }
}

module.exports = DFRestService;








