import { Base } from '@polymer/polymer/polymer-legacy.js';
import '../liquid-entity-data-save.js';
import { Polymer as Polymer$0 } from '@polymer/polymer/lib/legacy/polymer-fn.js';
Polymer$0({
  _template: html`
        <liquid-entity-data-save id="entitySave" verbose="" name="attributeSaveDataService" operation="update" request-data="[[request]]" last-response="{{saveResponse}}" on-response="onSaveResponse" data-index="entityModel" data-sub-index="entityModel"></liquid-entity-data-save>
`,

  is: 'liquid-entity-data-save-demo-attribute-model-save',

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
                  "entities": [
                      {
                          "id": "mdmid_attributeModel",
                          "type": "attributeModel",
                          "name": "mdmid",
                          "properties": {
                              "createdService": "entityManageModelService",
                              "createdBy": "vithalanij",
                              "modifiedService": "entityManageModelService",
                              "modifiedBy": "vithalanij",
                              "createdDate": "2018-06-05T04:18:59.060-0500",
                              "modifiedDate": "2018-06-05T04:18:59.060-0500"
                          },
                          "version": "",
                          "domain": "",
                          "data": {
                              "contexts": [],
                              "attributes": {
                                  "externalName": {
                                      "values": [
                                          {
                                              "source": "internal",
                                              "locale": "en-US",
                                              "value": "MDM ID 1"
                                          }
                                      ]
                                  },
                                  "dataType": {
                                      "values": [
                                          {
                                              "source": "internal",
                                              "locale": "en-US",
                                              "value": "String"
                                          }
                                      ]
                                  },
                                  "displayType": {
                                      "values": [
                                          {
                                              "source": "internal",
                                              "locale": "en-US",
                                              "value": "TextBox"
                                          }
                                      ]
                                  }
                              }
                          }
                      }
                  ]
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
