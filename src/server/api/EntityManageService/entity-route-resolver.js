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

var sharedEntityFalcorUtil = require('../../../shared/entity-falcor-util');

var arrayUnion = require('../Utils/array-union');

var options = {};
var runOffline = process.env.RUN_OFFLINE;

if (runOffline) {
    options.runOffline = runOffline;
}

var entityManageService = new EntityManageService(options);

//falcor utilty functions' references
var createPath = futil.createPath,
    createRequestJson = futil.createRequestJson,
    transformEntityToExternal = futil.transformEntityToExternal,
    buildEntityFieldsResponse = futil.buildEntityFieldsResponse,
    buildEntityAttributesResponse = futil.buildEntityAttributesResponse,
    buildEntityRelationshipsResponse = futil.buildEntityRelationshipsResponse;

async function getSingleEntity(request, entityId, entityFields, caller) {
    var response = [];
    //update entity id in request query for current id
    request.params.query.id = entityId;

    //console.log('req to api ', JSON.stringify(request));
    var res = await entityManageService.getEntities(request);
    //console.log(JSON.stringify(res, null, 4));

    var entity;

    var eoResponse = res ? res.entityOperationResponse : undefined;

    if (eoResponse && eoResponse.status == "success") {
        //console.log('response from api', JSON.stringify(res));
        if (eoResponse.entities !== undefined) {
            for (let en of eoResponse.entities) {
                entity = en;

                if (entity.id == entityId) {
                    response.push.apply(response, buildEntityFieldsResponse(entity, entityFields, pathRootKey));

                    if (request.params.fields.attributes) {
                        response.push.apply(response, buildEntityAttributesResponse(entity, request, pathRootKey));
                    }

                    if (request.params.fields.relationships) {
                        response.push.apply(response, buildEntityRelationshipsResponse(entity, request, pathRootKey, caller));
                    }
                }
            }
        }
    }

    if (entity === undefined) {
        //response.push(createPath([pathRootKey, entityId], $error(entityId + ' is not found in system for the requested context'), 0));
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

    //console.log('request str', JSON.stringify(request, null, 4));

    var res = await entityManageService.getEntities(request);
    //console.log('response raw str', JSON.stringify(res.data, null, 4));

    var totalRecords = 0;

    var eoResponse = res ? res.entityOperationResponse : undefined;

    if (eoResponse && eoResponse.status == "success") {
        var index = 0;
        var entities = eoResponse.entities;

        if (entities !== undefined) {
            totalRecords = entities.length;
            for (let entity of entities) {
                if (entity.id !== undefined) {
                    response.push(createPath(['searchResults', requestId, "entities", index++], $ref([pathRootKey, entity.id])));
                }
            }
        }
    }
    else {
        //response.push(createPath(['searchResults', requestId], $error('data not found in system'), 0));
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
async function getEntities(pathSet, caller) {
    //console.log('---------------------' , caller, ' entitiesById call pathset requested:', pathSet, ' caller:', caller);

    var entityIds = pathSet.entityIds;
    var entityFields = pathSet.entityFields === undefined ? [] : pathSet.entityFields;
    var ctxKeys = pathSet.ctxKeys === undefined ? [] : pathSet.ctxKeys;
    var attrNames = pathSet.attrNames === undefined ? [] : pathSet.attrNames;
    var relTypes = pathSet.relTypes === undefined ? [] : pathSet.relTypes;
    var relAttrNames = pathSet.relAttrNames === undefined ? [] : pathSet.relAttrNames;
    var relIds = pathSet.relIds === undefined ? [] : pathSet.relIds;

    var response = [];
    pathRootKey = pathSet[0];

    var request = createRequestJson(ctxKeys, attrNames, relTypes, relAttrNames, relIds);
    //console.log('req', JSON.stringify(request));

    for (let entityId of entityIds) {
        var singleEntityResponse = await getSingleEntity(request, entityId, entityFields, caller);
        response.push.apply(response, singleEntityResponse);
    }

    //console.log('getEntities response :', JSON.stringify(response, null, 4));
    return response;
}

async function processEntities(entities, entityAction, caller) {
    //console.log(entityAction, caller);

    var entityFields = ["id", "entityInfo", "systemInfo", "properties"],
        response = [];

    for (var entityId in entities) {
        var entity = entities[entityId];

        entity = sharedEntityFalcorUtil.boxEntityData(entity, sharedEntityFalcorUtil.unboxJsonObject);
        var transformedEntity = transformEntityToExternal(entity);

        //console.log('entity data', JSON.stringify(entity, null, 4));

        var apiReqestObj = {
            includeRequest: false,
            entities: [transformedEntity]
        };

        //console.log('api request data for process entities', JSON.stringify(apiReqestObj));

        var dataOperationResponse = {};

        if (entityAction == "create") {
            dataOperationResponse = await entityManageService.createEntities(apiReqestObj);
        }
        else if (entityAction == "update") {
            dataOperationResponse = await entityManageService.updateEntities(apiReqestObj);
        }
        else if (entityAction == "delete") {
            dataOperationResponse = await entityManageService.deleteEntities(apiReqestObj);
        }

        //console.log('entity api UPDATE raw response', JSON.stringify(dataOperationResponse, null, 4));

        if (entity.entityInfo) {
            response.push.apply(response, buildEntityFieldsResponse(entity, entityFields, pathRootKey));
        }

        if (entity.data && entity.data.ctxInfo) {
            var ctxKeys = Object.keys(entity.data.ctxInfo);

            for (var ctxKey in entity.data.ctxInfo) {
                var ctxGroup = entity.data.ctxInfo[ctxKey];
                var attrNames = Object.keys(ctxGroup.attributes);
                var relTypes = [];
                var relAttrNames = [];

                for (var relType in ctxGroup.relationships) {
                    for (var relKey in ctxGroup.relationships[relType].rels) {
                        var rel = ctxGroup.relationships[relType].rels[relKey];
                        relAttrNames = arrayUnion(relAttrNames, Object.keys(rel.attributes))
                    }
                    relTypes.push(relType);
                }

                var request = createRequestJson([ctxKey], attrNames, relTypes, relAttrNames);

                //console.log('req during processEntities ', JSON.stringify(request, null, 4));

                if (request.params.fields.attributes) {
                    response.push.apply(response, buildEntityAttributesResponse(entity, request, pathRootKey));
                }

                if (request.params.fields.relationships) {
                    response.push.apply(response, buildEntityRelationshipsResponse(entity, request, pathRootKey, caller));
                }
            }
        }
    }

    //console.log(JSON.stringify(response, null, 4));
    return response;
}

//route1: "entitiesById.createEntities"
async function createEntities(callPath, args, caller) {
    var jsonEnvelope = args[0];

    var entities = jsonEnvelope.json[pathRootKey];
    var entityIds = Object.keys(entities);
    //console.log(entities);

    // create new guids for the entities to be created..
    for (let entityId of entityIds) {
        var entity = entities[entityId];
        var newEntityId = uuidV1();
        //console.log('new entity id', newEntityId);
        entity.id = newEntityId;
    }

    return processEntities(entities, "create", caller);
}

//route1: "entitiesById[{keys:entityIds}].updateEntities"
async function updateEntities(callPath, args, caller) {
    var jsonEnvelope = args[0];

    var entities = jsonEnvelope.json[pathRootKey];

    return processEntities(entities, "update", caller);
}

//route1: "entitiesById[{keys:entityIds}].deleteEntities"
async function deleteEntities(callPath, args, caller) {
    var jsonEnvelope = args[0];

    var entities = jsonEnvelope.json[pathRootKey];

    return processEntities(entities, "delete", caller);
}

module.exports = {
    initiateSearchRequest: initiateSearchRequest,
    getSearchResultDetail: getSearchResultDetail,
    getEntities: getEntities,
    createEntities: createEntities,
    updateEntities: updateEntities,
    deleteEntities: deleteEntities
};