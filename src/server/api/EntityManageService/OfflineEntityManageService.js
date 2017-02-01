'use strict';

var OfflineServiceBase = require('../OfflineServiceBase');

var OfflineEntityManageService = function (options) {
    OfflineServiceBase.call(this, options);
};

OfflineEntityManageService.prototype = {
    getEntities: function (request) {
        var offlineEntityData;
        //console.log('request: ', JSON.stringify(request));
        
        if (request && request.params && request.params.query && request.params.query.id &&
        request.params.query.id.toLowerCase().indexOf('workflow') > -1 ) {
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
    createEntities: async function (request) {
        var response = {
            entityOperationResponse: {
                status: "success"
            }
        };
        return response;
    },
    updateEntities: async function (request) {
        var response = {
            entityOperationResponse: {
                status: "success"
            }
        };
        return response;
    },
    deleteEntities: async function (request) {
        var response = {
            entityOperationResponse: {
                status: "success"
            }
        };
        return response;
    }
};

//OfflineEntityManageService.prototype.constructor = 
module.exports = OfflineEntityManageService;