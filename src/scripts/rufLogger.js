(function () {
    window.RUFUtilities = window.RUFUtilities || {};
    RUFUtilities.Logger = {};
    RUFUtilities.Logger.levelInfo = "3";
    var log4JSLogger;
    var loglevel = getQueryStringValue("loglevel") || "0";

    RUFUtilities.initializeLogger = function (loglevel) {
        log4JSLogger = log4javascript.getLogger("RUFLogging");
        var ajaxAppender = new log4javascript.AjaxAppender("/data/sendlogs");

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
       // ajaxAppender.setBatchSize(10);
        ajaxAppender.sendAllOnUnload = true;
        ajaxAppender.setSessionId();
        var jsonLayout = new log4javascript.JsonLayout();
        ajaxAppender.setLayout(jsonLayout);
        log4JSLogger.addAppender(ajaxAppender);
    };

    //Usage: RUFUtilities.Logger.trace(message[, message2, ... ][, exception])
    RUFUtilities.Logger.trace = function () {
        if (!log4JSLogger) {
            console.error("RUF Logger is not initialized");
            return;
        }
        log4JSLogger.trace(getArguments(arguments));
    };

    //Usage: RUFUtilities.Logger.debug(message[, message2, ... ][, exception])
    RUFUtilities.Logger.debug = function () {
        if (!log4JSLogger) {
            console.error("RUF Logger is not initialized");
            return;
        }
        log4JSLogger.debug(getArguments(arguments));
    };

    //Usage: RUFUtilities.Logger.info(message[, message2, ... ][, exception])
    RUFUtilities.Logger.info = function () {
        if (!log4JSLogger) {
            console.error("RUF Logger is not initialized");
            return;
        }
        log4JSLogger.info(getArguments(arguments));
    };

    //Usage: RUFUtilities.Logger.warn(message[, message2, ... ][, exception])
    RUFUtilities.Logger.warn = function () {
        if (!log4JSLogger) {
            console.error("RUF Logger is not initialized");
            return;
        }
        log4JSLogger.warn(getArguments(arguments));
    };

    //Usage: RUFUtilities.Logger.error(message[, message2, ... ][, exception])
    RUFUtilities.Logger.error = function () {
        if (!log4JSLogger) {
            console.error("RUF Logger is not initialized");
            return;
        }
        log4JSLogger.error(getArguments(arguments));
    };

    //Usage: RUFUtilities.Logger.fatal(message[, message2, ... ][, exception])
    RUFUtilities.Logger.fatal = function () {
        if (!log4JSLogger) {
            console.error("RUF Logger is not initialized");
            return;
        }
        log4JSLogger.fatal(getArguments(arguments));
    };

    function getQueryStringValue(key) {
        return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
    }

    function getArguments(params){
        var args = [];
        for (var i = 0, len = params.length; i < len; i++) {
            args.push(params[i]);
        }
        return args;
    }

})();

