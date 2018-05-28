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
                case "relationshipModel":
                    response = ""
                    break;
            }
        }

        return response;
    },

    process: async function (request) {
        let modelResponse;

        // get composite model of entity type model "entityTypeModel"
        modelResponse = await this.post("entitymodelservice/getcomposite", this._getCompositeModelRequest("entityType"));
        logger.debug("BASE_MODEL_COMPOSITE_ENTITY_TYPE_MODEL", { compositeEntityTypeModels: modelResponse }, "modelServce");

        if (modelResponse && falcorUtil.isValidObjectPath(modelResponse, "response.entityModels")) {
            let compositeEntityTypeModels = modelResponse.response.entityModels;
            let transformedModel = await this._transFormEntityTypeModelForSave(compositeEntityTypeModels, attributeModels);


            ////////
        }
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

    // Transform attribuetModel entity into attributeModel
    _transFormEntityTypeModelForSave: async function (compositeEntityTypeModels, entityTypeModels) {
        let transformedModel = {};

        if(isEmpty(compositeEntityTypeModels)) {
            //
            return transformedModel;
        }

        if(isEmpty(entityTypeModels)) {
            //
            return transformedModel;
        }

        let compositeEntityTypeModel = compositeEntityTypeModels[0];
        let entityTypeModel = entityTypeModels[0];

        if (compositeEntityTypeModel && entityTypeModel) {
            let properties, entityModelResponse;
            let entityTypeModelData = entityTypeModel.data;
            let compositeEntityTypeModelData = compositeEntityTypeModel.data;

            transformedModel.name = entityTypeModel.name;
            transformedModel.data = {};

            if (compositeEntityTypeModelData.attributes && entityTypeModelData.attributes) {
                transformedModel.properties = this._transformAttributesToAttributeProperties(compositeEntityTypeModelData.attributes, entityTypeModelData.attributes);
            } else {
                //
            }

            if (compositeEntityTypeModelData.replationships) {
                if (entityTypeModelData.relationships) {
                    entityModelResponse = await this.post("entitymodelservice/getcomposite", this._getCompositeModelRequest("attribuetModel"));
                    if (entityModelResponse && falcorUtil.isValidObjectPath(entityModelResponse, "response.entityModels")) {
                        let entityModels = entityModelResponse.response.entityModels;
                        for (let relType in compositeEntityTypeModelData.replationships) {
                            if (entityTypeModelData.relationships[relType]) {
                                if (relType.toLowerCase() == "hasattributes") {
                                    let attributes = transformedModel.data.attributes = {};
                                    let entityIds = entityTypeModelData.relationships[relType].map(v => v.relTo.id);
                                    let entityResponse;

                                    if (entityIds) {
                                        entityResponse = await this.post("entitymodelservice/get", this._getAttributeModelRequest(entityIds));
                                        if (entityResponse && falcorUtil.isValidObjectPath(entityResponse, "response.entityModels")) {
                                            let entities = entityResponse.response.entityModels;
                                            attributes = this._transformAttributeModelEntitiesToModels(entityModels, entities);
                                        } else {
                                            //
                                        }
                                    }
                                }
                            } else if (relType.toLowerCase() == "hasrelationships") {
                                let relationships = transformedModel.data.relationships = {};
                                let relEntityIds = entityTypeModelData.relationships[relType].map(v => v.relTo.id);
                                let relEntityResponse, relEntityModelResponse;

                                if (relEntityIds) {
                                    relEntityModelResponse = await this.post("entitymodelservice/getcomposite", this._getCompositeModelRequest("relationshipModel"));
                                    relEntityResponse = await this.post("entitymodelservice/get", this._getAttributeModelRequest(relEntityIds));
                                    if (relEntityModelResponse && falcorUtil.isValidObjectPath(relEntityModelResponse, "response.entityModels")) {
                                        if (relEntityResponse && falcorUtil.isValidObjectPath(relEntityResponse, "response.entityModels")) {
                                            let relEntityModels = relEntityModelResponse.response.entityModels;
                                            let relEntities = relEntityResponse.response.entityModels;

                                            relationships = this._transformRelationshipModelEntitiesToModels(relEntityModels, entityModels, relEntities);
                                        }
                                    }
                                }
                            } else {
                                //
                            }
                        }
                    } else {
                        //
                    }
                } else {
                    //
                }

                if (entityTypeModelData.contexts) {
                    transformedModel.contexts = [];
                    for (let ctx of entityTypeModelData.contexts) {
                        let context = {};
                        context.context = ctx.context;

                        if (ctx.relationships) {
                            entityModelResponse = await this.post("entitymodelservice/getcomposite", this._getCompositeModelRequest("attribuetModel"));
                            if (entityModelResponse && falcorUtil.isValidObjectPath(entityModelResponse, "response.entityModels")) {
                                let entityModels = entityModelResponse.response.entityModels;
                                for (let relType in compositeEntityTypeModelData.replationships) {
                                    if (ctx.relationships[relType]) {
                                        if (relType.toLowerCase() == "hasattributes") {
                                            let attributes = context.attributes = {};
                                            let entityIds = ctx.relationships[relType].map(v => v.relTo.id);
                                            let entityResponse;

                                            if (entityIds) {
                                                entityResponse = await this.post("entitymodelservice/get", this._getAttributeModelRequest(entityIds));
                                                if (entityResponse && falcorUtil.isValidObjectPath(entityResponse, "response.entityModels")) {
                                                    let entities = entityResponse.response.entityModels;
                                                    attributes = this._transformAttributeModelEntitiesToModels(entityModels, entities);
                                                } else {
                                                    //
                                                }
                                            }
                                        }
                                    } else if (relType.toLowerCase() == "hasrelationships") {
                                        let relationships = context.relationships = {};
                                        let relEntityIds = ctx.relationships[relType].map(v => v.relTo.id);
                                        let relEntityResponse, relEntityModelResponse;

                                        if (relEntityIds) {
                                            relEntityModelResponse = await this.post("entitymodelservice/getcomposite", this._getCompositeModelRequest("relationshipModel"));
                                            relEntityResponse = await this.post("entitymodelservice/get", this._getAttributeModelRequest(relEntityIds));
                                            if (relEntityModelResponse && falcorUtil.isValidObjectPath(relEntityModelResponse, "response.entityModels")) {
                                                if (relEntityResponse && falcorUtil.isValidObjectPath(relEntityResponse, "response.entityModels")) {
                                                    let relEntityModels = relEntityModelResponse.response.entityModels;
                                                    let relEntities = relEntityResponse.response.entityModels;

                                                    relationships = this._transformRelationshipModelEntitiesToModels(relEntityModels, entityModels, relEntities);
                                                }
                                            }
                                        }
                                    } else {
                                        //
                                    }
                                }
                            } else {
                                //
                            }
                        } else {
                            //
                        }
                    }
                }
            } else {
                //
            }
        } else {
            //
        }
        return transformedModel;
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

    _transformAttributeModelEntitiesToModels: async function (entityModels, entities) {
        let attributes = {}

        if (isEmpty(entityModels)) {
            //
            return;
        }

        if (isEmpty(entities)) {
            //
            return;
        }

        let entityModelData = entityModels[0].data;

        if (entityModelData) {
            for (let entity of entities) {
                attributes[entity.name] = {};
                let properties = attributes[entity.name].properties = {};
                let entityData = entity.data;

                if (entityData) {
                    if (entityModelData.attributes && entityData.attributes) {
                        properties = this._transformAttributesToAttributeProperties(entityModelData.attributes, entityData.attributes);
                    }

                    if (entityModelData.relationships && entityData.relationships) {
                        for (let relType in entityModelData.relationships) {
                            if (entityData.relationships[relType]) {
                                attributes[entity.name].group = [];
                                let group = {};
                                if (relType.toLowerCase() == "haschildattributes") {
                                    let childEntityIds = entityData.relationships[relType].map(v => v.relTo.id);
                                    let childEntityResponse;
                                    if (childEntityIds) {
                                        childEntityResponse = await this.post("entitymodelservice/get", this._getAttributeModelRequest(childEntityIds));

                                        if (childEntityResponse && falcorUtil.isValidObjectPath(childEntityResponse, "response.entityModels")) {
                                            let childEntities = childEntityResponse.response.entityModels;

                                            for (let childEntity of childEntities) {
                                                group[childEntity.name] = {};
                                                let childEntityProperties = group[childEntity.name].properties = {};

                                                let childEntityData = childEntity.data;

                                                if (childEntityData) {
                                                    if (childEntityData.attributes) {
                                                        childEntityProperties = this._transformAttributesToAttributeProperties(entityModelData.attributes, childEntityData.attributes);
                                                    }

                                                    if (childEntityData.relationships) {
                                                        // This is not supported for now.
                                                        // This is scenario of child attribute has child attributes.
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        return attributes;
    },

    _transformRelationshipModelEntitiesToModels: async function (relEntityModels, entityModels, relEntities) {
        let relationships = {};

        if (isEmpty(relEntityModels)) {
            //
            return;
        }

        if (isEmpty(entityModels)) {
            //
            return;
        }

        if (isEmpty(relEntities)) {
            //
            return;
        }

        let entityModelData = entityModels[0].data;
        let relEntityModelData = relEntityModels[0].data;

        if (entityModelData && relEntityModelData) {
            for (let relEntity of relEntities) {
                relationships[relEntity.name] = [];
                let rel = {};
                let relEntityData = relEntity.data;

                if (relEntityData) {
                    if (relEntityModelData.attributes && relEntityData.attributes) {
                        rel.properties = this._transformAttributesToAttributeProperties(relEntityModelData.attributes, relEntityData.attributes);
                    }

                    if (relEntityModelData.relationships && relEntityData.relationships) {
                        for (let relType in relEntityModelData.relationships) {
                            if (relEntityData.relationships[relType]) {
                                if (relType.toLowerCase() == "hasattributes") {
                                    let relAttributes;
                                    let entityIds = relEntityData.relationships[relType].map(v => v.relTo.id);
                                    let entityResponse;
                                    if (entityIds) {
                                        entityResponse = await this.post("entitymodelservice/get", this._getAttributeModelRequest(entityIds));

                                        if (entityResponse && falcorUtil.isValidObjectPath(entityResponse, "response.entityModels")) {
                                            let entities = entityResponse.response.entityModels;
                                            rel.attributes = this._transformAttributeModelEntitiesToModels(entityModels, entities);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        return relationships;
    },

    _transformAttributesToAttributeProperties: function (attributeModels, attributes) {
        let properties = {};

        if (attributeModels && attributes) {
            for (let attr in attributeModels) {
                if (attributes[attr]) {
                    if (attributeModels[attr].group) {
                        properties[attr] = [];
                        for (let grp of attributeModels[attr].group) {
                            let childProperties = {};
                            for (let grpAttrKey in grp) {
                                childProperties[grpAttrKey] = this._getAttributeValue(grp[grpAttrKey]);
                            }
                            properties[attr].push(childProperties);
                        }
                    } else {
                        properties[attr] = this._getAttributeValue(attributes[attr]);
                    }
                }
            }
        }

        return properties;
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

    _getAttributeValue: function (attribute) {
        let value;

        if (attribute) {
            value = attribute.values ? attribute.values[0].value : "";
        }

        return value;
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
    },

    _getAttributeModelRequest: function (modelIds) {
        return {
            "params": {
                "query": {
                    "ids": modelType,
                    "filters": {
                        "typesCriterion": [
                            "attributeModel"
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