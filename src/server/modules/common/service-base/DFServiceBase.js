'use strict';

var DFConnection = require('./DFConnection');
var executionContext = require('../context-manager/execution-context');

var DFServiceBase = function (options) {
    var _dataConnection = new DFConnection();
    this._restRequest = _dataConnection.getRequest();
    this._serverUrl = _dataConnection.getServerUrl();
    this._headers = _dataConnection.getHeaders();

    this.requestJson = async function (url, request) {

        var tenantId = 'ns';

        var securityContext = executionContext.getSecurityContext();

        if(securityContext && securityContext.tenantId) {
            tenantId = securityContext.tenantId;
        }
        
        url = this._serverUrl + '/' + tenantId + '/api' + url ;

        var options = {
            url: url,
            method: "POST",
            headers: this._headers,
            body: request,
            json: true,
            simple: false,
            timeout:2000
        };

        //console.log('RDP call: ', JSON.stringify(options, null, 4));

        var reqPromise = this._restRequest(options)
            .catch(function (errors) {
                var err = {
                            'status': 'error', 
                            'msg': 'RDF request failed due to technical reasons', 
                            'reason': errors
                        };

                console.error('EXCEPTION:', JSON.stringify(err, null, 2));
                return err;
            })
            .catch(function (err) {
                console.error(err); // This will print any error that was thrown in the previous error handler.
            });

        return await reqPromise;
    };

    //console.log('Data platform service instance initiated with ', JSON.stringify({options: options, baseUrl: this.baseUrl}, null, 4));
};

module.exports = DFServiceBase;