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
import '../bedrock-helpers/data-helper.js';
import '../bedrock-grid-datasource-behavior/bedrock-grid-datasource-behavior.js';
import '../bedrock-helpers/constant-helper.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-helpers/component-helper.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-helpers/entity-helper.js';
import '../bedrock-helpers/message-helper.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../liquid-entity-data-get/liquid-entity-data-get.js';
import '../liquid-rest/liquid-rest.js';
import '../liquid-dataobject-utils/liquid-dataobject-utils.js';
import '../liquid-entity-model-get/liquid-entity-model-get.js';
import '../liquid-entity-govern-data-get/liquid-entity-govern-data-get.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class EntityGovernGridDatasource
    extends mixinBehaviors([
    RUFBehaviors.GridDataSourceBehavior,
    RUFBehaviors.UIBehavior,
    RUFBehaviors.ComponentContextBehavior
], OptionalMutableData(PolymerElement)) {
  static get template() {
    return html`
        <!--clone the request and change fields-->
         <liquid-entity-data-get id="initiateSearchResult" operation="initiatesearch" request-data="[[request]]" last-response="{{_initSearchResponse}}" on-error="_onSearchError" exclude-in-progress=""></liquid-entity-data-get>

        <liquid-entity-data-get id="getSearchResultDetail" operation="getsearchresultdetail" request-data="[[request]]" request-id="[[_initSearchResponse.content.requestId]]" last-response="{{searchResultResponse}}" exclude-in-progress=""></liquid-entity-data-get>

        <liquid-entity-model-get id="getWorkflowMappingDefinition" operation="getbyids" request-id="req1" request-data="{{_workflowMappingDefinitionRequest}}" on-response="_onWfMappingsReceived" on-error="_onMappingsGetFailed"></liquid-entity-model-get>

        <liquid-entity-model-get id="entityGetWorkflowDefinition" operation="getbyids" request-id="req1" request-data="{{_workflowDefinitionRequest}}" on-response="_onDefinitionReceived" on-error="_onDefinitionGetFailed"></liquid-entity-model-get>

        <liquid-entity-govern-data-get id="entityGetRunningInstance" operation="getbyids" request-id="req2" request-data="{{_runningInstanceRequest}}" on-response="_onRunningInstanceReceived" on-error="_onRunningInstanceGetFailed" no-cache=""></liquid-entity-govern-data-get>
        
        <liquid-rest id="entityWfEventsGet" url="/data/pass-through/eventservice/get" method="POST" request-data="{{_eventsGetRequest}}" on-liquid-response="_onEventsGetResponse" on-liquid-error="_onEventsGetFailure"></liquid-rest>

        <liquid-entity-model-get exclude-in-progress="" id="ruleContextMappingsGet" operation="getbyids" request-data="{{_ruleContextMappingsGetRequest}}" request-id="ruleContextMappingsGet" on-response="_onRuleContextMappingsGetResponse" on-error="_onRuleContextMappingsGetError"></liquid-entity-model-get>

        <liquid-entity-model-get exclude-in-progress="" id="businessConditionsGet" operation="getbyids" request-data="{{_businessConditionsGetRequest}}" request-id="businessConditionsGet" on-response="_onBusinessConditionsGetResponse" on-error="_onBusinessConditionsGetError"></liquid-entity-model-get>
`;
  }

  static get is() { return 'entity-govern-grid-datasource' }
  static get properties() {
      return {
          attributeModels: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          _liquidInitSearchElement: {
              type: Object,
              value: function () {
                  return {}
              }
          },

          _liquidGetSearchElement: {
              type: Object,
              value: function () {
                  return {}
              }
          },

          _isRequestInitiated: {
              type: Boolean,
              value: false
          },

          _options: {
              type: Object,
              value: function () {
                  return {}
              }
          },
          _totalCount: {
              type: Number,
              notify: true,
              value: 0
          },
          request: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          entities: {
              type: Array,
              value: function () { return []; }
          },
          entityIds: {
              type: Array,
              value: function () { return []; }
          },
          entityTypes: {
              type: Array,
              value: function () { return []; }
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
          _workflowMappingDefinitionRequest: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          /*
          * Indicates the request to get the workflow definition based on the `workflowId`.
          */
          _workflowDefinitionRequest: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          /*
          * Indicates the request object to get the information for the currently running workflow instances.
          */
          _runningInstanceRequest: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _mappedWorkflowNames: {
              type: Array,
              value: function () { return []; }
          },
          _workflowDefinitions: {
              type: Object,
              value: function () { return {}; }
          },
          _ruleContextMappingsGetRequest: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _businessConditionsGetRequest: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _entitiesGovernData: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          headerData: {
              type: Array,
              notify: true,
              value: function () {
                  return [];
              }
          },
          _entitiesData: {
              type: Array,
              value: function () { return []; }
          },
          _eventsGetRequest: {
              type: Object,
              value: function () { return {}; }
          },
          _entityWfPastEvents: {
              type: Array,
              value: function () { return []; }
          },
          _successCallBack: {
              type: Function
          },
          businessConditionsForEntityTypes: {
              type: Object,
              value: function () { return {}; },
              notify: true
          },
          entityNameAttribute: {
              type: String
          },
          rDataSource: {
              type: Object,
              notify: true
          }
      }
  }
  static get observers() {
      return [
      '_entitiesChanged(entities)',
  '_entityIdsChanged(entityIds)'
      ]
  }


  /**
    * <b><i>Content development is under progress... </b></i> 
    */

  /**
    * <b><i>Content development is under progress... </b></i> 
    */
  ready () {
      super.ready();
      this._liquidInitSearchElement = dom(this).node.shadowRoot.querySelector(
          "liquid-entity-data-get[id='initiateSearchResult']");
      this._liquidGetSearchElement = dom(this).node.shadowRoot.querySelector(
          "liquid-entity-data-get[id='getSearchResultDetail']");

      this.rDataSource = this._dataSource.bind(this);
  }
  /**
    * <b><i>Content development is under progress... </b></i> 
    */
  resetDataSource () {
      this._isRequestInitiated = false;
      this._definitionsAvailable = false;
      this._resetDataSource();
  }

  _dataSource (options, success, error) {
      // Bind Reponse Methods
      DataHelper.oneTimeEvent(this._liquidInitSearchElement, 'response', this._onInitSearchResponse.bind(
          this));

      DataHelper.oneTimeEvent(this._liquidGetSearchElement, 'response', this._onGetSearchResponse.bind(
          this, success, error));

      // Set Options
      this._options = options;

      // Set Range
      let requestOptions = this._prepareRequestOptions(this._options);

      this.request.params.fields.attributes = [this.entityNameAttribute];
      this.entityTypes = this.request.params.query.filters.typesCriterion;
      if (this._options.sortOrder && this._options.sortOrder.length && this.attributeModels) {
          //TODO:: Currently only single column sorting is supported so always need to take care about last sort order object.
          let sortOrder = this._options.sortOrder[this._options.sortOrder.length - 1];

          let attributes = [];
          let attributeModel = this.attributeModels[sortOrder.path];
          let property = {};

          let direction = "_ASC";
          if (sortOrder.direction && attributeModel) {

              if (sortOrder.direction == "asc") {
                  direction = "_ASC";
              } else if (sortOrder.direction == "desc") {
                  direction = "_DESC";
              }

              property[sortOrder.path] = direction;
              property["sortType"] = ConstantHelper.getDataTypeConstant(attributeModel.dataType);
              attributes.push(property);
              this.request.params["sort"] = { "attributes": attributes };
          }
      } else {
          this.request.params["sort"] = {
              "properties": [
                  {
                      "modifiedDate": "_DESC",
                      "sortType": "_DATETIME"
                  }
              ]
          };
      }

      this.set("request.params.options", requestOptions);

      // Initiate Request only for First Time.
      if (!this._isRequestInitiated) {
          this._liquidInitSearchElement.generateRequest();
      } else {
          this._liquidGetSearchElement.generateRequest();
      }
  }


  _onInitSearchResponse (e) {
      this._totalCount = e.detail.response.content.totalRecords;
      this._resultRecordSize = e.detail.response.content.resultRecordSize;
      this._liquidGetSearchElement.generateRequest();
      this._isRequestInitiated = true;
  }

  _onGetSearchResponse (success, error) {
      if (this._lastPage < this._options.page) {
          if (this.searchResultResponse.status == "success") {

              this._successCallBack = success;
              if(this.searchResultResponse.content && this.searchResultResponse.content.entities && this.searchResultResponse.content.entities.length > 0) {
                  this.set("entities", this.searchResultResponse.content.entities);
              } else {
                  this._entitiesGovernData = [];
                  this._getSearchResults();
              }
          } else {
              error();
          }
      }
  }

  _onSearchError (e) {
      let reason = e.detail.response.reason;
      this.logWarning("InitiateSearchError","response",JSON.stringify(reason));
      this._showMessage("Failed to Initiate the search. Contact administrator.");
  }
  _entitiesChanged (entities) {
      if (!_.isEmpty(entities)) {
          let entityIds = [];
          let entitiesData = [];
          entities.forEach(function (entity) {
              let entityData = {
                  "id": entity.id,
                  "type": entity.type
              };
              if(entity.data && entity.data.attributes) {
                  let entityName = AttributeHelper.getFirstAttributeValue(entity.data.attributes.producttitle);
                  entityName = entityName ? entityName : "";
                  entityData["name"] = entityName;
              }
              entitiesData.push(entityData);
              entityIds.push(entity.id);
          }, this);
          this.set("_entitiesData", entitiesData);
          this.set("entityIds", entityIds);
      }
  }
  _entityIdsChanged (entityIds) {
      if (!_.isEmpty(entityIds)) {
          if(this._definitionsAvailable) {
              this._requestForWorkflowPastEvents();
          } else {
              let clonedContextData = DataHelper.cloneObject(this.contextData);
              let firstItemContext = ContextHelper.getFirstItemContext(clonedContextData);
              firstItemContext.type = this.entityTypes;
              this._workflowMappingDefinitionRequest = DataRequestHelper.createWorkflowMappingGetRequest(clonedContextData);
              this.shadowRoot.querySelector('#getWorkflowMappingDefinition').generateRequest();
          }
      }
  }
  _onWfMappingsReceived(e) {
      let response = e.detail.response;
      if(response) {
          let mappingModels = response.content && response.content.entityModels ? response.content.entityModels: undefined;
          if(mappingModels && mappingModels.length > 0) {
              let mappedWorkflowNames = [];
              let mappedWorkflowNamesForEntityType = {};
              for(let i=0; i<mappingModels.length; i++) {
                  let wfDefinitionMappingModel = mappingModels[i];
                  if(!(this.entityTypes.indexOf(wfDefinitionMappingModel.name) == -1)) {
                      let wfRelationships = DataMergeHelper.mergeWorkflowMappings(wfDefinitionMappingModel, this.contextData);
                      let mappedWfNames = DataHelper.getRelToNames(wfRelationships.hasWorkflowsDefined);
                      mappedWorkflowNamesForEntityType[wfDefinitionMappingModel.name] = {
                          "mappedWorkflowNames": [mappedWfNames[0]]
                      }
                      mappedWorkflowNames.push(mappedWfNames[0]);
                  }
              }
              this.set("_mappedWorkflowNamesForEntityType", mappedWorkflowNamesForEntityType);
              this.set("_mappedWorkflowNames", mappedWorkflowNames);
              let itemContext = this.getFirstItemContext();
              itemContext.workflowNames = this._mappedWorkflowNames;
              if(!_.isEmpty(this._mappedWorkflowNames)) {
                  this._workflowDefinitionRequest = DataRequestHelper.createWorkflowDefinitionGetRequest(this.contextData);
                  this.shadowRoot.querySelector("#entityGetWorkflowDefinition").generateRequest();
              }                            
          } else {
              this._requestForRuleContextMappings();
          }
      }
  }
  _onMappingsGetFailed(e) {
      this.logWarning("WorkFlowMappingError","response",JSON.stringify(e.detail));
      this._showMessage("Failed to get workflow mappings. Contact administrator.");
  }
  _onDefinitionReceived(e) {
      let workflowDefinitionResponse = e.detail.response;
      let workflowDefinitons = {};
      if (workflowDefinitionResponse && workflowDefinitionResponse.content && workflowDefinitionResponse.content.entityModels && workflowDefinitionResponse.content.entityModels.length > 0) {
          for (let i = 0; i < workflowDefinitionResponse.content.entityModels.length; i++) {
              let entityModel = workflowDefinitionResponse.content.entityModels[i];
              let workflowName = entityModel.name;
              if (entityModel.data && entityModel.data.attributes) {
                  workflowDefinitons[workflowName] = entityModel.data.attributes;
              }
          }
      }
      this._definitionsAvailable = true;
      this.set("_workflowDefinitions", workflowDefinitons);
      this._requestForRuleContextMappings();
  }
  _onDefinitionGetFailed(e) {
      this.logWarning("WorkflowDefinitionGetError", "response", JSON.stringify(e.detail));
      this._showMessage("Failed to get the workflow definitions. Contact administrator.");
  }
  _requestForRuleContextMappings () {
      let clonedContextData = DataHelper.cloneObject(this.contextData);

      // Prepare ItemContext
      let itemContext = ContextHelper.getFirstItemContext(clonedContextData);
      let requestedType = "ruleContextMappings";
      let requestedIds = [];
      let requestObjects = [];
      for(let i=0; i<this.entityTypes.length; i++) {
          let entityType = this.entityTypes[i];
          let requestedId = entityType + "_" + requestedType;
          requestedIds.push(requestedId);
          let reqObj = {
              "id": requestedId,
              "entityType": entityType
          };
          requestObjects.push(reqObj);
      }
      itemContext.id = requestedIds;
      itemContext.type = requestedType;
      itemContext.requestObjects = requestObjects;
      itemContext.relationships = ["hasBusinessConditions"];
      clonedContextData[ContextHelper.CONTEXT_TYPE_ITEM] = [itemContext];
      let valueContext = ContextHelper.getFirstValueContext(clonedContextData);
      valueContext = [];
      clonedContextData[ContextHelper.CONTEXT_TYPE_VALUE] = valueContext;

      let dataContexts = this._prepareWorkflowDataContext(clonedContextData, itemContext);
      if (dataContexts.length > 0) {
          clonedContextData[ContextHelper.CONTEXT_TYPE_DATA] = dataContexts;
      }
      this._clonedContextData = clonedContextData;
      // Create Request and Get
      let ruleContextMappingsGet = this.shadowRoot.querySelector("#ruleContextMappingsGet");
      if (ruleContextMappingsGet) {
          this._ruleContextMappingsGetRequest = DataRequestHelper.createEntityGetRequest(clonedContextData);
          ruleContextMappingsGet.generateRequest();
      }
  }
  _onRuleContextMappingsGetResponse (e) {
      let responseContent = DataHelper.validateAndGetResponseContent(e.detail.response);
      this._allBusinessConditionIds = [];
      let businessConditionsForEntityTypes = {};
      let itemContext = ContextHelper.getFirstItemContext(this._clonedContextData);
      let relationshipType = itemContext.relationships[0];
      let requestObjects = itemContext.requestObjects;
      if (responseContent && responseContent.entityModels && responseContent.entityModels.length > 0) {
          for(let i=0; i<responseContent.entityModels.length; i++) {
              let mergedBusinessConditions = {};
              let mappingModel = responseContent.entityModels[i];
              let entityType = requestObjects.find( obj => obj.id == mappingModel.id).entityType;
              if (mappingModel.data && mappingModel.data.relationships) {
                  mergedBusinessConditions = DataMergeHelper.mergeRelationships(mergedBusinessConditions, mappingModel.data.relationships, true);
              }
              if(mappingModel.data && mappingModel.data.contexts && mappingModel.data.contexts.length > 0) {
                  let firstDataContext = mappingModel.data.contexts[0].context;
                  if (firstDataContext) {
                      let ctxRelationships = SharedUtils.DataObjectFalcorUtil.getRelationshipsByCtx(mappingModel, firstDataContext);
                      if (!_.isEmpty(ctxRelationships)) {
                          mergedBusinessConditions = DataMergeHelper.mergeRelationships(mergedBusinessConditions, ctxRelationships, true);
                      }
                  }
              }
              let businessConditions = mergedBusinessConditions[relationshipType];
              let businessConditionIds = this._getBusinessConditionIds(businessConditions);
              businessConditionsForEntityTypes[entityType] = {
                  "businessConditions": businessConditionIds
              };
              if(!_.isEmpty(businessConditionIds)) {
                  this._allBusinessConditionIds = this._allBusinessConditionIds.concat(businessConditionIds);
              }
          }
          this.set("businessConditionsForEntityTypes", businessConditionsForEntityTypes);                    
          this._requestForBusinessConditions(this._allBusinessConditionIds);
      } else {
          this._requestForWorkflowPastEvents();
      }
  }
  _getBusinessConditionIds(businessConditions) {
      let businessConditionIds = [];
      if(!_.isEmpty(businessConditions)) {
          businessConditions.forEach(function(businessCondition) {
              if(businessCondition.relTo && businessCondition.relTo.id) {
                  businessConditionIds.push(businessCondition.relTo.id);
              }
          }, this);
      }
      return businessConditionIds;
  }
  _onRuleContextMappingsGetError (e) {
      RUFUtilities.Logger.error("RuleContextMappingsGetError:- " + e.detail.response.reason.message, null, "entity-manage");
      this._showMessage("Failed to get the mapped rules for the context. Contact administrator.");
  }
  _requestForBusinessConditions (businessConditionIds) {
      let clonedContextData = DataHelper.cloneObject(this.contextData);

      let itemContext = ContextHelper.getFirstItemContext(clonedContextData);
      itemContext.id = businessConditionIds;
      itemContext.type = "businessCondition";
      itemContext.attributeNames = ["impactRoles"];
      clonedContextData[ContextHelper.CONTEXT_TYPE_ITEM] = [itemContext];
      let valueContext = ContextHelper.getFirstValueContext(clonedContextData);
      valueContext = [];
      clonedContextData[ContextHelper.CONTEXT_TYPE_VALUE] = valueContext;

      let businessConditionsGet = this.shadowRoot.querySelector("#businessConditionsGet");
      if (businessConditionsGet) {
          this._businessConditionsGetRequest = DataRequestHelper.createEntityGetRequest(clonedContextData);
          businessConditionsGet.generateRequest();
      }
  }
  _onBusinessConditionsGetResponse (e) {
      let responseContent = DataHelper.validateAndGetResponseContent(e.detail.response);
      if (responseContent) {
          let businessConditions = responseContent.entityModels;
          let businessConditionsForGrid = [];
          if (typeof (businessConditions) !== "undefined" && businessConditions.length > 0) {
              for (let i = 0; i < businessConditions.length; i++) {
                  if(this._isBusinessConditionAllowedForRole(businessConditions[i])) {
                      let businessConditionForGrid = {
                          "id": businessConditions[i].id,
                          "name": businessConditions[i].name
                      };
                      businessConditionsForGrid.push(businessConditionForGrid);
                  }
              }
          }
          this._formatAndSetBizcons(businessConditionsForGrid);
      }
      this._requestForWorkflowPastEvents();
  }
  _onBusinessConditionsGetError(e) {
      this.logWarning("BusinessConditionGetError","response",JSON.stringify(e.detail));
      this._showMessage("Failed to get Business condtions. Contact administrator.");
  }
  _requestForWorkflowPastEvents () {
      let clonedContextData = DataHelper.cloneObject(this.contextData);
      let firstItemContext = ContextHelper.getFirstItemContext(clonedContextData);
      firstItemContext.id = this.entityIds;
      let requestObjects = [];
      for(let i=0; i<this.entityIds.length; i++) {
          let entityId = this.entityIds[i];
          let entityType = this._entitiesData.find(obj => obj.id == entityId).type;
          let reqObj = {
              "id": entityId,
              "entityType": entityType
          };
          requestObjects.push(reqObj);
      }
      firstItemContext.requestObjects = requestObjects;
      firstItemContext.workflowNames = [];
      this._eventsGetRequest = DataRequestHelper.createWorkflowEventsGetRequest(clonedContextData);
      let workflowContexts = this._prepareWorkflowDataContext(clonedContextData, firstItemContext);
      this._eventsGetRequest.params.query.contexts = workflowContexts;
      this.shadowRoot.querySelector("#entityWfEventsGet").generateRequest();
  }
  _onEventsGetResponse (e) {
      let workflowEventsResponse = e.detail.response;
      let workflowPastEvents = [];
      if (workflowEventsResponse && workflowEventsResponse.response && workflowEventsResponse.response.events && workflowEventsResponse.response.events.length > 0) {
          for (let i = 0; i < workflowEventsResponse.response.events.length; i++) {
              let wfEvent = workflowEventsResponse.response.events[i];
              if (wfEvent && wfEvent.data && wfEvent.data.contexts && wfEvent.data.contexts.length > 0) {
                  let eventCtx = wfEvent.data.contexts[0].context;
                  let activities = wfEvent.data.contexts[0].attributes && wfEvent.data.contexts[0].attributes.activities && wfEvent.data.contexts[0].attributes.activities.group && wfEvent.data.contexts[0].attributes.activities.group.length > 0 ? wfEvent.data.contexts[0].attributes.activities.group : [];
                  let workflow = eventCtx.workflow;
                  let entityId = eventCtx.self.substring(eventCtx.self.indexOf("/") + 1, eventCtx.self.length);
                  let pastEventData = {
                      "id": entityId
                  };
                  pastEventData[workflow] = {
                      "activities": activities
                  }

                  let existingEntity = workflowPastEvents.find(obj => obj.id == entityId);
                  if (existingEntity) {
                      if (existingEntity[workflow]) {
                          if (existingEntity[workflow]["activities"]) {
                              existingEntity[workflow]["activities"] = existingEntity[workflow]["activities"].concat(activities);
                          } else {
                              existingEntity[workflow]["activities"] = activities;
                          }
                      } else {
                          existingEntity[workflow] = {
                              "activities": activities
                          };
                      }
                  } else {
                      workflowPastEvents.push(pastEventData);
                  }
              }
          }
      }
      this.set("_entityWfPastEvents", workflowPastEvents);
      this._requestForGovernData();
  }
  _onEventsGetFailure(e) {
      this.logWarning("WorkFlowHistoryError","response",JSON.stringify(e.detail));
      this._showMessage("Failed to get workflow history of entities. Contact administrator.");
  }
  _requestForGovernData () {
      let clonedContextData = DataHelper.cloneObject(this.contextData);
      let firstItemContext = ContextHelper.getFirstItemContext(clonedContextData);
      firstItemContext.id = this.entityIds;
      firstItemContext.type = this.entityTypes;
      let requestObjects = [];
      for(let i=0; i<this.entityIds.length; i++) {
          let entityId = this.entityIds[i];
          let entityType = this._entitiesData.find(obj => obj.id == entityId).type;
          let reqObj = {
              "id": entityId,
              "entityType": entityType
          };
          requestObjects.push(reqObj);
      }
      firstItemContext.requestObjects = requestObjects;
      firstItemContext.attributeNames = ["businessConditions", "workflowInstanceId", "status", "startDateTime", "endDateTime", "activities"];
      firstItemContext.relationships = [];
      firstItemContext.relationshipAttributes = [];
      clonedContextData[ContextHelper.CONTEXT_TYPE_ITEM] = [firstItemContext];
      let valueContext = ContextHelper.getFirstValueContext(clonedContextData);
      valueContext = [];
      clonedContextData[ContextHelper.CONTEXT_TYPE_VALUE] = valueContext;
      let dataContexts = this._prepareWorkflowDataContext(clonedContextData, firstItemContext);
      if (dataContexts.length > 0) {
          clonedContextData[ContextHelper.CONTEXT_TYPE_DATA] = dataContexts;
      }
      this._runningInstanceRequest = DataRequestHelper.createEntityGetRequest(clonedContextData);
      this.shadowRoot.querySelector('#entityGetRunningInstance').generateRequest();
  }
  _onRunningInstanceReceived (e) {
      if (e.detail.response) {
          let runtimeInstanceEntities = e.detail.response && e.detail.response.content && e.detail.response.content.entities
              ? e.detail.response.content.entities : [];
          if (runtimeInstanceEntities.length > 0) {
              let entitiesGovernData = [];
              runtimeInstanceEntities.forEach(function (entity) {
                  let entityGovernData = {};
                  let contexts = entity.data && entity.data.contexts ? entity.data.contexts : [];
                  if (contexts.length > 0) {
                      let currContextItem = contexts[0];
                      let currContext = currContextItem.context;
                      let currWorkflowName = currContext.workflow;
                      let contextAttrs = currContextItem.attributes;
                      let currActivity = undefined;
                      let assignedUser = "";
                      if (contextAttrs) {
                          currActivity = contextAttrs.activities && contextAttrs.activities.group && contextAttrs.activities.group[0] && contextAttrs.activities.group[0].activityName ? contextAttrs.activities.group[0].activityName : undefined;
                          if (currActivity) {
                              currActivity = AttributeHelper.getFirstAttributeValue(currActivity);
                          }
                          let assignedUserAttr = contextAttrs.activities && contextAttrs.activities.group && contextAttrs.activities.group[0] && contextAttrs.activities.group[0].assignedUser ? contextAttrs.activities.group[0].assignedUser : undefined;
                          if(assignedUserAttr) {
                              assignedUser = AttributeHelper.getFirstAttributeValue(assignedUserAttr);
                          }
                      }
                      entityGovernData = this._getWorkflowDetails(entity.id, currWorkflowName, currActivity);
                      entityGovernData["assignedUser"] = assignedUser;
                  }
                  let businessConditions = entity.data && entity.data.attributes && entity.data.attributes.businessConditions && entity.data.attributes.businessConditions.group ? entity.data.attributes.businessConditions.group : [];
                  if (businessConditions.length > 0) {
                      entityGovernData["businessConditions"] = this._getEntityBusinessConditions(businessConditions);
                  }
                  let entityName = "";
                  let entityData = this._entitiesData.find(obj => obj.id == entity.id);
                  if(entityData) {
                      entityName = entityData.name;
                  }
                  entityGovernData["id"] = entity.id;
                  entityGovernData["type"] = entity.type;
                  entityGovernData["name"] = entityName;
                  entitiesGovernData.push(entityGovernData);
              }, this);

              if(entitiesGovernData.length != this.entityIds.length) {
                  for(let i=0; i<this._entitiesData.length; i++) {
                      let entity = this._entitiesData[i];
                      let existingGovernData = entitiesGovernData.find(obj => obj.id == entity.id);
                      if(!existingGovernData) {
                          entitiesGovernData.push(entity);
                      }
                  }
              }
              this.set("_entitiesGovernData", entitiesGovernData);
              this._getSearchResults();
          }
      }
  }
  _onRunningInstanceGetFailed (e) {
      this.logWarning("WorkFlowStatusError", "response", JSON.stringify(e.detail));
      this._showMessage("Failed to get governance data. Contact administrator.");
  }
  _getWorkflowDetails (entityId, workflowName, activityName) {
      if (workflowName && !_.isEmpty(this._workflowDefinitions) && this._workflowDefinitions[workflowName]) {
          let workflowDefinition = this._workflowDefinitions[workflowName];
          let workflowNameAttribute = workflowDefinition.workflowName;
          let workflowDetails = {};
          let workflowLongName = "";
          let activityLongName = "";
          let allowedRoles = [];
          let actions = [];
          if (workflowNameAttribute) {
              workflowLongName = AttributeHelper.getFirstAttributeValue(workflowNameAttribute);
          }
          let wfActivities = workflowDefinition.activities;
          if (wfActivities && wfActivities.group && wfActivities.group.length > 0) {
              let activity = wfActivities.group.find(function (element) {
                  let activityShortName = AttributeHelper.getFirstAttributeValue(element.activityName);
                  if (activityShortName == activityName) {
                      return element;
                  }
              });
              if (activity) {
                  activityLongName = AttributeHelper.getFirstAttributeValue(activity.externalName);
                  if (activity.allowedRoles && activity.allowedRoles.values) {
                      allowedRoles = AttributeHelper.getAttributeValues(activity.allowedRoles.values);
                  }
                  if (activity.actions && activity.actions.group && activity.actions.group.length > 0) {
                      activity.actions.group.forEach(function (element) {
                          let actionObject = {};
                          actionObject["actionName"] = AttributeHelper.getFirstAttributeValue(element.actionName);
                          actionObject["actionText"] = AttributeHelper.getFirstAttributeValue(element.actionText);
                          actions.push(actionObject);
                      }, this);
                  }
              } else {
                  workflowLongName = "";
              }
          }
          workflowDetails["workflowLongName"] = workflowLongName;
          workflowDetails["activityLongName"] = activityLongName;
          workflowDetails["workflowName"] = workflowName;
          workflowDetails["activityName"] = activityName;
          workflowDetails["allowedRoles"] = allowedRoles;
          workflowDetails["actions"] = actions;
          workflowDetails["previousStepComments"] = this._getWfPreviousStepComments(entityId, workflowName, activityName, workflowDefinition);
          return workflowDetails;
      }
  }
  _getWfPreviousStepComments (entityId, workflowName, activityName, workflowDefinition) {
      let previousStepComments = "";
      if (!_.isEmpty(this._entityWfPastEvents)) {
          let entityEvents = this._entityWfPastEvents.find(obj => obj.id == entityId);
          if (!_.isEmpty(entityEvents) && entityEvents[workflowName] && entityEvents[workflowName].activities && entityEvents[workflowName].activities.length > 0) {
              let activities = entityEvents[workflowName].activities;
              let previousActivityName = this._getWfPreviousActivity(activityName, workflowDefinition);
              if (previousActivityName) {
                  let pastActivity = activities.find(obj => AttributeHelper.getFirstAttributeValue(obj.activityName) == previousActivityName && AttributeHelper.getFirstAttributeValue(obj.status) == "Closed");
                  if (pastActivity && pastActivity.comments) {
                      previousStepComments = AttributeHelper.getFirstAttributeValue(pastActivity.comments);
                  }
              }
          }
      }
      return previousStepComments;
  }
  _getWfPreviousActivity (activityName, workflowDefinition) {
      let wfActivities = workflowDefinition.activities;
      let previousActivityName = undefined;
      if (wfActivities && wfActivities.group && wfActivities.group.length > 0) {
          let currActivity = wfActivities.group.find(obj => AttributeHelper.getFirstAttributeValue(obj.activityName) == activityName);
          if (currActivity) {
              let activityIndex = wfActivities.group.indexOf(currActivity);
              if (activityIndex && activityIndex > 0) {
                  let previousActivity = wfActivities.group[activityIndex - 1];
                  previousActivityName = AttributeHelper.getFirstAttributeValue(previousActivity.activityName);
              }
          }
      }
      return previousActivityName;
  }
  _getEntityBusinessConditions (businessConditions) {
      let entityBusinessConditions = [];
      for (let i = 0; i < businessConditions.length; i++) {
          let entityBusinessCondition = {};
          let businessConditionName = AttributeHelper.getFirstAttributeValue(businessConditions[i].businessConditionName);
          entityBusinessCondition["id"] = businessConditionName;
          entityBusinessCondition["status"] = AttributeHelper.getFirstAttributeValue(businessConditions[i].businessConditionStatus);
          entityBusinessConditions.push(entityBusinessCondition);
      }
      return entityBusinessConditions;
  }
  _prepareWorkflowDataContext (clonedContextData, itemContext) {
      let workflowDataContexts = [];
      let entityId = itemContext.id;
      let requestObjects = itemContext.requestObjects;
      if (entityId instanceof Array) {
          for (let i = 0; i < entityId.length; i++) {
              let id = entityId[i];
              let entityType = requestObjects.find( obj => obj.id == id).entityType;
              let mappedWorkflowNames = this._mappedWorkflowNamesForEntityType && this._mappedWorkflowNamesForEntityType[entityType] && this._mappedWorkflowNamesForEntityType[entityType].mappedWorkflowNames ? this._mappedWorkflowNamesForEntityType[entityType].mappedWorkflowNames : [];
              if(!_.isEmpty(mappedWorkflowNames)) {
                  for(let j=0; j<mappedWorkflowNames.length; j++) {
                      let workflowDataContext = {};
                      workflowDataContext.self = "self/" + id;
                      workflowDataContext.workflow = mappedWorkflowNames[j];
                      workflowDataContexts.push(workflowDataContext);
                  }
              } 
          }
      }
      return workflowDataContexts
  }
  _isBusinessConditionAllowedForRole (businessCondition) {
      let allowedRoles;
      if (DataHelper.isValidObjectPath(businessCondition, "data.attributes")) {
          allowedRoles = businessCondition.data.attributes.impactRoles;
      }

      let userContext = this.contextData.UserContexts[0];
      
      let currentUserRoles = userContext.roles;
      if (allowedRoles && currentUserRoles) {
          let isRoleAllowed = allowedRoles.some(allowedRole => currentUserRoles.indexOf(allowedRole) > -1);
          if(isRoleAllowed) {
              return true;
          }
          return false;
      }
      return true;
  }
  _formatAndSetBizcons(businessConditions) {
      if(!_.isEmpty(businessConditions)) {
          // Sorting business conditions alphabetically by business condition long/external name
          businessConditions.sort(function (a, b) {
              let nameA = a.name.toUpperCase();
              let nameB = b.name.toUpperCase();
              if (nameA < nameB) {
                  return -1;
              }
              if (nameA > nameB) {
                  return 1;
              }
              return 0;
          });
          this.set("headerData", businessConditions);
      }
  }
  _getSearchResults() {
      let data = {
          "entitiesGovernData": this._entitiesGovernData,
          "businessConditionsForEntityTypes": this.businessConditionsForEntityTypes
      };
      // Format ResponseData
      let searchResults = this._formatResponse(data);
      if (typeof (searchResults) == 'undefined') {
          searchResults = [];
      }

      // UpdateCurrent RecordSize
      this._updateCurrentRecordSize(this._options, searchResults, this._totalCount, this._resultRecordSize);

      // Invoke Callback
      this._successCallBack(searchResults);
  }
  _showMessage (message) {
      this.logError(message);
  }
}
customElements.define(EntityGovernGridDatasource.is, EntityGovernGridDatasource);
