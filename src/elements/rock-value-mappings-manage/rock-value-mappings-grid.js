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
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-helpers/context-helper.js';
import '../liquid-entity-model-get/liquid-entity-model-get.js';
import '../liquid-rest/liquid-rest.js';
import '../pebble-icons/pebble-icons.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-dialog/pebble-dialog.js';
import '../pebble-spinner/pebble-spinner.js';
import '../pebble-button/pebble-button.js';
import '../pebble-popover/pebble-popover.js';
import '../pebble-data-table/pebble-data-table.js';
import '../pebble-textbox/pebble-textbox.js';
import '../pebble-toast/pebble-toast.js';
import '../pebble-actions/pebble-actions.js';
import DataTableRow from '../pebble-data-table/data-table-row.js'
import '../rock-entity-lov/rock-entity-lov.js';
import '../rock-context-selector/rock-context-selector.js';
import '../bedrock-style-manager/styles/bedrock-mapping-grid-style.js';
import '../bedrock-mapping-grid-behavior/bedrock-mapping-grid-behavior.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-buttons.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import '../bedrock-style-manager/styles/bedrock-style-floating.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockValueMappingsGrid
    extends mixinBehaviors([
        RUFBehaviors.MappingGridBehavior
    ], PolymerElement) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-mapping-grid-style  bedrock-style-grid-layout bedrock-style-icons bedrock-style-padding-margin bedrock-style-buttons bedrock-style-floating">
            :host {
                display: block;
                height: 100%;
            }
            pebble-actions {
                text-transform: none;
            }
        </style>
        <pebble-spinner active="[[_loading]]"></pebble-spinner>
        <!--Common toast is hidden under the dialog, so used this toast-->
        <pebble-toast id="valueMappingToast" vertical-align="top" auto-close="">
            [[toastText]]
        </pebble-toast>
        <div class="base-grid-structure">
            <div class="base-grid-structure-child-1">
                <div id="grid-heading">
                    <strong>Value Mapping for [[_attributeTitle]]</strong>
                </div>
                <div id="context-header" hidden\$="[[!_isContextsAvailable(_contexts)]]">
                    <span class="pull-right">
                        <rock-context-selector id="valueContextSelector" context-data="[[contextData]]" app-name="app-business-function-mapping" domain="[[mappingData.domain]]" all-single-select="" show-confirmation\$="[[_isMappingChanged]]" confirmation-message="[[_dirtyCheckConfirmationMessage]]"></rock-context-selector>
                        <bedrock-pubsub event-name="context-selector-data-changed" handler="_onContextsChanged" target-id="valueContextSelector"></bedrock-pubsub>
                    </span>
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
                <div id="grid-container" class="full-height">
                    <div class="button-siblings">
                        <pebble-data-table id="mapping-grid" items="{{_gridData}}" multi-selection="">
                            <data-table-column slot="column-slot" name="Given Value">
                                <template>
                                    <pebble-textbox slot="cell-slot-content" class="column-text" id="given-value_[[index]]" no-label-float="" row-id="[[index]]" value="{{item.givenValue}}" title="{{item.givenValue}}" on-change="_onGivenTextChange"></pebble-textbox>
                                </template>
                            </data-table-column>
                            <data-table-column slot="column-slot" name="Governed Value">
                                <template>
                                    <div id="inputDiv" slot="cell-slot-content" index="[[index]]">
                                        <pebble-textbox readonly="[[_isReferenceField]]" class="attributes-text" id="govern-text_[[index]]" no-label-float="" row-id="[[index]]" value="[[item.governedValue]]" title="[[item.governedValue]]" on-change="_onGovernTextChange"></pebble-textbox>
                                    </div>
                                    <template is="dom-if" if="[[_isReferenceField]]">
                                        <div id="iconDiv" slot="cell-slot-content">
                                            <pebble-icon class="dropdown-icon pebble-icon-size-10" id="txtDropdownIcon_[[index]]" row-id="[[index]]" icon="pebble-icon:navigation-action-down" on-tap="_showReferenceLOV"></pebble-icon>
                                        </div>
                                    </template>
                                </template>
                            </data-table-column>
                        </pebble-data-table>
                        <bedrock-pubsub event-name="entity-lov-selection-changed" handler="_onReferenceSelection" target-id="rockReferenceLov"></bedrock-pubsub>
                        <pebble-popover class="reference-popover" id="referencePopover" for="" no-overlap="" vertical-align="auto" horizontal-align="auto">
                            <rock-entity-lov id="rockReferenceLov" request-data="[[_lovRequestData]]" title-pattern="{entity.name}" multi-select="[[multiSelect]]"></rock-entity-lov>
                        </pebble-popover>
                    </div>
                    <div id="actions-container" class="buttonContainer-static" align="center">
                        <pebble-button class="action-button btn btn-secondary m-r-10" id="cancel" button-text="Cancel" raised="" on-tap="_onCancelTap"></pebble-button>
                        <pebble-button class="action-button btn btn-success m-r-10" id="save" button-text="Save" raised="" on-tap="_onSaveTap"></pebble-button>
                        <pebble-button class="action-button btn btn-success m-r-10" id="saveandback" button-text="Save &amp; Continue" raised="" on-tap="_onSaveAndGobackTap"></pebble-button>
                    </div>
                </div>
            </div>
        </div>

        <!--Dirty check dialog-->
        <pebble-dialog id="value-mappings-dirty-check-Dialog" dialog-title="Confirmation" modal="" alert-box="" show-cancel="" show-ok="" no-cancel-on-outside-click="" no-cancel-on-esc-key="">
            <p>[[_dirtyCheckConfirmationMessage]]</p>
        </pebble-dialog>
        <bedrock-pubsub event-name="on-buttonok-clicked" handler="_discardValueChanges" target-id="value-mappings-dirty-check-Dialog"></bedrock-pubsub>

        <liquid-entity-model-get name="liquidAttributeModelGet" operation="getbyids" on-response="_onAttributeModelGetResponse" on-error="_onAttributeModelError"></liquid-entity-model-get>
        <liquid-entity-model-get name="liquidReferenceManageModelGet" operation="getbyids" on-response="_onReferenceManageModelGetResponse" on-error="_onReferenceManageModelGetError"></liquid-entity-model-get>
        <liquid-rest id="getMappings" url="/data/cop/getMappings" method="POST" on-liquid-response="_onGetMappingsResponse" on-liquid-error="_onMappingsError"></liquid-rest>
        <liquid-rest id="saveMappings" url="/data/cop/saveMappings" method="POST" on-liquid-response="_onMappingsSaveResponse" on-liquid-error="_onMappingsError"></liquid-rest>
`;
  }

  static get is() { return 'rock-value-mappings-grid' }
  static get properties() {
      return {
          copContext: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          _isDirty: {
              type: Boolean,
              value: false
          },

          _lovRequestData: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          _attributeTitle: {
              type: String,
              value: null
          },

          _attributeModel: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          _isReferenceField: {
              type: Boolean,
              value: false
          },

          _referenceLOVRequest: {
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

          multiSelect: {
              type: Boolean,
              value: false
          },

          saveActions: {
              type: Array,
              value: function () {
                  return []
              }
          },

          saveContinueActions: {
              type: Array,
              value: function () {
                  return []
              }
          },

          selectedRole: {
              type: String,
              value: ""
          },

          selectedOptions: {
              type: Object,
              value: function () {
                  return { "role": "_DEFAULT", "ownershipData": "_DEFAULT", "saveType": "self" }
              }
          }
      }
  }


  get referenceLOV() {
      this._referenceLOV = this._referenceLOV || this.shadowRoot.querySelector("#rockReferenceLov");
      return this._referenceLOV;
  }

  get referencePopoverEl() {
      this._referencePopoverEl = this._referencePopoverEl || this.shadowRoot.querySelector("#referencePopover");
      return this._referencePopoverEl;
  }

  get valueMappingToast() {
      this._valueMappingToast = this._valueMappingToast || this.shadowRoot.querySelector("#valueMappingToast");
      return this._valueMappingToast;
  }

  get mappingGrid() {
      this._mappingGrid = this._mappingGrid || this.shadowRoot.querySelector("#mapping-grid");
      return this._mappingGrid;
  }

  get liquidReferenceManageModelGet() {
      this._liquidReferenceManageModelGet = this._liquidReferenceManageModelGet || this.shadowRoot.querySelector("[name=liquidReferenceManageModelGet]");
      return this._liquidReferenceManageModelGet;
  }

  get contextSelector() {
      this._contextSelector = this._contextSelector || this.shadowRoot.querySelector("#valueContextSelector");
      return this._contextSelector;
  }

  _onMappingsDataChange () {
      if (!_.isEmpty(this.contextData) && !_.isEmpty(this.mappingData) && !_.isEmpty(this.mappingConfig) && !_.isEmpty(this.copContext)) {
          this._loading = true;
          this._contexts = this.mappingData.contexts;

          let attributeMappingSelectedDimensions = {};
          for (let i = 0; i < this._contexts.length; i++) {
              attributeMappingSelectedDimensions[this._contexts[i]] = this.mappingData.selectedDimensions[this._contexts[i]];
          }

          let valueMappingContexts = this._getAdditionalContexts();
          this._allContexts = this._contexts.concat(valueMappingContexts);
          //Load dimensions based on mapping information
          if (this.contextSelector) {
              this.contextSelector.dynamicDimensionsConfig = {
                  "selectedDimensions": attributeMappingSelectedDimensions,
                  "readonlyDimensions": this._contexts,
                  "contextDimensions": valueMappingContexts
              }
          }

          let types = [this.mappingData.attribute];
          let attributes = ['externalName'];

          const attributeModelRequest = DataRequestHelper.createGetAttributeModelRequest(types, attributes);

          if (this.liquidAttributeModelGetLiq) {
              this.liquidAttributeModelGetLiq.requestData = attributeModelRequest;
              this.liquidAttributeModelGetLiq.generateRequest();
          }
      }
  }

  _getAdditionalContexts () {
      let additionalContexts = [];
      if (this.mappingData.valueMappingContext) {
          let mappingContexts = (this.mappingData.valueMappingContext instanceof Array) ? this.mappingData.valueMappingContext : [this.mappingData.valueMappingContext];
          mappingContexts.forEach(function (context) {
              if (!(context.startsWith("[") && context.endsWith("]"))) {
                  additionalContexts.push(context);
              }
          }, this);
      }

      return additionalContexts;
  }

  _onAttributeModelGetResponse (e, detail) {
      let response = e.detail.response;
      if (response.content && !_.isEmpty(response.content.entityModels)) {
          this._attributeModel = response.content.entityModels[0];
          this._attributeTitle = this._attributeModel.properties.externalName;

          //Set LOV request
          if (this._attributeModel.properties.referenceEntityInfo) {
              this._isReferenceField = true;
              let refInfo = this._attributeModel.properties.referenceEntityInfo;
              let types = [refInfo[0].refEntityType];
              this._referenceLOVRequest = DataRequestHelper.createGetReferenceRequest(this.contextData, types);

              //Before setting the reference request to LOV, set LOV title pattern
              let ids = [refInfo[0].refEntityType];
              let referenceModelRequest = DataRequestHelper.createGetManageModelRequest(ids);

              if (this.liquidReferenceManageModelGet) {
                  this.liquidReferenceManageModelGet.requestData = referenceModelRequest;
                  this.liquidReferenceManageModelGet.generateRequest();
              }
          } else {
              //Get Mappings
              this._getMappings();
          }
      }
  }

  // This is to set title pattern, success/error - process will not stop
  _onReferenceManageModelGetResponse (e, detail) {
      if (detail && detail.response && detail.response.status == "success") {
          if (DataHelper.isValidObjectPath(detail, "response.content.entityModels.0.data.attributes")) {
              let attributes = detail.response.content.entityModels[0].data.attributes;
              let lov = this.referenceLOV;

              for (let key in attributes) {
                  if (attributes[key].properties.isExternalName) {
                      if (lov) {
                          lov.titlePattern = "{" + key + "}";
                      }
                      break;
                  }
              }
          }
      }
      this.set("_lovRequestData", this._referenceLOVRequest);
      this._getMappings();
  }

  //Issue in setting title pattern, no need to stop the process
  _onReferenceManageModelGetError (e, detail) {
      this.set("_lovRequestData", this._referenceLOVRequest);
      this._getMappings();
  }

  _getMappings () {
      //To-do: Contexts hardcoded here, will be removed once context header logic is implemented
      this.selectedContexts = this._prepareContexts(this._allContexts);
      let types = [this.mappingData.valueMappingTypeName];

      let req = DataRequestHelper.createMappingsGetRequest(this.contextData, this.copContext, this.selectedContexts, types, this.selectedOptions, "valueMapping");
      req.params.query.contexts[0]["Ownership Data"] = Array.isArray(this.selectedOptions.ownershipData) ? this.selectedOptions.ownershipData[0] : this.selectedOptions.ownershipData;;
      delete req.params.query.contexts[0].service;

      this._sendMappingRequest(req);
  }

  _onAttributeModelError (e, detail) {
      this.logError("Entity attribute model get error", detail);
      this._showToast("error", "Error", "Unable to get entity attribute model, contact administrator.");
      this._loading = false;
  }

  _onGetMappingsResponse (e, detail) {
      if (!this._isValidResponseStatus(detail)) {
          this._showToast("error", "Error", "Unable to fetch value mappings, contact administrator.");
          this._loading = false;
          return;
      }

      let response = detail.response.response;
      let gridData = [];
      if (response.entities) {
          if (response.entities.length > 0) {
              this._valueMappingEntities = this._getContextSpecificValueMappings(response.entities);

              let index = 0;
              for (let i = 0; i < this._valueMappingEntities.length; i++) {
                  if (DataHelper.isValidObjectPath(this._valueMappingEntities[i], "data.contexts.0.attributes")) {
                      let mappingAttributes = this._valueMappingEntities[i].data.contexts[0].attributes;
                      if (mappingAttributes.attributevalue && mappingAttributes.mappedvalue) {
                          let attrValue = mappingAttributes.attributevalue.values[0].value;
                          for (let j = 0; j < mappingAttributes.mappedvalue.values.length; j++) {
                              gridData.push({
                                  "givenValue": mappingAttributes.mappedvalue.values[j].value,
                                  "governedValue": attrValue,
                                  "source": "system",
                                  "action": "",
                                  "index": index
                              });
                              index++;
                          }
                      }
                  }
              }
          }
      }

      this.set("_gridData", gridData);
      this._loading = false;
  }

  _getContextSpecificValueMappings (mappingEntities) {
      let contextSpecificMappings = [];
      if (mappingEntities && mappingEntities.length) {
          for (let i = 0; i < mappingEntities.length; i++) {
              if (DataHelper.isValidObjectPath(mappingEntities[i], "data.contexts.0.context")) {
                  let context = mappingEntities[i].data.contexts[0].context;
                  let isMatched = true;
                  for (let j = 0; j < this.selectedContexts.length; j++) {
                      if (context[this.selectedContexts[j].type] != this.selectedContexts[j].value) {
                          isMatched = false;
                          break;
                      }
                  }

                  if (isMatched) {
                      contextSpecificMappings.push(mappingEntities[i]);
                  }
              }
          }
      }

      return contextSpecificMappings;
  }

  _onCancelTap () {
      this.currentEventName = "value-mapping-cancel";
      RUFBehaviors.MappingGridBehaviorImpl._triggerDirtyCheck.call(this, "value");
  }

  _discardValueChanges () {
      RUFBehaviors.MappingGridBehaviorImpl._triggerEvent.call(this);
  }

  _showReferenceLOV (e) {
      let rowId = e.currentTarget.rowId;
      if (rowId >= 0) {
          let lov = this.referenceLOV;
          let popover = this.referencePopoverEl;
          if (lov && popover) {
              lov.currentRowId = rowId;
              popover.for = "govern-text_" + rowId;
              popover.show();
              lov.reset();
          }
      }
  }

  _onReferenceSelection (e, detail) {
      let lov = this.referenceLOV;
      if (lov) {
          let rowId = lov.currentRowId;
          if (rowId >= 0) {
              this._setGovernValue(rowId, detail.data);
          }
      }
      let popover = this.referencePopoverEl;
      if (popover) {
          popover.for = "";
          popover.hide();
      }
  }

  //Triggers for non reference field
  _onGovernTextChange (e, detail) {
      let governText = {
          "title": e.target.value
      }
      this._setGovernValue(e.target.rowId, governText);
  }

  _setGovernValue (rowId, data) {
      let governTxtbox = this.root.querySelector("#govern-text_" + rowId);
      if (!governTxtbox) {
          governTxtbox = this.shadowRoot.querySelector("#govern-text_" + rowId);
      }
      if (governTxtbox) {
          let row = this._getParentRow(governTxtbox)
          this._setRowAsDeletedOnSelectionChange(DataHelper.cloneObject(row.item));
          if (row) {
              row.item.attributeModel = data;
              if (row.item["action"] != "new") {
                  row.item["action"] = "updated";
              }
              row.item["governedValue"] = data.title;
              governTxtbox.value = data.title;
              governTxtbox.title = data.title;
              this._isMappingChanged = true;
          }
      }
  }

  _setRowAsDeletedOnSelectionChange (row) {
      row.action = "deleted";
      this._refChangeDeletedMappings.push(row);
  }

  _onAddTap () {
      RUFBehaviors.MappingGridBehaviorImpl._onAddTap.call(this, {
          "givenValue": "",
          "governedValue": "",
      });
  }

  _onDeleteTap () {
      RUFBehaviors.MappingGridBehaviorImpl._onDeleteTap.call(this, (gridDataItem, selectedItem) => {
          return gridDataItem.givenValue === selectedItem.givenValue
      });
  }

  _getParentRow (element) {
      if (element) {
          if (element instanceof DataTableRow) {
              return element;
          } else {
              return this._getParentRow(element.parentNode);
          }
      }
      return undefined;
  }

  _onGivenTextChange (e, detail) {
      let rowId = e.currentTarget.rowId;
      if (rowId >= 0) {
          let givenTxtbox = this.root.querySelector("#given-value_" + rowId);
          if (!givenTxtbox) {
              givenTxtbox = this.shadowRoot.querySelector("#given-value_" + rowId);
          }
          if (givenTxtbox) {
              let row = this._getParentRow(givenTxtbox)
              if (row) {
                  if (row.item["action"] != "new") {
                      row.item["action"] = "updated";
                  }
                  this._isMappingChanged = true;
              }
          }
      }
  }

  _isDuplicateGridDataAvailable () {
      let uniqueGivenValues = [...new Set(this._gridData.map((obj) => obj.givenValue))];

      return this._gridData.length != uniqueGivenValues.length;
  }

  _onSaveAndGobackTap () {
      this.isSaveAndGoback = true;
      this._onSaveTap();
  }

  _onSaveTap () {
      if (this._isDuplicateGridDataAvailable()) {
          this._showToast("error", "Error", "Provide unique given values.");
          return;
      }
      this._loading = true;
      let mappings = this._transformGridDataToSaveMappings();
      let saveRequests = [];
      if (!_.isEmpty(mappings)) {
          for (let key in mappings) {
              let saveRequest = DataRequestHelper.createMappingsSaveRequest(this.contextData, this.copContext, this.selectedContexts, this.mappingData.valueMappingTypeName, this.selectedOptions, "valueMapping");
              saveRequest.entity.data.contexts[0].attributes = mappings[key];
              saveRequest.entity.data.contexts[0].context["Ownership Data"] = Array.isArray(this.selectedOptions.ownershipData) ? this.selectedOptions.ownershipData[0] : this.selectedOptions.ownershipData;;
              delete saveRequest.entity.data.contexts[0].context.service;

              if (mappings[key].action == "delete") {
                  saveRequest.entity.action = "delete";

                  let attributes = saveRequest.entity.data.contexts[0].attributes;
                  delete attributes.action;
                  for (let attrkey in attributes) {
                      if (attributes[attrkey]) {
                          attributes[attrkey].action = "delete";
                      }
                  }
              }

              saveRequest.entity.id = this._getValueMappingId(key);
              saveRequests.push(saveRequest);
          }

          let saveMappings = this.shadowRoot.querySelector("#saveMappings");
          if (saveMappings) {
              this._generatedRequestCount = 0;
              for (let i = 0; i < saveRequests.length; i++) {
                  saveMappings.requestData = saveRequests[i];
                  this._generatedRequestCount++;
                  saveMappings.generateRequest();
              }
          }
      } else {
          this._showToast("success", "Success", "There are no changes in mappings to save.");
          this._loading = false;
      }
  }

  _showToast (toastType, heading, toastMessage) {
      if (this.valueMappingToast) {
          this.valueMappingToast.toastType = toastType;
          this.valueMappingToast.heading = heading;
          this.toastText = toastMessage
          this.valueMappingToast.show();
      }
  }

  _getValueMappingId (key) {
      if (this._valueMappingEntities && this._valueMappingEntities.length > 0) {
          for (let i = 0; i < this._valueMappingEntities.length; i++) {
              if (DataHelper.isValidObjectPath(this._valueMappingEntities, i + ".data.contexts.0.attributes")) {
                  let mappingAttributes = this._valueMappingEntities[i].data.contexts[0].attributes;
                  if (!_.isEmpty(mappingAttributes) && mappingAttributes.attributevalue.values[0].value == key) {
                      return this._valueMappingEntities[i].id;
                  }
              }
          }
      }

      //Generate guid and send
      return DataHelper.generateUUID();
  }

  _onMappingsSaveResponse (e, detail) {
      if (DataHelper.isValidObjectPath(detail, "response.response.status") &&
          detail.response.response.status.toLowerCase() == "success") {
          this.isSuccess = true;
      } else {
          this.isFailed = true;
      }

      if (--this._generatedRequestCount == 0) {
          if (this.isSuccess && !this.isFailed) {
              this._resetMappings();
              if (this.isSaveAndGoback) {
                  this._onCancelTap();
                  this.showSuccessToast("Value mappings submitted successfully.");
                  this.isSaveAndGoback = false;
              } else {
                  this._showToast("success", "Success", "Value mappings submitted successfully.");
              }
          } else if (!this.isSuccess && this.isFailed) {
              this._showToast("error", "Error", "Unable to save value mappings, contact administrator.");
          } else {
              this._resetMappings();
              if (this.isSaveAndGoback) {
                  this._onCancelTap();
                  this.showWarningToast("Value mappings processed with errors.");
                  this.isSaveAndGoback = false;
              } else {
                  this._showToast("warning", "Warning", "Value mappings processed with errors.");
              }
          }
          this._loading = false;
      }
  }

  _resetMappings () {
      this._deletedMappings = [];
      this._refChangeDeletedMappings = [];
      this._isMappingChanged = false;
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
              if (row.givenValue && row.governedValue) {
                  let value = self._populateMappingValue(row.givenValue);
                  if (mappings[row.governedValue]) {
                      mappings[row.governedValue].mappedvalue.values.push(value);
                  } else {
                      let attrValue = self._populateMappingValue(row.governedValue);
                      mappings[row.governedValue] = {
                          "attributevalue": {
                              "values": [attrValue]
                          },
                          "mappedvalue": {
                              "values": [value]
                          }
                      }
                  }
              }
          }
      });

      //Deleted mappings on reference change
      for (let i = 0; i < this._refChangeDeletedMappings.length; i++) {
          let isFound = false;
          for (let key in mappings) {
              if (this._refChangeDeletedMappings[i] &&
                  this._refChangeDeletedMappings[i].governedValue == key) {
                  isFound = true;
                  break;
              }
          }

          if (!isFound) {
              this._deletedMappings.push(this._refChangeDeletedMappings[i]);
          }
      }

      //For delete
      this._deletedMappings.forEach(function (row) {
          if (row.givenValue && row.governedValue) {
              let value = self._populateMappingValue(row.givenValue);
              value.action = "delete";
              if (mappings[row.governedValue]) {
                  mappings[row.governedValue].mappedvalue.values.push(value);
              } else {
                  let attrValue = self._populateMappingValue(row.governedValue);
                  mappings[row.governedValue] = {
                      "action": "delete",
                      "attributevalue": {
                          "values": [attrValue]
                      },
                      "mappedvalue": {
                          "values": [value]
                      }
                  }
              }
          }
      });


      //Modified above having untouched mappings
      this._gridData.forEach(function (row) {
          if (row.action == "" && row.givenValue && row.governedValue) {
              if (mappings[row.governedValue]) {
                  let value = self._populateMappingValue(row.givenValue);
                  if (mappings[row.governedValue].action == "delete") {
                      for (let i = 0; i < mappings[row.governedValue].mappedvalue.values.length; i++) {
                          mappings[row.governedValue].mappedvalue.values[i].action = "delete";
                      }
                      delete mappings[row.governedValue].action;
                      mappings[row.governedValue].mappedvalue.values.push(value);
                  } else {
                      mappings[row.governedValue].mappedvalue.values.push(value);
                  }
              }
          }
      });

      return mappings;
  }

  _populateMappingValue (value) {
      const { source, locale } = ContextHelper.getFirstValueContext(this.contextData);

      return { source, locale, value };
  }

  _getGridRecordsCountMessage () {
      if (!this._gridData || this._gridData.length == 0) {
          return "Showing 0 results";
      }

      return "Showing 1 - " + this._gridData.length + " items of total " + this._gridData.length + " results";
  }

  _onContextsChanged (e, detail) {
      RUFBehaviors.MappingGridBehaviorImpl._onContextsChanged.call(this, e, detail);
  }
}
customElements.define(RockValueMappingsGrid.is, RockValueMappingsGrid);
