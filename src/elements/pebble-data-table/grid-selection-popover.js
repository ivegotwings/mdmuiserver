import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-list.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../pebble-button/pebble-button.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-popover/pebble-popover.js';
import '../pebble-checkbox/pebble-checkbox.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class GridSelectionPopover extends mixinBehaviors([
            RUFBehaviors.UIBehavior
        ], PolymerElement) {
  static get template() {
    return html`
    <style include="bedrock-style-common bedrock-style-icons bedrock-style-padding-margin bedrock-style-list">
      li {
        list-style: none;
        -webkit-transition: all 0.3s;
        -moz-transition: all 0.3s;
        -o-transition: all 0.3s;
        transition: all 0.3s;
      }

      .checkbox-wrapper {
        margin-right: 10px;
        float: left;
        margin-top: 4px;
        pointer-events: none;
      }

      .item-wrapper {
        float: left;
        padding: 5px 0;
      }

      .title {
        font-size: 12px;
        line-height: 14px;
        word-break: break-word;
        font-weight: 400;
        text-transform: capitalize;
      }

      ul {
        margin: 0px;
        padding: 0px;
        z-index: initial;
      }

      .item {
        text-align: left;
        cursor: pointer;
        color: var(--palette-steel-grey, #75808b);
        overflow: hidden;
      }

      .item[selected] {
        color: var(--dropdown-selected-font, #036bc3);
      }

      .item:hover,
      .item[focused] {
        background: var(--dropdown-selected, #e8f4f9);
        color: var(--dropdown-selected-font, #036bc3);
      }

      .popoverContent {
        position: relative;
        z-index: 10000;
      }

      #gridSelectionPopover {
        @apply --popover-position;
      }
      .text-steel-grey {
          color: var(--palette-steel-grey, #75808b);
      }
    </style>
    <pebble-icon id="gridSelectionFilterIcon" class="pebble-icon-size-10" icon="[[icon]]" on-tap="_onPopoverOpen"></pebble-icon>
    <pebble-popover id="gridSelectionPopover" for="gridSelectionFilterIcon" no-overlap="" vertical-align="auto" horizontal-align="auto">
      <div class="popoverContent p-r-20 p-l-20">
        <ul>
          <template is="dom-repeat" items="{{selectionOptions}}">
            <li class="item" on-tap="_onSelectionOptionClick" id="[[index]]">
              <div class="checkbox-wrapper">
                <pebble-checkbox item="[[item.value]]" checked="{{item.checked}}">
                  <span class="title text-steel-grey">[[item.label]]</span>
                </pebble-checkbox>
              </div>
            </li>
          </template>
        </ul>
        <div id="actionButtons" class="buttonContainer-static">
          <pebble-button id="cancelButton" class="close btn btn-secondary m-r-5" button-text="Close" noink="" elevation="2" on-tap="_onClose"></pebble-button>
          <pebble-button id="confirmButton" class="apply btn btn-success" button-text="Apply" noink="" elevation="2" on-tap="_onApply"></pebble-button>
        </div>
      </div>
    </pebble-popover>
    <bedrock-pubsub event-name="on-popover-close" handler="_onPopoverClose"></bedrock-pubsub>
`;
  }

  static get is() {
    return "grid-selection-popover";
  }
  static get properties() {
    return {
      selectionOptions: {
        type: Array,
        value: function () {
          return [];
        }
      },
      selectedOption: {
        type: Object,
        value: function () {
          return {}
        }
      },
      previousStateKey: {
        type: String,
        value: ''
      },
      icon: {
        type: String,
        value: 'pebble-icon:navigation-action-down'
      }
    }
  }
  connectedCallback() {
    super.connectedCallback();
    this._gridSelectionPopover = this.shadowRoot.querySelector('#gridSelectionPopover');
  }
  _onPopoverOpen(e) {
    this._gridSelectionPopover.show();
  }
  _onPopoverHide() {
    this._gridSelectionPopover.hide();
  }
  _onPopoverClose() {
    this.onClose();
  }
  onClose() {
    if (this.previousStateKey != '') {
      let completeOptions = DataHelper.cloneObject(this.selectionOptions);
      completeOptions.forEach(function (value, key) {
        if (this.previousStateKey == key) {
          value.checked = true;
        } else {
          value.checked = false;
        }
      }.bind(this));
      this.set("selectionOptions", completeOptions);
    } else {
      this.resetSelection();
    }
  }
  _onClose() {
    this._onPopoverHide();
    this.onClose();
  }
  _onSelectionOptionClick(e) {
    this.selectedOption = Object.create({});
    let checkedId = parseInt(e.currentTarget.id);
    let completeOptions = DataHelper.cloneObject(this.selectionOptions);
    completeOptions.forEach(function (value, key) {
      if (checkedId == key) {
        value.checked = !value.checked;
        if (value.checked == true) {
          this.selectedOption = value;
        }
      } else {
        value.checked = false;
      }
    }.bind(this));
    this.set("selectionOptions", completeOptions);
  }
  _onApply(e) {
    this._onPopoverHide();
    let detail = this.selectedOption;
    if (Object.keys(this.selectedOption).length > 0) {
      let completeOptions = DataHelper.cloneObject(this.selectionOptions);
      completeOptions.forEach(function (value, key) {
        if (value && value.checked == true) {
          this.previousStateKey = key.toString();
        }
      }.bind(this));
    } else {
      this.previousStateKey = '';
    }
    let eventDetail = DataHelper.cloneObject(detail);
    this.dispatchEvent(new CustomEvent("selection-changed", {
      detail: eventDetail,
      bubbles: true,
      composed: true
    }));
  }
  resetSelection() {
    this.selectedOption = Object.create({});
    this.previousStateKey = '';
    let completeOptions = DataHelper.cloneObject(this.selectionOptions);
    completeOptions.forEach(function (value, key) {
      value.checked = false;
    });
    this.set("selectionOptions", completeOptions);
  }
}
customElements.define(GridSelectionPopover.is, GridSelectionPopover);
