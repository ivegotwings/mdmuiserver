/**
`rock-assets-search-grid` Represents a component that renders the asset entities in the grid.

@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-helpers/context-helper.js';
import '../bedrock-helpers/data-request-helper.js';
import '../bedrock-helpers/data-transform-helper.js';
import '../bedrock-helpers/liquid-response-helper.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-app-behavior/bedrock-app-behavior.js';
import '../liquid-dataobject-utils/liquid-dataobject-utils.js';
import '../liquid-entity-model-composite-get/liquid-entity-model-composite-get.js';
import '../liquid-entity-data-get/liquid-entity-data-get.js';
import '../liquid-entity-govern-data-get/liquid-entity-govern-data-get.js';
import '../liquid-rest/liquid-rest.js';
import '../pebble-spinner/pebble-spinner.js';
import '../pebble-dialog/pebble-dialog.js';
import '../rock-grid/rock-grid.js';
import './assets-search-grid-datasource.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockAssetsSearchGrid extends mixinBehaviors([RUFBehaviors.AppBehavior, RUFBehaviors.ComponentContextBehavior],
    PolymerElement) {
  static get template() {
    return Polymer.html`
        <style>
            :host {
                height: 100%;
                display: block;
            }
        </style>
        <pebble-spinner active="[[_loading]]"></pebble-spinner>
        <liquid-entity-model-composite-get name="compositeAttributeModelGet" on-entity-model-composite-get-response="_onCompositeModelGetResponse"></liquid-entity-model-composite-get>
        <liquid-entity-govern-data-get name="governDataGet" operation="initiatesearch" on-response="_onGovernDataResponse"></liquid-entity-govern-data-get>
        <liquid-rest id="getThumbnail" url="/binaryobjectservice/get" method="POST" on-liquid-response="_onGetThumbnailResponse">
        </liquid-rest>
        <liquid-rest id="getDownloadUrl" url="/data/binarystreamobjectservice/prepareDownload" method="POST" on-liquid-response="_onGetDownloadUrlResponse">
        </liquid-rest>
        <template is="dom-if" if="[[_isWorkflowRequest(_loadGrid, _loadWithoutWorkflow)]]">
            <assets-search-grid-datasource id="searchGrid" request="{{request}}" asset-search-data-source="{{rDataSource}}" asset-search-dataformatter="{{dataFormatter}}" current-record-size="{{currentRecordSize}}" result-record-size="{{resultRecordSize}}" total-count="{{totalCount}}"></assets-search-grid-datasource>
            <rock-grid id="entityGrid" r-data-source="{{rDataSource}}" r-data-source-id="searchGrid" current-record-size="{{currentRecordSize}}" result-record-size="{{resultRecordSize}}" config="{{gridConfig}}" attribute-models="{}" page-size="[[pageSize]]" selected-item="{{selectedItem}}" total-count="{{totalCount}}" max-configured-count="[[maxConfiguredCount]]" is-workflow-criterion="[[_isWorkflowCriterion(workflowCriterion)]]"></rock-grid>
            <bedrock-pubsub event-name="grid-download-item" handler="_onDownload" target-id="entityGrid"></bedrock-pubsub>
            <bedrock-pubsub event-name="grid-upload-item" handler="_onUpload" target-id="entityGrid"></bedrock-pubsub>
            <bedrock-pubsub event-name="grid-custom-toolbar-event" handler="_onCustomToolbarEvent" target-id="entityGrid"></bedrock-pubsub>
            <bedrock-pubsub event-name="download-original-asset" handler="_onOriginalAssetDownloadAction" target-id="entityGrid"></bedrock-pubsub>
            <bedrock-pubsub event-name="grid-bulk-delete-items" handler="_showConfirmationDialog" target-id="entityGrid"></bedrock-pubsub>
            <bedrock-pubsub event-name="grid-bulk-edit-items" handler="_onBulkEdit" target-id="entityGrid"></bedrock-pubsub>
        </template>

        <pebble-dialog id="confirmationDialog" dialog-title="Confirmation" modal="" alert-box="" show-cancel="" show-ok="" no-cancel-on-outside-click="" no-cancel-on-esc-key="">
            <p>Are you sure you want to delete?</p>
        </pebble-dialog>
        <bedrock-pubsub event-name="on-buttonok-clicked" handler="_onBulkDelete" target-id="confirmationDialog"></bedrock-pubsub>
`;
  }

  static get is() {
      return "rock-assets-search-grid";
  }
  static get properties() {
      return {
          /**
           * Indicates the context data.
           * 
           */
          contextData: {
              type: Object,
              value: function () {
                  return {};
              }
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
                                  "typesCriterion": []
                              }
                          },
                          "fields": {
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
           * Specifies the filters that are used to filter the search.
           */
          searchFilters: {
              type: Array,
              notify: true,
              value: function () {
                  return [];
              }
          },
          /**
           * Specifies the query object that are used to initiate the search.
           */
          searchQuery: {
              type: String,
              notify: true,
              value: ""
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
           * Specifies the format of the data that are passed to the remote data.
           */
          dataFormatter: {
              notify: true,
              value: function () {
                  return this._getAttributeFormattedData.bind(this);
              }
          },
          /**
           * Indicates the attribute models.
           * 
           */
          attributeModels: {
              type: Object,
              value: function () {
                  return {}
              }
          },
          /**
           * Indicates the number of items fetched at a time from the data source.
           */
          pageSize: {
              type: Number,
              notify: true,
              value: 200
          },

          /**
           * Indicates the total record size of the current grid.
           */
          totalCount: {
              notify: true,
              type: Number,
              value: 0
          },

          resultRecordSize: {
              notify: true,
              type: Number,
              value: 0
          },

          /**
           * Indicates the selected item.
           */
          selectedItem: {
              type: Object,
              value: function () {
                  return {};
              },
              notify: true
          },
          /**
           * Indicates the maximum count which is shown in the grid title. 
           * If the entities' count is greater than `this` count, then the 
           * number of entities are not shown.
           * For example, if maxConfiguredCount is 200 and you have 250 entities,
           * `maxConfiguredCount` is shown as "200+".
           *
           */
          maxConfiguredCount: {
              type: Number,
              value: function () {
                  return DataObjectFalcorUtil.getPathKeys().dataIndexInfo.entityData.maxRecordsToReturn;
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
          /**
            * <b><i>Content development is under progress... </b></i> 
            */
          typesCriterion: {
              type: Array,
              value: function () {
                  return [];
              }
          }
      }
  }
  connectedCallback() {
      super.connectedCallback();
      this._confirmationDialog = this.shadowRoot.querySelector("#confirmationDialog");
  }

  get governDataGetLiq() {
      this._governDataGet = this._governDataGet || this.shadowRoot.querySelector(
          "[name=governDataGet]");
      return this._governDataGet;
  }

  get compositeAttributeModelGetLiq() {
      this._compositeAttributeModelGet = this._compositeAttributeModelGet || this.shadowRoot.querySelector(
          "[name=compositeAttributeModelGet]");
      return this._compositeAttributeModelGet;
  }

  get getDownloadUrlLiq() {
      this._getDownloadUrl = this._getDownloadUrl || this.shadowRoot.querySelector("#getDownloadUrl");
      return this._getDownloadUrl;
  }

  /**
   * Can be used to refresh the grid.
   *
   */
  refresh() {
      this._onGridConfigChange(this.gridConfig);
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
      const _entityGrid = this._getEntityGrid();
      if (_entityGrid && flag) {
          _entityGrid.setMultiSelection(flag);
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
   * Can be used to set scroll position dynamically.
   */
  scrollToIndex(index) {
      let _getEntityGrid = this._getEntityGrid();
      if (_getEntityGrid) {
          _getEntityGrid.scrollToIndex(index);
      }
  }

  /**
   * Can be used to get the selected item index.
   */
  getSelectedItemIndex() {
      return this._getEntityGrid().getSelectedItemIndex();
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
      if (_.isEmpty(this.workflowCriterion)) {
          this._loadGrid = true;
          this._loadWithoutWorkflow = true;
          this._reloadGrid();
          return;
      }

      this._addWorkflowDetailsToConfig();
      if (!this.governDataGetLiq) return;

      let workflowActivityName = this.workflowCriterion.workflowActivityName;
      let contexts = [];
      let excludeNonContextual = false;
      if (!_.isEmpty(this.governDataCriterion)) {
          let userId = this.governDataCriterion.userId;
          let businessConditionName = this.governDataCriterion.businessConditionName;
          let businessConditionNames = this.governDataCriterion.businessConditionNames;
          let passedBusinessConditions = this.governDataCriterion.status == "passed";
          if (!(businessConditionName || businessConditionNames)) {
              contexts.push({
                  "workflow": this.workflowCriterion.workflowShortName
              });
              excludeNonContextual = true;
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

          this.governDataGetLiq.requestData = DataRequestHelper.createGovernGetRequest(options);;
          this.governDataGetLiq.generateRequest();
      }
  }

  _onGridConfigChange(gridConfig) {
      if (gridConfig != undefined) {
          if (_.isEmpty(this.contextData) || _.isEmpty(gridConfig)) {
              return;
          }
          if (!_.isEmpty(this.contextData)) {
              if (Object.keys(this.contextData).length == 1 && this.contextData[ContextHelper.CONTEXT_TYPE_USER]) {
                  return;
              }
          }
          if (!gridConfig.dataRequest) {
              return;
          }


          let contextData = DataHelper.cloneObject(this.contextData);

          this._updateItemContexts(contextData);
          this.set('gridConfig.dataContexts', contextData[ContextHelper.CONTEXT_TYPE_DATA]);
          this.set('gridConfig.valueContexts', contextData[ContextHelper.CONTEXT_TYPE_VALUE]);
          contextData[ContextHelper.CONTEXT_TYPE_DATA] = [];
          let compositeModelGetRequest = DataRequestHelper.createEntityModelCompositeGetRequest(
              contextData);
          if (compositeModelGetRequest && this.compositeAttributeModelGetLiq) {
              this.compositeAttributeModelGetLiq.requestData = compositeModelGetRequest;
              this.compositeAttributeModelGetLiq.generateRequest();
          }
      }
  }

  _onCompositeModelGetResponse(e) {
      if (!this._typeThumbnailMapping) {
          this._typeThumbnailMapping = {};
      }
      if (e && e.detail && DataHelper.validateGetAttributeModelsResponse_New(e.detail.response)) {
          let entityModels = e.detail.response.content.entityModels;
          for (let i = 0; i < entityModels.length; i++) {
              let entityModel = entityModels[i];
              let properties = entityModel.properties;
              if (properties && properties.hasOwnProperty("defaultThumbnailId")) {
                  this._typeThumbnailMapping[entityModel.name] = properties.defaultThumbnailId;
              }
          }
          this.attributeModels = DataTransformHelper.transformAttributeModels(e.detail.response
              .content.entityModels[0], this.contextData);
          this.reloadGrid();
      }
  }
  _onGovernDataResponse(e) {
      let response = e.detail.response;
      let ids = [0];
      if (response) {
          if (response.content && response.content.items) {
              let items = response.content.items;
              if (items.length > 0) {
                  ids = [...new Set(items.map((obj) => obj.id))];
              }
          }
      }
      this._loadWithoutWorkflow = undefined;
      this._loadWithoutWorkflow = false;
      this._loadGrid = true;
      this._reloadGrid(ids);
  }

  _getAttributeNamesFromTileConfig(config) {
      let tileItems = config.itemConfig;
      let attributeNames = config.dataRequest.attributes;
      if (!attributeNames) {
          attributeNames = [];
      }
      attributeNames.push(tileItems.image);
      attributeNames.push(tileItems.title);
      attributeNames.push(tileItems.id);
      attributeNames.push(tileItems.subtitle);
      attributeNames.push("type");
      for (let i in tileItems.fields) {
          let field = tileItems.fields[i];
          attributeNames.push(field.name);
      }
      return _.uniq(attributeNames);
  }

  _getAttributeFormattedData(data) {
      let formattedEntities = [];
      let attributes = this._getAttributeNamesFromTileConfig(this.gridConfig);
      if (data && data.content) {
          let entities = data.content.entities;
          if (entities && entities.length > 0) {
              formattedEntities = DataTransformHelper.transformEntitiesToSimpleSchema(entities,
                  attributes, this.attributeModels);
          }
      }
      for (let i = 0; i < formattedEntities.length; i++) {
          let type = formattedEntities[i].type;
          if (!formattedEntities[i].thumbnailid) {
              formattedEntities[i].thumbnailid = "";
              if (this._typeThumbnailMapping && this._typeThumbnailMapping[type]) {
                  formattedEntities[i].thumbnailid = this._typeThumbnailMapping[type];
              }
          }

      }

      if (formattedEntities.length == 0 && this.getData().length <= 0) {
          this.fireBedrockEvent('empty-grid');
      } else {
          this.fireBedrockEvent('grid-with-data');
      }

      return formattedEntities;
  }

  _updateItemContexts(contextData) {
      let itemContexts = [];
      if (!this.gridConfig.dataRequest) {
          return;
      }
      let attributeNames = this.gridConfig.dataRequest.attributes;
      if (attributeNames) {
          if (attributeNames.indexOf("thumbnailid") == -1) {
              attributeNames.push("thumbnailid");
          }
          if (attributeNames.indexOf("property_objectkey") == -1) {
              attributeNames.push("property_objectkey");
          }
      }
      for (let i in this.typesCriterion) {
          let itemContext = {};
          itemContext.attributeNames = attributeNames;
          itemContext.type = this.typesCriterion[i];
          itemContexts.push(itemContext);
      }
      contextData[ContextHelper.CONTEXT_TYPE_ITEM] = itemContexts;
  }

  _reloadGrid(ids) {

      let contextData = DataHelper.cloneObject(this.contextData);
      ContextHelper.addDefaultValContext(contextData);

      this._updateItemContexts(contextData);
      this.request = DataRequestHelper.createEntityGetRequest(contextData);
      if (!_.isEmpty(ids)) {
          this.request.params.query.ids = ids;
      }

      if (this.searchFilters && !_.isEmpty(this.searchFilters)) {
          this.request.params.query.filters.attributesCriterion = this.searchFilters;
      }

      this._setSearchCriteria();

      let grid = this._getEntityGrid();

      if (grid) {
          grid.reRenderGrid();
      }
  }

  _setSearchCriteria() {
      // reset search criteria
      delete this.request.params.query.filters.keywordsCriterion;
      let entityIdList = this.request.params.query.ids;
      let searchCriteria;

      if (this.searchQuery && this.searchQuery != "") {
          searchCriteria = DataHelper.getSearchCriteria(this.searchQuery);
          if (searchCriteria && searchCriteria.isIdSearch) {
              let filteredIds = searchCriteria.ids || [];
              if (entityIdList && entityIdList.length > 0) {
                  filteredIds = searchCriteria.ids.filter(function (searchCriteriaId) {
                      if (entityIdList.indexOf(searchCriteriaId) >= 0) {
                          return searchCriteriaId;
                      }
                  });
              }
              this.request.params.query.ids = filteredIds;
          } else {
              this.request.params.query.filters.keywordsCriterion = searchCriteria
          }
      }
  }

  _getEntityGrid() {
      return ElementHelper.getElement(this, "#entityGrid");
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

  _onOriginalAssetDownloadAction(e, detail) {
      if (detail) {
          let fileName = detail.property_objectkey;
          if (fileName) {
              this._generateOriginalAssetsDownloadRequest([fileName]);
          }
      }
  }
  _generateOriginalAssetsDownloadRequest(objectkeys) {
      if (!this.getDownloadUrlLiq) return;

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
      });

      this.getDownloadUrlLiq.requestData = binaryStreamObjects;
      this.getDownloadUrlLiq.generateRequest();
  }
  _onCustomToolbarEvent(e, detail) {
      if (detail && detail.name == "originalAssetDownload") {
          this._originalAssetsDownload();
      }
  }
  _originalAssetsDownload() {
      let rockGrid = this._getEntityGrid();
      let selectedItems = rockGrid.getSelectedItems();
      if (selectedItems && selectedItems.length) {
          if (selectedItems.length > 5) {
              this.showInformationToast("Simultaneous download of maximum 5 assets are allowed.");
              return;
          }
          let objectKeys = [];
          selectedItems.forEach(function (item) {
              if (item && item.property_objectkey) {
                  objectKeys.push(item.property_objectkey)
              }
          }, this);
          if (objectKeys.length) {
              this._generateOriginalAssetsDownloadRequest(objectKeys);
          }
      } else {
          this.showInformationToast("Select at least one asset from grid to download.");
      }
  }
  _showConfirmationDialog(e, detail) {
      let selectedItems = this.getSelectedItems();
      if (!selectedItems || selectedItems.length == 0) {
          this.showInformationToast("Select at least one entity from grid to delete.");
          return;
      }

      this._deleteComponentName = detail.componentName;
      this._confirmationDialog.open();
  }
  _onBulkDelete() {
      let selectedItems = this.getSelectedItems();
      let selectionMode = this.getSelectionMode();
      let selectionQuery = this.getSelectedItemsAsQuery();

      //Safer code - Already delete button is hidden
      if (selectionMode == "query") {
          this.showInformationToast(
              "Cannot perform delete based on 'All Search Criteria', select the entities manually to perform this operation."
          );
          return;
      }

      if (this.contextData) {
          const sharedData = {
              "selection-query": selectionQuery,
              "selection-mode": selectionMode,
              "selected-entities": selectedItems
          };

          this.openBusinessFunctionDialog({
              name: this._deleteComponentName
          }, sharedData);
      } else {
          this.showInformationToast("Context not available, cannot perform delete operation.");
      }
  }
  _onGetDownloadUrlResponse(e) {
      LiquidResponseHelper.downloadURLResponseMapper(e, downloadURL => {
          window.open(downloadURL, "_blank");
      });
  }
  _onUpload() {
      this.openBusinessFunctionDialog({
          name: 'rock-entity-upload'
      });
  }
  _onDownload(e, detail) {
      let selectedItems = this.getSelectedItems();
      let selectionMode = this.getSelectionMode();
      let selectionQuery = this.getSelectedItemsAsQuery();

      if (selectedItems && selectedItems.length && this.contextData) {
          let selectedItemsCount = selectionMode == "query" ? this.totalCount : selectedItems.length;

          const sharedData = {
              "selection-query": selectionQuery,
              "selection-mode": selectionMode,
              "selected-entities": selectedItems,
              "selected-items-count": selectedItemsCount
          };

          this.openBusinessFunctionDialog({
              name: 'rock-entity-download'
          }, sharedData);
      } else {
          this.showInformationToast("Select at least one entity from grid to download.");
      }
  }
  /**
   * <b><i>Content development is under progress... </b></i> 
   */
  getSelectedItems() {
      return this._getEntityGrid().getSelectedItems();
  }
  getSelectedItemsAsQuery() {
      return this._getEntityGrid().getSelectedItemsAsQuery();
  }
  getSelectionMode() {
      return this._getEntityGrid().getSelectionMode();
  }
  _onBulkEdit(e, detail) {
      let selectedItems = this.getSelectedItems();
      let selectionMode = this.getSelectionMode();
      let selectionQuery = this.getSelectedItemsAsQuery();
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
              name: 'rock-entity-bulk-edit',
              configName: 'wizardConfig'
          }, sharedData);
      } else {
          this.showInformationToast("Select at least one entity from grid to edit.");
      }
  }
}
customElements.define(RockAssetsSearchGrid.is, RockAssetsSearchGrid);
