'use strict'

var log4js = require('log4js');
var path = require("path");
var executionContext = require('../context-manager/execution-context');
var LOGGER_CONFIG = require('./logger-config.js');

var uuidV1 = require('uuid/v1');

var LoggerService = function (options) {
  this._logger = null;
  this._isConfigured = false;
  this._config = {};
};

LoggerService.prototype = {
  configure: function (config) {
    this._config = config;
    this._isConfigured = true;
    this._formatKeys = LOGGER_CONFIG.formatKeys;

    var toolSettings = config.toolSettings;
    var streamPath = "/logs/dataplatformLogs.log";
    for (var stream of toolSettings.streams) {
      streamPath = stream.path;
    }
    streamPath = path.dirname(require.main.filename) + streamPath;

    log4js.configure({
      pm2: true,
      appenders: {
        everything: {
          type: 'file',
          filename: path.normalize(streamPath),
          layout: {
            type: 'pattern',
            pattern: this._getPattern()
          }
        }
      },
      categories: {
        default: { appenders: ['everything'], level: 'error' }
      }
    });

    this._logger = log4js.getLogger("everything");
    this._logger.level = 'debug'; // default level is OFF - which means no logs at all.
    this.info('Logger is loaded...');
  },
  getConfig: function () {
    return this._config;
  },
  info: function (msg, obj, service) {
    return this._log(msg, obj, service, 'info');
  },
  fatal: function (msg, obj, service) {
    return this._log(msg, obj, service, 'fatal');
  },
  warn: function (msg, obj, service) {
    return this._log(msg, obj, service, 'warn');
  },
  error: function (msg, obj, service) {
    return this._log(msg, obj, service, 'error');
  },
  debug: function (msg, obj, service) {
    return this._log(msg, obj, service, 'debug');
  },
  log: function (msg, obj, level, service) {
    return this._log(msg, obj, service, level);
  },
  _log: async function (msg, obj, serviceName, level) {
    if (!this._isConfigured) {
      throw "Logger is not configured. Please call logger.configure before using log method";
    }

    if (!obj) {
      obj = {};
    }

    if(!serviceName){
      serviceName = this._getLogServiceName(obj);
    }
    if (this._isLogLevelEnabled(level, serviceName)) {
      var formattedObject = this._getFormattedObject(msg, obj, serviceName);
      //Clear all the contexts
      this._logger.clearContext();
      for (var i = 0; i < this._formatKeys.length; i++) {
        var element = this._formatKeys[i];
        if (formattedObject.hasOwnProperty(element)) {
          this._logger.addContext(element, formattedObject[element]);
        } else {
          this._logger.addContext(element, "");
        }
      }

      switch (level) {
        case 'debug':
          this._logger.debug(formattedObject);
          break;
        case 'info':
          this._logger.info(formattedObject);
          break;
        case 'warn':
          this._logger.warn(formattedObject);
          break;
        case 'error':
          this._logger.error(formattedObject);
          break;
        default:
          this._logger.fatal(formattedObject);
          break;
      }
    }
  },
  _isLogLevelEnabled: function (level, serviceName) {
    var loggerLevels = ["fatal", "error", "warn", "info", "debug"];
    var modulesObject = LOGGER_CONFIG.getModulesObject();
    if (modulesObject[serviceName] && modulesObject[serviceName].level) {
      if (loggerLevels.indexOf(level) <= loggerLevels.indexOf(modulesObject[serviceName].level)) {
        return true;
      }
    }
  },
  _getPattern: function () {
    var pattern = "%d{ISO8601_WITH_TZ_OFFSET} [%p]";
    for (var i = 0; i < this._formatKeys.length; i++) {
      if ((i == 4) || (i == 12)) {
        pattern += "%n";
      }
      if (this._formatKeys[i] == "newTimestamp") {
        pattern += " %d{ISO8601_WITH_TZ_OFFSET}";
      } else {
        pattern += " [%X{" + this._formatKeys[i] + "}]";
      }
    }
    return pattern;
  },
  _getFormattedObject: function (msg, obj, serviceName) {
    var formattedObj = {};
    formattedObj["className"] = "UI";
    //Tenent ID
    var securityContext = executionContext.getSecurityContext();
    if (securityContext && securityContext.tenantId) {
      formattedObj["tenantId"] = securityContext.tenantId;
    }
    //Module/Service name
    if (serviceName) {
      formattedObj["calleeServiceName"] = serviceName;
    }
    //Format Log Message
    var finalMessage = "[" + msg + "] ";
    if(obj.request && obj.request.body){
        finalMessage += "[Request - " + JSON.stringify(obj.request.body) + "] ";
    }
    if(obj.response){
        finalMessage += "[Response - " + obj.response + "]";
    }
    if(obj.detail){
        finalMessage += "[Detail - " + JSON.stringify(obj.detail) + "] ";
    }
    if(obj.taken){
        finalMessage += "[Time Taken - " + obj.taken + "] ";
    }
    formattedObj["logMessage"] = finalMessage;
    return formattedObj;
  },
  _getLogServiceName: function (obj) {
    var _serviceName = "";
    //Extract service from URL
    if (obj.url) {
      var moduleSettings = LOGGER_CONFIG.getModulesObject();
      for (var logService in moduleSettings) {
        if (moduleSettings[logService]) {
          var element = moduleSettings[logService];
          if (obj.url.indexOf(logService) > -1) {
            _serviceName = logService;
          }
        }
      }
    }
    return _serviceName;
  },
  //Log any RDF request
  logRequest: function (url, options) {
    var internalRequestId = uuidV1();
    var requestLog = {
      "requestId": internalRequestId,
      "url": url,
      "request": options
    }
    this.debug("RDF_REQUEST_INITIATED", requestLog);
    return internalRequestId;
  },
  logError: function (internalRequestId, url, options, result) {
    var isErrorResponse = false;

    //check if response object has error status
    if (result && result.response && result.response.status) {
      var resStatus = result.response.status;
      if (resStatus && resStatus == "error") {
        isErrorResponse = true;
      }
    }

    //check if generic failure happend in RDF layer
    if (!isErrorResponse && result && result.dataObjectOperationResponse && result.dataObjectOperationResponse.status) {
      var resStatus = result.dataObjectOperationResponse.status;
      if (resStatus && resStatus == "error") {
        isErrorResponse = true;
      }
    }

    if (isErrorResponse) {
      var errorLog = {
        "url": url,
        "requestId": internalRequestId,
        "request": options,
        "response": result,
      };
      this.error("RDF_ERROR", errorLog);
    }
  },

  logException: function (internalRequestId, url, options, error) {
    var exceptionJson = {
      "url": url,
      "detail": error,
      "requestId": internalRequestId,
      "request": options
    };
    this.fatal("RDF_CALL_EXCEPTION", exceptionJson);
  },

  logResponse: function (internalRequestId, url, options, result, hrstart) {
    var hrend = process.hrtime(hrstart);
    var taken = hrend[1] / 1000000;
    var responseLog = {
      "url": url,
      "taken": taken,
      "requestId": internalRequestId
    };
    this.info("RDF_RESPONSE_COMPLETED", responseLog);
  }


};

var loggerServiceInstance = new LoggerService();

module.exports = loggerServiceInstance;