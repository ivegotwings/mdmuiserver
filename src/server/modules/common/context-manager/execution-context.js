const getNamespace = require('continuation-local-storage').getNamespace;
var urlModule = require('url');

function createSecurityContext(req) {
    var tid = req.headers["x-rdp-tenantid"];
    var uid = req.headers["x-rdp-userid"];
    var role = req.headers["x-rdp-userroles"];
    var tenantConfig;
    console.log(process.cwd() + "/" + process.env.PROJECT_PATH +  "/tenant-configs/" + tid.toLowerCase() + "-tenant-config.json");
    if (tid) {
        tenantConfig = require(process.cwd() + "/" + process.env.PROJECT_PATH +  "/tenant-configs/" + tid.toLowerCase() + "-tenant-config.json");
        if (!tenantConfig || !tenantConfig.clientId || !tenantConfig.clientAuthKey) {
            console.log("Tenant configuration not found for tenant:" + tid);
        }
    }

    var securityContext = {
        'user': uid,
        'role': role,
        'tenantId': tid,
        'clientAuthKey': tenantConfig && tenantConfig.clientAuthKey ? tenantConfig.clientAuthKey : "",
        'headers': {
            "clientId": tenantConfig && tenantConfig.clientId ? tenantConfig.clientId : "",
            "ownershipData": req.headers["x-rdp-ownershipdata"],
            "userId": uid,
            "firstName": req.headers["x-rdp-firstname"],
            "lastName": req.headers["x-rdp-lastname"],
            "userName": req.headers["x-rdp-username"],
            "userEmail": req.headers["x-rdp-useremail"],
            "userRoles": role
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


