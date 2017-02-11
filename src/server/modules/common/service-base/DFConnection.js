'use strict';

var request = require('request-promise-native');
var rdpConnectionConfig = require("../../../config/rdp-connection-config.json");

var DFConnection = function (options) {
};

DFConnection.prototype = {
    getBaseUrl: function () {
        return rdpConnectionConfig.baseUrl;
    },
    getRequest: function () {
        return request;
    }
};

module.exports = DFConnection;






