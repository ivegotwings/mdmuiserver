var DFRestService = require('../common/df-rest-service/DFRestService'),
    RuntimeVersionManager = require('./RuntimeVersionManager');

const logger = require('../common/logger/logger-service');

var baseConfigService = require('./../dataobject/BaseConfigService');
var configService = require('./../dataobject/ConfigurationService');
let localCacheManager = require('../local-cache/LocalCacheManager');

let LocalCacheManager = new localCacheManager();

var VersionService = function (options) {
    DFRestService.call(this, options);
};

VersionService.prototype = {
    updateRuntimeVersion: async function (request) {
        var buildVersion = await RuntimeVersionManager.getBuildVersion();
        var revision = await RuntimeVersionManager.getRevision();
        var oldVersion =  "".concat(buildVersion, "-", revision);
        
        LocalCacheManager.del(oldVersion);

        await RuntimeVersionManager.setVersion(buildVersion, ++revision);
        var newVersion =  "".concat(buildVersion, "-", revision);
        var response = { "newVersion": newVersion };
        logger.info('UI runtime version has been updated to ' + newVersion);
        return response;
    }
};

module.exports = VersionService;

