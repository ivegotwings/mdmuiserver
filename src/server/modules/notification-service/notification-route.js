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
                        setActionAndDescription(serviceName.values[0].value, notificationInfo);
                    }
                }
            }
        }
    }

    return notificationInfo;
};

function setActionAndDescription(serviceName, notificationInfo) {
    var status = notificationInfo.status;
    var operation = notificationInfo.operation;
    var entityId = notificationInfo.context.id;

    if (!isEmpty(status) && !isEmpty(status)) {
        if (serviceName.toLowerCase() == "entityservice") {
            if (status.toLowerCase() == "success") {
                notificationInfo.action = enums.actions.SaveComplete;
                notificationInfo.description = "entity save is successful for entity id: " + entityId + ".";
            } else {
                notificationInfo.action = enums.actions.SaveFail;
                notificationInfo.description = "entity save is failed for entity id: " + entityId + ".";
            }
        }

        if (serviceName.toLowerCase() == "entitygovernservice") {
            if (operation) {
                if (operation == enums.operations.WorkflowTransition) {
                    if (status.toLowerCase() == "success") {
                        notificationInfo.action = enums.actions.WorkflowTransitionComplete;
                        notificationInfo.description = "workflow transition is successful for entity id: " + entityId + ".";
                    } else {
                        notificationInfo.action = enums.actions.WorkflowTransitionFail;
                        notificationInfo.description = "workflow transition is failed for entity id: " + entityId + ".";
                    }
                }
            } else {
                if (status.toLowerCase() == "success") {
                    notificationInfo.action = enums.actions.GovernComplete;
                    notificationInfo.description = "entity govern is successful for entity id: " + entityId + ".";
                } else {
                    notificationInfo.action = enums.actions.GovernFail;
                    notificationInfo.description = "entity govern is failed for entity id: " + entityId + ".";
                }
            }
        }
    }
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
                    console.log(notificationInfo);
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