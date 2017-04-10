'use strict';

var DFConnection = require('./DFConnection');
var executionContext = require('../context-manager/execution-context');
var randomId = require('../utils/getRandomId');
var isEmpty = require('../utils/isEmpty');
var cryptoJS = require("crypto-js");
var moment = require('moment');

var DFServiceBase = function (options) {
    var _dataConnection = new DFConnection();
    this._restRequest = _dataConnection.getRequest();
    this._serverUrl = _dataConnection.getServerUrl();
    if (options.serverType == 'cop') {
        this._serverUrl = _dataConnection.getCOPServerUrl();
    }
    this._headers = _dataConnection.getHeaders();
    this._timeout - _dataConnection.getTimeout();

    this.requestJson = async function (url, request) {

        var tenantId = 'jcp';
        var userId = 'admin';

        var securityContext = executionContext.getSecurityContext();

        if (securityContext && securityContext.tenantId) {
            tenantId = securityContext.tenantId;
            userId = securityContext.headers.userId;

            if (securityContext.headers) {
                this._headers["x-rdp-clientId"] = securityContext.headers.clientId || "";
                this._headers["x-rdp-tenantId"] = tenantId;
                this._headers["x-rdp-vendorName"] = securityContext.headers.vendorName || "";
                this._headers["x-rdp-userId"] = securityContext.headers.userId || "";
                this._headers["x-rdp-userName"] = securityContext.headers.userName || "";
                this._headers["x-rdp-userEmail"] = securityContext.headers.userEmail || "";
                this._headers["x-rdp-userRoles"] = '["vendor", "buyer"]';
            }
        }

        var timeStamp = moment().toISOString();
        
        //TODO:: This will be enhanced based on need.
        //Below function will update clientState in request Object with required info in notification object.
        updateRequestObjectForNotification(request, userId, url, timeStamp);
        console.log(JSON.stringify(request));

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

function updateRequestObjectForNotification(request, userId, url, timeStamp) {
    if (request) {
        if (isEmpty(request.clientState)) {
            request.clientState = {};
            request.clientState.notificationInfo = {};
        } else if (isEmpty(request.clientState.notificationInfo)) {
            request.clientState.notificationInfo = {};
        }

        var notificationInfo = request.clientState.notificationInfo;

        notificationInfo.id = randomId();
        notificationInfo.timeStamp = timeStamp;
        //notificationInfo.description = "";
        notificationInfo.source = "ui"; //rdp/cop/ui
        notificationInfo.userId = userId;
        notificationInfo.connectionId = "";

        if (isEmpty(notificationInfo.context)) {
            notificationInfo.context = {};
        }

        if (request.entity) {
            notificationInfo.context.id = request.entity.id;
            notificationInfo.context.type = request.entity.type;
        } else if(request.params) {
            notificationInfo.context.id = request.params.query.id;
            notificationInfo.context.type = request.params.query.filters.typesCriterion[0];
        }

        notificationInfo.context.dataIndex = request.dataIndex;
    }
}

module.exports = DFServiceBase;