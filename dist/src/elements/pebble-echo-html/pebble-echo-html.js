import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '../bedrock-helpers/component-helper.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-helpers/element-helper.js';
import '../pebble-icons/pebble-icons.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-popover/pebble-popover.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class PebbleEchoHtml extends mixinBehaviors([
            RUFBehaviors.UIBehavior
        ],PolymerElement) {
  static get template() {
    return html`
    <style include="bedrock-style-common">
      :host {
        @apply --pebble-echo;
      }
      :host *{
        -ms-word-break: break-all;
        word-break: break-all;
        word-break: break-word;
      }

      .userName {
        color: var(--palette-cerulean, #036bc3);
        font-weight: 600;
      }

      .activity-property {
        font-weight: bold;
      }
      .activity-property ,.timeStamp{
        font-weight: bold;
        }

      .attribute-value {
        color: var(--success-color, #4caf50);
        font-weight: bold;
        word-break: break-all;
      }

      .prev-attribute-value {
        text-decoration: line-through;
        text-decoration-color: var(--error-color, #ed204c);
      }
      #bind-html{
        display: inline
      }
    </style>
    <div id="bind-html"></div>
`;
  }

  static get is() {
    return "pebble-echo-html";
  }

  static get properties() {
    return {
      html: {
        type: String,
        value: '',
        observer: "_onBind"
      }
    };
  }
  disconnectedCallback() {
            super.disconnectedCallback();
            this.removeEventListener('tap', this._onAttributeLinkClick.bind(this));
        }

  _onBind() {
      let element = this.shadowRoot.querySelector('#bind-html');
      element.innerHTML = this.html;
      let attrValueElem = element.querySelector("#attributeValue")
      if(attrValueElem){
        attrValueElem.addEventListener("tap",this._onAttributeLinkClick.bind(this));
      }
      let attrPrevValueElem = element.querySelector("#prevAttributeValue")
      if(attrPrevValueElem){
        attrPrevValueElem.addEventListener("tap",this._onAttributeLinkClick.bind(this));
      }  
    }
  _onAttributeLinkClick(e){
  let attributeDetails = JSON.parse(e.currentTarget.getAttribute("data"))
  this.fireBedrockEvent("open-attribute-dialog", attributeDetails, {ignoreId: true});
}
}
customElements.define(PebbleEchoHtml.is, PebbleEchoHtml);
