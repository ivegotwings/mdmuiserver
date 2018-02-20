
'use strict';

var stateManager = require('../common/state-manager/state-manager');

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
        var revision = await stateManager.get(this.REVISION_KEY);
        if(!revision) {
            revision = this.DEFAULT_REVISION;
        }

        await this.setVersion(buildVersion, revision);
    }

    static async getVersion() {
        var version = await this.getBuildVersion();
        var revison = await this.getRevision();
       
        return "".concat(version ,"-", revison);
    }

    static async getBuildVersion() {
        var version = await stateManager.get(this.VERSION_KEY);
        if(!version) {
            version = this.DEFAULT_BUILD_VERSION;
        }

        return version;
    }

    static async getRevision() {
        var revision = await stateManager.get(this.REVISION_KEY);
        if(!revision) {
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