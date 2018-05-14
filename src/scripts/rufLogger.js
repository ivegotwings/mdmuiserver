(function () {
    window.RUFUtilities = window.RUFUtilities || {};
    RUFUtilities.Logger = {};
    var log4JSLogger;
    var loglevel = getQueryStringValue("loglevel") || "0";

    RUFUtilities.initializeLogger = function () {
        log4JSLogger = log4javascript.getLogger("RUFLogging");
        var ajaxAppender = new log4javascript.AjaxAppender("/data/logger/sendlogs");
        var loglevel = "3";
        switch (loglevel) {
            case "0": ajaxAppender.setThreshold(log4javascript.Level.OFF);
                break;
            case "1": ajaxAppender.setThreshold(log4javascript.Level.TRACE);
                break;
            case "2": ajaxAppender.setThreshold(log4javascript.Level.DEBUG);
                break;
            case "3": ajaxAppender.setThreshold(log4javascript.Level.INFO);
                break;
            case "4": ajaxAppender.setThreshold(log4javascript.Level.WARN);
                break;
            case "5": ajaxAppender.setThreshold(log4javascript.Level.ERROR);
                break;
            case "6": ajaxAppender.setThreshold(log4javascript.Level.FATAL);
                break;
            default: ajaxAppender.setThreshold(log4javascript.Level.OFF);
        }

        ajaxAppender.addHeader("Content-Type", "application/json");
        ajaxAppender.setBatchSize(1);
        ajaxAppender.sendAllOnUnload = true;
        ajaxAppender.setSessionId();
        var jsonLayout = new log4javascript.JsonLayout();
        ajaxAppender.setLayout(jsonLayout);
        log4JSLogger.addAppender(ajaxAppender);
        log4javascript.logLog.setQuietMode(true);
    };

    RUFUtilities.Logger.info = function (msg, obj, callerModuleName, calleeServiceName) {
        return RUFUtilities.Logger.log('info', msg, obj, callerModuleName, calleeServiceName);
    };

    RUFUtilities.Logger.fatal = function (msg, obj, callerModuleName, calleeServiceName) {
        return RUFUtilities.Logger.log('fatal', msg, obj, callerModuleName, calleeServiceName);
    };

    RUFUtilities.Logger.warn = function (msg, obj, callerModuleName, calleeServiceName) {
        return RUFUtilities.Logger.log('warn', msg, obj, callerModuleName, calleeServiceName);
    };

    RUFUtilities.Logger.error = function (msg, obj, callerModuleName, calleeServiceName) {
        //console.log('new error: ', msg, 'module: ', callerModuleName);
        return RUFUtilities.Logger.log('error', msg, obj, callerModuleName, calleeServiceName);
    };

    RUFUtilities.Logger.debug = function (msg, obj, callerModuleName, calleeServiceName) {
        return RUFUtilities.Logger.log('debug', msg, obj, callerModuleName, calleeServiceName);
    };

    RUFUtilities.Logger.log = function (level, msg, obj, callerModuleName, calleeServiceName) {
        return this._log(level, msg, obj, callerModuleName, calleeServiceName);
    };

    RUFUtilities.Logger._log = function (level, msg, obj, callerModuleName, calleeServiceName) {
        if (!log4JSLogger) {
            console.error("RUF Logger is not initialized");
            return;
        }

        if(callerModuleName && callerModuleName.indexOf("ui-") != 0) {
            callerModuleName = "ui-" + callerModuleName;
        }

        var logObj = {
            level: level,
            msg: msg,
            obj: obj,
            callerModuleName: callerModuleName,
            calleeServiceName: calleeServiceName
        };

        //console.log(level, logObj);
        log4JSLogger[level](JSON.stringify(logObj));
    };

    function getQueryStringValue(key) {
        return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
    }

})();

