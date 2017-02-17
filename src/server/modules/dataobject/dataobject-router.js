'use strict';

var falcorExpress = require('falcor-express'),
    Router = require('falcor-router');

var resolver = require('./dataobject-route-resolver');

var DataObjectRouterBase = Router.createClass([
    {
        route: 'dataObjects[{keys:objTypes}].cachedSearchResults.create',
        call: async (callPath, args) => await resolver.initiateSearch(callPath, args)
    },
    {
        route: 'dataObjects[{keys:objTypes}].cachedSearchResults[{keys:requestIds}].items[{ranges:dataObjectRanges}]',
        get: async (pathSet) => await resolver.getSearchResultDetail(pathSet)
    }, 
    {
        route: "dataObjects[{keys:objTypes}].masterList[{keys:dataObjectIds}][{keys:dataObjectFields}]",
        get: async (pathSet) => await resolver.getByIds(pathSet, "getFields")
    },
    {
        route: "dataObjects[{keys:objTypes}].masterList[{keys:dataObjectIds}].data.ctxInfo[{keys:ctxKeys}].attributes[{keys:attrNames}].['values','groups']",
        get: async (pathSet) => await resolver.getByIds(pathSet, "getAttrs")
    },
    {
        route: "dataObjects[{keys:objTypes}].masterList[{keys:dataObjectIds}].data.ctxInfo[{keys:ctxKeys}].relationships[{keys:relTypes}].relIds",
        get: async (pathSet) => await resolver.getByIds(pathSet, "getRelIdOnly")
    },
    {
        route: "dataObjects[{keys:objTypes}].masterList[{keys:dataObjectIds}].data.ctxInfo[{keys:ctxKeys}].relationships[{keys:relTypes}].rels[{keys:relIds}][{keys:relationshipFields}]",
        get: async (pathSet) => await resolver.getByIds(pathSet, "getRelFieldsByActual")
    },
    {
        route: "dataObjects[{keys:objTypes}].masterList[{keys:dataObjectIds}].data.ctxInfo[{keys:ctxKeys}].relationships[{keys:relTypes}].rels[{keys:relIds}].attributes[{keys:relAttrNames}].['values', 'groups']",
        get: async (pathSet) => await resolver.getByIds(pathSet, "getRelAttrsByActual")
    },
    {
        route: "dataObjects[{keys:objTypes}].create",
        call: async (callPath, args) => await resolver.create(callPath, args, "create")
    },
    {
        route: "dataObjects[{keys:objTypes}].masterList[{keys:dataObjectIds}].update",
        call: async (callPath, args) => await resolver.update(callPath, args, "update")
    },
    {
        route: "dataObjects[{keys:objTypes}].masterList[{keys:dataObjectIds}].delete",
        call: async (callPath, args) => await resolver.deleteDataObjects(callPath, args, "delete")
    }
]);

var DataObjectRouter = function () {
    DataObjectRouterBase.call(this);
};

DataObjectRouter.prototype = Object.create(DataObjectRouterBase.prototype);

module.exports = function () {
    return new DataObjectRouter();
};

module.exports = function (app) {
    app.use('/data/dataObjects.json',
        falcorExpress.dataSourceRoute(function (req, res) {
            return new DataObjectRouter();
        }));
};
