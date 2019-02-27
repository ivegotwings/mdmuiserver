/** 
`rock-workflow-panel` Represents a component that renders a panel for the `workflow stepper` for the given entity.
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-helpers/data-request-helper.js';
import '../bedrock-helpers/data-merge-helper.js';
import '../bedrock-helpers/component-helper.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import '../liquid-entity-govern-data-get/liquid-entity-govern-data-get.js';
import '../liquid-entity-model-get/liquid-entity-model-get.js';
import '../liquid-rest/liquid-rest.js';
import '../pebble-stepper/pebble-stepper.js';
import '../pebble-stepper/pebble-step.js';
import '../pebble-button/pebble-button.js';
import '../pebble-textarea/pebble-textarea.js';
import '../pebble-accordion/pebble-accordion.js';
import '../pebble-spinner/pebble-spinner.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockWorkflowPanel
    extends mixinBehaviors([
        RUFBehaviors.UIBehavior,
        RUFBehaviors.ComponentContextBehavior
    ], PolymerElement) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-scroll-bar bedrock-style-grid-layout bedrock-style-padding-margin">
             :host {
                display: block;
                height: 100%;
                --rock-workflow-input-container-label: {
                    position: relative;
                }
            }

            #workflow-stepper {
                margin-top: 20px;
            }

            #workflow-description {
                padding: 10px;
            }

            #workflows-content {
                padding-top: 10px;
                height: 100%;
                overflow-y: auto;
            }

            .workflowtext {
                font-family: var(--default-font-family, 'Roboto,Helvetica,Arial,sans-serif');
                font-size: var(--font-size-sm, 12px);
                color: var(--primary-text-color, #212121);
            }

            .workflow-stepper {
                --pebble-connected-badge-width: 30px;
                --pebble-connected-badge-height: 30px;
                --connectorLine-width: 2px;
                --content-connectorLine-width: 2px;
                --pebble-connected-badge-fontSize: 14px;
            }

            pebble-step-details {
                margin-left: 5px;
            }

            pebble-stepper {
                --stepper-horizontal: {
                    font-size: var(--default-font-size, 14px) !important;
                }
            }

            .step-details {
                color: var(--palette-steel-grey, #75808b);
                font-size: var(--font-size-sm, 12px)!important;
                padding-right: 10px;
                width: 216px;
            }

            .view-changes {
                text-decoration: none;
                float: right;
            }

            .user {
                text-decoration: none;
            }

            #step-comments {
                margin-top: 20px;
            }

            .user-image {
                width: 15px;
                height: 15px;
                background: #ddd;
                margin-right: 10px;
                margin-top: 1px;
            }

            .user-details {
                width: calc(100% - 30px);
                display: inline-block;
                vertical-align: top;
            }

            pebble-textarea {
                --paper-input-container-label: {
                    font-size: var(--default-font-size, 14px)!important;
                }
                --paper-input-container-input: {
                    font-size: var(--default-font-size, 14px)!important;
                }
            }

            #step-actions {
                padding: 12px 0px 8px 0px;
            }

            #step-actions pebble-button {
                margin-right: 10px;
                margin-bottom: 10px;
            }

            pebble-accordion {
                height:auto;
                margin-bottom: 10px;
            }

            .step-description {
                padding: 10 0px;
            }
        </style>
        <pebble-spinner active="[[_loading]]"></pebble-spinner>
        <liquid-rest id="entityStartWorkflow" url="/data/pass-through/entitygovernservice/startworkflow" method="POST" request-data="{{_invokeWorkflowRequest}}" last-response="{{_invokeWorkflowResponse}}" on-liquid-response="_onWfStartSuccess" on-liquid-error="_onWfStartFailure"></liquid-rest>
        <liquid-entity-model-get id="getWorkflowMappingDefinition" operation="getbyids" request-id="req1" on-response="_onWfMappingsReceived" on-error="_onMappingsGetFailed"></liquid-entity-model-get>
        <liquid-entity-model-get id="entityGetWorkflowDefinition" operation="getbyids" request-id="req1" on-response="_onDefinitionReceived" on-error="_onDefinitionGetFailed"></liquid-entity-model-get>
        <liquid-entity-govern-data-get id="entityGetRunningInstance" operation="getbyids" request-id="req2" on-response="_onRunningInstanceReceived" on-error="_onRunningInstanceGetFailed" no-cache=""></liquid-entity-govern-data-get>
        <liquid-rest id="entityWfEventsGet" url="/data/pass-through/eventservice/get" method="POST" on-liquid-response="_onEventsGetResponse" on-liquid-error="_onEventsGetFailure"></liquid-rest>
        <liquid-rest id="entityWfTransition" url="/data/pass-through/entitygovernservice/transitionWorkflow" method="POST" on-liquid-response="_onTransitionSuccess" on-liquid-error="_onTransitionFailure"></liquid-rest>
        <pebble-button id="invokeButton" disabled="[[readonly]]" hidden="" raised="" class="iconButton btn btn-outline-primary m-r-5" button-text="Start Workflow" on-tap="_onInvokeWorkflow"></pebble-button>
        <bedrock-pubsub event-name="workflow-refresh" handler="_refresh"></bedrock-pubsub>
        <div class="base-grid-structure">
            <div class="base-grid-structure-child-1">
                <div id="workflowPanelMessage" class="default-message"></div>
            </div>
            <div class="base-grid-structure-child-2">
                <template is="dom-if" if="{{hasComponentErrored(isComponentErrored)}}">
                    <div id="error-container"></div>
                </template>

                <template is="dom-if" if="{{!hasComponentErrored(isComponentErrored)}}">
                    <div id="workflows-content">
                        <template is="dom-if" if="[[_showWorkflow]]">
                            <template id="workflowsTemplate" is="dom-repeat" items="[[_workflowsData]]" as="_workflowstepperData">
                                <pebble-accordion header-text="[[_workflowstepperData.workflowTitle]]">
                                    <div slot="accordion-content">
                                        <div id="workflow-description">
                                            <span class="workflowtext">[[_getWorkFlowDescription(_workflowstepperData)]]</span>
                                        </div>
                                        <div id="workflow-stepper_[[_workflowstepperData.workflowId]]" class="workflow-content">
                                            <pebble-stepper id="workflowStepper_[[_workflowstepperData.workflowId]]" stepper-config="[[_workflowstepperData]]">
                                                <template is="dom-repeat" items="[[_workflowstepperData.items]]" as="item">
                                                    <pebble-step class="workflow-stepper" data="{{item}}">
                                                        <div slot="step-badge-content" class="step-badge-content">
                                                            <template is="dom-if" if="[[_userHasImage()]]">
                                                                <img class="user-image" atl="No photo" src="/src/images/no-photo.jpg">
                                                            </template>
                                                            <template is="dom-if" if="[[!_userHasImage()]]">
                                                                <span class="user-details">[[item.index]]</span>
                                                            </template>
                                                        </div>
                                                        <div slot="step-details" class="step-details">
                                                            <div id="step-description">
                                                                <span>[[item.stepDetails.description]]</span>
                                                            </div>
                                                            <template is="dom-if" if="[[_stepHasDetails(item.stepDetails, item.status)]]">
                                                                <div id="action-details">
                                                                    <img class="user-image" alt="No photo" src="/src/images/no-photo.jpg">
                                                                    <span class="user-details">
                                                                            <span class="user">[[_getAssignedUserName(item.stepDetails.assignedUser)]]</span>[[item.stepDetails.details]]</span>
                                                                    <span hidden="" class="view-changes">View all changes »</span>
                                                                </div>
                                                            </template>
                                                            <template is="dom-if" if="[[_isCommentsEnabled(item)]]">
                                                                <div id="step-comments">
                                                                    <pebble-textarea id="stepComments-[[item.id]]" required="[[_isRequired(item.stepDetails)]]" disabled="[[_isDisabled(item)]]" autofocus="" label="Add a comment" invalid="" error-message="Comments Required." value=""></pebble-textarea>
                                                                </div>
                                                                <div id="step-actions">
                                                                    <template is="dom-repeat" items="[[item.stepDetails.actions]]" as="button">
                                                                        <pebble-button class\$="[[_getActionButtonClass(button)]]" raised="" icon="[[button.actionIcon]]" button-text="[[button.action]]" on-tap="_onStepActionTap" data="[[_getDataforButton(button, item.id, _workflowstepperData.workflowId)]]" disabled="[[_isDisabled(item)]]"></pebble-button>
                                                                    </template>
                                                                </div>
                                                            </template>
                                                        </div>
                                                    </pebble-step>
                                                </template>
                                            </pebble-stepper>
                                        </div>
                                    </div>
                                </pebble-accordion>
                            </template>
                        </template>
                    </div>
                </template>
            </div>
        </div>
`;
  }

  static get is() { return 'rock-workflow-panel' }
  static get properties() {
      return {
          _workflowsData: {
              type: Array,
              value: function () { return []; }
          },
          /**
           * If set as true , it indicates the component is in read only mode
          */
          readonly: {
              type: Boolean,
              value: false
          },
          _invokeWorkflowRequest: {
              type: Object,
              value: function () { return {}; }
          },
          _runningInstances: {
              type: Array,
              value: function () { return []; }
          },
          _mappedWorkflowNames: {
              type: Array,
              value: function () { return []; }
          },
          _loading: {
              type: Boolean,
              value: false
          },
          _showWorkflow: {
              type: Boolean,
              value: true
          },
          contextData: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          clonedContextData: {
              type: Object,
              value: function () {
                  return {};
              }
          }
      }
  }

  /**
    * <b><i>Content development is under progress... </b></i> 
    */
  refresh () {
      this._loading = true;
      this._contextChanged(this.contextData);
  }
  _refresh (event) {
      if (event) {
          this.contextData = event.detail.contextData;
          this.refresh();
      }
  }
  ready () {
      super.ready();
      this.refresh();
  }

  get workflowMappingDefinitionLiq() {
      this._workflowMappingDefinitionLiq = this._workflowMappingDefinitionLiq || this.shadowRoot.querySelector('#getWorkflowMappingDefinition');
      return this._workflowMappingDefinitionLiq;
  }

  get entityWfEventsGetLiq() {
      this._entityWfEventsGetLiq = this._entityWfEventsGetLiq || this.shadowRoot.querySelector("#entityWfEventsGet");
      return this._entityWfEventsGetLiq;
  }

  get entityWfTransitionLiq() {
      this._entityWfTransitionLiq = this._entityWfTransitionLiq || this.shadowRoot.querySelector("#entityWfTransition");
      return this._entityWfTransitionLiq;
  }

  get entityGetRunningInstanceLiq() {
      this._entityGetRunningInstanceLiq = this._entityGetRunningInstanceLiq || this.shadowRoot.querySelector('#entityGetRunningInstance');
      return this._entityGetRunningInstanceLiq;
  }

  get entityGetWorkflowDefinitionLiq() {
      this._entityGetWorkflowDefinitionLiq = this._entityGetWorkflowDefinitionLiq || this.shadowRoot.querySelector("#entityGetWorkflowDefinition");
      return this._entityGetWorkflowDefinitionLiq;
  }

  _contextChanged (contextData) {
      if (!_.isEmpty(this.contextData)) {
          this._workflowsData = [];
          this.clonedContextData = DataHelper.cloneObject(this.contextData);
          this.workflowMappingDefinitionLiq.requestData = DataRequestHelper.createWorkflowMappingGetRequest(this.clonedContextData);
          this.workflowMappingDefinitionLiq.generateRequest();
      } else {
          this._loading = false;
      }
  }
  _onWfMappingsReceived (e) {
      if(DataHelper.isValidObjectPath(e.detail, "response.content.entityModels") && !_.isEmpty(e.detail.response.content.entityModels)) {
          let mappingModels = e.detail.response.content.entityModels;
          let wfDefinitionMappingModel = mappingModels.find(obj => obj.type == "workflowDefinitionMapping");
          let workflowContexts = ContextHelper.createWorkflowContexts(wfDefinitionMappingModel, this.clonedContextData);
          let itemContext = ContextHelper.getFirstItemContext(this.clonedContextData);
          itemContext.workflowContexts = workflowContexts;
          if (!_.isEmpty(workflowContexts)) {
              this.entityWfEventsGetLiq.requestData = DataRequestHelper.createWorkflowEventsGetRequest(this.clonedContextData);
              this.entityWfEventsGetLiq.generateRequest();
          } else {
              this._showMessagePanel(true);
          }
          return;
      } else {
          this.logError("WorkFlow mapping models not found", e.detail);
          this._showMessagePanel(true);
      }

      this._loading = false;
  }
  _onMappingsGetFailed (e) {
      this.logError("WorkFlowMappingError", e.detail, true);
  }

  _onEventsGetFailure(e) {
      this.logError("_onEventsGetFailure", e.detail, true);
      this.set("_workflowPastEvents", {});
      this.entityGetRunningInstanceLiq.requestData = DataRequestHelper.createWorkflowRuntimeInstanceGetRequest(this.clonedContextData);
      this.entityGetRunningInstanceLiq.generateRequest();
  }
  _onEventsGetResponse (e) {
      let workflowEventsResponse = e.detail.response;
      let activitySequence = 0;
      let workflowPastEvents = {};
      if (workflowEventsResponse && workflowEventsResponse.response && workflowEventsResponse.response.events && workflowEventsResponse.response.events.length > 0) {
          let wfEvents = workflowEventsResponse.response.events;
          for (let i = 0; i < wfEvents.length; i++) {
              let wfEvent = wfEvents[i];
              if (wfEvent && wfEvent.data && wfEvent.data.contexts && wfEvent.data.contexts.length > 0) {
                  let context = wfEvent.data.contexts[0].context;
                  let attributes = wfEvent.data.contexts[0].attributes;
                  let workflow = context.workflow;
                  let activity = DataHelper.isValidObjectPath(attributes, "activities.group.0") ? attributes.activities.group[0] : {};
                  if (!_.isEmpty(activity)) {
                      let activityStatus = AttributeHelper.getFirstAttributeValue(activity.status);
                      if (activityStatus == "Closed") {
                          let activityEndDateTime = AttributeHelper.getFirstAttributeValue(activity.endDateTime);
                          let parsedDateTime = Date.parse(activityEndDateTime);
                          activity["parsedEndDateTime"] = parsedDateTime;
                          let workflowInstanceId = AttributeHelper.getFirstAttributeValue(activity.workflowInstanceId);
                          if (!workflowPastEvents[workflow]) {
                              workflowPastEvents[workflow] = {};
                          }
                          if (!workflowPastEvents[workflow][workflowInstanceId]) {
                              workflowPastEvents[workflow][workflowInstanceId] = {
                                  "attributes": {
                                      "activities": {
                                          "group": []
                                      }
                                  }
                              };
                          }
                          workflowPastEvents[workflow][workflowInstanceId].attributes.activities.group.push(activity);
                      }
                  }
              }
          }
      } else {
          this.logError("_onEventsGetResponse", e.detail);
      }

      for (let workflow in workflowPastEvents) {
          for (let workflowInstanceId in workflowPastEvents[workflow]) {
              let workflowPastEventsPerInstance = workflowPastEvents[workflow][workflowInstanceId];
              if(DataHelper.isValidObjectPath(workflowPastEventsPerInstance, "attributes.activities.group.0")) {
                  let workflowPastEventsGroup = workflowPastEventsPerInstance.attributes.activities.group;
                  workflowPastEventsGroup.sort(function (a, b) {
                      return a.parsedEndDateTime - b.parsedEndDateTime;
                  });
                  for (let i = 0; i < workflowPastEventsGroup.length; i++) {
                      workflowPastEventsGroup[i]["sequence"] = { "values": [{ "value": i + 1 }] };
                  }
              }
          }
      }
      this.set("_workflowPastEvents", workflowPastEvents);
      this.entityGetRunningInstanceLiq.requestData = DataRequestHelper.createWorkflowRuntimeInstanceGetRequest(this.clonedContextData);
      this.entityGetRunningInstanceLiq.generateRequest();
  }

  _getAssignedUserName(assignedUser) {
      if(assignedUser == "_UNASSIGNED") {
          return "Unassigned";
      } else {
          return assignedUser;
      }
  }
  _onRunningInstanceReceived (e) {
      let showInvokeButton = true;

      if (e.detail.response) {
          this.fireBedrockEvent("on-workflow-available", e.detail, { ignoreId: true });
          let runtimeInstanceEntities = e.detail.response && e.detail.response.content && e.detail.response.content.entities
              ? e.detail.response.content.entities : undefined;

          if (runtimeInstanceEntities && runtimeInstanceEntities.length > 0) {

              let runtimeInstanceEntity = runtimeInstanceEntities[0];

              if (runtimeInstanceEntity && runtimeInstanceEntity.data) {
                  let foundWorkflowNames = [];
                  let runningInstances = [];

                  //Note: Here, workflow runtime data would be always in the context of workflow so no need to check for data.attributes
                  let contexts = runtimeInstanceEntity.data && runtimeInstanceEntity.data.contexts ? runtimeInstanceEntity.data.contexts : [];

                  for (let i = 0; i < contexts.length; i++) {
                      let currContextItem = contexts[i];
                      let currContext = currContextItem.context;
                      let currWorkflowName = currContext.workflow;
                      let contextAttrs = currContextItem.attributes;

                      if (currWorkflowName) {
                          let runtimeInstance = {
                              "name": currWorkflowName,
                              "attributes": contexts[i].attributes
                          };

                          runningInstances[currWorkflowName] = runtimeInstance;
                          foundWorkflowNames.push(currWorkflowName);
                      }
                  }

                  if (foundWorkflowNames.length > 0) {
                      showInvokeButton = false;

                      this.set("_runningInstances", runningInstances);

                      let itemContext = ContextHelper.getFirstItemContext(this.clonedContextData);
                      itemContext.workflowNames = foundWorkflowNames;

                      this.entityGetWorkflowDefinitionLiq.requestData = DataRequestHelper.createWorkflowDefinitionGetRequest(this.clonedContextData);
                      this.entityGetWorkflowDefinitionLiq.generateRequest();
                  }
              }
          }
      }

      if(showInvokeButton) {
          this.logError(" Entity govern data: ", e.detail);
      }

      this._showMessagePanel(showInvokeButton);
  }
  _onRunningInstanceGetFailed (e) {
      this.logError("Entity Governdata get Error:- Failed to get govern data", e.detail, true);
  }
  _onDefinitionReceived (e) {
      let workflowDefinitionResponse = e.detail.response;
      if (workflowDefinitionResponse && workflowDefinitionResponse.content &&
          workflowDefinitionResponse.content.entityModels &&
          workflowDefinitionResponse.content.entityModels.length > 0) {
          let workflowData = [];

          for (let i = 0; i < workflowDefinitionResponse.content.entityModels.length; i++) {
              let entityModel = workflowDefinitionResponse.content.entityModels[i];
              let workflowName = entityModel.name;

              if (entityModel.data && entityModel.data.attributes) {

                  let wfAttributes = entityModel.data.attributes;

                  let riAttributes = this._runningInstances[workflowName].attributes;

                  let workflowInstanceId = AttributeHelper.getFirstAttributeValue(riAttributes.workflowInstanceId);

                  let attributesPath = workflowName + "." + workflowInstanceId + ".attributes";
                  let wfPastAttributes = DataHelper.isValidObjectPath(this._workflowPastEvents, attributesPath) && this._workflowPastEvents[workflowName][workflowInstanceId].attributes ? this._workflowPastEvents[workflowName][workflowInstanceId].attributes : {};

                  let _stepperData = this._transformEntityResponseToStepperJson(wfPastAttributes, wfAttributes, riAttributes, workflowName);

                  workflowData.push(_stepperData);
              } else {
                  this.logError('entityModel has no data ', e.detail, true);
              }
          }
          this.set("_workflowsData", workflowData);
          this.shadowRoot.querySelector("#workflowsTemplate").render();
          //this._loading = false;
          setTimeout(() => {
              let stepper = this.shadowRoot.querySelector("#workflow-stepper_" + workflowData[0].workflowId);
              if (stepper) {
                  let step = stepper.querySelector('pebble-step[opened]');
                  if (step) {
                      step.scrollIntoView(false);
                  }
              }
          }, 1000);//ToDo: need to figure out better way. As of now delay to let the stepper to load with workflow data properly.
      } else {
          this.logError('workflow definition get failed with error ', e.detail, true);
      }
  }
  _onDefinitionGetFailed (e) {
      this.logError('workflow definition get failed with error ', e.detail, true);
  }
  _transformEntityResponseToStepperJson (wfPastAttributes, wfAttributes, riAttributes, workflowName) {
      if (wfPastAttributes && wfAttributes && riAttributes) {
          let riActivities = riAttributes.activities;
          let wfActivities = wfAttributes.activities;
          //To solve creation of duplicate steps because of multiple refresh calls.
          if (_.isEmpty(wfPastAttributes)) {
              wfPastAttributes = {
                  "activities": {
                      "group": []
                  }
              };
          }
          let attributes = DataHelper.cloneObject(wfPastAttributes);
          let wfPastActivities = wfPastAttributes.activities;

          let riActivity = undefined;
          let riActivityName = undefined;
          let riActivityStatus = undefined;
          let activitySequence = 0;

          if (riActivities) {
              let keys = Object.keys(riAttributes);

              for (let i = 0; i < keys.length; i++) {
                  let key = keys[i];
                  if (key != "activities") {
                      attributes[key] = riAttributes[key];
                  }
              }

              let recentActivity = undefined;
              if (wfPastActivities && wfPastActivities.group && wfPastActivities.group.length > 0) {
                  recentActivity = wfPastActivities.group[wfPastActivities.group.length - 1];
              }

              if (recentActivity) {
                  activitySequence = AttributeHelper.getFirstAttributeValue(recentActivity.sequence);
              }

              attributes["workflowName"] = wfAttributes["workflowName"];
              riActivity = riActivities.group[0];

              riActivityName = AttributeHelper.getFirstAttributeValue(riActivity.activityName);
              riActivityStatus = AttributeHelper.getFirstAttributeValue(riActivity.status);
          } else {
              this._showMessagePanel(true);
          }

          let currentActivityIndex = -1;

          if (wfActivities) {
              for (let i = 0; i < wfActivities.group.length; i++) {
                  let wfActivity = wfActivities.group[i];

                  let wfActivityName = AttributeHelper.getFirstAttributeValue(wfActivity.activityName);
                  let wfActivityExternalName = AttributeHelper.getFirstAttributeValue(wfActivity.externalName);
                  if (riActivityName == wfActivityName) {
                      currentActivityIndex = i;
                      if (riActivityStatus && (riActivityStatus == "Executing" || riActivityStatus == "AssignmentChange")) {
                          riActivity["activityDescription"] = wfActivity["activityDescription"];
                          riActivity["allowedRoles"] = wfActivity["allowedRoles"];
                          riActivity["actions"] = wfActivity["actions"];
                          riActivity["sequence"] = { "values": [{ "value": ++activitySequence }] };
                          riActivity["externalName"] = wfActivity.externalName;

                          attributes.activities.group.push(riActivity);
                      }
                  } else if (currentActivityIndex > -1) {
                      wfActivity["sequence"] = { "values": [{ "value": ++activitySequence }] };
                      wfActivity.actions = {};
                      attributes.activities.group.push(wfActivity);
                  }
              }
          } else {
              this._showMessagePanel(true);
          }

          if (attributes) {
              let workflowActivites = attributes.activities;
              if (workflowActivites) {
                  let workflowActivitiesGroup = workflowActivites.group;
                  if (workflowActivitiesGroup && workflowActivitiesGroup instanceof Array) {
                      for (let j = 0; j < workflowActivitiesGroup.length; j++) {
                          let activityName = AttributeHelper.getFirstAttributeValue(workflowActivitiesGroup[j].activityName);
                          let activityStatus = AttributeHelper.getFirstAttributeValue(workflowActivitiesGroup[j].status);
                          let workflowActivity = wfActivities.group.find(obj => AttributeHelper.getFirstAttributeValue(obj.activityName) == activityName);
                          if (workflowActivity && !DataHelper.isEmptyObject(activityStatus)) {
                              attributes.activities.group[j]["externalName"] = workflowActivity.externalName;
                          }
                      }
                  }
              }

              let config = {
                  "workflowId": workflowName + "_workflowDefinition",
                  "workflowName": workflowName,
                  "workflowTitle": AttributeHelper.getFirstAttributeValue(attributes.workflowName),
                  "startDateTime": AttributeHelper.getFirstAttributeValue(attributes.startDateTime),
                  "endDateTime": AttributeHelper.getFirstAttributeValue(attributes.endDateTime),
                  "status": AttributeHelper.getFirstAttributeValue(attributes.status),
                  "items": []
              };

              let activities = attributes.activities;
              let items = [];

              for (let i = 0; i < activities.group.length; i++) {
                  let k = activities.group.length - 1;
                  let group = activities.group[k - i];

                  let actions = [];
                  if (group && group.actions && group.actions.group && group.actions.group.length) {
                      for (let j = 0; j < group.actions.group.length; j++) {
                          let actionsGroup = group.actions.group[j];

                          let action = {
                              "action": AttributeHelper.getFirstAttributeValue(actionsGroup.actionText),
                              "event": AttributeHelper.getFirstAttributeValue(actionsGroup.actionName),
                              "commentsMode": AttributeHelper.getFirstAttributeValue(actionsGroup.commentsMode),
                              "happyPath": AttributeHelper.getFirstAttributeValue(actionsGroup.happyPath)
                          };
                          actions.push(action);
                      }
                  }

                  let item = {
                      "id": AttributeHelper.getFirstAttributeValue(group.activityGuid),
                      "index": AttributeHelper.getFirstAttributeValue(group.sequence),
                      "activityName": AttributeHelper.getFirstAttributeValue(group.activityName),
                      "title": AttributeHelper.getFirstAttributeValue(group.externalName),
                      "subtitle": this._getItemSubtitle(group.performedAction, group.endDateTime),
                      "status": this._getItemStatus(group.status),
                      "selected": this._getSelected(group.status),
                      "workflowName": workflowName,
                      "allowedRoles": group.allowedRoles
                  };
                  item["stepDetails"] = this._getItemFullDetails(item, group, actions);
                  items.push(item);
              }

              config.items = items;

              return config;
          } else {
              this._showMessagePanel(true);
          }
      }
  }
  _getWorkFlowDescription (config) {
      let description = "";
      if (config) {
          if (config.status == "Completed") {
              description = "The workflow completed on " + this._formatDate(config.endDateTime) + ".";
          }
          else if (config.status == "Executing") {
              description = "The workflow started on " + this._formatDate(config.startDateTime) + ".";
          }
      }
      return description;
  }
  _getItemSubtitle (action, endDateTime) {
      let lastAction = AttributeHelper.getFirstAttributeValue(action);
      let endDate = AttributeHelper.getFirstAttributeValue(endDateTime);
      if (lastAction && endDate) {
          return '"' + lastAction + '"' + " on " + this._formatDate(endDate);
      }
      return null;
  }
  _onStepActionTap (e) {
      if (e.currentTarget.disabled == true) {
          return;
      }

      this._loading = true;
      let data = e.target.data;
      let commentsEl = this.shadowRoot.querySelector("#stepComments-" + data.id);
      let currentStepItem = this.shadowRoot.querySelector("#workflowStepper_" + data.workflowId).selectedItem;
      let stepComments = "";
      let curretStepDetails;
      let currentWorkflowName;
      let currentStepData;

      if (currentStepItem) {
          currentStepData = currentStepItem.data;
          currentWorkflowName = currentStepData.workflowName;
          curretStepDetails = currentStepData.stepDetails;
      }

      let isCommentsRequired;
      if (curretStepDetails && curretStepDetails.actions && curretStepDetails.actions.length && curretStepDetails.actions.length > 0) {
          for (let i = 0; i < curretStepDetails.actions.length; i++) {
              let action = curretStepDetails.actions[i];
              let actionName = action.event;
              if (actionName == data.event) {
                  let commentsMode = action.commentsMode;
                  if (commentsMode == "Mandatory") {
                      isCommentsRequired = true;
                  }

                  break;
              }
          }
      }

      if (commentsEl) {
          stepComments = commentsEl.value;
          if (isCommentsRequired && stepComments == "") {
              commentsEl.invalid = true;
              this._loading = false;
              return;
          }

          commentsEl.invalid = false;
      }

      let firstItemContext = ContextHelper.getFirstItemContext(this.clonedContextData);
      firstItemContext.transitionTo = {
          "workflowName": currentWorkflowName,
          "activityName": currentStepData.activityName,
          "action": data.event,
          "comments": stepComments
      };

      let workflowTransitionRequestDataJson = DataRequestHelper.createWorkflowTransitionRequest(this.clonedContextData);

      data = {};
      let workflowContexts = firstItemContext.workflowContexts;
      if(!_.isEmpty(workflowContexts)) {
          let mappedWorkflowContext = workflowContexts.find(obj => obj.workflow === currentWorkflowName);
          data = ContextHelper.createContextForWorkflowActions(mappedWorkflowContext);
      }

      if(!_.isEmpty(data)) {
          workflowTransitionRequestDataJson.entity["data"] = data;
      }

      //Add hotline flag if hotline is enabled
      if (DataHelper.isHotlineModeEnabled()) {
          workflowTransitionRequestDataJson.hotline = true;
      }

      this.entityWfTransitionLiq.requestData = workflowTransitionRequestDataJson;
      this.entityWfTransitionLiq.generateRequest();
      //this._loading = true;
  }
  _onTransitionSuccess (e) {
      let request = e.detail.request;
      let response = e.detail.response.response; //need to check why this is response.response
      if (response && response.status && response.status.toLowerCase() == "error") {
          let message = "";
          if (response.statusDetail && response.statusDetail.message) {
              message = " with message: " + response.statusDetail.message;
          }
          this.logError("Workflow action failed " + message, e.detail);
          this._loading = false;
          return;
      }
      if (response && response.statusDetail && response.statusDetail.isCriteriaValid == false) {
          let actionItem = "Workflow";

          if (request.requestData && request.requestData.params && request.requestData.params.workflow) {
              let workflow = request.requestData.params.workflow;
              if (workflow && workflow.activity && workflow.activity.action) {
                  actionItem = workflow.activity.action;
              }
          }

          this.logError("'" + actionItem + "' action failed. Check the business conditions in Summary tab.", e.detail);
          this.showWarningToast("'" + actionItem + "' action failed. Check the business conditions in Summary tab.");
          this._loading = false;
      } else {
          setTimeout(() => {
              this.showSuccessToast("Workflow action completed succesfully.");
              this.entityGetRunningInstanceLiq.generateRequest();
          }, 6000)
      }
  }
  _onTransitionFailure (e) {
      this.logError("WorkFlowTransitionError:- Failed to perform the workflow transition", e.detail);
  }
  _getItemStatus (stepStatus) {
      let status = AttributeHelper.getFirstAttributeValue(stepStatus);
      if (status) {
          if (status == "Closed") {
              return "completed";
          }
          else if (status == "Executing" || status == "AssignmentChange") {
              return "inprogress";
          }
          else if (status == "Faulted") {
              return "failed";
          }
      }

      return "pending";
  }
  _getSelected (stepStatus) {
      let status = AttributeHelper.getFirstAttributeValue(stepStatus);
      return status && status == "Executing" || status == "AssignmentChange";
  }
  _showMessagePanel (show) {
      let workflowPanelMessage = this.shadowRoot.querySelector("#workflowPanelMessage");
      if (workflowPanelMessage) {
          if (show) {
              workflowPanelMessage.textContent = "No workflows for the entity in current context";
              workflowPanelMessage.removeAttribute("hidden");
          } else {
              workflowPanelMessage.textContent = "";
              workflowPanelMessage.setAttribute("hidden", "");
          }
          this._showWorkflow = !show;
      }
      this._loading = false;
  }
  _onInvokeWorkflow (e) {

      if (e.currentTarget.disabled == true) {
          return;
      }
      let firstWorkflowName = this._mappedWorkflowNames[0]; //TODO:: Ehance invoke button to pass workflow name in event..

      let firstItemContext = ContextHelper.getFirstItemContext(this.clonedContextData);

      firstItemContext.invokeWorkflowData = {
          "workflowName": firstWorkflowName
      };

      let invokeWorkflowRequest = DataRequestHelper.createInvokeWorkflowRequest(this.clonedContextData);

      this.set("_invokeWorkflowRequest", invokeWorkflowRequest);
      this.shadowRoot.querySelector("#entityStartWorkflow").generateRequest();
      //this._loading = true;
  }
  _onWfStartSuccess (e) {
      let response = e.detail.response;
      if (response) {
          setTimeout(() => {
              this.entityGetRunningInstanceLiq.generateRequest();
          }, 3000);
      } else {
          this.logError("WorkFLowStartFail:- Failed to start the workflow", e.detail, true);
      }
  }
  _onWfStartFailure (e) {
      this.logError("WorkFLowStartFail:- Failed to start the workflow", e.detail, true);
      this._loading = false;
  }
  _userHasImage () {
      //ToDOality to get assigned user of item, get user preferences what to show in
      // step badge and get details of the content to be shown.
  }
  _getItemFullDetails (stepItem, currentActivity, actions) {
      if (stepItem && currentActivity) {

          let itemDetailsJson = {};

          let itemDescription = AttributeHelper.getFirstAttributeValue(currentActivity.activityDescription);

          let itemDetail = this._getItemDetail(stepItem.workflowName, currentActivity, stepItem.status);
          let assignedUser = AttributeHelper.getFirstAttributeValue(currentActivity.assignedUser);
          itemDetailsJson["description"] = itemDescription;
          itemDetailsJson["assignedUser"] = assignedUser;
          itemDetailsJson["details"] = itemDetail;
          itemDetailsJson["actions"] = actions;

          return itemDetailsJson;
      }
  }
  _getItemDetail (workflowName, group, stepStatus) {
      let activityName = AttributeHelper.getFirstAttributeValue(group.activityName);
      let startDate = AttributeHelper.getFirstAttributeValue(group.startDateTime);
      let endDate = AttributeHelper.getFirstAttributeValue(group.endDateTime);
      let lastAction = AttributeHelper.getFirstAttributeValue(group.performedAction);
      let comments = AttributeHelper.getFirstAttributeValue(group.comments);
      let assignedUser = AttributeHelper.getFirstAttributeValue(group.assignedUser);
      let itemDetail = "";
      if (stepStatus == "inprogress") {
          if (!assignedUser || assignedUser == "_UNASSIGNED") {
              itemDetail = "";
          } else {
              itemDetail = "  was assigned task on " + this._formatDate(startDate) + ".";
          }
      }
      if (stepStatus == "failed") {
          itemDetail = "  was failed due to technical reason.";
      }
      if (stepStatus == "completed") {
          let msg = "";
          if (comments && comments != "") {
              msg = "the comment " + comments;
          } else {
              msg = "no comments.";
          }
          itemDetail = ' "' + lastAction + '"' + " on " + this._formatDate(endDate) + " with " + msg + ".";
      }
      return itemDetail;
  }
  _getSLADate (date, days) {
      let result = new Date(moment(date).add(days, 'day'));
      result = moment(result).format('DD/MM/YYYY hh:mm A')
      return result;
  }
  _formatDate (date) {
      if (date) {
          let result = FormatHelper.convertFromISODateTimeToClientFormat(date, "datetime");
          return result;
      }
  }
  _isCommentsEnabled (item) {
      return (item &&
          item.stepDetails &&
          item.stepDetails.actions &&
          item.stepDetails.actions.length &&
          item.status == "inprogress");
  }
  _stepHasDetails (stepDetails, status) {
      return (stepDetails && (stepDetails.assignedUser || stepDetails.details) && status != "pending");
  }
  _isRequired (stepDetails) {
      let required = false;
      if (stepDetails && stepDetails.actions && stepDetails.actions.length) {
          required = !!stepDetails.actions.find(action => action.commentsMode === "Mandatory");
      }

      return required;
  }
  _getActionButtonClass (action) {
      if (action) {
          if (action.happyPath) {
              return "action-button-focus dropdownText btn btn-success m-r-5";
          }

          return "action-button btn btn-secondary";
      }
  }
  _getDataforButton (button, id, workflowId) {
      let data = {
          "event": button.event,
          "id": id,
          "workflowId": workflowId
      };
      return data;
  }
  _isDisabled (item) {
      if (item && item.allowedRoles) {
          if (this._getWritePermission() === false) {
              return true;
          }

          let currentUserRoles = DataHelper.getUserRoles();
          if (typeof (currentUserRoles) === "undefined") {
              return true;
          }
          let allowedRoles = undefined;
          if (item.allowedRoles.values) {
              allowedRoles = AttributeHelper.getAttributeValues(item.allowedRoles.values);
          }
          if (allowedRoles && allowedRoles.length) {
              let isRoleAllowed = allowedRoles.some(allowedRole => currentUserRoles.indexOf(allowedRole) > -1)
              if (isRoleAllowed) {
                  return false;
              }
          }
      }
      return true;
  }
  _getWritePermission () {
      let writePermission = true;
      let itemContext = ContextHelper.getFirstItemContext(this.clonedContextData);
      if (DataHelper.isValidObjectPath(itemContext, "permissionContext.writePermission")) {
          writePermission = itemContext.permissionContext.writePermission;
      }

      return writePermission;
  }
}
customElements.define(RockWorkflowPanel.is, RockWorkflowPanel);
