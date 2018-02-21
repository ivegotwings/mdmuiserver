'use strict';
var RUFUtilities = {};
var datahelpers = (function(){
    var _walk = function (target, copy) {
                    for (var key in target) {
                        var obj = target[key];
                        if (obj instanceof Date) {
                            var value = new Date(obj.getTime());
                            _add(copy, key, value);
                        }
                        else if (obj instanceof Function) {
                            var value = obj;
                            _add(copy, key, value);
                        }
                        else if (obj instanceof Array) {
                            var value = [];
                            var last = _add(copy, key, value);
                            _walk(obj, last);
                        }
                        else if (obj instanceof Object) {
                            var value = {};
                            var last = _add(copy, key, value);
                            _walk(obj, last);
                        }
                        else {
                            var value = obj;
                            _add(copy, key, value);
                        }
                    }
                }
    
    var _add = function (copy, key, value) {
                if (copy instanceof Array) {
                    copy.push(value);
                    return copy[copy.length - 1];
                }
                else if (copy instanceof Object) {
                    copy[key] = value;
                    return copy[key];
                }
            }
            
    var _clone = function (target) {
                if (/number|string|boolean/.test(typeof target)) {
                return target;
                }
                if (target instanceof Date) {
                return new Date(target.getTime());
                }
    
                var copy = (target instanceof Array) ? [] : {};
                _walk(target, copy);
                return copy;
            }
              
    const types = {}
    // (Number) -> boolean
    types.number = function(a, b){
        return a !== a && b !== b/*Nan check*/
    }
    
    // (function, function, array) -> boolean
    types['function'] = function(a, b, memos){
        return a.toString() === b.toString()
        // Functions can act as objects
        && types.object(a, b, memos)
        && equal(a.prototype, b.prototype)
    }
    
    // (date, date) -> boolean
    types.date = function(a, b){
        return +a === +b
    }
    
    // (regexp, regexp) -> boolean
    types.regexp = function(a, b){
        return a.toString() === b.toString()
    }
    
    // (DOMElement, DOMElement) -> boolean
    types.element = function(a, b){
        return a.outerHTML === b.outerHTML
    }
    
    // (textnode, textnode) -> boolean
    types.textnode = function(a, b){
        return a.textContent === b.textContent
    }

    types.undefined = function(a,b) {
        return true;
    }
    // decorate `fn` to prevent it re-checking objects
    // (function) -> function
    function memoGaurd(fn){
        return function(a, b, memos){
            if (!memos) return fn(a, b, [])
            var i = memos.length, memo
            while (memo = memos[--i]) {
                if (memo[0] === a && memo[1] === b) return true
            }
            return fn(a, b, memos)
        }
    }

    // (array, array, array) -> boolean
    function arrayEqual(a, b, memos){
        var i = a.length
        if (i !== b.length) return false
        memos.push([a, b])
        while (i--) {
        if (!equal(a[i], b[i], memos)) return false
        }
        return true
    }

    function getEnumerableProperties(object) {
        const result = []
        for (var k in object) if (k !== 'constructor') {
            result.push(k)
        }
        return result
    }

    function objectEqual(a, b, memos) {
        if (typeof a.equal == 'function') {
          memos.push([a, b])
          return a.equal(b, memos)
        }
        var ka = getEnumerableProperties(a)
        var kb = getEnumerableProperties(b)
        var i = ka.length
   
        // same number of properties
        if (i !== kb.length) return false
      
        // although not necessarily the same order
        ka.sort()
        kb.sort()
      
        // cheap key test
        while (i--) if (ka[i] !== kb[i]) return false
      
        // remember
        memos.push([a, b])
      
        // iterate again this time doing a thorough check
        i = ka.length
        while (i--) {
          if (!_equal(a[key], b[key], memos)) return false
        }
      
        return true
      } 
    types.array = memoGaurd(arrayEqual)
    types.object = memoGaurd(objectEqual)

    function type(x) {
        var type = typeof x
        if (type != 'object') return type
        type = types[toString.call(x)]
        if (type == 'object') {
            // in case they have been polyfilled
            if (x instanceof Map) return 'map'
            if (x instanceof Set) return 'set'
            return 'object'
        }
        return type
    }
    
    var _equal = function (a, b, memos){
        // All identical values are equivalent
        if (a === b) return true

        const fnA = types[type(a)]
        const fnB = types[type(b)]
        return fnA && fnA === fnB
            ? fnA(a, b, memos)
            : false
    }

    return {
        clone: _clone,
        deepEqual: _equal
    }
})();

(function (){
    try {
        if (window.RUFUtilities) { //only copy deepqueal, as client has a separate deepequal module
            window.RUFUtilities.datahelpers = window.RUFUtilities.datahelpers || {};
            window.RUFUtilities.datahelpers['deepEqual'] = datahelpers.deepEqual;
        }    
    } catch(e) {
        RUFUtilities.datahelpers = datahelpers;
    }
})();


var DataObjectFalcorUtil = function () { };

DataObjectFalcorUtil.CONTEXT_KEY_DEFAULT_VAL = 'xzx';
DataObjectFalcorUtil.CONST_ANY = '_ANY';
DataObjectFalcorUtil.CONST_ALL = '_ALL';
DataObjectFalcorUtil.CONST_CTX_PROPERTIES = 'INTERNAL_CTX_PROPERTIES';
DataObjectFalcorUtil.CONST_DATAOBJECT_METADATA_FIELDS = 'INTERNAL_DATAOBJECT_METADATA_FIELDS';

DataObjectFalcorUtil.getPathKeys = function () {
    return {
        "root": "root",
        "byIds": "byIds",
        "searchResults": "searchResults",
        "searchResultItems": "items",
        "dataIndexInfo": {
            "entityData": {
                "dataSubIndexInfo": {
                    "data": {
                        "name": "entity",
                        "collectionName": "entities",
                        "responseObjectName": "response",
                        "maxRecordsToReturn": 200,
                        "combinedQueryPageSize": 30000,
                        "cacheExpiryDurationInMins": 60
                    },
                    "coalescedData": {
                        "name": "entity",
                        "collectionName": "entities",
                        "responseObjectName": "response",
                        "maxRecordsToReturn": 200,
                        "combinedQueryPageSize": 30000,
                        "cacheExpiryDurationInMins": 60
                    }
                }
            },
            "entityGovernData": {
                "dataSubIndexInfo": {
                    "entityGovernData": {
                        "name": "entityGovernData",
                        "collectionName": "entities",
                        "responseObjectName": "response",
                        "maxRecordsToReturn": 5000,
                        "combinedQueryPageSize": 30000,
                        "cacheExpiryDurationInMins": 60
                    }
                }
            },
            "entityModel": {
                "dataSubIndexInfo": {
                    "entityModel": {
                        "name": "entityModel",
                        "collectionName": "entityModels",
                        "responseObjectName": "response",
                        "maxRecordsToReturn": 2000,
                        "combinedQueryPageSize": 30000,
                        "cacheExpiryDurationInMins": 7200
                    }
                }
            },
            "config": {
                "dataSubIndexInfo": {
                    "config": {
                        "name": "configObject",
                        "collectionName": "configObjects",
                        "responseObjectName": "response",
                        "maxRecordsToReturn": 100,
                        "combinedQueryPageSize": 30000,
                        "cacheExpiryDurationInMins": 7200
                    }
                }
            },
            "eventData": {
                "dataSubIndexInfo": {
                    "eventData": {
                        "name": "event",
                        "collectionName": "events",
                        "responseObjectName": "response",
                        "maxRecordsToReturn": 500,
                        "combinedQueryPageSize": 30000,
                        "cacheExpiryDurationInMins": 30
                    }
                }
            },
            "requestTracking": {
                "dataSubIndexInfo": {
                    "requestTracking": {
                        "name": "requestobject",
                        "collectionName": "requestObjects",
                        "responseObjectName": "response",
                        "maxRecordsToReturn": 200,
                        "combinedQueryPageSize": 30000,
                        "cacheExpiryDurationInMins": 30
                    }
                }
            }
        }
    };

};

const pathKeys = DataObjectFalcorUtil.getPathKeys();

DataObjectFalcorUtil.getSelfCtx = function () {
    return { 'selfContext': true };
};

const selfCtx = DataObjectFalcorUtil.getSelfCtx();

DataObjectFalcorUtil.createSelfCtxKey = function () {
    return DataObjectFalcorUtil.createCtxKey(DataObjectFalcorUtil.getSelfCtx());
};

DataObjectFalcorUtil.transformToExternal = function (dataObject) {

    //console.log('transform dataObject input:', JSON.stringify(dataObject, null, 4));

    var transDataObject = {};

    if (isEmpty(dataObject)) {
        return transDataObject;
    }

    for (var dataObjectField in dataObject) {
        if (dataObjectField != 'data') {
            transDataObject[dataObjectField] = dataObject[dataObjectField];
        }
    }

    if (dataObject.data && dataObject.data.contexts) {

        var transContexts = [];
        var selfCtxItem = {};
        var ctxKeys = Object.keys(dataObject.data.contexts);

        if (ctxKeys && ctxKeys.length) {
            for (var i = 0; i < ctxKeys.length; i++) {
                var ctxKey = ctxKeys[i];
                var transContextsItem = {};

                var transContext = DataObjectFalcorUtil.createCtxItem(ctxKey);

                transContextsItem.context = transContext;

                var enContextData = dataObject.data.contexts[ctxKey];

                if (enContextData.attributes) {
                    transContextsItem.attributes = DataObjectFalcorUtil.transformAttributesToExternal(enContextData.attributes);
                }

                if (enContextData.relationships) {
                    transContextsItem.relationships = DataObjectFalcorUtil.transformRelationshipsToExternal(enContextData.relationships);
                }

                if (enContextData.jsonData) {
                    transContextsItem.jsonData = enContextData.jsonData;
                }

                //read dataobject' metadata fields from the attributes.metadataFields, if available
                if (transContextsItem.attributes && transContextsItem.attributes[DataObjectFalcorUtil.CONST_DATAOBJECT_METADATA_FIELDS]) {

                    if (transContext.selfContext) {
                        var metadataFields = DataObjectFalcorUtil.transformPropertiesToExternal(transContextsItem.attributes[DataObjectFalcorUtil.CONST_DATAOBJECT_METADATA_FIELDS]);
                        for (var dataObjectField in metadataFields) {
                            transDataObject[dataObjectField] = metadataFields[dataObjectField];
                        }
                    }

                    delete transContextsItem.attributes[DataObjectFalcorUtil.CONST_DATAOBJECT_METADATA_FIELDS];
                }

                //read context's properties from the attributes.properties, if available
                if (transContextsItem.attributes && transContextsItem.attributes[DataObjectFalcorUtil.CONST_CTX_PROPERTIES]) {
                    transContextsItem.properties = DataObjectFalcorUtil.transformPropertiesToExternal(transContextsItem.attributes[DataObjectFalcorUtil.CONST_CTX_PROPERTIES]);
                    delete transContextsItem.attributes[DataObjectFalcorUtil.CONST_CTX_PROPERTIES];
                }

                if (transContext.selfContext) {
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

            if (rel.relToObject) {
                var relToObject = rel.relToObject;

                if (relToObject.data) {
                    relToObject = DataObjectFalcorUtil.transformToExternal(relToObject);
                }

                if (rel.relTo && relToObject.data) {
                    rel.relTo.data = relToObject.data;
                    rel.relTo.name = relToObject.name;
                    rel.relTo.version = relToObject.version;
                    rel.relTo.properties = relToObject.properties
                }

                delete rel.relToObject;
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

    if (!properties.properties) {
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

DataObjectFalcorUtil.mergeObjects = function (target, source, addMissing = true, overrideArrays = false) {

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

        if (sourceObj != undefined) {
            //console.log('deep assign---- target:', JSON.stringify(targetObj), 'source:', JSON.stringify(sourceObj));
            if(overrideArrays) {
                target[targetObjKey] = DataObjectFalcorUtil.deepAssignArrayOverride(targetObj, sourceObj);
            } else {
                target[targetObjKey] = DataObjectFalcorUtil.deepAssign(targetObj, sourceObj);
            }
            //console.log('deep assign---- target result:', JSON.stringify(target[targetObjKey]));
        }
    }

    if (addMissing) {
        for (var sourceObjKey in source) {
            var sourceObj = source[sourceObjKey];
            var targetObj = target[sourceObjKey];

            if (targetObj == undefined) {
                target[sourceObjKey] = sourceObj;
            }
        }
    }

    return target;
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
            //console.log('deep assign---- target:', JSON.stringify(targetObj), 'source:', JSON.stringify(sourceObj));
            targetObj = DataObjectFalcorUtil.deepAssign(targetObj, sourceObj);
            //console.log('deep assign---- target result:', JSON.stringify(target[targetObjKey]));
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

DataObjectFalcorUtil.sortObject = function (src) {
    if (isEmpty(src)) {
        return src;
    }

    if (src && typeof src === 'object' && !Array.isArray(src)) {
        var out = {};

        Object.keys(src).sort((key1,key2) => {
            return key2.localeCompare(key1);
        }).forEach(function (key) {
            out[key] = DataObjectFalcorUtil.sortObject(src[key]);
        });

        return out;
    }
    return src;
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
    return RUFUtilities.datahelpers.deepEqual(obj1, obj2);
};

DataObjectFalcorUtil.compareObjects = function (obj1, obj2) {
    return RUFUtilities.datahelpers.deepEqual(obj1, obj2);
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
        if (ctxItem.selfContext) {
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

DataObjectFalcorUtil.getConfigByCtx = function (dataObject, context) {
    if (dataObject && dataObject.configObjects && dataObject.configObjects.length > 0 && dataObject.configObjects[0].data && dataObject.configObjects[0].data.contexts && dataObject.configObjects[0].data.contexts.length > 0) {
        var ctxItem = DataObjectFalcorUtil.getCtxItem(dataObject.configObjects[0].data.contexts, context);
        if (ctxItem) {
            return ctxItem.jsonData;
        }
    }

    return {};
}

DataObjectFalcorUtil.cloneObject = function (obj) {
    return RUFUtilities.datahelpers.clone(obj);
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

DataObjectFalcorUtil.isValidObjectPath = function (base, path) {
    var current = base;
    var components = path.split(".");
    for (var i = 0; i < components.length; i++) {
        if ((typeof current !== "object") || (!components[i] in current)) {
            return false;
        }
        current = current[components[i]];
    }
    return true;
}

DataObjectFalcorUtil.deepAssign = function (...objs) {
    if (objs.length < 2) {
        throw new Error('Need two or more objects to merge');
    }

    var target = objs[0];
    for (var i = 1; i < objs.length; i++) {
        var source = objs[i];
        if (!DataObjectFalcorUtil.isObject(source) && !Array.isArray(source)) {
            target = source;
        }
        else {
            Object.keys(source).forEach(prop => {
                var value = source[prop];
                if (value == "_DEEP_ASSIGN_DELETE_") {
                    delete target[prop];
                } else {
                    if (DataObjectFalcorUtil.isObject(value)) {
                        if (target.hasOwnProperty(prop) && DataObjectFalcorUtil.isObject(target[prop])) {
                            // if (value.hasOwnProperty(DataObjectFalcorUtil.CONST_DELETE_KEY) && value[DataObjectFalcorUtil.CONST_DELETE_KEY] == false) {
                            //     delete target[prop];
                            // }
                            // else {
                            //     target[prop] = DataObjectFalcorUtil.deepAssign(target[prop], value);
                            // }
                            target[prop] = DataObjectFalcorUtil.deepAssign(target[prop], value);
                        } else {
                            target[prop] = {};
                            target[prop] = DataObjectFalcorUtil.deepAssign(target[prop], value);
                        }
                    } else if (Array.isArray(value)) {
                        // TODO:: "_DEEP_ASSIGN_DELETE_" has to be discussed.
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
                }
            });
        }
    }

    return target;
};

DataObjectFalcorUtil.deepAssignArrayOverride = function (...objs) {
    
    if (objs.length < 2) {
        throw new Error('Need two or more objects to merge');
    }
    
    var target = objs[0];
    for (var i = 1; i < objs.length; i++) {
        var source = objs[i];
        if (!DataObjectFalcorUtil.isObject(source) && !Array.isArray(source)) {
            target = source;
        }
        else {
            Object.keys(source).forEach(prop => {
                
                var value = source[prop];
                if (value == "_DEEP_ASSIGN_DELETE_") {
                    delete target[prop];
                } else {
                    if (DataObjectFalcorUtil.isObject(value)) {
                        if (target.hasOwnProperty(prop) && DataObjectFalcorUtil.isObject(target[prop])) {
                            target[prop] = DataObjectFalcorUtil.deepAssignArrayOverride(target[prop], value);
                        } else {
                            target[prop] = {};
                            target[prop] = DataObjectFalcorUtil.deepAssignArrayOverride(target[prop], value);
                        }
                    } else {
                        target[prop] = value;
                    }
                }
            });
        }
    }
    
    return target;
};

DataObjectFalcorUtil.test = function () {
    console.log('test success');
};

DataObjectFalcorUtil.createRelUniqueId = function (relType, rel) {
    if (rel) {
        var relDataObjectId = rel.relTo && rel.relTo.id && rel.relTo.id !== "" ? rel.relTo.id : "-1";
        return relType.concat("_", relDataObjectId);
    }

    return "";
};

DataObjectFalcorUtil.mergePathSets = function () {
    var args = Array.prototype.splice.call(arguments, 0);
    var mergedPathSets = Array.prototype.concat.apply([], args);
    return mergedPathSets;
};

DataObjectFalcorUtil.deepRemoveNodesByKeyVal = function (obj, key, value) {
    for (var prop in obj) {
        if (typeof obj[prop] === 'object') {
            if (obj[prop].hasOwnProperty(key) && obj[prop][key] == value) {
                delete obj[prop];
            }
            else {
                DataObjectFalcorUtil.deepRemoveNodesByKeyVal(obj[prop], key, value);
            }
        }
    }
};

function isEmpty(obj) {
    //if (obj === undefined) { return true };

    for (var x in obj) { return false; }

    return true;
}

var SharedUtils = SharedUtils || {};

if (!SharedUtils) {
    SharedUtils = {};
}

SharedUtils.DataObjectFalcorUtil = DataObjectFalcorUtil;

//register as module or as js 
if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = DataObjectFalcorUtil
    }
    exports.DataObjectFalcorUtil = DataObjectFalcorUtil;
}

