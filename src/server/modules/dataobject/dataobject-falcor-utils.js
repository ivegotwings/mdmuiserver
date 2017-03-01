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

const sharedDataObjectFalcorUtil = require('../../../shared/dataobject-falcor-util');

const CONST_ALL = sharedDataObjectFalcorUtil.CONST_ALL,
    CONST_ANY = sharedDataObjectFalcorUtil.CONST_ANY;

const pathKeys = sharedDataObjectFalcorUtil.getPathKeys();

function _createRelUniqueId(rel) {
    if (rel) {
        var relDataObjectId = rel.relToObject && rel.relToObject.id && rel.relToObject.id !== "" ? rel.relToObject.id : "-1";
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

function _buildAttributesResponse(attrs, attrNames, basePath) {
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
                var source = val.source === undefined ? CONST_ANY : val.source;
                var locale = val.locale === undefined ? CONST_ANY : val.locale;

                var valCtxItem = { 'source': source, 'locale': locale }; //TODO: Here, source and locale are hard coded... How to find out val ctx keys from the flat list of values object..??
                var valCtxKey = sharedDataObjectFalcorUtil.createCtxKey(valCtxItem);

                var valCtxItem = sharedDataObjectFalcorUtil.createAndGet(valCtxItems, valCtxKey, {});
                var values = sharedDataObjectFalcorUtil.createAndGet(valCtxItem, 'values', []);

                //TEMP: just pick last value..
                values.length = 0;

                values.push(val);
            }

            for (var valCtxKey in valCtxItems) {
                var valCtxItem = valCtxItems[valCtxKey];
                //console.log('valCtxItem.values', JSON.stringify(valCtxItem.values));
                response.push(mergeAndCreatePath(basePath, [attrKey, 'valCtxInfo', valCtxKey, 'values'], $atom(valCtxItem.values)));
            }
        }
        else if (attr.group) {
            var valCtxItem = { 'source': CONST_ANY, 'locale': CONST_ANY }; //TODO: How to find out val ctx keys from the flat list of values object..??
            var valCtxKey = sharedDataObjectFalcorUtil.createCtxKey(valCtxItem);
            //console.log('attr group', JSON.stringify(attr.group));
            response.push(mergeAndCreatePath(basePath, [attrKey, 'valCtxInfo', valCtxKey, 'group'], $atom(attr.group)));
        }
        else if (attr.properties) {
            var valCtxItem = { 'source': CONST_ANY, 'locale': CONST_ANY }; //TODO: How to find out val ctx keys from the flat list of values object..??
            var valCtxKey = sharedDataObjectFalcorUtil.createCtxKey(valCtxItem);
            response.push(mergeAndCreatePath(basePath, [attrKey, 'valCtxInfo', valCtxKey, 'properties'], $atom(attr.properties)));
        }
    }

    //console.log('attr response: ', JSON.stringify(response));
    return response;
}

function _buildRelationshipsResponse(rels, reqData, basePath) {
    var response = [];

    var reqRelIds = reqData.relIds,
        caller = reqData.caller;

    var relTypeKeys = _getKeyNames(rels, reqData.relTypes);

    for (let relTypeKey of relTypeKeys) {
        var relTypeInfo = rels[relTypeKey];

        if (!isEmpty(relTypeInfo)) {
            var relBasePath = mergePathSets(basePath, [relTypeKey]);
            var relIds = [];

            for (var relKey in relTypeInfo) {
                var rel = relTypeInfo[relKey];
                rel.id = _createRelUniqueId(rel);

                if (reqRelIds && reqRelIds.length > 0 && !arrayContains(reqRelIds, rel.id)) {
                    continue;
                }

                relIds.push(rel.id);

                if (caller !== "getRelIdOnly") {
                    response.push.apply(response, _buildRelationshipDetailsResponse(rel, reqData, relBasePath));
                }
            }

            if (caller === "getRelIdOnly") {
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

    var dataObjectsByIdPath = [pathKeys.root, reqData.objType, pathKeys.masterListById];

    //TODO:: NOT using input relFields yet..
    //var relFieldKeys = _getKeyNames(enRel, reqData.relFields);

    var relAttrNames = reqData.relAttrNames;

    var allRelObjFields = Object.keys(enRel);

    for (let relFieldKey of allRelObjFields) {
        if (relFieldKey == "attributes") {
            var relAttributesBasePath = mergePathSets(relBasePath, ["attributes"]);
            var attrs = enRel[relFieldKey];
            if (!isEmpty(attrs) && !isEmpty(relAttrNames)) {
                response.push.apply(response, _buildAttributesResponse(attrs, relAttrNames, relAttributesBasePath));
            }
        }
        else if (relFieldKey == "relToObject") {
            response.push(mergeAndCreatePath(relBasePath, relFieldKey, $ref(mergePathSets(dataObjectsByIdPath, [enRel[relFieldKey].id]))));
        }
        else {
            response.push(mergeAndCreatePath(relBasePath, relFieldKey, $atom(enRel[relFieldKey])));
        }
    }

    return response;
}

function _addCtxGroupToAttributes(attrs, attrNames, ctxGroup) {
    //ctxGroup.source = ctxGroup.locale = CONST_ANY;

    var ctxGroupAttrValues = {
        'values': [{
            ctxGroup
        }]
    };

    attrs['ctxGroup'] = ctxGroupAttrValues;
    attrNames.push('ctxGroup');
}

function buildResponse(dataObject, reqData, basePath) {
    var response = [];

    if (isEmpty(dataObject)) {
        return response;
    }

    if (!isEmpty(reqData.dataObjectFields)) {
        response.push.apply(response, _buildFieldsResponse(dataObject, reqData, basePath));
    }

    if (!(isEmpty(reqData.attrNames) && isEmpty(reqData.relTypes))) {

        if (!dataObject.data) { return response; }
        if (!dataObject.data.ctxInfo) { return response; }

        for (let ctxInfoItem of dataObject.data.ctxInfo) {
            var ctxGroup = ctxInfoItem.ctxGroup;
            var ctxKey = sharedDataObjectFalcorUtil.createCtxKey(ctxGroup);
            var ctxBasePath = mergePathSets(basePath, ['data', 'ctxInfo', ctxKey]);

            //HACK>> pass ctxGroup info as one of the attribute and remove it up in liquid...this is necessary to save one extra RDF call just to get ctxGroup...
            //_addCtxGroupToAttributes(attrs, reqData.attrNames, ctxGroup);
            
            if(!isEmpty(reqData.attrNames)) {
                var attrs = ctxInfoItem.attributes;
                if (!isEmpty(attrs)) {
                    //console.log('attrs', JSON.stringify(attrs));
                    var attrsBasePath = mergePathSets(ctxBasePath, ['attributes']);
                    response.push.apply(response, _buildAttributesResponse(attrs, reqData.attrNames, attrsBasePath));
                }
            }
            
            if(!isEmpty(reqData.relTypes)) {
                var rels = ctxInfoItem.relationships;
                if (!isEmpty(rels)) {
                    var relsBasePath = mergePathSets(ctxBasePath, ['relationships']);
                    response.push.apply(response, _buildRelationshipsResponse(rels, reqData, relsBasePath));
                }
            }
        }
    }

    return response;
}

module.exports = {
    buildResponse: buildResponse,
    createPath: createPath,
    mergeAndCreatePath: mergeAndCreatePath,
    mergePathSets: mergePathSets,
    pathKeys: pathKeys
};