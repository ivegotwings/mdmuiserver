'use strict';

var jsonGraph = require('falcor-json-graph'),
    uuidV1 = require('uuid/v1'),
    $ref = jsonGraph.ref,
    $error = jsonGraph.error,
    $atom = jsonGraph.atom,
    expireTime = -60 * 60 * 1000; // 60 mins

var EntityManageService = require('../../api/EntityManageService/EntityManageService');

//var entityManageService = new EntityManageService({mode: "offline"});
var entityManageService = new EntityManageService({mode: "online"});

function createPath(pathSet, value) {
    return {path: pathSet, 'value': value, $expires: expireTime};
}

function createDummyRequest() {
    var request = {
            "query":{
                "ctx":[
                    {
                        "list":"productMaster",
                        "classification":"nivea/niveaBodyCare/niveaBody/nbodyEssential/nbody/ess/nourishingMilkDry"
                    }
                ],
                "valCtx":[
                    {
                        "source":"SAP",
                        "locale":"en-US"
                    }
                ],
                "filters":{
                    "attributesCriterion":[],
                    "typesCriterion":["nart"]
                }
            },
            "fields":{
                "ctxTypes":["properties"],
                "attributes":["cpimProductName","csapDescriptionOfNart"],
                "relationships":["ALL"]
            }
        };

    return request;
}

function createRequestJson(ctxKeys, attrNames) {
    var ctxGroups = [];
    var valCtxGroups = [];

    ctxKeys.forEach(function (ctxKey) {
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
    });

    var fields = { ctxTypes: ["properties"], attributes: attrNames, relationships: ["ALL"] };
    var options = { totalRecords: 1, includeRequest: false };

    //TODO:: This is hard coded as of now as RDP is not working wtihout entity types....need to fix this ASAP
    var filters = {
        attributesCriterion: [], relationshipsCriterion: [], typesCriterion: []
    };

    var query = {ctx: ctxGroups, valCtx: valCtxGroups, id: "", filters: filters};

    var request = {query:query, fields:fields, options:options};

    return request;
}

function buildEntityFieldsResponse(entity, entityFields, pathRootKey){
    var response = [];
    
    entityFields.forEach(function(entityField){
        if(entityField !== "data"){
            var entityFieldValue = entity[entityField] !== undefined ? entity[entityField] : {};                                  
            response.push(createPath([pathRootKey, entity.id, entityField], $atom(entityFieldValue))); 
        }
    });               

    return response;   
}

function buildEntityAttributesResponse(entity, request, pathRootKey){
    var response = [];
    var entityId = entity.id;

    request.query.ctx.forEach(function(reqCtxGroup){
        entity.data.ctxInfo.forEach(function(enCtxInfo){
            //console.log('enCtxInfo: ', JSON.stringify(enCtxInfo));
            if(enCtxInfo.ctxGroup.list === reqCtxGroup.list && enCtxInfo.ctxGroup.classification === reqCtxGroup.classification)
            {
                request.fields.attributes.forEach(function(attrName){
                    var attr = enCtxInfo.attributes[attrName];

                    request.query.valCtx.forEach(function(reqValCtxGroup){
                        var valFound = false;
                        if(attr !== undefined){
                            var valCtxSpecifiedValues = [];
                            attr.values.forEach(function(val){
                                if(val.source == reqValCtxGroup.source && val.locale == reqValCtxGroup.locale){
                                    valCtxSpecifiedValues.push(val);
                                    valFound = true;
                                }
                            });

                            if(valCtxSpecifiedValues.length > 0){
                                var contextKey = "".concat(enCtxInfo.ctxGroup.list,'#@#', enCtxInfo.ctxGroup.classification, '#@#', reqValCtxGroup.source, '#@#',reqValCtxGroup.locale);
                                response.push(createPath([pathRootKey, entityId, 'data', 'ctxInfo', contextKey, 'attributes', attrName, "values"], $atom(valCtxSpecifiedValues))); 
                            }
                        }
                        else{
                            valFound = false;
                        }

                        if(!valFound){
                            var val = {source: reqValCtxGroup.source, locale: reqValCtxGroup.locale, value: ''};
                            var contextKey2 = "".concat(enCtxInfo.ctxGroup.list,'#@#', enCtxInfo.ctxGroup.classification, '#@#', val.source, '#@#',val.locale);
                            response.push(createPath([pathRootKey, entityId, 'data', 'ctxInfo', contextKey2, 'attributes', attrName, "values"], $atom([val]))); 
                        }
                    });
                });

                return false;       
            }
        });
    });

    return response;
}

async function getSingleEntity(request, entityId, entityFields, pathRootKey){
    var response = [];
    //update entity id in request query for current id
    request.query.id = entityId;    

    //console.log('req to api ', JSON.stringify(request));
    var res = await entityManageService.getEntities(request);
    //console.log(JSON.stringify(res, null, 4));

    var entity;
                    
    if(res !== undefined && res.dataObjectOperationResponse !== undefined && res.dataObjectOperationResponse.status == "success")
    {
        //console.log('response from api', JSON.stringify(res));
        if(res.dataObjectOperationResponse.dataObjects !== undefined){
            for(let en of res.dataObjectOperationResponse.dataObjects){
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

    if(res !== undefined && res.dataObjectOperationResponse !== undefined && res.dataObjectOperationResponse.status == "success")
    {
        var index = 0;
        var dataObjects = res.dataObjectOperationResponse.dataObjects;

        if(dataObjects !== undefined){
            totalRecords = dataObjects.length;
            dataObjects.forEach(function(entity){
                if (entity.id !== undefined) {
                    response.push(createPath(['searchResults', requestId, "entities", index++], $ref({'id': entity.id})));
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

    for(let entityId of entityIds){
        var singleEntityResponse = await getSingleEntity(request, entityId, entityFields, pathRootKey);
        response.push.apply(response, singleEntityResponse);
    }

    //console.log(JSON.stringify(response, null, 4));
    return response;
}

module.exports = {
    initiateSearchRequest: initiateSearchRequest,
    getSearchResultDetail: getSearchResultDetail,
    getEntities: getEntities
};

