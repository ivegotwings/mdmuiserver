import '@polymer/polymer/polymer-legacy.js';
import '../../liquid-entity-data-get/liquid-entity-data-get.js';
import '../liquid-entity-data-save.js';
import { Polymer as Polymer$0 } from '@polymer/polymer/lib/legacy/polymer-fn.js';

Polymer$0({
  _template: html`
        <liquid-entity-data-get id="entityGetData3" verbose="" operation="getbyids" request-data="{{request}}" last-response="{{entities}}" on-response="_entitiesReceived"></liquid-entity-data-get>
            <liquid-entity-data-save verbose="" name="attributeSaveDataService" operation="update" request-data="{{entities.content}}" last-response="{{saveResponse}}" on-response="onSaveResponse"></liquid-entity-data-save>
                <liquid-entity-data-get verbose="" name="liqGetSavedEntities" operation="getbyids" request-data="{{request}}" last-response="{{entities}}" on-response="_savedEntitiesReceived"></liquid-entity-data-get>
`,

  is: 'liquid-entity-data-save-demo-updateentity-with-attrs',

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
                              "crossSell"
                          ],
                          "relationshipAttributes": [
                              "status"
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
      console.log('entities received ', JSON.stringify(e.detail.response, null, 4));

      var entities = e.detail.response.content.entities;

      for (let entity of entities) {
          var entityId = entity.id;

          var ctxItem = entity.data.contexts[0];

          if ("csapDescriptionOfNart" in ctxItem.attributes) {
              ctxItem.attributes.csapDescriptionOfNart.values[0].value = "BSDF_CREAM_501 - updated trial 4";
          }

          if (ctxItem.relationships && ctxItem.relationships.crossSell) {
              var crossSellRels = ctxItem.relationships.crossSell;
              if (crossSellRels != undefined && crossSellRels.length > 0) {
                  for (let rel of crossSellRels) {
                      if (rel != undefined && rel.attributes && "status" in rel.attributes) {
                          rel.attributes["status"].values[0].value = "Active2";
                      }
                  }
              }
          }
      }

      console.log('entities sent for save ', JSON.stringify(entities, null, 4));

      var attributeSaveDataService = this.shadowRoot.querySelector('[name="attributeSaveDataService"]');

      if (attributeSaveDataService) {
          attributeSaveDataService.generateRequest();
      }
  },

  _savedEntitiesReceived: function (e) {
      console.log('saved entities from the server / cache ', JSON.stringify(e.detail.response, null, 4));
  },

  onSaveResponse: function (e) {
      console.log('saved api response ', JSON.stringify(e.detail.response, null, 4));

      var liqGetSavedEntities = this.shadowRoot.querySelector('[name="liqGetSavedEntities"]');

      if (liqGetSavedEntities) {
          liqGetSavedEntities.generateRequest();
      }
  }
});
