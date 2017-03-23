'use strict';

var DFRestService = require('../common/df-rest-service/DFRestService');

var DataObjectManageService = function (options) {
    DFRestService.call(this, options);
};

DataObjectManageService.prototype = {
    get: async function (request) {
        var serviceName = this._getServiceName(request);
        //console.log('get entity RDP call: ', JSON.stringify(request));
        return this.post(serviceName + "/get", request);
    },
    create: async function (request) {
        var serviceName = this._getServiceName(request);
        //console.log('create entity RDP call: ', JSON.stringify(request));
        return this.post(serviceName + "/create", request);
    },
    update: async function (request) {
        var serviceName = this._getServiceName(request);
        //console.log('update entity RDP call: ', JSON.stringify(request));
        return this.post(serviceName + "/update", request);
    },
    deleteDataObjects: async function (request) {
        var serviceName = this._getServiceName(request);
        return this.post(serviceName + "/delete", request);
    },
    _getServiceName: function(request) {
        if(!request) {
            return "NA";
        };

        if(request.dataIndex == "entityData") {
            return "entityservice";
        }
        else if(request.dataIndex == "entityGovernData") {
            return "entitygovernservice";
        }
        else if(request.dataIndex == "entityModel") {
            return "entitymodelservice";
        }
         else if(request.dataIndex == "config") {
            return "configurationservice";
        }
        else {
            return "entityservice";
        }
    }
};

module.exports = DataObjectManageService;







