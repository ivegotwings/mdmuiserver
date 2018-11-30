'use strict';

let DFConnection = require('./DFConnection');
let executionContext = require('../context-manager/execution-context');
let logger = require('../logger/logger-service');

let cryptoJS = require("crypto-js");
let moment = require('moment');
let uuidV1 = require('uuid/v1');
let sleep = require('system-sleep');

const HTTP_POST = "POST";
const HTTP_GET = "GET";

let DFServiceBase = function (options) {
    let _dataConnection = new DFConnection();
    this._restRequest = _dataConnection.getRequest();
    this._serverUrl = _dataConnection.getServerUrl();

    if (options.serverType == 'cop') {
        this._serverUrl = _dataConnection.getCOPServerUrl();
    }

    this._baseHeaders = _dataConnection.getHeaders();
    this._timeout = _dataConnection.getTimeout();

    this.requestJson = async function (serviceName, request, tenant) {
        let timeout = request.timeout || this._timeout;
        let tenantId = tenant;
        if (!tenantId) {
            tenantId = this.getTenantId();
        }
        let timeStamp = moment().toISOString();

        let url = this._serverUrl + '/' + tenantId + '/api' + serviceName + '?timeStamp=' + timeStamp;

        //console.log('request ', JSON.stringify(request));
        let headers = this._createRequestHeaders(url, request);

        for (let key in this._baseHeaders) {
            let val = this._baseHeaders[key];
            headers[key] = val;
        }

        let options = {
            url: url,
            method: HTTP_POST,
            headers: headers,
            body: request,
            json: true,
            simple: false,
            timeout: timeout,
            gzip: true,
            resolveWithFullResponse: true
        };

        let hrstart = process.hrtime();
        let internalRequestId = logger.logRequest(serviceName, options);
        let _self = this;

        let reqPromise = this._restRequest(options)
            .catch(function (error) {
                logger.logException(internalRequestId, serviceName, options, error);
            })
            .catch(function (err) {
                console.error(err); // This will print any error that was thrown in the previous error handler.
            });

        let result = await reqPromise;

        if (result) {
            if (result.statusCode && result.statusCode === 503) {
                result.body = result.body || {
                    response: {}
                };
                result.body.response = result.body.response || {};
                result.body.response.status = 'error';
                result.body.response.statusDetail = {};
                result.body.response.statusDetail.message = 'Server is busy, please try after some time.'
            }
            result = result.body;
        } else {
            console.log('Result in service base is undefined for request ', JSON.stringify(options));
        }

        let isErrorResponse = logger.logError(internalRequestId, serviceName, options, result);

        if (!isErrorResponse) {
            logger.logResponseCompletedInfo(internalRequestId, serviceName, hrstart);
        }

        logger.logResponse(internalRequestId, serviceName, result);

        return result;
    };

    this.getUserName = function () {
        let userName = "admin";
        let securityContext = executionContext.getSecurityContext();

        if (securityContext && securityContext.headers && securityContext.headers.userName) {
            userName = securityContext.headers.userName;
        }

        return userName;
    };

    this.getUserRoles = function () {
        let userRoles = ["vendor"];
        let securityContext = executionContext.getSecurityContext();

        if (securityContext && securityContext.headers && securityContext.headers.userRoles) {
            userRoles = securityContext.headers.userRoles;
        }

        return userRoles;
    };

    this.getUserDefaultRole = function () {
        let defaultRole = "vendor";
        let securityContext = executionContext.getSecurityContext();

        if (securityContext && securityContext.headers && securityContext.headers.defaultRole) {
            defaultRole = securityContext.headers.defaultRole;
        }

        return defaultRole;
    };

    this.getOwnershipData = function () {
        let ownershipData = "";
        let securityContext = executionContext.getSecurityContext();

        if (securityContext && securityContext.headers && securityContext.headers.ownershipData) {
            ownershipData = securityContext.headers.ownershipData;
        }

        return ownershipData;
    };

    this.getOwnershipEditData = function () {
        let ownershipEditData = "";
        let securityContext = executionContext.getSecurityContext();

        if (securityContext && securityContext.headers && securityContext.headers.ownershipEditData) {
            ownershipEditData = securityContext.headers.ownershipEditData;
        }

        return ownershipEditData;
    };

    this.getTenantId = function () {
        let tenantId = "";
        let securityContext = executionContext.getSecurityContext();

        if (securityContext && securityContext.tenantId) {
            tenantId = securityContext.tenantId;
        }

        return tenantId;
    };

    this._createRequestHeaders = function (url, request) {
        let rdpApiHeaders = {};
        let tenantId = this.getTenantId();
        let userId = 'admin';
        let userRoles = ["vendor"];

        let securityContext = executionContext.getSecurityContext();

        if (securityContext && securityContext.headers && securityContext.headers.userId) {

            let secHeaders = securityContext.headers;
            userId = secHeaders.userId;

            if (secHeaders.userRoles) {
                userRoles = secHeaders.userRoles;
            }

            rdpApiHeaders = {
                "x-rdp-clientid": secHeaders.clientId || "",
                "x-rdp-tenantId": tenantId,
                "x-rdp-ownershipdata": secHeaders.ownershipData || "",
                "x-rdp-ownershipeditdata": secHeaders.ownershipEditData || "",
                "x-rdp-userid": userId.indexOf("_user") < 0 ? userId + "_user" : userId,
                "x-rdp-username": secHeaders.userName || "",
                "x-rdp-useremail": secHeaders.userEmail || "",
                "x-rdp-userroles": JSON.stringify(userRoles),
                "x-rdp-defaultrole": secHeaders.defaultRole || ""
            };
        }

        if (securityContext) {
            rdpApiHeaders["x-rdp-authtoken"] = cryptoJS.HmacSHA256(url.split('?')[1], securityContext.clientAuthKey).toString(cryptoJS.enc.Base64);
        } else {
            console.log('security context not found for the req object ', url, JSON.stringify(request));
        }

        return rdpApiHeaders;
    }
};

module.exports = DFServiceBase;
