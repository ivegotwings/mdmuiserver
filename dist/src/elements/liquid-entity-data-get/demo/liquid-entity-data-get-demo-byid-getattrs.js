import { Base } from '@polymer/polymer/polymer-legacy.js';
import '../liquid-entity-data-get.js';
import { Polymer as Polymer$0 } from '@polymer/polymer/lib/legacy/polymer-fn.js';
Polymer$0({
  _template: Polymer.html`
        <liquid-entity-data-get id="entityGetData3" auto\$="[[auto]]" verbose="" operation="getbyids" request-id="req1" request-data="{{request}}" last-response="{{entities}}" on-response="_onEntitiesReceived" on-error="_onEntityGetFailed"></liquid-entity-data-get>
`,

  is: 'liquid-entity-data-get-demo-byid-getattrs',

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
                          "filters": {
                              "typesCriterion": [
                                  "productgroup"
                              ]
                          },
                          "id": "eQaSwUPmCj9Bj",
                          "contexts": [
                              {
                                  "taxonomy": "Enterprise Hierarchy",
                                  "classification": "Apparel and Accessories>>Apparel>>Baby Wear>>Baby Bibs"
                              }
                          ],
                          "valueContexts": [
                              {
                                  "source": "internal",
                                  "locale": "en-US",
                                  "localeCoalesce": true
                              }
                          ]
                      },
                      "fields": {
                          "attributes": [
                              "name",
                              "INTERNAL_DATAOBJECT_METADATA_FIELDS"
                          ]
                      },
                      "options": {
                          "maxRecords": 1
                      }
                  }
              };
          },
          notify: true
      },
      request2: {
          type: Object,
          value: function () {
              return {};
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
      entities2: {
          type: Object,
          value: function () {
              return {};
          },
          notify: true
      }
  },

  generateRequest: function () {
      this.shadowRoot.querySelector('#entityGetData3').generateRequest();
  },

  _onEntitiesReceived: function (e) {
      console.log('entities received ', JSON.stringify(e.detail.response, null, 4));
      //var req2 = this.request;
      //req2.params.query.id = "entity_105";
      //get same entity again..
      //this.set('request2', req2);
  },

  _onEntityGetFailed: function (e) {
      Base._error('entities get failed with error ', e.detail);
  }
});
