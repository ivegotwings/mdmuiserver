'use strict';

var DFConnection = require('./DFConnection');
var executionContext = require('../context-manager/execution-context');
var logger = require('../logger/logger-service');

var cryptoJS = require("crypto-js");
var moment = require('moment');
var uuidV1 = require('uuid/v1');

const HTTP_POST = "POST";
const HTTP_GET = "GET";

var DFServiceBase = function (options) {
    var _dataConnection = new DFConnection();
    this._restRequest = _dataConnection.getRequest();
    this._serverUrl = _dataConnection.getServerUrl();
    
    if (options.serverType == 'cop') {
        this._serverUrl = _dataConnection.getCOPServerUrl();
    }

    this._baseHeaders = _dataConnection.getHeaders();
    this._timeout = _dataConnection.getTimeout();

    this.requestJson = async function (serviceName, request, tenant) {
        var timeout = request.timeout || this._timeout;
        var tenantId = tenant;
        if(!tenantId){
            tenantId = this.getTenantId();  
        }  
        var timeStamp = moment().toISOString();

        var url = this._serverUrl + '/' + tenantId + '/api' + serviceName + '?timeStamp=' + timeStamp;

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
        var internalRequestId = logger.logRequest(serviceName, options);
        var _self = this;

        var reqPromise = this._restRequest(options)
            .catch(function (error) {
               logger.logException(internalRequestId, serviceName, options, error);
            })
            .catch(function (err) {
                console.error(err); // This will print any error that was thrown in the previous error handler.
            });

        var result = await reqPromise;

        var isErrorResponse = logger.logError(internalRequestId, serviceName, options, result);

        // console.log("request: -- - - - ", JSON.stringify(options, null, 2));
        // console.log("response: -- - - - ", JSON.stringify(result, null, 2));

        if(!isErrorResponse) {
            logger.logResponseCompletedInfo(internalRequestId, serviceName, hrstart);
        }
        
        logger.logResponse(internalRequestId, serviceName, result);

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

    this.getUserRoles = function () {
        var userRoles = ["vendor"];
        var securityContext = executionContext.getSecurityContext();

        if (securityContext && securityContext.headers && securityContext.headers.userRoles) {
            userRoles = securityContext.headers.userRoles;
        }

        return userRoles;
    };

    this.getUserDefaultRole  = function () {
        var defaultRole = "vendor";
        var securityContext = executionContext.getSecurityContext();

        if (securityContext && securityContext.headers && securityContext.headers.defaultRole) {
            defaultRole = securityContext.headers.defaultRole;
        }

        return defaultRole;
    };

    this.getOwnershipData = function () {
        var ownershipData = "";
        var securityContext = executionContext.getSecurityContext();

        if (securityContext && securityContext.headers && securityContext.headers.ownershipData) {
            ownershipData = securityContext.headers.ownershipData;
        }

        return ownershipData;
    };

    this.getOwnershipEditData = function () {
        var ownershipEditData = "";
        var securityContext = executionContext.getSecurityContext();

        if (securityContext && securityContext.headers && securityContext.headers.ownershipEditData) {
            ownershipEditData = securityContext.headers.ownershipEditData;
        }

        return ownershipEditData;
    };

    this.getTenantId = function () {
        var tenantId = "";
        var securityContext = executionContext.getSecurityContext();

        if (securityContext && securityContext.tenantId) {
            tenantId = securityContext.tenantId;
        }

        return tenantId;
    };

    this._createRequestHeaders = function (url, request) {
        var rdpApiHeaders = {};
        var tenantId = this.getTenantId();
        var userId = 'admin';
        var userRoles = ["vendor"];

        var securityContext = executionContext.getSecurityContext();

        if (securityContext && securityContext.headers && securityContext.headers.userId) {

            var secHeaders = securityContext.headers;
            userId = secHeaders.userId;

            if(secHeaders.userRoles) {
                userRoles = secHeaders.userRoles;
            }

            rdpApiHeaders = {
                "x-rdp-clientid": secHeaders.clientId,
                "x-rdp-tenantId": tenantId,
                "x-rdp-ownershipdata": secHeaders.ownershipData,
                "x-rdp-ownershipeditdata": secHeaders.ownershipEditData,
                "x-rdp-userid": userId.indexOf("_user") < 0 ? userId + "_user" : userId,
                "x-rdp-username": secHeaders.userName,
                "x-rdp-useremail": secHeaders.userEmail,
                "x-rdp-userroles": JSON.stringify(userRoles)
            };  
        }

        if(securityContext) {
            rdpApiHeaders["x-rdp-authtoken"] = cryptoJS.HmacSHA256(url.split('?')[1], securityContext.clientAuthKey).toString(cryptoJS.enc.Base64);
        }
        else {
            console.log('security context not found for the req object ', url, JSON.stringify(request));
        }
        
        return rdpApiHeaders;
    }
};

module.exports = DFServiceBase;