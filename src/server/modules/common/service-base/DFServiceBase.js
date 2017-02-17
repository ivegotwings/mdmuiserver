'use strict';

var DFConnection = require('./DFConnection');
var executionContext = require('../context-manager/execution-context');

var DFServiceBase = function (options) {
    var _dataConnection = new DFConnection();
    this._restRequest = _dataConnection.getRequest();
    this._serverUrl = _dataConnection.getServerUrl();

    this.requestJson = async function (url, request) {

        var tenantId = 't1';

        var securityContext = executionContext.getSecurityContext();

        if(securityContext && securityContext.tenantId) {
            tenantId = securityContext.tenantId;
        }
        
        url = this._serverUrl + '/' + tenantId + '/api' + url ;

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

        //console.log('RDP call: ', JSON.stringify(options, null, 4));

        return await this._restRequest(options);
    };

    console.log('Data platform service instance initiated with ', JSON.stringify({options: options, baseUrl: this.baseUrl}, null, 4));
};

module.exports = DFServiceBase;