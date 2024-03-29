import '@polymer/polymer/polymer-legacy.js';
import '../liquid-entity-govern-data-get.js';
import { Polymer as Polymer$0 } from '@polymer/polymer/lib/legacy/polymer-fn.js';

Polymer$0({
  _template: html`
        <liquid-entity-govern-data-get id="entityGetData2" auto\$="[[auto]]" verbose="" operation="initiatesearch" request-data="{{request}}" last-response="{{searchResponse}}">
        </liquid-entity-govern-data-get>

        <liquid-entity-govern-data-get id="entityGetData3" auto="" verbose="" operation="getsearchresultdetail" request-data="{{request}}" request-id="[[searchResponse.content.requestId]]" last-response="{{resultedEntities}}" on-response="_entitiesRecieved">
            </liquid-entity-govern-data-get>
`,

  is: 'liquid-entity-govern-data-get-demo-search',

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
                                  "list": "productMaster",
                                  "classification": "_ALL"
                              }
                          ],
                          "valueContexts": [
                              {
                                  "source": "SAP",
                                  "locale": "en-US"
                              }
                          ],
                          "filters": {
                              "attributesCriterion": [],
                              "typesCriterion": ["nart"]
                          }
                      },
                      "fields": {
                          "ctxTypes": [
                              "properties"
                          ],
                          "attributes": [
                              "cpimProductName",
                              "csapDescriptionOfNart"
                          ],
                          "relationships": [
                          ]
                      },
                      "options": {
                          "from": 0,
                          "to": 3
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

      if (this.request.params.options.from != 4) {
          console.log('updating from and to options..');
          var options = { "from": 4, "to": 9 };
          this.set("request.params.options", options);
      }
  }
});
