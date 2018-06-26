'use strict';

var DFRestService = require('../../common/df-rest-service/DFRestService');
var RuntimeVersionManager = require('../version-service/RuntimeVersionManager');
let localCacheManager = require('../../local-cache/LocalCacheManager');

const fs = require('fs'),
    path = require('path'),
    isEmpty = require('../../common/utils/isEmpty');

const falcorUtil = require('../../../../shared/dataobject-falcor-util');
let LocalCacheManager = new localCacheManager();

var BaseConfigService = function (options) {
    DFRestService.call(this, options);
};

var SERVICE_CONFIG = require('../../common/df-rest-service/df-rest-service-config.js').SERVICE_CONFIG;

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
        
        let baseConfigResponse = await LocalCacheManager.get(cacheKey);
        if (baseConfigResponse) {
            return falcorUtil.cloneObject(baseConfigResponse);
        }

        if (mode == "offline") {
            baseConfigResponse = await this._getOfflineBaseConfig(url, configId);
        } else {
            baseConfigResponse = await this.post(url, baseConfigRequest);
        }

        await LocalCacheManager.set(cacheKey, falcorUtil.cloneObject(baseConfigResponse));

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
    BaseConfigService: BaseConfigService
};