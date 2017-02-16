
const contextService = require('request-context');
const executionContext = require('./execution-context');

module.exports = function(app) {
    // context service..
    app.use(contextService.middleware('executionContext'));

    app.use(function(req, res, next) {
        executionContext.createSecurityContext(req);
        next();
    });
}

