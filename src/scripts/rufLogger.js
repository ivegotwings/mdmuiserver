window.RUFUtilities = window.RUFUtilities || {};

RUFUtilities.initializeLogger = function(sessionId) {
    RUFUtilities.Logger = log4javascript.getLogger("RUFLogging");
    var ajaxAppender = new log4javascript.AjaxAppender("/sendlogs");
    ajaxAppender.addHeader("Content-Type", "application/json");
    ajaxAppender.setBatchSize(10);
    ajaxAppender.sendAllOnUnload = true;
    ajaxAppender.setSessionId(sessionId);
    var jsonLayout = new log4javascript.JsonLayout();
    ajaxAppender.setLayout(jsonLayout);
    RUFUtilities.Logger.addAppender(ajaxAppender);

};