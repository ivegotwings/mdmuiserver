'use strict';

var DPConnection = require('./DPConnection');

var DPServiceBase = function (options) {
    var _dataConnection = new DPConnection();
    this._restRequest = _dataConnection.getRequest();
    this._baseUrl = _dataConnection.getBaseUrl();

    this.requestJson = async function (url, request) {
        url = this._baseUrl + url;

        var options = {
            url: url,
            method: "POST",
            headers: {
                //"Content-type": "application/json",
                "Cache-Control": "no-cache"
            },
            body: request,
            json: true
        };

        return await this._restRequest(options);
    };
    console.log('Data platform service instance initiated with ', JSON.stringify({options: options, baseUrl: this.baseUrl}, null, 4));
};


module.exports = DPServiceBase;