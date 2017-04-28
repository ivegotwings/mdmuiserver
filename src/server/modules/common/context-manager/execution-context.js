const getNamespace = require('continuation-local-storage').getNamespace;
var urlModule = require('url');

function createSecurityContext(req) {
    var tid = req.headers['tid'];
    var uid = req.headers['uid'];
    var tenantConfig;
    if (tid) {
        tenantConfig = require(process.cwd() + "/tenant-configs/" + tid.toLowerCase() + "-tenant-config");
        if (!tenantConfig || !tenantConfig.clientId || !tenantConfig.clientAuthKey) {
            console.log("Tenant configuration not found for tenant:" + tid);
        }
    }

    var userId = req.headers["x-rdp-userid"] ? req.headers["x-rdp-userid"] : uid;

    var securityContext = {
        'user': req.query.user,
        'role': req.query.role,
        'tenantId': tid,
        'clientAuthKey': tenantConfig && tenantConfig.clientAuthKey ? tenantConfig.clientAuthKey : "",
        'headers': {
            "clientId": tenantConfig && tenantConfig.clientId ? tenantConfig.clientId : "",
            "ownershipData": req.headers["x-rdp-ownershipdata"],
            "userId": userId,
            "firstName": req.headers["x-rdp-firstname"],
            "lastName": req.headers["x-rdp-lastname"],
            "userName": req.headers["x-rdp-username"],
            "userEmail": req.headers["x-rdp-useremail"],
            "userRoles": req.headers["x-rdp-userroles"]
        }
    };
   
    var session = getNamespace('User Session');
    session.set('securityContext', securityContext);
}

function getSecurityContext() {
    var session = getNamespace('User Session');
    return session.get('securityContext');
}

function createCallerContext(req) {

    var hostName = "";
    var protocol = "";

    if(req.headers && req.headers['referer']) {
        var urlFragments = urlModule.parse(req.headers['referer']);

        if(urlFragments) {
            hostName = urlFragments.hostname;
            protocol = urlFragments.protocol;
        }
    }

    var callerContext = {
        "hostName": hostName,
        "protocol": protocol
    };

    var session = getNamespace('User Session');
    session.set('callerContext', callerContext);
}

function getCallerContext() {
    var session = getNamespace('User Session');
    return session.get('callerContext');
}

module.exports = {
    createSecurityContext: createSecurityContext,
    getSecurityContext: getSecurityContext,
    createCallerContext: createCallerContext,
    getCallerContext: getCallerContext
}


