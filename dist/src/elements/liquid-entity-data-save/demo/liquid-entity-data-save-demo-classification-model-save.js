import { Base } from '@polymer/polymer/polymer-legacy.js';
import '../liquid-entity-data-save.js';
import { Polymer as Polymer$0 } from '@polymer/polymer/lib/legacy/polymer-fn.js';
Polymer$0({
  _template: Polymer.html`
        <liquid-entity-data-save id="entitySave" verbose="" name="attributeSaveDataService" operation="update" request-data="[[request]]" last-response="{{saveResponse}}" on-response="onSaveResponse"></liquid-entity-data-save>
`,

  is: 'liquid-entity-data-save-demo-classification-model-save',

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
                  "entities": [{
                      "id": "routers",
                      "name": "Routers",
                      "version": "",
                      "type": "classification",
                      "properties": {
                          "createdService": "entityManageService",
                          "createdBy": "rw.admin@riversand.com_user",
                          "createdDate": "2018-05-09T03:20:36.835-0500",
                          "modifiedService": "entityManageService",
                          "modifiedBy": "jay.patel",
                          "modifiedDate": "2018-05-09T04:43:21.242-0500"
                      },
                      "data": {
                          "attributes": {
                              "externalName": {
                                  "values": [
                                      {
                                          "locale": "en-US",
                                          "source": "internal",
                                          "value": "Routers"
                                      }
                                  ]
                              }
                          },
                          "relationships": {
                              "hasclassificationattributes": [
                                  {
                                      "relTo": {
                                          "id": "additionalelectronicsaccessoriesincluded_attributeModel",
                                          "type": "attributeModel"
                                      }
                                  },
                                  {
                                      "relTo": {
                                          "id": "pictureinpicture_attributeModel",
                                          "type": "attributeModel"
                                      }
                                  }
                              ]
                          }
                      }
                  }]
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
      // In Progress . . . 
      this.$.entitySave.generateRequest();
  },

  onSaveResponse: function (e) {
      console.log('Save response:', JSON.stringify(e.detail.response, null, 4));
      //var req2 = this.request;
      //req2.params.query.id = "entity_105";
      //get same entity again..
      //this.set('request2', req2);
  },

  onSaveFailed: function (e) {
      Base._error('entities get failed with error ', e.detail);
  }
});
