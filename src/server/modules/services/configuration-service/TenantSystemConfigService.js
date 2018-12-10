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

const RDF_SERVICE_NAME = "configurationservice";

TenantSystemConfigService.prototype = {
    getDefaultValContext: async function(){
        let defaultValContext = {
            "source": "internal",
            "locale": "en-US"
        };
        
        let tenantConfigKey = this.getCacheKey();
        let tenantConfig = localConfigCache[tenantConfigKey];
        if(!isEmpty(tenantConfig) && !isEmpty(tenantConfig.defaultValueSource) && !isEmpty(tenantConfig.defaultValueLocale)) {
            defaultValContext = {
                "source": tenantConfig.defaultValueSource,
                "locale": tenantConfig.defaultValueLocale
            };
        } else {
            //tenantConfig is not available in cache...
            //Get from API call...
            tenantConfig = await this.get();
            if(!isEmpty(tenantConfig) && !isEmpty(tenantConfig.defaultValueSource) && !isEmpty(tenantConfig.defaultValueLocale)) {
                defaultValContext = {
                    "source": tenantConfig.defaultValueSource,
                    "locale": tenantConfig.defaultValueLocale
                };
            }
        }
        
        return defaultValContext;
    },
    get: async function () {
        //Get runtime version...
        let runtimeVersion = await RuntimeVersionManager.getVersion();
        localConfigCache["runtime-version"] = runtimeVersion;

        //Get tenant id...
        let tenantId = this._getTenantId();

        let cacheKey = this.getCacheKey(tenantId);
        if (localConfigCache[cacheKey]) {
            return falcorUtil.cloneObject(localConfigCache[cacheKey]);
        }

        let tenantConfigRequest = {
            "params": {
                "query": {
                    "id": tenantId,
                    "filters": {
                        "typesCriterion": [
                        "tenantserviceconfig"
                        ]
                    }
                },
                "fields": {
                    "properties": [
                        "_ALL"
                    ]
                },
                "options": {
                    "totalRecords": 100
                }
            }
        };

        //rdf returns tenant config only if the tenant is dataplatform
        let tenantConfigResponse = await this.post(RDF_SERVICE_NAME + "/get", tenantConfigRequest, "dataplatform");
        let tenantConfigMetadata = this.getTenantMetadata(tenantConfigResponse);
        
        localConfigCache[cacheKey] = falcorUtil.cloneObject(tenantConfigMetadata);
        return tenantConfigMetadata;
    },
    getCacheKey: function(tenantId) {
        if(!tenantId) {
            tenantId = this._getTenantId();
        }
        
        let runtimeVersion = "unknown";
        if(localConfigCache["runtime-version"]) {
            runtimeVersion = localConfigCache["runtime-version"];
        }
        
        return "".concat(tenantId, "_", runtimeVersion);
    },
    _getTenantId: function() {
        let tenantId = "unknown";
        let securityContext = executionContext.getSecurityContext();
        if (securityContext && securityContext.tenantId) {
            tenantId = securityContext.tenantId;
        }
        return tenantId;
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