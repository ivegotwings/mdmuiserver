let DFRestService = require('../../common/df-rest-service/DFRestService'),
    RuntimeVersionManager = require('./RuntimeVersionManager'),
    ModuleVersionManager = require('./ModuleVersionManager');

const logger = require('../../common/logger/logger-service');

let baseConfigService = require('../configuration-service/BaseConfigService');
let configService = require('../configuration-service/ConfigurationService');
let localCacheManager = require('../../local-cache/LocalCacheManager');

let LocalCacheManager = new localCacheManager();

let VersionService = function (options) {
    DFRestService.call(this, options);
};

VersionService.prototype = {
    updateRuntimeVersion: async function (request) {
        let buildVersion = await RuntimeVersionManager.getBuildVersion();
        let revision = await RuntimeVersionManager.getRevision();
        let oldVersion =  "".concat(buildVersion, "-", revision);
        
        LocalCacheManager.del(oldVersion);

        await RuntimeVersionManager.setVersion(buildVersion, ++revision);
        let newVersion =  "".concat(buildVersion, "-", revision);
        let response = { "newVersion": newVersion };
        logger.info('UI runtime version has been updated to ' + newVersion);
        return response;
    },

    updateModuleVersion: async function(module) {
        let moduleVersion = await ModuleVersionManager.getVersion(module);
        await ModuleVersionManager.setVersion(module, ++moduleVersion);
        
        let response = { "newVersion": moduleVersion };
        logger.info(module + ' version has been updated to ' + moduleVersion);
        return response;
    }
};

module.exports = VersionService;

