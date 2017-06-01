'use strict'
var bunyan = require('bunyan');
var caller = require('caller');

var LoggerService = function (options) {
  this._logger = null;
  this._isConfigured = false;
  this._config = {};
};

LoggerService.prototype = {
  configure: function (config) {
    this._config = config;
    var toolSettings = config.toolSettings;

    var cwdir = process.cwd();
    for(var stream of toolSettings.streams) {
      stream.path = cwdir + stream.path;
    }

    this._logger = bunyan.createLogger(toolSettings);
    this._logger.serializers = bunyan.stdSerializers;

    this._logger.info('Logger is loaded...');
    this._isConfigured = true;
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
      switch (level) {
        case 'debug':
          this._logger.debug(obj, msg);
          break;
        case 'trace':
          this._logger.trace(obj, msg);
          break;
        case 'info':
          this._logger.info(obj, msg);
          break;
        case 'warn':
          this._logger.warn(obj, msg);
          break;
        case 'error':
          this._logger.error(obj, msg);
          break;
        default:
          this._logger.fatal(obj, msg);
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
  }
};

var loggerServiceInstance = new LoggerService();

module.exports = loggerServiceInstance;