'use strict';

let DFRestService = require('../../common/df-rest-service/DFRestService');

let DataObjectManageService = function (options) {
    DFRestService.call(this, options);
};

DataObjectManageService.prototype = {
    get: async function (request) {
        let serviceName = this._getServiceName(request);
        // console.log('------------------' + serviceName + '------------------------------');
        // console.log('GET CALL: ', JSON.stringify(request));
        // console.log('-----------------------------------------------------------------\n\n');
        return this.post(serviceName + "/get", request);
    },
    getNearest: async function (request) {
        let serviceName = this._getServiceName(request);
        // console.log('------------------' + serviceName + '------------------------------');
        // console.log('GET CALL: ', JSON.stringify(request));
        // console.log('-----------------------------------------------------------------\n\n');
        return this.post(serviceName + "/getnearest", request);
    },
    getCoalesce: async function (request) {
        let serviceName = this._getServiceName(request);
        // console.log('------------------' + serviceName + '------------------------------');
        // console.log('GET CALL: ', JSON.stringify(request));
        // console.log('-----------------------------------------------------------------\n\n');
        return this.post(serviceName + "/getcoalesce", request);
    },
    getCombined: async function (request) {
        let serviceName = this._getServiceName(request);

        //Need some better logic to set service name...
        serviceName = serviceName.replace('service', 'appservice');

        // console.log('------------------' + serviceName + '------------------------------');
        // console.log('GET CALL: ', JSON.stringify(request));
        // console.log('-----------------------------------------------------------------\n\n');
        return this.post(serviceName + "/getcombined", request);
    },
    getRelated: async function (request) {
        let serviceName = this._getServiceName(request);

        //Need some better logic to set service name...
        serviceName = serviceName.replace('service', 'appservice');

        // console.log('------------------' + serviceName + '------------------------------');
        // console.log('GET CALL: ', JSON.stringify(request));
        // console.log('-----------------------------------------------------------------\n\n');
        return this.post(serviceName + "/getrelated", request);
    },
    process: async function (request, action) {
        let serviceName = this._getServiceName(request);
        switch (action) {
            case "create":
                // console.log('------------------' + serviceName + '------------------------------');
                // console.log('CREATE CALL: ', JSON.stringify(request));
                // console.log('-----------------------------------------------------------------\n\n');
                return this.post(serviceName + "/create", request);
            case "update":
                // console.log('------------------' + serviceName + '------------------------------');
                // console.log('UPDATE CALL: ', JSON.stringify(request));
                // console.log('-----------------------------------------------------------------\n\n');
                return this.post(serviceName + "/update", request);
            case "delete":
                // console.log('------------------' + serviceName + '------------------------------');
                // console.log('DELETE CALL: ', JSON.stringify(request));
                // console.log('-----------------------------------------------------------------\n\n');
                return this.post(serviceName + "/delete", request);
            }
    },
    _getServiceName: function (request) {
        if (!request) {
            return "NA";
        };

        if (request.dataIndex == "entityData") {
            return "entityservice";
        }
        else if (request.dataIndex == "entityGovernData") {
            return "entitygovernservice";
        }
        else if (request.dataIndex == "entityModel") {
            return "entitymodelservice";
        }
        else if (request.dataIndex == "config") {
            return "configurationservice";
        }
        else if (request.dataIndex == "eventData") {
            return "eventservice";
        }
        else if (request.dataIndex == "requestTracking") {
            return "requesttrackingservice";
        }
        else {
            return "entityservice";
        }
    }
};

module.exports = DataObjectManageService;







