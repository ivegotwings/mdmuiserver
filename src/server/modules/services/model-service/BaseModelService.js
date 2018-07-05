let DFServiceRest = require('../../common/df-rest-service/DFRestService');
let DataObjectManageService = require("../data-service/DataObjectManageService");
let ModelGetManager = require('./ModelGetManager');
let LocalCacheManager = require('../../local-cache/LocalCacheManager');
let falcorUtil = require('../../../../shared/dataobject-falcor-util');
let logger = require('../../common/logger/logger-service');
let isEmpty = require('../../common/utils/isEmpty');
let _ = require('underscore');

let config = require('config');
let modelCacheEnabled = config.get('modules.webEngine.modelCacheEnabled');

let BaseModelService = function (option) {
    DFServiceRest.call(this, option);
}

const compositeModelTypes = ["entityManageModel", "entityDisplayModel", "entityValidationModel", "entityDefaultValuesModel"];
let modelGetManager = new ModelGetManager({});
let dataObjectManageService = new DataObjectManageService({});
let localCacheManager = new LocalCacheManager();

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
        logger.debug("BASE_MODEL_ATTRIBUTE_MODEL", { attributeModelsResponse: response }, "modelService");

        // get composite model of attribute model "attributeModel"
        let compositeAttributeModel = await modelGetManager.getCompositeModel("attributeModel");
        logger.debug("BASE_MODEL_COMPOSITE_ATTRIBUTE_MODEL", { compositeAttributeModel: compositeAttributeModel }, "modelService");

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
        let transformedModel, dataOperationResult, modelId;

        // get composite model of entity type model "attributeModel"
        let compositeAttributeModel = await modelGetManager.getCompositeModel("attributeModel");
        logger.debug("BASE_MODEL_COMPOSITE_ATTRIBUTE_MODEL", { compositeAttributeModel: compositeAttributeModel }, "modelService");

        if (compositeAttributeModel) {
            transformedModel = await this._transFormAttributeModelForSave(compositeAttributeModel, request.entityModel);
        }

        if (transformedModel) {
            modelId = transformedModel.id;
            request[request.dataIndex] = transformedModel;
        }

        dataOperationResult = await dataObjectManageService.process(request, action);

        if (modelCacheEnabled && !isEmpty(modelId)) {
            let cacheKey = modelGetManager.getModelCacheKey("attributeModel");
            await localCacheManager.delByCacheKeyAndId(cacheKey, modelId);
        }

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

        let properties = {};
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

            if (compositeAttributeModelData.relationships && attributeModelData.relationships) {
                let childAttributeRelModels = compositeAttributeModelData.relationships["haschildattributes"];
                let childAttributeRels = attributeModelData.relationships["haschildattributes"];

                if (childAttributeRelModels && childAttributeRels) {
                    let relModel = childAttributeRelModels[0];

                    if (relModel) {
                        let relEntityType = falcorUtil.isValidObjectPath(relModel, "properties.relatedEntityInfo.0.relEntityType") ? relModel.properties.relatedEntityInfo[0].relEntityType : "";

                        if (!isEmpty(relEntityType)) {
                            let attrEntities = childAttributeRels.map(v => v.relTo.id.replace("_" + relEntityType, ""));

                            if (attrEntities) {
                                properties.childAttributes = attrEntities;
                            }
                        }
                    }
                }
            }
        }

        if (!isEmpty(properties)) {
            transformedModel.properties = properties;
        }

        return transformedModel;
    },

    _getEntityType: async function (request) {
        let response, entityTypeModels = [];

        if (this._isEntityTypeEAR(request)) {
            let entityType = falcorUtil.isValidObjectPath(request, "params.query.id") ? request.params.query.id.replace("_entityType", "") : "";

            if (!isEmpty(entityType)) {
                // get entity type model "<entity type name>_entityTypeModel"
                let entityTypeModel = await modelGetManager.getCompositeModel(entityType);
                let entityTypeEntities = await modelGetManager.getModels([entityType + "_entityType"], "entityType");

                if (entityTypeEntities) {
                    let entityTypeEntity = entityTypeEntities[0];

                    if (entityTypeEntity) {
                        if (isEmpty(entityTypeModel)) {
                            entityTypeModel = {};
                        }

                        entityTypeModel.type = entityTypeEntity.type;
                        entityTypeModel.name = entityTypeEntity.name;
                        entityTypeModel.domain = entityTypeEntity.domain;
                        entityTypeModel.properties = entityTypeEntity.properties;
                    }
                }

                entityTypeModels.push(entityTypeModel);
            }
        } else {
            let ids = request.params.query.ids;
            entityTypeModels = await modelGetManager.getModels(ids, "entityType");
        }

        logger.debug("BASE_MODEL_ENTITY_TYPE_MODEL", { entityTypeModels: entityTypeModels }, "modelService");

        if (entityTypeModels) {
            //if(falcorUtil.isValidObjectPath(request, "params.fields") && !isEmpty(request.params.fields)) {
            // get composite model of entity type model "entityTypeModel"
            let compositeEntityTypeModel = await modelGetManager.getCompositeModel("entityType");
            logger.debug("BASE_MODEL_COMPOSITE_ENTITY_TYPE_MODEL", { compositeEntityTypeModel: compositeEntityTypeModel }, "modelService");

            // transform entity type models in to entities based on composite entity type model.
            if (compositeEntityTypeModel) {
                entityTypeModels = this._transformCompositeModelObjectToCompositeModelEntity(compositeEntityTypeModel, entityTypeModels);
            }
            //}

            response = {
                "response": {
                    "status": "success",
                    "entityModels": entityTypeModels
                }
            }
        }

        return response;
    },

    _processEntityTypeModel: async function (request, action) {
        let transformedModel, dataOperationResults = [];

        // get composite model of entity type model "entityTypeModel"
        let compositeEntityTypeModel = await modelGetManager.getCompositeModel("entityType");
        logger.debug("BASE_MODEL_COMPOSITE_ENTITY_TYPE_MODEL", { compositeEntityTypeModel: compositeEntityTypeModel }, "modelService");

        // get composite model of entity type model "attributeModel"
        let compositeAttributeModel = await modelGetManager.getCompositeModel("attributeModel");
        logger.debug("BASE_MODEL_COMPOSITE_ATTRIBUTE_MODEL", { compositeAttributeModel: compositeAttributeModel }, "modelService");

        if (compositeEntityTypeModel && compositeAttributeModel) {
            let compositeModels, model;

            transformedModel = await this._transformCompositeModelForSave(compositeEntityTypeModel, request.entityModel);

            if (transformedModel) {
                model = this._prepareEntityTypeModel(transformedModel);
                compositeModels = this._prepareCompositeModels(transformedModel, compositeAttributeModel, request.entityModel);
            }

            if (!isEmpty(model)) {
                request[request.dataIndex] = model;
                let dataOperationResult = await dataObjectManageService.process(request, action);
                dataOperationResults.push(dataOperationResult);

                if (modelCacheEnabled) {
                    if (!isEmpty(model.name)) {
                        let cacheKey = modelGetManager.getCompositeModelCacheKey(model.name);
                        await localCacheManager.delByCacheKey(cacheKey);
                    }

                    if (!isEmpty(model.id)) {
                        let cacheKey = modelGetManager.getModelCacheKey("entityType");
                        await localCacheManager.delByCacheKeyAndId(cacheKey, model.id);
                    }
                }
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
        let response, relationshipTypeModels = [];

        if (this._isEntityTypeEAR(request)) {
            let relationshipModel = falcorUtil.isValidObjectPath(request, "params.query.id") ? request.params.query.id.replace("_relationshipModel", "") : "";

            if (!isEmpty(relationshipModel)) {
                // get relationship type model "<relationship type name>_relationshipModel"
                relationshipTypeModels = await modelGetManager.getModels([relationshipModel + "_relationshipModel"], "relationshipModel");
            }
        } else {
            let ids = request.params.query.ids;
            relationshipTypeModels = await modelGetManager.getModels(ids, "relationshipModel");
        }

        logger.debug("BASE_MODEL_RELATIONSHIP_TYPE_MODEL", { relationshipTypeModels: relationshipTypeModels }, "modelService");

        if (relationshipTypeModels) {
            // get composite model of relationship type model "entityTypeModel"
            let compositeRelationshipTypeModel = await modelGetManager.getCompositeModel("relationshipModel");
            logger.debug("BASE_MODEL_COMPOSITE_RELATIONSHIP_TYPE_MODEL", { compositeRelationshipTypeModel: compositeRelationshipTypeModel }, "modelService");

            // transform relationship type models in to entities based on composite relationship type model.
            if (compositeRelationshipTypeModel) {
                relationshipTypeModels = this._transformCompositeModelObjectToCompositeModelEntity(compositeRelationshipTypeModel, relationshipTypeModels);
            }

            response = {
                "response": {
                    "status": "success",
                    "entityModels": relationshipTypeModels
                }
            }
        }

        return response;
    },

    _processRelationshipModel: async function (request, action) {
        let transformedModel, dataOperationResult;

        // get composite model of relationship model "relationshipModel"
        let compositeRelationshipModel = await modelGetManager.getCompositeModel("relationshipModel");
        logger.debug("BASE_MODEL_COMPOSITE_RELATIONSHIP_MODEL", { compositeRelationshipModel: compositeRelationshipModel }, "modelService");

        if (compositeRelationshipModel) {
            transformedModel = await this._transformCompositeModelForSave(compositeRelationshipModel, request.entityModel);

            if (transformedModel) {
                transformedModel.id = transformedModel.name ? (transformedModel.name + "_relationshipModel") : request.entityModel.id;
                transformedModel.type = "relationshipModel";
                request[request.dataIndex] = transformedModel;

                dataOperationResult = await dataObjectManageService.process(request, action);

                if (modelCacheEnabled) {
                    if (!isEmpty(transformedModel.name)) {
                        let cacheKey = modelGetManager.getCompositeModelCacheKey(transformedModel.name);
                        await localCacheManager.delByCacheKey(cacheKey);
                    }

                    if (!isEmpty(transformedModel.id)) {
                        let cacheKey = modelGetManager.getModelCacheKey("relationshipModel");
                        await localCacheManager.delByCacheKeyAndId(cacheKey, transformedModel.id);
                    }
                }
            }
        }

        return dataOperationResult;
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

        let modelData = model.data;
        let compositeModelData = compositeModel.data;
        let modelName = model.name;

        if (isEmpty(modelName)) {
            let typeIndex = model.id.lastIndexOf("_");
            modelName = model.id.substr(0, typeIndex)
        }

        transformedModel.name = modelName;
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

    _deleteModel: async function (request, dataObjectType) {
        let dataOperationResults = [], dataOperationResult, modelId;

        dataOperationResult = await dataObjectManageService.process(request, action);
        dataOperationResults.push(dataOperationResult);

        modelId = falcorUtil.isValidObjectPath(request, "params.query.id") ? request.params.query.id : "";

        if (modelCacheEnabled && !isEmpty(modelId)) {
            let cacheKey = modelGetManager.getModelCacheKey(dataObjectType);
            await localCacheManager.delByCacheKeyAndId(cacheKey, modelId);
        }

        if (dataObjectType == "entityType") {
            modelId = falcorUtil.isValidObjectPath(request, "params.query.id") ? request.params.query.id.replace("_" + dataObjectType, "") : "";
            for (let compositeModelType of compositeModelTypes) {
                request[request.dataIndex] = {
                    "id": modelId + "_" + compositeModelType,
                    "type": compositeModelType
                }

                dataOperationResult = await dataObjectManageService.process(request, action);
                dataOperationResults.push(dataOperationResult);
            }

            if (modelCacheEnabled && !isEmpty(modelId)) {
                let cacheKey = modelGetManager.getCompositeModelCacheKey(modelId);
                await localCacheManager.delByCacheKey(cacheKey);
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
                                    grp[grpAttrName].properties = { "isProperty": true }
                                }
                            }
                            entityAttributes[attrModelName].group.push(grp);
                        }
                    } else {
                        // create normal attribute for key value properties based on composite attribute model.
                        entityAttributes[attrModelName] = this._prepareAttributeValue(attributeProperties[attrModelName]);
                        entityAttributes[attrModelName].properties = { "isProperty": true }
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
            attributes[entity.name].properties = entity.properties;

            if (entity.action) {
                attributes[entity.name].action = entity.action;
            }

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

                if (relEntity.action) {
                    rel.action = relEntity.action;
                }

                //TODO:: Needs to define relationship attributes properly.
                rel.attributes = relEntity.data ? relEntity.data.attributes : {};

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
                let relModel = relationshipModelObjects[rel] ? relationshipModelObjects[rel][0] : {};
                if (!isEmpty(relModel)) {
                    switch (rel.toLowerCase()) {
                        case "hasattributes":
                        case "haschildattributes":
                        case "hasrelationshipattributes":
                            if (attrAndRelModels.attributes) {
                                // transform contextual attributes into contextual hasattributes relationships
                                relationships[rel.toLowerCase()] = this._prepareRelationships(attrAndRelModels.attributes, "attributeModel", relModel.attributes);
                            }
                            break;
                        case "hasrelationships":
                            if (attrAndRelModels.relationships) {
                                // transform contextual relationships into contextual hasrelationships relationships
                                relationships.hasrelationships = this._prepareRelationships(attrAndRelModels.relationships, "relationshipModel", relModel.attributes)
                            }
                            break;
                    }
                }
            }
        }
        return relationships;
    },

    _transformModelsIntoAttributesAndRelationships: async function (compositeEntityTypeModelData, entityTypeModelData) {
        let transformedModel = {}
        for (let relType in compositeEntityTypeModelData.relationships) {
            let relationshipModel = compositeEntityTypeModelData.relationships[relType] ? compositeEntityTypeModelData.relationships[relType][0] : {};
            if (entityTypeModelData.relationships[relType] && !isEmpty(relationshipModel)) {
                switch (relType.toLowerCase()) {
                    case "hasattributes":
                    case "haschildattributes":
                    case "hasrelationshipattributes":
                        let attributes = entityTypeModelData.relationships[relType];
                        let entityIds = attributes.map(v => v.relTo.id);

                        if (entityIds) {
                            let entities = await modelGetManager.getModels(entityIds, "attributeModel");
                            if (entities) {
                                for (let attr of attributes) {
                                    if (attr.action || attr.attributes) {
                                        let entity = entities.find(v => v.id == attr.relTo.id);
                                        if (entity) {
                                            //Handle delete scenarios...
                                            if (attr.action) {
                                                entity.action = attr.action;
                                            }

                                            if (attr.attributes && relType == "hasattributes") {
                                                for (let relAttrName in relationshipModel.attributes) {
                                                    if (attr.attributes[relAttrName]) {
                                                        entity.properties[relAttrName] = this._getAttributeValue(attr.attributes[relAttrName]);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }

                                transformedModel.attributes = await this._transformAttributeModelsToModels(entities);
                            } else {
                                //
                            }
                        }
                        break;
                    case "hasrelationships":
                        let relationships = entityTypeModelData.relationships[relType];
                        let relEntityIds = relationships.map(v => v.relTo.id);

                        if (relEntityIds) {
                            let relEntityModel = await modelGetManager.getCompositeModel("relationshipModel");
                            let relEntities = await modelGetManager.getModels(relEntityIds, "relationshipModel");

                            if (relEntityModel && relEntities) {
                                for (let rel of relationships) {
                                    if (rel.action || rel.attributes) {
                                        let relEntity = relEntities.find(v => v.id == rel.relTo.id);
                                        if (relEntity) {
                                            //Handle delete scenarios...
                                            if (rel.action) {
                                                relEntity.action = rel.action;
                                            }

                                            if (rel.attributes) {
                                                for (let relAttrName in relationshipModel.attributes) {
                                                    if (rel.attributes[relAttrName]) {
                                                        let attrVal = this._getAttributeValue(rel.attributes[relAttrName]);
                                                        if (relAttrName == "toEntityType") {
                                                            relEntity.properties.relatedEntityInfo = [
                                                                {
                                                                    "relEntityType": attrVal
                                                                }
                                                            ]
                                                        } else {
                                                            relEntity.properties[relAttrName] = attrVal;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }

                                transformedModel.relationships = await this._transformRelationshipModelEntitiesToModels(relEntityModel, relEntities);
                            }
                        }
                        break;
                }
            }
        }

        return transformedModel;
    },

    _prepareRelationships: function (modelObjects, modelType, relationshipAttributeModels) {
        let relationships = [];

        if (!isEmpty(modelObjects) && !isEmpty(modelType)) {
            for (let modelObjectName in modelObjects) {
                let modelObject = modelObjects[modelObjectName];
                let newRel = {};

                newRel.relTo = {
                    "id": modelObjectName + "_" + modelType,
                    "type": modelType
                }

                newRel.attributes = this._prepareRelationshipAttributes(modelType, modelObject, relationshipAttributeModels)
                relationships.push(newRel);
            }
        }

        return relationships;
    },

    _prepareRelationshipAttributes: function (modelType, modelObject, relationshipAttributeModels) {
        let relAttributes = {}, properties = {};

        if (modelType && !isEmpty(relationshipAttributeModels) && !isEmpty(modelObject)) {
            switch (modelType) {
                case "attributeModel":
                    if (modelObject.properties) {
                        for (let relAttrName in relationshipAttributeModels) {
                            if (modelObject.properties[relAttrName]) {
                                properties[relAttrName] = modelObject.properties[relAttrName];
                            }
                        }
                    }
                    break;

                case "relationshipModel":
                    modelObject = modelObject[0];
                    if (modelObject.properties) {
                        for (let relAttrName in relationshipAttributeModels) {
                            if (relAttrName == "toEntityType") {
                                let relatedEntityInfo = modelObject.properties["relatedEntityInfo"];
                                if (relatedEntityInfo) {
                                    properties["toEntityType"] = relatedEntityInfo[0].relEntityType;
                                }
                            }
                        }
                    }
                    break;
            }

            relAttributes = this._transformAttributePropertiesToAttributes(relationshipAttributeModels, properties);
        }

        return relAttributes;
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
                    "id": attributeModels.name ? (attributeModels.name + "_" + compModel) : entityTypeModel.id,
                    "name": entityTypeModel.name,
                    "type": compModel,
                    "domain": "generic",
                    "data": {}
                }

                if (attributeModels.data) {
                    let attribuetModelData = attributeModels.data;
                    let compositeModelData = compositeModel.data;

                    if (attribuetModelData.attributes) {
                        compositeModelData.attributes = {};
                        for (let attrKey in attribuetModelData.attributes) {
                            let attr = attribuetModelData.attributes[attrKey];

                            if(attr) {
                                let clonedAttr = falcorUtil.cloneObject(attr);
                                compositeModelData.attributes[attrKey] = clonedAttr;
                                compositeModelData.attributes[attrKey].properties = _.pick(attr.properties, compositeAttributeModelList[compModel]);

                                if(attr.group) {
                                    compositeModelData.attributes[attrKey].group = [];
                                    for(let grp of attr.group) {
                                        let compGrp = {};
                                        for(let grpAttrKey in grp) {
                                            let grpAttr = grp[grpAttrKey];

                                            if(grpAttr) {
                                                let clonedGrpAttr = falcorUtil.cloneObject(grpAttr);
                                                compGrp[grpAttrKey] = clonedGrpAttr;
                                                compGrp[grpAttrKey].properties = _.pick(grpAttr.properties, compositeAttributeModelList[compModel]);
                                            }
                                        }
                                        compositeModelData.attributes[attrKey].group.push(compGrp);
                                    }
                                }
                            }
                        }
                    }

                    if (attribuetModelData.relationships) {
                        compositeModelData.relationships = {};

                        for (let relType in attribuetModelData.relationships) {
                            if (!isEmpty(attribuetModelData.relationships[relType])) {
                                compositeModelData.relationships[relType] = [];
                                let rel = attribuetModelData.relationships[relType][0];

                                compositeModelData.relationships[relType].push(
                                    {
                                        "properties": rel.properties,
                                        "attributes": {}
                                    }
                                );

                                if (rel.action) {
                                    compositeModelData.relationships[relType][0].action = rel.action;
                                }

                                for (let rel of attribuetModelData.relationships[relType]) {
                                    if (rel.attributes) {
                                        for (let relAttr in rel.attributes) {
                                            compositeModelData.relationships[relType][0].attributes[relAttr] = rel.attributes[relAttr];
                                            compositeModelData.relationships[relType][0].attributes[relAttr].properties = _.pick(rel.attributes[relAttr].properties, compositeAttributeModelList[compModel]);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    compositeModel.data = compositeModelData;
                }

                compositeModels.push(compositeModel);
            }
        }

        return compositeModels;
    },

    _prepareEntityTypeModel: function (entityTypeModel) {
        if (isEmpty(entityTypeModel)) {
            return {};
        }

        return {
            "id": entityTypeModel.name + "_entityType",
            "name": entityTypeModel.name,
            "type": "entityType",
            "domain": entityTypeModel.domain,
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
                    compositeAttributeModelList["entityDefaultValuesModel"] = [];

                    for (let attrKey in entityModelDataAttrs) {
                        let groupName = falcorUtil.isValidObjectPath(entityModelDataAttrs, attrKey + ".properties.groupName") ? entityModelDataAttrs[attrKey].properties.groupName : "basic";
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
                                compositeAttributeModelList.entityDefaultValuesModel.push(attrKey);
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
    },

    _getAttributeValue: function (attribute) {
        if (attribute) {
            if (falcorUtil.isValidObjectPath(attribute, "values.0.value")) {
                return attribute.values[0].value;
            }
        }
    }
}

module.exports = BaseModelService;