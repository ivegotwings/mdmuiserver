const getNamespace = require('continuation-local-storage').getNamespace;

function createSecurityContext(req) {
    var tid = req.headers['tid'];
    var securityContext = { 'user': req.query.user, 'role': req.query.role, 'tenantId': tid };
    var session = getNamespace('User Session');
    session.set('securityContext', securityContext);
}

function getSecurityContext() {
    var session = getNamespace('User Session');
    return session.get('securityContext');    
}

module.exports = {
    createSecurityContext: createSecurityContext,
    getSecurityContext: getSecurityContext
}


