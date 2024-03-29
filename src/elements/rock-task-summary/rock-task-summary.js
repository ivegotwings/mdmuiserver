import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-list.js';
import '../bedrock-style-manager/styles/bedrock-style-text-alignment.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-floating.js';
import '../bedrock-style-manager/styles/bedrock-style-gridsystem.js';
import FileDownloadManager from '../bedrock-managers/file-download-manager.js';
import '../rock-multiple-file-download/rock-multiple-file-download.js';
import '../pebble-button/pebble-button.js';
import '../pebble-graph-pie/pebble-graph-pie.js';
import '../pebble-spinner/pebble-spinner.js';
import '../pebble-dialog/pebble-dialog.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockTaskSummary extends mixinBehaviors([RUFBehaviors.UIBehavior], PolymerElement) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-gridsystem bedrock-style-floating bedrock-style-padding-margin bedrock-style-text-alignment bedrock-style-list">
            .attributes-container {
                display: -webkit-box;
                display: -webkit-flex;
                display: -ms-flexbox;
                display: flex;
                flex-wrap: wrap;
                -webkit-flex-wrap: wrap;
                /* Safari 6.1+ */
                @apply --layout-horizontal;
                width: calc(70% - 90px);
                float: left;
            }

            .attribute {
                width: 24%;
                height: 50px;
                line-height: 20px;
            }

            .attribute-label {
                font-family: var(--default-font-family);
                font-size: var(--default-font-size, 14px);
                font-weight: normal;
                font-style: normal;
                font-stretch: normal;
                color: var(--attrpanel-color-text, #1a2028);
                opacity: 0.7;
            }

            .attribute-value {
                font-size: var(--font-size-sm, 12px);
                font-weight: var(--font-medium, 500);
                color: var(--buttontext-color, #616161);
                width: 75%;
            }

          
            .graph-details-wrap {
                display: flex;
                flex: 0 1 auto;
            }

            .graph-details {
                font-size: var(--font-size-sm, 12px);
                color: var(--text-primary-color, #1a2028);
                padding: 0px;
                margin: 0px;
            }

            .graph-details li {
                list-style-type: none;
                line-height: 25px;
                position: relative;
                padding-left: 15px;
            }

            .graph-details li.focused {
                font-weight: var(--font-bold, bold);
            }

            .graph-details li::before {
                position: absolute;
                content: "";
                left: 0px;
                top: 7px;
                width: 10px;
                height: 10px;
                border-radius: 50%;
            }

            .success::before {
                background: var(--success-color, #36b44a);
            }

            .processing::before {
                background: var(--chart-inprogress, #f2e91d);
            }

            .error::before {
                background: var(--error-color, #ed204c);
            }

            .create-records::before {
                background: var(--action-create-color, #0000FF);
            }

            .update-records::before {
                background: var(--action-update-color, #FFA500);
            }

            .delete-records::before {
                background: var(--action-delete-color, #FA8072);
            }

            .no-change-records::before {
                background: var(--no-change-record-color, #808080);
            }

            .card {
                box-shadow: 0 0px 6px 0px rgba(193, 202, 211, 0.7);
                padding: 5px 15px 0;
            }

            .card-title {
                color: var(--link-text-color, #036Bc3);
                font-size: var(--default-font-size, 14px);
                text-align: left;
            }

           
            .status {
                border-radius: 5px;
                padding: 0px 5px 0px 5px;
                display: inline-block;
                width: auto;
                max-width: 75%;
            }

            .status-errored {
                background-color: #ed204c;
                color: #ffffff;
            }

            .status-completed {
                background-color: #36b44a;
                color: #ffffff;
            }

            .status-queued,
            .status-waitingtobequeued {
                background-color: #75808b;
                color: #ffffff;
            }

            .status-completedwitherrors {
                background-color: #FFA500;
                color: #ffffff;
            }
            pebble-graph-pie{
                cursor: pointer;
            }

            .status-processing {
                background-color: #f2e91d;
            }
            
        </style>

        <div class="row-wrap p-b-10 p-t-10">
            <div id="attributesContainer" class="col-7 attributes-container">
                <template is="dom-if" if="[[_showTaskName]]">
                    <div class="attribute">
                        <div class="attribute-label">Task Name</div>
                        <div title\$="[[taskDetails.taskName]]">
                            <div class="attribute-value text-ellipsis">[[taskDetails.taskName]]</div>
                        </div>
                    </div>
                </template>
                <template is="dom-if" if="[[!_showTaskName]]">
                    <div class="attribute">
                        <div class="attribute-label">File Name</div>
                        <!-- Handling scenario where the no. of files to download are more than 1 -->
                        <template is="dom-if" if="[[_isMultipleDownloadFilesAvailable()]]">
                            <rock-multiple-file-download id="multipleFileDownload" profile-name="[[taskDetails.profileName]]" context-data="[[contextData]]" file-details="[[taskDetails]]" is-large-file="[[isParentTask]]"></rock-multiple-file-download>                            
                        </template>
                        
                        <template is="dom-if" if="[[!_isMultipleDownloadFilesAvailable()]]">
                            <div title\$="[[taskDetails.fileName]]">
                                <template is="dom-if" if="[[_isDownloadAvailable(taskDetails.fileId)]]">
                                    <div class="attribute-value text-ellipsis">
                                        <a href="#" class="btn-link" on-tap="_onDownloadClick">[[taskDetails.fileName]]</a>
                                    </div>
                                </template>
                                <template is="dom-if" if="[[!_isDownloadAvailable(taskDetails.fileId)]]">
                                    <div class="attribute-value text-ellipsis">[[taskDetails.fileName]]</div>
                                </template>
                            </div>
                        </template>
                    </div>
                </template>

                <div id="attribute" class="attribute">
                    <div class="attribute-label">Task ID</div>
                    <div title\$="[[taskDetails.taskId]]">
                        <div class="attribute-value text-ellipsis" title="[[taskDetails.taskId]]">[[taskDetails.taskId]]</div>
                    </div>
                </div>

                <div id="attribute" class="attribute">
                    <div class="attribute-label">Task Type</div>
                    <div title\$="[[taskDetails.taskType]]">
                        <div class="attribute-value text-ellipsis" title="[[taskDetails.taskType]]">[[taskDetails.taskType]]</div>
                    </div>
                </div>

                <div id="attribute" class="attribute">
                    <div class="attribute-label">Task Status</div>
                    <div title\$="[[taskDetails.taskStatus]]">
                        <div class\$="attribute-value text-ellipsis [[_getStatusClass(taskDetails.taskStatus)]]" title="[[taskDetails.taskStatus]]">[[taskDetails.taskStatus]]</div>
                    </div>
                </div>

                <div id="attribute" class="attribute">
                    <div class="attribute-label">Start Time</div>
                    <div title\$="[[taskDetails.startTime]]">
                        <div class="attribute-value text-ellipsis" title="[[taskDetails.startTime]]">[[taskDetails.startTime]]</div>
                    </div>
                </div>

                <div id="attribute" class="attribute">
                    <div class="attribute-label">End Time</div>
                    <div title\$="[[taskDetails.endTime]]">
                        <div class="attribute-value text-ellipsis" title="[[taskDetails.endTime]]">[[taskDetails.endTime]]</div>
                    </div>
                </div>

                <div id="attribute" class="attribute">
                    <div class="attribute-label">Submitted By</div>
                    <div title\$="[[taskDetails.submittedBy]]">
                        <div class="attribute-value text-ellipsis" title="[[taskDetails.submittedBy]]">[[taskDetails.submittedBy]]</div>
                    </div>
                </div>

                <div id="attribute" class="attribute">
                    <div class="attribute-label">Total Records</div>
                    <div title\$="[[_totalRecordsMessage]]">
                        <div class="attribute-value text-ellipsis">[[_totalRecordsMessage]]</div>
                    </div>
                </div>
                <pebble-spinner active="[[_downloadInProgress]]"></pebble-spinner>
            </div>
            <div id="processingDetails" class="col-3 text-center">
                <div class="card">
                    <div class="card-title">Processing Details</div>
                    <div class="graph-details-wrap">
                        <ul class="graph-details">
                            <li class="success">Success</li>
                            <li class="processing">Processing</li>
                            <li class="error">Error</li>
                        </ul>
                        <div>
                            <pebble-graph-pie id="processingDetails" data="[[processingDetails]]" class="align-with-title"></pebble-graph-pie>
                        </div>
                    </div>

                    <bedrock-pubsub event-name="selection-changed" handler="_onSelectionChanged" target-id="processingDetails"></bedrock-pubsub>
                    <div class="clearfix"></div>
                </div>
            </div>
            <template is="dom-if" if="[[_showProcessingSubDetailsGraph]]">
                <div class="col-3 text-center">
                    <div class="card">
                        <div class="card-title">Sub-details</div>
                        <div class="graph-details-wrap">
                            <ul class="graph-details">
                                <li class="create-records">Create</li>
                                <li class="update-records">Update</li>
                                <li class="delete-records">Delete</li>
                                <li class="no-change-records">No Change</li>
                            </ul>
                            <div>
                                <pebble-graph-pie id="processingSubDetails" data="[[subProcessingDetails]]" class="align-with-title"></pebble-graph-pie>
                            </div>
                        </div>
                        <bedrock-pubsub event-name="selection-changed" handler="_onSelectionChanged" target-id="processingSubDetails"></bedrock-pubsub>
                        <div class="clearfix"></div>
                    </div>
                </div>
            </template>
            <div id="sidebar" class="col-2 text-right">
                <pebble-button id="refreshButton" button-text="Refresh" on-tap="_onRefreshClick" noink="" class="btn btn-primary">
                </pebble-button>
            </div>
        </div>                
`;
  }

  static get is() {
      return "rock-task-summary";
  }
  static get properties() {
      return {
          contextData: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          taskDetails: {
              type: Object,
              value: function () {
                  return {};
              },
              observer: '_onTaskDetailsChanged'
          },
          processingDetails: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          _downloadInProgress: {
              type: Boolean,
              value: false
          },
          _showProcessingSubDetailsGraph: {
              type: Boolean,
              value: false
          },
          _showTaskName: {
              type: Boolean,
              value: false
          },
          _totalRecordsMessage: {
              type: String,
              value: null
          },
          isParentTask: {
              type: Boolean,
              value: false
          }
      }
  }
  _onTaskDetailsChanged() {
      if (this.taskDetails && this.taskDetails.taskStats) {
          let taskStats = this.taskDetails.taskStats;
          let index = 0;
          let processingDetails = [];
          let subProcessingDetails = [];
          let self = this;

          let taskType = this.taskDetails.taskType.toLowerCase();
          if (taskType == "entity data imports" || taskType == "system integrations - entity data imports" || taskType == "bulk edit" || taskType == "createvariants") {
              this._showProcessingSubDetailsGraph = true;

              let attributeContainer = this.shadowRoot.querySelector("#attributesContainer");
              if (attributeContainer && attributeContainer.classList.contains("col-7")) {
                  attributeContainer.className = attributeContainer.className.replace("col-7", "col-5");
              }

              let sidebar = this.shadowRoot.querySelector("#sidebar");
              if (sidebar && sidebar.classList.contains("col-2")) {
                  sidebar.className = sidebar.className.replace("col-2", "col-1");
              }
          }

          if (taskType.indexOf("bulk") > -1 || taskType.indexOf("createvariants") > -1) {
              this._showTaskName = true;
          }

          Object.keys(taskStats).map(function (key) {
              let taskCompletedInPercentage = parseInt(taskStats[key].replace(/\%$/, ''));

              if (key == "processing" || key == "error" || key == "success") {
                  if (taskCompletedInPercentage > 0) {
                      let taskStatusInLower = self.taskDetails.taskStatus.toLowerCase();
                      let taskStat = {
                          "id": ++index,
                          "key": key,
                          "value": taskCompletedInPercentage.toString(),
                          "unit": "%",
                          "clickable": true
                      }

                      if (key == "processing") {
                          taskStat.color = "#f2e91d";
                          taskStat.clickable = false;
                      } else if (key == "error") {
                          taskStat.color = "#d71921";
                          taskStat.selected = true;
                      } else {
                          taskStat.color = "#09c021"; //success
                          if (taskStatusInLower !== "completed with errors") {
                              taskStat.selected = true;
                          }
                      }

                      processingDetails.push(taskStat);
                  }
              }

              if (key == "createRecords" || key == "updateRecords" || key == "deleteRecords" || key == "noChangeRecords") {
                  if (taskCompletedInPercentage > 0) {
                      let taskStat = {
                          "id": ++index,
                          "key": key,
                          "value": taskCompletedInPercentage.toString(),
                          "unit": "%",
                          "clickable": false
                      }

                      if (key == "createRecords") {
                          taskStat.color = "#0000FF";
                      } else if (key == "updateRecords") {
                          taskStat.color = "#FFA500";
                      } else if (key == "deleteRecords") {
                          taskStat.color = "#FA8072";
                      } else {
                          taskStat.color = "#808080"; //noChange
                      }

                      subProcessingDetails.push(taskStat);
                  }
              }
          });

          this.set("processingDetails", processingDetails);
          this.set("subProcessingDetails", subProcessingDetails);
      }

      //Set totalRecords message
      if (this.taskDetails.totalRecords == "N/A") {
          this._totalRecordsMessage = this.taskDetails.totalRecords;
      } else {
          let appendPlus = "";
          if (this.taskDetails.hasChildTasks != "N/A" && this.taskDetails.isExtractComplete != "N/A") {
              appendPlus = this.taskDetails.hasChildTasks && !this.taskDetails.isExtractComplete ? "+" : "";
          }
          this._totalRecordsMessage = this.taskDetails.totalRecords + appendPlus;
      }
  }

  _onSelectionChanged(e) {
      let eventName = '';

      switch (e.detail.data.key) {
          case 'processing':
              eventName = 'show-inprogress';
              break;
          case 'success':
              eventName = 'show-completed';
              break;
          case 'error':
              eventName = 'show-errors';
      }

      this.fireBedrockEvent(eventName);
  }

  _onDownloadClick(taskDetails) {
      this._downloadInProgress = true;
      let fileDownloadManager = FileDownloadManager.getInstance();
      let isSeedDataStreamType = false;
      if (this.taskDetails.taskType.toLowerCase().indexOf("tenant seed imports") >= 0){
          this.isParentTask = true;
          isSeedDataStreamType = true;
      }
      fileDownloadManager.downloadFile(this.taskDetails,this.isParentTask,this,isSeedDataStreamType);               
  }

  /**
   * Function to handle the file download success 
   **/
  onFileDownloadSuccess(){
      this._downloadInProgress = false;
  }

  /**
  * Function to handle the file download failure 
  **/
  onFileDownloadFailure(e){
      this.showErrorToast("Failed to download file, contact administrator.");
      this.logError("Failed to download file.", e.detail || "");
      this._downloadInProgress = false;
  }

  /**
   * Function to check if multiple files are available for download
   */
  _isMultipleDownloadFilesAvailable(){
      if(this.taskDetails && this.taskDetails.fileName){
          return this.taskDetails.fileName instanceof Array; 
      }
      return false;             
  }

  _isDownloadAvailable() {
      return this.taskDetails.fileId !== "N/A";
  }

  _onRefreshClick() {
      this.fireBedrockEvent("refresh-task-details");
  }

  _getStatusClass(status) {
      return "status status-" + (status || "").replace(/ /g, "").toLowerCase();
  }
}
customElements.define(RockTaskSummary.is, RockTaskSummary);
