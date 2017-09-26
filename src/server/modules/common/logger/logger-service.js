'use strict'
var bunyan = require('bunyan');
var caller = require('caller');

var log4js = require('log4js');
var path = require("path");
var executionContext = require('../context-manager/execution-context');
require('../../../../shared/logger-config.js');

var LoggerService = function (options) {
  this._logger = null;
  this._isConfigured = false;
  this._config = {};
  this._formatKeys = LOGGER_CONFIG.formatKeys;
};

LoggerService.prototype = {
  configure: function (config) {
    this._config = config;
    this._isConfigured = true;

    var toolSettings = config.toolSettings;
    var streamPath = "/logs/dataplatformLogs.log";
    for(var stream of toolSettings.streams) {
      streamPath = stream.path;
    }
    streamPath = process.cwd() + streamPath;

    log4js.configure({
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
        default: { appenders: [ 'everything' ], level: 'error'}
      }
    });
    
    this._logger = log4js.getLogger("everything");
    this._logger.level = 'debug'; // default level is OFF - which means no logs at all.
    this.info('Logger is loaded...');

    // var cwdir = process.cwd();
    // for(var stream of toolSettings.streams) {
    //   stream.path = cwdir + stream.path;
    // }

    // this._logger = bunyan.createLogger(toolSettings);
    // this._logger.serializers = bunyan.stdSerializers;

    // this._logger.info('Logger is loaded...');
     
  },
  getConfig: function () {
    return this._config;
  },
  info: function (msg, obj) {
    var callerFile = caller();
    return this._log(msg, obj, callerFile, 'info');
  },
  fatal: function (msg, obj) {
    var callerFile = caller();
    return this._log(msg, obj, callerFile, 'fatal');
  },
  warn: function (msg, obj) {
    var callerFile = caller();
    return this._log(msg, obj, callerFile, 'warn');
  },
  error: function (msg, obj) {
    var callerFile = caller();
    return this._log(msg, obj, callerFile, 'error');
  },
  trace: function (msg, obj) {
    var callerFile = caller();
    return this._log(msg, obj, callerFile, 'trace');
  },
  debug: function (msg, obj) {
    var callerFile = caller();
    return this._log(msg, obj, callerFile, 'debug');
  },
  log: function (msg, obj, level) {
    var callerFile = caller();
    return this._log(msg, obj, callerFile, level);
  },
  _log: async function (msg, obj, callerFile, level) {
    if (!this._isConfigured) {
      throw "Logger is not configured. Please call logger.configure before using log method";
    }

    var moduleSetting = this._getCallerModuleSettings(callerFile);

    //console.log('module setting:', JSON.stringify(moduleSetting), 'caller :', callerFile);
    
    if(!obj) {
      obj = {};
    }

    if (this._isLogLevelEnabled(level, moduleSetting.level)) {
      //console.log('log entry, level: ', level, ' msg: ', msg);
      var formattedObject = this._getFormattedObject(msg, obj, callerFile);
      //Clear all the contexts
      this._logger.clearContext();
      for (var i = 0; i < this._formatKeys.length; i++) {
        var element = this._formatKeys[i];
        if(formattedObject.hasOwnProperty(element)){
            this._logger.addContext(element, formattedObject[element]);
        }else{
            this._logger.addContext(element, "");
        }
      }

      switch (level) {
        case 'debug':
          this._logger.debug(formattedObject);
          break;
        case 'trace':
          this._logger.trace(formattedObject);
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
  _isLogLevelEnabled: function (level, moduleLevel) {
    var loggerLevels = ["trace", "debug", "info", "warn", "error", "fatal"];

    if (loggerLevels.indexOf(level) >= loggerLevels.indexOf(moduleLevel))
      return true;
  },
  _getCallerModuleSettings: function (callerFile) {
    
    var moduleSettings = this._config.moduleSettings;
    for (var moduleName in moduleSettings) {
      if (callerFile.indexOf(moduleName) > -1) {
        return moduleSettings[moduleName];
      }
    }

    return moduleSettings.default;
  },
  _getPattern:function(){
      var pattern = "%d{ISO8601_WITH_TZ_OFFSET} [%p]";
      for (var i = 0; i < this._formatKeys.length; i++) {
        if((i == 4) || (i == 12)){
          pattern += "%n";
        }
        if(this._formatKeys[i] == "NewTimestamp"){
          pattern += " %d{ISO8601_WITH_TZ_OFFSET}";
        }else{
          pattern += " [%X{"+this._formatKeys[i]+"}]";
        }
      }
      return pattern;
  },
  _getFormattedObject:function(msg, obj){
      var formattedObj = {};
      formattedObj["ClassName"] = "UI";
      formattedObj["LogMessage"] = msg;
      //RequestId
      var requestId = obj["requestId"];
      if(requestId){
        formattedObj["RequestId"] = requestId;
      }
      //Tenent ID
      var securityContext = executionContext.getSecurityContext();
      if (securityContext && securityContext.tenantId) {
          formattedObj["TenantId"] = securityContext.tenantId;
      }
      //CallerServiceName
      var callerContext = executionContext.getCallerContext();
      if (callerContext) {
          formattedObj["CallerServiceName"] = JSON.stringify(callerContext);
      }

      return formattedObj;
  }
};

var loggerServiceInstance = new LoggerService();

module.exports = loggerServiceInstance;