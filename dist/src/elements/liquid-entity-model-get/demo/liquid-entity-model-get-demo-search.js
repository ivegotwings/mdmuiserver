import '@polymer/polymer/polymer-legacy.js';
import '../liquid-entity-model-get.js';
import { Polymer as Polymer$0 } from '@polymer/polymer/lib/legacy/polymer-fn.js';

Polymer$0({
  _template: Polymer.html`
        <liquid-entity-model-get id="entityGetData2" auto\$="[[auto]]" verbose="" operation="initiatesearch" request-data="{{request}}" last-response="{{searchResponse}}">
        </liquid-entity-model-get>

        <liquid-entity-model-get id="entityGetData3" auto="" verbose="" operation="getsearchresultdetail" request-data="{{request}}" request-id="[[searchResponse.content.requestId]]" last-response="{{resultedEntities}}" on-response="_entitiesRecieved">
            </liquid-entity-model-get>
`,

  is: 'liquid-entity-model-get-demo-search',

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
                                  "list": "self"
                              }
                          ],
                          "filters": {
                              "attributesCriterion": [],
                              "typesCriterion": ["list"]
                          }
                      },
                      "fields": {
                          "ctxTypes": [
                              "properties"
                          ],
                      },
                      "options": {
                          "from": -1,
                          "to": -1
                      }
                  }
              };
          }
      },
      searchResponse: {
          type: Object,
          value: function () { return {}; },
          notify: true
      },
      resultedEntities: {
          type: Object,
          value: function () { return {}; },
          notify: true
      }
  },

  generateRequest: function () {
      this.shadowRoot.querySelector('#entityGetData2').generateRequest();
  },

  _entitiesRecieved: function (e) {
      console.log('search result entities received with detail', e.detail);
      // if (this.request.params.options.from != 4) {
      //     console.log('updating from and to options..');
      //     var options = { "from": 4, "to": 9 };
      //     this.set("request.params.options", options);
      // }
  }
});
