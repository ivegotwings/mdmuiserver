import '@polymer/polymer/polymer-legacy.js';
import '../liquid-config-get.js';
import { Polymer as Polymer$0 } from '@polymer/polymer/lib/legacy/polymer-fn.js';

Polymer$0({
  _template: Polymer.html`
        <liquid-config-get id="configGetData3" operation="getbyids" request-id="req1" request-data="{{request}}" on-response="_onConfigsGetResponse"></liquid-config-get>
`,

  is: 'liquid-config-get-demo3',

  attached: function () {
  },

  properties: {
      request: {
          type: Object,
          value: function () {
              return {
                  "params": {
                      "query": {
                          "id": "x-rock-entity-header_101_uiConfig",
                          "contexts": [
                              {
                                  "component": "rock-entity-header",
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
      console.log('Received configs ', JSON.stringify(configs, null, 2));
  }
});
