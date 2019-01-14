import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import '../bedrock-app-behavior/bedrock-app-behavior.js';
import '../bedrock-business-function-behavior/bedrock-business-function-behavior.js';
import '../bedrock-logger-behavior/bedrock-logger-behavior.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-helpers/component-helper.js';
import '../bedrock-helpers/context-helper.js';
import '../liquid-config-get/liquid-config-get.js';
import '../pebble-icons/pebble-icons.js';
import '../pebble-actions/pebble-actions.js';
import '../rock-layout/rock-layout.js';
import '../rock-layout/rock-titlebar/rock-titlebar.js';
import '../rock-wizard/rock-wizard.js';
import '../rock-wizard/rock-wizard-manage.js';
import '../rock-component-config-behavior/rock-component-config-behavior.js';
import '../rock-business-function-elements/rock-business-function-elements.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class AppBusinessFunction
    extends mixinBehaviors([
        RUFBehaviors.AppBehavior,
        RUFBehaviors.BusinessFunctionBehavior,
        RUFBehaviors.ComponentConfigBehavior,
        RUFBehaviors.LoggerBehavior
    ], PolymerElement) {
  static get template() {
    return Polymer.html`
        <style include="bedrock-style-common">
            rock-wizard, rock-wizard-manage {
                display: block;
                overflow-x: hidden;
                overflow-y: auto;
                @apply --app-business-function-content-height;
            }

            :host {
                --scroller: {
                    overflow-x: hidden;
                }
            }
        </style>
        <rock-layout>
            <div id="stepProviders"></div>
            <rock-titlebar slot="rock-titlebar" icon="pebble-icon:dashboard-user" main-title="[[config.label]]" non-closable="[[config.nonClosable]]" non-minimizable="[[config.nonMinimizable]]"></rock-titlebar>
            <template is="dom-if" if="[[!isBFV2Flow]]">
                <rock-wizard config="{{wizardConfig}}" shared-data="[[sharedData]]" on-first-step-cancelled="_onFirstStepCancelled" on-next-step="_onNextStep" on-cancel-event="_onCancel" hide-stepper="[[hideStepper]]"></rock-wizard>
            </template>
            <template is="dom-if" if="[[isBFV2Flow]]">
                <rock-wizard-manage id="wizardManage" config="{{wizardConfig}}" shared-data="[[sharedData]]" on-first-step-cancelled="_onFirstStepCancelled" on-next-step="_onNextStep" on-cancel-event="_onCancel" hide-stepper="[[hideStepper]]"></rock-wizard-manage>
            </template>
        </rock-layout>
`;
  }

  static get is() { return 'app-business-function' }

  static get properties() {
      return {
          contextData: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          config: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          entityType: {
              type: String,
              value: null
          },
          appName: {
              type: String,
              value: "app-business-function"
          },
          hideStepper: {
              type: Boolean,
              value: false
          },
          isBFV2Flow: {
              type: Boolean,
              value: false
          }
      }
  }

  constructor() {
      super();                
  }
  disconnectedCallback() {
      super.disconnectedCallback();
  }
  connectedCallback() {
      super.connectedCallback();
      this._searchTimeStamp = new Date().toLocaleString();
      let queryParams = DataHelper.getStateFromQueryParams(true);
      this.entityType = queryParams.type;
      let sharedData = queryParams.sharedData || {};
      sharedData["query-params"] = DataHelper.cloneObject(queryParams); //This is for initiate component from finish step

      if (this.entityType) {
          let itemContext = {
              "type": this.entityType
          };

          this.contextData[ContextHelper.CONTEXT_TYPE_ITEM] = [itemContext];
      }

      let userContext = {
          "roles": this.roles,
          "user": this.userId,
          "tenant": this.tenantId,
          "defaultRole": this.defaultRole
      };

      this.contextData[ContextHelper.CONTEXT_TYPE_USER] = [userContext];
      let valueContext = DataHelper.getDefaultValContext();
      if (valueContext) {
          this.contextData[ContextHelper.CONTEXT_TYPE_VALUE] = [valueContext];
      }
      sharedData["context-data"] = this.contextData;
      //Setting shared information to load component
      this.sharedData = sharedData;
      this.requestConfig(this.name, this.contextData);
  }


  onConfigLoaded(componentConfig) {
      if (!componentConfig || !componentConfig.config || _.isEmpty(componentConfig.config.steps)) {
          this.logError("Component configuration is missing, contact administrator.");

          this._onCancel();
          return;
      }

      let config = componentConfig.config;
      config.steps = DataHelper.convertObjectToArray(config.steps);

      if (config.hideStepper || config.steps.length == 1) {
          this.hideStepper = true;
      }

      if(config && config.isBFV2Flow) {
          this.isBFV2Flow = true;
      }

      this.set("config", config); //set the configuration
  }

  /**
* Function to display the left nav info
*/
  getAppCurrentStatus(customArgs) {
      let titleStr = "";
      if (customArgs.title) {
          titleStr = customArgs.title;
      }
      let queryParams = "";
      if (customArgs.queryParams && customArgs.queryParams.type) {
          titleStr = titleStr + " : " + customArgs.queryParams.type;
          queryParams = customArgs.queryParams;
      }
      return {
          title: titleStr,
          subTitle: "Last Opened",
          subTitleValue: this._searchTimeStamp ? this._searchTimeStamp : new Date().toLocaleString(),
          queryParams: queryParams,
          appId: this.appId
      };
  }
  _onFirstStepCancelled() {
      ComponentHelper.closeCurrentApp();
  }
  _onCancel() {
      ComponentHelper.closeCurrentApp();
  }
  _onNextStep(e, detail) {
      if (detail) {
          if (detail.dataRoute && detail.dataRoute != "") {
              ComponentHelper.closeCurrentApp();
              let mainApp = RUFUtilities.mainApp;
              if (!detail.queryParams) {
                  detail.queryParams = {};
              }
              ComponentHelper.setQueryParamsWithoutEncode(detail.queryParams);
              mainApp.changePageRoutePath(detail.dataRoute, detail.action);
          } else {
              if (detail.closeBusinessFunction) {
                  ComponentHelper.closeCurrentApp(detail.action);
              }
          }
      }
  }

  getIsDirty() {
      let wizard = this.shadowRoot.querySelector("#wizardManage");
      if (wizard && wizard.getIsDirty) {
          return wizard.getIsDirty();
      }
      return false;
  }
}
customElements.define(AppBusinessFunction.is, AppBusinessFunction)
