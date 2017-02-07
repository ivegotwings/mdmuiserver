'use strict';

var OfflineServiceBase = require('../OfflineServiceBase');
var Util = require('../DataObjectRoutes/dataobject-falcor-utils');

var OfflineDataObjectManageService = function (options) {
    OfflineServiceBase.call(this, options);
};

OfflineDataObjectManageService.prototype = {
    get: function (request) {
        var offlineEntityData;
        //console.log('request: ', JSON.stringify(request));
        var objType = request.objType;

        //console.log('domain in OfflineEntityManageService.getEntities: '+ domain);
        if (objType == 'workflowRuntimeInstance') {
            offlineEntityData = require("./offline-data/workflow_runtime_instance_external.json");
        }
        else if (objType == 'workflowDefinition') {
            offlineEntityData = require("./offline-data/workflow_definition_external.json");
        }
        else {
            offlineEntityData = require("./offline-data/entityJson_EXTERNAL.json");
        }

        //console.log('offlineEntityData file: ', offlineEntityData);

        var entities = [];

        if (request.params.query.id !== undefined) {
            offlineEntityData.entities.forEach(function (entity) {
                if (entity.id == request.params.query.id) {
                    entities.push(entity);
                    return false;
                }
            });
        } else {
            for (var i = 0; i < 10; i++) {
                if (offlineEntityData.entities[i] !== undefined) {
                    entities.push(offlineEntityData.entities[i]);
                }
            }
        }

        var response = {
            entityOperationResponse: {
                status: "success",
                entities: entities
            }
        };
        //console.log('offline response ', JSON.stringify(response));
        return response;
    },
    create: async function (request) {
        var response = {
            entityOperationResponse: {
                status: "success"
            }
        };
        return response;
    },
    update: async function (request) {
        var response = {
            entityOperationResponse: {
                status: "success"
            }
        };
        return response;
    },
    deleteDataObjects: async function (request) {
        var response = {
            entityOperationResponse: {
                status: "success"
            }
        };
        return response;
    }
};

module.exports = OfflineDataObjectManageService;