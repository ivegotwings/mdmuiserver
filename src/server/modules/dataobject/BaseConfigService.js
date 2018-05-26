'use strict';

var DFRestService = require('../common/df-rest-service/DFRestService');
var RuntimeVersionManager = require('../version-service/RuntimeVersionManager');

const fs = require('fs'),
    path = require('path'),
    isEmpty = require('../common/utils/isEmpty');

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
        var runtimeVersion = await RuntimeVersionManager.getVersion();

        var mode = "online";
        if (serviceConfig && serviceConfig.baseConfigMode && serviceConfig.baseConfigMode == "offline") {
            mode = "offline";
        }
        var configId = baseConfigRequest.params.query.id;
        var cacheKey = await this.getCacheKey(tenant, configId);

        if (localConfigCache[runtimeVersion] && localConfigCache[runtimeVersion][cacheKey]) {
            return falcorUtil.cloneObject(localConfigCache[runtimeVersion][cacheKey]);
        }

        var baseConfigResponse;
        if (mode == "offline") {
            baseConfigResponse = await this._getOfflineBaseConfig(url, configId);
        } else {
            baseConfigResponse = await this.post(url, baseConfigRequest);
        }

        isEmpty(localConfigCache[runtimeVersion]) && (localConfigCache[runtimeVersion] = {});
        localConfigCache[runtimeVersion][cacheKey] = falcorUtil.cloneObject(baseConfigResponse);
        
        return baseConfigResponse;
    },
    getCacheKey: async function(tenant, configId) {
        var runtimeVersion = await RuntimeVersionManager.getVersion();
        var cacheKey = "".concat(tenant,"_", configId,"_", runtimeVersion);
        return cacheKey;
    },
    _getOfflineBaseConfig: async function (url, fileId) {
        var fileName = fileId.replace("-base_uiConfig", "") + ".json";
        fileName = fileName.replace("sys_", "");
        
        var baseConfigFilePath = path.join(process.cwd(), "../customer-seed-tenant-base/50-uiconfig/00-base/" + fileName);
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

module.exports =   { 
    BaseConfigService: BaseConfigService,
    localConfigCache: localConfigCache
};