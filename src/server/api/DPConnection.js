'use strict';

var request = require('sync-request');
var rdpConnectionConfig = require("../data/rdp-connection-config.json");

var DPConnection = function(options) {
};

DPConnection.prototype = {
    getBaseUrl: function(){
        return rdpConnectionConfig.baseUrl;
    },
    getClient: function(){
        return request;
    }
};

module.exports = DPConnection;






