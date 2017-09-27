'use strict';

var LOGGER_CONFIG = require('./logger-config.js');

var LoggerRouter = function (app) {
    app.get('/data/logger', async function (req, res) {
        var response = LOGGER_CONFIG.getModulesObject();
        res.status(200).send(response);
    });
    app.post('/data/logger', async function (req, res) {
        LOGGER_CONFIG.setModulesObject(req.body);
        var response =  LOGGER_CONFIG.getModulesObject();
        res.status(200).send(response);
    });
};

module.exports = function (app) {
    return new LoggerRouter(app);
};