const contextService = require('request-context');

function createSecurityContext(req) {
    var tid = req.header('tid');

    var securityContext = { 'user': req.query.user, 'role': req.query.role, 'tenantId': tid };
    contextService.set('executionContext:securityContext', securityContext);
}

function getSecurityContext() {
    var securityContext = contextService.get('executionContext:securityContext');    
    return securityContext;
}

module.exports = {
    createSecurityContext: createSecurityContext,
    getSecurityContext: getSecurityContext
}


