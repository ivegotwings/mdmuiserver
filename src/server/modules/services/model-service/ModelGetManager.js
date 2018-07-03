let DFServiceRest = require('../../common/df-rest-service/DFRestService');
let falcorUtil = require('../../../../shared/dataobject-falcor-util');
let localCacheManager = require('../../local-cache/LocalCacheManager');
let isEmpty = require('../../common/utils/isEmpty');

let config = require('config');
let modelCacheEnabled = config.get('modules.webEngine.modelCacheEnabled');

let ModelManager = function (option) {
    DFServiceRest.call(this, option);
}

let LocalCacheManager = new localCacheManager();

ModelManager.prototype = {
    getCompositeModel: async function (modelType) {
        let baseCompositeModel, cachekey;

        if(modelCacheEnabled) {
            cacheKey = this.getCompositeModelCacheKey(modelType);
            baseCompositeModel = await LocalCacheManager.get(cacheKey);
        }

        if (isEmpty(baseCompositeModel)) {
            let baseCompositeModelResponse = await this.post("entitymodelservice/getcomposite", this._getCompositeModelRequest(modelType));
            if (baseCompositeModelResponse && falcorUtil.isValidObjectPath(baseCompositeModelResponse, "response.entityModels")) {
                baseCompositeModel = baseCompositeModelResponse.response.entityModels[0];

                if(modelCacheEnabled) {
                    await LocalCacheManager.set(cacheKey, baseCompositeModel);
                }
            }
        }

        return baseCompositeModel;
    },

    getModels: async function (modelIds, modelType) {
        let models = [];
        let missingModelIds = [];
        let cacheKey, cachedData;

        if(modelCacheEnabled) {
            cacheKey = this.getModelCacheKey(modelType);
            cachedData = await LocalCacheManager.get(cacheKey);
        }

        if (cachedData) {
            for (let item of modelIds) {
                if (cachedData[item]) {
                    models.push(cachedData[item]);
                } else {
                    missingModelIds.push(item);
                }
            }
        } else {
            missingModelIds = modelIds;
        }

        if (missingModelIds.length) {
            let entityModels = await this._getModels(missingModelIds, modelType);

            if (entityModels) {
                cachedData = cachedData ? cachedData : {};
                for (let entityModel of entityModels) {
                    models.push(entityModel);
                    cachedData[entityModel.id] = entityModel;
                }

                if(modelCacheEnabled) {
                    await LocalCacheManager.set(cacheKey, cachedData);
                }
            }
        }

        return models;
    },

    _getModels: async function (modelIds, modelType) {
        let entityModels = [];
        let modelEntitiesResponse = await this.post("entitymodelservice/get", this._getModelRequest(modelIds, modelType));

        if (modelEntitiesResponse && falcorUtil.isValidObjectPath(modelEntitiesResponse, "response.entityModels")) {
            entityModels = modelEntitiesResponse.response.entityModels;
        }

        return entityModels;
    },

    _getModelRequest: function (modelIds, modelType) {
        return {
            "params": {
                "query": {
                    "ids": modelIds,
                    "filters": {
                        "typesCriterion": [
                            modelType
                        ]
                    }
                },
                "fields": {
                    "attributes": [
                        "_ALL"
                    ],
                    "relationships": [
                        "_ALL"
                    ]
                }
            }
        };
    },

    _getCompositeModelRequest: function (modelType) {
        return {
            "params": {
                "query": {
                    "id": modelType,
                    "filters": {
                        "typesCriterion": [
                            "entityManageModel",
                            "entityValidationModel",
                            "entityDisplayModel",
                            "entityDefaultValuesModel"
                        ]
                    }
                },
                "fields": {
                    "attributes": [
                        "_ALL"
                    ],
                    "relationships": [
                        "_ALL"
                    ]
                }
            }
        };
    },

    getCompositeModelCacheKey: function (type) {
        return this._getCacheKey("COMPOSITE_MODEL_" + type);
    },

    getModelCacheKey: function(type) {
        return this._getCacheKey(type);
    },

    _getCacheKey: function (type) {
        return "BASE_MODEL_" + type;
    }
}

module.exports = ModelManager;