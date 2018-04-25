'use strict';

var LOGGER_CONFIG = require('./logger-config.js');
var executionContext = require('../context-manager/execution-context');

var LoggerRouter = function (app) {
    app.use('/data/logger/get', async function (req, res) {
        var key = getCacheKey();
        var response = await LOGGER_CONFIG.getModulesObject(key);
        //console.log('get logging modules', JSON.stringify(response));
        res.status(200).send(response);
    });

    app.use('/data/logger/set', async function (req, res) {
        //console.log('update logging modules', JSON.stringify(req.body));
        
        var val = req.body
        var key = getCacheKey();
        await LOGGER_CONFIG.setModulesObject(key, val);
        var response = await LOGGER_CONFIG.getModulesObject(key);
        res.status(200).send(response);
    });

    function getCacheKey() {
        // if (val.globalSettings.tenant && val.globalSettings.user) {
      //     key = "ALL-TENANT-ALL-USER";
      // } else if (val.globalSettings.user) {
      //     key = "ALL-USER";
      // } else if (val.globalSettings.tenant) {
      //     key = "ALL-TENANT";
      // }
      var securityContext = executionContext.getSecurityContext();
      var tenantId  = "unknown";
      var userId = "unknown";
      if (securityContext) {
          tenantId = securityContext.tenantId;
          if (securityContext.headers && securityContext.headers.userId) {
              userId = securityContext.headers.userId;
          }
      }
  
      var key = "".concat('logsettings_tenant_', tenantId, '#@#user_', userId);
  
      return key;
  }
};


module.exports = function (app) {
    return new LoggerRouter(app);
};