/**
<b><i>Content development is under progress... </b></i>

@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../pebble-icons/pebble-icons.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-button/pebble-button.js';
import '../pebble-popover/pebble-popover.js';
import '../pebble-data-table/pebble-data-table.js';
import '../pebble-textbox/pebble-textbox.js';
import '../pebble-lov/pebble-lov.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-helpers/context-helper.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-buttons.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import '../bedrock-style-manager/styles/bedrock-style-floating.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockContextPathBuilder extends mixinBehaviors([RUFBehaviors.UIBehavior, RUFBehaviors.ComponentContextBehavior], OptionalMutableData(PolymerElement)) {
  static get template() {
    return Polymer.html`
        <style include="bedrock-style-common bedrock-style-grid-layout bedrock-style-floating bedrock-style-icons bedrock-style-padding-margin bedrock-style-buttons">
            :host {
                --paper-input-container: {
                    bottom: 8px;
                    position: relative;
                }
            }

            pebble-popover {
                --pebble-popover-width: 260px;
            }

            pebble-textbox {
                --pebble-textbox-paper-input-style: {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
            }

            data-table-row[header] {
                font-weight: var(--font-bold, bold);
                color: var(--palette-cerulean, #036bc3);
                border-bottom: none;
                text-transform: uppercase;
                font-size: var(--table-head-font-size, 11px);
            }

            data-table-row:not([header]) {
                color: var(--palette-dark, #1a2028);
                font-size: var(--default-font-size, 12px);
                height: 100%;
                background-color: var(--palette-white, #ffffff);
            }

            data-table-row:not([header]):hover,
            data-table-row[selected] {
                background-color: var(--table-row-selected-color, #c1cad4) !important;
            }

            data-table-row:not([header]):hover data-table-checkbox,
            data-table-row[selected] data-table-checkbox {
                background-color: var(--palette-white, #ffffff) !important;
            }

            pebble-data-table data-table-checkbox {
                flex-basis: 16px !important;
                padding: 0 !important;
            }

            data-table-row data-table-cell.check-filter {
                flex: 0 0 16px !important;
                padding: 0!important;
            }

            data-table-row[header] {
                --pebble-direction-icon-button: {
                    opacity: 0.7 !important;
                }
            }

            data-table-row data-table-cell {
                padding: 0 0 0 10px!important;
            }

            #gridManage {
                font-size: 0;
                padding: 10px;
            }

            #gridManage pebble-icon {
                display: inline-block;
                vertical-align: middle;
            }

            .gridCountMsg {
                font-weight: bold;
                margin-right: 10px;
                font-size: var(--grid-msg-font-size, 12px);
                display: inline-block;
                vertical-align: middle;
            }

            #context-header {
                font-size: 12px;
                padding: 10px;
            }

            #type-label {
                font-weight: bold;
            }
        </style>
        <div id="gridManage">
            <span class="gridCountMsg">[[_getGridRecordsCountMessage(_gridData)]]</span>
            <span class="pull-right">
                <pebble-icon class="pebble-icon-size-16 m-r-10" id="add" icon="pebble-icon:action-add" title="Add" raised="" on-tap="_onAddTap"></pebble-icon>
                <pebble-icon class="pebble-icon-size-16" id="delete" icon="pebble-icon:action-delete" title="Delete" raised="" on-tap="_onDeleteTap"></pebble-icon>
            </span>
        </div>
        <div id="grid-container" class="button-siblings">
            <pebble-data-table id="mapping-grid" items="{{_gridData}}" multi-selection="">
                <data-table-column slot="column-slot" name="Sequence">
                    <template>
                        <div id="inputContextDiv" slot="cell-slot-content" index="[[index]]">
                            <pebble-textbox readonly="" class="column-text" id="context_[[index]]" no-label-float="" row-id="[[index]]" value="{{item.rowNum}}" title="{{item.rowNum}}"></pebble-textbox>
                        </div>
                    </template>
                </data-table-column>
                <data-table-column slot="column-slot" name="Excel Column">
                    <template>
                        <div id="inputExcelDiv" slot="cell-slot-content" index="[[index]]">
                            <pebble-textbox readonly="" class="column-text" id="excelColumn_[[index]]" row-id="[[index]]" no-label-float="" value="[[item.excelColumn]]" title="[[item.excelColumn]]"></pebble-textbox>
                        </div>
                        <div id="iconExcelDiv" slot="cell-slot-content">
                            <pebble-icon class="dropdown-icon pebble-icon-size-10" id="dropdownExcelIcon__[[index]]" row-id="[[index]]" icon="pebble-icon:navigation-action-down" on-tap="_showExcelLOV"></pebble-icon>
                        </div>
                    </template>
                </data-table-column>
            </pebble-data-table>
            <pebble-popover class="attributes-popover" id="excelColumnPopover" for="" no-overlap="" vertical-align="auto" horizontal-align="auto">
                <pebble-lov id="excelColumnLOV" row-id="[[index]]" items="[[gridExcelFields]]" on-selection-changed="_onExcelColumnSelectionChanged"></pebble-lov>
            </pebble-popover>
        </div>
        <div id="actions-container" class="buttonContainer-static" align="center">
            <pebble-button class="action-button btn btn-secondary m-r-5" id="cancel" button-text="Cancel" raised="" on-tap="_onCancelBuildPath"></pebble-button>
            <pebble-button class="action-button-focus dropdownText btn btn-success m-r-5" id="apply" button-text="Apply" raised="" on-tap="_onSelectBuildPath"></pebble-button>
        </div>
`;
  }

  static get is() {
      return "rock-context-path-builder";
  }

  static get properties() {
      return {
          inputPath: {
              type: String,
              value: ""
          },

          headerFields: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          _gridData: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          gridExcelFields: {
              type: Array,
              value: function () {
                  return [];
              }
          }
      };
  }

  static get observers() {
      return [
          "_onContextPathChange(inputPath, headerFields)"
      ];
  }

  constructor() {
      super();
  }

  connectedCallback() {
      super.connectedCallback();
  }

  disconnectedCallback() {
      super.disconnectedCallback();
  }

  _onContextPathChange() {
      if (this.inputPath && !_.isEmpty(this.headerFields)) {
          this._prepareGridData();
      }
  }

  _prepareGridData() {
      let gridData = [];
      let categoryPathSeperator = this.appSetting('dataDefaults').categoryPathSeparator;
      let paths = [];
      if (this.inputPath) {
          paths = this.inputPath.split(categoryPathSeperator);
      }

      for (let i = 0; i < paths.length; i++) {
          let rowData = {
              "rowNum": i + 1,
              "excelColumn": paths[i],
              "index": i
          };

          gridData.push(rowData);
      }

      let excelFields = [];
      for (let i = 0; i < this.headerFields.length; i++) {
          excelFields.push({
              "id": this.headerFields[i],
              "title": this.headerFields[i]
          });
      }

      this.set("gridExcelFields", excelFields);
      this.set("_gridData", gridData);
  }

  _showExcelLOV(e) {
      let id = "excelColumn";
      this._showLOV(e, id);
  }

  _showLOV(e, id) {
      let rowId = e.currentTarget.rowId;
      if (rowId >= 0) {
          let lov = this.shadowRoot.querySelector("#" + id + "LOV");
          let popover = this.shadowRoot.querySelector("#" + id + "Popover");
          if (lov && popover) {
              lov.currentRowId = rowId;
              popover.for = id + "_" + rowId;
              popover.show();
              lov.clear();
          }
      }
  }

  _onExcelColumnSelectionChanged(e, detail) {
      let id = "excelColumn";
      this._onLOVSelectionChanged(detail, id);
  }

  _onLOVSelectionChanged(detail, id) {
      let lovId = "#" + id + "LOV";
      let popoverId = "#" + id + "Popover";
      let txtId = "#" + id;

      let popover = this.shadowRoot.querySelector(popoverId);
      popover.for = "";
      popover.hide();

      let lov = this.shadowRoot.querySelector(lovId);
      if (lov) {
          let rowId = lov.currentRowId;
          if (rowId >= 0) {
              let columnTxtbox = this.root.querySelector(txtId + "_" + rowId);
              if (!columnTxtbox) {
                  columnTxtbox = this.shadowRoot.querySelector(txtId + "_" + rowId);
              }
              if (columnTxtbox) {
                  let row = this._getParentRow(columnTxtbox);
                  if (row) {
                      //Set row context/excelColumn on selection change
                      if (id == "context") {
                          row.item.context = detail.item.title;
                          this._setBuildPath(row.item, rowId);
                      } else {
                          row.item.excelColumn = detail.item.title;
                      }
                      columnTxtbox.value = detail.item.title;
                      columnTxtbox.title = detail.item.title;
                  }
              }
          }
      }
  }

  _getParentRow(element) {
      if (element) {
          if (element instanceof DataTableRow) {
              return element;
          } else {
              return this._getParentRow(element.parentNode);
          }
      }
      return undefined;
  }

  _onCancelBuildPath(e) {
      let eventName = "context-build-path-cancel";
      let eventDetail = {
          "name": eventName,
      };
      this.fireBedrockEvent(eventName, eventDetail, { ignoreId: true });
  }

  _onSelectBuildPath(e) {
      if (this._isDuplicateGridDataAvailable()) {
          this.showWarningToast("Provide unique columns.");
          return;
      }

      let eventName = "context-build-path-select";
      let eventDetail = {
          "name": eventName,
          "selectedPath": this._prepareContextPath()
      };
      this.fireBedrockEvent(eventName, eventDetail, { ignoreId: true });
  }

  _prepareContextPath() {
      let selectedPath = "";
      if (this._gridData && this._gridData.length) {
          this._gridData.forEach(function (row) {
              if (row.excelColumn) {
                  if (selectedPath) {
                      selectedPath = selectedPath + ">>" + row.excelColumn;
                  } else {
                      selectedPath = row.excelColumn;
                  }
              }
          });
      }

      return selectedPath;
  }

  _getGridRecordsCountMessage() {
      if (!this._gridData || this._gridData.length == 0) {
          return "Showing 0 results";
      }

      return "Showing 1 - " + this._gridData.length + " items of total " + this._gridData.length + " results";
  }

  _onAddTap() {
      this.push("_gridData", {
          "rowNum": this._gridData.length + 1,
          "excelColumn": "",
          "index": this._gridData.length
      });

      //Notify Grid data
      let temp = this._gridData;
      this._gridData = [];
      this._gridData = temp;
  }

  _onDeleteTap() {
      let grid = this.shadowRoot.querySelector("#mapping-grid");
      if (grid) {
          let selectedItems = grid.getSelectedItems();
          if (selectedItems.length == 0) {
              //Show message if needed - Please select an item for delete
              return;
          }
          let gridData = [];
          for (let i = 0; i < this._gridData.length; i++) {
              let isDelete = false;
              for (let j = 0; j < selectedItems.length; j++) {
                  if (this._gridData[i].index == selectedItems[j].index) {
                      isDelete = true;
                      break;
                  }
              }

              if (!isDelete) {
                  gridData.push(this._gridData[i]);
              }
          }

          //Reset row index
          for (let i = 0; i < gridData.length; i++) {
              gridData[i].rowNum = i + 1;
              gridData[i].index = i;
          }

          this.set("_gridData", gridData);
      }
  }

  _isDuplicateGridDataAvailable() {
      let uniqueExcelColumns = [...new Set(this._gridData.map((obj) => obj.excelColumn))];

      if (this._gridData.length != uniqueExcelColumns.length) {
          return true;
      }

      return false;
  }
}

customElements.define(RockContextPathBuilder.is, RockContextPathBuilder);
