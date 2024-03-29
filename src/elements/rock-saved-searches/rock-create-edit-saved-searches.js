/**
`rock-create-edit-saved-searches` Represents an element that displays the form to create or edit a saved search.
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
import { microTask } from '@polymer/polymer/lib/utils/async.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-text-alignment.js';
import '../bedrock-style-manager/styles/bedrock-style-fonts.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-helpers/element-helper.js';
import '../pebble-icons/pebble-icons.js';
import '../pebble-dropdown/pebble-dropdown.js';
import '../pebble-checkbox/pebble-checkbox.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockCreateEditSavedSearches
extends mixinBehaviors([
    RUFBehaviors.UIBehavior
], PolymerElement) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-fonts bedrock-style-padding-margin bedrock-style-padding-margin bedrock-style-text-alignment">
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

                --paper-input-container-label: {
                    font-size: var(--default-font-size, 14px) !important;
                    color: var(--input-label-color, #96b0c6);
                    line-height: 17px;
                    margin-top: 17px;
                }

                --paper-input-container-label-focus: {
                    /* -webkit-transform: translateY(-75%) scale(0.75);
              transform: translateY(-75%) scale(0.75); */
                    color: var(--input-label-color, #96b0c6);
                }

                --paper-input-container-invalid-color: var(--invalid-line);

                --paper-input-container-underline: {
                    border-bottom: 1px solid var(--textbox-border);
                }

                --paper-input-container-underline-focus: {
                    border-bottom: 1px solid var(--focused-line, #026bc3);
                }

                --paper-input-container-input: {
                    font-size: var(--default-font-size, 14px) !important;
                    margin-top: 15px;
                    line-height: 20px !important;
                    max-height: 100px;
                }
            }

            .savedSearchIcon {
                color: var(--active-icon-color);
                height: 20px;
                width: 20px;
            }

            .title {
                color: var(--title-text-color, #191e22);
                font-size: var(--default-font-size, 14px);
                font-weight: var(--font-bold, bold);
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
                <pebble-dropdown id="savedSearchDropdown" noink="" label="EDIT SAVED SEARCH" items="{{_savedSearchItems}}" items-seperator="[[_itemsSeperator]]"></pebble-dropdown>
                <bedrock-pubsub on-bedrock-event-dropdown-value-change="onDropdownValueChange" name="bedrock-event-dropdown-value-change"></bedrock-pubsub>
            </div>
            <div class="p-0">
                <paper-input id="savedSearchNameId" label="NEW SAVED SEARCH NAME" required="" auto-validate="" always-float-label="" error-message="required" value="{{name}}"></paper-input>
            </div>
            <div class="veritical layout m-t-20">
                <div>
                    <span class="font-12">Who can use this saved search?</span>
                </div>
                <div>
                    <paper-radio-group aria-labelledby="accessroles" selected="{{_accessType}}">
                        <paper-radio-button name="_SELF">Only I can use this</paper-radio-button><br>
                        <paper-radio-button name="_ROLE">All Others with my role can use this</paper-radio-button> <br>
                        <paper-radio-button name="_ALL">Everybody in my enterprise can use this</paper-radio-button>
                    </paper-radio-group>
                </div>
            </div>
            <div class="buttons text-center m-t-15 p-0">
                <pebble-button class="cancel btn btn-secondary m-r-5" button-text="Cancel" noink="" elevation="2" on-tap="_onCancelTap"></pebble-button>
                <pebble-button class="save btn btn-success" button-text="Save" noink="" elevation="2" on-tap="_onSaveTap"></pebble-button>
            </div>
        </div>
`;
  }

  static get is() {
      return 'rock-create-edit-saved-searches'
  }

  static get properties() {
      return {
          title: {
              type: String,
              value: "Create or Edit Saved Search",
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
          savedSearchId: {
              type: Number,
              value: null,
              notify: true,
              observer: "_onSavedSearchIdChange"
          },
          /**
           * Indicates the saved searches.
           */
          createEditModel: {
              type: Object,
              value: function () {
                  return {};
              },
              observer: '_createEditModelChanged'
          },
          /**
           * Indicates all saved search names for dropdown.
           */
          _savedSearchItems: {
              type: String,
              value: ""
          },

          _itemsSeperator: {
              type: String,
              value: "#@#"
          },

          _allSavedSearchItems: {
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
  _createEditModelChanged() {
      if (this.createEditModel) {
          let existingSavedSearches = this._allSavedSearchItems = [];

          if (!this.createEditModel ||
              !this.createEditModel["my-searches"] ||
              !this.createEditModel["shared-searches"]) {
              return;
          }

          this._allSavedSearchItems = this.createEditModel["my-searches"].concat(this.createEditModel["shared-searches"]);

          //my-searches, shared-searches
          for (let i = 0; i < this._allSavedSearchItems.length; i++) {
              existingSavedSearches.push(this._allSavedSearchItems[i].name.replace(this._itemsSeperator, '')); //If saved search name having seperator text, then replace it with blank
          }

          this._savedSearchItems = existingSavedSearches.join(this._itemsSeperator);

          this._resetControlValues();
      }
  }

  //On savedSearchId change, reset control if no id
  _onSavedSearchIdChange() {
      if (!this.savedSearchId) {
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

      if (this.savedSearchId) {
          for (let i = 0; i < this._allSavedSearchItems.length; i++) {
              if (this._allSavedSearchItems[i].id == this.savedSearchId) {
                  selectedIndex = i;
              }
          }
          microTask.run(() => {
              this.shadowRoot.querySelector('pebble-dropdown').selectedIndex = selectedIndex;
          });
      }

      if (!this.savedSearchId || selectedIndex == -1) {
          microTask.run(() => {
              this.shadowRoot.querySelector('#savedSearchNameId').focus();
          });
      }
  }
  _onDropdownChange(e) {
      let path = ElementHelper.getElementPath(e);
      if (path[0].id == "savedSearchDropdown" && e.detail != undefined) {
          let selectedIndex = e.detail.newValue;

          if (selectedIndex != -1) {
              let dropdownElement = this.shadowRoot.querySelector('pebble-dropdown');
              let selectedValue = dropdownElement.selectedValue;

              // Get the object for the current selected saved search
              if (this._allSavedSearchItems && selectedValue) {
                  let savedSearchObject = {};
                  for (let i = 0; i < this._allSavedSearchItems.length; i++) {
                      if (this._allSavedSearchItems[i].name == selectedValue) {
                          savedSearchObject = this._allSavedSearchItems[i];
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
      this.fireBedrockEvent('saved-search-cancel', null, {
          ignoreId: true
      });
  }
  _onSaveTap(e) {
      // fire the validation to check if name is given or not. If given, get the saved search name
      let inputElement = this.shadowRoot.querySelector('paper-input');
      let flag = inputElement.validate();
      if (!flag || this.name.trim() == '') {
          return;
      }

      let _savedSearchDropdown = this.shadowRoot.querySelector('#savedSearchDropdown');
      let _selectedSearch = {};
      if (_savedSearchDropdown) {
          _selectedSearch = this._allSavedSearchItems[_savedSearchDropdown.selectedIndex];
      }

      let savedSearchObject = {
          name: this.name,
          accesstype: this._accessType,
          selectedSearch: _selectedSearch
      }
      this.fireBedrockEvent('saved-search-save', savedSearchObject, {
          ignoreId: true
      });
      this._resetControlValues();
      this.editMode = false;
  }
  /*
   * Re-usable function to clear all control values
   */
  _resetControlValues() {

      let dropdownElement = this.shadowRoot.querySelector('pebble-dropdown');
      if (dropdownElement != undefined) {
          dropdownElement.selectedIndex = -1;
      }

      //clear all the control values
      let inputElement = this.shadowRoot.querySelector('paper-input');
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
customElements.define(RockCreateEditSavedSearches.is, RockCreateEditSavedSearches);
