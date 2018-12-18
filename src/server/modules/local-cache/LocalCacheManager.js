let RuntimeVersionManager = require('../services/version-service/RuntimeVersionManager');
let falcorUtil = require('../../../shared/dataobject-falcor-util');
let isEmpty = require('../common/utils/isEmpty');
let localCache = {};

let LocalCacheManager = function () {

}

LocalCacheManager.prototype = {
    get: async function (cacheKey) {
        let runtimeVersion = await RuntimeVersionManager.getVersion();

        if (localCache[runtimeVersion] && localCache[runtimeVersion][cacheKey]) {
            return falcorUtil.cloneObject(localCache[runtimeVersion][cacheKey]);
        }
        return "";
    },

    set: async function (cacheKey, value) {
        if (!isEmpty(cacheKey) && typeof value != 'undefined') {
            let runtimeVersion = await RuntimeVersionManager.getVersion();
            isEmpty(localCache[runtimeVersion]) && (localCache[runtimeVersion] = {});
            localCache[runtimeVersion][cacheKey] = falcorUtil.cloneObject(value);
        }
    },

    del: function (version) {
        localCache[version] && (delete localCache[version]);
    },

    delByCacheKeyAndId: async function (cacheKey, id) {
        if (!isEmpty(cacheKey) && !isEmpty(id)) {
            let runtimeVersion = await RuntimeVersionManager.getVersion();
            let LC = !isEmpty(localCache[runtimeVersion]) ? localCache[runtimeVersion] : "";

            if (!isEmpty(LC) && !isEmpty(LC[cacheKey])) {
                delete LC[cacheKey][id];
            }
        }
    },

    delByCacheKey: async function (cacheKey) {
        if (!isEmpty(cacheKey)) {
            let runtimeVersion = await RuntimeVersionManager.getVersion();
            let LC = !isEmpty(localCache[runtimeVersion]) ? localCache[runtimeVersion] : "";

            if (!isEmpty(LC) && !isEmpty(LC[cacheKey])) {
                delete LC[cacheKey]
            }
        }
    }
};

module.exports = LocalCacheManager;