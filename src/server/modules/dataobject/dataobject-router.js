'use strict';

var falcorExpress = require('falcor-express'),
    Router = require('falcor-router'),
    routerOptions = { maxPaths: 70000 }; // maxPaths defines max. allowed number of paths in one router request

var resolver = require('./dataobject-route-resolver');

var DataObjectRouterBase = Router.createClass(
    [
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
            route: "root[{keys:dataIndexes}][{keys:dataObjectTypes}].byIds[{keys:dataObjectIds}].data.contexts[{keys:ctxKeys}].mappings[{keys:mapKeys}]",
            get: async (pathSet) => await resolver.getByIds(pathSet, "getMappings")
        },
        {
            route: "root[{keys:dataIndexes}][{keys:dataObjectTypes}].byIds[{keys:dataObjectIds}].data.mappings[{keys:mapKeys}]",
            get: async (pathSet) => await resolver.getByIds(pathSet, "getMappings")
        },
        {
            route: "root[{keys:dataIndexes}][{keys:dataObjectTypes}].byIds[{keys:dataObjectIds}].data.contexts[{keys:ctxKeys}].attributes[{keys:attrNames}].valContexts[{keys:valCtxKeys}][{keys:valFields}]",
            get: async (pathSet) => await resolver.getByIds(pathSet, "getAttrs")
        },
        {
            route: "root[{keys:dataIndexes}][{keys:dataObjectTypes}].byIds[{keys:dataObjectIds}].data.contexts[{keys:ctxKeys}].relationships[{keys:relTypes}].relIds",
            get: async (pathSet) => await resolver.getByIds(pathSet, "getRelIdOnly")
        },
        {
            route: "root[{keys:dataIndexes}][{keys:dataObjectTypes}].byIds[{keys:dataObjectIds}].data.contexts[{keys:ctxKeys}].relationships[{keys:relTypes}].rels[{keys:relIds}][{keys:relFields}]",
            get: async (pathSet) => await resolver.getByIds(pathSet, "getRelFieldsByActual")
        },
        {
            route: "root[{keys:dataIndexes}][{keys:dataObjectTypes}].byIds[{keys:dataObjectIds}].data.contexts[{keys:ctxKeys}].relationships[{keys:relTypes}].rels[{keys:relIds}].attributes[{keys:relAttrNames}].valContexts[{keys:valCtxKeys}][{keys:valFields}]",
            get: async (pathSet) => await resolver.getByIds(pathSet, "getRelAttrsByActual")
        },
        {
            route: "root[{keys:dataIndexes}][{keys:dataObjectTypes}].byIds[{keys:dataObjectIds}].data.getContexts",
            call: async (pathSet) => await resolver.getByIds(pathSet, "getContexts")
        },
        {
            route: "root[{keys:dataIndexes}][{keys:dataObjectTypes}].byIds[{keys:dataObjectIds}].data.contexts[{keys:ctxKeys}]['jsonData']",
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

var DataObjectRouter = function (options) {
    DataObjectRouterBase.call(this, options);
    //Router create class method is not handing options passed on..this is bug in falcor
    //As workaround, we need to set related properties explicity to the router class..(for now only maxPaths)
    this.maxPaths = options.maxPaths; 
};

DataObjectRouter.prototype = Object.create(DataObjectRouterBase.prototype);

module.exports = function () {
    return new DataObjectRouter(routerOptions);
};

module.exports = function (app) {
    app.use('/data/dataObjects.json',
        falcorExpress.dataSourceRoute(function (req, res) {
            return new DataObjectRouter(routerOptions);
        }));
};
