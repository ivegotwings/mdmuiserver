'use strict';

var jsonGraph = require('falcor-json-graph'),
    futil = require('./falcor-util'),
    uuidV1 = require('uuid/v1'),
    $ref = jsonGraph.ref,
    $error = jsonGraph.error,
    $atom = jsonGraph.atom,
    expireTime = -60 * 60 * 1000; // 60 mins

var EntityManageService = require('./EntityManageService');

//var entityManageService = new EntityManageService({ mode: "offline" });
var entityManageService = new EntityManageService({mode: "online"});

//falcor utilty functions' references
var createPath = futil.createPath,
    unboxEntityData = futil.unboxEntityData,
    unboxJsonObject = futil.unboxJsonObject,
    buildEntityFieldsResponse = futil.buildEntityFieldsResponse,
    buildEntityAttributesResponse = futil.buildEntityAttributesResponse;

function createRequestJson(ctxKeys, attrNames) {
    var ctxGroups = [];
    var valCtxGroups = [];

    for (let ctxKey of ctxKeys) {
        var ctxKeySegments = ctxKey.split('#@#');
        var ctxGroupObj = { list: ctxKeySegments[0], classification: ctxKeySegments[1] };
        var valCtxGroupObj = { source: ctxKeySegments[2], locale: ctxKeySegments[3] };

        //TODO:: Right now RDP is not working with below 2 parameters passed..need to fix this soon..
        //valCtxGroupObj.timeslice = "current";
        //valCtxGroupObj.governed = "true";

        if (!ctxGroups.find(c => c.list === ctxGroupObj.list
            && c.categorization === ctxGroupObj.categorization)) {
            ctxGroups.push(ctxGroupObj);
        }

        if (!valCtxGroups.find(v => v.source === valCtxGroupObj.source
            && v.locale === valCtxGroupObj.locale)) {
            valCtxGroups.push(valCtxGroupObj);
        }
    };

    var fields = { ctxTypes: ["properties"], attributes: attrNames, relationships: ["ALL"] };
    var options = { totalRecords: 1, includeRequest: false };

    //TODO:: This is hard coded as of now as RDP is not working wtihout entity types....need to fix this ASAP
    var filters = {
        attributesCriterion: [], relationshipsCriterion: [], typesCriterion: []
    };

    var query = { ctx: ctxGroups, valCtx: valCtxGroups, id: "", filters: filters };

    var request = { query: query, fields: fields, options: options };

    return request;
}

async function getSingleEntity(request, entityId, entityFields, pathRootKey) {
    var response = [];
    //update entity id in request query for current id
    request.query.id = entityId;

    //console.log('req to api ', JSON.stringify(request));
    var res = await entityManageService.getEntities(request);
    //console.log(JSON.stringify(res, null, 4));

    var entity;

    if (res !== undefined && res.dataObjectOperationResponse !== undefined && res.dataObjectOperationResponse.status == "success") {
        //console.log('response from api', JSON.stringify(res));
        if (res.dataObjectOperationResponse.dataObjects !== undefined) {
            for (let en of res.dataObjectOperationResponse.dataObjects) {
                entity = en;

                if (entity.id == entityId) {
                    response.push.apply(response, buildEntityFieldsResponse(entity, entityFields, pathRootKey));
                    response.push.apply(response, buildEntityAttributesResponse(entity, request, pathRootKey));
                }
            }
        }
    }

    if (entity === undefined) {
        response.push(createPath([pathRootKey, entityId], $error(entityId + ' is not found')));
    }

    //console.log(JSON.stringify(response, null, 4));
    return response;
}

//pathSet pattern: searchResults.create 
async function initiateSearchRequest(callPath, args) {
    var response = [];
    //console.log(callPath, args);

    var requestId = uuidV1(),
        request = args[0];

    var requestForApi = request.data;
    //console.log('request str', JSON.stringify(requestForApi, null, 4));

    var res = await entityManageService.getEntities(requestForApi);
    //console.log('response raw str', JSON.stringify(res.data, null, 4));

    var totalRecords = 0;

    if (res !== undefined && res.dataObjectOperationResponse !== undefined && res.dataObjectOperationResponse.status == "success") {
        var index = 0;
        var dataObjects = res.dataObjectOperationResponse.dataObjects;

        if (dataObjects !== undefined) {
            totalRecords = dataObjects.length;
            dataObjects.forEach(function (entity) {
                if (entity.id !== undefined) {
                    response.push(createPath(['searchResults', requestId, "entities", index++], $ref({ 'id': entity.id })));
                }
            });
        }
    }
    else {
        response.push(createPath(['searchResult', requestId], $error('data not found in system')));
    }

    response.push(createPath(['searchResults', requestId, "totalRecords"], $atom(totalRecords)));
    response.push(createPath(['searchResults', requestId, "requestId"], $atom(requestId)));
    response.push(createPath(['searchResults', requestId, "request"], $atom(request)));

    //console.log(JSON.stringify(results));   
    return response;
}

//pathSet pattern: searchResults[{keys:requestIds}].entities[{ranges:entityRanges}]
async function getSearchResultDetail(pathSet) {
    var response = [];
    //console.log(pathSet.requestIds, pathSet.entityRanges);

    var requestId = pathSet.requestIds[0];
    //console.log(requestId);

    response.push(createPath(['searchResults', requestId], $error('search result is expired. Retry the search operation.')));

    return response;
}

//route1: "entitiesById[{keys:entityIds}][{keys:entityFields}]"
//route2: "entitiesById[{keys:entityIds}].data.ctxInfo[{keys:ctxKeys}].attributes[{keys:attrNames}].values"
async function getEntities(pathSet) {
    //console.log('entitiesById call:' + pathSet);

    var entityIds = pathSet.entityIds;
    var entityFields = pathSet.entityFields === undefined ? [] : pathSet.entityFields;
    var ctxKeys = pathSet.ctxKeys === undefined ? [] : pathSet.ctxKeys;
    var attrNames = pathSet.attrNames === undefined ? ['ALL'] : pathSet.attrNames;

    var pathRootKey = pathSet[0];
    var response = [];

    var request = createRequestJson(ctxKeys, attrNames);

    for (let entityId of entityIds) {
        var singleEntityResponse = await getSingleEntity(request, entityId, entityFields, pathRootKey);
        response.push.apply(response, singleEntityResponse);
    }

    //console.log(JSON.stringify(response, null, 4));
    return response;
}

//route1: "entitiesById[{keys:entityIds}][{keys:entityFields}]"
//route2: "entitiesById[{keys:entityIds}].data.ctxInfo[{keys:ctxKeys}].attributes[{keys:attrNames}].values"
function saveEntities(jsonEnvelope) {
    //console.log('saveEntities input data', JSON.stringify(jsonEnvelope, null, 4));

    var response = [];
    var pathRootKey = "entitiesById";
    var entityFields = ["id", "dataObjectInfo", "systemInfo", "properties"];

    for (var entityId in jsonEnvelope[pathRootKey]) {
        var entity = jsonEnvelope[pathRootKey][entityId];

        entity.id = entityId; // TODO:: this has to be setup as input json does not send id property for now..
        entity = unboxEntityData(entity);

        //console.log('entity data', JSON.stringify(entity, null, 4));

        if (entity.dataObjectInfo) {
            response.push.apply(response, buildEntityFieldsResponse(entity, entityFields, pathRootKey));
        }

        if (entity.data && entity.data.ctxInfo) {
            var ctxKeys = Object.keys(entity.data.ctxInfo);

            for (var ctxKey in entity.data.ctxInfo) {
                var attrNames = Object.keys(entity.data.ctxInfo[ctxKey].attributes);
                var request = createRequestJson([ctxKey], attrNames);
                response.push.apply(response, buildEntityAttributesResponse(entity, request, pathRootKey));
            }
        }
    }

    //console.log(JSON.stringify(response, null, 4));
    return response;
}

module.exports = {
    initiateSearchRequest: initiateSearchRequest,
    getSearchResultDetail: getSearchResultDetail,
    getEntities: getEntities,
    saveEntities: saveEntities
};

