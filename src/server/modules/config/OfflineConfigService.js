'use strict';

var OfflineServiceBase = require('../common/service-base/OfflineServiceBase'),
    executionContext = require('../common/context-manager/execution-context');

var OfflineConfigService = function (options) {
    OfflineServiceBase.call(this, options);
};

OfflineConfigService.prototype = {
    getConfigs: function (request) {
        //console.log('Offline config get with request: ', JSON.stringify(request, null, 2));
        var tenantId = 't1';

        var securityContext = executionContext.getSecurityContext();

        if (securityContext) {
            tenantId = securityContext.tenantId;
        }
        var configUrl = "./offline-data/" + tenantId + "/config_EXTERNAL.json";
        var offlineConfigsData = require(configUrl);

        var configs = [];

        //console.log('OfflineConfigService.getConfigs...', JSON.stringify(offlineConfigsData, null, 2));

        request.apps.forEach(function (appName) {
            offlineConfigsData.configs.forEach(function (configObject) {
                if (appName === configObject.name) {
                    configs.push(configObject);
                }
            });
        });

        var response = {
            configOperationResponse: {
                status: "success",
                configs: configs
            }
        };

        //console.log(JSON.stringify(response));
        return response;
    },
    getConfigComponentNames: function (request) {
        var tenantId = 't1';

        var securityContext = executionContext.getSecurityContext();

        if (securityContext) {
            tenantId = securityContext.tenantId;
        }
        var componentListUrl = "./offline-data/" + tenantId + "/config-component-list_EXTERNAL.json";
        var offlineComponentListData = require(componentListUrl);

        var configs = [];

        //console.log('OfflineConfigService.getConfigComponentNames...', JSON.stringify(offlineComponentListData, null, 2));

        request.apps.forEach(function (appName) {
            offlineComponentListData.configs.forEach(function (configObject) {
                if (appName === configObject.name) {
                    configs.push(configObject);
                }
            });
        });

        var response = {
            configOperationResponse: {
                status: "success",
                configs: configs
            }
        };

        //console.log("returning from offline config service: ", JSON.stringify(response, null, 2));
        return response;
    }
};

module.exports = OfflineConfigService;