'use strict'
var caller = require('caller');
var log4js = require('log4js');
var path = require("path");
var executionContext = require('../context-manager/execution-context');
var LOGGER_CONFIG = require('./logger-config.js');
var isEmpty = require('../utils/isEmpty');

const loggerLevels = ["fatal", "error", "warn", "info", "debug"];

var uuidV1 = require('uuid/v1');

var LoggerService = function (options) {
  this._logger = null;
  this._isConfigured = false;
  this._config = {};
};

LoggerService.prototype = {
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
  _getModuleLogConfig: function (callerModuleName, calleeServiceName) {
    var moduleLogConfig = LOGGER_CONFIG.getBaseModulesObject();

    var setting = {
      callerModuleName: callerModuleName ? callerModuleName : 'none',
      calleeServiceName: calleeServiceName ? calleeServiceName : 'none',
      config: moduleLogConfig.default
    };
    
    if(calleeServiceName && moduleLogConfig[calleeServiceName]) {
      setting.config = moduleLogConfig[calleeServiceName];
    }
    else if(callerModuleName && moduleLogConfig[callerModuleName]) {
      setting.config = moduleLogConfig[callerModuleName];
    }

    //console.log('module setting', JSON.stringify(setting));

    return setting;
  },
  _getFormattedObject: function (msg, obj, moduleSetting) {
    var formattedObj = {};

    formattedObj["className"] = "UI";

    //Tenent ID
    var securityContext = executionContext.getSecurityContext();
    if (securityContext && securityContext.tenantId) {
      formattedObj["tenantId"] = securityContext.tenantId;
    }

    // User Id
    if (securityContext && securityContext.headers && securityContext.headers.userId) {
      formattedObj["userId"] = securityContext.headers.userId;
    }

    //Caller module name
    if (moduleSetting.callerModuleName) {
      formattedObj["callerServiceName"] = moduleSetting.callerModuleName;
    }
    
    //Callee service name
    if (moduleSetting.calleeServiceName) {
      formattedObj["calleeServiceName"] = moduleSetting.calleeServiceName;
    }

    //Request Id
    if (obj.requestId) {
      formattedObj["requestId"] = obj.requestId;
    }

    //Inclusive time
    if (obj.taken) {
      formattedObj["inclusiveTime"] = obj.taken;
    }

    //Format Log Message
    var finalMessage = "[" + msg + "] ";
    if (obj.request && obj.request.body) {
      finalMessage += "[Request - " + JSON.stringify(obj.request.body) + "] ";
    }
    if (obj.response) {
      finalMessage += "[Response - " + JSON.stringify(obj.response) + "]";
    }
    if (obj.detail) {
      finalMessage += "[Detail - " + JSON.stringify(obj.detail) + "] ";
    }

    formattedObj["logMessage"] = finalMessage;

    return formattedObj;
  },
  _log: async function (level, msg, obj, callerModuleName, calleeServiceName) {
    if (!this._isConfigured) {
      throw "Logger is not configured. Please call logger.configure before using log method";
    }

    var moduleSetting = this._getModuleLogConfig(callerModuleName, calleeServiceName);

    if(isEmpty(moduleSetting) || isEmpty(moduleSetting.config)) {
      console.error('Module setting not found...No logging would happen in system');
      return;
    }

    if (loggerLevels.indexOf(level) > loggerLevels.indexOf(moduleSetting.config.level)) {
      return;
    }

    if (!obj) {
      obj = {};
    }

    var formattedObject = this._getFormattedObject(msg, obj, moduleSetting);

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
  },
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
  info: function (msg, obj, callerModuleName, calleeServiceName) {
    return this._log('info', msg, obj, callerModuleName, calleeServiceName);
  },
  fatal: function (msg, obj, callerModuleName, calleeServiceName) {
    return this._log('fatal', msg, obj, callerModuleName, calleeServiceName);
  },
  warn: function (msg, obj, callerModuleName, calleeServiceName) {
    return this._log('warn', msg, obj, callerModuleName, calleeServiceName);
  },
  error: function (msg, obj, callerModuleName, calleeServiceName) {
    //console.log('new error: ', msg, 'module: ', callerModuleName);
    return this._log('error', msg, obj, callerModuleName, calleeServiceName);
  },
  debug: function (msg, obj, callerModuleName, calleeServiceName) {
    return this._log('debug', msg, obj, callerModuleName, calleeServiceName);
  },
  log: function (level, msg, obj, callerModuleName, calleeServiceName) {
    return this._log(level, msg, obj, callerModuleName, calleeServiceName);
  },
  logRequest: function (serviceName, options) {
    var internalRequestId = uuidV1();
    var requestLog = {
      "requestId": internalRequestId,
      "service": serviceName,
      "request": options
    }
    this.debug("RDF_REQUEST_INITIATED", requestLog, "df-rest-service", serviceName);
    return internalRequestId;
  },
  logError: function (internalRequestId, serviceName, options, result) {
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
        "service": serviceName,
        "requestId": internalRequestId,
        "request": options,
        "response": result,
      };
      this.error("RDF_ERROR", errorLog, "df-rest-service", serviceName);
    }

    return isErrorResponse;
  },
  logException: function (internalRequestId, serviceName, options, error) {
    var exceptionJson = {
      "service": serviceName,
      "detail": error,
      "requestId": internalRequestId,
      "request": options
    };
    this.fatal("RDF_CALL_EXCEPTION", exceptionJson, "df-rest-service", serviceName);
  },
  logResponseCompletedInfo: function (internalRequestId, serviceName, hrstart) {
    var hrend = process.hrtime(hrstart);
    var taken = hrend[1] / 1000000;
    var responseLog = {
      "requestId": internalRequestId,
      "service": serviceName,
      "taken": taken
    };

    if(taken > 500) {
    //  this.warn("RDXXXX", responseLog, )
      this.warn("RDF_SLOW_RESPONSE_RECEIVED", responseLog, "df-rest-service", serviceName);
    }
    
  },
  logResponse: function (internalRequestId, serviceName, response) {
    var responseLog = {
      "requestId": internalRequestId,
      "service": serviceName,
      "response": response
    }
    this.debug("RDF_RESPONSE", responseLog, "df-rest-service", serviceName);
  },
  getCurrentModule: function () {
    return path.basename(path.dirname(caller(1)));
  }
};

var loggerServiceInstance = new LoggerService();

module.exports = loggerServiceInstance;