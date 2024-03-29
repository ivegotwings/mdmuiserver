/**
`rock-my-todos` Represents an element that displays the list of `my-todo`s.

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
import '../bedrock-helpers/context-helper.js';
import '../bedrock-helpers/data-request-helper.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import '../bedrock-style-manager/styles/bedrock-style-gridsystem.js';
import '../liquid-entity-model-get/liquid-entity-model-get.js';
import '../liquid-rest/liquid-rest.js';
import '../pebble-dropdown/pebble-dropdown.js';
import '../rock-tabs/rock-tabs.js';
import './child-elements/my-todo-detail-view-list.js';
import './child-elements/my-todo-detail-view.js';
import './child-elements/my-todo-product-view.js';
import './child-elements/my-todo-summary-list.js';
import './child-elements/my-todo-summary.js';
import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockMyTodos
    extends mixinBehaviors([
    RUFBehaviors.UIBehavior,
    RUFBehaviors.ComponentContextBehavior
    ], PolymerElement) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-gridsystem bedrock-style-grid-layout">
            :host {
                display: block;
                height: 100%;
            }

            rock-tabs {
                --rock-tab-content: {
                    overflow-y: auto;
                    overflow-x: auto;
                }
                --pebble-tab-group: {
                    width: 100%;
                }
            } 
        </style>

        <template is="dom-if" if="[[_liquidLoad]]">
            <liquid-rest id="workflowDefinitionMappingsGet" url="/data/pass-through/entitymodelservice/get" method="POST" on-liquid-response="_onWorkflowDefinitionMappingsGetResponse" on-liquid-error="_onWorkflowDefinitionMappingsGetError"></liquid-rest>
            <liquid-entity-model-get exclude-in-progress="" id="initWorkflowDefinitionsGet" operation="initiatesearch" last-response="{{initWorkflowDefinitionsGet}}" on-response="_onInitWorkflowDefinitionsGetResponse" on-error="_onInitWorkflowDefinitionsGetError"></liquid-entity-model-get>
            <liquid-entity-model-get exclude-in-progress="" id="workflowDefinitionsGet" operation="getsearchresultdetail" request-id="[[initWorkflowDefinitionsGet.content.requestId]]" on-response="_onWorkflowDefinitionsGetResponse" on-error="_onWorkflowDefinitionsGetError"></liquid-entity-model-get>
        </template>
        <div class="base-grid-structure">
            <div class="base-grid-structure-child-1">
                <div class="default-message" id="noWorkflows">You don't have any workflows yet.</div>
            </div>
            <div class="base-grid-structure-child-2">
                <template is="dom-if" if="[[_load]]">
                    <div class="base-grid-structure">
                        <div class="base-grid-structure-child-1">
                            <div class="row-wrap">
                                <div class="col-3">
                                    <pebble-dropdown id="assignedTo" label="Assigned To" selected-value="{{selectedValue}}" items="[[dropDownItems]]"></pebble-dropdown>
                                </div>
                            </div>
                        </div>
                        <div class="base-grid-structure-child-2">
                            <rock-tabs id="rock-my-todos-tabs" deferred-render=""></rock-tabs>
                        </div>
                    </div>
                </template>
            </div>
        </div>
        <bedrock-pubsub event-name="component-creating" handler="_onComponentCreating"></bedrock-pubsub>
`;
  }

  static get is() {
      return 'rock-my-todos';
  }

  static get properties() {
          return {
              contextData: {
                  type: Object,
                  value: function () {
                      return {};
                  }
              },

              _assignedTo: {
                  type: String,
                  value: 'All'
              },

              _workflowDefinitionMappings: {
                  type: Object,
                  value: function () {
                      return {}
                  }
              },
              dropDownItems: {
                  type: Array,
                  value: [{
                      "value": "All",
                      "title": "All"
                  },
                  {
                      "value": "Assigned to me",
                      "title": "Assigned to me"
                  },
                  {
                      "value": "Unassigned",
                      "title": "Unassigned"
                  }
                  ]
              },
              selectedValue: {
                  type: String,
                  value: 'All',
                  observer:"_onDropdownChange"
              },
              _load: {
                  type: Boolean,
                  value: false
              },
              _liquidLoad: {
                  type: Boolean,
                  value: false
              },
              contexts: {
                  type: Array,
                  value: function () {
                      return [];
                  }
              }
          }
      }
  /**
    * <b><i>Content development is under progress... </b></i> 
    */

  connectedCallback () {
      super.connectedCallback();
  }

  disconnectedCallback() {
      super.disconnectedCallback();
  }

  ready(){
      super.ready();
      afterNextRender(this,()=>{
          if (!_.isEmpty(this.contextData)) {
              this._liquidLoad = true;                   
              timeOut.after(10).run(() => {
                  let workflowDefinitionMappingsGet = this.shadowRoot.querySelector('#workflowDefinitionMappingsGet');
                  if (!workflowDefinitionMappingsGet) {
                      this.logError("Dashboard-My To-Do's - Workflowmappings get liquid is not found");
                      return;
                  }   
                  workflowDefinitionMappingsGet.requestData = DataRequestHelper.createWorkflowDefinitionMappingGetRequest();
                  if(!_.isEmpty(this.contexts)) {
                      workflowDefinitionMappingsGet.requestData.params.query.contexts = this.contexts;
                  }
                  workflowDefinitionMappingsGet.generateRequest();
              });
          }
      });
  }

  _onWorkflowDefinitionMappingsGetResponse (e) {
      let responseContent = e.detail.response;
      let showMessage = false;

      if (responseContent && responseContent.response && responseContent.response.status === "success" && responseContent.response.entityModels) {
          let workflowDefinitionMappings = responseContent.response.entityModels;
          let workflowMappings = {};
          workflowDefinitionMappings.forEach(function (WDMapping) {
              if (WDMapping && WDMapping.data) {
                  let selfWorkflows = {};
                  selfWorkflows = DataMergeHelper.mergeRelationships(selfWorkflows, WDMapping.data.relationships, true);
                  this._updateWorkflowMappings(workflowMappings, selfWorkflows, WDMapping.name);

                  if(!_.isEmpty(WDMapping.data.contexts)) {
                      for(let i=0; i<WDMapping.data.contexts.length; i++) {
                          let ctx = WDMapping.data.contexts[i].context;
                          let ctxRelationships = SharedUtils.DataObjectFalcorUtil.getRelationshipsByCtx(WDMapping, ctx);
                          if (!_.isEmpty(ctxRelationships)) {
                              let ctxWorkflows = {};
                              ctxWorkflows = DataMergeHelper.mergeRelationships(ctxWorkflows, ctxRelationships, true);
                              this._updateWorkflowMappings(workflowMappings, ctxWorkflows, WDMapping.name, ctx);
                          }
                      }
                  }
              }
          }, this);

          if(!_.isEmpty(workflowMappings)) {
              this._workflowDefinitionMappings = workflowMappings;
              this._initWorkflowDefinitionGet();
          } else {
              showMessage = true;
          }
      } else {
          this.logError("Dashboard-My To-Do's - Some problem in Workflow mappings Get Response", e.detail);
          showMessage = true;
      }
      this.setNoWorkflowMessageVisibility(showMessage);
  }

  _updateWorkflowMappings(workflowMappings, workflows, name, context) {
      let relationships = !_.isEmpty(workflows) ? workflows.hasWorkflowsDefined : [];
      if (relationships && relationships.length) {
          relationships.forEach(function (relItem) {
              if (relItem && relItem.relTo) {
                  if (!workflowMappings[relItem.relTo.id]) {
                      workflowMappings[relItem.relTo.id] = {};
                      workflowMappings[relItem.relTo.id]["mappedEntityTypes"] = [];
                      workflowMappings[relItem.relTo.id]["mappedContexts"] = [];
                  }
                  workflowMappings[relItem.relTo.id]["mappedEntityTypes"].push(name);
                  workflowMappings[relItem.relTo.id]["mappedContexts"].push(context || { "self": "self" });
              }
          }, this);
      }
  }

  _onWorkflowDefinitionMappingsGetError (e) {
      this.logError("Dashboard-My To-Do's - Workflow Mappings Get Exception", e.detail);
      this.setNoWorkflowMessageVisibility(true);
  }

  _onComponentCreating (e, detail, sender) {
      let component = detail.data;

      if (component.properties) {
          component.properties['context-data'] = this.contextData;
      }
  }

  _initWorkflowDefinitionGet () {
      if (!_.isEmpty(this.contextData)) {
          let initWorkflowDefinitionsGet = this.shadowRoot.querySelector('#initWorkflowDefinitionsGet');

          if (!initWorkflowDefinitionsGet) {
              this.logError("Dashboard-My To-Do's - Init workflow defintions get liquid not found");
              return;
          }

          let workflowNames = [];

          if (!_.isEmpty(this._workflowDefinitionMappings)) {
              Object.keys(this._workflowDefinitionMappings).forEach(function (key) {
                  key = key.replace("_workflowDefinition", '');
                  workflowNames.push(key);
              })
          }

          let itemContext = {};
          itemContext.atttributeNames = ["_ALL"];
          itemContext.workflowNames = workflowNames;
          this.contextData[ContextHelper.CONTEXT_TYPE_ITEM] = [itemContext];

          initWorkflowDefinitionsGet.requestData = DataRequestHelper.createWorkflowDefinitionGetRequest(
              this.contextData);
          initWorkflowDefinitionsGet.generateRequest();
      }
  }

  _onInitWorkflowDefinitionsGetResponse (e) {
      let workflowDefinitionsGet = this.shadowRoot.querySelector('#workflowDefinitionsGet');

      if (!workflowDefinitionsGet) {
         this.logError("Dashboard-My To-Do's - Workflow defintions get liquid not found");
          return;
      }

      workflowDefinitionsGet.requestData = DataRequestHelper.createWorkflowDefinitionGetRequest(this.contextData);
      workflowDefinitionsGet.generateRequest();
  }

  _onInitWorkflowDefinitionsGetError (e) {
      this.logError("Dashboard-My To-Do's - Init Workflow Definitions Get Exception", e.detail);
      this.setNoWorkflowMessageVisibility(true);
  }

  _onWorkflowDefinitionsGetResponse (e) {
      let workflowDefinitionResponse = e.detail.response;
      let responseContent = DataHelper.validateAndGetResponseContent(e.detail.response);

      let currentUserRoles = DataHelper.getUserRoles();
      if (!currentUserRoles) {
          this.logError("UserNotFound");
      }

      if (responseContent) {
          let workflowDefinitions = responseContent.entityModels;
          let tabConfig = {
              "scrollable": true,
              "tabItems": []
          };

          for (let i = 0; i < workflowDefinitions.length; i++) {
              let workflowDefinition = workflowDefinitions[i];

              if (typeof (workflowDefinition.data) !== "undefined" && typeof (
                  workflowDefinition.data.attributes) !== "undefined") {
                  let workflowAttributes = workflowDefinition.data.attributes;

                  let workflowActivities = AttributeHelper.getNestedAttributeValues(workflowAttributes.activities);
                  let noOfAllowedActivities = 0;
                  let workflowActivitiesLength = workflowActivities ? workflowActivities.length : 0;
                  for (let j = 0; j < workflowActivitiesLength; j++) {
                      let workflowActivity = workflowActivities[j];

                      // Validate if current loggedin user has a role to work on the activity

                      let allowedRoles = undefined;
                      if (workflowActivity && workflowActivity.allowedRoles && workflowActivity.allowedRoles.values) {
                          allowedRoles = AttributeHelper.getAttributeValues(
                              workflowActivity.allowedRoles.values);
                      }
                      if (typeof (allowedRoles) !== "undefined" && allowedRoles instanceof Array &&
                          allowedRoles.length > 0) {
                          let isRoleAllowed = allowedRoles.some(allowedRole => currentUserRoles.indexOf(allowedRole) > -1)

                          if (!isRoleAllowed) {
                              continue;
                          } else {
                              noOfAllowedActivities++;
                          }
                      }
                  }

                  if (noOfAllowedActivities < 1) {
                      continue;
                  }

                  let workflowName = AttributeHelper.getFirstAttributeValue(workflowAttributes.workflowName);
                  let tabItem = {
                      "name": workflowName.replace(/\W/g, '_'),
                      "title": workflowName,
                      "enableDropdownMenu": false,
                      "component": {
                          "name": "my-todo-summary-list",
                          "path": "/src/elements/rock-my-todos/child-elements/my-todo-summary-list.html",
                          "properties": {
                              "config-context": {
                                  "workflowName": workflowDefinition.name,
                                  "mappedEntityTypes": (this._workflowDefinitionMappings[workflowDefinition.id] !== undefined) ? this._workflowDefinitionMappings[workflowDefinition.id].mappedEntityTypes : "",
                                  "mappedContexts": this._workflowDefinitionMappings[workflowDefinition.id].mappedContexts
                              },
                              "assigned-to": this._assignedTo
                          }
                      }
                  };
                  tabConfig.tabItems.push(tabItem);
              }
          }

          if (tabConfig.tabItems instanceof Array && tabConfig.tabItems.length > 0) {
              tabConfig.tabItems[0].selected = true;
              this.setNoWorkflowMessageVisibility(false);
          } else {
              this.setNoWorkflowMessageVisibility(true);
              return;
          }
          this._load = true;
          timeOut.after(10).run(() => {
              let rockTabs = this.shadowRoot.querySelector('rock-tabs');
              rockTabs.readyToRender(true);
              rockTabs.config = tabConfig;
          });
      } else {
          this.logError("Dashboard-My To-Do's - There is some problem with workflow definition response", e.detail);
          this.setNoWorkflowMessageVisibility(true);
      }
  }

  _onWorkflowDefinitionsGetError (e) {
      this.logError("Dashboard-My To-Do's - Workflow Definitions Get Exception", e.detail);
      this.setNoWorkflowMessageVisibility(true);
  }

  _onDropdownChange (_selectedValue) {
      if (!_selectedValue) return;
      
      let assignedToList = this.shadowRoot.querySelector("#assignedTo");
      let rockTabs = this.shadowRoot.querySelector('rock-tabs');

      if (assignedToList) {
          this._assignedTo = assignedToList.selectedValue;
      }

      if (rockTabs) {
          let tabConfig = rockTabs.config;

          if (tabConfig && tabConfig.tabItems && tabConfig.tabItems.length) {
              tabConfig.tabItems.forEach(function (tabItem) {
                  if (tabItem && tabItem.component) {
                      tabItem.component.properties["assigned-to"] = this._assignedTo;
                  }
              }, this);
          }
          rockTabs.readyToRender(true);
          rockTabs.reloadTabs();
      }
  }

  refresh () {
      let rockTabs = this.shadowRoot.querySelector('rock-tabs');
      if (rockTabs) {
          rockTabs.readyToRender(true);
          rockTabs.reloadCurrentTab();
      }
  }

  setNoWorkflowMessageVisibility (isVisible) {
      let noWorkflows = this.shadowRoot.querySelector("#noWorkflows");
      if(noWorkflows){
          noWorkflows.setAttribute("show",""+isVisible+"");
      }
  }
}
customElements.define(RockMyTodos.is, RockMyTodos)
