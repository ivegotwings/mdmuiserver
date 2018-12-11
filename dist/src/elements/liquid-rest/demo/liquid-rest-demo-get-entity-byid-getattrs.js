import { Base } from '@polymer/polymer/polymer-legacy.js';
import '../liquid-rest.js';
import { Polymer as Polymer$0 } from '@polymer/polymer/lib/legacy/polymer-fn.js';
Polymer$0({
  _template: html`
         <liquid-rest id="liquidRest" url="/data/pass-through/entitymanageservice/get" auto\$="[[auto]]" verbose="" method="POST" request-data="{{request}}" last-response="{{response}}" on-response="_onEntitiesReceived" on-error="_onEntityGetFailed"></liquid-rest>
`,

  is: 'liquid-rest-demo-get-entity-byid-getattrs',

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
                          "id": "VISH_6006",
                          "filters": {
                              "attributesCriterion": [],
                              "typesCriterion": [
                                  "nart"
                              ]
                          }
                      },
                      "fields": {
                          "ctxTypes": [
                              "properties"
                          ],
                          "attributes": [
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
      }
  },

  generateRequest: function() {
      this.shadowRoot.querySelector('#liquidRest').generateRequest();
  },

  _onEntitiesReceived: function (e) {
       console.log('entities received ', JSON.stringify(e.detail.response, null, 4));
   },

  _onEntityGetFailed: function (e) {
      Base._error('entities get failed with error ', e.detail);
  }
});
