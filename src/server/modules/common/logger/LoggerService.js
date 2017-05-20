'use strict'
var bunyan = require('bunyan')
var caller = require('caller')
var log= bunyan.createLogger({
      name: 'app_diagnostics',
      streams: [{
        type: 'rotating-file',
        path: 'src/server/logs/diagnostics.log',
        period: '1d', // daily rotation
        count: 3 // keep 3 back copies
      }]
    });

var isConfigured=false;
var LoggerService = function (options) {
  isConfigured=true;
};

LoggerService.prototype = {
  getConfig: function () {
    var logConfig = {
      "loggerSettings": {
        "type": "rotating-file",
        "path": "src/server/logs/diagnostics.log",
        "period": "1d", // daily rotation
        "count": 3 // keep 3 back copies
      },
      "moduleSettings": {
        "cop": {
          "level": "debug"
        },
        "dataobject": {
          "level": "warn"
        },
        "file-upload": {
          "level": "info"
        },
        "default": {
          "level": "fatal"
        }
      }
    };
    return logConfig;
  },
  info: async function (obj) {
    var callerFile = caller();
    return this.log(obj, callerFile, 'info');
  },
  fatal: async function (obj) {
    var callerFile = caller();
    return this.log(obj, callerFile, 'fatal');
  },
  warn: function (obj) {
    var callerFile = caller();
    return this.log(obj, callerFile, 'warn');
  },
  error: async function (obj) {
    var callerFile = caller();
    return this.log(obj, callerFile, 'error');
  },
  trace: async function (obj) {
    var callerFile = caller();
    return this.log(obj, callerFile, 'trace');
  },
  debug: async function (obj) {
    var callerFile = caller();
    return this.log(obj, callerFile, 'debug');
  },
  log: function (obj, callerFile, level) {

    if(!isConfigured)
    {
      throw "Logger is not Configured";
    }
    var moduleSetting = this._getCallerModuleSettings(callerFile);
    
    if (this._isLogLevelEnabled(level, moduleSetting.level)) {
      switch (level) {
        case 'debug':
          log.debug(JSON.stringify(obj));
          break;
        case 'trace':
          log.trace(JSON.stringify(obj));
          break;
        case 'info':
          log.info(JSON.stringify(obj));
          break;
        case 'warn':
          log.warn(JSON.stringify(obj));
          break;
        case 'error':
          log.error(JSON.stringify(obj));
          break;
        default:
          log.fatal(JSON.stringify(obj));
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
    var loggerConfig = this.getConfig();
    var moduleSettings = loggerConfig.moduleSettings;
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