import '@polymer/polymer/polymer-legacy.js';
import '../../liquid-entity-data-get/liquid-entity-data-get.js';
import './liquid-dataobject-save-behavior-play-element.js';
import { Polymer as Polymer$0 } from '@polymer/polymer/lib/legacy/polymer-fn.js';

Polymer$0({
  _template: Polymer.html`
        <liquid-entity-data-get id="entityGetData3" auto="" verbose="" operation="getbyids" request-data="{{request}}" last-response="{{entities}}" on-response="_entitiesReceived"></liquid-entity-data-get>
        <liquid-dataobject-save-behavior-play-element verbose="" name="attributeSaveDataService" operation="create" last-response="{{saveResponse}}" on-response="onSaveResponse"></liquid-dataobject-save-behavior-play-element>
`,

  is: 'liquid-dataobject-save-behavior-demo-createentity-with-rels',

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
                          "id": "nart1",
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

  _entitiesReceived: function (e) {
      console.log('entities received', e.detail);

      var entities = e.detail.response.content.entities;

      var entityIds = Object.keys(entities);

      for(var i in entityIds){
          var entityId = entityIds[i];
          var entity = entities[entityId];    

          var newEntity = JSON.parse(JSON.stringify(entity)); //clone new one..

          newEntity.id = "EN_" + this.getRandomString();
          //newEntity.id = "nart_101";

          var ctxKey = Object.keys(newEntity.data.contexts)[0];

          if("csapDescriptionOfNart" in newEntity.data.contexts[ctxKey].attributes){
              newEntity.data.contexts[ctxKey].attributes.csapDescriptionOfNart.values[0].value = "creating new entity with entity id " + newEntity.id;
          }
      }

      var attributeSaveDataService = this.shadowRoot.querySelector('[name="attributeSaveDataService"]');

      if(attributeSaveDataService){
          var newEntities = {};
          newEntities[newEntity.id] = newEntity;
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
