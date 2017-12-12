SERVICE_CONFIG = {
    "services": {
        "entityservice/get": {
            "url": "/entityappservice/get",
            "mode": "online",
            "timeout": 180000,
            "offlineSettings": {
                "operation": "get",
                "requestPathToSelectDataFile": "params.query.filters.typesCriterion",
                "requestPathToFilterData": "params.query.id",
                "fieldToCompareInData": "id"
            }
        },
        "entityservice/getcoalesce": {
            "url": "/entityappservice/getcoalesce",
            "mode": "online",
            "timeout": 180000,
            "offlineSettings": {
                "operation": "get",
                "requestPathToSelectDataFile": "params.query.filters.typesCriterion",
                "requestPathToFilterData": "params.query.id",
                "fieldToCompareInData": "id"
            }
        },
        "entityservice/create": {
            "url": "/entityappservice/create",
            "mode": "online"
        },
        "entityservice/update": {
            "url": "/entityappservice/update",
            "mode": "online"
        },
        "entityservice/delete": {
            "url": "/entityappservice/delete",
            "mode": "online"
        },
        "entityappservice/getcombined": {
            "url": "/entityappservice/getcombined",
            "mode": "online",
            "timeout": 360000
        },
        "entitymodelservice/get": {
            "url": "/entityappmodelservice/get",
            "mode": "online",
            "offlineSettings": {
                "operation": "get",
                "requestPathToSelectDataFile": "params.query.filters.typesCriterion",
                "requestPathToFilterData": "params.query.id",
                "fieldToCompareInData": "id"
            }
        },
        "entitymodelservice/getcontext": {
            "url": "/entityappmodelservice/getcontext",
            "mode": "online",
            "offlineSettings": {
            }
        },
        "entitymodelservice/getcoalesce": {
            "url": "/entityappmodelservice/getcoalesce",
            "mode": "online",
            "offlineSettings": {
                "operation": "get",
                "requestPathToSelectDataFile": "params.query.filters.typesCriterion",
                "requestPathToFilterData": "params.query.id",
                "fieldToCompareInData": "id"
            }
        },
        "entitymodelservice/create": {
            "url": "/entityappmodelservice/create",
            "mode": "online"
        },
        "entitymodelservice/update": {
            "url": "/entityappmodelservice/update",
            "mode": "online"
        },
        "entitymodelservice/delete": {
            "url": "/entityappmodelservice/delete",
            "mode": "online"
        },
        "entitygovernservice/get": {
            "url": "/entitygovernservice/get",
            "mode": "online",
            "timeout": 180000,
            "offlineSettings": {
                "operation": "get",
                "requestPathToSelectDataFile": "params.query.filters.typesCriterion",
                "requestPathToFilterData": "params.query.id",
                "fieldToCompareInData": "id"
            }
        },
        "entitygovernservice/create": {
            "url": "/entitygovernservice/create",
            "mode": "online"
        },
        "entitygovernservice/update": {
            "url": "/entitygovernservice/update",
            "mode": "online"
        },
        "entitygovernservice/delete": {
            "url": "/entitygovernservice/delete",
            "mode": "online"
        },
        "entitygovernservice/startworkflow": {
            "url": "/entitygovernservice/startWorkflow",
            "mode": "online",
            "offlineSettings": {
            }
        },
        "entitygovernservice/workflowChangeAssignment": {
            "url": "/entitygovernservice/workflowChangeAssignment",
            "mode": "online",
            "offlineSettings": {
            }
        },
        "entitygovernservice/transitionWorkflow": {
            "url": "/entitygovernservice/transitionWorkflow",
            "mode": "online",
            "offlineSettings": {
            }
        },
        "configurationservice/create": {
            "url": "/configurationservice/create",
            "mode": "online"
        },
        "configurationservice/update": {
            "url": "/configurationservice/update",
            "mode": "online"
        },
        "configurationservice/delete": {
            "url": "/configurationservice/delete",
            "mode": "online"
        },
        "configurationservice/get": {
            "url": "/configurationservice/get",
            "mode": "offline",
            "offlineSettings": {
                "operation": "get",
                "requestPathToSelectDataFile": "params.query.filters.typesCriterion",
                "requestPathToFilterData": "params.query.id",
                "fieldToCompareInData": "id",
                "ignoreFilePrefixes": true
            }
        },
        "configurationservice/getnearest": {
            "url": "/configurationservice/getnearest",
            "mode": "online",
            "offlineSettings": {
                "operation": "get",
                "requestPathToSelectDataFile": "params.query.filters.typesCriterion",
                "requestPathToFilterData": "params.query.id",
                "fieldToCompareInData": "id",
                "ignoreFilePrefixes": true
            }
        },
        "requestmanageservice/get": {
            "url": "/requestmanageservice/get",
            "mode": "online",
            "offlineSettings": {
            }
        },
        "copservice/transform": {
            "url": "/rsConnectService/transform",
            "mode": "online",
            "offlineSettings": {
            }
        },
        "copservice/publish": {
            "url": "/rsConnectService/publish",
            "mode": "online",
            "offlineSettings": {
            }
        },
        "matchservice/search": {
            "url": "/matchservice/search",
            "mode": "online",
            "offlineSettings": {
            }
        },
        "entitygovernservice/validate": {
            "url": "/entitygovernservice/validate",
            "mode": "online",
            "offlineSettings": {
            }
        },
        "copservice/process": {
            "url": "/rsConnectService/process",
            "mode": "online",
            "timeout": 600000,
            "offlineSettings": {
            }
        },
        "copservice/processmodel": {
            "url": "/rsConnectService/processmodel",
            "mode": "online",
            "timeout": 600000,
            "offlineSettings": {
            }
        },
        "copservice/downloadModelExcel": {
            "url": "/rsConnectService/downloadModelExcel",
            "mode": "online",
            "timeout": 600000,
            "offlineSettings": {
            }
        },
        "copservice/downloadDataExcel": {
            "url": "/rsConnectService/downloadDataExcel",
            "mode": "online",
            "timeout": 600000,
            "offlineSettings": {
            }
        },
        "copservice/downloadDataJob": {
            "url": "/rsConnectService/downloadDataJob",
            "mode": "online",
            "timeout": 600000,
            "offlineSettings": {
            }
        },
        "entityservice/getcontext": {
            "url": "/entityservice/getcontext",
            "mode": "online",
            "offlineSettings": {
            }
        },
        "eventservice/get": {
            "url": "/eventservice/get",
            "mode": "online",
            "offlineSettings": {
                "operation": "get",
                "requestPathToSelectDataFile": "params.query.filters.typesCriterion",
                "requestPathToFilterData": "params.query.id",
                "fieldToCompareInData": "id"
            }
        },
        "requesttrackingservice/get": {
            "url": "/requesttrackingservice/get",
            "mode": "online",
            "offlineSettings": {
                "operation": "get",
                "requestPathToSelectDataFile": "params.query.filters.typesCriterion",
                "requestPathToFilterData": "params.query.id",
                "fieldToCompareInData": "id"
            }
        },
        "copservice/generateFieldMap": {
            "url": "/rsConnectService/generateFieldMap",
            "mode": "online",
            "offlineSettings": {
            }
        },
        "binarystreamobjectservice/prepareUpload": {
            "url": "/binarystreamobjectservice/prepareUpload",
            "mode": "online",
            "offlineSettings": {
            }
        },
        "binarystreamobjectservice/prepareDownload": {
            "url": "/binarystreamobjectservice/prepareDownload",
            "mode": "online",
            "offlineSettings": {
            }
        },
        "binarystreamobjectservice/create": {
            "url": "/binarystreamobjectservice/create",
            "mode": "online",
            "offlineSettings": {
            }
        },
        "binaryobjectservice/get": {
            "url": "/binaryobjectservice/get",
            "mode": "online",
            "offlineSettings": {
                "operation": "get",
                "requestPathToSelectDataFile": "params.query.filters.typesCriterion",
                "requestPathToFilterData": "params.query.id",
                "fieldToCompareInData": "id"
            }
        },
        "binaryobjectservice/create": {
            "url": "/binaryobjectservice/create",
            "mode": "online",
            "offlineSettings": {}
        },
        "binaryobjectservice/update": {
            "url": "/binaryobjectservice/update",
            "mode": "online",
            "offlineSettings": {}
        },
        "binaryobjectservice/delete": {
            "url": "/binaryobjectservice/delete",
            "mode": "online",
            "offlineSettings": {}
        },
        "bulkentityservice/createtask": {
            "url": "/bulkentityservice/createtask",
            "mode": "online",
            "offlineSettings": {}
        },
        "binaryobjectservice/getById": {
            "url": "/binaryobjectservice/getById",
            "mode": "online",
            "offlineSettings": {}
        },
        "copservice/getprofile": {
            "url": "/rsConnectService/getprofile",
            "mode": "online",
            "offlineSettings": {
            }
        },
        "copservice/saveoverrides": {
            "url": "/rsConnectService/saveoverrides",
            "mode": "online",
            "offlineSettings": {
            }
        },
        "entityappservice/delete": {
            "url": "/entityappservice/delete",
            "mode": "online",
            "offlineSettings": {}
        }
    }
};
