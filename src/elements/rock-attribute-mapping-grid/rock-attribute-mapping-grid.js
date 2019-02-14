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

import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-helpers/data-request-helper.js';
import '../bedrock-helpers/data-transform-helper.js';
import '../liquid-config-get/liquid-config-get.js';
import '../liquid-config-save/liquid-config-save.js';
import '../liquid-entity-model-composite-get/liquid-entity-model-composite-get.js';
import '../liquid-rest/liquid-rest.js';
import '../pebble-data-table/pebble-data-table.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-buttons.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import '../bedrock-style-manager/styles/bedrock-style-floating.js';
import '../pebble-icons/pebble-icons.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-button/pebble-button.js';
import '../pebble-textbox/pebble-textbox.js';
import '../pebble-popover/pebble-popover.js';
import '../pebble-dialog/pebble-dialog.js';
import '../pebble-spinner/pebble-spinner.js';
import '../pebble-actions/pebble-actions.js';
import '../rock-attribute-model-lov/rock-attribute-model-lov.js';
import '../rock-classification-tree/rock-classification-tree.js';
import '../rock-context-selector/rock-context-selector.js';
import '../rock-value-mappings-manage/rock-value-mappings-grid.js';
import '../bedrock-style-manager/styles/bedrock-mapping-grid-style.js';
import '../bedrock-mapping-grid-behavior/bedrock-mapping-grid-behavior.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';

class RockAttributeMappingGrid
    extends mixinBehaviors([
        RUFBehaviors.MappingGridBehavior
    ], PolymerElement) {
  static get template() {
    return html`
        <style include="bedrock-mapping-grid-style bedrock-style-grid-layout bedrock-style-floating bedrock-style-icons bedrock-style-padding-margin bedrock-style-buttons">
            :host{
                display: block;
                height: 100%;
            }
            .attributes-text .context-text {
                line-height: 56px;
            }

            :host{
                display: block;
                height:100%;
            }
            .mapping-dialog{
                height:85vh;
            }
            pebble-actions {
                text-transform: none;
            }
        </style>
        <pebble-spinner active="[[_loading]]"></pebble-spinner>
        <liquid-rest id="getMappings" url="/data/cop/getMappings" method="POST" on-liquid-response="_onGetMappingsResponse" on-liquid-error="_onMappingsError"></liquid-rest>
        <liquid-rest id="saveMappings" url="/data/cop/saveMappings" method="POST" on-liquid-response="_onMappingsSaveResponse" on-liquid-error="_onMappingsError"></liquid-rest>
            <div class="full-height">
                <div class="base-grid-structure">
                    <div class="base-grid-structure-child-1">
                        <div id="grid-heading">
                            <strong>Attribute Mapping</strong>
                        </div>
                        <div id="context-header" hidden\$="[[!_isContextsAvailable(_contexts)]]">
                                <rock-context-selector id="attributeContextSelector" context-data="[[contextData]]" app-name="app-business-function-mapping" domain="[[mappingData.domain]]" all-single-select="" show-confirmation\$="[[_isMappingChanged]]" confirmation-message="[[_dirtyCheckConfirmationMessage]]"></rock-context-selector>
                                <bedrock-pubsub event-name="context-selector-data-changed" handler="_onContextsChanged" target-id="attributeContextSelector"></bedrock-pubsub>
                        </div>
                        <div id="gridManage">
                            <span class="gridCountMsg">[[_getGridRecordsCountMessage(_gridData)]]</span>
                            <span class="pull-right">
                                <pebble-icon class="iconButton pebble-icon-size-16 m-r-10" icon="pebble-icon:action-add" id="add" title="Add" raised="" on-tap="_onAddTap"></pebble-icon>
                                <pebble-icon class="iconButton pebble-icon-size-16" icon="pebble-icon:action-delete" id="delete" title="Delete" raised="" on-tap="_onDeleteTap"></pebble-icon>
                            </span>
                        </div>
                    </div>
                    <div class="base-grid-structure-child-2">
                        <div id="grid-container" class="button-siblings">
                            <template is="dom-if" if="[[_isDataAvailable(_gridData)]]">
                                <pebble-data-table id="mapping-grid" items="{{_gridData}}" multi-selection="" selected-item="{{selectedItem}}">
                                    <data-table-column slot="column-slot" name="Excel Column Name" filter-by="excelColumnName">
                                        <template>
                                            <pebble-textbox slot="cell-slot-content" class="column-text" id="excelColumnName_[[index]]" no-label-float="" row-id="[[index]]" value="{{item.excelColumnName}}" on-change="_onRowChange" title\$="[[item.excelColumnName]]"></pebble-textbox>
                                        </template>
                                    </data-table-column>
                                    <data-table-column slot="column-slot" name="Mapped System Attribute Name" filter-by="attributeModel.title">
                                        <template>
                                            <div id="inputDiv" slot="cell-slot-content" on-tap="_onAttributeTap" index="[[index]]" title\$="[[item.attributeModel.title]]">
                                                <pebble-textbox readonly="" class="attributes-text" id="attributes-text_[[index]]" row-id="[[index]]" no-label-float="" value="[[item.attributeModel.title]]"></pebble-textbox>
                                            </div>
                                            <div id="iconDiv" slot="cell-slot-content">
                                                <pebble-icon class="dropdown-icon pebble-icon-size-10" id="txtDropdownIcon_[[index]]" row-id="[[index]]" icon="pebble-icon:navigation-action-down" on-tap="_showAttributesLOV"></pebble-icon>
                                            </div>
                                        </template>
                                    </data-table-column>
                                    <data-table-column slot="column-slot" name="Value Mappings" filter-type="checkbox" filter-by="supportsValueMapping">
                                        <template>
                                            <div id="buttonDiv" slot="cell-slot-content">
                                                <pebble-icon class="action-button-focus pebble-icon-size-16 m-l-20" title="Value Mapping" icon="pebble-icon:value-mapping" id="btnValueMappings_[[index]]" raised="" on-tap="_onTapValueMapping" data-args\$="[[item.attributeModel.id]]" hidden\$="[[!_isValueMappingsAvailable(item.attributeModel)]]"></pebble-icon>
                                            </div>
                                        </template>
                                    </data-table-column>
                                </pebble-data-table>
                                <bedrock-pubsub event-name="attribute-model-lov-selection-changed" handler="_onAttributeSelection" target-id="attributeModelLov"></bedrock-pubsub>
                                <pebble-popover class="attributes-popover" id="attributesPopover" for="" no-overlap="" vertical-align="auto" horizontal-align="auto">
                                    <rock-attribute-model-lov mode="all" no-sub-title="" id-field="name" title-pattern="externalName" id="attributeModelLov" context-data="[[modelContextData]]" exclude-nested-attributes=""></rock-attribute-model-lov>
                                </pebble-popover>
                            </template>
                        </div>
                        <div id="actions-container" class="buttonContainer-static" align="center">
                            <pebble-button class="action-button btn btn-secondary m-r-10" id="back" button-text="Back" raised="" on-tap="_onBackTap"></pebble-button>
                            <pebble-button class="action-button btn btn-success m-r-10" id="save" button-text="Save" raised="" on-tap="_onSaveTap"></pebble-button>
                        </div>
                    </div>
                </div>
            </div>
        <!-- Value mapping dialog -->
        <pebble-dialog id="valueMappingsDialog" dialog-title="VALUE MAPPINGS" modal="" show-close-icon="" no-cancel-on-outside-click="" no-cancel-on-esc-key="">
            <div id="valueMappingsDialogContent" class="mapping-dialog">

            </div>
        </pebble-dialog>

        <!-- Value mapping events -->
        <bedrock-pubsub event-name="value-mapping-cancel" handler="_onCancelOrSaveValueMappings" target-id=""></bedrock-pubsub>

        <!--Dirty check dialog-->
        <pebble-dialog id="attribute-mappings-dirty-check-Dialog" dialog-title="Confirmation" modal="" alert-box="" show-cancel="" show-ok="" no-cancel-on-outside-click="" no-cancel-on-esc-key="">
            <p>[[_dirtyCheckConfirmationMessage]]</p>
        </pebble-dialog>
        <bedrock-pubsub event-name="on-buttonok-clicked" handler="_discardAttributeChanges" target-id="attribute-mappings-dirty-check-Dialog"></bedrock-pubsub>

        <liquid-entity-model-get name="liquidAttributeModelGet" operation="getbyids" on-response="_onAttributeModelGetResponse" on-error="_onError"></liquid-entity-model-get>
        <liquid-entity-model-composite-get name="liquidEntityManageModelGet" operation="getbyids" on-entity-model-composite-get-response="_onEntityManageModelGetResponse" on-error="_onEntityManageModelGetError"></liquid-entity-model-composite-get>
`;
  }

  static get is() { return 'rock-attribute-mapping-grid' }
  static get properties() {
      return {
          selectedItem: {
              type: Object,
              notify: true
          },

          copContext: {
              type: Object,
              value: function () { return {}; }
          },
          _entityManageModelAttributes: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _refChangeDeletedMappings: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          _isMappingsSaved: {
              type: Boolean,
              value: false
          },

          saveActions: {
              type: Array,
              value: function () {
                  return []
              }
          },
          saveImportActions: {
              type: Array,
              value: function () {
                  return []
              }
          },
          selectedRole: {
              type: String,
              value: ""
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



  get saveMappingsLiq() {
      this._saveMappingsLiq = this._saveMappingsLiq || this.shadowRoot.querySelector("#saveMappings");
      return this._saveMappingsLiq;
  }

  get liquidEntityManageModelGetLiq() {
      this._liquidEntityManageModelGet = this._liquidEntityManageModelGet || this.shadowRoot.querySelector("[name=liquidEntityManageModelGet]");
      return this._liquidEntityManageModelGet;
  }

  get attributeModelLov() {
      this._attributeModelLov = this._attributeModelLov || this.shadowRoot.querySelector("#attributeModelLov");;
      return this._attributeModelLov;
  }

  get popover() {
      this._popover = this._popover || this.shadowRoot.querySelector("#attributesPopover");
      return this._popover;
  }

  get mappingGrid() {
      this._mappingGrid = this._mappingGrid || this.shadowRoot.querySelector("#mapping-grid");
      return this._mappingGrid;
  }

  get valueMappingsDialog() {
      this._valueMappingsDialog = this._valueMappingsDialog || this.shadowRoot.querySelector("#valueMappingsDialog");
      return this._valueMappingsDialog;
  }

  get contextSelector() {
      this._contextSelector = this._contextSelector || this.shadowRoot.querySelector("#attributeContextSelector");
      return this._contextSelector;
  }

  _onMappingsDataChange () {
      this._getMappings();
  }

  _getMappings() {
      if (!_.isEmpty(this.contextData) && !_.isEmpty(this.mappingData) && !_.isEmpty(this.mappingConfig) && !_.isEmpty(this.copContext)) {
          this._loading = true;
          this._contexts = this.mappingData.contexts;
          this.saveActions = this.mappingData.saveActions;
          this.saveImportActions = this.mappingData.saveImportActions;
          this.fileFormat = this.mappingData.fileFormat;
          this.isAplusSheet = this.mappingData.isAplusSheet;
          this.selectedContexts = this._prepareContexts(this._contexts);
          let types = ["attributemapping"];
          this.selectedOptions = this.mappingData.selectedOptions;
          let req = DataRequestHelper.createMappingsGetRequest(this.contextData, this.copContext, this.selectedContexts, types, this.selectedOptions);
          req.params.rsconnect.headers.entities = this.mappingData.headerFields;
          req.params.query.contexts[0].ownershipdata = Array.isArray(this.selectedOptions.ownershipData) ? this.selectedOptions.ownershipData[0] : this.selectedOptions.ownershipData;
          req.params.query.contexts[0].format = this.fileFormat;
          if(_.isEmpty(this.modelContextData)) {
              this.modelContextData = DataHelper.cloneObject(this.contextData);
          } else {
              if(this.attributeModelLov) {
                  this.attributeModelLov.refresh();
              }
          }
          this._sendMappingRequest(req);
      }
  }

  _onGetMappingsResponse (e, detail) {
      this._loading = false;
      if (!this._isValidResponseStatus(detail)) {
          this.logError("Unable to fetch attribute mappings", detail);
          return;
      }

      let response = detail.response.response;
      let destinationAttributes = [];
      if (response.entities) {
          if (response.entities.length > 0 && DataHelper.isValidObjectPath(response, "entities.0.data.contexts.0.attributes")) {
              this._mappingAttributes = response.entities[0].data.contexts[0].attributes;
              for (let key in this._mappingAttributes) {
                  destinationAttributes.push(key);
              }
          }
      }

      if (destinationAttributes && destinationAttributes.length > 0) {
          let attributes = ['externalName'];
          let modelGetRequest = DataRequestHelper.createGetAttributeModelRequest(destinationAttributes, attributes);

          if(this.liquidAttributeModelGetLiq) {
              this.liquidAttributeModelGetLiq.requestData = modelGetRequest;
              this.liquidAttributeModelGetLiq.generateRequest();
              this._loading = true;
          }
      }
  }

  _onAttributeModelGetResponse (e) {
      let response = e.detail.response;
      if (response.content && !_.isEmpty(response.content.entityModels)) {
          let attributeModels = {};
          for (let i = 0; i < response.content.entityModels.length; i++) {
              let attributeModel = response.content.entityModels[i];
              attributeModels[attributeModel.name] = {
                  "id": attributeModel.name,
                  "value": attributeModel.name,
                  "title": attributeModel.properties.externalName
              };
          }
          this._attributeModels = attributeModels;
          //Value Mappings - Fetch the entity manage model, before preparing the grid
          this._getEntityManageModel();
      } else {
          this.logError("Models not available", response);
          this._loading = false;
      }
  }

  _getEntityManageModel () {
      let modelGetRequest = DataRequestHelper.createEntityModelCompositeGetRequest(this.contextData);
      this._setFieldsAndContextsForRequest(modelGetRequest);
      if(this.liquidEntityManageModelGetLiq) {
          this.liquidEntityManageModelGetLiq.requestData = modelGetRequest;
          this.liquidEntityManageModelGetLiq.generateRequest();
      }
  }

  _setFieldsAndContextsForRequest(modelGetRequest) {
      //Set fields
      delete modelGetRequest.params.fields.relationships;
      delete modelGetRequest.params.fields.relationshipAttributes;
      modelGetRequest.params.fields.attributes = ["_ALL"];

      //Set contexts
      let contexts = {};
      for(let i = 0; i < this._contexts.length; i++) {
          if(this.selectedDimensions && 
             this.selectedDimensions[this._contexts[i]] && 
             this.selectedDimensions[this._contexts[i]].length) {
              contexts[this._contexts[i]] = this.selectedDimensions[this._contexts[i]][0];
          }
      }

      if(!_.isEmpty(contexts)) {
          modelGetRequest.params.query.contexts = [contexts];
      }
  }

  _onEntityManageModelGetResponse (e, detail) {
      if (detail && DataHelper.isValidObjectPath(detail, "response.content.entityModels.0.data")) {
          let contexts = detail.response.content.entityModels[0].data.contexts;
          let attributes = detail.response.content.entityModels[0].data.attributes || {};
          //Set context attributes if available
          if(contexts && contexts.length > 0) {
              if(contexts[0].attributes) {
                  attributes = contexts[0].attributes || {};
              }
          }

          this._entityManageModelAttributes = attributes;
      }
      //Got the entityManageModel to set the ValueMappings button, now prepare grid
      this._prepareGridData();
  }

  _onEntityManageModelGetError (e, detail) {
      this.logError("Entity manage model get error", detail);
      this.showSuccessToast("Unable to get entity manage model, Contact administrator.");
      this._loading = false;
  }

  _getAttributeModelForHeaderField (field) {
      for (let key in this._mappingAttributes) {
          if (!_.isEmpty(this._mappingAttributes[key]) && this._mappingAttributes[key].values) {
              for (let i = 0; i < this._mappingAttributes[key].values.length; i++) {
                  if (this._mappingAttributes[key].values[i].value.toLowerCase() == field.toLowerCase()) {
                      return this._attributeModels[key];
                  }
              }
          }
      }
  }

  _prepareGridData () {
      let gridData = [];
      let contextFields = [];
      let headerFields = this.mappingData.headerFields;
      let itemContext = this.getFirstItemContext();
      let entityType = itemContext.type;
      for (let i = 0; i < headerFields.length; i++) {
          let headerField = headerFields[i];
          let attrModel = this._getAttributeModelForHeaderField(headerField);
          let rowData = {
              "excelColumnName": headerField,
              "attributeModel": attrModel,
              "source": "system",
              "action": "",
              "supportsValueMapping": this._isValueMappingsAvailable(attrModel)
          };
          gridData.push(rowData);
      }

      gridData.sort(function (a, b) {
          let nameA = a.excelColumnName.toUpperCase();
          let nameB = b.excelColumnName.toUpperCase();
          if (nameA < nameB) {
              return -1;
          }
          if (nameA > nameB) {
              return 1;
          }
          return 0;
      })

      let sortedData = [];
      let emptyDestinationData = gridData.filter(obj => _.isEmpty(obj.attributeModel) == true);
      let dataWithDestination = gridData.filter(obj => _.isEmpty(obj.attributeModel) == false);
      if (emptyDestinationData) {
          sortedData = sortedData.concat(emptyDestinationData);
      }
      if (dataWithDestination) {
          sortedData = sortedData.concat(dataWithDestination);
      }

      //Set row index on the sorted data
      for(let i = 0; i < sortedData.length; i++) {
          sortedData[i].index = i;
      }

      this.set("_gridData", sortedData);
      this._loading = false;
  }

  _showAttributesLOV (e) {
      let rowId = e.currentTarget.rowId;
      if (rowId >= 0) {
          let lov = this.attributeModelLov;
          if (lov && this.popover) {
              lov.currentRowId = rowId;
              this.popover.for = "attributes-text_" + rowId;
              this.popover.show();
              lov.reset();
          }
      }
  }

  _onAttributeSelection (e, detail) {
      let lov = this.attributeModelLov;
      if (lov) {
          let rowId = lov.currentRowId;
          if (rowId >= 0) {
              let attributeTxtbox = this.root.querySelector("#attributes-text_" + rowId);
              if (!attributeTxtbox) {
                  attributeTxtbox = this.shadowRoot.querySelector("#attributes-text_" + rowId);
              }
              if (attributeTxtbox) {
                  let row = this._getParentRow(attributeTxtbox);
                  this._setRowAsDeletedOnSelectionChange(DataHelper.cloneObject(row.item));
                  if (row) {
                      row.item.attributeModel = detail.data;
                      if (row.item["action"] != "new") {
                          row.item["action"] = "updated";
                      }
                      attributeTxtbox.value = detail.data.title;
                      let rowParentDiv = attributeTxtbox.parentElement;
                      if(rowParentDiv){
                          rowParentDiv.setAttribute("title", detail.data.title);
                      }
                      this._setValueMappings(detail.data, rowId, row);
                      this._isMappingChanged = true;
                  }
              }
          }
      }
      if(this.popover) {
          this.popover.for = "";
          this.popover.hide();
      }
  }

  _setRowAsDeletedOnSelectionChange(row) {
      row.action = "deleted";
      this._refChangeDeletedMappings.push(row);
  }

  _getParentRow (element) {    
      if (element) {
          if ((customElements.get('data-table-row') !== "undefined") &&	element instanceof customElements.get('data-table-row')) {
              return element;
          } else {
              return this._getParentRow(element.parentNode);
          }
      }
  }

  _onSelectingItem (e) {
      this.selectedItem = e.detail.item;
      let attrsPopover = this.shadowRoot.querySelector("#attributesPopover_" + this.selectedItem.name);
      let attrData;
      let classificationData;
      if (attrsPopover) {
          attrData = attrsPopover.querySelector("rock-attribute-model-lov").selectedItem;
          this.selectedItem["attrData"] = attrData;
      }
      this.fireBedrockEvent("mapping-grid-selecting-item", this.selectedItem);
  }

  _onDeselectingItem (e) {
      this.fireBedrockEvent("mapping-grid-deselecting-item", e.detail);
  }

  _onSelectingAllItems (e) {
      this.fireBedrockEvent("mapping-grid-selecting-all-items", e.detail);
  }

  _onDeselectingAllItems (e) {
      this.fireBedrockEvent("mapping-grid-deselecting-all-items", e.detail);
  }

  _fireDeleteEvent (e) {
      this._deletedMappings.push(e.model.item);
      let grid = this.mappingGrid;
      if(!grid) return;
      let index = grid.items.indexOf(e.model.item);
      grid.items.splice(index, 1);

      grid.clearCache();
  }

  _fireCloneEvent (e) {
      let icon = e.currentTarget;
      let row = this._getParentRow(icon);
      let grid = this.mappingGrid;
      if (row && grid) {
          let rowIndex = row.index;
          let rowItem = row.item;
          let newRowItem = DataHelper.cloneObject(rowItem);
          newRowItem.fieldMap.id = -1;
          newRowItem.action = "new";
          grid.items.splice(rowIndex + 1, 0, newRowItem);

          grid.clearCache();
      }
  }

  _onAttributeTap (e) {
      let index = e.currentTarget.index;
      index++;
      if (index == this._currentEditIndex) {
          return;
      }
      this._currentEditIndex = index;
      let grid = this.mappingGrid;

      if(!grid) return;

      let ironListComponent = dom(grid.shadowRoot.querySelector('#list'));
      if (ironListComponent) {
          let prevItem = ironListComponent.querySelector('div.item.gridCurrentEditRow');
          if (prevItem) {
              prevItem.classList.remove('gridCurrentEditRow');
              prevItem.style.zIndex = null;
          }
          let item = ironListComponent.querySelector('div.item:nth-of-type(' + index + ')');
          if (item) {
              item.classList.add('gridCurrentEditRow');
              item.style.zIndex = 2;
          }
      }
  }

  _onSaveTap () {
      this._loading = true;
      if(!this.saveMappingsLiq) return;

      this._loading = true;
      let mappings = this._transformGridDataToSaveMappings();
      if (_.isEmpty(mappings) && !this._isMappingsSaved) {
          this._loading = false;
          return this.showSuccessToast("There are no changes in mappings to save.");
      }
      let saveRequest = DataRequestHelper.createMappingsSaveRequest(this.contextData, this.copContext, this.selectedContexts, "attributemapping", this.selectedOptions)
      if (!_.isEmpty(saveRequest)) {
          saveRequest.entity.data.contexts[0].attributes = mappings;
          saveRequest.entity.data.contexts[0].context.ownershipdata = Array.isArray(this.selectedOptions.ownershipData) ? this.selectedOptions.ownershipData[0] : this.selectedOptions.ownershipData;
          saveRequest.entity.data.contexts[0].context.format = this.fileFormat;
          this.saveMappingsLiq.requestData = saveRequest;
          this.saveMappingsLiq.generateRequest();
      }
  }

  _onMappingsSaveResponse (e, detail) {
      let response = detail && detail.response && detail.response.response ? detail.response.response : "";
      if (response && response.status == "success") {
          this.async(function() {
              this._resetMappings(); //Call this on save mappings success
              this._isMappingsSaved = true;
              this._isMappingChanged = false;
              this.showSuccessToast("Attribute mappings submitted successfully.");
              this._loading = false;
          }, 10000);
          return;
      }

      this._loading = false;
      this.logError("Unable to submit attribute mappings", detail);
  }

  _onMappingsError (e, detail) {
      this.logError("Mapping get/save error:- Unable to perform mappings operation", detail);
      this._loading = false;
  }

  _resetMappings () {
      this._deletedMappings = [];
      this._refChangeDeletedMappings = [];
      for (let i = 0; i < this._gridData.length; i++) {
          this._gridData[i].action = "";
      }
  }

  _transformGridDataToSaveMappings () {
      let mappings = {};
      let self = this;
      //For updated and new
      this._gridData.forEach(function (row) {
          if (row.action == "updated" || row.action == "new") {
              if (row.excelColumnName && row.attributeModel) {
                  if (mappings[row.attributeModel.id]) {
                      let value = self._populateMappingValue(row.excelColumnName);
                      mappings[row.attributeModel.id].values.push(value);
                  } else {
                      mappings[row.attributeModel.id] = self._populateMappingValue(row.excelColumnName, true);
                  }
                  mappings[row.attributeModel.id].properties.externalName = row.attributeModel.title;
              }
          }
      });

      //Deleted mappings on reference change
      for(let i = 0; i < this._refChangeDeletedMappings.length; i++) {
          let isFound = false;
          for(let key in mappings) {
              if(this._refChangeDeletedMappings[i] && 
                 this._refChangeDeletedMappings[i].attributeModel &&
                 this._refChangeDeletedMappings[i].attributeModel.id == key) {
                  isFound = true;
                  break;
              }
          }

          if(!isFound) {
              this._deletedMappings.push(this._refChangeDeletedMappings[i]);
          }
      }

      //For delete
      this._deletedMappings.forEach(function (row) {
          if (row.excelColumnName && row.attributeModel) {
              if (mappings[row.attributeModel.id]) {
                  let value = self._populateMappingValue(row.excelColumnName);
                  value.action = "delete";
                  mappings[row.attributeModel.id].values.push(value);
              } else {
                  let value = self._populateMappingValue(row.excelColumnName, true);
                  value.action = "delete";
                  mappings[row.attributeModel.id] = value;
              }
              mappings[row.attributeModel.id].properties.externalName = row.attributeModel.title;
          }
      });

      //Modified above having untouched mappings
      this._gridData.forEach(function (row) {
          if (row.action == "" && row.excelColumnName && row.attributeModel) {
              if (mappings[row.attributeModel.id]) {
                  let value = self._populateMappingValue(row.excelColumnName);
                  if (mappings[row.attributeModel.id].action == "delete") {
                      for (let i = 0; i < mappings[row.attributeModel.id].values.length; i++) {
                          mappings[row.attributeModel.id].values[i].action = "delete";
                      }
                      delete mappings[row.attributeModel.id].action;
                      mappings[row.attributeModel.id].values.push(value);
                  } else {
                      mappings[row.attributeModel.id].values.push(value);
                  }
              }
          }
      });

      this._setUniqueIds(mappings);
      return mappings;
  }

  _setUniqueIds (mappings) {
      if (!_.isEmpty(mappings)) {
          for (let key in mappings) {
              if (mappings[key] && mappings[key].properties && !mappings[key].properties.id) {
                  if (this._mappingAttributes && this._mappingAttributes[key]) {
                      mappings[key].properties.id = this._mappingAttributes[key].properties.id;
                  } else {
                      mappings[key].properties.id = this._generateMappingId();
                  }
              }
          }
      }
  }

  _generateMappingId (item) {
      let source = "ui";
      let itemContext = this.getFirstItemContext(this.contextData);
      let entityType = itemContext.type;
      let unique = source + entityType;
      return unique.hashCode();
  }

  _discardAttributeChanges() {
      RUFBehaviors.MappingGridBehaviorImpl._triggerEvent.call(this);
  }

  _onBackTap (e) {
      this.currentEventName = "onBack";
      this.skipStep = this.isAplusSheet ? true : false;
      RUFBehaviors.MappingGridBehaviorImpl._triggerDirtyCheck.call(this, "attribute");
  }

  _isReadonly (item) {
      if (item && item.fieldMap && item.fieldMap.id == -1) {
          return false;
      }
      return true;
  }

  _setValueMappings (attrModel, rowId, row) {
      let isValueMappingAvailable = this._isValueMappingsAvailable(attrModel);
      let btnValueMapping = this.root.querySelector("#btnValueMappings_" + rowId);
      if (!btnValueMapping) {
          btnValueMapping = this.shadowRoot.querySelector("#btnValueMappings_" + rowId);
      }

      if (btnValueMapping) {
          if (isValueMappingAvailable) {
              btnValueMapping.removeAttribute("hidden");
              btnValueMapping.setAttribute("data-args", attrModel.id);
              row.item["supportsValueMapping"] = true;
          } else {
              btnValueMapping.setAttribute("hidden", "");
              btnValueMapping.setAttribute("data-args", "");
              delete row.item["supportsValueMapping"];
          }
      }
  }

  _isValueMappingsAvailable (attrModel) {
      if (_.isEmpty(attrModel)) {
          return;
      }

      let entityModelAttribute = this._entityManageModelAttributes[attrModel.id];
      if (entityModelAttribute &&
          entityModelAttribute.properties &&
          entityModelAttribute.properties.supportsValueMapping) {
          return entityModelAttribute.properties.supportsValueMapping;
      }

      return false;
  }

  _onTapValueMapping (e, detail) {
      let valueMappingAttribute = e.currentTarget.getAttribute('data-args');

      if (valueMappingAttribute && !_.isEmpty(this._entityManageModelAttributes)) {
          let entityModelAttribute = this._entityManageModelAttributes[valueMappingAttribute];
          if (entityModelAttribute &&
              entityModelAttribute.properties &&
              entityModelAttribute.properties.supportsValueMapping) {
              //Value Mappings object will be input to ValueMappings component 
              let valueMappings = {
                  "attribute": valueMappingAttribute,
                  "supportsValueMapping": entityModelAttribute.properties.supportsValueMapping,
                  "valueMappingContext": entityModelAttribute.properties.valueMappingContext,
                  "valueMappingTypeName": entityModelAttribute.properties.valueMappingTypeName,
                  "selectedDimensions": this.selectedDimensions || {}
              }

              valueMappings.headerFields = this.mappingData.headerFields;
              valueMappings.taxonomies = this.mappingData.taxonomies;
              valueMappings.contexts = this.mappingData.contexts;
              valueMappings.domain = this.mappingData.domain;

              if (this.valueMappingsDialog) {
                  let component = {
                      "name": "rock-value-mappings-grid",
                      "path": "/../../src/elements/rock-value-mappings-manage/rock-value-mappings-grid.html",
                      "properties": {
                          "mapping-data": valueMappings,
                          "context-data": this.contextData,
                          "cop-context": this.copContext,
                          "mapping-config": this.mappingConfig,
                          "selected-options": this.selectedOptions
                      }
                  };
                  ComponentHelper.loadContent(this.valueMappingsDialog.querySelector("#valueMappingsDialogContent"), component, this);
                  this.valueMappingsDialog.open();
              }
          }
      }
  }

  _onCancelOrSaveValueMappings () {
      if(this.valueMappingsDialog) {
          this.valueMappingsDialog.close();
      }
  }

  _onAddTap () {
      RUFBehaviors.MappingGridBehaviorImpl._onAddTap.call(this, {
          "excelColumnName": ""
      });
  }

  _onDeleteTap () {
      RUFBehaviors.MappingGridBehaviorImpl._onDeleteTap.call(this, (gridDataItem, selectedItem) =>{
          return gridDataItem.excelColumnName.toLowerCase() === selectedItem.excelColumnName.toLowerCase();
      })
  }

  _onRowChange (e, detail) {
      let rowId = e.currentTarget.rowId;
      if (rowId >= 0) {
          let excelColumnNameTxtbox = this.root.querySelector("#excelColumnName_" + rowId);
          if (!excelColumnNameTxtbox) {
              excelColumnNameTxtbox = this.shadowRoot.querySelector("#excelColumnName_" + rowId);
          }
          if (excelColumnNameTxtbox) {
              let row = this._getParentRow(excelColumnNameTxtbox)
              if (row) {
                  if (row.item["action"] != "new") {
                      row.item["action"] = "updated";
                  }
                  this._isMappingChanged = true;
              }
          }
      }
  }

  _populateMappingValue (value, isSetProperties = false) {
      const { locale } = ContextHelper.getFirstValueContext(this.contextData);
      let valueObj = {
          value,
          locale,
          "id": ""
      };

      if(!isSetProperties) {
          return value;
      }

      return {
          "properties": {
              "enabled": true,
              "required": true
          },
          "values": [valueObj]
      }
  }

  _getGridRecordsCountMessage () {
      if (!this._gridData || this._gridData.length == 0) {
          return "Showing 0 results";
      }

      return "Showing 1 - "+ this._gridData.length +" items of total "+ this._gridData.length +" results";
  }

  _onContextsChanged(e, detail) {
      RUFBehaviors.MappingGridBehaviorImpl._onContextsChanged.call(this, e, detail);
  }
}
customElements.define(RockAttributeMappingGrid.is, RockAttributeMappingGrid);
