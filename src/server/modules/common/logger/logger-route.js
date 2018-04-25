'use strict';

var loggerConfigManager = require('./logger-config.js');
var executionContext = require('../context-manager/execution-context');

var LoggerRouter = function (app) {
    app.use('/data/logger/get', async function (req, res) {
        var response = await loggerConfigManager.getCurrentModulesObject();
        //console.log('get logging modules', JSON.stringify(response));
        res.status(200).send(response);
    });

    app.use('/data/logger/set', async function (req, res) {
        //console.log('update logging modules', JSON.stringify(req.body));

        var modulesObjectContent = req.body;
        await loggerConfigManager.setCurrentModulesObject(modulesObjectContent);
        var response = await loggerConfigManager.getCurrentModulesObject();
        res.status(200).send(response);
    });
};


module.exports = function (app) {
    return new LoggerRouter(app);
};