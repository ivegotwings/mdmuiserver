'use strict';

var DataObjectFalcorUtil = function () { };
const CONTEXT_KEY_DEFAULT_VAL = 'xzx';
const CONST_ANY = '_ANY';
const CONST_ALL = '_ALL';

DataObjectFalcorUtil.getPathKeys = function () {
    return {
        "root": "root",
        "byIds": "byIds",
        "searchResults": "searchResults",
        "searchResultItems": "items",
        "dataIndexInfo": {
            "entityData": {
                "name": "entity",
                "collectionName": "entities",
                "responseObjectName": "response"
            },
            "entityGovernData": {
                "name": "entityGovernData",
                "collectionName": "entities",
                "responseObjectName": "response"
            },
            "entityModel": {
                "name": "entityModel",
                "collectionName": "entityModels",
                "responseObjectName": "response"
            },
            "config": {
                "name": "config",
                "collectionName": "configObjects",
                "responseObjectName": "response"
            }
        }
    };
};

const pathKeys = DataObjectFalcorUtil.getPathKeys();

DataObjectFalcorUtil.getSelfCtx = function () {
    return { 'self': 1 };
};

const selfCtx = DataObjectFalcorUtil.getSelfCtx();

DataObjectFalcorUtil.boxDataObject = function (dataObject, boxOp) {
    var modDataObject = {};

    for (var dataObjectFieldKey in dataObject) {
        if (dataObjectFieldKey === "data") {
            if(dataObject && dataObject.data) {
                var data = dataObejct.data;
                var modData = {};

                if(data.attributes) {
                    modData.attributes = DataObjectFalcorUtil.boxAttributesData(data.attributes, boxOp);
                }

                if(data.relationships) {
                    modData.relationships = DataObjectFalcorUtil.boxRelationshipsData(data.relationships, boxOp);
                }

                if(data.properties) {
                    modData.properties = boxOp(data.properties);
                }

                if (data.contexts) {
                    var modContexts = [];
                    for (var i = 0; i < data.contexts.length; i++) {
                        var ctxItem = data.contexts[i];
                        var modAttrs = DataObjectFalcorUtil.boxAttributesData(ctxItem.attributes, boxOp);
                        var modRelationships = DataObjectFalcorUtil.boxRelationshipsData(ctxItem.relationships, boxOp);
                        var modProperties = boxOp(ctxItem.properties);

                        modContexts.push({ "context": ctxItem.context, "attributes": modAttrs, "relationships": modRelationships, "properties": modProperties });
                    }

                    modData.contexts = modContexts;
                }

                modDataObject.data = modData;
            }
        }
        else {
            if (!isEmpty(dataObject[dataObjectFieldKey])) {
                modDataObject[dataObjectFieldKey] = boxOp(dataObject[dataObjectFieldKey]);
            }
        }
    }

    //console.log('boxedDataObject ', modDataObject);
    return modDataObject;
};

DataObjectFalcorUtil.boxAttributesData = function (attrs, boxOp) {
    if (!attrs) {
        return;
    }

    var modAttrs = {};

    for (var attrId in attrs) {
        var modAttr = DataObjectFalcorUtil.cloneObject(attrs[attrId]);

        for (var valIndex in modAttr.values) {
            var val = modAttr.values[valIndex];

            if (val && val.name !== undefined) {
                delete val.name; // if name is coming as field inside val
            }
        }

        modAttr.values = boxOp(modAttr.values);
        
        if(modAttr.properties) {
            modAttr.properties = boxOp(modAttr.properties);
        }

        modAttrs[attrId] = modAttr;
    }

    return modAttrs;
};

DataObjectFalcorUtil.boxRelationshipsData = function (relationships, boxOp) {
    if (!relationships) {
        return;
    }

    var modRelationships = {};

    for (var relTypeIdx in relationships) {
        var modRelTypeObj = DataObjectFalcorUtil.cloneObject(relationships[relTypeIdx]);

        for (var relId in modRelTypeObj) {
            var rel = modRelTypeObj[relId];

            for (var relObjKey in rel) {
                if (relObjKey === "attributes") {
                    rel[relObjKey] = DataObjectFalcorUtil.boxAttributesData(rel[relObjKey], boxOp);
                }
                else {
                    rel[relObjKey] = boxOp(rel[relObjKey]);
                }
            }
        }

        modRelationships[relTypeIdx] = modRelTypeObj;
    }

    return modRelationships;
};

DataObjectFalcorUtil.boxJsonObject = function (obj) {
    return { '$type': "atom", 'value': obj };
};

DataObjectFalcorUtil.unboxJsonObject = function (obj) {
    if (obj && obj.$type) {
        return obj.value;
    } else {
        return obj;
    }
};

DataObjectFalcorUtil.transformToExternal = function (dataObject) {

    //console.log('transform dataObject input:', JSON.stringify(dataObject));

    var transDataObject = {};

    if (isEmpty(dataObject)) {
        return transDataObject;
    }

    for (var dataObjectField in dataObject) {
        if (dataObjectField != 'data') {
            transDataObject[dataObjectField] = dataObject[dataObjectField];
        }
    }

    //TODO: AS OF NOW, API is not processing properties so blank it out :)
    transDataObject.properties = {};

    var contexts = [];

    if (dataObject.data && dataObject.data.contexts) {

        var transContexts = [];
        var selfCtxItem = {};
        var ctxKeys = Object.keys(dataObject.data.contexts);

        if (ctxKeys && ctxKeys.length) {
            for (var i = 0; i < ctxKeys.length; i++) {
                var ctxKey = ctxKeys[i];
                var transContextsItem = {};

                var context = DataObjectFalcorUtil.createCtxItem(ctxKey);

                transContextsItem.context = context;

                var enContexts = dataObject.data.contexts[ctxKey];

                if (enContexts.attributes) {
                    transContextsItem.attributes = DataObjectFalcorUtil.transformAttributesToExternal(enContexts.attributes);
                }

                if (enContexts.relationships) {
                    transContextsItem.relationships = DataObjectFalcorUtil.transformRelationshipsToExternal(enContexts.relationships);
                }

                if (transContextsItem.attributes && transContextsItem.attributes.properties) {
                    transContextsItem.properties = DataObjectFalcorUtil.transformPropertiesToExternal(transContextsItem.attributes.properties);
                    delete transContextsItem.attributes.properties;
                }

                if (enContexts.jsonData) {
                    transContextsItem.jsonData = enContexts.jsonData;
                }

                if (context.self) {
                    selfCtxItem = transContextsItem;
                }
                else {
                    transContexts.push(transContextsItem);
                }
            }
        }

        var transData = {};
        transData.contexts = transContexts;

        if (!isEmpty(selfCtxItem)) {
            transData.attributes = selfCtxItem.attributes;
            transData.relationships = selfCtxItem.relationships;
            transData.properties = selfCtxItem.properties;
            transData.jsonData = selfCtxItem.jsonData;
        }

        transDataObject.data = transData;
    }

    return transDataObject;
};

DataObjectFalcorUtil.transformAttributesToExternal = function (attributes) {
    var transAttributes = {};

    if (isEmpty(attributes)) {
        return transAttributes;
    }

    for (var attrKey in attributes) {
        var attr = attributes[attrKey];
        var attrValContexts = attr.valContexts;

        if (!attrValContexts) {
            continue;
        }

        var valCtxKeys = Object.keys(attrValContexts);
        if (valCtxKeys && valCtxKeys.length) {
            for (var i = 0; i < valCtxKeys.length; i++) {
                var valCtxKey = valCtxKeys[i];
                var attrData = attrValContexts[valCtxKey];

                var transAttr = DataObjectFalcorUtil.getOrCreate(transAttributes, attrKey, {});

                if (attrData) {
                    if (attrData.values) {
                        var transAttrValues = DataObjectFalcorUtil.getOrCreate(transAttr, 'values', []);
                        transAttrValues.push.apply(transAttrValues, attrData.values);
                    }

                    if (attrData.group) {
                        var transAttrGroup = DataObjectFalcorUtil.getOrCreate(transAttr, 'group', []);
                        transAttrGroup.push.apply(transAttrGroup, attrData.group);
                    }

                    if (attrData.properties) {
                        var transAttrProperties = DataObjectFalcorUtil.getOrCreate(transAttr, 'properties', {});
                        transAttrProperties = DataObjectFalcorUtil.mergeObjects(transAttrProperties, attrData.properties);
                    }
                }
            }
        }
    }
    return transAttributes;
};

DataObjectFalcorUtil.transformRelationshipsToExternal = function (relationships) {
    var transRelationships = {};

    if (isEmpty(relationships)) {
        return transRelationships;
    }

    for (var relTypeIdx in relationships) {
        var relTypeObj = relationships[relTypeIdx];
        var relsArray = [];

        for (var relObjKey in relTypeObj.rels) {
            var rel = relTypeObj.rels[relObjKey];

            if (!isEmpty(rel.attributes)) {
                rel.attributes = DataObjectFalcorUtil.transformAttributesToExternal(rel.attributes);
            }

            if (!isEmpty(rel.relTo)) {
                rel.relTo = DataObjectFalcorUtil.transformToExternal(rel.relTo);
            }

            relsArray.push(rel);
        }

        transRelationships[relTypeIdx] = relsArray;
    }

    return transRelationships;
};

DataObjectFalcorUtil.transformPropertiesToExternal = function (properties) {
    var transProperties = {};

    if (isEmpty(properties)) {
        return transProperties;
    }

    for (var propKey in properties.properties) {
        var property = properties.properties[propKey];

        transProperties[propKey] = DataObjectFalcorUtil.cloneObject(property);
    }

    return transProperties;
};

DataObjectFalcorUtil.getOrCreate = function (obj, key, defaultVal) {
    var keyObj = obj[key];

    if (keyObj === undefined) {
        keyObj = defaultVal;
        obj[key] = keyObj;
    }

    return keyObj;
};

DataObjectFalcorUtil.mergeObjects = function (obj1, obj2) {
    return Object.assign(obj1, obj2);
};

DataObjectFalcorUtil.mergeObjectsNoOverride = function (target, source, addMissing = false) {

    if (!target) {
        if (addMissing) {
            target = {};
        }
        else {
            return target;
        }
    }

    if (!source) {
        return target;
    }

    for (var targetObjKey in target) {
        var targetObj = target[targetObjKey];
        var sourceObj = source[targetObjKey];

        if (sourceObj) {
            targetObj = DataObjectFalcorUtil.deepAssign(targetObj, sourceObj);
        }
    }

    if (addMissing) {
        for (var sourceObjKey in source) {
            var sourceObj = source[sourceObjKey];

            var targetObj = target[sourceObjKey];

            if (!targetObj) {
                target[sourceObjKey] = sourceObj;
            }
        }
    }

    return target;
};

DataObjectFalcorUtil.mergeArraysNoOverride = function (target, source, identifierKey, addMissing = false) {

    if (!target) {
        if (addMissing) {
            target = [];
        }
        else {
            return target;
        }
    }

    if (!source) {
        return target;
    }

    for (var targetObjIdx in target) {
        var targetObj = target[targetObjIdx];
        var sourceObj = source.find(obj => obj[identifierKey] == targetObj[identifierKey]);

        if (sourceObj) {
            targetObj = DataObjectFalcorUtil.deepAssign(targetObj, sourceObj);
        }
    }

    if (addMissing) {
        for (var sourceObjIdx in source) {
            var sourceObj = source[sourceObjIdx];

            var targetObj = target.find(obj => obj.id == sourceObj.id);

            if (!targetObj) {
                target.push(sourceObj)
            }
        }
    }

    return target;
};

DataObjectFalcorUtil.sortObject = function (object) {
    if (isEmpty(object)) {
        return object;
    }

    var sortedObj = {},
        keys = Object.keys(object);

    keys.sort(function (key1, key2) {
        key1 = key1.toLowerCase(), key2 = key2.toLowerCase();
        if (key1 < key2) return -1;
        if (key1 > key2) return 1;
        return 0;
    });

    for (var index in keys) {
        var key = keys[index];
        if (typeof object[key] == 'object' && !(object[key] instanceof Array)) {
            sortedObj[key] = DataObjectFalcorUtil.sortObject(object[key]);
        } else {
            sortedObj[key] = object[key];
        }
    }

    return sortedObj;
};

DataObjectFalcorUtil.createCtxKey = function (ctxItem) {
    var ctxKey = '{}';

    if (!isEmpty(ctxItem)) {
        ctxKey = JSON.stringify(DataObjectFalcorUtil.sortObject(ctxItem));
    }

    return ctxKey;
};

DataObjectFalcorUtil.createCtxKeys = function (ctxItems) {
    var ctxKeys = [];

    if (!isEmpty(ctxItems)) {
        for (var i = 0; i < ctxItems.length; i++) {
            ctxKeys.push(DataObjectFalcorUtil.createCtxKey(ctxItems[i]));
        }
    }
    else {
        ctxKeys.push("{}");
    }

    return ctxKeys;
};

DataObjectFalcorUtil.createEmptyKeyFieldIfMissing = function (obj, key, defaultVal) {
    if (obj && (obj[key] === undefined || isEmpty(obj[key]))) {
        obj[key] = defaultVal;
    }
};

DataObjectFalcorUtil.compareCtx = function (obj1, obj2) {
    return JSON.stringify(DataObjectFalcorUtil.sortObject(obj1)) == JSON.stringify(DataObjectFalcorUtil.sortObject(obj2));
};

DataObjectFalcorUtil.compareObjects = function (obj1, obj2) {
    return JSON.stringify(DataObjectFalcorUtil.sortObject(obj1)) == JSON.stringify(DataObjectFalcorUtil.sortObject(obj2));
}

DataObjectFalcorUtil.createCtxItem = function (ctxKey) {
    return JSON.parse(ctxKey);
};

DataObjectFalcorUtil.createCtxItems = function (ctxKeys) {
    var ctxItems = [];

    if (isEmpty(ctxKeys)) {
        return ctxItems;
    }

    for (var i = 0; i < ctxKeys.length; i++) {
        var ctxKey = ctxKeys[i];
        var ctxItem = DataObjectFalcorUtil.createCtxItem(ctxKey);

        //skip self contexts..
        if (ctxItem.self) {
            continue;
        }

        if (isEmpty(ctxItem)) {
            continue;
        }

        var ctxItemFound = false;
        for (var j = 0; j < ctxItems.length; j++) {
            if (DataObjectFalcorUtil.compareCtx(ctxItems[j], ctxItem)) {
                ctxItemFound = true;
                break;
            }
        }
        if (!ctxItemFound) {
            ctxItems.push(ctxItem);
        }
    }

    return ctxItems;
};

DataObjectFalcorUtil.getCtxItem = function (contexts, context) {
    for (var ctxItemId in contexts) {
        var ctxItem = contexts[ctxItemId];

        var compareResult = DataObjectFalcorUtil.compareCtx(ctxItem.context, context);

        if (compareResult) {
            return ctxItem;
        }
    }

    return undefined;
};

DataObjectFalcorUtil.getAttributesByCtx = function (dataObject, context) {
    if (dataObject && dataObject.data && dataObject.data.contexts && dataObject.data.contexts.length) {
        var ctxItem = DataObjectFalcorUtil.getCtxItem(dataObject.data.contexts, context);
        if (ctxItem) {
            return ctxItem.attributes;
        }
    }

    return {};
};

DataObjectFalcorUtil.getRelationshipsByCtx = function (dataObject, context) {
    if (dataObject && dataObject.data && dataObject.data.contexts && dataObject.data.contexts.length) {
        var ctxItem = DataObjectFalcorUtil.getCtxItem(dataObject.data.contexts, context);
        if (ctxItem) {
            return ctxItem.relationships;
        }
    }

    return {};
};

DataObjectFalcorUtil.cloneObject = function (obj) {
    var clonedObj = {};

    if (obj) {
        clonedObj = JSON.parse(JSON.stringify(obj));
    }

    return clonedObj;
};

DataObjectFalcorUtil.objectHasKeys = function (obj, keys) {
    var next = keys.shift();
    return obj[next] && (!keys.length || DataObjectFalcorUtil.objectHasKeys(obj[next], keys));
};

DataObjectFalcorUtil.getNestedObject = function (obj, keys) {
    var next = keys.shift();

    if (obj !== undefined) {

        var obj = obj[next];

        if (obj !== undefined && keys.length) {
            obj = DataObjectFalcorUtil.getNestedObject(obj, keys);
        }
    }

    return obj;
};

DataObjectFalcorUtil.isObject = function (item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
};

DataObjectFalcorUtil.deepAssign = function (...objs) {
    if (objs.length < 2) {
        throw new Error('Need two or more objects to merge');
    }

    const target = objs[0];
    for (var i = 1; i < objs.length; i++) {
        const source = objs[i];
        Object.keys(source).forEach(prop => {
            const value = source[prop];
            if (DataObjectFalcorUtil.isObject(value)) {
                if (target.hasOwnProperty(prop) && DataObjectFalcorUtil.isObject(target[prop])) {
                    target[prop] = DataObjectFalcorUtil.deepAssign(target[prop], value);
                } else {
                    target[prop] = value;
                }
            } else if (Array.isArray(value)) {
                if (target.hasOwnProperty(prop) && Array.isArray(target[prop])) {
                    const targetArray = target[prop];
                    value.forEach((sourceItem, itemIndex) => {
                        if (itemIndex < targetArray.length) {
                            const targetItem = targetArray[itemIndex];
                            if (Object.is(targetItem, sourceItem)) {
                                return;
                            }

                            if (DataObjectFalcorUtil.isObject(targetItem) && DataObjectFalcorUtil.isObject(sourceItem)) {
                                targetArray[itemIndex] = DataObjectFalcorUtil.deepAssign(targetItem, sourceItem);
                            } else if (Array.isArray(targetItem) && Array.isArray(sourceItem)) {
                                targetArray[itemIndex] = DataObjectFalcorUtil.deepAssign(targetItem, sourceItem);
                            } else {
                                targetArray[itemIndex] = sourceItem;
                            }
                        } else {
                            targetArray.push(sourceItem);
                        }
                    })
                } else {
                    target[prop] = value;
                }
            } else {
                target[prop] = value;
            }
        })
    }

    return target;
};

DataObjectFalcorUtil.test = function () {
    console.log('test success');
};

var SharedUtils = SharedUtils || {};

function isEmpty(obj) {
    //if (obj === undefined) { return true };

    for (var x in obj) { return false; }

    return true;
}

//register as module or as js 
if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = DataObjectFalcorUtil
    }
    exports.DataObjectFalcorUtil = DataObjectFalcorUtil
}
else {
    if (!SharedUtils) {
        SharedUtils = {};
    }
    SharedUtils.DataObjectFalcorUtil = DataObjectFalcorUtil
}

