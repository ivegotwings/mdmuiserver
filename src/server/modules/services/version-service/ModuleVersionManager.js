
'use strict';

let stateManager = require('../../common/state-manager/state-manager');

class ModuleVersionManager {

    static get MODULE_VERSION_KEY() {
        return "-runtime-module-version";
    }

    static get DEFAULT_VERSION() {
        return 101;
    }

    static get MODULES() {
        return [
            'entityData',
            'entityModel',
            'config',
            'eventData',
            'entityGovernData'
        ];
    }

    static async initialize() {
        this.MODULES.forEach(async item => {
            let cacheKey = item + this.MODULE_VERSION_KEY;
            let moduleVersion = await stateManager.get(cacheKey);

            if (!moduleVersion) {
                moduleVersion = this.DEFAULT_VERSION;
            }
            //console.log('\n\nInitialize version of ' + item + ': ', moduleVersion);
            await stateManager.set(cacheKey, moduleVersion);
        });
    }

    static async getVersion(module, tenantId) {
        let moduleVersion = await stateManager.get(module + "-" + tenantId + this.MODULE_VERSION_KEY);

        if (!moduleVersion) {
            moduleVersion = this.DEFAULT_VERSION;
            await this.setVersion(module, moduleVersion);
        }

        //console.log('\n\nGet version of '+ module +': ', moduleVersion);
        return moduleVersion;
    }

    static async getAll(tenantId) {
        let keys = this.MODULES.map(v => v = v + "-" + tenantId + this.MODULE_VERSION_KEY);
        let moduleVersionData = {};

        if (keys) {
            let moduleVersions = await stateManager.mget(keys);

            if (moduleVersions) {
                this.MODULES.forEach((item, index) => {
                    moduleVersionData[item] = {
                        "version": moduleVersions[index] ? moduleVersions[index] : this.DEFAULT_VERSION
                    }
                });
            }
        }

        return moduleVersionData;
    }

    static async setVersion(module, version, tenantId) {
        //console.log('\n\nSet version of '+ module +':', version);

        let moduleVersionKey = module + "-" + tenantId + this.MODULE_VERSION_KEY;
        await stateManager.set(moduleVersionKey, version);
        return await 1;
    }
}

module.exports = ModuleVersionManager;
