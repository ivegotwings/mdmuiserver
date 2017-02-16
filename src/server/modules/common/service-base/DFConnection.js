'use strict';

var request = require('request-promise-native');
var rdfConnectionConfig = require("../../../config/rdf-connection-config.json");

var DFConnection = function (options) {
};

DFConnection.prototype = {
    getServerUrl: function () {
        return rdfConnectionConfig.serverUrl;
    },
    getRequest: function () {
        return request;
    }
};

module.exports = DFConnection;






