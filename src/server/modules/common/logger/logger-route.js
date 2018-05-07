'use strict';

var loggerConfigManager = require('./logger-config.js');
var executionContext = require('../context-manager/execution-context');
const logger = require('./logger-service');

var LoggerRouter = function (app) {
    app.use('/data/logger/getconfig', async function (req, res) {
        var response = await loggerConfigManager.getCurrentModulesObject();
        //console.log('get logging modules', JSON.stringify(response));
        res.status(200).send(response);
    });

    app.use('/data/logger/setconfig', async function (req, res) {
        //console.log('update logging modules', JSON.stringify(req.body));

        var modulesObjectContent = req.body;
        await loggerConfigManager.setCurrentModulesObject(modulesObjectContent);
        var response = await loggerConfigManager.getCurrentModulesObject();
        res.status(200).send(response);
    });

    app.use('/data/logger/sendlogs', async function (req, res) {
        var response = {"status": "error"};

        if(req.body && req.body[0] && req.body[0].message) {
            //console.log(req.body[0].message);
            var logRecord = JSON.parse(req.body[0].message);
            if(logRecord) {
                //console.log(logRecord.obj);
                logger[logRecord.level](logRecord.msg, logRecord.obj, logRecord.callerModuleName, logRecord.calleeServiceName);
                response.status = "success";
            }
        }

        res.status(200).send(response);
    });
};


module.exports = function (app) {
    return new LoggerRouter(app);
};