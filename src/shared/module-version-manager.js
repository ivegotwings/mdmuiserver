
'use strict';

class ModuleVersionManager {
    static get DEFAULT_VERSION() {
        return "101";
    }

    static initialize(data) {
        ModuleVersionManager._data = data;
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

var SharedUtils = SharedUtils || {};

if (!SharedUtils) {
    SharedUtils = {};
}

SharedUtils.ModuleVersionManager = ModuleVersionManager;

//register as module or as js 
if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = ModuleVersionManager
    }
    exports.ModuleVersionManager = ModuleVersionManager;
}
