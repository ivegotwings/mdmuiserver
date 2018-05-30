let DFServiceRest = require('../common/df-rest-service/DFRestService');
let falcorUtil = require('../../../shared/dataobject-falcor-util');
let localCacheManager = require('../local-cache/LocalCacheManager');
let isEmpty = require('../common/utils/isEmpty');

let ModelManager = function (option) {
    DFServiceRest.call(this, option);
}

let LocalCacheManager = new localCacheManager();

ModelManager.prototype = {
    getCompositeModel: async function (modelType) {
        let baseCompositeModel;
        let cacheKey = this._getCacheKey(modelType);

        baseCompositeModel = await LocalCacheManager.get(cacheKey);

        if (isEmpty(baseCompositeModel)) {
            let baseCompositeModelResponse = await this.post("entitymodelservice/getcomposite", this._getCompositeModelRequest(modelType));
            if (baseCompositeModelResponse && falcorUtil.isValidObjectPath(baseCompositeModelResponse, "response.entityModels")) {
                baseCompositeModel = baseCompositeModelResponse.response.entityModels[0];

                await LocalCacheManager.set(cacheKey, baseCompositeModel);
            }
        }

        return baseCompositeModel;
    },

    getModels: async function (modelIds, modelType) {
        let models = [];
        let missingModelIds = [];
        let cacheKey = this._getCacheKey("COMPOSITE_MODEL_" + modelType);
        let cachedData = await LocalCacheManager.get(cacheKey);

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
            let entityModels = await this._getAttributeModels(missingModelIds);

            if (entityModels) {
                cachedData = cachedData ? cachedData : {};
                for (let entityModel of entityModels) {
                    cachedData[entityModel.id] = entityModel;
                }
                await LocalCacheManager.set(cacheKey, cachedData);
            }
        }

        return models;
    },

    _getModels: async function (modelIds, modelType) {
        let entityModels = [];
        let modelEntitiesResponse = await this.post("entitymodelservice/get", this._getModelRequest(modelIds, modelType));

        if (modelEntitiesResponse && falcorUtil.isValidObjectPath(childEntityResponse, "response.entityModels")) {
            entityModels = childEntityResponse.response.entityModels;
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
                            "entityDefaultModel"
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

    _getCacheKey: function (type) {
        return "MODEL_" + type;
    }
}

module.exports = ModelManager;