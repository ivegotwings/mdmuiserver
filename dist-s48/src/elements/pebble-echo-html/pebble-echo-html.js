import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
class PebbleEchoHtml extends PolymerElement {
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

      .attribute-value {
        color: var(--success-color, #4caf50);
        font-weight: bold;
        word-break: break-all;
      }

      .prev-attribute-value {
        text-decoration: line-through;
        text-decoration-color: var(--error-color, #ed204c);
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

  _onBind() {
    let bindHtml = this.shadowRoot.querySelector('#bind-html');
    bindHtml.innerHTML = this.html;
  }
}
customElements.define(PebbleEchoHtml.is, PebbleEchoHtml);