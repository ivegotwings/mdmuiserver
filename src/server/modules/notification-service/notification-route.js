'use strict';
var notificationManager = require('../notification-engine/api/notification-manager');
var isEmpty = require('../common/utils/isEmpty');
var enums = require('../../../shared/enums-util');

function prepareNotificationObject(data) {
    var notificationInfo = {};

    if (!isEmpty(data)) {
        var attributes = data.attributes;
        var jsonData = data.jsonData;
        if (!isEmpty(attributes) && !isEmpty(jsonData)) {
            var clientState = jsonData['clientState'];
            var requestStatus = attributes['requestStatus'];
            var serviceName = attributes['serviceName'];

            if (!isEmpty(clientState)) {
                notificationInfo = clientState.notificationInfo;

                if (!isEmpty(notificationInfo)) {
                    if (!isEmpty(serviceName) && !isEmpty(requestStatus)) {
                        notificationInfo.status = requestStatus.values[0].value;
                        notificationInfo.action = getAction(serviceName.values[0].value, notificationInfo.status, notificationInfo.operation);
                        notificationInfo.description = "";
                    }
                }
            }
        }
    }

    return notificationInfo;
};

function getAction(serviceName, status, operation) {
    var action = "";

    if (!isEmpty(status) && !isEmpty(status)) {
        if (serviceName.toLowerCase() == "entityservice") {
            if (status.toLowerCase() == "success") {
                action = enums.actions.SaveComplete;
            } else {
                action = enums.actions.SaveFail;
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
                }
            } else {
                if (status.toLowerCase() == "success") {
                    action = enums.actions.GovernComplete;
                } else {
                    action = enums.actions.GovernFail;
                }
            }
        }
    }

    return action;
};

module.exports = function (app) {
    app.post('/api/notify', function (req, res) {
        //console.log(JSON.stringify(req.body));
        var dataObject = req.body.dataObject;

        if (dataObject) {
            var notificationInfo = prepareNotificationObject(dataObject.data);

            if (!isEmpty(notificationInfo)) {
                notificationInfo.tenantId = req.body.tenantId;
                if (notificationInfo.userId) {
                    notificationManager.sendMessageToSpecificUser(notificationInfo, notificationInfo.userId);
                }
            }
        }

        var dataObjectOperation = {};
        dataObjectOperation.dataObjectOperationResponse = {};
        dataObjectOperation.dataObjectOperationResponse.status = "success";
        res.status(200).send(dataObjectOperation);
    });
};