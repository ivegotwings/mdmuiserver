const contextService = require('request-context');

function createSecurityContext(req) {
    var securityContext = { 'user': req.query.user, 'role': req.query.role, 'tenantId': req.query.tid };
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


