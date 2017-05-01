'use strict';

const arrayContains = require('../common/utils/array-contains'),
    isEmpty = require('../common/utils/isEmpty'),
    isObject = require('../common/utils/isObject');

const pathUtils = require('./dataobject-falcor-path-utils');

const jsonGraph = require('falcor-json-graph'),
    $ref = jsonGraph.ref,
    $error = jsonGraph.error,
    $atom = jsonGraph.atom;

const createPath = pathUtils.createPath,
    mergeAndCreatePath = pathUtils.mergeAndCreatePath,
    mergePathSets = pathUtils.mergePathSets;

const falcorUtil = require('../../../shared/dataobject-falcor-util');

const CONST_ALL = falcorUtil.CONST_ALL,
    CONST_ANY = falcorUtil.CONST_ANY,
    CONST_CTX_PROPERTIES = falcorUtil.CONST_CTX_PROPERTIES,
    CONST_DATAOBJECT_METADATA_FIELDS = falcorUtil.CONST_DATAOBJECT_METADATA_FIELDS;

const pathKeys = falcorUtil.getPathKeys();

function _createRelUniqueId(rel) {
    if (rel) {
        var relDataObjectId = rel.relTo && rel.relTo.id && rel.relTo.id !== "" ? rel.relTo.id : "-1";
        var source = rel.source !== undefined && rel.source !== "" ? rel.source : "ANY";
        return relDataObjectId.concat("#@#", source);
    }

    return "";
}

function _getKeyNames(obj, reqKeys) {
    var keys = [];

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

function _buildFieldsResponse(dataObject, reqData, basePath) {
    var response = [];

    var dataObjectFieldKeys = _getKeyNames(dataObject, reqData.dataObjectFields);

    //console.log('dataObjectFieldKeys:', JSON.stringify(dataObjectFieldKeys));

    for (let dataObjectFieldKey of dataObjectFieldKeys) {
        if (dataObjectFieldKey !== "data") {
            var dataObjectFieldValue = dataObject[dataObjectFieldKey] !== undefined ? dataObject[dataObjectFieldKey] : {};
            response.push(mergeAndCreatePath(basePath, [dataObjectFieldKey], $atom(dataObjectFieldValue)));
        }
    }

    //console.log('response:', JSON.stringify(response));
    return response;
}

function _buildAttributesResponse(attrs, attrNames, reqData, basePath) {
    //console.log('reqAttrNames ', attrNames);
    var response = [];

    if (isEmpty(attrs)) {
        return response;
    }

    var attrKeys = _getKeyNames(attrs, attrNames);

    for (let attrKey of attrKeys) {
        var attr = attrs[attrKey];

        if (!attr) {
            continue;
        }
        else {
            //console.log('attr key:', attrKey, ' attr json:', JSON.stringify(attr));
        }

        if (attr.values) {
            var valCtxItems = {};
            for (let val of attr.values) {
                var source = val.source || undefined;
                var locale = val.locale || undefined;

                var valCtxItem = { 'source': source, 'locale': locale }; //TODO: Here, source and locale are hard coded... How to find out val contexts keys from the flat list of values object..??
                var valCtxKey = falcorUtil.createCtxKey(valCtxItem);

                var valCtxItem = falcorUtil.getOrCreate(valCtxItems, valCtxKey, {});
                var values = falcorUtil.getOrCreate(valCtxItem, 'values', []);

                values.push(val);
            }

            var expires = undefined;
            if (attr.action && attr.action == "delete") {
                expires = 0;
            }

            for (var valCtxKey in valCtxItems) {
                var valCtxItem = valCtxItems[valCtxKey];
                //console.log('valCtxItem.values', JSON.stringify(valCtxItem.values));
                response.push(mergeAndCreatePath(basePath, [attrKey, 'valContexts', valCtxKey, 'values'], $atom(valCtxItem.values), expires));
            }
        }

        if (attr.group) {
            //var valCtxItem = { 'source': CONST_ANY, 'locale': CONST_ANY }; //TODO: How to find out val contexts keys from the flat list of values object..??
            var valCtxItem = {};
            var valCtxKey = falcorUtil.createCtxKey(valCtxItem);
            //console.log('attr group', JSON.stringify(attr.group));
            response.push(mergeAndCreatePath(basePath, [attrKey, 'valContexts', valCtxKey, 'group'], $atom(attr.group)));
        }

        if (attr.properties) {
            //var valCtxItem = { 'source': CONST_ANY, 'locale': CONST_ANY }; //TODO: How to find out val contexts keys from the flat list of values object..??
            var selfValCtxItem = {};
            var selfValCtxKey = falcorUtil.createCtxKey(selfValCtxItem);
            response.push(mergeAndCreatePath(basePath, [attrKey, 'valContexts', selfValCtxKey, 'properties'], $atom(attr.properties)));

            // console.log(selfValCtxKey);
            if (reqData.valCtxKeys) {
                for (let valCtxKey of reqData.valCtxKeys) {
                    if (valCtxKey != '{}') {
                        response.push(mergeAndCreatePath(basePath, [attrKey, 'valContexts', valCtxKey, 'properties'], $atom(attr.properties)));
                    }
                }
            }
            
            //console.log('attr response: ', JSON.stringify(response));
        }
    }

    //console.log('attr response: ', JSON.stringify(response));
    return response;
}

function _buildRelationshipsResponse(rels, reqData, basePath) {
    var response = [];

    var reqRelIds = reqData.relIds,
        operation = reqData.operation;

    //console.log('rels', JSON.stringify(rels)); 
    var relTypeKeys = _getKeyNames(rels, reqData.relTypes);

    for (let relTypeKey of relTypeKeys) {
        var relTypeData = rels[relTypeKey];

        if (!isEmpty(relTypeData)) {
            var relBasePath = mergePathSets(basePath, [relTypeKey]);
            var relIds = [];

            for (var relKey in relTypeData) {
                var rel = relTypeData[relKey];
                rel.id = _createRelUniqueId(rel);

                if (reqRelIds && reqRelIds.length > 0 && !arrayContains(reqRelIds, rel.id)) {
                    continue;
                }

                relIds.push(rel.id);

                if (operation.toLowerCase() !== "getrelidonly") {
                    response.push.apply(response, _buildRelationshipDetailsResponse(rel, reqData, relBasePath));
                }
            }

            if (operation.toLowerCase() === "getrelidonly" || operation.toLowerCase() === "update" || operation.toLowerCase() === "create") {
                response.push(mergeAndCreatePath(relBasePath, ["relIds"], $atom(relIds)));
            }
        }
    }

    //console.log('rels response', JSON.stringify(response));
    return response;
}

function _buildRelationshipDetailsResponse(enRel, reqData, basePath) {
    var response = [];

    var relBasePath = mergePathSets(basePath, ["rels", enRel.id]);

    var dataObjectsByIdBasePath = [pathKeys.root, reqData.dataIndex];
    //TODO:: NOT using input relFields yet..
    //var relFieldKeys = _getKeyNames(enRel, reqData.relFields);

    var relAttrNames = reqData.relAttrNames;

    var allRelObjFields = Object.keys(enRel);

    for (let relFieldKey of allRelObjFields) {
        if (relFieldKey == "attributes") {
            var relAttributesBasePath = mergePathSets(relBasePath, ["attributes"]);
            var attrs = enRel[relFieldKey];
            if (!isEmpty(attrs) && !isEmpty(relAttrNames)) {
                response.push.apply(response, _buildAttributesResponse(attrs, relAttrNames, reqData, relAttributesBasePath));
            }
        }
        else if (relFieldKey == "relTo") {
            var dataObjectType = enRel[relFieldKey].type;
            var dataObjectsByIdPath = mergePathSets(dataObjectsByIdBasePath, dataObjectType, pathKeys.byIds);
            response.push(mergeAndCreatePath(relBasePath, relFieldKey, $ref(mergePathSets(dataObjectsByIdPath, [enRel[relFieldKey].id]))));
        }
        else {
            response.push(mergeAndCreatePath(relBasePath, relFieldKey, $atom(enRel[relFieldKey])));
        }
    }

    return response;
}

function _buildJsonDataResponse(jsonData, basePath) {
    //console.log('reqAttrNames ', attrNames);
    var response = [];

    if (isEmpty(jsonData)) {
        return response;
    }

    response.push(createPath(basePath, $atom(jsonData)));

    //console.log('json data response: ', JSON.stringify(response));
    return response;
}

function _buildMappingsResponse(ctxItem, reqData, ctxBasePath) {
    var mapKeys = reqData.mapKeys;
    var response = [];

    var attrs = ctxItem.attributes;
    var rels = ctxItem.relationships;

    for (let mapKey of mapKeys) {
        if (mapKey == "attributeMap" && !isEmpty(attrs)) {
            var attrMap = Object.keys(attrs);
            //console.log('attrs map ', JSON.stringify(attrMap));
            response.push(mergeAndCreatePath(ctxBasePath, ['mappings', 'attributeMap'], $atom(attrMap)));
        }
        else if (mapKey == "relationshipMap" && !isEmpty(rels)) {
            var relTypeMap = Object.keys(rels);
            response.push(mergeAndCreatePath(ctxBasePath, ['mappings', 'relationshipMap'], $atom(relTypeMap)));
        }
    }

    return response;
}

function _createCtxPropertiesAttribute(properties) {
    var ctxProperties = {
        'properties': properties
    };

    return ctxProperties;
}

function _createMetadataFieldsAttribute(dataObject) {

    var metadataFields = {
        'id': dataObject.id,
        'type': dataObject.type || '',
        'name': dataObject.name || '',
        'properties': dataObject.properties || {},
        'version': dataObject.version || '',
        'domain': dataObject.domain || ''
    };
    
    var metadataProperties = {
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

function buildResponse(dataObject, reqData, basePath) {
    var response = [];

    if (isEmpty(dataObject)) {
        return response;
    }

    if (!isEmpty(reqData.dataObjectFields)) {
        response.push.apply(response, _buildFieldsResponse(dataObject, reqData, basePath));
    }

    if (!(isEmpty(reqData.attrNames) && isEmpty(reqData.relTypes) && !reqData.jsonData && reqData.operation != "getMappings")) {

        if (isEmpty(dataObject.data)) { return response; }

        var data = dataObject.data;

        //add data level attrs, rels and props as self context item in falcor response..
        if (data.attributes || data.relationships || data.properties
            || data.jsonData || reqData.attrNames.indexOf(CONST_DATAOBJECT_METADATA_FIELDS) >= 0) {
            var contexts = falcorUtil.getOrCreate(data, "contexts", []);

            if (reqData.attrNames.indexOf(CONST_DATAOBJECT_METADATA_FIELDS) >= 0) {
                var metadataFieldAttr = _createMetadataFieldsAttribute(dataObject);
                if(!data.attributes) {
                    data.attributes = {};
                }
                data.attributes[CONST_DATAOBJECT_METADATA_FIELDS] = metadataFieldAttr;
            }

            var selfCtxItem = {
                'context': falcorUtil.getSelfCtx(),
                'attributes': data.attributes,
                'relationships': data.relationships,
                'properties': data.properties,
                'jsonData': data.jsonData
            }

            contexts.push(selfCtxItem);
        }

        var contextMap = [];

        for (let contextItem of data.contexts) {
            var currContext = contextItem.context;

            var ctxKey = falcorUtil.createCtxKey(currContext);
            var ctxBasePath = mergePathSets(basePath, ['data', 'contexts', ctxKey]);

            if (!isEmpty(reqData.attrNames)) {
                var attrs = contextItem.attributes;
                if (!isEmpty(contextItem.properties) && reqData.attrNames.indexOf(CONST_CTX_PROPERTIES) >= 0) {
                    var ctxPropertiesAttr = _createCtxPropertiesAttribute(contextItem.properties);
                    if(!attrs) {
                        attrs = {};
                    }
                    attrs[CONST_CTX_PROPERTIES] = ctxPropertiesAttr;
                }

                if (!isEmpty(attrs)) {
                    //console.log('attrs', JSON.stringify(attrs));
                    var attrsBasePath = mergePathSets(ctxBasePath, ['attributes']);
                    response.push.apply(response, _buildAttributesResponse(attrs, reqData.attrNames, reqData, attrsBasePath));
                }
            }

            //console.log('relTypes', JSON.stringify(reqData.relTypes));
            if (!isEmpty(reqData.relTypes)) {
                var rels = contextItem.relationships;
                if (!isEmpty(rels)) {
                    var relsBasePath = mergePathSets(ctxBasePath, ['relationships']);
                    response.push.apply(response, _buildRelationshipsResponse(rels, reqData, relsBasePath));
                }
            }

            if (reqData.jsonData && !isEmpty(contextItem.jsonData)) {
                var jsonDataBasePath = mergePathSets(ctxBasePath, ['jsonData']);
                response.push.apply(response, _buildJsonDataResponse(contextItem.jsonData, jsonDataBasePath));
            }

            if (reqData.operation == "getMappings") {
                response.push.apply(response, _buildMappingsResponse(contextItem, reqData, ctxBasePath));
            }

            if (reqData.operation == "getMappings" && arrayContains(reqData.mapKeys, "contextMap")) {
                contextMap.push(contextItem.currContext);
            }
        }

        if (reqData.operation == "getMappings" && arrayContains(reqData.mapKeys, "contextMap")) {
            response.push(mergeAndCreatePath(basePath, ['data', 'mappings', 'contextMap'], $atom(contextMap)));
        }
    }

    return response;
}

module.exports = {
    buildResponse: buildResponse,
    formatDataObjectForSave: formatDataObjectForSave,
    createPath: createPath,
    mergeAndCreatePath: mergeAndCreatePath,
    mergePathSets: mergePathSets,
    pathKeys: pathKeys
};