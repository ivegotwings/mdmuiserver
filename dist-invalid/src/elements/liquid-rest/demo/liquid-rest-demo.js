import { Base } from '@polymer/polymer/polymer-legacy.js';
import '../liquid-rest.js';
import { Polymer as Polymer$0 } from '@polymer/polymer/lib/legacy/polymer-fn.js';
Polymer$0({
  _template: html`
        <liquid-rest id="rest1" url="/data/cop/transform" auto\$="[[auto]]" verbose="" method="POST" request-data="{{request}}" on-response="_onResponseReceived" on-error="_onResponseFailed"></liquid-rest>
`,

  is: 'liquid-rest-demo',

  properties: {
      auto: {
          type: Boolean,
          value: false
      },
      request: {
          type: Object,
          value: function () {
              return {
                  "fileName": "small.xlsx"
              };
          }
      }
  },

  generateRequest: function () {
      this.shadowRoot.querySelector('#rest1').generateRequest();
  },

  _onResponseReceived: function (e) {
      console.log('response received ', JSON.stringify(e.detail.response, null, 4));
  },

  _onResponseFailed: function (e) {
      Base._error('rest call failed with error ', e.detail);
  }
});
