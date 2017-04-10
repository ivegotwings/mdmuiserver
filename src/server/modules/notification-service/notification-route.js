'use strict';
var notificationManager = require('../notification-engine/api/notification-manager');


function prepareNotificationObject(data) {
    var notificationInfo = {};

    if (!_.isEmpty(data)) {
        var attributes = data.attributes;
        if (!_.isEmpty(attributes)) {
            var clientState = attributes['clientState'];
            var requestStatus = attributes['requestStatus'];
            var serviceName = attributes['serviceName'];

            if (!_.isEmpty(clientState)) {
                notificationInfo = clientState.values[0].value.notificationInfo;

                if (!_.isEmpty(notificationInfo)) {
                    if (!_.isEmpty(serviceName) && !_.isEmpty(requestStatus)) {
                        notificationInfo.status = requestStatus.values[0].value;
                        notificationInfo.action = getAction(serviceName.values[0].value, notificationInfo.status);
                    }
                }
            }
        }
    }

    return notificationInfo;
}

function getAction(serviceName, status) {
    var action = "";
    
    if(!_.isEmpty(status) && !_.isEmpty(status)) {
        if(serviceName == "entityservice") {
            if(status == "success") {
                action = "";
            } else {
                action = "";
            }
        }

        if(serviceName == "entitygovernservice") {
            if(status == "success") {
                action = "";
            } else {
                action = "";
            }
        }
    }
    
    return action;
}

module.exports = function (app) {
    app.post('/api/notify', function (req, res) {
        //console.log(JSON.stringify(req.body));
        var dataObject = req.body.dataObject;

        if (dataObject) {
            var notificationInfo = prepareNotificationObject(dataObject.data);

            if(!_.isEmpty(notificationInfo)) {
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