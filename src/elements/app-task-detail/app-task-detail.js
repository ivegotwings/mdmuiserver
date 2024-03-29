import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '@polymer/polymer/lib/utils/async.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-app-behavior/bedrock-app-behavior.js';
import '../bedrock-helpers/format-helper.js';
import '../bedrock-helpers/context-helper.js';
import EntityTypeManager from '../bedrock-managers/entity-type-manager.js';
import '../liquid-rest/liquid-rest.js';
import '../pebble-spinner/pebble-spinner.js';
import '../pebble-accordion/pebble-accordion.js';
import '../pebble-horizontal-divider/pebble-horizontal-divider.js';
import '../rock-layout/rock-layout.js';
import '../rock-layout/rock-titlebar/rock-titlebar.js';
import '../rock-layout/rock-header/rock-header.js';
import '../rock-task-summary/rock-task-summary.js';
import '../rock-task-error-grid/rock-task-error-grid.js';
import '../rock-entity-search-discovery/rock-entity-search-discovery.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-text-alignment.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class AppTaskDetail
    extends mixinBehaviors([
        RUFBehaviors.AppBehavior
    ], PolymerElement) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-grid-layout bedrock-style-text-alignment">
            :host {
                display: block;
                height: 100%;
            }

            .summary-container {
                padding: 10px 20px;
            }

            pebble-horizontal-divider {
                background-color: var(--palette-pale-grey-three, #e7ebf0);
            }

            .message-box {
                font-family: 'Roboto', Helvetica, Arial, sans-serif;
                font-size: var(--default-font-size, 14px);
                font-weight: normal;
                font-style: normal;
                font-stretch: normal;
                color: var(--palette-dark, #1a2028);
                opacity: 0.7;
            }
            pebble-accordion{
                height:auto;
            }

            .app-task-content-height {
                @apply --app-task-content-height;
            }
        </style>
        <rock-layout>
            <liquid-rest id="taskDetailsGet" url="/data/eventservice/getTaskDetails" method="POST" on-liquid-response="_onTaskDetailsGetResponse" on-liquid-error="_onTaskDetailsGetError"></liquid-rest>
            <pebble-spinner active="[[_loading]]"></pebble-spinner>
            <rock-titlebar slot="rock-titlebar" icon="pebble-icon:integration" main-title="[[_taskTitle]]" non-minimizable="[[appConfig.nonMinimizable]]" non-closable="[[appConfig.nonClosable]]">
            </rock-titlebar>

            <template is="dom-if" if="[[_isContextUpdateCompleted]]">
                <div class="base-grid-structure app-task-content-height">
                    <div class="summary-container base-grid-structure-child-1">
                        <!-- <template is="dom-if" if="[[_isTaskDetailsLoading]]"> -->
                        <pebble-accordion header-text="Summary &amp; Filters">
                            <div slot="accordion-content">
                                <rock-task-summary id="rockTaskSummary" context-data="[[contextData]]" task-details="[[_taskDetails]]" is-parent-task\$="[[_isParentTask]]"></rock-task-summary>
                            </div>
                        </pebble-accordion>
                        <!-- </template> -->
                        <pebble-horizontal-divider></pebble-horizontal-divider>
                    </div>
                    <div class="base-grid-structure-child-2">
                        <div class="base-grid-structure">
                            <div class="base-grid-structure-child-1">
                                <template is="dom-if" if="[[_showMessage]]">
                                    <div class="full-height">
                                        <div class="text-center">
                                            <div id="messagePanel" class="message-box">[[_message]]</div>
                                        </div>
                                    </div>
                                </template>
                            </div>
                            <div class="base-grid-structure-child-2">
                                <template is="dom-if" if="[[_loadCompletedTasks(_showCompletedTasks)]]">
                                    <div class="full-height">
                                        <rock-entity-search-discovery id="entitySearchDiscoveryGrid" context-data="[[contextData]]" entity-id-list="[[entityIdList]]" domain="[[domain]]" requested-entity-types="[[entityTypeList]]" allowed-entity-types="[[entityTypeList]]"></rock-entity-search-discovery>
                                    </div>
                                </template>
                                <template is="dom-if" if="[[_loadErrorTasks(_showErroredTasks)]]">
                                    <div class="full-height">
                                        <rock-task-error-grid id="jobEntityDetailGrid" task-id="[[taskId]]" context-data="[[contextData]]" is-parent-task\$="[[_isParentTask]]">
                                        </rock-task-error-grid>
                                    </div>
                                </template>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </rock-layout>
        <bedrock-pubsub event-name="show-inprogress" handler="_onInProgressClick" target-id="rockTaskSummary"></bedrock-pubsub>
        <bedrock-pubsub event-name="show-completed" handler="_onCompletedClick" target-id="rockTaskSummary"></bedrock-pubsub>
        <bedrock-pubsub event-name="show-errors" handler="_onErrorsClick" target-id="rockTaskSummary"></bedrock-pubsub>
        <bedrock-pubsub event-name="refresh-task-details" handler="_onRefreshClick" target-id="rockTaskSummary"></bedrock-pubsub>
`;
  }

  static get is() { return 'app-task-detail' }

  static get properties() {
      return {
          contextData: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _showMessage: {
              type: Boolean
          },
          taskId: {
              type: String,
              value: ""
          },

          _taskDetails: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          _showInProgressTasks: {
              type: Boolean,
              value: false
          },

          _showCompletedTasks: {
              type: Boolean,
              value: false
          },

          _showErroredTasks: {
              type: Boolean,
              value: false
          },

          _loading: {
              type: Boolean,
              value: false
          },

          _isTaskDetailsLoading: {
              type: Boolean,
              computed: "_computeStatus(_loading)"
          },

          _message: {
              type: String,
              value: ""
          },

          _defaultMessage: {
              type: String,
              value: "No details available."
          },
          entityIdList: {
              type: Array,
              value: function () {
                  return [];
              }
          }, entityTypeList: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          appConfig: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          queryParams: {
              type: String,
              value: ""
          },
          domain: {
              type: String,
              value: "generic"
          },
          _isContextUpdateCompleted: {
              type: Boolean,
              value: false
          },
          _isParentTask: {
              type: Boolean,
              value: false
          },
          _taskTitle: {
              type: String,
              value: null
          }
      }
  }
  ready() {
      super.ready();
      this.taskId = DataHelper.getParamValue("id");

      this._message = this._defaultMessage;
  }
  constructor() {
      super();
      let userContext = {
          "roles": this.roles,
          "user": this.userId,
          "ownershipData": this.ownershipData,
          "tenant": this.tenantId,
          "defaultRole": this.defaultRole
      };
      this.contextData[ContextHelper.CONTEXT_TYPE_USER] = [userContext];

  }
  disconnectedCallback() {
      super.disconnectedCallback();
  }
  connectedCallback() {
      super.connectedCallback();
      this._searchTimeStamp = new Date().toLocaleString();
      this._initiateTaskDetailsGetRequest();
  }



  /**
   * Function to display the left nav info
   */
  getAppCurrentStatus(customArgs) {
      if (customArgs && customArgs.queryParams) {
          this.queryParams = customArgs.queryParams;
      }
      return {
          title: "Task Details",
          subTitle: "Last Searched",
          subTitleValue: this._searchTimeStamp ? this._searchTimeStamp : new Date().toLocaleString(),
          queryParams: this.queryParams,
          appId: this.appId
      };
  }

  /**
   *  After the page has loaded, update the title to display on the left nav
   */
  updateAppCurrentStatus(pTitle) {
      if (pTitle) {
          let appStatus = this.getAppCurrentStatus();
          appStatus.title = pTitle;
          let eventData = {
              name: "appstatusupdated",
              data: appStatus
          };
          this.dispatchEvent(new CustomEvent("bedrock-event", { detail: eventData, bubbles: true, composed: true }));
      }
  }

  refresh() {
      this._onRefreshClick();
  }

  _loadCompletedTasks() {
      if (this._showCompletedTasks) {
          return true;
      }
      return false;
  }

  _loadErrorTasks() {
      if (this._showErroredTasks) {
          return true;
      }
  }

  _computeStatus() {
      return !this._loading;
  }

  _initiateTaskDetailsGetRequest() {
      this._taskDetailsGet = this._taskDetailsGet || this.shadowRoot.querySelector("#taskDetailsGet");
      if (this._taskDetailsGet) {
          this._taskDetailsGet.requestData = { "taskId": this.taskId };
          this._taskDetailsGet.generateRequest();
      }
  }

  async _onTaskDetailsGetResponse(e, detail) {
      this._loading = false;
      let taskDetails = detail.response;

      if (taskDetails && !_.isEmpty(taskDetails)) {

          //Convert task startTime and endTime
          taskDetails.startTime = FormatHelper.convertFromISODateTimeToClientFormat(taskDetails.startTime, "datetime");
          taskDetails.endTime = FormatHelper.convertFromISODateTimeToClientFormat(taskDetails.endTime, "datetime");
          let taskStatus = taskDetails.taskStatus.toLowerCase();

          //Set isExtractComplete based on hasChildTasks and taskStatus
          if (taskDetails.hasChildTasks != "N/A" && taskDetails.hasChildTasks) {
              if (taskStatus != "processing") {
                  taskDetails.isExtractComplete = true;
              } else {
                  taskDetails.isExtractComplete = false;
              }
          }

          if (taskDetails.successEntities && taskDetails.successEntities.ids &&
              taskDetails.successEntities.ids.length > 0) {
              this.entityIdList = taskDetails.successEntities.ids;
              this.entityTypeList = taskDetails.successEntities.types;

              let entityTypeManager = EntityTypeManager.getInstance();
              //Set domain as per entity type
              if (entityTypeManager && !_.isEmpty(this.entityTypeList)) {
                  let domainList = [];
                  for(let i=0;i<this.entityTypeList.length;i++){
                      if(this.entityTypeList[i]){
                          let domain = await entityTypeManager.getDomainByEntityTypeNameAsync(this.entityTypeList[i].replace("delete", ""));
                          domainList.push(domain || this.domain);
                      }
                  }
                  if (domainList && _.uniq(domainList).length == 1) {
                      this.domain = domainList[0];
                  }
              }
              this._showMessage = false;
              if (taskStatus === "completed with errors") {
                  this._showErroredTasks = true;
              } else if (!this._showCompletedTasks) {
                  this._showCompletedTasks = true;
              } else {
                  this._reloadRockDiscovery();
              }
          } else if (taskStatus == "errored" || taskStatus === "completed with errors") {
              if (taskDetails.preProcessFailure) {
                  this._message = taskDetails.message;
                  this._showMessage = true;
              } else {
                  this._showErroredTasks = true;
                  this._showMessage = false;
              }
          } else {
              this._showMessage = true;
          }
      } else {
          //Task details are not available...
          //It could be still task is waiting to be queued... set default values
          taskDetails.taskId = detail.request.requestData.taskId;
          taskDetails.taskStatus = "Waiting To Be Queued";
          taskDetails.fileName = "N/A";
          taskDetails.fileId = "N/A";
          taskDetails.taskType = "N/A";
          taskDetails.startTime = "N/A";
          taskDetails.endTime = "N/A";
          taskDetails.submittedBy = "N/A";
          taskDetails.totalRecords = "N/A";
          taskDetails.hasChildTasks = "N/A";
          taskDetails.isExtractComplete = "N/A";
          taskDetails.taskStats = {
              "error": "0%", "processing": "100%", "success": "0%", "createRecords": "0%",
              "updateRecords": "0%", "deleteRecords": "0%", "noChangeRecords": "100%"
          };

          this._message = this._defaultMessage;
          this._showMessage = true;
      }

      this._taskDetails = taskDetails;
      this._taskTitle = this._setTaskTitle();
      this._setParentTask();
      this._updateContextData();

      //update the nav menu contents
      let navBarTitle = this._setTaskTitle(true) || "";
      this.updateAppCurrentStatus(navBarTitle);
  }

  _setParentTask() {
      if (this._taskDetails && this._taskDetails.hasChildTasks != "N/A") {
          this._isParentTask = this._taskDetails.hasChildTasks;
      }
  }

  _setTaskTitle(isNavBarTitle = false) {
      let title = isNavBarTitle ? [] : ["Task Details"];
      if (this._taskDetails) {
          if (this._taskDetails.taskType && this._taskDetails.taskType != "N/A") {
              title.push(this._taskDetails.taskType);
          }

          if (this._taskDetails.fileName && this._taskDetails.fileName != "N/A" && !(this._taskDetails.fileName instanceof Array)) {
              title.push(this._taskDetails.fileName);
          } else if (this._taskDetails.totalRecords && this._taskDetails.totalRecords != "N/A") {
              let appendPlus = this._taskDetails.hasChildTasks && !this._taskDetails.isExtractComplete ? "+" : "";
              title.push(this._taskDetails.totalRecords + appendPlus + " records");
          }

          if (this._taskDetails.taskStatus && this._taskDetails.taskStatus != "N/A") {
              title.push(this._taskDetails.taskStatus);
          }

          return title.join(isNavBarTitle ? ": " : " - ");
      }
  }

  _onTaskDetailsGetError() {
      this._loading = false;
      // Show Error Toast
  }

  _onInProgressClick() {
      // this.showChart = true;
  }

  _onCompletedClick() {
      let successEntities = this._taskDetails.successEntities;

      if (!DataHelper.isEmptyObject(successEntities)) {
          this.entityIdList = successEntities.ids;
          this.entityTypeList = successEntities.types;
          this._showCompletedTasks = true;
          this._showMessage = !this._showCompletedTasks;
          this._showInProgressTasks = !this._showCompletedTasks;
          this._showErroredTasks = !this._showCompletedTasks;
      } else {
          this._message = this._defaultMessage;
          this._showMessage = true;
      }

      //this.showChart = false;
  }

  _onErrorsClick() {
      if (!DataHelper.isEmptyObject(this._taskDetails)) {
          this.taskId = this._taskDetails.taskId;
          this._showErroredTasks = true;
          this._showMessage = !this._showErroredTasks;
          this._showInProgressTasks = !this._showErroredTasks;
          this._showCompletedTasks = !this._showErroredTasks;
      } else {
          this._message = this._defaultMessage;
          this._showMessage = true;
      }

      // this.showChart = true;
  }
  _onContextChanged() {
      let contextData = this.contextData;
      this.contextData = {}; // To notify
      this.contextData = contextData;
      this._isContextUpdateCompleted = true; //To load full component
  }

  _onRefreshClick() {
      this._loading = true;
      this._initiateTaskDetailsGetRequest();
  }

  _reloadRockDiscovery() {
      this._entitySearchDiscoveryGrid = this._entitySearchDiscoveryGrid || this.shadowRoot.querySelector("#entitySearchDiscoveryGrid");
      if (this._entitySearchDiscoveryGrid) {
          this._entitySearchDiscoveryGrid.refresh();
      }
  }

  _updateContextData() {
      let newDimensions = {};
      newDimensions["app"] = ["app-task-detail"];
      
      if (this.domain) {
          newDimensions["domain"] = [this.domain];
      }
      ContextHelper.updateContextData(this.contextData, newDimensions);
      this._onContextChanged();
  }
}
customElements.define(AppTaskDetail.is, AppTaskDetail)
