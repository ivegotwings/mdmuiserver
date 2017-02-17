'use strict';

var DataObjectFalcorUtil = function () { };

DataObjectFalcorUtil.getPathKeys = function () {
    return {
        "root": "dataObjects",
        "masterListById": "masterList",
        "searchResults": "cachedSearchResults",
        "searchResultObjects": "items",
        "objectTypesInfo": {
            "entityData": {
                "name": "entityData",
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

DataObjectFalcorUtil.cloneObject = function (obj) {
    var clonedObj = {};

    if (obj) {
        clonedObj = JSON.parse(JSON.stringify(obj));
    }

    return clonedObj;
}

DataObjectFalcorUtil.test = function () {
    console.log('test success');
}

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

