'use strict';

module.exports = function(app) {
     app.post('/api/notify', function (req, res) {
         console.log(JSON.stringify(req.body));
         var dataObjectOperation = {};
         dataObjectOperation.dataObjectOperationResponse = {};
         dataObjectOperation.dataObjectOperationResponse.status = "success";
         res.status(200).send(dataObjectOperation);
     });
};