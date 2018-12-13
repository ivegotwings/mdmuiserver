import '@polymer/polymer/polymer-legacy.js';
import '../liquid-config-get.js';
import { Polymer as Polymer$0 } from '@polymer/polymer/lib/legacy/polymer-fn.js';

Polymer$0({
  _template: html`
        <liquid-config-get id="configGetData3" verbose="" operation="getbyids" request-id="req1" request-data="{{request}}" on-response="_onConfigsGetResponse"></liquid-config-get>
`,

  is: 'liquid-config-get-demo2',

  attached: function () {
  },

  properties: {
      request: {
          type: Object,
          value: function () {
              return {
                  "params": {
                      "query": {
                          "name": "app-entity-discovery_components-list",
                          "contexts": [
                              {
                                  "app": "app-entity-discovery",
                                  "service": "_ALL",
                                  "component": "_ALL",
                                  "subComponent": "_ALL",
                                  "entityType": "_ALL",
                                  "list": "_ALL",
                                  "relationshipType": "_ALL",
                                  "role": "_ALL",
                                  "user": "_ALL"
                              }
                          ],
                          "filters": {
                              "typesCriterion": ["uiConfig"]
                          }
                      },
                      "fields": {
                          "jsonData": true
                      }
                  }
              };
          },
          notify: true
      },
      configs: {
          type: Object,
          value: function () {
              return {};
          },
          notify: true
      }
  },

  generateRequest: function() {
      this.shadowRoot.querySelector('#configGetData3').generateRequest();
  },

  _onConfigsGetResponse: function (e) {
      var configs = e.detail.response.content;
      console.log('Received configs ', configs);
  }
});
