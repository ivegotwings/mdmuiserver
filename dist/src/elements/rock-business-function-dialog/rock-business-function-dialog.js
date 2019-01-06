/**
`rock-business-function-dialog` Represents a component that 
renders the "rock-wizard" component in a dialog along with the functionalities of 
business function framework.

@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-business-function-behavior/bedrock-business-function-behavior.js';
import '../bedrock-helpers/component-helper.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import '../bedrock-style-manager/styles/bedrock-style-scroll-bar.js';
import '../rock-wizard/rock-wizard.js';
import '../rock-wizard/rock-wizard-manage.js';
import '../rock-layout/rock-layout.js';
import '../rock-component-config-behavior/rock-component-config-behavior.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../pebble-dialog/pebble-dialog.js';
// import { importHref } from '@polymer/polymer/lib/utils/import-href.js';
import { resolveUrl } from '@polymer/polymer/lib/utils/resolve-url.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockBusinessFunctionDialog extends mixinBehaviors([RUFBehaviors.UIBehavior, RUFBehaviors.BusinessFunctionBehavior, RUFBehaviors.ComponentConfigBehavior], PolymerElement) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-scroll-bar bedrock-style-grid-layout">
            pebble-dialog {
                @apply --dialog-component;
                --pebble-grid-container: {
                    margin-left: 0px;
                    margin-right: 0px;
                }
                --pebble-grid-container-header: {
                    padding: 0px;
                }
                --rock-search-bar: {
                    margin-bottom: 10px;
                }
                --dialog-component: {
                    overflow: visible;
                }
            }
            .businessFunctionDialog-content{
                height:85vh;
                --overflow-dialog-content:{
                    overflow-y: auto;
                    overflow-x:hidden;
                }
                --stepper-wrapper:{
                    margin: 0 -20px;
                }
            }
        </style>
        <div id="stepProviders"></div>
        <pebble-dialog id="businessFunctionDialog" is-part-of-business-function="" modal="" horizontal-align="auto" vertical-align="auto" show-close-icon="" no-cancel-on-outside-click="" no-cancel-on-esc-key="" dialog-title="[[title]]">
            <div class="businessFunctionDialog-content">
                <div class="full-height">
                    <template is="dom-if" if="{{isConfigLoaded(config)}}" restamp="">
                        <template is="dom-if" if="[[!isBFV2Flow]]">
                            <rock-wizard id="rockWizard" config="{{wizardConfig}}" readonly="[[readonly]]" shared-data="{{sharedData}}" on-first-step-cancelled="_onFirstStepCancelled" on-next-step="_onNextStep" on-cancel-event="_onCancel" hide-stepper="[[hideStepper]]" no-steps="[[noSteps]]" no-data-message="[[noDataMessage]]"></rock-wizard>
                        </template>
                        <template is="dom-if" if="[[isBFV2Flow]]">
                                <rock-wizard-manage id="rockWizardManage" config="{{wizardConfig}}" readonly="[[readonly]]" shared-data="{{sharedData}}" on-first-step-cancelled="_onFirstStepCancelled" on-next-step="_onNextStep" on-cancel-event="_onCancel" hide-stepper="[[hideStepper]]" no-steps="[[noSteps]]" no-data-message="[[noDataMessage]]"></rock-wizard-manage>
                            </template>
                    </template>
                </div>
            </div>
        </pebble-dialog>
        <bedrock-pubsub on-bedrock-event-business-dialog-opened="_onOpenBusinessFunctionDialog" name="bedrock-event-business-dialog-opened"></bedrock-pubsub>
        <bedrock-pubsub event-name="on-buttonclose-clicked" handler="_closeDialog"></bedrock-pubsub>
`;
  }

  static get is() {
      return "rock-business-function-dialog";
  }

  static get properties() {
      return {
          config: {
              type: Object,
              value: function () { return {}; },
              observer: '_setLabelAsTitle'
          },

          /**
           * If set as true , it indicates the component is in read only mode
           */
          readonly: {
              type: Boolean,
              value: false
          },

          title: {
              type: String,
              value: function () { return ""; }
          },

          dialog: {
              type: Object
          },

          subName: {
              type: String
          },

          contextData: {
              type: Object
          },

          hideStepper: {
              type: Boolean
          },
          isBFV2Flow: {
              type: Boolean,
              value: false
          }
      };
  }

  constructor() {
      super();
  }

  connectedCallback() {
      super.connectedCallback();

      RUFUtilities.activeBusinessFunctionDialog = this;
      this.dialog = this.shadowRoot.querySelector("#businessFunctionDialog");
  }

  disconnectedCallback() {
      super.disconnectedCallback();
  }

  open() {
      this.config = {};
      if (!_.isEmpty(this.contextData)) {
          let context = DataHelper.cloneObject(this.contextData);
          //App specific
          let appName = ComponentHelper.getCurrentActiveAppName();
          if (appName) {
              context[ContextHelper.CONTEXT_TYPE_APP] = [{
                  "app": appName
              }];
          }
          this.requestConfig(this.name, context);
      }

  }

  onConfigLoaded(componentConfig) {
      if (componentConfig && componentConfig.config) {
          let config = componentConfig.config;
          this.set("noSteps", false);
          this.isBFV2Flow = !!(config && config.isBFV2Flow);
          this.hideStepper = !!(config.hideStepper);

          if (this.subName) {
              if (config[this.subName]) {
                  config = config[this.subName];
              }
          }
          if (config.wizardConfig) {
              let steps = DataHelper.convertObjectToArray(config.wizardConfig.steps);
              config.wizardConfig.steps = steps;
              config = config.wizardConfig;
          }
          else if (config.steps) {
              let steps = DataHelper.convertObjectToArray(config.steps);
              config.steps = steps;
          } else {
              this.set("noSteps", true);
          }
          let self = this;
          import("../rock-business-function-elements/rock-business-function-elements.js").then(function() {
              self.config = config;
              self.dialog.open();
          });
      }
  }

  isConfigLoaded() {
      if (this.config && !_.isEmpty(this.config)) {
          return true;
      } else {
          return false;
      }
  }

  _closeDialog() {
      if(this.getIsDirty()) {
          if (window.confirm("There are unsaved changes. Do you want to discard the changes?")) {
              this.config = {};
              this.dialog.close(); 
          }
      } else {
          this.config = {};
          this.dialog.close();
      }
  }

  _onFirstStepCancelled() {
      this._closeDialog();
  }

  _onCancel() {
      this._closeDialog();
  }

  _onNextStep(e, detail) {
      if (detail) {
          if (detail.dataRoute && detail.dataRoute != "") {
              this._closeDialog();
              let mainApp = RUFUtilities.mainApp;
              if (!detail.queryParams) {
                  detail.queryParams = {};
              }
              ComponentHelper.setQueryParamsWithoutEncode(detail.queryParams);
              mainApp.changePageRoutePath(detail.dataRoute, detail.action);
          } else {
              if (detail.action) {
                  ComponentHelper.fireBedrockEvent(detail.action.name, detail.action, { ignoreId: true });
              }
              if (detail.closeBusinessFunction) {
                  this._closeDialog();
              }
          }
      }
  }

  getTitle() {
      return this.config.label;
  }

  getControlIsDirty() {
      let dialog = this.$$('#businessFunctionDialog');
      if (dialog && dialog.getControlIsDirty) {
          return dialog.getControlIsDirty();
      }
  }
  getIsDirty() {
      let wizard = this.isBFV2Flow? this.shadowRoot.querySelector("#rockWizardManage") : this.shadowRoot.querySelector("#rockWizard");
      if (wizard && wizard.getIsDirty) {
          return wizard.getIsDirty();
      }
      return false;
  }

  _setLabelAsTitle() {
      if (this.sharedData && this.sharedData.title) {
          this.setTitle(this.sharedData.title);
      }
      else {
          let title = "";
          if (this.suggestedTitle) {
              title = this.suggestedTitle;
          }

          if (this.config && this.config.label) {
              title = this.mergeTitle && title ? this.config.label + " - " + title : title || this.config.label;
          }
          this.setTitle(title);
      }
  }

  setTitle(title) {
      this.set("title", title);
  }

  _onOpenBusinessFunctionDialog(e) {
      if (!e || !e.detail) return;

      const {
              name,
          title,
          subName,
          configName,
          mergeTitle,
          sharedData,
          contextData,
          noDataMessage
          } = e.detail;

      this.name = name;
      this.configName = configName;
      this.subName = subName;
      this.contextData = contextData;
      this.sharedData = sharedData;
      this.noDataMessage = noDataMessage || "";
      this.mergeTitle = mergeTitle;
      this.suggestedTitle = title;

      this.open();
  }
}

customElements.define(RockBusinessFunctionDialog.is, RockBusinessFunctionDialog);
