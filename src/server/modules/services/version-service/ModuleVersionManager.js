
'use strict';

let stateManager = require('../../common/state-manager/state-manager');

class ModuleVersionManager {

    static get MODULE_VERSION_KEY() {
        return "-runtime-module-version";
    }

    static get DEFAULT_VERSION() {
        return "101";
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
        ModuleVersionManager._data = {};
        let timestamp = Date.now();
        
        this.MODULES.forEach(async item => {
            let cacheKey = item + this.MODULE_VERSION_KEY;
            let moduleVersion = await stateManager.get(cacheKey);

            if(!moduleVersion) {
                moduleVersion = this.DEFAULT_VERSION;
            }

            ModuleVersionManager._data[module] = {
                'version': moduleVersion,
                'timestamp': timestamp
            }

            await stateManager.set(cacheKey, moduleVersion);
        });
    }

    static async getVersion(module) {
        let moduleVersion = await stateManager.get(module + this.MODULE_VERSION_KEY);

        if (!moduleVersion) {
            if (!ModuleVersionManager._data[module]) {
                await this.setVersion(module, this.DEFAULT_VERSION);
            }

            moduleVersion = ModuleVersionManager._data[module] ? ModuleVersionManager._data[module].version : undefined;
        }

        return moduleVersion;
    }

    static getAll() {
        return ModuleVersionManager._data;
    }

    static async setVersion(module, version) {
        ModuleVersionManager._data[module] = {
            version: version,
            timestamp: (Date.now() / 1000 | 0)
        }

        let moduleVersionKey = module + this.MODULE_VERSION_KEY;
        await stateManager.set(moduleVersionKey, version);
        return await 1;
    }
}

module.exports = ModuleVersionManager;
