
var loggerService = require("../logger/logger-service");
var LOGGER_CONFIG = require('../logger/logger-config.js');

var cryptoJS = require("crypto-js");
var moment = require('moment');
var uuidV1 = require('uuid/v1');

var Logger = function (options) {
    this.logRequest = function(url, options) {
        var internalRequestId = uuidV1();
        var serviceName = this.getLogServiceName(url);
        var requestLog = {
            "module":serviceName,
            "message":"RDF_REQUEST",
            "requestId":internalRequestId,
            "url":url,
            "request":options
        }
        this._log(serviceName, requestLog);
        return internalRequestId;
    }

    this.logError = function (internalRequestId, url, options, result) {
        var isErrorResponse = false;

        //check if response object has error status
        if(result && result.response && result.response.status) {
            var resStatus = result.response.status;
            if(resStatus && resStatus == "error") {
                isErrorResponse = true;
            }
        }

        //check if generic failure happend in RDF layer
        if(!isErrorResponse && result && result.dataObjectOperationResponse && result.dataObjectOperationResponse.status) {
            var resStatus = result.dataObjectOperationResponse.status;
            if(resStatus && resStatus == "error") {
                isErrorResponse = true;
            }
        }

        if(isErrorResponse) {
            var serviceName = this.getLogServiceName(url);
            var errorLog = {
                "message": "RDF_ERROR",
                "module": serviceName,
                "url": url,
                "requestId": internalRequestId,
                "request": options,
                "response": result,
            };
            this._log(serviceName, errorLog);
        }

        return isErrorResponse;
    }

    this.logException = function (internalRequestId, url, options, error) {
        var serviceName = this.getLogServiceName(url);
        var exceptionJson = {
                "message": "RDF_CALL_EXCEPTION",
                "module": serviceName,
                "service": url,
                "detail": error,
                "requestId": internalRequestId,
                "request": options
        };
        this._log(serviceName, exceptionJson);
    }

    this.logResponse = function(internalRequestId, url, options, result, hrstart) {
        var hrend = process.hrtime(hrstart);
        var taken = hrend[1]/1000000;
        var serviceName = this.getLogServiceName(url);
        var responseLog = {
                "message": "RDF_RESPONSE",
                "module": serviceName,
                "service": url,
                "taken": taken,
                "requestId": internalRequestId,
                "response": JSON.stringify(result)
        };
        this._log(serviceName, responseLog);
    }

    this.getLogServiceName = function(url){
        var _serviceName = "";
        var moduleSettings = LOGGER_CONFIG.getModulesObject();
        for (var logService in moduleSettings) {
            if (moduleSettings.hasOwnProperty(logService)) {
                var element = moduleSettings[logService];   
                if(url.indexOf(logService) > -1){
                    _serviceName = logService;
                }
            }
        }
        return _serviceName;
    }

    this._getLogLevel = function(serviceName){
        var _level = "";
        var moduleSettings = LOGGER_CONFIG.getModulesObject();
        if(moduleSettings[serviceName])
        {
            _level = moduleSettings[serviceName].level;
        }
        return _level;
    }

    this._formatLogObject = function(level, logObj){
        var cloneObj = JSON.parse(JSON.stringify(logObj));
        switch (level) {
            case "info":
                    delete cloneObj.request;
                    delete cloneObj.response;
                    loggerService.info(cloneObj.message, cloneObj);
                break;
            case "debug":
                    if(cloneObj.request && cloneObj.request.body){
                        cloneObj.message = "[" + cloneObj.message + "] [Request - " + JSON.stringify(cloneObj.request.body) + "]";
                    }
                    if(cloneObj.response){
                        cloneObj.message = cloneObj.message + " [Response - " + cloneObj.response + "]";
                    }
                    delete cloneObj.request;
                    delete cloneObj.response;
                    loggerService.debug(cloneObj.message, cloneObj);
                break;
            case "error":
                    loggerService.error(cloneObj.message, cloneObj);
                break;
            case "fatal":
                    loggerService.fatal(cloneObj.message, cloneObj);
                break;
            default:
                break;
        }
    }

    this._log = function(serviceName, logObj){
        var loggerLevels = ["info", "debug", "warn", "error", "fatal"];
        var serviceLogLevel = this._getLogLevel(serviceName);
        var logIndex = loggerLevels.indexOf(serviceLogLevel);
        //console.log("logIndex -----> ", logIndex, serviceLogLevel)
        if(logIndex > -1){
            for (var i = 0; i <= logIndex; i++) {
                this._formatLogObject(loggerLevels[i], logObj);
            }
        }
    }

    this.log = function(message){
        loggerService.info(message);
    }

}
var logger = new Logger();
module.exports = logger;