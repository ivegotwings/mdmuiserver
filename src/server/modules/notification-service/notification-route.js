'use strict';
var notificationManager = require('../notification-engine/api/notification-manager');
var notificationConfig = require('../notification-engine/config');
var isEmpty = require('../common/utils/isEmpty');
var enums = require('../../../shared/enums-util');

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
                    var requestStatus = attributes['requestStatus'];
                    var serviceName = attributes['serviceName'];
                    var requestId = attributes['requestId'];
                    var description = attributes["description"];

                    var desc = "";
                    if (description && description.values && description.values.length) {
                        desc = description.values[0].value;
                    }

                    if (!isEmpty(serviceName) && !isEmpty(requestStatus) && !isEmpty(requestId)) {
                        notificationInfo.requestId = requestId.values[0].value;
                        notificationInfo.status = requestStatus.values[0].value;
                        notificationInfo.action = getAction(serviceName.values[0].value, notificationInfo.status, notificationInfo.operation, desc);
                        notificationInfo.description = "";
                    }
                }
            }
        }
    }

    return notificationInfo;
};

function getAction(serviceName, status, operation, description) {
    var action = "";

    if (!isEmpty(status) && !isEmpty(status)) {
        if (serviceName.toLowerCase() == "entitymanageservice") {
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

module.exports = function (app) {
    app.post('/api/notify', function (req, res) {
        if (notificationConfig.clientConfig.enableLogs) {
            console.log('------------------ notification from RDF ------------------------------');
            console.log(JSON.stringify(req.body));
            console.log('-------------------------------------------------------------------\n\n');
        }

        var notificationObject = req.body.notificationObject;

        if (notificationObject) {
            var notificationInfo = prepareNotificationObject(notificationObject.data);
            // console.log('------------------ notification object ---------------------');
            // console.log(JSON.stringify(notificationInfo));
            // console.log('-------------------------------------------------------------------\n\n');

            if (!isEmpty(notificationInfo)) {

                if(notificationObject.properties) {
                    notificationInfo.workAutomationId = notificationObject.properties.workAutomationId;
                }

                notificationInfo.tenantId = req.body.tenantId;
                if (notificationInfo.userId) {
                    // console.log('------------------ notification message to browser ---------------------');
                    // console.log(JSON.stringify(notificationInfo));
                    // console.log('-------------------------------------------------------------------\n\n');
                    notificationManager.sendMessageToSpecificUser(notificationInfo, notificationInfo.userId);
                }
            }
        }

        var notiificationObjectOperation = {};
        notiificationObjectOperation.dataObjectOperationResponse = {};
        notiificationObjectOperation.dataObjectOperationResponse.status = "success";
        res.status(200).send(notiificationObjectOperation);
    });
};