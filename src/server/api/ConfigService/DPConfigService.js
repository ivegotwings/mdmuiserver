'use strict';

var DPServiceBase = require('../DPServiceBase');

var DPConfigService = function (options) {
    DPServiceBase.call(this, options);
};

DPConfigService.prototype = {
    getConfigs: async function (request) {
        throw "DPConfigService.getConfigs is not implemented";
    }
};

module.exports = DPConfigService;







