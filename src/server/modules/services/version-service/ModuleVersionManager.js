
'use strict';

class ModuleVersionManager {
    static get DEFAULT_VERSION() {
        return "101";
    }

    static get DEFAULTS() {
        var defaultVer = this.DEFAULT_VERSION;
        var timestamp = Date.now();
        return {
            'entityData': {'version': defaultVer, 'timestamp': timestamp},
            'entityModel': {'version': defaultVer, 'timestamp': timestamp},
            'config': {'version': defaultVer, 'timestamp': timestamp},
            'eventData': {'version': defaultVer, 'timestamp': timestamp},
            'entityGovernData': {'version': defaultVer, 'timestamp': timestamp}
        };
    }
    
    static initialize() {
        ModuleVersionManager._data = this.DEFAULTS;
    }

    static getVersion(module) {
        if (!ModuleVersionManager._data[module]) {
            this.setVersion(module, this.DEFAULT_VERSION);
        }

        return ModuleVersionManager._data[module] ? ModuleVersionManager._data[module].version : undefined;
    }

    static getAll () {
        return ModuleVersionManager._data;
    }

    static setVersion(module, version) {
        ModuleVersionManager._data[module] = {
            version: version,
            timestamp: (Date.now() / 1000 | 0)
        }
    }
}

module.exports = ModuleVersionManager;
  