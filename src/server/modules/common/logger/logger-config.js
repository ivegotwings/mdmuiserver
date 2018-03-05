'use strict';
require('../df-rest-service/df-rest-service-config.js');
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

    this._modulesObject = {
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
        "service-base": {
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
        "/entityappservice/delete": {
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
        "/entityappmodelservice/create": {
            "level": "info"
        },
        "/entityappmodelservice/update": {
            "level": "info"
        },
        "/entityappmodelservice/delete": {
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
    };

    this.getModulesObject = function () {
        return this._modulesObject;
    };
    this.setModulesObject = function (_obj) {
        this._modulesObject = _obj;
    };
};

var config = new LOGGER_CONFIG();
module.exports = config;

