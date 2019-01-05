import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import '../liquid-rest/liquid-rest.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../pebble-button/pebble-button.js';
import '../liquid-dataobject-utils/liquid-dataobject-utils.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockVersionManage
  extends mixinBehaviors([

  ], PolymerElement) {
  static get template() {
    return Polymer.html`
    <style include="bedrock-style-common bedrock-style-padding-margin">
      .block {
        padding: 20px 0px;
      }

      :host {
        display: block;
        height: 100%;
      }

      .version-manage-wrapper {
        display: flex;
        align-items: center;
        flex: 0 1 auto;
        justify-content: center;
      }

      #attrName {
        font-family: var(--default-font-family);
        font-size: var(--default-font-size, 14px);
        font-weight: normal;
        font-style: normal;
        font-stretch: normal;
        color: var(--palette-steel-grey, #75808b);
        position: relative;
      }

      #attrVal {
        font-size: var(--font-size-lg, 12px);
        font-weight: var(--font-medium, 500);
        color: var(--palette-dark, #1a2028);
        margin-left: 5px;
      }
      
    </style>
    <div class="block">
      <div id="attribute" class="version-manage-wrapper">
          <span id="attrName">Current runtime version number:</span>
          <span id="attrVal">[[runtimeVersion]]</span>
          <pebble-button id="statusIcon" class="btn btn-success m-l-10" button-text="Bump up version >>" on-click="_handleSave">
          </pebble-button>
      </div>
      <liquid-rest id="liqRuntimeVersionUpdate" url="/data/version/updateRuntimeVersion" method="POST" on-liquid-response="_onResponse" on-liquid-error="_onError">
      </liquid-rest>
    </div>
`;
  }

  static get is() {
    return 'rock-version-manage';
  }
  static get properties() {
    return {
      runtimeVersion: {
        type: String,
        value: "0.0.0.0"
      }

    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.runtimeVersion = SharedUtils.RuntimeVersionManager.getVersion();
  }
  get liqRuntimeVersionUpdateLiq() {
    this._liqRuntimeVersionUpdateLiq = this._liqRuntimeVersionUpdateLiq || this.shadowRoot.querySelector('#liqRuntimeVersionUpdate');
    return this._liqRuntimeVersionUpdateLiq;
  }

  _handleSave() {
    this.generateRequest();
  }
  generateRequest() {
    let configSaveService = this.liqRuntimeVersionUpdateLiq;
    if (configSaveService) {
      configSaveService.operation = "get";
      configSaveService.requestData = {};
      configSaveService.generateRequest();
    }
  }
  _onResponse(e) {
    if (e.detail && e.detail.response && e.detail.response.newVersion) {
      this.runtimeVersion = e.detail.response.newVersion;
      LiquidDataObjectUtils.invalidateAllCache();
      SharedUtils.RuntimeVersionManager.setVersion(this.runtimeVersion);
    }
  }
}
customElements.define(RockVersionManage.is, RockVersionManage)
