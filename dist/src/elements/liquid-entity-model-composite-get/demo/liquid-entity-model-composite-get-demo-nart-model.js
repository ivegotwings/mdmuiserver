import { Base } from '@polymer/polymer/polymer-legacy.js';
import '../liquid-entity-model-composite-get.js';
import { Polymer as Polymer$0 } from '@polymer/polymer/lib/legacy/polymer-fn.js';
Polymer$0({
  _template: Polymer.html`
        <liquid-entity-model-composite-get id="liqEntityCompositeModelGet" verbose="" request-data="{{request}}" on-entity-model-composite-get="_onEntitiesReceived" on-error="_onEntityGetFailed"></liquid-entity-model-composite-get>
`,

  is: 'liquid-entity-model-composite-get-demo-nart-model',

  attached: function () {
      //var liquidElement1 = this.shadowRoot.querySelector("[id=entityGetData3]");
      //liquidElement1.generateRequest();
  },

  properties: {
      auto: {
          type: Boolean,
          value: false
      },
      request: {
          type: Object,
          value: function () {
              return {
                  "params": {
                      "query": {
                          "name": "image"
                      },
                      "valueContexts": [
                          {
                              "source": "internal",
                              "locale": "en-US"
                          }
                      ],
                      "filters": {
                          "typesCriterion": [
                              "entityCompositeModel"
                          ]
                      },
                      "fields": {
                          "attributes": ["_ALL"],
                          "relationships": ["_ALL"],
                          "relationshipAttributes": ["status", "isprimary", "order", "swatchimage", "hascolorized", "issiblingswatch", "imagetype", "linkdescription", "enabled", "componentskuquantity"]
                      }
                  }
              };
          },
          notify: true
      },

      entities: {
          type: Object,
          value: function () {
              return {};
          },
          notify: true
      },
  },

  generateRequest: function () {
      this.shadowRoot.querySelector('#liqEntityCompositeModelGet').generateRequest();
  },

  _onEntitiesReceived: function (e) {
      console.log('nart model received ', JSON.stringify(e.detail.response, null, 4));
  },

  _onEntityGetFailed: function (e) {
      Base._error('entity model get failed with error ', JSON.stringify(e.detail.response, null, 4));
  }
});
