'use strict';

var OfflineServiceBase = require('../common/service-base/OfflineServiceBase');

var OfflineConfigService = function (options) {
    OfflineServiceBase.call(this, options);
};

OfflineConfigService.prototype = {
    getConfigs: function (request) {
        //console.log('Offline config get with request: ', JSON.stringify(request, null, 2));

        var offlineConfigsData = require("./offline-data/config_EXTERNAL.json");

        var configs = [];

        //console.log('OfflineConfigService.getConfigs...', JSON.stringify(offlineConfigsData, null, 2));
        
        request.apps.forEach(function(appName) {
            offlineConfigsData.configs.forEach(function(configObject) {
                if(appName === configObject.name) {
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
    getConfigComponentNames: function(request) {
        //console.log('getConfigComponentNames called with request: ', JSON.stringify(request, null, 2));
        var offlineComponentListData = require("./offline-data/config-component-list_EXTERNAL.json");

        var configs = [];

        //console.log('OfflineConfigService.getConfigComponentNames...', JSON.stringify(offlineComponentListData, null, 2));
        
        request.apps.forEach(function(appName) {
            offlineComponentListData.configs.forEach(function(configObject) {
                if(appName === configObject.name) {
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