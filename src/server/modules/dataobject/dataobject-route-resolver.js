'use strict';

const jsonGraph = require('falcor-json-graph'),
    $ref = jsonGraph.ref,
    $error = jsonGraph.error,
    $atom = jsonGraph.atom;

const arrayRemove = require('../common/utils/array-remove'),
    arrayContains = require('../common/utils/array-contains'),
    isEmpty = require('../common/utils/isEmpty'),
    uuidV1 = require('uuid/v1');

let falcorUtil = require('../../../shared/dataobject-falcor-util');

const CONST_ALL = falcorUtil.CONST_ALL,
    CONST_ANY = falcorUtil.CONST_ANY,
    CONST_CTX_PROPERTIES = falcorUtil.CONST_CTX_PROPERTIES,
    CONST_DATAOBJECT_METADATA_FIELDS = falcorUtil.CONST_DATAOBJECT_METADATA_FIELDS;

const DataObjectManageService = require('../services/data-service/DataObjectManageService');
const ConfigurationService = require('../services/configuration-service/ConfigurationService');
const EntityCompositeModelGetService = require('../services/model-service/EntityCompositeModelGetService');
const EventService = require('../services/event-service/EventService');
const EntityHistoryEventService = require('../services/event-service/EntityHistoryEventService');
const DataObjectLineageService = require("../services/data-service/DataObjectLineageService");
const BaseModelService = require("../services/model-service/BaseModelService");

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

let options = {};
let runOffline = process.env.RUN_OFFLINE;

if (runOffline) {
    options.runOffline = runOffline;
}

const dataObjectManageService = new DataObjectManageService(options);
const entityCompositeModelGetService = new EntityCompositeModelGetService(options);
const configurationService = new ConfigurationService.ConfigurationService(options);
const eventService = new EventService(options);
const entityHistoryEventService = new EntityHistoryEventService(options);
const dataObjectLineageService = new DataObjectLineageService(options);
const baseModelService = new BaseModelService(options);

const searchResultExpireTime = -30 * 60 * 1000;

const logger = require('../common/logger/logger-service');

async function initiateSearch(callPath, args) {
    let response = [];
    let isCombinedQuerySearch = false;
    let isRelatedEntitySearch = false;

    try {

        //console.log(callPath, args);

        let requestId = uuidV1(),
            request = args[0],
            
            dataIndex = callPath[1],
            basePath = [pathKeys.root, dataIndex, pathKeys.searchResults, requestId];

        let origRequest = falcorUtil.cloneObject(request);

        let dataIndexInfo = pathKeys.dataIndexInfo[dataIndex];

        request.dataIndex = dataIndex;

        let operation = request.operation || "search";
        let _maxRecords = undefined;
        if(request.params.options && request.params.options.maxRecords){
            _maxRecords = request.params.options.maxRecords;
        }
        let maxRecordsSupported = _maxRecords || dataIndexInfo.maxRecordsToReturn || 2000;

        let options = {};

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
                    let searchQueries = request.entity.data.jsonData.searchQueries;

                    if (searchQueries) {
                        let currentSearchQuerysequence = 0;
                        let highestSeqSearchQuery = undefined;
                        for (let i = 0; i < searchQueries.length; i++) {
                            let searchQuery = searchQueries[i];

                            if (searchQuery.searchQuery && searchQuery.searchQuery.options) {
                                delete searchQuery.searchQuery.options;
                            }

                            if (searchQuery.searchSequence >= currentSearchQuerysequence) {
                                highestSeqSearchQuery = searchQuery;
                                currentSearchQuerysequence = searchQuery.searchSequence;
                            }
                        }

                        if (highestSeqSearchQuery) {
                            options = falcorUtil.getOrCreate(highestSeqSearchQuery.searchQuery, 'options', {});
                            options.maxRecords = maxRecordsSupported;
                        }
                    }
                }
            } else {
                if (request.params.isRelatedEntitySearch) {
                    isRelatedEntitySearch = true;
                    delete request.params.isRelatedEntitySearch;
                }

                options = falcorUtil.getOrCreate(request.params, 'options', {});
                options.maxRecords = maxRecordsSupported;
            }
        }

        if (operation === "initiatesearchandgetcount") {
            options.maxRecords = 1; // Do not load entity ids and types if only count is requested..
        }

        let dataObjectType = undefined;

        if (request.params.query && request.params.query.filters &&
            request.params.query.filters.typesCriterion && request.params.query.filters.typesCriterion.length) {
            dataObjectType = request.params.query.filters.typesCriterion[0]; // pick first object type..
        }

        let service = _getService(dataObjectType, true, dataIndex);

        if (service != eventService) {
            //console.log('request str', JSON.stringify(request, null, 4));
            delete request.params.fields; // while initiating search, we dont want any of the fields to be returned..all we want is resulted ids..

            //Remove value contexts if there are no filters defined other than typesCriterion
            //This is needed to improve the performance of search/get functionality
            if (request.params.query && request.params.query.filters && request.params.query.valueContexts) {
                let removeValueContexts = true;
                let filters = request.params.query.filters;
                for (let criterionKey in filters) {
                    if (criterionKey != "typesCriterion" && !isEmpty(filters[criterionKey])) {
                        removeValueContexts = false;
                        break;
                    }
                }

                if (removeValueContexts) {
                    delete request.params.query.valueContexts;
                }
            }
        }

        let res = undefined;
        if (isCombinedQuerySearch) {
            res = await service.getCombined(request);
        } else if (isRelatedEntitySearch) {
            //console.log('request raw str', JSON.stringify(request, null, 4));
            res = await service.getRelated(request);
            //console.log('response raw str', JSON.stringify(res, null, 4));
        } else {
            res = await service.get(request);
        }

        // console.log('response raw str', JSON.stringify(res, null, 4));
        let totalRecords = 0;

        let resultRecordSize = 0;

        let collectionName = dataIndexInfo.collectionName;

        let dataObjectResponse = res ? res[dataIndexInfo.responseObjectName] : undefined;

        if (dataObjectResponse && dataObjectResponse.status == "success") {
            //     console.log('collection name ', JSON.stringify(collectionName, null, 4));
            let dataObjects = dataObjectResponse[collectionName];
            let index = 0;

            if (dataObjects !== undefined) {
                totalRecords = dataObjectResponse.totalRecords;

                let additionalIdsRequested = [];
                if (!request.params.query || !request.params.query.filters || (!request.params.query.filters.attributesCriterion && !request.params.query.filters.keywordsCriterion)) {
                    if (dataObjectType && request.params.additionalIds && request.params.additionalIds.length > 0) {
                        additionalIdsRequested = request.params.additionalIds;

                        for (let additionalId of additionalIdsRequested) {
                            let dataObjectsByIdPath = [pathKeys.root, dataIndex, dataObjectType, pathKeys.byIds];
                            response.push(mergeAndCreatePath(basePath, [pathKeys.searchResultItems, index++], $ref(mergePathSets(dataObjectsByIdPath, [additionalId])), searchResultExpireTime));
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
                                let dataObjectType = dataObject.type;
                                let dataObjectsByIdPath = [pathKeys.root, dataIndex, dataObjectType, pathKeys.byIds];
                                response.push(mergeAndCreatePath(basePath, [pathKeys.searchResultItems, index++], $ref(mergePathSets(dataObjectsByIdPath, [dataObject.id])), searchResultExpireTime));
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
                    let firstAvailableError = dataObjectResponse.statusDetail.messages[0];
                    if (firstAvailableError) {
                        throw firstAvailableError;
                    }
                }
                else if (dataObjectResponse.statusDetail.message) {
                    throw new Error(dataObjectResponse.statusDetail.message);
                }
            }
        }

        response.push(mergeAndCreatePath(basePath, ["maxRecords"], $atom(maxRecordsSupported), searchResultExpireTime));
        response.push(mergeAndCreatePath(basePath, ["totalRecords"], $atom(totalRecords), searchResultExpireTime));
        response.push(mergeAndCreatePath(basePath, ["resultRecordSize"], $atom(resultRecordSize), searchResultExpireTime));
        response.push(mergeAndCreatePath(basePath, ["requestId"], $atom(requestId), searchResultExpireTime));

        // cache the query to request id map for further initiate search call save
        let cachedQueriesBasePath = [pathKeys.root, dataIndex, "cachedSearchResults"];
        let queryAsJsonString = JSON.stringify(origRequest);

        response.push(mergeAndCreatePath(cachedQueriesBasePath, [queryAsJsonString], $ref(basePath), searchResultExpireTime));
    }
    catch (err) {
        response = buildErrorResponse(err, "Failed to get search results.");
    }

    //console.log(JSON.stringify(response));
    return response;
}

async function getSearchResultDetail(pathSet) {

    let response = [];
    //console.log(pathSet.requestIds, pathSet.dataObjectRanges);

    let requestId = pathSet.requestIds[0];
    //console.log(requestId);
    let dataIndex = pathSet[1],
        basePath = [pathKeys.root, dataIndex];

    response.push(mergeAndCreatePath(basePath, [pathKeys.searchResults, requestId], $error('search result is expired. Retry the search operation.')));

    return response;
}

function createGetRequest(reqData) {

    let contexts = falcorUtil.createCtxItems(reqData.ctxKeys);
    let valContexts = falcorUtil.createCtxItems(reqData.valCtxKeys);

    let fields = {};

    if (reqData.operation == "getMappings" && arrayContains(reqData.mapKeys, "attributeMap")) {
        fields.attributes = ['_ALL'];
    }
    else {
        let attrNames = reqData.attrNames;
        if (attrNames !== undefined && attrNames.length > 0) {
            let clonedAttrNames = falcorUtil.cloneObject(attrNames);
            arrayRemove(clonedAttrNames, CONST_DATAOBJECT_METADATA_FIELDS);
            arrayRemove(clonedAttrNames, CONST_CTX_PROPERTIES);
            fields.attributes = clonedAttrNames;
        }
    }

    if (reqData.operation == "getMappings" && arrayContains(reqData.mapKeys, "relationshipMap")) {
        fields.relationships = ['_ALL'];
    }
    else {
        let relTypes = reqData.relTypes;
        if (relTypes !== undefined && relTypes.length > 0) {
            fields.relationships = relTypes;
        }
    }

    let relIds = reqData.relIds;
    if (relIds !== undefined && relIds.length > 0) {
        fields.relIds = relIds;
    }

    if (reqData.operation == "getMappings" && arrayContains(reqData.mapKeys, "relationshipAttributeMap")) {
        fields.relationshipAttributes = ['_ALL'];
    }
    else {
        let relAttrNames = reqData.relAttrNames;
        if (relAttrNames !== undefined && relAttrNames.length > 0) {
            fields.relationshipAttributes = relAttrNames;
        }
    }

    let options = {
        maxRecords: 2000
    };

    /**
     * entity properties are not returned when attributes sent empty.
     * properties come when we have either properties in fields or
     * atlease one attribute. 
     * Temperory: Hence sending properties: "_ALL" in fields when there are 
     * no attributes in fields and when it is only entity data get.
     * TODO: Need to find a better way to inject properties into request only
     * when request come with properties from client side.
     */
    if (reqData.dataIndex === "entityData" && fields.attributes && fields.attributes.length === 0) {
        fields.properties = ["_ALL"];
    }

    let filters = {};

    if (reqData.dataObjectType) {
        filters.typesCriterion = [reqData.dataObjectType];
    }

    let query = {};

    if (!isEmpty(contexts)) {
        query.contexts = contexts;
    }

    if (!isEmpty(valContexts)) {
        query.valueContexts = valContexts;
    }

    if (reqData.dataIndex == "config") {
        fields.jsonData = true;
        if (contexts && contexts.length > 0) {
            filters.excludeNonContextual = true;
        }
    }

    if (!isEmpty(filters)) {
        query.filters = filters;
    }

    let params = {
        query: query,
        fields: fields,
        options: options
    };

    if (reqData.dataIndex === "entityData") {
        params.intent = "write";
    }

    if (reqData.intent) {
        params.intent = reqData.intent;
    }

    let request = {
        dataIndex: reqData.dataIndex,
        params: params
    };

    return request;
}

function _getService(dataObjectType, isInitiateSearch, dataIndex) {
    if (dataObjectType == 'entityCompositeModel') {
        return entityCompositeModelGetService;
    }
    if (dataObjectType == 'uiConfig') {
        return configurationService;
    }
    else if (dataObjectType == "entityhistoryevent") {
        return entityHistoryEventService;
    } 
    else if (dataObjectType == "externalevent" || dataObjectType == "bulkoperationevent" || dataIndex == "eventData") {
        return eventService;
    }    
    else if (!isInitiateSearch && (dataObjectType == "attributeModel" || dataObjectType == "relationshipModel" || dataObjectType == "entityType" || dataObjectType == "classification")) { //|| dataObjectType == "classification"
        return baseModelService;
    }
    else {
        return dataObjectManageService;
    }
}

async function get(dataObjectIds, reqData) {
    let response = {};
    let operation = reqData.operation;

    try {
        let res = undefined;
        let isCoalesceGet = false;
        let isNearestGet = false;

        let service = _getService(reqData.dataObjectType, false, reqData.dataIndex);
        let request = createGetRequest(reqData);

        if (reqData.dataObjectType == "classification") {
            if (!isEmpty(reqData.relAttrNames) && reqData.relAttrNames[0] == "lineagepath") {
                service = dataObjectLineageService;
            }
        }

        if (request.dataIndex == "entityModel" && reqData.dataObjectType == 'entityCompositeModel') {
            if (!isEmpty(request.params.query.contexts)) {
                isCoalesceGet = true;
            }
        }
        else if (request.dataIndex == "config" && reqData.dataObjectType == 'uiConfig') {
            if (!isEmpty(request.params.query.contexts)) {
                let contexts = request.params.query.contexts;
                if (contexts && contexts.length > 0) {
                    isNearestGet = true;
                }
            }
        }

        //set the ids into request object..
        if (dataObjectIds.length > 1) {
            for (let idx in dataObjectIds) {
                dataObjectIds[idx] = dataObjectIds[idx].toString();
            }

            request.params.query.ids = dataObjectIds;
        }
        else {
            request.params.query.id = dataObjectIds[0].toString();
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

        let dataIndexInfo = pathKeys.dataIndexInfo[request.dataIndex];

        reqData.cacheExpiryDuration = dataIndexInfo && dataIndexInfo.cacheExpiryDurationInMins ? -(dataIndexInfo.cacheExpiryDurationInMins * 60 * 1000) : -(60 * 60 * 1000);

        let dataObjectResponse = res && dataIndexInfo && dataIndexInfo.responseObjectName ? res[dataIndexInfo.responseObjectName] : undefined;

        //console.log('dataObjectResponse res from api ', JSON.stringify(dataObjectResponse, null, 4));
        if (dataObjectResponse && dataObjectResponse.status == "success") {
            let dataObjects = dataIndexInfo && dataIndexInfo.collectionName ? dataObjectResponse[dataIndexInfo.collectionName] : undefined;

            if (dataObjects !== undefined) {
                let byIdsJson = response[pathKeys.byIds] = {};
                for (let dataObject of dataObjects) {
                    let dataObjectType = dataObject.type;

                    let dataObjectResponseJson = buildResponse(dataObject, reqData);

                    byIdsJson[dataObject.id] = dataObjectResponseJson;
                }

                if (isNearestGet) {
                    //In case of nearest get, comapare requested Id with nearest object Id resulted from response...
                    //If ids are not same then the response is for nearest context and hence populate as $ref in response Json

                    //console.log('byIdJson so far before nearest get response ', JSON.stringify(byIdsJson, null, 2));
                    //Nearest get should always return first nearest object hence considering first requested Id and first dataObject in response...
                    let requestedId = dataObjectIds[0];
                    let dataObject = dataObjects[0];

                    if (!isEmpty(dataObject) && requestedId != dataObject.id) {
                        //populate as ref...
                        byIdsJson[requestedId] = buildRefResponse(dataObject, reqData);
                    }
                }
            }
        }
        else if (dataObjectResponse && dataObjectResponse.status == 'error') {
            if (dataObjectResponse.statusDetail) {
                if (dataObjectResponse.statusDetail.messages) {
                    let firstAvailableError = dataObjectResponse.statusDetail.messages[0];
                    if (firstAvailableError) {
                        throw firstAvailableError;
                    }
                }
                else if (dataObjectResponse.statusDetail.message) {
                    throw new Error(dataObjectResponse.statusDetail.message);
                }
            }
        }
    }
    catch (err) {
        let errMsg = "".concat('Failed to get data.\nOperation:', operation, '\nError:', err.message, '\nStackTrace:', err.stack);
        logger.error(errMsg, null, logger.getCurrentModule());
        throw err;
    }

    //console.log('res', JSON.stringify(response, null, 4));
    return response;
}

async function getByIds(pathSet, operation) {

    let response = {};

    try {

        /*
         */
        //console.log('---------------------' , operation, ' dataObjectsById call pathset requested:', pathSet, ' operation:', operation);
        let reqDataObjectTypes = pathSet.dataObjectTypes;

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

        let jsonGraphResponse = response['jsonGraph'] = {};
        let rootJson = jsonGraphResponse[pathKeys.root] = {};
        let dataJson = rootJson[reqData.dataIndex] = {};

        // system flow supports only 1 type at time for bulk get..this is needed to make sure we have specialized code flow for the given data object types
        for (let dataObjectType of reqDataObjectTypes) {
            reqData.dataObjectType = dataObjectType;
            let dataByObjectTypeJson = await get(reqData.dataObjectIds, reqData);
            dataJson[dataObjectType] = dataByObjectTypeJson;
        }
    }
    catch (err) {
        let errMsg = "".concat('Failed to get data.\nOperation:', operation, '\nError:', err.message, '\nStackTrace:', err.stack);
        //console.log(errMsg);
        logger.error(errMsg, null, logger.getCurrentModule());
        throw err;
    }

    //console.log('getByIds response ', JSON.stringify(response, null, 4));
    return response;
}

async function processData(dataIndex, dataObjects, dataObjectAction, operation, clientState) {
    //console.log(dataObjectAction, operation);
    let response = {};
    try {
        let dataIndexInfo = pathKeys.dataIndexInfo[dataIndex];

        let jsonGraphResponse = response['jsonGraph'] = {};
        let rootJson = jsonGraphResponse[pathKeys.root] = {};
        rootJson[dataIndex] = {};
        let dataJson = rootJson[dataIndex] = {};

        for (let dataObjectId in dataObjects) {
            let responsePaths = [];
            let dataObject = dataObjects[dataObjectId];
            formatDataObjectForSave(dataObject);

            //Extract original rel ids from request dataobject if relationships are requested for process.
            let originalRelIds = _getOriginalRelIds(dataObject);

            //console.log('dataObject data', JSON.stringify(dataObject, null, 4));

            let dataObjectType = dataObject.type;
            let apiRequestObj = { 'dataIndex': dataIndex, 'clientState': clientState };
            apiRequestObj[dataIndexInfo.name] = falcorUtil.cloneObject(dataObject);

            let service = _getService(dataObjectType, false, dataIndex);

            //Added hotline to api request only when it is true
            if (clientState.hotline) {
                apiRequestObj["hotline"] = clientState.hotline;
            }
            //Hotline set to api request, so delete from clientState
            delete clientState.hotline;

            if (dataObjectAction == "create" || dataObjectAction == "update") {
                _removeUnnecessaryProperties(apiRequestObj);
                _prependAdditionalParams(apiRequestObj, dataIndexInfo.name);
            }
            //console.log('api request data for process dataObjects', JSON.stringify(apiRequestObj));
            let dataOperationResult = await service.process(apiRequestObj, dataObjectAction, dataObjectType);

            let dataByObjectTypeJson = undefined;

            //console.log('dataObject api UPDATE raw response', JSON.stringify(dataOperationResult, null, 4));
            if (dataOperationResult && !isEmpty(dataOperationResult)) {
                let responsePath = dataIndexInfo.responseObjectName;
                let cacheExpiryDurationInMins = dataIndexInfo.cacheExpiryDurationInMins;

                let dataOperationResponse = dataOperationResult[responsePath];
                if (dataOperationResponse && dataOperationResponse.status == 'success') {
                    if (dataObject) {

                        let basePath = [pathKeys.root, dataIndex, dataObjectType, pathKeys.byIds, dataObjectId];

                        let reqData = {
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
                            'basePath': basePath,
                            'cacheExpiryDuration': cacheExpiryDurationInMins ? -(cacheExpiryDurationInMins * 60 * 1000) : -(60 * 60 * 1000)
                        };

                        dataByObjectTypeJson = dataJson[dataObjectType];
                        let byIdsJson;

                        if (dataByObjectTypeJson == undefined || dataByObjectTypeJson == null) {
                            dataByObjectTypeJson = dataJson[dataObjectType] = {};
                            byIdsJson = dataByObjectTypeJson[pathKeys.byIds] = {};
                        }
                        else {
                            byIdsJson = dataByObjectTypeJson[pathKeys.byIds];
                        }

                        let dataObjectResponseJson = buildResponse(dataObject, reqData, responsePaths);
                        byIdsJson[dataObjectId] = dataObjectResponseJson;

                        if (!response.paths) {
                            response['paths'] = [];
                        }

                        Array.prototype.push.apply(response.paths, responsePaths);
                    }
                }
                else if (dataOperationResponse && dataOperationResponse.status == 'error') {
                    if (dataOperationResponse.statusDetail) {
                        if (dataOperationResponse.statusDetail.messages) {
                            let firstAvailableError = dataOperationResponse.statusDetail.messages[0];
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

    //console.log(JSON.stringify(response, null, 4));
    return response;
}

async function create(callPath, args, operation) {

    let response;

    try {
        let jsonEnvelope = args[0];
        let dataIndex = callPath.dataIndexes[0];
        let dataObjectType = callPath.dataObjectTypes[0]; //TODO: need to support for bulk..
        let dataObjects = jsonEnvelope.json[pathKeys.root][dataIndex][dataObjectType][pathKeys.byIds];
        let clientState = jsonEnvelope.json.clientState;
        let dataObjectIds = Object.keys(dataObjects);
        //console.log(dataObjects);

        //TODO: made showNotificationToUser flag false for entity create till we decide how it has to be.
        if (clientState && clientState.notificationInfo && !clientState.notificationInfo.showNotificationToUser) {
            clientState.notificationInfo.showNotificationToUser = false;
        }

        // create new guids for the dataObjects to be created..
        for (let dataObjectId of dataObjectIds) {
            let dataObject = dataObjects[dataObjectId];

            if (dataObject.id == undefined || dataObject.id == "") {
                let newDataObjectId = uuidV1();
                //console.log('new dataObject id', newDataObjectId);
                dataObject.id = newDataObjectId;
            }
        }

        response = processData(dataIndex, dataObjects, "create", operation, clientState);
    }
    catch (err) {
        response = buildErrorResponse(err, "Failed to submit create request.");
    }

    return response;
}

async function update(callPath, args, operation) {

    let response;

    try {
        let jsonEnvelope = args[0];
        let dataIndex = callPath.dataIndexes[0];
        let dataObjectType = callPath.dataObjectTypes[0]; //TODO: need to support for bulk..
        let dataObjects = jsonEnvelope.json[pathKeys.root][dataIndex][dataObjectType][pathKeys.byIds];
        let clientState = jsonEnvelope.json.clientState;

        response = processData(dataIndex, dataObjects, "update", operation, clientState);
    }
    catch (err) {
        response = buildErrorResponse(err, "Failed to submit update request.");
    }

    return response;
}

async function deleteDataObjects(callPath, args, operation) {

    let response;

    try {
        let jsonEnvelope = args[0];
        let dataIndex = callPath.dataIndexes[0];
        let dataObjectType = callPath.dataObjectTypes[0]; //TODO: need to support for bulk..
        let dataObjects = jsonEnvelope.json[pathKeys.root][dataIndex][dataObjectType][pathKeys.byIds];
        let clientState = jsonEnvelope.json.clientState;

        response = processData(dataIndex, dataObjects, "delete", operation, clientState);
    }
    catch (err) {
        response = buildErrorResponse(err, "Failed to submit delete request.");
    }

    return response;
}

function _getOriginalRelIds(dataObject) {
    let originalRelIds;

    if (dataObject.data && dataObject.data.relationships) {
        let rels = dataObject.data.relationships;

        if (rels.originalRelIds) {
            originalRelIds = rels.originalRelIds;
            delete rels.originalRelIds;
        }
    }

    return originalRelIds;
}

function _prependAdditionalParams(reqObject, dataInfoKey) {
    if (!reqObject.params) {
        reqObject.params = {};
    }

    reqObject.params["authorizationType"] = "accommodate";

    if (reqObject[dataInfoKey].isReclassification) {
        delete reqObject[dataInfoKey].isReclassification;
        reqObject.params["reclassification"] = true;
    }
}

function _removeUnnecessaryProperties(reqObject) {
    if (reqObject && reqObject.entity && reqObject.entity.data) {
        let data = reqObject.entity.data;

        if (data.webProcessingOptions) {
            delete data.webProcessingOptions;
        }

        if (data.attributes) {
            _removePropertiesFromAttributes(data.attributes);
        }

        if (data.relationships) {
            _removePropertiesFromRelationships(data.relationships);
        }

        if (data.contexts) {
            data.contexts.forEach(function (ctx) {
                if (ctx) {
                    if (ctx.attributes) {
                        _removePropertiesFromAttributes(ctx.attributes);
                    }
                    if (ctx.relationships) {
                        _removePropertiesFromRelationships(ctx.relationships);
                    }
                }
            }, this);
        }
    }
}

function _removePropertiesFromAttributes(attributes) {
    if (attributes) {
        for (let attrKey in attributes) {
            let attr = attributes[attrKey];
            if (attr.properties) {
                delete attr.properties;
            }
        }
    }
}

function _removePropertiesFromRelationships(relationships) {
    if (relationships) {
        for (let relKey in relationships) {
            let rels = relationships[relKey];
            if (rels) {
                rels.forEach(function (rel) {
                    if (rel.properties) {
                        delete rel.properties.contextCoalesce;
                    }
                    if (rel.attributes) {
                        _removePropertiesFromAttributes(rel.attributes);
                    }
                }, this);
            }
        }
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
