'use strict';

var falcorExpress = require('falcor-express'),
    Router = require('falcor-router');

var resolver = require('./route-resolver');

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
        route: "entitiesById[{keys:entityIds}].data.ctxInfo[{keys:ctxKeys}].attributes[{keys:attrNames}].values",
        get: async (pathSet) => await resolver.getEntities(pathSet)
    },
    {
        route: "entitiesById[{keys:entityIds}][{keys:entityFields}]",
        get: async (pathSet) => await resolver.getEntities(pathSet)
    },
    {
        route: "entitiesById[{keys:entityIds}].data.ctxInfo[{keys:ctxKeys}].attributes[{keys:attrNames}].values",
        set: async (pathSet) => await resolver.saveEntities(pathSet)
    },
    {
        route: "entitiesById[{keys:entityIds}][{keys:entityFields}]",
        set: async (jsonEnvelope) => await resolver.saveEntities(jsonEnvelope)
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
