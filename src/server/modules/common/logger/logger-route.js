'use strict';

require('../../../../shared/logger-config.js');

var LoggerRouter = function (app) {
    app.get('/data/logger', async function (req, res) {
        var response = LOGGER_CONFIG.module;
        res.status(200).send(response);
    });
};

module.exports = function (app) {
    return new LoggerRouter(app);
};