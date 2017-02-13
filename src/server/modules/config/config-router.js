'use strict';

var falcorExpress = require('falcor-express'),
    Router = require('falcor-router');

var resolver = require('./config-route-resolver');

var ConfigRouterBase = Router.createClass([
    {
        route: "configs[{keys:ctxKeys}]",
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
