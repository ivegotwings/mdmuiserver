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
import { Polymer as Polymer$0 } from '@polymer/polymer/lib/legacy/polymer-fn.js';

Polymer$0({
  _template: html`
        <liquid-entity-model-get id="liquidEntityModelGet" \$verbose="[[verbose]]" operation="getbyids" on-response="_onResponse" on-error="_onError"></liquid-entity-model-get>
`,

  is: "liquid-entity-model-composite-get",
  behaviors: [RUFBehaviors.LiquidBaseBehavior],

  /**
* Content is not appearing - Content development is under progress.
*/
  attached: function () {
  },

  /**
* Content is not appearing - Content development is under progress.
*/
  ready: function () {
  },

  properties: {
      /**
* <b><i>Content development is under progress... </b></i>
*/
      dataIndex: {
          type: String,
          value: "entityModel"
      },
      /**
* <b><i>Content development is under progress... </b></i>
*/
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
  },

  /**
* <b><i>Content development is under progress... </b></i>
*/
  generateRequest: function () {
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
  },

  _validate: function (reqData) { //eslint-disable-line no-unused-vars
      return true;
  },

  _onResponse: function (e) {
      let eventDetail = e.detail;
      this.dispatchEvent(new CustomEvent("entity-model-composite-get-response", { detail:eventDetail, bubbles: this.bubbles, composed:true }));
      this.dispatchEvent(new CustomEvent("liquid-entity-model-composite-get-response", { detail:eventDetail, bubbles: this.bubbles, composed:true }));
  },

  _onError: function (e) {
      let eventDetail = e.detail;
      this.dispatchEvent(new CustomEvent("error", { detail:eventDetail, bubbles: this.bubbles, composed:true }));
      this.dispatchEvent(new CustomEvent("liquid-error", { detail:eventDetail, bubbles: this.bubbles, composed:true }));
  }
});
