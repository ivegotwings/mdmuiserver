const createNamespace = require('cls-hooked').createNamespace;
const contextService = require('request-context');
const executionContext = require('./execution-context');
const session = createNamespace('User Session');

module.exports = function (app) {
    // context service..
    app.use(contextService.middleware('executionContext'));

    app.use(function (req, res, next) {
        session.run(function () {
            executionContext.createSecurityContext(req);
            executionContext.createCallerContext(req);
            next();
        });
    });
}
