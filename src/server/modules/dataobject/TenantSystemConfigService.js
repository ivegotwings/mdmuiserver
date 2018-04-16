'use strict';

var DFRestService = require('../common/df-rest-service/DFRestService');
var RuntimeVersionManager = require('../version-service/RuntimeVersionManager');

const fs = require('fs'),
    path = require('path');

const falcorUtil = require('../../../shared/dataobject-falcor-util');

var TenantSystemConfigService = function (options) {
    DFRestService.call(this, options);
};

var SERVICE_CONFIG = require('../common/df-rest-service/df-rest-service-config.js').SERVICE_CONFIG;

var localConfigCache = {};

TenantSystemConfigService.prototype = {
    get: async function (url, tenantConfigRequest) {
        var tenant = this.getTenantId();

        var mode = "online";
        var configId = tenantConfigRequest.params.query.id;
        var cacheKey = await this.getCacheKey(tenant, configId);

        if (localConfigCache[cacheKey]) {
            return falcorUtil.cloneObject(localConfigCache[cacheKey]);
        }

        var tenantConfigResponse;
        var tenantConfigMetadata;

        tenantConfigResponse = await this.post(url, tenantConfigRequest, "dataplatform");
        tenantConfigMetadata = this.getTenantMetadata(tenantConfigResponse);

        localConfigCache[cacheKey] = falcorUtil.cloneObject(tenantConfigMetadata);
        return tenantConfigMetadata;
    },
    getCacheKey: async function(tenant, configId) {
        var runtimeVersion = await RuntimeVersionManager.getVersion();
        var cacheKey = "".concat(tenant,"_", configId,"_", runtimeVersion);
        return cacheKey;
    },
    getTenantMetadata: function(config){
       var configObject = config.response.configObjects[0];
       var tenantMetadata={};
       if(configObject){
            var {defaultValueLocale, defaultValueSource, timezone} = configObject.data.jsonData; 
            tenantMetadata.defaultValueLocale = defaultValueLocale;
            tenantMetadata.defaultValueSource = defaultValueSource;
            tenantMetadata.timezone = timezone;
       }
       return tenantMetadata;
    }
}

module.exports = TenantSystemConfigService;