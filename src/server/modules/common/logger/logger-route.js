'use strict';

var LOGGER_CONFIG = require('./logger-config.js');

var LoggerRouter = function (app) {
    app.use('/data/logger/get', async function (req, res) {
        var response = LOGGER_CONFIG.getModulesObject();
        //console.log('get logging modules', JSON.stringify(response));
        res.status(200).send(response);
    });
    app.use('/data/logger/set', async function (req, res) {
        //console.log('update logging modules', JSON.stringify(req.body));
        LOGGER_CONFIG.setModulesObject(req.body);
        var response =  LOGGER_CONFIG.getModulesObject();
        res.status(200).send(response);
    });
};

module.exports = function (app) {
    return new LoggerRouter(app);
};