/**
`<rock-entity-tofix>` Represents an element that displays the errors, warnings, and information 
of an entity as a list.

### Styling

The following custom properties and mixins are available for styling:

Custom property | Description | Default
----------------|-------------|----------
`--entity-tofix-horizontal-divider` | Mixin applied to horizontal divider | {}
`--entity-tofix-container` | Mixin applied to entity item container | {}
`--entity-icon-outer-circle` | Mixin applied to item icon outer circle | {}
`--entity-icon-width` | The width of item icon | 20px
`--entity-icon-height` | The height of item icon | 20px
`--entity-icon-margin` | The margin of item icon | ``
`--error-icon-outer-bg-color` | The outer bg color of error item icon | rgba(251, 96, 103, 1)
`--entity-error-icon-fill-color` | The fill color of error icon | #ffffff
`--entity-error-icon-stroke-color` | The stroke color of error icon | rgba(251, 96, 103, 1)
`--warning-icon-outer-bg-color` | The outer bg color of warning item icon | orange
`--entity-warning-icon-fill-color` | The fill color of warning icon | #ffffff
`--entity-warning-icon-stroke-color` | The stroke color of warning icon | orange
`--info-icon-outer-bg-color` | The outer bg color of info item icon | rgba(22, 180, 252, 1)
`--entity-info-icon-fill-color` | The fill color of info icon | #ffffff
`--entity-info-icon-stroke-color` | The stroke color of info icon | rgba(22, 180, 252, 1)
`--entity-tofix-content` | Mixin applied to entity item content | {}

@group rock Elements
@element rock-entity-tofix
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-helpers/attribute-helper.js';
import '../bedrock-helpers/component-helper.js';
import '../bedrock-helpers/context-helper.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-helpers/data-request-helper.js';
import '../bedrock-helpers/data-merge-helper.js';
import '../bedrock-externalref-underscore/bedrock-externalref-underscore.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../bedrock-style-manager/styles/bedrock-style-floating.js';
import '../bedrock-style-manager/styles/bedrock-style-scroll-bar.js';
import '../bedrock-logger-behavior/bedrock-logger-behavior.js';
import '../bedrock-toast-behavior/bedrock-toast-behavior.js';
import '../bedrock-app-behavior/bedrock-app-behavior.js';
import '../liquid-entity-model-get/liquid-entity-model-get.js';
import '../liquid-entity-govern-data-get/liquid-entity-govern-data-get.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-icons/pebble-icons.js';
import '../pebble-image-viewer/pebble-image-viewer.js';
import '../pebble-horizontal-divider/pebble-horizontal-divider.js';
import '../pebble-spinner/pebble-spinner.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockEntityTofix extends mixinBehaviors([RUFBehaviors.AppBehavior,
RUFBehaviors.ComponentContextBehavior, RUFBehaviors.ToastBehavior,
RUFBehaviors.LoggerBehavior], PolymerElement) {
  static get template() {
    return Polymer.html`
        <style include="bedrock-style-common bedrock-style-scroll-bar bedrock-style-floating bedrock-style-icons">
            pebble-horizontal-divider {
                height: 1px;
                width: 100%;
                background: var(--divider-color, #c1cad4);
                opacity: 1;
                min-height: 1px;
                max-height: 1px;
                margin-bottom: 5px;
            }

            :host {
                display: block;
                height: 100%;
            }

            .tofix-data-container {
                height: 100%;
                overflow: auto;
                position: relative;
            }

            .title {
                font-size: var(--default-font-size, 14px);
                color: var(--link-text-color, #036Bc3);
                margin-top: 5px;
                font-weight: 500
            }

            .data-list {
                display: -webkit-box;
                display: -webkit-flex;
                display: -ms-flexbox;
                display: flex;
                align-items: center;
                padding: 2px 0;
            }

            .data-list:hover {
                color: var(--focused-line, #026bc3);
                background-color: var(--bgColor-hover, #e8f4f9);
            }

            .entity-icon-outer {
                width: 30px;
                margin-right: 10px;
                float: left;
            }

            .entity-content {
                cursor: pointer;
                color: var(--secondary-button-text-color, #75808b);
                font-size: var(--font-size-sm, 12px);
                width: calc(100% - 42px);
                float: left;
            }

            .entity-content.unkown {
                color: var(--text-primary-color, #1a2028);
            }

            .entity-content.false {
                color: var(--default-text-color, #444444);
            }
        </style>
        <liquid-entity-model-get exclude-in-progress="" id="workflowMappingsGet" operation="getbyids" request-id="workflowMappingsGet" on-response="_onWorkflowMappingsGetResponse" on-error="_onWorkflowMappingsGetError"></liquid-entity-model-get>

        <liquid-entity-govern-data-get exclude-in-progress="" id="entityGovernDataGet" operation="getbyids" request-id="entityGovernDataGet" on-response="_onEntityGovernDataGetResponse" on-error="_onEntityGovernDataGetResponseError" no-cache=""></liquid-entity-govern-data-get>

        <liquid-entity-model-get exclude-in-progress="" id="workflowDefintionGet" operation="getbyids" request-id="workflowDefinitionGet" on-response="_onWorkflowDefinitionGetResponse" on-error="_onWorkflowDefinitionGetError"></liquid-entity-model-get>

        <liquid-entity-model-get exclude-in-progress="" id="ruleContextMappingsGet" operation="getbyids" request-id="ruleContextMappingsGet" on-response="_onRuleContextMappingsGetResponse" on-error="_onRuleContextMappingsGetError"></liquid-entity-model-get>

        <liquid-entity-model-get exclude-in-progress="" id="businessConditionsGet" operation="getbyids" request-id="businessConditionsGet" on-response="_onBusinessConditionsGetResponse" on-error="_onBusinessConditionsGetError"></liquid-entity-model-get>

        <liquid-entity-model-get id="unknownBusinessConditionsGet" operation="getbyids" request-id="unknownBusinessConditionsGet" on-response="_onUnkownBusinessConditionsGetResponse" on-error="_onUnkownBusinessConditionsGetError"></liquid-entity-model-get>
        <!--<bedrock-pubsub event-name="business-save-complete" handler="_onBusinessSaveComplete"></bedrock-pubsub>-->

        <bedrock-pubsub event-name="business-condition-save-response" handler="_onBusinessConditionSaveResponse"></bedrock-pubsub>

        <bedrock-pubsub event-name="business-condition-save-request" handler="_onBusinessConditionSaveRequest"></bedrock-pubsub>
        <bedrock-pubsub event-name="workflow-panel-refreshed" handler="refresh"></bedrock-pubsub>
        <div class="tofix-data-container">
            <pebble-spinner active="[[!_isToFixDataExists]]"></pebble-spinner>
            <template is="dom-if" if="[[_isToFixDataExists]]">
                <template is="dom-repeat" items="[[_tofixData]]" as="tofixItem">
                    <div class="title">[[tofixItem.label]]</div>
                    <pebble-horizontal-divider></pebble-horizontal-divider>
                    <template is="dom-repeat" items="[[tofixItem.businessConditions]]" as="businessCondition">
                        <div class="data-list" data="[[businessCondition]]" on-tap="_onTap">
                            <div class="entity-icon-outer">
                                <pebble-icon icon="[[_getIconByType(businessCondition.status)]]" class="pebble-icon-size-30"></pebble-icon>
                            </div>
                            <div class\$="entity-content [[businessCondition.status]]" title\$="[[businessCondition.name]]">
                                <div class="text-ellipsis">[[businessCondition.name]]</div>
                            </div>
                            <div class="clearfix"></div>
                        </div>
                    </template>
                </template>
            </template>
            <div id="messagePanel" class="message-panel"></div>
        </div>
`;
  }

  static get is() {
      return "rock-entity-tofix";
  }

  static get properties() {
      return {
          contextData: {
              type: Object,
              value: function () {
                  return {};
              },
              'observer': '_contextDataChanged'
          },

          /**
           * If set as true , it indicates the component is in read only mode
           */
          readonly: {
              type: Boolean,
              value: false
          },

          _clonedContextData: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          _entityTypeWorkflowMappings: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          _entityBusinessConditionsGovernData: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          _entityBusinessConditionNames: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          _entityWorkflowGovernData: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          _entityGovernWorkflowNames: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          _workflowDefinitions: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          _contextSpecificBusinessConditions: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          _globalBusinessConditions: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          _entityTypeBusinessConditions: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          _originalBusinessConditions: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          _isToFixDataExists: {
              type: Boolean,
              value: false
          },

          _tofixData: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          _errorMessage: {
              type: String,
              value: "Error in Loading Component: Contact your Administrator."
          },

          _nothingToFixMessage: {
              type: String,
              value: "Nothing to fix!"
          },
          _multipleContextsMessage: {
              type: String,
              value: "Select one context to fix data."
          },
          businessCondition: {
              type: Object,
              value: function () {
                  return {}
              }
          },

          _isEntityGovernReponseReceived: {
              type: Boolean,
              value: false
          },

          _isWorkflowDefinitionReceived: {
              type: Boolean,
              value: false
          },

          _isRuleContextMappingsReceived: {
              type: Boolean,
              value: false
          },

          _isOriginalBCReceived: {
              type: Boolean,
              value: false
          },

          _isWorkflowDefinitionReq: {
              type: Boolean,
              value: false
          }
      };
  }

  constructor() {
      super();
  }

  connectedCallback() {
      super.connectedCallback();
  }

  disconnectedCallback() {
      super.disconnectedCallback();
  }

  ready() {
      super.ready();

      this.businessCondition.saved = false;
      this.businessCondition.longTimeToSave = false;
  }

  _contextDataChanged() {
      if (!_.isEmpty(this.contextData)) {
          let dataContexts = ContextHelper.getDataContexts(this.contextData);
          if(dataContexts.length > 1) {
              this._showMessage(this._multipleContextsMessage);
              return;
          }
          this._clonedContextData = DataHelper.cloneObject(this.contextData);
          let itemContext = ContextHelper.getFirstItemContext(this._clonedContextData);
          itemContext.attributeNames = [];
          itemContext.relationships = [];
          itemContext.relationshipAttributes = [];
          this._clonedContextData[ContextHelper.CONTEXT_TYPE_ITEM] = [itemContext];
          let valueContext = ContextHelper.getFirstValueContext(this._clonedContextData);
          valueContext = [];
          this._clonedContextData[ContextHelper.CONTEXT_TYPE_VALUE] = valueContext;
          this._initiateWorkflowMappingGet();
      }
  }

  getControlIsDirty() {
      let businessFunctionDialog = RUFUtilities.appCommon.getFunctionDialog();

      if (businessFunctionDialog && businessFunctionDialog.getControlIsDirty) {
          return businessFunctionDialog.getControlIsDirty();
      }
  }

  _initiateWorkflowMappingGet() {
      // Use ES6 and Underscore methods whever applicable
      if (!_.isEmpty(this.contextData)) {
          this.shadowRoot.querySelector("#messagePanel").textContext = "";

          let workflowMappingsGet = this.shadowRoot.querySelector('#workflowMappingsGet');

          if (typeof (workflowMappingsGet) === "undefined" ||
              workflowMappingsGet == null) {
              RUFUtilities.Logger.error("Liquid element having id workflowMappingsGet not found.", null, "entity-manage");
              this._showMessage(this._errorMessage);
              return;
          }

          // Create Request and Get
          workflowMappingsGet.requestData = DataRequestHelper.createWorkflowMappingGetRequest(this._clonedContextData);
          workflowMappingsGet.generateRequest();
      }
  }

  _onWorkflowMappingsGetResponse(e) {
      let responseContent = DataHelper.validateAndGetResponseContent(e.detail.response);

      if (responseContent) {
          let workflowMappingModels = responseContent.entityModels;

          // Get Workflows Mapped to the Current EntityType
          if (workflowMappingModels && workflowMappingModels.length > 0) {
              let wfDefinitionMappingModel = workflowMappingModels.find(obj => obj.type == "workflowDefinitionMapping");
              let workflowContexts = ContextHelper.createWorkflowContexts(wfDefinitionMappingModel, this._clonedContextData);
              let itemContext = ContextHelper.getFirstItemContext(this._clonedContextData);
              itemContext.workflowContexts = workflowContexts;
          }

          // Make Entity Govern Get
          this._requestEntityGovernData();
      } else {
          RUFUtilities.Logger.error("WorkflowMappingsGetResponseContent not found.", null, "entity-manage");
          this._showMessage(this._nothingToFixMessage);
      }
  }

  _onWorkflowMappingsGetError(e) {
      RUFUtilities.Logger.error("WorkflowMappingsGetError:- " + e.detail.response.reason.message, null, "entity-manage");
  }

  _requestEntityGovernData() {
      let entityGovernDataGet = this.shadowRoot.querySelector('#entityGovernDataGet');

      if (_.isEmpty(entityGovernDataGet)) {
          RUFUtilities.Logger.error("Liquid element having id entityGovernDataGet not found.", null, "entity-manage");
          this._showMessage(this._errorMessage);
          return;
      }

      // Prepare Context
      let clonedContextData = DataHelper.cloneObject(this._clonedContextData);

      let itemContext = ContextHelper.getFirstItemContext(clonedContextData);
      itemContext.attributeNames = ["_ALL"];

      let dataContexts = ContextHelper.getDataContexts(this._clonedContextData);

      // Prepare DataContext
      // Note: Can be possible that No Workflow is available for Current EntityType
      let workflowContexts = itemContext.workflowContexts;
      if (!_.isEmpty(workflowContexts)) {
          dataContexts = dataContexts.concat(workflowContexts);
      }

      if(!_.isEmpty(dataContexts)) {
          clonedContextData[ContextHelper.CONTEXT_TYPE_DATA] = dataContexts;
      }

      // Create Request and Get
      entityGovernDataGet.requestData = DataRequestHelper.createEntityGetRequest(clonedContextData);
      entityGovernDataGet.generateRequest();
  }

  _onEntityGovernDataGetResponse(e) {
      this._isEntityGovernReponseReceived = true;
      let responseContent = DataHelper.validateAndGetResponseContent(e.detail.response);

      if (responseContent && !_.isEmpty(responseContent.entities)) {
          let entities = responseContent.entities;
          this._setEntityWorkflowGovernData(entities[0]);
          this._setEntityBusinessConditionsGovernData(entities[0]);

          this._updateWorkflowContexts();

          this._requestWorkflowDefinition();

          // Note: Could be optimized.Why to bring all RuleMappings?
          this._requestRuleContextMappings();
      } else {
          RUFUtilities.Logger.error("EntityGovernDataGetResponseContent not found.", null, "entity-manage");
          this._showMessage(this._nothingToFixMessage);
      }
  }

  _onEntityGovernDataGetError(e) {
      RUFUtilities.Logger.error("EntityGovernDataGetError:- " + e.detail.response.reason.message, null, "entity-manage");
      this._showMessage(this._errorMessage);
  }

  _setEntityWorkflowGovernData(entityGovernData) {
      if (DataHelper.isValidObjectPath(entityGovernData, "data.contexts")) {
          let contextualEntityGovernData = entityGovernData.data.contexts;

          if (typeof (contextualEntityGovernData) !== "undefined" && contextualEntityGovernData.length > 0) {
              this._entityGovernWorkflowNames = [];
              this._entityWorkflowGovernData = [];

              for (let i = 0; i < contextualEntityGovernData.length; i++) {

                  // Non Worflow ContextInformation should be ignored
                  if (typeof (contextualEntityGovernData[i].context.workflow) !== "undefined") {
                      let workflowContext = contextualEntityGovernData[i].context;
                      let attributes = contextualEntityGovernData[i].attributes;

                      if (typeof (workflowContext) !== "undefined" && typeof (attributes) !== "undefined") {

                          let workflowGovernData = {
                              "id": workflowContext.workflow,
                              "name": workflowContext.workflow,
                              "attributes": attributes // Workflow Attributes [Also includes activities]
                          }

                          this.push("_entityGovernWorkflowNames", workflowContext.workflow);
                          this.push("_entityWorkflowGovernData", workflowGovernData);
                      }
                  }
              }
          }
      }
  }

  _setEntityBusinessConditionsGovernData(entityGovernData) {
      if(typeof (entityGovernData) && typeof (entityGovernData.data) !== "undefined") {
          let entityBusinessConditions = [];
          let dataContexts = ContextHelper.getDataContexts(this._clonedContextData);
          if(!_.isEmpty(dataContexts)) {
              for(let i=0; i<dataContexts.length; i++) {
                  let context = dataContexts[i];
                  let businessConditions = EntityHelper.getattributeBasedOnContext(entityGovernData, "businessConditions", context);
                  if(!_.isEmpty(businessConditions) && !_.isEmpty(businessConditions.group)) {
                      entityBusinessConditions = entityBusinessConditions.concat(businessConditions.group);
                  }
              }
          } else {
              let businessConditions = EntityHelper.getattributeBasedOnContext(entityGovernData, "businessConditions");
              if(!_.isEmpty(businessConditions) && !_.isEmpty(businessConditions.group)) {
                  entityBusinessConditions = businessConditions.group;
              }
          }

          if (!_.isEmpty(entityBusinessConditions)) {
              this._entityBusinessConditionNames = [];
              this._entityBusinessConditionsGovernData = [];

              for (let i = 0; i < entityBusinessConditions.length; i++) {
                  let businessConditionId = AttributeHelper.getFirstAttributeValue(entityBusinessConditions[i].businessConditionName);
                  let businessConditionStatus = AttributeHelper.getFirstAttributeValue(entityBusinessConditions[i].businessConditionStatus);

                  let businessConditionGovernData = {
                      "id": businessConditionId,
                      "name": businessConditionId,
                      "status": businessConditionStatus
                  }

                  this.push("_entityBusinessConditionNames", businessConditionId);
                  this.push("_entityBusinessConditionsGovernData", businessConditionGovernData);
              }
          }
      }
  }

  _updateWorkflowContexts() {
      let itemContext = ContextHelper.getFirstItemContext(this._clonedContextData);
      let workflowContexts = itemContext && itemContext.workflowContexts ? itemContext.workflowContexts : [];
      if(!_.isEmpty(workflowContexts)) {
          if(_.isEmpty(this._entityGovernWorkflowNames)) {
              workflowContexts = [];
          } else {
              workflowContexts = workflowContexts.reduce((prev, next) => {
                  if(this._entityGovernWorkflowNames.indexOf(next.workflow) > -1) {
                      prev.push(next);
                  }
                  return prev;
              }, []);
          }
      }

      itemContext.workflowContexts = workflowContexts;
  }

  _requestWorkflowDefinition() {
      if (!_.isEmpty(this._entityGovernWorkflowNames)) {
          let workflowDefinitionGet = this.shadowRoot.querySelector("#workflowDefintionGet");

          if (typeof (workflowDefinitionGet) === "undefined" ||
              workflowDefinitionGet == null) {
              RUFUtilities.Logger.error("Element having id workflowDefinitionGet not found.", null, "entity-manage");
              this._showMessage(this._errorMessage);
              return;
          }

          let clonedContextData = DataHelper.cloneObject(this._clonedContextData);

          // Prepare ItemContext 
          let itemContext = ContextHelper.getFirstItemContext(clonedContextData);
          itemContext.workflowNames = this._entityGovernWorkflowNames;
          clonedContextData[ContextHelper.CONTEXT_TYPE_ITEM] = [itemContext];

          this._isWorkflowDefinitionReq = true;
          // Create Request and Get
          workflowDefinitionGet.requestData = DataRequestHelper.createWorkflowDefinitionGetRequest(clonedContextData);
          workflowDefinitionGet.generateRequest();
      }
  }

  _onWorkflowDefinitionGetResponse(e) {
      this._isWorkflowDefinitionReceived = true;
      let responseContent = DataHelper.validateAndGetResponseContent(e.detail.response);

      if (responseContent) {
          let workflowDefintions = responseContent.entityModels;

          if (!_.isEmpty(workflowDefintions)) {
              this._workflowDefinitions = [];

              for (let i = 0; i < workflowDefintions.length; i++) {
                  let workflowDefinition = {};
                  workflowDefinition["name"] = workflowDefintions[i].name;
                  workflowDefinition["attributes"] = workflowDefintions[i].data.attributes;
                  this.push("_workflowDefinitions", workflowDefinition);
              }
              this._prepareToFixData();
          } else {
              this._showMessage(this._nothingToFixMessage);
          }
      } else {
          RUFUtilities.Logger.error("EntityGovernDataGetResponse Content not found.", null, "entity-manage");
      }
  }

  _onWorkflowDefinitionGetError(e) {
      RUFUtilities.Logger.error("Failed to get workflow definition with error: " + e.detail.response.reason.message, null, "entity-manage");
      this._showMessage(this._errorMessage);
  }

  _requestRuleContextMappings() {
      let ruleContextMappingsGet = this.shadowRoot.querySelector('#ruleContextMappingsGet');

      if (typeof (ruleContextMappingsGet) === "undefined" ||
          ruleContextMappingsGet == null) {
          RUFUtilities.Logger.error("Element having id ruleContextMappingsGet not found.", null, "entity-manage");
          this._showMessage(this._errorMessage);
          return;
      }


      let clonedContextData = DataHelper.cloneObject(this._clonedContextData);

      // Prepare ItemContext
      let itemContext = ContextHelper.getFirstItemContext(clonedContextData);
      let requestedType = "ruleContextMappings";
      let requestedId = itemContext.type + "_" + requestedType;
      itemContext.id = requestedId;
      itemContext.type = requestedType;
      itemContext.relationships = ["hasBusinessConditions"];
      itemContext.relationshipAttributes = ['isDeleted', 'enabled', 'stepName'];
      clonedContextData[ContextHelper.CONTEXT_TYPE_ITEM] = [itemContext];

      let valueContext = [DataHelper.getDefaultValContext()];
      clonedContextData[ContextHelper.CONTEXT_TYPE_VALUE] = valueContext;

      // Prepare DataContext
      // This should be optional because entity can be in workflow or cannot be in workflow
      let workflowContexts = itemContext.workflowContexts;
      let dataContexts = ContextHelper.getDataContexts(clonedContextData);
      if (!_.isEmpty(workflowContexts)) {
          dataContexts = dataContexts.concat(workflowContexts);
      }

      if(!_.isEmpty(dataContexts)) {
          clonedContextData[ContextHelper.CONTEXT_TYPE_DATA] = dataContexts;
      }

      // Create Request and Get
      ruleContextMappingsGet.requestData = DataRequestHelper.createEntityGetRequest(clonedContextData);
      ruleContextMappingsGet.generateRequest();
  }

  _onRuleContextMappingsGetResponse(e) {
      this._isRuleContextMappingsReceived = true;
      let ruleContextMappingsResponse = e.detail.response;
      let allBusinessConditions = [];
      let responseContent = DataHelper.validateAndGetResponseContent(e.detail.response);
      if (responseContent) {
          let ruleContextMappings = responseContent.entityModels.length > 0 ? responseContent.entityModels[0] : undefined;

          if (DataHelper.isValidObjectPath(ruleContextMappings, "data.contexts") && !_.isEmpty(ruleContextMappings.data.contexts)) {
              this._contextSpecificBusinessConditions = [];
              let contextSpecificRuleMaps = ruleContextMappings.data.contexts;

              for (let i = 0; i < contextSpecificRuleMaps.length; i++) {
                  if(typeof (contextSpecificRuleMaps[i].context.workflow) !== "undefined") {
                      let workflowName = contextSpecificRuleMaps[i].context.workflow;
                      let businessConditions = contextSpecificRuleMaps[i].relationships.hasBusinessConditions;

                      let contextSpecificBusinessCondition = {};
                      contextSpecificBusinessCondition["workflowName"] = workflowName;
                      contextSpecificBusinessCondition["businessConditions"] = businessConditions;
                      this.push("_contextSpecificBusinessConditions", contextSpecificBusinessCondition);
                      allBusinessConditions = allBusinessConditions.concat(businessConditions);
                  }
              }
          }

          let dataContexts = ContextHelper.getDataContexts(this._clonedContextData);
          let globalBusinessConditions = [];
          if(!_.isEmpty(dataContexts)) {
              for(let i=0; i < dataContexts.length; i++) {
                  let context = dataContexts[i];
                  let relationships = EntityHelper.getRelationshipsBasedOnContext(ruleContextMappings, context);
                  let hasBusinessConditions = relationships && relationships.hasBusinessConditions ? relationships.hasBusinessConditions : [];
                  if(!_.isEmpty(hasBusinessConditions)) {
                      globalBusinessConditions = globalBusinessConditions.concat(hasBusinessConditions);
                  }
              }
          } else {
              let relationships = EntityHelper.getRelationshipsBasedOnContext(ruleContextMappings, {}, true);
              globalBusinessConditions = relationships && relationships.hasBusinessConditions ? relationships.hasBusinessConditions : [];
          }

          if (!_.isEmpty(globalBusinessConditions)) {
              this._globalBusinessConditions = [];

              for (let j = 0; j < globalBusinessConditions.length; j++) {

                  let globalBusinessCondition = {};
                  globalBusinessCondition["name"] = globalBusinessConditions[j].relTo.id;
                  globalBusinessCondition["attributes"] = globalBusinessConditions[j].attributes;
                  this.push("_globalBusinessConditions", globalBusinessCondition);
              }
              allBusinessConditions = allBusinessConditions.concat(globalBusinessConditions);
          }

          if (allBusinessConditions && allBusinessConditions.length > 0) {
              this._entityTypeBusinessConditions = allBusinessConditions;
              let allBusinessConditionIds = this._getBusinessConditionIds(this._entityTypeBusinessConditions);
              this._requestBusinessConditions(allBusinessConditionIds);
          } else {
              this._showMessage(this._nothingToFixMessage);
          }
      } else {
          RUFUtilities.Logger.error("RuleContextMappingsGetResponseContent not found.", null, "entity-manage");
          this._showMessage(this._nothingToFixMessage);
      }
  }

  _onRuleContextMappingsGetError(e) {
      RUFUtilities.Logger.error("RuleContextMappingsGetError:- " + e.detail.response.reason.message, null, "entity-manage");
      this._showMessage(this._errorMessage);
  }

  _getBusinessConditionIds(businessConditions) {
      let businessConditionIds = [];
      if (!_.isEmpty(businessConditions)) {
          businessConditions.forEach(function (businessCondition) {
              if (businessCondition.relTo && businessCondition.relTo.id) {
                  businessConditionIds.push(businessCondition.relTo.id);
              }
          }, this);
      }
      return businessConditionIds;
  }

  _requestBusinessConditions(businessConditionIds) {
      if (businessConditionIds.length) {

          let clonedContextData = DataHelper.cloneObject(this._clonedContextData);

          // Prepare ItemContext
          let itemContext = ContextHelper.getFirstItemContext(clonedContextData);
          itemContext.id = businessConditionIds;
          itemContext.type = "businessCondition";
          clonedContextData[ContextHelper.CONTEXT_TYPE_ITEM] = [itemContext];
          clonedContextData.ItemContexts[0].attributeNames = ["impactRoles"];
          let defaultValContext = DataHelper.getDefaultValContext();
          if (defaultValContext) {
              clonedContextData.ValContexts = [defaultValContext];
          }

          let dataContexts = ContextHelper.getDataContexts(this.contextData);
          clonedContextData[ContextHelper.CONTEXT_TYPE_DATA] = dataContexts;

          // Create Request and Get
          let businessConditionsGet = this.shadowRoot.querySelector("#businessConditionsGet");
          businessConditionsGet.requestData = DataRequestHelper.createEntityGetRequest(clonedContextData);
          businessConditionsGet.generateRequest();
      }
  }

  _onBusinessConditionsGetResponse(e) {
      this._isOriginalBCReceived = true;
      let responseContent = DataHelper.validateAndGetResponseContent(e.detail.response);

      if (responseContent) {
          let businessConditions = responseContent.entityModels;

          if (!_.isEmpty(businessConditions)) {
              this._originalBusinessConditions = [];

              for (let i = 0; i < businessConditions.length; i++) {
                  let businessCondition = {};
                  businessCondition["id"] = businessConditions[i].id;
                  businessCondition["name"] = businessConditions[i].name;

                  // LongNames are required for Displaying BusinessConditions
                  if (this._isBusinessConditionAllowedForRole(businessConditions[i])) {
                      let formattedBusinessCondition = this._entityBusinessConditionsGovernData.find(businessCondition => businessCondition.id === businessConditions[i].id);
                      if (formattedBusinessCondition) {
                          formattedBusinessCondition["name"] = businessConditions[i].name;
                          formattedBusinessCondition["isAllowedToShow"] = true;
                      } else {
                          formattedBusinessCondition = {};
                          formattedBusinessCondition["id"] = businessConditions[i].id;
                          formattedBusinessCondition["name"] = businessConditions[i].name;
                          formattedBusinessCondition["isAllowedToShow"] = true;
                          formattedBusinessCondition["status"] = "unknown";
                          this._entityBusinessConditionsGovernData.push(formattedBusinessCondition);
                      }
                      this.push("_originalBusinessConditions", businessCondition);
                  }
              }
              this._prepareToFixData();
          } else {
              this._showMessage(this._nothingToFixMessage);
          }
      } else {
          RUFUtilities.Logger.error("EntityModelGetByIdsResponse Content not found.", null, "entity-manage");
          this._showMessage(this._nothingToFixMessage);
      }
  }

  _onBusinessConditionsGetError(e) {
      RUFUtilities.Logger.error("EntityModelGetByIdsError:- " + e.detail.response.reason.message, null, "entity-manage");
      this._showMessage(this._errorMessage);
  }

  _isBusinessConditionAllowedForRole(businessCondition) {
      let allowedRoles;
      if (DataHelper.isValidObjectPath(businessCondition, "data.attributes.impactRoles.values")) {
          allowedRoles = AttributeHelper.getAttributeValues(
              businessCondition.data.attributes.impactRoles.values);
      }
      let userContext = this.contextData.UserContexts[0];
      if (allowedRoles && userContext && userContext.roles) {
          let currentUserRoles = userContext.roles;
          let isRoleAllowed = allowedRoles.some(allowedRole => currentUserRoles.indexOf(allowedRole) > -1)
          if (allowedRoles.indexOf("_ALL") > -1 || isRoleAllowed) {
              return true;
          }

          //Not have "_ALL" / user role
          return false;
      }

      //No allowedRoles OR No user role, then BC is applicable to any role   
      return true;
  }

  _prepareToFixData() {
      if (this._isDataSetPrepared()) {
          let _tofixData = [];
          let workflowBusinessConditions = [];
          let unkownBusinessConditionIds = [];

          let tofixGlobalData = {};
          tofixGlobalData["id"] = "general";
          tofixGlobalData["label"] = "General";
          tofixGlobalData["type"] = "Global";
          tofixGlobalData["businessConditions"] = [];
          if (this._entityWorkflowGovernData.length > 0 && this._contextSpecificBusinessConditions.length > 0) {

              let tofixWorkflowDataSet = [];
              for (let i = 0; i < this._entityWorkflowGovernData.length; i++) {
                  let workflowGovernData = this._entityWorkflowGovernData[i];

                  let workflowActivityNames = this._getWorkflowActivityNames(workflowGovernData.attributes);
                  for (let j = 0; j < workflowActivityNames.length; j++) {
                      let tofixWorkflowData = {};
                      tofixWorkflowData["id"] = workflowGovernData.id;
                      tofixWorkflowData["label"] = this._getWorkflowNameById(workflowGovernData.id);
                      tofixWorkflowData["type"] = "Workflow";
                      tofixWorkflowData["workflowActivityName"] = workflowActivityNames[j];
                      tofixWorkflowData["businessConditions"] = [];
                      tofixWorkflowDataSet.push(tofixWorkflowData);
                  }
              }


              for (let i = 0; i < tofixWorkflowDataSet.length; i++) {
                  let tofixWorkflowData = tofixWorkflowDataSet[i];

                  //find business conditions mapped to current workflow - from model obejcts
                  let workflowMappedBusinessConditions = this._getWorkflowMappedBusinessConditions(tofixWorkflowData.id);

                  if (!_.isEmpty(workflowMappedBusinessConditions)) {
                      for (let j = 0; j < workflowMappedBusinessConditions.length; j++) {
                          let businessConditionAttrs = workflowMappedBusinessConditions[j].attributes;
                          if (businessConditionAttrs && AttributeHelper.getFirstAttributeValue(businessConditionAttrs.stepName) == tofixWorkflowData.workflowActivityName) {
                              workflowBusinessConditions.push(workflowMappedBusinessConditions[j].relTo.id);
                              let toFixBusinessCondition = this._entityBusinessConditionsGovernData.find(obj => obj.id == workflowMappedBusinessConditions[j].relTo.id);
                              if (toFixBusinessCondition && !DataHelper.containsObject(toFixBusinessCondition, tofixWorkflowData.businessConditions) && toFixBusinessCondition.isAllowedToShow) {
                                  tofixWorkflowData.businessConditions.push(toFixBusinessCondition);
                              }
                          }
                      }
                  }

                  //add current wf activity related info in main array
                  if (tofixWorkflowData.businessConditions.length > 0) {
                      _tofixData.push(tofixWorkflowData);
                  }
              }
          }

          // If the BC is not mapped to any of the workflow then it should become Global
          for (let x = 0; x < this._entityTypeBusinessConditions.length; x++) {
              let businessCondition = this._entityTypeBusinessConditions[x];
              if (workflowBusinessConditions.indexOf(businessCondition.relTo.id) == -1) {
                  let toFixBusinessCondition = this._entityBusinessConditionsGovernData.find(obj => obj.id == businessCondition.relTo.id);
                  if (toFixBusinessCondition && !DataHelper.containsObject(toFixBusinessCondition, tofixGlobalData.businessConditions) && toFixBusinessCondition.isAllowedToShow) {
                      tofixGlobalData.businessConditions.push(toFixBusinessCondition);
                  }
              }
          }

          if (tofixGlobalData.businessConditions.length > 0) {
              _tofixData.push(tofixGlobalData);
          }

          this.set("_tofixData", _tofixData);
          this._isToFixDataExists = true;
      }
  }

  _isDataSetPrepared() {
      if (this._isEntityGovernReponseReceived && this._isRuleContextMappingsReceived && this._isOriginalBCReceived) {
          if (this._isWorkflowDefinitionReq) {
              if (this._isWorkflowDefinitionReceived) {
                  return true;
              } else {
                  return false;
              }
          }
          return true;
      } else {
          return false;
      }
  }

  _getWorkflowNameById(workflowId) {
      for (let i = 0; i < this._workflowDefinitions.length; i++) {
          let workflowDefinition = this._workflowDefinitions[i];

          if (workflowDefinition.name === workflowId) {
              let workflowAttributes = workflowDefinition.attributes;
              return AttributeHelper.getFirstAttributeValue(workflowAttributes.workflowName);
          }
      }
  }

  _getWorkflowActivityNames(workflowAttributes) {
      let workflowActivityNames = [];

      if (typeof (workflowAttributes) !== "undefined" && typeof (workflowAttributes.activities) !== "undefined") {

          let workflowActivities = workflowAttributes.activities;
          if (typeof (workflowActivities) !== "undefined" && typeof (workflowActivities.group) !== "undefined") {

              let workflowActivityGroups = workflowActivities.group;
              for (let i = 0; i < workflowActivityGroups.length; i++) {
                  workflowActivityNames.push(AttributeHelper.getFirstAttributeValue(workflowActivityGroups[i].activityName));
              }
          }
      }

      return workflowActivityNames;
  }

  _getWorkflowMappedBusinessConditions(workflowName) {
      if (typeof (this._contextSpecificBusinessConditions) && this._contextSpecificBusinessConditions.length > 0) {
          for (let i = 0; i < this._contextSpecificBusinessConditions.length; i++) {
              if (this._contextSpecificBusinessConditions[i].workflowName === workflowName) {
                  return this._contextSpecificBusinessConditions[i].businessConditions;
              }
          }
      }
  }

  _showMessage(message) {
      this.shadowRoot.querySelector("#messagePanel").innerHTML = message;
      this._isToFixDataExists = true;
  }

  _getIconByType(type) {
      if (typeof (type) === "boolean") {
          if (type == false) {
              return 'pebble-icon:pending-line';
          } else {
              return 'pebble-icon:done-line';
          }
      } else {
          return 'pebble-icon:indeterminate-line';
      }
  }

  _isDividerNeeded(item, index) {
      if (index != 0 && this.data && this.data.tofixes && item.data.type != this.data.tofixes[index - 1].data.type) {
          return true;
      }

      return false;
  }

  _prepareWorkflowDataContext(clonedContextData, itemContext) {
      let workflowDataContexts = [];

      if (typeof (this._entityTypeWorkflowMappings) !== "undefined" && this._entityTypeWorkflowMappings.length > 0) {

          for (let i = 0; i < this._entityTypeWorkflowMappings.length; i++) {
              let workflowDataContext = {};
              workflowDataContext.self = "self";
              workflowDataContext.workflow = this._entityTypeWorkflowMappings[i];

              workflowDataContexts.push(workflowDataContext);
          }
      }

      return workflowDataContexts
  }

  _onTap(e) {
      if (this._getWritePermission() === false) {
          this.showWarningToast("You do not have permissions to perform this action.");
          return;
      }
      const { id, name } = e.currentTarget.data;

      const sharedData = {
          "business-condition-id": id
      };

      this.openBusinessFunctionDialog({
          name: 'rock-entity-fix-attribute-errors',
          title: `Fix- ${name}`,
          noDataMessage: "Cannot show things to fix here. Check the configuration."
      }, sharedData);
  }

  refresh() {
      this._isToFixDataExists = false;
      this._contextDataChanged();
  }

  _onBusinessConditionSaveResponse() {
      this.businessCondition.saved = true;
      if (this.businessCondition.longTimeToSave == true) {
          this.showSuccessToast("Business condiitons have been calculated, you can now refresh to see fresh statuses", 2000);
      }
  }

  _onBusinessConditionSaveRequest() {
      this._isToFixDataExists = false;
      this.businessCondition.saved = false;
      this.businessCondition.longTimeToSave = false;
      let count = 0;
      let timer = setInterval(function () {
          count++
          if (this.businessCondition && this.businessCondition.saved == true) {
              this._isToFixDataExists = true;
              this.refresh();
              clearInterval(timer);
          } else if (count >= 5) {
              this.showSuccessToast("It's taking longer than expected, we will let you know when done", 2000);
              this.businessCondition.longTimeToSave = true;
              this._isToFixDataExists = true;
              clearInterval(timer);
          }
      }.bind(this), 1000);
  }

  _getWritePermission() {
      let writePermission = true;
      let itemContext = this.getFirstItemContext();
      if (DataHelper.isValidObjectPath(itemContext, "permissionContext.writePermission")) {
          writePermission = itemContext.permissionContext.writePermission;
      }

      return writePermission;
  }
}
customElements.define(RockEntityTofix.is, RockEntityTofix);
