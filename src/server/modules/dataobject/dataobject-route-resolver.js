'use strict';

const jsonGraph = require('falcor-json-graph'),
    $ref = jsonGraph.ref,
    $error = jsonGraph.error,
    $atom = jsonGraph.atom;

const arrayRemove = require('../common/utils/array-remove'),
    arrayContains = require('../common/utils/array-contains'),
    isEmpty = require('../common/utils/isEmpty'),
    uuidV1 = require('uuid/v1');

var falcorUtil = require('../../../shared/dataobject-falcor-util');

const CONST_ALL = falcorUtil.CONST_ALL,
    CONST_ANY = falcorUtil.CONST_ANY,
    CONST_CTX_PROPERTIES = falcorUtil.CONST_CTX_PROPERTIES,
    CONST_DATAOBJECT_METADATA_FIELDS = falcorUtil.CONST_DATAOBJECT_METADATA_FIELDS;

const DataObjectManageService = require('./DataObjectManageService');
const EntityCompositeModelGetService = require('./EntityCompositeModelGetService');

//falcor utilty functions' references
const responseBuilder = require('./dataobject-falcor-response-builder');

const createPath = responseBuilder.createPath,
    buildResponse = responseBuilder.buildResponse,
    formatDataObjectForSave = responseBuilder.formatDataObjectForSave,
    mergeAndCreatePath = responseBuilder.mergeAndCreatePath,
    mergePathSets = responseBuilder.mergePathSets,
    pathKeys = responseBuilder.pathKeys;

var options = {};
var runOffline = process.env.RUN_OFFLINE;

if (runOffline) {
    options.runOffline = runOffline;
}

const dataObjectManageService = new DataObjectManageService(options);
const entityCompositeModelGetService = new EntityCompositeModelGetService(options);

async function initiateSearch(callPath, args) {

    var response = [];
    //console.log(callPath, args);

    var requestId = uuidV1(),
        request = args[0],
        dataIndex = callPath[1],
        basePath = [pathKeys.root, dataIndex, pathKeys.searchResults, requestId];

    var dataIndexInfo = pathKeys.dataIndexInfo[dataIndex];
    request.dataIndex = dataIndex;

    if (request.params) {
        var options = falcorUtil.getOrCreate(request.params, 'options', {});
        options.totalRecords = dataIndexInfo.totalRecordsToReturn || 2000;
    }

    //console.log('request str', JSON.stringify(request, null, 4));

    delete request.params.fields; // while initiating search, we dont want any of the fields to be returned..all we want is resulted ids..

    var res = await dataObjectManageService.get(request);

    //console.log('response raw str', JSON.stringify(res, null, 4));

    var totalRecords = 0;

    var collectionName = dataIndexInfo.collectionName;

    var dataObjectResponse = res ? res[dataIndexInfo.responseObjectName] : undefined;

    if (dataObjectResponse && dataObjectResponse.status == "success") {
        var dataObjects = dataObjectResponse[collectionName];
        var index = 0;
        if (dataObjects !== undefined) {
            totalRecords = dataObjects.length;
            for (let dataObject of dataObjects) {
                if (dataObject.id !== undefined) {
                    var dataObjectType = dataObject.type;
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

    var contexts = falcorUtil.createCtxItems(reqData.ctxKeys);
    var valContexts = falcorUtil.createCtxItems(reqData.valCtxKeys);

    var fields = {
        'ctxTypes': ["properties"]
    };

    if (reqData.operation == "getMappings" && arrayContains(reqData.mapKeys, "attributeMap")) {
        fields.attributes = ['_ALL'];
    }
    else {
        var attrNames = reqData.attrNames;
        if (attrNames !== undefined && attrNames.length > 0) {
            var clonedAttrNames = falcorUtil.cloneObject(attrNames);
            arrayRemove(clonedAttrNames, CONST_DATAOBJECT_METADATA_FIELDS);
            arrayRemove(clonedAttrNames, CONST_CTX_PROPERTIES);
            fields.attributes = clonedAttrNames;
        }
    }

    if (reqData.operation == "getMappings" && arrayContains(reqData.mapKeys, "relationshipMap")) {
        fields.relationships = ['_ALL'];
    }
    else {
        var relTypes = reqData.relTypes;
        if (relTypes !== undefined && relTypes.length > 0) {
            fields.relationships = relTypes;
        }
    }

    var relIds = reqData.relIds;
    if (relIds !== undefined && relIds.length > 0) {
        fields.relIds = relIds;
    }

    if (reqData.operation == "getMappings" && arrayContains(reqData.mapKeys, "relationshipAttributeMap")) {
        fields.relationshipAttributes = ['_ALL'];
    }
    else {
        var relAttrNames = reqData.relAttrNames;
        if (relAttrNames !== undefined && relAttrNames.length > 0) {
            fields.relationshipAttributes = relAttrNames;
        }
    }

    var options = {
        totalRecords: 2000,
        includeRequest: false
    };

    var filters = {};

    if (reqData.dataObjectType) {
        filters.typesCriterion = [ reqData.dataObjectType ];
    }

    var query = {};

    if (!isEmpty(contexts)) {
        query.contexts = contexts;
    }

    if (!isEmpty(valContexts)) {
        query.valueContexts = valContexts;
    }

    if (reqData.dataIndex == "config" && contexts && contexts.length > 0) {
        filters.excludeNonContextual = true;
    }

    if (!isEmpty(filters)) {
        query.filters = filters;
    }

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

function _getService(dataObjectType) {
    if (dataObjectType == 'entityCompositeModel') {
        return entityCompositeModelGetService;
    }
    else {
        return dataObjectManageService;
    }
}

async function get(dataObjectIds, reqData) {
    var response = {};

    var request = createGetRequest(reqData);

    //update dataObject id in request query for current id
    if(dataObjectIds.length > 1) {
        request.params.query.ids = dataObjectIds;
    }
    else {
        request.params.query.id = dataObjectIds[0];
    }

    //console.log('req to api ', JSON.stringify(request));
    var res = undefined;
    //Temp: work in progress for getcoalesce call integration hence placed 1 == 2 condtion to always go to normal get for now
    var isCoalesceGet = false;

    var service = _getService(reqData.dataObjectType);

    //HACK: this is hard coded for now as RDF getcoalesce is not having same behavior as normal get..so calling only when its absoultely needed
    if (request.dataIndex == "entityModel" && 1 == 2) {
        if (!isEmpty(request.params.query.contexts) && (!isEmpty(reqData.attrNames) || !isEmpty(reqData.relationships))) {
            var contexts = request.params.query.contexts;
            if (contexts && contexts.length == 1) {
                var firstContext = contexts[0];
                if (firstContext && firstContext.classification) {
                    res = await service.getCoalesce(request);
                    isCoalesceGet = true;
                }
            }
        }
    }

    if (!isCoalesceGet) {
        res = await service.get(request);
    }

    //console.log('get res from api ', JSON.stringify(res, null, 4));

    var dataObject;
    //console.log(JSON.stringify(pathKeys, null, 4));

    var dataIndexInfo = pathKeys.dataIndexInfo[request.dataIndex];
    var collectionName = dataIndexInfo.collectionName;

    //console.log(dataIndexInfo);
    var dataObjectResponse = res ? res[dataIndexInfo.responseObjectName] : undefined;

    if (dataObjectResponse && dataObjectResponse.status == "success") {
        var dataObjects = dataObjectResponse[collectionName];

        if (dataObjects !== undefined) {
            var byIdsJson = response[pathKeys.byIds] = {};
            for (let dataObject of dataObjects) {
                var dataObjectType = dataObject.type;

                //console.log('building response...', JSON.stringify(dataObject, null, 2));
                var dataObjectResponseJson = buildResponse(dataObject, reqData);

                byIdsJson[dataObject.id] = dataObjectResponseJson;
            }
        }
    }

    //console.log('res', JSON.stringify(response, null, 4));
    return response;
}

async function getByIds(pathSet, operation) {
    /*
    */
    //console.log('---------------------' , operation, ' dataObjectsById call pathset requested:', pathSet, ' operation:', operation);
    var reqDataObjectTypes = pathSet.dataObjectTypes;

    const reqData = {
        'dataIndex': pathSet.dataIndexes[0],
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
        'mapKeys': pathSet.mapKeys == undefined ? [] : pathSet.mapKeys,
        'jsonData': operation == "getJsonData" ? true : false,
        'operation': operation
    }

    var response = {};
    var jsonGraphResponse = response['jsonGraph'] = {};
    var rootJson = jsonGraphResponse[pathKeys.root] = {};
    var dataJson = rootJson[reqData.dataIndex] = {};

    // system flow supports only 1 type at time for bulk get..this is needed to make sure we have specialized code flow for the given data object types
    for (let dataObjectType of reqDataObjectTypes) {
        reqData.dataObjectType = dataObjectType;
        var dataByObjectTypeJson = await get(reqData.dataObjectIds, reqData);
        dataJson[dataObjectType] = dataByObjectTypeJson;
    }

    //console.log('getByIds response ', JSON.stringify(response, null, 4));
    return response;
}

async function processData(dataIndex, dataObjects, dataObjectAction, operation, clientState) {
    //console.log(dataObjectAction, operation);

    var dataIndexInfo = pathKeys.dataIndexInfo[dataIndex];
    
    var response = {};
    var responsePaths = [];
    var jsonGraphResponse = response['jsonGraph'] = {};
    var rootJson = jsonGraphResponse[pathKeys.root] = {};
    var dataJson = rootJson[dataIndex] = {};

    for (var dataObjectId in dataObjects) {
        var dataObject = dataObjects[dataObjectId];
        formatDataObjectForSave(dataObject);
        //console.log('dataObject data', JSON.stringify(dataObject, null, 4));

        var apiRequestObj = { 'includeRequest': false, 'dataIndex': dataIndex, 'clientState': clientState };
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

            var dataObjectType = dataObject.type;
            var basePath = [pathKeys.root, dataIndex, dataObjectType, pathKeys.byIds, dataObjectId];

            var reqData = {
                'dataIndex': dataIndex,
                'dataObjectType': CONST_ALL,
                'dataObjectFields': [CONST_ALL],
                'attrNames': [CONST_ALL],
                'relTypes': [CONST_ALL],
                'relAttrNames': [CONST_ALL],
                'relFields': [CONST_ALL],
                'valFields': [CONST_ALL],
                'mapKeys': [CONST_ALL],
                'jsonData': true,
                'operation': operation,
                'buildPaths': true,
                'basePath': basePath
            };

            
            var dataByObjectTypeJson = dataJson[dataObjectType];
            var byIdsJson;

            if(dataByObjectTypeJson == undefined || dataByObjectTypeJson == null){
                dataByObjectTypeJson = dataJson[dataObjectType] = {};
                byIdsJson = dataByObjectTypeJson[pathKeys.byIds] = {};
            }
            else {
                byIdsJson = dataByObjectTypeJson[pathKeys.byIds];
            }

            var dataObjectResponseJson = buildResponse(dataObject, reqData, responsePaths);
            byIdsJson[dataObjectId] = dataObjectResponseJson;
        }
    }

    response['paths'] = responsePaths;

    //console.log(JSON.stringify(response, null, 4));
    return response;
}

async function create(callPath, args, operation) {

    var jsonEnvelope = args[0];
    var dataIndex = callPath.dataIndexes[0];
    var dataObjectType = callPath.dataObjectTypes[0]; //TODO: need to support for bulk..
    var dataObjects = jsonEnvelope.json[pathKeys.root][dataIndex][dataObjectType][pathKeys.byIds];
    var clientState = jsonEnvelope.json.clientState;
    var dataObjectIds = Object.keys(dataObjects);
    //console.log(dataObjects);

    //TODO: made showNotificationToUser flag false for entity create till we decide how it has to be.
    if (clientState && clientState.notificationInfo) {
        clientState.notificationInfo.showNotificationToUser = false;
    }

    // create new guids for the dataObjects to be created..
    for (let dataObjectId of dataObjectIds) {
        var dataObject = dataObjects[dataObjectId];

        if (dataObject.id == undefined || dataObject.id == "") {
            var newDataObjectId = uuidV1();
            //console.log('new dataObject id', newDataObjectId);
            dataObject.id = newDataObjectId;
        }
    }

    return processData(dataIndex, dataObjects, "create", operation, clientState);
}

async function update(callPath, args, operation) {

    var jsonEnvelope = args[0];
    var dataIndex = callPath.dataIndexes[0];
    var dataObjectType = callPath.dataObjectTypes[0]; //TODO: need to support for bulk..
    var dataObjects = jsonEnvelope.json[pathKeys.root][dataIndex][dataObjectType][pathKeys.byIds];
    var clientState = jsonEnvelope.json.clientState;

    return processData(dataIndex, dataObjects, "update", operation, clientState);
}

async function deleteDataObjects(callPath, args, operation) {

    var jsonEnvelope = args[0];
    var dataIndex = callPath.dataIndexes[0];
    var dataObjects = jsonEnvelope.json[pathKeys.root][dataIndex][pathKeys.byIds];
    var clientState = jsonEnvelope.json.clientState;

    return processData(dataIndex, dataObjects, "delete", operation, clientState);
}

module.exports = {
    initiateSearch: initiateSearch,
    getSearchResultDetail: getSearchResultDetail,
    getByIds: getByIds,
    create: create,
    update: update,
    deleteDataObjects: deleteDataObjects
};