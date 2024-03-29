/**
`rock-scope-create-edit` Represents an element that displays the form to create or edit a scope.
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-radio-group/paper-radio-group.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-helpers/element-helper.js';
import '../pebble-icons/pebble-icons.js';
import '../pebble-dropdown/pebble-dropdown.js';
import '../pebble-checkbox/pebble-checkbox.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-text-alignment.js';
import '../bedrock-style-manager/styles/bedrock-style-fonts.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockScopeCreateEdit extends mixinBehaviors([RUFBehaviors.UIBehavior], PolymerElement) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-icons bedrock-style-fonts bedrock-style-padding-margin bedrock-style-padding-margin bedrock-style-text-alignment">
            :host {
                --paper-input-container-label: {
                    font-size: var(--default-font-size, 14px) !important;
                    color: var(--input-label-color, #96b0c6);
                    line-height: 17px;
                    margin-top: 17px;
                }
                --paper-input-container: {
                    padding-top: 0px;
                    padding-right: 0px;
                    padding-bottom: 0px;
                    padding-left: 0px;
                    margin-top: 0px;
                    margin-right: 0px;
                    margin-bottom: 0px;
                    margin-left: 0px;
                    @apply --textarea-container;
                }
                ;
                --paper-input-container-label: {
                    font-size: var(--default-font-size, 14px) !important;
                    color: var(--input-label-color, #96b0c6);
                    line-height: 17px;
                    margin-top: 17px;
                }
                ;
                --paper-input-container-label-focus: {
                    /* -webkit-transform: translateY(-75%) scale(0.75);
              transform: translateY(-75%) scale(0.75); */
                    color: var(--input-label-color, #96b0c6);
                }
                ;
                --paper-input-container-invalid-color: var(--invalid-line);
                --paper-input-container-underline: {
                    border-bottom: 1px solid var(--textbox-border);
                }
                ;
                --paper-input-container-underline-focus: {
                    border-bottom: 1px solid var(--focused-line, #026bc3);
                }
                ;
                --paper-input-container-input: {
                    font-size: var(--default-font-size, 14px) !important;
                    margin-top: 15px;
                    line-height: 20px !important;
                    max-height: 100px;
                }
                ;
            }

            pebble-dropdown {
                --paper-dropdown-menu: {
                    padding-top: 0px;
                }
                ;
            }

            .revert {
                display: flex;
                flex-direction: row-reverse;
            }

            paper-radio-group paper-radio-button {
                padding: 5px 0 !important;
                --paper-radio-button-unchecked-color: var(--radio-button-border, #026bc3);
                --paper-radio-button-checked-color: var(--radio-button-selected, #026bc3);
            }

            paper-listbox #listbox {
                padding: 0;
            }

            /* IE edge specific fix for paper-radio-button */

            _:-ms-lang(x),
            _:-webkit-full-screen,
            paper-radio-button {
                --paper-radio-button-radio-container: {
                    margin-right: 10px;
                }
            }
        </style>

        <div class="veritical layout container">
            <div class="p-0">
                <div class="revert">
                    <pebble-icon name="revert" class="pebble-icon-size-16 m-l-5" icon="pebble-icon:revert" title="Revert" on-tap="_onRevertClick" tabindex="-1"></pebble-icon>
                </div>
                <pebble-dropdown id="scopesDropdown" noink="" label="EDIT SCOPE" items="{{_scopeItems}}"></pebble-dropdown>
                <bedrock-pubsub on-bedrock-event-dropdown-value-change="onDropdownValueChange" name="bedrock-event-dropdown-value-change"></bedrock-pubsub>
            </div>
            <div class="p-0">
                <paper-input id="scopeNameId" label="NEW SCOPE NAME" required="" auto-validate="" always-float-label="" error-message="required" value="{{name}}"></paper-input>
            </div>
            <div class="veritical layout m-t-20">
                <div>
                    <span class="font-12">Who can use this scope?</span>
                </div>
                <div>
                    <paper-radio-group aria-labelledby="accessroles" selected="{{_accessType}}">
                        <paper-radio-button name="_SELF">Only I can use this</paper-radio-button>
                        <br>
                        <paper-radio-button name="_ROLE">All Others with my role can use this</paper-radio-button>
                        <br>
                        <paper-radio-button name="_ALL">Everybody in my enterprise can use this</paper-radio-button>
                    </paper-radio-group>
                </div>
            </div>
            <div class="buttons text-center m-t-15 p-0">
                <pebble-button class="cancel btn btn-secondary m-r-10" button-text="Cancel" noink="" elevation="2" on-tap="_onCancelTap"></pebble-button>
                <pebble-button class="save btn btn-success" button-text="Save" noink="" elevation="2" on-tap="_onSaveTap"></pebble-button>
            </div>
        </div>
`;
  }

  static get is() {
      return "rock-scope-create-edit";
  }
  static get properties() {
      return {
          /**
           * Indicates the title for the create or edit saved search popover.
           */
          title: {
              type: String,
              value: "Create or Edit Scope",
              notify: true
          },
          /**
           * Indicates the create or edit mode for the saved search.
           */
          editMode: {
              type: Boolean,
              notify: true
          },

          /**
           * Indicates the search identification to select the details from the drop-down.
           */
          scopeId: {
              type: Number,
              value: null,
              notify: true
          },
          /**
           * Indicates the saved searches.
           */
          scopes: {
              type: Object,
              value: function () {
                  return {};
              },
              observer: '_scopesChanged'
          },
          /**
           * Indicates all saved search names for dropdown.
           */
          _scopeItems: {
              type: String,
              value: ""
          },

          _allScopeItems: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          /**
           * Indicates the name of the saved search.
           */
          name: {
              type: String,
              value: "",
              notify: true
          },
          /**
           * Indicates the access type, valid values are _SELF / _ROLE / _ALL
           */
          _accessType: {
              type: String,
              value: '_SELF',
              notify: true
          }
      }
  }
  connectedCallback() {
      super.connectedCallback();
      this.addEventListener('change', this._onDropdownChange);
  }
  disconnectedCallback() {
      super.disconnectedCallback();
      this.removeEventListener('change', this._onDropdownChange);
  }
  _scopesChanged() {
      if (this.scopes) {
          let existingScopes = this._allScopeItems = [];

          if (!this.scopes ||
              !this.scopes["my-scopes"] ||
              !this.scopes["shared-scopes"]) {
              return;
          }

          this._allScopeItems = this.scopes["my-scopes"].concat(this.scopes["shared-scopes"]);

          //my-searches, shared-searches
          for (let i = 0; i < this._allScopeItems.length; i++) {
              existingScopes.push(this._allScopeItems[i].name);
          }

          this._scopeItems = existingScopes.join(",");

          this._resetControlValues();
      }
  }

  /**
   * Can be used to denote the actions that happens on clicking the create or edit button.
   * If selected saved search is available, then specific search details are loaded.
   * Otherwise, input field for new creation is focused.
   */
  OnCreateEditButtonClick() {

      let selectedIndex = -1;

      if (this.scopeId) {
          for (let i = 0; i < this._allScopeItems.length; i++) {
              if (this._allScopeItems[i].id == this.scopeId) {
                  selectedIndex = i;
              }
          }

          this.async(function () {
              this.$$('pebble-dropdown').selectedIndex = selectedIndex;
          });
      }

      if (!this.scopeId || selectedIndex == -1) {
          if (this.$$('pebble-dropdown')) {
              this.$$('pebble-dropdown').selectedIndex = selectedIndex;
          }

          this.async(function () {
              this.$$('#scopeNameId').focus();
          });
      }
  }
  _onRevertClick() {
      let editScope = this.shadowRoot.querySelector("#scopesDropdown");
      let newScope = this.shadowRoot.querySelector("#scopeNameId");

      if (editScope && newScope) {
          editScope.selectedIndex = -1;
          newScope.value = "";
      }
  }
  _onDropdownChange(e) {
      let path = ElementHelper.getElementPath(e);
      if (path[0].id == "scopesDropdown" && e.detail != undefined) {
          let selectedIndex = e.detail.newValue;

          if (selectedIndex != -1) {
              let dropdownElement = this.$$('pebble-dropdown');
              let selectedValue = dropdownElement.selectedValue;

              // Get the object for the current selected saved search
              if (this._allScopeItems && selectedValue) {
                  let savedSearchObject = {};
                  for (let i = 0; i < this._allScopeItems.length; i++) {
                      if (this._allScopeItems[i].name == selectedValue) {
                          savedSearchObject = this._allScopeItems[i];
                          break;
                      }
                  }

                  // Set the values for all the controls accordingly
                  this.name = savedSearchObject.name;
                  this._accessType = savedSearchObject.accesstype;
              }
          }
      }
  }
  _onCancelTap(e) {
      this._resetControlValues();
      this.editMode = false;
      this.fireBedrockEvent('cancel-scope', null, {
          ignoreId: true
      });
  }
  _onSaveTap(e) {
      // fire the validation to check if name is given or not. If given, get the saved search name
      let inputElement = this.$$('paper-input');
      let flag = inputElement.validate();
      if (!flag || this.name.trim() == '') {
          return;
      }

      let _scopesDropdown = this.$$('#scopesDropdown');
      let _selectedScope = {};
      if (_scopesDropdown) {
          _selectedScope = this._allScopeItems[_scopesDropdown.selectedIndex];
      }

      let scopeObject = {
          name: this.name,
          accesstype: this._accessType,
          selectedScope: _selectedScope
      }

      this.fireBedrockEvent('save-scope', scopeObject, {
          ignoreId: true
      });
      this._resetControlValues();
      this.editMode = false;
  }
  /*
   * Re-usable function to clear all control values
   */
  _resetControlValues() {

      let dropdownElement = this.$$('pebble-dropdown');
      if (dropdownElement != undefined) {
          dropdownElement.selectedValue = "";
      }

      //clear all the control values
      let inputElement = this.$$('paper-input');
      if (inputElement != undefined) {
          this.name = "";
          inputElement.removeAttribute("required");
          inputElement.validate();
          inputElement.setAttribute("required", true);
      }

      //Reset to default
      this._accessType = "_SELF"; //Reset to default
  }
}
customElements.define(RockScopeCreateEdit.is, RockScopeCreateEdit);
