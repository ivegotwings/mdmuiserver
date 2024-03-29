import '../liquid-dataobject-utils/liquid-dataobject-utils.js';

import './data-helper.js';
import './attribute-helper.js';
import './context-helper.js';
import './data-merge-helper.js';
import './entity-helper.js';
import EntityTypeManager from '../bedrock-managers/entity-type-manager.js' 

window.DataTransformHelper = window.DataTransformHelper || {};

DataTransformHelper.transformAttributeModels = function (compositeModel, contextData, editPermission) {
    let firstDataContext = ContextHelper.getFirstDataContext(contextData);
    let mergedAttributeModels = {};

    // If context is available and if it is get coalesce then all self attributes will be already coalesced in a context
    // So self attributes can be filtered from coleased attributes.
    // If same attribute is present in self as well as in a context with some different properties then API should take care about merging of this attribute.
    if (compositeModel && "data" in compositeModel) {
        mergedAttributeModels = DataTransformHelper._getAttributeModelsBasedOnContext(compositeModel, firstDataContext)
        if (!_.isEmpty(firstDataContext)) {
            mergedAttributeModels = DataTransformHelper._populateModelContextCoalesceProperty(mergedAttributeModels, firstDataContext)
        }
        if (!_.isEmpty(mergedAttributeModels)) {
            this._fillModels(mergedAttributeModels, editPermission);
        }
    }
    return mergedAttributeModels;
};

DataTransformHelper._getAttributeModelsBasedOnContext = function (compositeModel, firstDataContext) {
    let mergedAttributeModels = {};
    if (!_.isEmpty(firstDataContext)) {
        let specificCtxAttributeModels = SharedUtils.DataObjectFalcorUtil.getAttributesByCtx(compositeModel, firstDataContext);
        let specificCtxAttributeModel;
        for (let attrKey in specificCtxAttributeModels) {
            specificCtxAttributeModel = specificCtxAttributeModels[attrKey];
            if (specificCtxAttributeModel && "contextCoalesce" in specificCtxAttributeModel.properties && _.isEmpty(specificCtxAttributeModel.properties.instanceCoalesce)) {
                specificCtxAttributeModel.selfContext = "self" in specificCtxAttributeModel.properties.contextCoalesce[0] && 1;
            }
        }
        mergedAttributeModels = specificCtxAttributeModels;
    } else {
        if ("attributes" in compositeModel.data) {
            mergedAttributeModels = compositeModel.data.attributes;
            for (let attrKey in mergedAttributeModels) {                        
                mergedAttributeModels[attrKey].selfContext = 1;                        
            }
        }
    }
    return mergedAttributeModels;
}

DataTransformHelper._populateModelContextCoalesceProperty = function (attributeModels, dataContext) {
    let transformedAttributesModel = {};
    let _attributeModels = DataHelper.cloneObject(attributeModels);
    let contextCoalesceKeys;

    if (!_.isEmpty(dataContext)) {
        let dataContextKeys = Object.keys(dataContext);
        for (let attributeModelName in _attributeModels) {
            let attributeModel = _attributeModels[attributeModelName];
            if (attributeModel) {
                attributeModel.modelContextCoalesce = false;
                if (DataHelper.isValidObjectPath(attributeModel, "properties.dataType")) {
                    if (attributeModel.properties.dataType === "nested") {
                        attributeModel.properties["isCollection"] = true;
                    }
                }
                if (DataHelper.isValidObjectPath(attributeModel, "properties.contextCoalesce.0") && !DataHelper.isValidObjectPath(attributeModel, "properties.instanceCoalesce.0")) {
                    contextCoalesceKeys = Object.keys(attributeModel.properties.contextCoalesce[0])
                    if (_.difference(dataContextKeys, contextCoalesceKeys).length > 0) {
                        attributeModel.modelContextCoalesce = true;
                    }
                }
            }
            transformedAttributesModel[attributeModelName] = attributeModel;
        }

    } else {
        transformedAttributesModel = _attributeModels;
    }

    return transformedAttributesModel;
};

DataTransformHelper.transformRelationshipAttributeModels = function (relationshipModel, contextData, editPermission) {

    let mergedAttributeModels = {};
    if (relationshipModel && "attributes" in relationshipModel) {
        mergedAttributeModels = relationshipModel.attributes;
        for (let attrKey in mergedAttributeModels) {
            mergedAttributeModels[attrKey].selfContext = 1;
        }
    }

    if (!_.isEmpty(mergedAttributeModels)) {
        this._fillModels(mergedAttributeModels, editPermission);
    }

    return mergedAttributeModels;
};

DataTransformHelper.transformRelationshipModels = function (compositeModel, contextData) {
    let firstDataContext = ContextHelper.getFirstDataContext(contextData);

    let mergedRelationshipModels = {};


    // If context is available and if it is get coalesce then all self relationships will be already coalesced in a context
    // So self relationships can be filtered from coleased relationships.
    // If same relationship is present in self as well as in a context with some different properties then API should take care about merging of this relationship.
    if (compositeModel && "data" in compositeModel) {
        if (!_.isEmpty(firstDataContext)) {
            let specificCtxRelationshipModels = SharedUtils.DataObjectFalcorUtil.getRelationshipsByCtx(compositeModel, firstDataContext);
            let mergedRelKeys = Object.keys(mergedRelationshipModels);
            for (let relKey in specificCtxRelationshipModels) {
                let relationshipModel = specificCtxRelationshipModels[relKey][0];
                if (relationshipModel && relationshipModel.properties && "contextCoalesce" in relationshipModel.properties) {
                    specificCtxRelationshipModels[relKey].selfContext = "self" in relationshipModel.properties.contextCoalesce[0] && 1;
                }
            }
            mergedRelationshipModels = specificCtxRelationshipModels;
        } else {
            if ("relationships" in compositeModel.data) {
                mergedRelationshipModels = compositeModel.data.relationships;
                for (let relKey in mergedRelationshipModels) {
                    let dataRelModel = mergedRelationshipModels[relKey];
                    dataRelModel.selfContext = 1;
                }
            }
        }
    }

    return mergedRelationshipModels;
};

DataTransformHelper.transformAttributes = function (entity, attributeModels, contextData, outputSchema, applySort) {
    let firstDataContext = ContextHelper.getFirstDataContext(contextData);
    let firstValueContext = ContextHelper.getFirstValueContext(contextData);
    let firstItemContext = ContextHelper.getFirstItemContext(contextData);

    let mergedAttributes = {};

    if (entity && entity.data && entity.data.attributes) {
        mergedAttributes = DataMergeHelper.mergeAttributes(mergedAttributes, entity.data.attributes, true);
    }

    let sortedAttributeModels = attributeModels;
    if (applySort) {
        sortedAttributeModels = this.sortAttributeModels(attributeModels);
    }

    if (firstDataContext) {
        let ctxAttributes = SharedUtils.DataObjectFalcorUtil.getAttributesByCtx(entity, firstDataContext);

        if (!_.isEmpty(ctxAttributes)) {
            Object.keys(ctxAttributes).forEach((attrName) => {
                let clonedAttribute = DataHelper.cloneObject(ctxAttributes[attrName]);

                // RDF doesn't support relatedEntity coalesce in case of child entity's additional context.
                // This will update coaleced attribute with parent entity's coalesce info if attribute value is coming from parent entity in case of additional context.
                if (mergedAttributes[attrName]) {
                    if (mergedAttributes[attrName].group) {
                        if (DataHelper.isValidObjectPath(mergedAttributes[attrName], "group.0.os") && mergedAttributes[attrName].group[0].os == "graph") {
                            if (clonedAttribute.group) {
                                let os = mergedAttributes[attrName].group[0].os;
                                let osid = mergedAttributes[attrName].group[0].osid;
                                let ostype = mergedAttributes[attrName].group[0].ostype;

                                for (let grp of clonedAttribute.group) {
                                    grp.os = os;
                                    grp.osid = osid;
                                    grp.ostype = ostype;
                                }
                            }
                        }
                    } else {
                        if (DataHelper.isValidObjectPath(mergedAttributes[attrName], "values.0.os") && mergedAttributes[attrName].values[0].os == "graph") {
                            if (clonedAttribute.values) {
                                let os = mergedAttributes[attrName].values[0].os;
                                let osid = mergedAttributes[attrName].values[0].osid;
                                let ostype = mergedAttributes[attrName].values[0].ostype;

                                for (let value of clonedAttribute.values) {
                                    value.os = os;
                                    value.osid = osid;
                                    value.ostype = ostype;
                                }
                            }
                        }
                    }
                }
            });
        }
        mergedAttributes = ctxAttributes || {};
    }

    let transformedAttributes;
    if (!_.isEmpty(attributeModels)) {
        transformedAttributes = this._transformAttributes(mergedAttributes, sortedAttributeModels, firstValueContext, firstDataContext, firstItemContext);
    }
    else {
        transformedAttributes = this._transformAttributesWithoutModels(mergedAttributes, firstValueContext);
    }

    let outputData = undefined;

    if (outputSchema == "array") {
        //manage returns output as array...instead of keyed attributes
        outputData = _.map(transformedAttributes, function (value, index) { return value; });
    }
    else {
        outputData = transformedAttributes;
    }

    return outputData;
};

//Sort related functions - Start
DataTransformHelper.sortAttributeModels = function (attributeModels) {
    //convert object to array
    let modelArray = _.map(attributeModels, function (value, index) { return value; });

    //do the sort
    this._assignDefaultDisplaySequence(modelArray);
    modelArray = this._sortByDisplaySequence(modelArray);

    //convert back to object
    let sortedAttributeModels = {};
    modelArray.forEach(function (model) {
        sortedAttributeModels[model.name] = model;
    });

    return sortedAttributeModels;
};

DataTransformHelper.hasLocalizableAttributes = function (attributeModels) {
    for (let key in attributeModels) {
        if (attributeModels[key].properties && attributeModels[key].properties.isLocalizable) {
            return true;
        }
    }
    return false;
};

DataTransformHelper._sortByDisplaySequence = function (modelArray) {
    let sortedModelArray = modelArray.sort(function (a, b) {
        return a.displaySequence > b.displaySequence ? 1 : -1;
    }
    );
    sortedModelArray = this._sortCommonDisplaySequence(sortedModelArray);
    return sortedModelArray;
};

DataTransformHelper._sortCommonDisplaySequence = function (modelArray) {
    let sortedModelArray = [];
    let commonSequenceSet = [];
    let prevAttributeModel = { "displaySequence": -1298433 };
    for (let i = 0; i < modelArray.length; i++) {
        let currentAttributeModel = modelArray[i];
        if (commonSequenceSet.length == 0) {
            commonSequenceSet.push(currentAttributeModel);
        }
        else if (currentAttributeModel.displaySequence == prevAttributeModel.displaySequence) {
            commonSequenceSet.push(currentAttributeModel)
        } else if (currentAttributeModel.displaySequence != prevAttributeModel.displaySequence) {
            sortedModelArray = sortedModelArray.concat(this._sortArrayByExternalName(commonSequenceSet));
            commonSequenceSet.push(currentAttributeModel)
        }
        prevAttributeModel = currentAttributeModel;
    }
    sortedModelArray = sortedModelArray.concat(this._sortArrayByExternalName(commonSequenceSet));
    return sortedModelArray;
};

DataTransformHelper._sortArrayByExternalName = function (inputArray) {
    let sortedArray = inputArray.sort(function (a, b) {
        let name1 = '';
        let name2 = '';
        if (a && a.externalName) {
            name1 = a.externalName.toString().toLowerCase();
        }
        if (b && b.externalName) {
            name2 = b.externalName.toString().toLowerCase();
        }
        return name1 > name2 ? 1 : -1;
    }
    );
    return sortedArray;
};

DataTransformHelper._assignDefaultDisplaySequence = function (attributeModels) {
    for (let i = 0; i < attributeModels.length; i++) {
        if (!attributeModels[i].displaySequence) {
            attributeModels[i].displaySequence = 9999999;
        }
    }
};
//Sort related functions - End

DataTransformHelper.transformEntitiesToGridFormat = async function (entities, attributeModels, contextData, columns) {
    let transformedEntities = [];
    let metaDataColumns;
    let contextDataColumns;
    if (columns && columns.length) {
        metaDataColumns = columns.filter(function (column) {
            return column.isMetaDataColumn == true;
        });
        contextDataColumns = columns.filter(function (column) {
            return column.isContextDataColumn == true;
        });
    }
    if (entities && entities.length > 0) {
        let entitiesToBeRemoved = [];

        for (let i = 0; i < entities.length; i++) {
            let entity = entities[i];

            let transformedAttributes = {};
            if (entity) {
                transformedAttributes = await DataTransformHelper.transformAttributes(entity, attributeModels, contextData, "objects", false);
                if (metaDataColumns && metaDataColumns.length) {
                    for (let j = 0; j < metaDataColumns.length; j++) {
                        let columnName = metaDataColumns[j].name;
                        let attributeJSON = AttributeHelper.getEmptyValue(ContextHelper.getFirstValueContext(contextData));
                        if (entity[columnName]) {
                            attributeJSON.value = entity[columnName];
                        }
                        transformedAttributes[columnName] = attributeJSON;
                    }
                }
                if (contextDataColumns && contextDataColumns.length) {
                    for (let j = 0; j < contextDataColumns.length; j++) {
                        let columnName = contextDataColumns[j].name;
                        let attributeJSON = AttributeHelper.getEmptyValue(ContextHelper.getFirstValueContext(contextData));
                        //ToDo: get datacontext & valuecontext info from entity (when entity is coming from different contexts)
                        if (contextData.dataContexts && contextData.dataContexts.length && contextData.dataContexts[0][columnName]) {
                            attributeJSON.value = contextData.dataContexts[0][columnName];
                        }
                        if (contextData.ValContexts && contextData.ValContexts.length && contextData.ValContexts[0][columnName]) {
                            attributeJSON.value = contextData.ValContexts[0][columnName];
                        }
                        transformedAttributes[columnName] = attributeJSON;
                    }
                }

                if (!_.isEmpty(transformedAttributes)) {
                    //delete entity.data;
                    //var transformedEntity = DataHelper.cloneObject(entity);
                    let transformedEntity = entity;
                    transformedEntity.attributes = transformedAttributes;
                    transformedEntities.push(transformedEntity);
                }
            }
        }
    }

    return transformedEntities;
};

DataTransformHelper.transformEntitiesToVariantGridFormat = async function (entities, columns) {
    let transformedEntities = [];
    let nonMetaDataColumns = columns.filter(function (column) {
        return !column.isMetaDataColumn;
    });

    if (entities && entities.length > 0) {
                     
        let entityManagerObj = EntityTypeManager.getInstance();
        for (let i = 0; i < entities.length; i++) {
            let entity = entities[i];
            let transformedAttributes = {};
            if (entity) {
                if (nonMetaDataColumns && nonMetaDataColumns.length) {
                    for (let j = 0; j < nonMetaDataColumns.length; j++) {
                        let columnName = nonMetaDataColumns[j].name;
                        if (entity.data.attributes[columnName]) {
                            entity[columnName] = entity.data.attributes[columnName].values[0].value;
                        } else if (entity.properties[columnName]) {
                            entity[columnName] = entity.properties[columnName];
                        }
                    }

                    //Adding the typeExternalName
                    if (entity['type']) {
                        entity['typeExternalName'] = entityManagerObj.getTypeExternalNameById(entity['type']);
                    }
                    //Set the item as disabled if the status is exists                                
                    if (entity['variantStatus']) {

                        entity['orgVariantStatus'] = entity['variantStatus'];

                        if (entity['variantStatus'] == "exists") {
                            entity.disabled = true;
                        }
                        if (entity['variantStatus'] == "newForContext") {
                            entity['variantStatus'] = "new";
                        }
                        //Capitalizing the first character of status attribute
                        entity['variantStatus'] = entity['variantStatus'].charAt(0).toUpperCase() + entity['variantStatus'].slice(1);
                    }
                }
            }

            //Grouping the entities based on the type
            if (transformedEntities[entity.type]) {
                transformedEntities[entity.type].push(entity);
            } else {
                transformedEntities[entity.type] = [entity];
            }

        }
    }

    return transformedEntities;
};

DataTransformHelper.prepareEntityForAttributesSave = async function (entity, attributesJSON, contextData, attributeModels) {
    let firstDataContext = ContextHelper.getFirstDataContext(contextData);
    let firstValueContext = ContextHelper.getFirstValueContext(contextData);

    let attributesInSaveFormat = []; //our return value
    let dataAttributes = {};
    let firstContextAttributes = {};

    let outputData = [];

    for (let i = 0; i < attributesJSON.length; i++) {
        let attributeJSON = attributesJSON[i];
        let model = attributeModels && attributeModels[attributeJSON.name] ? attributeModels[attributeJSON.name] : undefined;
        let attr = DataTransformHelper._transformAttributeForSave(attributeJSON, model, firstValueContext);

        if (attributeJSON.selfContext) {
            dataAttributes[attributeJSON.name] = attr;
        }
        else {
            firstContextAttributes[attributeJSON.name] = attr;
        }
    }

    this._removeAttrsWithDeleteFlagAndContextCoalesce(firstContextAttributes, firstDataContext);

    let newEntity = {};
    newEntity.name = entity.name;

    let newData = { 'contexts': [] };

    if (!_.isEmpty(dataAttributes)) {
        newData.attributes = dataAttributes;
    }

    if (!_.isEmpty(firstContextAttributes)) {
        let newContexts = {};
        let newCtxItem = {};
        newCtxItem.context = firstDataContext;
        newCtxItem.attributes = firstContextAttributes;
        newData.contexts.push(newCtxItem);
    }

    if (!_.isEmpty(firstDataContext)) {
        await DataTransformHelper.prepareEntityForContextSave(newData, attributeModels, {}, contextData)
    }

    for (let entityDataField in entity) {
        if (entityDataField != "data" && entityDataField != "name") {
            newEntity[entityDataField] = DataHelper.cloneObject(entity[entityDataField]);
        }
    }
    newEntity["data"] = newData;

    return newEntity;
};

DataTransformHelper.prepareEntityForRelationshipSave = async function (originalEntity, relationshipAttributesJSON, contextData, relationshipModels) {
    let firstDataContext = ContextHelper.getFirstDataContext(contextData);
    let firstItemContext = ContextHelper.getFirstItemContext(contextData);
    let defaultValueContext = DataHelper.getDefaultValContext();

    let relationshipName = firstItemContext.relationships[0];
    let relationshipId = firstItemContext.relationshipId;
    let relToType = firstItemContext.relatedEntityType;

    let newEntity = DataHelper.cloneObject(originalEntity);
    let relationships = EntityHelper.getRelationshipByRelationshipType(newEntity, firstDataContext, relationshipName);
    let relationship = relationships.find(function (rel) {
        return rel.relTo.id == relationshipId;
    });

    if (!relationship && relationshipId && relToType) {
        relationship = {};

        relationship.direction = "both";
        relationship.operation = "association";

        relationship.attributes = {};
        relationship.relTo = {};
        relationship.relTo.id = relationshipId;
        relationship.relTo.type = relToType;
        relationships.push(relationship);
    }

    relationships.length = 0;
    relationships.push(relationship);
    
    let attributes = {};
    for (let i = 0; i < relationshipAttributesJSON.length; i++) {
        let relationshipAttributeJSON = relationshipAttributesJSON[i];
        let attr = DataTransformHelper.createAttributeInstance(relationshipAttributeJSON, defaultValueContext);
        attributes[relationshipAttributeJSON.name] = attr;
    }
    relationship.attributes = attributes;

    if (!_.isEmpty(firstDataContext)) {
        await DataTransformHelper.prepareEntityForContextSave(newEntity.data, {}, relationshipModels, contextData)
    }

    return newEntity;

};


DataTransformHelper._removeAttrsWithDeleteFlagAndContextCoalesce = function (attributes, dataContext) {
    /***if attribute has contextCoalescePaths in attrProperties and that path is 
     * different from selected context, indicates that user has updated attribute on top 
     * of overriden values. If attribute is to be deleted/there are any deleted rows, remove the attribute/deleted rows from
     * attribute before sending for save***/
    if (!_.isEmpty(attributes)) {
        Object.keys(attributes).forEach((attrName) => {
            let attribute = attributes[attrName];
            let contextCoalescePaths = !_.isEmpty(dataContext) ? DataTransformHelper.getContextCoalescePaths(attribute.properties, dataContext) : [];

            if (!_.isEmpty(contextCoalescePaths)) {
                if (attribute.action === "delete") {
                    delete attributes[attrName];
                } else if (attribute.group && attribute.group.length > 0) {
                    this._removeValuesToBeDeleted(attribute.group);

                    if (attribute.group.length === 0) {
                        delete attributes[attrName];
                    }
                } else if (attribute.values && attribute.values.length > 0) {
                    this._removeValuesToBeDeleted(attribute.values);

                    if (attribute.values.length === 0) {
                        delete attributes[attrName];
                    }
                }
            }
        })
    }
};

DataTransformHelper._removeValuesToBeDeleted = function (values) {
    let valsToBeDeleted = values.filter(val => val.action === "delete");

    if (!_.isEmpty(valsToBeDeleted)) {
        for (let i = 0; i < valsToBeDeleted.length; i++) {
            let valToDelete = valsToBeDeleted[i];
            let valIndex = values.indexOf(valToDelete);
            if (valIndex !== -1) {
                values.splice(valIndex, 1);
            }
        }
    }
};

DataTransformHelper._overrideLocale = function (attr, locale) {
    if (attr.values) {
        for (let i = 0; i < attr.values.length; i++) {
            attr.values[i].locale = locale;
        }
    }
};

DataTransformHelper._isLocalizable = function (model) {
    return model && model.properties && model.properties.isLocalizable;
};

DataTransformHelper.prepareEntityForCreate = function (entityId, entityType, attributesJSON, contextData, createdBy, defaultEntity, attributeModels, modelDomain) {
    let firstDataContext = ContextHelper.getFirstDataContext(contextData);
    let firstValueContext = ContextHelper.getFirstValueContext(contextData);

    let attributesInSaveFormat = []; //our return value
    let dataAttributes = {};
    let firstContextAttributes = {};

    let outputData = [];

    for (let i = 0; i < attributesJSON.length; i++) {
        let attributeJSON = attributesJSON[i];
        let model = attributeModels && attributeModels[attributeJSON.name] ? attributeModels[attributeJSON.name] : undefined;
        let attr = DataTransformHelper._transformAttributeForSave(attributeJSON, model, firstValueContext);

        if (attributeJSON.selfContext) {
            dataAttributes[attributeJSON.name] = attr;
        }
        else {
            firstContextAttributes[attributeJSON.name] = attr;
        }
    }

    let newEntity = {};
    let newData = {};
    if (modelDomain) {
        newEntity.domain = modelDomain;
    }
    if (!_.isEmpty(dataAttributes)) {
        newData.attributes = dataAttributes;
    }

    if (!_.isEmpty(firstDataContext)) {
        let newCtxItem = {};
        newCtxItem.context = firstDataContext;
        if (!_.isEmpty(firstContextAttributes)) {
            newCtxItem.attributes = firstContextAttributes;
        }
        newData.contexts = [newCtxItem];
    }

    newEntity.id = entityId;
    newEntity.type = entityType;
    newEntity.data = newData;
    newEntity.properties = { "createdBy": createdBy };

    if (!_.isEmpty(defaultEntity)) {
        delete defaultEntity.id;
        delete defaultEntity.name;
        let mergedEntity = DataMergeHelper.mergeDataObjects(newEntity, defaultEntity, true);
        return mergedEntity;
    }

    return newEntity;
};

DataTransformHelper._transformAttributeForSave = function (attributeJSON, model, firstValueContext) {
    let attr = {};
    if (model && model.dataType === "nested") {
        if (attributeJSON.value) {
            attr = { "group": [] };
            for (let j = 0; j < attributeJSON.value.length; j++) {
                let group = attributeJSON.value[j];
                if(attributeJSON.action && group && typeof group == "object"){
                    group.action = attributeJSON.action;
                }
                
                let childAttributes = {};
                let childAttrModels = model.group[0];
                if(group == ConstantHelper.NULL_VALUE){
                    childAttributes.value = ConstantHelper.NULL_VALUE;
                    if(attributeJSON.action === "delete") {
                        childAttributes.action = "delete";
                    }
                }
                for (let attributeName in group) {
                    if (childAttrModels[attributeName]) {
                        let attrJson = {
                            "value": group[attributeName].value,
                            "name": attributeName
                        };
                        let referenceDataId = group[attributeName]["referenceDataId"] ? group[attributeName]["referenceDataId"] : undefined;
                        let referenceEntityType = group[attributeName]["referenceEntityType"] ? group[attributeName]["referenceEntityType"] : undefined;
                        if (referenceDataId && referenceEntityType) {
                            attrJson["referenceDataId"] = referenceDataId;
                            attrJson["referenceEntityType"] = referenceEntityType;
                        }
                        if (group[attributeName].selectedLocales && group[attributeName].selectedLocales.length > 0) {
                            attrJson["selectedLocales"] = group[attributeName].selectedLocales;
                        }
                        let childAttr = this.createAttributeInstance(attrJson, firstValueContext);
                        if (!this._isLocalizable(childAttrModels[attributeName])) {
                            this._overrideLocale(childAttr, DataHelper.getDefaultLocale());
                        }
                        childAttributes[attributeName] = childAttr;
                    }
                }
                AttributeHelper.populateValueContext(childAttributes, firstValueContext);
                if (!this._isLocalizable(model)) {
                    childAttributes.locale = DataHelper.getDefaultLocale();
                }
                if (group.action === "delete") {
                    childAttributes["action"] = "delete";
                }
                attr.group.push(childAttributes);
            }
            if (attributeJSON.attrProperties) {
                attr.properties = attributeJSON.attrProperties;
            }
        }
    } else {
        attr = this.createAttributeInstance(attributeJSON, firstValueContext);
        if (!this._isLocalizable(model)) {
            this._overrideLocale(attr, DataHelper.getDefaultLocale());
        }
    }

    return attr;
}

DataTransformHelper.createAttributeInstance = function (attributeJSON, valueContext) {
    let attributeInstance = {};
    let attributeValues = [];
    delete attributeJSON.errors;
    if (Array.isArray(attributeJSON.value)) {
        for (let j = 0; j < attributeJSON.value.length; j++) {
            if (attributeJSON.name) {
                let attributeValue = { "value": attributeJSON.value[j].name ? attributeJSON.value[j].name : attributeJSON.value[j] };

                let valCtx = DataHelper.cloneObject(valueContext);
                if (attributeJSON.selectedLocales && attributeJSON.selectedLocales.length > 0 && attributeJSON.selectedLocales[j]) {
                    //assuming locales values in array are in same order as corresponding values.
                    valCtx.locale = attributeJSON.selectedLocales[j];
                }

                AttributeHelper.populateValueContext(attributeValue, valCtx);
                if (attributeJSON.action == "delete") {
                    attributeValue.action = "delete";
                }

                if (attributeJSON.referenceEntityType && attributeJSON.referenceDataId[j]) {
                    attributeValue.properties = {};
                    attributeValue.properties.referenceData = attributeJSON.referenceEntityType + "/" + attributeJSON.referenceDataId[j];
                    attributeValue.properties.referenceDataIdentifier = "";
                }

                attributeValues.push(attributeValue);
            }
        }

        attributeInstance = { "values": attributeValues };
    } else if (Array.isArray(attributeJSON.group)) {
        attributeInstance = { "group": attributeJSON.group };
    } else {
        let attributeValue = { "value": attributeJSON.value };

        let valCtx = DataHelper.cloneObject(valueContext);
        if (attributeJSON.selectedLocales && attributeJSON.selectedLocales.length > 0 && attributeJSON.selectedLocales[0]) {
            let selectedLocale = attributeJSON.selectedLocales[0];

            valCtx.locale = selectedLocale;
        }

        AttributeHelper.populateValueContext(attributeValue, valCtx);
        if (attributeJSON.action == "delete") {
            attributeValue.action = "delete";
        }

        if (attributeJSON.referenceEntityType && attributeJSON.referenceDataId) {
            attributeValue.properties = {};
            attributeValue.properties.referenceData = attributeJSON.referenceEntityType + "/" + attributeJSON.referenceDataId;
            attributeValue.properties.referenceDataIdentifier = "";
        }

        attributeValues.push(attributeValue);

        attributeInstance = { "values": attributeValues };
    }
    delete attributeJSON.action;

    if (attributeJSON.attrProperties) {
        attributeInstance.properties = attributeJSON.attrProperties;
    }

    return attributeInstance;
};

DataTransformHelper._transformAttributesWithoutModels = function (attributes, valueContext) {
    let transformedAttributes = {};

    for (let attributeName in attributes) {
        let attribute = attributes[attributeName];
        if (attribute) {
            let attributeJSON = {};
            if (attribute && attribute.values) {
                if (attribute.values) {
                    for (let i = 0; i < attribute.values.length; i++) {
                        let currentValue = attribute.values[i];
                        attributeJSON = DataHelper.cloneObject(currentValue);
                        break;
                    }
                }
                if (attributeJSON != undefined && attributeJSON.hasOwnProperty('invalidValue')) {
                    attributeJSON["value"] = attributeJSON.invalidValue;
                }

                if (attributeJSON == undefined || !attributeJSON.hasOwnProperty('value')) {
                    attributeJSON = AttributeHelper.getEmptyValue(valueContext);
                }

                attributeJSON.name = attributeName;
                transformedAttributes[attributeName] = attributeJSON;
            }
        }
    }

    return transformedAttributes;
};

DataTransformHelper._transformAttributes = function (attributes, attributeModels, valueContext, dataContext, itemContext) {
    let transformedAttributes = {};

    let defaultValCtx = DataHelper.getDefaultValContext();
    valueContext = _.isEmpty(valueContext) ? defaultValCtx : valueContext;
    let clonedValCtx = DataHelper.cloneObject(valueContext);

    for (let attributeModelName in attributeModels) {
        let attributeJSON = {};
        let attributeModel = attributeModels[attributeModelName];
        
        if (attributeModel && attributeModel.name) {
            let attribute = attributes[attributeModel.name];

            if (attribute) {
                let removeParentEntityDetails = !_.isEmpty(dataContext);

                if (removeParentEntityDetails) {
                    if (attribute.group) {
                        for (let grp of attribute.group) {
                            delete grp.os;
                            delete grp.osid;
                            delete grp.ostype;
                        }
                    } else if (attribute.values) {
                        for (let value of attribute.values) {
                            delete value.os;
                            delete value.osid;
                            delete value.ostype;
                        }
                    }
                }
            }

            if (attribute && attribute.values) {

                let currentLocale = attributeModel.isLocalizable ? valueContext.locale : DataHelper.getDefaultLocale();

                attribute.values = attribute.values.filter(value => value.locale === currentLocale);
                clonedValCtx.locale = currentLocale;
                attributeJSON = AttributeHelper.getCurrentValue(attribute.values, clonedValCtx, attributeModel);

                let attributeRefIds = [];
                let selectedLocales = [];
                let localeCoalescePath = undefined;
                let os = undefined;
                let osid = undefined;
                let ostype = undefined;
                let attributeValueIds = [];

                for (let i = 0; i < attribute.values.length; i++) {
                    let attributeValue = attribute.values[i];
                    if (!DataHelper.isEmptyObject(attributeValue.properties)) {
                        if (attributeValue.properties.referenceData) {
                            let refEntityType = attributeModel.referenceEntityTypes && attributeModel.referenceEntityTypes.length > 0 ? attributeModel.referenceEntityTypes[0] : "";
                            let referenceData = attributeValue.properties.referenceData;
                            let referenceDataId = referenceData.replace(refEntityType + "/", "");
                            attributeRefIds.push(referenceDataId);
                        }

                        localeCoalescePath = attributeValue.properties.localeCoalescePath;

                        if (attributeModel.isReferenceType) {
                            let selectedLocale = valueContext.locale;

                            let fallbackLocale = DataHelper.getFallbackLocaleFromCoalescePath(localeCoalescePath);

                            if (fallbackLocale) {
                                selectedLocale = fallbackLocale;
                            }

                            selectedLocales.push(selectedLocale);
                        }
                    }

                    attributeValueIds.push(attributeValue.id);

                    if (!_.isEmpty(attributeValue.os) && !_.isEmpty(attributeValue.osid) && !_.isEmpty(attributeValue.ostype)) {
                        os = attributeValue.os;
                        osid = attributeValue.osid;
                        ostype = attributeValue.ostype;
                    }
                }

                if (attributeJSON) {
                    attributeJSON.referenceDataId = attributeRefIds;

                    if (!_.isEmpty(selectedLocales)) {
                        attributeJSON.selectedLocales = selectedLocales;
                    }

                    if (!_.isEmpty(os) && !_.isEmpty(osid) && !_.isEmpty(ostype)) {
                        attributeJSON.os = os;
                        attributeJSON.osid = osid;
                        attributeJSON.ostype = ostype;
                    }

                    attributeJSON.valueIds = attributeValueIds;
                }

                if (attributeJSON != undefined && attributeJSON.invalidValue) {
                    attributeJSON["value"] = attributeJSON.invalidValue;
                }
            } else if (attributeModel.dataType === "nested" && attributeModel.group && attributeModel.group.length > 0) {
                let attrValues = DataTransformHelper.transformNestedAttributes(attribute, attributeModel, false, dataContext, valueContext);
                if (!_.isEmpty(attrValues)) {
                    attributeJSON["value"] = attrValues;
                    attributeJSON.os = attrValues[0].os;
                    attributeJSON.osid = attrValues[0].osid;
                    attributeJSON.ostype = attrValues[0].ostype;
                }
            }

            if (!_.isEmpty(attributeJSON)) {
                let localeCoalescePath = attributeModel.isLocalizable ? AttributeHelper.getLocaleCoalescePath(attribute) : undefined;

                if (!DataHelper.isEmptyObject(localeCoalescePath)) {
                    attributeJSON.properties = attributeJSON.properties || {};
                    attributeJSON.properties.localeCoalescePath = localeCoalescePath;
                    attributeJSON.properties.localeCoalescePathExternalName = AttributeHelper.getLocaleCoalescePath(attribute, "localeCoalescePathExternalName");
                }
            }

            if (!_.isEmpty(attributeJSON) && attribute && attribute.properties && !_.isEmpty(dataContext)) {
                let contextCoalescePaths = DataTransformHelper.getContextCoalescePaths(attribute.properties, dataContext);

                if (contextCoalescePaths && contextCoalescePaths.length) {
                    attributeJSON.contextCoalescePaths = contextCoalescePaths;
                }

                // properties object should be sent to the server to update falcor cache in case of coalesced data.
                attributeJSON.attrProperties = attribute.properties;
            }

            if (attributeJSON && !DataHelper.isEmptyObject(attributeJSON.properties)) {
                if (attributeJSON.properties.referenceData) {
                    let refEntityType = attributeModel.referenceEntityTypes && attributeModel.referenceEntityTypes.length > 0 ? attributeModel.referenceEntityTypes[0] : "";
                    let referenceData = attributeJSON.properties.referenceData;
                    let referenceDataId = referenceData.replace(refEntityType + "/", "");
                    attributeJSON.referenceDataId = referenceDataId;
                }
            }

            if (attributeJSON == undefined || (!attributeJSON.value && !attributeJSON.group)) {
                attributeJSON = AttributeHelper.getEmptyValue(valueContext, attributeModel);
            }

            attributeJSON.selfContext = attributeModel.selfContext;
            attributeJSON.name = attributeModel.name;
            let value = attributeJSON.value;
            if(_.isArray(value)){
                attributeJSON.value = (value[0] == ConstantHelper.NULL_VALUE ? [] : value);
            }else{
                attributeJSON.value = (value == ConstantHelper.NULL_VALUE ? "" : value);
            }
            attributeJSON.isNullValue = (value == ConstantHelper.NULL_VALUE) ||  (_.isArray(value) && value[0] ==ConstantHelper.NULL_VALUE) ? true : false; 
            transformedAttributes[attributeModel.name] = attributeJSON;
        }
    }

    return transformedAttributes;
};

DataTransformHelper.transformNestedAttributes = function (attribute, nestedAttributeModel, returnEmptyRecord, dataContext, valueContext) {
    let childAttributeModels = nestedAttributeModel.group && nestedAttributeModel.group.length > 0 ? nestedAttributeModel.group[0] : undefined;
    let isParentLocalizable = nestedAttributeModel.isLocalizable;
    if (!_.isEmpty(childAttributeModels)) {
        let value = [];
        let isNullValue = false;
        if(DataHelper.isValidObjectPath(attribute, "group.0.value") && attribute.group[0].value === ConstantHelper.NULL_VALUE) {
            isNullValue = true;
        }

        if(isNullValue) {
            value = [ConstantHelper.NULL_VALUE];
            return value;
        }

        let defaultValCtx = DataHelper.getDefaultValContext();
        if (_.isEmpty(valueContext)) {
            valueContext = defaultValCtx;
        }
        let clonedValCtx = DataHelper.cloneObject(valueContext);

        let currentLocaleGroup = attribute && attribute.group && attribute.group.length > 0 ? attribute.group.filter(item => item.locale === valueContext.locale) : [];

        if (!_.isEmpty(currentLocaleGroup)) {
            let contextCoalescePaths = !_.isEmpty(dataContext) ? DataTransformHelper.getContextCoalescePaths(attribute.properties, dataContext) : [];
            for (let i = 0; i < currentLocaleGroup.length; i++) {
                let childAttributes = currentLocaleGroup[i];
                let childAttributeJson = {};

                let hasAttributes = false;
                let childAttrNames = Object.keys(childAttributes);
                for (let attributeName in childAttributeModels) {
                    if (childAttrNames.find(name => name === attributeName)
                        && !_.isEmpty(childAttributes[attributeName].values)) {
                        hasAttributes = true;
                        break;
                    } else {
                        continue;
                    }
                }
                if (hasAttributes) {
                    for (let attributeName in childAttributeModels) {
                        let childAttrModel = childAttributeModels[attributeName];
                        let childAttr = childAttributes[attributeName];
                        let rowLevelLocaleCoalescePath = isParentLocalizable && childAttributes.properties && childAttributes.properties.localeCoalescePath ? childAttributes.properties.localeCoalescePath : undefined;
                        childAttributeJson[attributeName] = {};

                        if (childAttr && childAttr.values) {
                            let currentLocale = childAttrModel.isLocalizable ? valueContext.locale : DataHelper.getDefaultLocale();

                            childAttr.values = childAttr.values.filter(value => value.locale === currentLocale);
                            clonedValCtx.locale = currentLocale;
                            childAttributeJson[attributeName] = AttributeHelper.getCurrentValue(childAttr.values, clonedValCtx, childAttrModel);

                            let attributeRefIds = [];
                            let selectedLocales = [];
                            let localeCoalescePath = undefined;

                            for (let valIdx = 0; valIdx < childAttr.values.length; valIdx++) {
                                let attributeValue = childAttr.values[valIdx];
                                if (!DataHelper.isEmptyObject(attributeValue.properties)) {
                                    if (attributeValue.properties.referenceData) {
                                        let refEntityType = childAttrModel.referenceEntityTypes && childAttrModel.referenceEntityTypes.length > 0 ? childAttrModel.referenceEntityTypes[0] : "";
                                        let referenceData = attributeValue.properties.referenceData;
                                        let referenceDataId = referenceData.replace(refEntityType + "/", "");
                                        attributeRefIds.push(referenceDataId);
                                    }
                                }
                            }

                            if (childAttributeJson[attributeName]) {
                                childAttributeJson[attributeName].referenceDataId = attributeRefIds;

                                localeCoalescePath = childAttrModel.isLocalizable ? AttributeHelper.getLocaleCoalescePath(childAttr) : undefined;
                                if(childAttrModel.isLocalizable) {
                                    localeCoalescePath = AttributeHelper.getLocaleCoalescePath(childAttr);
                                    if(DataHelper.isEmptyObject(localeCoalescePath) && rowLevelLocaleCoalescePath) {
                                        localeCoalescePath = rowLevelLocaleCoalescePath;
                                    }
                                }

                                if (!DataHelper.isEmptyObject(localeCoalescePath)) {
                                    childAttributeJson[attributeName].properties = childAttributeJson[attributeName].properties || {};
                                    childAttributeJson[attributeName].properties.localeCoalescePath = localeCoalescePath;
                                }

                                if (childAttrModel.isReferenceType) {
                                    let selectedLocale = valueContext.locale;

                                    let fallbackLocale = DataHelper.getFallbackLocaleFromCoalescePath(localeCoalescePath);

                                    if (fallbackLocale) {
                                        selectedLocale = fallbackLocale;
                                    }

                                    selectedLocales.push(selectedLocale);
                                }

                                if (!_.isEmpty(selectedLocales)) {
                                    childAttributeJson[attributeName].selectedLocales = selectedLocales;
                                }

                                if (!_.isEmpty(contextCoalescePaths)) {
                                    childAttributeJson[attributeName]["contextCoalescePaths"] = contextCoalescePaths;
                                }

                                if(childAttributes.os === "graph" && childAttributes.osid && childAttributes.ostype) {
                                    childAttributeJson[attributeName]["os"] = childAttributes.os;
                                    childAttributeJson[attributeName]["osid"] = childAttributes.osid;
                                    childAttributeJson[attributeName]["ostype"] = childAttributes.ostype;
                                }
                            }
                        } else {
                            childAttributeJson[attributeName]["value"] = childAttrModel.isCollection ? [] : "";
                            if (childAttrModel.displayType && childAttrModel.displayType.toLowerCase() === "referencelist") {
                                let refEntityType = childAttrModel.referenceEntityTypes && childAttrModel.referenceEntityTypes.length > 0 ? childAttrModel.referenceEntityTypes[0] : "";
                                childAttributeJson[attributeName]["referenceEntityType"] = refEntityType;
                                childAttributeJson[attributeName]["referenceDataId"] = childAttrModel.isCollection ? [] : "";
                            }
                        }
                    }
                    childAttributeJson["valueIdentifier"] = {};
                    childAttributeJson["valueIdentifier"]["value"] = childAttributes.id ? childAttributes.id : DataHelper.generateUUID();

                    childAttributeJson.os = childAttributes.os;
                    childAttributeJson.osid = childAttributes.osid;
                    childAttributeJson.ostype = childAttributes.ostype;
                    childAttributeJson.locale = childAttributes.locale;
                    childAttributeJson.source = childAttributes.source;

                    value.push(childAttributeJson);
                }
            }
        } else {
            if (returnEmptyRecord) {
                let childAttributeJson = {};

                for (let attributeName in childAttributeModels) {
                    let childAttrModel = childAttributeModels[attributeName];
                    childAttributeJson[attributeName] = {};
                    childAttributeJson[attributeName]["value"] = childAttrModel.isCollection ? [] : "";

                    if (childAttrModel.displayType && childAttrModel.displayType.toLowerCase() === "referencelist") {
                        let refEntityType = childAttrModel.referenceEntityTypes && childAttrModel.referenceEntityTypes.length > 0 ? childAttrModel.referenceEntityTypes[0] : "";
                        childAttributeJson[attributeName]["referenceEntityType"] = refEntityType;
                        childAttributeJson[attributeName]["referenceDataId"] = childAttrModel.isCollection ? [] : "";
                    }
                }
                childAttributeJson["valueIdentifier"] = {};
                childAttributeJson["valueIdentifier"]["value"] = DataHelper.generateUUID();

                value.push(childAttributeJson);
            }
        }
        return value;
    }
};

DataTransformHelper._fillModels = function (attributeModelObjects, editPermission, isNestedChild, isLocalizable) {
    for (let attributeName in attributeModelObjects) {
        let model = attributeModelObjects[attributeName];
        
        if(model) {
            model.isNestedChild = isNestedChild;

            if (editPermission === false) {
                model.properties.hasWritePermission = false;
            }

            /**
             * observed quite a few times that nested attribute model coming without
             * isCollection flag. For a nested isCollection is must. So setting isCollection to true 
             * by Default for all nested attributes.
             * */
            if(model.properties && model.properties.dataType && model.properties.dataType === "nested") {
                model.properties["isCollection"] = true;
            }

            if (model.properties && model.properties.dataType !== "nested" && model.properties.dataType !== "string") {
                model.properties.isLocalizable = false;
            }

            if(model.isNestedChild) {
                model.properties.isLocalizable = isLocalizable ? true : false;
            }

            if (model.properties && model.properties.isReferenceType) {
                model.properties.isLocalizable = true;
            }

            for (let prop in model.properties) {
                model[prop] = model.properties[prop];
            }

            if (model.dataType === "nested" && model.group && model.group.length > 0) {
                let childAttributeModels = model.group[0];
                delete childAttributeModels.id;
                this._fillModels(childAttributeModels, editPermission, true, model.isLocalizable);
            }

            if (!model.dataType) {
                model.dataType = "string";
            }
            if (!model.displayType) {
                model.displayType = AttributeHelper.getDisplayType(model.dataType);
            }
            if (model.displayType.toLowerCase() == 'referencelist') {
                model.referenceEntityTypes = DataTransformHelper._getEntityTypesForLov(model);
            }
            if (model.dataType == "boolean") {
                if (_.isEmpty(model.trueText) || _.isEmpty(model.falseText)) {
                    model.trueText = "TRUE";
                    model.falseText = "FALSE";
                }

            }
            model.name = attributeName;
        }
    }
};

DataTransformHelper._getEntityTypesForLov = function (attributeModel) {
    let info = [];
    //find from manage model, looks like this:
    // "referenceEntityInfo": [
    //                     {
    //                         "refRelationshipName": "hasReferenceTo",
    //                         "refEntityType": "color"
    //                     }
    //                 ]
    if (attributeModel.referenceEntityInfo) {
        for (let i = 0; i < attributeModel.referenceEntityInfo.length; i++) {
            let refInfo = attributeModel.referenceEntityInfo[i];
            if (refInfo.refRelationshipName == 'hasReferenceTo' && refInfo.refEntityType) {
                info.push(refInfo.refEntityType);
            }
        }
    }

    return info;
};

DataTransformHelper.prepareEntitiesForCreate = function (data, contextData, attributeModels) {
    let entities = [];
    let firstValueContext = ContextHelper.getFirstValueContext(contextData);
    let firstItemContext = ContextHelper.getFirstItemContext(contextData);
    if (data && data.length > 0) {
        for (let i = 0; i < data.length; i++) {
            let rowData = data[i];
            let keys = Object.keys(rowData);
            let attributesJson = [];
            let entityCtx = {};
            if (keys && keys.length > 0) {
                for (let j = 0; j < keys.length; j++) {
                    let key = keys[j];
                    if (rowData[key]) {
                        if (key != "classification" && key != "taxonomy") {
                            if (attributeModels[key]) {
                                let val = undefined;
                                let group = undefined;

                                if (attributeModels[key].isCollection) {
                                    if (attributeModels[key].dataType === "nested") {
                                        group = rowData[key];
                                    } else {
                                        val = rowData[key].split("||");
                                    }
                                } else {
                                    val = rowData[key];
                                }

                                let attribute = {};
                                if (group)
                                    attribute = {
                                        "name": key,
                                        "group": group,
                                        "selfContext": attributeModels[key].selfContext
                                    };
                                else
                                    attribute = {
                                        "name": key,
                                        "value": val,
                                        "source": firstValueContext.source,
                                        "locale": firstValueContext.locale,
                                        "selfContext": attributeModels[key].selfContext
                                    };

                                if (attribute.value === "delete" || (attribute.value instanceof Array && attribute.value[0] === "delete")) {
                                    attribute.action = "delete";
                                }

                                attributesJson.push(attribute);
                            }
                        } else if (key == "classification") {
                            entityCtx["classification"] = rowData[key];
                        } else if (key == "taxonomy") {
                            entityCtx["taxonomy"] = rowData[key];
                        }
                    }
                }
            }
            let entityContexts = [];
            if (!_.isEmpty(entityCtx)) {
                entityContexts.push(entityCtx);
            }
            contextData[ContextHelper.CONTEXT_TYPE_DATA] = entityContexts;
            let entityId = rowData.rowId;
            let entityType = firstItemContext.type;
            let entity = DataTransformHelper.prepareEntityForCreate(entityId, entityType, attributesJson, contextData, "John", {}, attributeModels);
            entities.push(entity);
        }
    }
    return entities;
};

DataTransformHelper.transformEntityForDimensionGrid = function (entity, dimensions, attributeModel) {
    if (!_.isEmpty(entity) && !_.isEmpty(dimensions) && !_.isEmpty(attributeModel)) {

        let valContextFlat = {};
        if (!_.isEmpty(dimensions.locales)) {
            valContextFlat.locale = [...new Set(dimensions.locales.map((obj) => obj.id))];
        }

        if (!_.isEmpty(dimensions.sources)) {
            valContextFlat.source = [...new Set(dimensions.sources.map((obj) => obj.id))];
        }

        let valContexts = _.createCartesianObjects(valContextFlat);
        if (_.isEmpty(entity.data)) {
            entity.data = {};
            entity.data.contexts = [];
            entity.data.attributes = {};
        }

        if (!_.isEmpty(dimensions.channels)) {
            let entityContexts = entity.data.contexts;
            dimensions.channels.forEach(function (channel) {
                let ctx = entityContexts.filter(ctx => ctx.context.list == channel.id);
                if (ctx) {
                    if (_.isEmpty(ctx.attributes)) {
                        ctx.attributes = {};
                    }

                    this._transformAttributesForDimensionGrid(ctx.attributes, attributeModel, valContexts);
                } else {
                    let context = {};
                    context.context = {
                        "list": channel.id
                    };
                    context.attributes = {};

                    this._transformAttributesForDimensionGrid(context.attributes, attributeModel, valContexts);
                    entityContexts.push(context);
                }
            }, this);

            let selContextAttributes = entity.data.attributes;
            if (_.isEmpty(selContextAttributes)) {
                selContextAttributes = {};
            }
            this._transformAttributesForDimensionGrid(selContextAttributes, attributeModel, valContexts);
        } else {
            let selfContextAttributes = entity.data.attributes;
            if (_.isEmpty(selfContextAttributes)) {
                selfContextAttributes = {};
            }
            this._transformAttributesForDimensionGrid(selfContextAttributes, attributeModel, valContexts);
            entity.data.attributes = selfContextAttributes;
        }
    }
};

DataTransformHelper.transformScopes = function (scopes, mappings, userContext, favListName, transformType) {
    if (!scopes || scopes.length == 0) {
        return;
    }
    let _favorites = [];
    //Favourites list, getting the mappings based on user and role, so fetching the first obj for the process
    if (mappings && mappings.length > 0) {
        if (mappings[0].data && mappings[0].data.contexts && mappings[0].data.contexts.length) {
            _favorites = mappings[0].data.contexts[0].jsonData.config[favListName];
        }
    }

    let _scopes = {};

    //Prepare initial object
    if (transformType == "scope") {
        _scopes = {
            "favourites": [],
            "my-scopes": [],
            "shared-scopes": []
        }
    } else {
        _scopes = {
            "workflowSavedSearch": [],
            "favourites": [],
            "my-searches": [],
            "shared-searches": []
        }
    }

    for (let i = 0; i < scopes.length; i++) {
        if (scopes[i].type == "workflowSavedSearch") {
            if (scopes[i].data && scopes[i].data.contexts && scopes[i].data.contexts.length) {
                _scopes.workflowSavedSearch.push(scopes[i].data.contexts[0].jsonData.config);
            }
        }
        else if (scopes[i].type == "savedSearch") {
            let _searchData = {};
            if (scopes[i].data && scopes[i].data.contexts && scopes[i].data.contexts.length) {
                _searchData = scopes[i].data.contexts[0].jsonData.config;
                _searchData["searchname"] = scopes[i].name;
                _searchData["searchid"] = scopes[i].id;
            }
            if (!_.isEmpty(_searchData)) {
                let _favFlag = false;
                // Check is the current search in favourites, if yes directly push to favourites section
                if (!_.isEmpty(_favorites)) {
                    for (let j = 0; j < _favorites.length; j++) {
                        if (_favorites[j] == _searchData.searchname) {
                            _searchData.isFavourite = true;
                            _scopes.favourites.push(DataHelper.cloneObject(_searchData));
                            _favFlag = true;
                            break;
                        }
                    }
                }

                // If not favourites, then check for user, if user is current user, then push to my searches section
                if (_searchData.createdby == userContext.user) {
                    if (_scopes["my-searches"].indexOf(_searchData) == -1) {
                        _searchData.isFavourite = _favFlag;
                        _scopes["my-searches"].push(_searchData);
                    }
                }
                else {
                    let isSharedSearch = false;

                    if (_searchData.accesstype.toUpperCase() == "_ROLE") {
                        if (_searchData.ownershipData == undefined || _searchData.ownershipData == userContext.ownershipData || (Array.isArray(userContext.ownershipData) && userContext.ownershipData.indexOf(_searchData.ownershipData) > -1) || (Array.isArray(_searchData.ownershipData) && _searchData.ownershipData.indexOf(userContext.ownershipData) > -1)) {
                            //Note::Undefined check is needed to support already defined saved searches which are not having ownershipData...
                            //This check needs to be removed in later releases.
                            isSharedSearch = true;
                        }
                    }
                    else {
                        isSharedSearch = true;
                    }

                    if (isSharedSearch) {
                        _searchData.isFavourite = _favFlag;
                        _scopes["shared-searches"].push(_searchData);
                    }
                }
            }
        }
        else if (scopes[i].type == "scope") {
            let _scopeData = {};
            if (scopes[i].data && scopes[i].data.contexts && scopes[i].data.contexts.length) {
                _scopeData = scopes[i].data.contexts[0].jsonData.config;
                _scopeData["scopename"] = scopes[i].name;
                _scopeData["scopeid"] = scopes[i].id;
            }

            if (!_.isEmpty(_scopeData)) {
                let _favFlag = false;
                // Check is the current scope in favourites, if yes directly push to favourites section
                if (_favorites) {
                    for (let j = 0; j < _favorites.length; j++) {
                        if (_favorites[j] == _scopeData.scopename) {
                            _scopeData.isFavourite = true;
                            _scopes.favourites.push(DataHelper.cloneObject(_scopeData));
                            _favFlag = true;
                            break;
                        }
                    }
                }

                // If not favourites, then check for user, if user is current user, then push to my scopes section
                if (_scopeData.createdby == userContext.user) {
                    _scopeData.isFavourite = _favFlag;
                    _scopes["my-scopes"].push(_scopeData);
                }
                else {
                    let isSharedScope = false;

                    if (_scopeData.accesstype.toUpperCase() == "_ROLE") {
                        if (_scopeData.ownershipData == undefined || _scopeData.ownershipData == userContext.ownershipData || (Array.isArray(userContext.ownershipData) && userContext.ownershipData.indexOf(_scopeData.ownershipData) > -1) || (Array.isArray(_scopeData.ownershipData) && _scopeData.ownershipData.indexOf(userContext.ownershipData) > -1)) {
                            //Note::Undefined check is needed to support already defined scopes which are not having ownershipData...
                            //This check needs to be removed in later releases.
                            isSharedScope = true;
                        }
                    }
                    else {
                        isSharedScope = true;
                    }

                    if (isSharedScope) {
                        _scopeData.isFavourite = _favFlag;
                        _scopes["shared-scopes"].push(_scopeData);
                    }
                }
            }
        }
    }
    return _scopes;
};
DataTransformHelper.transformEntitySchemaToLovSchema = function (entities, lovColumnNameValueCollection) {
    // Note: We will go by the assumption that id or value field is going to be unique
    //       if id or name is provided do not put it into attributes fields
    let formattedEntities = [];
    if (entities && entities.length) {
        let entitiesToBeRemoved = [];
        for (let i = 0; i < entities.length; i++) {
            if (typeof (entities[i]) == "object") {
                let formattedEntity = {};
                Object.keys(lovColumnNameValueCollection).map(function (columnName) {
                    let attributeValue;
                    if (lovColumnNameValueCollection[columnName] == "id") {
                        formattedEntity[columnName] = entities[i].id;
                    } else if (lovColumnNameValueCollection[columnName] == "name") {
                        formattedEntity[columnName] = entities[i].name;
                    } else if (lovColumnNameValueCollection[columnName] == "typeExternalName") {
                        formattedEntity[columnName] = entities[i].typeExternalName;
                    } else if (columnName == "type") {
                        let entityTypes = lovColumnNameValueCollection[columnName];
                        if (typeof (entityTypes) !== "undefined" && entityTypes instanceof Array) {
                            for (let j = 0; j < entityTypes.length; j++) {
                                if (entityTypes[j] === entities[i].type) {
                                    formattedEntity[columnName] = entityTypes[j];
                                }
                            }
                        }
                    } else {
                        if (entities[i].data) {
                            let fieldPattern = lovColumnNameValueCollection[columnName];
                            if (typeof (fieldPattern) === "string" && !DataHelper.isEmptyObject(fieldPattern)) {
                                attributeValue = DataTransformHelper.getLovFieldPatternValue(entities[i], fieldPattern, columnName);
                            }
                            if (attributeValue) {
                                formattedEntity[columnName] = attributeValue;
                            }
                        }
                    }
                    if (columnName == "title" && lovColumnNameValueCollection[columnName] != "" && !formattedEntity[columnName]) {
                        formattedEntity[columnName] = entities[i].id + " - Title not found";
                    }
                });
                if (!_.isEmpty(formattedEntity)) {
                    formattedEntities.push(formattedEntity);
                }
            } else {
                //if the array has a bad item (non-entity, or entity with no data) then mark it for delete
                entitiesToBeRemoved.push(i);
            }
        }
        // Make it Private
        entitiesToBeRemoved.forEach(function (entityToBeRemoved) {
            for (let i = 0; i < entities.length; i++) {
                if (entities[i].id === entityToBeRemoved) {
                    let currentEntity = entities[i];
                    entities.splice(currentEntity, 1);
                }
            }
        });
    }
    return formattedEntities;
};

DataTransformHelper.transformEntityModelSchemaToLovSchema = function (entityModels, lovColumnNameValueCollection) {
    let formattedEntityModels = [];

    if (entityModels && entityModels.length) {
        let entityModelsToBeRemoved = [];

        for (let i = 0; i < entityModels.length; i++) {
            if (typeof (entityModels[i]) == "object") {

                let formattedEntityModel = {};

                Object.keys(lovColumnNameValueCollection).map(function (columnName) {
                    let attributeValue;

                    if (lovColumnNameValueCollection[columnName] == "id") {
                        formattedEntityModel[columnName] = entityModels[i].id;
                    } else if (lovColumnNameValueCollection[columnName] == "name") {
                        formattedEntityModel[columnName] = entityModels[i].name;
                    } else if (columnName == "type") {
                        formattedEntityModel[columnName] = "";
                        let entityTypes = lovColumnNameValueCollection[columnName];

                        if (typeof (entityTypes) !== "undefined" && entityTypes instanceof Array) {
                            for (let j = 0; j < entityTypes.length; j++) {
                                if (entityTypes[j] === entityModels[i].type) {
                                    formattedEntityModel[columnName] = entityTypes[j];
                                }
                            }
                        }

                    } else {
                        if (entityModels[i].data) {
                            let fieldPattern = lovColumnNameValueCollection[columnName];
                            if (typeof (fieldPattern) === "string" && !DataHelper.isEmptyObject(fieldPattern)) {
                                attributeValue = DataTransformHelper.getLovFieldPatternValue(entityModels[i], fieldPattern, columnName);
                            }
                            if (attributeValue) {
                                formattedEntityModel[columnName] = attributeValue;
                            }
                        }
                    }
                });

                formattedEntityModels.push(formattedEntityModel);
            } else {
                entityModelsToBeRemoved.push(i);
            }
        }

        entityModelsToBeRemoved.forEach(function (entityModelToBeRemoved) {
            for (let i = 0; i < entityModels.length; i++) {
                if (entityModels[i].id === entityModelToBeRemoved) {
                    let currentEntityModel = entityModels[i];
                    entityModels.splice(currentEntityModel, 1);
                }
            }
        });
    }

    return formattedEntityModels;
};

DataTransformHelper.transformEntitiesToSimpleSchema = function (entities, attributeNames, attributeModels) {
    let formattedEntities = [];
    if (entities && entities.length) {
        for (let i = 0; i < entities.length; i++) {
            if (typeof (entities[i]) == "object") {
                let attributes = {};
                if (entities[i].data) {
                    attributes = EntityHelper.getAllAttributes(entities[i]);
                }
                let formattedEntity = {};
                for (let index in attributeNames) {
                    let columnName = attributeNames[index];
                    if (attributes && attributes[columnName] && attributes[columnName].values) {
                        let attributeValueObj = attributes[columnName].values[0];
                        let value = attributeValueObj.value;
                        if (attributeModels) {
                            let model = attributeModels[columnName];
                            if (model && model.dataType && (model.dataType.toLowerCase() == "date" || model.dataType.toLowerCase() == "datetime")) {
                                value = FormatHelper.convertFromISODateTime(value, model.dataType, model.dateFormat);
                            }
                        }
                        formattedEntity[columnName] = value;
                    }
                    else if(columnName && entities[i][columnName]){
                        formattedEntity[columnName] =  entities[i][columnName];
                    }
                    else if(columnName && entities[i].properties && entities[i].properties[columnName]){
                        formattedEntity[columnName] =  entities[i].properties[columnName];
                    }
                }
                if (!_.isEmpty(formattedEntity)) {
                    formattedEntities.push(formattedEntity);
                }
            }
        }
    }
    return formattedEntities;
};

DataTransformHelper.transformAtributeModelsToLovSchema = function (attributeModels, lovColumnNameValueCollection) {
    let formattedAttributeModels = [];
    if (attributeModels && lovColumnNameValueCollection) {
        for (let i in attributeModels) {
            let formattedAttributeModel = {};
            let attributeModel = attributeModels[i];
            for (let columnName in lovColumnNameValueCollection) {
                let fieldName = lovColumnNameValueCollection[columnName];
                if (fieldName) {
                    attributeModel[columnName] = attributeModel[fieldName];
                }
            }
            if(!_.isEmpty(attributeModel.attributeExternalNamePath)){
                attributeModel.title = attributeModel.attributeExternalNamePath;
            }
            if(!_.isEmpty(attributeModel.attributeNamePath)){
                attributeModel.name = attributeModel.attributeNamePath;
            }
            formattedAttributeModels.push(attributeModel);
        }
    }
    return formattedAttributeModels;
};

DataTransformHelper._transformEntityAttributesForLovSchema = function (attributes, attributeName) {
    let attributeValueObject = {};

    if (!attributes || _.isEmpty(attributes)) {
        return;
    }

    Object.keys(attributes).map(function (key) {
        if (key == attributeName
            && attributes[key].values
            && attributes[key].values.length > 0) {
            attributeValueObject = attributes[key].values[0];
        }
    });

    return attributeValueObject;
};

DataTransformHelper._transformAttributesForDimensionGrid = function (attributes, attributeModel, valueContexts) {
    if (valueContexts) {
        if (!_.isEmpty(attributes) && attributes[attributeModel.name]) {
            let values = attributes[attributeModel.name].values;
            if (!_.isEmpty(values)) {
                valueContexts.forEach(function (valCtx) {
                    let value = values.filter(val => val.locale == valCtx.locale && val.source == valCtx.source);
                    if (_.isEmpty(value)) {
                        let val = AttributeHelper.getEmptyValue(valCtx);
                        if (val) {
                            values.push(val);
                        }
                    }
                }, this);
            } else {
                attributes[attributeModel.name] = AttributeHelper.getEmptyValues(valueContexts);
            }
        } else {
            attributes[attributeModel.name] = {};
            attributes[attributeModel.name] = AttributeHelper.getEmptyValues(valueContexts);
        }
    }
};

DataTransformHelper._hasEmptyAttributes = function (entity) {
    return !entity || !entity.data || !entity.data.attributes || DataHelper.isEmptyObject(entity.data.attributes);
};

DataTransformHelper.transformReferenceEntitySchemaToLovSchema = function (entities, lovColumnMap, contextData) {
    // Note: We will go by the assumption that id or value field is going to be unique
    //       if id or name is provided do not put it into attributesWithPattern fields

    let formattedEntities = [];
    let ignoreColumnList = ["id", "image", "color", "type", "value", "imageId"];

    if (entities && entities.length) {
        let entitiesToBeRemoved = [];
        for (let i = 0; i < entities.length; i++) {
            if (typeof (entities[i]) === "object") {
                let formattedEntity = {};

                if (DataTransformHelper._hasEmptyAttributes(entities[i])) {
                    continue;
                }

                Object.keys(lovColumnMap).map(function (lovColumnName) {
                    let fieldPattern = lovColumnMap[lovColumnName];

                    if (typeof (fieldPattern) === "string" && !DataHelper.isEmptyObject(fieldPattern) && ignoreColumnList.indexOf(lovColumnName) == -1) {
                        formattedEntity[lovColumnName] = DataTransformHelper.getLovFieldPatternValue(entities[i], fieldPattern, lovColumnName, contextData);
                    } else {
                        let attributeValue = "";

                        let attributeName = DataHelper.readAttributeFromPath(lovColumnMap[lovColumnName]);
                        if (attributeName) {
                            attributeValue = DataTransformHelper._getLovAttributeValue(entities[i], attributeName, lovColumnName, contextData);
                        }

                        formattedEntity[lovColumnName] = attributeValue;
                    }
                });

                if (!DataHelper.isEmptyObject(formattedEntity)) {
                    formattedEntities.push(formattedEntity);
                }
            } else {
                //if the array has a bad item (non-entity, or entity with no data) then mark it for delete
                entitiesToBeRemoved.push(i);
            }
        }

        entitiesToBeRemoved.forEach(function (entityToBeRemoved) {
            for (let i = 0; i < entities.length; i++) {
                if (entities[i].id === entityToBeRemoved) {
                    let currentEntity = entities[i];
                    entities.splice(currentEntity, 1);
                }
            }
        });
    }

    return formattedEntities;
};

DataTransformHelper.getLovFieldPatternValue = function (entity, fieldPattern, lovColumnName, contextData) {
    let patternedValue = "";

    if (typeof (fieldPattern) === "string" && !DataHelper.isEmptyObject(fieldPattern)) {
        let attributesWithPattern = DataHelper.getWordsBetweenCurlies(fieldPattern);

        if (!DataHelper.isEmptyObject(attributesWithPattern) && attributesWithPattern instanceof Array) {
            for (let j = 0; j < attributesWithPattern.length; j++) {
                let attributeValue = "";

                let attributeName = DataHelper.readAttributeFromPath(attributesWithPattern[j]);
                if (attributeName) {
                    // Replace Field Pattern with Values
                    attributeValue = DataTransformHelper._getLovAttributeValue(entity, attributeName, lovColumnName, contextData);
                }
                if (!attributeValue) {
                    attributeValue = "";
                }
                fieldPattern = fieldPattern.replace(attributesWithPattern[j], attributeValue);
            }

            // Remove Curly Braces
            patternedValue = fieldPattern.replace(/[{}]/g, '');
        } else {
            let attributeName = DataHelper.readAttributeFromPath(fieldPattern);
            if (attributeName) {
                return DataTransformHelper._getLovAttributeValue(entity, attributeName, lovColumnName, contextData);
            }
        }
    } else {
        patternedValue = entity.name;
    }

    return patternedValue;
};

DataTransformHelper._getLovAttributeValue = function (entity, attributeName, lovColumnName, contextData) {
    let attributeValue = undefined;
    let firstValueContext = undefined;
    if (contextData) {
        firstValueContext = ContextHelper.getFirstValueContext(contextData);
    }

    if (["id", "name"].indexOf(lovColumnName) >= 0) {
        // Properties
        attributeValue = DataHelper.getValue(entity, attributeName);
    } else {
        // Attribute
        let attribute = EntityHelper.getAttribute(entity, attributeName);

        if (lovColumnName === "textColor") {
            return AttributeHelper.getLocaleCoalescePath(attribute) ? "#0bb2e8" : undefined;
        }

        if (lovColumnName === "fontStyle") {
            if (attribute) {
                return (attribute && !_.isEmpty(DataTransformHelper.getContextCoalescePaths(attribute.properties))) ? "italic" : undefined;
            } else {
                return undefined;
            }
        }

        if (lovColumnName === "locale") {
            let localeCoalescePath = AttributeHelper.getLocaleCoalescePath(attribute);
            let locale = firstValueContext ? firstValueContext.locale : "";

            let fallbackLocale = DataHelper.getFallbackLocaleFromCoalescePath(localeCoalescePath);
            if (fallbackLocale) {
                locale = fallbackLocale;
            }

            return locale;
        }

        if (attribute && attribute.values) {

            if (firstValueContext) {
                let contextualValues = AttributeHelper.getAttributeValues(attribute.values, firstValueContext);

                if (contextualValues && contextualValues instanceof Array && contextualValues.length > 0) {
                    attributeValue = contextualValues[0].value;
                }
            }
            if (!attributeValue) {
                attributeValue = AttributeHelper.getFirstAttributeValue(attribute);
            }
        }
    }



    if (!attributeValue) {
        if (!_.isEmpty(entity[attributeName])) {
            attributeValue = entity[attributeName];
        } else if (!_.isEmpty(entity.name)) {
            attributeValue = entity.name;
        }
    }

    return attributeValue;
};

DataTransformHelper.transformEntityModelsToReferenceModels = function (entityModels) {
    let referenceModels = {};
    if (entityModels && entityModels.length > 0) {
        for (let i = 0; i < entityModels.length; i++) {
            let model = entityModels[i];
            if (model.data && model.data.attributes &&
                !DataHelper.isEmptyObject(model.data.attributes) &&
                model.data.attributes instanceof Object) {
                for (let attributeName in model.data.attributes) {
                    let attributeObject = model.data.attributes[attributeName];

                    if (attributeObject &&
                        attributeObject.properties &&
                        attributeObject.properties.isExternalName &&
                        !referenceModels[model.name]) {
                        referenceModels[model.name] = {
                            "externalNameAttribute": attributeName
                        }
                    }
                }
            }
        }
    }

    return referenceModels;
};

DataTransformHelper.prepareEntityForContextSave = async function (data, attributeModels, relationshipModels, contextData) {
    let firstDataContext = ContextHelper.getFirstDataContext(contextData);
    let firstItemContext = ContextHelper.getFirstItemContext(contextData);

    if (data.contexts && data.contexts.length) {
        if (!_.isEmpty(data.contexts[0].attributes)) {
            for (let attrKey in data.attributes) {
                if (!data.contexts[0].attributes[attrKey]) {
                    data.contexts[0].attributes[attrKey] = data.attributes[attrKey];
                }
            }
        } else {
            data.contexts[0].attributes = data.attributes;
        }

        if (!_.isEmpty(data.contexts[0].relationships)) {
            for (let relKey in data.relationships) {
                if (!data.contexts[0].relationships[relKey]) {
                    data.contexts[0].relationships[relKey] = data.relationships[relKey];
                }
            }
        } else {
            data.contexts[0].relationships = data.relationships;
        }
        delete data.attributes;
        delete data.relationships;
    }
};

DataTransformHelper.getContextCoalescePaths = function (properties, dataContext) {
    let contextCoalescePaths = [];

    if (properties) {
        let contextCoalesce = properties.contextCoalesce;
        if (contextCoalesce && contextCoalesce.length) {
            if (contextCoalesce.length == 1 && !DataHelper.compareObjects(dataContext, contextCoalesce[0])) {
                contextCoalesce = contextCoalesce[0];
                let ctxPath = [];
                Object.keys(contextCoalesce).forEach(function (ctx) {
                    if (contextCoalesce[ctx]) {
                        ctxPath.push(contextCoalesce[ctx]);
                    }
                }, this);

                if (ctxPath && ctxPath.length) {
                    contextCoalescePaths.push(ctxPath.join(', '));
                }
            }
        }

        let instanceCoalesce = properties.instanceCoalesce;
        if (instanceCoalesce && instanceCoalesce.length) {
            instanceCoalesce = instanceCoalesce[0];
            if (instanceCoalesce.coalesceSourceName) {
                contextCoalescePaths.push(instanceCoalesce.coalesceSourceName + " (Global)");
            }
        }
    }

    return contextCoalescePaths;
};

DataTransformHelper.transformLocaleEntitiesToLocalesJson = function (entities, localeColumnMapCollection, relationshipType, relationshipAttribute, threshold) {
    if (!_.isEmpty(entities)) {
        let formattedEntities = [];

        for (let i = 0; i < entities.length; i++) {
            let entity = entities[i];

            let formattedEntity = {};
            for (let key in localeColumnMapCollection) {
                formattedEntity[key] = DataTransformHelper.getLovFieldPatternValue(entity, localeColumnMapCollection[key], key);
            }

            if (entity.data && entity.data.relationships && !_.isEmpty(entity.data.relationships[relationshipType])) {
                let relData = entity.data.relationships[relationshipType];
                let fallbackLocales = [];
                for (let j = 0; j < relData.length; j++) {
                    let rel = relData[j];
                    let relToId = rel.relTo.id;
                    let relToEntity = entities.find(entity => entity.id === relToId);
                    let relEntityName = undefined;

                    if (relToEntity) {
                        relEntityName = relToEntity.name;
                    }

                    let relAttributeValue = undefined;
                    if (rel.attributes && rel.attributes[relationshipAttribute]) {
                        relAttributeValue = AttributeHelper.getFirstAttributeValue(rel.attributes[relationshipAttribute]);
                    }
                    /***
                     * Few fallbacklocales relationship between 2 locales may not have fallbackSequence 
                     * attribute. In that case constructing sequence in the order relationships
                     * added as having value for fallbacksequence attribute is not mandatory.
                     * **/
                    relAttributeValue = relAttributeValue || j + 1;

                    if (relEntityName && relAttributeValue && relAttributeValue <= threshold) {
                        let relObj = {
                            "name": relEntityName,
                            "sequence": relAttributeValue
                        };

                        fallbackLocales.push(relObj);
                    }
                }

                fallbackLocales.sort(function (a, b) {
                    return a.sequence - b.sequence;
                });

                formattedEntity["fallbackLocales"] = fallbackLocales;
            }

            formattedEntities.push(formattedEntity);
        }
        return formattedEntities;
    }
};

DataTransformHelper.transformDataToLocaleCoalescedData = async function (data, request) {
    if (!_.isEmpty(data) && !_.isEmpty(data.entities)) {
        let entitiesData = DataHelper.cloneObject(data);
        if (request && request.params && request.params.query && request.params.query.valueContexts && request.params.query.valueContexts.length > 0) {
            //assumption: Assuming request will have only one valueContext globally
            let valContext = request.params.query.valueContexts[0];
            let clonedValCtx = DataHelper.cloneObject(valContext);
            let fallBackLocales = await DataHelper.getFallbackLocalesForLocaleAsync(valContext.locale);
            let defaultLocale = DataHelper.getDefaultLocale();

            if (!_.isEmpty(fallBackLocales)) {
                for (let i = 0; i < entitiesData.entities.length; i++) {
                    let entity = entitiesData.entities[i];
                    if (entity.data) {
                        if (entity.data.attributes) {
                            DataTransformHelper._updateAttributesWithLocaleCoalesceInfo(entity.data.attributes, valContext, clonedValCtx, fallBackLocales);
                        }
                        if (!_.isEmpty(entity.data.contexts)) {
                            for (let k = 0; k < entity.data.contexts.length; k++) {
                                let ctx = entity.data.contexts[k];
                                if (ctx.attributes) {
                                    DataTransformHelper._updateAttributesWithLocaleCoalesceInfo(ctx.attributes, valContext, clonedValCtx, fallBackLocales);
                                }
                            }
                        }
                    }
                }
            }
        }
        return entitiesData;
    }
    return data;
};

DataTransformHelper._updateAttributesWithLocaleCoalesceInfo = function (attributes, valContext, clonedValCtx, fallbackLocales) {
    for (let attributeName in attributes) {
        let attribute = attributes[attributeName];
        if (attribute.values) {
            let attrValues = DataTransformHelper._updateValuesAndLocaleCoalesceInfo(attribute.values, valContext, clonedValCtx, fallbackLocales);
            if (attrValues) {
                attribute.values = attrValues;
            }
        } else if (attribute.group && attribute.group.length > 0) {
            let currentLocaleGroup = DataTransformHelper._updateValuesAndLocaleCoalesceInfo(attribute.group, valContext, clonedValCtx, fallbackLocales);
            if (!_.isEmpty(currentLocaleGroup)) {
                for(let groupIdx = 0; groupIdx < currentLocaleGroup.length; groupIdx++) {
                    let rowAttributes = currentLocaleGroup[groupIdx];
                    DataTransformHelper._updateAttributesWithLocaleCoalesceInfo(rowAttributes, valContext, clonedValCtx, fallbackLocales);
                }
                attribute.group = currentLocaleGroup;
            }
        }
    }
};

DataTransformHelper._updateValuesAndLocaleCoalesceInfo = function (values, valContext, clonedValCtx, fallbackLocales) {
    let _values = DataHelper.cloneObject(values);
    let defaultLocale = DataHelper.getDefaultLocale();
    let isReferenceData = false;
    let attrValues = [];
    if (!_.isEmpty(_values) && _values.length > 0) {
        if (_values[0] && _values[0].properties && _values[0].properties.referenceData) {
            isReferenceData = true;
        }
    }

    if (!fallbackLocales.find(v => v.name == defaultLocale)) {
        fallbackLocales.push({
            "name": defaultLocale
        });
    }

    if (isReferenceData) {
        let locales = [{ name: valContext.locale }];
        let fallbackLocaleObj = {};
        let _filteredLocale;
        if (fallbackLocales && fallbackLocales.length > 0) {
            for (let i = 0; i < fallbackLocales.length; i++) {
                if (fallbackLocales[i].name != valContext.locale) {
                    fallbackLocales[i]["index"] = i;
                    locales.push(fallbackLocales[i])
                }
            }
        }

        let invalidValues = [];
        for (let i = locales.length - 1; i > -1; i--) {
            _filteredLocale = _values.filter(value => value.locale === locales[i].name);
            if (_filteredLocale && _filteredLocale.length > 0) {
                for (let j = 0; j < _filteredLocale.length; j++) {
                    let filteredLocaleObj = _filteredLocale[j];
                    let existingCol = filteredLocaleObj.locale;
                    if (existingCol != valContext.locale) {
                        filteredLocaleObj["localeCoalesce"] = existingCol;
                        filteredLocaleObj["fallbackLocaleIndex"] = locales[i]["index"];
                    }
                    if(filteredLocaleObj.properties && filteredLocaleObj.properties.referenceData) {
                        let _referenceData = filteredLocaleObj.properties.referenceData;
                        fallbackLocaleObj[_referenceData] = filteredLocaleObj;
                    } else {
                        invalidValues.push(filteredLocaleObj);
                    }
                }
            }
        }

        let output = [];
        let _fallbackLocale = {}
        for (_fallbackLocale in fallbackLocaleObj) {
            _fallbackLocale = fallbackLocaleObj[_fallbackLocale];
            if (_fallbackLocale && _fallbackLocale['localeCoalesce']) {
                DataTransformHelper._updateValueContextAndLocaleCoalesceInfo(_fallbackLocale, valContext, fallbackLocales, _fallbackLocale["fallbackLocaleIndex"])
                delete _fallbackLocale["fallbackLocaleIndex"];
                delete _fallbackLocale['localeCoalesce'];
            }
            output.push(_fallbackLocale);
        }

        if(!_.isEmpty(invalidValues)) {
            output = output.concat(invalidValues);
        }
        attrValues = output;
    } else {
        attrValues = _values.filter(value => value.locale === valContext.locale);
        if (_.isEmpty(attrValues)) {
            for (let j = 0; j < fallbackLocales.length; j++) {
                let fbl = fallbackLocales[j].name;
                clonedValCtx.locale = fbl;
                attrValues = _values.filter(value => value.locale === clonedValCtx.locale);
                if (!_.isEmpty(attrValues)) {
                    for (let x = 0; x < attrValues.length; x++) {
                        let val = attrValues[x];
                        DataTransformHelper._updateValueContextAndLocaleCoalesceInfo(val, valContext, fallbackLocales, j);
                    }
                    break;
                }
                else {
                    continue;
                }
            }
        }
    }

    if (valContext.locale != defaultLocale) {
        let defaultValues = values.filter(value => value.locale === defaultLocale);

        if (defaultValues) {
            attrValues = attrValues.concat(defaultValues);
        }
    }
    return attrValues;
};

DataTransformHelper._updateValueContextAndLocaleCoalesceInfo = function (value, valContext, fallbackLocales, localeIndex) {
    AttributeHelper.populateValueContext(value, valContext);
    value.properties = value.properties || {};
    value.properties["localeCoalescePath"] = DataHelper.buildLocaleCoalescePath(valContext.locale, fallbackLocales, localeIndex);
    value.properties["localeCoalescePathExternalName"] = DataHelper.buildLocaleCoalescePathExternalname(value.properties["localeCoalescePath"]);
};

DataTransformHelper.transformDataToContextCoalescedData = function (data, request) {
    if (!_.isEmpty(data) && !_.isEmpty(data.entities)) {

        let currentValContext;

        if (DataHelper.isValidObjectPath(request, "params.query.valueContexts.length")) {
            currentValContext = request.params.query.valueContexts[0];
        }

        let entitiesData = DataHelper.cloneObject(data);
        for (let i = 0; i < entitiesData.entities.length; i++) {
            let entity = entitiesData.entities[i];
            if (entity.data && !_.isEmpty(entity.data.contexts)) {
                for (let k = 0; k < entity.data.contexts.length; k++) {
                    let ctx = entity.data.contexts[k];
                    if (!_.isEmpty(ctx.attributes)) {
                        DataTransformHelper._updateAttributesWithContextCoalesce(ctx.attributes, currentValContext);
                    }
                    if (!_.isEmpty(ctx.relationships)) {
                        DataTransformHelper._updateRelationshipsWithContextCoalesce(ctx.relationships);
                    }
                }
            }
        }

        return entitiesData;
    }
};

DataTransformHelper._updateAttributesWithContextCoalesce = function (attributes, currentValContext) {
    Object.keys(attributes).forEach(function (attrName) {
        let attribute = attributes[attrName];
        attribute.properties = attribute.properties || {};
        let valueWithContextCoalesce;
        let valueWithInstanceCoalesce;
        let currentLocaleValues;

        if (!_.isEmpty(attribute.values)) {
            currentLocaleValues = DataTransformHelper._getCurrentLocaleValues(attribute.values, currentValContext)
        }

        if (!_.isEmpty(attribute.group)) {
            currentLocaleValues = DataTransformHelper._getCurrentLocaleValues(attribute.group, currentValContext)
        }

        if (!_.isEmpty(currentLocaleValues)) {
            DataTransformHelper._updateValuesWithContextCoalesce(currentLocaleValues);
            valueWithContextCoalesce = currentLocaleValues.find(value => value.contextCoalesce !== undefined);
            valueWithInstanceCoalesce = currentLocaleValues.find(value => value.instanceCoalesce !== undefined);

            if (valueWithContextCoalesce) {
                attribute.properties["contextCoalesce"] = valueWithContextCoalesce.contextCoalesce;
            }
            if (valueWithInstanceCoalesce) {
                attribute.properties["instanceCoalesce"] = valueWithInstanceCoalesce.instanceCoalesce;
            }
        }
    });
};

DataTransformHelper._getCurrentLocaleValues = function (values, currentValContext) {
    let currentLocaleValues;

    if (!_.isEmpty(currentValContext) && currentValContext.locale) {
        currentLocaleValues = values.filter(v => v.locale == currentValContext.locale);
    }

    if (_.isEmpty(currentLocaleValues)) {
        currentLocaleValues = values;
    }

    return currentLocaleValues;
}

DataTransformHelper._updateRelationshipsWithContextCoalesce = function (relationships) {
    Object.keys(relationships).forEach(function (relName) {
        let relationship = relationships[relName];
        if (relationship.length > 0) {
            for (let i = 0; i < relationship.length; i++) {
                let relObj = relationship[i];
                let contextCoalesce = [];
                relObj.properties = relObj.properties || {};
                if ((relObj.os === "contextCoalesce" || relObj.os === "instanceCoalesce") && relObj.osctxpath) {
                    let ctxCoalesceObj = DataTransformHelper._parseOsCtxPath(relObj.osctxpath);
                    if (!_.isEmpty(ctxCoalesceObj)) {
                        contextCoalesce.push(ctxCoalesceObj);
                        relObj.properties[relObj.os] = contextCoalesce;
                    }
                }
            }
        }
    });
};

DataTransformHelper._updateValuesWithContextCoalesce = function (values) {
    for (let i = 0; i < values.length; i++) {
        let contextCoalesce = [];
        let value = values[i];
        if ((value.os === "contextCoalesce" || value.os === "instanceCoalesce") && value.osctxpath) {
            let ctxCoalesceObj = DataTransformHelper._parseOsCtxPath(value.osctxpath);
            if (!_.isEmpty(ctxCoalesceObj)) {
                contextCoalesce.push(ctxCoalesceObj);
                value[value.os] = contextCoalesce;
            }
        }
    }
};

DataTransformHelper._parseOsCtxPath = function (ctxPath) {
    let ctxPaths = ctxPath.split("##");
    let ctxCoalesceObj = {};
    if (ctxPaths.length > 0) {
        for (let i = 0; i < ctxPaths.length; i++) {
            let path = ctxPaths[i];
            let paths = path.split("@@");
            if (paths.length === 2) {
                ctxCoalesceObj[paths[0]] = paths[1].toLowerCase() == "self" ? "Global" : paths[1];
            }
        }
    }

    return ctxCoalesceObj;
};
