'use strict';

var request = require('request-promise-native');
var rdpConnectionConfig = require("../data/rdp-connection-config.json");

var DPConnection = function (options) {
};

DPConnection.prototype = {
    getBaseUrl: function () {
        return rdpConnectionConfig.baseUrl;
    },
    getRequest: function () {
        return request;
    }
};

module.exports = DPConnection;






