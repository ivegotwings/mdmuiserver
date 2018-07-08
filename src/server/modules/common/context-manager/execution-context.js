const getNamespace = require('cls-hooked').getNamespace;
var urlModule = require('url');
var config = require('config');

var clientId = config.get('modules.dfService.clientId');
var clientAuthKey = config.get('modules.dfService.clientAuthKey');

function createSecurityContext(req) {
    var securityContext = readSecurityHeaders(req);

    //console.log('create security context with data :', JSON.stringify(securityContext));
    var session = getNamespace('User Session');
    session.set('securityContext', securityContext);
}

function getSecurityContext() {
    var session = getNamespace('User Session');
    if (session) {
        return session.get('securityContext');
    }
}

function updateSecurityContext(securityContext) {
    var session = getNamespace('User Session');
    session.set('securityContext', securityContext);
}

function createCallerContext(req) {

    var hostName = "";
    var protocol = "";

    if (req.headers && req.headers['referer']) {
        var urlFragments = urlModule.parse(req.headers['referer']);

        if (urlFragments) {
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

function readSecurityHeaders(req) {
    var tid = req.headers["x-rdp-tenantid"];
    var uid = req.headers["x-rdp-userid"];
    var roles = req.headers["x-rdp-userroles"];
    var defaultRole = req.headers["x-rdp-defaultrole"];

    //console.log('roles', roles);

    if (roles && roles.length) {
        roles = JSON.parse(roles);
    }

    if (!defaultRole && roles) {
        defaultRole = Array.isArray(roles) ? roles[0] : roles;
    }

    var firstName = req.headers["x-rdp-firstname"];
    var lastName = req.headers["x-rdp-lastname"];

    var fullName = "";
    if (firstName) {
        fullName = firstName;
    }
    if (lastName) {
        fullName = fullName + " " + lastName;
    }

    if (fullName == "") {
        fullName = uid;
    }

    var securityContext = {
        'user': uid,
        'tenantId': tid,
        'clientAuthKey': clientAuthKey ? clientAuthKey : "",
        'headers': {
            "clientId": clientId ? clientId : "",
            "ownershipData": req.headers["x-rdp-ownershipdata"],
            "ownershipEditData": req.headers["x-rdp-ownershipeditdata"],
            "userId": uid,
            "firstName": firstName,
            "lastName": lastName,
            "fullName": fullName,
            "userName": req.headers["x-rdp-username"],
            "userEmail": req.headers["x-rdp-useremail"],
            "userRoles": roles,
            "defaultRole": defaultRole
        }
    };

    return securityContext;
}

function getCallerContext() {
    var session = getNamespace('User Session');
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
