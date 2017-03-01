'use strict';

var DataObjectFalcorUtil = function () { };
const CONTEXT_KEY_DEFAULT_VAL = 'xzx';
const CONST_ANY = '_ANY';
const CONST_ALL = '_ALL';

DataObjectFalcorUtil.getPathKeys = function () {
    return {
        "root": "dataObjects",
        "masterListById": "masterList",
        "searchResults": "cachedSearchResults",
        "searchResultObjects": "items",
        "objectTypesInfo": {
            "entityData": {
                "name": "entity",
                "typeInfo": "entityInfo",
                "collectionName": "entities",
                "responseObjectName": "entityOperationResponse"
            },
            "entityGovernData": {
                "name": "entityGovernData",
                "typeInfo": "entityGovernInfo",
                "collectionName": "entities",
                "responseObjectName": "entityGovernOperationResponse"
            },
            "entityModel": {
                "name": "entityModel",
                "typeInfo": "entityModelInfo",
                "collectionName": "entityModels",
                "responseObjectName": "entityModelOperationResponse"
            },
            "workflowDefinition": {
                "name": "workflowDefinition",
                "typeInfo": "entityModelInfo",
                "collectionName": "entities",
                "responseObjectName": "entityOperationResponse"
            },
            "workflowRuntimeInstance": {
                "name": "workflowRuntimeInstance",
                "typeInfo": "entityGovernInfo",
                "collectionName": "entities",
                "responseObjectName": "entityOperationResponse"
            }
        }
    };
};

const pathKeys = DataObjectFalcorUtil.getPathKeys();

DataObjectFalcorUtil.boxDataObject = function (dataObject, boxOp) {
    var modDataObject = {};

    for (var dataObjectFieldKey in dataObject) {
        if (dataObjectFieldKey === "data") {
            var modCtxInfo = [];

            for (let ctxItem of dataObject.data.ctxInfo) {
                
                var modAttrs = DataObjectFalcorUtil.boxAttributesData(ctxItem.attributes, boxOp);
                var modRelationships = DataObjectFalcorUtil.boxRelationshipsData(ctxItem.relationships, boxOp);

                modCtxInfo.push({ "ctxGroup": ctxItem.ctxGroup, "attributes": modAttrs, "relationships": modRelationships });
            }

            modDataObject.data = { 'ctxInfo': modCtxInfo };
        }
        else {
            if(!isEmpty(dataObject[dataObjectFieldKey])) {
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

    if(isEmpty(dataObject)) {
        return transDataObject;
    }

    for(var dataObjectField in dataObject) {
        if(dataObjectField != 'data') {
            transDataObject[dataObjectField] = dataObject[dataObjectField];
        }
    }

    //TODO: AS OF NOW, API is not processing properties so blank it out :)
    transDataObject.properties = {};

    var ctxInfo = [];

    if (dataObject.data && dataObject.data.ctxInfo) {
        
        var transCtxInfo = [];
        var ctxKeys = Object.keys(dataObject.data.ctxInfo);
        
        for (let ctxKey of ctxKeys) {
            var transCtxInfoItem = {};

            var ctxGroup = DataObjectFalcorUtil.createCtxItem(ctxKey);
            transCtxInfoItem.ctxGroup = ctxGroup;
            
            var enCtxInfo = dataObject.data.ctxInfo[ctxKey];
            
            if(enCtxInfo.attributes) {
                transCtxInfoItem.attributes = DataObjectFalcorUtil.transformAttributesToExternal(enCtxInfo.attributes);
            }
            
            if(enCtxInfo.relationships) {
                transCtxInfoItem.relationships = DataObjectFalcorUtil.transformRelationshipsToExternal(enCtxInfo.relationships);
            }
            
            transCtxInfo.push(transCtxInfoItem);            
        }

        transDataObject.data = { ctxInfo: transCtxInfo };
    }

    return transDataObject;
};

DataObjectFalcorUtil.transformAttributesToExternal = function(attributes) {
    var transAttributes = {};

    if(isEmpty(attributes)) {
        return transAttributes;
    }

    for(var attrKey in attributes) {
        var attr = attributes[attrKey];
        var attrValCtxInfo = attr.valCtxInfo;

        if(!attrValCtxInfo) {
            continue;
        }

        var valCtxKeys = Object.keys(attrValCtxInfo);
        
        for (let valCtxKey of valCtxKeys) {
            var attrData = attrValCtxInfo[valCtxKey];

            var transAttr = DataObjectFalcorUtil.createAndGet(transAttributes, attrKey, {});
           
            if(attrData) {
                if(attrData.values) {
                    var transAttrValues = DataObjectFalcorUtil.createAndGet(transAttr, 'values', []);
                    transAttrValues.push.apply(transAttrValues, attrData.values);
                }
                else if(attrData.group) {
                    var transAttrGroup = DataObjectFalcorUtil.createAndGet(transAttr, 'group', []);
                    transAttrGroup.push.apply(transAttrGroup, attrData.group);
                }
                if(attrData.properties) {
                    var transAttrProperties = DataObjectFalcorUtil.createAndGet(transAttr, 'properties', {});
                    transAttrProperties.push.apply(transAttrProperties, attrData.properties);
                }
            }
        }
    }
    
    return transAttributes;
};

DataObjectFalcorUtil.createAndGet = function(obj, key, defaultVal) {
    var keyObj = obj[key];

    if(keyObj === undefined) {
        keyObj = defaultVal;
        obj[key] = keyObj;
    }

    return keyObj;
};

DataObjectFalcorUtil.transformRelationshipsToExternal = function(relationships) {
    var transRelationships = {};

    if(isEmpty(relationships)) {
        return transRelationships;
    }

    for (var relTypeIdx in relationships) {
        var relTypeObj = relationships[relTypeIdx];
        var relsArray = [];

        for (var relObjKey in relTypeObj.rels) {
            var rel = relTypeObj.rels[relObjKey];
            rel.attributes = DataObjectFalcorUtil.transformAttributesToExternal(rel.attributes);
            rel.relToObject = DataObjectFalcorUtil.transformToExternal(rel.relToObject);
            relsArray.push(rel);
        }

        transRelationships[relTypeIdx] = relsArray;
    }

    return transRelationships;
};

DataObjectFalcorUtil.sortObject = function(object) {
    if(isEmpty(object)) {
        return object;
    }

    var sortedObj = {},
        keys = Object.keys(object);

    keys.sort(function(key1, key2){
        key1 = key1.toLowerCase(), key2 = key2.toLowerCase();
        if(key1 < key2) return -1;
        if(key1 > key2) return 1;
        return 0;
    });

    for(var index in keys){
        var key = keys[index];
        if(typeof object[key] == 'object' && !(object[key] instanceof Array)){
            sortedObj[key] = DataObjectFalcorUtil.sortObject(object[key]);
        } else {
            sortedObj[key] = object[key];
        }
    }

    return sortedObj;
};

DataObjectFalcorUtil.createCtxKey = function(ctxItem) {
    var ctxKey = '{}';

    if(!isEmpty(ctxItem)) {
        ctxKey = JSON.stringify(DataObjectFalcorUtil.sortObject(ctxItem));
    }

    return ctxKey;
};

DataObjectFalcorUtil.createCtxKeys = function(ctxItems) {
    var ctxKeys = [];

    if(!isEmpty(ctxItems)) {
        for(let ctxItem of ctxItems) {
            ctxKeys.push(DataObjectFalcorUtil.createCtxKey(ctxItem));
        }
    }
    else {
        ctxKeys.push("{}");
    }

    return ctxKeys;
};

DataObjectFalcorUtil.createEmptyKeyFieldIfMissing = function(obj, key, defaultVal) {
    if(obj && (obj[key] === undefined || isEmpty(obj[key]))) {
        obj[key] = defaultVal;
    }
};

DataObjectFalcorUtil.compareCtx = function(obj1, obj2) {
    return JSON.stringify(DataObjectFalcorUtil.sortObject(obj1)) == JSON.stringify(DataObjectFalcorUtil.sortObject(obj2));
};

DataObjectFalcorUtil.createCtxItem = function(ctxKey) {
    return JSON.parse(ctxKey);
};

DataObjectFalcorUtil.createCtxItems = function(ctxKeys) {
    var ctxItems = [];

    if (isEmpty(ctxKeys)) {
        return ctxItems;
    }

    for (let ctxKey of ctxKeys) {
        var ctxItem = DataObjectFalcorUtil.createCtxItem(ctxKey);

        var ctxItemFound = false;
        for(let existingCtxItem of ctxItems) {
            if(DataObjectFalcorUtil.compareCtx(existingCtxItem, ctxItem)) {
                ctxItemFound = true;
                break;
            }
        }

        if(!ctxItemFound) {
            ctxItems.push(ctxItem);
        }
    }

    return ctxItems;
};

DataObjectFalcorUtil.getAttributesByCtx = function (entity, ctx) {
    for (let ctxData of entity.data.ctxInfo) {
        var compareResult = DataObjectFalcorUtil.compareCtx(ctxData.ctxGroup, ctx);
        if (compareResult) {
            return ctxData.attributes;
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

