'use strict';

var DFConnection = require('./DFConnection');
var executionContext = require('../context-manager/execution-context');
var cryptoJS = require("crypto-js");
var moment = require('moment');
var notificationConfig = require('../../notification-engine/config');
var uuidV1 = require('uuid/v1');

var DFServiceBase = function (options) {
    var _dataConnection = new DFConnection();
    this._restRequest = _dataConnection.getRequest();
    this._serverUrl = _dataConnection.getServerUrl();
    this._logSettings = _dataConnection.getLogSettings();

    if (options.serverType == 'cop') {
        this._serverUrl = _dataConnection.getCOPServerUrl();
    }

    this._headers = _dataConnection.getHeaders();
    this._timeout - _dataConnection.getTimeout();

    this.requestJson = async function (url, request) {

        var tenantId = 'jcp';
        var userId = 'admin';
        var userRoles = ['vendor'];

        var securityContext = executionContext.getSecurityContext();

        if (securityContext && securityContext.tenantId) {
            tenantId = securityContext.tenantId;
            userId = securityContext.headers.userId;
            if(securityContext.headers.userRoles){
                userRoles = securityContext.headers.userRoles.split(',');
            }
            if (securityContext.headers) {
                this._headers["x-rdp-clientid"] = securityContext.headers.clientId || "";
                this._headers["x-rdp-tenantid"] = tenantId;
                this._headers["x-rdp-ownershipdata"] = securityContext.headers.ownershipData || "";
                this._headers["x-rdp-userid"] = userId.indexOf("_user") < 0 ? userId + "_user" : userId;
                this._headers["x-rdp-username"] = securityContext.headers.userName || "";
                this._headers["x-rdp-useremail"] = securityContext.headers.userEmail || "";
                this._headers["x-rdp-userroles"] =  JSON.stringify(userRoles);
            }
        }

        var timeStamp = moment().toISOString();

        //console.log(JSON.stringify(request));

        url = this._serverUrl + '/' + tenantId + '/api' + url + '?timeStamp=' + timeStamp;
        this._headers["x-rdp-authtoken"] = cryptoJS.HmacSHA256(url.split('?')[1], securityContext.clientAuthKey).toString(cryptoJS.enc.Base64);

        var options = {
            url: url,
            method: "POST",
            headers: this._headers,
            body: request,
            json: true,
            simple: false,
            timeout: this._timeout
        };

        //var hrstart = process.hrtime();

        var logSettings = this._logSettings;
        var logServiceNames = Object.keys(logSettings);
        var internalRequestId = '';

        for (var logServiceName of logServiceNames) {
            var serviceLogSetting = logSettings[logServiceName];

            if((serviceLogSetting == "trace-request" || serviceLogSetting == "trace-all") && url.indexOf(logServiceName) > 0) {
                internalRequestId = uuidV1();
                console.log('-------------------------------------------------------------------------------------------------\n');
                console.log('service: ', logServiceName);
                console.log('timestamp: ', Date.now());
                console.log('request id:', internalRequestId);
                console.log('request: ', JSON.stringify(options, null, 2));
                console.log('-----------------------------------------------------------------------------------------------\n\n');
            }
        }

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

        var result = await reqPromise;

        var isErrorResponse = false;

        //check if response object has error status
        if(result && result.response && result.response.status) {
            var resStatus = result.response.status;
            if(resStatus && resStatus == "error") {
                isErrorResponse = true;
            }
        }

        //check if generic failure happend in RDF layer
        if(!isErrorResponse && result && result.dataObjectOperationResponse && result.dataObjectOperationResponse.status) {
            var resStatus = result.dataObjectOperationResponse.status;
            if(resStatus && resStatus == "error") {
                isErrorResponse = true;
            }
        }

        if(isErrorResponse) {
            console.log('\n\n');
            var errorJson = {};
            errorJson.status = "ERROR";
            errorJson.service = logServiceName;
            errorJson.timeStamp = Date.now();
            errorJson.internalRequestId = internalRequestId;
            errorJson.request = request;
            errorJson.respone = result;
            console.error(JSON.stringify(errorJson));
            console.log('\n');
        }
            
        if(!isErrorResponse) {
            for (var logServiceName of logServiceNames) {
                var serviceLogSetting = logSettings[logServiceName];
                if((serviceLogSetting == "trace-response" || serviceLogSetting == "trace-all") && url.indexOf(logServiceName) > 0) {
                    console.log('-------------------------------------------------------------------------------------------------\n');
                    console.log('service: ', logServiceName);
                    console.log('timestamp: ', Date.now());
                    console.log('request id:', internalRequestId);
                    console.log('response: ', JSON.stringify(result, null, 2));
                    console.log('-----------------------------------------------------------------------------------------------\n\n');
                }
            }
        }

        return result;
    };

    //console.log('Data platform service instance initiated with ', JSON.stringify({options: options, baseUrl: this.baseUrl}, null, 4));
};

module.exports = DFServiceBase;