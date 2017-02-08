'use strict';

var DPServiceBase = require('../DPServiceBase');

var DPDataObjectManageService = function (options) {
    DPServiceBase.call(this, options);
};

DPDataObjectManageService.prototype = {
    get: async function (request) {
        var url = '/entityManageService/get';
        return await this.requestJson(url, request);
    },
    create: async function (request) {
        var url = '/entityManageService/create';
        return await this.requestJson(url, request);
    },
    update: async function (request) {
        var url = '/entityManageService/update';
        return await this.requestJson(url, request);
    },
    deleteDataObjects: async function (request) {
        var url = '/entityManageService/delete';
        return await this.requestJson(url, request);
    }
};

module.exports = DPDataObjectManageService;







