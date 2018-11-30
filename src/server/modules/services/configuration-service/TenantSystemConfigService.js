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
    getCachedTenantMetaData: function(){
        let defaultSourceAndLocale = {
            defaultValueSource : "internal",
            defaultValueLocale: "en-US"
        };
        if (isEmpty(localConfigCache)) {
            localConfigCache["tenant-settings-key"] = "default";
            localConfigCache["default"] = defaultSourceAndLocale;
        }
        return localConfigCache;
    },
    getDefaultSource: function(){
        let tenantSetting = this.getCachedTenantMetaData();
        let tenantConfigKey = tenantSetting["tenant-settings-key"];
        return tenantSetting[tenantConfigKey].defaultValueSource;
    },
    getDefaultLocale: function(){
        let tenantSetting = this.getCachedTenantMetaData();
        let tenantConfigKey = tenantSetting["tenant-settings-key"];
        return tenantSetting[tenantConfigKey].defaultValueLocale;
    },
    get: async function (url, tenantConfigRequest) {
        let tenant = this.getTenantId();

        let mode = "online";
        let configId = tenantConfigRequest.params.query.id;
        this.configId = configId;
        let cacheKey = await this.getCacheKey();
        localConfigCache["tenant-settings-key"] = cacheKey;
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
    getCacheKey: async function() {
        let runtimeVersion = await RuntimeVersionManager.getVersion();
        let securityContext = executionContext && executionContext.getSecurityContext();
        let tenantId = "unknown";
        let configId = this.configId;
        if (securityContext) {
            tenantId = securityContext.tenantId;
        }
        return "".concat(tenantId,"_", configId,"_", runtimeVersion);
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