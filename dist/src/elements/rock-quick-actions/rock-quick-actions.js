/**
@group rock Elements
@element rock-quick-actions
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../rock-component-config-behavior/rock-component-config-behavior.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-actions/pebble-actions.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockQuickActions
    extends mixinBehaviors([RUFBehaviors.UIBehavior, RUFBehaviors.ComponentContextBehavior, RUFBehaviors.ComponentConfigBehavior], PolymerElement) {
  static get template() {
    return Polymer.html`
        <style include="bedrock-style-common bedrock-style-icons bedrock-style-padding-margin">
            pebble-actions {
                position: relative;
                display: inline-block;
                vertical-align: middle;
                --pebble-actions-button: {
                    height: 24px;
                    font-size: var(--default-font-size, 14px)!important;
                    top: 0px;
                    color: var(--palette-white, #fff);
                    background: transparent;
                    border: none;
                }

                --pebble-button: {
                    position: relative;
                    height: 24px;
                }

                --paper-button-focus-before: {                       
                    -ms-filter: "alpha(opacity=100)";
                    filter: alpha(opacity=100);
                    filter: progid:DXImageTransform.Microsoft.Alpha(opacity=100);
                    -moz-opacity: 1;
                    -khtml-opacity: 1;
                    opacity: 1;
                }

                --paper-button-before: {
                    position: absolute;
                    content: "";
                    left: 0;
                    right: 0;
                    top: -11px;
                    bottom: -5px;
                    background-color: rgba(0, 0, 0, 0.2);  
                    -ms-filter: "alpha(opacity=0)";
                    filter: alpha(opacity=0);
                    filter: progid:DXImageTransform.Microsoft.Alpha(opacity=0);
                    -moz-opacity: 0;
                    -khtml-opacity: 0;
                    opacity: 0;
                    z-index: -1;
                }

            }
        </style>
        <template is="dom-if" if="[[visible]]">
            <pebble-actions id="quickActions" class="m-l-10 pebble-icon-color-white" button-icon="pebble-icon:action-quick-global" button-text="Quick Actions" actions-data="[[actionsData]]">
            </pebble-actions>
            <bedrock-pubsub event-name="pebble-actions-action-click" handler="_onActionItemTap"></bedrock-pubsub>
        </template>
`;
  }

  static get is() { return 'rock-quick-actions' }
  ready() {
      super.ready();
  }

  static get properties() {
      return {
          contextData: {
              type: Object,
              value: function () {
                  return {};
              },
              observer: '_onContextDataChange'
          },
          actionsData: {
              type: Array,
              value: function () { return []; }
          },
          pageRoute: {
              type: Object,
              value: function () { return {}; }
          },
          visible: {
              type: Boolean,
              value: true
          }
      }
  }

  static get observers() {
      return []
  }


  _onContextDataChange() {
      if (!_.isEmpty(this.contextData)) {
          let context = DataHelper.cloneObject(this.contextData);
          //App specific
          let appName = ComponentHelper.getCurrentActiveAppName();
          if (appName) {
              context[ContextHelper.CONTEXT_TYPE_APP] = [{
                  "app": appName
              }];
          }

          this.requestConfig('rock-quick-actions', context);
      }
  }

  onConfigLoaded(componentConfig) {
      if (componentConfig && componentConfig.config) {
          let actionGroups = [];

          if (componentConfig.config.actionGroups) {
              let actionsData = DataHelper.convertObjectToArray(componentConfig.config.actionGroups);
              for (let data in actionsData) {
                  if (actionsData[data].actions) {
                      actionsData[data].actions = DataHelper.convertObjectToArray(actionsData[data].actions);
                  }
              }
              this.actionsData = actionsData;
              return;
          }
      }
      this.visible = false;
  }

  _onActionItemTap(e, detail, sender) {
      if (detail && detail.data) {

          //Want to open same path, then close the existing and reopen newly
          if (this.pageRoute.path == ("/" + detail.data.dataRoute)) {
              ComponentHelper.closeBusinessFunction();
          }

          let mainApp = RUFUtilities.mainApp;

          let dataRoute = detail.data.dataRoute;
          let contextData = detail.data.contextData;
          let sharedData = detail.data.sharedData;
          let params = {};

          let type = contextData && contextData.itemContext ? contextData.itemContext.type : '';
          if (type) {
              params["type"] = type;
          }

          if(dataRoute == "upload-assets"){
              let randomId = ElementHelper.getRandomId();
              params["uid"] = randomId;
          }

          if(!_.isEmpty(sharedData)) {
              params["sharedData"] = sharedData;
          }

          this.setState(params);
          ComponentHelper.setQueryParamsWithoutEncode({ "state": this.getQueryParamFromState() });
          mainApp.changePageRoutePath(dataRoute);
      }
  }
}
customElements.define(RockQuickActions.is, RockQuickActions);
