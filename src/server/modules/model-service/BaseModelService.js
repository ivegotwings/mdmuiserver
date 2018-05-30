let DFServiceRest = require('../common/df-rest-service/DFRestService');
let modelManager = require('./ModelManager');
let falcorUtil = require('../../../shared/dataobject-falcor-util');
let logger = require('../common/logger/logger-service');
let isEmpty = require('../common/utils/isEmpty');


let BaseModelService = function (option) {
    DFServiceRest.call(this, option);
}

const compositeModelTypes = ["entityManageModel", "entityDisplayModel", "entityValidationModle", "entityDefaultModel"];
let ModelManager = new modelManager({});

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
        let transformedModels;

        // get composite model of entity type model "entityTypeModel"
        let compositeEntityTypeModel = await ModelManager.getCompositeModel("entityType");
        logger.debug("BASE_MODEL_COMPOSITE_ENTITY_TYPE_MODEL", { compositeEntityTypeModel: compositeEntityTypeModel }, "modelServce");

        // get composite model of entity type model "attributeModel"
        let compositeAttributeModel = await ModelManager.getCompositeModel("attribuetModel");
        logger.debug("BASE_MODEL_COMPOSITE_ATTRIBUTE_MODEL", { compositeAttributeModel: compositeAttributeModel }, "modelServce");

        if (compositeEntityTypeModel && compositeAttributeModel) {
            let compositeModels;

            transformedModels = await this._transFormEntityTypeModelForSave(compositeEntityTypeModel, compositeAttributeModel, request.entityModel);

            if (transformedModels) {
                compositeModels = this._prepareCompositeModels(transformedModels, compositeAttributeModel);
            }

            if (compositeModels) {
                console.log(JSON.stringify(compositeModels, null, 2));
                for (let compositeModel of compositeModels) {
                    // call process.
                }
            }

        }
    },

    processAttributeModel: async function(request) {

    },

    getEntityTypes: async function (request) {
        let response, modelResponse;
        let entityType = falcorUtil.isValidObjectPath(request, "params.query.id") ? request.params.query.id.replace("_entityTypeModel", "") : "";

        if (!isEmpty(entityType)) {
            // get entity type model "<entity type name>_entityTypeModel"
            let entityTypeModel = await ModelManager.getCompositeModel(entityType);
            logger.debug("BASE_MODEL_ENTITY_TYPE_MODEL", { entityTypeModel: entityTypeModel }, "modelServce");

            // get composite model of entity type model "entityTypeModel"
            let compositeEntityTypeModel = await ModelManager.getCompositeModel("entityType");
            logger.debug("BASE_MODEL_COMPOSITE_ENTITY_TYPE_MODEL", { compositeEntityTypeModel: compositeEntityTypeModel }, "modelServce");

            // transform entity type models in to entities based on composite entity type model.
            if (compositeEntityTypeModel && entityTypeModel) {
                let entities = this._transformEntityTypeModelObjectToEntityTypeEntity(compositeEntityTypeModel, entityTypeModel);
                response = {
                    "response": {
                        "status": "success",
                        "entityModels": entities
                    }
                }
            }

        }

        return response;
    },

    getAttributeModels: async function (request) {
        let response;

        // get attribute model "<attribute name>_attributeModel"
        response = await this.post("entitymodelservice/get", request);
        logger.debug("BASE_MODEL_ATTRIBUTE_MODEL", { attributeModelsResponse: response }, "modelServce");

        // get composite model of attribute model "attributeModel"
        let compositeAttributeModel = await ModelManager.getCompositeModel("attribuetModel");
        logger.debug("BASE_MODEL_COMPOSITE_ATTRIBUTE_MODEL", { compositeAttributeModel: compositeAttributeModel }, "modelServce");

        // transform attribute models in to entities based on composite attribute model.

        if (compositeAttributeModel && response && falcorUtil.isValidObjectPath(response, "response.entityModels")) {
            let attributeModels = response.response.entityModels;
            let entities = this._transformModelObjectToModelEntity(compositeAttributeModel, attributeModels);
            response = {
                "response": {
                    "status": "success",
                    "baseModels": entities
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
    _transformEntityTypeModelObjectToEntityTypeEntity: function (compositeEntityTypeModel, entityTypeModel) {
        if (isEmpty(compositeEntityTypeModel) || isEmpty(entityTypeModel)) {
            return;
        }

        let entities = [];

        if (!isEmpty(compositeEntityTypeModel)) {
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

        return entities;
    },

    // Transform attribuetModel entity into attributeModel
    _transFormEntityTypeModelForSave: async function (compositeEntityTypeModel, compositeAttributeModel, entityTypeModel) {
        let transformedModel = {};

        if (isEmpty(compositeEntityTypeModel)) {
            //
            return transformedModel;
        }

        if (isEmpty(entityTypeModel)) {
            //
            return transformedModel;
        }

        if (compositeEntityTypeModel) {
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
                let selfAttrsAndRels;
                if (entityTypeModelData.relationships) {
                    selfAttrsAndRels = await this._transformModelsIntoAttributesAndRelationships(compositeEntityTypeModelData, compositeAttributeModel, entityTypeModelData);

                    if (selfAttrsAndRels) {
                        if (selfAttrsAndRels.attributes) {
                            transformedModel.data.attributes = selfAttrsAndRels.attributes;
                        }

                        if (temp.relationships) {
                            transformedModel.data.relationships = selfAttrsAndRels.relationships;
                        }
                    }
                } else {
                    //
                }

                if (entityTypeModelData.contexts) {
                    transformedModel.contexts = [];

                    for (let ctx of entityTypeModelData.contexts) {
                        let context = {};
                        let ctxAttrsAndRels;

                        context.context = ctx.context;
                        if (ctx.relationships) {
                            ctxAttrsAndRels = await this._transformModelsIntoAttributesAndRelationships(compositeEntityTypeModelData, compositeAttributeModels, ctx);

                            if (ctxAttrsAndRels) {
                                if (ctxAttrsAndRels.attributes) {
                                    context.attributes = ctxAttrsAndRels.attributes;
                                }

                                if (temp.relationships) {
                                    context.relationships = ctxAttrsAndRels.relationships;
                                }
                            }
                        } else {
                            //
                        }
                        transformedModel.contexts.push(context);
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

    _transformAttributeModelEntitiesToModels: async function (entityModel, entities) {
        let attributes = {}

        if (isEmpty(entityModel)) {
            //
            return;
        }

        if (isEmpty(entities)) {
            //
            return;
        }

        let entityModelData = entityModel.data;

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

                                    if (childEntityIds) {
                                        let childEntities = await ModelManager.getModels(childEntityIds, "attributeModel");

                                        if (childEntities) {
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

    _transformRelationshipModelEntitiesToModels: async function (relEntityModel, entityModel, relEntities) {
        let relationships = {};

        if (isEmpty(relEntityModel)) {
            //
            return;
        }

        if (isEmpty(entityModel)) {
            //
            return;
        }

        if (isEmpty(relEntities)) {
            //
            return;
        }

        let entityModelData = entityModels.data;
        let relEntityModelData = relEntityModel.data;

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

                                    if (entityIds) {
                                        let entities = ModelManager.getModels(entityIds, "attributeModel");

                                        if (entities) {
                                            rel.attributes = this._transformAttributeModelEntitiesToModels(entityModel, entities);
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

    _transformModelsIntoAttributesAndRelationships: async function (compositeEntityTypeModelData, compositeAttributeModel, entityTypeModelData) {
        let transformedModel = {}
        for (let relType in compositeEntityTypeModelData.replationships) {
            if (entityTypeModelData.relationships[relType]) {
                if (relType.toLowerCase() == "hasattributes") {
                    let attributes = transformedModel.attributes = {};
                    let entityIds = entityTypeModelData.relationships[relType].map(v => v.relTo.id);

                    if (entityIds) {
                        let entities = await ModelManager.getModels(entityIds, "attributeModel");
                        if (entities) {
                            attributes = this._transformAttributeModelEntitiesToModels(compositeAttributeModel, entities);
                        } else {
                            //
                        }
                    }
                }
            } else if (relType.toLowerCase() == "hasrelationships") {
                let relationships = transformedModel.relationships = {};
                let relEntityIds = entityTypeModelData.relationships[relType].map(v => v.relTo.id);
                let relEntityResponse;

                if (relEntityIds) {
                    let relEntityModel = await ModelManager.getCompositeModel("relationshipModel");
                    let relEntities = await ModelManager.getModels(relEntityIds, "relationshipModel");

                    if (relEntityModel && relEntities) {
                        relationships = this._transformRelationshipModelEntitiesToModels(relEntityModel, compositeAttributeModel, relEntities);
                    }
                }
            } else {
                //
            }
        }

        return transformedModel;
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

    _prepareCompositeModels: function (attributeModels, compositeAttributeModel) {

        let compositeModels = [];
        let compositeAttributeModelList = this._fetchListOfAttributesBasedOnGroup(compositeAttributeModel);

        if (!isEmpty(attributeModels) && !isEmpty(compositeAttributeModelList)) {
            for (let compModel of compositeModelTypes) {
                let compositeModel = {
                    "id": entityTypeModel.name + "_" + compModel,
                    "name": entityTypeModel.name,
                    "type": compModel,
                    "data": {}
                }

                if (attributeModels.data) {
                    let attribuetModelData = attributeModels.data;
                    let compositeModelData = compositeModel.data;

                    if (attribuetModelData.attributes) {
                        compositeModelData.attributes = {};
                        for (let attr in attribuetModelData.attributes) {
                            compositeModelData.attributes[attr] = attribuetModelData.attributes[attr];
                            compositeModelData.attributes[attr].properties = _.pick(attribuetModelData.attributes[attr].properties, compositeAttributeModelList[compositeModelType]);
                        }
                    }

                    if (attribuetModelData.relationships) {
                        compositeModelData.relationships = {};

                        for (let relType in attribuetModelData.relationships) {
                            if (!isEmpty(attribuetModelData.relationships[relType])) {
                                compositeModelData.relationships[relType] = [];
                                compositeModelData.relationships[relType].push(
                                    {
                                        "properties": attribuetModelData.relationships[relType][0].properties,
                                        "attributes": {}
                                    }
                                );

                                for (let rel of attribuetModelData.relationships[relType]) {
                                    if (rel.attributes) {
                                        for (let relAttr in rel.attributes) {
                                            compositeModelData.relationships[relType][0].attributes[relAttr] = rel.attributes[attr];
                                            compositeModelData.relationships[relType][0].attributes[relAttr].properties = _.pick(rel.attributes[attr].properties, compositeAttributeModelList[compositeModelType]);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                compositeModels.push(compositeModel);
            }
        }

        return compositeModels;

    },

    _fetchListOfAttributesBasedOnGroup: function (entityModel) {

        let compositeAttributeModelList = {};

        if (entityModel) {
            let entityModelData = entityModel.data;

            if (entityModelData) {
                let entityModelDataAttrs = entityModelData.attributes;

                if (entityModelDataAttrs) {
                    compositeAttributeModelList["entityDisplayModel"] = [];
                    compositeAttributeModelList["entityManageModel"] = [];
                    compositeAttributeModelList["entityValidationModel"] = [];
                    compositeAttributeModelList["entityDefaultModel"] = [];

                    for (let attrKey in entityModelDataAttrs) {
                        let groupName = entityModelDataAttrs[attrKey].groupName;
                        switch (groupName.toLowerCase()) {
                            case "basic":
                                compositeAttributeModelList.entityManageModel.push(attrKey);
                                break;
                            case "restriction":
                                compositeAttributeModelList.entityValidationModel.push(attrKey);
                                break;
                            case "display":
                                compositeAttributeModelList.entityDisplayModel.push(attrKey);
                                break;
                            case "default":
                                compositeAttributeModelList.entityDefaultModel.push(attrKey);
                                break;
                        }
                    }
                }
            }
        }

        return compositeAttributeModelList;
    }
}

module.exports = BaseModelService;