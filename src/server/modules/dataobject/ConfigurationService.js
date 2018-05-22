'use strict';

var DFRestService = require('../common/df-rest-service/DFRestService');

var logger = require('../common/logger/logger-service');

var falcorUtil = require('../../../shared/dataobject-falcor-util');
var mergeUtil = require('../../../shared/dataobject-merge-util');

var RuntimeVersionManager = require('../version-service/RuntimeVersionManager');

const arrayRemove = require('../common/utils/array-remove'),
    arrayContains = require('../common/utils/array-contains'),
    isEmpty = require('../common/utils/isEmpty'),
    BaseConfigService = require('./BaseConfigService'),
    TenantSystemConfigService = require('./TenantSystemConfigService')
    var ConfigurationService = function (options) {
    DFRestService.call(this, options);
    this.baseConfigService = new  BaseConfigService.BaseConfigService(options);
    this.tenantSystemConfigService = new TenantSystemConfigService(options);
};

const RDF_SERVICE_NAME = "configurationservice";

const DEFAULT_CONTEXT_KEY = "_DEFAULT";

var localConfigCache = {};

ConfigurationService.prototype = {
    get: async function (request) {
        return this._get(request, 'get');
    },
    getNearest: async function (request) {
        return this._get(request, 'getnearest');
    },
    _get: async function (request, serviceOperation) {
        if (!this._validate(request)) {
            return;
        }
        var tenantConfigResponse=null;
        var responses = [];
        var serviceUrl = RDF_SERVICE_NAME + "/" + serviceOperation;
        //console.log('request to config service ', JSON.stringify(request, null, 2));

        var requestedConfigId = request.params.query.id;
        //console.log('config service req ', serviceOperation);

        //TEMP:: Fallback logic for all existing app based configs till complete migration happens..
        if (!(requestedConfigId && requestedConfigId.startsWith('x-'))) {
            return this._fetchConfigObject(RDF_SERVICE_NAME + "/get", request, true);
        }

        if (isEmpty(request.params.query.contexts)) {
            var response = {
                'response': {
                    'status': 'success',
                    'configObjects': [
                        {
                            'id': requestedConfigId,
                            'name': requestedConfigId.replace('_uiConfig', ''),
                            'type': 'uiConfig'
                        }
                    ]
                }
            };

            //console.log('response data ', JSON.stringify(response));
            return response;
        }

        var requestContext = request.params.query.contexts[0];
        requestContext.tenant = requestContext.tenant == undefined || requestContext.tenant == DEFAULT_CONTEXT_KEY ? this.getTenantId() : requestContext.tenant;

        var baseConfigId = "sys_" + requestContext.component + "-base_uiConfig";
        var baseConfigRequest = {
            "params": {
                "query": {
                    "id": baseConfigId,
                    "contexts": [
                        {
                            "component": requestContext.component
                        }
                    ],
                    "filters": {
                        "excludeNonContextual": true,
                        "typesCriterion": ["uiConfig"]
                    }
                },
                "fields": {
                    "jsonData": true
                }
            }
        };
        
        //console.log('base config request', JSON.stringify(baseConfigRequest, null, 2));

        var baseConfigResponse = await this.baseConfigService.get(RDF_SERVICE_NAME + "/get", baseConfigRequest);
        //console.log('base config get response ', JSON.stringify(baseConfigResponse));

        if (!falcorUtil.isValidObjectPath(baseConfigResponse, "response.configObjects.0")) {
            var errorMsg = "".concat('Base config not found for the config Id:', baseConfigId);
            logger.error(errorMsg, null, logger.getCurrentModule());
            throw new Error(errorMsg);
        }

        var finalConfigObject = baseConfigResponse.response.configObjects[0];
        //console.log('base config', JSON.stringify(finalConfigObject));

        finalConfigObject = await this._getAndMergeNearestConfig(requestContext, finalConfigObject, true);
        //console.log('base coalesced config', JSON.stringify(finalConfigObject));

        finalConfigObject = await this._getAndMergeNearestConfig(requestContext, finalConfigObject, false);
        //console.log('final tenant coalesced config', JSON.stringify(finalConfigObject));

        //Remove all nodes having key-value "visible:false"
        falcorUtil.deepRemoveNodesByKeyVal(finalConfigObject, "visible", false);

        
        if(requestContext.component == "global-settings"){
            tenantConfigResponse = await this._getTenantSystemConfig(requestContext);
        }
        if(tenantConfigResponse){
            if (falcorUtil.isValidObjectPath(finalConfigObject, "data.contexts.0.jsonData.config")) {
                finalConfigObject.data.contexts[0].jsonData.config.tenantSettings = tenantConfigResponse; 
            }
        }
        var response = { "response": { "status": "success", "configObjects": [finalConfigObject] } };

        //console.log('response data ', JSON.stringify(response));
        return response;
    },
    _getTenantSystemConfig: async function(requestContext){
        var tenantConfigRequest = {
            "params": {
                "query": {
                    "id": requestContext.tenant,
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
            //console.log("calling tenantSystemConfigService");
            var tenantConfigResponse = await this.tenantSystemConfigService.get(RDF_SERVICE_NAME + "/get", tenantConfigRequest);
            if (!tenantConfigResponse) {
                var errorMsg = "".concat('Tenant config not found for :', requestContext.tenant);
                logger.error(errorMsg, null, logger.getCurrentModule());
                throw new Error(errorMsg);
            }
            return tenantConfigResponse;
    },
    _getAndMergeNearestConfig: async function (requestContext, mergedConfigObject, isBase) {
        var tenant = requestContext.tenant;

        var configContextSettings = await this._getConfigContextSettings(tenant, isBase);

        if (isEmpty(configContextSettings)) {
            console.error('config context setting not found');
            return mergedConfigObject;
        }

        var contextSchema = configContextSettings.contextSchema;
        var coalescePath = configContextSettings.coalescePath;

        var mergedRequestContext = falcorUtil.mergeObjects(contextSchema, requestContext, false);
        //console.log('merged request context ', JSON.stringify(mergedRequestContext, null, 2));

        var req = {
            "params": {
                "query": {
                    "contexts": [mergedRequestContext],
                    "filters": {
                        "excludeNonContextual": true,
                        "typesCriterion": ["uiConfig"]
                    }
                },
                "fields": {
                    "jsonData": true
                },
                "options": {
                    "maxRecords": 2000,
                    "getnearestPath": coalescePath,
                    "getnearestReturnAll": true,
                    "includeRequest": false
                }
            }
        };

        //console.log('nearest get request ', JSON.stringify(req));
        var res = await this._fetchConfigObject(RDF_SERVICE_NAME + "/getnearest", req);
        //console.log('nearest get response ', JSON.stringify(res));

        if (res && res.response.configObjects && res.response.configObjects.length > 0) {

            var configObjects = res.response.configObjects;

            if (isEmpty(mergedConfigObject)) {
                mergedConfigObject = this._getEmptyConfigObject();
            }

            var mergedConfigData = mergedConfigObject.data.contexts[0].jsonData.config;;
            var mergedContext = mergedConfigObject.data.contexts[0].context;

            for (var i = configObjects.length - 1; i >= 0; i--) {
                var configContextData = configObjects[i].data.contexts[0];

                var configContext = configContextData.context;
                var configData = configContextData.jsonData.config;

                mergedConfigData = falcorUtil.mergeObjects(mergedConfigData, configData, true, true);
                mergedContext = this._mergeResponseContexts(mergedContext, configContext);
            }

            if (mergedConfigData) {
                mergedConfigObject.id = this._createConfigId(mergedContext);
                mergedConfigObject.name = mergedConfigObject.id.replace("_uiConfig", "");
                mergedConfigObject.data.contexts[0].context = mergedContext;
                mergedConfigObject.data.contexts[0].jsonData.config = mergedConfigData;
            }
        }

        return mergedConfigObject;
    },
    _getConfigContextSettings: async function (tenant, isBase) {
        var req = {
            "params": {
                "query": {
                    "id": "",
                    "contexts": [
                        {
                            "component": "config-context-settings"
                        }
                    ],
                    "filters": {
                        "excludeNonContextual": true,
                        "typesCriterion": ["uiConfig"]
                    }
                },
                "fields": {
                    "jsonData": true
                }
            }
        };

        var configId = '';
        if (tenant && !isBase) {
            configId = req.params.query.id = "config-context-settings_" + tenant + "_uiConfig";
            req.params.query.contexts[0].tenant = tenant;
        }
        else {
            configId = req.params.query.id = "sys_config-context-settings-base_uiConfig";
        }

        //console.log('config context settings request ', JSON.stringify(req));

        var configData = {};
        var res = await this._fetchConfigObject(RDF_SERVICE_NAME + "/get", req);

        if (falcorUtil.isValidObjectPath(res, "response.configObjects.0.data.contexts.0.jsonData.config")) {
            configData = res.response.configObjects[0].data.contexts[0].jsonData.config;
        }

        //console.log('config context settings response ', isBase, JSON.stringify(configData));

        return configData;
    },
    _mergeResponseContexts: function (targetContext, sourceContext) {
        //console.log('merge context req', JSON.stringify(targetContext), JSON.stringify(sourceContext));

        var mergedContext = falcorUtil.cloneObject(targetContext);

        for (var targetKey in targetContext) {
            var targetVal = targetContext[targetKey];
            var sourceVal = sourceContext[targetKey];

            if (sourceVal && sourceVal != DEFAULT_CONTEXT_KEY) {
                mergedContext[targetKey] = sourceVal;
            }
        }

        for (var sourceKey in sourceContext) {
            var sourceVal = sourceContext[sourceKey];
            var targetVal = targetContext[sourceKey];

            if (!targetVal) {
                mergedContext[sourceKey] = sourceVal;
            }
        }

        //console.log('merged context ', JSON.stringify(mergedContext));

        return mergedContext;
    },
    _createConfigId: function (configContext) {
        var configId = '';
        for (var contextKey in configContext) {
            var contextVal = configContext[contextKey];
            if (!isEmpty(contextVal)) {
                if (configId == '') {
                    configId = configId + contextVal;
                }
                else {
                    configId = configId + "_" + contextVal;
                }
            }
        }

        configId = configId + "_uiConfig";

        return configId;
    },
    _getEmptyConfigObject: function () {
        return {
            "id": "",
            "name": "",
            "type": "uiConfig",
            "data": {
                "contexts": [
                    {
                        "context": {},
                        "jsonData": {
                            "config": {}
                        }
                    }
                ]
            }
        }
    },
    _fetchConfigObject: async function (serviceUrl, request, getLatest = false) {
        var res = {};

        if (getLatest) {
            res = await this.post(serviceUrl, request);
        }
        else {
            var requestedConfigId = request.params.query.id ? request.params.query.id : "_BYCONTEXT";
            var requestedContext = falcorUtil.isValidObjectPath(request, "params.query.contexts.0") ? request.params.query.contexts[0] : "_NOCONTEXT";
            var generatedId = this._createConfigId(requestedContext);
            var tenant = this.getTenantId();
            var runtimeVersion = await RuntimeVersionManager.getVersion();
            var cacheKey = "".concat("uiConfig|id:", requestedConfigId, "|contextKey:", generatedId, "|runtime-version:", runtimeVersion);

            if (requestedConfigId != "_BYCONTEXT" && requestedContext != "_NOCONTEXT") {
                 !isEmpty(localConfigCache[runtimeVersion]) && (res = falcorUtil.cloneObject(localConfigCache[runtimeVersion][cacheKey]));
            }

            if (isEmpty(res)) {
                res = await this.post(serviceUrl, request);
                isEmpty(localConfigCache[runtimeVersion]) && (localConfigCache[runtimeVersion] = {});
                localConfigCache[runtimeVersion][cacheKey] = falcorUtil.cloneObject(res);
            }
        }

        return await res;
    },
    _validate: function (reqData) {
        return true;
    }
};

module.exports = { 
    ConfigurationService: ConfigurationService,
    localConfigCache: localConfigCache
};