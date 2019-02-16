/**
@group rock Elements
@element rock-business-actions
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '../pebble-actions/pebble-actions.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../liquid-entity-model-get/liquid-entity-model-get.js';
import '../liquid-entity-model-composite-get/liquid-entity-model-composite-get.js';
import '../liquid-entity-govern-data-get/liquid-entity-govern-data-get.js';
import '../liquid-rest/liquid-rest.js';
import LiquidDataObjectUtils from '../liquid-dataobject-utils/liquid-dataobject-utils.js'
import '../bedrock-logger-behavior/bedrock-logger-behavior.js';
import '../bedrock-toast-behavior/bedrock-toast-behavior.js';
import EntityTypeManager from '../bedrock-managers/entity-type-manager.js';
import '../rock-component-config-behavior/rock-component-config-behavior.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockBusinessActions
extends mixinBehaviors([
    RUFBehaviors.AppBehavior,
    RUFBehaviors.ComponentContextBehavior,
    RUFBehaviors.ComponentConfigBehavior,
    RUFBehaviors.ToastBehavior,
    RUFBehaviors.LoggerBehavior
], PolymerElement) {
  static get template() {
    return html`
        <style include="bedrock-style-common">/* empt */</style>
        <template is="dom-if" if="{{hasComponentErrored(isComponentErrored)}}">
            <div id="error-container"></div>
        </template>
        
        <template is="dom-if" if="{{!hasComponentErrored(isComponentErrored)}}">
            <pebble-actions id="actionsButton" button-icon="[[buttonIcon]]" class="dropdownText dropdownIcon btn btn-actions dropdown-success" button-text="[[buttonText]]" actions-data="[[businessActions]]">
            </pebble-actions>
        </template>
            
        <bedrock-pubsub event-name="pebble-actions-action-click" handler="_onActionItemTap" target-id=""></bedrock-pubsub>
        <liquid-entity-model-get id="entityGetWorkflowDefinition" operation="getbyids" request-id="req1" request-data="{{workflowDefinitionRequest}}" on-response="_onDefinitionReceived" on-error="_onDefinitionGetFailed"></liquid-entity-model-get>
        <liquid-rest id="entityWfAssignment" url="/data/pass-through/entitygovernservice/workflowChangeAssignment" method="POST" request-data="{{_wfAssignmentRequest}}" on-liquid-response="_onAssignmentSuccess" on-liquid-error="_onAssignmentFailure"></liquid-rest>
`;
  }

  static get is() {
      return 'rock-business-actions'
  }
  static get properties() {
      return {
          contextData: {
              type: Object,
              value: function () {
                  return {};
              },
              observer: '_onContextDataChange'
          },
          showWorkflowActions: {
              type: Boolean,
              value: false
          },
          businessActions: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          buttonText: {
              type: String,
              value: "Actions"
          },
          buttonIcon: {
              type: String,
              value: "pebble-icon:action-take-task"
          },
          isSingleEntityProcess: {
              type: Boolean,
              value: false
          },
          workflowDefinitionRequest: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _wfAssignmentRequest: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          businessActionsConfig: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _runningInstances: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _maxAllowedEntitiesForPaste: {
              type: Number,
              value: 5
          },
          _currentWorkflowAction: {
              type: String
          },
          _failedWorkflows: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          _doneWorkflows: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          workflowInfo: {
              type: Object,
              value: function () {
                  return {};
              },
              observer: "_onWorkflowInfoChange"
          },
          contextModelType: {
              type: String,
              value: ""
          },
          asyncActions: {
              type: Array,
              value: function () {
                  return [
                      "action-takeTask",
                      "action-releaseTask",
                      "action-wfTransitions",
                      "action-add-context",
                      "action-reassignTask",
                      "action-view-snapshot",
                      "action-copy",
                      "action-paste",
                      "action-download",
                      "action-re-publish"
                  ];
              }
          }
      }
  }
  /**
   *
   */
  connectedCallback() {
      super.connectedCallback();
  }
  /**
   *
   */
  disconnectedCallback() {
      super.disconnectedCallback();
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

          this.requestConfig('rock-business-actions', context);
      }
  }

  onConfigLoaded(componentConfig) {
      if (componentConfig && componentConfig.config) {
          let actionGroups = [];
          if (componentConfig.config.actionGroups) {
              for (let key in componentConfig.config.actionGroups) {
                  let group = componentConfig.config.actionGroups[key];

                  if (!this.showWorkflowActions && group.isWorkflowActions) {
                      continue;
                  }

                  group.actions = DataHelper.convertObjectToArray(group.actions);
                  actionGroups.push(group);
              }
          }
          this.businessActions = actionGroups;
      } else {
              this.logError("rock-business-actions - Business actions not found in config", componentConfig, true);
          }
      //disable actions based on dimension selector selection status
      //pass all the actions you want to disable on multiple dimensions in actionsToDisable
      let actionsToDisable = ["snapshots"];
      this._disableActionsBasedOnContext(actionsToDisable);
  }

  async _preparePrimaryContexts() {
      this._primaryContexts = await ContextHelper.getPrimaryContexts(this.contextData, this.contextModelType);
  }

  _getEntityName() {
      if (!_.isEmpty(this.contextData)) {
          let itemContext = ContextHelper.getFirstItemContext(this.contextData);
          return itemContext.name || "";
      }
  }

  _disableActionsBasedOnContext(actionsToDisable) {
      let dataContext = this.getDataContexts();
      if (dataContext.length > 1) {
          this.businessActions.forEach(elm => {
              elm.actions.forEach(action => {
                  if (actionsToDisable.indexOf(action.name) !== -1) {
                      action.visible = false;
                  }
              });
          });
      }
  }

  _onWorkflowInfoChange() {
      if (this.isSingleEntityProcess && !_.isEmpty(this.workflowInfo)) {
          this._toggleActionItems();
      }
  }

  triggerProcess(selectedDetails, workflowCriterion) {
      if (!this._currentAction || !this._currentAction.data) return;

      let shouldOpenBusinessDialog = true;
      const {
          eventName,
          componentName,
          subComponentName
      } = this._currentAction.data;

      if (!eventName) {
          this.logError("Unknown action triggered, system cannot do the process.");
          return;
      }

      const {
          selectedItems,
          selectionMode,
          selectionQuery,
          copContext,
          selectedItemsCount
      } = selectedDetails;

      this._workflowCriterion = workflowCriterion || {};

      const asyncAvailable = (this.asyncActions.indexOf(eventName) != -1);

      if (!asyncAvailable || (asyncAvailable && selectionMode == "count")) {
          if (DataHelper.isEmptyObject(selectedItems)) {
              this.showWarningToast(
                  "Select at least one entity for which you want to perform this action."
              );
              return;
          }
      }

      if (asyncAvailable) {
          if (selectionMode == "query" && DataHelper.isEmptyObject(selectionQuery)) {
              this.showWarningToast(
                  "Selection query should be available for which you want to perform this action."
              );
              return;
          }
      } else if (!DataHelper.isEmptyObject(selectedItems) && (selectedItems.length > 20)) {
          this.showWarningToast("Maximum 20 entities can be selected.");
          return;
      }

      if (!DataHelper.isEmptyObject(selectedItems)) {
          this._selectedItems = selectedItems;
      }

      let detail = null;
      let sharedData = null;

      switch (eventName) {
          case 'action-takeTask':
              return this._showAssignmentDialog(this._currentAction, "take", selectionMode,
                  selectionQuery);
          case 'action-releaseTask':
              return this._showAssignmentDialog(this._currentAction, "release", selectionMode, selectionQuery);
          case 'action-reassignTask':
              return this._showAssignmentDialog(this._currentAction, "reassign", selectionMode,
                  selectionQuery);
          case 'action-compare-entities':
              return this._compareEntities();
          case 'action-wfTransitions': {
              //Fetch the wf details from the URL
              const {
                  userId,
                  workflowName,
                  wfActivityName,
                  workflowActivityName,
                  workflowActivityExternalName,
                  mappedContexts
              } = this._workflowCriterion;

              let title = DataHelper.concatValuesFromArray([
                  workflowName,
                  workflowActivityExternalName, 
                  ContextHelper.getDataContexts(this.contextData), 
                  this._selectedItems.length + " entities"
              ]);

              detail = {
                  name: componentName,
                  mergeTitle: true,
                  title: title
              };

              sharedData = {
                  "selection-mode": selectionMode,
                  "selection-query": selectionQuery,
                  "selected-entities": this._selectedItems,
                  "current-workflow": {
                      "name": workflowName,
                      "activityName": workflowActivityName,
                      "mappedContexts": mappedContexts
                  }
              };
              break;
          }
          case 'action-rollup': {
              detail = {
                  name: componentName,
                  subName: subComponentName,
                  mergeTitle: true,
                  title: this._selectedItems.length + " entities"
              };

              sharedData = {
                  "selected-entities": this._selectedItems
              };
              break;
          }
          case 'action-copy': {
              this._onCopyActionTap();  
              shouldOpenBusinessDialog = false;  
              break;
          }
          case 'action-paste': {
              detail = {
                  name: componentName,
                  subName: subComponentName,
                  mergeTitle: true,
                  title: this._selectedItems.length + " entities"
              };
              shouldOpenBusinessDialog = this._onPasteActionTap(detail);
              sharedData = {
                  "selected-items-for-paste": this._selectedItems,
                  "is-bulk-process": true
              };
              break;
          }
          case 'action-download': {
            detail = {
                name: componentName,
                subName: subComponentName,
                mergeTitle: true,
                title: DataHelper.concatValuesFromArray([ContextHelper.getDataContexts(this.contextData), this._selectedItems.length + " entities"])
            };                    

            if (this._selectedItems && this._selectedItems.length && this._selectedItems.length > 0 && this.contextData) {
                let seltemsCount = selectedItemsCount ? selectedItemsCount : this._selectedItems.length;
                shouldOpenBusinessDialog = true;   
                sharedData = {
                  "selection-query": selectionQuery,
                  "selection-mode": selectionMode,
                  "selected-entities": this._selectedItems,
                  "selected-items-count": seltemsCount,
                  "cop-context": copContext
                };                
              } else {
                this.showInformationToast("Select at least one entity from grid to download.");
              }
              break;
          }
          case 'action-re-publish': {
              detail = {
                  name: componentName,
                  subName: subComponentName,
                  mergeTitle: true,
                  title: this.isSingleEntityProcess ? this._getEntityName() : this._selectedItems.length + " entities"
              };

              sharedData = {
                  "selected-entities": this._selectedItems,
                  "selection-mode": selectionMode
              };
              break;
          }
          case 'action-matchandmerge': {
              if (!this._areSelectedEntitiesValidForMatchMerge()) {
                  let msg = !this.isSingleEntityProcess ?
                      "All selected entities should be of draft type for the review, select valid entities." :
                      "Entity should be of draft type for the review, select a valid entity. ";
                  this.showWarningToast(msg);
                  return;
              }
              detail = {
                  name: componentName,
                  subName: subComponentName,
                  mergeTitle: true,
                  title: this.isSingleEntityProcess ? this._getEntityName() : this._selectedItems.length + " entities"
              };
              sharedData = {
                  "source-entities": this._selectedItems
              };
              break;
          }
          case 'action-add-context': {
              let properties = this._currentAction.data.properties;
              let entityTypeManager = EntityTypeManager.getInstance();
              if (!properties || _.isEmpty(properties.allowedEntityTypes)) {
                  this.showWarningToast(
                      "Entities are not allowed for reclassification, contact administrator."
                  );
                  return;
              }

              let allowedTypesExtenalNamesList = properties.allowedEntityTypes.map(function (
                  entityType) {
                  return entityTypeManager.getTypeExternalNameById(entityType) || entityType;
              })
              if (!this._isSelectedItemsAllowed(properties.allowedEntityTypes)) {
                  this.showWarningToast("Only " + allowedTypesExtenalNamesList.join(", ") +
                      " entities can be reclassified, select allowed entities.");
                  return;
              }
              detail = {
                  name: componentName,
                  subName: subComponentName
              };
              let title = DataHelper.concatValuesFromArray([
                  this._currentAction.data.title, 
                  ContextHelper.getDataContexts(this.contextData),  
                  this._selectedItems.length + " entities"
              ]);
              sharedData = {
                  "title": title,
                  "selected-entities": this._selectedItems,
                  "selection-mode": selectionMode,
                  "selection-query": selectionQuery
              };
              break;
          }
          default: {
              this.showWarningToast("Not implemented, contact administrator.");
              break;
          }
      }
      if(shouldOpenBusinessDialog) {
          this.openBusinessFunctionDialog(detail, sharedData);
      }
  }

  _areSelectedEntitiesValidForMatchMerge() {
      let isValid = false;
      isValid = this._selectedItems.every(entity => {
          return /^rsdraft/i.test(entity.type);
      });
      return isValid;
  }

  _isSelectedItemsAllowed(allowedEntityTypes) {
      let allowed = true;
      for (let entityIdx = 0; entityIdx < this._selectedItems.length; entityIdx++) {
          if (this._selectedItems[entityIdx] && allowedEntityTypes.indexOf(this._selectedItems[
                  entityIdx].type) == -1) {
              allowed = false;
              break;
          }
      }

      return allowed;
  }

  _compareEntities() {
      let mainApp = RUFUtilities.mainApp;
      let dataRoute = this._currentAction.data.dataRoute;
      let entityIds = [];
      let entityTypes = [];

      this._selectedItems.forEach(function (selectedItem) {
          entityIds.push(selectedItem.id);

          if (entityTypes.indexOf(selectedItem.type) < 0) {
              entityTypes.push(selectedItem.type);
          }
      });

      let compareEntitiesContextId = ElementHelper.getRandomId();
      let compareEntititesContextData = {
          "entityIds": entityIds,
          "entityTypes": entityTypes,
          "contextData": this.contextData
      }

      sessionStorage.setItem(compareEntitiesContextId, JSON.stringify(compareEntititesContextData));
      ComponentHelper.setQueryParamsWithoutEncode({
          "compareEntitiesContextId": compareEntitiesContextId
      });
      mainApp.changePageRoutePath(dataRoute);
  }

  _showAssignmentDialog(detail, action, selectionMode, selectionQuery) {
      const {
          workflowName,
          workflowShortName,
          workflowActivityName,
          workflowActivityExternalName,
          mappedContexts
      } = this._workflowCriterion;

      let workflowInfo = [{
          "name": workflowShortName,
          "activityName": workflowActivityName,
          "context": mappedContexts[0]
      }];

      const sharedData = {
          "selection-mode": selectionMode,
          "selection-query": selectionQuery,
          "selected-entities": this._selectedItems,
          "assignment-action": action,
          "workflow-info": workflowInfo,
          "context-model-type": this.contextModelType
      };
      let dialogTitle = this._getTitleByAction(action);

      this.openBusinessFunctionDialog({
          name: detail.data.componentName,
          title: dialogTitle
      }, sharedData);
  }

  _getTitleByAction(action) {
      let dialogTitle = "";
      switch (action) {
          case "take":
              dialogTitle = "Take Task";
              break;
          case "release":
              dialogTitle = "Release Task";
              break;
          case "reassign":
              dialogTitle = "Reassign Task";
              break;
      }

      return dialogTitle;
  }

  _transformItemContextData() {
      let selectedItems;
      let attributeNames;
      if(DataHelper.isValidObjectPath(this, '_selectedItems.0.attributes')) {
          selectedItems = this._selectedItems[0];
          attributeNames = Object.keys(selectedItems.attributes)
      }
      let itemContextObject = {
          attributeNames: attributeNames,
          domain: selectedItems.domain,
          id: selectedItems.id,
          name: selectedItems.name,
          type: selectedItems.type
      }
      return itemContextObject;
  }

  _onCopyActionTap() {

      // prohibiting copy of more than 1 entity
      if(this._selectedItems.length!==1) {
          this.showWarningToast('Only one entity can be copied ');
          return;
      }
      let transFormedItemContextData = this._transformItemContextData();
      let transformedContext = DataHelper.cloneObject(this.contextData);
      transformedContext.ItemContexts = [transFormedItemContextData];
      //saving entity details in session storage so we can use this later for paste
      sessionStorage.setItem('copyEntityData', JSON.stringify(transformedContext));
      this.showSuccessToast('Entity copied successfully');
  }

  _checkDuplicateCopyPaste(copyEntityId, pasteEntityIds) {
      let stopPasteProcess = false;
      // logic to compare context
      let transFormedItemContextData = this._transformItemContextData();
      let transformedContext = DataHelper.cloneObject(this.contextData);
      transformedContext.ItemContexts = [transFormedItemContextData];
      let data = sessionStorage.getItem('copyEntityData');
      let parsedData;
      if (data) {
          parsedData = JSON.parse(data);
      } else {
          this.showWarningToast("No Item Copied");
          return
      }

      if (DataHelper.compareObjects(parsedData.Contexts, transformedContext.Contexts) && 
          DataHelper.compareObjects(parsedData.ValContexts, transformedContext.ValContexts)) {
          for (let index = 0; index < pasteEntityIds.length; index++) {
              if (pasteEntityIds[index] === copyEntityId) {
                  stopPasteProcess = true;
                  break;
              }
          }
      }
      return stopPasteProcess;
  }

  _onPasteActionTap(detail) {
      if (!detail) {
          return false;
      }

      //check for max entity paste limit 
      if(this._selectedItems.length>this._maxAllowedEntitiesForPaste) {
          this.showWarningToast("Cannot paste more than " + this._maxAllowedEntitiesForPaste + " entities at once");
          return false;
      }

      if(this._selectedItems.length<1) {
          this.showWarningToast("Select at least one entity for paste");
          return false;
      }

      //check to make sure user cannot copy and paste on same entity
      let data = sessionStorage.getItem('copyEntityData');
      let parsedData;
      if (data) {
          parsedData = JSON.parse(data);
      }

      let pasteEntityIds = this._selectedItems.map(elm => {
          return elm.id;
      })

      if (DataHelper.isValidObjectPath(parsedData, 'ItemContexts.0.id')) {
          let copyEntityId = parsedData.ItemContexts[0].id;
          let isSameEntityCopyAndPasted = this._checkDuplicateCopyPaste(copyEntityId, pasteEntityIds);
          if (isSameEntityCopyAndPasted) {
              this.showWarningToast("Cannot copy and paste on the same entity in same context");
              return false;
          }
      } else {
          this.showWarningToast("No Item Copied");
          return false;
      }

      return true
  }
  _toggleActionItems() {
      let assignmentActions = this.shadowRoot.querySelector("#actionsButton");
      if (assignmentActions) {
          let items = assignmentActions.getActionItems();
          let userContext = ContextHelper.getFirstUserContext(this.contextData);
          let user;
          if(!_.isEmpty(userContext)) {
              user = userContext.user;
              if (user.lastIndexOf("_user") > 0) {
                  user = user.replace('_user', '');
              }
          }

          let assignedUsers = [];
          if (DataHelper.isValidObjectPath(this.workflowInfo,"data.contexts.0")) {
              this.workflowInfo.data.contexts.forEach(function(context) {
                  if(DataHelper.isValidObjectPath(context, "attributes.activities.group.0.assignedUser")) {
                      let assignedUser = AttributeHelper.getFirstAttributeValue(context.attributes.activities.group[0].assignedUser);
                      if (assignedUser.lastIndexOf("_user") > 0) {
                          assignedUser = assignedUser.replace('_user', '');
                      }
                      if(assignedUsers.indexOf(assignedUser) < 0) {
                          assignedUsers.push(assignedUser);
                      }
                  }
              }, this);
          }

          //Default enable both
          if (!_.isEmpty(items)) {
              for (let i = 0; i < items.length; i++) {
                  items[i].removeAttribute("disabled");
              }
          }

          if(!_.isEmpty(assignedUsers) && !_.isEmpty(items)) {
              let disableActionName;
              if(assignedUsers.length === 1 && assignedUsers[0] === user) {
                  disableActionName = "takeTask";
              } else if(assignedUsers.indexOf(user) < 0) {
                  disableActionName = "releaseTask";
              }

              for (let i = 0; i < items.length; i++) {
                  if (items[i].data.name == disableActionName) {
                      items[i].setAttribute("disabled", "");
                      break;
                  }
              }
          }
      }
  }

  _onActionItemTap(e, detail, sender) {
      //If it is bulk process, then need selected entities list, that should come from consumer
      if (!this.isSingleEntityProcess) {
          this._currentAction = detail;
          this.fireBedrockEvent("business-actions-action-click", detail);
          return;
      }

      this._failedWorkflows = [];
      this._doneWorkflows = [];
      if (!detail) return;
      let { eventName } = detail.data;

      if (eventName == "action-preview-template") {
          this.fireBedrockEvent("on-preview-template-tap", detail, {
              ignoreId: true
          });
          return;
      }

      if (eventName == "action-matchandmerge") {
          this._currentAction = detail;
          let selectedDetails = {
              "selectedItems": DataHelper.cloneObject(this.getItemContexts())
          };
          this.triggerProcess(selectedDetails);
          return;
      }

      if (eventName == "action-re-publish") {
          this._currentAction = detail;
          let selectedDetails = {
              "selectedItems": DataHelper.cloneObject(this.getItemContexts()),
              "selectionMode": "count"
          };
          this.triggerProcess(selectedDetails, this.workflowInfo);
          return;
      }
      if (eventName.indexOf("context") != -1) {
          this.fireBedrockEvent("on-context-manage-tap", detail, {
              ignoreId: true
          });
          return;
      }

      if (eventName.indexOf("snapshot") != -1) {
          this.fireBedrockEvent("on-snapshot-view-tap", detail, {
              ignoreId: true
          });
          return;
      }

      if (eventName === "action-copy") {
          this.fireBedrockEvent("on-copy-tap", detail, {
              ignoreId: true
          });
          return;
      }

      if (eventName === "action-paste") {
          this.fireBedrockEvent("on-paste-tap", detail, {
              ignoreId: true
          });
          return;
      }

      if (eventName === "action-download") {
          detail = detail.data;
          this.fireBedrockEvent("on-download", detail, {
              ignoreId: true
          });
          return;
      }

      if (_.isEmpty(this.workflowInfo)) {
          this.showWarningToast("Workflow details not available, cannot perform the operation now.");
          return;
      }

      this._currentWorkflowAction = "";
      if (eventName == "action-takeTask") {
          this._currentWorkflowAction = "take";
      }
      if (eventName == "action-releaseTask") {
          this._currentWorkflowAction = "release";
      }
      if (eventName == "action-reassignTask") {
          this._currentWorkflowAction = "reassign";
      }

      if (this._currentWorkflowAction && this.workflowInfo && this.workflowInfo.data) {
          let runningInstances = [];

          //Note: Here, workflow runtime data would be always in the context of workflow so no need to check for data.attributes
          let contexts = this.workflowInfo.data && this.workflowInfo.data.contexts ? this.workflowInfo.data.contexts : [];

          if(_.isEmpty(contexts)) {
              this.logError("Unable to perform workflow action. Workflow Info:- " + this.workflowInfo, e.detail);
              this.showWarningToast("Unable to perform workflow action.");
              return;
          }

          for (let i = 0; i < contexts.length; i++) {
              let currContextItem = contexts[i] || {};
              let currContext = currContextItem.context;
              let currWorkflowName = currContext.workflow;
              let contextAttrs = currContextItem.attributes;

              if (!currContext || !currWorkflowName ||
                  !DataHelper.isValidObjectPath(contextAttrs, "activities.group.0") ||
                  !contextAttrs.activities.group[0].activityName ||
                  !contextAttrs.activities.group[0].assignedUser) {
                  continue;
              }

              if (currWorkflowName) {
                  let runtimeInstance = {
                      "name": currWorkflowName,
                      "activityName": AttributeHelper.getFirstAttributeValue(contextAttrs.activities
                          .group[0].activityName),
                      "activityAssignedUser": AttributeHelper.getFirstAttributeValue(contextAttrs
                          .activities.group[0].assignedUser),
                      "context": currContext
                  };
                  runningInstances.push(runtimeInstance);
              }
          }

          if (runningInstances.length > 0) {
              this.set("_runningInstances", runningInstances);
              let itemContext = this.getFirstItemContext();

              const sharedData = {
                  "selected-entities": DataHelper.cloneObject(this.getItemContexts()),
                  "workflow-info": runningInstances,
                  "assignment-action": this._currentWorkflowAction,
                  "is-single-entity-process": this.isSingleEntityProcess
              };
              let dialogTitle = this._getTitleByAction(this._currentWorkflowAction);
              this.openBusinessFunctionDialog({
                  name: 'rock-wizard-workflow-assignment',
                  title: dialogTitle
              }, sharedData);
          } else {
              this.showWarningToast("Entity is not available in any workflow.");
          }

          return;
      }

      //When action not implemented
      this.showWarningToast("Not implemented, contact administrator.");
  }

  _getEntityObject() {
      let itemCtx = ContextHelper.getFirstItemContext(this.contextData);
      let entity = {
          "id": itemCtx.id,
          "type": itemCtx.type
      };
      return entity;
  }

  refresh(invalidateEntityCache = true) {
      if (invalidateEntityCache) {
          //Invalidate entity cache
          let entity = this._getEntityObject();
          LiquidDataObjectUtils.invalidateDataObjectCache(entity);
      }
  }

  reloadComponent() {
      this._onContextDataChange();
  }
}
customElements.define(RockBusinessActions.is, RockBusinessActions);
