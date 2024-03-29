import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-scroll-bar.js';
import '../rock-api-healthcheck-status-item/rock-api-healthcheck-status-item.js';
import '../pebble-button/pebble-button.js';
import '../rock-component-config-behavior/rock-component-config-behavior.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockApihealthcheckStatusList
  extends mixinBehaviors([
  RUFBehaviors.ComponentConfigBehavior
  ], PolymerElement) {
  static get template() {
    return html`
      <style include="bedrock-style-common bedrock-style-scroll-bar">
        .block {
          padding: 0 20px;
          height:100%;
          overflow: auto;
        }
        :host{
          display: block;
          height: 100%;
          padding: 20px 0px;
        }
      </style>
    <div class="block">
      <template id="statusListTemplate" is="dom-repeat" items="{{calls}}">
        <rock-api-healthcheck-status-item name="{{item.name}}" url="{{item.url}}" status="false">
        </rock-api-healthcheck-status-item>
      </template>
    </div>
`;
  }

  static get is() { return 'rock-api-healthcheck-status-list' }
  static get properties() {
    return {
      name: {
        type: String,
        value: null
      },
      storeCalls: {
        type: Object
      },
      valid: {
        type: Boolean,
        value: false,
        notify: true
      },
      calls: {
        type: Array,
        value: []
      },
      contextData: {
        type: Object,
        value: function () {
          return {};
        },
        observer: '_onContextDataChange'
      }
    }
  }

  _handleRepeaterReload() {
    return this.valid;
  }
  _onContextDataChange () {
      if(!_.isEmpty(this.contextData)) {
          let context = DataHelper.cloneObject(this.contextData);
          //App specific
          let appName = ComponentHelper.getCurrentActiveAppName();
          if(appName) {
              context[ContextHelper.CONTEXT_TYPE_APP] = [{
                  "app": appName
              }];
          }
          this.requestConfig('rock-api-healthcheck-status-list', context);
      }
  }
  onConfigLoaded (componentConfig) {
      if(componentConfig && componentConfig.config) {
        let actionData = DataHelper.convertObjectToArray(componentConfig.config);
        if(actionData && actionData.length){
          for(let actionId = 0; actionId < actionData.length; actionId++){
            let action = actionData[actionId];
            if(action && action.url){
              let url = action.url;
              if(url.indexOf("{{TENANT}}") > -1){
                let tenantId = DataHelper.getTenantId();
                if(tenantId){
                  action.url = url.replace("{{TENANT}}", tenantId)
                }
              }
            }  
          }
        }
        this.set("calls", actionData);
      }
  }
  connectedCallback () {
    super.connectedCallback();
    this.set('valid', true);
  }
  _onCallsChanged () {
    //this.$.statusListTemplate.render();
  }
  _handleReload () {
    let temp = JSON.parse(JSON.stringify(this.calls));
    this.calls = [];
    this.$.statusListTemplate.render();
    this.calls = temp;
  }
}
customElements.define(RockApihealthcheckStatusList.is, RockApihealthcheckStatusList);
