/**
`rock-entity-search-result` Represents a component that renders the entities in the grid.
It filters the data as per filter criteria.

@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-helpers/context-helper.js';
import '../bedrock-helpers/data-request-helper.js';
import '../bedrock-helpers/liquid-response-helper.js';
import '../bedrock-helpers/data-transform-helper.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-app-behavior/bedrock-app-behavior.js';
import '../bedrock-logger-behavior/bedrock-logger-behavior.js';
import '../bedrock-toast-behavior/bedrock-toast-behavior.js';
import '../liquid-dataobject-utils/liquid-dataobject-utils.js';
import '../liquid-entity-model-composite-get/liquid-entity-model-composite-get.js';
import '../liquid-entity-data-get/liquid-entity-data-get.js';
import '../pebble-spinner/pebble-spinner.js';
import '../pebble-toggle-button/pebble-toggle-button.js';
import '../pebble-dialog/pebble-dialog.js';
import '../rock-grid/rock-grid.js';
import '../rock-grid-data-sources/entity-search-grid-datasource.js';
import '../rock-govern-data-grid/rock-govern-data-grid.js';
import '../rock-entity-search-result-actions/rock-entity-search-result-actions.js';
import '../rock-component-config-behavior/rock-component-config-behavior.js';
import { beforeNextRender } from '@polymer/polymer/lib/utils/render-status.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockEntitySearchResult extends mixinBehaviors([RUFBehaviors.AppBehavior,
        RUFBehaviors.ComponentContextBehavior, RUFBehaviors.ComponentConfigBehavior,
        RUFBehaviors.LoggerBehavior, RUFBehaviors.ToastBehavior
    ],
    OptionalMutableData(PolymerElement)) {
  static get template() {
    return html`
        <style>
            :host {
                display: block;
                height: 100%;
            }

            pebble-toggle-button {
                --pebble-toggle-button-checked-bar-color: var(--success-color, #4caf50);
                --pebble-toggle-button-checked-button-color: var(--success-color, #4caf50);
                --pebble-toggle-button-checked-ink-color: var(--success-color, #4caf50);
                --pebble-toggle-button-label-color: var(--secondary-button-text-color, #75808b);
            }

            .toggle-button {
                float: right;
                padding: 22px 20px 0px 0px;
                font-size: var(--font-size-sm, 12px);
            }

            /* Firefox specific fix for toggle button */

            @media all and (min--moz-device-pixel-ratio:0) and (min-resolution: 3e1dpcm) {
                .toggle-button {
                    padding: 0;
                }
            }

            /* IE11 specific fix for toggle button */

            @media screen and (-ms-high-contrast: active),
            (-ms-high-contrast: none) {
                .toggle-button {
                    padding: 0;
                }
            }

            pebble-toggle-button {
                --pebble-toggle-button-checked-bar-color: var(--success-color, #4caf50);
                --pebble-toggle-button-checked-button-color: var(--success-color, #4caf50);
                --pebble-toggle-button-checked-ink-color: var(--success-color, #4caf50);
                --pebble-toggle-button-label-color: var(--secondary-button-text-color, #75808b);
            }

            .toggle-button {
                float: right;
                padding: 22px 20px 0px 0px;
                font-size: var(--font-size-sm, 12px);
            }

            rock-grid {
                --pebble-grid-container: {
                    margin-right: 20px;
                    margin-left: 20px;
                }
            }
        </style>
        <pebble-spinner active="[[_loading]]"></pebble-spinner>
        <liquid-entity-model-composite-get name="compositeAttributeModelGet" request-data="{{attributeModelRequest}}" on-entity-model-composite-get-response="_onCompositeModelGetResponse" on-error="_onCompositeGetError">
        </liquid-entity-model-composite-get>
        <liquid-rest id="getDownloadUrl" url="/data/binarystreamobjectservice/prepareDownload" method="POST" on-liquid-response="_onGetDownloadUrlResponse">
        </liquid-rest>
        <template is="dom-if" if="[[_isWorkflowRequest(_loadGrid, _loadWithoutWorkflow)]]">
            <template is="dom-if" if="[[_showToggle()]]">
                <pebble-toggle-button class="toggle-button" noink="" checked="{{_loadGovernData}}">Govern Data</pebble-toggle-button>
            </template>
            <template is="dom-if" if="[[!_loadGovernData]]">

                <entity-search-grid-datasource id="searchGridDatasource" context-data="[[contextData]]" request="{{request}}" r-data-source="{{rDataSource}}" r-data-formatter="{{rDataFormatter}}" buffer-record-size="{{size}}" current-record-size="{{currentRecordSize}}" result-record-size="{{resultRecordSize}}" total-count="{{totalCount}}" attribute-models="{{attributeModels}}" is-combined-get="[[_isCombinedGetReq]]" apply-context-coalesce="[[applyContextCoalesce]]" related-entity-search-enabled="" apply-locale-coalesce="[[applyLocaleCoalesce]]" data-index\$="[[dataIndex]]" max-records-size="[[maxRecordsSize]]"></entity-search-grid-datasource>

                <rock-grid hidden\$="[[_loadGovernData]]" id="entityGrid" r-data-source="{{rDataSource}}" r-data-source-id="searchGridDatasource" result-record-size="{{resultRecordSize}}" current-record-size="{{currentRecordSize}}" config="[[gridConfig]]" grid-data-size="{{size}}" attribute-models="{{attributeModels}}" page-size="[[pageSize]]" selected-item="{{selectedItem}}" selected-items="{{selectedItems}}" pre-selected-items="[[preSelectedItems]]" total-count="{{totalCount}}" max-configured-count="[[maxConfiguredCount]]" apply-locale-coalesce-style="[[applyLocaleCoalesceStyle]]" domain="[[domain]]" selection-enabled="">
                    <rock-entity-search-result-actions slot="toolbar" id="gridActions" context-data="[[contextData]]" domain="[[domain]]"></rock-entity-search-result-actions>
                </rock-grid>

            </template>
            <template is="dom-if" if="[[_loadGovernData]]">
                <rock-govern-data-grid id="governGrid" context-data="[[contextData]]" request="[[request]]" entity-name-attribute="[[governDataConfig.entityNameAttribute]]">
                </rock-govern-data-grid>
            </template>
            <bedrock-pubsub event-name="grid-custom-toolbar-event" handler="_onCustomToolbarEvent" target-id="entityGrid"></bedrock-pubsub>
            <bedrock-pubsub event-name="grid-download-item" handler="_onDownload" target-id="entityGrid"></bedrock-pubsub>
            <bedrock-pubsub event-name="grid-upload-item" handler="_onUpload" target-id="entityGrid"></bedrock-pubsub>
            <bedrock-pubsub event-name="grid-bulk-edit-items" handler="_onBulkEdit" target-id="entityGrid"></bedrock-pubsub>
            <bedrock-pubsub event-name="grid-bulk-delete-items" handler="_showConfirmationDialog" target-id="entityGrid"></bedrock-pubsub>
            <bedrock-pubsub event-name="download-original-asset" handler="_onOriginalAssetDownloadAction" target-id="entityGrid"></bedrock-pubsub>
            <bedrock-pubsub event-name="search-error" handler="_onSearchError" target-id="searchGridDatasource"></bedrock-pubsub>
        </template>

        <pebble-dialog id="confirmationDialog" dialog-title="Confirmation" modal="" alert-box="" show-cancel="" show-ok="" no-cancel-on-outside-click="" no-cancel-on-esc-key="">
            <p>Are you sure you want to delete?</p>
        </pebble-dialog>
        <bedrock-pubsub event-name="on-buttonok-clicked" handler="_onBulkDelete" target-id="confirmationDialog"></bedrock-pubsub>
        <bedrock-pubsub on-bedrock-event-route-changed="_onRouteChange" name="bedrock-event-route-changed"></bedrock-pubsub>
`;
  }

  static get is() {
      return "rock-entity-search-result";
  }

  static get properties() {
      return {
          /**
           * Indicates the request object that is passed to the data element to retrieve the attribute model data.
           */
          attributeModelRequest: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          contextData: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          domain: {
              type: String
          },

          modelDomain: {
              type: String
          },

          /**
           * Specifies the configuration object that is passed to the grid.
           */
          gridConfig: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          /**
           * Specifies the request object to initiate the search.
           * 
           */
          request: {
              type: Object,
              value: function () {
                  return {
                      "params": {
                          "query": {
                              "contexts": [],
                              "valueContexts": [],
                              "filters": {
                                  "attributesCriterion": [],
                                  "propertiesCriterion": [],
                                  "typesCriterion": []
                              }
                          },
                          "fields": {
                              "ctxTypes": [
                                  "properties"
                              ],
                              "attributes": []
                          },
                          "options": {
                              "from": 0,
                              "to": 0
                          }
                      }
                  };
              }
          },

          /**
           * Specifies the filters to filter the search.
           */
          searchFilters: {
              type: Array,
              notify: true,
              value: function () {
                  return [];
              }
          },

          /**
           * Specifies the filters to filter the search.
           */
          relationshipSearchFilters: {
              type: Array,
              notify: true,
              value: function () {
                  return [];
              }
          },

          /**
           * Specifies the query object that initiates the search.
           */
          searchQuery: {
              type: String,
              notify: true,
              value: ""
          },

          /**
           * Specifies the workflow criterion for the search.
           */
          typesCriterion: {
              type: Object,
              notify: true,
              value: function () {
                  return {};
              }
          },

          /**
           * Specifies the workflow criterion for the search.
           */
          workflowCriterion: {
              type: Object,
              notify: true,
              value: function () {
                  return {};
              }
          },

          /**
           * Specifies the workflow criterion for the search.
           */
          governDataCriterion: {
              type: Object,
              notify: true,
              value: function () {
                  return {};
              }
          },

          /**
           * Specifies the format of the data that are passed to the `remote-data`.
           */
          rDataFormatter: {
              type: Object,
              notify: true,
              value: function () {
                  return this._getAttributeFormattedData.bind(this);
              }
          },

          // rDataSource: {
          //     type: Object,
          //     notify: true
          // },

          attributeModels: {
              type: Object,
              value: function () {
                  return {}
              }
          },

          /**
           * Indicates the number of items fetched at a time from the data-source.
           */
          pageSize: {
              type: Number,
              notify: true,
              value: 200
          },

          /**
           * Indicates the total record size of the current grid.				 
           */
          currentRecordSize: {
              notify: true,
              type: Number,
              value: 0
          },

          /**
           * Indicates a selected item.
           */
          selectedItem: {
              type: Object,
              value: function () {
                  return {};
              },
              notify: true
          },

          /**
           * Indicates an array of selected items.
           */
          selectedItems: {
              type: Array,
              value: [],
              notify: true
          },

          preSelectedItems: {
              type: [],
              value: function () {
                  return [];
              }
          },

          savedSearchCriterion: {
              type: Object,
              value: function () {
                  return true;
              }
          },

          savedSearchId: {
              type: String,
              value: ""
          },

          maxConfiguredCount: {
              type: Number,
              value: function () {
                  return DataObjectFalcorUtil.getPathKeys().dataIndexInfo.entityData.maxRecordsToReturn;
              }
          },

          governDataConfig: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          governAttributesCriterion: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          entityIdList: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          _governDataGetReq: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          _loadGrid: {
              type: Boolean
          },

          _loadWithoutWorkflow: {
              type: Boolean
          },

          _loading: {
              type: Boolean,
              value: false
          },

          _loadGovernData: {
              type: Boolean,
              value: false
          },

          _isCombinedGetReq: {
              type: Boolean,
              value: false
          },

          dynamicFields: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          processWithDynamicFields: {
              type: Boolean,
              value: false
          },

          applyLocaleCoalesce: {
              type: Boolean,
              value: false
          },

          applyContextCoalesce: {
              type: Boolean,
              value: false
          },

          applyLocaleCoalesceStyle: {
              type: Boolean,
              value: true
          },

          dataIndex: {
              type: String,
              value: "entityData"
          },

          _selectedEntityTypes: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          _selectedEntityTypesCount: {
              type: Number,
              value: 0
          },

          filterCriterionKey: {
              type: String,
              value: "attributesCriterion"
          }
      };
  }

  constructor() {
      super();
  }

  ready() {
      super.ready();
  }

  connectedCallback() {
      super.connectedCallback();

      beforeNextRender(this, function () {
          this._isViewLoaded = true;
      });
  }

  disconnectedCallback() {
      super.disconnectedCallback();
  }

  _requestConfig() {
      if (this.processWithDynamicFields && _.isEmpty(this.dynamicFields)) {
          return;
      }

      if (!_.isEmpty(this.contextData)) {
          let context = DataHelper.cloneObject(this.contextData);

          //Delete ItemContexts if more than one entity type is selected
          if (context.ItemContexts && context.ItemContexts.length > 1) {
              let types = [];
              context.ItemContexts.forEach(function (itemContext) {
                  if (itemContext.type) {
                      types.push(itemContext.type)
                  }
              })
              types = [...new Set(types)]; //unique types

              if (types.length > 1) {
                  delete context.ItemContexts;
              } else {
                  context.ItemContexts = [{
                      "type": types[0]
                  }]
              }
          }

          this.requestConfig('rock-entity-search-result', context);
      }
  }

  onConfigLoaded(componentConfig) {
      if (componentConfig && componentConfig.config) {
          let gridConfig = componentConfig.config.gridConfig;
          if (!_.isEmpty(this.dynamicFields)) {
              Object.keys(this.dynamicFields).forEach(key => {
                  this.dynamicFields[key].visible = "true";
              });
              gridConfig.itemConfig.fields = this.dynamicFields;
          }
          
          this.pageSize = gridConfig.pageSize ? gridConfig.pageSize : this.pageSize;
          this.maxRecordsSize = gridConfig.maxRecordsSize ? gridConfig.maxRecordsSize : this.maxConfiguredCount;

          //Set schema
          this._setGridSchema(gridConfig);
          //For governance
          if (componentConfig.config.dataIndex) {
              this.set("dataIndex", componentConfig.config.dataIndex);
          }
          this.set('gridConfig', gridConfig);
          this.set('governAttributesCriterion', componentConfig.config.governAttributesCriterion);
          this.set('governDataConfig', componentConfig.config.governDataConfig);

          this.attributeModels = {};
          this._onGridConfigChange(this.gridConfig);
      }
  }

  _setGridSchema(gridConfig) {
      if (gridConfig) {
          if (gridConfig.schemaType == "simple") {
              return;
          }
          if (gridConfig.itemConfig && !_.isEmpty(gridConfig.itemConfig.fields)) {
              let fields = gridConfig.itemConfig.fields;
              let isMetaDataSchema = true;
              for (let key in fields) {
                  if (!fields[key].isMetaDataColumn) {
                      isMetaDataSchema = false;
                      break;
                  }
              }
              if (isMetaDataSchema) {
                  gridConfig.schemaType = "simple";
              }
          }
      }
  }

  refresh() {
      this._requestConfig();
  }

  /**
   * Can be used to get the grid data.
   */
  getData() {
      return this._getEntityGrid().getData();
  }

  /**
   * Can be used to set the multi-selection for the grid.
   */
  setMultiSelection(flag) {
      if (this.shadowRoot.querySelector('#entityGrid') && flag != undefined) {
          this._getEntityGrid().setMultiSelection(flag);
      }
  }

  /**
   * Can be used to clear the current selection state.
   */
  clearSelection() {
      this._getEntityGrid().clearSelection();
  }

  /**
   *  Can be used to select an item.
   */
  selectItem(item) {
      this._getEntityGrid().selectItem(item);
  }

  /**
   * Can be used to set the "scroll position" dynamically.
   */
  scrollToIndex(index) {
      this._getEntityGrid().scrollToIndex(index);
  }

  /**
   * Can be used to reset the grid size.
   */
  notifyResize() {
      // if (this._getEntityGrid()) {
      //     this._getEntityGrid().notifyResize();
      // }
  }

  /**
   * For entity discovery & task details, this grid resize shoud happen when show/close download bar
   */
  _onRouteChange(e) {
      if (DataHelper.isValidObjectPath(e, "detail.route.path") &&
          (
              e.detail.route.path.indexOf('/search-') != -1 ||
              e.detail.route.path.indexOf('/task-detail') != -1 ||
              e.detail.route.path.indexOf('/reference-discovery') != -1)) {
          //  this.notifyResize();
      }
  }

  /**
   * Can be used to get the selected grid row.
   */
  getSelectedGridRow() {
      return this._getEntityGrid().getSelectedGridRow();
  }

  /**
   * Can be used to get the selected item index.
   */
  getSelectedItemIndex() {
      return this._getEntityGrid().getSelectedItemIndex();
  }

  getSelectedItemsAsQuery() {
      let grid = this._getEntityGrid();
      if (grid) {
          return grid.getSelectedItemsAsQuery();
      }
  }

  getSelectionMode() {
      let grid = this._getEntityGrid();
      if (grid) {
          return grid.getSelectionMode();
      }
  }

  _addWorkflowDetailsToConfig() {
      if (!(this.workflowCriterion && this.workflowCriterion.workflowName && this.workflowCriterion.workflowActivityName)) {
          return;
      }
      let title = this.workflowCriterion.workflowActivityExternalName + " (" + this.workflowCriterion
          .workflowName + ")";
      if (this.governDataCriterion && this.governDataCriterion.businessConditionExternalName) {
          let status = this.governDataCriterion.status;
          if (!status) {
              status = "failed";
          }
          title += " - " + this.governDataCriterion.businessConditionExternalName + " (" + status +
              ")"

          if (this.governDataCriterion.userId) {
              let userText = this.governDataCriterion.userId == "_UNASSIGNED" ? "Unassigned" :
                  "Assigned to me";
              title += " - " + userText;
          }
      }
      this.set('gridConfig.workflowTitle', title);
  }

  /**
   * Can be used to reload the grid.
   */
  reloadGrid() {
      if (!_.isEmpty(this.workflowCriterion)) {
          this._addWorkflowDetailsToConfig();
          let workflowActivityName = this.workflowCriterion.workflowActivityName;
          let contexts = [];
          let excludeNonContextual = false;
          let userId;
          let businessConditionName;
          let businessConditionNames;
          let passedBusinessConditions;
          if (!_.isEmpty(this.governDataCriterion)) {
              userId = this.governDataCriterion.userId;
              businessConditionName = this.governDataCriterion.businessConditionName;
              businessConditionNames = this.governDataCriterion.businessConditionNames;
              passedBusinessConditions = this.governDataCriterion.status == "passed";
              if (!(businessConditionName || businessConditionNames)) {
                  excludeNonContextual = true;
              }
          }

          contexts.push({
              "workflow": this.workflowCriterion.workflowShortName
          });

          if(!_.isEmpty(this.workflowCriterion.mappedContexts) && !("self" in this.workflowCriterion.mappedContexts[0])) {
              contexts = contexts.concat(this.workflowCriterion.mappedContexts);
          }

          let options = {
              "contexts": contexts,
              "typesCriterion": this.typesCriterion,
              "userId": userId,
              "workflowActivityName": workflowActivityName,
              "businessConditionName": businessConditionName,
              "businessConditionNames": businessConditionNames,
              "attributes": "",
              "excludeNonContextual": excludeNonContextual,
              "passedBusinessConditions": passedBusinessConditions
          }

          let req = DataRequestHelper.createGovernGetRequest(options);

          if (!_.isEmpty(req)) {
              this._governDataGetReq = req;
              // governDataLiquid.generateRequest();
              this._loadWithoutWorkflow = undefined;
              this._loadWithoutWorkflow = false;
              this._loadGrid = true;
              this._reloadGrid(true);
          }
      } else {
          this._loadGrid = true;
          this._loadWithoutWorkflow = true;
          this._reloadGrid(false);
      }
  }

  _onGridConfigChange(gridConfig) {
      let dataRequest = {};

      if (_.isEmpty(this.contextData) || _.isEmpty(gridConfig)) {
          return;
      }

      if (!_.isEmpty(this.contextData)) {
          if (Object.keys(this.contextData).length == 1 && this.contextData[ContextHelper.CONTEXT_TYPE_USER]) {
              return;
          }
      }

      // //TODO:: Search has to be restructured.
      // // Below is temporary fix.
      // if (!_.isEmpty(this.savedSearchId) && _.isEmpty(savedSearchCriterion)) {
      //     return;
      // }

      let attributeNames = this._getAttributesFromConfig();
      let typesCriterion = this.typesCriterion;;
      let firstEntityType = undefined;

      if (typesCriterion && typesCriterion.length > 0) {
          firstEntityType = typesCriterion[0]; // TODO:: how to get attribute models for multiple entity types
      }

      this.set('applyLocaleCoalesce', gridConfig.applyLocaleCoalesce || false);

      this._updateItemContexts();
      this.set('gridConfig.dataContexts', this.contextData[ContextHelper.CONTEXT_TYPE_DATA]);
      this.set('gridConfig.valueContexts', this.contextData[ContextHelper.CONTEXT_TYPE_VALUE]);
      let contextData = DataHelper.cloneObject(this.contextData);
      let liquidModelGet = this.shadowRoot.querySelector("[name=compositeAttributeModelGet]");
      let compositeModelGetRequest = DataRequestHelper.createEntityModelCompositeGetRequest(
          this.contextData);
      if (contextData && contextData.ItemContexts) {
          let index = 0;
          this._notFoundEntityTypes = [];
          for (let i = 0; i < this.contextData.ItemContexts.length; i++) {

              contextData.ItemContexts = [this.contextData.ItemContexts[i]];
              if (contextData.ItemContexts[0].type) {
                  compositeModelGetRequest.params.query.name = contextData.ItemContexts[0].type;
                  this.set('attributeModelRequest', DataHelper.cloneObject(compositeModelGetRequest));
                  if (liquidModelGet) {
                      liquidModelGet.generateRequest();
                      index++;
                  }
              }

          }
          this._selectedEntityTypesCount = index;
      }
  }

  _onCompositeModelGetResponse(e) {
      let requestData = e.detail.request.requestData;
      if (e && e.detail && DataHelper.validateGetAttributeModelsResponse_New(e.detail.response)) {
          let entityModels = e.detail.response.content.entityModels;
          if (!_.isEmpty(entityModels)) {
              for (let i = 0; i < entityModels.length; i++) {
                  let entityModel = entityModels[i];
                  let properties = entityModel.properties;
                  if (properties && properties.hasOwnProperty("defaultThumbnailId")) {
                      this._typeThumbnailMapping[entityModel.name] = properties.defaultThumbnailId;
                  }
              }
              this.push("_selectedEntityTypes", entityModels[0]);
          } else if (_.isEmpty(entityModels) && DataHelper.isValidObjectPath(requestData,
                  "params.query.name")) {
              this._notFoundEntityTypes.push(requestData.params.query.name);
          }
      } else {
          if (DataHelper.isValidObjectPath(requestData, "params.query.name")) {
              this._notFoundEntityTypes.push(requestData.params.query.name);
          }
          this.logError("rock-entity-search-result - Composite model get response error", e);
      }

      let responseLength = this._selectedEntityTypes.length + this._notFoundEntityTypes.length;

      if (responseLength == this._selectedEntityTypesCount) {

          for (let key in this._selectedEntityTypes) {
              let formattedModels = DataTransformHelper.transformAttributeModels(this._selectedEntityTypes[
                  key], {});
              _.extend(this.attributeModels, formattedModels);
          }

          let attributeModels = DataHelper.cloneObject(this.attributeModels);
          this.attributeModels = {};
          this.set("attributeModels", attributeModels);
          this.reloadGrid();

          if (!_.isEmpty(this._notFoundEntityTypes)) {
              let messageContent = this._notFoundEntityTypes.join(", ");
              this.logError("Attribute models not found for entity type(s) " + messageContent);
              if (this._notFoundEntityTypes.length === this._selectedEntityTypesCount) {
                  this.fireBedrockEvent('grid-load-error');
              }
          }
          this._selectedEntityTypes = [];
          this._notFoundEntityTypes = [];
      }
  }

  _onSearchError() {
      this.fireBedrockEvent('grid-load-error');
  }

  _onCompositeGetError(e) {
      let requestData = e.detail.request.requestData;
      this._notFoundEntityTypes.push(requestData.params.query.name);
      this.logError("rock-entity-search-result - Failed to get composite model", e);
      if (this._notFoundEntityTypes.length == this._selectedEntityTypesCount) {
          this.fireBedrockEvent('grid-load-error');
      }
  }

  _searchResultFiltersChanged(currentFilters) {
      this.set("request.params.query.filters", currentFilters);
  }

  async _getAttributeFormattedData(data) {
      let dataArray = [];
      let formattedEntities = [];
      let defaultAttributes = ["type", "id"]
      if (data && data.content) {
          let entities;
          if (data.content.entities) {
              entities = data.content.entities;
          } else if (data.content.entityModels) {
              entities = data.content.entityModels;
          }
          if (entities && entities.length > 0) {
              if (this.gridConfig.viewMode == "Tabular") {
                  formattedEntities = await DataTransformHelper.transformEntitiesToGridFormat(
                      entities, this.attributeModels, this.contextData, this._getGridColumns()
                  );
              } else {
                  let attributes = this._getAttributesFromConfig();
                  for (let attribute of defaultAttributes) {
                      if (attributes.indexOf(attribute) == -1) {
                          attributes.push(attribute);
                      }
                  }
                  this._updateAttributesForDomain(attributes);
                  formattedEntities = DataTransformHelper.transformEntitiesToSimpleSchema(
                      entities, attributes, this.attributeModels);
                  for (let i = 0; i < formattedEntities.length; i++) {
                      let type = formattedEntities[i].type;
                      if (!formattedEntities[i].thumbnailid) {
                          formattedEntities[i].thumbnailid = "";
                          if (this._typeThumbnailMapping && this._typeThumbnailMapping[type]) {
                              formattedEntities[i].thumbnailid = this._typeThumbnailMapping[
                                  type];
                          }
                      }
                  }
              }
              this.fireBedrockEvent('grid-with-data');
          } else {
              //Check on scroll down, the grid can still have some data
              if (this.getData().length <= 0) {
                  this.fireBedrockEvent('empty-grid');
              }
          }
      }

      return formattedEntities;
  }

  _getGridColumns() {
      if (this.gridConfig && this.gridConfig.tabular && this.gridConfig.tabular.columns) {
          return this.gridConfig.tabular.columns;
      }
      let columns = [];
      if (DataHelper.isValidObjectPath(this.gridConfig, 'itemConfig.fields')) {
          columns = DataHelper.convertObjectToArray(this.gridConfig.itemConfig.fields);
      }
      return columns;
  }

  _getAttributesFromConfig() {
      return this._getGridColumns().map(function (column) {
          return column.name;
      });
  }

  // Remove unsupported filters which were added for tags
  _removeUnSupportedFilters(filters) {
      for (let i = 0; i < filters.length; i++) {
          if (filters[i] && !_.isEmpty(filters[i])) {
              for (let key in filters[i]) {
                  if (!filters[i].hasOwnProperty(key)) continue;
                  for (let j in filters[i][key]) {
                      if (!filters[i][key].hasOwnProperty(j)) continue;
                      if (j != 'eq' &&
                          j != 'gte' &&
                          j != 'lte' &&
                          j != 'contains' &&
                          j != 'exact' &&
                          j != 'exacts' &&
                          j != 'type' &&
                          j != 'operator' &&
                          j != 'valueContexts' &&
                          j != 'nonContextual' &&
                          j != 'contexts' &&
                          j != 'attributes' &&
                          j != 'hasvalue'
                      ) {
                          delete filters[i][key][j];
                      }
                  }
              }
          }
      }

      return filters;
  }

  _setSearchCriteria() {
      // reset search criteria
      delete this._entityDataGetReq.params.query.filters.keywordsCriterion;
      delete this._entityDataGetReq.params.query.ids;
      let searchCriteria;

      if (this.searchQuery && this.searchQuery != "") {
          searchCriteria = DataHelper.getSearchCriteria(this.searchQuery);
          if (searchCriteria && searchCriteria.isIdSearch) {
              let filteredIds = searchCriteria.ids || [];
              if (this.entityIdList && this.entityIdList.length > 0) {
                  let self = this;
                  filteredIds = searchCriteria.ids.filter(function (searchCriteriaId) {
                      if (self.entityIdList.indexOf(searchCriteriaId) >= 0) {
                          return searchCriteriaId;
                      }
                  });
              }
              this._entityDataGetReq.params.query.ids = filteredIds;
          } else {
              this._entityDataGetReq.params.query.filters.keywordsCriterion = searchCriteria
          }
      }

      if (this.entityIdList && this.entityIdList.length > 0 && (DataHelper.isEmptyObject(
              searchCriteria) || !searchCriteria.isIdSearch)) {
          this._entityDataGetReq.params.query.ids = this.entityIdList;
      }
  }

  _addDefaultContext() {
      let defaultLocale = DataHelper.getDefaultLocale();
      if (this._entityDataGetReq.params.query && this._entityDataGetReq.params.query.valueContexts) {
          let defaultValueContext = this._entityDataGetReq.params.query.valueContexts.find(
              context => context.locale === defaultLocale);
          if (!defaultValueContext) {
              let contextData = DataHelper.cloneObject(ContextHelper.getFirstValueContext(
                  this.contextData));
              contextData.locale = defaultLocale;
              this._entityDataGetReq.params.query.valueContexts.push(contextData);
          }
      }
  }

  _updateItemContexts() {
      let itemContexts = this.getItemContexts();
      if (!itemContexts && itemContexts.length) {
          return;
      }
      let attributeNames = this._getAttributesFromConfig();
      this._updateAttributesForDomain(attributeNames);
      for (let i in itemContexts) {
          itemContexts[i].attributeNames = attributeNames;
      }
  }

  _updateAttributesForDomain(attributes) {
      if (this.domain == "digitalAsset") {
          if (this.gridConfig.itemConfig) {
              attributes.push(this.gridConfig.itemConfig.image);
              attributes.push(this.gridConfig.itemConfig.title);
              attributes.push(this.gridConfig.itemConfig.id);
              attributes.push(this.gridConfig.itemConfig.subtitle);
          }

          //Required attributes for assets
          attributes.push("type");
          attributes.push("filenameextension");
          attributes.push("thumbnailid");
          attributes.push("property_objectkey");

          attributes = [...new Set(attributes)]; //unique types
      }
  }

  _reloadGrid(isCombinedGetReq) {
      this._updateItemContexts();

      this._entityDataGetReq = DataRequestHelper.createEntityGetRequest(this.contextData);
      if (this.modelDomain) {
          this._entityDataGetReq.params.query.domain = this.modelDomain
      }
      if (this.searchFilters && !_.isEmpty(this.searchFilters)) {
          let attrsCriterion = this._removeUnSupportedFilters(this.searchFilters);
          this._entityDataGetReq.params.query.filters[this.filterCriterionKey] =
              attrsCriterion;
          if (!_.isEmpty(this._governDataGetReq)) {
              this._governDataGetReq.params.query.filters[this.filterCriterionKey] = this._getDefaultGovernAttributesCriterion();
              this._updateGovernRequestAttributesCriterion(this.searchFilters);
          }
      }

      if (!_.isEmpty(this.relationshipSearchFilters)) {
          this._entityDataGetReq.params.query.filters.relationshipsCriterion = this.relationshipSearchFilters;
      }

      this._setSearchCriteria();

      this._isCombinedGetReq = isCombinedGetReq;

      if (isCombinedGetReq) {
          this.request = DataRequestHelper.createCombinedGetRequest(this._governDataGetReq,
              this._entityDataGetReq);
      } else {
          this.request = this._entityDataGetReq;
      }
      this.async(function () {
          let grid = this._getEntityGrid();
          let dataSource = this._getEntityDataSource();

          if (grid) {
              if (dataSource) {
                  dataSource.resetDataSource();
              }
              grid.reRenderGrid();
          }
      }, 100);
  }

  _getEntityGrid() {
      if (!this._loadGovernData) {
          return ElementHelper.getElement(this, "#entityGrid");
      } else {
          return ElementHelper.getElement(this, "#governGrid");
      }
  }

  _getEntityDataSource() {
      if (this._loadGovernData) {
          return undefined;
      } else {
          return ElementHelper.getElement(this, "#searchGridDatasource");
      }
  }

  _isWorkflowRequest(loadGrid, loadWithoutWorkflow) {
      if (_.isEmpty(this.workflowCriterion) && !loadWithoutWorkflow) {
          return false;
      }
      return true;
  }

  _isWorkflowCriterion() {
      if (_.isEmpty(this.workflowCriterion)) {
          return false;
      }

      return true;
  }

  _onDownload(e, detail) {
      let selectedItems = this.getSelectedItems();
      let selectionMode = this.getSelectionMode();
      let selectionQuery = this.getSelectedItemsAsQuery();

      if (selectedItems && selectedItems.length && this.contextData) {
          let selectedItemsCount = selectionMode == "query" ? this.totalCount : selectedItems
              .length;

          const sharedData = {
              "selection-query": selectionQuery,
              "selection-mode": selectionMode,
              "selected-entities": selectedItems,
              "selected-items-count": selectedItemsCount
          };

          this.openBusinessFunctionDialog({
              name: 'rock-wizard-entity-download',
              mergeTitle: true,
              title: DataHelper.concatValuesFromArray([
                  ContextHelper.getDataContexts(this.contextData),
                  selectedItems.length + " entities"
              ])
          }, sharedData);
      } else {
          this.showInformationToast("Select at least one entity from grid to download.");
      }
  }

  _onUpload(e, detail) {
      this.openBusinessFunctionDialog({
          name: 'rock-wizard-entity-upload'
      });
  }

  _onBulkEdit(e, detail) {
      let selectedItems = this.getSelectedItems();
      let selectionMode = this.getSelectionMode();
      let selectionQuery = this.getSelectedItemsAsQuery();
      let selectedItemCount = this._getSelectedItemCount();
      if (selectedItems && selectedItems.length && this.contextData) {
          let itemContexts = [];
          if (this.typesCriterion && this.typesCriterion.length) {
              for (let i = 0; i < this.typesCriterion.length; i++) {
                  let type = this.typesCriterion[i];
                  if (!(itemContexts.find(obj => obj.type === type))) {
                      let itemContext = {
                          "type": type
                      };
                      itemContexts.push(itemContext);
                  }
              }
          }
          let clonedContextData = DataHelper.cloneObject(this.contextData);
          clonedContextData[ContextHelper.CONTEXT_TYPE_ITEM] = itemContexts;
          clonedContextData[ContextHelper.CONTEXT_TYPE_DATA] = [];

          const sharedData = {
              "context-data": clonedContextData,
              "workflow-criterion": this.workflowCriterion,
              "selection-query": selectionQuery,
              "selection-mode": selectionMode,
              "selected-entities": selectedItems,
              "edit-attributes-only": true
          };

          this.openBusinessFunctionDialog({
              name: 'rock-wizard-entity-bulk-edit',
              configName: 'wizardConfig',
              mergeTitle: true,
              title: DataHelper.concatValuesFromArray([
                  ContextHelper.getDataContexts(this.contextData),
                  selectedItemCount + " entities"
              ])
          }, sharedData);
      } else {
          this.showInformationToast("Select at least one entity from grid to edit.");
      }
  }

  _showConfirmationDialog(e, detail) {
      let selectedItems = this.getSelectedItems();
      if (!selectedItems || selectedItems.length == 0) {
          this.showInformationToast("Select at least one entity from grid to delete.");
          return;
      }
      this.shadowRoot.querySelector("#confirmationDialog").open();
  }

  _onBulkDelete() {
      let selectionMode = this.getSelectionMode();

      //Safer code - Already delete button is hidden
      if (selectionMode == "query") {
          this.showInformationToast(
              "Cannot perform delete based on 'All Search Criteria', select the entities manually to perform this operation."
          );
          return;
      }

      if (this.contextData) {
          let selectedEntities = this.getSelectedItems();
          const sharedData = {
              "selection-query": this.getSelectedItemsAsQuery(),
              "selection-mode": selectionMode,
              "selected-entities": selectedEntities
          };
          this.openBusinessFunctionDialog({
              name: 'rock-wizard-entity-delete',
              mergeTitle: true,
              title: selectedEntities.length + " entities"
          }, sharedData);
      } else {
          this.showInformationToast("Context not available, cannot perform delete operation.");
      }
  }

  getSelectedItems() {
      let grid = this._getEntityGrid();
      if (grid) {
          return grid.getSelectedItems();
      }
  }
  _getSelectedItemCount() {
      let grid = this._getEntityGrid();
      if (grid) {
          return grid.selectedTotalCount;
      }
  }
  _showToggle() {
      if (this.governDataConfig && this.governDataConfig.showGovernDataToggle) {
          return true;
      }
      return false;
  }

  _getDefaultGovernAttributesCriterion() {
      let defaultCriterion = [];
      let currentCriterion = this._governDataGetReq.params.query.filters[this.filterCriterionKey];

      if (currentCriterion) {
          currentCriterion.forEach(function (criterion) {
              if (criterion && Object.keys(criterion).length == 1) {
                  switch (Object.keys(criterion)[0]) {
                      case "activities":
                      case "status":
                      case "businessConditions":
                          defaultCriterion.push(criterion);
                          break;
                  }
              }
          }, this);
      }
      return defaultCriterion;
  }

  _updateGovernRequestAttributesCriterion(attributesCriterion) {

      if (this.governAttributesCriterion) {
          if (this.governAttributesCriterion.include && this.governAttributesCriterion.include
              .length) {

              if (this.governAttributesCriterion.include.length == 1 && this.governAttributesCriterion
                  .include[0] == "_ALL") {
                  attributesCriterion.forEach(function (attrCritrn) {
                      attrCritrn[Object.keys(attrCritrn)[0]].nonContextual = true;
                      this._governDataGetReq.params.query.filters[this.filterCriterionKey]
                          .push(attrCritrn)
                  }, this);
              } else {
                  let attributes = this.governAttributesCriterion.include;

                  if (attributes && attributes.length) {
                      attributes.forEach(function (attr) {
                          for (let i = 0; i < attributesCriterion.length; i++) {
                              if (attributesCriterion[i][attr]) {
                                  let attrCriterion = attributesCriterion[i];
                                  attrCriterion[attr].nonContextual = true;
                                  this._governDataGetReq.params.query.filters[this.filterCriterionKey]
                                      .push(attrCriterion);
                                  break;
                              }
                          }
                      }, this);
                  }
              }
          }
      }
  }

  _onOriginalAssetDownloadAction(e, detail) {
      if (detail) {
          let fileName = detail.property_objectkey;
          if (fileName) {
              this._generateOriginalAssetsDownloadRequest([fileName]);
          }
      }
  }

  _onCustomToolbarEvent(e, detail) {
      if (detail && detail.name == "originalAssetDownload") {
          this._originalAssetsDownload();
      }
  }

  _originalAssetsDownload() {
      let rockGrid = dom(this).node.shadowRoot.querySelector('rock-grid');
      let selectedItems = rockGrid.getSelectedItems();
      const downloadCount = this.appSetting('dataDefaults').maxCountForAssetSyncDownload;
      if (selectedItems && selectedItems.length) {
          if (selectedItems.length > downloadCount) {
              this.showInformationToast("Simultaneous download of maximum " + downloadCount +
                  " assets are allowed.");
              return;
          }
          let objectKeys = [];
          selectedItems.forEach(function (item) {
              if (item && item.property_objectkey) {
                  objectKeys.push(item.property_objectkey)
              }
          }, this);
          if (objectKeys.length) {
              let eventDetail = {
                  "loading": true
              };
              ComponentHelper.fireBedrockEvent("toggle-spinner", eventDetail, {
                  ignoreId: true
              });
              this._generateOriginalAssetsDownloadRequest(objectKeys);
          }
      } else {
          this.showInformationToast("Select at least one asset from grid to download.");
      }
  }

  _generateOriginalAssetsDownloadRequest(objectkeys) {
      let binaryStreamObjects = [];
      objectkeys.forEach(function (item) {
          if (item) {
              binaryStreamObjects.push({
                  "binaryStreamObject": {
                      "id": item,
                      "type": "binarystreamobject",
                      "data": {}
                  }
              })
          }
      }, this);
      let req = binaryStreamObjects;
      let downloadUrlLiquid = this.shadowRoot.querySelector("#getDownloadUrl");
      if (downloadUrlLiquid) {
          downloadUrlLiquid.requestData = req;
          downloadUrlLiquid.generateRequest();
      }
  }

  _onGetDownloadUrlResponse(e) {
      LiquidResponseHelper.downloadURLResponseMapper(e, downloadURL => {
          window.open(downloadURL, "_blank");
      });
      let eventDetail = {
          "loading": false
      };
      ComponentHelper.fireBedrockEvent("toggle-spinner", eventDetail, {
          ignoreId: true
      });
  }
}

customElements.define(RockEntitySearchResult.is, RockEntitySearchResult);
