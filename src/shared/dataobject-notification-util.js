'use-strict'

var DataObjectNotificationUtil = function() { };

DataObjectNotificationUtil.updateRequestObjectForNotification =  function(request, userId, timeStamp, clientUrl, mode) {
    if (request && request.clientState) {
        if (!isEmpty(request.clientState)) {
            var notificationInfo = request.clientState.notificationInfo;
            if (!isEmpty(notificationInfo)) {  
                notificationInfo.id = getRandomId();
                notificationInfo.timeStamp = timeStamp;
                notificationInfo.source = "ui";
                notificationInfo.userId = userId;
                notificationInfo.connectionId = "";

                if(mode && mode == "dev") {
                    notificationInfo.callbackUrl = clientUrl;
                }

                if (isEmpty(notificationInfo.context)) {
                    notificationInfo.context = {};
                }
                if (request.entity) {
                    if(request.operationMode != undefined && request.operationMode == "whereUsedFlag"){
                        if(request.data.relationships.hasimages.length > 0){
                            notificationInfo.context.id = request.data.relationships.hasimages[0].relTo.id
                            notificationInfo.context.type = request.data.relationships.hasimages[0].relTo.type;
                        }
                    }else{
                        notificationInfo.context.id = request.entity.id;
                        notificationInfo.context.type = request.entity.type;
                    }
                }
                
                notificationInfo.context.dataIndex = request.dataIndex;
            }
        }
    }
};

function isEmpty(obj) {
    //if (obj === undefined) { return true };

    for (var x in obj) { return false; }

    return true;
};

function getRandomId() {
  function randomToken() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return randomToken() + randomToken() + randomToken() + randomToken();
};

var SharedUtils = SharedUtils || {};

//register as module or as js 
if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = DataObjectNotificationUtil;
    }
    exports.DataObjectNotificationUtil = DataObjectNotificationUtil;
}
else {
    if (!SharedUtils) {
        SharedUtils = {};
    }
    SharedUtils.DataObjectNotificationUtil = DataObjectNotificationUtil;
}
