let RuntimeVersionManager = require('../version-service/RuntimeVersionManager'),
    ModuleVersionManager = require('../version-service/ModuleVersionManager'),
    config = require('config');

let executionContext = require('../../common/context-manager/execution-context');

const logger = require('../../common/logger/logger-service');

let UIAppService = function () {
};

UIAppService.prototype = {
    getBaseInfo: async function (req, res) {
        let userDefaults = config.get("modules.userDefaults");
        let userId = req.header("x-rdp-userid") || userDefaults.userId;
        let tenantId = req.header("x-rdp-tenantid") || userDefaults.tenantId;
        if (tenantId && userId) {
            let securityContext = executionContext.getSecurityContext();
            if (securityContext && securityContext.headers && securityContext.headers.userRoles) {
                let secHeaders = securityContext.headers;

                let versionInfo = {
                    'buildVersion': await RuntimeVersionManager.getBuildVersion(),
                    'runtimeVersion': await RuntimeVersionManager.getVersion(),
                    'moduleVersions': await ModuleVersionManager.getAll(tenantId)
                };

                let userContext = {
                    "roles": secHeaders.userRoles,
                    "user": userId,
                    "defaultRole": secHeaders.defaultRole,
                    "tenant": tenantId,
                    "userName": secHeaders.userName,
                    "userFullName": secHeaders.fullName,
                    "isAuthenticated": true
                };

                let contextData = {
                    "UserContexts": [userContext]
                };

                res.json({
                    isAuthenticated: true,
                    contextData: contextData,
                    tenantId: tenantId,
                    userId: userId,
                    roles: secHeaders.userRoles,
                    defaultRole: secHeaders.defaultRole,
                    fullName: secHeaders.fullName,
                    userName: secHeaders.userName,
                    ownershipData: secHeaders.ownershipData,
                    ownershipeditdata: secHeaders.ownershipeditdata,
                    versionInfo: versionInfo
                });
            }
        } else {
            res.sendStatus(402);
        }
    }
};

module.exports = UIAppService;

