'use strict';
require('../df-rest-service/df-rest-service-config.js');
let stateManager = require('../state-manager/state-manager.js');
let executionContext = require('../context-manager/execution-context');
let isEmpty = require('../utils/isEmpty');

let LOGGER_CONFIG = function () {
    /*  Log fomrat should be in following order
    ["RequestId", "GUID", "TenantId", "CallerServiceName", "CalleeServiceName", 
        "RelatedRequestId", "GroupRequestId", "TaskId", "UserId", "EntityId", 
        "ObjectType", "ClassName", "Method", "NewTimestamp", "Action", 
        "InclusiveTime", "LogMessage"];

        <Property name="pattern">%d{ISO8601} [%level] [%X{requestId}] [%X{GUID}] [%X{tenantId}] [%X{callerServiceName}]
            [%X{calleeServiceName}] [%X{relatedRequestId}] [%X{groupRequestId}] [%X{taskId}] [%X{userId}] [%X{id}] [%X{type}] [%c{1.}]
            [%X{method}] %d{ISO8601} [%X{action}] [%X{inclusiveTime}] [%X{messageCode}] [%X{instanceId}] %msg ThreadId - %t%n
        </Property>
    */
    //change log format keys into camelcase format for easy use.
    this.formatKeys = ["requestId", "guid", "tenantId", "callerServiceName", "calleeServiceName",
        "relatedRequestId", "groupRequestId", "taskId", "userId", "entityId",
        "objectType", "className", "method", "newTimestamp", "action",
        "inclusiveTime", "messageCode", "instanceId", "logMessage"];

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
        "/rsConnectService/downloadModelJob": {
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
        "/adminservice/deploytenantseed": {
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
        },
        "ui-main-app": {
            "level": "info"
        },
        "ui-app-common": {
            "level": "info"
        },
        "ui-app-dashboard": {
            "level": "info"
        },
        "ui-app-entity-discovery": {
            "level": "info"
        },
        "ui-app-entity-manage": {
            "level": "info"
        },
        "ui-app-task-detail": {
            "level": "info"
        },
        "ui-liquid-manager": {
            "level": "info"
        },
        "ui-config-manager": {
            "level": "info"
        }
    };

    this.getBaseModulesObject = function () {
        return this.baseTemplate;
    }

    this.getCurrentModulesObject = async function () {
        let key = this.getCacheKey();
        //console.log('get modules key:', key);
        let modulesObject = await stateManager.get(key);
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
        let key = this.getCacheKey();
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
        let securityContext = executionContext && executionContext.getSecurityContext();
        let tenantId = "unknown";
        let userId = "unknown";
        if (securityContext) {
            tenantId = securityContext.tenantId;
            if (securityContext.headers && securityContext.headers.userId) {
                userId = securityContext.headers.userId;
            }
        }

        let key = "".concat('logsettings_tenant_', tenantId, '#@#user_', userId);

        return key;
    }
};

let config = new LOGGER_CONFIG();
module.exports = config;

