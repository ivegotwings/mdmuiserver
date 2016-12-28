'use strict';

var DPServiceBase = require('../DPServiceBase');

var DPEntityManageService = function (options) {
    DPServiceBase.call(this, options);
};

DPEntityManageService.prototype = {
    getEntities: async function (request) {
        var url = '/entityManageService/get';
        return await this.requestJson(url, request);
    },
    createEntities: async function (request) {
        var url = '/entityManageService/create';
        return await this.requestJson(url, request);
    },
    updateEntities: async function (request) {
        var url = '/entityManageService/update';
        return await this.requestJson(url, request);
    },
    deleteEntities: async function (request) {
        var url = '/entityManageService/delete';
        return await this.requestJson(url, request);
    }
};

module.exports = DPEntityManageService;







