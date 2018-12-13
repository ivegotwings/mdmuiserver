import '@polymer/polymer/polymer-legacy.js';
import './liquid-base-falcor-behavior-play-element.js';
import { Polymer as Polymer$0 } from '@polymer/polymer/lib/legacy/polymer-fn.js';

Polymer$0({
  _template: Polymer.html`
        <liquid-base-falcor-behavior-play-element name="liquidElement1" id="p21" request-data="{{reqData1}}" on-response="_entitiesRecieved" on-error="_onError">
        </liquid-base-falcor-behavior-play-element>
        <liquid-base-falcor-behavior-play-element name="liquidElement2" id="p22" request-data="{{reqData2}}" on-response="_entitiesRecieved" on-error="_onError">
        </liquid-base-falcor-behavior-play-element>
`,

  is: 'liquid-base-falcor-behavior-play-element-demo1',

  properties: {
      reqData1:{
          type: Object,
          value: function(){
              return this._getDummyRequestData('entity_101');
          }
      },
      reqData2:{
          type: Object,
          value: function(){
              return this._getDummyRequestData('entity_105');
          }
      },
      liquidElement1: {
          type: Object,
          value: function () {
              return this.shadowRoot.querySelector("[name=liquidElement1]");
          }
      },
      liquidElement2: {
          type: Object,
          value: function () {
              return this.shadowRoot.querySelector("[name=liquidElement2]");
          }
      }
  },

  attached: function () {
      var liquidElement1 = this.liquidElement1;
      var liquidElement2 = this.liquidElement2;

      if (liquidElement1) {
          console.log('liquid base found in demo element');
          liquidElement1.requestId = "element1-req1";
         
          // ele1-req1. with no opration provided
          var request = liquidElement1.generateRequest();
          console.log('liquid element 1 - last req and res', liquidElement1.lastRequest, liquidElement1.lastResponse);

          // ele1-req2. with local operation provided
          liquidElement1.operation = "GoodOp";
          liquidElement1.requestId = "element1-req2";
          var request2 = liquidElement1.generateRequest();
          console.log('liquid element 1 - last req and res', liquidElement1.lastRequest, liquidElement1.lastResponse);
          console.log('liquid element 2 - last req and res', liquidElement2.lastRequest, liquidElement2.lastResponse);

          // ele2-req1 - with local operation provided - just another request
          liquidElement2.operation = "GoodOp";
          liquidElement2.requestId = "element2-req1";
          var request21 = liquidElement2.generateRequest();
          
          console.log('liquid element 1 - last req and res', liquidElement1.lastRequest, liquidElement1.lastResponse);
          console.log('liquid element 2 - last req and res', liquidElement2.lastRequest, liquidElement2.lastResponse);
          
          // ele2-req2 - with local operation provided - just another request
          liquidElement2.operation = "GoodOp";
          liquidElement2.requestId = "element2-req2";
          var request21 = liquidElement2.generateRequest();
          
          console.log('liquid element 1 - last req and res', liquidElement1.lastRequest, liquidElement1.lastResponse);
          console.log('liquid element 2 - last req and res', liquidElement2.lastRequest, liquidElement2.lastResponse);

          // ele1-req3 - with local operation provided - just another request
          liquidElement1.operation = "GoodOp";
          liquidElement1.requestId = "element1-req3";
          var request11 = liquidElement1.generateRequest();
          
          console.log('liquid element 1 - last req and res', liquidElement1.lastRequest, liquidElement1.lastResponse);
          console.log('liquid element 2 - last req and res', liquidElement2.lastRequest, liquidElement2.lastResponse);

      }
  },

  _entitiesRecieved: function (e) {
     var detail = e.detail;
     var liquidElement1 = this.liquidElement1;
     var liquidElement2 = this.liquidElement2;

     console.log('liquid element 1 - last req and res', liquidElement1.lastRequest, liquidElement1.lastResponse);
     console.log('liquid element 2 - last req and res', liquidElement2.lastRequest, liquidElement2.lastResponse);
     //console.log('entities received for request ', detail.request, ' and response ', detail.response);
 },

  _onError: function (e) {
      var detail = e.detail;
      //console.log('Error received for request ', detail.request, ' and error response ', detail.response);
  },

  _getDummyRequestData: function (entityId) {
      return {
          "data": {
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
                  "id": entityId,
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
                      "ALL"
                  ]
              }
          }
      };
  }
});
