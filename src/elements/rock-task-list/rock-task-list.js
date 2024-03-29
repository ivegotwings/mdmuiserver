/**
`<rock-task-list>`
<b><i>Content development is under progress... </b></i>

@group rock Elements
@element rock-task-list
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
import '../bedrock-helpers/format-helper.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-flex-layout.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import '../bedrock-style-manager/styles/bedrock-style-gridsystem.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-button/pebble-button.js';
import '../pebble-popover/pebble-popover.js';
import '../pebble-dropdown/pebble-dropdown.js';
import '../pebble-toggle-button/pebble-toggle-button.js';
import '../rock-search-bar/rock-search-bar.js';
import '../rock-grid/rock-grid.js';
import './event-list-datasource.js';
import '../rock-component-config-behavior/rock-component-config-behavior.js';
import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockTaskList extends mixinBehaviors([RUFBehaviors.UIBehavior, RUFBehaviors.ComponentConfigBehavior],
    OptionalMutableData(PolymerElement)) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-gridsystem bedrock-style-grid-layout bedrock-style-icons bedrock-style-flex-layout">
            #stateButton {
                margin-left: 10px;
            }

            pebble-toggle-button {
                padding-top: 15px;
                --pebble-toggle-button-checked-bar-color: var(--success-color, #4caf50);
                --pebble-toggle-button-checked-button-color: var(--success-color, #4caf50);
                --pebble-toggle-button-checked-ink-color: var(--success-color, #4caf50);
            }

            .alignRight {
                margin-left: auto;
            }

            :host {
                display: block;
                height: 100%;
            }

            rock-grid {
                --pebble-grid-container: {
                    margin-top: 0;
                    margin-left: 0;
                    margin-right: 0;
                    margin-bottom: 0;
                }
            }

            /* Search */

            .resetsearch {
                position: absolute;
                right: 0;
                bottom: -14px;
                font-size: var(--font-size-xs, 10px);
                color: var(--link-text-color, #036Bc3);
            }

            .resetsearch pebble-button {
                height: auto;
                --pebble-button: {
                    font-size: var(--font-size-xs, 10px) !important;
                    height: auto;
                    padding-bottom: 0;
                }
                --pebble-icon-color: {
                    fill: var(--palette-deep-sea-blue, #034c89);
                }
                --pebble-icon-dimension: {
                    width: 12px;
                    height: 12px;
                }
                --pebble-button-left-icon: {
                    margin-right: 5px;
                }
            }

            .search-container {
                position: relative;
                display: block;
                width: 100%;
            }

            /*IE edge specific fix for refresh icon for task-list*/

            _:-ms-lang(x),
            _:-webkit-full-screen {
                vertical-align: top;
            }

            .refreshbutton {
                vertical-align: middle;
            }

            .flex-container {
                display: -ms-flexbox;
                display: -webkit-flex;
                display: flex;
            }

            .flex-container>div {
                padding: 5px;
                flex-grow: 1;
            }

            .flex-container>div.item-text-right {
                flex-shrink: 0;
                flex-grow: 0;
                align-self: center;
            }
        </style>
        <div class="base-grid-structure">
            <div class="base-grid-structure-child-1">
                <div class="search-container">
                    <rock-search-bar id="searchBar" placeholder="Enter Search text"></rock-search-bar>
                    <div class="resetsearch">
                        <pebble-button icon="pebble-icon:reset" class="btn-link pebble-icon-color-blue" on-tap="_resetSearch" button-text="Reset Search"></pebble-button>
                    </div>
                    <bedrock-pubsub event-name="rock-search" handler="_onSearch" target-id="searchBar"></bedrock-pubsub>
                    <bedrock-pubsub event-name="rock-search-update" handler="_showResetSearch" target-id="searchBar"></bedrock-pubsub>
                </div>
            </div>
            <div class="base-grid-structure-child-2">
                <template is="dom-if" if="[[_load]]">
                    <div class="base-grid-structure">
                        <div class="base-grid-structure-child-1">
                            <div class="flex-container">
                                <template is="dom-if" if="{{isGenericTasklist(taskType)}}">
                                    <div class="item">
                                        <pebble-dropdown class="dropdown" label="Type" items="[[eventTypes]]" selected-index="{{selectedIndexEventType}}" selected-value="{{selectedEventType}}"></pebble-dropdown>
                                    </div>
                                </template>
                                <div class="item">
                                    <pebble-dropdown class="dropdown" label="Status" items="[[eventSubTypes]]" selected-index="{{selectedIndexEventSubType}}" selected-value="{{selectedEventSubType}}"></pebble-dropdown>
                                </div>
                                <!-- Adding another dropdown for filtering -->

                                <div class="item">
                                    <template is="dom-if" if="{{durationFilterVisibility}}">
                                        <pebble-dropdown class="dropdown" label="Show Tasks From Last" items="[[durationFilters]]" selected-index="{{selectedIndexDurationFilter}}" selected-value="{{selectedDurationFilter}}"></pebble-dropdown>
                                    </template>
                                </div>

                                <div class="item-text-right">
                                    <template is="dom-if" if="[[userToggleAllowed]]">
                                        <pebble-toggle-button checked="{{!getAllUsersEvents}}">Show Only My Tasks</pebble-toggle-button>
                                    </template>
                                </div>
                            </div>
                        </div>
                        <div class="base-grid-structure-child-2">
                            <template is="dom-if" if="{{_noBatchDataPresent}}">
                                <div class="msg default-message"> {{noBatchDataMessage}}</div>
                            </template>
                            <template is="dom-if" if="{{!_noBatchDataPresent}}">
                                <rock-grid id="importlistGrid" no-header="" config="{{gridConfig}}" page-size="50" r-data-source="{{dataSource}}" data-source-id="eventDataSource"></rock-grid>
                            </template>
                        </div>
                    </div>
                </template>
            </div>
        </div>
        <bedrock-pubsub event-name="refresh-tasklist" handler="_refreshList"></bedrock-pubsub>
        <bedrock-pubsub event-name="batch-task-msg-handler" handler="_handleBatchData"></bedrock-pubsub>
        <event-list-datasource id="eventDataSource" request="[[request]]" event-list-data-source="{{dataSource}}" grid-data-formatter="{{_dataFormatter}}">
        </event-list-datasource>
`;
  }

  static get is() {
      return "rock-task-list";
  }
  static get properties() {
      return {
          /**
           * <b><i>Content development is under progress... </b></i> 
           */
          eventSubTypes: {
              type: Array,
              value: [{
                      "value": "ALL",
                      "title": "All"
                  },
                  {
                      "value": "QUEUED",
                      "title": "Queued"
                  },
                  {
                      "value": "PROCESSING",
                      "title": "Processing"
                  },
                  {
                      "value": "COMPLETED",
                      "title": "Completed"
                  },
                  {
                      "value": "ERRORED",
                      "title": "Errored"
                  }
              ]
          },

          durationFilters: {
              type: Array,
              value: []
          },
          durationFilterVisibility: {
              type: Boolean,
              value: true
          },
          /**
           * <b><i>Content development is under progress... </b></i> 
           */
          eventTypes: {
              type: Array,
              value: [{
                      "value": "ASSET_IMPORT_RECORD",
                      "title": "Asset Uploads"
                  },
                  {
                      "value": "BULK_EDIT",
                      "title": "Bulk Create/Edit"
                  },
                  {
                      "value": "BULK_ENTITY_DELETE",
                      "title": "Bulk Entity Delete"
                  },
                  {
                      "value": "WORKFLOW_TRANSITION",
                      "title": "Bulk Workflow Transitions"
                  },
                  {
                      "value": "WORKFLOW_ASSIGNMENT",
                      "title": "Bulk Workflow Assignments"
                  },
                  {
                      "value": "USER_ENTITY_IMPORT",
                      "title": "Entity Data Imports"
                  },
                  {
                      "value": "USER_ENTITY_EXPORT",
                      "title": "Entity Data Exports"
                  },
                  {
                      "value": "SYSTEM_ENTITY_IMPORT",
                      "title": "System Integrations - Entity Data Imports"
                  },
                  {
                      "value": "SYSTEM_ENTITY_EXPORT",
                      "title": "System Integrations - Entity Data Exports"
                  },
                  {
                      "value": "MODEL_IMPORT",
                      "title": "Model Imports"
                  },
                  {
                      "value": "MODEL_EXPORT",
                      "title": "Model Exports"
                  }
              ]
          },
          eventSubTypeMap: {
              type: Object,
              value: {
                  'QUEUED': ['QUEUED', 'QUEUED_SUCCESS', 'PROCESSING_STARTED'],
                  'PROCESSING': ['SUBMITTED', 'PROCESSING_COMPLETED',
                      "PROCESSING_COMPLETE_WITH_WARNING"
                  ],
                  'ERRORED': ['PROCESSING_ERROR', 'ABORTED', 'SUBMISSION_ERROR', 'QUEUED_ERROR',
                      "PROCESSING_START_ERROR",
                      "PROCESSING_COMPLETE_ERROR", "PROCESSING_SUBMISSION_ERROR", "FAILED"
                  ]
              }
          },
          /**
           * <b><i>Content development is under progress... </b></i> 
           */
          descending: {
              type: Boolean,
              value: false
          },
          /**
           * <b><i>Content development is under progress... </b></i> 
           */
          sortCondition: {
              type: String,
              observer: '_sortConditionChanged'
          },
          /**
           * <b><i>Content development is under progress... </b></i> 
           */
          sortingAttributes: {
              type: String,
              value: "Name,File Type,Status,Last Modified Date,Success Count, Failure Count "
          },
          /**
           * <b><i>Content development is under progress... </b></i> 
           */
          getAllUsersEvents: {
              type: Boolean,
              value: false,
              observer: '_userStateChanged'
          },
          /**
           * <b><i>Content development is under progress... </b></i> 
           */
          config: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          _load: {
              type: Boolean,
              value: false
          },

          gridConfig: {
              type: Object,
              value: function () {
                  return {};
              }
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
          contextData: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          noBatchDataMessage: {
              type: String,
              value: ""
          },
          _noBatchDataPresent: {
              type: Boolean,
              value: false
          },
          /**
           * <b><i>Content development is under progress... </b></i> 
           */
          selectedEventType: {
              type: String,
              value: "USER_ENTITY_IMPORT",
              observer: "_onEventTypeFilterChanged"
          },
          /**
           * <b><i>Content development is under progress... </b></i> 
           */
          selectedEventSubType: {
              type: String,
              value: "ALL",
              observer: "_onEventSubTypeFilterChanged"
          },
          selectedDurationFilter: {
              type: Number,
              value: -1,
              observer: "_onDurationFilterChanged"
          },
          selectedIndexDurationFilter: {
              type: Number,
              value: -1
          },
          selectedIndexEventSubType: {
              type: Number,
              value: 0
          },
          selectedIndexEventType: {
              type: Number,
              value: 5
          },
          /**
           * <b><i>Content development is under progress... </b></i> 
           */
          userToggleAllowed: {
              type: Boolean,
              computed: '_setUserToggleAllowed(config)'
          },
          _resetSearchEnabled: {
              type: Boolean,
              value: false
          },
          taskType: {
              type: String,
              value: "",
              observer: '_onChangeTaskType'
          },
          modelTaskTypes: {
              type: Array,
              value: function () {
                  return [
                      "UI_BaseDataModel",
                      "UI_InstanceDataModel",
                      "UI_GovernanceModel",
                      "UI_AuthorizationAppModel",
                      "UI_TaxonomyAppModel",
                      "UI_WorkflowAppModel"
                  ]
              }
          },
          modelEventSettings: {
              type: Object,
              value: function () {
                  return {
                      "eventTypes": [{
                              "value": "MODEL_IMPORT",
                              "title": "Model Imports"
                          },
                          {
                              "value": "MODEL_EXPORT",
                              "title": "Model Exports"
                          }
                      ],
                      "selectedIndexEventType": 0,
                      "selectedEventType": "MODEL_IMPORT"
                  }
              }
          }
      }
  }
  static get observers() {
      return [
          '_contextDataChanged(contextData)'
      ]
  }
  ready() {
      super.ready();
      this._dataFormatter = this._getEventFormattedData.bind(this);
      this._loadEventSettings();
  }
  _loadEventSettings() {
      if (this.taskType && this.modelTaskTypes.indexOf(this.taskType) != -1) {
          this.eventTypes = this.modelEventSettings.eventTypes
          this.selectedIndexEventType = this.modelEventSettings.selectedIndexEventType;
          this.selectedEventType = this.modelEventSettings.selectedEventType;
      }
  }
  isGenericTasklist(taskType) {
      if (taskType && this.modelTaskTypes.indexOf(this.taskType) == -1) {
          return false;
      }

      return true;
  }
  _onChangeTaskType(taskType) {
      if (taskType) {
          this.set("selectedEventType", taskType);
      }
  }

  _contextDataChanged(contextData) {
      afterNextRender(this, () => {
          if (!_.isEmpty(contextData)) {
              let context = DataHelper.cloneObject(this.contextData);
              //App specific
              let appName = ComponentHelper.getCurrentActiveAppName();
              if (appName) {
                  context[ContextHelper.CONTEXT_TYPE_APP] = [{
                      "app": appName
                  }];
              }
              this.requestConfig('rock-task-list', context);
          }
      });
  }
  onConfigLoaded(componentConfig) {
      if (componentConfig.config.gridConfig.itemConfig.fields.durationFilter) {
          this.durationFilterVisibility = true;
          this._setDurationFilterData(componentConfig.config.gridConfig.itemConfig.fields.durationFilter);
      } else {
          console.error("Duration Filter Configs Not found");
          this.durationFilterVisibility = false;
      }
      if (componentConfig && componentConfig.config) {
          this.config = componentConfig.config;
          this._setEventRequest();
      }
  }
  _setDurationFilterData(durationFilter) {
      this.selectedDurationFilter = durationFilter.defaultDurationVal;
      let durationFilters = [];
      for (let durationFilterArrIndex = 0; durationFilterArrIndex < durationFilter.values.length; durationFilterArrIndex++) {
          let dropdownObj = {
              "value": durationFilter.values[durationFilterArrIndex],
              "title": durationFilter.values[durationFilterArrIndex] + ' days'
          }
          durationFilters.push(dropdownObj);
      }
      this.durationFilters = durationFilters;
  }
  _setUserToggleAllowed(config) {
      return !!config.userToggleAllowed;
  }
  _setUserDefaultJobStatus(config) {
      return config.defaultJobStatus;
  }
  _setEventRequest() {

      let defaultLocale = DataHelper.getDefaultLocale();
      let defaultSource = DataHelper.getDefaultSource();

      let contextData = DataHelper.cloneObject(this.contextData);
      let itemContext = {
          "type": "externalevent"
      };
      contextData[ContextHelper.CONTEXT_TYPE_ITEM] = [itemContext];
      let req = DataRequestHelper.createEntityGetRequest(contextData);
      req.params.query.valueContexts = [{
          "source": defaultSource,
          "locale": defaultLocale
      }];
      let propertiesCriterion = [];
      this._addDurationFilter(propertiesCriterion);
      req.params.query.filters.propertiesCriterion = propertiesCriterion;

      let attributesCriteria = [];
      this._addEventTypeCriterion(attributesCriteria);
      this._addEventSubTypeCriterion(attributesCriteria);
      this._addTaskTypeCriterion(attributesCriteria);
      this._addIntegrationTypeCriterion(attributesCriteria);

      req.params.query.filters.attributesCriterion = attributesCriteria;
      if (this.config.dataRequest && this.config.dataRequest.attributes) {
          req.params.fields.attributes = this.config.dataRequest.attributes;
      } else {
          req.params.fields.attributes = ["_ALL"];
      }

      if (!this.getAllUsersEvents) {
          req.params.query.filters.attributesCriterion.push({
              "userId": {
                  "eq": this.userId
              }
          });
      }

      //Fetch the tasks which parentTaskId has no value
      req.params.query.filters.attributesCriterion.push({
          "parentTaskId": {
              "hasvalue": false
          }
      });

      req.params.sort = {
          "attributes": [{
              "createdOn": "_DESC",
              "sortType": "_DATETIME"
          }]
      };

      req.params.isTaskListGetRequest = true;

      //Task summarization processor temp changes...
      if (this.selectedEventType != "ASSET_IMPORT_RECORD") {
          req.params.fields.attributes.push("isSummaryFromTaskProcessor");
      }
      this._load = true;
      this.set("request", req);
      this.set("gridConfig", this.config.gridConfig);
  }

  _reloadListData() {
      this.shadowRoot.querySelector("#importlistGrid").reloadListData();
  }
  _addEventTypeCriterion(attributesCriterion) {
      if (this.selectedEventType) {
          let eventTypeCriterion;
          switch (this.selectedEventType) {
              case "USER_ENTITY_IMPORT":
              case "SYSTEM_ENTITY_IMPORT":
                  eventTypeCriterion = {
                      "eventType": {
                          "contains": "BATCH_COLLECT_ENTITY_IMPORT BATCH_TRANSFORM_ENTITY_IMPORT"
                      }
                  }
                  break;
              case "USER_ENTITY_EXPORT":
              case "SYSTEM_ENTITY_EXPORT":
                  eventTypeCriterion = {
                      "eventType": {
                          "contains": "BATCH_COLLECT_ENTITY_EXPORT BATCH_TRANSFORM_ENTITY_EXPORT"
                      }
                  }
                  break;
              case "BULK_EDIT":
              case "WORKFLOW_TRANSITION":
              case "WORKFLOW_ASSIGNMENT":
                  eventTypeCriterion = {
                      "eventType": {
                          "contains": "INBOUND EXTRACT"
                      }
                  }
                  break;
              default:
                  eventTypeCriterion = {
                      "eventType": {
                          "eq": this.selectedEventType
                      }
                  }
          }

          attributesCriterion.push(eventTypeCriterion);
      }
  }
  _addEventSubTypeCriterion(attributesCriterion) {
      if (this.selectedEventSubType && this.selectedEventSubType != "ALL") {
          let eventSubTypeCriterion = {
              "eventSubType": {
                  "eq": this.selectedEventSubType
              }
          };

          attributesCriterion.push(eventSubTypeCriterion);
      }
  }
  _addDurationFilter(propertiesCriterion) {
      if (this.selectedDurationFilter) {
          let daysStr = this.selectedDurationFilter;
          let daysInt = parseInt(daysStr);
          //Logic to get the current date and subtract the filter days and sed to request
          let today = moment();
          let filterDate = today.subtract(daysInt, "days");
          filterDate = filterDate.format('YYYY-MM-DDTHH:mm:ss.SSS-0500');
          let createdDate = {
              "createdDate": {
                  "gte": filterDate,
                  "type": "_datetime"
              }
          }
          propertiesCriterion.push(createdDate);
      }
  }
  _addTaskTypeCriterion(attributesCriterion) {
      if (this.selectedEventType) {
          let taskTypeCriterion;
          switch (this.selectedEventType) {
              case "USER_ENTITY_IMPORT":
              case "SYSTEM_ENTITY_IMPORT":
                  taskTypeCriterion = {
                      "taskType": {
                          "contains": "entity_import"
                      }
                  };
                  break;
              case "USER_ENTITY_EXPORT":
              case "SYSTEM_ENTITY_EXPORT":
                  taskTypeCriterion = {
                      "taskType": {
                          "contains": "entity_export"
                      }
                  };
                  break;
              case "BULK_EDIT":
                  taskTypeCriterion = {
                      "taskType": {
                          "exacts": ["process", "process-query", "process-multi-query",
                              "createVariants"
                          ]
                      }
                  }
                  break;
              case "BULK_ENTITY_DELETE":
                  taskTypeCriterion = {
                      "taskType": {
                          "contains": "delete*"
                      }
                  };
                  break;
              case "WORKFLOW_TRANSITION":
                  taskTypeCriterion = {
                      "taskType": {
                          "contains": "transitionWorkflow*"
                      }
                  };
                  break;
              case "WORKFLOW_ASSIGNMENT":
                  taskTypeCriterion = {
                      "taskType": {
                          "contains": "changeAssignment*"
                      }
                  };
                  break;
              case "MODEL_IMPORT":
                  taskTypeCriterion = {
                      "taskType": {
                          "contains": this.taskType ||
                              "UI_BaseDataModel UI_InstanceDataModel UI_GovernanceModel UI_AuthorizationAppModel UI_WorkflowAppModel loadtenantseed",
                          "operator": "_OR"
                      }
                  };
                  break;
              case "MODEL_EXPORT":
                  taskTypeCriterion = {
                      "taskType": {
                          "contains": this.taskType ? this.taskType + "_Export" : "UI_BaseDataModel_Export  UI_InstanceDataModel_Export UI_GovernanceModel_Export UI_AuthorizationAppModel_Export UI_WorkflowAppModel_Export",
                          "operator": "_OR"
                      }
                  };
                  break;
              case "ASSET_IMPORT_RECORD":
                  //DO NOT ADD TASK TYPE FOR ASSET IMPORT RECORDS..
                  //ASSET IMPORT RECORD GET IS STILL BY EVENTS.
                  break;
              default:
                  taskTypeCriterion = {
                      "taskType": {
                          "contains": this.selectedEventType
                      }
                  }
          }

          if (taskTypeCriterion) {
              attributesCriterion.push(taskTypeCriterion);
          }
      }
  }
  _addIntegrationTypeCriterion(attributesCriterion) {
      if (this.selectedEventType) {
          let integrationTypeCriterion;
          if (this.selectedEventType == "USER_ENTITY_IMPORT" || this.selectedEventType ==
              "USER_ENTITY_EXPORT") {
              integrationTypeCriterion = {
                  "integrationType": {
                      "eq": "User"
                  }
              };
          } else if (this.selectedEventType == "SYSTEM_ENTITY_IMPORT" || this.selectedEventType ==
              "SYSTEM_ENTITY_EXPORT") {
              integrationTypeCriterion = {
                  "integrationType": {
                      "eq": "System"
                  }
              };
          }

          if (integrationTypeCriterion) {
              attributesCriterion.push(integrationTypeCriterion);
          }
      }
  }
  _getEventFormattedData(data) {
      let attributeNames = this._getAttributeNamesFromListConfig(this.config.gridConfig);
      let events = [];

      if (data && data.content) {
          events = data.content.events;
          if (events) {
              events = DataTransformHelper.transformEntitiesToSimpleSchema(events,attributeNames, this.contextData);
          }
      }

      for (let i = 0; i < events.length; i++) {
          let event = events[i];
          if (event.eventSubType) {
              event.eventSubType = this._getExternalEventSubType(event.eventSubType.toUpperCase());
          }
          let eventTypeCode = event.eventType;
          let eventSubTypeCode = event.eventSubType;

          if (this.selectedEventType == "WORKFLOW_TRANSITION" || this.selectedEventType ==
              "WORKFLOW_ASSIGNMENT" ||
              this.selectedEventType == "BULK_EDIT" || this.selectedEventType == "BULK_ENTITY_DELETE"
          ) {
              event.fileName = event.taskName ? event.taskName : event.taskId; //Title of the task in list view
              delete event.taskName;
          }

          event.fileTypeImage = this._getIconPath(event.formatter);
          event.createdOn = FormatHelper.convertFromISODateTimeToClientFormat(event.createdOn, 'datetime');

          if (event.userId) {
              event.userId = event.userId.replace("_user", "");
          } else {
              event.userId = "Unknown user";
          }

          if (!(eventTypeCode == "ASSET_IMPORT_RECORD" || eventSubTypeCode == "QUEUED")) {
              if (event.recordCount && event.recordCount > 0) {
                  //let appendPlus = event.hasChildTasks && !event.isExtractComplete ? "+" : "";
                  event.recordCount = "Total " + event.recordCount +
                      " record(s) submitted"
              } else {
                  event.recordCount = "Record count is unavailable";
              }

              event.viewDetails = "View Details"
          } else if (eventTypeCode == "ASSET_IMPORT_RECORD") {
              event.recordCount = "Total 1 record(s) submitted";
              event.disableLink = true;
          } else {
              event.recordCount = "Record count is unavailable";
          }
      }

      return events;
  }
  _getAttributeNamesFromListConfig(config) {
      const {
          image,
          title,
          subtitle,
          extension,
          id,
          fields
      } = config.itemConfig;
      let attributeNames = [image, title, subtitle, extension, id];
      for (let key in fields) {
          if (!fields.hasOwnProperty(key)) continue;

          let field = fields[key];
          attributeNames.push(field.name);
      }

      if (attributeNames.indexOf("eventType") < 0) {
          attributeNames.push("eventType");
      }

      return attributeNames;
  }
  _getIconPath(formatter) {
      if (!formatter) {
          return "/src/images/image.svg";
      }

      switch (formatter.toLowerCase()) {
          case "seedload":
              return "/src/images/zip.svg";
          case "excel":
              return "/src/images/MicrosoftExcel50,100,500px/MicrosoftExcel_100.svg";
          case "rsjson":
              return "/src/images/json.svg";
          case "dsv":
              return "/src/images/dsv.svg";
          default:
              return "/src/images/MicrosoftExcel50,100,500px/MicrosoftExcel_100.svg";
      }
  }
  _onEventTypeFilterChanged(selectedEventType) {
      if (this.request && !_.isEmpty(this.request) && selectedEventType) {
        this._noBatchDataPresent=false;
          //Filtering only values from {value, titles} array elements
          let eventTypesValues = this.eventTypes.map((elm, index) => {
              return elm.value;
          });
          //Setting the Selected Index to trigger an observable change at pebble-boolean (_selectedIndexChanged)
          this.set('selectedIndexEventType', eventTypesValues.indexOf(selectedEventType));
          let req = this.request;

          let attributesCriteria = req.params.query.filters.attributesCriterion;

          for (let i in attributesCriteria) {
              if (attributesCriteria[i].eventType) {
                  attributesCriteria.splice(i, 1);
                  break;
              }
          }

          for (let i in attributesCriteria) {
              if (attributesCriteria[i].taskType) {
                  attributesCriteria.splice(i, 1);
                  break;
              }
          }

          for (let i in attributesCriteria) {
              if (attributesCriteria[i].integrationType) {
                  attributesCriteria.splice(i, 1);
                  break;
              }
          }

          this._addEventTypeCriterion(attributesCriteria);
          this._addTaskTypeCriterion(attributesCriteria);
          this._addIntegrationTypeCriterion(attributesCriteria);

          //Task summarization processor temp changes...
          let attributes = req.params.fields.attributes;
          let index = attributes.indexOf("isSummaryFromTaskProcessor");
          if (index >= 0) {
              attributes.splice(index, 1);
          }

          if (this.selectedEventType != "ASSET_IMPORT_RECORD") {
              attributes.push("isSummaryFromTaskProcessor");
          }

          this._reloadListData();
      }
  }
  _onEventSubTypeFilterChanged(selectedEventSubType) {
      if (this.request && !_.isEmpty(this.request) && selectedEventSubType) {
        this._noBatchDataPresent=false;
          //Filtering only values from {value, titles} array elements  
          let eventSubTypesValues = this.eventSubTypes.map((elm, index) => {
              return elm.value;
          });
          //Setting the Selected Index to trigger an observable change at pebble-boolean (_selectedIndexChanged)
          this.set('selectedIndexEventSubType', eventSubTypesValues.indexOf(selectedEventSubType));

          let req = this.request;
          let attributesCriteria = req.params.query.filters.attributesCriterion;

          for (let i in attributesCriteria) {
              if (attributesCriteria[i].eventSubType) {
                  attributesCriteria.splice(i, 1);
                  break;
              }
          }

          this._addEventSubTypeCriterion(attributesCriteria);

          this._reloadListData();
      }
  }
  _onDurationFilterChanged(selectedDurationFilter) {
      if (this.request && !_.isEmpty(this.request) && selectedDurationFilter) {
        this._noBatchDataPresent=false;
          //Filtering only values from {value, titles} array elements  
          let durationFilterValues = this.config.gridConfig.itemConfig.fields.durationFilter.values;
          let selectedIndexDurationFilter = durationFilterValues.indexOf(selectedDurationFilter);
          //Setting the Selected Index to trigger an observable change at pebble-boolean (_selectedIndexChanged)
          this.set('selectedIndexDurationFilter', selectedIndexDurationFilter);
          let req = this.request;
          let propertiesCriterion = req.params.query.filters.propertiesCriterion;

          for (let i in propertiesCriterion) {
              if (propertiesCriterion[i].createdDate) {
                  propertiesCriterion.splice(i, 1);
                  break;
              }
          }

          this._addDurationFilter(propertiesCriterion);

          this._reloadListData();
      }
  }
  _onSearch(e, detail) {
      if (this.request && !_.isEmpty(this.request)) {
          let req = this.request;
          if (detail) {
              let query = detail.query;
              req.params.query.filters.keywordsCriterion = DataHelper.getSearchCriteria(query);
          } else {
              delete req.params.query.filters.keywordsCriterion;
          }

          this._reloadListData();
      }
  }
  _userStateChanged(getAllUsersEvents) {
      if (this.request && !_.isEmpty(this.request)) {
        this._noBatchDataPresent=false;
          let req = this.request;
          if (!getAllUsersEvents) {
              req.params.query.filters.attributesCriterion.push({
                  "userId": {
                      "eq": this.userId
                  }
              });
          } else {
              let attributesCriteria = req.params.query.filters.attributesCriterion;
              for (let i in attributesCriteria) {
                  if (attributesCriteria[i].userId) {
                      attributesCriteria.splice(i, 1);
                      break;
                  }
              }
          }

          this._reloadListData();
      }
  }
  _sortByDesecnding() {
      this.descending = true;
  }
  _sortByAsecnding() {
      this.descending = false;
  }
  _sortConditionChanged(sortCondition) {
      if (this.request) {

          if (sortCondition) {
              let req = this.request;
              if (this.descending) {
                  alert(sortCondition)
              } else {
                  alert(sortCondition)
              }
          }

          this._reloadListData();
      }
  }
  _refreshList() {
      this.shadowRoot.querySelector("#eventDataSource").resetDataSource();
      this._reloadListData();
  }

  _handleBatchData(e) {
      if (e.detail.eventType == "noData") {
          this.noBatchDataMessage = e.detail.msg;
          this._noBatchDataPresent = true;
      } else if (e.detail.eventType == "data") {
          this._noBatchDataPresent = false;
      } else if (e.detail.eventType == "apiFailed") {
          this._noBatchDataPresent = true;
          this.noBatchDataMessage = e.detail.msg;
      }

  }
  _getExternalEventSubType(internalEventSubType) {
      let eventSubFilterMap = this.eventSubTypeMap;

      for (let key in eventSubFilterMap) {
          let eventSubTypeFilters = eventSubFilterMap[key];

          if (eventSubTypeFilters.indexOf(internalEventSubType) > -1) {
              return key;
          }
      }

      return internalEventSubType;
  }
  _resetSearch() {
      if (this.request && !_.isEmpty(this.request)) {

          let rockSearchBar = this.shadowRoot.querySelector('#searchBar');
          if (rockSearchBar) {
              rockSearchBar.searchText = "";
              rockSearchBar.query = "";

              //reseting filters to defaults
              if (this.config.gridConfig.itemConfig.fields.durationFilter) {
                  let defaultFilter = this.config.gridConfig.itemConfig.fields.durationFilter;
                  this.set('selectedDurationFilter', defaultFilter.defaultDurationVal);
                  this.set('selectedEventSubType', 'ALL');
                  this.set('selectedEventType', 'USER_ENTITY_IMPORT');
              } else {
                  this.logError("Configs Not found", this.config);
              }

          }

          let req = this.request;
          delete req.params.query.filters.keywordsCriterion;
          this._reloadListData();

          this._resetSearchEnabled = false;
      }
  }
  _showResetSearch(e) {
      let rockSearchBar = this.shadowRoot.querySelector('#searchBar');
      let query = '';

      if (rockSearchBar) {
          query = rockSearchBar.query;
      }

      if (!_.isEmpty(query)) {
          this._resetSearchEnabled = true;
      } else {
          this._resetSearchEnabled = false;
      }
  }
}
customElements.define(RockTaskList.is, RockTaskList);
