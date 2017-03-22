'use strict';

var falcorExpress = require('falcor-express'),
    Router = require('falcor-router');

var resolver = require('./dataobject-route-resolver');

var DataObjectRouterBase = Router.createClass([
    {
        route: 'root[{keys:dataIndexes}].searchResults.create',
        call: async (callPath, args) => await resolver.initiateSearch(callPath, args)
    },
    {
        route: 'root[{keys:dataIndexes}].searchResults[{keys:requestIds}].items[{ranges:dataObjectRanges}]',
        get: async (pathSet) => await resolver.getSearchResultDetail(pathSet)
    },
    {
        route: "root[{keys:dataIndexes}][{keys:dataObjectTypes}].byIds[{keys:dataObjectIds}][{keys:dataObjectFields}]",
        get: async (pathSet) => await resolver.getByIds(pathSet, "getFields")
    },
    {
        route: "root[{keys:dataIndexes}][{keys:dataObjectTypes}].byIds[{keys:dataObjectIds}].data.ctxInfo[{keys:ctxKeys}].attributes[{keys:attrNames}].valCtxInfo[{keys:valCtxKeys}][{keys:valFields}]",
        get: async (pathSet) => await resolver.getByIds(pathSet, "getAttrs")
    },
    {
        route: "root[{keys:dataIndexes}][{keys:dataObjectTypes}].byIds[{keys:dataObjectIds}].data.ctxInfo[{keys:ctxKeys}].relationships[{keys:relTypes}].relIds",
        get: async (pathSet) => await resolver.getByIds(pathSet, "getRelIdOnly")
    },
    {
        route: "root[{keys:dataIndexes}][{keys:dataObjectTypes}].byIds[{keys:dataObjectIds}].data.ctxInfo[{keys:ctxKeys}].relationships[{keys:relTypes}].rels[{keys:relIds}][{keys:relFields}]",
        get: async (pathSet) => await resolver.getByIds(pathSet, "getRelFieldsByActual")
    },
    {
        route: "root[{keys:dataIndexes}][{keys:dataObjectTypes}].byIds[{keys:dataObjectIds}].data.ctxInfo[{keys:ctxKeys}].relationships[{keys:relTypes}].rels[{keys:relIds}].attributes[{keys:relAttrNames}].valCtxInfo[{keys:valCtxKeys}][{keys:valFields}]",
        get: async (pathSet) => await resolver.getByIds(pathSet, "getRelAttrsByActual")
    },
    {
        route: "root[{keys:dataIndexes}][{keys:dataObjectTypes}].byIds[{keys:dataObjectIds}].data.getContexts",
        call: async (pathSet) => await resolver.getByIds(pathSet, "getContexts")
    },
    {
        route: "root[{keys:dataIndexes}][{keys:dataObjectTypes}].byIds[{keys:dataObjectIds}].data.ctxInfo[{keys:ctxKeys}]['jsonData']",
        get: async (pathSet) => await resolver.getByIds(pathSet, "getJsonData")
    },
    {
        route: "root[{keys:dataIndexes}][{keys:dataObjectTypes}].create",
        call: async (callPath, args) => await resolver.create(callPath, args, "create")
    },
    {
        route: "root[{keys:dataIndexes}][{keys:dataObjectTypes}].byIds[{keys:dataObjectIds}].update",
        call: async (callPath, args) => await resolver.update(callPath, args, "update")
    },
    {
        route: "root[{keys:dataIndexes}][{keys:dataObjectTypes}].byIds[{keys:dataObjectIds}].delete",
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
