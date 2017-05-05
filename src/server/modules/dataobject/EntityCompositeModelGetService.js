'use strict';

var DFRestService = require('../common/df-rest-service/DFRestService');

var falcorUtil = require('../../../shared/dataobject-falcor-util');
var mergeUtil = require('../../../shared/dataobject-merge-util');

var EntityCompositeModelGetService = function (options) {
    DFRestService.call(this, options);
};

EntityCompositeModelGetService.prototype = {
    get: async function (request) {
        return this._get(request, 'get');
    },
    getCoalesce: async function (request) {
        return this._getCoalesce(request, 'getcoalesce');
    },
    _get: async function (request, serviceOperation) {
        var serviceName = "entitymodelservice";

        if (!this._validate(request)) {
            return;
        }

        var internalRequest = falcorUtil.cloneObject(request);
        var objectName = '';
        if (internalRequest.params && internalRequest.params.query) {
            var query = internalRequest.params.query;
            var types = ['entityManageModel', 'entityValidationModel', 'entityDefaultValueModel', 'entityDisplayModel'];

            if (query.valueContexts) {
                delete query.valueContexts;
            }

            if (!query.filters) {
                query.filters = {};
            }

            objectName = query.id.replace('_entityCompositeModel', '');
            
            var ids = [];

            for (let type of types) {
                ids.push(objectName + '_' + type);
            }

            delete query.id;

            query.ids = ids;
            query.filters.typesCriterion = types;
        }

        var res = await this.post(serviceName + "/" + serviceOperation, internalRequest);
        //console.log('composite model get RDF ', JSON.stringify(res));

        var mergedModel = this._mergeModels(request, objectName, res, serviceOperation);

        var response = {
            'response': {
                'status': 'success',
                'entityModels': [mergedModel]
            }
        };

        //console.log('composite model get response ', JSON.stringify(response));

        return response;
    },
    _getCoalesce: async function (request, serviceOperation) {
        var serviceName = "entitymodelservice";

        if (!this._validate(request)) {
            return;
        }

        var internalRequests = [];
        var reqTypes = ['entityManageModel', 'entityValidationModel', 'entityDefaultValueModel', 'entityDisplayModel'];

        for(var type of reqTypes) {

            var internalRequest = falcorUtil.cloneObject(request);
            
            var objectName = '';
            
            if (internalRequest.params && internalRequest.params.query) {
                var query = internalRequest.params.query;

                if (query.valueContexts) {
                    delete query.valueContexts;
                }

                if (!query.filters) {
                    query.filters = {};
                }

                objectName = query.id.replace('_entityCompositeModel', '');
                
                delete query.ids;

                query.id = objectName + "_" + type;
                query.filters.typesCriterion = [type];
            }

            internalRequests.push(internalRequest);
        }

        var serviceUrl = serviceName + "/" + serviceOperation;

        var res = [];

        for (var req of internalRequests) {
            var oneRes = await this.post(serviceUrl, req);
            res.push(oneRes);
            
        }
        //console.log('composite model get RDF ', JSON.stringify(res));

        var mergedModel = this._mergeModels(request, objectName, res, serviceOperation);

        var response = {
            'response': {
                'status': 'success',
                'entityModels': [mergedModel]
            }
        };

        //console.log('composite model get merged response ', JSON.stringify(response));

        return response;
        
    },
    _validate: function (reqData) {
        return true;
    },
    _mergeModels: function (request, objectName, response, serviceOperation) {

        var allModels = [];

          if(serviceOperation == 'getcoalesce') {
            for(var res of response) {
                if(res.response) {
                    allModels.push.apply(allModels, res.response.entityModels);
                }
            }
        }
        else {
            if(response.response) {
                allModels = response.response.entityModels;
            }
        }

        //console.log('all models ', JSON.stringify(allModels));

        var mergedModel = {};
        var localeContext = undefined;

        if(request.params && request.params.query && request.params.query.contexts && request.params.query.contexts.length > 0) {
            localeContext = request.params.query.contexts[0];
        }
        
        var mergedLocaleCtxItem = {};
        if (allModels && allModels.length > 0) {
            var manageModel = allModels.find(obj => obj.type == "entityManageModel");

            if (!manageModel) {
                console.log('manage model not found');
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

module.exports = EntityCompositeModelGetService;







