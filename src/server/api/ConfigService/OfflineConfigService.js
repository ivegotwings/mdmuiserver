'use strict';

var OfflineServiceBase = require('../OfflineServiceBase');

var OfflineConfigService = function (options) {
    OfflineServiceBase.call(this, options);
};

OfflineConfigService.prototype = {
    getConfigs: function (request) {
        var offlineConfigsData = require("./offline-data/configJson_EXTERNAL.json");

        var configs = [];

        offlineConfigsData.configs.forEach(function (configObject) {
            configs.push(configObject);
        });

        var response = {
            configOperationResponse: {
                status: "success",
                configs: configs
            }
        };

        //console.log(JSON.stringify(response));
        return response;
    }
};

module.exports = OfflineConfigService;