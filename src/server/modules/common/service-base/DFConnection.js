'use strict';

let request = require('request-promise-native');
let rdfConnectionConfig = require('config').get('modules.dfService');

let DFConnection = function (options) {
};

DFConnection.prototype = {
    getServerUrl: function () {
        return rdfConnectionConfig.serverUrl;
    },
    getCOPServerUrl: function () {
        return rdfConnectionConfig.copServerUrl;
    },
    getInternalRdfUrl: function () {
        return rdfConnectionConfig.internalRdfUrl;
    },
    getHeaders: function () {
        return rdfConnectionConfig.headers;
    },
    getTimeout: function () {
        return rdfConnectionConfig.timeout;
    },
    getRequest: function () {
        return request;
    }
};

module.exports = DFConnection;






