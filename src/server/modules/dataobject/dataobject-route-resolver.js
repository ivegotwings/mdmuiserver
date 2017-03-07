'use strict';

const jsonGraph = require('falcor-json-graph'),
    $ref = jsonGraph.ref,
    $error = jsonGraph.error,
    $atom = jsonGraph.atom;

const arrayUnion = require('../common/utils/array-union'),
    uuidV1 = require('uuid/v1');

var sharedDataObjectFalcorUtil = require('../../../shared/dataobject-falcor-util');
const CONST_ALL = sharedDataObjectFalcorUtil.CONST_ALL,
    CONST_ANY = sharedDataObjectFalcorUtil.CONST_ANY;

const DataObjectManageService = require('./DataObjectManageService');

//falcor utilty functions' references
const futil = require('./dataobject-falcor-utils');

const createPath = futil.createPath,
    buildResponse = futil.buildResponse,
    mergeAndCreatePath = futil.mergeAndCreatePath,
    mergePathSets = futil.mergePathSets,
    pathKeys = futil.pathKeys;

var options = {};
var runOffline = process.env.RUN_OFFLINE;

if (runOffline) {
    options.runOffline = runOffline;
}

const dataObjectManageService = new DataObjectManageService(options);

async function initiateSearch(callPath, args) {

    var response = [];
    //console.log(callPath, args);

    var requestId = uuidV1(),
        request = args[0],
        dataIndex = callPath[1],
        basePath = [pathKeys.root, dataIndex, pathKeys.searchResults, requestId];

    request.dataIndex = dataIndex;
    //console.log('request str', JSON.stringify(request, null, 4));

    delete request.params.fields; // while initiating search, we dont want any of the fields to be returned..all we want is resulted ids..

    var res = await dataObjectManageService.get(request);

    //console.log('response raw str', JSON.stringify(res, null, 4));

    var totalRecords = 0;

    var dataIndexInfo = pathKeys.dataIndexInfo[dataIndex];
    var collectionName = dataIndexInfo.collectionName;

    var dataObjectResponse = res ? res[dataIndexInfo.responseObjectName] : undefined;

    if (dataObjectResponse && dataObjectResponse.status == "success") {
        var dataObjects = dataObjectResponse[collectionName];
        var index = 0;
        if (dataObjects !== undefined) {
            totalRecords = dataObjects.length;
            for (let dataObject of dataObjects) {
                if (dataObject.id !== undefined) {
                    var dataObjectType = dataObject[dataIndexInfo.typeInfo][dataIndexInfo.typeName];
                    var dataObjectsByIdPath = [pathKeys.root, dataIndex, dataObjectType, pathKeys.byIds];
                    response.push(mergeAndCreatePath(basePath, [pathKeys.searchResultItems, index++], $ref(mergePathSets(dataObjectsByIdPath, [dataObject.id]))));
                }
            }
        }
    }
    else {
        //response.push(createPath(['searchResults', requestId], $error('data not found in system'), 0));
    }

    response.push(mergeAndCreatePath(basePath, ["totalRecords"], $atom(totalRecords)));
    response.push(mergeAndCreatePath(basePath, ["requestId"], $atom(requestId)));
    //response.push(mergeAndCreatePath(basePath, ["request"], $atom(request)));

    //console.log(JSON.stringify(response));   
    return response;
}

async function getSearchResultDetail(pathSet) {

    var response = [];
    //console.log(pathSet.requestIds, pathSet.dataObjectRanges);

    var requestId = pathSet.requestIds[0];
    //console.log(requestId);
    var dataIndex = pathSet[1],
        basePath = [pathKeys.root, dataIndex];

    response.push(mergeAndCreatePath(basePath, [pathKeys.searchResults, requestId], $error('search result is expired. Retry the search operation.')));

    return response;
}

function createGetRequest(reqData) {

    var ctxGroups = sharedDataObjectFalcorUtil.createCtxItems(reqData.ctxKeys);
    var valCtxGroups = sharedDataObjectFalcorUtil.createCtxItems(reqData.valCtxKeys);

    var fields = {
        ctxTypes: ["properties"]
    };

    var attrNames = reqData.attrNames;
    if (attrNames !== undefined && attrNames.length > 0) {
        fields.attributes = attrNames;
    }

    var relTypes = reqData.relTypes;
    if (relTypes !== undefined && relTypes.length > 0) {
        fields.relationships = relTypes;
    }

    var relIds = reqData.relIds;
    if (relIds !== undefined && relIds.length > 0) {
        fields.relIds = relIds;
    }

    var relAttrNames = reqData.relAttrNames;
    if (relAttrNames !== undefined && relAttrNames.length > 0) {
        fields.relationshipAttributes = relAttrNames;
    }

    var options = {
        totalRecords: 1,
        includeRequest: false
    };

    var filters = {};

    if (reqData.dataObjectTypes) {
        filters.typesCriterion = reqData.dataObjectTypes;
    }

    var query = {
        ctx: ctxGroups,
        valCtx: valCtxGroups,
        filters: filters,
        id: ''
    };

    var params = {
        query: query,
        fields: fields,
        options: options
    };

    var request = {
        dataIndex: reqData.dataIndex,
        params: params
    };

    return request;
}

async function getSingle(dataObjectId, reqData) {

    var response = [];

    var request = createGetRequest(reqData);

    //update dataObject id in request query for current id
    request.params.query.id = dataObjectId;

    //console.log('req to api ', JSON.stringify(request));
    var res = await dataObjectManageService.get(request);
    //console.log(JSON.stringify(res, null, 4));

    var basePath = [pathKeys.root, reqData.dataIndex];
    var dataObject;
    //console.log(JSON.stringify(pathKeys, null, 4));

    var dataIndexInfo = pathKeys.dataIndexInfo[request.dataIndex];
    var collectionName = dataIndexInfo.collectionName;

    //console.log(dataIndexInfo);
    var dataObjectResponse = res ? res[dataIndexInfo.responseObjectName] : undefined;

    if (dataObjectResponse && dataObjectResponse.status == "success") {
        var dataObjects = dataObjectResponse[collectionName];

        if (dataObjects !== undefined) {
            for (let dataObject of dataObjects) {
                var dataObjectType = dataObject[dataIndexInfo.typeInfo][dataIndexInfo.typeName];
                var dataObjectBasePath = mergePathSets(basePath, dataObjectType, pathKeys.byIds, dataObject.id);

                if (dataObject.id == dataObjectId) {

                    response.push.apply(response, buildResponse(dataObject, reqData, dataObjectBasePath));
                }
            }
        }
    }

    if (dataObject === undefined) {
        //response.push(createPath([pathRootKey, dataObjectId], $error(dataObjectId + ' is not found in system for the requested context'), 0));
    }

    //console.log('res', JSON.stringify(response, null, 4));
    return response;
}

async function getByIds(pathSet, caller) {
    /*
    */
    //console.log('---------------------' , caller, ' dataObjectsById call pathset requested:', pathSet, ' caller:', caller);
    const reqData = {
        'dataIndex': pathSet.dataIndexes[0],
        'dataObjectTypes': pathSet.dataObjectTypes,
        'dataObjectIds': pathSet.dataObjectIds,
        'dataObjectFields': pathSet.dataObjectFields === undefined ? [] : pathSet.dataObjectFields,
        'ctxKeys': pathSet.ctxKeys === undefined ? [] : pathSet.ctxKeys,
        'attrNames': pathSet.attrNames === undefined ? [] : pathSet.attrNames,
        'relTypes': pathSet.relTypes === undefined ? [] : pathSet.relTypes,
        'relAttrNames': pathSet.relAttrNames === undefined ? [] : pathSet.relAttrNames,
        'relIds': pathSet.relIds === undefined ? [] : pathSet.relIds,
        'relFields': pathSet.relFields === undefined ? [] : pathSet.relFields,
        'valCtxKeys': pathSet.valCtxKeys === undefined ? [] : pathSet.valCtxKeys,
        'valFields': pathSet.valFields === undefined ? [] : pathSet.valFields,
        'caller': caller
    }

    var response = [];
    //console.log('reqData', JSON.stringify(reqData));

    for (let dataObjectId of reqData.dataObjectIds) {
        var singleDataObjectResponse = await getSingle(dataObjectId, reqData);
        response.push.apply(response, singleDataObjectResponse);
    }

    //console.log('getDataObjects response :', JSON.stringify(response, null, 4));
    return response;
}

async function processData(dataIndex, dataObjects, dataObjectAction, caller) {
    //console.log(dataObjectAction, caller);

    var dataIndexInfo = pathKeys.dataIndexInfo[dataIndex];
    var response = [];

    var basePath = [pathKeys.root, dataIndex];

    for (var dataObjectId in dataObjects) {
        var dataObject = sharedDataObjectFalcorUtil.boxDataObject(dataObjects[dataObjectId], sharedDataObjectFalcorUtil.unboxJsonObject);
        //console.log('dataObject data', JSON.stringify(dataObject, null, 4));

        //TODO: temporarily as RDF is still working on to make domain optional..
        if (dataObject.entityInfo) {
            dataObject.entityInfo.entityDomain = "thing";
        }

        var apiRequestObj = { 'includeRequest': false, 'dataIndex': dataIndex };
        apiRequestObj[dataIndexInfo.name] = dataObject;
        //console.log('api request data for process dataObjects', JSON.stringify(apiRequestObj));

        var dataOperationResponse = {};

        if (dataObjectAction == "create") {
            dataOperationResponse = await dataObjectManageService.create(apiRequestObj);
        }
        else if (dataObjectAction == "update") {
            dataOperationResponse = await dataObjectManageService.update(apiRequestObj);
        }
        else if (dataObjectAction == "delete") {
            dataOperationResponse = await dataObjectManageService.deleteDataObjects(apiRequestObj);
        }
        //console.log('dataObject api UPDATE raw response', JSON.stringify(dataOperationResponse, null, 4));

        if (dataObject) {

            var reqData = {
                'dataIndex': dataIndex,
                'dataObjectTypes': [CONST_ALL],
                'dataObjectFields': [CONST_ALL],
                'attrNames': [CONST_ALL],
                'relTypes': [CONST_ALL],
                'relAttrNames': [CONST_ALL],
                'relFields': [CONST_ALL],
                'valFields': [CONST_ALL],
                'caller': caller
            };

            var dataObjectType = dataObject[dataIndexInfo.typeInfo][dataIndexInfo.typeName];
            var dataObjectBasePath = mergePathSets(basePath, dataObjectType, pathKeys.byIds, dataObjectId);
            response.push.apply(response, buildResponse(dataObject, reqData, dataObjectBasePath));
        }
    }

    //console.log(JSON.stringify(response, null, 4));
    return response;
}

async function create(callPath, args, caller) {

    var jsonEnvelope = args[0];
    var dataIndex = callPath.dataIndexes[0];
    var dataObjectType = callPath.dataObjectTypes[0]; //TODO: need to support for bulk..
    var dataObjects = jsonEnvelope.json[pathKeys.root][dataIndex][dataObjectType][pathKeys.byIds];
    var dataObjectIds = Object.keys(dataObjects);
    //console.log(dataObjects);

    // create new guids for the dataObjects to be created..
    for (let dataObjectId of dataObjectIds) {
        var dataObject = dataObjects[dataObjectId];

        if (dataObject.id == undefined || dataObject.id == "") {
            var newDataObjectId = uuidV1();
            //console.log('new dataObject id', newDataObjectId);
            dataObject.id = newDataObjectId;
        }
    }

    return processData(dataIndex, dataObjects, "create", caller);
}

async function update(callPath, args, caller) {

    var jsonEnvelope = args[0];
    var dataIndex = callPath.dataIndexes[0];
    var dataObjectType = callPath.dataObjectTypes[0]; //TODO: need to support for bulk..
    var dataObjects = jsonEnvelope.json[pathKeys.root][dataIndex][dataObjectType][pathKeys.byIds];

    return processData(dataIndex, dataObjects, "update", caller);
}

async function deleteDataObjects(callPath, args, caller) {

    var jsonEnvelope = args[0];
    var dataIndex = callPath.dataIndexes[0];
    var dataObjects = jsonEnvelope.json[pathKeys.root][dataIndex][pathKeys.byIds];
    return processData(dataIndex, dataObjects, "delete", caller);
}

module.exports = {
    initiateSearch: initiateSearch,
    getSearchResultDetail: getSearchResultDetail,
    getByIds: getByIds,
    create: create,
    update: update,
    deleteDataObjects: deleteDataObjects
};