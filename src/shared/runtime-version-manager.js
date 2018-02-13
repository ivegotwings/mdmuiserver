
'use strict';

class RuntimeVersionManager {
    static get DEFAULT_VERSION() {
        return "1.0.0-1";
    }

    static getVersion() {
        return RuntimeVersionManager._version ? RuntimeVersionManager._version : this.DEFAULT_VERSION;
    }

    static setVersion(version) {
        RuntimeVersionManager._version = version;
        RuntimeVersionManager.timestamp = (Date.now() / 1000 | 0);
    }
}

var SharedUtils = SharedUtils || {};

if (!SharedUtils) {
    SharedUtils = {};
}

SharedUtils.RuntimeVersionManager = RuntimeVersionManager;

//register as module or as js 
if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = RuntimeVersionManager
    }
    exports.RuntimeVersionManager = RuntimeVersionManager;
}
