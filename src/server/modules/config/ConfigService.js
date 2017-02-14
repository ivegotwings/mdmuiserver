'use strict';

var DFRestService = require('../common/df-rest-service/DFRestService');
var OfflineConfigService = require('./OfflineConfigService');

var ConfigService = function (options) {
    DFRestService.call(this, options);
};

ConfigService.prototype = {
    getConfigs: function(request) {
        var offlineConfigService = new OfflineConfigService();
        return offlineConfigService.getConfigs(request);
    },
    getConfigComponentNames: function(request) {
        var offlineConfigService = new OfflineConfigService();
        return offlineConfigService.getConfigComponentNames(request);
    }
};

//EntityManageService.prototype.constructor = 
module.exports = ConfigService;








