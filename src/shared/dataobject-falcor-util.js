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
                "typeInfo": "entityInfo",
                "typeName": "entityType",
                "collectionName": "entities",
                "responseObjectName": "entityOperationResponse"
            },
            "entityGovernData": {
                "name": "entityGovernData",
                "typeInfo": "entityGovernInfo",
                "typeName": "entityGovernType",
                "collectionName": "entities",
                "responseObjectName": "entityGovernOperationResponse"
            },
            "entityModel": {
                "name": "entityModel",
                "typeInfo": "entityModelInfo",
                "typeName": "entityModelType",
                "collectionName": "entityModels",
                "responseObjectName": "entityModelOperationResponse"
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
            var modCtxInfo = [];
            if (dataObject && dataObject.data && dataObject.data.ctxInfo) {
                for (var i = 0; i < dataObject.data.ctxInfo.length; i++) {
                    var ctxItem = dataObject.data.ctxInfo[i];
                    var modAttrs = DataObjectFalcorUtil.boxAttributesData(ctxItem.attributes, boxOp);
                    var modRelationships = DataObjectFalcorUtil.boxRelationshipsData(ctxItem.relationships, boxOp);

                    modCtxInfo.push({ "ctxGroup": ctxItem.ctxGroup, "attributes": modAttrs, "relationships": modRelationships });
                }
            }
            modDataObject.data = { 'ctxInfo': modCtxInfo };

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

    var ctxInfo = [];

    if (dataObject.data && dataObject.data.ctxInfo) {

        var transCtxInfo = [];
        var selfCtxItem = {};
        var ctxKeys = Object.keys(dataObject.data.ctxInfo);

        if (ctxKeys && ctxKeys.length) {
            for (var i = 0; i < ctxKeys.length; i++) {
                var ctxKey = ctxKeys[i];
                var transCtxInfoItem = {};

                var ctxGroup = DataObjectFalcorUtil.createCtxItem(ctxKey);

                transCtxInfoItem.ctxGroup = ctxGroup;

                var enCtxInfo = dataObject.data.ctxInfo[ctxKey];

                if (enCtxInfo.attributes) {
                    transCtxInfoItem.attributes = DataObjectFalcorUtil.transformAttributesToExternal(enCtxInfo.attributes);
                }

                if (enCtxInfo.relationships) {
                    transCtxInfoItem.relationships = DataObjectFalcorUtil.transformRelationshipsToExternal(enCtxInfo.relationships);
                }

                if (transCtxInfoItem.attributes && transCtxInfoItem.attributes.properties) {
                    transCtxInfoItem.properties = DataObjectFalcorUtil.transformPropertiesToExternal(transCtxInfoItem.attributes.properties);
                    delete transCtxInfoItem.attributes.properties;
                }

                if (ctxGroup.self) {
                    selfCtxItem = transCtxInfoItem;
                }
                else {
                    transCtxInfo.push(transCtxInfoItem);
                }
            }
        }

        var transData = {};
        transData.ctxInfo = transCtxInfo;

        if (!isEmpty(selfCtxItem)) {
            transData.attributes = selfCtxItem.attributes;
            transData.relationships = selfCtxItem.relationships;
            transData.properties = selfCtxItem.properties;
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
        var attrValCtxInfo = attr.valCtxInfo;

        if (!attrValCtxInfo) {
            continue;
        }

        var valCtxKeys = Object.keys(attrValCtxInfo);
        if (valCtxKeys && valCtxKeys.length) {
            for (var i = 0; i < valCtxKeys.length; i++) {
                var valCtxKey = valCtxKeys[i];
                var attrData = attrValCtxInfo[valCtxKey];

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

        //skip self ctx..
        if (ctxItem.self) {
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

DataObjectFalcorUtil.getAttributesByCtx = function (entity, ctx) {
    if (entity && entity.data && entity.data.ctxInfo && entity.data.ctxInfo.length) {
        for (var i = 0; i < entity.data.ctxInfo.length; i++) {
            var ctxData = entity.data.ctxInfo[i];
            var compareResult = DataObjectFalcorUtil.compareCtx(ctxData.ctxGroup, ctx);
            if (compareResult) {
                return ctxData.attributes;
            }
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
    var obj = obj[next];

    if (obj !== undefined && keys.length) {
        obj = DataObjectFalcorUtil.getNestedObject(obj, keys);
    }

    return obj;
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

