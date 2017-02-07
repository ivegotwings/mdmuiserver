'use strict';

var DPDataObjectManageService = require('./DPDataObjectManageService');
var OfflineDataObjectManageService = require('./OfflineDataObjectManageService');

var DataObjectManageService = function(options) {
    if(options !== undefined && options.runOffline && options.runOffline === "true") {
        return new OfflineDataObjectManageService(options);
    }
    else {
        return new DPDataObjectManageService(options);
    }
};

module.exports = DataObjectManageService;








