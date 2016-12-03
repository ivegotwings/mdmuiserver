'use strict';

var falcorExpress = require('falcor-express'),
    Router = require('falcor-router'),
    flatten = require('flatten'),
    Promise = require('promise'),
    jsonGraph = require('falcor-json-graph'),
    $ref = jsonGraph.ref,
    $error = jsonGraph.error;

var EntityRouterBase = Router.createClass([
    {
        route: "entitiesById[{keys:ids}]",
        get: function(pathSet){
            //console.log(pathSet.ids);

            var results = [],
                entity;

            var serviceResult = require("../data/entityJson_EXTERNAL.json");
           
            pathSet.ids.forEach(function(id){
                entity = serviceResult["entities"][id];
                
                //console.log(entity);
                if(entity === undefined)
                {
                    results.push({
                        path: ['entitiesById', id],
                        value: $error(id + ' not found in system')
                    });
                }
                else
                {
                    entity = JSON.stringify(entity);

                    results.push({
                        path: ['entitiesById', id],
                        value: entity
                    });
                }
            });

            console.log(results);
            return results;
        }
    }
]);

var EntityRouter = function(){
    EntityRouterBase.call(this);
};

EntityRouter.prototype = Object.create(EntityRouterBase.prototype);

module.exports = function(){
    return new EntityRouter();
};

module.exports = function (app) {
    app.use('/model.json', 
        falcorExpress.dataSourceRoute(function (req, res) {
            return new EntityRouter();            
        }));
};
