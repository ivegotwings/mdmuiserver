'use strict';

let DFRestService = require('../../common/df-rest-service/DFRestService');
let RuntimeVersionManager = require('../version-service/RuntimeVersionManager');

const falcorUtil = require('../../../../shared/dataobject-falcor-util');

let TenantSystemConfigService = function (options) {
    DFRestService.call(this, options);
};

let localConfigCache = {};

TenantSystemConfigService.prototype = {
    get: async function (url, tenantConfigRequest) {
        let tenant = this.getTenantId();

        let mode = "online";
        let configId = tenantConfigRequest.params.query.id;
        let cacheKey = await this.getCacheKey(tenant, configId);

        if (localConfigCache[cacheKey]) {
            return falcorUtil.cloneObject(localConfigCache[cacheKey]);
        }

        let tenantConfigResponse;
        let tenantConfigMetadata;

        //rdf returns tenant config only if the tenant is dataplatform
        tenantConfigResponse = await this.post(url, tenantConfigRequest, "dataplatform");
        tenantConfigMetadata = this.getTenantMetadata(tenantConfigResponse);
        
        localConfigCache[cacheKey] = falcorUtil.cloneObject(tenantConfigMetadata);
        return tenantConfigMetadata;
    },
    getCacheKey: async function(tenant, configId) {
        let runtimeVersion = await RuntimeVersionManager.getVersion();
        let cacheKey = "".concat(tenant,"_", configId,"_", runtimeVersion);
        return cacheKey;
    },
    getTenantMetadata: function(config){
        
        let tenantMetadata={};
        if(falcorUtil.isValidObjectPath(config, "response.configObjects.0")){
            let configObject = config.response.configObjects[0];
            let {defaultValueLocale, defaultValueSource, timezone} = configObject.data.jsonData; 
            tenantMetadata.defaultValueLocale = defaultValueLocale;
            tenantMetadata.defaultValueSource = defaultValueSource;
            tenantMetadata.timezone = timezone;
        }
        return tenantMetadata;
    }
}

module.exports = TenantSystemConfigService;