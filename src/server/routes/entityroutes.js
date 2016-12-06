'use strict';

var falcorExpress = require('falcor-express'),
    Router = require('falcor-router'),
    flatten = require('flatten'),
    Promise = require('promise'),
    jsonGraph = require('falcor-json-graph'),
    $ref = jsonGraph.ref,
    $error = jsonGraph.error,
    $atom = jsonGraph.atom;

var EntityRouterBase = Router.createClass([
    {
        route: "entitiesById[{keys:ids}]",
        get: function (pathSet) {

            //console.log('entitiesById call:' + pathSet);

            var results = [],
                entity;

            var serviceResult = require("../data/entityJson_EXTERNAL.json");

            pathSet.ids.forEach(function (id) {

                //console.log(id);

                var resultData = serviceResult["dataObjects"];

                //console.log(resultData);

                resultData.forEach(function (obj) {
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
    },
    {
        route: 'searchResult[{keys:requestIds}].entities[{ranges:entityRanges}]',
        get: function (pathSet) {
            var results = [];

            console.log(pathSet.requestIds);
            console.log(pathSet.entityRanges);

            var requestId = pathSet.requestIds[0];

            //console.log(requestId);

            var serviceResult = require("../data/entityJson_EXTERNAL.json");

            pathSet.requestIds.forEach(function (request) {
                if (request != requestId) {
                    //console.log(request);

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
                        var entities = JSON.stringify(resultData);

                        //console.log(entities);

                        var index = 0;
                        resultData.forEach(function (entity) {
                            if (entity.id !== undefined) {
                                results.push({
                                    path: ['searchResult', requestId, "entities", index++],
                                    value: $atom(['entitiesById', entity.id])
                                });

                                // var entityAsString = JSON.stringify(entity);

                                //  results.push({
                                //     path: ['entitiesById', entity.id], 
                                //     value: entityAsString
                                // });
                            }
                            else {
                                console.log('entity not found');
                            }
                        });

                        results.push({
                            path: ['searchResult', request],
                            value: 'success'
                        });
                    }
                }
            });

            console.log(results);
            return results;
        }
    },
    {
        route: "searchResultById[{keys:requestIds}]",
        get: function (pathSet) {
            var results = [];

            console.log(pathSet.requestIds);

            var serviceResult = require("../data/entityJson_EXTERNAL.json");

            //console.log(serviceResult);

            pathSet.requestIds.forEach(function (request) {
                console.log(request);

                //var requestDataObj = JSON.parse(request).requestData;

                //console.log(requestDataObj);

                var requestId = request;

                //console.log(requestId);

                var resultData = serviceResult["dataObjects"];

                //console.log(resultData);

                if (resultData === undefined) {
                    results.push({
                        path: ['searchResultById', requestId],
                        value: $error('data not found in system')
                    });
                }
                else {
                    var entities = JSON.stringify(resultData);

                    //console.log(entities);
                    results.push({
                        path: ['searchResultById', requestId],
                        value: entities
                    });
                }
            });

            console.log(results);
            return results;
        }
    }
]);

var EntityRouter = function () {
    EntityRouterBase.call(this);
};

EntityRouter.prototype = Object.create(EntityRouterBase.prototype);

module.exports = function () {
    return new EntityRouter();
};

module.exports = function (app) {
    app.use('/entityData.json',
        falcorExpress.dataSourceRoute(function (req, res) {
            return new EntityRouter();
        }));
};
