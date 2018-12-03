import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import '../liquid-entity-model-get/liquid-entity-model-get.js';
import '../bedrock-helpers/context-helper.js';
import '../bedrock-helpers/data-request-helper.js';
import '../bedrock-logger-behavior/bedrock-logger-behavior.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class ContextDataManager extends mixinBehaviors([RUFBehaviors.LoggerBehavior], PolymerElement) {

    static get is() {
        return "context-data-manager";
    }
    constructor() {
        super();
        this.mappedDataContextLocale;
        this.contextEntities;
        this.contextTypes;
        this._mappedRelationships;
        if (!RUFUtilities.contextDataManager) {
            RUFUtilities.contextDataManager = this;
        }
        return RUFUtilities.contextDataManager;
    }
    static getInstance() {
        if (!RUFUtilities.contextDataManager) {
            RUFUtilities.contextDataManager = new ContextDataManager();;
        }
        return RUFUtilities.contextDataManager;
    }
    _generateRequest(resolve) {
        let liquidEntityCustomElement = customElements.get("liquid-entity-data-get");
        let liquidEntityDataGet = new liquidEntityCustomElement();

        let _onResponse = (ev) => {
            if(DataHelper.isValidObjectPath(ev, "detail.response.content.entities")) {
                let entities = ev.detail.response.content.entities;
                if(!_.isEmpty(entities)) {
                    this.contextEntities = entities
                }
            }
            if (resolve) {
                resolve();
            }
        };

        liquidEntityDataGet.addEventListener("response", _onResponse.bind(this));
        liquidEntityDataGet.addEventListener("error", this._onError.bind(this));
        liquidEntityDataGet.requestId = "";

        liquidEntityDataGet.excludeInProgress = true;
        liquidEntityDataGet.operation = "searchandget";
        let req = {
            "params": {
                "query": {
                    "filters": {
                        "typesCriterion": this.contextTypes
                    }
                },
                "fields": {
                    "relationships": this._mappedRelationships
                }
            }
        }

        liquidEntityDataGet.requestData = req;
        liquidEntityDataGet.generateRequest();
    }
    _onError(e) {
        this.logError('Entity get failed', e.detail);
    }
    _triggerRequest() {
        return new Promise((resolve, reject) => {
            this._generateRequest(resolve);
        })
    }
    async getMappedLocales(contextTypes,mappedValueContextsRelationship) {
        if (!_.isEmpty(this.mappedDataContextLocale)){
            return this.mappedDataContextLocale;
        } else {
            this._mappedRelationships = [];
            let _mappedRelationships = [];
            if(!_.isEmpty(mappedValueContextsRelationship)) {
                Object.keys(mappedValueContextsRelationship).forEach(function(key) {
                    if(!_.isEmpty(mappedValueContextsRelationship[key])) {
                        _mappedRelationships = _mappedRelationships.concat(mappedValueContextsRelationship[key]);
                    }
                }, this);
            }
            this._mappedRelationships = _.uniq(_mappedRelationships);
            this.contextTypes = contextTypes;
            let callLiquid = await this._triggerRequest();
            return this.getContextMappedLocales(mappedValueContextsRelationship);
        }
    }
    getContextMappedLocales(mappedValueContextsRelationship){
        if (!_.isEmpty(this.contextEntities) && !_.isEmpty(mappedValueContextsRelationship)){
            let _mappedLocale = {};
            let _contextEntities = this.contextEntities;
            _contextEntities.forEach(entity =>{
                let valContextRelationship = mappedValueContextsRelationship[entity.type];
                if (entity.data && entity.data.relationships && !_.isEmpty(entity.data.relationships[valContextRelationship])) {
                    let _allowedLocales = entity.data.relationships[valContextRelationship];
                    if(!isEmpty(_allowedLocales)){
                        let locales = []
                        _allowedLocales.forEach(locale => {
                            locales.push(locale.id)
                        })
                        _mappedLocale[entity.name] = locales
                    }
                }
            });
            this.mappedDataContextLocale = _mappedLocale;
        }
        return this.mappedDataContextLocale;
    }
    async preload() {
        return await this._triggerRequest();
    }
}

customElements.define(ContextDataManager.is, ContextDataManager);
