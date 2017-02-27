'use strict';

var DataObjectFalcorUtil = function () { };
const CONTEXT_KEY_SEPERATOR = "#@#";
const CONTEXT_KEY_FIELD_SEPERATOR = "q2z";
const CONTEXT_KEY_DEFAULT_VAL = 'xzx';

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
            var modCtxInfo = {};

            for (var ctxKey in dataObject.data.ctxInfo) {
                var enCtxInfo = dataObject.data.ctxInfo[ctxKey];

                var modAttrs = DataObjectFalcorUtil.boxAttributesData(enCtxInfo.attributes, boxOp);
                var modRelationships = DataObjectFalcorUtil.boxRelationshipsData(enCtxInfo.relationships, boxOp);

                modCtxInfo[ctxKey] = { "attributes": modAttrs, "relationships": modRelationships };
            }

            modDataObject.data = { 'ctxInfo': modCtxInfo };
        }
        else {
            modDataObject[dataObjectFieldKey] = boxOp(dataObject[dataObjectFieldKey]);
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

        for (var relId in modRelTypeObj.rels) {
            var rel = modRelTypeObj.rels[relId];

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

DataObjectFalcorUtil.transformToExternal = function (objType, dataObject) {
    var transformedDataObject = {};

    var objTypeInfoKey = pathKeys.objectTypesInfo[objType].typeInfo;

    transformedDataObject.id = dataObject.id;
    transformedDataObject[objTypeInfoKey] = dataObject[objTypeInfoKey];
    transformedDataObject.systemInfo = dataObject.systemInfo;
    transformedDataObject.properties = dataObject.properties;

    //TODO: AS OF NOW, API is not processing properties so blank it out :)
    transformedDataObject.properties = {};

    var ctxInfo = [];

    if (dataObject.data && dataObject.data.ctxInfo) {
        var ctxKeys = Object.keys(dataObject.data.ctxInfo);

        var ctxInfoItems = DataObjectFalcorUtil.createCtxInfo(ctxKeys);

        var enCtxInfoItems = [];

        for (let ctxGroup of ctxInfoItems.ctx) {
            for (let valCtxGroup of ctxInfoItems.valCtx) {
                var currCtxKey = DataObjectFalcorUtil.createCtxKey(ctxGroup, valCtxGroup);

                var transCtxInfoItem = {};
                transCtxInfoItem['ctxGroup'] = ctxGroup;
                var enCtxInfo = dataObject.data.ctxInfo[ctxKey];

                var attrNames = Object.keys(enCtxInfo.attributes);
                var attributes = enCtxInfo.attributes;
                
                if (!isEmpty(attributes)) {
                    transCtxInfoItem.attributes = attributes;
                }

                var transformedRelationships = {};
                var relationships = enCtxInfo.relationships !== undefined ? enCtxInfo.relationships : [];

                for (var relTypeIdx in relationships) {
                    var relTypeObj = relationships[relTypeIdx];
                    var relsArray = [];

                    for (var relObjKey in relTypeObj.rels) {
                        var rel = relTypeObj.rels[relObjKey];
                        delete rel['relToObject'].data; // no need to send related dataObject data to server..
                        relsArray.push(rel);
                    }

                    transformedRelationships[relTypeIdx] = relsArray;
                }

                if (!isEmpty(transformedRelationships)) {
                    transCtxInfoItem.relationships = transformedRelationships;
                }

                ctxInfo.push(transCtxInfoItem);
            }
        }

        transformedDataObject.data = { ctxInfo: ctxInfo };
    }

    return transformedDataObject;
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
}

DataObjectFalcorUtil.createCtxKey = function(ctxGroup, valCtxGroup = {}) {
    var ctxKey = '';
    var defaultVal = 'xzx';

    if(!isEmpty(ctxGroup)) {
        var obj = { 'ctxGroup': ctxGroup, 'valCtxGroup': valCtxGroup };
        ctxKey = JSON.stringify(DataObjectFalcorUtil.sortObject(obj));
    }

    return ctxKey;
};

DataObjectFalcorUtil.createEmptyKeyFieldIfMissing = function(obj, key, defaultVal) {
    if(obj && (obj[key] === undefined || isEmpty(obj[key]))) {
        obj[key] = defaultVal;
    }
};

DataObjectFalcorUtil.compareCtx = function(obj1, obj2) {
    return JSON.stringify(DataObjectFalcorUtil.sortObject(obj1)) == JSON.stringify(DataObjectFalcorUtil.sortObject(obj2));
};

DataObjectFalcorUtil.createCtxInfo = function(ctxKeys) {
    var ctxGroups = [];
    var valCtxGroups = [];

    for (let ctxKey of ctxKeys) {
        var ctxObj = JSON.parse(ctxKey);

        var ctxGroup = ctxObj.ctxGroup;
        var valCtxGroup = ctxObj.valCtxGroup;

        var ctxGroupFound = false;
        for(let existingCtxGroup of ctxGroups) {
            if(DataObjectFalcorUtil.compareCtx(existingCtxGroup, ctxGroup)) {
                ctxGroupFound = true;
                break;
            }
        }

        if(!ctxGroupFound) {
            ctxGroups.push(ctxGroup);
        }

        var valCtxGroupFound = false;
        for(let existingValCtxGroup of valCtxGroups) {
            if(DataObjectFalcorUtil.compareCtx(existingValCtxGroup, valCtxGroup)) {
                valCtxGroupFound = true;
                break;
            }
        }

        if(!valCtxGroupFound) {
            valCtxGroups.push(valCtxGroup);
        }
    }

    return {'ctx': ctxGroups, 'valCtx': valCtxGroups};
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

