/**
<b><i>Content development is under progress... </b></i>

@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../liquid-entity-model-get/liquid-entity-model-get.js';
import '../liquid-rest/liquid-rest.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../pebble-spinner/pebble-spinner.js';
import '../pebble-button/pebble-button.js';
import '../pebble-textarea/pebble-textarea.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockWorkflowTransition extends mixinBehaviors([RUFBehaviors.UIBehavior, RUFBehaviors.ComponentContextBehavior],
    OptionalMutableData(PolymerElement)) {
  static get template() {
    return Polymer.html`
        <style include="bedrock-style-common bedrock-style-padding-margin">
            .message {
                text-align: center;
            }

            .buttonSection {
                text-align: center;
            }

            pebble-textarea {
                --textarea-container: {
                    padding-top: 20px;
                    padding-right: 20px;
                    padding-bottom: 20px;
                    padding-left: 20px;
                    margin-top: 0px;
                    margin-right: auto;
                    margin-bottom: 0px;
                    margin-left: auto;
                    width: 300px;
                }
            }
        </style>
        <pebble-spinner active="[[_loading]]"></pebble-spinner>
        <div class="message">[[_message]]</div>
        <liquid-entity-model-get id="initWorkflowDefinitionsGet" operation="initiatesearch" last-response="{{initWorkflowDefinitionsGet}}" on-response="_onInitWorkflowDefinitionsGetResponse" on-error="_onInitWorkflowDefinitionsGetError"></liquid-entity-model-get>

        <liquid-entity-model-get id="workflowDefinitionsGet" operation="getsearchresultdetail" request-id="[[initWorkflowDefinitionsGet.content.requestId]]" on-response="_onWorkflowDefinitionsGetResponse" on-error="_onWorkflowDefinitionsGetError"></liquid-entity-model-get>

        <liquid-rest id="entityWfTransition" url="/pass-through-bulk/entitygovernservice/transitionWorkflow" method="POST" on-liquid-response="_onTransitionSuccess" on-liquid-error="_onTransitionFailure"></liquid-rest>

        <liquid-rest id="asyncEntityWfTransition" url="/data/pass-through-combined-query/bulkentityservice/createtask" method="POST" on-liquid-response="_onAsyncTransitionSuccess" on-liquid-error="_onAsyncTransitionFailure"></liquid-rest>
        <template is="dom-if" if="[[_showTransitionSection]]">
            <div class="textareaSection">
                <pebble-textarea id="txtComments" autofocus="" label="Add a comment" value="{{_comments}}" show-error="" validation-errors="{{_validationErrors}}"></pebble-textarea>
            </div>
            <div class="buttonSection">
                <template is="dom-repeat" items="[[_currentWorkflowActions]]">
                    <pebble-button id="[[item.id]]" class="btn btn-success m-r-10" button-text="[[_getValue(item, 'actionText')]]" on-tap="_onTapAction"></pebble-button>
                </template>
            </div>
        </template>
`;
  }

  static get is() {
      return "rock-workflow-transition";
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
          currentWorkflow: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          _currentWorkflowDefinition: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          _currentWorkflowActions: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          _loading: {
              type: Boolean,
              value: false
          },

          _message: {
              type: String
          },

          _showTransitionSection: {
              type: Boolean,
              value: false
          },

          _validationErrors: {
              type: Array,
              value: function () {
                  return [];
              }
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
          }
      }
  }
  static get observers() {
      return [
          '_executeTransitionProcess(contextData, currentWorkflow)'
      ]
  }
  get asyncLiquidWfTransitionLiq() {
      this._asyncLiquidWfTransitionLiq = this._asyncLiquidWfTransitionLiq || this.shadowRoot.querySelector(
          "#asyncEntityWfTransition");
      return this._asyncLiquidWfTransitionLiq;
  }

  get entityWfTransitionLiq() {
      this._entityWfTransitionLiq = this._entityWfTransitionLiq || this.shadowRoot.querySelector(
          "#entityWfTransition")
      return this._entityWfTransitionLiq;
  }

  _executeTransitionProcess() {
      // Start process when all the details are available
      if (this.contextData && !_.isEmpty(this.contextData) &&
          this.currentWorkflow && !_.isEmpty(this.currentWorkflow)) {

          this._loading = true;
          this._message = "Retrieving workflow status";

          //Show actions and UI as per model definition
          this._initWorkflowDefinition();
      }
  }

  _initWorkflowDefinition() {
      let initWorkflowDefinitionsGet = this.shadowRoot.querySelector('#initWorkflowDefinitionsGet');

      if (!initWorkflowDefinitionsGet) {
          this.logError("InitGetError");
          return;
      }

      let itemContext = {};
      itemContext.atttributeNames = ["_ALL"];
      this.contextData[ContextHelper.CONTEXT_TYPE_ITEM] = [itemContext];

      initWorkflowDefinitionsGet.requestData = DataRequestHelper.createWorkflowDefinitionGetRequest(
          this.contextData);
      initWorkflowDefinitionsGet.generateRequest();
  }

  _onInitWorkflowDefinitionsGetResponse(e) {
      let workflowDefinitionsGet = this.shadowRoot.querySelector('#workflowDefinitionsGet');

      if (typeof (workflowDefinitionsGet) === "undefined" ||
          workflowDefinitionsGet == null) {
          this.logError("IdNotFound");
          return;
      }

      workflowDefinitionsGet.requestData = DataRequestHelper.createWorkflowDefinitionGetRequest(this.contextData);
      workflowDefinitionsGet.generateRequest();
  }

  _onInitWorkflowDefinitionsGetError(e) {
      this.logError("WorkFlowInitiateError", e);
      this._message = "An error occured in the transition process, contact administrator";
      this._loading = false;
  }

  _onWorkflowDefinitionsGetResponse(e, detail) {

      if (DataHelper.isValidObjectPath(detail, "response.content.entityModels")) {
          let _models = detail.response.content.entityModels;

          if (_models.length > 0) {
              for (let i = 0; i < _models.length; i++) {
                  if (_models[i].data.attributes.workflowName.values[0].value == this.currentWorkflow
                      .name) {
                      this._currentWorkflowDefinition = _models[i];
                      break;
                  }
              }

              if (this._currentWorkflowDefinition) {
                  this._enableWorkFlowActions();
              }
          }
      }
  }

  _onWorkflowDefinitionsGetError(e) {
      this.logError("WorkFlowSearchError", e);
      this._message = "An error occured in the transition process, contact administrator";
      this._loading = false;
  }

  _enableWorkFlowActions() {

      if (DataHelper.isValidObjectPath(this._currentWorkflowDefinition,
              "data.attributes.activities.group")) {
          let _activities = this._currentWorkflowDefinition.data.attributes.activities.group;

          for (let i = 0; i < _activities.length; i++) {
              if (_activities[i].activityName.values[0].value == this.currentWorkflow.activityName) {
                  this._currentWorkflowActions = _activities[i].actions.group;
              }
          }
      }

      if (_.isEmpty(this._currentWorkflowActions)) {
          this._message = "Cannot retrieve workflow activities/actions, try again.";
      } else {
          this._message = "";
          this._showTransitionSection = true;
      }

      this._loading = false;
  }

  _getValue(item, property) {
      if (!property) return item;

      if (item[property] && !_.isEmpty(item[property])) {
          return item[property].values[0].value;
      }
  }

  _onTapAction(e) {
      let _commentsMode = this._getValue(e.model.item, 'commentsMode');
      if (_commentsMode && _commentsMode.toLowerCase() == "mandatory") {
          //Verify comments having data or not
          if (!this._comments) {
              this._raiseError("Required")
              return;
          }
      }

      this._executeTransitionSaveProcess(e.model.item);
  }

  _raiseError(message) {
      this._validationErrors = [message];
  }

  _executeTransitionSaveProcess(action) {

      // No selectionMode or selectionMode as count should have selectedEntities to do process
      if ((!this.selectionMode || this.selectionMode == "count") && (!this.selectedEntities || this.selectedEntities
              .length == 0)) {
          this._message = "Entities not available for the process";
          this._loading = false;
          return;
      }

      this._message = "Workflow transition process started";
      this._loading = true;
      this._showTransitionSection = false;

      let firstItemContext = this.getFirstItemContext();
      firstItemContext.transitionTo = {
          "workflowName": this._currentWorkflowDefinition.name,
          "activityName": this.currentWorkflow.activityName,
          "action": this._getValue(action, 'actionName'),
          "comments": this._comments
      };

      let workflowMappedContexts = this.currentWorkflow.mappedContexts;
      let mappedWorkflowContext = !_.isEmpty(workflowMappedContexts) ? workflowMappedContexts[0] :
          undefined;
      let data = ContextHelper.createContextForWorkflowActions(mappedWorkflowContext);

      let workflowTransitionRequest = DataRequestHelper.createWorkflowTransitionRequest(this.contextData,
          true);
      delete workflowTransitionRequest.entity; //Not needed for bulk

      //Add hotline flag if hotline is enabled
      if (DataHelper.isHotlineModeEnabled()) {
          workflowTransitionRequest.hotline = true;
      }

      if (this.selectionMode == "query" || (this.selectionMode == "count" && this.selectedEntities.length >
              this.syncThreshold)) {

          if (!this.selectionQuery || _.isEmpty(this.selectionQuery)) {
              this._message = "Selection query not available for the process";
              this._loading = false;
              return;
          }

          // workflowTransitionRequest.params.query = this.selectionQuery;

          // Transition request with Workflow Params and Client State
          workflowTransitionRequest.params.taskType = "transitionWorkflow-multi-query";
          workflowTransitionRequest.params.operationType = "inboundService";

          if (this.selectionQuery.params && this.selectionQuery.params.isCombinedQuerySearch) {
              workflowTransitionRequest.params.taskType = "transitionWorkflow-multi-query";
              workflowTransitionRequest.entities = [this.selectionQuery.entity];
          } else {
              workflowTransitionRequest.params.taskType = "transitionWorkflow-query";
              workflowTransitionRequest.params.query = this.selectionQuery.params ? this.selectionQuery
                  .params.query : this.selectionQuery;
          }

          if (!_.isEmpty(data)) {
              workflowTransitionRequest.params.data = data;
          }

          // Add clientAttributes
          let valueContext = ContextHelper.getFirstValueContext(this.contextData);
          let clientMessage = "Workflow '" + this.currentWorkflow.name + "' transition from step '" +
              this.currentWorkflow.activityExternalName + "'; Action performed - " + AttributeHelper.getFirstAttributeValue(
                  action.actionName);

          workflowTransitionRequest.clientAttributes = {
              "taskName": {
                  "values": [{
                      "source": valueContext.source,
                      "locale": valueContext.locale,
                      "value": clientMessage
                  }]
              }
          };

          if (this.asyncLiquidWfTransitionLiq) {
              this.asyncLiquidWfTransitionLiq.requestData = workflowTransitionRequest;
              this.asyncLiquidWfTransitionLiq.generateRequest();
          }
      } else {
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

          // Sync process
          workflowTransitionRequest.entities = entities;
          if (this.entityWfTransitionLiq) {
              this.entityWfTransitionLiq.requestData = workflowTransitionRequest;
              this.entityWfTransitionLiq.generateRequest()
          }
      }
  }

  _getAttributeValue(id, attrName) {
      if (this.selectedEntities && this.selectedEntities.length > 0) {
          for (let i = 0; i < this.selectedEntities.length; i++) {
              if (this.selectedEntities[i].id == id) {
                  let attribute = undefined;
                  if (this.selectedEntities[i] && DataHelper.isValidObjectPath(this.selectedEntities[i], "data.attributes")) {
                      attribute = this.selectedEntities[i].data.attributes[attrName];
                  }
                  return attribute ? attribute.values[0].value : "Not found";
              }
          }
      }
  }

  _onTransitionSuccess(e, detail) {
      //Todo: Handle bulk messages here
      let request = e.detail.request;
      let responseList = e.detail.response;
      this._responseMessages = [];

      for (let i = 0; i < responseList.length; i++) {
          //set id
          let transitionResponse = {
              "Entity Id": responseList[i].id
          };

          let response = DataHelper.isValidObjectPath(responseList[i], "operationResponse.response") ?
              responseList[i].operationResponse.response : {};

          //set text
          if (!_.isEmpty(response) && response.status.toLowerCase() == "success") {
              // Success - isCriteriaValid as false
              if (response.statusDetail &&
                  response.statusDetail.hasOwnProperty('isCriteriaValid') && !response.statusDetail.isCriteriaValid
              ) {
                  let actionItem = "Workflow";

                  if (DataHelper.isValidObjectPath(request, "requestData.params.workflow")) {
                      let workflow = request.requestData.params.workflow;
                      if (DataHelper.isValidObjectPath(workflow, "activity.action")) {
                          actionItem = workflow.activity.action;
                      }
                  }

                  transitionResponse["Message"] = "'" + actionItem +
                      "' action failed. Check the business conditions in Summary tab";
              } else { //Success
                  transitionResponse["Message"] = response.statusDetail.message;
              }
          } else { //Error
              if (response.statusDetail && response.statusDetail.message) {
                  transitionResponse["Message"] = response.statusDetail.message;
              }
          }

          this._responseMessages.push(transitionResponse);
      }

      this._triggerFinishStep();
  }

  _onTransitionFailure(e, detail) {
      this._message = "An error occured in the transition process, contact administrator";
      this._loading = false;
      this.logError("WorkFlowTransitionError", "response", JSON.stringify(e.detail.response.reason.message));
  }

  _onAsyncTransitionSuccess(e) {
      let response = e.detail.response && e.detail.response.response ? e.detail.response.response : e
          .detail.response;
      let request = e.detail.response ? e.detail.response.request : undefined;

      if ((!response || _.isEmpty(response)) ||
          (DataHelper.isValidObjectPath(response, "dataObjectOperationResponse.status") && response.dataObjectOperationResponse
              .status.toLowerCase() == "error") ||
          (response.status && response.status.toLowerCase() == "error")) {
          this._message = "Bulk transition request failed";
          this._loading = false;
          return;
      } else {
          if (response.status && response.status.toLowerCase() == "success") {
              if (request && request.taskId) {
                  this._taskId = request.taskId;
              }
          }

          this._message = "Transition request triggered successfully";
          this._triggerFinishStep(true);
      }
  }

  _onAsyncTransitionFailure(e) {
      this._message = "An error occured in the transition process, contact administrator";
      this._loading = false;
      this.logError("WorkFlowTransitionError", "response", JSON.stringify(e.detail.response.reason.message));
  }

  _triggerFinishStep(isJob) {
      let noGrid = false;
      let message = "";
      let actions = [{
          "name": "goBack",
          "text": "Take me back to where I started",
          "isNotApp": true
      }];

      if (isJob) {
          noGrid = true;
          message = "Transition process is started, you can review the progress of the task " + this._taskId +
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
          message = "Transition process is started, refresh data grid after some time.";
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

      //Reset contextData, selectedEntities, currentWorkflow
      this.contextData = {};
      this.selectedEntities = [];
      this.currentWorkflow = {};
  }
}
customElements.define(RockWorkflowTransition.is, RockWorkflowTransition);
