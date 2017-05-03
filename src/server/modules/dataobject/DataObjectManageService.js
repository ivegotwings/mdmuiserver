'use strict';

var DFRestService = require('../common/df-rest-service/DFRestService');

var DataObjectManageService = function (options) {
    DFRestService.call(this, options);
};

DataObjectManageService.prototype = {
    get: async function (request) {
        var serviceName = this._getServiceName(request);
        // console.log('------------------' + serviceName + '------------------------------');
        // console.log('GET CALL: ', JSON.stringify(request));
        // console.log('-----------------------------------------------------------------\n\n');
        return this.post(serviceName + "/get", request);
    },
    getCoalesce: async function (request) {
        var serviceName = this._getServiceName(request);
        // console.log('------------------' + serviceName + '------------------------------');
        // console.log('GET CALL: ', JSON.stringify(request));
        // console.log('-----------------------------------------------------------------\n\n');
        return this.post(serviceName + "/getcoalesce", request);
    },
    create: async function (request) {
        var serviceName = this._getServiceName(request);
        // console.log('------------------' + serviceName + '------------------------------');
        // console.log('CREATE CALL: ', JSON.stringify(request));
        // console.log('-----------------------------------------------------------------\n\n');
        return this.post(serviceName + "/create", request);
    },
    update: async function (request) {
        var serviceName = this._getServiceName(request);
        // console.log('------------------' + serviceName + '------------------------------');
        // console.log('UPDATE CALL: ', JSON.stringify(request));
        // console.log('-----------------------------------------------------------------\n\n');
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
        else if(request.dataIndex == "eventData") {
            return "eventservice";
        }
        else {
            return "entityservice";
        }
    }
};

module.exports = DataObjectManageService;







