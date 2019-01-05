'use strict';

const arrayContains = require('../common/utils/array-contains'),
    arrayRemove = require('../common/utils/array-remove'),
    isEmpty = require('../common/utils/isEmpty'),
    isObject = require('../common/utils/isObject');

const pathUtils = require('./dataobject-falcor-path-utils'),
    uuidV1 = require('uuid/v1');

const jsonGraph = require('falcor-json-graph'),
    $ref = jsonGraph.ref,
    $error = jsonGraph.error,
    $atom = jsonGraph.atom;

const createPath = pathUtils.createPath,
    mergeAndCreatePath = pathUtils.mergeAndCreatePath,
    mergePathSets = pathUtils.mergePathSets,
    prepareValueJson = pathUtils.prepareValueJson;

const falcorUtil = require('../../../shared/dataobject-falcor-util');

const CONST_ALL = falcorUtil.CONST_ALL,
    CONST_ANY = falcorUtil.CONST_ANY,
    CONST_CTX_PROPERTIES = falcorUtil.CONST_CTX_PROPERTIES,
    CONST_DATAOBJECT_METADATA_FIELDS = falcorUtil.CONST_DATAOBJECT_METADATA_FIELDS;

const pathKeys = falcorUtil.getPathKeys();

let errorMessageExpireTime = -10 * 1000; // 10 secs

function _getKeyNames(obj, reqKeys) {
    let keys = [];

    if (!isEmpty(reqKeys)) {
        if (reqKeys[0] === CONST_ALL) {
            if (!isEmpty(obj)) {
                keys = Object.keys(obj);
            }
        }
        else {
            keys = reqKeys;
        }
    }

    return keys;
}

function _buildFieldsResponse(dataObject, reqData, baseJson, paths) {

    let dataObjectFieldKeys = _getKeyNames(dataObject, reqData.dataObjectFields);

    //console.log('dataObjectFieldKeys:', JSON.stringify(dataObjectFieldKeys));

    for (let dataObjectFieldKey of dataObjectFieldKeys) {
        if (dataObjectFieldKey !== "data") {
            let dataObjectFieldValue = dataObject[dataObjectFieldKey] !== undefined ? dataObject[dataObjectFieldKey] : {};
            baseJson[dataObjectFieldKey] = prepareValueJson($atom(dataObjectFieldValue), reqData.cacheExpiryDuration);

            //build paths if requested
            if (reqData.buildPaths) {
                paths.push(mergePathSets(reqData.basePath, [dataObjectFieldKey]));
            }
        }
    }

    //console.log('response:', JSON.stringify(response, null, 2));
    return;
}

function _buildAttributesResponse(attrs, attrNames, reqData, currentDataContextJson, paths, basePath) {
    //console.log('reqAttrNames ', attrNames);

    if (isEmpty(attrs)) {
        return;
    }

    let attributesJson = currentDataContextJson['attributes'] = {};

    let attrKeys = _getKeyNames(attrs, attrNames);

    for (let attrKey of attrKeys) {
        let attr = attrs[attrKey];

        if (!attr) {
            continue;
        }
        else {
            //console.log('attr key:', attrKey, ' attr json:', JSON.stringify(attr));
        }

        let attributeJson = attributesJson[attrKey] = {};
        let valContextsJson = attributeJson['valContexts'] = {};
        let attrExpires = reqData.cacheExpiryDuration;

        // Need to come up with proper solution where system can cache coalesced data.
        // As per discussion with Vishal and Jimmy right now system will not cache any coalesced data more then 10 seconds.
        // Because context coalesced structure is dynamic where falcor has to maintain different reference to avoid impact calculation +
        // It has to do impact calculation when coalesced data path will get changed.
        if (attr.properties && (attr.properties.contextCoalesce || attr.properties.instanceCoalesce)) {
            attrExpires = -10000;
        }

        if (attr.action && attr.action == "delete") {
            if (reqData.operation == "create" || reqData.operation == "update") {
                attrExpires = -10000;
            }
            else {
                continue; // do not populate values for "deleted" attributes during get operation..
            }
        }

        if (attr.values) {
            let valCtxItems = {};
            for (let val of attr.values) {
                let source = val.source || undefined;
                let locale = val.locale || undefined;

                let valCtxKey = falcorUtil.createCtxKey({ 'source': source, 'locale': locale }); //TODO: Here, source and locale are hard coded... How to find out val contexts keys from the flat list of values object..??
                let valCtxItem = falcorUtil.getOrCreate(valCtxItems, valCtxKey, {});
                let values = falcorUtil.getOrCreate(valCtxItem, 'values', []);

                //RDF has started sending values in actual data type
                //like boolean as true/false instead of 'true'/'false' and 0 instead of '0'
                //UI is not ready for this yet probably because of if(value) kind of checks
                //So converting value to string value
                if (val.value != undefined) {
                    val.value = val.value.toString();
                }
                values.push(val);
            }

            for (let valCtxKey in valCtxItems) {
                let valCtxItem = valCtxItems[valCtxKey];
                //console.log('valCtxItem.values', JSON.stringify(valCtxItem.values));
                let valContextJson = {};
                valContextJson['values'] = prepareValueJson($atom(valCtxItem.values), attrExpires);
                valContextsJson[valCtxKey] = valContextJson;

                //build paths if requested
                if (reqData.buildPaths) {
                    paths.push(mergePathSets(basePath, ['attributes', attrKey, 'valContexts', valCtxKey, 'values']));

                    // In case of update if attr has context or instance coalesce property then remove these keys from attr.properties and reset properties atom.
                    // It will provide proper updated data of source info to client.
                    if (reqData.operation == "update" && attr.properties) {
                        delete attr.properties.contextCoalesce;
                        delete attr.properties.instanceCoalesce;

                        valContextJson['properties'] = prepareValueJson($atom(attr.properties), attrExpires);
                        paths.push(mergePathSets(basePath, ['attributes', attrKey, 'valContexts', valCtxKey, 'properties']));
                    }

                }
            }
        }

        if (attr.group) {
            //console.log('attr group', JSON.stringify(attr.group));
            //var valCtxItem = { 'source': CONST_ANY, 'locale': CONST_ANY }; //TODO: How to find out val contexts keys from the flat list of values object..??

            let valCtxItems = {};
            if(reqData.dataIndex === "entityModel" && reqData.valCtxKeys) {
                for(let valCtxKey of reqData.valCtxKeys) {
                    let valCtxItem = falcorUtil.getOrCreate(valCtxItems, valCtxKey, {});
                    let group = falcorUtil.getOrCreate(valCtxItem, 'group', []);

                    for(let item of attr.group) {
                        group.push(item);
                    }
                }
            } else {
                for (let item of attr.group) {
                    let source = item.source || undefined;
                    let locale = item.locale || undefined;

                    let valCtxKey = falcorUtil.createCtxKey({ 'source': source, 'locale': locale });
                    let valCtxItem = falcorUtil.getOrCreate(valCtxItems, valCtxKey, {});
                    let group = falcorUtil.getOrCreate(valCtxItem, 'group', []);

                    // If nested attributes item is marked as deleted it should not be added in cache again.
                    if("action" in item && item.action.toLowerCase() == "delete") {
                        continue;
                    }

                    group.push(item);
                }
            }

            for(let valCtxKey in valCtxItems) {
                let valCtxItem = valCtxItems[valCtxKey];
                let valContextJson = {};

                valContextJson['group'] = prepareValueJson($atom(valCtxItem.group), attrExpires);
                valContextsJson[valCtxKey] = valContextJson;

                //build paths if requested
                if (reqData.buildPaths) {
                    paths.push(mergePathSets(basePath, ['attributes', attrKey, 'valContexts', valCtxKey, 'group']));
                }
            }
        }

        if (attr.properties) {
            //var valCtxItem = { 'source': CONST_ANY, 'locale': CONST_ANY }; //TODO: How to find out val contexts keys from the flat list of values object..??
            let selfValCtxItem = {};
            let selfValCtxKey = falcorUtil.createCtxKey(selfValCtxItem);
            let selfValContextJson = valContextsJson[selfValCtxKey];

            if (!selfValContextJson) {
                selfValContextJson = falcorUtil.getOrCreate(valContextsJson, selfValCtxKey, {});
            }
            selfValContextJson['properties'] = prepareValueJson($atom(attr.properties), attrExpires);

            //build paths if requested
            if (reqData.buildPaths) {
                paths.push(mergePathSets(basePath, ['attributes', attrKey, 'valContexts', selfValCtxKey, 'properties']));
            }

            // console.log(selfValCtxKey);

            if (reqData.valCtxKeys) {
                for (let valCtxKey of reqData.valCtxKeys) {
                    if (valCtxKey != '{}') {
                        let valContextJson = valContextsJson[valCtxKey];
                        if (!valContextJson) {
                            valContextJson = falcorUtil.getOrCreate(valContextsJson, valCtxKey, {});
                        }
                        valContextJson['properties'] = prepareValueJson($atom(attr.properties), attrExpires);

                        //build paths if requested
                        if (reqData.buildPaths) {
                            paths.push(mergePathSets(basePath, ['attributes', attrKey, 'valContexts', valCtxKey, 'properties']));
                        }
                    }
                }
            }

            //console.log('attr response: ', JSON.stringify(response));
        }
    }

    //console.log('attr response: ', JSON.stringify(response));
    return;
}

function _buildRelationshipsResponse(rels, reqData, currentDataContextJson, paths, basePath, ctxKey) {

    let reqRelIds = reqData.relIds,
        operation = reqData.operation;

    let relationshipsJson = currentDataContextJson['relationships'] = {};

    //console.log('rels', JSON.stringify(rels)); 
    let relTypeKeys = _getKeyNames(rels, reqData.relTypes);
    let originalRelIds = reqData.originalRelIds;

    for (let relTypeKey of relTypeKeys) {
        let relTypeData = rels[relTypeKey];

        if (!isEmpty(relTypeData)) {
            let relTypeJson = relationshipsJson[relTypeKey] = {};
            let relsJson = {};
            let relIds = [];

            if (originalRelIds && originalRelIds[ctxKey] && originalRelIds[ctxKey][relTypeKey]) {
                relIds = originalRelIds[ctxKey][relTypeKey];
            }

            for (let relKey in relTypeData) {
                let rel = relTypeData[relKey];
                if (!rel.id) {
                    rel.id = falcorUtil.createRelUniqueId(relTypeKey, rel);
                }

                if (reqRelIds && reqRelIds.length > 0 && !arrayContains(reqRelIds, rel.id)) {
                    continue;
                }

                if (arrayContains(relIds, rel.id)) {
                    if (rel.action == "delete") {
                        arrayRemove(relIds, rel.id);
                    }
                }
                else {
                    relIds.push(rel.id);
                }

                if (operation.toLowerCase() !== "getrelidonly" && rel.action !== "delete") {
                    _buildRelationshipDetailsResponse(rel, reqData, relTypeKey, relsJson, paths, basePath);
                }
            }

            if (operation.toLowerCase() === "getrelidonly" || operation.toLowerCase() === "update" || operation.toLowerCase() === "create") {
                relTypeJson['relIds'] = prepareValueJson($atom(relIds), reqData.cacheExpiryDuration);

                //build paths if requested
                if (reqData.buildPaths) {
                    paths.push(mergePathSets(basePath, ['relationships', relTypeKey, 'relIds']));
                }
            }

            if (operation.toLowerCase() !== "getrelidonly") {
                relTypeJson['rels'] = relsJson;
            }
        }
    }

    return;
}

function _buildRelationshipDetailsResponse(enRel, reqData, relTypeKey, relsJson, paths, basePath) {

    let relJson = relsJson[enRel.id] = {};
    let dataObjectsByIdBasePath = [pathKeys.root, reqData.dataIndex];
    let relBasePath;

    if (reqData.buildPaths) {
        relBasePath = mergePathSets(basePath, ['relationships', relTypeKey, 'rels', enRel.id]);
    }

    //TODO:: NOT using input relFields yet..
    //var relFieldKeys = _getKeyNames(enRel, reqData.relFields);

    let relAttrNames = reqData.relAttrNames;

    let allRelObjFields = Object.keys(enRel);

    for (let relFieldKey of allRelObjFields) {
        if (relFieldKey == "attributes") {
            let attrs = enRel[relFieldKey];
            if (!isEmpty(attrs)) {
                _buildAttributesResponse(attrs, relAttrNames, reqData, relJson, paths, relBasePath);
            }
        }
        else {
            relJson[relFieldKey] = prepareValueJson($atom(enRel[relFieldKey]), reqData.cacheExpiryDuration);

            if (reqData.buildPaths) {
                paths.push(mergePathSets(relBasePath, [relFieldKey]));
            }
        }
    }

    if (enRel && enRel.relTo) {
        let relDataObjectId = enRel.relTo.id || -1;
        let relDataObjectType = enRel.relTo.type || '';

        let dataObjectsByIdPath = mergePathSets(dataObjectsByIdBasePath, relDataObjectType, pathKeys.byIds);
        relJson["relToObject"] = prepareValueJson($ref(mergePathSets(dataObjectsByIdPath, [relDataObjectId])), reqData.cacheExpiryDuration);

        if (reqData.buildPaths) {
            paths.push(mergePathSets(relBasePath, ["relToObject"]));
        }
    }

    return;
}

function _buildJsonDataResponse(jsonData, baseJson, reqData) {
    //console.log('reqAttrNames ', attrNames);
    if (isEmpty(jsonData)) {
        return;
    }

    baseJson['jsonData'] = prepareValueJson($atom(jsonData), reqData.cacheExpiryDuration);

    //console.log('json data response: ', JSON.stringify(response));
    return;
}

function _buildMappingsResponse(ctxItem, reqData, currentDataContextJson, paths, basePath) {
    let mapKeys = reqData.mapKeys;
    let mappingsJson = currentDataContextJson['mappings'] = {};

    let attrs = ctxItem.attributes;
    let rels = ctxItem.relationships;

    for (let mapKey of mapKeys) {
        if (mapKey == "attributeMap" && !isEmpty(attrs)) {
            let attrMap = Object.keys(attrs);
            //console.log('attrs map ', JSON.stringify(attrMap));
            mappingsJson['attributeMap'] = prepareValueJson($atom(attrMap), reqData.cacheExpiryDuration);

            if (reqData.buildPaths) {
                paths.push(mergePathSets(basePath, ['mappings', 'attributeMap']))
            }
        }
        else if (mapKey == "relationshipMap" && !isEmpty(rels)) {
            let relTypeMap = Object.keys(rels);
            mappingsJson['relationshipMap'] = prepareValueJson($atom(relTypeMap), reqData.cacheExpiryDuration);

            if (reqData.buildPaths) {
                paths.push(mergePathSets(basePath, ['mappings', 'attributeMap']))
            }
        }
    }

    return;
}

function _createCtxPropertiesAttribute(properties) {
    let ctxProperties = {
        'properties': properties
    };

    return ctxProperties;
}

function _createMetadataFieldsAttribute(dataObject) {

    let metadataFields = {
        'id': dataObject.id,
        'type': dataObject.type || '',
        'name': dataObject.name || '',
        'properties': dataObject.properties || {},
        'version': dataObject.version || '',
        'domain': dataObject.domain || ''
    };

    let metadataProperties = {
        'properties': metadataFields
    };

    return metadataProperties;
}

function formatDataObjectForSave(dataObject) {
    if (isEmpty(dataObject.name)) {
        delete dataObject.name;
    }

    if (isEmpty(dataObject.version)) {
        delete dataObject.version;
    }

    if (isEmpty(dataObject.properties)) {
        delete dataObject.properties;
    }

    if (dataObject.data && isEmpty(dataObject.data.contexts)) {
        delete dataObject.data.contexts;
    }

    if (isEmpty(dataObject.domain)) {
        delete dataObject.domain;
    }
}

function buildResponse(dataObject, reqData, paths) {
    let dataObjectResponseJson = {};

    if (isEmpty(dataObject)) {
        return dataObjectResponseJson;
    }

    if (!isEmpty(reqData.dataObjectFields)) {
        _buildFieldsResponse(dataObject, reqData, dataObjectResponseJson, paths);
    }

    if (!(isEmpty(reqData.attrNames) && isEmpty(reqData.relTypes) && !reqData.jsonData && reqData.operation != "getMappings")) {

        let data = dataObject.data;

        //add data level attrs, rels and props as self context item in falcor response..
        if ((data && (data.attributes || data.relationships || data.properties
            || data.jsonData)) || reqData.attrNames.indexOf(CONST_DATAOBJECT_METADATA_FIELDS) >= 0) {

            if (!data && reqData.attrNames.indexOf(CONST_DATAOBJECT_METADATA_FIELDS) >= 0) {
                data = {};
            };
            let contexts = falcorUtil.getOrCreate(data, "contexts", []);

            if (reqData.attrNames.indexOf(CONST_DATAOBJECT_METADATA_FIELDS) >= 0) {
                let metadataFieldAttr = _createMetadataFieldsAttribute(dataObject);
                if (!data.attributes) {
                    data.attributes = {};
                }
                data.attributes[CONST_DATAOBJECT_METADATA_FIELDS] = metadataFieldAttr;
            }

            let selfCtxItem = {
                'context': falcorUtil.getSelfCtx(),
                'attributes': data.attributes,
                'relationships': data.relationships,
                'properties': data.properties,
                'jsonData': data.jsonData
            }

            contexts.push(selfCtxItem);
        }

        let contextMap = [];

        let dataJson = dataObjectResponseJson['data'] = {};
        let dataContextsJson = dataJson['contexts'] = {};

        if (data && data.contexts) {

            // If user performs self attribute update being additional context selected then UI will not saw updated value it will saw old value.
            // Since attribute update is happening with selection of additional context and updated attribute is not mapped to additional context update is happening in self context only.
            // Because of that only "self" context response is getting updated with new value in falcor.
            // It has to be updated in a current selected context also to be consistent on UI.
            if ("webProcessingOptions" in data && data.webProcessingOptions.prepareCoalescedResponse) {
                let currentSelectedContextInfo = data.webProcessingOptions.currentSelectedContext;
                
                if (currentSelectedContextInfo) {
                    let currentSelectedContextKey = falcorUtil.createCtxKey(currentSelectedContextInfo);
                    let currentSelectedContext = data.contexts.filter(v => falcorUtil.createCtxKey(v.context) == currentSelectedContextKey);
                    let ctxAttributes;
    
                    if (currentSelectedContext && currentSelectedContext.length) {
                        if (currentSelectedContext.attributes) {
                            ctxAttributes = currentSelectedContext.attributes;
                        } else {
                            ctxAttributes = currentSelectedContext.attributes = {};
                        }
                    } else {
                        currentSelectedContext = {
                            "context": currentSelectedContextInfo,
                            "attributes": {}
                        };
                        data.contexts.push(currentSelectedContext);
                        ctxAttributes = currentSelectedContext.attributes;
                    }
    
                    for (let ctxItem of data.contexts) {
                        if ("attributes" in ctxItem) {
                            let ctx = ctxItem.context;
                            let ctxKey = falcorUtil.createCtxKey(ctx);
                            if (ctxKey != currentSelectedContextKey) {
                                for (let attr in ctxItem.attributes) {
                                    if (!ctxAttributes[attr]) {
                                        ctxAttributes[attr] = ctxItem.attributes[attr];
                                    }
                                }
                            }
                        }
                    }
                }
            }

            for (let contextItem of data.contexts) {
                let currContext = contextItem.context;

                if (!isEmpty(reqData.coalesceOptions)) {
                    currContext.coalesceOptions = reqData.coalesceOptions;
                }

                let ctxKey = falcorUtil.createCtxKey(currContext);
                let currentDataContextJson = dataContextsJson[ctxKey] = {}; //TODO:: Is there possibility of duplicate contexts?
                let currentContextBasePath;

                if (reqData.buildPaths) {
                    currentContextBasePath = mergePathSets(reqData.basePath, ['data', 'contexts', ctxKey])
                }

                if (!isEmpty(reqData.attrNames)) {
                    let attrs = contextItem.attributes;
                    if (!isEmpty(contextItem.properties) && reqData.attrNames.indexOf(CONST_CTX_PROPERTIES) >= 0) {
                        let ctxPropertiesAttr = _createCtxPropertiesAttribute(contextItem.properties);
                        if (!attrs) {
                            attrs = {};
                        }
                        attrs[CONST_CTX_PROPERTIES] = ctxPropertiesAttr;
                    }

                    if (!isEmpty(attrs)) {
                        //console.log('attrs', JSON.stringify(attrs));
                        _buildAttributesResponse(attrs, reqData.attrNames, reqData, currentDataContextJson, paths, currentContextBasePath);
                    }
                }

                //console.log('relTypes', JSON.stringify(reqData.relTypes));
                if (!isEmpty(reqData.relTypes)) {
                    let rels = contextItem.relationships;
                    if (!isEmpty(rels)) {
                        _buildRelationshipsResponse(rels, reqData, currentDataContextJson, paths, currentContextBasePath, ctxKey);
                    }
                }

                if (reqData.jsonData && !isEmpty(contextItem.jsonData)) {
                    _buildJsonDataResponse(contextItem.jsonData, currentDataContextJson, reqData);

                    if (reqData.buildPaths) {
                        paths.push(mergePathSets(currentContextBasePath, ['jsonData']))
                    }
                }

                if (reqData.operation == "getMappings") {
                    _buildMappingsResponse(contextItem, reqData, currentDataContextJson, paths, currentContextBasePath);
                }

                if (reqData.operation == "getMappings" && arrayContains(reqData.mapKeys, "contextMap")) {
                    contextMap.push(contextItem.currContext);
                }
            }
        }

        if (reqData.operation == "getMappings" && arrayContains(reqData.mapKeys, "contextMap")) {
            let mappingsJson = dataJson['mappings'] = {};
            mappingsJson['contextMap'] = prepareValueJson($atom(contextMap), reqData.cacheExpiryDuration);

            if (reqData.buildPaths) {
                paths.push(mergePathSets(reqData.basePath, ['data', 'mappings', 'contextMap']));
            }
        }
    }

    return dataObjectResponseJson;
}

function buildErrorResponse(errorObject, primaryMessageToBePrefixedIfAny) {
    let errorResponse = {};
    let errorDetails = {};
    let errorGuid = uuidV1();

    //Prepare error message
    let errorMessage;
    if (primaryMessageToBePrefixedIfAny) {
        if (errorObject.name) {
            errorMessage = primaryMessageToBePrefixedIfAny + " " + errorObject.name + ": " + errorObject.message;
        }
        else {
            errorMessage = primaryMessageToBePrefixedIfAny + " Error: " + errorObject.message;
        }
    }
    else {
        errorMessage = errorObject.toString();
    }

    errorDetails['message'] = errorMessage;
    errorDetails['messageCode'] = errorObject.messageCode;
    //errorDetails['type'] = errorObject.name;
    //errorDetails['stack'] = errorObject.stack;
    let errorJson = prepareValueJson($error(errorDetails), errorMessageExpireTime);

    console.log(errorMessage, '\nStackTrace:', errorObject.stack);
    errorResponse = { 'path': [pathKeys.root, 'errorData', pathKeys.byIds, [errorGuid]], 'value': errorJson };

    return errorResponse;
}

function buildRefResponse(dataObject, reqData) {
    let dataObjectResponseJson = {};

    if (!isEmpty(reqData.dataObjectFields)) {
        _buildFieldsResponse(dataObject, reqData, dataObjectResponseJson);
    }

    let dataJson = dataObjectResponseJson['data'] = {};
    let dataContextsJson = dataJson['contexts'] = {};
    let pathToContexts = [pathKeys.root, reqData.dataIndex, reqData.dataObjectType, pathKeys.byIds, dataObject.id, 'data', 'contexts'];

    let data = dataObject.data;
    if (data && data.contexts) {
        let selfCtxKey = falcorUtil.createSelfCtxKey();

        for (let contextItem of data.contexts) {
            let currContext = contextItem.context;
            let currentCtxKey = falcorUtil.createCtxKey(currContext);

            let pathToContextItem = mergePathSets(pathToContexts, [currentCtxKey])

            if (currContext.selfContext) {
                //Add selfcontext response as $ref...
                dataContextsJson[selfCtxKey] = prepareValueJson($ref(pathToContextItem), reqData.cacheExpiryDuration);
            }
            else {
                //Add requested context response as $ref...
                for (let i = 0; i < reqData.ctxKeys.length; i++) {
                    let ctxKey = reqData.ctxKeys[i];
                    if (ctxKey != selfCtxKey) {
                        //Assumption: We cannot compare requested context key with the resulted context... Hence considering first key always... 
                        dataContextsJson[ctxKey] = prepareValueJson($ref(pathToContextItem), reqData.cacheExpiryDuration);
                        break;
                    }
                }
            }
        }
    }

    return dataObjectResponseJson;
}

module.exports = {
    buildResponse: buildResponse,
    buildErrorResponse: buildErrorResponse,
    formatDataObjectForSave: formatDataObjectForSave,
    createPath: createPath,
    mergeAndCreatePath: mergeAndCreatePath,
    mergePathSets: mergePathSets,
    prepareValueJson: prepareValueJson,
    buildRefResponse: buildRefResponse,
    pathKeys: pathKeys
};
