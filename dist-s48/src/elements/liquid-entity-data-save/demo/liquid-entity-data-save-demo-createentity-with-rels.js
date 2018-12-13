import '@polymer/polymer/polymer-legacy.js';
import '../../liquid-entity-data-get/liquid-entity-data-get.js';
import '../liquid-entity-data-save.js';
import { Polymer as Polymer$0 } from '@polymer/polymer/lib/legacy/polymer-fn.js';

Polymer$0({
  _template: html`
        <liquid-entity-data-get id="entityGetData3" verbose="" operation="getbyids" request-data="{{request}}" last-response="{{entities}}" on-response="_entitiesReceived"></liquid-entity-data-get>
        <liquid-entity-data-save verbose="" name="attributeSaveDataService" operation="create" last-response="{{saveResponse}}" on-response="onSaveResponse"></liquid-entity-data-save>
`,

  is: 'liquid-entity-data-save-demo-createentity-with-rels',

  properties: {
      request: {
          type: Object,
          value: function () {
              return {
                  "params": {
                      "query": {
                          "contexts": [{
                              "list": "productMaster",
                              "classification": "_ALL"
                          }],
                          "valueContexts": [{
                              "source": "SAP",
                              "locale": "en-US"
                          }],
                          "id": "BSDF_CREAM_501",
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
                              "cpimProductName",
                              "csapDescriptionOfNart"
                          ],
                          "relationships": [
                              "billOfMaterial"
                          ],
                          "relationshipAttributes": [
                              "rpimIsMaster"
                          ],
                          "relatedEntityAttributes": [
                              "cpimProductName",
                              "csapDescriptionOfNart"
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
      saveResponse: {
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

  _entitiesReceived: function (e) {
      console.log('entities received', e.detail);

      var entities = e.detail.response.content.entities;

      for(let entity of entities){
          var entityId = entity.id;

          var newEntity = JSON.parse(JSON.stringify(entity)); //clone new one..

          newEntity.id = "EN_" + this.getRandomString();
          //newEntity.id = "nart_101";

          var ctxItem = newEntity.data.contexts[0];

          if("csapDescriptionOfNart" in ctxItem.attributes){
              ctxItem.attributes.csapDescriptionOfNart.values[0].value = "creating new entity with entity id " + newEntity.id;
          }
      }

      var attributeSaveDataService = this.shadowRoot.querySelector('[name="attributeSaveDataService"]');

      if(attributeSaveDataService){
          var newEntities = []
          newEntities.push(newEntity);
          attributeSaveDataService.requestData = {'entities': newEntities};
          attributeSaveDataService.generateRequest();
      }
  },

  getRandomString : function() {
      var x = 2147483648;
      return Math.floor(Math.random() * x).toString(36) +
          Math.abs(Math.floor(Math.random() * x) ^ new Date().getTime()).toString(36);
  },

  onSaveResponse: function (e) {
      console.log('save response ', e.detail);
  }
});
