'use strict';

var DFRestService = require('../common/df-rest-service/DFRestService');

var logger = require('../common/logger/logger-service');

var falcorUtil = require('../../../shared/dataobject-falcor-util');
var mergeUtil = require('../../../shared/dataobject-merge-util');

const arrayRemove = require('../common/utils/array-remove'),
    arrayContains = require('../common/utils/array-contains'),
    isEmpty = require('../common/utils/isEmpty');

var ConfigurationService = function (options) {
    DFRestService.call(this, options);
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

        var responses = [];
        var serviceUrl = RDF_SERVICE_NAME + "/" + serviceOperation;
        //console.log('request to config service ', JSON.stringify(request, null, 2));

        var requestedConfigId = request.params.query.id;
        //console.log('config service req ', serviceOperation);
        
        //TEMP:: Fallback logic for all existing app based configs till complete migration happens..
        if (!(requestedConfigId && requestedConfigId.startsWith('x-'))) {
            return this._fetchConfigObject(RDF_SERVICE_NAME + "/get", request);
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
        var component = requestContext.component;
        var tenant = requestContext.tenant;

        var baseConfigId = component + "-base_uiConfig";
        var baseConfigRequest = {
            "params": {
                "query": {
                    "id": baseConfigId,
                    "contexts": [
                        {
                            "component": component
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

        //Get entity manage model with permissions...
        var baseConfigResponse = await this._fetchConfigObject(RDF_SERVICE_NAME + "/get", baseConfigRequest);

        var finalConfigObject = baseConfigResponse.response.configObjects[0];
        //console.log('base config', JSON.stringify(finalConfigObject));

        finalConfigObject = await this._getAndMergeNearestConfig(requestContext, finalConfigObject, true);
        //console.log('base coalesced config', JSON.stringify(finalConfigObject));
        
        finalConfigObject = await this._getAndMergeNearestConfig(requestContext, finalConfigObject, false);
        //console.log('final tenant coalesced config', JSON.stringify(finalConfigObject));
        
        var response = {"response": {"status": "success", "configObjects": [finalConfigObject]}};

        //console.log('response data ', JSON.stringify(response));
        return response;
    },
    _getAndMergeNearestConfig: async function (requestContext, mergedConfigObject, isBase) {
        var component = requestContext.component;
        var tenant = requestContext.tenant;

        var configContextSettings = await this._getConfigContextSettings(tenant, isBase);

        if(isEmpty(configContextSettings)) {
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

            if(isEmpty(mergedConfigObject)) {
                mergedConfigObject = this._getEmptyConfigObject();
            }

            var mergedConfigData = mergedConfigObject.data.contexts[0].jsonData.config;;
            var mergedContext = mergedConfigObject.data.contexts[0].context;

            for (var i = configObjects.length - 1;i >= 0; i--) {
                var configContextData = configObjects[i].data.contexts[0];

                var configContext = configContextData.context;
                var configData = configContextData.jsonData.config;

                mergedConfigData = falcorUtil.mergeObjects(mergedConfigData, configData, true);
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
            configId = req.params.query.id = "config-context-settings-base_uiConfig";
        }

        var configData = {};

        var res = await this._fetchConfigObject(RDF_SERVICE_NAME + "/get", req, false);

        if(falcorUtil.isValidObjectPath(res, "response.configObjects.0.data.contexts.0.jsonData.config")) {
            configData = res.response.configObjects[0].data.contexts[0].jsonData.config;
        }
        
        //console.log('config context settings ', isBase, JSON.stringify(configData));

        return configData;
    },
    _mergeResponseContexts: function (targetContext, sourceContext) {
        //console.log('merge context req', JSON.stringify(targetContext), JSON.stringify(sourceContext));

        var mergedContext = falcorUtil.cloneObject(targetContext);

        for(var targetKey in targetContext) {
            var targetVal = targetContext[targetKey];
            var sourceVal = sourceContext[targetKey];

            if(sourceVal && sourceVal != DEFAULT_CONTEXT_KEY) {
                mergedContext[targetKey] = sourceVal;
            }
        }

        for(var sourceKey in sourceContext) {
            var sourceVal = sourceContext[sourceKey];
            var targetVal = targetContext[sourceKey];

            if(!targetVal) {
                mergedContext[sourceKey] = sourceVal;
            }
        }

        //console.log('merged context ', JSON.stringify(mergedContext));
        
        return mergedContext;
    },
    _createConfigId: function (configContext) {
        var configId = '';
        for(var contextKey in configContext) {
            var contextVal = configContext[contextKey];
            if (!isEmpty(contextVal)) {
                if(configId == '') {
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
    _fetchConfigObject: async function (serviceUrl, request, noCache = true) {
        var res = {};

        var requestedConfigId = request.params.query.id ? request.params.query.id : "_BYCONTEXT";
        var requestedContext = falcorUtil.isValidObjectPath(request, "params.query.contexts.0") ? request.params.query.contexts[0] : "_NOCONTEXT";
        var generatedId = this._createConfigId(requestedContext);
        var cacheKey = "".concat("id:",requestedConfigId,"|contextKey:", generatedId);

        if(!noCache && cacheKey != "id:_BYCONTEXT|contextKey:_NOCONTEXT") {
            res = localConfigCache[cacheKey];
        }
        
        if(isEmpty(res)) {
            res = await this.post(serviceUrl, request);
            if(!noCache) {
                localConfigCache[cacheKey] = res;
            }
        }

        return await res;
    },
    _validate: function (reqData) {
        return true;
    }
};

module.exports = ConfigurationService;







