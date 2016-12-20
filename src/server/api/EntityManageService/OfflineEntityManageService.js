'use strict';

var OfflineServiceBase = require('../OfflineServiceBase');

var OfflineEntityManageService = function(options) {
    OfflineServiceBase.call(this, options);
};

OfflineEntityManageService.prototype = {
    getEntities: function(request){
        var offlineEntityData = require("./offline-data/entityJson_EXTERNAL.json");

        var entities = [];

        if(request.query.id !== undefined){
            offlineEntityData.dataObjects.forEach(function(dataObject){
                if(dataObject.id == request.query.id){
                    entities.push(dataObject);
                    return false;
                }
            });
        }
        else{
            for(var i = 0; i< 10; i++){
                if(offlineEntityData.dataObjects[i] !== undefined){
                    entities.push(offlineEntityData.dataObjects[i]);
                }
            }
        }

        var response = {dataObjectOperationResponse: { status: "success", dataObjects: entities}};

        return response;
    }
};

//OfflineEntityManageService.prototype.constructor = 
module.exports = OfflineEntityManageService;







