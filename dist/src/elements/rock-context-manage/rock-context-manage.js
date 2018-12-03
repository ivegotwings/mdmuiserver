/*<link rel="import" href="classification-get-data.html">*/
/**
`rock-context-manage` Represents a component that renders all the contexts of an entity.
It manages the current contexts and creates the new contexts.

@element rock-context-manage
@group rock-elements
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import '@polymer/iron-ajax/iron-ajax.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-business-function-behavior/bedrock-component-business-function-behavior.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import '../liquid-entity-data-get/liquid-entity-data-get.js';
import '../liquid-entity-data-save/liquid-entity-data-save.js';
import '../liquid-rest/liquid-rest.js';
import '../pebble-accordion/pebble-accordion.js';
import '../pebble-vertical-divider/pebble-vertical-divider.js';
import '../pebble-tree/pebble-tree.js';
import '../pebble-button/pebble-button.js';
import '../pebble-dialog/pebble-dialog.js';
import '../rock-attribute-list/rock-attribute-list.js';
import '../rock-context-tree/rock-context-tree.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockContextManage
extends mixinBehaviors([
    RUFBehaviors.UIBehavior,
    RUFBehaviors.ComponentContextBehavior,
    RUFBehaviors.ComponentConfigBehavior
], OptionalMutableData(PolymerElement)) {
  static get template() {
    return Polymer.html`
        <style include="bedrock-style-common bedrock-style-grid-layout bedrock-style-padding-margin">
            .tree-heading {
                font-weight: var(--font-bold, bold);
                font-size: var(--default-font-size, 14px);
            }
            .buttonContainer-top-right{
                text-align: right;
                padding-top: 10px;
                margin-bottom: 0px;
                margin-top: 0px;
            }
            .status-text {
                font-size: var(--font-size-sm);
                font-weight: var(--font-medium);
            }

            .status-error {
                color: var(--palette-pinkish-red);
            }
        </style>
        <div id="buttonContainer" align="center" class="buttonContainer-top-right">
            <template is="dom-if" if="[[!isPartOfBusinessFunction]]">
                <pebble-button elevation="1" raised="" on-tap="_onTriggerEvent" data-args="onCancel" class="btn btn-primary m-r-5" id="cancelEvent" button-text="Cancel"></pebble-button>
            </template>
            <pebble-button elevation="1" raised="" on-tap="_onTriggerEvent" data-args="onSave" class="btn btn-success" id="nextEvent" button-text="Save" disabled\$="[[!allowSaveClassifications]]"></pebble-button>
        </div>
        <div class="button-siblings">
            <div class="base-grid-structure" align="center">
                <div class="tree-heading base-grid-structure-child-1">
                    <p class="status-error status-text" hidden\$="[[allowSaveClassifications]]">Do not have permissions to edit/save Contexts, contact administrator.</p>
                </div>
                <div class="base-grid-structure-child-2">
                        <rock-context-tree id="contextTree" selected-contexts-data="{{_selectedItems}}" context-data="[[contextData]]" multi-select="[[multiSelect]]" check-child-nodes="[[checkChildNodes]]" disable-child-node="[[disableChildNode]]" check-parent-nodes="[[checkParentNodes]]" leaf-node-only="[[leafNodeOnly]]" loading="[[showLoading]]"></rock-context-tree>
                </div>
            </div>
        </div>
        <liquid-entity-data-get id="taxonomyGetDataService" operation="getbyids" request-data="{{_taxonomyRequest}}" on-response="_onTaxonomyResponse"></liquid-entity-data-get>
        <liquid-entity-data-save id="attributeSaveDataService" operation="update" data-index\$="[[dataIndex]]" request-data="{{_saveRequest}}" on-response="_onSaveResponse"></liquid-entity-data-save>
        <liquid-entity-model-get id="getAuthModel" operation="getbyids" on-response="_onAuthModelReceived" on-error="_onAuthModelFailed"></liquid-entity-model-get>
        <liquid-rest id="contextLiquid" url="[[_getContextURL]]" method="POST" request-data="{{requestData}}" on-liquid-response="_onResponseReceived" exclude-in-progress="">
        </liquid-rest>
        <liquid-rest id="taxonomyModelGet" url="/data/pass-through/entitymodelservice/get" method="POST" request-data="{{_taxonomyModelRequest}}" on-liquid-response="_onTaxonomyModelGetResponse"></liquid-rest>
        <liquid-rest id="asyncReclassification" url="/data/pass-through/bulkentityservice/createtask" method="POST" on-liquid-response="_onAsyncReclassificationSuccess" on-liquid-error="_onAsyncReclassificationFailure"></liquid-rest>
        <pebble-dialog id="confirmationDialog" dialog-title="Confirmation" button-ok-text="Save" button-cancel-text="Discard" modal="" alert-box="" show-cancel="" show-ok="" no-cancel-on-outside-click="" no-cancel-on-esc-key="">
        <p>Unsaved changes identified, do you want to save your changes?</p>
    </pebble-dialog>

    <pebble-dialog id="contextAddedDialog" dialog-title="Confirmation" button-ok-text="Yes" button-cancel-text="No, thanks" modal="" alert-box="" show-cancel="" show-ok="" no-cancel-on-outside-click="" no-cancel-on-esc-key="">
        <p>[[noOfNewConetxts]] contexts are added, do you want to start managing data in them?</p>
    </pebble-dialog>
    <bedrock-pubsub event-name="on-buttonok-clicked" handler="_save" target-id="confirmationDialog"></bedrock-pubsub>
    <bedrock-pubsub event-name="on-buttoncancel-clicked" handler="_skipOrCancelSelection" target-id="confirmationDialog"></bedrock-pubsub>

    <bedrock-pubsub event-name="on-buttonok-clicked" handler="_selectNewlyAddedContext" target-id="contextAddedDialog"></bedrock-pubsub>
    <bedrock-pubsub event-name="on-buttoncancel-clicked" handler="_skipOrCancelSelection" target-id="contextAddedDialog"></bedrock-pubsub>

    <bedrock-pubsub event-name="contexts-added" handler="_onNewlyContextAddedNotification"></bedrock-pubsub>
`;
  }

  static get is() {
      return "rock-context-manage";
  }

  static get properties() {
      return {
          contextData: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _selectedItems: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          taxonomy: {
              type: String,
              value: ""
          },

          //To-do BF V2 Cleanup, use finishStepData
          businessFunctionData: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          multiSelect: {
              type: Boolean,
              value: false
          },
          
          dataIndex: {
              type: String,
              value: "entityData"
          },
          
          _entityCurrentContexts: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          
          _entitiesCurrentClassifications: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          
          _liquidSaveElement: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          
          /**
          * Specifies whether or not only leaf-node selection is enabled.
          */
          leafNodeOnly: {
              type: Boolean,
              value: false
          },

          _taxonomyExtName: {
              type: String,
              value: ""
          },

          _taxonomyExtNameAttr: {
              type: String,
              value: ""
          },

          _taxonomyRequest: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          _taxonomyModelRequest: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          _getContextURL: {
              type: String,
              value: "/data/pass-through/entityservice/getcontext"
          },

          isBulkProcess: {
              type: Boolean,
              value: false
          },

          syncThreshold: {
              type: Number,
              value: 20
          },

          selectedEntities: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          selectionMode: {
              type: String,
              value: "count"
          },

          selectionQuery: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          _asyncReclassificationRequest: {
              type: Object,
              value: function () {
                  return {
                      "params": {
                          "reclassification": true,
                          "operationType": "inboundService",
                          "data": {
                              "contexts": []
                          }
                      }
                  }
              }
          },

          _bulkReclassificationErrorMessage: {
              type: String,
              value: "Failed to perform the Bulk reclassification. Contact administrator."
          },

          componentEvents: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          allowSaveClassifications: {
              type: Boolean,
              value: true
          },

          showSkip: {
              type: Boolean,
              value: false
          },
          noOfNewConetxts:{
              type:Number,
              value:0
          },
          newlyAddedContexts:{
              type:Array,
              value:[]
          },
          _isNotificationReceived:{
              type:Boolean,
              value:false
          },
          showLoading:{
              type:Boolean,
              value:false
          }
      };
  }

  static get observers() {
      return [
          '_onContextOrTaxonomyChange(contextData, taxonomy)',
          '_onSelectedItemsChange(_selectedItems.*)'
      ];
  }

  constructor() {
      super();
  }
  _onNewlyContextAddedNotification(e){
      this._isNotificationReceived = true;
      if(this.newlyAddedContexts.length > 0){
          this.shadowRoot.querySelector("#contextAddedDialog").open();
      }else{
          this._triggerFinishStep();
      }
  }


  connectedCallback() {
      super.connectedCallback();

      if (!this.taxonomy || this.taxonomy == "undefined") {
          this.taxonomy = this.appSetting("dataDefaults").taxonomy;
      }
  }

  disconnectedCallback() {
      super.disconnectedCallback();
  }

  ready() {
      super.ready();
      this._liquidSaveElement = this.shadowRoot.querySelector("#attributeSaveDataService");
  }

  _onContextOrTaxonomyChange() {
      if (this.taxonomy && !_.isEmpty(this.contextData)) {
          if (this.isPartOfBusinessFunction) {
              let context = DataHelper.cloneObject(this.contextData);
              //App specific
              let appName = "";
              appName = ComponentHelper.getCurrentActiveAppName(this);
              if (appName) {
                  context[ContextHelper.CONTEXT_TYPE_APP] = [{
                      "app": appName
                  }];
              }
              this.requestConfig('rock-context-manage', context);
          } else {
              this._getAuthManageModel();
          }
      }
  }

  //Config properties are already set in config behavior
  onConfigLoaded(componentConfig) {
      this._getAuthManageModel();
  }

  _getAuthManageModel() {
      let authModelId = "";

      if (this.contextData && !_.isEmpty(this.contextData)) {
          let itemContext = ContextHelper.getFirstItemContext(this.contextData);
          let userContext = ContextHelper.getFirstUserContext(this.contextData);

          if (itemContext) {
              let type = EntityTypeManager.getInstance().getTypeByName(itemContext.type);
              if (type) {
                  authModelId = type.domain + "_authorizationModel";
              }
          }

          if (userContext) {
              authModelId = authModelId + "_" + userContext.defaultRole;
          }
      }

      //Fetch auth model
      let authModelEl = this.shadowRoot.querySelector("#getAuthModel");
      if (authModelEl) {
          authModelEl.requestData = DataRequestHelper.createGetModelRequest("authorizationModel", [authModelId]);
          authModelEl.generateRequest();
      }
  }

  _onAuthModelReceived(e, detail) {
      if (detail && DataHelper.isValidObjectPath(detail, "response.content.entityModels.0.properties.contextsPermission.0")) {
          this.allowSaveClassifications = detail.response.content.entityModels[0].properties.contextsPermission[0].writePermission || false;
      }
      this._getTaxonomyManageModel();
  }

  _onAuthModelFailed(e, detail) {
      this._getTaxonomyManageModel();
  }

  _getTaxonomyManageModel() {
      this._taxonomyModelRequest = DataRequestHelper.createGetManageModelRequest(["taxonomy"]);

      let taxonomyModelGetElement = this.$$("#taxonomyModelGet");

      if (taxonomyModelGetElement) {
          taxonomyModelGetElement.generateRequest();
      }
  }

  _onTaxonomyModelGetResponse(e) {
      let modelErrorMsg = "Entity manage model not found for taxonomy.";
      if (!e.detail || !e.detail.response || !e.detail.response.response) {
          this.logError(modelErrorMsg, e.detail);
          return;
      }

      let response = e.detail.response.response;
      if (response && response.entityModels) {
          let entityModel = response.entityModels[0];
          let externalNameAndExternalNameAttr = AttributeHelper.getExternalNameAndExternalNameAttr(entityModel);

          if (externalNameAndExternalNameAttr && externalNameAndExternalNameAttr.externalNameAttr) {
              this._taxonomyExtNameAttr = externalNameAndExternalNameAttr.externalNameAttr;
              this._getTaxonomy();
          } else {
              this.logError("Attribute not found with isExternlName in taxonomy entity manage model", e.detail);
          }
      } else {
          this.logError(modelErrorMsg, e.detail);
      }
  }

  _getTaxonomy() {
      let contextData = DataHelper.cloneObject(this.contextData);
      let firstItemContext = ContextHelper.getFirstItemContext(contextData);
      if (firstItemContext) {
          firstItemContext.type = "taxonomy";
          firstItemContext.attributeNames = [this._taxonomyExtNameAttr];
          firstItemContext.id = this.taxonomy;
          contextData[ContextHelper.CONTEXT_TYPE_DATA] = [];
          let req = DataRequestHelper.createEntityGetRequest(contextData);
          delete req.params.options;
          this._taxonomyRequest = req;

          let taxonomyGetElement = this.$$("#taxonomyGetDataService");

          if (taxonomyGetElement) {
              taxonomyGetElement.generateRequest();
          }
      }
  }

  _onTaxonomyResponse(e) {
      if (e && e.detail && e.detail.response) {
          let res = e.detail.response;
          if (res && res.content && res.content.entities && res.content.entities.length) {
              let entity = res.content.entities[0];
              if (entity && entity.data) {
                  let attributes = entity.data.attributes;

                  if (attributes && attributes[this._taxonomyExtNameAttr]) {
                      this._taxonomyExtName = attributes[this._taxonomyExtNameAttr].values && attributes[this._taxonomyExtNameAttr].values.length ? attributes[this._taxonomyExtNameAttr].values[0].value : undefined;
                  }
              }
          }
      }

      if (this.isBulkProcess) {
          this._triggerContextsTree();
      } else {
          this._prepareGetContextRequest();
      }
  }

  //Prepare request get the contexts for the selected entities
  _prepareGetContextRequest() {
      let contextData = DataHelper.cloneObject(this.contextData);
      contextData[ContextHelper.CONTEXT_TYPE_VALUE] = [];
      contextData[ContextHelper.CONTEXT_TYPE_DATA] = [];
      let triggerRequest = false;
      let entities = [];
      let types = [];

      if (this.isBulkProcess) {
          if (this.selectedEntities && this.selectedEntities.length) {
              triggerRequest = true;
          }
          for (let entityIdx = 0; entityIdx < this.selectedEntities.length; entityIdx++) {
              entities.push(this.selectedEntities[entityIdx].id);
              if (types.indexOf(this.selectedEntities[entityIdx].type) == -1) {
                  types.push(this.selectedEntities[entityIdx].type)
              }
          }
      } else {
          let firstItemContext = ContextHelper.getFirstItemContext(contextData);
          if (firstItemContext && firstItemContext.type && firstItemContext.id) {
              firstItemContext.attributes = [];
              triggerRequest = true;
          }
      }

      if (triggerRequest) {
          let req = DataRequestHelper.createEntityGetRequest(contextData);
          req.params.fields.attributes = [];
          delete req.params.options;
          if (this.isBulkProcess) {
              req.params.query.ids = entities;
              req.params.query.filters.typesCriterion = types;
          }
          this.set('requestData', req);

          if (!_.isEmpty(this.dataIndex) && this.dataIndex.toLowerCase() == "entitymodel") {
              this._getContextURL = "/data/pass-through/entitymodelservice/getcontext"
          }

          this.shadowRoot.querySelector("#contextLiquid").generateRequest();
      }
  }

  _onResponseReceived(e) {
      let items = [];

      if (e.detail && e.detail.response) {
          let res = e.detail.response.response;

          if (res && res.entities && res.entities.length) {
              //Collect bulk entities currect cassifications
              if (this.isBulkProcess) {
                  this._entitiesCurrentClassifications = {};
                  for (let entityIdx = 0; entityIdx < res.entities.length; entityIdx++) {
                      let entity = res.entities[entityIdx];
                      if (entity && entity.data) {
                          let contexts = entity.data.contexts;
                          let entityCurrentContexts = [];
                          for (let ctxIdx = 0; ctxIdx < contexts.length; ctxIdx++) {
                              let context = contexts[ctxIdx].context;
                              if (!_.isEmpty(context)) {
                                  let item = context["classification"];
                                  if (item) {
                                      if (context["taxonomy"] == this._taxonomyExtName) {
                                          entityCurrentContexts.push(item);
                                      }
                                  }
                              }
                          }
                          this._entitiesCurrentClassifications[entity.id] = entityCurrentContexts;
                      }
                  }
              } else { //Collect classification for single entity and make it selectable in tree

                  let entity = res.entities[0];
                  if (entity && entity.data) {
                      let contexts = entity.data.contexts;
                      let firstDataContext = this.getFirstDataContext(this.contextData);
                      let primaryContext = this._getPrimaryContext(firstDataContext);

                      for (let i = 0; i < contexts.length; i++) {
                          let context = contexts[i].context;
                          if (!_.isEmpty(context)) {
                              items.push(Object.values(context));
                              this._entityCurrentContexts.push(context)
                          }
                      }
                  }
              }
          }
      }
      if (this.isBulkProcess) {
          this._prepareBulkUpdateContextsSaveRequest();
      } else {
          let contextTree = this.shadowRoot.querySelector("#contextTree");
          if (contextTree) {
              contextTree.selectedContextsData = items;
          }
          if (!this.multiSelect && this._selectedItems.length > 1) {
              this.logError("UI is configured for single context but there are " + this._selectedItems.length + " selected contexts for the entity");
          }

          this._triggerContextsTree();
      }
  }

  _triggerContextsTree() {
      const contextTree = this.shadowRoot.querySelector("#contextTree");
      if (contextTree) {
          contextTree.reloadTree();
      }
  }

  _isSelectedItemsChanged(selectedItems){
      let selectedContextsData = [];
      if(selectedItems && selectedItems.length == 0 && this._entityCurrentContexts.length != 0){
          return true;
      }
      for (let i = 0; i < selectedItems.length; i++) {
          let contextType = selectedItems[i].type;
          let contextName = selectedItems[i].name;
          let context = {};
          if (contextName) {
              context[contextType] = contextName;
              selectedContextsData.push(context)
          }
      }
      return !DataHelper.areEqualArrays(selectedContextsData, this._entityCurrentContexts)
  }

  _save() {
      let _isSelectedItemsChanged = this._isSelectedItemsChanged(this._selectedItems)
      if (!this.isBulkProcess && !_isSelectedItemsChanged) {
          this.showInformationToast("No changes to save");
          return;
      }
      this._triggerUpdateContexts();
  }

  _triggerUpdateContexts() {
      if (this.isBulkProcess) {
          if ((!this.selectionMode || this.selectionMode == "count") &&
              (!this.selectedEntities || this.selectedEntities.length == 0)) {
              this.showWarningToast("Entities not available for the process");
              return;
          }

          if (this.selectionMode == "query" || (this.selectionMode == "count" && this.selectedEntities.length > this.syncThreshold)) {
               // if (!this.selectionQuery || _.isEmpty(this.selectionQuery)) {
              //     this.showWarningToast("Selection query not available for the process");
              //     return;
              // }
              this.showWarningToast("Add Conetxt not allowed for more than 20 entities");

              // this._triggerAsyncUpdateContexts(); //Trigger async process for 20+ entities OR query selection//Trigger async process for 20+ entities OR query selection
          } else {
              //this._prepareGetContextRequest(); //Trigger bulk process based on selected entities context
              //Triggering bulk process based on selected classification
              this._prepareBulkUpdateContextsSaveRequest();
          }
      } else {
          let data = {};
          let entities = [];
          data.contexts = this._prepareContexts(this._selectedItems);
          let firstItemContext = this.getFirstItemContext();
          let entity = {
              "id": firstItemContext.id,
              "type": firstItemContext.type,
              "data": data
          };
          entities.push(entity);
          this._triggerSaveRequest(entities);
      }
  }

  _getSelectedClassifications() {
      let originalClassifications = [];
      for (let ctxIdx = 0; ctxIdx < this.contextData.Contexts.length; ctxIdx++) {
          originalClassifications.push(this.contextData.Contexts[ctxIdx].classification);
      }

      return originalClassifications;
  }

  _prepareBulkUpdateContextsSaveRequest() {
      let entities = [];
      let originalClassifications = [];
      for (let entityIdx = 0; entityIdx < this.selectedEntities.length; entityIdx++) {
          let data = {};
          data.contexts = this._prepareContexts(this._selectedItems, originalClassifications);
          let entity = {
              "id": this.selectedEntities[entityIdx].id,
              "type": this.selectedEntities[entityIdx].type,
              "data": data,
              "isReclassification": true
          };
          entities.push(entity);
      }

      this._triggerSaveRequest(entities);
  }

  _prepareContexts(selectedItems, entityContexts) {
      let contextsToAdd = [];
      let deletedcontexts = [];
      let entityCurrentContexts = this.isBulkProcess ? entityContexts : this._entityCurrentContexts;
      let firstDataContext = this.getFirstDataContext(this.contextData);
      let primaryContext = this._getPrimaryContext(firstDataContext);
      let contextType = "";
      // Update - For selected items
      for (let i in selectedItems) {
          let context = {}
          let contextName = selectedItems[i].name;
          contextType = selectedItems[i].type
          context[contextType] = contextName;
          contextsToAdd.push({
              "context": context
          });
      }

      // Delete - For existing items 
      for (let i in entityCurrentContexts) {
          let context = {}
          let isSelected = false;
          let currentContextType = Object.keys(entityCurrentContexts[i])[0];

          for (let j in selectedItems) {
              let contextName = selectedItems[j].name;
              let selectedItemContextType = selectedItems[j].type
           
              if (contextName == entityCurrentContexts[i][currentContextType]) {
                  isSelected = true;
                  break;
              }
          }
          // Not in current selected list, then action to delete
          if (!isSelected) {
              context[currentContextType] = entityCurrentContexts[i][currentContextType];
              contextsToAdd.push({
                  "context": context,
                  "action":"delete"
              });
          }
      }
      return contextsToAdd;
  }

  _triggerSaveRequest(entities) {
      //TODO:: This will be temporary fix needs to come up with good solution.
      let clientState = {};
      clientState.notificationInfo = {};
      clientState.notificationInfo.actionType = "addContext";
      this.newlyAddedContexts = [];
      if(this._selectedItems.length > 0){
          let _selectedItems = this._selectedItems;
          let entityCurrentContext = this._entityCurrentContexts;
          let entityCurrentContextValues = [];
          entityCurrentContext.forEach(item =>{
              entityCurrentContextValues.push(Object.values(item)[0]);
          })

          let _newlySelectedItems = _selectedItems.filter(selectedItem =>{
              if(entityCurrentContextValues.indexOf(selectedItem.name) == -1){
                  return selectedItem;
              }
          });
          if(_newlySelectedItems.length > 0){
              this.noOfNewConetxts = _newlySelectedItems.length;
              let formattedSelectedItems = [];
              for (let itemIndex in _newlySelectedItems) {
                  let formattedSelectedItem = {};
                  let _currentItem = _newlySelectedItems[itemIndex];
                  formattedSelectedItem["id"] = _currentItem.name;
                  formattedSelectedItem["title"] = _currentItem.name;
                  formattedSelectedItem["type"] = _currentItem.type;
                  formattedSelectedItems.push(formattedSelectedItem);
              }
              this.newlyAddedContexts = formattedSelectedItems;
          }
      }
      if (this._isNotificationDisabled()) {
          clientState.notificationInfo.showNotificationToUser = false;
          this.set("_saveRequest", { "clientState": clientState, "entities": entities });
      } else {
          clientState.notificationInfo.showNotificationToUser = true;
          this.set("_saveRequest", { "clientState": clientState, "entities": entities });
      }
      this._liquidSaveElement.generateRequest();
      this.showLoading = true;
      this._isNotificationReceived = false;
      let count = 0;
      let notificationWaitTimer = setInterval(function () {
          count++
          if (this._isNotificationReceived) {
              this.showLoading = false;
              clearInterval(notificationWaitTimer);
          } else if (count >= 10) {
              let toastMessage = "It's taking longer than expected, we will let you know when done";
              this.showLoading = false;
              clearInterval(notificationWaitTimer);
              this._triggerFinishStep(null,null,toastMessage);
          }
      }.bind(this), 1000);
  }

  _skipOrCancelSelection(e) {
          this._selectedItems = [];
          let eventName = e.target.getAttribute("data-args") || "onCancel";
          let eventDetail = {
              name: eventName
          }
          this.fireBedrockEvent(eventName, eventDetail, {
              ignoreId: true
          });
  }

  _selectNewlyAddedContext(){
      this._triggerFinishStep(null,this.newlyAddedContexts);
  }

  _onSaveResponse(e, detail) {
      if (this.isBulkProcess) {
          //Todo: Handle bulk messages here
          let request = detail.request;
          let response = detail.response;
          this._responseMessages = [];

          if (request && request.requestData && request.requestData.entities) {
              let entities = request.requestData.entities;
              let newClassifiactions = "";
              //New classifications
              if (entities[0] && entities[0].data &&
                  entities[0].data.contexts && entities[0].data.contexts.length) {
                  let contexts = entities[0].data.contexts;
                  let classifications = [];
                  for (let ctxIdx = 0; ctxIdx < contexts.length; ctxIdx++) {
                      if (contexts[ctxIdx] && contexts[ctxIdx].context &&
                          contexts[ctxIdx].context.classification) {
                          classifications.push(contexts[ctxIdx].context.classification);
                      }
                  }

                  newClassifiactions = classifications.join(", ");
              }

              for (let entityIdx = 0; entityIdx < entities.length; entityIdx++) {
                  let message = {
                      "Entity Id": entities[entityIdx].id
                  };

                  message["New Classification(s)"] = newClassifiactions;
                  message["Status"] = response.status == "success" ? "Request submitted successfully" : "Request failed";

                  this._responseMessages.push(message);
              }
          }
          this._triggerFinishStep();
      }
  }

  _updateInitialContexts() {
      if(!_.isEmpty(this._selectedItems)) {
          let formattedSelectedItems = []
          for(let selectedItem of this._selectedItems) {
              if(!_.isEmpty(selectedItem)) {
                  let context = {};
                  context[selectedItem.type] = selectedItem.value;
                  formattedSelectedItems.push(context);
              }
          }
          this._entityCurrentContexts = formattedSelectedItems;
      } else {
          this._entityCurrentContexts = [];
      }
  }

  _triggerFinishStep(isJob,newlyAddedContexts,ErrorToastMessage) {
      //Single entity reclassification
      if (!this.isBulkProcess) {
          let eventName = "onSave";
          let eventDetail = {
              name: eventName,
              "action": {
                  "name": "refresh-context-selector"
              },
          };
          //After save, updated initialContexts to latest
          this._updateInitialContexts();
          if(newlyAddedContexts && newlyAddedContexts.length > 0){
              eventDetail.action["newlyAddedContexts"] = newlyAddedContexts;
          }else{
              let toastMessage = "Context update request is submitted successfully.";
              if(ErrorToastMessage){
                  toastMessage = ErrorToastMessage;
              }
              this.showSuccessToast(toastMessage);
          }
          if (eventName && this.functionalMode == "dataFunction") {
              eventName.action = "business-condition-save-request";
          };
          this.fireBedrockEvent(eventName, eventDetail, {
              ignoreId: true
          });
          let itemCtx = ContextHelper.getFirstItemContext(this.contextData) || {};
          this.dataFunctionComplete({"id": itemCtx.id, "type": itemCtx.type});

          return;
      }

      //Bulk reclassification final step starts from here
      let noGrid = false;
      let message = "";
      let actions = [{
          "name": "goBack",
          "text": "Take me back to where I started",
          "isNotApp": true
      }];

      if (isJob) {
          noGrid = true;
          message = "Reclassification process has started, you can review the progress of the task " + this._taskId + " in task details.";
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
          message = "Reclassification process has started, refresh data grid after some time.";
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

      this.finishStepData = data;
      this.dataFunctionComplete();

      //To-do - BF V2 Cleanup, Once all the places extension manage got changed
      this.businessFunctionData = data;
      let eventName = "onSave";
      let eventDetail = {
          name: eventName
      }

      this.fireBedrockEvent(eventName, eventDetail, {
          ignoreId: true
      });
      // End here - BF V2 Cleanup

      //Reset contextData, selectedEntities
      this.contextData = {};
      this.selectedEntities = [];
  }

  _isNotificationDisabled() {
      let app = ComponentHelper.getCurrentActiveApp();
      if (app && (typeof AppBusinessFunction !== "undefined") && app instanceof AppBusinessFunction) {
          return true;
      }
      return false;
  }

  _getPrimaryContext(dataContext) {
      let primaryContext = {};
      if (!_.isEmpty(dataContext)) {
          Object.keys(dataContext).forEach(function (item) {
              //TODO:: For now "taxonomy" and "classification" dimensions are considered as additional for extension manage. Need to correct it with proper design.
              if (item.toLowerCase() != "taxonomy" && item.toLowerCase() != "classification") {
                  primaryContext[item] = dataContext[item];
              }
          }, this);
      }
      return primaryContext;
  }

  _triggerAsyncUpdateContexts() {
      let asyncLiqReclassification = this.shadowRoot.querySelector("#asyncReclassification");
      let reclassificationRequest = DataHelper.cloneObject(this._asyncReclassificationRequest);

      if (!asyncLiqReclassification) {
          this.logError("BulkReclassificationError:- Liquid component not available to trigger create task");
          return;
      }

      //Add hotline flag if hotline is enabled
      if (DataHelper.isHotlineModeEnabled()) {
          reclassificationRequest.hotline = true;
      }

      if (this.selectionQuery.params && this.selectionQuery.params.isCombinedQuerySearch) {
          asyncLiqReclassification.url = "/data/pass-through-combined-query/bulkentityservice/createtask";
          reclassificationRequest.params.taskType = "process-multi-query";
          reclassificationRequest.entities = [this.selectionQuery.entity];
      } else {
          reclassificationRequest.params.taskType = "process-query";
          reclassificationRequest.params.query = this.selectionQuery.params ? this.selectionQuery.params.query : this.selectionQuery;
      }

      let originalClassifications = [];
      reclassificationRequest.params.data.contexts = this._prepareContexts(this._selectedItems, originalClassifications);

      //Add clientAttributes
      let valueContext = ContextHelper.getFirstValueContext(this.contextData);
      let userContext = ContextHelper.getFirstUserContext(this.contextData);
      let clientMessage = "Bulk reclassification";

      reclassificationRequest.clientAttributes = {
          "taskName": {
              "values": [{
                  "source": valueContext.source,
                  "locale": valueContext.locale,
                  "value": clientMessage
              }]
          }
      };

      asyncLiqReclassification.requestData = reclassificationRequest;
      asyncLiqReclassification.generateRequest();
  }

  _onAsyncReclassificationSuccess(e, detail) {
      let response = e.detail.response && e.detail.response.response ? e.detail.response.response : e.detail.response;
      let request = e.detail.response ? e.detail.response.request : undefined;

      if ((!response || _.isEmpty(response)) ||
          (DataHelper.isValidObjectPath(response, "dataObjectOperationResponse.status") && response.dataObjectOperationResponse.status.toLowerCase() == "error") ||
          (response.status && response.status.toLowerCase() == "error")) {
          this.logError("BulkReclassificationError", response);
          return;
      } else {
          if (response.status && response.status.toLowerCase() == "success") {
              if (request && request.taskId) {
                  this._taskId = request.taskId;
              }
          }

          this._triggerFinishStep(true);
      }
  }

  _onAsyncReclassificationFailure(e, detail) {
      this.logError("BulkReclassificationError", e.detail);
  }

  _onTriggerEvent(e, detail) {
      let event = e.target.getAttribute("id");
      if (event == "skipEvent" || event == "cancelEvent" || event == "backEvent") {
          let _isSelectedItemsChanged = this._isSelectedItemsChanged(this._selectedItems)
          if(_isSelectedItemsChanged){
              this.shadowRoot.querySelector("#confirmationDialog").open();
          }else{
              this._skipOrCancelSelection(e);
          }
      } else if (event == "nextEvent") {
          this._save(e);
      }
  }

  _onSelectedItemsChange() {
      this.isComponentDirty = this._isSelectedItemsChanged(this._selectedItems);
  }
}

customElements.define(RockContextManage.is, RockContextManage);
