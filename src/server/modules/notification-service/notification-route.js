'use strict';
var notificationManager = require('../notification-engine/api/notification-manager');

module.exports = function(app) {
     app.post('/api/notify', function (req, res) {
         //console.log(JSON.stringify(req.body));
         var dataObject = req.body.dataObject;

         if(dataObject && dataObject.data) {
             var attributes = dataObject.data.attributes;

             if(attributes){
                var userId = "";
                var clientState = attributes['clientState'];

                if(clientState && clientState.values) {
                    userId = clientState.values[0].value.userId;
                }
                
                notificationManager.sendMessageToSpecificUser(req.body,  userId);
             }
         }
         
         var dataObjectOperation = {};
         dataObjectOperation.dataObjectOperationResponse = {};
         dataObjectOperation.dataObjectOperationResponse.status = "success";
         res.status(200).send(dataObjectOperation);
     });
};