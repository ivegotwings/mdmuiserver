'use strict';

var DFRestService = require('../common/df-rest-service/DFRestService');

var logger = require('../common/logger/logger-service');

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

        if (!this._validate(request)) {
            return;
        }

        var responses = [];
        var serviceName = "entitymodelservice";
        var serviceUrl = serviceName + "/" + serviceOperation;

        //Get entity manage model with permissions...
        var entityManageGetRes = await this._getEntityManageModelWithPermissions(request, serviceUrl);
        responses.push(entityManageGetRes);

        //Get other models...
        var types = ['entityValidationModel', 'entityDefaultValueModel', 'entityDisplayModel'];
        var internalRequest = this._cloneAndPrepareRequestObject(request, types);
        var res = await this.post(serviceUrl, internalRequest);
        responses.push(res);

        //console.log('composite model get RDF ', JSON.stringify(responses));
        
        var mergedModel = this._mergeModels(request, responses, serviceOperation);

        var response = {
            'response': {
                'status': 'success',
                'entityModels': [mergedModel]
            }
        };

        return response;
    },
    _getCoalesce: async function (request, serviceOperation) {
        if (!this._validate(request)) {
            return;
        }

        var responses = [];
        var serviceName = "entitymodelservice";
        var serviceUrl = serviceName + "/" + serviceOperation;
        var reqTypes = ['entityManageModel', 'entityValidationModel', 'entityDefaultValueModel', 'entityDisplayModel'];

        for(var type of reqTypes) {
            var modelGetResponse = undefined;
            if(type == "entityManageModel") {
                modelGetResponse = await this._getEntityManageModelWithPermissions(request, serviceUrl);
            } else {
                var internalRequest = this._cloneAndPrepareRequestObject(request, [type]);
                modelGetResponse = await this.post(serviceUrl, internalRequest);
            }

            responses.push(modelGetResponse);
        }
        
        //console.log('composite model get RDF ', JSON.stringify(responses));

        var mergedModel = this._mergeModels(request, responses, serviceOperation);

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
    _getEntityManageModelWithPermissions: async function (requestObject, serviceUrl) {
        var entityManageModelGetRes = undefined;

        var internalRequest = this._cloneAndPrepareRequestObject(requestObject, ['entityManageModel']);

        if(!internalRequest.params) {
            internalRequest['params'] = {};
        }

        //Get entityManageModel with 'read' permission...
        internalRequest.params['intent'] = 'read';
        var readWriteModelRes = await this.post(serviceUrl, internalRequest);

        const localeAuthorizationRequestObject = this._createLocaleBasedAuthorizationRequestObject(requestObject);
        const localeAuthorizationRequestResult = await this.post(serviceUrl, localeAuthorizationRequestObject);
        const localePermissions = this._getLocalePermissions(localeAuthorizationRequestResult);

        if (readWriteModelRes && readWriteModelRes.response) {
            var readWriteModels = readWriteModelRes.response.entityModels;
            if (readWriteModels && readWriteModels.length > 0) {
                if (localePermissions.writePermission === "false" || !localePermissions.writePermission) {
                    this._manageModelWithNoWritePermission(readWriteModels);
                } else {
                    //Get entityManageModel with 'write' permission..
                    internalRequest.params['intent'] = 'write';
                    var writeModelRes = await this.post(serviceUrl, internalRequest);
                    if (writeModelRes && writeModelRes.response) {
                        var writeModels = writeModelRes.response.entityModels;
                        if (writeModels && writeModels.length > 0) {
                            for (var i = 0; i < readWriteModels.length; i++) {
                                var readWriteModel = readWriteModels[i];
                                var writeModel = writeModels[i];
                                if (readWriteModel && readWriteModel.data) {
                                    var writeModelData = {};
                                    if (writeModel && writeModel.data) {
                                        writeModelData = writeModel.data;
                                    }
                                    this._mergeEntityManageModelsPermissions(readWriteModel.data, writeModelData);
                                }
                            }
                        } else {
                            this._manageModelWithNoWritePermission(readWriteModels);
                        }
                    }
                }
            }
            entityManageModelGetRes = readWriteModelRes;
        }
        return entityManageModelGetRes;
    },

    _getLocalePermissions: function (requestResult) {
        if (requestResult.response &&
            requestResult.response.entityModels &&
            requestResult.response.entityModels[0]) {
            const {readPermission, writePermission} = requestResult.response.entityModels[0].properties;
            return {
                readPermission,
                writePermission
            };
        }
        //returning default
        return {
            "readPermission": "true",
            "writePermission": "true"
        };
    },
    _manageModelWithNoWritePermission: function(readWriteModels){
        //write model is not available...
        //set all data objects as readonly in readWriteModels
        for (var i = 0; i < readWriteModels.length; i++) {
            var readWriteModel = readWriteModels[i];
            if (readWriteModel && readWriteModel.data) {
                var writeModelData = {};
                this._mergeEntityManageModelsPermissions(readWriteModel.data, writeModelData);
            }
        }
    },
    _createLocaleBasedAuthorizationRequestObject: function(request){
        //default locale
        let localeId = "en-US";
        if (request.params.query && request.params.query.contexts) {
            localeId = request.params.query.contexts[0].locale;
        }
        return {
            "params": {
                "query": {
                    "ids": [localeId + "_authorizationModel_" + this.getUserRole()],
                    "filters" : {
                        "typesCriterion": [
                            "authorizationModel"
                        ]
                    }
                },
                "fields" : {
                    "attributes" : ["_ALL"],
                    "relationships": ["_ALL"]
                }
            }
        }
    },
    _mergeEntityManageModelsPermissions: function (readWriteModel, writeModel) {
        //Merge self attributes
        if(readWriteModel.attributes) {
            this._verifyAndPopulateWritePermissions(readWriteModel.attributes, writeModel.attributes, false);
        }

        //Merge self relationships
        if(readWriteModel.relationships) {
            this._verifyAndPopulateWritePermissions(readWriteModel.relationships, writeModel.relationships, true);
        }

        //Merge context data
        if(readWriteModel.contexts) {
            for (let readWriteModelContextItem of readWriteModel.contexts) {
                var writeModelContextItem = undefined;
                if(writeModel.contexts) {
                    var readWriteModelContext = readWriteModelContextItem.context;
                    var readWriteModelCtxKey = falcorUtil.createCtxKey(readWriteModelContext);

                    for (let contextItem of writeModel.contexts) {
                        var writeModelContext = contextItem.context;
                        var writeModelCtxKey = falcorUtil.createCtxKey(writeModelContext);

                        if(readWriteModelCtxKey == writeModelCtxKey) {
                            writeModelContextItem = contextItem;
                        }
                    }   
                }

                if(readWriteModelContextItem.attributes) {
                    this._verifyAndPopulateWritePermissions(readWriteModelContextItem.attributes, (writeModelContextItem ? writeModelContextItem.attributes : undefined), false);
                }

                if(readWriteModelContextItem.relationships) {
                    this._verifyAndPopulateWritePermissions(readWriteModelContextItem.relationships, (writeModelContextItem ? writeModelContextItem.relationships : undefined), true);
                }
            }
        }
    },
    _verifyAndPopulateWritePermissions: function (readWriteObjects, writeObjects, isRelType) {
        for (var readWriteObjKey in readWriteObjects) {
            var readWriteObj = readWriteObjects[readWriteObjKey];

            if(isRelType && readWriteObj.length > 0) {
                readWriteObj = readWriteObj[0]
            }

            if(!readWriteObj.properties) {
                readWriteObj.properties = {};
            }
            
            if(writeObjects && writeObjects[readWriteObjKey]) {
                readWriteObj.properties['hasWritePermission'] = true;
            } else {
                readWriteObj.properties['hasWritePermission'] = false;
            }

            if(isRelType) {
                //Verify and populate write permissions for rel attributes...
                if(readWriteObj.attributes) {
                    var writeObjectRelAttributes = {};
                    if(writeObjects) {
                        var writeObj = writeObjects[readWriteObjKey];

                        if(writeObj && writeObj.length > 0) {
                            writeObjectRelAttributes = writeObj[0].attributes;
                        }
                    }

                    this._verifyAndPopulateWritePermissions(readWriteObj.attributes, writeObjectRelAttributes, false);
                }
            }
        }
    },
    _cloneAndPrepareRequestObject: function (request, types) {
        var objectName = '';
        var internalRequest = falcorUtil.cloneObject(request);
        
        if (internalRequest.params && internalRequest.params.query) {
            var query = internalRequest.params.query;

            if (query.valueContexts) {
                delete query.valueContexts;
            }

            if (!query.filters) {
                query.filters = {};
            }

            objectName = query.id.replace('_entityCompositeModel', '');
                
            if(types.length > 1) {
                var ids = [];

                for (let type of types) {
                    ids.push(objectName + '_' + type);
                }

                delete query.id;
                query.ids = ids;
            } else if (types.length == 1) {
                delete query.ids;
                query.id = objectName + "_" + types[0];
            } else {
                //This does not happen...
            }

            query.filters.typesCriterion = types;
        }

        return internalRequest;
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

        if(request.params && request.params.query) {
            var query = request.params.query;

            objectName = query.id.replace('_entityCompositeModel', '');

            if(query.contexts && query.contexts.length > 0) {
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

module.exports = EntityCompositeModelGetService;







