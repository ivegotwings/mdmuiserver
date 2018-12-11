import '@polymer/polymer/polymer-legacy.js';
import '../liquid-base-falcor-behavior.js';
import { Polymer as Polymer$0 } from '@polymer/polymer/lib/legacy/polymer-fn.js';

Polymer$0({
  _template: html`

`,

  is: 'liquid-base-falcor-behavior-play-element',

  properties: {
  },

  attached: function () {
  },

  _executeRequest: function (model, request) {
      console.log('execute function called with request object ', request);

      var operation = request.operation;

      if (operation) {
          if (operation == "GoodOp") {
              return model.call(["searchResults", "create"], [request.requestData], [], []);
          }
          else if (operation == "BadOp") {
              return model.call(["searchResults", "unknown"], [request.requestData], [], []);
          }
          else {
              throw 'exception: operation ' + operation + ' is not supported in ' + this.is + ' element.';
          }
      }
      else {
          console.log('executeRequest called with NO operation is provided..terminating gracefully..');
          return null;
      }
  },

  _getDummyRequestData: function () {
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
                  "id": "e6",
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
