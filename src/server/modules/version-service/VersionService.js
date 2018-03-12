var DFRestService = require('../common/df-rest-service/DFRestService'),
    RuntimeVersionManager = require('./RuntimeVersionManager');

const logger = require('../common/logger/logger-service');

var VersionService = function (options) {
    DFRestService.call(this, options);
};

VersionService.prototype = {
    updateRuntimeVersion: async function (request) {
        var buildVersion = await RuntimeVersionManager.getBuildVersion();
        var revision = await RuntimeVersionManager.getRevision();
        await RuntimeVersionManager.setVersion(buildVersion, ++revision);
        var newVersion =  "".concat(buildVersion, "-", revision);
        var response = { "newVersion": newVersion };
        logger.info('UI runtime version has been updated to ' + newVersion);
        return response;
    }
};

module.exports = VersionService;

