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
        var serviceName = "configurationservice";
        var serviceUrl = serviceName + "/" + serviceOperation;
        //console.log('request to config service ', JSON.stringify(request, null, 2));

        var requestedConfigId = request.params.query.id;

        //TEMP:: Fallback logic for all existing app based configs till complete migration happens..
        if(!(requestedConfigId && requestedConfigId.startsWith('x-'))) {
            return this.post(serviceName + "/get", request);
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
        var baseConfig = await this.post(serviceName + "/get", baseConfigRequest);
        
        //console.log(JSON.stringify(baseConfig));

        var response = baseConfig;

        //console.log('response data ', JSON.stringify(response));
        return response;
        return response;
    },
    _getConfigMetadataFields: function (component) {

    },
    _validate: function (reqData) {
        return true;
    },
    _mergeModels: function (request, response, serviceOperation) {
        var objectName = '';
        var allModels = [];

        for (var res of response) {
            if (res.response) {
                allModels.push.apply(allModels, res.response.entityModels);
            }
        }

        //console.log('all models ', JSON.stringify(allModels));

        var mergedModel = {};
        var localeContext = undefined;

        if (request.params && request.params.query) {
            var query = request.params.query;

            objectName = query.id.replace('_entityCompositeModel', '');

            if (query.contexts && query.contexts.length > 0) {
                localeContext = query.contexts[0];
            }
        }

        var mergedLocaleCtxItem = {};
        if (allModels && allModels.length > 0) {
            var manageModel = allModels.find(obj => obj.type == "entityManageModel");

            if (!manageModel) {
                var msg = "\n Entity manage model is not available or user does not have permission. Request: " + JSON.stringify(request);
                logger.warn(msg);
                console.log(msg);
                return {};
            }

            mergedModel = manageModel;

            for (var i = 0; i < allModels.length; i++) {
                var model = allModels[i];

                if (model && model.id != manageModel.id) {
                    //console.log('current model ', JSON.stringify(model));

                    mergedModel = mergeUtil.mergeDataObjects(mergedModel, model);

                    if (model.data && model.data.contexts && localeContext) {
                        var modelLocaleCtxItem = falcorUtil.getCtxItem(model.data.contexts, localeContext);

                        if (modelLocaleCtxItem) {
                            mergedLocaleCtxItem = mergeUtil.mergeCtxItems(mergedLocaleCtxItem, modelLocaleCtxItem, true);
                        }
                    }
                }
            }

            mergedModel.id = objectName + "_entityCompositeModel";
            mergedModel.type = "entityCompositeModel";
        }

        if (mergedModel && mergedModel.data && mergedLocaleCtxItem != {}) {

            var mergedData = mergedModel.data;

            var selfCtxItem = { 'attributes': mergedData.attributes, 'relationships': mergedData.relationships, 'properties': mergedData.properties };

            selfCtxItem = mergeUtil.mergeCtxItems(selfCtxItem, mergedLocaleCtxItem, false);

            var mergedContexts = mergedData.contexts;

            if (mergedContexts) {
                for (var j = 0; j < mergedContexts.length; j++) {
                    var ctxItem = mergedContexts[j];
                    ctxItem = mergeUtil.mergeCtxItems(ctxItem, mergedLocaleCtxItem, false);
                }
            }
        }

        return mergedModel;
    }
};

module.exports = ConfigurationService;







