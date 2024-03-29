import '@polymer/polymer/polymer-element.js';

class LocalStorageManager {
    
    static get(identifier, scope, cleanupObsoleted = false) {
        if (localStorage) {
            let cacheKey = this.getCacheKey(identifier, scope);

            if (cleanupObsoleted) {
                this.cleanupOld(identifier, cacheKey);
            }
            
            let value = localStorage.getItem(cacheKey);

            if (value) {
                return this.deCompress(value);
            }
        }
    }

    static set(identifier, scope, value, cleanupObsoleted = false) {
        if (localStorage) {
            let cacheKey = this.getCacheKey(identifier, scope);

            if (cleanupObsoleted) {
                this.cleanupOld(identifier, cacheKey);
            }

            let compressedValue = this.compress(value);
            if (compressedValue) {
                localStorage.setItem(cacheKey, compressedValue);
            }
        }
    }

    static del(identifier, scope) {
        if (localStorage) {
            let cacheKey = this.getCacheKey(identifier, scope);
            return localStorage.removeItem(cacheKey);
        }
    }

    static cleanupOld(identifier, excludeKey) {
        if (localStorage) {
            let keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                let key = localStorage.key(i);
                if (key != excludeKey && key.startsWith("data:" + identifier) > 0) {
                    keysToRemove.push(key);
                }
            }
            
            for (let i = 0; i < keysToRemove.length; i++) {
                localStorage.removeItem(keysToRemove[i]);
            }
        }
    }

    static getCacheKey(identifier, scope) {
        const seperator = "#@#";
        let cacheKey = "";
        
        if (identifier) {
            cacheKey = "data:" + identifier;
        }

        if (scope) {
            Object.keys(scope).sort().forEach((key) => {
                if (_.isEmpty(cacheKey)) {
                    cacheKey = cacheKey + key + ":" + scope[key];
                } else {
                    cacheKey = cacheKey + seperator + key + ":" + scope[key];
                }
            });
        }
        
        return cacheKey;
    }

    static compress(value) {
        // return compressed value.
        return value;
    }

    static deCompress(value) {
        // return de compressed value.
        return value;
    }
}

export default LocalStorageManager;
