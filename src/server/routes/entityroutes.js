'use strict';

var falcorExpress = require('falcor-express'),
    Router = require('falcor-router'),
    flatten = require('flatten'),
    Promise = require('promise'),
    jsonGraph = require('falcor-json-graph'),
    uuidV1 = require('uuid/v1'),
    $ref = jsonGraph.ref,
    $error = jsonGraph.error,
    $atom = jsonGraph.atom,
    expireTime = -60 * 60 * 1000; // 60 mins

var EntityManageService = require('../api/EntityManageService');

var EntityRouterBase = Router.createClass([
    {
        route: 'searchResults.create',
        call: function(callPath, args) {
            var results = [];
            //console.log(callPath, args);

            var requestId = uuidV1(),
                request = args[0];

            var entityManagerService = new EntityManageService();

            var requestForApi = request.data;

            //console.log('request str', JSON.stringify(requestForApi));

            var res = entityManagerService.getEntities(requestForApi);

            //console.log('response str', JSON.stringify(res.data));

            var totalRecords = 0;

            if(res !== undefined && res.dataObjectOperationResponse !== undefined && res.dataObjectOperationResponse.status == "success")
            {
                var index = 0;
                var dataObjects = res.dataObjectOperationResponse.dataObjects;
                if(dataObjects !== undefined){
                    totalRecords = dataObjects.length;
                    dataObjects.forEach(function(entity){
                        //TODO:: Search result is not coming back with id field...assign some random id for now..
                        //entity.id = uuidV1();

                        if (entity.id !== undefined) {
                            results.push({
                                path: ['searchResults', requestId, "entities", index++],
                                $type: "ref",
                                value: $ref({'id': entity.id}),
                                $expires: expireTime
                            });
                        }
                    });
                }
            }
            else {
                results.push({
                    path: ['searchResult', requestId],
                    value: $error('data not found in system')
                });
            }

            results.push({
                path: ['searchResults', requestId, "totalRecords"],
                value: $atom(totalRecords),
                $expires: expireTime
            });

            results.push({
                path: ['searchResults', requestId, "requestId"],
                value: $atom(requestId),
                $expires: expireTime
            });

            results.push({
                path: ['searchResults', requestId, "request"],
                value: $atom(request),
                $expires: expireTime
            });

            //console.log(JSON.stringify(results));   
            return results;
        }
    },
    {
        route: 'searchResults[{keys:requestIds}].entities[{ranges:entityRanges}]',
        get: function(pathSet) {
            var results = [];
            //console.log(pathSet.requestIds, pathSet.entityRanges);

            var requestId = pathSet.requestIds[0];
            //console.log(requestId);

            results.push({
                path: ['searchResults', requestId],
                value: $error('search result is expired. Retry the search operation.')
            });

            return results;
        }
    },
    {
        route: "entitiesById[{keys:entityIds}].ctx[{keys:ctxKeys}].attrs[{keys:attrNames}]",
        get: function(pathSet) {
            //console.log('entitiesById call:' + pathSet);

            var entityIds = pathSet.entityIds;
            var ctxKeys = pathSet.ctxKeys;
            var attrNames = pathSet.attrNames;

            var results = [];

            var entityManagerService = new EntityManageService();

            var request = this._createRequestJson(ctxKeys, attrNames);

            entityIds.forEach(function(entityId) {

                //update entity id in request query for current id
                request.query.id = entityId;    

                //console.log('req to api ', JSON.stringify(request));

                var res = entityManagerService.getEntities(request);
                
                var entity;
                                
                if(res !== undefined && res.dataObjectOperationResponse !== undefined && res.dataObjectOperationResponse.status == "success")
                {
                    //console.log('response', JSON.stringify(res.dataObjectOperationResponse));
                    if(res.dataObjectOperationResponse.dataObjects !== undefined){
                        res.dataObjectOperationResponse.dataObjects.forEach(function(en){
                            entity = en;
                            //TODO:: This is temporary as RDP is not sending id back..we shall remove this once ids come back...
                            //entity.id = entityId;
                            if (entity.id == entityId) {
                                results.push({
                                    path: ['entitiesById', entityId],
                                    value: $atom(entity)
                                });
                                return false;
                            }
                        });
                    }
                }
                
                if (entity === undefined) {
                    results.push({
                        path: ['entitiesById', entityId],
                        value: $error(entityId + ' is not found')
                    });
                }
            });

            //console.log(results);
            return results;
        }
    },
    {
        route: 'JSON_Source_searchResults.create',
        call: function(callPath, args) {
            var results = [];

            //console.log(callPath, args);

            var requestId = uuidV1(),
                request = args[0];

            var serviceResult = require("../data/entityJson_EXTERNAL.json");

            var resultData = serviceResult["dataObjects"];

            if (resultData === undefined) {
                results.push({
                    path: ['searchResult', requestId],
                    value: $error('data not found in system')
                });
            }
            else {
                var index = 0;
                var entityIdArray = [];
                resultData.forEach(function(entity) {
                    if (entity.id !== undefined) {
                        //entityIdArray.push(entity.id);
                        results.push({
                            path: ['searchResults', requestId, "entities", index++],
                            $type: "ref",
                            value: $ref({'id': entity.id}),
                            $expires: expireTime
                        });
                    }
                });
            }

            results.push({
                path: ['searchResults', requestId, "requestId"],
                value: $atom(requestId),
                $expires: expireTime
            });

            results.push({
                path: ['searchResults', requestId, "request"],
                value: $atom(request),
                $expires: expireTime
            });

            //console.log(results);   
            return results;
        }
    }
]);

var EntityRouter = function() {
    EntityRouterBase.call(this);
};

EntityRouter.prototype = Object.create(EntityRouterBase.prototype);

EntityRouter.prototype._createRequestJson = function (ctxKeys, attrNames) {
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
        attributesCriterion: [], relationshipsCriterion: [],
        typesCriterion: [
            "sku",
            "style"
        ]
    };

    var query = {ctx: ctxGroups, valCtx: valCtxGroups, id: "", filters: filters};

    var request = {query:query, fields:fields, options:options};

    return request;
};

module.exports = function() {
    return new EntityRouter();
};

module.exports = function(app) {
    app.use('/entityData.json',
        falcorExpress.dataSourceRoute(function(req, res) {
            return new EntityRouter();
        }));
};

module.exports = function(app) {
    app.use('/file-upload',(function(req, res) {
            
        })
       );
};
