'use-strict';

let notificationManager = require('../../notification-engine/api/notification-manager');
let enums = require('../../../../shared/enums-util');
let logger = require('../../common/logger/logger-service');
let loggerConfigManager = require('../../common/logger/logger-config.js');
let isEmpty = require('../../common/utils/isEmpty');
let VersionService = require('../version-service/VersionService');

const versionService = new VersionService({});

class NotificationService {

    static get dataIndexMapping() {
        return {
            "entityManageService": "entityData",
            "entitygovernservice": "entityData",
            "entitymanagemodelservice": "entityModel"
        };
    };

    static get serivceNames() {
        return [
            "entitymanageservice",
            "entitymanagemodelservice",
            "entitygovernservice",
            "rsconnectservice"
        ]
    }

    static sendNotificationToUI(notificationObject, tenantId) {
        if (notificationObject) {
            if (!this.isHealthCheckNotification(notificationObject.data)) {
                let notificationInfo = this.prepareNotificationObject(notificationObject.data);
                logger.debug("NOTIFICATION_INFO_OBJECT_PREPARED", { detail: notificationInfo }, "notification-service");

                if (!isEmpty(notificationInfo)) {
                    notificationInfo.tenantId = tenantId;
                    // On model import complete Or any model change notification, module version has to be updated to maintain local storage in sync.
                    if (notificationInfo.action == enums.actions.ModelImportComplete || notificationInfo.action == enums.actions.ModelSaveComplete) {
                        (async () => {
                            await versionService.updateModuleVersion('entityModel');
                        })();
                    }

                    if (isEmpty(notificationInfo.taskId) && notificationObject.properties) {
                        notificationInfo.taskId = notificationObject.properties.workAutomationId;
                    }

                    let userInfo = {
                        "userId": notificationInfo.userId,
                        "tenantId": tenantId
                    }

                    if (userInfo) {
                        notificationManager.sendMessageToSpecificUser(notificationInfo, userInfo);
                    } else {
                        notificationManager.sendMessageToAllUser(notificationInfo);
                    }
                }
            }
        }
    }

    static isHealthCheckNotification(data) {
        if (!isEmpty(data) && data.attributes) {
            let clientId = this._getAttributeValue(data.attributes, "clientId");
            return clientId && clientId == "healthcheckClient";
        }
        return false;
    }

    static prepareNotificationObject(data) {
        let notificationInfo = {};

        if (!isEmpty(data)) {
            let attributes = data.attributes;
            let jsonData = data.jsonData;

            if (!isEmpty(attributes)) {
                let clientState = jsonData['clientState'];
                let entityId = this._getAttributeValue(attributes, "entityId");
                let entityType = this._getAttributeValue(attributes, "entityType");

                if (isEmpty(clientState)) {
                    clientState = {
                        "notificationInfo": {
                            "showNotificationToUser": false,
                            "context": {
                                "id": entityId,
                                "type": entityType
                            }
                        }
                    }
                }

                if (!isEmpty(clientState)) {
                    notificationInfo = clientState.notificationInfo;

                    if (!isEmpty(notificationInfo)) {
                        if (!isEmpty(entityId) && notificationInfo.context && notificationInfo.context.id && notificationInfo.context.id != entityId) {
                            notificationInfo.showNotificationToUser = false;
                            notificationInfo.context.id = entityId;
                            notificationInfo.context.type = entityType;
                        }

                        let serviceName = this._getAttributeValue(attributes, "serviceName");
                        let desc = this._getAttributeValue(attributes, "description");

                        notificationInfo.taskId = this._getAttributeValue(attributes, "taskId");
                        notificationInfo.taskType = this._getAttributeValue(attributes, "taskType");
                        notificationInfo.requestId = this._getAttributeValue(attributes, "requestId");
                        notificationInfo.status = this._getAttributeValue(attributes, "requestStatus");

                        isEmpty(notificationInfo.operation) && (notificationInfo.operation = this._getAttributeValue(attributes, "connectIntegrationType"));
                        this.setActionAndDataIndex(notificationInfo, serviceName, notificationInfo.status, notificationInfo.operation, desc);
                        notificationInfo.description = desc;
                    }
                }
            }
        }

        return notificationInfo;
    };

    static setActionAndDataIndex(notificationInfo, serviceName, status, operation, description) {
        let action = "", dataIndex = "entityData";

        if (!isEmpty(serviceName) && !isEmpty(status)) {
            serviceName = serviceName.toLowerCase();
            status = status.toLowerCase();

            if (serviceName == "entitymanageservice") {
                // Here operation is for specific govern operations which should not trigger in case of 'entityManageService'.
                // So added condition to avoid it.
                if (!operation) {
                    if (status == "success") {
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

            if (serviceName == "entitymanagemodelservice") {
                if (operation && operation == "MODEL_IMPORT") {
                    if (status == "completed") {
                        action = enums.actions.ModelImportComplete;
                    } else {
                        action = enums.actions.ModelImportFail;
                    }
                } else {
                    if (status == "success") {
                        action = enums.actions.ModelSaveComplete;
                    } else {
                        action = enums.actions.ModelSaveFail;
                    }
                }
            }

            if (serviceName == "entitygovernservice") {
                if (operation) {
                    if (operation == enums.operations.WorkflowTransition) {
                        if (status == "success") {
                            action = enums.actions.WorkflowTransitionComplete;
                        } else {
                            action = enums.actions.WorkflowTransitionFail;
                        }
                    } else if (operation == enums.operations.WorkflowAssignment) {
                        if (status == "success") {
                            action = enums.actions.WorkflowAssignmentComplete;
                        } else {
                            action = enums.actions.WorkflowAssignmentFail;
                        }
                    } else if (operation == enums.operations.BusinessCondition) {
                        if (status == "success") {
                            action = enums.actions.BusinessConditionSaveComplete;
                        } else {
                            action = enums.actions.BusinessConditionSaveFail;
                        }
                    }
                } else {
                    if (status == "success") {
                        action = enums.actions.GovernComplete;
                    } else {
                        action = enums.actions.GovernFail;
                    }
                }
            }

            if (serviceName == "rsconnectservice") {
                if (status == "success") {
                    action = enums.actions.RSConnectComplete;
                } else {
                    action = enums.actions.RSConnectFail;
                }
            }

            if (NotificationService.dataIndexMapping[serviceName]) {
                dataIndex = NotificationService.dataIndexMapping[serviceName];
            }

            (async () => {
                let moduleLogConfig = await loggerConfigManager.getCurrentModulesObject();

                if (moduleLogConfig && moduleLogConfig["notification-service"] && moduleLogConfig["notification-service"].level == "debug") {
                    await notificationManager.setNotificationCountByService(serviceName);
                }
            })();
        }
        notificationInfo.action = action;
        notificationInfo.dataIndex = dataIndex;
    };

    static _getAttributeValue(attributes, attrKey) {
        if (attributes) {
            return (this.isValidObjectPath(attributes, attrKey + ".values") && attributes[attrKey].values.length) && attributes[attrKey].values[0].value;
        }
    };

    static getUserId(data) {
        let userId = 'unknown';
        if (this.isValidObjectPath(data, "notificationObject.data.jsonData.clientState.notificationInfo.userId")) {
            userId = data.notificationObject.data.jsonData.clientState.notificationInfo.userId;
        }

        return userId;
    };

    static isValidObjectPath(base, path) {
        let current = base;
        let components = path.split(".");
        for (let i = 0; i < components.length; i++) {
            if ((typeof current !== "object") || (!(components[i] in current))) {
                return false;
            }
            current = current[components[i]];
        }
        return true;
    };

    static async getNotificationCountByService(serviceName) {
        return await notificationManager.getNotificationCountByService(serviceName);
    }

    static async getAllNotificationCount() {
        let allNotificationCountCacheKeys = [];
        this.serivceNames.forEach(serviceName => {
            allNotificationCountCacheKeys.push(notificationManager.getNotificationCountCacheKey(serviceName));
        });

        return await notificationManager.getAllNotificationCount(allNotificationCountCacheKeys);
    }
}

module.exports = NotificationService;