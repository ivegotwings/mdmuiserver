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
const EventService = require('../event-service/EventService');

//falcor utilty functions' references
const responseBuilder = require('./dataobject-falcor-response-builder');

const createPath = responseBuilder.createPath,
    buildResponse = responseBuilder.buildResponse,
    buildErrorResponse = responseBuilder.buildErrorResponse,
    buildRefResponse = responseBuilder.buildRefResponse,
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
const eventService = new EventService(options);

async function initiateSearch(callPath, args) {
    var response = [];
    var isCombinedQuerySearch = false;

    try {

        //console.log(callPath, args);

        var requestId = uuidV1(),
            request = args[0],
            dataIndex = callPath[1],
            basePath = [pathKeys.root, dataIndex, pathKeys.searchResults, requestId];

        var dataIndexInfo = pathKeys.dataIndexInfo[dataIndex];
        request.dataIndex = dataIndex;

        var operation = request.operation || "search";

        var maxRecordsSupported = dataIndexInfo.maxRecordsToReturn || 2000;

        if (request.params) {
            if (request.params.isCombinedQuerySearch) {
                isCombinedQuerySearch = true;
                delete request.params.isCombinedQuerySearch;

                if (request.params.options) {
                    delete request.params.options;
                }

                request.params.pageSize = dataIndexInfo.combinedQueryPageSize || 500;

                //Identify the last executable query...
                if (request.entity && request.entity.data && request.entity.data.jsonData) {
                    var searchQueries = request.entity.data.jsonData.searchQueries;

                    if (searchQueries) {
                        var currentSearchQuerysequence = 0;
                        var highestSeqSearchQuery = undefined;
                        for (var i = 0; i < searchQueries.length; i++) {
                            var searchQuery = searchQueries[i];

                            if (searchQuery.searchQuery && searchQuery.searchQuery.options) {
                                delete searchQuery.searchQuery.options;
                            }

                            if (searchQuery.searchSequence >= currentSearchQuerysequence) {
                                highestSeqSearchQuery = searchQuery;
                                currentSearchQuerysequence = searchQuery.searchSequence;
                            }
                        }

                        if (highestSeqSearchQuery) {
                            var options = falcorUtil.getOrCreate(highestSeqSearchQuery.searchQuery, 'options', {});
                            options.maxRecords = maxRecordsSupported;
                        }
                    }
                }
            } else {
                var options = falcorUtil.getOrCreate(request.params, 'options', {});
                options.maxRecords = maxRecordsSupported;
            }
        }

        if (operation === "initiatesearchandgetcount") {
            options.maxRecords = 1; // Do not load entity ids and types if only count is requested..
        }

        var dataObjectType = undefined;

        if (request.params.query && request.params.query.filters &&
            request.params.query.filters.typesCriterion && request.params.query.filters.typesCriterion.length) {
            dataObjectType = request.params.query.filters.typesCriterion[0]; // pick first object type..
        }

        var service = _getService(dataObjectType);

        if (service != eventService) {
            //console.log('request str', JSON.stringify(request, null, 4));
            delete request.params.fields; // while initiating search, we dont want any of the fields to be returned..all we want is resulted ids..
        }

        var res = undefined;
        if (isCombinedQuerySearch) {
            res = await service.getCombined(request);
        } else {
            res = await service.get(request);
        }

        // console.log('response raw str', JSON.stringify(res, null, 4));
        var totalRecords = 0;

        var resultRecordSize = 0;

        var collectionName = dataIndexInfo.collectionName;

        var dataObjectResponse = res ? res[dataIndexInfo.responseObjectName] : undefined;

        if (dataObjectResponse && dataObjectResponse.status == "success") {
            //     console.log('collection name ', JSON.stringify(collectionName, null, 4));
            var dataObjects = dataObjectResponse[collectionName];
            var index = 0;

            if (dataObjects !== undefined) {
                totalRecords = dataObjectResponse.totalRecords;

                var additionalIdsRequested = [];
                if (!request.params.query || !request.params.query.filters || (!request.params.query.filters.attributesCriterion && !request.params.query.filters.keywordsCriterion)) {
                    if (dataObjectType && request.params.additionalIds && request.params.additionalIds.length > 0) {
                        additionalIdsRequested = request.params.additionalIds;

                        for (let additionalId of additionalIdsRequested) {
                            var dataObjectsByIdPath = [pathKeys.root, dataIndex, dataObjectType, pathKeys.byIds];
                            response.push(mergeAndCreatePath(basePath, [pathKeys.searchResultItems, index++], $ref(mergePathSets(dataObjectsByIdPath, [additionalId]))));
                        }
                    }
                }

                if (operation === "search") {
                    if (additionalIdsRequested) {
                        resultRecordSize = additionalIdsRequested.length;
                    }

                    for (let dataObject of dataObjects) {
                        if (dataObject.id !== undefined) {
                            if (additionalIdsRequested.indexOf(dataObject.id) < 0) {
                                var dataObjectType = dataObject.type;
                                var dataObjectsByIdPath = [pathKeys.root, dataIndex, dataObjectType, pathKeys.byIds];
                                response.push(mergeAndCreatePath(basePath, [pathKeys.searchResultItems, index++], $ref(mergePathSets(dataObjectsByIdPath, [dataObject.id]))));
                                resultRecordSize++;
                            }
                        }
                    }
                }
            }
        }
        else if (dataObjectResponse && dataObjectResponse.status == 'error') {
            if (dataObjectResponse.statusDetail) {
                if (dataObjectResponse.statusDetail.messages) {
                    var firstAvailableError = dataObjectResponse.statusDetail.messages[0];
                    if (firstAvailableError) {
                        throw firstAvailableError;
                    }
                }
                else if (dataObjectResponse.statusDetail.message) {
                    throw new Error(dataObjectResponse.statusDetail.message);
                }
            }
        }
        response.push(mergeAndCreatePath(basePath, ["maxRecords"], $atom(maxRecordsSupported)));
        response.push(mergeAndCreatePath(basePath, ["totalRecords"], $atom(totalRecords)));
        response.push(mergeAndCreatePath(basePath, ["resultRecordSize"], $atom(resultRecordSize)));
        response.push(mergeAndCreatePath(basePath, ["requestId"], $atom(requestId)));
        //response.push(mergeAndCreatePath(basePath, ["request"], $atom(request)));
    }
    catch (err) {
        response = buildErrorResponse(err, "Failed to get search results.");
    }
    finally {
    }

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

    var fields = {};

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
        maxRecords: 2000
    };

    var filters = {};

    if (reqData.dataObjectType) {
        filters.typesCriterion = [reqData.dataObjectType];
    }

    var query = {};

    if (!isEmpty(contexts)) {
        query.contexts = contexts;
    }

    if (!isEmpty(valContexts)) {
        for(let valContext of valContexts) {
            valContext.localeCoalesce = true;
        }
        
        query.valueContexts = valContexts;
    }

    if (reqData.dataIndex == "config" && contexts && contexts.length > 0) {
        filters.excludeNonContextual = true;
        fields.attributes = ['_ALL'];
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
    else if (dataObjectType == "externalevent" || dataObjectType == "bulkoperationevent") {
        return eventService;
    }
    else {
        return dataObjectManageService;
    }
}

async function get(dataObjectIds, reqData) {
    var response = {};
    var operation = reqData.operation;

    try {
        var res = undefined;
        var isCoalesceGet = false;
        var isNearestGet = false;

        var service = _getService(reqData.dataObjectType);

        var request = createGetRequest(reqData);

        if (request.dataIndex == "entityModel" && reqData.dataObjectType == 'entityCompositeModel') {
            if (!isEmpty(request.params.query.contexts)) {

                isCoalesceGet = true;
            }
        }
        else if (request.dataIndex == "config" && reqData.dataObjectType == 'uiConfig') {
            if (!isEmpty(request.params.query.contexts)) {
                var contexts = request.params.query.contexts;
                if (contexts && contexts.length > 0) {
                    isNearestGet = true;
                }
            }
        }

        //TURNING OFF THIS FEATURE TILL RDF FINISHES ITS WORK
        isNearestGet = false;

        //Populate dataObject id in request query...
        //Nearest get is based on context and not Ids. Hence skipping Id population for request get
        if (!isNearestGet) {
            if (dataObjectIds.length > 1) {
                for (var idx in dataObjectIds) {
                    dataObjectIds[idx] = dataObjectIds[idx].toString();
                }

                request.params.query.ids = dataObjectIds;
            }
            else {
                request.params.query.id = dataObjectIds[0].toString();
            }
        }

        //console.log('req to api ', JSON.stringify(request));

        if (isCoalesceGet) {
            res = await service.getCoalesce(request);
        }
        else if (isNearestGet) {
            res = await service.getNearest(request);
        }
        else {
            res = await service.get(request);
        }

        //console.log('get res from api ', JSON.stringify(res, null, 4));

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

                if (isNearestGet) {
                    //In case of nearest get, comapare requested Id with nearest object Id resulted from response...
                    //If ids are not same then the response is for nearest context and hence populate as $ref in response Json

                    //Nearest get should always return first nearest object hence considering first requested Id and first dataObject in response...
                    var requestedId = dataObjectIds[0];
                    var dataObject = dataObjects[0];

                    if (!isEmpty(dataObject) && requestedId != dataObject.id) {
                        //populate as ref...
                        byIdsJson[requestedId] = buildRefResponse(dataObject, reqData);
                    }
                }
            }
        }
    }
    catch (err) {
        console.log('Failed to get data.\nOperation:', operation, '\nError:', err.message, '\nStackTrace:', err.stack);
        throw err;
    }
    finally {
    }
    //console.log('res', JSON.stringify(response, null, 4));
    return response;
}

async function getByIds(pathSet, operation) {

    var response = {};

    try {

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

        var jsonGraphResponse = response['jsonGraph'] = {};
        var rootJson = jsonGraphResponse[pathKeys.root] = {};
        var dataJson = rootJson[reqData.dataIndex] = {};

        // system flow supports only 1 type at time for bulk get..this is needed to make sure we have specialized code flow for the given data object types
        for (let dataObjectType of reqDataObjectTypes) {
            reqData.dataObjectType = dataObjectType;
            var dataByObjectTypeJson = await get(reqData.dataObjectIds, reqData);
            dataJson[dataObjectType] = dataByObjectTypeJson;
        }
    }
    catch (err) {
        console.log('Failed to get data.\nOperation:', operation, '\nError:', err.message, '\nStackTrace:', err.stack);
        throw err;
    }
    finally {
    }

    //console.log('getByIds response ', JSON.stringify(response, null, 4));
    return response;
}

async function processData(dataIndex, dataObjects, dataObjectAction, operation, clientState) {
    //console.log(dataObjectAction, operation);
    var response = {};
    try {
        var dataIndexInfo = pathKeys.dataIndexInfo[dataIndex];

        var responsePaths = [];
        var jsonGraphResponse = response['jsonGraph'] = {};
        var rootJson = jsonGraphResponse[pathKeys.root] = {};
        var dataJson = rootJson[dataIndex] = {};

        for (var dataObjectId in dataObjects) {
            var dataObject = dataObjects[dataObjectId];
            formatDataObjectForSave(dataObject);

            //Extract original rel ids from request dataobject if relationships are requested for process.
            var originalRelIds = _getOriginalRelIds(dataObject);

            //console.log('dataObject data', JSON.stringify(dataObject, null, 4));

            var apiRequestObj = { 'dataIndex': dataIndex, 'clientState': clientState };
            apiRequestObj[dataIndexInfo.name] = dataObject;

            //Added hotline to api request only when it is true
            if (clientState.hotline) {
                apiRequestObj["hotline"] = clientState.hotline;
            }
            //Hotline set to api request, so delete from clientState
            delete clientState.hotline;

            if (dataObjectAction == "create" || dataObjectAction == "update") {
                _prependAuthorizationType(apiRequestObj);
            }
            //console.log('api request data for process dataObjects', JSON.stringify(apiRequestObj));
            var dataOperationResult = {};

            if (dataObjectAction == "create") {
                dataOperationResult = await dataObjectManageService.create(apiRequestObj);
            }
            else if (dataObjectAction == "update") {
                dataOperationResult = await dataObjectManageService.update(apiRequestObj);
            }
            else if (dataObjectAction == "delete") {
                dataOperationResult = await dataObjectManageService.deleteDataObjects(apiRequestObj);
            }
            //console.log('dataObject api UPDATE raw response', JSON.stringify(dataOperationResult, null, 4));

            if (dataOperationResult && !isEmpty(dataOperationResult)) {
                var responsePath = pathKeys.dataIndexInfo[dataIndex].responseObjectName;
                var dataOperationResponse = dataOperationResult[responsePath];
                if (dataOperationResponse && dataOperationResponse.status == 'success') {
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
                            'originalRelIds': originalRelIds,
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

                        if (dataByObjectTypeJson == undefined || dataByObjectTypeJson == null) {
                            dataByObjectTypeJson = dataJson[dataObjectType] = {};
                            byIdsJson = dataByObjectTypeJson[pathKeys.byIds] = {};
                        }
                        else {
                            byIdsJson = dataByObjectTypeJson[pathKeys.byIds];
                        }

                        var dataObjectResponseJson = buildResponse(dataObject, reqData, responsePaths);
                        byIdsJson[dataObjectId] = dataObjectResponseJson;

                        response['paths'] = responsePaths;
                    }
                }
                else if (dataOperationResponse && dataOperationResponse.status == 'error') {
                    if (dataOperationResponse.statusDetail) {
                        if (dataOperationResponse.statusDetail.messages) {
                            var firstAvailableError = dataOperationResponse.statusDetail.messages[0];
                            if (firstAvailableError) {
                                throw firstAvailableError;
                            }
                        }
                        else if (dataOperationResponse.statusDetail.message) {
                            throw new Error(dataOperationResponse.statusDetail.message);
                        }
                    }
                }
            }
        }
    }
    catch (err) {
        response = buildErrorResponse(err, "Failed to submit " + operation + " request.");
    }
    finally {
    }

    //console.log(JSON.stringify(response, null, 4));
    return response;
}

async function create(callPath, args, operation) {

    var response;

    try {
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

        response = processData(dataIndex, dataObjects, "create", operation, clientState);
    }
    catch (err) {
        response = buildErrorResponse(err, "Failed to submit create request.");
    }
    finally {
    }

    return response;
}

async function update(callPath, args, operation) {

    var response;

    try {
        var jsonEnvelope = args[0];
        var dataIndex = callPath.dataIndexes[0];
        var dataObjectType = callPath.dataObjectTypes[0]; //TODO: need to support for bulk..
        var dataObjects = jsonEnvelope.json[pathKeys.root][dataIndex][dataObjectType][pathKeys.byIds];
        var clientState = jsonEnvelope.json.clientState;

        response = processData(dataIndex, dataObjects, "update", operation, clientState);
    }
    catch (err) {
        response = buildErrorResponse(err, "Failed to submit update request.");
    }
    finally {
    }

    return response;
}

async function deleteDataObjects(callPath, args, operation) {

    var response;

    try {
        var jsonEnvelope = args[0];
        var dataIndex = callPath.dataIndexes[0];
        var dataObjectType = callPath.dataObjectTypes[0]; //TODO: need to support for bulk..
        var dataObjects = jsonEnvelope.json[pathKeys.root][dataIndex][dataObjectType][pathKeys.byIds];
        var clientState = jsonEnvelope.json.clientState;

        response = processData(dataIndex, dataObjects, "delete", operation, clientState);
    }
    catch (err) {
        response = buildErrorResponse(err, "Failed to submit delete request.");
    }
    finally {
    }

    return response;
}

function _getOriginalRelIds(dataObject) {
    var originalRelIds;

    if (dataObject.data && dataObject.data.relationships) {
        var rels = dataObject.data.relationships;

        if (rels.originalRelIds) {
            originalRelIds = rels.originalRelIds;
            delete rels.originalRelIds;
        }
    }

    return originalRelIds;
}

function _prependAuthorizationType(reqObject) {
    if (reqObject.params) {
        reqObject.params["authorizationType"] = "accommodate";
    } else {
        reqObject.params = {
            "authorizationType": "accommodate"
        };
    }
}

module.exports = {
    initiateSearch: initiateSearch,
    getSearchResultDetail: getSearchResultDetail,
    getByIds: getByIds,
    create: create,
    update: update,
    deleteDataObjects: deleteDataObjects
};
