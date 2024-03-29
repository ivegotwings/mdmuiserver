/**
`<rock-task-error-grid>`
<b><i>Content development is under progress... </b></i>
@group rock Elements
@element rock-task-error-grid
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../pebble-spinner/pebble-spinner.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-button/pebble-button.js';
import '../pebble-popover/pebble-popover.js';
import '../pebble-lov/pebble-lov.js';
import '../rock-search-bar/rock-search-bar.js';
import '../rock-grid/rock-grid.js';
import '../rock-entity-search-filter/rock-entity-search-filter.js';
import './task-error-grid-datasource.js';
import '../rock-component-config-behavior/rock-component-config-behavior.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockTaskErrorGrid extends mixinBehaviors([RUFBehaviors.UIBehavior, RUFBehaviors.ComponentConfigBehavior],
    OptionalMutableData(PolymerElement)) {
  static get template() {
    return html`
        <style include="bedrock-style-common">
            :host {
                display: block;
                height: 100%;
            }
        </style>
        <pebble-spinner active="[[_loading]]"></pebble-spinner>
        <task-error-grid-datasource id="errorGridDataSource" request="{{request}}" r-data-source="{{rDataSource}}" r-data-formatter="{{rDataFormatter}}" buffer-record-size="{{size}}" current-record-size="{{currentRecordSize}}" result-record-size="{{resultRecordSize}}" total-count="{{totalCount}}">
        </task-error-grid-datasource>
        <rock-grid id="errorGrid" selection-enabled="" context-data="[[contextData]]" r-data-source="{{rDataSource}}" r-data-source-id="errorGridDataSource" config="[[gridConfig]]" current-record-size="{{currentRecordSize}}" result-record-size="{{resultRecordSize}}" grid-data-size="{{size}}" page-size="50" selected-item="{{selectedEntity}}" total-count="{{totalCount}}" max-configured-count="[[maxConfiguredCount]]">
        </rock-grid>
        <bedrock-pubsub event-name="grid-selecting-item" handler="_onSelectingGridItem" target-id="errorGrid"></bedrock-pubsub>
        <bedrock-pubsub event-name="grid-download-item" handler="_onDownload" target-id="errorGrid"></bedrock-pubsub>
`;
  }

  static get is() {
      return "rock-task-error-grid";
  }
  static get properties() {
      return {
          /**
           * <b><i>Content development is under progress... </b></i> 
           */
          taskId: {
              type: String,
              value: ""
          },
          /**
           * <b><i>Content development is under progress... </b></i> 
           */
          selectedErrorRecord: {
              type: Object,
              value: function () {
                  return {};
              },
              notify: true
          },
          /**
           * <b><i>Content development is under progress... </b></i> 
           */
          request: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          /**
           * <b><i>Content development is under progress... </b></i> 
           */
          gridConfig: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          /**
           * <b><i>Content development is under progress... </b></i> 
           */
          currentRecordSize: {
              type: Number,
              notify: true
          },
          contextData: {
              type: Object,
              value: function () {
                  return {};
              },
              observer: '_onContextDataChange'
          },
          rDataFormatter: {
              type: Object,
              notify: true,
              value: function () {
                  return this._formatErrorEvents.bind(this);
              }
          },

          _taskErrorConfig: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          isParentTask : {
              type: Boolean,
              value: false
          }
      }
  }
  static get observers() {
      return [
          '_gridConfigChanged(_taskErrorConfig, contextData, taskId)'
      ]
  }
  _onContextDataChange() {
      if (!_.isEmpty(this.contextData)) {
          let context = DataHelper.cloneObject(this.contextData);
          //App specific
          let appName = ComponentHelper.getCurrentActiveAppName();
          if (appName) {
              context[ContextHelper.CONTEXT_TYPE_APP] = [{
                  "app": appName
              }];
          }
          this.requestConfig('rock-task-error-list', context);
      }
  }
  onConfigLoaded(componentConfig) {
      if (componentConfig && componentConfig.config) {
          this.gridConfig = componentConfig.config.gridConfig;
          this._taskErrorConfig = componentConfig.config;
      }
  }
  _gridConfigChanged(_taskErrorConfig, contextData, taskId) {
      if (!taskId || _.isEmpty(_taskErrorConfig) || _.isEmpty(contextData)) {
          return;
      }
      let attributes = [];

      if (_taskErrorConfig.dataRequest) {
          attributes = _taskErrorConfig.dataRequest.attributes;
      }

      let clonedContextData = DataHelper.cloneObject(contextData);
      clonedContextData[ContextHelper.CONTEXT_TYPE_ITEM] = [{
          "type": ["externalevent", "bulkoperationevent"]
      }];
      let req = DataRequestHelper.createEntityGetRequest(clonedContextData);

      req.params.fields.attributes = attributes;
      this._attributes = attributes;

      let defaultLocale = DataHelper.getDefaultLocale();
      let defaultSource = DataHelper.getDefaultSource();
      req.params.query.valueContexts = [{
          "locale": defaultLocale,
          "source": defaultSource
      }];

      req.params.query.filters.attributesCriterion = [
          {
              "eventType": {
                  "contains": "WORK_AUTOMATION_ENTITY_IMPORT WORK_AUTOMATION_ENTITY_EXPORT WORK_AUTOMATION_ENTITY_MODEL_IMPORT WORK_AUTOMATION_ENTITY_MODEL_EXPORT BATCH_COLLECT_ENTITY_IMPORT BATCH_COLLECT_ENTITY_EXPORT BATCH_COLLECT_ENTITY_MODEL_IMPORT BATCH_COLLECT_ENTITY_MODEL_EXPORT BATCH_TRANSFORM_ENTITY_IMPORT BATCH_TRANSFORM_ENTITY_EXPORT BATCH_TRANSFORM_ENTITY_MODEL_IMPORT BATCH_TRANSFORM_ENTITY_MODEL_EXPORT BATCH_PUBLISH_ENTITY_EXPORT RECORD_TRANSFORM_ENTITY_IMPORT RECORD_TRANSFORM_ENTITY_EXPORT RECORD_TRANSFORM_ENTITY_MODEL_IMPORT RECORD_TRANSFORM_ENTITY_MODEL_EXPORT RECORD_PUBLISH_ENTITY_IMPORT RECORD_PUBLISH_ENTITY_EXPORT RECORD_PUBLISH_ENTITY_MODEL_IMPORT RECORD_PUBLISH_ENTITY_MODEL_EXPORT BATCH_PUBLISH_ENTITY_IMPORT CONNECTOR_PUBLISH_ENTITY_EXPORT LOAD EXCEL_TRANSFORMATION_ERROR"
              }
          },
          {
              "eventSubType": {
                  "contains": "QUEUED_ERROR PROCESSING_START_ERROR PROCESSING_ERROR PROCESSING_COMPLETE_ERROR EXCEL_ROW_ERROR"
              }
          }
      ];

      //Updated attributesCriterion as per isParentTask
      let task = {};
      task[this.isParentTask ? "parentTaskId" : "taskId"] = {
          "exact": this.taskId
      }
      req.params.query.filters.attributesCriterion.push(task);

      this.set('request', req);

      this._getErrorGrid().reRenderGrid();
  }
  _getErrorGrid() {
      return ElementHelper.getElement(this, "#errorGrid");
  }
  _onSelectingGridItem(e, detail, sender) {
      this.selectedErrorRecord = detail.item;
  }
  /**
   * <b><i>Content development is under progress... </b></i> 
   */
  getSelectedItemIndex() {
      return this._getErrorGrid().getSelectedItemIndex();
  }
  /**
   * <b><i>Content development is under progress... </b></i> 
   */
  notifyResize() {
      //this._getErrorGrid().notifyResize();
  }
  /**
   * <b><i>Content development is under progress... </b></i> 
   */
  scrollToIndex(index) {
      let _getEntityGrid = this._getEntityGrid();
      if (_getEntityGrid) {
          _getEntityGrid.scrollToIndex(index);
      }
  }
  /**
   *  Can be used to select an item.
   */
  selectItem(item) {
      this._getErrorGrid().selectItem(item);
  }

  /**
   * Can be used to get the grid data.
   */
  getData() {
      return this._getErrorGrid().getData();
  }
  _formatErrorEvents(data) {
      let formattedData = [];
      if (data && data.content) {
          let errorEvents = data.content.events;
          let contextData = DataHelper.cloneObject(this.contextData);
          if (errorEvents) {
              formattedData = DataTransformHelper.transformEntitiesToSimpleSchema(errorEvents,
                  this._attributes, contextData);
          }
      }

      return formattedData;
  }
  _onDownload(e) {
      // var rockGrid = Polymer.dom(this).node.shadowRoot.querySelector('rock-grid');
      // var selectedItems = rockGrid.getSelectedItems();
      // if (selectedItems && selectedItems.length && this.contextData) {
      //     this._loading = true;
      //     var clonedDataContext = DataHelper.cloneObject(this.contextData);
      //     var itemContext = {};
      //     itemContext.id = [];
      //     itemContext.type = [];

      //     selectedItems.forEach(function (item) {
      //         if (item) {
      //             itemContext.id.push(item.entityId);

      //             if (itemContext.type.indexOf(item.entityType) == -1) {
      //                 itemContext.type.push(item.entityType);
      //             }
      //         }
      //     }, this);

      //     itemContext.attributeNames = ["_ALL"];
      //     itemContext.relationships = ["_ALL"];
      //     itemContext.relationshipAttributes = ["_ALL"];
      //     clonedDataContext[ContextHelper.CONTEXT_TYPE_ITEM] = [itemContext];

      //     var req = DataRequestHelper.createEntityGetRequestForDownload(clonedDataContext, ["downloadDataExcel"]);

      //     if (req) {

      //         req.fileName = "EntityData";
      //         var _this = this;
      //         RUFUtilities.fileDownload("/data/cop/downloadDataExcel", {
      //             httpMethod: 'POST',
      //             data: { data: JSON.stringify(req) },
      //             successCallback: function (url) {
      //                 this._loading = false;
      //             }.bind(_this),
      //             failCallback: function (responseHtml, url, error) {
      //                 this._onCOPDownloadFailure(error);
      //             }.bind(_this)
      //         });

      //     }

      // } else {
      //     this.showInformationToast("Please select at least one error record from grid to download.");
      // }
  }
  // _onCOPDownloadFailure: function (e) {
  //     this.showErrorToast("Failed to download error data. Please contact administrator.");
  //     this._loading = false;
  // }
}
customElements.define(RockTaskErrorGrid.is, RockTaskErrorGrid);
