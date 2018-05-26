let DFServiceRest = require('../common/df-rest-service/DFRestService');
let falcorUtil = require('../../../shared/dataobject-falcor-util');
let logger = require('../common/logger/logger-service');
let isEmpty = require('../common/utils/isEmpty');


let BaseModelService = function (option) {
    DFServiceRest.call(this, option);
}

BaseModelService.prototype = {
    get: async function (request) {
        let response;
        let requestType = falcorUtil.isValidObjectPath(request, "params.query.filters.typesCriterion") ? request.params.query.filters.typesCriterion[0] : "";

        if (!isEmpty(requestType)) {
            switch (requestType) {
                case "entityTypeModel":
                    response = await this.getEntityTypes(request);
                    break;
                case "attributeModel":
                    response = await this.getAttributeModels(request);
                    break;
            }
        }

        return response;
    },

    getAttributeModels: async function (request) {
        let response, modelResponse;

        // get attribute model "<attribute name>_attributeModel"
        response = await this.post("entitymodelservice/get", request);
        logger.debug("BASE_MODEL_ATTRIBUTE_MODEL", { attributeModelsResponse: response }, "modelServce");

        // get composite model of attribute model "attributeModel"
        modelResponse = await this.post("entitymodelservice/getcomposite", this._getCompositeModelRequest("attribuetModel"));
        logger.debug("BASE_MODEL_COMPOSITE_ATTRIBUTE_MODEL", { compositeAttributeModels: modelResponse }, "modelServce");

        // transform attribute models in to entities based on composite attribute model.
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

    getEntityTypes: async function (request) {
        let response, modelResponse;
        let entityType = falcorUtil.isValidObjectPath(request, "params.query.id") ? request.params.query.id.replace("_entityTypeModel", "") : "";

        if (!isEmpty(entityType)) {
            // get entity type model "<entity type name>_entityTypeModel"
            response = await this.post("entitymodelservice/getcomposite", this._getCompositeModelRequest(entityType));
            logger.debug("BASE_MODEL_ENTITY_TYPE_MODEL", { entityTypeModelsResponse: response }, "modelServce");

            // get composite model of entity type model "entityTypeModel"
            modelResponse = await this.post("entitymodelservice/getcomposite", this._getCompositeModelRequest("entityType"));
            logger.debug("BASE_MODEL_COMPOSITE_ENTITY_TYPE_MODEL", { compositeEntityTypeModels: modelResponse }, "modelServce");

            // transform entity type models in to entities based on composite entity type model.
            if (modelResponse && falcorUtil.isValidObjectPath(modelResponse, "response.entityModels")) {
                if (response && falcorUtil.isValidObjectPath(response, "response.entityModels")) {
                    let entityTypeModels = response.response.entityModels;
                    let compositeEntityTypeModels = modelResponse.response.entityModels;
                    let entities = this._transformEntityTypeModelObjectToEntityTypeEntity(compositeEntityTypeModels, entityTypeModels);
                    response = {
                        "response": {
                            "status": "success",
                            "entityModels": entities
                        }
                    }
                }
            }
        }

        return response;
    },

    // Used for GET Attribute Model
    // Conversion of <attribute>_attributeModel into <attribute> entity.
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

    // Used for GET Entity Type Model
    // Conversion of <entityType>_compositeModel into <entityType> entity.
    _transformEntityTypeModelObjectToEntityTypeEntity: function (compositeEntityTypeModels, entityTypeModels) {
        if (isEmpty(compositeEntityTypeModels) || isEmpty(entityTypeModels)) {
            return;
        }

        let entities = [],
            compositeEntityTypeModel = compositeEntityTypeModels[0];

        if (!isEmpty(compositeEntityTypeModel)) {
            for (let entityTypeModel of entityTypeModels) {
                // prepare entity for entity type.
                let entity = {};
                entity.name = entityTypeModel.name;
                entity.id = entityTypeModel.name + "_entityTypeModel";
                entity.type = "entityTypeModel";
                entity.data = {};

                if (compositeEntityTypeModel.data) {
                    let compositeModelData = compositeEntityTypeModel.data;

                    // transform properties into attributes based on composite attribute model.
                    if (compositeModelData.attributes) {
                        entity.data.attributes = this._transformAttributePropertiesToAttributes(compositeModelData.attributes, entityTypeModel.properties);
                    }

                    // transfrom attributes and relationships into "hasattributes" and "hasrelationships" relationships.
                    if (compositeModelData.relationships) {

                        // transfrom self attributes and relationships
                        if (entityTypeModel.data) {
                            entity.data.relationships = this._transformAttrsAndRelsIntoMappedRels(compositeModelData.relationships, entityTypeModel.data);
                        }

                        // transfrom contextual attributes and relationships
                        if (entityTypeModel.contexts) {
                            let contexts = entity.data.contexts = []
                            for (let ctx of entityTypeModel.contexts) {
                                let context = {
                                    "context": ctx.context
                                };
                                context.relationships = this._transformAttrsAndRelsIntoMappedRels(compositeModelData.relationships, ctx);
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

    _transformAttributesToAttributeProperties: function (attributeModels, attributeProperties) {
        // TO DO
    },

    _transformAttrsAndRelsIntoMappedRels: function (relationshipModelObjects, attrAndRelModels) {
        let relationships = {};
        if (!isEmpty(relationshipModelObjects) && !isEmpty(attrAndRelModels)) {
            for (let rel in relationshipModelObjects) {
                if (rel.toLowerCase() == "hasattributes" && attrAndRelModels.attributes) {
                    // transform contextual attributes into contextual hasattributes relationships
                    relationships.hasattributes = this._prepareRelationships(attrAndRelModels.attributes, "attributeModel")
                } else if (rel.toLowerCase() == "hasrelationships" && attrAndRelModels.relationships) {
                    // transform contextual relationships into contextual hasrelationships relationships
                    relationships.hasrelationships = this._prepareRelationships(attrAndRelModels.relationships, "relationshipModel")
                }
            }
        }
        return relationships;
    },

    _prepareRelationships: function (modelObjects, modelType) {
        let relationships = [];

        if (!isEmpty(modelObjects) && !isEmpty(modelType)) {
            for (let modelObject in modelObjects) {
                let newRel = {};
                newRel.relTo = {
                    "id": modelObject + "_" + modelType,
                    "type": modelType
                }
                relationships.push(newRel);
            }
        }

        return relationships;
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

    _getCompositeModelRequest: function (modelType) {
        return {
            "params": {
                "query": {
                    "id": modelType,
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