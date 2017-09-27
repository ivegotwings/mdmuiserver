'use strict';

var LOGGER_CONFIG = function(){
    this.formatKeys = ["RequestId", "GUID", "TenantId", "CallerServiceName", "CalleeServiceName", 
                        "RelatedRequestId", "GroupRequestId", "TaskId", "UserId", "EntityId", 
                        "ObjectType", "ClassName", "Method", "NewTimestamp", "Action", 
                        "InclusiveTime", "LogMessage"];
    this._modulesObject = {
        "service-base": {
            "level": "info"
        },
        "df-rest-service": {
            "level": "debug"
        },
        "context-manager": {
            "level": "info"
        },
        "cop": {
            "level": "info"
        },
        "dataobject": {
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
        "ruf-client": {
            "level": "info"
        },
        "web-engine": {
            "level": "info"
        },
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

