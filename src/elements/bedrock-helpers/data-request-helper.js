import './context-helper.js';
import './component-helper.js';
import './data-transform-helper.js';
import SharedEnumsUtil from '../bedrock-enums-util/bedrock-enums-util.js';

window.DataRequestHelper = window.DataRequestHelper || {};

DataRequestHelper.createEntityModelCompositeGetRequest = function (contextData) {
    let clonedContextData = DataHelper.cloneObject(contextData); //to avoid live reference change

    let itemContexts = ContextHelper.getItemContexts(clonedContextData);

    let typeName = itemContexts && itemContexts.length > 0 && itemContexts[0].type ? itemContexts[0].type :
        undefined;
    let domain = itemContexts && itemContexts.length > 0 && itemContexts[0].domain ? itemContexts[0].domain :
        undefined;
    let attributeNames = itemContexts && itemContexts.length > 0 && itemContexts[0].attributeNames ?
        itemContexts[0].attributeNames : undefined;
    let relationships = itemContexts && itemContexts.length > 0 && itemContexts[0].relationships ?
        itemContexts[0].relationships : undefined;
    let relationshipAttributes = itemContexts && itemContexts.length > 0 && itemContexts[0].relationshipAttributes ?
        itemContexts[0].relationshipAttributes : undefined;

    if (!typeName) {
        return undefined;
    }

    let req = {
        "params": {
            "query": {
                "name": typeName,
                "filters": {
                    "typesCriterion": [
                        "entityCompositeModel"
                    ]
                }
            },
            "fields": {
                "attributes": attributeNames,
                "relationships": relationships,
                "relationshipAttributes": relationshipAttributes
            }
        }
    };
    if (!_.isEmpty(domain)) {
        req.params.query.domain = domain;
    }

    let dataContexts = ContextHelper.getDataContexts(clonedContextData);
    let valContexts = ContextHelper.getValueContexts(clonedContextData);

    if (!_.isEmpty(dataContexts) && !_.isEmpty(dataContexts[0])) {
        req.params.query.contexts = dataContexts;
    }

    if (_.isEmpty(valContexts) && _.isEmpty(valContexts[0])) {
        valContexts = [DataHelper.getDefaultValContext()];
    }
    req.params.query.valueContexts = valContexts;

    return req;
};

DataRequestHelper.addContextsToModelRequest = function (requestObject, contextData) {

    let dataContexts = ContextHelper.getDataContexts(contextData);
    let valContexts = ContextHelper.getValueContexts(contextData);
    let targetContexts = [{
        "locale": DataHelper.getDefaultLocale()
    }];

    //in both cases (remove from the top)
    if (DataHelper.getValue(requestObject, "params.query.locale")) {
        delete requestObject.params.query.locale;
    }

    //requestObject.params.query.contexts <- locale here for every of (dataContexts x valContexts.locale)
    if (!_.isEmpty(dataContexts) && !_.isEmpty(dataContexts[0])) {
        targetContexts = dataContexts.reduce((result, dataContext) => {
            (valContexts || []).forEach((valContext) => {
                let dataContextWithLocale = DataHelper.cloneObject(dataContext);
                dataContextWithLocale.locale = valContext.locale;
                result.push(dataContextWithLocale);
            });
            return result;
        }, []);
    }

    //requestObject.params.query.contexts if empty - create a new one with locale
    //req.params.query.locale = valContexts && valContexts.length > 0 && valContexts[0].locale ? valContexts[0].locale : DataHelper.getDefaultLocale();

    //Overrideing Ilya's changes for now beacause it's breaking modelCoalesce
    requestObject.params.query.contexts = dataContexts;
};

DataRequestHelper.createEntityGetRequest = function (contextData, addDefaultContext) {
    let clonedContextData = DataHelper.cloneObject(contextData); //to avoid live reference change
    let itemContexts = ContextHelper.getItemContexts(clonedContextData);

    if (!(itemContexts && itemContexts.length > 0)) {
        return undefined;
    }

    let dataContexts = ContextHelper.getDataContexts(clonedContextData);
    let valueContexts = ContextHelper.getValueContexts(clonedContextData);

    let filteredIds = [];

    let ids = [];
    let types = [];
    for (let i = 0; i < itemContexts.length; i++) {
        let currentItemContext = itemContexts[i];
        //ids
        if (currentItemContext.id instanceof Array) {
            let itemContextIds = currentItemContext.id;
            for (let j = 0; j < itemContextIds.length; j++) {
                ids.push(itemContextIds[j]);
            }
        } else {
            let itemContextId = currentItemContext.id;
            ids.push(itemContextId);
        }
        //types
        if (currentItemContext.type instanceof Array) {
            let itemContextTypes = currentItemContext.type;
            for (let j = 0; j < itemContextTypes.length; j++) {
                types.push(itemContextTypes[j]);
            }
        } else {
            let itemContextType = currentItemContext.type;
            types.push(itemContextType);
        }
    }

    //remove falsy items
    ids = ids.filter(Boolean);
    types = types.filter(Boolean);

    let firstItemContext = ContextHelper.getFirstItemContext(clonedContextData);
    let properties = firstItemContext.properties;
    let attributeNames = firstItemContext.attributeNames;
    let relationships = firstItemContext.relationships;
    let relationshipAttributes = firstItemContext.relationshipAttributes;
    let relatedEntityAttributes = firstItemContext.relatedEntityAttributes;
    let relationshipsCriterion = firstItemContext.relationshipsCriterion;
    let domain = itemContexts && itemContexts.length > 0 && itemContexts[0].domain ? itemContexts[0].domain :
        undefined;

    let req = {
        "params": {
            "query": {
                "filters": {
                    "typesCriterion": types
                }
            },
            "fields": {
                "attributes": attributeNames,
                "relationships": relationships,
                "relationshipAttributes": relationshipAttributes,
            },
            "options": {
                "maxRecords": ids.length || 200
            }
        }
    };

    if (relatedEntityAttributes) {
        req.params.fields["relatedEntityAttributes"] = relatedEntityAttributes;
    }

    if (properties) {
        req.params.fields["properties"] = properties;
    }

    if (domain) {
        req.params.query.domain = domain;
    }

    if (!_.isNull(ids) && !_.isEmpty(ids) && ids) {
        if (ids.length == 1) {
            req.params.query.id = ids[0];
        } else {
            req.params.query.ids = ids;
        }

    }

    if (!_.isNull(relationshipsCriterion) && !_.isEmpty(relationshipsCriterion)) {
        req.params.query.filters.relationshipsCriterion = relationshipsCriterion;
    }

    if (!_.isEmpty(dataContexts) && !_.isEmpty(dataContexts[0])) {
        req.params.query.contexts = dataContexts;
    }

    if (!_.isEmpty(valueContexts) && !_.isEmpty(valueContexts[0])) {
        req.params.query.valueContexts = valueContexts;
    }

    if (addDefaultContext) {
        DataRequestHelper.addDefaultContext(req);
    }

    return req;
};

DataRequestHelper.createEntityGetRequestForDownload = function (contextData, profileContexts) {
    let req = undefined;
    if (!_.isEmpty(contextData)) {
        req = this.createEntityGetRequest(contextData);

        let userContext = ContextHelper.getFirstUserContext(contextData);

        if (req) {
            if (req.params) {
                req.params.rsconnect = {
                    "includeValidationData": true,
                    "profilecontexts": profileContexts
                };
                req.clientState = {
                    "notificationInfo": {
                        "userId": userContext.user
                    }
                };
            }
        }
    }

    return req;
};

DataRequestHelper.createWorkflowMappingGetRequest = function (contextDataIn) {
    let contextData = DataHelper.cloneObject(contextDataIn); //to avoid live reference change
    let dataContexts = ContextHelper.getDataContexts(contextData);
    let firstItemContext = ContextHelper.getFirstItemContext(contextData);

    let typeName = "workflowDefinitionMapping";
    let entityType = firstItemContext.type;

    let relationships = ["hasWorkflowsDefined"];

    let req = {
        "params": {
            "query": {
                "filters": {
                    "typesCriterion": [typeName]
                }
            },
            "fields": {
                "properties": [
                    "_ALL"
                ],
                "relationships": relationships
            }
        }
    };
    if (entityType instanceof Array) {
        req.params.query["names"] = entityType;
    } else {
        req.params.query["name"] = entityType;
    }

    if (!_.isEmpty(dataContexts)) {
        req.params.query["contexts"] = dataContexts;
    }
    return req;
};

DataRequestHelper.createWorkflowDefinitionGetRequest = function (contextDataIn) {
    let contextData = DataHelper.cloneObject(contextDataIn); //to avoid live reference change
    let firstDataContext = ContextHelper.getFirstDataContext(contextData);
    let firstItemContext = ContextHelper.getFirstItemContext(contextData);

    let typeName = "workflowDefinition";

    let workflowNames = [];
    let attributeNames = ["_ALL"];
    if (firstItemContext) {
        if (typeof (firstItemContext.workflowNames) !== "undefined") {
            workflowNames = firstItemContext.workflowNames;
        }

        if (typeof (firstItemContext.atttributeNames) !== "undefined") {
            attributeNames = firstItemContext.atttributeNames;
        }
    }

    let workflowDefinitionIds = [];
    for (let i = 0; i < workflowNames.length; i++) {
        let workflowName = workflowNames[i];
        workflowDefinitionIds.push(workflowName + "_" + typeName);
    }

    let req = {
        "params": {
            "query": {
                "filters": {
                    "typesCriterion": [typeName]
                },
                "valueContexts": []
            },
            "fields": {
                "properties": [
                    "_ALL"
                ],
                "attributes": attributeNames
            }
        }
    };

    if (!_.isNull(workflowDefinitionIds) && workflowDefinitionIds.length >
        0) {
        req.params.query.ids = workflowDefinitionIds;
    }
    
    req.params.query.valueContexts.push(DataHelper.getDefaultValContext());
                      

    return req;
};

DataRequestHelper.createWorkflowDefinitionMappingGetRequest = function () {

    let typeName = "workflowDefinitionMapping";

    let req = {
        "params": {
            "query": {
                "filters": {
                    "typesCriterion": [typeName]
                }
            },
            "fields": {
                "relationships": [
                    "_ALL"
                ]
            }
        }
    };

    return req;
};

DataRequestHelper.createWorkflowRuntimeInstanceGetRequest = function (contextDataIn) {
    let contextData = DataHelper.cloneObject(contextDataIn); //to avoid live reference change
    let dataContexts = ContextHelper.getDataContexts(contextData);
    let firstItemContext = ContextHelper.getFirstItemContext(contextData);

    let entityId = firstItemContext.id;
    let entityType = firstItemContext.type;
    let workflowNames = firstItemContext.workflowNames;
    let attributeNames = firstItemContext.atttributeNames ? firstItemContext.attributeNames : [
        "workflowInstanceId", "status", "startDateTime", "endDateTime", "activities"
    ];

    let workflowContexts = firstItemContext.workflowContexts;

    let req = {
        "params": {
            "query": {
                "contexts": workflowContexts,
                "id": entityId,
                "filters": {
                    "typesCriterion": [entityType]
                }
            },
            "fields": {
                "attributes": attributeNames
            }
        }
    };

    return req;
};

DataRequestHelper.createWorkflowEventsGetRequest = function (contextDataIn) {
    let contextData = DataHelper.cloneObject(contextDataIn);
    let dataContexts = ContextHelper.getDataContexts(contextData);
    let firstItemContext = ContextHelper.getFirstItemContext(contextData);

    let entityId = firstItemContext.id;
    let workflowNames = firstItemContext.workflowNames;
    let attributeNames = firstItemContext.atttributeNames ? firstItemContext.attributeNames : [
        "workflowInstanceId", "status", "startDateTime", "endDateTime", "activities"
    ];

    let workflowContexts = firstItemContext.workflowContexts;

    let req = {
        "params": {
            "query": {
                "contexts": workflowContexts,
                "filters": {
                    "typesCriterion": ["entitygovernevent"],
                    "attributesCriterion": [{
                        "entityId": {
                            "exact": entityId,
                            "nonContextual": true
                        }
                    }],
                    "excludeNonContextual": true
                }
            },
            "fields": {
                "attributes": attributeNames
            }
        }
    };

    return req;
};

DataRequestHelper.createWorkflowTransitionRequest = function (contextDataIn) {
    let contextData = DataHelper.cloneObject(contextDataIn); //to avoid live reference change
    let dataContexts = ContextHelper.getDataContexts(contextData);
    let firstItemContext = ContextHelper.getFirstItemContext(contextData);
    let operations = SharedEnumsUtil.Enums.operations;
    let entityId = firstItemContext.id;
    let entityType = firstItemContext.type;
    let transitionTo = firstItemContext.transitionTo;
    let currentActiveApp = ComponentHelper.getCurrentActiveApp();
    let appInstanceId = "";
    if (currentActiveApp) {
        appInstanceId = currentActiveApp.id;
    }

    let req = {
        "params": {
            "workflow": {
                "workflowName": transitionTo.workflowName,
                "activity": {
                    "activityName": transitionTo.activityName,
                    "action": transitionTo.action,
                    "comment": transitionTo.comments
                }
            }
        },
        "clientState": {
            "notificationInfo": {
                "operation": operations.WorkflowTransition,
                "showNotificationToUser": true,
                "context": {
                    "appInstanceId": appInstanceId,
                    "workflowName": transitionTo.workflowName,
                    "workflowActivityName": transitionTo.activityName,
                    "workflowAction": transitionTo.action
                }
            }
        },
        "entity": {
            "id": entityId,
            "name": entityId,
            "type": entityType
        }
    };

    return req;
};

DataRequestHelper.createInvokeWorkflowRequest = function (contextDataIn) {
    let contextData = DataHelper.cloneObject(contextDataIn); //to avoid live reference change
    let firstDataContext = ContextHelper.getFirstDataContext(contextData);
    let firstItemContext = ContextHelper.getFirstItemContext(contextData);

    let entityId = firstItemContext.id;
    let entityType = firstItemContext.type;
    let invokeWorkflowData = firstItemContext.invokeWorkflowData;

    let req = {
        "params": {
            "workflow": {
                "workflowName": invokeWorkflowData.workflowName
            }
        },
        "entity": {
            "id": entityId,
            "name": entityId,
            "type": entityType,
            "data": {}
        }
    };

    return req;
};

DataRequestHelper.createConfigInitialRequest = function (contextDataIn) {
    let contextData = DataHelper.cloneObject(contextDataIn); //to avoid live reference change
    let _context = ContextHelper.getFirstDataContext(contextData);
    let _typesCriterion = ContextHelper.getItemContexts(contextData);

    let req = {
        "params": {
            "query": {
                "contexts": [
                    _context
                ],
                "filters": {
                    "typesCriterion": _typesCriterion,
                    "excludeNonContextual": true
                }
            },
            "fields": {
                "jsonData": true
            }
        }
    };

    return req;
};

DataRequestHelper.getContextSepecificConfigRequest = function (appName, componentName, contextCollection) {
    let configContext = {
        "app": appName,
        "component": componentName,
        "service": "_ALL",
        "subComponent": "_ALL"
    };

    let request = {
        "params": {
            "query": {
                "contexts": [configContext],
                "filters": {
                    "typesCriterion": ["uiConfig"],
                    "excludeNonContextual": true
                }
            },
            "fields": {
                "jsonData": true
            }
        }
    };

    if (!_.isEmpty(contextCollection)) {
        for (let key in contextCollection) {
            configContext[key] = contextCollection[key];
        }
    }

    return request;
};

DataRequestHelper.getConfigCreateRequest = function (contextDataIn, type, appName, contextSearchName) {
    let contextData = DataHelper.cloneObject(contextDataIn); //to avoid live reference change
    let _context = ContextHelper.getFirstDataContext(contextData);
    let _details = {};

    _details["id"] = appName + "_" + type + "_" + ElementHelper.getRandomString();
    _details["name"] = contextSearchName ? contextSearchName : type + "_" + ElementHelper.getRandomString();
    _details["type"] = type;

    let req = {
        "id": _details["id"],
        "name": _details["name"],
        "version": {},
        "type": _details["type"],
        "properties": {},
        "data": {
            "contexts": [
                _context
            ]
        }
    };

    return req;
};

DataRequestHelper.createConfigGetRequest = function (appName, context, componentName) {
    if (componentName) {
        context.component = componentName;
    }

    if (_.isEmpty(context.component)) {
        context.component = "_ALL";
    }

    let name = this._createConfigName(context);

    let req = {
        "params": {
            "query": {
                "name": name,
                "contexts": [
                    context
                ],
                "filters": {
                    "typesCriterion": ["uiConfig"]
                }
            },
            "fields": {
                "jsonData": true
            }
        }
    };

    return req;
};

DataRequestHelper.createConfigGetRequestNew = function (configId, configContext) {

    let req = {
        "params": {
            "query": {
                "id": configId,
                "contexts": [
                    configContext
                ],
                "filters": {
                    "typesCriterion": ["uiConfig"]
                }
            },
            "fields": {
                "jsonData": true
            }
        }
    };

    return req;
};

DataRequestHelper.createSyncValidationRequest = function (id, type, data, requestObjectKeyName) {
    let reqObj = {};
    let reqObjKeyName = requestObjectKeyName ? requestObjectKeyName : "entity";
    reqObj[reqObjKeyName] = {
        "id": id,
        "type": type,
        "data": data
    }
    return reqObj;
};

DataRequestHelper._createConfigName = function (context) {
    let name = undefined;
    for (let field in context) {
        let value = context[field];
        if (value != "_ALL") {
            if (name) {
                name = name + "_" + context[field];
            } else {
                name = context[field];
            }
        }
    }

    return name;
};

DataRequestHelper.createWfChangeAssignmentRequest = function (entity, wfCriterion, contextDataIn, action, userToBeAssigned) {
    let contextData = DataHelper.cloneObject(contextDataIn); //to avoid live reference change
    let userContext = {};
    let userName;
    let currentActiveApp = ComponentHelper.getCurrentActiveApp();
    let appInstanceId = "";
    let operations = SharedEnumsUtil.Enums.operations;
    if (currentActiveApp) {
        appInstanceId = currentActiveApp.id;
    }

    //TODO: user name here should be name of the user and not id...Fix tihs by reading proper header
    switch (action) {
        case 'take':
            userContext = ContextHelper.getFirstUserContext(contextData);
            if (userContext && userContext.user) {
                userName = userContext.user.replace('_user', '');
            }
            break;
        case 'release':
            userName = ""
            break;
        case 'reassign':
            userContext = userToBeAssigned;
            if (userContext && userContext.id) {
                userName = userContext.id.replace('_user', '');
            }
            break;
    }
    let request = {
        "params": {
            "workflow": {
                "workflowName": wfCriterion.workflowShortName,
                "activity": {
                    "activityName": wfCriterion.workflowActivityName,
                    "newlyAssignedUserName": userName
                }
            }
        },
        "clientState": {
            "notificationInfo": {
                "operation": operations.WorkflowAssignment,
                "showNotificationToUser": true,
                "context": {
                    "appInstanceId": appInstanceId,
                    "workflowName": wfCriterion.workflowShortName,
                    "workflowActivityName": wfCriterion.workflowActivityName,
                    "workflowAction": "assigned to '" + userName + "'"
                }
            }
        }
    };

    if (entity) {
        request["entity"] = {
            "id": entity.id,
            "type": entity.type
        }
    }

    return request;
};

DataRequestHelper.createRePublishRequest = function (profiles, contextData) {
    let profileContexts = [];
    let typesCriterion = [];
    let valContexts = ContextHelper.getValueContexts(contextData);
    for (let i = 0; i < profiles.length; i++) {
        let element = profiles[i];
        if (element) {
            let copContext = {};
            if (element["copContext"]) {
                copContext = element["copContext"];
            }
            profileContexts.push(copContext);
            let elementTypesCriterion = element["types-criterion"];
            if (elementTypesCriterion && elementTypesCriterion.length > 0) {
                typesCriterion = typesCriterion.concat(elementTypesCriterion);
            }
        }
    }
    let request = {
        "params": {
            "query": {
                "filters": {
                    "typesCriterion": typesCriterion
                }
            },
            "fields": {
                "attributes": ["_ALL"]
            },
            "rsconnect": {
                "profilecontexts": profileContexts
            }
        }
    };
    if(!_.isEmpty(valContexts) && valContexts[0].locale){
        request.params.query.valueContexts = valContexts;
    }
    return request;
};

DataRequestHelper.createGovernGetRequest = function (options) {

    if (options) {
        let req = {
            "params": {
                "query": {
                    "contexts": options.contexts,
                    "filters": {
                        "attributesCriterion": [],
                        "typesCriterion": options.typesCriterion,
                        "excludeNonContextual": options.excludeNonContextual
                    }
                }
            }
        };

        if (!_.isEmpty(options.workflowActivityName)) {
            req.params.query.filters.attributesCriterion.push({
                "activities": {
                    "attributes": [{
                        "activityName": {
                            "eq": options.workflowActivityName
                        }
                    }]
                }
            });
        }

        if (!_.isEmpty(options.userId)) {
            if (req.params.query.filters.attributesCriterion.length) {
                req.params.query.filters.attributesCriterion[0]["activities"].attributes.push({
                    "assignedUser": {
                        "eq": options.userId
                    }
                });
            } else {
                req.params.query.filters.attributesCriterion.push({
                    "activities": {
                        "attributes": [{
                            "assignedUser": {
                                "eq": options.userId
                            }
                        }]
                    }
                });
            }
        }

        req.params.query.filters.attributesCriterion.push({
            "status": {
                "eq": "Executing"
            }
        });

        if (!_.isEmpty(options.businessConditionName)) {
            req.params.query.filters.attributesCriterion.push({
                "businessConditions": {
                    "attributes": [{
                            "businessConditionName": {
                                "eq": options.businessConditionName
                            }
                        },
                        {
                            "businessConditionStatus": {
                                "eq": options.passedBusinessConditions ? true : false
                            }
                        }
                    ]
                }
            });
        }
        if (options.businessConditionNames && options.businessConditionNames.length) {
            for (let i = 0; i < options.businessConditionNames.length; i++) {
                let businessConditionName = options.businessConditionNames[i];
                req.params.query.filters.attributesCriterion.push({
                    "businessConditions": {
                        "attributes": [{
                                "businessConditionName": {
                                    "eq": businessConditionName
                                }
                            },
                            {
                                "businessConditionStatus": {
                                    "eq": options.passedBusinessConditions ? true : false
                                }
                            }
                        ]
                    }
                });
            }
        }

        if (!_.isEmpty(options.attributes)) {
            req.params.fields = {
                "attributes": options.attributes
            }
        }

        req.params.options = {
            "from": 0,
            "to": 0
        };

        return req;
    }
};

DataRequestHelper.createOverridesGetRequest = function (copContext) {
    let contexts = [];
    if (!_.isEmpty(copContext)) {
        contexts.push(copContext);
    }
    let req = {
        "params": {
            "query": {
                "filters": {
                    "typesCriterion": [
                        "overrides"
                    ]
                },
                "contexts": contexts
            },
            "fields": {
                "attributes": [
                    "_ALL"
                ]
            }
        }
    };
    return req;
};

DataRequestHelper.createMappingsGetRequest = function (contextData, copContext, selectedContexts, types, selectedOptions, mappingType) {
    let clonedContetData = DataHelper.cloneObject(contextData);
    DataRequestHelper._setRoleBasedContextData(clonedContetData, selectedOptions);
    let context = DataRequestHelper._createMappingContext(clonedContetData, selectedContexts,
        copContext, mappingType);
    let req = {
        "params": {
            "query": {
                "filters": {
                    "excludeNonContextual": true,
                    "typesCriterion": types
                },
                "contexts": [
                    context
                ]
            },
            "fields": {
                "attributes": [
                    "_ALL"
                ]
            },
            "rsconnect": {
                "loadMappingsFromHeaders": true,
                "profilecontexts": [
                    copContext
                ],
                "headers": {
                    "relationships": [],
                    "entities": []
                }
            }
        }
    };

    return req;
};

DataRequestHelper.createMappingsSaveRequest = function (contextData, copContext, selectedContexts, type, selectedOptions, mappingType) {
    let clonedContetData = DataHelper.cloneObject(contextData);
    DataRequestHelper._setRoleBasedContextData(clonedContetData, selectedOptions);
    let context = DataRequestHelper._createMappingContext(clonedContetData, selectedContexts,
        copContext, mappingType);
    let req = {
        "entity": {
            "id": "",
            "type": type,
            "data": {
                "contexts": [{
                    "context": context,
                    "attributes": {}
                }]
            }
        }
    };
    req.hotline = true; // Should be removed once mapping review is enabled
    return req;
};

DataRequestHelper._createMappingContext = function (contextData, selectedContexts, copContext, mappingType) {
    let context = {};
    if (!_.isEmpty(contextData)) {
        let itemContext = ContextHelper.getFirstItemContext(contextData);
        if (itemContext) {
            context["entitytype"] = itemContext.type;
        }

        if (!_.isEmpty(selectedContexts)) {
            for (let i = 0; i < selectedContexts.length; i++) {
                context[selectedContexts[i].type] = selectedContexts[i].value;
            }
        }

        let userContext = ContextHelper.getFirstUserContext(contextData);
        let currentRole  = Array.isArray(userContext.roles) ? userContext.defaultRole : userContext.roles; 
        if (!_.isEmpty(userContext)) {
            if (mappingType === "valueMapping") {
                context["User Id"] = userContext.user;
                context["Role"] = currentRole
            } else {
                context["user"] = userContext.user;
                context["role"] = currentRole
            }
        }

        if (mappingType === "valueMapping") {
            context["Ownership Data"] = "";
        } else {
            context["ownershipdata"] = "";
        }
        context.service = copContext.service;
    }

    return context;
};

DataRequestHelper._setRoleBasedContextData = function (contextData, selectedOptions) {
    if (selectedOptions && selectedOptions.saveType && selectedOptions.role) {
        let userContext = ContextHelper.getFirstUserContext(contextData) || {};
        let user = "_DEFAULT";
        let role = "_DEFAULT";

        if (selectedOptions.saveType != "self") {
            if (selectedOptions.saveType == "role") {
                role = selectedOptions.role;
            }
            //Set user/role based on selection
            userContext.user = user;
            userContext.roles = role;
        }
    }
};

DataRequestHelper.createEntityEventGetRequest = function (entityId,entityType,maxRecords) {
    if (entityId) {
        let req = {
            "params": {
                "query": {
                    "id": entityId,
                    "filters": {
                        "typesCriterion": [
                            entityType
                        ],
                        "attributesCriterion": [
                            {	
                                "entityAction": {	
                                    "exact": "systemupdate",	
                                    "not": true,
                                    "nonContextual": true
                                }	
                            },	
                            {	
                                "eventType": {	
                                    "exact": "NoChange",	
                                    "not": true,
                                    "nonContextual": true
                                }	
                            }	
                        ]
                    }
                },
                "fields": {
                    "attributes": [
                       "_ALL"
                    ],
                    "relationships": [
                       "_ALL"
                    ]
                },
                "sort": {
                    "properties": [{
                        "modifiedDate": "_DESC",
                        "sortType": "_DATETIME"
                    }]
                },
                "options": {
                    "maxRecords": maxRecords
                }
            }
        }
        return req;
    }
};

DataRequestHelper.createProfileCreationRequest = function (profileId, baseProfile, service) {
    let ctxService = "";
    if (service == "transform") {
        ctxService = "excelImportTransformService";
    } else if (service == "process") {
        ctxService = "excelImportProcessService";
    }
    let profile = DataHelper.cloneObject(baseProfile);
    profile.id = profileId;
    profile.name = profileId;
    profile.data.contexts[0].context.service = ctxService;
    profile.data.contexts[0].jsonData.id = profileId;
    profile.data.contexts[0].jsonData.name = profileId;
    return profile;
};

DataRequestHelper.createBusinessConditionGetRequest = function (attributeNames) {
    let typeName = "businessCondition";
    let valContexts = [DataHelper.getDefaultValContext()];
    let req = {
        "params": {
            "query": {
                "valueContexts": valContexts,
                "filters": {
                    "typesCriterion": [
                        "businessCondition"
                    ]
                }
            },
            "fields": {
                "attributes": attributeNames
            }
        }
    };
    return req;
};

DataRequestHelper.generateRelationshipProcessRequest = function (contextData) {
    let firstItemContext = ContextHelper.getFirstItemContext(contextData);
    let firstDataContext = ContextHelper.getFirstDataContext(contextData);

    let entityId = firstItemContext && firstItemContext.id ? firstItemContext.id : "";
    let type = firstItemContext && firstItemContext.type ? firstItemContext.type : "";

    let req = {
        "id": entityId,
        "type": type,
        "data": {
            "relationships": {}
        }
    };

    if(!_.isEmpty(firstDataContext)) {
        req.data["contexts"] = [];
        let ctxObj = {};
        ctxObj["context"] = firstDataContext;
        ctxObj["relationships"] = {};

        req.data.contexts.push(ctxObj);
    }

    return req;
};

DataRequestHelper.createCombinedGetRequest = function (governDataReq, entityDataReq, isBulkOperation) {
    isBulkOperation = isBulkOperation || false;

    let req = {
        "id": "combinedGet",
        "name": "combinedGet",
        "type": "config",
        "data": {
            "jsonData": {
                "searchQueries": []
            }
        }
    }

    if (governDataReq) {
        let governDataSearchQuery = {
            "serviceName": "entitygovernservice",
            "action": "get",
            "searchSequence": 1,
            "searchQuery": governDataReq.params
        }
        req.data.jsonData.searchQueries.push(governDataSearchQuery);
    }

    if (entityDataReq) {
        let entityDataSearchQuery = {
            "serviceName": "entityservice",
            "action": "get",
            "searchSequence": 2,
            "searchQuery": entityDataReq.params
        };
        req.data.jsonData.searchQueries.push(entityDataSearchQuery);
    }

    if (!isBulkOperation) {
        let combinedGetReq = {};
        combinedGetReq.params = {};
        combinedGetReq.params.isCombinedQuerySearch = true;
        combinedGetReq.entity = req;
        return combinedGetReq;
    } else {
        return [req];
    }
};

DataRequestHelper.createImportRequest = function (fileDetails, copContext, hotline) {
    let filename = "";
    if(!_.isEmpty(fileDetails)){
        filename = fileDetails.originalFileName;
    }
    let copRequest = {
        "dataObject": {
            "id": "",
            "dataObjectInfo": {
                "dataObjectType": "entityjson"
            },
            "properties": {
                "createdByService": "user interface",
                "createdBy": "user",
                "createdDate": "2016-07-16T18:33:52.412-07:00",
                "filename": filename,
                "encoding": "Base64",
                "service": copContext.service,
                "channel": copContext.channel,
                "format": copContext.format,
                "source": copContext.source,
                "subtype": copContext.subtype,
                "order": copContext.order
            },
            "data": {
                "blob": ""
            }
        }
    };

    if (hotline) {
        copRequest.hotline = hotline;
    }
    return copRequest;
};

DataRequestHelper.addDefaultContext = function (req) {
    let defaultLocale = DataHelper.getDefaultLocale();
    if (req.params.query) {
        req.params.query.valueContexts = req.params.query.valueContexts || [];
        let defaultValueContext = req.params.query.valueContexts.find(context => context.locale ===
            defaultLocale);
        if (!defaultValueContext) {
            req.params.query.valueContexts.push(DataHelper.getDefaultValContext());
        }
    }
};

DataRequestHelper.createContextModelGetRequest = function (entityType) {
    let req = {};

    if (entityType) {
        let contextModelId = entityType + "_entityContextModel";
        req = {
            "params": {
                "query": {
                    "id": contextModelId,
                    "filters": {
                        "typesCriterion": [
                            "entityContextModel"
                        ]
                    }
                },
                "fields": {
                    "attributes": ["_ALL"]
                }
            }
        };
    }
    return req;
};

DataRequestHelper.createVariantModelSettingsGetRequest = function (entityType) {
    let req = {};
   
    if (entityType) {
        let contextModelId = entityType + "_variantModelSettings";
        req = {
            "params": {
                "query": {
                    "id": contextModelId,
                    "filters": {
                        "typesCriterion": [
                            "variantModelSettings"
                        ]
                    }
                },
                "fields": {
                    "attributes": ["_ALL"]
                }
            }
        };
    }
    return req;
};

DataRequestHelper.createVariantModelGetRequest = function (variantContextData, variantPath) {
    let req = {};
   
    if (variantPath) {               
        req = {
            "params": {
                "query": {
                    "filters": {
                        "typesCriterion": [
                            "entityVariantModel"
                        ]
                    }
                },
                "fields": {
                    "attributes": ["_ALL"]
                },
                "options": {
                    "getnearestPath": variantPath,
                    "getnearestReturnAll": false
                }
            }
        };
        
        if (!_.isEmpty(variantContextData)) {
            req.params.query.contexts = [variantContextData];
        }
    }
    return req;
};

DataRequestHelper.createGetModelRequest = function (modelName, ids) {
    let req = {
        "params": {
            "query": {
                "ids": ids || [],
                "filters": {
                    "typesCriterion": [
                        modelName
                    ]
                }
            },
            "fields": {
                "attributes": [
                    "_ALL",
                    "INTERNAL_DATAOBJECT_METADATA_FIELDS"
                ],
                "relationships": [
                    "_ALL"
                ]
            }
        }
    };

    return req;
};

DataRequestHelper.createGetManageModelRequest = function (entityTypes) {
    let ids = [];
    for (let i = 0; i < entityTypes.length; i++) {
        let entityType = entityTypes[i];
        ids.push(entityType + "_entityManageModel");
    }

    let req = {
        "params": {
            "query": {
                "ids": ids,
                "filters": {
                    "typesCriterion": [
                        "entityManageModel"
                    ]
                }
            },
            "fields": {
                "attributes": [
                    "_ALL"
                ],
                "relationships": [
                    "_ALL"
                ]
            }
        }
    };

    return req;
};

DataRequestHelper.createGetAttributeModelRequest = function (types, attributes) {
    let ids = [];
    if (!attributes || attributes.length == 0) {
        attributes = "_ALL";
    }

    for (let i = 0; i < types.length; i++) {
        let type = types[i];
        ids.push(type + "_attributeModel");
    }

    let req = {
        "params": {
            "query": {
                "ids": ids,
                "filters": {
                    "typesCriterion": [
                        "attributeModel"
                    ]
                }
            },
            "fields": {
                "attributes": [
                    attributes
                ]
            }
        }
    };

    return req;
};

DataRequestHelper.createGetReferenceRequest = function (contextData, referenceTypes) {
    let req = {
        "params": {
            "query": {
                "valueContexts": contextData.ValContexts,
                "filters": {
                    "typesCriterion": referenceTypes
                }
            },
            "fields": {
                "attributes": [
                    "_ALL"
                ]
            }
        }
    };

    return req;
};

DataRequestHelper.createEntityContextGetRequest = function (entityId, entityType) {
    let req = {}

    if (entityId && entityType) {
        req = {
            "params": {
                "query": {
                    "id": entityId,
                    "filters": {
                        "typesCriterion": [
                            entityType
                        ]
                    }
                },
                "fields": {
                    "attributes": ["_ALL"]
                }
            }
        };
    }

    return req;
};

DataRequestHelper.createAttributesCriteria = function (searchText, titlePattern, subTitlePattern) {
    let attributesCriterion = [];
    let attrObject = {};
    if (!_.isEmpty(searchText)) {
        let attributes = [];

        if (typeof (titlePattern) !== 'undefined' && titlePattern !== "") {
            if (!attributes.includes(this.titlePattern)) {
                let titleFields = DataHelper.getAttributesBetweenCurlies(titlePattern);
                if (_.isEmpty(titleFields)) {
                    attributes.push(titlePattern);
                } else if (titleFields && titleFields instanceof Array) {
                    attributes.push(...titleFields);
                }
            }
        }

        if (typeof (subTitlePattern) !== 'undefined' && subTitlePattern !== "") {
            if (!attributes.includes(subTitlePattern)) {
                let subTitleFields = DataHelper.getAttributesBetweenCurlies(subTitlePattern);
                if (subTitleFields && subTitleFields instanceof Array) {
                    attributes.push(...subTitleFields);
                    attrObject["isAttributesCriterionOR"] = true; 
                }
            }
        }

        if (attributes && attributes.length) {
            attributes.forEach(function (item) {
                let searchKey = new Object();
                let searchValue = new Object();
                let prefix = /^\"/i;
                let suffix = /^.+\"$/gm;
                let isPrefixed = prefix.test(searchText);
                let isSuffixed = suffix.test(searchText);
                let isExactSearch = false;
                if (isPrefixed && isSuffixed) {
                    isExactSearch = true;
                }
                //For Exact Searcvh with Quotes
                if (isExactSearch) {
                    // searchValue.eq = "*" + "\""  + searchText + "\"" + "*";
                    searchText = searchText.replace(/['"]+/g, '');
                    searchValue.eq = '\"*' + searchText + '*\"';

                    //For Partial Search Scenario
                } else {
                    searchValue.eq = searchText + "*";
                }
                searchKey[item] = searchValue;
                attributesCriterion.push(searchKey);
            }, this);
        }
    }
    attrObject["attributesCriterion"] = attributesCriterion
    return attrObject;
};

DataRequestHelper.createModelGetRequest = function(contextData) {
    if(!_.isEmpty(contextData)) {
        let firstItemContext = ContextHelper.getFirstItemContext(contextData);
        let attributeNames = firstItemContext && firstItemContext.attributeNames ? firstItemContext.attributeNames : undefined;
        let modelType = firstItemContext && firstItemContext.type ? firstItemContext.type : undefined;

        if(!_.isEmpty(attributeNames) && modelType) {
            let ids = [];
            attributeNames.forEach(function(name) {
                ids.push(name + "_" + modelType);
            }, this);

            let req = {
                "params": {
                    "query": {
                        "ids": ids,
                        "filters": {
                            "typesCriterion": [
                                modelType
                            ]
                        }
                    },
                    "fields": {
                        "ctxTypes": [
                            "properties"
                        ],
                        "attributes": [""]
                    }
                }
            };

            return req;
        }
    }
}
