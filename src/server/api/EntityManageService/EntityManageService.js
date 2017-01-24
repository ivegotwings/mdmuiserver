'use strict';

var DPEntityManageService = require('./DPEntityManageService');
var OfflineEntityManageService = require('./OfflineEntityManageService');

var EntityManageService = function(options) {
    if(options !== undefined && options.runOffline && options.runOffline === "true") {
        return new OfflineEntityManageService(options);
    }
    else {
        return new DPEntityManageService(options);
    }
};

//EntityManageService.prototype.constructor = 
module.exports = EntityManageService;








