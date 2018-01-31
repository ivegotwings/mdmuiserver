'use strict';

var DFRestService = require('../common/df-rest-service/DFRestService');
const fs = require('fs'),
    path = require('path');

const falcorUtil = require('../../../shared/dataobject-falcor-util');

var BaseConfigService = function (options) {
    DFRestService.call(this, options);
};

var SERVICE_CONFIG = require('../common/df-rest-service/df-rest-service-config.js').SERVICE_CONFIG;

var localConfigCache = {};

BaseConfigService.prototype = {
    get: async function (url, baseConfigRequest) {
        var serviceConfig = SERVICE_CONFIG.services[url];
        var tenant = this.getTenantId();

        var mode = "online";
        if (serviceConfig && serviceConfig.baseConfigMode && serviceConfig.baseConfigMode == "offline") {
            mode = "offline";
        }
        var fileId = baseConfigRequest.params.query.id;
        var cacheKey = tenant + "_" + fileId;

        if (localConfigCache[cacheKey]) {
            return falcorUtil.cloneObject(localConfigCache[cacheKey]);
        }

        var baseConfigResponse;
        if (mode == "offline") {
            baseConfigResponse = await this._getOfflineBaseConfig(url, fileId);
        } else {
            baseConfigResponse = await this.post(url, baseConfigRequest);
        }

        localConfigCache[cacheKey] = falcorUtil.cloneObject(baseConfigResponse);

        return baseConfigResponse;
    },
    _getOfflineBaseConfig: async function (url, fileId) {
        var fileName = fileId.replace("-base_uiConfig", "") + ".json";
        var baseConfigFilePath = path.join(process.cwd(), "../customer-seed-tenant-base/999-New-ui-config-WIP/00-base/" + fileName);
        var file = require(baseConfigFilePath);
        var configObjects = file.configObjects ? file.configObjects : [];
        var resObj = {
            response: {
                "configObjects": configObjects
            }
        };
        return resObj;
    }
}

module.exports = BaseConfigService;