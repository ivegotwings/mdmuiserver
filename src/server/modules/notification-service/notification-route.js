'use strict';
var notificationManager = require('../notification-engine/api/notification-manager');
var isEmpty = require('../common/utils/isEmpty');

function prepareNotificationObject(data) {
    var notificationInfo = {};

    if (!isEmpty(data)) {
        var attributes = data.attributes;
        if (!isEmpty(attributes)) {
            var clientState = attributes['clientState'];
            var requestStatus = attributes['requestStatus'];
            var serviceName = attributes['serviceName'];

            if (!isEmpty(clientState)) {
                notificationInfo = clientState.values[0].value.notificationInfo;

                if (!isEmpty(notificationInfo)) {
                    if (!isEmpty(serviceName) && !isEmpty(requestStatus)) {
                        notificationInfo.status = requestStatus.values[0].value;
                        notificationInfo.action = getAction(serviceName.values[0].value, notificationInfo.status);
                    }
                }
            }
        }
    }

    return notificationInfo;
};

function getAction(serviceName, status) {
    var action = "";
    
    if(!isEmpty(status) && !isEmpty(status)) {
        if(serviceName == "entityservice") {
            if(status == "success") {
                action = "save completed";
            } else {
                action = "save failed";
            }
        }

        if(serviceName == "entitygovernservice") {
            if(status == "success") {
                action = "govern completed";
            } else {
                action = "govern failed";
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

            if(!isEmpty(notificationInfo)) {
                if(notificationInfo.userId) {
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