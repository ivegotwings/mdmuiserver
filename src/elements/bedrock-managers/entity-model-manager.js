import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import '../bedrock-logger-behavior/bedrock-logger-behavior.js';

import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';

class EntityModelManager
        extends mixinBehaviors([
            RUFBehaviors.LoggerBehavior
        ], PolymerElement) {
        static get is() {
            return "entity-model-manager";
        }
        constructor() {
            super();
            let entityModelManager = this;
            return entityModelManager;
        }
        async get(requestData) {
            let response = await this._triggerRequest(requestData);
            return response;
        }
        _triggerRequest(requestData) {
            return new Promise((resolve, reject) => {
                this._generateModelGetRequest(resolve, requestData);
            }, this)
        }
        _generateModelGetRequest(resolve, requestData) {
            let liquidEntityCustomElement = customElements.get("liquid-entity-model-get");
            let liquidEntityModelGet = new liquidEntityCustomElement();
            let _onResponse = (ev) => {
                if (resolve) {
                    if(DataHelper.isValidObjectPath(ev, "detail.response.content.entityModels")){
                        let entityModels = ev.detail.response.content.entityModels;
                        resolve(entityModels);
                    }else{
                        resolve([]);
                    }
                    
                }
            };
            liquidEntityModelGet.addEventListener("response", _onResponse.bind(this));
            liquidEntityModelGet.addEventListener("error", this._onError.bind(this));
            liquidEntityModelGet.operation = "getbyids";
            liquidEntityModelGet.requestData = requestData;
            liquidEntityModelGet.generateRequest();
        }
        _onError(e) {
            this.logError('Entity model get failed', e.detail);
            this.dispatchEvent(new CustomEvent("error", { detail:e.detail, bubbles: this.bubbles, composed:true }));
            this.dispatchEvent(new CustomEvent("liquid-error", { detail:e.detail, bubbles: this.bubbles, composed:true }));
        }
    }
    customElements.define(EntityModelManager.is, EntityModelManager);

    export default EntityModelManager