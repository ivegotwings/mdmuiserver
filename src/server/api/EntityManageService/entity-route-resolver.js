'use strict';

var jsonGraph = require('falcor-json-graph'),
    futil = require('./entity-falcor-util'),
    EntityManageService = require('./EntityManageService'),
    uuidV1 = require('uuid/v1'),
    $ref = jsonGraph.ref,
    $error = jsonGraph.error,
    $atom = jsonGraph.atom,
    expireTime = -60 * 60 * 1000,
    pathRootKey = "entitiesById"; // 60 mins

var mode = process.env.NODE_ENV;
var options = {mode: mode};
var entityManageService = new EntityManageService(options);

//falcor utilty functions' references
var createPath = futil.createPath,
    unboxEntityData = futil.unboxEntityData,
    unboxJsonObject = futil.unboxJsonObject,
    transformEntityToExternal = futil.transformEntityToExternal,
    buildEntityFieldsResponse = futil.buildEntityFieldsResponse,
    buildEntityAttributesResponse = futil.buildEntityAttributesResponse,
    buildEntityRelationshipsResponse = futil.buildEntityRelationshipsResponse,
    createRequestJson = futil.createRequestJson;
    
async function getSingleEntity(request, entityId, entityFields) {
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
                    
                    if(request.fields.attributes){
                        response.push.apply(response, buildEntityAttributesResponse(entity, request, pathRootKey));
                    }
                    
                    // if(request.fields.relationships){
                    //     response.push.apply(response, buildEntityRelationshipsResponse(entity, request, pathRootKey));
                    // }
                }
            }
        }
    }

    if (entity === undefined) {
        response.push(createPath([pathRootKey, entityId], $error(entityId + ' is not found in system for the requested context'), 0));
    }

    //console.log('res', JSON.stringify(response, null, 4));
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
            for (let entity of dataObjects) {
                if (entity.id !== undefined) {
                    response.push(createPath(['searchResults', requestId, "entities", index++], $ref([pathRootKey, entity.id])));
                }
            }
        }
    } else {
        response.push(createPath(['searchResult', requestId], $error('data not found in system'), 0));
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
//route3: "entitiesById[{keys:entityIds}].data.ctxInfo[{keys:ctxKeys}].relationships[{keys:relTypes}]"
async function getEntities(pathSet) {
    //console.log('entitiesById call pathset requested:', pathSet);

    var entityIds = pathSet.entityIds;
    var entityFields = pathSet.entityFields === undefined ? [] : pathSet.entityFields;
    var ctxKeys = pathSet.ctxKeys === undefined ? [] : pathSet.ctxKeys;
    var attrNames = pathSet.attrNames === undefined ? [] : pathSet.attrNames;
    var relTypes = pathSet.relTypes === undefined ? [] : pathSet.relTypes;

    var response = [];
    pathRootKey = pathSet[0];
    
    var request = createRequestJson(ctxKeys, attrNames, relTypes);
    //console.log('req', JSON.stringify(request));

    for (let entityId of entityIds) {
        var singleEntityResponse = await getSingleEntity(request, entityId, entityFields);
        response.push.apply(response, singleEntityResponse);
    }

    //console.log(JSON.stringify(response, null, 4));
    return response;
}

async function processEntities(entities, entityAction, callerName) {
    //console.log(entityAction, callerName);

    var entityFields = ["id", "dataObjectInfo", "systemInfo", "properties"],
        response = [];
        
    for (var entityId in entities) {
        var entity = entities[entityId];
        entity = unboxEntityData(entity);
        var transformedEntity = transformEntityToExternal(entity);

        //console.log('entity data', JSON.stringify(entity, null, 4));

        var apiReqestObj = {
            includeRequest: false,
            dataObject: transformedEntity
        };

        //console.log('api request data for update entity', JSON.stringify(apiReqestObj));

        var dataOperationResponse = {};
        
        if(entityAction == "create"){
            dataOperationResponse = await entityManageService.createEntities(apiReqestObj);
        }
        else if(entityAction == "update"){
            dataOperationResponse = await entityManageService.updateEntities(apiReqestObj);
        }
        else if(entityAction == "delete"){
            dataOperationResponse = await entityManageService.deleteEntities(apiReqestObj);
        }

        //console.log('entity api UPDATE raw response', JSON.stringify(dataOperationResponse, null, 4));
                
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

//route1: "entitiesById.createEntities"
async function createEntities(callPath, args, callerName)
{
    var jsonEnvelope = args[0];

    var entities = jsonEnvelope.json[pathRootKey];
    var entityIds = Object.keys(entities);
    //console.log(entities);

    // create new guids for the entities to be created..
    for(let entityId of entityIds) {
        var entity = entities[entityId];
        var newEntityId = uuidV1();
        //console.log('new entity id', newEntityId);
        entity.id = newEntityId;
    }

    return processEntities(entities, "create", callerName);
}

//route1: "entitiesById[{keys:entityIds}].updateEntities"
async function updateEntities(callPath, args, callerName)
{
    var jsonEnvelope = args[0];
    
    var entities = jsonEnvelope.json[pathRootKey];

    return processEntities(entities, "update", callerName);
}

//route1: "entitiesById[{keys:entityIds}].deleteEntities"
async function deleteEntities(callPath, args, callerName)
{
    var jsonEnvelope = args[0];
    
    var entities = jsonEnvelope.json[pathRootKey];

    return processEntities(entities, "delete", callerName);
}

module.exports = {
    initiateSearchRequest: initiateSearchRequest,
    getSearchResultDetail: getSearchResultDetail,
    getEntities: getEntities,
    createEntities: createEntities,
    updateEntities: updateEntities,
    deleteEntities: deleteEntities
};