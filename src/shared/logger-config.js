
LOGGER_CONFIG = {
    formatKeys:["RequestId", "GUID", "TenantId", "CallerServiceName", "CalleeServiceName", 
                        "RelatedRequestId", "GroupRequestId", "TaskId", "UserId", "EntityId", 
                        "ObjectType", "ClassName", "Method", "NewTimestamp", "Action", 
                        "InclusiveTime", "LogMessage"],
    module:{
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
    }

}

