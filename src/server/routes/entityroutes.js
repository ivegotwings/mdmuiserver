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

var EntityRouterBase = Router.createClass([
    {
        route: 'searchResults.create',
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
    },
    {
        route: 'searchResults[{keys:requestIds}].entities[{ranges:entityRanges}]',
        get: function(pathSet) {
            var results = [];
            //console.log(pathSet.requestIds, pathSet.entityRanges);

            var requestId = pathSet.requestIds[0];
            //console.log(requestId);

            var serviceResult = require("../data/entityJson_EXTERNAL.json");

            pathSet.requestIds.forEach(function(request) {
                if (request != requestId) {
                    //console.log(request);

                    results.push({
                        path: ['searchResults', requestId, "entities", index++],
                        value: $ref(['entitiesById', entity.id])
                    });

                    var requestDataObj = JSON.parse(request).requestData;

                    //console.log(requestDataObj);

                    var resultData = serviceResult["dataObjects"];

                    //console.log(resultData);

                    if (resultData === undefined) {
                        results.push({
                            path: ['searchResult', requestId],
                            value: $error('data not found in system')
                        });
                    }
                    else {
                        var index = 0;
                        resultData.forEach(function(entity) {
                            if (entity.id !== undefined) {
                                results.push({
                                    path: ['searchResults', requestId, "entities", index++],
                                    value: $ref(['entitiesById', entity.id])
                                });
                            }
                        });

                        results.push({
                            path: ['searchResult', request],
                            value: 'success'
                        });
                    }
                }
            });

            //console.log(results);
            return results;
        }
    },
    {
        route: "entitiesById[{keys:ids}]",
        get: function(pathSet) {

            //console.log('entitiesById call:' + pathSet);

            var results = [],
                entity;

            var serviceResult = require("../data/entityJson_EXTERNAL.json");

            pathSet.ids.forEach(function(id) {

                //console.log(id);

                var resultData = serviceResult["dataObjects"];

                //console.log(resultData);

                resultData.forEach(function(obj) {
                    if (obj.id == id) {
                        entity = obj;
                        return false;
                    }
                });

                //console.log('Entity:' + entity);

                if (entity === undefined) {
                    results.push({
                        path: ['entitiesById', id],
                        value: $error(id + ' not found in system')
                    });
                }
                else {
                    results.push({
                        path: ['entitiesById', id],
                        value: $atom(entity)
                    });
                }
            });

            //console.log(results);
            return results;
        }
    }
]);

var EntityRouter = function() {
    //console.log(this);
    EntityRouterBase.call(this);
};

EntityRouter.prototype = Object.create(EntityRouterBase.prototype);

module.exports = function() {
    return new EntityRouter();
};

module.exports = function(app) {
    app.use('/entityData.json',
        falcorExpress.dataSourceRoute(function(req, res) {
            return new EntityRouter();
        }));
};
