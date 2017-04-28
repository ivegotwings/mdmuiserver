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
    mergePathSets = pathUtils.mergePathSets,
    prepareValueJson = pathUtils.prepareValueJson;

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

function _buildFieldsResponse(dataObject, reqData, baseJson, paths) {

    var dataObjectFieldKeys = _getKeyNames(dataObject, reqData.dataObjectFields);

    //console.log('dataObjectFieldKeys:', JSON.stringify(dataObjectFieldKeys));

    for (let dataObjectFieldKey of dataObjectFieldKeys) {
        if (dataObjectFieldKey !== "data") {
            var dataObjectFieldValue = dataObject[dataObjectFieldKey] !== undefined ? dataObject[dataObjectFieldKey] : {};
            baseJson[dataObjectFieldKey] = prepareValueJson($atom(dataObjectFieldValue));

            //build paths if requested
            if(reqData.buildPaths){
                paths.push(mergePathSets(reqData.basePath, [dataObjectFieldKey]));
            }
        }
    }

    //console.log('response:', JSON.stringify(response));
    return;
}

function _buildAttributesResponse(attrs, attrNames, reqData, currentDataContextJson, paths, basePath) {
    //console.log('reqAttrNames ', attrNames);

    if (isEmpty(attrs)) {
        return;
    }

    var attributesJson = currentDataContextJson['attributes'] = {};

    var attrKeys = _getKeyNames(attrs, attrNames);

    for (let attrKey of attrKeys) {
        var attr = attrs[attrKey];

        if (!attr) {
            continue;
        }
        else {
            //console.log('attr key:', attrKey, ' attr json:', JSON.stringify(attr));
        }

        var attributeJson = attributesJson[attrKey] = {};
        var valContextsJson = attributeJson['valContexts'] = {};

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
                var valContextJson = {};
                valContextJson['values'] = prepareValueJson($atom(valCtxItem.values), expires);
                valContextsJson[valCtxKey] = valContextJson;

                //build paths if requested
                if(reqData.buildPaths){
                    paths.push(mergePathSets(basePath, ['attributes', attrKey, 'valContexts', valCtxKey, 'values']));
                }
            }
        }

        if (attr.group) {
            //var valCtxItem = { 'source': CONST_ANY, 'locale': CONST_ANY }; //TODO: How to find out val contexts keys from the flat list of values object..??
            var valCtxItem = {};
            var valCtxKey = falcorUtil.createCtxKey(valCtxItem);
            //console.log('attr group', JSON.stringify(attr.group));
            var groupJson = {};
            groupJson['group'] = $atom(attr.group);
            valContextsJson[valCtxKey] = groupJson;

            //build paths if requested
            if(reqData.buildPaths){
                    paths.push(mergePathSets(basePath, ['attributes', attrKey, 'valContexts', valCtxKey, 'group']));
            }
        }

        if (attr.properties) {
            //var valCtxItem = { 'source': CONST_ANY, 'locale': CONST_ANY }; //TODO: How to find out val contexts keys from the flat list of values object..??
            var selfValCtxItem = {};
            var selfValCtxKey = falcorUtil.createCtxKey(selfValCtxItem);
            var propertiesJson = {};
            propertiesJson['properties'] = $atom(attr.properties);
            valContextsJson[selfValCtxKey] = propertiesJson;

            //build paths if requested
            if(reqData.buildPaths){
                    paths.push(mergePathSets(basePath, ['attributes', attrKey, 'valContexts', selfValCtxKey, 'properties']));
            }

            // console.log(selfValCtxKey);
            
            if (reqData.valCtxKeys) {
                for (let valCtxKey of reqData.valCtxKeys) {
                    if (valCtxKey != '{}') {
                        var valContextJson = valContextsJson[valCtxKey];
                        if(valContextJson == undefined || valContextJson == null){
                            valContextJson= valContextsJson[valCtxKey] = {};
                        }
                        valContextJson['properties'] = prepareValueJson($atom(attr.properties));

                        //build paths if requested
                        if(reqData.buildPaths){
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

function _buildRelationshipsResponse(rels, reqData, currentDataContextJson, paths, basePath) {

    var reqRelIds = reqData.relIds,
        operation = reqData.operation;

    var relationshipsJson = currentDataContextJson['relationships'] = {};

    //console.log('rels', JSON.stringify(rels)); 
    var relTypeKeys = _getKeyNames(rels, reqData.relTypes);

    for (let relTypeKey of relTypeKeys) {
        var relTypeData = rels[relTypeKey];

        if (!isEmpty(relTypeData)) {
            var relTypeJson = relationshipsJson[relTypeKey] = {};
            var relsJson = {};
            var relIds = [];

            for (var relKey in relTypeData) {
                var rel = relTypeData[relKey];
                rel.id = _createRelUniqueId(rel);

                if (reqRelIds && reqRelIds.length > 0 && !arrayContains(reqRelIds, rel.id)) {
                    continue;
                }

                relIds.push(rel.id);

                if (operation.toLowerCase() !== "getrelidonly") {
                    _buildRelationshipDetailsResponse(rel, reqData, relTypeKey, relsJson, paths, basePath);
                }
            }

            if (operation.toLowerCase() === "getrelidonly" || operation.toLowerCase() === "update" || operation.toLowerCase() === "create") {
                relTypeJson['relIds'] = prepareValueJson($atom(relIds));

                //build paths if requested
                if(reqData.buildPaths){
                    paths.push(mergePathSets(basePath, ['relationships', relTypeKey, 'relIds']));
                }
            }
            else {
                relTypeJson['rels'] = relsJson;
            }
        }
    }

    return;
}

function _buildRelationshipDetailsResponse(enRel, reqData, relTypeKey, relsJson, paths, basePath) {

    var relJson = relsJson[enRel.id] = {};
    var dataObjectsByIdBasePath = [pathKeys.root, reqData.dataIndex];
    var relBasePath;

    if(reqData.buildPaths){
        relBasePath = mergePathSets(basePath, ['relationships', relTypeKey, 'rels', enRel.id]);
    }

    //TODO:: NOT using input relFields yet..
    //var relFieldKeys = _getKeyNames(enRel, reqData.relFields);

    var relAttrNames = reqData.relAttrNames;

    var allRelObjFields = Object.keys(enRel);

    for (let relFieldKey of allRelObjFields) {
        if (relFieldKey == "attributes") {
            var attrs = enRel[relFieldKey];
            if (!isEmpty(attrs) && !isEmpty(relAttrNames)) {
                _buildAttributesResponse(attrs, relAttrNames, reqData, relJson, paths, basePath);
            }
        }
        else if (relFieldKey == "relTo") {
            var dataObjectType = enRel[relFieldKey].type;
            var dataObjectsByIdPath = mergePathSets(dataObjectsByIdBasePath, dataObjectType, pathKeys.byIds);
            relJson[relFieldKey] = prepareValueJson($ref(mergePathSets(dataObjectsByIdPath, [enRel[relFieldKey].id])));

            if(reqData.buildPaths){
                paths.push(mergePathSets(relBasePath, [relFieldKey]));
             }
        }
        else {
            relJson[relFieldKey] = prepareValueJson($atom(enRel[relFieldKey]));

             if(reqData.buildPaths){
                paths.push(mergePathSets(relBasePath, [relFieldKey]));
             }
        }
    }

    return;
}

function _buildJsonDataResponse(jsonData, baseJson) {
    //console.log('reqAttrNames ', attrNames);
    if (isEmpty(jsonData)) {
        return response;
    }

    baseJson['jsonData'] = prepareValueJson($atom(jsonData));

    //console.log('json data response: ', JSON.stringify(response));
    return;
}

function _buildMappingsResponse(ctxItem, reqData, currentDataContextJson, paths, basePath) {
    var mapKeys = reqData.mapKeys;
    var mappingsJson = currentDataContextJson['mappings'] = {};

    var attrs = ctxItem.attributes;
    var rels = ctxItem.relationships;

    for (let mapKey of mapKeys) {
        if (mapKey == "attributeMap" && !isEmpty(attrs)) {
            var attrMap = Object.keys(attrs);
            //console.log('attrs map ', JSON.stringify(attrMap));
            mappingsJson['attributeMap'] = $atom(attrMap);

            if(reqData.buildPaths){
                paths.push(mergePathSets(basePath, ['mappings', 'attributeMap']))
            }
        }
        else if (mapKey == "relationshipMap" && !isEmpty(rels)) {
            var relTypeMap = Object.keys(rels);
            mappingsJson['relationshipMap'] = $atom(relTypeMap);

            if(reqData.buildPaths){
                paths.push(mergePathSets(basePath, ['mappings', 'attributeMap']))
            }
        }
    }

    return;
}

function _createCtxPropertiesAttribute(ctxProperties) {
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

function buildResponse(dataObject, reqData, paths) {
    var dataObjectResponseJson = {};

    if (isEmpty(dataObject)) {
        return response;
    }

    if (!isEmpty(reqData.dataObjectFields)) {
         _buildFieldsResponse(dataObject, reqData, dataObjectResponseJson, paths);
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

        var dataJson = dataObjectResponseJson['data'] = {};
        var dataContextsJson = dataJson['contexts'] = {};

        for (let contextItem of data.contexts) {
            var currContext = contextItem.context;

            var ctxKey = falcorUtil.createCtxKey(currContext);
            var currentDataContextJson = dataContextsJson[ctxKey] = {}; //TODO:: Is there possibility of duplicate contexts?
            var currentContextBasePath;

            if(reqData.buildPaths){
                currentContextBasePath = mergePathSets(reqData.basePath, ['data', 'contexts', ctxKey])
            }

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
                    _buildAttributesResponse(attrs, reqData.attrNames, reqData, currentDataContextJson, paths, currentContextBasePath);
                }
            }

            //console.log('relTypes', JSON.stringify(reqData.relTypes));
            if (!isEmpty(reqData.relTypes)) {
                var rels = contextItem.relationships;
                if (!isEmpty(rels)) {
                    _buildRelationshipsResponse(rels, reqData, currentDataContextJson, paths, currentContextBasePath);
                }
            }

            if (reqData.jsonData && !isEmpty(contextItem.jsonData)) {
                _buildJsonDataResponse(contextItem.jsonData, currentDataContextJson);

                if(reqData.buildPaths){
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

        if (reqData.operation == "getMappings" && arrayContains(reqData.mapKeys, "contextMap")) {
            var mappingsJson = dataJson['mappings'] = {};
            mappingsJson['contextMap'] = $atom(contextMap);

            if(reqData.buildPaths){
                paths.push(mergePathSets(reqData.basePath, ['data', 'mappings', 'contextMap']));
            }
        }
    }

    return dataObjectResponseJson;
}

module.exports = {
    buildResponse: buildResponse,
    formatDataObjectForSave: formatDataObjectForSave,
    createPath: createPath,
    mergeAndCreatePath: mergeAndCreatePath,
    mergePathSets: mergePathSets,
    prepareValueJson: prepareValueJson,
    pathKeys: pathKeys
};