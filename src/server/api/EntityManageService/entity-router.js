'use strict';

var falcorExpress = require('falcor-express'),
    Router = require('falcor-router');

var resolver = require('./entity-route-resolver');

var EntityRouterBase = Router.createClass([
    {
        route: 'searchResults.create',
        call: async (callPath, args) => await resolver.initiateSearchRequest(callPath, args)
    },
    {
        route: 'searchResults[{keys:requestIds}].entities[{ranges:entityRanges}]',
        get: async (pathSet) => await resolver.getSearchResultDetail(pathSet)
    }, 
    {
        route: "entitiesById[{keys:entityIds}][{keys:entityFields}]",
        get: async (pathSet) => await resolver.getEntities(pathSet, "getEntityFields")
    },
    {
        route: "entitiesById[{keys:entityIds}].data.ctxInfo[{keys:ctxKeys}].attributes[{keys:attrNames}].values",
        get: async (pathSet) => await resolver.getEntities(pathSet, "getEntityAttrs")
    },
    {
        route: "entitiesById[{keys:entityIds}].data.ctxInfo[{keys:ctxKeys}].relationships[{keys:relTypes}].relIds",
        get: async (pathSet) => await resolver.getEntities(pathSet, "getRelIdOnly")
    },
    {
        route: "entitiesById[{keys:entityIds}].data.ctxInfo[{keys:ctxKeys}].relationships[{keys:relTypes}].rels[{keys:relIds}][{keys:relationshipFields}]",
        get: async (pathSet) => await resolver.getEntities(pathSet, "getRelFieldsByActual")
    },
    {
        route: "entitiesById[{keys:entityIds}].data.ctxInfo[{keys:ctxKeys}].relationships[{keys:relTypes}].rels[{keys:relIds}].attributes[{keys:relAttrNames}].values",
        get: async (pathSet) => await resolver.getEntities(pathSet, "getRelAttrsByActual")
    },
    {
        route: "entitiesById.createEntities",
        call: async (callPath, args) => await resolver.createEntities(callPath, args, "entitiesById.createEntities")
    },
    {
        route: "entitiesById[{keys:entityIds}].updateEntities",
        call: async (callPath, args) => await resolver.updateEntities(callPath, args, "entitiesById[{keys:entityIds}].updateEntities")
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
