const contextService = require('request-context');
const executionContext = require('./execution-context');
const createNamespace = require('continuation-local-storage').createNamespace;
const session = createNamespace('User Session');

module.exports = function(app) {
    // context service..
    app.use(contextService.middleware('executionContext'));

    app.use(function(req, res, next) {
        session.run(function(){
            executionContext.createSecurityContext(req);
            next();
        });
        
    });
}

