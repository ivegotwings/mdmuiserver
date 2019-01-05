import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-helpers/component-helper.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-helpers/entity-helper.js';
import '../bedrock-helpers/message-helper.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../bedrock-style-manager/styles/bedrock-style-floating.js';
import '../pebble-button/pebble-button.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-icons/pebble-icons.js';
import '../pebble-data-table/pebble-data-table.js';
import '../rock-grid-data-sources/entity-govern-grid-datasource.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockGovernDataGrid
    extends mixinBehaviors([
        RUFBehaviors.UIBehavior,
        RUFBehaviors.ComponentContextBehavior
    ], OptionalMutableData(PolymerElement)) {
  static get template() {
    return Polymer.html`
        <style include="bedrock-style-common bedrock-style-floating bedrock-style-icons">
           pebble-data-table[loading] {
				pointer-events: none;
			}
			
            .cell {
				font-size: 14px;
				display: inline-block;
				vertical-align: middle;
                overflow: inherit;
                max-width: 100%;
			}
            .entity-icon-outer {
                width: 15px;
                margin-right: 8px;
                float: left;
            }

            .entity-icon-outer pebble-icon {
                margin-top: -1px;
            }

            .entity-content.Invalid {
                color: var(--invalid-line, #ed204c);
            }

            .entity-content.unknown {
                color: var(--text-primary-color, #1a2028);
            }
            .check-filter{
				flex-basis: 25px!important;
				flex-grow: 0!important;
				overflow: visible!important;
				position: relative;
				padding: 0;
			}
            #container {
                padding: 20px 10px 0px 10px;
            }
            .grid-header {
                font-size: 14px;
                font-weight: var(--font-bold, bold);
                padding-bottom: 10px;
            }
            .text-ellipsis {
                width: 130px;
            }
            data-table-cell[header] {		          
  				font-size: var(--font-size-sm, 12px);		  				
  				color: var(--palette-cerulean, #036bc3);		  				
                text-overflow: ellipsis;		
                overflow: hidden;		
                white-space: nowrap;		
 			}
        </style>
        <div id="container">
            <span class="grid-header">[[title]]</span>
            <entity-govern-grid-datasource id="governGridDataSource" context-data="[[contextData]]" r-data-source="{{rDataSource}}" request="{{request}}" r-data-formatter="{{rDataFormatter}}" header-data="{{headerData}}" buffer-record-size="{{gridDataSize}}" current-record-size="{{currentRecordSize}}" result-record-size="{{resultRecordSize}}" entity-name-attribute="[[entityNameAttribute]]"></entity-govern-grid-datasource>
            <div class="clearfix"></div>
            <pebble-data-table id="govern-grid" r-data-source="{{rDataSource}}" size="[[gridDataSize]]" page-size="20" selected-items="{{selectedItems}}" selected-item="{{selectedItem}}" multi-selection="">
                <data-table-column name="Entity Name" slot="column-slot">
                    <template>
                        <a href\$="[[_getLink(item)]]" slot="cell-slot-content">
                            <div index="[[index]]" class="cell" title\$="[[item.entityName]]">
                                <div class="text-ellipsis">[[item.entityName]]</div>
                            </div>
                        </a>
                    </template>
                </data-table-column>
                <data-table-column name="Workflow Name" slot="column-slot" title="Workflow Name">
                    <template>
                        <div slot="cell-slot-content" index="[[index]]" class="cell" title\$="[[item.workflowLongName]]">
                            <div class="text-ellipsis">[[item.workflowLongName]]</div>                            
                        </div>
                    </template>
                </data-table-column>
                <data-table-column name="Activity Name" slot="column-slot" title="Activity Name">
                    <template>
                        <div slot="cell-slot-content" index="[[index]]" class="cell">[[item.activityLongName]]</div>
                    </template>
                </data-table-column>
                <data-table-column name="Assigned To" slot="column-slot" title="Assigned To">
                    <template>
                        <div slot="cell-slot-content" index="[[index]]" class="cell">[[item.assignedUser]]</div>
                    </template>
                </data-table-column>
                <data-table-column name="Previous Step Comments" slot="column-slot" title="Previous Step Comments">
                    <template>
                        <div slot="cell-slot-content" index="[[index]]" class="cell">[[item.previousStepComments]]</div>
                    </template>
                </data-table-column>
                <data-table-column name="Actions" slot="column-slot" title="Actions">
                    <template>
                        <template is="dom-repeat" items="[[item.actions]]" as="action">
                            <pebble-button slot="cell-slot-content" class="action-button btn btn-secondary" index="[[index]]" raised="" button-text="[[action.actionText]]" on-tap="_onWfActionTap" disabled="[[_isDisabled(item)]]"></pebble-button>
                        </template>
                    </template>
                </data-table-column>
                <template is="dom-repeat" id="columns-template" items="[[headerData]]" as="businessCondition" index-as="colIndex">
                    <data-table-column name="[[businessCondition.name]]" slot="column-slot" title\$="[[businessCondition.name]]" column-object="[[businessCondition]]" column-index="{{colIndex}}">
                        <template>
                            <div class="entity-icon-outer" slot="cell-slot-content">
                                <pebble-icon icon="[[_getIconByType(item, column.columnObject)]]" class="pebble-icon-size-14"></pebble-icon>
                            </div>
                            <div class\$="cell entity-content [[_getClassByType(item, column.columnObject)]]">[[_getStatus(item, column.columnObject)]]</div>
                        </template>
                    </data-table-column>
                </template>
            </pebble-data-table>
        </div>
`;
  }

  static get is() {
      return 'rock-govern-data-grid';
  }
  static get observers() {
      return [
          '_computeTitle(resultRecordSize, currentRecordSize)'
      ]
  }
  static get properties() {
      return {
          request: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          headerData: {
              type: Array,
              value: function () {
                  return [];
              },
              observer: '_headersChanged'
          },
          /**
           * Specifies the format of the data that are passed to the `remote-data`.
           */
          rDataFormatter: {
              type: Object,
              notify: true,
              value: function () {
                  return this._prepareGridData.bind(this);
              }
          },
          rDataSource: {
              type: Object,
              notify: true
          },
          /**
           * Indicates the title for the grid.
           */
          title: {
              type: String,
              notify: true
          },
          /**
           * Indicates the total record size of the grid.
           * The above description depicts on how to increase this `recordSize`.
           */
          currentRecordSize: {
              notify: true,
              type: Number,
              value: 0
          },
          /**
           * Indicates the total record size of the data available for the grid.
           *
           */

          resultRecordSize: {
              notify: true,
              type: Number,
              value: 0
          },
          /**
           * Indicates an array that contains the selected items when `multiSelection` is set to true.
           * It indicates null if no item is selected.
           */
          selectedItems: {
              type: Array,
              value: function () {
                  return [];
              },
              notify: true
          },
          /**
           * Indicates the currently selected item when `multiSelection` is set to false.
           * It indicates null if no item is selected.
           */
          selectedItem: {
              type: Object,
              //value : {},
              notify: true
          },
          entityNameAttribute: {
              type: String
          }
      }
  }

  connectedCallback() {
      super.connectedCallback();
      this.addEventListener('selecting-item', this._onSelectingItem);
      this.addEventListener('deselecting-item', this._onDeselectingItem);
      this.addEventListener('selecting-all-items', this._onSelectingAllItems);
      this.addEventListener('deselecting-all-items', this._onDeselectingAllItems);
  }
  disconnectedCallback() {
      super.disconnectedCallback();
      this.removeEventListener('selecting-item', this._onSelectingItem);
      this.removeEventListener('deselecting-item', this._onDeselectingItem);
      this.removeEventListener('selecting-all-items', this._onSelectingAllItems);
      this.removeEventListener('deselecting-all-items', this._onDeselectingAllItems);
  }
  _getIronDataTable () {
      return ElementHelper.getElement(this, "pebble-data-table");
  }
  _onSelectingItem (e) {
      this.fireBedrockEvent("govern-grid-selecting-item", e.detail);
  }
  _onDeselectingItem (e) {
      this.fireBedrockEvent("govern-grid-deselecting-item", e.detail);
  }
  _onSelectingAllItems (e) {
      this.fireBedrockEvent("govern-grid-selecting-all-items", e.detail);
  }
  _onDeselectingAllItems (e) {
      this.fireBedrockEvent("govern-grid-deselecting-all-items", e.detail);
  }
  reRenderGrid () {
      let datasourceElement = this.shadowRoot.querySelector("#governGridDataSource");
      let grid = this.shadowRoot.querySelector("#govern-grid");

      if (datasourceElement && grid) {
          datasourceElement.resetDataSource();
          grid._resetData(this.rDataSource);
      }
  }
  getData () {
      let filteredData = [];
      let ironDataTable = this._getIronDataTable();
      if (ironDataTable) {
          let allData = ironDataTable.$.list.items;
          if (allData && allData.length > 0) {
              let lastPageData = allData.slice(allData.length - this.pageSize, allData.length);
              let lastPageFilteredData = lastPageData.filter(function (element) {
                  if (element != undefined) {
                      let keys = Object.keys(element);
                      if (!(keys.length <= 0 || (keys.length == 1 && keys[0] == "errors"))) {
                          return element;
                      }
                  }
              });
              if (allData.length > this.pageSize) {
                  filteredData = allData.slice(0, allData.length - this.pageSize);
                  if (lastPageFilteredData && lastPageFilteredData.length) {
                      lastPageFilteredData.forEach(function (item) {
                          filteredData.push(item);
                      }, this);
                  }
              } else {
                  filteredData = lastPageFilteredData;
              }
          }
      }
      return filteredData;
  }
  /**
   * Can be used to clear the current selection state.
   */
  clearSelection () {
      let ironDataTable = this._getIronDataTable();
      ironDataTable.clearSelection();
  }
  /**
   * Can be used to select the list item at the given index.
   *
   * @method selectItem
   * @param {(Object|number)} item The item object or its index
   */
  selectItem (item) {
      let ironDataTable = this._getIronDataTable();
      ironDataTable.selectItem(item);
  }
  /**
   * Can be used to reset the grid size.
   */
  notifyResize () {
      let ironDataTable = this._getIronDataTable();
      //ironDataTable.notifyResize()
  }

  /**
   * Can be used to set the scroll position dynamically.
   */
  scrollToIndex (index) {
      let ironDataTable = this._getIronDataTable();
      ironDataTable.shadowRoot.querySelector('#list').scrollToIndex(index);
  }

  /**
   * Can be used to get the selected grid row.
   */
  getSelectedGridRow () {
      let ironDataTable = this._getIronDataTable();
      return ironDataTable.querySelector('data-table-row[selected]');
  }

  /**
   * Can be used to get the selected item index.
   */
  getSelectedItemIndex () {
      if (this.getData().length > 0 && this.selectedItem) {
          return this.getData().indexOf(this.selectedItem);
      }
      return -1;
  }
  /**
   * Can be used to change the mode to edit mode.
   *
   */

  getSelectionMode () {
      if (this.selectionInfo && this.selectionInfo.mode) {
          return this.selectionInfo.mode;
      }
      return 'count';//default value
  }
  getSelectedItemsAsQuery (e) {
      let queryObject = {};
      let dataSourceElement = this.shadowRoot.querySelector("#governGridDataSource");
      let selectionMode = this.getSelectionMode();

      if (dataSourceElement && dataSourceElement.request && dataSourceElement.request.params) {
          let searchQueryParams = dataSourceElement.request.params;
          if (selectionMode == 'query') {
              queryObject = DataHelper.cloneObject(searchQueryParams.query);
          } else if (selectionMode == 'count') {
              let selectedItems = this.getSelectedItems();
              if (selectedItems && selectedItems.length > 0) {
                  let entityIds = [];
                  for (let i = 0; i < selectedItems.length; i++) {
                      entityIds.push(selectedItems[i].id);
                  }
                  queryObject.ids = entityIds;
                  queryObject.filters = {};
                  queryObject.filters.typesCriterion = searchQueryParams.query.filters.typesCriterion;
              }
          }
      }
      return queryObject;
  }
  /**
   * Can be used to return the array of `selectedItems`.
   * When `multiSelection` is set to true, then the array contains the selected items.
   * @return {Array<object>} The `selectedItems` is an array of objects and other properties as below.
   * If `selectedItems.inverted` is `true`, then the array contains deselected items.
   * The `selectedItems.filters` contains an array of filters that are active when the selection changes.
   */
  getSelectedItem () {
      let ironDataTable = this._getIronDataTable();
      return ironDataTable.selectedItem;
  }
  /**
    * <b><i>Content development is under progress... </b></i> 
    */
  getSelectedItems () {
      if (!this.selectedItems.inverted) {
          return this.selectedItems;
      } else {
          let items = this.getData();
          this.selectedItems.forEach(function (item) {
              let index = items.indexOf(item);
              if (index > -1) {
                  items.splice(index, 1);
              }
          });
          return items;
      }
  }
  _prepareGridData (data) {
      let entitiesGovernData = data.entitiesGovernData;
      let businessConditionsForEntityTypes = data.businessConditionsForEntityTypes;
      let gridData = [];
      if (!_.isEmpty(entitiesGovernData)) {
          for (let i = 0; i < entitiesGovernData.length; i++) {
              let entityGovernData = entitiesGovernData[i];
              let rowData = {
                  "id": entityGovernData.id,
                  "entityName": entityGovernData.name,
                  "type": entityGovernData.type,
                  "workflowLongName": entityGovernData.workflowLongName,
                  "activityLongName": entityGovernData.activityLongName,
                  "workflowName": entityGovernData.workflowName,
                  "activityName": entityGovernData.activityName,
                  "assignedUser": entityGovernData.assignedUser,
                  "allowedRoles": entityGovernData.allowedRoles,
                  "actions": entityGovernData.actions,
                  "previousStepComments": entityGovernData.previousStepComments,
                  "linkTemplate": "entity-manage?id={id}&type={type}"
              };
              this._addBusinessConditionsData(rowData, entityGovernData.businessConditions, businessConditionsForEntityTypes);
              gridData.push(rowData);
          }
      }
      return gridData;
  }
  _addBusinessConditionsData (rowData, entityBusinessConditions, businessConditionsForEntityTypes) {
      if (!_.isEmpty(this.headerData)) {
          let status = "";
          for (let i = 0; i < this.headerData.length; i++) {
              let bizcon = this.headerData[i];
              let entityType = rowData.type;
              let entityBusinessCondition = undefined
              if (!_.isEmpty(entityBusinessConditions)) {
                  entityBusinessCondition = entityBusinessConditions.find(obj => obj.id === bizcon.id);
              }
              if (entityBusinessCondition) {
                  status = entityBusinessCondition.status;
              } else {
                  let entityTypeBusinessConditions = businessConditionsForEntityTypes &&
                      businessConditionsForEntityTypes[entityType] &&
                      businessConditionsForEntityTypes[entityType].businessConditions ?
                      businessConditionsForEntityTypes[entityType].businessConditions : [];
                  if (!_.isEmpty(entityTypeBusinessConditions) && entityTypeBusinessConditions.indexOf(bizcon.id) != -1) {
                      status = "unknown";
                  }
              }
              
              rowData[bizcon.id] = this._getBusinessConditionStatus(status);
          }
      }
  }
  _getBusinessConditionStatus (status) {
      if (typeof (status) === "boolean") {
          if (status) {
              return "Valid";
          } else {
              return "Invalid";
          }
      } else if (status == "unknown") {
          return "Not Checked";
      } else {
          return "-NA-"
      }
  }
  _getLink (item) {
      if (!_.isEmpty(item)) {
          let _this = this;
          return item.linkTemplate.replace(/\{\S+?\}/g,
              function (match) {
                  let attrName = match.replace("{", "").replace("}", "");
                  if (attrName.toLowerCase() == "id") {
                      return encodeURIComponent(item.id);
                  }
                  if (attrName.toLowerCase() == "type") {
                      return encodeURIComponent(item.type);
                  }

                  return encodeURIComponent(match);
              });
      }
  }
  _getStatus (entity, businessCondition) {
      if(entity && businessCondition) {
          return entity[businessCondition.id];
      }
  }
  _getIconByType (entity, businessCondition) {
      if(entity && businessCondition) {
          let type = entity[businessCondition.id];
          if (type == "Invalid") {
              return 'pebble-icon:governance-failed';
          } else if (type == "Valid") {
              return 'pebble-icon:goveranance-success';
          } else if (type == "Not Checked") {
              return 'pebble-icon:goveranance-indeterminate';
          } else {
              return "";
          }
      }
      return "";
  }
  _getClassByType (entity, businessCondition) {
      if(entity && businessCondition) {
          let type = entity[businessCondition.id];
          if (type == "Invalid") {
              return "Invalid";
          } else if (type == "Valid") {
              return "";
          } else if (type == "Not Checked") {
              return "unknown";
          } else {
              return "";
          }
      }
  }
  _isDisabled (entity) {
      if (entity && entity.allowedRoles && entity.allowedRoles instanceof Array && this.roles) {
          let isRoleAllowed = entity.allowedRoles.some(allowedRole => this.roles.indexOf(allowedRole) > -1)
          if (isRoleAllowed) {
              return false;
          }
      }
      return true;
  }
  _computeTitle (resultRecordSize, currentRecordSize) {
      if (!(resultRecordSize === undefined || currentRecordSize === undefined)) {
          let title = "Showing 1 - " + currentRecordSize + " items of total " + resultRecordSize + " results ";
          this.set("title", title);
      }
  }
  _headersChanged(headerData) {
      this.shadowRoot.querySelector("#columns-template").render();
  }
  getControlIsDirty () {
     let selectedItems = this.getSelectedItems();
     if(selectedItems.length > 0){
         return true;
     }
      return false;
  }
  refresh(){
      this.reRenderGrid();
  }
}
customElements.define(RockGovernDataGrid.is, RockGovernDataGrid);
