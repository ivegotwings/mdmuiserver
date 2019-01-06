/**
<b><i>Content development is under progress... </b></i> 
@demo demo/index.html 
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import '@polymer/polymer/polymer-legacy.js';

import '../liquid-base-behavior/liquid-base-behavior.js';
import '../liquid-entity-model-get/liquid-entity-model-get.js';
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';

class LiquidEntityModelCompositeGet
    extends mixinBehaviors([
        RUFBehaviors.LiquidBaseBehavior
    ], PolymerElement) {

    static get template() {
        return html`
            <liquid-entity-model-get id="liquidEntityModelGet" \$verbose="[[verbose]]" operation="getbyids" on-response="_onResponse" on-error="_onError"></liquid-entity-model-get>
        `;
    }
    static get is() { return 'liquid-entity-model-composite-get' }

    constructor() {
      super();
    }

    static get properties() {
        return {
            dataIndex: {
                type: String,
                value: "entityModel"
            },
            liquidEntityModelGet: {
                type: Object,
                value: function () {
                    if(this.shadowRoot){
                        return this.shadowRoot.querySelector("#liquidEntityModelGet");
                    }else{
                        return null;
                    }
                }
            },
            requestData:{
                type:Object
            }
        }
      }

      generateRequest() {
        if (!this._validate(this.requestData)) {
            return;
        }

        let internalRequestData = this.requestData;

        if (internalRequestData.params && internalRequestData.params.query) {
            let query = internalRequestData.params.query;

            if (!query.contexts) {
                query.contexts = [];
            }

            // if (query.locale) {
            //     var localeCtx = { "locale": query.locale };
            //     this.localeCtx = localeCtx;
            //     query.contexts.push(localeCtx);
            // }
            if (!query.filters) {
                query.filters = {};
            }
            query.filters.typesCriterion = ["entityCompositeModel"];
        }

        if(!this.shadowRoot) {
            return;
        }

        const liqModelGet = this.shadowRoot.querySelector("#liquidEntityModelGet");

        liqModelGet.requestData = internalRequestData;
        liqModelGet.bubbles = false;
        liqModelGet.generateRequest();
    }

    _validate(reqData) { //eslint-disable-line no-unused-vars
        return true;
    }

    _onResponse(e) {
        let eventDetail = e.detail;
        this.dispatchEvent(new CustomEvent("entity-model-composite-get-response", { detail:eventDetail, bubbles: this.bubbles, composed:true }));
        this.dispatchEvent(new CustomEvent("liquid-entity-model-composite-get-response", { detail:eventDetail, bubbles: this.bubbles, composed:true }));
    }

  _onError(e) {
      let eventDetail = e.detail;
      this.dispatchEvent(new CustomEvent("error", { detail:eventDetail, bubbles: this.bubbles, composed:true }));
      this.dispatchEvent(new CustomEvent("liquid-error", { detail:eventDetail, bubbles: this.bubbles, composed:true }));
    }
}

customElements.define(LiquidEntityModelCompositeGet.is, LiquidEntityModelCompositeGet);