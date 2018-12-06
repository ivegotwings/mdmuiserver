'use strict';

let localConfigCache = {};
let DFRestService = require('../../common/df-rest-service/DFRestService');
let RuntimeVersionManager = require('../version-service/RuntimeVersionManager');
let executionContext = require('../../common/context-manager/execution-context');
const falcorUtil = require('../../../../shared/dataobject-falcor-util'),
      isEmpty = require('../../common/utils/isEmpty');
let TenantSystemConfigService = function (options) {
    DFRestService.call(this, options);
};

TenantSystemConfigService.prototype = {
    getDefaultSource: function(){
        let defaultSource = "internal";

        let tenantConfigKey = this.getCacheKey();
        let tenantConfig = localConfigCache[tenantConfigKey];
        if(tenantConfig && tenantConfig.defaultValueSource) {
            defaultSource = tenantConfig.defaultValueSource;
        }
        
        return defaultSource;
    },
    getDefaultLocale: function(){
        let defaultLocale = "en-US";

        let tenantConfigKey = this.getCacheKey();
        let tenantConfig = localConfigCache[tenantConfigKey];
        if(tenantConfig && tenantConfig.defaultValueLocale) {
            defaultLocale = tenantConfig.defaultValueLocale;
        }
        
        return defaultLocale;
    },
    get: async function (url, tenantConfigRequest) {
        //Get runtime version...
        let runtimeVersion = await RuntimeVersionManager.getVersion();
        localConfigCache["runtime-version"] = runtimeVersion;

        let cacheKey = this.getCacheKey();
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
    getCacheKey: function() {
        let tenantId = "unknown";
        let securityContext = executionContext.getSecurityContext();
        if (securityContext && securityContext.tenantId) {
            tenantId = securityContext.tenantId;
        }
        
        let runtimeVersion = "unknown";
        if(localConfigCache["runtime-version"]) {
            runtimeVersion = localConfigCache["runtime-version"];
        }
        
        return "".concat(tenantId, "_", runtimeVersion);
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