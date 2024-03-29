import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-helpers/constant-helper.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-helpers/data-request-helper.js';
import '../rock-entity-model-lov/rock-entity-model-lov.js';
import '../rock-entity-lov/rock-entity-lov.js';
import '../pebble-spinner/pebble-spinner.js';
import '../pebble-spinner/pebble-spinner.js';
import '../pebble-textbox/pebble-textbox.js';
import '../pebble-toggle-button/pebble-toggle-button.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-buttons.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockUserContextSelector extends mixinBehaviors([RUFBehaviors.UIBehavior, RUFBehaviors.ComponentContextBehavior], PolymerElement) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-icons bedrock-style-padding-margin bedrock-style-buttons">
            .lov-wrapper {
                width: 100%;
                text-align: center;
            }

            .lov-container {
                width: 460px;
                display: inline-block;
                padding: 20px;
                text-align: left;
                margin: 10px 0 0 10px;
                box-shadow: 1px 2px 5px -1px var(--default-border-color, #c1cad4);
                border: var(--box-style_-_border, solid 1px var(--default-border-color, #c1cad4));
                border-radius: var(--box-style_-_border-radius);
            }

            .input {
                width: 200px;
                padding: 10px;
            }

            .toggle-input {
                width: 300px;
                padding: 10px;
            }

            pebble-toggle-button {
                padding-top: 15px;
                --pebble-toggle-button-checked-bar-color: var(--success-color, #4caf50);
                --pebble-toggle-button-checked-button-color: var(--success-color, #4caf50);
                --pebble-toggle-button-checked-ink-color: var(--success-color, #4caf50);
            }

            pebble-icon {
                --pebble-icon-dimension: {
                    width: 10px;
                    height: 10px;
                }
            }
        </style>
        <pebble-spinner active="[[_loading]]"></pebble-spinner>
        <div class="lov-wrapper">
            <div class="lov-container">
                <template is="dom-if" if="[[_isRoleModelRequestPrepared(_roleModelRequestData)]]">
                    <div id="roleDiv" class="input" hidden\$="[[_isHidden('role-selection')]]" title\$="[[selectedRole.title]]">
                        <pebble-textbox readonly="" class="role-text" on-tap="_showLOV" data-args="role" id="roleTextBox" label="Select Role" no-label-float="" value="[[selectedRole.title]]" disabled\$="[[_isDisable('role-selection')]]">
                            <pebble-icon slot="suffix" class="pebble-icon-size-10 m-r-5" id="roleDropdownIcon" icon="pebble-icon:navigation-action-down" disabled\$="[[_isDisable('role-selection')]]"></pebble-icon>
                        </pebble-textbox>
                    </div>
                    <div id="ownershipDiv" class="input" hidden\$="[[_isHidden('ownershipdata-selection')]]">
                        <pebble-textbox readonly="" on-tap="_showLOV" data-args="ownershipdata" class="owner-text" id="ownerTextBox" label="Select Ownership Data" no-label-float="" value="[[selectedOwnershipData.title]]" title="[[selectedOwnershipData.title]]" disabled\$="[[_isDisable('ownershipdata-selection', _disableOwnership)]]">
                            <pebble-icon slot="suffix" class="pebble-icon-size-10 m-r-5" id="ownershipDropdownIcon" icon="pebble-icon:navigation-action-down" disabled\$="[[_isDisable('ownershipdata-selection', _disableOwnership)]]"></pebble-icon>
                        </pebble-textbox>
                    </div>
                    <div id="saveOnlyForMeDiv" class="toggle-input" hidden\$="[[_isHidden('usermode-selection')]]">
                        <pebble-toggle-button id="saveTypeToggle" checked="{{_saveOnlyForMe}}" disabled\$="[[_isDisable('usermode-selection')]]">[[_getSaveTypeLabel(_saveOnlyForMe)]]</pebble-toggle-button>
                    </div>
                    <bedrock-pubsub event-name="entity-model-lov-selection-changed" handler="_onRoleSelection" target-id="rolesModelLov"></bedrock-pubsub>
                    <bedrock-pubsub event-name="entity-lov-selection-changed" handler="_onOwnershipDataSelection" target-id="ownershipReferenceLov"></bedrock-pubsub>
                    <liquid-entity-model-get id="getRoleModel" operation="getbyids" on-response="_onRoleModelReceived" on-error="_onRoleModelGetFailed"></liquid-entity-model-get>
                    <!-- Model popovers here -->
                    <pebble-popover class="roles-popover" id="rolesModelPopover" for="roleDropdownIcon" no-overlap="" vertical-align="auto" horizontal-align="right">
                        <rock-entity-model-lov id="rolesModelLov" id-field="id" title-pattern="{entity.properties.description}" request-data="[[_roleModelRequestData]]" selected-item="{{selectedRole}}" external-data-formatter="[[_roleDataFormatter]]" deleted-items-count="[[deletedRolesCount]]"></rock-entity-model-lov>
                    </pebble-popover>
                    <pebble-popover class="ownership-popover" id="ownershipRefDataPopover" for="ownershipDropdownIcon" no-overlap="" vertical-align="auto" horizontal-align="right">
                        <rock-entity-lov id="ownershipReferenceLov" id-field="id" request-data="[[_ownershipRequestData]]" title-pattern="{entity.name}" multi-select="[[ownershipLOVMultiSelect]]" selected-item="{{selectedOwnershipData}}"></rock-entity-lov>
                    </pebble-popover>
                </template>
            </div>
        </div>
        <div id="buttonContainer" class="buttonContainer-static">
            <pebble-button id="cancel" class="action-button btn btn-secondary m-r-10" button-text="Cancel" on-tap="_onCancelTap" elevation="1" raised=""></pebble-button>
            <pebble-button id="next" class="action-button btn btn-success" button-text="Next" on-tap="_onNextTap" elevation="1" raised=""></pebble-button>
        </div>
`;
  }

  static get is() { return 'rock-user-context-selector' }

  static get properties() {
      return {
          contextData: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          businessFunctionData: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          _roleModelRequestData: {
              type: Object,
              value: function () {
                  return {}
              }
          },

          _ownershipRequestData: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          _disableOwnership: {
              type: Boolean,
              value: false
          },

          selectedRole: {
              type: Object,
              value: function () {
                  return {}
              }
          },

          selectedOwnershipData: {
              type: Object,
              value: function () {
                  return {}
              }
          },

          _saveOnlyForMe: {
              type: Boolean,
              value: true
          },

          _roleDataFormatter: {
              type: Object,
              value: function () {
                  return this._roleDataFormatter.bind(this);
              }
          },

          deletedRolesCount: {
              type: Number,
              value: 0
          },

          visibleOptions: {
              type: Array,
              value: function () {
                  return [
                      "role-selection",
                      "ownershipdata-selection",
                      "usermode-selection"
                  ]
              }
          },

          enabledOptions: {
              type: Array,
              value: function () {
                  return [
                      "role-selection",
                      "ownershipdata-selection",
                      "usermode-selection"
                  ]
              }
          },

          _loading: {
              type: Boolean,
              value: false
          },

          _saveTypeLabel: {
              type: String,
              value: {
                  "self": "Save only for me",
                  "role": "Save for all users of selected set"
              }
          },

          ownershipLOVMultiSelect: {
              type: Boolean,
              value: false
          }
      }
  }

  get rolesModelPopover() {
      this._rolesModelPopover = this._rolesModelPopover || this.shadowRoot.querySelector("#rolesModelPopover");
      return this._rolesModelPopover;
  }

  get rolesModelLov() {
      this._rolesModelLov = this._rolesModelLov || this.shadowRoot.querySelector("#rolesModelLov");
      return this._rolesModelLov;
  }

  get ownershipRefDataPopover() {
      this._ownershipRefDataPopover = this._ownershipRefDataPopover || this.shadowRoot.querySelector("#ownershipRefDataPopover");
      return this._ownershipRefDataPopover;
  }

  get ownershipReferenceLOV() {
      this._ownershipReferenceLOV = this._ownershipReferenceLOV || this.shadowRoot.querySelector("#ownershipReferenceLov");
      return this._ownershipReferenceLOV;
  }

  get saveTypeToggle() {
      this._saveTypeToggle = this._saveTypeToggle || this.shadowRoot.querySelector("#saveTypeToggle");;
      return this._saveTypeToggle;
  }

  get roleModelLiq() {
      this._roleModelLiq = this._roleModelLiq || this.shadowRoot.querySelector("#getRoleModel");
      return this._roleModelLiq;
  }

  get loggedUser() {
      this._loggedUser = this._loggedUser || ContextHelper.getFirstUserContext(this.contextData);
      return this._loggedUser;
  }

  connectedCallback() {
      super.connectedCallback();
      this._loading = true;
      this._prepareRoleModelRequest();
  }

  _isRoleModelRequestPrepared() {
      if (this._roleModelRequestData && !_.isEmpty(this._roleModelRequestData)) {
          return true;
      }
      return false;
  }

  _prepareRoleModelRequest() {
      let req = DataRequestHelper.createGetModelRequest("role");
      req.params["sort"] = {
          "properties": [
              {
                  "name": "_ASC",
                  "sortType": ConstantHelper.getDataTypeConstant("string")
              }
          ]
      }
      delete req.params.fields.attributes;
      delete req.params.fields.relationships;
      delete req.params.query.ids;
      req.params.fields.properties = ["_ALL"];
      this.set("_roleModelRequestData", req);
  }

  _roleDataFormatter(formattedData, data) {
      this.deletedRolesCount = 0;
      if (formattedData && formattedData.length > 0) {
          formattedData = formattedData.filter((role) => {
              let roleData = data.filter((eModel) => { return eModel.id == role.id; });
              if(roleData && roleData.length > 0 && 
                 roleData[0].properties && roleData[0].properties.ownershipEntityTypeName) {
                  role["ownershipEntityTypeName"] = roleData[0].properties.ownershipEntityTypeName;
              }
              role.id = role.id.replace("_role", "");
              return role;
          });
      }
      if (_.isEmpty(this.selectedRole)) {
          this._setCurrentRoleSelected();
      }
      this.deletedRolesCount = data.length - formattedData.length;
      return formattedData;
  }

  _setCurrentRoleSelected() {
      if (this.businessFunctionData && this.businessFunctionData.selectedOptions &&
          this.businessFunctionData.selectedOptions.role != "_DEFAULT") {
          this.selectedRole = this.businessFunctionData.selectedOptions.role;
          this._triggerOwnershipData();
          return;
      }

      //Trigger request to get current user role details
      if (this.loggedUser && this.loggedUser.defaultRole) {
          let roleId = this.loggedUser.defaultRole + "_role";
          let req = DataRequestHelper.createGetModelRequest("role", [roleId]);
          if(this.roleModelLiq) {
              this.roleModelLiq.requestData = req;
              this.roleModelLiq.generateRequest();
          }
      }
  }

  _onRoleModelReceived(e, detail) {
      if(DataHelper.isValidObjectPath(detail, "response.content.entityModels.0")) {
          let role = detail.response.content.entityModels[0];
          let selectedRole = {
              "id": role.id.replace("_role", ""),
              "title": role.name
          }

          if (role.properties && role.properties.ownershipEntityTypeName) {
              selectedRole["ownershipEntityTypeName"] = role.properties.ownershipEntityTypeName;
              this._disableOwnership = false;
          } else {
              this._disableOwnership = true;
          }

          this.selectedRole = selectedRole;
          this._triggerOwnershipData();
      }
  }

  _onRoleModelGetFailed(e, detail) {
      this.logError("An error occured in fetching the current role.");
  }

  _onNextTap() {
      this._loading = false;
      let eventName = "onNext";
      let eventDetail = {
          name: eventName,
          data: {}
      }
      //Prepare data as per selection, and pass the same as businessFunctionData
      if (!this.businessFunctionData) {
          this.businessFunctionData = {};
      }
      this.businessFunctionData.selectedOptions = this._getSelectedOptions();
      ComponentHelper.getParentElement(this).businessFunctionData = this.businessFunctionData;
      this.fireBedrockEvent(eventName, eventDetail, {
          ignoreId: true
      });
  }

  _onCancelTap() {
      let eventName = "onCancel";
      let eventDetail = {
          name: eventName,
          data: {}
      }
      this.fireBedrockEvent(eventName, eventDetail, {
          ignoreId: true
      });
  }

  _showLOV(e) {
      let target = e.currentTarget;
      if(target.hasAttribute("disabled")) {
          return;
      }
      let popoverFor = target.getAttribute("data-args");
      let popover = "";
      if (popoverFor == "role") {
          popover = this.rolesModelPopover;
      } else if (popoverFor == "ownershipdata") {
          popover = this.ownershipRefDataPopover;
      }

      if (popover) {
          popover.show();
      }
  }

  _isHidden(component) {
      if (!_.isEmpty(this.visibleOptions) && this.visibleOptions.indexOf(component) != -1) {
          return false;
      }

      return true;
  }

  _isDisable(component, disableFlag) {
      if (!_.isEmpty(this.enabledOptions) && this.enabledOptions.indexOf(component) != -1 && !disableFlag) {
          return false;
      }

      return true;
  }

  _getSelectedOptions() {
      let data = { "role": "_DEFAULT", "ownershipData": "_DEFAULT", "saveType": "self" };

      if (!this._isHidden("role-selection") && this.selectedRole) {
          data.role = this.selectedRole;
      }

      if (!this._isHidden("ownershipdata-selection") && this.selectedOwnershipData) {
          data.ownershipData = this.selectedOwnershipData;
      }

      if (this._isHidden("usermode-selection") || !this._saveOnlyForMe) {
          data.saveType = "role";
      }

      return data;
  }

  _onRoleSelection() {
      this._triggerOwnershipData(); //Refresh ownershipdata on role selection
      this._closePopover(this.rolesModelPopover);
  }

  _onOwnershipDataSelection() {
      this._closePopover(this.ownershipRefDataPopover);
  }

  _closePopover(popover) {
      if (popover) {
          popover.close();
      }
  }

  _triggerOwnershipData() {
      if(this.businessFunctionData && this.businessFunctionData.selectedOptions && this.businessFunctionData.selectedOptions.ownershipData) {
          this.selectedOwnershipData = this.businessFunctionData.selectedOptions.ownershipData;
      } else {
          if (this.loggedUser && this.loggedUser.defaultRole && this.selectedRole.id == this.loggedUser.defaultRole &&
              this.ownershipData && this.ownershipData != "undefined") {
              this.selectedOwnershipData = {
                  "id": this.ownershipData,
                  "title": this.ownershipData
              }
          } else {
              this.selectedOwnershipData = {};
          }
      }
      this._disableOwnership = true;
      if (this.selectedRole && this.selectedRole.ownershipEntityTypeName) {
          let types = [this.selectedRole.ownershipEntityTypeName];
          this._ownershipRequestData = DataRequestHelper.createGetReferenceRequest(this.contextData, types);
          this._disableOwnership = false;
          if (this.ownershipReferenceLOV) {
              this.ownershipReferenceLOV.reset();
          }
      }
      this._setSaveTypeToggle();
      if(this.businessFunctionData && this.businessFunctionData.selectedOptions) {
          delete this.businessFunctionData.selectedOptions //Delete bf selected options
      }
      this._loading = false;
  }

  _getSaveTypeLabel(saveOnlyForMe) {
      if (saveOnlyForMe) {
          return this._saveTypeLabel.self;
      }

      return this._saveTypeLabel.role;
  }

  _setSaveTypeToggle() {
      let saveOnlyForMe = true;
      if (this.loggedUser && this.loggedUser.defaultRole && this.selectedRole.id != this.loggedUser.defaultRole) {
          saveOnlyForMe = false;
          if (this.saveTypeToggle) {
              this.saveTypeToggle.setAttribute("disabled", "");
          }
      } else {
          if (this.saveTypeToggle) {
              this.saveTypeToggle.removeAttribute("disabled");
          }
      }

      if (this.businessFunctionData && this.businessFunctionData.selectedOptions && this.businessFunctionData.selectedOptions.saveType != "self") {
          this._saveOnlyForMe = false;
      } else {
          this._saveOnlyForMe = saveOnlyForMe;
      }
  }
}

customElements.define(RockUserContextSelector.is, RockUserContextSelector);
