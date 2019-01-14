import '@polymer/polymer/polymer-element.js';
import '../bedrock-app-context-behavior/bedrock-app-context-behavior.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-helpers/context-helper.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-helpers/data-request-helper.js';
import '../bedrock-helpers/data-transform-helper.js';
import '../liquid-entity-data-get/liquid-entity-data-get.js';
class LocaleManager {
    constructor() {
        this.entityType = "locale";
        this.contextData = new Object();
        this.localeColumnMapCollection = {
            "id": "{entity.id}",
            "name": "{entity.name}",
            "externalName": "{entity.attributes.externalname}",
            "code": "{entity.attributes.code}"
        };
        this.relationshipType = "fallbacklocale";
        this.relationshipAttribute = "fallbacksequence";
        this.setLocalesJson([]);
        this.fallbackLocalesThreshold = 3;
        this.promiseResolve;
    }

    _initSearch(resolve) {
        let itemContext = {
            "type": this.entityType,
            "attributeNames": ["_ALL"],
            "relationships": [this.relationshipType],
            "relationshipAttributes": [this.relationshipAttribute]
        };

        this.contextData[ContextHelper.CONTEXT_TYPE_ITEM] = [itemContext];

        let entityGetRequest = DataRequestHelper.createEntityGetRequest(this.contextData, true);

        let liquidCustomElement = customElements.get("liquid-entity-data-get");

        let liquidElement = new liquidCustomElement();

        liquidElement.requestData = entityGetRequest;
        liquidElement.operation = "initiatesearch";

        //Since this get process will be done in back end side it should not increase request or response count of progress bar.
        liquidElement.excludeInProgress = true;

        let _initSearchResponse = (e) => {
            if (DataHelper.isValidObjectPath(e, "detail.response.content.requestId")) {
                this._getSearchResult(e.detail.request.requestData, e.detail.response.content.requestId, resolve);
            }
        };

        let _onEntityInitSearchError = (e) => {
            this._onError(e.detail, resolve);
        }

        liquidElement.addEventListener("response", _initSearchResponse.bind(this));
        liquidElement.addEventListener("error", _onEntityInitSearchError.bind(this));

        liquidElement.generateRequest();
    }

    _getSearchResult(requestData, requestId, resolve) {
        let liquidEntityCustomElement = customElements.get("liquid-entity-data-get");
        let liquidEntityDataGet = new liquidEntityCustomElement();

        let _getSearchResultResponse = function (e) {
            let res = e.detail.response;
            if (res && res.content && res.content.entities && res.content.entities.length > 0) {
                let entities = res.content.entities;
                let formattedEntities = DataTransformHelper.transformLocaleEntitiesToLocalesJson(entities, this.localeColumnMapCollection, this.relationshipType, this.relationshipAttribute, this.fallbackLocalesThreshold);
                this.setLocalesJson(formattedEntities);
            } else {
                this.setLocalesJson([]);
                console.error("locale-manager - Locales get response error", e.detail);
            }

            if (resolve) {
                resolve();
            }
        }

        let _onEntityGetError = (e) => {
            this._onError(e.detail, resolve);
        }

        liquidEntityDataGet.addEventListener("response", _getSearchResultResponse.bind(this));
        liquidEntityDataGet.addEventListener("error", _onEntityGetError.bind(this));
        liquidEntityDataGet.requestId = requestId;
        liquidEntityDataGet.excludeInProgress = true;
        liquidEntityDataGet.operation = "getsearchresultdetail";

        liquidEntityDataGet.requestData = requestData;
        liquidEntityDataGet.generateRequest();
    }

    _onError(detail, resolve) {
        this.setLocalesJson([]);
        console.error("locale-manager - Locales get exception", detail);
        if (resolve) {
            resolve();
        }
    }
    
    async getByNameAsync(name) {
        let locales = await this._getByPropAsync("name", name);
        if (!_.isEmpty(locales)) {
            return locales[0];
        }
    }

    async getByIdAsync(id) {
        let locales = await this._getByPropAsync("id", id);
        if (!_.isEmpty(locales)) {
            return locales[0];
        }
    }

    async getByIdsAsync(ids) {
        return await this._getByPropAsync("id", ids);
    }

    getByName(name) {
        let locales = this._getByProp("name", [name]);
        if (!_.isEmpty(locales)) {
            return locales[0];
        }
    }

    getById(id) {
        let locales = this._getByProp("id", [id]);
        if (!_.isEmpty(locales)) {
            return locales[0];
        }
    }

    async _getByPropAsync(propName, propValue) {
        let locales;

        if (!_.isEmpty(this.localesJson)) {
            locales = this._getByProp(propName, propValue);
        } else {
            //console.error('locales are not yet preloaded');
            await this.preload();
            locales = this._getByProp(propName, propValue);
        }

        return locales;
    }

    async preload(skipOfflineCache) {
        return await this._getDataFromLiquid(skipOfflineCache);
    }

    _getByProp(propName, propValue) {
        if (propName && !_.isEmpty(this.localesJson)) {
            return this.localesJson.filter(locale => propValue.indexOf(locale[propName]) > -1);
        }
    }

    _getDataFromLiquid(skipOfflineCache = false) {
        return new Promise((resolve, reject) => {
            if (isEmpty(this.localesJson) && !skipOfflineCache) {
                let cachedData = LocalStorageManager.get("locales-master", this.getCacheScope());
                if (!_.isEmpty(cachedData)) {
                    let localesJson = JSON.parse(cachedData);
                    this.localesJson = localesJson;
                    if (resolve) {
                        resolve();
                    }
                }
            }

            if (isEmpty(this.localesJson)) {
                this._initSearch(resolve);
            }
        });
    }

    setLocalesJson(localesJson) {
        this.localesJson = localesJson;
        
        if(!_.isEmpty(localesJson)) {
            LocalStorageManager.set("locales-master", this.getCacheScope(), JSON.stringify(localesJson), true);
        }
    }

    getCacheScope() {
        let rv = SharedUtils.RuntimeVersionManager.getVersion();
        let tenantId = DataHelper.getTenantId();
        return {
            "tenantId": tenantId,
            "runtime-version": rv
        };
    }
}
