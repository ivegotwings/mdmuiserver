import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-input/paper-input.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import '../pebble-checkbox/pebble-checkbox.js';
import '../pebble-icon/pebble-icon.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../bedrock-helpers/validation-helper.js';
class DataTableColumnFilter extends PolymerElement {
  static get template() {
    return html`
    <style include="bedrock-style-common bedrock-style-icons bedrock-style-padding-margin">
      :host([hidden]) {
        display: none;
      }

      :host {
        width: calc(100% - 30px);

        --paper-input-container-input: {
          font-size: var(--font-size-sm, 12px) !important;
          @apply --pebble-textbox-paper-input-style;
          line-height: 16px !important;
          height: 16px;
          font-style: italic;
        }

        ;

        --paper-input-container-underline-focus: {
          border-bottom: 1px solid var(--focused-line, #026bc3);
        }

        ;

        --paper-input-container-invalid-color: {
          border-bottom: 1px solid var(--invalid-line, #ed204c);
        }

        ;

        --paper-input-container: {
          vertical-align: middle;
          padding-top: 0px;
          padding-right: 0px;
          padding-bottom: 0px;
          padding-left: 0px;
          margin-top: 0px;
          margin-right: 0px;
          margin-bottom: 0px;
          margin-left: 0px;
          @apply --paper-input-container-style;
        }

        ;

        --paper-input-container-underline: {
          border-bottom: 1px solid var(--textbox-border, #d2d8de);
        }

        ;

        --paper-input-container-label: {
          text-transform: capitalize;
          font-size: var(--default-font-size, 14px) !important;
          color: var(--focused-line, #026bc3);
          line-height: 17px;
          font-weight: var(--font-medium, 500);
        }

        ;

        --paper-input-container-label-focus: {
          color: var(--focused-line, #026bc3);
        }

        ;

        --iron-autogrow-textarea-placeholder: {
          line-height: 0px !important;
        }

        ;
      }

      @supports (-ms-ime-align: auto) {

        /* For EDGE browser */
        :host {
          --paper-input-container: {
            padding-top: 0px;
            padding-right: 0px;
            padding-bottom: 0px;
            padding-left: 0px;
          }
        }
      }

      label {
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        display: inline-block;
        width: 100%;
      }
    </style>
    <div title\$="[[label]]">
      <label>[[label]]</label>
    </div>
    <template is="dom-if" if="[[!_isCheckBoxFilter(filterType)]]">
      <paper-input placeholder="Search" no-label-float="" title\$="[[filterValue]]" value="[[value]]" on-keydown="_keyDown" on-value-changed="_valueChanged">
        <pebble-icon slot="prefix" class="pebble-icon-size-16 m-r-5" noink="" icon="pebble-icon:search-entity"></pebble-icon>
      </paper-input>
    </template>
    <template is="dom-if" if="[[_isCheckBoxFilter(filterType)]]">
      <pebble-checkbox id="filterChkBox" class="checkbox-label-color m-r-10" on-change="_onFilterChange"></pebble-checkbox>
    </template>
`;
  }

  static get is() {
    return "data-table-column-filter";
  }
  static get properties() {
    return {
      label: {
        type: String,
      },
      value: {
        type: String,
        notify: true
      },
      filterValue:{
        type:String
      },
      hidden: {
        type: Boolean
      },
      filterType: {
        type: String,
        value: "textbox"
      },
      _keyCode: {
        type: Number
      }
    }
  }
  _keyDown(e){
  if(e && e.keyCode){
  this._keyCode = e.keyCode;
  }
  }
  _valueChanged(e) {
    /*
     *disabled nofity event
     *instad uses bedrock to communicate to 
     *the column parent
     */
    if(ValidationHelper.checkNaviagationAndFunctionKey(e)){
        return;
    }
    let value = e.detail.value;
    this.filterValue = value;
    let parentDataTable = this._getParentDataTable();
    if (parentDataTable) {
      let tableId = parentDataTable.id;
      let debounceTimer = 50;
      if(this._keyCode == 8){
        debounceTimer = 800;
      }
      let eventName = this.label.replace(/ /g, '').toLowerCase() + "filterchange" + '_' + tableId;
      this._debouncer = Debouncer.debounce(this._debouncer, timeOut.after(debounceTimer), () => {
        ComponentHelper.fireBedrockEvent(eventName, {
          filter: value,
          eventName: eventName
        }, {
            ignoreId: true
          });
      });
    }
  }

  _isCheckBoxFilter(filterType) {
    if (filterType === "checkbox") {
      return true;
    }

    return false;
  }

  _onFilterChange(e) {
    let chkbox = e.currentTarget;
    if (chkbox.checked) {
      this.value = true;
    } else {
      this.value = "";
    }
  }

  _getParentDataTable() {
    let parentRowElement = ComponentHelper.getParentElement(this);
    if (parentRowElement.tagName.toLowerCase() == "data-table-row") {
      if (parentRowElement.parentElement.tagName.toLowerCase() == "pebble-data-table") {
        return parentRowElement.parentElement;
      }
    }
  }
}
customElements.define(DataTableColumnFilter.is, DataTableColumnFilter);
