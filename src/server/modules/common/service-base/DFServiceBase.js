'use strict';

var DFConnection = require('./DFConnection');
var executionContext = require('../context-manager/execution-context');
var logger = require("../logger/logger-service");

var cryptoJS = require("crypto-js");
var moment = require('moment');
var uuidV1 = require('uuid/v1');

const HTTP_POST = "POST";
const HTTP_GET = "GET";

var DFServiceBase = function (options) {
    var _dataConnection = new DFConnection();
    this._restRequest = _dataConnection.getRequest();
    this._serverUrl = _dataConnection.getServerUrl();
    this._logSettings = _dataConnection.getLogSettings();
    this._logServiceNames = Object.keys(this._logSettings);

    if (options.serverType == 'cop') {
        this._serverUrl = _dataConnection.getCOPServerUrl();
    }

    this._baseHeaders = _dataConnection.getHeaders();
    this._timeout = _dataConnection.getTimeout();

    this.requestJson = async function (url, request) {
        var timeout = request.timeout || this._timeout;

        var tenantId = this._getTenantId();        
        var timeStamp = moment().toISOString();
        url = this._serverUrl + '/' + tenantId + '/api' + url + '?timeStamp=' + timeStamp;

        var headers = this._createRequestHeaders(url, request);

        for(var key in this._baseHeaders) {
            var val = this._baseHeaders[key];
            headers[key] = val;
        }
       
        var options = {
            url: url,
            method: HTTP_POST,
            headers: headers,
            body: request,
            json: true,
            simple: false,
            timeout: timeout,
            gzip: true
        };

        var hrstart = process.hrtime();
        var internalRequestId = this._logRequest(url, options);
        var _self = this;

        var reqPromise = this._restRequest(options)
            .catch(function (error) {
               _self._logException(internalRequestId, url, options, error);
            })
            .catch(function (err) {
                console.error(err); // This will print any error that was thrown in the previous error handler.
            });

        var result = await reqPromise;

        var isErrorResponse = this._logError(internalRequestId, url, options, result);

        if(!isErrorResponse) {
            this._logResponse(internalRequestId, url, options, result, hrstart);
        }

        return result;
    };

    this.getUserName = function () {
        var userName = "admin";
        var securityContext = executionContext.getSecurityContext();

        if (securityContext && securityContext.headers && securityContext.headers.userName) {
            userName = securityContext.headers.userName;
        }

        return userName;
    };

    this.getUserRole = function () {
        var userRole = "vendor";
        var securityContext = executionContext.getSecurityContext();

        if (securityContext && securityContext.headers && securityContext.headers.userRoles) {
            userRole = securityContext.headers.userRoles.split(',')[0];
        }

        return userRole;
    };

    this.getOwnershipData = function () {
        var ownershipData = "";
        var securityContext = executionContext.getSecurityContext();

        if (securityContext && securityContext.headers && securityContext.headers.ownershipData) {
            ownershipData = securityContext.headers.ownershipData;
        }

        return ownershipData;
    };

    this._getTenantId = function () {
        var tenantId = "";
        var securityContext = executionContext.getSecurityContext();

        if (securityContext && securityContext.tenantId) {
            tenantId = securityContext.tenantId;
        }

        return tenantId;
    };

    this._createRequestHeaders = function (url, request) {
        var headers = {};
        var tenantId = this._getTenantId();
        var userId = 'admin';
        var userRoles = ['vendor'];

        var securityContext = executionContext.getSecurityContext();

        if (securityContext && securityContext.headers && securityContext.headers.userId) {
            userId = securityContext.headers.userId;
            if(securityContext.headers.userRoles){
                userRoles = securityContext.headers.userRoles.split(',');
            }

            if (securityContext.headers) {
                headers["x-rdp-clientid"] = securityContext.headers.clientId || "";
                headers["x-rdp-tenantid"] = tenantId;
                headers["x-rdp-ownershipdata"] = securityContext.headers.ownershipData || "";
                headers["x-rdp-userid"] = userId.indexOf("_user") < 0 ? userId + "_user" : userId;
                headers["x-rdp-username"] = securityContext.headers.userName || "";
                headers["x-rdp-useremail"] = securityContext.headers.userEmail || "";
                headers["x-rdp-userroles"] =  JSON.stringify(userRoles);
            }
        }

        headers["x-rdp-authtoken"] = cryptoJS.HmacSHA256(url.split('?')[1], securityContext.clientAuthKey).toString(cryptoJS.enc.Base64);
        return headers;
    }

    this._logRequest = function(url, options) {
        var internalRequestId = "";

        for (var logServiceName of this._logServiceNames) {
            var serviceLogSetting = this._logSettings[logServiceName];
            if((serviceLogSetting == "trace-request" || serviceLogSetting == "trace-all") && url.indexOf(logServiceName) > 0) {
                internalRequestId = uuidV1();
                var requestLog = {
                    "req": {
                        "type": "RDF_REQUEST",
                        "service": url,
                        "requestId": internalRequestId,
                        "request": JSON.stringify(options)
                    }
                };

                //console.log('\n\n', JSON.stringify(requestLog));
                logger.info('RDF request', requestLog);
            }
        }

        return internalRequestId;
    }

    this._logError = function (internalRequestId, url, options, result) {
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
            var errorJson = {
                "err": {
                    "type": "RDF_ERROR",
                    "service": url,
                    "requestId": internalRequestId,
                    "request": options,
                    "response": result,
                }
            };

            logger.error('RDF error', errorJson);
        }

        return isErrorResponse;
    }

    this._logException = function (internalRequestId, url, options, error) {
        var exceptionJson = {
            "exception": {
                "type": "RDF_CALL_EXCEPTION",
                "service": url,
                "detail": error,
                "requestId": internalRequestId,
                "request": options
            }
        };

        logger.fatal('RDF exception', exceptionJson);
    }

    this._logResponse = function(internalRequestId, url, options, result, hrstart) {
        for (var logServiceName of this._logServiceNames) {
            var serviceLogSetting = this._logSettings[logServiceName];
            if((serviceLogSetting == "trace-response" || serviceLogSetting == "trace-all") && url.indexOf(logServiceName) > 0) {
                var hrend = process.hrtime(hrstart);
                var taken = hrend[1]/1000000;
                var responseLog = {
                    "res": {
                        "type": "RDF_RESPONSE",
                        "service": url,
                        "taken": taken,
                        "requestId": internalRequestId,
                        "response": JSON.stringify(result)
                    }
                };

                logger.info('RDF response', responseLog);
            }
        }
    }

    //console.log('Data platform service instance initiated with ', JSON.stringify({options: options, baseUrl: this.baseUrl}, null, 4));
};

module.exports = DFServiceBase;