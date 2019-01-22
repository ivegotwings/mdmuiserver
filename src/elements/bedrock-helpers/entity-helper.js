/*
`bedrock-helpers` Represents a bunch of helpers that any bedrock, pebble, rock or app can use. 
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import './data-helper.js';

import './data-merge-helper.js';
import '../liquid-dataobject-utils/liquid-dataobject-utils.js';
window.EntityHelper = window.EntityHelper || {};

EntityHelper.getAllAttributes = function (entity) {
    let attributes = {};
    if (entity) {
        if (entity.data) {
            if (entity.data.attributes) {
                attributes = DataMergeHelper.mergeAttributes(attributes, entity.data.attributes, true);
            }

            if (entity.data.contexts) {
                entity.data.contexts.forEach(function (element) {
                    if (element && element.attributes) {
                        attributes = DataMergeHelper.mergeAttributes(attributes, element.attributes, true);
                    }
                }, this);
            }
        }
    }

    return attributes;
};

EntityHelper.getAttribute = function (entity, attributeName) {
    let attribute = undefined;
    if (entity) {
        if (entity.data) {
            if (entity.data.contexts) {
                entity.data.contexts.forEach(function (context) {
                    if (!attribute && context && context.attributes) {
                        attribute = context.attributes[attributeName];
                    }
                }, this);
            }

            if (!attribute) {
                if (entity.data.attributes) {
                    attribute = entity.data.attributes[attributeName];
                }
            }
        }
    }

    return attribute;
};

EntityHelper.getattributeBasedOnContext = function (entity, attributeName, dataContext) {
    let attribute;
    let attributes = EntityHelper.getAttributesBasedOnContext(entity, dataContext);

    if(!_.isEmpty(attributes)) {
        attribute = attributes[attributeName]
    }
    return attribute;
};

EntityHelper.getAttributesBasedOnContext = function (entity, dataContext) {
    let attributes = {};
    if (entity && entity.data) {
        if (_.isEmpty(dataContext)) {
            if (entity.data.attributes) {
                attributes = entity.data.attributes;
            }
        } else {
            if (entity.data.contexts) {
                attributes = SharedUtils.DataObjectFalcorUtil.getAttributesByCtx(entity, dataContext);
            }
        }
    }

    return attributes;
};

EntityHelper.getRelationshipsBasedOnContext = function (entity, dataContext, isSelfContext) {
    let relationships = {};
    if (entity && entity.data) {
        if (isSelfContext) {
            if (entity.data.relationships) {
                relationships = entity.data.relationships;
            }
        } else {
            if (!_.isEmpty(dataContext)) {
                if (entity.data.contexts) {
                    relationships = SharedUtils.DataObjectFalcorUtil.getRelationshipsByCtx(entity, dataContext);
                }

            }
        }
    }

    return relationships;
};

EntityHelper.getRelationshipByRelationshipType = function (entity, dataContext, relationshipType) {
    let relationships = [];
    if (entity) {
        if (_.isEmpty(dataContext)) {
            if (!entity.data) {
                entity.data = EntityHelper.getEmptyRelationshipDataObject({}, relationshipType);
            }

            if ("data" in entity && !_.isEmpty(entity.data.relationships)) {
                if (relationshipType in entity.data.relationships) {
                    relationships = entity.data.relationships[relationshipType];
                } else {
                    relationships = entity.data.relationships[relationshipType] = [];
                }
            } else {
                entity.data.relationships = {};
                relationships = entity.data.relationships[relationshipType] = [];
            }

        } else {
            if (!entity.data) {
                entity.data = EntityHelper.getEmptyRelationshipDataObject(dataContext, relationshipType);
            }

            let contexts = entity.data.contexts;
            if (contexts && contexts.length) {
                contexts.forEach(function (item) {
                    if (item) {
                        if ("relationships" in item && relationshipType in item.relationships) {
                            relationships = item.relationships[relationshipType];
                        } else {
                            item.relationships = {};
                            relationships = item.relationships[relationshipType] = [];
                        }
                    }
                }, this);
            } else {
                entity.data.contexts = [{
                    "context": dataContext,
                    "relationships": {}
                }]
                relationships = entity.data.contexts[0].relationships[relationshipType] = [];
            }
        }
    }
    return relationships;
};

// This code has to be removed after completing add assets relationship in a context.
EntityHelper.getRelationshipByType = function (entity, dataContext, relationshipType, isSelfContext) {
    let relationships = [];
    if (entity) {
        if (isSelfContext) {
            if (!entity.data) {
                entity.data = EntityHelper.getEmptyRelationshipDataObject({}, relationshipType);
            }

            if (entity.data.relationships) {
                if (entity.data.relationships[relationshipType]) {
                    relationships = entity.data.relationships[relationshipType];
                } else {
                    relationships = entity.data.relationships[relationshipType] = [];
                }
            } else {
                entity.data.relationships = {};
                relationships = entity.data.relationships[relationshipType] = [];
            }

        } else {
            if (!entity.data) {
                entity.data = EntityHelper.getEmptyRelationshipDataObject(dataContext, relationshipType);
            }

            let contexts = entity.data.contexts;
            if (contexts && contexts.length) {
                contexts.forEach(function (item) {
                    if (item) {
                        item.attributes = {};
                        relationships = item.relationships[relationshipType];

                        if (_.isEmpty(relationships)) {
                            item.relationships[relationshipType] = [];
                            relationships = item.relationships[relationshipType];
                        }
                    }
                }, this);
            } else {
                entity.data.contexts = [];
                entity.data.contexts.push({ "context": dataContext });
                entity.data.contexts[0].relationships = {};
                entity.data.contexts[0].relationships[relationshipType] = [];
                relationships = entity.data.contexts[0].relationships[relationshipType];
            }
        }
    }
    return relationships;
};

EntityHelper.getCoalescedRelationshipByType = function (entity, dataContext, relationshipType) {
    let firstDataContext = ContextHelper.getFirstDataContext(dataContext);
    let coalescedRelationships = [];

    if (entity && entity.data) {
        let data = entity.data;

        if (!_.isEmpty(firstDataContext)) {
            if (!_.isEmpty(data.contexts) && !_.isEmpty(data.contexts[0].relationships)) {
                let contextualRelationships = data.contexts[0].relationships[relationshipType];

                if (!_.isEmpty(coalescedRelationships)) {
                    contextualRelationships.forEach(function (ctxRel) {
                        if (ctxRel) {
                            let indexOfExistingRel = coalescedRelationships.findIndex(rel => rel.relTo.id == ctxRel.relTo.id);

                            if (indexOfExistingRel > -1) {
                                coalescedRelationships[indexOfExistingRel] = ctxRel;
                            } else {
                                coalescedRelationships.push(ctxRel);
                            }
                        }
                    }, this);
                } else {
                    coalescedRelationships = contextualRelationships;
                }
            }
        } else if (!_.isEmpty(data.relationships)) {
            coalescedRelationships = entity.data.relationships[relationshipType];
        }
    }

    return coalescedRelationships;
};

EntityHelper.getEmptyRelationshipDataObject = function (dataContext, relationship) {

    let relationships = {};

    relationships[relationship] = [];

    if (!_.isEmpty(dataContext)) {
        return {
            "contexts": [{
                "context": dataContext,
                "relationships": relationships
            }]
        }
    } else {
        return {
            "relationships": relationships
        }
    }
};

EntityHelper.getAttributeNamesFromEntities = function (entities, noOfRowsToRead) {
    let loopThroughLength = entities.length;
    if (noOfRowsToRead && typeof (noOfRowsToRead) == 'number') {
        loopThroughLength = noOfRowsToRead;
    }
    let attributeNames = [];
    for (let i = 0; i < loopThroughLength; i++) {
        if (entities[i]) {
            let entity = entities[i];
            let attributes = EntityHelper.getAllAttributes(entity);
            let keys = Object.keys(attributes);
            if (keys && keys.length > 0) {
                for (let j = 0; j < keys.length; j++) {
                    if (attributeNames.indexOf(keys[j]) === -1) {
                        let hasValue = attributes[keys[j]].values && attributes[keys[j]].values.length > 0 && (attributes[keys[j]].values[0].value || attributes[keys[j]].values[0].action == "delete") ? true : false;
                        let hasGroup = attributes[keys[j]].group && attributes[keys[j]].group.length > 0 ? true : false;
                        if (hasValue || hasGroup) {
                            attributeNames.push(keys[j]);
                        }
                    }
                }
            }
        }
    }
    return attributeNames;
};

EntityHelper.getContextsFromEntities = function (entities, noOfRowsToRead) {
    let loopThroughLength = entities.length;
    if (noOfRowsToRead && typeof (noOfRowsToRead) == 'number') {
        loopThroughLength = noOfRowsToRead;
    }
    let contexts = [];
    for (let i = 0; i < loopThroughLength; i++) {
        if (entities[i]) {
            let entity = entities[i];
            if (entity && entity.data && entity.data.contexts) {
                let entityContexts = entity.data.contexts;
                if (entityContexts && entityContexts.length > 0) {
                    for (let j = 0; j < entityContexts.length; j++) {
                        if (entityContexts[j] && entityContexts[j].context) {
                            let entityContext = entityContexts[j].context;
                            if (!DataHelper.containsObject(entityContext, contexts)) {
                                contexts.push(entityContext);
                            }
                        }
                    }
                }
            }
        }
    }
    return contexts;
};

EntityHelper.isAllEntitiesOfSameType = function (entities, type) {
    if (_.isEmpty(entities) || !type) {
        return false;
    }
    return _.every(entities, function (entity) {
        return entity.type == type;
    })
};
EntityHelper.getEntityImageObject = function(entity, thumbnailIdentifier, contextData) {
    let imageSourceObject = {};
    let imageSrcValue;
    // Show the image from the selcted context and if only one context is selected
    if(entity.data && !_.isEmpty(entity.data.contexts) && entity.data.contexts.length == 1){
        let dataContexts = ContextHelper.getDataContexts(contextData);
        let thumbnailObject = EntityHelper.getattributeBasedOnContext(entity,thumbnailIdentifier,dataContexts[0]);
        if(thumbnailObject && thumbnailObject.values){
            imageSrcValue = AttributeHelper.getAttributeValues(thumbnailObject.values);
        }
    }
    else{
        //Show the image if its not found in the current context
        if(entity && entity.data && !_.isEmpty(entity.data.attributes)) {
            imageSrcValue = AttributeHelper.getFirstAttributeValue(entity.data.attributes[thumbnailIdentifier]);
        }
    }
    if(_.isEmpty(imageSrcValue)){
        //Show the image if its not found in the context attribute and self level attribute
        if(entity && entity.properties && entity.properties[thumbnailIdentifier]){
            imageSrcValue = entity.properties[thumbnailIdentifier];
        }
    }
    
    if(!_.isEmpty(imageSrcValue)){
        let value = _.isArray(imageSrcValue) ? imageSrcValue[0] : imageSrcValue;
        //Image attribute can contain thumbnail ID or public URL
        if(DataHelper.isPublicUrl(value)){
            imageSourceObject = {value:value, isPublicUrl: true};
        }
        else{
            imageSourceObject = {value:value, isPublicUrl: false};
        }
    }
    return imageSourceObject;
};
