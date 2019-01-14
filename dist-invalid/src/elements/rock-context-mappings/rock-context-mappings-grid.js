/**
<b><i>Content development is under progress... </b></i>

@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import '../bedrock-logger-behavior/bedrock-logger-behavior.js';
import '../bedrock-toast-behavior/bedrock-toast-behavior.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../liquid-entity-data-get/liquid-entity-data-get.js';
import '../liquid-entity-model-get/liquid-entity-model-get.js';
import '../liquid-rest/liquid-rest.js';
import '../pebble-icons/pebble-icons.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-spinner/pebble-spinner.js';
import '../pebble-button/pebble-button.js';
import '../pebble-popover/pebble-popover.js';
import '../pebble-data-table/pebble-data-table.js';
import '../pebble-textbox/pebble-textbox.js';
import '../pebble-lov/pebble-lov.js';
import '../pebble-dialog/pebble-dialog.js';
import '../pebble-actions/pebble-actions.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-helpers/context-helper.js';
import '../bedrock-mapping-grid-behavior/bedrock-mapping-grid-behavior.js';
import './rock-context-path-builder.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import '../bedrock-style-manager/styles/bedrock-style-floating.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockContextMappingsGrid extends 
    mixinBehaviors([RUFBehaviors.MappingGridBehavior,
    RUFBehaviors.ToastBehavior,
    RUFBehaviors.LoggerBehavior], OptionalMutableData(PolymerElement)) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-tooltip bedrock-style-grid-layout bedrock-style-floating bedrock-style-icons bedrock-style-padding-margin">
            :host {
                display: block;
                height: 100%;
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

            pebble-actions {
                text-transform: none;
            }
        </style>
        <pebble-spinner active="[[_loading]]"></pebble-spinner>
        <div class="base-grid-structure">
            <div class="base-grid-structure-child-1">
                <div id="grid-heading">
                    <strong>Context Mappings for [[entityTypeExternalName]]</strong>
                </div>
                <div id="gridManage">
                    <span class="gridCountMsg">[[_getGridRecordsCountMessage(_gridData)]]</span>
                    <span class="pull-right">
                        <pebble-icon class="pebble-icon-size-16 m-r-10" id="add" icon="pebble-icon:action-add" title="Add" raised="" on-tap="_onAddTap"></pebble-icon>
                        <pebble-icon class="pebble-icon-size-16" id="delete" icon="pebble-icon:action-delete" title="Delete" raised="" on-tap="_onDeleteTap"></pebble-icon>
                    </span>
                </div>
            </div>
            <div class="base-grid-structure-child-2">
                <div id="grid-container" class="button-siblings">
                    <pebble-data-table id="mapping-grid" items="{{_gridData}}" multi-selection="">
                        <data-table-column slot="column-slot" name="Context">
                            <template>
                                <div id="inputContextDiv" slot="cell-slot-content" index="[[index]]" title\$="[[item.context]]">
                                    <pebble-textbox readonly="" class="column-text" id="context_[[index]]" row-id="[[index]]" value="{{item.context}}"></pebble-textbox>
                                </div>
                                <div id="iconContextDiv" slot="cell-slot-content">
                                    <pebble-icon class="dropdown-icon pebble-icon-size-10" id="dropdownContextIcon_[[index]]" row-id="[[index]]" icon="pebble-icon:navigation-action-down" on-tap="_showContextLOV"></pebble-icon>
                                </div>
                            </template>
                        </data-table-column>
                        <data-table-column slot="column-slot" name="Excel Column">
                            <template>
                                <div id="inputExcelDiv" slot="cell-slot-content" index="[[index]]" title\$="[[item.excelColumn]]">
                                    <pebble-textbox readonly="" class="column-text" id="excelColumn_[[index]]" row-id="[[index]]" value="[[item.excelColumn]]"></pebble-textbox>
                                </div>
                                <div id="iconExcelDiv" slot="cell-slot-content">
                                    <pebble-icon class="dropdown-icon pebble-icon-size-10" id="dropdownExcelIcon__[[index]]" row-id="[[index]]" icon="pebble-icon:navigation-action-down" on-tap="_showExcelLOV"></pebble-icon>
                                </div>
                                <div id="buttonDiv" slot="cell-slot-content">
                                    <pebble-icon class="action-button-focus pebble-icon-size-16 m-l-20" title="Build Path" icon="pebble-icon:build-path" id="btnBuildPath_[[index]]" row-id="[[index]]" raised="" on-tap="_onTapBuildPath" hidden\$="[[!item.isPath]]"></pebble-icon>
                                </div>
                            </template>
                        </data-table-column>
                    </pebble-data-table>
                    <pebble-popover class="attributes-popover" id="excelColumnPopover" for="" no-overlap="" vertical-align="auto" horizontal-align="auto">
                        <pebble-lov id="excelColumnLOV" row-id="[[index]]" items="[[gridExcelFields]]" on-selection-changed="_onExcelColumnSelectionChanged"></pebble-lov>
                    </pebble-popover>
                    <pebble-popover class="attributes-popover" id="contextPopover" for="" no-overlap="" vertical-align="auto" horizontal-align="auto">
                        <pebble-lov id="contextLOV" row-id="[[index]]" items="[[gridContexts]]" on-selection-changed="_onContextSelectionChanged"></pebble-lov>
                    </pebble-popover>
                </div>
                <div id="actions-container" class="m-t-10" align="center">
                    <pebble-button class="action-button btn btn-secondary m-r-10" id="back" button-text="Back" raised="" on-tap="_onBackTap"></pebble-button>
                    <pebble-button class="action-button btn btn-primary m-r-10" id="skip" button-text="Skip" raised="" on-tap="_onSkipTap"></pebble-button>
                    <pebble-button class="action-button btn dropdown-success m-r-10" id="saveandcontinue" button-text="Save &amp; Continue" raised="" on-tap="_onSaveTap"></pebble-button>
                </div>
            </div>
        </div>

        <!--Dirty check dialog-->
        <pebble-dialog id="context-mappings-dirty-check-Dialog" dialog-title="Confirmation" modal="" alert-box="" show-cancel="" show-ok="" no-cancel-on-outside-click="" no-cancel-on-esc-key="">
            <p>[[_dirtyCheckConfirmationMessage]]</p>
        </pebble-dialog>
        <bedrock-pubsub event-name="on-buttonok-clicked" handler="_discardContextChanges" target-id="context-mappings-dirty-check-Dialog"></bedrock-pubsub>

        <!-- Build path dialog -->
        <pebble-dialog id="buildPathDialog" dialog-title="CONTEXT PATH SELECTION" modal="" show-close-icon="" no-cancel-on-outside-click="" no-cancel-on-esc-key="">
            <rock-context-path-builder id="contextPathBuilder"></rock-context-path-builder>
        </pebble-dialog>

        <!-- Build Path events -->
        <bedrock-pubsub event-name="context-build-path-cancel" handler="_onCancelBuildPath" target-id=""></bedrock-pubsub>
        <bedrock-pubsub event-name="context-build-path-select" handler="_onSelectBuildPath" target-id=""></bedrock-pubsub>

        <!-- Mappings get/save -->
        <liquid-rest id="getMappings" url="/data/cop/getMappings" method="POST" request-data="[[_getMappingsRequest]]" on-liquid-response="_onGetMappingsResponse" on-liquid-error="_onMappingsError"></liquid-rest>
        <liquid-rest id="saveMappings" url="/data/cop/saveMappings" method="POST" request-data="[[_saveMappingsRequest]]" on-liquid-response="_onMappingsSaveResponse" on-liquid-error="_onMappingsError"></liquid-rest>
`;
  }

  static get is() {
      return "rock-context-mappings-grid";
  }

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

          copContext: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          mappingConfig: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          mappingData: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          entityGetrequest: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          contexts: {
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
          },

          gridContexts: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          _mappingAttributes: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          _loading: {
              type: Boolean,
              value: false
          },

          _contextPathFields: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          domain: {
              type: String,
              value: "thing"
          },

          copFormat: {
              type: String,
              value: "Excel"
          },

          selectedOptions: {
              type: Object,
              value: function () {
                  return { "role": "_DEFAULT", "ownershipData": "_DEFAULT", "saveType": "self" }
              }
          }
      };
  }

  static get observers() {
      return [
          "_onMappingsDataChange(mappingConfig, businessFunctionData, contextData, copContext)"
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

  async _onMappingsDataChange() {
      if (!_.isEmpty(this.businessFunctionData) && this.businessFunctionData["context-mapping-data"]) {
          this.mappingData = this.businessFunctionData["context-mapping-data"];
      }

      if (!_.isEmpty(this.contextData) && !_.isEmpty(this.mappingData) && !_.isEmpty(this.mappingConfig) && !_.isEmpty(this.copContext)) {
          this._loading = true;
          let itemContext = ContextHelper.getFirstItemContext(this.contextData);
          if (itemContext) {
              this.entityType = itemContext.type;
              this.contexts = this.mappingData.contexts;
              this.domain = this.mappingData.domain;
              this.entityTypeExternalName = this.mappingData.entityTypeExternalName;
              this.contextExternalNames = this.mappingData.contextExternalNames;
              this.fileFormat = this.mappingData.fileFormat;
              this.selectedOptions = this.mappingData.selectedOptions;
              //Fetch context mappings now
              this._getMappings();
          }
      }
  }

  _getMappings() {
      let selectedContexts = [{
          "type": "entitytype",
          "value": this.entityType
      }];
      let types = ["contextmapping"];
      let req = DataRequestHelper.createMappingsGetRequest(this.contextData, this.copContext, selectedContexts, types, this.selectedOptions);
      req.params.rsconnect.headers.entities = this.mappingData.headerFields;
      req.params.query.contexts[0].ownershipdata = Array.isArray(this.selectedOptions.ownershipData) ? this.selectedOptions.ownershipData[0] : this.selectedOptions.ownershipData;;
      this.set("_getMappingsRequest", req);
      let getMappings = this.shadowRoot.querySelector("#getMappings");
      if (getMappings) {
          getMappings.generateRequest();
      }
  }

  _onGetMappingsResponse(e, detail) {
      if (!DataHelper.isValidObjectPath(detail, "response.response.status") ||
          detail.response.response.status.toLowerCase() != "success") {
          this.logError("Unable to fetch context mappings, contact administrator.", e.detail);
          this._loading = false;
          return;
      }

      let response = detail.response.response;
      if (response.entities) {
          if (response.entities.length > 0 && DataHelper.isValidObjectPath(response, "entities.0.data.contexts")) {
              let contexts = response.entities[0].data.contexts || [];
              for (let i = 0; i < contexts.length; i++) {
                  for (let key in contexts[i].attributes) {
                      this._mappingAttributes[key] = contexts[i].attributes[key];
                  }
              }
          }
      }

      //Prepare grid now
      this._prepareGridData();
  }

  _prepareGridData() {
      let gridData = [];
      let contexts = [];
      for (let i = 0; i < this.contexts.length; i++) {
          let attributeValue = this._getMappingAttribute(this.contexts[i]);
          let rowData = {
              "context": this._getContextExternalName(this.contexts[i]),
              "excelColumn": attributeValue,
              "index": i
          };
          this._setBuildPath(rowData);
          gridData.push(rowData);
          contexts.push({
              "id": this.contexts[i],
              "title": this._getContextExternalName(this.contexts[i])
          });
      }

      let excelFields = [];
      for (let i = 0; i < this.mappingData.headerFields.length; i++) {
          excelFields.push({
              "id": this.mappingData.headerFields[i],
              "title": this.mappingData.headerFields[i]
          });
      }

      this.set("gridExcelFields", excelFields);
      this.set("gridContexts", contexts);
      this.set("_gridData", gridData);
      this._loading = false;

      //Before redirecting to next, set the grid
      if (this._discardChanges) {
          this._discardChanges = false;
          this.async(function () {
              RUFBehaviors.MappingGridBehaviorImpl._triggerEvent.call(this);
          }, 500);
      }
  }

  _getContextExternalName(contextName) {
      return this.contextExternalNames[contextName] || contextName;
  }

  _getContextKeyByExternalName(contextExternalName) {
      for (let key in this.contextExternalNames) {
          if (this.contextExternalNames[key] == contextExternalName) {
              return key || contextExternalName;
          }
      }
      return contextExternalName;
  }

  _getMappingAttribute(context) {
      let attributeValue = "";
      if (this._mappingAttributes && this._mappingAttributes[context] &&
          this._mappingAttributes[context].values && this._mappingAttributes[context].values.length) {
          attributeValue = this._mappingAttributes[context].values[0].value || "";
      }

      return attributeValue;
  }

  _setBuildPath(rowData, rowId) {
      if (this._contextPathFields && this._contextPathFields.indexOf(rowData.context.toLowerCase()) != -1) {
          rowData.isPath = true;
      } else {
          rowData.isPath = false;
      }

      if (rowId >= 0) {
          let btnBuildPath = this.root.querySelector("#btnBuildPath_" + rowId);
          if (btnBuildPath) {
              if (rowData.isPath) {
                  btnBuildPath.removeAttribute("hidden");
              } else {
                  btnBuildPath.setAttribute("hidden", "");
              }
          }
      }
  }

  _showExcelLOV(e) {
      let id = "excelColumn";
      this._showLOV(e, id);
  }

  _showContextLOV(e) {
      let id = "context";
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

  _onContextSelectionChanged(e, detail) {
      let id = "context";
      this._onLOVSelectionChanged(detail, id);
  }

  _onLOVSelectionChanged(detail, id) {
      let lovId = "#" + id + "LOV";
      let popoverId = "#" + id + "Popover";
      let txtId = "#" + id;
      
      let popover = this.shadowRoot.querySelector(popoverId);
      popover.for = "";
      popover.hide();

      this._isMappingChanged = true;
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
                      let rowParentDiv = columnTxtbox.parentElement;
                      if(rowParentDiv){
                          rowParentDiv.setAttribute("title", detail.item.title);
                      }
                      columnTxtbox.value = detail.item.title;
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

  _onBackTap(e) {
      this.currentEventName = "onBack";
      RUFBehaviors.MappingGridBehaviorImpl._triggerDirtyCheck.call(this, "context");
  }

  _discardContextChanges() {
      this._discardChanges = true;
      this._prepareGridData(); //Discarded the changes
  }

  _onSkipTap(e) {
      this.currentEventName = "onSkip";
      this._setAttributeMappingsData();
      RUFBehaviors.MappingGridBehaviorImpl._triggerDirtyCheck.call(this, "context");
  }

  _onSaveTap(e) {
      if (this._isDuplicateGridDataAvailable()) {
          this.showWarningToast("Provide unique contexts.");
          return;
      }

      this._loading = true;
      let mappings = this._transformGridDataToSaveMappings();

      if (!_.isEmpty(mappings)) {
          let selectedContexts = [{
              "type": "entitytype",
              "value": this.entityType
          }];
          let saveRequest = DataRequestHelper.createMappingsSaveRequest(this.contextData, this.copContext, selectedContexts, "contextmapping", this.selectedOptions);
          if (!_.isEmpty(saveRequest)) {
              saveRequest.entity.data.contexts[0].attributes = mappings;
              saveRequest.entity.data.contexts[0].context.ownershipdata = Array.isArray(this.selectedOptions.ownershipData) ? this.selectedOptions.ownershipData[0] : this.selectedOptions.ownershipData;
              saveRequest.entity.data.contexts[0].context.format = this.fileFormat;
              this.set("_saveMappingsRequest", saveRequest);
              let saveMappings = this.shadowRoot.querySelector("#saveMappings");
              if (saveMappings) {
                  saveMappings.generateRequest();
              }
          }
      } else {
          this.showSuccessToast("There are no changes in mappings to save.");
          this._loading = false;
      }
  }

  _onMappingsSaveResponse(e, detail) {
      let response = detail && detail.response && detail.response.response ? detail.response.response : "";
      if (response && response.status == "success") {
          this.showSuccessToast("Context mappings saved successfully.");
          //Trigger event to goto next step
          this._setAttributeMappingsData(true);
          let eventName = "onNext";
          let eventDetail = {
              name: eventName,
              data: {}
          }
          this.fireBedrockEvent(eventName, eventDetail, {
              ignoreId: true
          });
          this._loading = false;
          this._isMappingChanged = false;
          return;
      }

      this._loading = false;
      this.logError("Unable to save context mappings.", detail);
  }

  _onMappingsError(e, detail) {
      this.logError("Mapping get/save error:- Unable to perform mappings operation.", detail);
      this._loading = false;
  }

  _isDuplicateGridDataAvailable() {
      let uniqueContexts = [...new Set(this._gridData.map((obj) => obj.context))];

      if (this._gridData.length != uniqueContexts.length) {
          return true;
      }

      return false;
  }

  _transformGridDataToSaveMappings() {
      let mappings = {};
      let contextMapping = DataHelper.cloneObject(this._mappingAttributes);
      let self = this;
      this._gridData.forEach(function (row) {
          let mappedValues = [];
          let contextKey = self._getContextKeyByExternalName(row.context);
          if (contextMapping[contextKey]) {
              //If excel column value matched, then do not consider as change
              if (row.excelColumn != contextMapping[contextKey].values[0].value) {
                  mappedValues.push(self._populateMappingValue(row.excelColumn));
                  let deleteExisting = self._populateMappingValue(contextMapping[contextKey].values[0].value);
                  deleteExisting.action = "delete";
                  mappedValues.push(deleteExisting);
              }

              delete contextMapping[contextKey];
          } else {
              let mappingVal = self._populateMappingValue(row.excelColumn);
              if (mappingVal) {
                  mappedValues.push(mappingVal);
              }
          }

          if (mappedValues && mappedValues.length) {
              mappings[contextKey] = {
                  "values": mappedValues
              };
          }
      });

      //Remaining mappings not in grid, so consider as delete
      if (!_.isEmpty(contextMapping)) {
          for (let key in contextMapping) {
              contextMapping[key].action = "delete";
              mappings[key] = contextMapping[key];
          }
      }

      return mappings;
  }

  _populateMappingValue(excelValue) {
      if (!excelValue) {
          return;
      }
      let valContext = ContextHelper.getFirstValueContext(this.contextData);

      return {
          "value": excelValue,
          "locale": valContext.locale,
          "source": valContext.source
      }
  }

  _onAddTap() {
      this.push("_gridData", {
          "context": "",
          "excelColumn": "",
          "index": this._gridData.length
      });
      this._isMappingChanged = true;
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
                  if (this._gridData[i].context.toLowerCase() == selectedItems[j].context.toLowerCase() &&
                      this._gridData[i].index == selectedItems[j].index) {
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
              gridData[i].index = i;
          }
          this._isMappingChanged = true;
          this.set("_gridData", gridData);
      }
  }

  _getGridRecordsCountMessage() {
      if (!this._gridData || this._gridData.length == 0) {
          return "Showing 0 results";
      }

      return "Showing 1 - " + this._gridData.length + " items of total " + this._gridData.length + " results";
  }

  _onTapBuildPath(e, detail) {
      let rowId = e.currentTarget.rowId;
      this.currentPathEl = this.shadowRoot.querySelector("#excelColumn_" + rowId);
      //Assign details to path component
      let contextPathBuilder = this.shadowRoot.querySelector("#contextPathBuilder");
      if (contextPathBuilder) {
          //Reset
          contextPathBuilder.inputPath = "";
          contextPathBuilder.headerFields = [];
          //Set excel details
          contextPathBuilder.inputPath = this.currentPathEl.value;
          contextPathBuilder.headerFields = this.mappingData.headerFields;
      }
      this._toggleBuildPathDialog(true);
  }

  _onCancelBuildPath(e, detail) {
      this._toggleBuildPathDialog(false);
  }

  _onSelectBuildPath(e, detail) {
      let row = this._getParentRow(this.currentPathEl);
      if (row) {
          row.item.excelColumn = this.currentPathEl.value = detail.selectedPath;
          this.currentPathEl.title = detail.selectedPath;
          this._toggleBuildPathDialog(false);
      }
  }

  _toggleBuildPathDialog(open) {
      let buildPathDialog = this.shadowRoot.querySelector("#buildPathDialog");
      if (buildPathDialog) {
          if (open) {
              buildPathDialog.open();
          } else {
              buildPathDialog.close();
          }
      }
  }

  //Prepare non context fields based on context mappings
  _getNonTaxonomyFields(fromGridData) {
      let nonContextFields = [];
      let contextFields = [];
      let categoryPathSeperator = this.appSetting('dataDefaults').categoryPathSeparator;

      //Collect context fields from grid / initial mapping contexts
      if (fromGridData) {
          let self = this;
          this._gridData.forEach(function (row) {
              if (row.excelColumn) {
                  let columns = [];
                  columns = row.excelColumn.split(categoryPathSeperator);
                  contextFields = contextFields.concat(columns);
                  //Update mappingAttributes
                  let key = self._getContextKeyByExternalName(row.context);
                  if (self._mappingAttributes && self._mappingAttributes[key]) {
                      self._mappingAttributes[key].values[0].value = row.excelColumn;
                  } else {
                      let mappingVal = self._populateMappingValue(row.excelColumn);
                      self._mappingAttributes[key] = {
                          "values": [
                              mappingVal
                          ]
                      }
                  }
              }
          });
      } else {
          if (!_.isEmpty(this._mappingAttributes)) {
              for (let key in this._mappingAttributes) {
                  if (this._mappingAttributes[key] &&
                      this._mappingAttributes[key].values &&
                      this._mappingAttributes[key].values.length) {
                      for (let i = 0; i < this._mappingAttributes[key].values.length; i++) {
                          let columns = [];
                          columns = this._mappingAttributes[key].values[i].value.split(categoryPathSeperator);
                          contextFields = contextFields.concat(columns);
                      }
                  }
              }
          }
      }

      //Prepare non-context fields
      for (let i = 0; i < this.mappingData.headerFields.length; i++) {
          if (contextFields.indexOf(this.mappingData.headerFields[i]) == -1) {
              nonContextFields.push(this.mappingData.headerFields[i]);
          }
      }

      return nonContextFields;
  }

  _setAttributeMappingsData(fromGridData = false) {
      let attributeFields = this._getNonTaxonomyFields(fromGridData);
      let mappingData = {
          "headerFields": attributeFields && attributeFields.length > 0 ? attributeFields : this.mappingData.headerFields,
          "contexts": this.contexts,
          "domain": this.domain,
          "fileFormat": this.fileFormat,
          "selectedOptions": this.selectedOptions
      }

      //Prepare mapping data, and pass the same as businessFunctionData
      if (!this.businessFunctionData) {
          this.businessFunctionData = {};
      }
      this.businessFunctionData["attribute-mapping-data"] = mappingData;
      ComponentHelper.getParentElement(this).businessFunctionData = this.businessFunctionData;
  }
}

customElements.define(RockContextMappingsGrid.is, RockContextMappingsGrid);
