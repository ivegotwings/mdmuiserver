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
import '../../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../../bedrock-helpers/data-helper.js';
import '../../bedrock-helpers/context-helper.js';
import '../../bedrock-helpers/data-request-helper.js';
import '../../liquid-entity-model-get/liquid-entity-model-get.js';
import '../../pebble-list-view/pebble-list-view.js';
import '../../pebble-list-item/pebble-list-item.js';
import './my-todo-summary.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class MyTodoSummaryList
        extends mixinBehaviors([
        RUFBehaviors.UIBehavior,
        RUFBehaviors.ComponentContextBehavior
        ], OptionalMutableData(PolymerElement)) {
  static get template() {
    return html`
        <style include="bedrock-style-common">
            .list-group {
                /*height: 490px;*/
                overflow-y: auto;
                /*padding: 0px 5px 0 0;*/
            }
            
            pebble-list-item:last-child .list-item {
                margin-bottom: 0!important;
            }
        </style>

        <liquid-entity-model-get id="workflowDefinitionsGet" operation="getbyids" request-id="[[initWorkflowDefinitionsGet.content.requestId]]" on-response="_onWorkflowDefinitionsGetResponse" on-error="_onWorkflowDefinitionsGetError"></liquid-entity-model-get>
        
        <liquid-entity-model-get exclude-in-progress="" id="initBusinessConditionsGet" operation="initiatesearch" request-data="[[_businessConditionRequest]]" last-response="{{initBusinessConditionsGet}}" on-response="_onInitBusinessConditionsGetResponse" on-error="_onInitBusinessConditionsGetError"></liquid-entity-model-get>
        <liquid-entity-model-get exclude-in-progress="" id="businessConditionsGet" operation="getsearchresultdetail" request-data="[[_businessConditionRequest]]" request-id="[[initBusinessConditionsGet.content.requestId]]" on-response="_onBusinessConditionsGetResponse" on-error="_onBusinessConditionsGetError"></liquid-entity-model-get>

        <pebble-list-view class="list-group column">           
            <template is="dom-if" if="[[_isDataAvailable(_isBusinessConditionsAvailable,_isWorkflowDefinitionAvailable)]]">
                <template is="dom-repeat" items="[[_getLists()]]">
                    <pebble-list-item slot="pebble-list-item">
                        <my-todo-summary my-todo="[[item]]" business-conditions="[[businessConditions]]" context-data="[[contextData]]"></my-todo-summary>
                    </pebble-list-item>
                </template>
            </template>
            <template is="dom-if" if="[[!_isDataAvailable(_isBusinessConditionsAvailable,_isWorkflowDefinitionAvailable)]]">
                <div class="default-message">You don't have any business conditions available</div>
            </template>
        </pebble-list-view>
`;
  }

  static get is() {
      return 'my-todo-summary-list';
  }
  static get observers() {
      return [
      '_initSummaryList(contextData, assignedTo)'
      ]
  }
  static get properties() {
      return {
          contextData: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          /**
            * <b><i>Content development is under progress... </b></i> 
            */
          configContext: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          /**
           * This property represents the list of my-todos
           */
          lists: {
              type: Array,
              value: function () {
                  return [];
              },
              notify: true,
          },
          /**
            * <b><i>Content development is under progress... </b></i> 
            */
          assignedTo: {
              type: String,
              value: ''
          },

          _isWorkflowDefinitionAvailable: {
              type: Boolean,
              value: false
          },

          _activitiesCount: {
              type: Number,
              value: 0
          },

          _businessConditionRequest: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          businessConditions: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          _isBusinessConditionsAvailable: {
              type: Boolean,
              value: false
          }
      }
  }

  _isDataAvailable () {
      if(this._isBusinessConditionsAvailable && this._isWorkflowDefinitionAvailable){
          return true;
      }
  }

  _initSummaryList (contextData, assignedTo) {
      if (!_.isEmpty(this.contextData) && !_.isEmpty(this.assignedTo)) {
          this._getBusinessCondition();
          let workflowDefinitionsGet = this.shadowRoot.querySelector('#workflowDefinitionsGet');

          if (typeof (workflowDefinitionsGet) === "undefined" ||
              workflowDefinitionsGet == null) {
                  this.logError("Dashboard-My To-Do's Summary - Init workflow defintions get liquid not found");
              return;
          }

          let clonedContextData = DataHelper.cloneObject(this.contextData);

          if (this.configContext && this.configContext.workflowName) {
              let itemContext = clonedContextData[ContextHelper.CONTEXT_TYPE_ITEM];
              if (itemContext) {
                  let firstItemContext = itemContext[0];
                  firstItemContext.workflowNames = [this.configContext.workflowName];
              } else {
                  let newItemContext = {
                      "workflowNames": [this.configContext.workflowName],
                      "attributes": ["activities"]
                  }
                  clonedContextData[ContextHelper.CONTEXT_TYPE_ITEM] = [newItemContext];
              }
          }

          workflowDefinitionsGet.requestData = DataRequestHelper.createWorkflowDefinitionGetRequest(clonedContextData);
          workflowDefinitionsGet.generateRequest();
      }
  }

  _onWorkflowDefinitionsGetResponse (e) {
      let workflowDefinitionResponse = e.detail.response;
      let responseContent = DataHelper.validateAndGetResponseContent(e.detail.response);

      let currentUserRoles = DataHelper.getUserRoles();
      if (typeof (currentUserRoles) === "undefined") {
          this.logError("Dashboard-My To-Do's Summary List - Current user roles not found");
      }

      if (responseContent) {
          let workflowDefinitions = responseContent.entityModels;

          for (let i = 0; i < workflowDefinitions.length; i++) {
              let workflowDefinition = workflowDefinitions[i];

              if (typeof (workflowDefinition.data) !== "undefined" && typeof (workflowDefinition.data.attributes) !== "undefined") {
                  let workflowAttribtues = workflowDefinition.data.attributes;

                  let workflowActivities = AttributeHelper.getNestedAttributeValues(workflowAttribtues.activities);

                  for (let j = 0; j < workflowActivities.length; j++) {
                      let workflowActivity = workflowActivities[j];
                      let isRoleAllowed = false;

                      // Validate if current loggedin user has a role to work on the activity

                      let allowedRoles = undefined;
                      if (workflowActivity && workflowActivity.allowedRoles && workflowActivity.allowedRoles.values) {
                          allowedRoles = AttributeHelper.getAttributeValues(
                              workflowActivity.allowedRoles.values);
                      }
                      if (typeof (allowedRoles) !== "undefined" && allowedRoles instanceof Array &&
                          allowedRoles.length > 0) {
                          isRoleAllowed = allowedRoles.some(allowedRole => currentUserRoles.indexOf(allowedRole) > -1)
                      }
                      
                      if(!isRoleAllowed){
                          continue;
                      }

                      let listItem = {};
                      listItem.workflow = AttributeHelper.getFirstAttributeValue(workflowAttribtues.workflowName);
                      listItem.name = AttributeHelper.getFirstAttributeValue(workflowActivity.externalName);
                      listItem.workflowName = workflowDefinition.name;
                      listItem.mappedEntityTypes = this.configContext.mappedEntityTypes;
                      listItem.mappedContexts = this.configContext.mappedContexts;

                      let itemVariants = [];
                      let workflowData = {
                          wfName: listItem.workflow,
                          wfShortName: listItem.workflowName,
                          wfActivityName: AttributeHelper.getFirstAttributeValue(workflowActivity.activityName),
                          wfActivityExternalName: listItem.name,
                          user: "all"
                      };

                      if (this.assignedTo.toLowerCase() == "all") {
                          workflowData.user = "all";
                      } else if (this.assignedTo.toLowerCase() == "assigned to me") {
                          workflowData.user = "currentUser";
                      } else if (this.assignedTo.toLowerCase() == "unassigned") {
                          workflowData.user = "unassigned";
                      }

                      if (!_.isEmpty(workflowData)) {
                          listItem.workflowData = workflowData;
                      }

                      if (!_.isEmpty(listItem)) {
                          this.lists.push(listItem);
                      }
                  }
              }
          }

          if (this.lists.length > 0) {
              this._isWorkflowDefinitionAvailable = true;
          }                        
      } else {
          this.logError("Dashboard-My To-Do's Summary List - There is some problem with workflow definition response", e.detail);
      }
  }

  _onWorkflowDefinitionsGetError (e) {
      this.logError("Dashboard-My To-Do's Summary List - Workflow Definitions Get Exception", e.detail);
  }
  _getBusinessCondition(){
      let businessConditionLiquid = this.shadowRoot.querySelector("#initBusinessConditionsGet");
      if (businessConditionLiquid) {
          let attributeNames = ["name"];
          this._businessConditionRequest = DataRequestHelper.createBusinessConditionGetRequest(attributeNames);
          businessConditionLiquid.generateRequest();
      }
  }
  _onInitBusinessConditionsGetResponse (e) {
      let businessConditionsGet = this.shadowRoot.querySelector('#businessConditionsGet');
      if (typeof (businessConditionsGet) === "undefined" || businessConditionsGet == null) {
          this.logError("Dashboard-My To-Do's Summary List - Business conditions get liquid is not found");
          return;
      }

      businessConditionsGet.generateRequest();
  }
  _onBusinessConditionsGetResponse (e) {
      if (DataHelper.isValidObjectPath(e, "detail.response.content.entityModels")) {
          this.businessConditions = e.detail.response.content.entityModels;
          this._isBusinessConditionsAvailable = true;
      } else {
          this.logError("Dashboard-My To-Do's Summary List - Some problem in Business Conditions Get Response", e.detail);
      }
  }
  _onInitBusinessConditionsGetError (e) {
      this.logError("Dashboard-My To-Do's Summary List - Init Business Conditions Get Exception", e.detail);
  }
  _onBusinessConditionsGetError (e) {
      this.logError("Dashboard-My To-Do's Summary List - Business Conditions Get Exception", e.detail);
  }

  _getLists () {
      if (this.lists && this.lists.length) {
          return this.lists;
      }
  }
}
customElements.define(MyTodoSummaryList.is, MyTodoSummaryList);
