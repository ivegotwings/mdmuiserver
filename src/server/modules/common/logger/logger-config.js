'use strict';
require('../df-rest-service/df-rest-service-config.js');
var LOGGER_CONFIG = function(){
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
                        
    this._modulesObject = 
    {
        "entityservice": {
            "level": "info"
        },
        "entityappservice": {
            "level": "debug"
        },
        "configurationservice": {
            "level": "trace"
        },
        "copservice": {
            "level": "info"
        },
        "binarystreamobjectservice": {
            "level": "info"
        },
        "binaryobjectservice": {
            "level": "info"
        },
        "notification-service": {
            "level": "info"
        },
        // "file-upload": {
        //     "level": "info"
        // },
        // "notification-engine": {
        //     "level": "info"
        // },
        // "pass-through": {
        //     "level": "info"
        // },
        // "ruf-client": {
        //     "level": "info"
        // },
        // "web-engine": {
        //     "level": "info"
        // },
        "default": {
            "level": "info"
        }
    };
    this.getModulesObject =function(){
        return this._modulesObject;
    };
    this.setModulesObject = function(_obj){
        this._modulesObject = _obj;
    };
};

var config = new LOGGER_CONFIG();
module.exports = config;

