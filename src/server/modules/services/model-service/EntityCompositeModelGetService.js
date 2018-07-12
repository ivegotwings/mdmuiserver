'use strict';

var DFRestService = require('../../common/df-rest-service/DFRestService');

var logger = require('../../common/logger/logger-service');

var falcorUtil = require('../../../../shared/dataobject-falcor-util');
var mergeUtil = require('../../../../shared/dataobject-merge-util');

var EntityCompositeModelGetService = function (options) {
    DFRestService.call(this, options);
};

EntityCompositeModelGetService.prototype = {
    get: async function (request) {
        //console.log("Get Called");
        return this._get(request, 'getcomposite');
    },
    getCoalesce: async function (request) {
        //console.log("Get Coalesce Called");
        return this._get(request, 'getcomposite');
    },
    _get: async function (request, serviceOperation) {

        if (!this._validate(request)) {
            return;
        }

        var serviceName = "entitymodelservice";
        var serviceUrl = serviceName + "/" + serviceOperation;

        //Get other models...
        var types = ['entityManageModel', 'entityValidationModel', 'entityDefaultValueModel', 'entityDisplayModel', 'authorizationModel'];
        var internalRequest = this._cloneAndPrepareRequestObject(request, types);
        var res = await this.post(serviceUrl, internalRequest);

        //console.log('composite model get RDF ', JSON.stringify(res));

        var compositeModel = this._getModelWithPermissions(request, res);

        var response = {
            'response': {
                'status': 'success',
                'entityModels': [compositeModel]
            }
        };

        //console.log('composite model get RDF2 ', JSON.stringify(response));
        return response;
    },
    
    _validate: function (reqData) {
        return true;
    },
    _cloneAndPrepareRequestObject: function (request, types) {
        var internalRequest = falcorUtil.cloneObject(request);
        
        if (internalRequest.params && internalRequest.params.query) {
            var query = internalRequest.params.query;

            if (!query.filters) {
                query.filters = {};
            }

            query.id.replace('_entityCompositeModel', '');

            query.filters.typesCriterion = types;
        }

        return internalRequest;
    },
    _getModelWithPermissions: function (request, response) {
        var objectName = '';

        if(request.params && request.params.query) {
            var query = request.params.query;

            objectName = query.id.replace('_entityCompositeModel', '');
        }
        
        var manageModel = response && response.response && response.response.entityModels ? response.response.entityModels.find(obj => obj.type == "entityManageModel") : undefined;

        if (!manageModel) {
            var msg = "\n Entity manage model is not available or user does not have permission. Request: " + JSON.stringify(request);
            logger.warn(msg);
            console.log(msg);
            return {};
        }

        manageModel.id = objectName + "_entityCompositeModel";
        manageModel.type = "entityCompositeModel";

        if(manageModel.data) {
            this._updateManageModelsWithPermissions(manageModel.data);

            if(manageModel.data.contexts && manageModel.data.contexts.length > 0) {
                for(let i=0; i<manageModel.data.contexts.length; i++) {
                    let manageModelCtxItm = manageModel.data.contexts[i];
                    this._updateManageModelsWithPermissions(manageModelCtxItm);
                }
            }
        }

        return manageModel;
    },

    _updateManageModelsWithPermissions: function(modelData) {
        //console.log('before _updateManageModelsWithPermissions ', JSON.stringify(modelData));
        if(modelData.attributes) {
            modelData.attributes = this._verifyAndPopulateWritePermission(modelData.attributes, false);
        }

        if(modelData.relationships) {
            modelData.relationships = this._verifyAndPopulateWritePermission(modelData.relationships, true);
        }
        //console.log('after _updateManageModelsWithPermissions ', JSON.stringify(modelData));
    },

    _verifyAndPopulateWritePermission: function(modelObjects, isRelType) {
        var model = {};
        for(var objKey in modelObjects) {
            var modelObject = modelObjects[objKey];

            if(isRelType && modelObject.length > 0) {
                modelObject = modelObject;
            } else {
                modelObject = [modelObject];
            }

            for(var i=0; i<modelObject.length; i++) {
                var modelObj = modelObject[i];

                if(!modelObj.properties) {
                    modelObj.properties = {};
                }

                if(modelObj.properties["readPermission"] === true) {
                    if(modelObj.properties["writePermission"] === true) {
                        modelObj.properties['hasWritePermission'] = true;
                    } else {
                        modelObj.properties['hasWritePermission'] = false;
                    }

                    if(isRelType) {
                        var relAttributes = modelObj.attributes;
                        relAttributes = this._verifyAndPopulateWritePermission(relAttributes, false);
                        model[objKey] = model[objKey] || [];
                        model[objKey].push(modelObj);
                    } else {
                        model[objKey] = modelObj;
                    }
                }
            }
        }
        
        return model;
    }
};

module.exports = EntityCompositeModelGetService;