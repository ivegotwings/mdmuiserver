/**
`pebble-dropdown` Represents a dropdown form field that contains a list of items in a form.
It is similar to a native browser select element. It works with selectable content. 
Currently, the selected item is displayed in the control. The label is displayed, if no item is selected.

@demo demo/index.html 
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '../bedrock-style-manager/styles/bedrock-style-paper-listbox.js';
import '@polymer/paper-item/paper-item.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-validator/bedrock-validator.js';
import '../pebble-info-icon/pebble-info-icon.js';

class PebbleDropdown extends PolymerElement {
  static get template() {
    return html`
    <style include="bedrock-style-common bedrock-style-scroll-bar bedrock-style-paper-listbox">
      paper-dropdown-menu {
        width: 100%;
        padding-top: var(--paper-listbox-t-p, 10px);
        padding-bottom: var(--paper-listbox-b-p, 10px);
        --paper-input-container: {
          padding-top: 0px;
          padding-right: 0px;
          padding-bottom: 0px;
          padding-left: 0px;
        }
        --paper-input-container-underline: {
          border-bottom: 1px solid var(--textbox-border, #d2d8de);
        }
        --paper-input-container-underline-focus: {
          border-bottom: 1px solid var(--primary-border-button-color, #026bc3);
        }
        --paper-input-container-label: {
          font-size: var(--default-font-size, 14px) !important;
        }
        --paper-input-container-input: {
          height: 24px;
          font-size: var(--default-font-size, 14px) !important;
        }
        --paper-menu-button-dropdown: {
          margin-top: 40px;
        }
        --paper-menu-button-content: {
          box-shadow: 0 0 var(--popup-box-shadow-size, 8px) 0 var(--popup-box-shadow, #8A98A3) !important;
        }
        --paper-input-container-label-focus: {
          color: var(--focused-line, #026bc3);
        }
        @apply --paper-dropdown-menu;
      }

      paper-listbox {
        max-height: 268px;
        overflow-y: auto;
        box-shadow: 0 0 var(--popup-box-shadow-size, 8px) 0 var(--popup-box-shadow, #8A98A3) !important;
      }

      paper-listbox paper-item {
        white-space: nowrap;
        min-height: 0;
      }

      pebble-dropdown paper-item:hover {
        background-color: var(--bgColor-hover, #e8f4f9);
        color: var(--focused-line, #026bc3);
      }

      pebble-dropdown paper-item:focus {
        color: var(--primary-button-color, #036bc3);
        background-color: var(--bgColor-hover, #e8f4f9);
      }

      .list {
        @apply --layout-vertical;
      }

      /* IE edge specific fix for task list vertical scrollbar */

      @supports (-ms-ime-align:auto) {
        paper-dropdown-menu {
          --paper-input-container-label-floating: {
            transform: initial;
            top: -20px;
            font-size: 12px !important;
          }
          --paper-input-container-label: {
            transform: initial;
            transition: initial;
          }
        }
        paper-listbox {
          overflow-y: hidden;
        }
      }
    </style>
    <paper-dropdown-menu id="dropdown" error-message="[[errorMessage]]" invalid="{{invalid}}" label="[[label]]">

      <paper-listbox id="listbox" slot="dropdown-content" class="dropdown-content" selected="{{selectedIndex}}">
        <template is="dom-repeat" items="{{_keyValuePairs}}">
          <div class="list">
            <paper-item>{{item.title}}</paper-item>
          </div>
        </template>
      </paper-listbox>
    </paper-dropdown-menu>

    <bedrock-validator show-error="[[showError]]" validation-errors="[[validationErrors]]" input="[[selectedValue]]" pattern="[[pattern]]" min-length="[[minlength]]" max-length="[[maxlength]]" precision="[[precision]]" required="[[required]]" invalid="{{invalid}}" error-message="{{errorMessage}}" min="[[min]]" max="[[max]]" type="[[validationType]]" type-array="[[validationTypeArray]]"></bedrock-validator>
`;
  }

  static get is() {
    return "pebble-dropdown";
  }

  static get properties() {
    return {
      /**
        * Indicates the title of the dropdown control, which gets displayed in UI.
        */
      label: {
        type: String,
        value: ""
      },

      /**
        * Indicates the list of comma seperated values to represent the values in the String.
        */
      items: {
        type: Object,
        value: function () {
          return {};
        },
        observer: '_itemsChanged'
      },

      itemsSeperator: {
        type: String,
        value: ","
      },

      _keyValuePairs: {
        type: Array,
        value: function () {
          return [];
        }
      },

      /**
        * Indicates the index number of the item. It starts with -1.
        */
      selectedIndex: {
        type: Number,
        value: -1,
        observer: "_selectedIndexChanged"
      },

      /**
        * Indicates the selected value from the list.
        */
      selectedValue: {
        type: String,
        value: "",
        notify: true,
        observer: "_selectedValueChanged"
      },

      /**
        * Specifies whether or not to show the error.
        */
      showError: {
        type: Boolean,
        value: false
      },

      /**
       * Indicates whether to disable the floating label or not.
       * Set the value as <b>true</b> to disable the floating label.
       */
      noLabelFloat: {
        type: Boolean,
        value: false
      },

      /**
       * Description object should contain non-empty
       * description field (type type: Array or String)
       */
      descriptionObject: {
        type: Object,
        notify: true,
        value: function () {
          return {};
        }
      }
    };
  }

  ready() {
    super.ready();
    if (this._keyValuePairs && this._keyValuePairs.length) {
      for (let i = 0; i < this._keyValuePairs.length; i++) {
        let keyValue = this._keyValuePairs[i];
        if (keyValue.value == this.selectedValue) {
          this.selectedIndex = i;
          break;
        }
      }
    }        
  }

  _itemsChanged() {
    let items = this.items;
    let keyValuePairs = [];
    if (!items) {
      return keyValuePairs;
    }

    if (typeof (items) == "string") {
      if (items && items != "") {
        let itemsArray = items.split(this.itemsSeperator);
        for (let i = 0; i < itemsArray.length; i++) {
          let item = itemsArray[i];
          keyValuePairs.push({ 'value': item, 'title': item });
        }
      }
    }

    if (typeof (items) == "object") {
      keyValuePairs.push.apply(keyValuePairs, items);
    }

    this._keyValuePairs = keyValuePairs;

    if (this._keyValuePairs.length && this.selectedValue) {
      this._setNewIndex(this._keyValuePairs, this.selectedValue);
    }
  }

  _selectedIndexChanged(newIndex, oldIndex) {
    if (newIndex !== undefined && this._keyValuePairs) {
      if (this.selectedValue != this._keyValuePairs[newIndex]) {
        let oldValue = undefined;

        if (oldIndex > -1) {
          oldValue = this._keyValuePairs[oldIndex].value;
        }

        if (newIndex > -1) {
          this.selectedValue = this._keyValuePairs[newIndex].value;
          let eventParams = { 'newValue': this.selectedValue, 'oldValue': oldValue };
          this.dispatchEvent(new CustomEvent('change', { detail: eventParams, bubbles: true, composed: true }));
        }
      }
    }
  }

  _selectedValueChanged(newValue, oldValue) {
    this._setNewIndex(this.keyValuePairs, newValue);
  }

  _setNewIndex(keyValuePairs, newSelectedValue) {
    let newIndex = -1;
    if (keyValuePairs !== undefined && newSelectedValue !== undefined) {
      for (let i = 0; i < keyValuePairs.length; i++) {
        let keyValue = keyValuePairs[i];
        if (keyValue.value == newSelectedValue) {
          newIndex = i;
          break;
        }
      }

      if (this.selectedIndex !== newIndex) {
        this.selectedIndex = newIndex;
      }
    }
  }

  /**
  * Can be used to focus the input element of dropdown.
  */
  focus() {
    this.$.dropdown.shadowRoot.querySelector('paper-input').inputElement.focus();
  }
}
customElements.define(PebbleDropdown.is, PebbleDropdown);
