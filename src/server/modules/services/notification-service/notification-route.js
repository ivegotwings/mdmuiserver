'use strict';
let logger = require('../../common/logger/logger-service');
let executionContext = require('../../common/context-manager/execution-context');
let NotificationService = require('./NotificationService');

function updateExecutionContext(tenantId, userId) {
    let securityContext = executionContext.getSecurityContext();

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
        let tenantId = req.body && req.body.tenantId ? req.body.tenantId : 'unknown';
        let userId = NotificationService.getUserId(req.body);

        if (tenantId == 'unknown' || userId == 'unknown') {
            //TODO: send failed acknowledgement to RDF
            //return;
        }

        updateExecutionContext(tenantId, userId);

        logger.debug("RDF_NOTIFICATION_RECEIVED", { request: req }, "notification-service");

        let notificationObject = req.body.notificationObject;

        NotificationService.sendNotificationToUI(notificationObject, tenantId);

        let notiificationObjectOperation = {};
        notiificationObjectOperation.dataObjectOperationResponse = {};
        notiificationObjectOperation.dataObjectOperationResponse.status = "success";
        res.status(200).send(notiificationObjectOperation);
    });

    app.use('/data/notification/count', async function (req, res) {
        let response = await NotificationService.getAllNotificationCount(req);
        res.status(200).send(response);
    });
};
