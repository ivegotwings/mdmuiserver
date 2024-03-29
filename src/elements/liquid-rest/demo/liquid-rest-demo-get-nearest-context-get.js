import { Base } from '@polymer/polymer/polymer-legacy.js';
import '../liquid-rest.js';
import { Polymer as Polymer$0 } from '@polymer/polymer/lib/legacy/polymer-fn.js';
Polymer$0({
  _template: html`
        <liquid-rest id="liquidRest" url="/data/pass-through/entityappmodelservice/getnearestcontext" auto\$="[[auto]]" verbose="" method="POST" request-data="{{request}}" last-response="{{response}}" on-response="_onEntitiesReceived" on-error="_onEntityGetFailed"></liquid-rest>
`,

  is: 'liquid-rest-demo-get-nearest-context-get',

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
                          "id": "productgroup_entityVariantModel",
                          "filters": {
                              "attributesCriterion": [],
                              "typesCriterion": [
                                  "entityVariantModel"
                              ]
                          },
                          "contexts": [
                              {
                                  "taxonomy": "Enterprise Hierarchy",
                                  "classification": "Apparel>>Boy's Clothing>>Boy's Tops>>Boy's Shirts"
                              }
                          ]
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

  generateRequest: function () {
      this.shadowRoot.querySelector('#liquidRest').generateRequest();
  },

  _onEntitiesReceived: function (e) {
      console.log('entities received ', JSON.stringify(e.detail.response, null, 4));
      let response = {
          "entityModels": [
              {
                  "id": "productgroup_entityVariantModel",
                  "name": "productgroup",
                  "type": "entityVariantModel",
                  "domain": "generic",
                  "properties": {
                      "levels": [
                          {
                              "levelNumber": 2,
                              "targetEntityType": "item",
                              "targetRelationship": "itemischildof",
                              "targetRelationshipOwnership": "whereused",
                              "dimensionAttributes": [
                                  {
                                      "name": "itemtype",
                                      "mandatory": true
                                  }
                              ]
                          },
                          {
                              "levelNumber": 1,
                              "targetEntityType": "product",
                              "targetRelationship": "productischildof",
                              "targetRelationshipOwnership": "whereused",
                              "dimensionAttributes": [
                                  {
                                      "name": "sizeappareltopsyouth",
                                      "mandatory": true
                                  },
                                  {
                                      "name": "colorapparel1",
                                      "mandatory": true
                                  },
                                  {
                                      "name": "colorapparel2",
                                      "mandatory": true
                                  }
                              ]
                          }
                      ]
                  },
                  "data": {
                      "contexts": [
                          {
                              "context": {
                                  "taxonomy": "Enterprise Hierarchy",
                                  "classification": "Apparel>>Boy's Clothing>>Boy's Tops>>Boy's Shirts"
                              },
                              "properties": {
                                  "levels": [
                                      {
                                          "levelNumber": 1,
                                          "targetEntityType": "product",
                                          "targetRelationship": "productischildof",
                                          "targetRelationshipOwnership": "whereused",
                                          "dimensionAttributes": [
                                              {
                                                  "name": "sizeappareltopsyouth",
                                                  "mandatory": true
                                              },
                                              {
                                                  "name": "colorapparel",
                                                  "mandatory": true
                                              }
                                          ]
                                      },
                                      {
                                          "levelNumber": 3,
                                          "targetEntityType": "product",
                                          "targetRelationship": "productischildof",
                                          "targetRelationshipOwnership": "whereused",
                                          "dimensionAttributes": [
                                              {
                                                  "name": "abc",
                                                  "mandatory": true
                                              },
                                              {
                                                  "name": "def123",
                                                  "mandatory": true
                                              }
                                          ]
                                      }
                                  ]
                              }
                          },
                          {
                              "context": {
                                  "taxonomy": "Enterprise Hierarchy",
                                  "classification": "Apparel>>Boy's Clothing>>Boy's Tops>>Boy's Shirts"
                              },
                              "properties": {
                                  "levels": [
                                      {
                                          "levelNumber": 2,
                                          "targetEntityType": "product",
                                          "targetRelationship": "productischildof",
                                          "targetRelationshipOwnership": "whereused",
                                          "dimensionAttributes": [
                                              {
                                                  "name": "sizeappareltopsyouth123",
                                                  "mandatory": true
                                              },
                                              {
                                                  "name": "itemtype",
                                                  "mandatory": true
                                              }
                                          ]
                                      },
                                      {
                                          "levelNumber": 3,
                                          "targetEntityType": "product",
                                          "targetRelationship": "productischildof",
                                          "targetRelationshipOwnership": "whereused",
                                          "dimensionAttributes": [
                                              {
                                                  "name": "abc",
                                                  "mandatory": true
                                              },
                                              {
                                                  "name": "def",
                                                  "mandatory": true
                                              }
                                          ]
                                      }
                                  ]
                              }
                          }
                      ]
                  }
              }
          ]
      };
      this.transform(e.detail.response.response);
  },

  _onEntityGetFailed: function (e) {
      Base._error('entities get failed with error ', e.detail);
  },

  transform: function (response) {
      if (response) {
          let entityModels = response.entityModels;
          if (entityModels) {
              for (let entityModel of entityModels) {
                  let mergedLevels = [];
                  let levels = [];

                  if (entityModel.properties && entityModel.properties.levels) {
                      levels = entityModel.properties.levels;
                  }

                  if (entityModel.data && entityModel.data.contexts) {
                      for (let ctx of entityModel.data.contexts) {
                          if (ctx.properties && ctx.properties.levels) {
                              for (let level of ctx.properties.levels) {
                                  levels.push(level);
                              }
                          }
                      }
                  }

                  if (levels) {
                      for (let i = 1; i < i + 1; i++) {
                          let ilevels = levels.filter(v => v.levelNumber == i);

                          if (!_.isEmpty(ilevels)) {
                              if (ilevels.length == 1) {
                                  mergedLevels.push(ilevels[0]);
                              } else {
                                  let tempLevel = ilevels[0];
                                  for (let ilevel of ilevels) {
                                      if (ilevel.dimensionAttributes) {
                                          for (let dimAttr of ilevel.dimensionAttributes) {
                                              let isExist = tempLevel.dimensionAttributes.find(v => v.name == dimAttr.name);
                                              if (!isExist) {
                                                  tempLevel.dimensionAttributes.push(dimAttr);
                                              }
                                          }
                                      }
                                  }
                                  mergedLevels.push(tempLevel);
                              }
                          } else {
                              break;
                          }
                      }
                  }

                  entityModel.properties.levels = mergedLevels;
                  delete entityModel.data;
              }
          }
      }
      
      console.log(JSON.stringify(response, null, 2));
      return response;
  }
});
