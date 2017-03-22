'use strict';

var request = require('request-promise-native');
var rdfConnectionConfig = require("../../../config/rdf-connection-config.json");

var DFConnection = function (options) {
};

DFConnection.prototype = {
    getServerUrl: function () {
        return rdfConnectionConfig.serverUrl;
    },
    getCOPServerUrl: function () {
        return rdfConnectionConfig.copServerUrl;
    },
    getHeaders: function () {
        return rdfConnectionConfig.headers;
    },
    getRequest: function () {
        return request;
    }
};

module.exports = DFConnection;






