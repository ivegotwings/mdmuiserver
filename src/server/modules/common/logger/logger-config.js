'use strict';
require('../df-rest-service/df-rest-service-config.js');
var stateManager = require('../state-manager/state-manager.js');
var executionContext = require('../context-manager/execution-context');
var isEmpty = require('../utils/isEmpty');

var LOGGER_CONFIG = function () {
    /*  Log fomrat should be in following order
    ["RequestId", "GUID", "TenantId", "CallerServiceName", "CalleeServiceName", 
        "RelatedRequestId", "GroupRequestId", "TaskId", "UserId", "EntityId", 
        "ObjectType", "ClassName", "Method", "NewTimestamp", "Action", 
        "InclusiveTime", "LogMessage"];
    */
    //change log format keys into camelcase format for easy use.
    this.formatKeys = ["requestId", "guid", "tenantId", "callerServiceName", "calleeServiceName",
        "relatedRequestId", "groupRequestId", "taskId", "userId", "entityId",
        "objectType", "className", "method", "newTimestamp", "action",
        "inclusiveTime", "logMessage"];

    this.baseTemplate = {
        "api-healthcheck": {
            "level": "info"
        },
        "binaryobject": {
            "level": "info"
        },
        "binarystreamobject": {
            "level": "info"
        },
        "context-manager": {
            "level": "info"
        },
        "df-rest-service": {
            "level": "info"
        },
        "service-base": {
            "level": "info"
        },
        "state-manager": {
            "level": "info"
        },
        "utils": {
            "level": "info"
        },
        "cop": {
            "level": "info"
        },
        "dataobject": {
            "level": "info"
        },
        "event-service": {
            "level": "info"
        },
        "file-download": {
            "level": "info"
        },
        "file-upload": {
            "level": "info"
        },
        "notification-engine": {
            "level": "info"
        },
        "notification-service": {
            "level": "info"
        },
        "pass-through": {
            "level": "info"
        },
        "ruf-utilities": {
            "level": "info"
        },
        "version-service": {
            "level": "info"
        },
        "web-engine": {
            "level": "info"
        },
        "default": {
            "level": "info"
        },
        "/entityappservice/get": {
            "level": "info"
        },
        "/entityappservice/getcoalesce": {
            "level": "info"
        },
        "/entityappservice/create": {
            "level": "info"
        },
        "/entityappservice/update": {
            "level": "info"
        },
        "/entityappservice/getcombined": {
            "level": "info"
        },
        "/entityappservice/getrelated": {
            "level": "info"
        },
        "/entityappmodelservice/get": {
            "level": "info"
        },
        "/entityappmodelservice/getcontext": {
            "level": "info"
        },
        "/entityappmodelservice/getcoalesce": {
            "level": "info"
        },
        "/entityappmodelservice/getcomposite": {
            "level": "info"
        },
        "/entitymodelservice/create": {
            "level": "info"
        },
        "/entitymodelservice/update": {
            "level": "info"
        },
        "/entitymodelservice/delete": {
            "level": "info"
        },
        "/entitygovernservice/create": {
            "level": "info"
        },
        "/entitygovernservice/update": {
            "level": "info"
        },
        "/entitygovernservice/delete": {
            "level": "info"
        },
        "/entitygovernservice/startWorkflow": {
            "level": "info"
        },
        "/entitygovernservice/workflowChangeAssignment": {
            "level": "info"
        },
        "/entitygovernservice/transitionWorkflow": {
            "level": "info"
        },
        "/configurationservice/get": {
            "level": "info"
        },
        "/configurationservice/getnearest": {
            "level": "info"
        },
        "/configurationservice/create": {
            "level": "info"
        },
        "/configurationservice/update": {
            "level": "info"
        },
        "/configurationservice/delete": {
            "level": "info"
        },
        "/requestmanageservice/get": {
            "level": "info"
        },
        "/rsConnectService/transform": {
            "level": "info"
        },
        "/rsConnectService/publish": {
            "level": "info"
        },
        "/matchservice/search": {
            "level": "info"
        },
        "/entitygovernservice/validate": {
            "level": "info"
        },
        "/rsConnectService/process": {
            "level": "info"
        },
        "/rsConnectService/processmodel": {
            "level": "info"
        },
        "/rsConnectService/downloadModelExcel": {
            "level": "info"
        },
        "/rsConnectService/downloadDataExcel": {
            "level": "info"
        },
        "/rsConnectService/downloadDataJob": {
            "level": "info"
        },
        "/entitygovernservice/getcontext": {
            "level": "info"
        },
        "/eventservice/get": {
            "level": "info"
        },
        "/requesttrackingservice/get": {
            "level": "info"
        },
        "/rsConnectService/generateFieldMap": {
            "level": "info"
        },
        "/rsConnectService/getHeaderFields": {
            "level": "info"
        },
        "/rsConnectService/getMappings": {
            "level": "info"
        },
        "/rsConnectService/saveMappings": {
            "level": "info"
        },
        "/binarystreamobjectservice/prepareUpload": {
            "level": "info"
        },
        "/binarystreamobjectservice/prepareDownload": {
            "level": "info"
        },
        "/binarystreamobjectservice/create": {
            "level": "info"
        },
        "/binaryobjectservice/get": {
            "level": "info"
        },
        "/binaryobjectservice/create": {
            "level": "info"
        },
        "/binaryobjectservice/update": {
            "level": "info"
        },
        "/binaryobjectservice/delete": {
            "level": "info"
        },
        "/bulkentityservice/createtask": {
            "level": "info"
        },
        "/binaryobjectservice/getById": {
            "level": "info"
        },
        "/rsConnectService/getprofile": {
            "level": "info"
        },
        "/rsConnectService/saveoverrides": {
            "level": "info"
        },
        "/entityappservice/delete": {
            "level": "info"
        }

    };

    this.getBaseModulesObject = function () {
        return this.baseTemplate;
    }

    this.getCurrentModulesObject = async function () {
        var key = this.getCacheKey();
        //console.log('get modules key:', key);
        var modulesObject = await stateManager.get(key);
        //console.log('state mgr op', JSON.stringify(modulesObject));
        // if(!_obj) {
        //     _obj = await stateManager.get("ALL-TENANT-ALL-USER");
        //     if (!_obj) {
        //         _obj = await stateManager.get("ALL-USER");
        //         if (!_obj) {
        //             _obj = await stateManager.get("All-TENANT");
        //         }
        //     }
        // }

        if (isEmpty(modulesObject)) {
             //console.log('empty log modules found');
             modulesObject = this.baseTemplate;
             await this.setCurrentModulesObject(modulesObject);
        }

        return await modulesObject;
    };

    this.setCurrentModulesObject = async function (modulesObject) {
        var key = this.getCacheKey();
        await stateManager.set(key, modulesObject);
    };

    this.getCacheKey = function() {
        // if (val.globalSettings.tenant && val.globalSettings.user) {
        //     key = "ALL-TENANT-ALL-USER";
        // } else if (val.globalSettings.user) {
        //     key = "ALL-USER";
        // } else if (val.globalSettings.tenant) {
        //     key = "ALL-TENANT";
        // }
        var securityContext = executionContext && executionContext.getSecurityContext();
        var tenantId = "unknown";
        var userId = "unknown";
        if (securityContext) {
            tenantId = securityContext.tenantId;
            if (securityContext.headers && securityContext.headers.userId) {
                userId = securityContext.headers.userId;
            }
        }

        var key = "".concat('logsettings_tenant_', tenantId, '#@#user_', userId);

        return key;
    }
};

var config = new LOGGER_CONFIG();
module.exports = config;

