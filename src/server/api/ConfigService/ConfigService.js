'use strict';

var DPConfigService = require('./DPConfigService');
var OfflineConfigService = require('./OfflineConfigService');

var ConfigService = function(options) {
    if(options !== undefined && options.mode == "dev-offline"){
        return new OfflineConfigService(options);
    }
    else{
        return new DPConfigService(options);
    }
};

//EntityManageService.prototype.constructor = 
module.exports = ConfigService;








