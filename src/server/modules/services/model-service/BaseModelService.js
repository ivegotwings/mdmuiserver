let DFServiceRest = require('../../common/df-rest-service/DFRestService');
let DataObjectManageService = require("../data-service/DataObjectManageService");
let ModelGetManager = require('./ModelGetManager');
let falcorUtil = require('../../../../shared/dataobject-falcor-util');
let logger = require('../../common/logger/logger-service');
let isEmpty = require('../../common/utils/isEmpty');
let _ = require('underscore');


let BaseModelService = function (option) {
    DFServiceRest.call(this, option);
}

const compositeModelTypes = ["entityManageModel", "entityDisplayModel", "entityValidationModle", "entityDefaultModel"];
let modelGetManager = new ModelGetManager({});
let dataObjectManageService = new DataObjectManageService({});

BaseModelService.prototype = {
    get: async function (request) {
        let response;
        let requestType = falcorUtil.isValidObjectPath(request, "params.query.filters.typesCriterion") ? request.params.query.filters.typesCriterion[0] : "";

        if (!isEmpty(requestType)) {
            switch (requestType) {
                case "attributeModel":
                    response = await this._getAttributeModels(request);
                    break;
                case "entityType":
                    response = await this._getEntityType(request);
                    break;
                case "relationshipModel":
                    response = await this._getRelationshipModels(request);
                    break;
            }
        }

        return response;
    },

    process: async function (request, action, dataObjectType) {
        let dataOperationResult = {};

        switch (action) {
            case "update":
            case "create":
                switch (dataObjectType) {
                    case "attributeModel":
                        dataOperationResult = await this._processAttributeModel(request, action);
                        break;
                    case "entityType":
                        dataOperationResult = await this._processEntityTypeModel(request, action);
                        break;
                    case "relationshipModel":
                        dataOperationResult = await this._processRelationshipModel(request, action);
                        break;
                }
                break;
            case "delete":
                dataOperationResult = await this._deleteModel(request, dataObjectType);
                break;
        }

        return dataOperationResult;
    },

    _getAttributeModels: async function (request) {
        let response;

        // get attribute model "<attribute name>_attributeModel"
        response = await this.post("entitymodelservice/get", request);
        logger.debug("BASE_MODEL_ATTRIBUTE_MODEL", { attributeModelsResponse: response }, "modelServce");

        // get composite model of attribute model "attributeModel"
        let compositeAttributeModel = await modelGetManager.getCompositeModel("attributeModel");
        logger.debug("BASE_MODEL_COMPOSITE_ATTRIBUTE_MODEL", { compositeAttributeModel: compositeAttributeModel }, "modelServce");

        // transform attribute models in to entities based on composite attribute model.
        if (compositeAttributeModel && response && falcorUtil.isValidObjectPath(response, "response.entityModels")) {
            let attributeModels = response.response.entityModels;
            let entities = await this._transformModelObjectToModelEntity(compositeAttributeModel, attributeModels);
            response = {
                "response": {
                    "status": "success",
                    "entityModels": entities
                }
            }
        }

        return response;
    },

    _processAttributeModel: async function (request, action) {
        let transformedModel, transfromedRequest, dataOperationResult;

        // get composite model of entity type model "attributeModel"
        let compositeAttributeModel = await modelGetManager.getCompositeModel("attributeModel");
        logger.debug("BASE_MODEL_COMPOSITE_ATTRIBUTE_MODEL", { compositeAttributeModel: compositeAttributeModel }, "modelServce");

        if (compositeAttributeModel) {
            transformedModel = await this._transFormAttributeModelForSave(compositeAttributeModel, request.entityModel);
        }

        if (transformedModel) {
            request[request.dataIndex] = transformedModel;
        }

        dataOperationResult = await dataObjectManageService.process(request, action);

        return dataOperationResult;
    },

    // Used for GET Attribute/Relationship Model
    // Conversion of <attribute>_attributeModel/<relationship>_relationshipModel into <attribute>/<relationship> entity.
    _transformModelObjectToModelEntity: async function (compositeModel, models) {
        if (isEmpty(models) || isEmpty(compositeModel)) {
            return;
        }

        let entities = [];
        for (let model of models) {
            // create entity for each attribute.
            let entity = {};
            entity.id = model.id;
            entity.name = model.name;
            entity.type = model.type;
            entity.properties = model.properties;
            entity.data = {};

            if (compositeModel.data) {
                let compositeModelData = compositeModel.data;

                // transform properties into attributes based on composite attribute model.
                if (compositeModelData.attributes) {
                    entity.data.attributes = this._transformAttributePropertiesToAttributes(compositeModelData.attributes, model.properties);
                }

                // transform group into relationships based on composite attribute model.
                if (falcorUtil.isValidObjectPath(model, "properties.childAttributes") && compositeModelData.relationships) {
                    for (let relType in compositeModelData.relationships) {
                        entity.data.relationships = {};
                        let entityRelationships = entity.data.relationships[relType] = [];

                        let childEntityIds = model.properties.childAttributes.map(v => v = v + "_" + model.type);

                        if (childEntityIds) {
                            let childEntities = await modelGetManager.getModels(childEntityIds, model.type);

                            if (childEntities) {
                                for (let childEntity of childEntities) {
                                    let rel = {};
                                    rel.id = relType + "_" + childEntity.id;
                                    rel.relTo = {
                                        "id": childEntity.id,
                                        "type": childEntity.type
                                    }
                                    rel.attributes = this._transformAttributePropertiesToAttributes(compositeModelData.attributes, childEntity.properties);
                                    entityRelationships.push(rel);
                                }
                            } else {
                                //
                            }
                        }
                    }
                }
            }

            entities.push(entity);
        }

        return entities;
    },

    _transFormAttributeModelForSave: async function (compositeAttributeModel, attributeModel) {
        let transformedModel = {};

        if (isEmpty(compositeAttributeModel)) {
            //
            return transformedModel;
        }

        let properties;
        let compositeAttributeModelData = compositeAttributeModel.data;
        let attributeModelData = attributeModel.data;

        transformedModel.id = attributeModel.id;
        transformedModel.type = attributeModel.type;
        transformedModel.name = attributeModel.name;
        transformedModel.domain = attributeModel.domain;

        if (compositeAttributeModelData && attributeModelData) {
            if (compositeAttributeModelData.attributes && attributeModelData.attributes) {
                properties = this._transformAttributesToAttributeProperties(compositeAttributeModelData.attributes, attributeModelData.attributes);
            }

            if (compositeAttributeModelData.relationships) {
                // In case if we support.
            }
        }

        if (!isEmpty(properties)) {
            transformedModel.properties = properties;
        }

        return transformedModel;
    },

    _getEntityType: async function (request) {
        let response, modelResponse, entityTypeModels = [];

        if (this._isEntityTypeEAR(request)) {
            let entityType = falcorUtil.isValidObjectPath(request, "params.query.id") ? request.params.query.id.replace("_entityType", "") : "";

            if (!isEmpty(entityType)) {
                // get entity type model "<entity type name>_entityTypeModel"
                let entityTypeModel = await modelGetManager.getCompositeModel(entityType);
                let entityTypeEntities = await modelGetManager.getModels([entityType + "_entityType"], "entityType");

                if (entityTypeEntities) {
                    let entityTypeEntity = entityTypeEntities[0];

                    if (entityTypeEntity) {
                        if (isEmpty(entityTypeEntity)) {
                            entityTypeEntity = {};
                        }

                        entityTypeModel.type = entityTypeEntity.type;
                        entityTypeModel.name = entityTypeEntity.name;
                        entityTypeModel.domain = entityTypeEntity.domain;
                        entityTypeModel.properties = entityTypeEntity.properties;
                    }
                }

                logger.debug("BASE_MODEL_ENTITY_TYPE_MODEL", { entityTypeModel: entityTypeModel }, "modelServce");
                entityTypeModels.push(entityTypeModel);
            }
        } else {
            let ids = request.params.query.ids;
            entityTypeModels = await modelGetManager.getModels(ids, "entityType");
        }

        // get composite model of entity type model "entityTypeModel"
        let compositeEntityTypeModel = await modelGetManager.getCompositeModel("entityType");
        logger.debug("BASE_MODEL_COMPOSITE_ENTITY_TYPE_MODEL", { compositeEntityTypeModel: compositeEntityTypeModel }, "modelServce");

        // transform entity type models in to entities based on composite entity type model.
        if (compositeEntityTypeModel && entityTypeModels) {
            let entities = this._transformCompositeModelObjectToCompositeModelEntity(compositeEntityTypeModel, entityTypeModels);
            response = {
                "response": {
                    "status": "success",
                    "entityModels": entities
                }
            }
        }

        return response;
    },

    _processEntityTypeModel: async function (request, action) {
        let transformedModel, dataOperationResults = [];

        // get composite model of entity type model "entityTypeModel"
        let compositeEntityTypeModel = await modelGetManager.getCompositeModel("entityType");
        logger.debug("BASE_MODEL_COMPOSITE_ENTITY_TYPE_MODEL", { compositeEntityTypeModel: compositeEntityTypeModel }, "modelServce");

        // get composite model of entity type model "attributeModel"
        let compositeAttributeModel = await modelGetManager.getCompositeModel("attributeModel");
        logger.debug("BASE_MODEL_COMPOSITE_ATTRIBUTE_MODEL", { compositeAttributeModel: compositeAttributeModel }, "modelServce");

        if (compositeEntityTypeModel && compositeAttributeModel) {
            let compositeModels, model;

            transformedModel = await this._transformCompositeModelForSave(compositeEntityTypeModel, request.entityModel);

            if (transformedModel) {
                model = this._prepareModel(transformedModel);
                compositeModels = this._prepareCompositeModels(transformedModel, compositeAttributeModel, request.entityModel);
            }

            if (!isEmpty(model)) {
                request[request.dataIndex] = model;
                let dataOperationResult = await dataObjectManageService.process(request, action);
                dataOperationResults.push(dataOperationResult);
            }

            if (!isEmpty(compositeModels)) {
                for (let compositeModel of compositeModels) {
                    request[request.dataIndex] = compositeModel;
                    let dataOperationResult = await dataObjectManageService.process(request, action);
                    dataOperationResults.push(dataOperationResult);
                }
            }
        }

        return {
            "response": {
                "status": "success",
                "content": dataOperationResults
            }
        }
    },

    _getRelationshipModels: async function (request) {
        let response, modelResponse, relationshipTypeModels = [];

        if (this._isEntityTypeEAR(request)) {
            let relationshipModel = falcorUtil.isValidObjectPath(request, "params.query.id") ? request.params.query.id.replace("_relationshipModel", "") : "";

            if (!isEmpty(relationshipModel)) {
                // get relationship type model "<relationship type name>_relationshipModel"
                let relationshipTypeModel = await modelGetManager.getCompositeModel(relationshipModel);
                let relationshipModelEntities = await modelGetManager.getModels([relationshipModel + "_relationshipModel"], "relationshipModel");

                if (relationshipModelEntities) {
                    let relationshipModelEntity = relationshipModelEntities[0];

                    if (relationshipModelEntity) {
                        if (isEmpty(relationshipTypeModel)) {
                            relationshipTypeModel = {};
                        }
                        relationshipTypeModel.type = relationshipModelEntity.type;
                        relationshipTypeModel.name = relationshipModelEntity.name;
                        relationshipTypeModel.domain = relationshipModelEntity.domain;
                        relationshipTypeModel.properties = relationshipModelEntity.properties;
                    }
                }

                logger.debug("BASE_MODEL_RELATIONSHIP_TYPE_MODEL", { relationshipTypeModel: relationshipTypeModel }, "modelServce");
                relationshipTypeModels.push(relationshipTypeModel);
            }
        } else {
            let ids = request.params.query.ids;
            relationshipTypeModels = await modelGetManager.getModels(ids, "relationshipModel");
        }

        // get composite model of relationship type model "entityTypeModel"
        let compositeRelationshipTypeModel = await modelGetManager.getCompositeModel("relationshipModel");
        logger.debug("BASE_MODEL_COMPOSITE_RELATIONSHIP_TYPE_MODEL", { compositeRelationshipTypeModel: compositeRelationshipTypeModel }, "modelServce");

        // transform relationship type models in to entities based on composite relationship type model.
        if (compositeRelationshipTypeModel && relationshipTypeModels) {
            let entities = this._transformCompositeModelObjectToCompositeModelEntity(compositeRelationshipTypeModel, relationshipTypeModels);
            response = {
                "response": {
                    "status": "success",
                    "entityModels": entities
                }
            }
        }

        return response;
    },

    _processRelationshipModel: async function (request, action) {
        let transformedModel, dataOperationResults = [];

        // get composite model of relationship model "relationshipModel"
        let compositeRelationshipModel = await modelGetManager.getCompositeModel("relationshipModel");
        logger.debug("BASE_MODEL_COMPOSITE_RELATIONSHIP_MODEL", { compositeRelationshipModel: compositeRelationshipModel }, "modelServce");

        // get composite model of attribute model "attributeModel"
        let compositeAttributeModel = await modelGetManager.getCompositeModel("attributeModel");
        logger.debug("BASE_MODEL_COMPOSITE_ATTRIBUTE_MODEL", { compositeAttributeModel: compositeAttributeModel }, "modelServce");

        if (compositeRelationshipModel && compositeAttributeModel) {
            let compositeModels, model;

            transformedModel = await this._transformCompositeModelForSave(compositeRelationshipModel, request.entityModel);

            if (transformedModel) {
                model = this._prepareModel(transformedModel);
                compositeModels = this._prepareCompositeModels(transformedModel, compositeAttributeModel, request.entityModel);
            }

            if (!isEmpty(model)) {
                request[request.dataIndex] = model;
                let dataOperationResult = await dataObjectManageService.process(request, action);
                dataOperationResults.push(dataOperationResult);
            }

            if (!isEmpty(compositeModels)) {
                for (let compositeModel of compositeModels) {
                    request[request.dataIndex] = compositeModel;
                    let dataOperationResult = await dataObjectManageService.process(request, action);
                    dataOperationResults.push(dataOperationResult);
                }
            }
        }

        return {
            "response": {
                "status": "success",
                "content": dataOperationResults
            }
        }
    },

    // Used for any composite model
    // Conversion of <model>_compositeModel into <model> entity.
    _transformCompositeModelObjectToCompositeModelEntity: function (compositeModel, models) {
        if (isEmpty(compositeModel) || isEmpty(models)) {
            return;
        }

        let entities = [];

        if (!isEmpty(compositeModel)) {
            for (let model of models) {
                // prepare entity for entity type.
                let entity = {};
                entity.name = model.name;
                entity.id = model.name + "_" + model.type;
                entity.type = model.type;
                entity.properties = model.properties;
                entity.domain = model.domain;
                entity.data = {};

                if (compositeModel.data) {
                    let compositeModelData = compositeModel.data;

                    // transform properties into attributes based on composite attribute model.
                    if (compositeModelData.attributes) {
                        entity.data.attributes = this._transformAttributePropertiesToAttributes(compositeModelData.attributes, model.properties);
                    }

                    // transfrom attributes and relationships into "hasattributes" and "hasrelationships" relationships.
                    if (compositeModelData.relationships) {

                        // transfrom self attributes and relationships
                        if (model.data) {
                            entity.data.relationships = this._transformAttrsAndRelsIntoMappedRels(compositeModelData.relationships, model.data);
                        }

                        // transfrom contextual attributes and relationships
                        if (model.contexts) {
                            entity.data.contexts = []
                            for (let ctx of model.contexts) {
                                let context = {
                                    "context": ctx.context
                                };
                                context.relationships = this._transformAttrsAndRelsIntoMappedRels(compositeModelData.relationships, ctx);
                                entity.data.contexts.push(context);
                            }
                        }
                    }
                }

                entities.push(entity);
            }
        }

        return entities;
    },

    // Transform composite model entity into compositeModel
    _transformCompositeModelForSave: async function (compositeModel, model) {
        let transformedModel = {};

        if (isEmpty(compositeModel)) {
            //
            return transformedModel;
        }

        if (isEmpty(model)) {
            //
            return transformedModel;
        }

        let properties, entityModelResponse;
        let modelData = model.data;
        let compositeModelData = compositeModel.data;

        transformedModel.name = model.name;
        transformedModel.domain = model.domain;
        transformedModel.data = {};

        if (compositeModelData && modelData) {
            if (compositeModelData.attributes && modelData.attributes) {
                transformedModel.properties = this._transformAttributesToAttributeProperties(compositeModelData.attributes, modelData.attributes);
            } else {
                //
            }

            if (compositeModelData.relationships) {
                let selfAttrsAndRels;
                if (modelData.relationships) {
                    selfAttrsAndRels = await this._transformModelsIntoAttributesAndRelationships(compositeModelData, modelData);

                    if (selfAttrsAndRels) {
                        if (selfAttrsAndRels.attributes) {
                            transformedModel.data.attributes = selfAttrsAndRels.attributes;
                        }

                        if (selfAttrsAndRels.relationships) {
                            transformedModel.data.relationships = selfAttrsAndRels.relationships;
                        }
                    }
                } else {
                    //
                }

                if (modelData.contexts) {
                    transformedModel.contexts = [];

                    for (let ctx of modelData.contexts) {
                        let context = {};
                        let ctxAttrsAndRels;

                        context.context = ctx.context;
                        if (ctx.relationships) {
                            ctxAttrsAndRels = await this._transformModelsIntoAttributesAndRelationships(compositeModelData, ctx);

                            if (ctxAttrsAndRels) {
                                if (ctxAttrsAndRels.attributes) {
                                    context.attributes = ctxAttrsAndRels.attributes;
                                }

                                if (ctxAttrsAndRels.relationships) {
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
        }

        return transformedModel;
    },

    _deleteModel: async function(request, dataObjectType) {
        let dataOperationResults = [], compositeModelIds = [], dataOperationResult;

        dataOperationResult = await dataObjectManageService.process(request, action);
        dataOperationResults.push(dataOperationResult);
        
        if(dataObjectType == "entityType" || dataObjectType == "relationshipModel") {
            let modelId = falcorUtil.isValidObjectPath(request, "params.query.id") ? request.params.query.id.replace("_" + dataObjectType, "") : "";
            for(let compositeModelType of compositeModelTypes) {
                request[request.dataIndex] = {
                    "id": modelId + "_" + compositeModelType,
                    "type": compositeModelType
                }

                dataOperationResult = await dataObjectManageService.process(request, action);
                dataOperationResults.push(dataOperationResult);
            }
        }

        return dataOperationResults;
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

    _transformAttributeModelsToModels: async function (entities) {
        let attributes = {}

        if (isEmpty(entities)) {
            //
            return;
        }

        for (let entity of entities) {
            attributes[entity.name] = {};
            attributes[entity.name].properties = entity.properties;;

            if (falcorUtil.isValidObjectPath(entity, "properties.childAttributes")) {
                attributes[entity.name].group = [];
                let group = {};
                let childEntityIds = entity.properties.childAttributes.map(v => v = v + "_" + entity.type);

                if (childEntityIds) {
                    let childEntities = await modelGetManager.getModels(childEntityIds, "attributeModel");

                    if (childEntities) {
                        for (let childEntity of childEntities) {
                            group[childEntity.name] = {};
                            group[childEntity.name].properties = childEntity.properties;
                        }
                    }
                }
                attributes[entity.name].group.push(group);
            }
        }

        return attributes;
    },

    _transformRelationshipModelEntitiesToModels: async function (relEntityModel, relEntities) {
        let relationships = {};

        if (isEmpty(relEntityModel)) {
            //
            return;
        }

        if (isEmpty(relEntities)) {
            //
            return;
        }

        let relEntityModelData = relEntityModel.data;

        if (relEntityModelData) {
            for (let relEntity of relEntities) {
                relationships[relEntity.name] = [];
                let rel = {};
                rel.id = relEntity.name;
                if (relEntityModelData.attributes) {
                    rel.properties = relEntity.properties;
                }

                let relationshipCompositeModel = await modelGetManager.getCompositeModel(relEntity.name);

                if (relationshipCompositeModel) {
                    rel.attributes = relationshipCompositeModel.data ? relationshipCompositeModel.data.attributes : {};
                }

                relationships[relEntity.name].push(rel);
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

    _transformModelsIntoAttributesAndRelationships: async function (compositeEntityTypeModelData, entityTypeModelData) {
        let transformedModel = {}
        for (let relType in compositeEntityTypeModelData.relationships) {
            if (entityTypeModelData.relationships[relType]) {
                if (relType.toLowerCase() == "hasattributes") {
                    let entityIds = entityTypeModelData.relationships[relType].map(v => v.relTo.id);

                    if (entityIds) {
                        let entities = await modelGetManager.getModels(entityIds, "attributeModel");
                        if (entities) {
                            transformedModel.attributes = await this._transformAttributeModelsToModels(entities);
                        } else {
                            //
                        }
                    }
                } else if (relType.toLowerCase() == "hasrelationships") {
                    let relEntityIds = entityTypeModelData.relationships[relType].map(v => v.relTo.id);
                    let relEntityResponse;

                    if (relEntityIds) {
                        let relEntityModel = await modelGetManager.getCompositeModel("relationshipModel");
                        let relEntities = await modelGetManager.getModels(relEntityIds, "relationshipModel");

                        if (relEntityModel && relEntities) {
                            transformedModel.relationships = await this._transformRelationshipModelEntitiesToModels(relEntityModel, relEntities);
                        }
                    }
                }
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

    _prepareCompositeModels: function (attributeModels, compositeAttributeModel, entityTypeModel) {
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
                            compositeModelData.attributes[attr].properties = _.pick(attribuetModelData.attributes[attr].properties, compositeAttributeModelList[compModel]);
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
                                            compositeModelData.relationships[relType][0].attributes[relAttr].properties = _.pick(rel.attributes[attr].properties, compositeAttributeModelList[compModel]);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                compositeModels.push(falcorUtil.cloneObject(compositeModel));
            }
        }

        return compositeModels;

    },

    _prepareModel: function (entityTypeModel) {
        if (isEmpty(entityTypeModel)) {
            //
            return {};
        }

        return {
            "id": entityTypeModel.name + "_entityType",
            "name": entityTypeModel.name,
            "type": "entityType",
            "properties": entityTypeModel.properties
        }
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
                        let groupName = entityModelDataAttrs[attrKey].groupName ? entityModelDataAttrs[attrKey].groupName : "basic";
                        switch (groupName.toLowerCase()) {
                            case "basic":
                                compositeAttributeModelList.entityManageModel.push(attrKey);
                                break;
                            case "restriction":
                            case "constrains":
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
    },

    _isEntityTypeEAR: function (request) {
        let isEARTransformRequired = false;

        if (falcorUtil.isValidObjectPath(request, "params.query.id")) {
            isEARTransformRequired = true;
        }

        return isEARTransformRequired;
    }
}

module.exports = BaseModelService;