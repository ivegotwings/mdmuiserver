const getNamespace = require('cls-hooked').getNamespace;
let urlModule = require('url');
let config = require('config');

let clientId = config.get('modules.dfService.clientId');
let clientAuthKey = config.get('modules.dfService.clientAuthKey');

function createSecurityContext(req) {
    let securityContext = readSecurityHeaders(req);

    //console.log('create security context with data :', JSON.stringify(securityContext));
    let session = getNamespace('User Session');
    session.set('securityContext', securityContext);
}

function getSecurityContext() {
    let session = getNamespace('User Session');
    if (session) {
        return session.get('securityContext');
    }
}

function updateSecurityContext(securityContext) {
    let session = getNamespace('User Session');
    session.set('securityContext', securityContext);
}

function createCallerContext(req) {

    let hostName = "";
    let protocol = "";

    if (req.headers && req.headers['referer']) {
        let urlFragments = urlModule.parse(req.headers['referer']);

        if (urlFragments) {
            hostName = urlFragments.hostname;
            protocol = urlFragments.protocol;
        }
    }

    let callerContext = {
        "hostName": hostName,
        "protocol": protocol
    };

    let session = getNamespace('User Session');
    session.set('callerContext', callerContext);
}

function readSecurityHeaders(req) {
    let userDefaults = config.get("modules.userDefaults");

    let tid = req.headers["x-rdp-tenantid"] || userDefaults.tenantId;
    let uid = req.headers["x-rdp-userid"] || userDefaults.userId;
    let roles = req.headers["x-rdp-userroles"] || userDefaults.roles;
    let defaultRole = req.headers["x-rdp-defaultrole"] || userDefaults.defaultRole;

    // console.log('roles', roles);

    if (roles && roles.length) {
        roles = JSON.parse(roles);
    }

    if (!defaultRole && roles) {
        defaultRole = Array.isArray(roles) ? roles[0] : roles;
    }

    if(Array.isArray(roles)) {
        roles = roles.join(",");
    }

    let firstName = req.headers["x-rdp-firstname"] || userDefaults.firstName;
    let lastName = req.headers["x-rdp-lastname"] || userDefaults.lastName;

    let fullName = "";
    if (firstName) {
        fullName = firstName;
    }
    if (lastName) {
        fullName = fullName + " " + lastName;
    }

    if (fullName == "") {
        fullName = uid;
    }

    //console.log('ownership data header', JSON.stringify(req.headers));
    let securityContext = {
        'user': uid,
        'tenantId': tid,
        'clientAuthKey': clientAuthKey ? clientAuthKey : "",
        'headers': {
            "clientId": clientId ? clientId : "",
            "ownershipData": req.headers["x-rdp-ownershipdata"] ? JSON.parse(req.headers["x-rdp-ownershipdata"]) : userDefaults.ownershipData,
            "ownershipEditData": req.headers["x-rdp-ownershipeditdata"] ? JSON.parse(req.headers["x-rdp-ownershipeditdata"]) : userDefaults.ownershipEditData,
            "userId": uid,
            "firstName": firstName,
            "lastName": lastName,
            "fullName": fullName,
            "userName": req.headers["x-rdp-username"] || userDefaults.userName,
            "userEmail": req.headers["x-rdp-useremail"] || userDefaults.userEmail,
            "userRoles": roles,
            "defaultRole": defaultRole
        }
    };

    if(securityContext.headers.ownershipData == "undefined") {
        securityContext.headers.ownershipData = "";
    }

    if(securityContext.headers.ownershipEditData == "undefined") {
        securityContext.headers.ownershipEditData = "";
    }
    
    //console.log('sec context created', JSON.stringify(securityContext));

    return securityContext;
}

function getCallerContext() {
    let session = getNamespace('User Session');
    if (session) {
        return session.get('callerContext');
    }
}

module.exports = {
    createSecurityContext: createSecurityContext,
    getSecurityContext: getSecurityContext,
    updateSecurityContext: updateSecurityContext,
    createCallerContext: createCallerContext,
    getCallerContext: getCallerContext,
    readSecurityHeaders: readSecurityHeaders
}
