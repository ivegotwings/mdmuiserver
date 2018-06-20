
'use strict';

var stateManager = require('../../common/state-manager/state-manager');
var logger = require('../../common/logger/logger-service');
var CURRENT_BUILD_VERSION;

class RuntimeVersionManager {
    static get REVISION_KEY() {
        return "runtime-build-version-revision-number";
    }

    static get VERSION_KEY() {
        return "runtime-build-version";
    }

    static get DEFAULT_REVISION() {
        return "1";
    }

    static get DEFAULT_BUILD_VERSION() {
        return "1.0.0";
    }

    static async initialize(buildVersion) {
        CURRENT_BUILD_VERSION = buildVersion;
        var revision = await stateManager.get(this.REVISION_KEY);
        if (!revision) {
            revision = this.DEFAULT_REVISION;
        }

        await this.setVersion(buildVersion, revision);
    }

    static async getVersion() {
        var version = await this.getBuildVersion();
        var revison = await this.getRevision();

        return "".concat(version, "-", revison);
    }

    static async getBuildVersion() {
        var version = await stateManager.get(this.VERSION_KEY);
        logger.debug("SYS_BUILD_VERSION", { buildVersion: version }, "version-service");
        if (!version) {
            logger.debug("SYS_CURRENT_BUILD_VERSION", { currentBuildVersion: CURRENT_BUILD_VERSION }, "version-service");
            if (CURRENT_BUILD_VERSION) {
                await this.initialize(CURRENT_BUILD_VERSION);
                version = await stateManager.get(this.VERSION_KEY);
            }
            
            !version && (version = this.DEFAULT_BUILD_VERSION);
        }

        return version;
    }

    static async getRevision() {
        var revision = await stateManager.get(this.REVISION_KEY);
        if (!revision) {
            revision = this.DEFAULT_REVISION;
        }

        return revision;
    }

    static async setVersion(buildVersion, revision) {
        await stateManager.set(this.VERSION_KEY, buildVersion);
        await stateManager.set(this.REVISION_KEY, revision);
        return await 1;
    }
}

module.exports = RuntimeVersionManager;