/**
`pebble-split-list`

@demo demo/index.html 
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-helpers/component-helper.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import '../bedrock-style-manager/styles/bedrock-style-heading.js';
import '../bedrock-style-manager/styles/bedrock-style-gridsystem.js';
import '../pebble-button/pebble-button.js';
import '../pebble-icons/pebble-icons.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-checkbox/pebble-checkbox.js';
import '../pebble-data-table/pebble-data-table.js';
import '../pebble-data-table/data-table-column.js';
import '../bedrock-style-manager/styles/bedrock-style-tooltip.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class PebbleSplitList extends mixinBehaviors([RUFBehaviors.UIBehavior], PolymerElement) {
  static get template() {
    return Polymer.html`
        <style include="bedrock-style-common bedrock-style-gridsystem bedrock-style-heading bedrock-style-tooltip bedrock-style-grid-layout bedrock-style-icons bedrock-style-padding-margin">
            :host {
                display: block;
                height: 100%;
            }

            .container {
                padding-right: 15px;
                padding-left: 15px;
                margin-right: auto;
                margin-left: auto;
            }

            .leftContainer {
                width: 45%;
                float: left;
                border: solid 1px var(--default-border-color, #c1cad4);
                border-radius: 3px;
                box-shadow: 1px 2px 5px -1px var(--default-border-color, #c1cad4);

            }

            .centerContainer {
                width: 10%;
                float: left;
                vertical-align: middle;
                padding: 25px;
                text-align: center;
            }

            .rightContainer {
                width: 45%;
                float: left;
                border: solid 1px var(--default-border-color, #c1cad4);
                border-radius: 3px;
                box-shadow: 1px 2px 5px -1px var(--default-border-color, #c1cad4);

            }

            .row {
                margin-right: -15px;
                margin-left: -15px;
            }

            #firstButton {
                margin-top: 40%;
            }

            .check-filter {
                flex-basis: 25px!important;
                flex-grow: 0!important;
                overflow: visible!important;
                position: relative;
                padding: 0;
            }

            /* IE edge specific fix for .check-filter */

            _:-ms-lang(x),
            _:-webkit-full-screen,
            .check-filter {
                padding: 10px 0 0 0;
            }

            .moveButtons {
                margin-top: 5px;
                text-align: center;
            }

            pebble-data-table {
                height: 100%;
                overflow-x: hidden;
            }

            h4 {
                margin-left: 10px;
            }

            pebble-data-table data-table-cell[header] {
                --paper-font-caption: {
                    height: 5px;
                };
                --pebble-icon-opacity: {
                    opacity: 1;
                    color: var(--link-text-color, #139ee7);
                };
            }

            pebble-data-table data-table-cell span {
                text-overflow: ellipsis;
                white-space: nowrap;
                overflow: hidden;
                display: block;
            }

            data-table-cell,
            data-table-cell[header] {
                padding-top: 3px;
                /*height: auto;*/
                min-width: 0!important;
            }

            data-table-cell:not([header]) [slot=cell-slot-content] {
                width: 100%;
            }

            data-table-cell[header] {
                font-size: var(--font-size-sm, 12px);
                color: var(--palette-cerulean, #036bc3);
                text-transform: uppercase;
                cursor: default;
            }

            data-table-cell:not([header]) {
                min-height: 40px!important;
                height: auto !important;
            }

            data-table-checkbox {
                border-right: none;
                padding: 0 0 0 10px;
                height: auto;
                flex-basis: 25px;
                background: var(--palette-white, #ffffff);
            }
        </style>
        <div class="container full-height">
            <div class="row full-height">
                <div class="leftContainer">
                    <div class="base-grid-structure">
                        <div class="base-grid-structure-child-1">
                            <h4>Available Fields</h4>
                        </div>
                        <div class="base-grid-structure-child-2">
                            <pebble-data-table id="leftDataTable" disable-select-all="" deleted-items="{{deletedItems}}" page-size="[[pageSize]]" size="{{size}}" selection-enabled="" multi-selection="[[config.tabular.settings.isMultiSelect]]" r-data-source="[[rDataSource]]" items="{{items}}">
                                <template is="dom-repeat" items="[[config.tabular.fields]]" as="col" index-as="colIndex">
                                    <data-table-column slot="column-slot" name="[[col.header]]" column-index="{{colIndex}}" filter-by="[[_isFilterEnabled(col)]]" sort-by="[[_isSortable(col)]]" icon="pebble-icon:action-edit" class="pebble-icon-size-16" column-object="[[col]]">
                                        <template>
                                            <div slot="cell-slot-content" class="cell tooltip-bottom" data-tooltip\$="[[_columnValue(item,colIndex)]]">
                                                <span>[[_columnValue(item, colIndex)]]</span>
                                            </div>
                                        </template>
                                    </data-table-column>
                                </template>
                            </pebble-data-table>
                        </div>
                    </div>
                </div>
                <div class="centerContainer">
                    <pebble-button id="firstButton" class="btn btn-outline-primary auto-width m-b-10" icon="pebble-icon:action-scope-take-all" on-tap="_moveRightAll"></pebble-button>
                    <pebble-button class="btn btn-outline-primary auto-width m-b-10" icon="pebble-icon:action-scope-take-selection" on-tap="_moveRight"></pebble-button>
                    <pebble-button class="btn btn-outline-primary auto-width m-b-10" icon="pebble-icon:action-scope-release-selection" on-tap="_moveLeft"></pebble-button>
                    <pebble-button class="btn btn-outline-primary auto-width m-b-10" icon="pebble-icon:action-scope-release-all" on-tap="_moveLeftAll"></pebble-button>
                </div>
                <div class="rightContainer">
                    <div class="base-grid-structure">
                        <div class="base-grid-structure-child-1">
                            <h4>Selected Fields</h4>
                        </div>
                        <div class="base-grid-structure-child-2">
                            <pebble-data-table id="rightDataTable" selection-enabled="" multi-selection="[[config.tabular.settings.isMultiSelect]]" items="[[selectedItems]]">
                                <template is="dom-repeat" items="[[config.tabular.fields]]" as="col" index-as="colIndex">
                                    <data-table-column slot="column-slot" name="[[col.header]]" column-index="{{colIndex}}" filter-by="[[_isFilterEnabled(col)]]" sort-by="[[_isSortable(col)]]" icon="pebble-icon:action-edit" class="pebble-icon-size-16" column-object="[[col]]">
                                        <template>
                                            <div slot="cell-slot-content" class="cell tooltip-bottom" data-tooltip\$="[[_columnValue(item,colIndex)]]">
                                                <span>[[_columnValue(item, colIndex)]]</span>
                                            </div>
                                        </template>
                                    </data-table-column>
                                </template>
                            </pebble-data-table>
                        </div>
                    </div>
                    <template is="dom-if" if="[[moveUpDownEnabled]]">
                        <div class="moveButtons">
                            <pebble-button class="btn btn-outline-primary auto-width m-b-10" icon="pebble-icon:action-less" on-tap="_moveUpRight"></pebble-button>
                            <pebble-button class="btn btn-outline-primary auto-width m-b-10" icon="pebble-icon:action-expand" on-tap="_moveDownRight"></pebble-button>
                        </div>
                    </template>
                </div>
            </div>
        </div>
`;
  }

  static get is() {
      return "pebble-split-list";
  }

  static get properties() {
      return {
          items: {
              type: Array,
              value: function () {
                  return [];
              },
              notify: true
          },

          selectedItems: {
              type: Array,
              value: function () {
                  return [];
              },
              notify: true
          },

          retainSelectedItems: {
              type: Boolean,
              value: false
          },

          moveUpDownEnabled: {
              type: Boolean,
              value: false
          },

          pageSize: {
              type: Number,
              value: 50
          },

          deletedItems: {
              type: Array,
              value: function () {
                  return [];
              },
              notify: true
          },

          rDataSourceId: {
              type: String
          },

          config: {
              type: Object
          },

          size: {
              type: Number,
              notify: true
          },

          rDataSource: {
              type: Function,
              notify: true
          }
      };
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

  ready() {
      super.ready();
  }

  _columnValue(gridData, index) {
      if (gridData) {
          let columnName = this.config.tabular.fields[index].name;
          return gridData[columnName];
      }
  }

  _isFilterEnabled(col) {
      return col.filterable ? col.name : undefined;
  }

  _isSortable(col) {
      return col.sortable ? col.name : undefined;
  }

  _moveRight() {
      let leftGrid = this.$.leftDataTable;
      if (leftGrid) {
          let selectedItems = leftGrid.getSelectedItems();
          for (let i = 0; i < selectedItems.length; i++) {
              if (this.selectedItems.indexOf(selectedItems[i]) === -1) {
                  this.push("selectedItems", selectedItems[i]);
              }
          }
          leftGrid.clearSelection();
          if (!this.retainSelectedItems) {
              leftGrid.deleteItems(selectedItems);
          }
          this.fireBedrockEvent("moveToRight", selectedItems);
      }
  }

  _moveRightAll() {
      let leftGrid = this.$.leftDataTable;
      if (leftGrid) {
          let items = leftGrid.getData();
          for (let i = 0; i < items.length; i++) {
              if (this.selectedItems.indexOf(items[i]) === -1) {
                  this.push("selectedItems", items[i]);
              }
          }
          leftGrid.clearSelection();
          if (!this.retainSelectedItems) {
              leftGrid.deleteItems(items);
          }
          this.fireBedrockEvent("moveAllToRight", items);
      }
  }

  _moveLeft() {
      let rightGrid = this.$.rightDataTable;
      let leftGrid = this.$.leftDataTable;
      if (rightGrid) {
          let selectedItems = rightGrid.getSelectedItems();
          if (!this.retainSelectedItems) {
              for (let i = selectedItems.length - 1; i >= 0; i--) {
                  let index = this.deletedItems.indexOf(selectedItems[i]);
                  this.splice("deletedItems", index, 1);
              }
              this.restoreDeletedItems(leftGrid, selectedItems, this.rDataSource);
          }
          for (let i = 0; i < selectedItems.length; i++) {
              let index = this.selectedItems.indexOf(selectedItems[i]);
              this.splice("selectedItems", index, 1);
          }
          rightGrid.clearSelection();
          this.fireBedrockEvent("moveToLeft", selectedItems);
      }
  }

  _moveLeftAll() {
      let rightGrid = this.$.rightDataTable;
      let leftGrid = this.$.leftDataTable;
      let items = rightGrid.getData();
      if (!this.retainSelectedItems) {
          this.deletedItems = [];
          this.restoreDeletedItems(leftGrid, items, this.rDataSource);
      }
      for (let i = 0; i < items.length; i++) {
          let index = this.selectedItems.indexOf(items[i]);
          this.splice("selectedItems", index, 1);
      }
      rightGrid.clearSelection();
      this.fireBedrockEvent("moveAllToLeft", items);
  }

  _moveUpRight() {
      let rightGrid = this.$.rightDataTable;
      let selectedItems = rightGrid.getSelectedItems();
      let _this = this;
      let sortedSelectedItems = selectedItems.sort(function (item1, item2) {
          return _this.selectedItems.indexOf(item1) - _this.selectedItems.indexOf(item2);
      })
      for (let i = 0; i < sortedSelectedItems.length; i++) {
          let index = this.selectedItems.indexOf(sortedSelectedItems[i]);
          if (index > 0) {
              let temp = this.selectedItems[index - 1];
              this.selectedItems[index - 1] = this.selectedItems[index];
              this.selectedItems[index] = temp;
          }
      }
      let items = this.selectedItems;
      this.selectedItems = [];
      this.selectedItems = items;
  }

  _moveDownRight() {
      let rightGrid = this.$.rightDataTable;
      let selectedItems = rightGrid.getSelectedItems();
      let _this = this;
      let sortedSelectedItems = selectedItems.sort(function (item1, item2) {
          return _this.selectedItems.indexOf(item2) - _this.selectedItems.indexOf(item1);
      });
      for (let i = 0; i < sortedSelectedItems.length; i++) {
          let index = this.selectedItems.indexOf(sortedSelectedItems[i]);
          if (index < this.selectedItems.length - 1) {
              let temp = this.selectedItems[index + 1];
              this.selectedItems[index + 1] = this.selectedItems[index];
              this.selectedItems[index] = temp;
          }
      }
      let items = this.selectedItems;
      this.selectedItems = [];
      this.selectedItems = items;
  }

  getSelectedItems() {
      return this.selectedItems;
  }

  getLeftItems() {
      let leftGrid = this.$.leftDataTable;
      return leftGrid.getData();
  }

  restoreDeletedItems(grid, items, dataSource) {
      if (typeof dataSource === 'function') {
          this.rerenderGrid();
      } else {
          for (let i = items.length - 1; i >= 0; i--) {
              if (this.items.indexOf(items[i]) === -1) {
                  this.unshift("items", items[i]);
              }
          }
      }
  }

  rerenderGrid() {
      let grid = this.$.leftDataTable;
      if (this.rDataSourceId) {
          let dataSourceElement = ComponentHelper.getParentElement(this).$$('#' + this.rDataSourceId);
          if (dataSourceElement) {
              dataSourceElement.resetDataSource();
          }
      }
      grid.clearCache();
      grid._currentPage = 0;
  }
}

customElements.define(PebbleSplitList.is, PebbleSplitList);
