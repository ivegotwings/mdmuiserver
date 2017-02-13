'use strict';

var DFRestService = require('../common/df-rest-service/DFRestService');

var ConfigService = function (options) {
    DFRestService.call(this, options);
};

ConfigService.prototype = {
    getConfigs: async function (request) {
        return this.post("configservice/get", request);
    }
};

module.exports = ConfigService;