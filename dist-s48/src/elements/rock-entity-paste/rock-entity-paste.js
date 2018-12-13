import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-buttons.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import '../liquid-entity-model-get/liquid-entity-model-get.js';
import '../liquid-entity-data-get/liquid-entity-data-get.js';
import '../liquid-rest/liquid-rest.js';
import '../liquid-entity-data-save/liquid-entity-data-save.js';
import '../pebble-spinner/pebble-spinner.js';
import '../pebble-button/pebble-button.js';
import '../pebble-card/pebble-card.js';
import '../pebble-accordion/pebble-accordion.js';
import '../rock-scope-selector/rock-scope-selector.js';
import '../rock-attribute-split-list/rock-attribute-split-list.js';
import '../rock-component-config-behavior/rock-component-config-behavior.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockEntityPaste
    extends mixinBehaviors([
        RUFBehaviors.ToastBehavior,
        RUFBehaviors.LoggerBehavior,
        RUFBehaviors.ComponentContextBehavior,
        RUFBehaviors.ComponentConfigBehavior
    ], PolymerElement) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-scroll-bar bedrock-style-grid-layout bedrock-style-padding-margin bedrock-style-buttons">
            :host {
                display: block;
                height: 100%;
            }

            .message {
                text-align: center;
            }

            .buttonSection {
                text-align: center;
            }

            #card {
                height: auto;
                padding-bottom: 20px;
            }

            .scope-manage-attribute-list-wrapper {
                min-height: 320px;
            }

            pebble-card {
                --pebble-card-widget-box: {
                    height: 100%;
                    padding-bottom: 10px;
                    margin-top: 0px;
                    margin-right: 0px;
                    margin-bottom: 0px;
                    margin-left: 0px;
                    min-width: auto;
                }
            }

            .card-content {
                height: 100%;
            }

            #cancelButton {
                margin-left: 15px;
            }
            .overflow-auto-y {
                overflow-x: hidden;
                overflow-y: auto;
            }

            pebble-checkbox {
                margin-left: 5px;
            }
        </style>
        <pebble-spinner active="[[_loading]]"></pebble-spinner>
        <div class="base-grid-structure">
            <div class="base-grid-structure-child-1">
                <div class="message">[[_message]]</div>
            </div>
            <div class="base-grid-structure-child-2 p-relative">
                <div class="button-siblings">
                    <div class="base-grid-structure">
                        <div class="base-grid-structure-child-1">
                            <pebble-card id="card" no-header="">
                                <rock-scope-selector id="scopeSelector" selected-scope="[[selectedItems]]" context-data="[[contextData]]" show-title="" allow-manage-scope="" show-settings="" slot="pebble-card-content">
                                </rock-scope-selector>
                                <bedrock-pubsub event-name="rock-scope-click" handler="_onScopeTagClicked"></bedrock-pubsub>
                                <bedrock-pubsub event-name="rock-scope-edit" handler="_onScopeEditClicked"></bedrock-pubsub>
                                <bedrock-pubsub event-name="rock-scope-loaded" handler="_onScopeLoad"></bedrock-pubsub>
                            </pebble-card>
                        </div>
                        <div class="base-grid-structure-child-2">
                            <pebble-card no-header="" class="full-height">
                                <pebble-accordion id="accordion" is-collapsed="{{!_isOpened}}" header-text="[[_getHeaderText(_selectedScope)]]" slot="pebble-card-content">
                                    <div slot="accordion-content" class="full-height overflow-auto-y">
                                        <template is="dom-if" if="[[_isOpened]]">
                                            <div class="scope-manage-attribute-list-wrapper full-height">
                                                <rock-attribute-split-list id="splitList" context-data="[[contextData]]" retain-selected-items="[[retainSelectedItems]]" selected-items="{{selectedItems}}" config="[[splitListConfig]]"></rock-attribute-split-list>
                                            </div>
                                        </template>
                                    </div>
                                </pebble-accordion>
                            </pebble-card>
                        </div>
                    </div>
                </div>
                <div id="buttonContainer" class="buttonContainer-static">
                    <pebble-button id="cancelButton" class="btn btn-secondary m-r-5" button-text="Cancel" on-tap="_onCancelTap" elevation="1" raised=""></pebble-button>
                    <pebble-button id="Paste" class="focus btn btn-success" button-text="Paste" on-tap="_executePaste" elevation="1" raised=""></pebble-button>
                </div>
            </div>
        </div>
        <liquid-entity-data-get id="getEntity" operation="getbyids" data-index="entityData" data-sub-index="data" on-response="_onEntityGetResponse" on-error="_onEntityGetFailed" last-response="{{_attributeResponse}}"></liquid-entity-data-get>

    <liquid-entity-model-composite-get on-error="_onEntityModelCompositeGetFailed" name="compositeAttributeModelGet" on-entity-model-composite-get-response="_onCompositeModelGetResponse"></liquid-entity-model-composite-get>
    <liquid-entity-data-save name="attributeSaveDataService" operation="[[_entityDataOperation]]" data-index="[[dataIndex]]" request-data="{{_saveRequest}}" last-response="{{_saveResponse}}" on-response="_onSaveResponse" on-error="_onSaveResponse"></liquid-entity-data-save>
`;
  }

  static get is() { return 'rock-entity-paste' }

  ready() {
      super.ready();
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
          _saveRequest: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          dataIndex: {
              type: String,
              value: "entityData"
          },
          _loading: {
              type: Boolean,
              value: false
          },
          _contextsObjCopyEntity: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _nameToExternalNameDictionary: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _contextsObjPasteEntity: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _entityDataOperation: {
              type: String,
              value: 'update'
          },
          _saveResponse: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _entityTypesNotToSendForSave: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _entitiesNotEligibleForSave: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          _sourceEntityData: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          sharedContextData: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          selectedItemsForPaste: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          _targetEntitiesAttributeModels: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          _cloneEntitiesForBulkSave: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          isBulkProcess: {
              type: Boolean,
              value: false
          },
          _entitiesEligibleForSave: {
              type: Number,
              value: 0
          },
          _compositeModelResponseTracker: {
              type: Number,
              value: 0
          },
          _message: {
              type: String
          },
          _bulkSaveTracker: {
              type: Number,
              value: 0
          },
          _attributeModelResponse: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _entitySaveResponseObject: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          splitListConfig: {
              type: Object
          },
          selectedItems: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          retainSelectedItems: {
              type: Boolean,
              value: false
          },
          _attributeResponse: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _selectedScope: {
              type: String,
              value: ""
          },
          _isOpened: {
              type: Boolean,
              value: true
          },
          _nestedAttributes: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          _copyPasteEntities: {
              type: Array,
              value: function () {
                  return [];
              }
          }
      }
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
          this.requestConfig('rock-scope-manage', context);
      }
  }
  onConfigLoaded(componentConfig) {
      if (DataHelper.isValidObjectPath(componentConfig, "config.splitListConfig.tabular.fields")) {
          let splitListConfig = componentConfig.config.splitListConfig;
          let fields = DataHelper.convertObjectToArray(splitListConfig.tabular.fields);
          splitListConfig.tabular.fields = fields;
          this.set("splitListConfig", splitListConfig);
      } else {
          this.logError("rock-scope-manage - Split list config is not available/proper in config", componentConfig);
      }

      let clonedContextData = DataHelper.cloneObject(this.contextData);
      //To get all attribute models
      if(clonedContextData.ItemContexts && clonedContextData.ItemContexts.length) {
          clonedContextData.ItemContexts[0].attributeNames  = ["_ALL"];
      }
      let compositeModelGetRequest = DataRequestHelper.createEntityModelCompositeGetRequest(clonedContextData);
      let _compositeAttributeModelGet;
      if (compositeModelGetRequest) {
          _compositeAttributeModelGet = this.shadowRoot.querySelector("[name=compositeAttributeModelGet]");
      }
      if (_compositeAttributeModelGet) {
          _compositeAttributeModelGet.requestData = compositeModelGetRequest;
          _compositeAttributeModelGet.generateRequest();
      }
  }
  _onSaveResponse(e, detail) {
      this._bulkSaveTracker++;
      let message;
      let parsedData = this._sourceEntityData;
      let entity = e.detail.request.requestData.entities[0];
      let response = e.detail.response;
      let dataContexts = ContextHelper.getDataContexts(this.contextData);
      let valueContexts = ContextHelper.getValueContexts(this.contextData);
      let forContext = _.isEmpty(parsedData.Contexts)? "self": Object.values(parsedData.Contexts[0]).toString();
      let toContext = _.isEmpty(dataContexts)? "self": Object.values(dataContexts[0]).toString();
      let toEntityName = entity.name ? entity.name : entity.id;
      let fromEntityName = parsedData.ItemContexts[0].name ? parsedData.ItemContexts[0].name : parsedData.ItemContexts[0].id;
      if (response.status === 'success') {
          message = `Copy paste request submitted for copying data from ${fromEntityName} (${forContext}, ${parsedData.ValContexts[0].locale}) to ${toEntityName} (${toContext}, ${valueContexts[0].locale})`;
      } else {
          message = response.reason;
      }

      if(this.isBulkProcess) {
          let status = e.detail.response.status;
          if(!_.isEmpty(status)) {
              status = status[0].toUpperCase() + status.slice(1,status.length);
          }
          const responseObj = {
              "Entity Name": toEntityName,
              "Message": message,
              "Status": status
          }
          this._entitySaveResponseObject.push(responseObj);

          if(this._bulkSaveTracker === this._entitiesEligibleForSave + this._entitiesNotEligibleForSave.length) {
              this._entitySaveResponseObject.push(...(this._prepareMessagesForNonEligibleEntities()))
              this._triggerBulkFinishStep();
          } else {
              return;
          }
      } else {
          this._triggerFinishStep(message);
      }
  }

  _triggerFinishStep(message) {
      let actions = [
          {
              "name": "goBack",
              "text": "Take me back to where I started",
              "isNotApp": true
          }
      ];

      let data = {
          "message": message,
          "noGrid": true,
          "actions": actions,
      };

      this.businessFunctionData = data;
      let eventName = "onComplete";
      let eventDetail = {
          name: eventName
      }

      this.fireBedrockEvent(eventName, eventDetail, {
          ignoreId: true
      });
  }

  _prepareMessagesForNonEligibleEntities() {
      let messages = [];
      this._entitiesNotEligibleForSave.forEach(entity=> {
          let message = {
              "Entity Name" : entity.name ? entity.name : entity.id,
              "Message": `Permissions Denied. You do not have permissions for [${this._entityTypesNotToSendForSave[entity.type].join(", ")}] attributes`,
              "Status": "Error"
          }
          messages.push(message);
      });
      return messages;
  }
  _triggerBulkFinishStep() {
      // let isJob = false;
      let noGrid = false;
      let message = "";
      let actions = [{
          "name": "goBack",
          "text": "Take me back to where I started",
          "isNotApp": true
      }];

      if (!this.isBulkProcess) {
          noGrid = true;
          message = this._responseMessages && this._responseMessages[0] ? this._responseMessages[0].Message :
              "";
          this._responseMessages = [];
      }
      //  else if (isJob) {
      //     noGrid = true;
      //     message = "Assignment process is started, you can review the progress of the task " + this._taskId +
      //         " in task details.";
      //     actions.push({
      //         "name": "gotoJobDetails",
      //         "text": "Show me the task details",
      //         "isNotApp": true,
      //         "dataRoute": "task-detail",
      //         "queryParams": {
      //             "id": this._taskId
      //         }
      //     });
      // }
       else {
          message = "Entity Paste process is started, refresh data grid after some time.";
      }

      let data = {
          "messages": this._entitySaveResponseObject,
          "message": message,
          "noGrid": noGrid,
          "actions": actions,
          "contextData": this.contextData,
          "processedEntities": this._cloneEntitiesForBulkSave,
          "messageKey": "Entity Id",
          "isPasteScenario": true
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

  showNoChangesToast() {
      RUFUtilities.pebbleAppToast.fitInto = RUFUtilities.appCommon.$.toastArea;;
      RUFUtilities.appCommon.toastText = "No changes to save";
      let toastElement = RUFUtilities.pebbleAppToast;
      toastElement.toastType = "information";
      toastElement.heading = "Information";
      toastElement.autoClose = true;
      toastElement.show();
  }
  _onCompositeModelGetResponse(e) {
          let itemContext = this.getFirstItemContext();
          let entityId = itemContext.id;

          if (DataHelper.isValidObjectPath(e, 'detail.response.content.entityModels')) {
              let writePermission = true;
              if (DataHelper.isValidObjectPath(itemContext, "permissionContext.writePermission")) {
                  writePermission = itemContext.permissionContext.writePermission;
              }
              this._attributeModels = DataTransformHelper.transformAttributeModels(
                  e.detail.response.content.entityModels[0], this.contextData,
                  writePermission);
          }

          else {
              this._onEntityModelCompositeGetFailed();
              this._loading = false;
          }
      }
  _onScopeTagClicked(e, detail) {
      if (detail && detail.data) {
          this.selectedItems = [];
          this.selectedItems = detail.data.scope;
          this._executePaste();
      }
  }
  _onScopeEditClicked(e, detail) {
      if (detail && detail.data) {
          this.set("_selectedScope", detail.data);
          if (!this._isOpened) {
              this.$.accordion.showContainer();
              this.$.accordion._transitionEnd();
          }
          this.selectedItems = [];
          this.async(function () {
              this.selectedItems = detail.data.scope;
              if (!this.retainSelectedItems) {
                  let splitlist = this.shadowRoot.querySelector("#splitList");
                  if (splitlist) {
                      splitlist.rerenderGrid();
                  }
              }
          });
      }
  }
  _onScopeLoad() {
      this._selectedScope = undefined;
      if (typeof this.$.accordion.hideContainer === 'function') {
          this.$.accordion.hideContainer();
      }
  }
  _save() {
      if (this._selectedScope) {
          let detail = {
              "name": this._selectedScope.name,
              "accesstype": this._selectedScope.accesstype,
              "selectedScope": this._selectedScope
          };
          this.$.scopeSelector.triggerSaveProcess(detail);
      } else {
          this.$.scopeSelector.isManageScopes = true;
      }
  }

  async _onEntityGetResponse(e, detail) {
      //copied entity session data
      let copiedEntityContext = sessionStorage.getItem('copyEntityData');
      if (!_.isEmpty(copiedEntityContext)) {
          copiedEntityContext = JSON.parse(copiedEntityContext);
          this._sourceEntityData = copiedEntityContext;
      }

      //Entities response data - all copy and paste entity details
      if (DataHelper.isValidObjectPath(detail, "response.content.entities")) {
          this._copyPasteEntities = detail.response.content.entities || [];
      }
      let copiedItemContext = ContextHelper.getFirstItemContext(copiedEntityContext);
      let copiedEntity = this._copyPasteEntities.filter(entity => {
         return entity.id == copiedItemContext.id;
      }, this);

      if (_.isEmpty(copiedEntity)) {
          this.logError("Entity get request - Copied entity details missing", copiedEntity);
          return;
      }

      copiedEntity = copiedEntity[0]; // copied entity details
      let attributes = copiedEntity.data.attributes;
      let currentLocale = this.contextData.ValContexts[0].locale;
      //changing the locale to pasteEntity in all self attributes
      this._setAttributesToCurrentLocale(attributes, currentLocale);

      // //changing the locale to pasteEntity in all context attributes
      if (DataHelper.isValidObjectPath(copiedEntity, 'data.contexts.0')) {

          let contextsInResponse = copiedEntity.data.contexts;
          contextsInResponse.forEach(context => {
              if (!_.isEmpty(context.attributes)) {
                  let attributes = context.attributes;
                  this._setAttributesToCurrentLocale(attributes, currentLocale);
              }
          }, this);
      }

      let clonedAttributes;
      if (DataHelper.isValidObjectPath(copiedEntity, 'data.attributes')) {
          clonedAttributes = DataHelper.cloneObject(copiedEntity.data.attributes);
      }
      //Attributes permission check
      if (!this._isAllAttributesHaveEditPermissions(clonedAttributes)) {
          return;
      }

      let dataContexts = ContextHelper.getDataContexts(this.contextData)
      if (!_.isEmpty(dataContexts)) {
          //add the logic to add attributes to context.data here and then send for save

          //If we copied from some context scenario we need to push that data instead of data.attributes.
          if (!_.isEmpty(copiedEntity.data.contexts)) {
              clonedAttributes = copiedEntity.data.contexts[0].attributes;
          }
          let dataContext = {
              "context": dataContexts[0],
              "attributes": clonedAttributes
          }
          copiedEntity.data.contexts.push(dataContext);
          copiedEntity.data.attributes = {};
      } else {
          let contextCloneAttributes = {};
          if (DataHelper.isValidObjectPath(copiedEntity, 'data.contexts.0')) {
              // extracting attributes from context of source entity
              copiedEntity.data.contexts.forEach(dataContext => {
                  if (!_.isEmpty(dataContext.attributes)) {
                      Object.assign(contextCloneAttributes, dataContext.attributes);
                  }
              })
              //Attributes permission check
              if (!this._isAllAttributesHaveEditPermissions(contextCloneAttributes)) {
                  return;
              }
              copiedEntity.data.attributes = contextCloneAttributes;
              copiedEntity.data.contexts = [];
          }
      }

      //Start update process
      if (!this.isBulkProcess && !_.isEmpty(copiedEntity)) {
          this._prepareRequestAndTriggerSave(copiedEntity);
      } else {
          this._prepareRequestAndTriggerSave(copiedEntity, this.selectedItemsForPaste);
      }
  }

  _isAllAttributesHaveEditPermissions(attributes) {
      let attributesWithNoPermissions = [];
      //logic to check permissions of attributes - entity manage only
      for (let attributeName in attributes) {
          if (!this.isBulkProcess && this._attributeModels.hasOwnProperty(attributeName) &&
              DataHelper.isValidObjectPath(this._attributeModels[attributeName], 'properties.hasWritePermission') &&
              !this._attributeModels[attributeName].properties.hasWritePermission) {
              attributesWithNoPermissions.push(this._attributeModels[attributeName].externalName);
          }
      }

      if (attributesWithNoPermissions.length) {
          let message = `You do not have permissions to edit [${attributesWithNoPermissions.join(", ")}] attributes`;
          this.showWarningToast(message);
          return false;
      }
      return true;
  }

  _collectNestedAttributes(attributes) {
      for (let attributeName in attributes) {
          let attributeModel = this._attributeModels[attributeName];
          if (attributeModel && attributeModel.dataType === "nested" &&
              attributes[attributeName].hasOwnProperty('group')) {
                  this._nestedAttributes.push(attributeName);
          }
      }
      this._nestedAttributes = _.uniq(this._nestedAttributes);
  }

  _setAttributesToCurrentLocale(attributes, currentLocale) {
      this._collectNestedAttributes(attributes);
      let defaultLocale = DataHelper.getDefaultLocale();
      for (let attributeName in attributes) {
          // nested attributes
          let attributeModel = this._attributeModels[attributeName];
          let locale = attributeModel && attributeModel.isLocalizable ? currentLocale : defaultLocale;
          if (this._nestedAttributes.indexOf(attributeName) != -1) {
              attributes[attributeName].group.forEach(group => {
                  for (let key in group) {
                      if (group[key] && group[key].values) {
                          group[key].values.forEach(value => {
                              value.locale = locale;
                          });
                      }
                  }
                  group.locale = locale;
              });
          } else if (attributes[attributeName].hasOwnProperty('values')) {
              attributes[attributeName].values.forEach(value => {
                  value.locale = locale;
              });
          }
      }
  }

  _getExternalNameForAttribute(attributeName) {
      let nameToExternalNameObject;
      if(!this._nameToExternalNameDictionary[attributeName]) {
          for (let index = 0; index< this.selectedItems.length; index++) {
              if(attributeName === this.selectedItems[index].name) {
                  this._nameToExternalNameDictionary[attributeName] = this.selectedItems[index].externalName;
                  break;
              }
          }
          return this._nameToExternalNameDictionary[attributeName]
      } else {
          return this._nameToExternalNameDictionary[attributeName]
      }
  }

  _prepareRequestAndTriggerSave(sourceEntity, targetEntities) {
      let clonedSourceEntity = DataHelper.cloneObject(sourceEntity);
      let entityTypesNotToSendForSave = [];
      if (!this.isBulkProcess) {
          let firstItemContext = this.getFirstItemContext();
          if (!_.isEmpty(firstItemContext) && firstItemContext.id) {
              targetEntities = [{
                  "id": firstItemContext.id,
                  "type": firstItemContext.type,
                  "name": firstItemContext.name
              }];
          }
      } else {
          let selectedAttributes;
          //getting unique entity types
          let uniqueEntityTypes = this._getUniqueEntityTypes();

          uniqueEntityTypes.forEach(entityType=> {
              let currentEntityAttributeModel;
              let firstDataContext = ContextHelper.getFirstDataContext(this.contextData);
              let attributeModels;
              currentEntityAttributeModel = this._targetEntitiesAttributeModels.filter(elm=> {
                  return elm.id === entityType + "_entityCompositeModel";
              })
              if(firstDataContext) {
                  // contextual
                  attributeModels = SharedUtils.DataObjectFalcorUtil.getAttributesByCtx(
                      currentEntityAttributeModel[0], firstDataContext);
                  selectedAttributes = SharedUtils.DataObjectFalcorUtil.getAttributesByCtx(
                      sourceEntity, firstDataContext);
              } else {
                  // self
                  if(DataHelper.isValidObjectPath(currentEntityAttributeModel[0], 'data.attributes')) {
                      attributeModels = currentEntityAttributeModel[0].data.attributes;
                  }
                  if(DataHelper.isValidObjectPath(sourceEntity, 'data.attributes')) {
                      selectedAttributes = sourceEntity.data.attributes;
                  }
              }
              if(!_.isEmpty(selectedAttributes) && !_.isEmpty(attributeModels)) {
                  Object.keys(attributeModels).forEach(attributeName=> {
                      let externalName = this._getExternalNameForAttribute(attributeName);
                      if(DataHelper.isValidObjectPath(attributeModels[attributeName], 'properties.hasWritePermission')) {
                          if(!attributeModels[attributeName].properties.hasWritePermission) {
                              if(entityTypesNotToSendForSave[entityType]) {
                                  entityTypesNotToSendForSave[entityType].push(externalName)
                              } else {
                                  entityTypesNotToSendForSave[entityType] = [externalName];
                              }
                          }
                      } else {
                          if(entityTypesNotToSendForSave[entityType]) {
                              entityTypesNotToSendForSave[entityType].push(externalName)
                          } else {
                              entityTypesNotToSendForSave[entityType] = [externalName];
                          }
                      }
                  })
              }
          })
          this._entityTypesNotToSendForSave = entityTypesNotToSendForSave;
      }

      if (!_.isEmpty(targetEntities)) {
          targetEntities.forEach(item => {

              if( Object.keys(entityTypesNotToSendForSave).indexOf(item.type) == -1) {
                  this._entitiesEligibleForSave++;
                  //Pick id, type and name from target entities for update
                  clonedSourceEntity.id = item.id;
                  clonedSourceEntity.type = item.type;
                  clonedSourceEntity.name = item.name;
                  if(!_.isEmpty(this._nestedAttributes)) {
                      this._updateNestedAttributesForEntity(clonedSourceEntity);
                  }
                  if (this.isBulkProcess) {
                      clonedSourceEntity.params = {
                          "authorizationType": "reject"
                      }
                      this._cloneEntitiesForBulkSave.push(clonedSourceEntity); //Capture for bulk result
                  }

                  this._saveRequest = {
                      "entities": [clonedSourceEntity]
                  };
                  this._saveEntity();

              } else {
                  this._entitiesNotEligibleForSave.push(item);
                  this._bulkSaveTracker++;
              }
          });

          if(this.isBulkProcess && this._entitiesEligibleForSave === 0) {
              this._entitySaveResponseObject.push(...(this._prepareMessagesForNonEligibleEntities()))
              this._triggerBulkFinishStep();
          }
      }
  }

  _updateNestedAttributesForEntity(entity) {
      let targetEntity = this._copyPasteEntities.filter(item => {
          return entity.id == item.id;
      }, this);

      //Target entity not having any attribute values, then return
      if (_.isEmpty(targetEntity) || !targetEntity[0].data ||
          _.isEmpty(targetEntity[0].data.attributes)) {
          return;
      }

      for (let attributeName of this._nestedAttributes) {
          let attributeValue = targetEntity[0].data.attributes[attributeName];
          let deleteNestedAttrValues = [];
          if (attributeValue && !_.isEmpty(attributeValue.group)) {
              for (let groupItem of attributeValue.group) {
                  groupItem.action = "delete";
                  deleteNestedAttrValues.push(groupItem);
              }
          }

          if (deleteNestedAttrValues.length &&
              DataHelper.isValidObjectPath(entity, "data.attributes")) {
              if (entity.data.attributes[attributeName]) {
                  entity.data.attributes[attributeName].group = entity.data.attributes[attributeName].group || [];
                  for (let deleteAttrValue of deleteNestedAttrValues) {
                      entity.data.attributes[attributeName].group.push(deleteAttrValue);
                  }
              }
          }
      }
  }

  _saveEntity() {
      let liquidSave = this.shadowRoot.querySelector("[name=attributeSaveDataService]");
      if (liquidSave) {
          liquidSave.generateRequest();
      } else {
          this.logError("Save failed: Not able to access attributeSaveDataService liquid");
      }
  }

  _onEntityGetFailed(e) {
      this.logError("Copied entities data get failed", e.detail);
  }

  _onTargetEntityModelGetResponse(e, detail) {
      let data = sessionStorage.getItem('copyEntityData');
      let copiedEntityContext, entityGetRequest;
      this._compositeModelResponseTracker++;

      if(DataHelper.isValidObjectPath(e, 'detail.response.content.entityModels.0')) {
          this._targetEntitiesAttributeModels.push(e.detail.response.content.entityModels[0]);
          let uniqueEntityTypes = this._getUniqueEntityTypes();
          if(uniqueEntityTypes.length === this._compositeModelResponseTracker) {
          //creating get request from copied entities contextData
          copiedEntityContext = JSON.parse(data);
          let copiedItemContext = this._getUpdatedItemContextWithSelectedEntities(copiedEntityContext);
          copiedEntityContext.ItemContexts = [copiedItemContext];

          entityGetRequest = DataRequestHelper.createEntityGetRequest(copiedEntityContext);
          let liquidDataElement = this.shadowRoot.querySelector('#getEntity');

          // getting selected attributes and pushing into the request
          let attributes = this.selectedItems.map(elm => {
              return elm.name;
          });
          entityGetRequest.params.fields.attributes = attributes;
          //setting non-coalesce flag
          entityGetRequest.params.query.filters.nonContextual = false;

          liquidDataElement.requestData = entityGetRequest;
          liquidDataElement.generateRequest();
          }
      }
  }

  _getUniqueEntityTypes() {
      let entityTypes = this.selectedItemsForPaste.map(elm=> {
          return elm.type;
      });
      return (_.uniq(entityTypes));
  }
  _getEntityCompositeModels() {
      let targetEntities = this.selectedItemsForPaste;
      let uniqueEntityTypes = this._getUniqueEntityTypes();
      let liquidCustomElement = customElements.get("liquid-entity-model-composite-get");

      uniqueEntityTypes.forEach(entityType=> {
          let liquidElement = new liquidCustomElement();
          let compositeRequest = DataRequestHelper.createEntityModelCompositeGetRequest(this.contextData);
          compositeRequest.params.query.name = entityType;
          let attributeNames = this.selectedItems.map(elm => {
              return elm.name;
          });
          compositeRequest.params.fields.attributes = attributeNames;
          liquidElement.requestData = compositeRequest;
          liquidElement.addEventListener("entity-model-composite-get-response", this._onTargetEntityModelGetResponse.bind(this));
          this.shadowRoot.appendChild(liquidElement);
          setTimeout(() => {
              liquidElement.generateRequest();
          }, 10);
      });
  }

  _executePaste(e) {
      let copiedEntityContext, entityGetRequest;
      let data = sessionStorage.getItem('copyEntityData');
      if (!this.selectedItems || !this.selectedItems.length) {
          this.showWarningToast("Select at least 1 attribute for paste");
          return;
      }

      if (!_.isEmpty(data)) {

          // making call for composite models of all entity types so we can use that stop non-context mapped attributes save
                  if(this.isBulkProcess) {
                      this._getEntityCompositeModels();
                  } else {
                      copiedEntityContext = JSON.parse(data);
                      let copiedItemContext = this._getUpdatedItemContextWithSelectedEntities(copiedEntityContext);
                      copiedEntityContext.ItemContexts = [copiedItemContext];

                      entityGetRequest = DataRequestHelper.createEntityGetRequest(copiedEntityContext);
                      let liquidDataElement = this.shadowRoot.querySelector('#getEntity');

                      // getting selected attributes and pushing into the request
                      let attributes = this.selectedItems.map(elm => {
                          return elm.name;
                      });
                      entityGetRequest.params.fields.attributes = attributes;
                      //setting non-coalesce flag
                      entityGetRequest.params.query.filters.nonContextual = false;

                      liquidDataElement.requestData = entityGetRequest;
                      liquidDataElement.generateRequest();
                  }
          } else {
                      this.showWarningToast('Copy an entity before pasting it');
          }
  }

  _getUpdatedItemContextWithSelectedEntities(copiedEntityContext) {
      let ids = [];
      let types = [];
      let itemContext = ContextHelper.getFirstItemContext(copiedEntityContext);

      //Push copied id and type
      ids.push(itemContext.id);
      types.push(itemContext.type);

      //Update context with selected entities
      if (!this.isBulkProcess) {
          //Push target ids, types
          let firstItemContext = ContextHelper.getFirstItemContext(this.contextData);
          ids.push(firstItemContext.id);
          types.push(firstItemContext.type);
      } else {
          (this.selectedItemsForPaste || []).forEach(item => {
              ids.push(item.id);
              types.push(item.type);
          }, this);
      }

      itemContext.id = ids;
      delete itemContext.name;
      itemContext.type = _.uniq(types);

      return itemContext;
  }

  _onCancelTap() {
      let eventDetail = {
          name: "onCancel"
      };
      this.fireBedrockEvent("onCancel", eventDetail, { "ignoreId": true });
  }
  _getHeaderText(_selectedScope) {
      return this._selectedScope ? "Editing scope:  " + this._selectedScope.name : "Select attributes for paste";
  }
}
customElements.define(RockEntityPaste.is, RockEntityPaste)
