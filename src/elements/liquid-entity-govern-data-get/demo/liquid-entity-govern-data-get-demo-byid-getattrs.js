import { Base } from '@polymer/polymer/polymer-legacy.js';
import '../liquid-entity-govern-data-get.js';
import { Polymer as Polymer$0 } from '@polymer/polymer/lib/legacy/polymer-fn.js';
Polymer$0({
  _template: html`
        <liquid-entity-govern-data-get id="entityGetData3" auto\$="[[auto]]" verbose="" operation="getbyids" request-id="req1" request-data="{{request}}" last-response="{{entities}}" on-response="_onEntitiesReceived" on-error="_onEntityGetFailed"></liquid-entity-govern-data-get>
        <liquid-entity-govern-data-get id="entityGetData4" auto="" verbose="" operation="getbyids" request-id="req2" request-data="{{request2}}" last-response="{{entities2}}"></liquid-entity-govern-data-get>
`,

  is: 'liquid-entity-govern-data-get-demo-byid-getattrs',

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
                                  "list": "productMaster",
                                  "workflow":"productEnrichmentWorkflow_id"
                              }
                          ],
                          "id": "e1_workflow_runtimeinstance",
                          "filters": {
                              "attributesCriterion": [],
                              "typesCriterion": [
                                  "workflowRuntimeInstance"
                              ]
                          }
                      },
                      "fields": {
                          "ctxTypes": [
                              "properties"
                          ],
                          "attributes": [
                              "workflowInstanceId",
                              "status",
                              "startDateTime",
                              "endDateTime",
                              "activities"
                          ],
                          "relationships": [
                          ]
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

  generateRequest: function() {
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
