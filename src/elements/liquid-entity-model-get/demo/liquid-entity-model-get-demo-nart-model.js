import { Base } from '@polymer/polymer/polymer-legacy.js';
import '../liquid-entity-model-get.js';
import { Polymer as Polymer$0 } from '@polymer/polymer/lib/legacy/polymer-fn.js';
Polymer$0({
  _template: html`
        <liquid-entity-model-get id="entityGetData3" auto\$="[[auto]]" verbose="" operation="getbyids" request-id="req1" request-data="{{request}}" last-response="{{entities}}" on-response="_onEntitiesReceived" on-error="_onEntityGetFailed"></liquid-entity-model-get>
        <liquid-entity-model-get id="entityGetData4" auto="" verbose="" operation="getbyids" request-id="req2" request-data="{{request2}}" last-response="{{entities2}}"></liquid-entity-model-get>
`,

  is: 'liquid-entity-model-get-demo-nart-model',

  attached: function(){
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
                          "contexts": [
                              {
                                  "list": "websiteDeMaster"
                              }
                          ],
                          "name": "nart",
                          "filters": {
                              "typesCriterion": [
                                  "entityManageModel"
                              ]
                          }
                      },
                      "fields": {
                          "ctxTypes": [
                              "properties"
                          ],
                          "attributes": [
                              "cpimProductName",
                              "cpimWebDiscount"
                          ],
                          "relationships": [
                              "accessories",
                              "crossSell"
                          ],
                          "relationshipAttributes": [
                              "status",
                              "enabled"
                          ]
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

  generateRequest: function() {
      this.shadowRoot.querySelector('#entityGetData3').generateRequest();
  },

  _onEntitiesReceived: function (e) {
       console.log('nart model received ', JSON.stringify(e.detail.response, null, 4));
   },

  _onEntityGetFailed: function (e) {
      Base._error('entity model get failed with error ', JSON.stringify(e.detail.response, null, 4));
  }
});
