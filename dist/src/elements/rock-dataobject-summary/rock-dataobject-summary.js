import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import '../rock-dataobject-summary-countview/rock-dataobject-summary-countview.js';
class RockDataobjectSummary extends PolymerElement{
  static get template() {
    return Polymer.html`
        <template is="dom-if" if="[[_isDefaultView(viewMode)]]">

            <rock-dataobject-summary-countview model-domain="[[modelDomain]]" dataobject-list="[[dataobjectList]]" domain="[[domain]]" data-index\$="[[dataIndex]]"></rock-dataobject-summary-countview>

        </template>
`;
  }

  static get is() {
      return "rock-dataobject-summary";
  }
  static get properties() {
      return {
          contextData: {
              type: Object,
              value: function() {
                  return {};
              }
          },
          viewMode: {
              type: String
          },
          dataobjectList: {
              type: Array
          },
          domain: {
              type: String
          },
          modelDomain: {
              type: String
          },
          dataIndex: {
              type: String
          }
      }
  }
  _isDefaultView(viewMode) {
      if(viewMode == "countView"){
          return true;
      }
      return false;
  }
}
customElements.define(RockDataobjectSummary.is, RockDataobjectSummary);
