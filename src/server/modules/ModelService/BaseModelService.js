let DFServiceRest = require('../common/df-rest-service/DFRestService');
let falcorUtil = require('../../../shared/dataobject-falcor-util');
let logger = require('../common/logger/logger-service');
let isEmpty = require('../common/utils/isEmpty');


let BaseModelService = function (option) {
    DFServiceRest.call(this, option);
}

BaseModelService.prototype = {
    get: async function (request) {
        let response, modelResponse;

        // get attribute model "<attribute name>_attributeModel"
        response = await this.post("entitymodelservice/get", request);
        logger.debug("BASE_MODEL_ATTRIBUTE_MODEL", { attributeModelsResponse: response }, "modelServce");

        // get composite model of attribute model "attributeModel"
        modelResponse = await this.post("entitymodelservice/getcomposite", this._getAttributeModelRequest());
        logger.debug("BASE_MODEL_COMPOSITE_ATTRIBUTE_MODEL", { compositeAttributeModels: modelResponse }, "modelServce");

        // transfomr attribute models in to entities based on composite attribute model.
        if (modelResponse && falcorUtil.isValidObjectPath(modelResponse, "response.entityModels")) {
            if (response && falcorUtil.isValidObjectPath(response, "response.entityModels")) {
                let attributeModels = response.response.entityModels;
                let compositeAttributeModels = modelResponse.response.entityModels;
                let entities = this._transformModelObjectToModelEntity(compositeAttributeModels, attributeModels);
                response = {
                    "response": {
                        "status": "success",
                        "baseModels": entities
                    }
                }
            }
        }

        return response;
    },

    _transformModelObjectToModelEntity: function (compositeAttributeModels, attributeModels) {
        if (isEmpty(attributeModels) || isEmpty(compositeAttributeModels)) {
            return;
        }

        let entities = [];
        let attributeModel = compositeAttributeModels[0];

        if (!isEmpty(attributeModel)) {
            for (let attr of attributeModels) {
                // create entity for each attribute.
                let entity = {};
                entity.id = attr.id;
                entity.name = attr.name;
                entity.type = attr.type;
                entity.data = {};

                if (attributeModel.data) {
                    let attributeModelData = attributeModel.data;

                    // transform properties into attributes based on composite attribute model.
                    if (attributeModelData.attributes) {
                        entity.data.attributes = this._transformAttributePropertiesToAttributes(attributeModelData.attributes, attr.properties);
                    }

                    // transform group into relationships based on composite attribute model.
                    if (attr.group && attributeModelData.relationships) {
                        for (let rel in attributeModelData.relationships) {
                            entity.data.relationships = {};
                            let entityRelationships = entity.data.relationships[rel] = [];

                            for (let grp of attr.group) {
                                for (let grpAttr in grp) {
                                    let rel = {};
                                    rel.relTo = {
                                        "id": grpAttr.id,
                                        "type": grpAttr.type
                                    }

                                    rel.attributes = this._transformAttributePropertiesToAttributes(attributeModel.data.attributes, grpAttr.properties);
                                    entityRelationships["hasChildAttributes"].push(rel);
                                }
                            }
                        }
                    }
                }

                entities.push(entity);
            }
        }

        return entities;
    },

    _transformAttributePropertiesToAttributes: function (attributeModels, attributeProperties) {
        let entityAttributes = {};
        if (!isEmpty(attributeProperties) && !isEmpty(attributeModels)) {
            for (let attrModelName in attributeModels) {
                if (attributeProperties[attrModelName]) {
                    if (attributeModels[attrModelName].group) {
                        // create nested attribute for key object properties based on composite attribute model.
                        entityAttributes[attrModelName] = {}
                        entityAttributes[attrModelName].group = [];

                        for (let group of attributeModels[attrModelName].group) {
                            let grp = {
                                "source": "internal",
                                "locale": "en-US"
                            };
                            for (let grpAttrName in group) {
                                if (grpAttrName.toLowerCase() != "id") {
                                    grp[grpAttrName] = this._prepareAttributeValue(attributeProperties[attrModelName][0][grpAttrName]);
                                }
                            }
                            entityAttributes[attrModelName].group.push(grp);
                        }
                    } else {
                        // create normal attribute for key value properties based on composite attribute model.
                        entityAttributes[attrModelName] = this._prepareAttributeValue(attributeProperties[attrModelName]);
                    }
                }
            }
        }
        return entityAttributes;
    },

    _prepareAttributeValue: function (attrValue) {
        return {
            "values": [
                {
                    "source": "internal",
                    "locale": "en-US",
                    "value": attrValue ? attrValue : ""
                }
            ]
        }
    },

    _getAttributeModelRequest: function () {
        return {
            "params": {
                "query": {
                    "id": "attributeModel",
                    "filters": {
                        "typesCriterion": [
                            "entityManageModel",
                            "entityValidationModel",
                            "entityDisplayModel"
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
    }
}

module.exports = BaseModelService;