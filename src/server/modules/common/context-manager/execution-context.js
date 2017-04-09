const getNamespace = require('continuation-local-storage').getNamespace;

function createSecurityContext(req) {
    var tid = req.headers['tid'];
    var tenantConfig;
    if (tid) {
        tenantConfig = require(process.cwd() + "/tenant-configs/" + tid.toLowerCase() + "-tenant-config");
        if (!tenantConfig || !tenantConfig.clientId || !tenantConfig.clientAuthKey) {
            console.log("Tenant configuration not found for tenant:" + tid);
        }
    }

    var securityContext = {
        'user': req.query.user,
        'role': req.query.role,
        'tenantId': tid,
        'clientAuthKey': tenantConfig && tenantConfig.clientAuthKey ? tenantConfig.clientAuthKey : "",
        'headers': {
            "clientId": tenantConfig && tenantConfig.clientId ? tenantConfig.clientId : "",
            "vendorName": req.headers["x-rdp-vendorName"],
            "userId": req.headers["x-rdp-userId"],
            "userName": req.headers["x-rdp-userName"],
            "userEmail": req.headers["x-rdp-userEmail"],
            "userRoles": req.headers["x-rdp-userRoles"]
        }
    };
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


