'use strict';

var LOGGER_CONFIG = require('./logger-config.js');

var LoggerRouter = function (app) {
    app.use('/data/logger/get', async function (req, res) {
        var key = req.headers['x-rdp-tenantid'] + req.headers['x-rdp-userid'];
        var response = await LOGGER_CONFIG.getModulesObject(key);
        //console.log('get logging modules', JSON.stringify(response));
        res.status(200).send(response);
    });
    app.use('/data/logger/set', async function (req, res) {
        //console.log('update logging modules', JSON.stringify(req.body));
        var key = req.headers['x-rdp-tenantid'] + req.headers['x-rdp-userid'];
        var val = req.body;
        if (val.globalSettings.tenant && val.globalSettings.user) {
            key = "ALL-TENANT-ALL-USER";
        } else if (val.globalSettings.user) {
            key = "ALL-USER";
        } else if (val.globalSettings.tenant) {
            key = "ALL-TENANT";
        }
        await LOGGER_CONFIG.setModulesObject(key, val);
        var response = await LOGGER_CONFIG.getModulesObject(key);
        res.status(200).send(response);
    });
};

module.exports = function (app) {
    return new LoggerRouter(app);
};