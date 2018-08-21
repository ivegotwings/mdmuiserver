'use strict';
const ApiHealthCheckService = require('./ApiHealthCheckService');
let options = {};
let runOffline = process.env.RUN_OFFLINE;

if (runOffline) {
    options.runOffline = runOffline;
}

const apiHealthCheckService = new ApiHealthCheckService(options);

let ApiHealthCheckServiceRouter = function (app) {
    app.use('*/data/healthcheck/*', async function (req, res) {
        let response = await apiHealthCheckService.call(req.originalUrl);
        res.status(200).send(response);
    });
};

module.exports = function (app) {
    return new ApiHealthCheckServiceRouter(app);
};