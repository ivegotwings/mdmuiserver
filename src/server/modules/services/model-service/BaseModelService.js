let DFServiceRest = require('../../common/df-rest-service/DFRestService');
let DataObjectManageService = require("../data-service/DataObjectManageService");
let ModelGetManager = require('./ModelGetManager');
let LocalCacheManager = require('../../local-cache/LocalCacheManager');
let falcorUtil = require('../../../../shared/dataobject-falcor-util');
let logger = require('../../common/logger/logger-service');
let isEmpty = require('../../common/utils/isEmpty');
let _ = require('underscore');
const TenantSystemConfigService = require('../configuration-service/TenantSystemConfigService');
let config = require('config');
let modelCacheEnabled = config.get('modules.webEngine.modelCacheEnabled');

let BaseModelService = function (option) {
    DFServiceRest.call(this, option);
    this.tenantSystemConfigService = new TenantSystemConfigService(option);
}

const compositeModelTypes = ["entityManageModel", "entityDisplayModel", "entityValidationModel", "entityDefaultValuesModel"];
const collectionProperties = ["range"];
const attributePropertyMapper = {
    "range": {
        "rangeFrom": "rangeFrom",
        "rangeTo": "rangeTo",
        "rangeFromInclusive": "isRangeFromInclusive",
        "rangeToInclusive": "isRangeToInclusive"
    }
};
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
                case "classification":
                    response = await this._getClassifications(request);
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
                    case "classification":
                        dataOperationResult = await this._processClassificationModel(request, action);
                }
                break;
            case "delete":
                dataOperationResult = await this._deleteModel(request, dataObjectType, action);
                break;
        }

        return dataOperationResult;
    },

    _setModelPropertiesFromCollection: function (attributeModelsResponse) {
        let attributeEntityModels = [];
        if (!falcorUtil.isValidObjectPath(attributeModelsResponse, "response.entityModels") ||
            !attributeModelsResponse.response.entityModels.length) {
            return;
        }

        attributeEntityModels = attributeModelsResponse.response.entityModels;

        for (let attributeEntityModel of attributeEntityModels) {
            if (attributeEntityModel.properties) {
                this._setPropertiesFromCollection(attributeEntityModel.properties);
            }
        }
    },

    _setPropertiesFromCollection: function (attributeProperties) {
        let propertyKeys = Object.keys(attributeProperties).filter(propertyKey => {
            if (collectionProperties.indexOf(propertyKey) != -1) {
                return propertyKey;
            }
        })

        if (isEmpty(propertyKeys)) {
            return;
        }

        //processing which property values is an array, eg: range property
        for (let propertyKey of propertyKeys) {
            let property = attributeProperties[propertyKey][0];
            for (let field in property) {
                let key = Object.keys(attributePropertyMapper[propertyKey] || {}).find(mapperKey => {
                    return attributePropertyMapper[propertyKey][mapperKey] == field;
                }) || field;
                attributeProperties[key] = property[field];
            }
        }
    },

    _getAttributeModels: async function (request) {
        let response;
        let collectionNames = {
            "entityData": "entities",
            "entityModel": "entityModels"
        };
        // get attribute model "<attribute name>_attributeModel"
        response = await this.post("entitymodelservice/get", request);
        logger.debug("BASE_MODEL_ATTRIBUTE_MODEL", { attributeModelsResponse: response }, "modelService");

        // get composite model of attribute model "attributeModel"
        let compositeAttributeModel = await modelGetManager.getCompositeModel("attributeModel");
        logger.debug("BASE_MODEL_COMPOSITE_ATTRIBUTE_MODEL", { compositeAttributeModel: compositeAttributeModel }, "modelService");

        // Set properties from collection
        this._setModelPropertiesFromCollection(response);

        // transform attribute models in to entities based on composite attribute model.
        if (compositeAttributeModel && response && falcorUtil.isValidObjectPath(response, "response.entityModels")) {
            let attributeModels = response.response.entityModels;
            let entities = await this._transformModelObjectToModelEntity(compositeAttributeModel, attributeModels);
            response = {
                "response": {
                    "status": "success",
                    [collectionNames[request.dataIndex]]: entities
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

        let clonedRequest = falcorUtil.cloneObject(request);
        delete clonedRequest.clientState;

        let parentAttrExternalName;

        if (transformedModel) {
            parentAttrExternalName = transformedModel.externalName ? transformedModel.externalName : transformedModel.name;
            delete transformedModel.externalName;
            

            modelId = transformedModel.id;
            request[request.dataIndex] = transformedModel;
        }
        dataOperationResult = await dataObjectManageService.process(request, action);
        if(falcorUtil.isValidObjectPath(clonedRequest[clonedRequest.dataIndex], "data.relationships.haschildattributes")){
            let childAttributes = clonedRequest[clonedRequest.dataIndex].data.relationships.haschildattributes;
            let parentAttrName = modelId.substr(0, modelId.indexOf("_attributeModel"));
            if(childAttributes.length){
                for (let attrIndex = 0; attrIndex < childAttributes.length; attrIndex++) {
                    const childAttr = childAttributes[attrIndex];
                    if(childAttr.relTo){
                        let relTo = childAttr.relTo;
                        if(relTo.id && relTo.type && relTo.externalName){
                            let childAttrName = relTo.id.substr(0, relTo.id.indexOf("_attributeModel"));
                            let childAttrModel = {
                                id:relTo.id,
                                type:relTo.type,
                                properties:{
                                    parentAttributeName:parentAttrName,
                                    parentAttributeExternalName:parentAttrExternalName,
                                    attributeNamePath:parentAttrName+'.'+childAttrName,
                                    attributeExternalNamePath:parentAttrExternalName+'.'+relTo.externalName
                                }
                            }
                            let childAttrModelRequest = falcorUtil.cloneObject(clonedRequest);
                            childAttrModelRequest[childAttrModelRequest.dataIndex] = childAttrModel;
                            await dataObjectManageService.process(childAttrModelRequest, action);
                        }
                    }
                    
                }
            }
        }

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
            entity.domain = model.domain;
            entity.properties = model.properties;
            if(falcorUtil.isValidObjectPath(entity, "properties") && entity.properties && !entity.properties.name){
                entity.properties.name = model.name;
            }
            entity.data = {};

            if (compositeModel.data) {
                let compositeModelData = compositeModel.data;

                // transform properties into attributes based on composite attribute model.
                if (compositeModelData.attributes) {
                    entity.data.attributes = await this._transformAttributePropertiesToAttributes(compositeModelData.attributes, model.properties);
                }

                // transform group into relationships based on composite attribute model.
                if (falcorUtil.isValidObjectPath(model, "properties.childAttributes") && compositeModelData.relationships) {
                    for (let relType in compositeModelData.relationships) {
                        entity.data.relationships = {};
                        let entityRelationships = entity.data.relationships[relType] = [];

                        let childEntityIds = _.isArray(model.properties.childAttributes) ? model.properties.childAttributes.map(v => v = v + "_" + model.type) : [model.properties.childAttributes + "_" + model.type];

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
                                    rel.attributes = await this._transformAttributePropertiesToAttributes(compositeModelData.attributes, childEntity.properties);
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
                let existingAttrModels = await modelGetManager.getModels([attributeModel.id], "attributeModel")

                if (childAttributeRelModels && childAttributeRels && existingAttrModels) {
                    let relModel = childAttributeRelModels[0];
                    let existingAttrModel = existingAttrModels[0];

                    if (relModel && existingAttrModel) {
                        let relEntityType = falcorUtil.isValidObjectPath(relModel, "properties.relatedEntityInfo.0.relEntityType") ? relModel.properties.relatedEntityInfo[0].relEntityType : "";

                        if (!isEmpty(relEntityType)) {
                            let attrEntities = childAttributeRels.map(v => v.relTo.id.replace("_" + relEntityType, ""));

                            if (attrEntities) {
                                if (falcorUtil.isValidObjectPath(existingAttrModel, "properties.childAttributes")) {
                                    properties.childAttributes = _.isArray(existingAttrModel.properties.childAttributes) ? existingAttrModel.properties.childAttributes : [existingAttrModel.properties.childAttributes];
                                    for (let attrEntity of attrEntities) {
                                        if (properties.childAttributes.indexOf(attrEntity) < 0) {
                                            properties.childAttributes.push(attrEntity);
                                        }
                                    }
                                } else {
                                    properties.childAttributes = attrEntities;
                                }
                            }

                            // Handling delete scenarion of nested attribute mapping.
                            let deletedAttrEntities = childAttributeRels.map(v => v.action && v.action == "delete" ? v.relTo.id.replace("_" + relEntityType, "") : undefined);
                            if (deletedAttrEntities) {
                                properties.childAttributes = properties.childAttributes.filter(v => deletedAttrEntities.indexOf(v) == -1);
                            }
                            //add external name
                            if(existingAttrModel.properties && existingAttrModel.properties.externalName){
                                transformedModel.externalName = existingAttrModel.properties.externalName;
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
                entityTypeModels = await this._transformCompositeModelObjectToCompositeModelEntity(compositeEntityTypeModel, entityTypeModels);
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
                let modelCount = 0;
                for (let compositeModel of compositeModels) {
                    let clonedRequest = falcorUtil.cloneObject(request);
                    clonedRequest[request.dataIndex] = compositeModel;

                    // All requests for model are going with client state and app instance id, so for each and every success notification page willl get reloaded if it is active.
                    // Removing app instance id from all except last request.
                    if (modelCount != compositeModels.length - 1) {
                        if (falcorUtil.isValidObjectPath(clonedRequest, "clientState.notificationInfo.context.appInstanceId")) {
                            delete clonedRequest.clientState.notificationInfo.context.appInstanceId;
                        }
                    }

                    let dataOperationResult = await dataObjectManageService.process(clonedRequest, action);
                    dataOperationResults.push(dataOperationResult);
                    modelCount++;
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
                relationshipTypeModels = await this._transformCompositeModelObjectToCompositeModelEntity(compositeRelationshipTypeModel, relationshipTypeModels);
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
    _transformCompositeModelObjectToCompositeModelEntity: async function (compositeModel, models) {
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
                        entity.data.attributes = await this._transformAttributePropertiesToAttributes(compositeModelData.attributes, model.properties);
                    }

                    // transfrom attributes and relationships into "hasattributes" and "hasrelationships" relationships.
                    if (compositeModelData.relationships) {

                        // transfrom self attributes and relationships
                        if (model.data) {
                            entity.data.relationships = await this._transformAttrsAndRelsIntoMappedRels(compositeModelData.relationships, model.data);
                        }

                        // transfrom contextual attributes and relationships
                        if (model.contexts) {
                            entity.data.contexts = []
                            for (let ctx of model.contexts) {
                                let context = {
                                    "context": ctx.context
                                };
                                context.relationships = await this._transformAttrsAndRelsIntoMappedRels(compositeModelData.relationships, ctx);
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

    _getClassifications: async function (request) {
        let response, classficaitons;

        // get classification entities
        response = await this.post("entityservice/get", request);
        logger.debug("CLASSIFICATION_ENTITIES", { entitiesResponse: response }, "modelService");

        if (falcorUtil.isValidObjectPath(request, "params.fields.relationships") && falcorUtil.isValidObjectPath(response, "response.entities")) {
            if (request.params.fields.relationships.indexOf("_ALL") > -1 || request.params.fields.relationships.indexOf("hasclassificationattributes") > -1) {
                let classificationId = falcorUtil.isValidObjectPath(request, "params.query.id") ? request.params.query.id : "";
                if (!isEmpty(classificationId)) {
                    let classificationEntity = response.response.entities.find(v => v.id == classificationId);

                    if (classificationEntity) {
                        // get classification model "<classification name>_entityCompositeModel"
                        let classificationModel = await modelGetManager.getCompositeModel(classificationId);
                        logger.debug("CLASSIFICATION_ENTITY_COMPOSITE_MODEL", { compositeClassificationModel: classificationModel }, "modelService");

                        // get composite model of classification model "classificationModel"
                        let compositeClassificationModel = await modelGetManager.getCompositeModel("classification");
                        logger.debug("CLASSIFICATION_COMPOSITE_MODEL", { compositeClassificationModel: compositeClassificationModel }, "modelService");

                        // transform classificaiton models into entities based on composite classification model.
                        if (classificationModel && compositeClassificationModel) {
                            let transformedClassificaitonModel = await this._transformCompositeModelObjectToCompositeModelEntity(compositeClassificationModel, [classificationModel]);

                            if (falcorUtil.isValidObjectPath(transformedClassificaitonModel, "0.data.relationships.hasclassificationattributes")) {

                                if (!classificationEntity.data) {
                                    classificationEntity.data = {};
                                }

                                if (!classificationEntity.data.relationships) {
                                    classificationEntity.data.relationships = {};
                                }

                                classificationEntity.data.relationships["hasclassificationattributes"] = transformedClassificaitonModel[0].data.relationships["hasclassificationattributes"];
                            }
                        }
                    }
                }
            }
        }

        return response;
    },

    _processClassificationModel: async function (request, action) {
        let dataOperationResults = [], entityIdentifierAttrName;

        // get composite model of classification model "classificationModel"
        let compositeClassificationModel = await modelGetManager.getCompositeModel("classification");
        logger.debug("CLASSIFICATION_COMPOSITE_MODEL", { compositeClassificationModel: compositeClassificationModel }, "modelService");

        if (compositeClassificationModel && falcorUtil.isValidObjectPath(request, "entity.data.relationships.hasclassificationattributes")) {
            let classificationId = falcorUtil.isValidObjectPath(request, "entity.id") ? request.entity.id : undefined;

            if (classificationId) {
                let clonedRequest = falcorUtil.cloneObject(request);
                delete request.entity.data.relationships["hasclassificationattributes"];

                // Composite Model save for classification should have classificaiton name for coalesce.
                // request.entity doesn't have name. So for now we have to do get call of classification entity and need to fetch name from classfication entity.
                let classificationRequest = {
                    "params": {
                        "query": {
                            "id": classificationId,
                            "filters": {
                                "typesCriterion": [
                                    "classification"
                                ]
                            }
                        }
                    }
                };

                let existingClassifications = await this.post("entityservice/get", classificationRequest);

                if (falcorUtil.isValidObjectPath(existingClassifications, "response.entities.0")) {
                    clonedRequest.entity.name = existingClassifications.response.entities[0].name;

                    // get composite model of entity type model "attributeModel"
                    let compositeAttributeModel = await modelGetManager.getCompositeModel("attributeModel");
                    logger.debug("BASE_MODEL_COMPOSITE_ATTRIBUTE_MODEL", { compositeAttributeModel: compositeAttributeModel }, "modelService");

                    if (compositeAttributeModel) {
                        let compositeModels;
                        let transformedModel = await this._transformCompositeModelForSave(compositeClassificationModel, clonedRequest.entity);

                        if (transformedModel) {
                            compositeModels = this._prepareCompositeModels(transformedModel, compositeAttributeModel, clonedRequest.entity, true);
                        }

                        delete clonedRequest.entity;
                        clonedRequest.dataIndex = "entityModel"
                        if (!isEmpty(compositeModels)) {
                            for (let compositeModel of compositeModels) {
                                clonedRequest[clonedRequest.dataIndex] = compositeModel;
                                let dataOperationResult = await dataObjectManageService.process(clonedRequest, action);
                                dataOperationResults.push(dataOperationResult);
                            }
                        }
                    }
                }
            }
        }

        if (action == "create") {
            if (falcorUtil.isValidObjectPath(compositeClassificationModel, "data.attributes")) {
                let compositeModelAttributes = compositeClassificationModel.data.attributes;
                for (let attrModelKey in compositeModelAttributes) {
                    if (falcorUtil.isValidObjectPath(compositeModelAttributes, attrModelKey + ".properties.isEntityIdentifier")) {
                        if (compositeModelAttributes[attrModelKey].properties.isEntityIdentifier) {
                            entityIdentifierAttrName = attrModelKey;
                        }
                    }
                }
            }

            if (entityIdentifierAttrName) {
                if (falcorUtil.isValidObjectPath(request, "entity.data.attributes." + entityIdentifierAttrName)) {
                    request.entity.id = this._getAttributeValue(request.entity.data.attributes[entityIdentifierAttrName]);
                }
            }
        }

        let dataOperationResult = await dataObjectManageService.process(request, action);
        dataOperationResults.push(dataOperationResult);

        // TODO:: Need to come up with cache module for baseModel
        // if (modelCacheEnabled) {
        //     if (!isEmpty(model.name)) {
        //         let cacheKey = modelGetManager.getCompositeModelCacheKey(model.name);
        //         await localCacheManager.delByCacheKey(cacheKey);
        //     }

        //     if (!isEmpty(model.id)) {
        //         let cacheKey = modelGetManager.getModelCacheKey("entityType");
        //         await localCacheManager.delByCacheKeyAndId(cacheKey, model.id);
        //     }
        // }

        return {
            "response": {
                "status": "success",
                "content": dataOperationResults
            }
        }
    },

    _deleteModel: async function (request, dataObjectType, action) {
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

    _transformAttributePropertiesToAttributes: async function (attributeModels, attributeProperties) {
        let defaultValContext = await this.tenantSystemConfigService.getDefaultValContext();

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
                                "source": defaultValContext.source,
                                "locale": defaultValContext.locale,
                            };
                            for (let grpAttrName in group) {
                                if (grpAttrName.toLowerCase() != "id") {
                                    grp[grpAttrName] = this._prepareAttributeValue(attributeProperties[attrModelName][0][grpAttrName], group[grpAttrName], defaultValContext);
                                    grp[grpAttrName].properties = { "isProperty": true }
                                }
                            }
                            entityAttributes[attrModelName].group.push(grp);
                        }
                    } else {
                        // create normal attribute for key value properties based on composite attribute model.
                        entityAttributes[attrModelName] = this._prepareAttributeValue(attributeProperties[attrModelName], undefined, defaultValContext);
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
                let childEntityIds = _.isArray(entity.properties.childAttributes) ? entity.properties.childAttributes.map(v => v = v + "_" + entity.type) : [entity.properties.childAttributes + "_" + entity.type];;

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
                if (attributes[attr] && attributeModels[attr]) {
                    let attrModel = attributeModels[attr];

                    if (attrModel.group) {
                        properties[attr] = [];
                        let attrModelGrp = attrModel.group[0];
                        for (let grp of attributes[attr].group) {
                            let childProperties = {};
                            for (let grpAttrKey in grp) {
                                childProperties[grpAttrKey] = this._getAttributeValue(grp[grpAttrKey], attrModelGrp[grpAttrKey]);
                            }
                            properties[attr].push(childProperties);
                        }
                    } else {
                        properties[attr] = this._getAttributeValue(attributes[attr]);
                    }
                }
            }
        }
        this._setCollectionFromProperties(properties);
        return properties;
    },

    _setCollectionFromProperties: function (properties) {
        if (isEmpty(properties)) {
            return;
        }

        let collectionProperties = Object.keys(properties).reduce((result, property) => {
            for (let key in attributePropertyMapper) {
                if (Object.keys(attributePropertyMapper[key] || {}).indexOf(property) != -1) {
                    result.push({
                        "property": property,
                        "collectionKey": key,
                        "collectionProperty": attributePropertyMapper[key][property]
                    })
                }
            }
            return result;
        }, []);

        if (!collectionProperties || !collectionProperties.length) {
            return;
        }

        for (let item of collectionProperties) {
            let collectionKey = item["collectionKey"];
            let collectionProperty = item["collectionProperty"];

            if (!properties[collectionKey]) {
                properties[collectionKey] = [{}];
            }

            properties[collectionKey][0][collectionProperty] = properties[item["property"]];
            delete properties[item["property"]];
        }
    },

    _transformAttrsAndRelsIntoMappedRels: async function (relationshipModelObjects, attrAndRelModels) {
        let relationships = {};
        if (!isEmpty(relationshipModelObjects) && !isEmpty(attrAndRelModels)) {
            for (let rel in relationshipModelObjects) {
                let relModel = relationshipModelObjects[rel] ? relationshipModelObjects[rel][0] : {};
                if (!isEmpty(relModel)) {
                    switch (rel.toLowerCase()) {
                        case "hasattributes":
                        case "hasclassificationattributes":
                        case "haschildattributes":
                        case "hasrelationshipattributes":
                            if (attrAndRelModels.attributes) {
                                // transform contextual attributes into contextual hasattributes relationships
                                relationships[rel.toLowerCase()] = await this._prepareRelationships(attrAndRelModels.attributes, "attributeModel", relModel.attributes);
                            }
                            break;
                        case "hasrelationships":
                            if (attrAndRelModels.relationships) {
                                // transform contextual relationships into contextual hasrelationships relationships
                                relationships.hasrelationships = await this._prepareRelationships(attrAndRelModels.relationships, "relationshipModel", relModel.attributes)
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
                    case "hasclassificationattributes":
                    case "haschildattributes":
                    case "hasrelationshipattributes": {
                        let attributes = entityTypeModelData.relationships[relType];
                        let entityIds = attributes.map(v => v.relTo.id);

                        if (entityIds) {
                            let retryCount = 1;
                            let maxRetryCount = 5;
                            let entities;
                            while (retryCount <= maxRetryCount) {
                                entities = await modelGetManager.getModels(entityIds, "attributeModel");
                                if (isEmpty(entities)) {
                                    retryCount++;
                                } else {
                                    break;
                                }
                            }
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
                    }
                    case "hasrelationships": {
                        let relationships = entityTypeModelData.relationships[relType];
                        let relEntityIds = relationships.map(v => v.relTo.id);

                        if (relEntityIds) {
                            let relEntityModel = await modelGetManager.getCompositeModel("relationshipModel");
                            let retryCount = 1;
                            let maxRetryCount = 5;
                            let relEntities;
                            while (retryCount <= maxRetryCount) {
                                relEntities = await modelGetManager.getModels(relEntityIds, "relationshipModel");
                                if (isEmpty(relEntities)) {
                                    retryCount++;
                                } else {
                                    break;
                                }
                            }

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
        }

        return transformedModel;
    },

    _prepareRelationships: async function (modelObjects, modelType, relationshipAttributeModels) {
        let relationships = [];

        if (!isEmpty(modelObjects) && !isEmpty(modelType)) {
            for (let modelObjectName in modelObjects) {
                let modelObject = modelObjects[modelObjectName];
                let newRel = {};

                newRel.relTo = {
                    "id": modelObjectName + "_" + modelType,
                    "type": modelType
                }

                newRel.attributes = await this._prepareRelationshipAttributes(modelType, modelObject, relationshipAttributeModels)
                relationships.push(newRel);
            }
        }

        return relationships;
    },

    _prepareRelationshipAttributes: async function (modelType, modelObject, relationshipAttributeModels) {
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

            relAttributes = await this._transformAttributePropertiesToAttributes(relationshipAttributeModels, properties);
        }

        return relAttributes;
    },

    _prepareAttributeValue: function (attrValue, attrModelObj, defaultValContext) {
        let values = [], value = {}, properties = {};

        if (attrModelObj) {
            let refEntityInfo = falcorUtil.isValidObjectPath(attrModelObj, "properties.referenceEntityInfo.0") ? attrModelObj.properties.referenceEntityInfo[0] : {};

            if (!isEmpty(refEntityInfo)) {
                properties.referenceData = refEntityInfo.refEntityType + "/" + attrValue + "_" + refEntityInfo.refEntityType;
            }
        }
        value.locale = defaultValContext.locale;
        value.source = defaultValContext.source;
        value.value = attrValue ? attrValue : "";

        if (!isEmpty(properties)) {
            value.properties = properties;
        }

        if (!isEmpty(value)) {
            values.push(value);
        }

        return { "values": values };
    },

    _includeCollectionAttribute: function (compositeAttributeModelList) {
        for (let collectionProperty of collectionProperties) {
            let isModelContainsCollectionAttributes = Object.keys(attributePropertyMapper[collectionProperty]).some(item => {
                return (compositeAttributeModelList.indexOf(item) != -1);
            }) || false;

            if (isModelContainsCollectionAttributes) {
                compositeAttributeModelList.push(collectionProperty);
            }
        }
    },

    _updateModelProperties: function (transformedAttributeModels) {
        let attributeModels = falcorUtil.cloneObject(transformedAttributeModels);
        if (falcorUtil.isValidObjectPath(attributeModels, "data.attributes")) {
            let attributes = attributeModels.data.attributes;
            this._updateDisplayType(attributes);
        }
        return attributeModels;
    },

    _updateDisplayType: function (attributes) {
        for (let key in attributes) {
            let attribute = attributes[key];
            if (attribute && attribute.properties) {
                if (attribute.properties.displayType) {
                    attribute.properties.displayType = attribute.properties.displayType.toLowerCase();
                }
                if (attribute.properties.dataType == "nested" && !isEmpty(attribute.group)) {
                    this._updateDisplayType(attribute.group[0]);
                }
            }
        }
    },

    _prepareCompositeModels: function (transformedAttributeModels, compositeAttributeModel, entityTypeModel, isIdEntityIdentifier) {
        let compositeModels = [];
        let compositeAttributeModelList = this._fetchListOfAttributesBasedOnGroup(compositeAttributeModel);
        let attributeModels = this._updateModelProperties(transformedAttributeModels); // Update model properties to convert displayType to lower case

        if (!isEmpty(attributeModels) && !isEmpty(compositeAttributeModelList)) {
            for (let compModel of compositeModelTypes) {
                let id = isIdEntityIdentifier ? entityTypeModel.id + "_" + compModel : attributeModels.name ? (attributeModels.name + "_" + compModel) : entityTypeModel.id
                let compositeModel = {
                    "id": id,
                    "name": entityTypeModel.name ? entityTypeModel.name : attributeModels.name,
                    "type": compModel,
                    "domain": "generic",
                    "data": {}
                }
                this._includeCollectionAttribute(compositeAttributeModelList[compModel]);

                if (attributeModels.data) {
                    let attribuetModelData = attributeModels.data;
                    let compositeModelData = compositeModel.data;

                    if (attribuetModelData.attributes) {
                        compositeModelData.attributes = {};
                        for (let attrKey in attribuetModelData.attributes) {
                            let attr = attribuetModelData.attributes[attrKey];

                            if (attr) {
                                let clonedAttr = falcorUtil.cloneObject(attr);
                                compositeModelData.attributes[attrKey] = clonedAttr;
                                compositeModelData.attributes[attrKey].properties = _.pick(attr.properties, compositeAttributeModelList[compModel]);

                                if (attr.group) {
                                    compositeModelData.attributes[attrKey].group = [];
                                    for (let grp of attr.group) {
                                        let compGrp = {};
                                        for (let grpAttrKey in grp) {
                                            let grpAttr = grp[grpAttrKey];

                                            if (grpAttr) {
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

                                if (rel.properties) {
                                    rel.properties.relationshipType = rel.properties.relationshipType || "association";
                                    rel.properties.relationshipOwnership = rel.properties.relationshipOwnership || "owned";
                                }

                                compositeModelData.relationships[relType].push(
                                    {
                                        "id": rel.id,
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
                            case "constraints":
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

    _getAttributeValue: function (attribute, attribuetModel) {
        if (attribute) {
            if (falcorUtil.isValidObjectPath(attribute, "values.0.value")) {
                let value = attribute.values[0];
                let modelProperties = attribuetModel ? attribuetModel.properties : undefined;

                if (modelProperties && modelProperties.displayType == "referencelist") {
                    let relInfo = modelProperties.referenceEntityInfo ? modelProperties.referenceEntityInfo[0] : undefined;
                    if (relInfo) {
                        let relType = relInfo.refEntityType;
                        if (falcorUtil.isValidObjectPath(value, "properties.referenceData")) {
                            return value.properties.referenceData.replace(relType + "/", "").replace("_" + relType, "");
                        } else {
                            return value.value;
                        }
                    } else {
                        return value.value
                    }
                } else if (falcorUtil.isValidObjectPath(attribute, "values.0.value")) {
                    return value.value;
                }
            }
        }
    }
}

module.exports = BaseModelService;