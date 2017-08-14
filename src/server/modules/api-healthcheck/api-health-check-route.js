'use strict';
const ApiHealthCheckService = require('./ApiHealthCheckService');
var options = {};
var runOffline = process.env.RUN_OFFLINE;

if (runOffline) {
    options.runOffline = runOffline;
}

const apiHealthCheckService = new ApiHealthCheckService(options);

var ApiHealthCheckServiceRouter = function (app) {
    app.get('*/data/healthcheck/*', async function (req, res) {
        var response = await apiHealthCheckService.call(req.url);
        res.status(200).send(response);
    });
};

module.exports = function (app) {
    return new ApiHealthCheckServiceRouter(app);
};