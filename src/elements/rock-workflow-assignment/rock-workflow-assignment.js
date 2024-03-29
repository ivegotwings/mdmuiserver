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
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../liquid-rest/liquid-rest.js';
import '../pebble-spinner/pebble-spinner.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockWorkflowAssignment extends mixinBehaviors([RUFBehaviors.UIBehavior, RUFBehaviors.ComponentContextBehavior],
    OptionalMutableData(PolymerElement)) {
  static get template() {
    return html`
        <style>
            .message {
                text-align: center;
            }
        </style>
        <pebble-spinner active="[[_loading]]"></pebble-spinner>
        <div class="message">[[_message]]</div>

        <liquid-rest id="entityWfAssignment" url="/data/pass-through/entitygovernservice/workflowChangeAssignment" method="POST" on-liquid-response="_onAssignmentSuccess" on-liquid-error="_onAssignmentFailure"></liquid-rest>

        <liquid-rest id="entityWfBulkAssignment" url="/data/pass-through-bulk/entitygovernservice/workflowChangeAssignment" method="POST" on-liquid-response="_onAssignmentSuccess" on-liquid-error="_onAssignmentFailure"></liquid-rest>

        <liquid-rest id="asyncEntityWfAssignment" url="/data/pass-through-combined-query/bulkentityservice/createtask" method="POST" on-liquid-response="_onAsyncAssignmentSuccess" on-liquid-error="_onAsyncAssignmentFailure"></liquid-rest>
`;
  }

  static get is() {
      return "rock-workflow-assignment";
  }
  static get properties() {
      return {

          /**
           * Represents selection mode query or count
           */
          selectionMode: {
              type: String,
              value: "count"
          },

          /**
           * Represents criteria query
           */
          selectionQuery: {
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
          /**
           * <b><i>Content development is under progress... </b></i>
           */
          selectedEntities: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          /**
           * <b><i>Content development is under progress... </b></i>
           */
          assignmentAction: {
              type: String
          },
          /**
           * Represents workflow name
           */
          workflowName: {
              type: String
          },
          /**
           * Represents workflow external name
           */
          workflowExternalName: {
              type: String
          },
          /**
           * Represents workflow activity name
           */
          workflowActivityName: {
              type: String
          },
          /**
           * Represents workflow activity external name
           */
          workflowActivityExternalName: {
              type: String
          },

          _loading: {
              type: Boolean,
              value: false
          },

          _message: {
              type: String
          },

          _responseMessages: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          _taskId: {
              type: String,
              value: null
          },

          syncThreshold: {
              type: String,
              value: 20
          },
          userToBeAssigned: {
              type: Object
          },
          isSingleEntityProcess: {
              type: Boolean,
              value: false
          },
          workflowContext: {
              type: Object,
              value: function () {
                  return {};
              }
          }
      }
  }
  static get observers() {
      return [
          '_executeAssignmentProcess(contextData, assignmentAction, workflowName, workflowActivityName)'
      ]
  }
  get asyncEntityWfAssignmentLiq() {
      this._asyncEntityWfAssignmentLiq = this._asyncEntityWfAssignmentLiq || this.shadowRoot.querySelector(
          "#asyncEntityWfAssignment");
      return this._asyncEntityWfAssignmentLiq;
  }

  get entityWfBulkAssignmentLiq() {
      this._entityWfBulkAssignmentLiq = this._entityWfBulkAssignmentLiq || this.shadowRoot.querySelector(
          "#entityWfBulkAssignment");
      return this._entityWfBulkAssignmentLiq;
  }

  get entityWfAssignmentLiq() {
      this._entityWfAssignmentLiq = this._entityWfAssignmentLiq || this.shadowRoot.querySelector(
          "#entityWfAssignment");
      return this._entityWfAssignmentLiq;
  }

  _executeAssignmentProcess() {
      // Start process when all the details are available
      if (this.contextData && !_.isEmpty(this.contextData) &&
          this.assignmentAction && this.workflowName && this.workflowActivityName) {
          this._loading = true;
          this._message = "Assignment process started";
          this._generateAssignmentRequest();
      }
  }

  _getAttributeValue(id, attrName) {
      if (this.selectedEntities && this.selectedEntities.length > 0) {
          for (let i = 0; i < this.selectedEntities.length; i++) {
              if (this.selectedEntities[i].id == id) {
                  let attribute = undefined;
                  if (this.selectedEntities[i] && DataHelper.isValidObjectPath(this.selectedEntities[
                          i], "data.attributes")) {
                      attribute = this.selectedEntities[i].data.attributes[attrName];
                  }
                  return attribute ? attribute.values[0].value : "Not found";
              }
          }
      }
  }

  _generateAssignmentRequest() {

      // No selectionMode or selectionMode as count should have selectedEntities to do process
      if ((!this.selectionMode || this.selectionMode == "count") && (!this.selectedEntities || this.selectedEntities
              .length == 0)) {
          this._message = "Entities not available for the process";
          this._loading = false;
          return;
      }

      let workflowDetails = {
          "workflowShortName": this.workflowName,
          "workflowActivityName": this.workflowActivityName
      };

      //Prepare request without entity
      let workflowAssignmentRequest = DataRequestHelper.createWfChangeAssignmentRequest(null,
          workflowDetails, this.contextData, this.assignmentAction, this.userToBeAssigned);

      //Add hotline flag if hotline is enabled
      if (DataHelper.isHotlineModeEnabled()) {
          workflowAssignmentRequest.hotline = true;
      }

      let data = ContextHelper.createContextForWorkflowActions(this.workflowContext);

      if (this.selectionMode == "query" || (this.selectionMode == "count" && this.selectedEntities.length >
              this.syncThreshold)) {

          if (!this.selectionQuery || _.isEmpty(this.selectionQuery)) {
              this._message = "Selection query not available for the process";
              this._loading = false;
              return;
          }

          // workflowAssignmentRequest.params.query = this.selectionQuery;

          //Async process
          workflowAssignmentRequest.params.operationType = "inboundService";

          if (this.selectionQuery.params && this.selectionQuery.params.isCombinedQuerySearch) {
              workflowAssignmentRequest.params.taskType = "changeAssignment-multi-query";
              workflowAssignmentRequest.entities = [this.selectionQuery.entity];
          } else {
              workflowAssignmentRequest.params.taskType = "changeAssignment-query";
              workflowAssignmentRequest.params.query = this.selectionQuery.params ? this.selectionQuery
                  .params.query : this.selectionQuery;
          }

          if (!_.isEmpty(data)) {
              workflowAssignmentRequest.params.data = data;
          }

          //Add clientAttributes
          let valueContext = ContextHelper.getFirstValueContext(this.contextData);
          let clientMessage;
          if (this.assignmentAction == "take" || this.assignmentAction == "reassign") {
              clientMessage = "Workflow '" + this.workflowExternalName + "' step '" + this.workflowActivityExternalName +
                  "' assignment to '" + this.userToBeAssigned.id + "'";
          } else {
              clientMessage = "Workflow '" + this.workflowExternalName + "' step '" + this.workflowActivityExternalName +
                  "' assignment release";
          }

          workflowAssignmentRequest.clientAttributes = {
              "taskName": {
                  "values": [{
                      "source": valueContext.source,
                      "locale": valueContext.locale,
                      "value": clientMessage
                  }]
              }
          };

          if (this.asyncEntityWfAssignmentLiq) {
              this.asyncEntityWfAssignmentLiq.requestData = workflowAssignmentRequest;
              this.asyncEntityWfAssignmentLiq.generateRequest();
          }
      } else { // Sync process
          //Add entities to the request
          let entities = [];
          let entityTypes = [];

          for (let i = 0; i < this.selectedEntities.length; i++) {
              entities.push({
                  "id": this.selectedEntities[i].id,
                  "type": this.selectedEntities[i].type,
                  "data": data
              });

              if (entityTypes.indexOf(this.selectedEntities[i].type) == -1) {
                  entityTypes.push(this.selectedEntities[i].type);
              }
          }

          if (this.isSingleEntityProcess) {
              workflowAssignmentRequest["entity"] = entities[0];
              if (this.entityWfAssignmentLiq) {
                  this.entityWfAssignmentLiq.requestData = workflowAssignmentRequest;
                  this.entityWfAssignmentLiq.generateRequest();
              }
          } else {
              workflowAssignmentRequest["entities"] = entities;
              if (this.entityWfBulkAssignmentLiq) {
                  this.entityWfBulkAssignmentLiq.requestData = workflowAssignmentRequest;
                  this.entityWfBulkAssignmentLiq.generateRequest();
              }
          }
      }
  }

  _onAssignmentSuccess(e) {
      let request = e.detail.request;
      let responseList = e.detail.response;
      this._responseMessages = [];

      if (_.isEmpty(responseList)) {
          this._loading = false;
          this._message = "Failed to perform the workflow assignment. Contact administrator.";
          return;
      }

      if (responseList && responseList.response && responseList.response.status && responseList.response
          .status.toLowerCase() == "error" && responseList.response.statusDetail) {
          this._message = "Assignment request failed with following error: " + responseList.response.statusDetail
              .message;
          this._loading = false;
          return;
      }

      if (this.isSingleEntityProcess) {
          if (responseList && responseList.response && responseList.response.status && responseList.response
              .status.toLowerCase() == "success") {
              let message = this.assignmentAction.toLowerCase() == "take" ? "Successfully assigned" :
                  this.assignmentAction.toLowerCase() == "reassign" ? "Successfully reassigned" :
                  "Successfully released";
              let responseMessage = {
                  "Message": message
              };
              this._responseMessages.push(responseMessage);
              this._triggerFinishStep();
              return;
          }
      }

      for (let i = 0; i < responseList.length; i++) {
          //set id
          let assignmentResponse = {
              "Entity Id": responseList[i].id
          };

          assignmentResponse["Workflow Name"] = this.workflowExternalName;
          assignmentResponse["Workflow Activity Name"] = this.workflowActivityExternalName;

          let response = DataHelper.isValidObjectPath(responseList[i], "operationResponse.response") ?
              responseList[i].operationResponse.response : {};

          //Success
          if (!_.isEmpty(response) && response.status.toLowerCase() == "success" &&
              response.statusDetail && response.statusDetail.message) {
              assignmentResponse["Message"] = this.assignmentAction.toLowerCase() == "take" ?
                  "Successfully assigned" : this.assignmentAction.toLowerCase() == "reassign" ?
                  "Successfully reassigned" : "Successfully released";
          } //Error
          else if (!_.isEmpty(response) && response.status.toLowerCase() == "error" &&
              response.statusDetail && response.statusDetail.message) {
              assignmentResponse["Message"] = "Assignment request failed";
          } //Success or error, show response message
          else if (!_.isEmpty(response) && response.statusDetail &&
              response.statusDetail.messages && response.statusDetail.messages.length > 0) {
              assignmentResponse["Message"] = response.statusDetail.messages[0].message;
          }

          this._responseMessages.push(assignmentResponse);

      }

      this._triggerFinishStep();
  }

  _onAssignmentFailure(e) {
      this._loading = false;
      this._message = "Failed to perform the workflow assignment. Contact administrator.";
      this.logError("WorkFlowAssignmentFailure", "response", e.detail);
  }

  _onAsyncAssignmentSuccess(e) {
      let response = e.detail.response && e.detail.response.response ? e.detail.response.response : e
          .detail.response;
      let request = e.detail.response ? e.detail.response.request : undefined;

      if ((!response || _.isEmpty(response)) ||
          (DataHelper.isValidObjectPath(response, "dataObjectOperationResponse.status") && response.dataObjectOperationResponse
              .status.toLowerCase() == "error") ||
          (response.status && response.status.toLowerCase() == "error")) {
          this._message = "Bulk assignment request failed";
          this._loading = false;
          return;
      }

      if (response.status && response.status.toLowerCase() == "success") {
          if (request && request.taskId) {
              this._taskId = request.taskId;
          }
      }

      this._message = "Assignment request triggered successfully";
      this._triggerFinishStep(true);
  }

  _onAsyncAssignmentFailure(e) {
      this._loading = false;
      this._message = "Failed to perform the workflow assignment. Contact administrator.";
      this.logError("WorkFlowAssignmentFailure", "response", e.detail);
  }

  _triggerFinishStep(isJob) {
      let noGrid = false;
      let message = "";
      let actions = [{
          "name": "goBack",
          "text": "Take me back to where I started",
          "isNotApp": true
      }];

      if (this.isSingleEntityProcess) {
          noGrid = true;
          message = this._responseMessages && this._responseMessages[0] ? this._responseMessages[0].Message :
              "";
          this._responseMessages = [];
      } else if (isJob) {
          noGrid = true;
          message = "Assignment process is started, you can review the progress of the task " + this._taskId +
              " in task details.";
          actions.push({
              "name": "gotoJobDetails",
              "text": "Show me the task details",
              "isNotApp": true,
              "dataRoute": "task-detail",
              "queryParams": {
                  "id": this._taskId
              }
          });
      } else {
          message = "Assignment process is started, refresh data grid after some time.";
      }

      let data = {
          "messages": this._responseMessages,
          "message": message,
          "noGrid": noGrid,
          "actions": actions,
          "contextData": this.contextData,
          "processedEntities": this.selectedEntities,
          "messageKey": "Entity Id"
      };

      this.businessFunctionData = data;
      let eventName = "onComplete";
      let eventDetail = {
          name: eventName
      }

      this.fireBedrockEvent(eventName, eventDetail, {
          ignoreId: true
      });

      this._message = "About to complete, please wait...";
      this._loading = true;

      //Reset
      this.contextData = {};
      this.selectedEntities = [];
      this.workflowName = "";
      this.workflowExternalName = "";
      this.workflowActivityName = "";
      this.workflowActivityExternalName = "";
      this.assignmentAction = "";
  }
}
customElements.define(RockWorkflowAssignment.is, RockWorkflowAssignment);
