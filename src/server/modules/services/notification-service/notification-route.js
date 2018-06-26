'use strict';
var notificationManager = require('../../notification-engine/api/notification-manager');
var config = require('config');
var isEmpty = require('../../common/utils/isEmpty');
var enums = require('../../../../shared/enums-util');
var logger = require('../../common/logger/logger-service');
var executionContext = require('../../common/context-manager/execution-context');

function prepareNotificationObject(data) {
    var notificationInfo = {};

    if (!isEmpty(data)) {
        var attributes = data.attributes;
        var jsonData = data.jsonData;
        if (!isEmpty(attributes) && !isEmpty(jsonData)) {
            var clientState = jsonData['clientState'];

            if (!isEmpty(clientState)) {
                notificationInfo = clientState.notificationInfo;

                if (!isEmpty(notificationInfo)) {
                    let serviceName = _getAttributeValue(attributes, "serviceName");
                    let desc = _getAttributeValue(attributes, "description");

                    notificationInfo.taskId = _getAttributeValue(attributes, "taskId");
                    notificationInfo.taskType = _getAttributeValue(attributes, "taskType");
                    notificationInfo.requestId = _getAttributeValue(attributes, "requestId");
                    notificationInfo.status = _getAttributeValue(attributes, "requestStatus");

                    isEmpty(notificationInfo.operation) && (notificationInfo.operation = _getAttributeValue(attributes, "connectIntegrationType"));
                    notificationInfo.action = getAction(serviceName, notificationInfo.status, notificationInfo.operation, desc);
                    notificationInfo.description = desc;
                }
            }
        }
    }

    return notificationInfo;
};

function _getAttributeValue(attributes, attrKey) {
    if (attributes) {
        return (isValidObjectPath(attributes, attrKey + ".values") && attributes[attrKey].values.length) && attributes[attrKey].values[0].value;
    }
}

function getAction(serviceName, status, operation, description) {
    var action = "";

    if (!isEmpty(status) && !isEmpty(status)) {
        if (serviceName.toLowerCase() == "entitymanageservice") {
            // Here operation is for specific govern operations which should not trigger in case of 'entityManageService'.
            // So added condition to avoid it.
            if (!operation) {
                if (status.toLowerCase() == "success") {
                    if (description == "System Manage Complete") {
                        action = enums.actions.SystemSaveComplete;
                    } else {
                        action = enums.actions.SaveComplete;
                    }
                } else {
                    if (description == "System Manage Complete") {
                        action = enums.actions.SystemSaveFail;
                    } else {
                        action = enums.actions.SaveFail;
                    }
                }
            }
        }

        if (serviceName.toLowerCase() == "entitymanagemodelservice") {
            if (operation && operation == "MODEL_IMPORT") {
                if (status.toLowerCase() == "completed") {
                    action = enums.actions.ModelImportComplete;
                } else {
                    action = enums.actions.ModelImportFail;
                }
            } else {
                if (status.toLowerCase() == "success") {
                    action = enums.actions.ModelSaveComplete;
                } else {
                    action = enums.actions.ModelSaveFail;
                }
            }
        }

        if (serviceName.toLowerCase() == "entitygovernservice") {
            if (operation) {
                if (operation == enums.operations.WorkflowTransition) {
                    if (status.toLowerCase() == "success") {
                        action = enums.actions.WorkflowTransitionComplete;
                    } else {
                        action = enums.actions.WorkflowTransitionFail;
                    }
                } else if (operation == enums.operations.WorkflowAssignment) {
                    if (status.toLowerCase() == "success") {
                        action = enums.actions.WorkflowAssignmentComplete;
                    } else {
                        action = enums.actions.WorkflowAssignmentFail;
                    }
                } else if (operation == enums.operations.BusinessCondition) {
                    if (status.toLowerCase() == "success") {
                        action = enums.actions.BusinessConditionSaveComplete;
                    } else {
                        action = enums.actions.BusinessConditionSaveFail;
                    }
                }
            } else {
                if (status.toLowerCase() == "success") {
                    action = enums.actions.GovernComplete;
                } else {
                    action = enums.actions.GovernFail;
                }
            }
        }

        if (serviceName.toLowerCase() == "rsconnectservice") {
            if (status.toLowerCase() == "success") {
                action = enums.actions.RSConnectComplete;
            } else {
                action = enums.actions.RSConnectFail;
            }
        }
    }
    return action;
};

function getUserId(data) {
    var userId = 'unknown';
    if (isValidObjectPath(data, "notificationObject.data.jsonData.clientState.notificationInfo.userId")) {
        userId = data.notificationObject.data.jsonData.clientState.notificationInfo.userId;
    }

    return userId;
}

function isValidObjectPath(base, path) {
    var current = base;
    var components = path.split(".");
    for (var i = 0; i < components.length; i++) {
        if ((typeof current !== "object") || (!components[i] in current)) {
            return false;
        }
        current = current[components[i]];
    }
    return true;
}

function sendNotificationToUI(notificationObject, tenantId) {
    if (notificationObject) {
        var notificationInfo = prepareNotificationObject(notificationObject.data);
        logger.debug("NOTIFICATION_INFO_OBJECT_PREPARED", { detail: notificationInfo }, "notification-service");

        if (!isEmpty(notificationInfo)) {
            if (isEmpty(notificationInfo.taskId) && notificationObject.properties) {
                notificationInfo.taskId = notificationObject.properties.workAutomationId;
            }

            notificationInfo.tenantId = tenantId;
            if (notificationInfo.userId) {
                notificationManager.sendMessageToSpecificUser(notificationInfo, notificationInfo.userId);
            }
        }
    }
}

function updateExecutionContext(tenantId, userId) {
    var securityContext = executionContext.getSecurityContext();

    if (!securityContext) {
        securityContext = {};
    }

    if (!securityContext.tenantId) {
        securityContext.tenantId = tenantId;
    }

    if (!securityContext.headers) {
        securityContext.headers = {};
    }

    if (!securityContext.headers.userId) {
        securityContext.headers.userId = userId;
    }

    executionContext.updateSecurityContext(securityContext);

}

module.exports = function (app) {
    app.post('/api/notify', function (req, res) {
        var tenantId = req.body && req.body.tenantId ? req.body.tenantId : 'unknown';
        var userId = getUserId(req.body);

        if (tenantId == 'unknown' || userId == 'unknown') {
            //TODO: send failed acknowledgement to RDF
            //return;
        }

        updateExecutionContext(tenantId, userId);

        logger.debug("RDF_NOTIFICATION_RECEIVED", { request: req }, "notification-service");

        var notificationObject = req.body.notificationObject;

        sendNotificationToUI(notificationObject, tenantId);

        var notiificationObjectOperation = {};
        notiificationObjectOperation.dataObjectOperationResponse = {};
        notiificationObjectOperation.dataObjectOperationResponse.status = "success";
        res.status(200).send(notiificationObjectOperation);
    });
};
