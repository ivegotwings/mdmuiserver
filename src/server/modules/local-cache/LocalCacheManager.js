let RuntimeVersionManager = require('../services/version-service/RuntimeVersionManager');
let isEmpty = require('../common/utils/isEmpty');
let localCache = {};

let LocalCacheManager = function () {

}

LocalCacheManager.prototype = {
    get: async function (cacheKey) {
        var runtimeVersion = await RuntimeVersionManager.getVersion();
        return localCache[runtimeVersion] ? localCache[runtimeVersion][cacheKey] : "";
    },

    set: async function (cacheKey, value) {
        var runtimeVersion = await RuntimeVersionManager.getVersion();
        isEmpty(localCache[runtimeVersion]) && (localCache[runtimeVersion] = {});
        localCache[runtimeVersion][cacheKey] = value;
    },

    del: function (version) {
        localCache[version] && (delete localCache[version]);
    },

    delByCacheKeyAndId: async function (cacheKey, id) {
        if (!isEmpty(cacheKey) && !isEmpty(id)) {
            var runtimeVersion = await RuntimeVersionManager.getVersion();
            let LC = !isEmpty(localCache[runtimeVersion]) ? localCache[runtimeVersion] : "";

            if (!isEmpty(LC) && !isEmpty(LC[cacheKey])) {
                delete LC[cacheKey][id];
            }
        }
    },

    delByCacheKey: async function (cacheKey) {
        if (!isEmpty(cacheKey)) {
            var runtimeVersion = await RuntimeVersionManager.getVersion();
            let LC = !isEmpty(localCache[runtimeVersion]) ? localCache[runtimeVersion] : "";

            if (!isEmpty(LC) && !isEmpty(LC[cacheKey])) {
                delete LC[cacheKey]
            }
        }
    }
};

module.exports = LocalCacheManager;