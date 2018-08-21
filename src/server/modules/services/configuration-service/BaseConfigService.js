'use strict';

let DFRestService = require('../../common/df-rest-service/DFRestService');
let RuntimeVersionManager = require('../version-service/RuntimeVersionManager');
let localCacheManager = require('../../local-cache/LocalCacheManager');

const fs = require('fs'),
    path = require('path'),
    isEmpty = require('../../common/utils/isEmpty');

const falcorUtil = require('../../../../shared/dataobject-falcor-util');
let LocalCacheManager = new localCacheManager();

let BaseConfigService = function (options) {
    DFRestService.call(this, options);
};

let SERVICE_CONFIG = require('../../common/df-rest-service/df-rest-service-config.js').SERVICE_CONFIG;

BaseConfigService.prototype = {
    get: async function (url, baseConfigRequest) {
        let serviceConfig = SERVICE_CONFIG.services[url];
        let tenant = this.getTenantId();
        let runtimeVersion = await RuntimeVersionManager.getVersion();

        let mode = "online";
        if (serviceConfig && serviceConfig.baseConfigMode && serviceConfig.baseConfigMode == "offline") {
            mode = "offline";
        }
        let configId = baseConfigRequest.params.query.id;
        let cacheKey = await this.getCacheKey(tenant, configId);
        
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
        let runtimeVersion = await RuntimeVersionManager.getVersion();
        let cacheKey = "".concat(tenant,"_", configId,"_", runtimeVersion);
        return cacheKey;
    },
    _getOfflineBaseConfig: async function (url, fileId) {
        let fileName = fileId.replace("-base_uiConfig", "") + ".json";
        fileName = fileName.replace("sys_", "");
        
        let baseConfigFilePath = path.join(process.cwd(), "../customer-seed-tenant-base/50-uiconfig/00-base/" + fileName);
        let file = require(baseConfigFilePath);
        let configObjects = file.configObjects ? file.configObjects : [];
        let resObj = {
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