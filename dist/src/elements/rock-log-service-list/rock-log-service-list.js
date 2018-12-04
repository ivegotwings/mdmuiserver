/**
`<rock-log-service-list>`
<b><i>Content development is under progress... </b></i>

@group rock Elements
@element rock-log-service-list
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import '@polymer/paper-tooltip/paper-tooltip.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-helpers/format-helper.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-buttons.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-gridsystem.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-button/pebble-button.js';
import '../pebble-popover/pebble-popover.js';
import '../pebble-dropdown/pebble-dropdown.js';
import '../pebble-toggle-button/pebble-toggle-button.js';
import '../rock-search-bar/rock-search-bar.js';
import '../rock-grid/rock-grid.js';
import '../rock-component-config-behavior/rock-component-config-behavior.js';
import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockLogServiceList
    extends mixinBehaviors([
        RUFBehaviors.UIBehavior,
        RUFBehaviors.ComponentConfigBehavior
    ], OptionalMutableData(PolymerElement)) {
  static get template() {
    return Polymer.html`
        <style include="bedrock-style-common bedrock-style-gridsystem bedrock-style-padding-margin bedrock-style-buttons">
            :host {
                display: block;
                height: 100%;
            }

            rock-grid {
                --pebble-grid-container: {
                    margin-top: 10px;
                    margin-left: 20px;
                    margin-right: 0px;
                    margin-bottom: 0;
                }
                --data-table-cell-width: {
                    flex-basis: 0px;
                }
            }

            .rock-log-servie-wrapper {
                height: calc(100% - 50px)
            }

            _:-ms-lang(x),
            _:-webkit-full-screen {
                vertical-align: top;
            }
        </style>
        <div class="rock-log-servie-wrapper">
            <rock-grid id="importlistGrid" config="{{gridConfig}}" attribute-models="{{_attributeModels}}" page-size="50" data="[[loggerArray]]">
                <pebble-toolbar id="toolbar" readonly="[[readonly]]" slot="toolbar" config-data="[[_toolbarConfig]]"></pebble-toolbar>
                <bedrock-pubsub event-name="toolbar-button-event" handler="_onToolbarEvent" target-id="toolbar"></bedrock-pubsub>
            </rock-grid>

            <div id="buttonContainer" hidden="" class="buttonContainer-static">
                <pebble-button class="btn btn-secondary m-r-5" button-text="Cancel" on-tap="_cancelAction" noink=""></pebble-button>
                <pebble-button id="statusIcon" class="btn btn-success log-save-button" button-text="Save" on-click="_handleSave"></pebble-button>

            </div>
        </div>
        <liquid-rest id="loggerConfigGet" url="/data/logger/getconfig" method="GET" on-liquid-response="_onLoggerConfigGetResponse" on-liquid-error="_onLoggerConfigGetError"></liquid-rest>
        <liquid-rest id="loggerConfigSave" url="/data/logger/setconfig" method="POST" on-liquid-response="_onLoggerConfigSaveResponse" on-liquid-error="_onLoggerConfigSaveError"></liquid-rest>
`;
  }

  static get is() { return 'rock-log-service-list' }

  static get properties() {
      return {
          config: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          gridConfig: {
              type: Object,
              value: function () {
                  return {};
              },
              notify: true
          },
          contextData: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          loggerObj: {
              type: Object,
              value: function () {
                  return {};
              },
          },
          _toolbarConfig: {
              type: Object,
              value: function () {
                  return {};
              },
          },
          loggerArray: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          _attributeModels: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          logger: {
              type: Array,
              value: [{
                  "value": "trace",
                  "title": "trace"
              },
              {
                  "value": "debug",
                  "title": "debug"
              },
              {
                  "value": "info",
                  "title": "info"
              },
              {
                  "value": "warn",
                  "title": "warn"
              },
              {
                  "value": "error",
                  "title": "error"
              },
              {
                  "value": "fatal",
                  "title": "fatal"
              }]
          },
          attributeModelObject: {
              type: String,
              value: function () {
                  return {};
              }
          }
      }
  }
  disconnectedCallback() {
      super.disconnectedCallback();
      this.removeEventListener("editMode", this._onEditMode);
  }
  connectedCallback() {
      super.connectedCallback();
      this.addEventListener("editMode", this._onEditMode);
  }
  _onTenantFilterChange(e) {
      let chkbox = e.currentTarget;
      if (chkbox.checked) {
          this.enableAccrossTenant = true;
      } else {
          this.enableAccrossTenant = "";
      }
  }
  _onUserFilterChange(e) {
      let chkbox = e.currentTarget;
      if (chkbox.checked) {
          this.enableAccrossUsers = true;
      } else {
          this.enableAccrossUsers = "";
      }
  }
  _onEditMode() {
      let buttonContainer = this.shadowRoot.querySelector('div[id=buttonContainer]');
      if (buttonContainer) {
          buttonContainer.hidden = false;
      }
  }
  _cancelAction() {
      this.set("gridConfig.mode", "Read");
  }
  ready() {
      super.ready();
      this._getLoggerConfigData();
  }
  _onToolbarEvent(e, detail) {
      this.fireBedrockEvent("rock-toolbar-button-event", detail);
  }
  _onLoggerConfigGetResponse(e) {
      this.set("loggerObj", e.detail.response);
      this._setLoggerData();
  }
  _getLoggerConfigData() {
      let loggerConfigGet = this.shadowRoot.querySelector("#loggerConfigGet");
      loggerConfigGet.generateRequest();
  }
  _setLoggerData(keywordSearchText) {
      let arr = [];
      let _level;
      for (let key in this.loggerObj) {
          if (this.loggerObj[key] && this.loggerObj[key].level) {
              _level = this.loggerObj[key].level;
              if (keywordSearchText) {
                  if (key.indexOf(keywordSearchText) > -1) {
                      arr.push({ logName: key, logLevel: _level });
                  }
              } else {
                  arr.push({ logName: key, logLevel: _level });
              }
          }
      }
      this.set("loggerArray", arr);
  }
  _handleSave() {
      //todo need to handle save functionality
      let finalObj = {};
      for (let i = 0; i < this.loggerArray.length; i++) {
          finalObj[this.loggerArray[i]["logName"]] = { level: this.loggerArray[i]["logLevel"] }
      }
      if (DataHelper.compareObjects(finalObj, this.loggerObj)) {
          this.showInformationToast("No changes to save.");
      } else {
          //finalObj.globalSettings = {tenant: this.enableAccrossTenant, user: this.enableAccrossUsers};
          this.generateSaveRequest(finalObj, "update");
      }
  }
  generateSaveRequest(reqData, operation) {
      let configSaveService = this.shadowRoot.querySelector('#loggerConfigSave');

      if (configSaveService) {
          configSaveService.operation = operation;
          configSaveService.requestData = reqData;
          configSaveService.generateRequest();
      }
  }
  _onLoggerConfigSaveResponse(e) {
      this.set("loggerObj", e.detail.response);
      this._setLoggerData();
      this.showSuccessToast("Logs Update request submitted successfully.");
  }
  _onLoggerConfigSaveError(e) {
      this.logError("Error in updating logs, contact administrator.", e.detail);
  }
  static get observers() {
      return [
          '_contextDataChanged(contextData)'
      ]
  }

  _contextDataChanged(contextData) {
      afterNextRender(this, () => {
          if (!_.isEmpty(contextData)) {
              let context = DataHelper.cloneObject(this.contextData);
              //App specific
              let appName = ComponentHelper.getCurrentActiveAppName();
              if (appName) {
                  context[ContextHelper.CONTEXT_TYPE_APP] = [{
                      "app": appName
                  }];
              }
              this.requestConfig('rock-log-service-list', context);
          }
      });
  }
  onConfigLoaded(componentConfig) {
      if (componentConfig && componentConfig.config) {
          this.config = componentConfig.config;
          let _gridConfig = this.config.gridConfig;
          
          let _attributeModelObject = {
              "logLevel": {
                  "name": "logLevel", "externalName": "Component Rule",
                  "description": "",
                  "dataType": "string",
                  "groupName": "Basic",
                  "displayType": "Dropdown",
                  "displaySequence": "",
                  "allowedValues": this.logger,
                  "hasWritePermission": true,
              }

          };
          let buttonItems = {
              "basic": {
                  "buttons": {
                      "edit": {
                          "name": "edit",
                          "icon": "pebble-icon:action-edit",
                          "text": "",
                          "visible": true,
                          "tooltip": "Edit",
                          "intent": "write"
                      }
                  }
              }
          }
          let writePermission = true;
          if (_gridConfig.hasOwnProperty('hasWritePermission')) {
              writePermission = _gridConfig.hasWritePermission;
          };
          buttonItems = DataHelper.convertObjectToArray(buttonItems);
          for (let i = 0; i < buttonItems.length; i++) {
              buttonItems[i].buttons = DataHelper.convertObjectToArray(buttonItems[i].buttons);
              let buttons = buttonItems[i].buttons;
              if (!writePermission) {
                  for (let j = 0; j < buttons.length; j++) {
                      if (buttons[j].intent === "write") {
                          buttons[j].visible = false;
                      }
                  }
              }
          }
          this.set("_toolbarConfig", { buttonItems })
          this.set("_attributeModels", _attributeModelObject);
          this.set("gridConfig", _gridConfig);
      }
  }
}
customElements.define(RockLogServiceList.is, RockLogServiceList)
