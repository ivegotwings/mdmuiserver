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
                this._headers["x-rdp-vendorname"] = securityContext.headers.vendorName || "";
                this._headers["x-rdp-ownershipdata"] = securityContext.headers.ownershipData || "";
                this._headers["x-rdp-userid"] = userId || "";
                this._headers["x-rdp-username"] = securityContext.headers.userName || "";
                this._headers["x-rdp-useremail"] = securityContext.headers.userEmail || "";
                this._headers["x-rdp-userroles"] =  JSON.stringify(userRoles);
            }
        }

        var timeStamp = moment().toISOString();
        
        
        //Below function will update clientState in request Object with required info in notification object.
        updateRequestObjectForNotification(request, userId, timeStamp);
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

function updateRequestObjectForNotification(request, userId, timeStamp) {
    if (request && request.clientState) {
        if (!isEmpty(request.clientState)) {
            var notificationInfo = request.clientState.notificationInfo;
            if (!isEmpty(notificationInfo)) {  
                notificationInfo.id = randomId();
                notificationInfo.timeStamp = timeStamp;
                notificationInfo.source = "ui";
                notificationInfo.userId = userId;
                notificationInfo.connectionId = "";

                if (isEmpty(notificationInfo.context)) {
                    notificationInfo.context = {};
                }
                
                if (request.entity) {
                    notificationInfo.context.id = request.entity.id;
                    notificationInfo.context.type = request.entity.type;
                }
                
                notificationInfo.context.dataIndex = request.dataIndex;
            }
        }
    }
};

module.exports = DFServiceBase;