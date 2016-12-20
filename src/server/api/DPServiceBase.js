'use strict';

var DPConnection = require('./DPConnection');

var DPServiceBase = function(options) {
        var _dataConnection = new DPConnection();
        this.client = _dataConnection.getClient(); 
        this.baseUrl = _dataConnection.getBaseUrl();

        //console.log('Data platform service instance initiated with settings', JSON.stringify({options: options, baseUrl: this.baseUrl}, null, 4));
};

module.exports = DPServiceBase;







