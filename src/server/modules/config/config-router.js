'use strict';

var falcorExpress = require('falcor-express'),
    Router = require('falcor-router');

var resolver = require('./config-route-resolver');

var ConfigRouterBase = Router.createClass([
    {
        route: "configs.apps[{keys:apps}].componentNames",
        get: async (pathSet) => await resolver.getConfigComponentNames(pathSet)
    },
    // {
    //     route: "configs.tenants[{keys:tenantIds}].roles[{keys:roleNames}][{keys:apps}]",
    //     get: async (pathSet) => await resolver.getConfigs(pathSet)
    // },
    {
        route: "configs.tenants[{keys:tenants}].roles[{keys:roles}].users[{keys:users}].apps[{keys:apps}].components[{keys:components}].ctx[{keys:ctxKeys}].config",
        get: async (pathSet) => await resolver.getConfigs(pathSet)
    }
]);

var ConfigRouter = function () {
    ConfigRouterBase.call(this);
};

ConfigRouter.prototype = Object.create(ConfigRouterBase.prototype);

module.exports = function () {
    return new ConfigRouter();
};

module.exports = function (app) {
    app.use('/configData.json',
        falcorExpress.dataSourceRoute(function (req, res) {
            return new ConfigRouter();
        }));
};
