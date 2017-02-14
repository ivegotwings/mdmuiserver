'use strict';

var DFRestService = require('../common/df-rest-service/DFRestService');

var DataObjectManageService = function (options) {
    DFRestService.call(this, options);
};

DataObjectManageService.prototype = {
    get: async function (request) {
        var serviceName = this._getServiceName(request);
        return this.post(serviceName + "/get", request);
    },
    create: async function (request) {
        var serviceName = this._getServiceName(request);
        //console.log('create entity RDP call: ', JSON.stringify(request));
        return this.post(serviceName + "/create", request);
    },
    update: async function (request) {
        var serviceName = this._getServiceName(request);
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

        if(request.objType == "entity") {
            return "entitymanageservice";
        }
        else if(request.objType == "workflowDefinition") {
            return "entitymodelservice";
        }
        else if(request.objType == "workflowRuntimeInstance") {
            return "entitygovernservice";
        }
        else if(request.objType == "governentity") {
            return "entitygovernservice";
        }
        else if(request.objType == "modelentity") {
            return "entitymodelservice";
        }
        else {
            return "entitymanageservice";
        }
    }
};

module.exports = DataObjectManageService;







