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
    saveEntities: async function (request) {
        var url = '/entityManageService/set';
        return await this.requestJson(url, request);
    }
};

module.exports = DPEntityManageService;







