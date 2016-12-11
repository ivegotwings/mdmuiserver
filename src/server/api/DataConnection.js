'use strict';

var request = require('sync-request');
var rdpApiConfig = require("../data/rdp-api-connection-config.json");

function DataConnection(options) {
}

DataConnection.prototype = {
    getBaseUrl: function(){
        return rdpApiConfig.baseUrl;
    },
    getClient: function(){
        return request;
    }
};

module.exports = DataConnection;






