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

import '../../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../../bedrock-helpers/data-helper.js';
import '../../bedrock-helpers/context-helper.js';
import '../../bedrock-helpers/data-request-helper.js';
import '../../pebble-button/pebble-button.js';
import '../../liquid-entity-model-get/liquid-entity-model-get.js';
import '../../liquid-entity-govern-data-get/liquid-entity-govern-data-get.js';
import '../../bedrock-style-manager/styles/bedrock-style-common.js';
import '../../bedrock-style-manager/styles/bedrock-style-text-alignment.js';
import '../../bedrock-style-manager/styles/bedrock-style-floating.js';
import '../../bedrock-style-manager/styles/bedrock-style-gridsystem.js';
import EntityTypeManager from '../../bedrock-managers/entity-type-manager.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class MyTodoSummary
    extends mixinBehaviors([
    RUFBehaviors.UIBehavior,
    RUFBehaviors.ComponentContextBehavior
    ], PolymerElement) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-gridsystem bedrock-style-floating bedrock-style-text-alignment">
            .list-item {
                @apply --box-style;
                margin-top: var(--default-margin);
                margin-bottom: var(--default-margin);
                margin-right: var(--default-margin);
                line-height: var(--font-size-md);
                -webkit-flex-wrap: nowrap;
                /* Safari 6.1+ */
                flex-wrap: nowrap;
                cursor: var(--list-item-cursor, pointer);
                position: relative;
                padding: 8px 10px 8px 8px;
                overflow: hidden;
            }

            .square {
                color: var(--list-item-count-wrap-text-color, #036bc3);
                font-size: var(--font-size-lg, 18px);
                font-weight: 500;
                margin: 0 10px;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .todo-status {
                position: absolute;
                top: 0;
                left: 0;
                bottom: 0;
                width: 8px;
            }

            .border-left-1 {
                background: rgba(18, 156, 230, 1);
            }

            .border-left-2 {
                background: rgba(54, 180, 74, 1);
            }

            .border-left-3 {
                background: rgba(120, 93, 168, 1);
            }

            .border-left-4 {
                background: rgba(247, 142, 30, 1);
            }

            .border-left-5 {
                background: rgba(246, 212, 12, 1);
            }

            .border-left-6 {
                background: rgba(238, 32, 76, 1);
            }

          
            #moreDetails {
                padding-left: 10px;
                padding-top: 10px;
            }

            .sub-content {
                white-space:nowrap;
                margin-left: 5px;
                flex-grow: 1;
            }

            .to-do-name {
                line-height: 17px;
            }

            pebble-button.action {
                display: inline-block;
                vertical-align: top;
                border: 1px solid var(--palette-cerulean, #036bc3);
                border-radius: 3px;
                margin-top:0px;
                margin-right:7px;
                margin-bottom:10px;
                margin-left:0px;
                --pebble-button: {
                    height: 30px !important;
                    color: var(--error-button-color);
                    font-size: var(--default-font-size, 14px);
                    margin-top:0px;
                    margin-right:10px;
                    margin-bottom:0px;
                    margin-left:10px;
                }
                --pebble-menu-button: {
                    height: 30px !important;
                    border-top: 1px solid var(--palette-cerulean);
                    border-right: 1px solid var(--palette-cerulean);
                    border-bottom: 1px solid var(--palette-cerulean);
                    background: #FFFFFF;
                    box-sizing: border-box;
                }
                --actions-icon-button: {
                    height: 16px;
                    width: 16px;
                    background: #FFFFFF;
                    color: var(--palette-cerulean);
                    padding-top:0px !important;
                    padding-right:0px !important;
                    padding-bottom:0px !important;
                    padding-left:0px !important;
                    margin-top:0px;
                    margin-right:5px;
                    margin-bottom:0px;
                    margin-left:5px;
                    top: -2px;
                }
                --pebble-button-paper-menu: {
                    background: #FFFFFF;
                }
                --pebble-button-paper-menu-item: {
                    background: #FFFFFF;
                    color: var(--palette-cerulean);
                    padding-top: 0px;
                    padding-right:8px;
                    padding-bottom: 0px;
                    padding-left:8px;
                }
            }
            pebble-button.bcButtons{
                --pebble-button: {
                    color: var(--error-button-color);
                    padding-right:10px;
                    padding-left:10px;
                }
            }
            pebble-button#passedBCButton{
                --pebble-button: {
                    color: var(--success-button-color);
                    padding-right:10px;
                    padding-left:10px;
                }
            }

            #loadingIcon {
                height: 24px;
                margin: 0px 10px -4px 10px;
            }

            pebble-button {
                --pebble-custom-icon-height: {
                    height: 20px;
                    margin-right: 5px;
                }
            }
            .item-container{
                display:flex;
                align-items: center;
                height:30px;
                width:100%;
            }
        </style>
        <div class="list-item">
            <div class\$="{{_computeClass(myTodo.status)}} todo-status"></div>
            <div>    
            <div class="item-container">               
                    <div id="taskCount" class="square" hidden="">
                        [[_numberOfTasks]]
                        
                    </div>
                    <div id="taskCountLoading">
                        <img id="loadingIcon" src="../../../../src/images/loading.svg">
                    </div>
                    <div id="workflowMetadataContainer" class="list-content to-do-name block-text text-ellipsis" data="[[myTodo.workflowData]]" on-tap="_onActivityTap">
                        [[myTodo.name]]
                    </div>
                    <div id="viewDetails" class="sub-content text-right btn-link" on-tap="_showHideDetails">
                            [[_detailsToggleText]] »
                    </div>
                </div>
            </div>
                <div class="clearfix"></div>
                <div id="moreDetails" hidden="true">
                    <template is="dom-if" if="[[_bCsExist]]">
                        <pebble-button id="passedBCButton" icon-url="../../../../src/images/loading.svg" class="action" noink="" raised="" elevation="0" horizontal-align="right" vertical-align="top" button-text="[[_passedBC.text]]" data="[[_passedBC.data]]" on-tap="_onBusinessConditionTap">
                        </pebble-button>
                    </template>

                    <template is="dom-repeat" items="[[_getSortedBusinessConditionMappings(_businessConditionMappings)]]" as="businessCondition">
                        <pebble-button id="[[businessCondition.data.bcId]]" icon-url="../../../../src/images/loading.svg" class="action bcButtons" noink="" raised="" elevation="0" horizontal-align="right" vertical-align="top" button-text="[[businessCondition.businessConditionName]]" data="[[businessCondition.data]]" on-tap="_onBusinessConditionTap">
                        </pebble-button>
                    </template>
                    <div id="noBusinessCondditionsMessage" hidden="">
                        <div class="default-message">No business conditions mapped to this activity</div>
                    </div>
                </div>
        </div>
        <div class="clearfix"></div>
        

        <liquid-entity-model-get exclude-in-progress="" id="initBusinessConditionsMappingGet" operation="initiatesearch" request-data="[[_businessConditionMappingRequest]]" last-response="{{initBusinessConditionsMappingGet}}" on-response="_onInitBusinessConditionsMappingGetResponse" on-error="_onInitBusinessConditionsMappingGetError"></liquid-entity-model-get>
        <liquid-entity-model-get exclude-in-progress="" id="businessConditionsMappingGet" operation="getsearchresultdetail" request-data="[[_businessConditionMappingRequest]]" request-id="[[initBusinessConditionsMappingGet.content.requestId]]" on-response="_onBusinessConditionsMappingGetResponse" on-error="_onBusinessConditionsMappingGetError"></liquid-entity-model-get>

        <liquid-entity-govern-data-get name="governDataGet" operation="initiatesearchandgetcount" request-data="{{_governDataRequest}}" on-response="_onGovernDataResponse" on-error="_onGovernDataError" exclude-in-progress=""></liquid-entity-govern-data-get>
`;
  }

  static get is() { return 'my-todo-summary' }
  static get properties() {
      return {
          myTodo: {
              type: Object,
              notify: true,
              value: {}
          },

          _detailsToggleText: {
              type: String,
              value: 'View details'
          },

          _businessConditionMappings: {
              type: Array,
              observer: '_getBusinessConditionCount',
              value: function () {
                  return [];
              }
          },

          businessConditions: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          _numberOfTasks: {
              type: Number,
              value: 0
          },

          _governDataRequest: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          _businessConditionMappingRequest: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          _allowedEntityTypes: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          _passedBC: {
              type: Object
          },
          _bCsExist: {
              type: Boolean,
              value: false
          },
          contextData: {
              type: Object,
              value: function () {
                  return {};
              }
          },
      }
  }


  connectedCallback () {
      super.connectedCallback();
      let governDataLiquid = this.shadowRoot.querySelector("[name=governDataGet]");

      this._allowedEntityTypes = [];
      let wfExternalName;
      if(!_.isEmpty(this.myTodo)) {
          this._allowedEntityTypes = this.myTodo.mappedEntityTypes;
          wfExternalName = this.myTodo.workflow;
          if(this.myTodo.workflowData) {
              let mappedEntityTypesString = this.myTodo.mappedEntityTypes ? this.myTodo.mappedEntityTypes.join("#@#") : undefined;
              this.myTodo.workflowData.mappedEntityTypesString = mappedEntityTypesString;
              let mappedContextsString = this.myTodo.mappedContexts ? JSON.stringify(this.myTodo.mappedContexts) : undefined;
              this.myTodo.workflowData.mappedContextsString = mappedContextsString;
          }
      }

      if (governDataLiquid) {

          if (this._allowedEntityTypes && this._allowedEntityTypes.length) {

              let userId = "";
              if (!_.isEmpty(this.myTodo.workflowData.user)) {
                  let user = this.myTodo.workflowData.user;

                  if (user.toLowerCase() == "all") {
                      userId = "";
                  } else if (user.toLowerCase() == "currentuser") {
                      userId = DataHelper.getUserName();
                  } else if (user.toLowerCase() == "unassigned") {
                      userId = "_UNASSIGNED";
                  }
              }

              let contexts = [{
                  "workflow": this.myTodo.workflowName
              }];

              let options = {
                  "contexts": contexts,
                  "typesCriterion": this._allowedEntityTypes,
                  "userId": userId,
                  "workflowActivityName": this.myTodo.workflowData.wfActivityName,
                  "excludeNonContextual": true
              };

              let req = DataRequestHelper.createGovernGetRequest(options);
              this._governDataRequest = req;
              governDataLiquid.generateRequest();
          } else {
              this.logError("Workflow "+ wfExternalName + " is not mapped to any entity types");
              this._setTaskLoadingIndicatorVisibility(false);
          }
      }

  }

  _onGovernDataResponse (e) {
      if (e.detail && e.detail.response) {
          let response = e.detail.response;
          if (response && response.content) {
              let totalRecords = response.content.totalRecords || 0;
              let maxRecords = response.content.maxRecords || 0;

              if (totalRecords > maxRecords) {
                  this._numberOfTasks = maxRecords + "+";
              } else {
                  this._numberOfTasks = totalRecords;
              }
          } else {
              this.logError("Dashboard-My To-Do's Summary - Some problem with Govern data Get response", e.detail);
          }

          this._setTaskLoadingIndicatorVisibility(false);
      }
  }

  _setTaskLoadingIndicatorVisibility (isVisible) {
      this.shadowRoot.querySelector('#taskCountLoading').hidden = !isVisible;
      this.shadowRoot.querySelector('#taskCount').hidden = isVisible;
  }

  _onGovernDataError (e) {
      this.logError("Dashboard-My To-Do's Summary - Governdata Get Exception", e.detail);
      this._setTaskLoadingIndicatorVisibility(false);
  }

  /**
   *  This s internal function used to compute the class based on the status of my-todo
   */
  _computeClass (status) {
      if (status) {
          if (status == "red") {
              return 'border-left-1';
          } else if (status == "orange") {
              return 'border-left-2';
          } else {
              return 'border-left-3';
          }
      }
      return 'border-left-3';
  }

  _showHideDetails () {
      let moreDetails = this.shadowRoot.querySelector('#moreDetails');
      if (moreDetails) {
          if (moreDetails.hidden) {
              moreDetails.hidden = false;
              this._showBusinessConditions();
          } else {
              moreDetails.hidden = true;
              this._detailsToggleText = "View details";
          }
      }
  }

  /**
   * This is internal function used to fire an rock-my-todo-click when my-todo element is tapped
   */
  _onActivityTap () {
      let appName = this._getAppNameToRedirect();
      this.setState(this.myTodo.workflowData);
      let workflowData = {state: this.getQueryParamFromState()};
      ComponentHelper.appRoute(appName, workflowData);                
  }

  _onBusinessConditionTap (e) {
      if (e && e.currentTarget) {
          let appName = this._getAppNameToRedirect();
          this.setState(e.currentTarget.data);
          let bcData = {state: this.getQueryParamFromState()};
          ComponentHelper.appRoute(appName, bcData);
      }
  }

  _getSortedBusinessConditionMappings() {
      if(!_.isEmpty(this._businessConditionMappings)) {
        this._businessConditionMappings = DataHelper.sort(this._businessConditionMappings, 'businessConditionName');
      }
      return this._businessConditionMappings;
  }

  _onInitBusinessConditionsMappingGetResponse () {

      let businessConditionsMappingGet = this.shadowRoot.querySelector('#businessConditionsMappingGet');
      if (typeof (businessConditionsMappingGet) === "undefined" || businessConditionsMappingGet == null) {
          this.logError("Dashboard-My To-Do's Summary - BusinessConditions mappings liquid not found");
          return;
      }

      businessConditionsMappingGet.generateRequest();
  }
  _isBusinessConditionAllowedForRole (businessCondition) {
      let allowedRoles;
      if (DataHelper.isValidObjectPath(businessCondition, "data.attributes")) {
          allowedRoles = businessCondition.data.attributes.impactRoles.values;
      }
      let userContext = this.contextData.UserContexts[0];
      let currentUserRoles = userContext.roles;
      if (allowedRoles && currentUserRoles) {
          let isRoleAllowed = allowedRoles.some(allowedRole => currentUserRoles.indexOf(allowedRole.value) > -1 || allowedRole.value == "_ALL")
          if(isRoleAllowed){
              return true;
          }
          //Not have "_ALL" / user role
          return false;
      }

      //No allowedRoles OR No user role, then BC is applicable to any role
      return true;
  }

  _onBusinessConditionsMappingGetResponse (e) {
      let responseContent = DataHelper.validateAndGetResponseContent(e.detail.response);
      if (responseContent) {
          let ruleContextMappings = responseContent.entityModels;

          if (ruleContextMappings && ruleContextMappings.length) {
              let firstRuleContextMapping = ruleContextMappings[0];

              if (firstRuleContextMapping && firstRuleContextMapping.data) {
                  let contextBaseMappings = firstRuleContextMapping.data.contexts;

                  if (contextBaseMappings && contextBaseMappings.length) {
                      let businessConditions = [];
                      let bcIds=[];
                      contextBaseMappings.forEach(function (ctxMapping) {
                          if (ctxMapping && ctxMapping.relationships) {
                              let hasBusinessConditions = ctxMapping.relationships['hasBusinessConditions'];

                              if (hasBusinessConditions && hasBusinessConditions.length) {
                                  hasBusinessConditions.forEach(function (businessCondition) {
                                      if (businessCondition && businessCondition.attributes && businessCondition.relTo) {
                                          if (this._isBusinessConditionAllowedForRole(businessCondition.relTo)) {
                                              let stepNameAttr = businessCondition.attributes['stepName'];
                                              let businessConditionName = this._getBusinessConditionName(businessCondition.relTo.id);
                                              if (!this._isBusinessConditionExist(businessConditionName, businessConditions)) {
                                                  if (stepNameAttr) {
                                                      let value = AttributeHelper.getFirstAttributeValue(stepNameAttr);

                                                      if (value && value == this.myTodo.workflowData.wfActivityName) {
                                                          bcIds.push(businessCondition.relTo.id);
                                                          let businessConditionItem = {
                                                              "businessConditionName": businessConditionName,
                                                              "data": {
                                                                  "wfName": this.myTodo.workflow,
                                                                  "wfShortName": this.myTodo.workflowName,
                                                                  "wfActivityName": this.myTodo.workflowData.wfActivityName,
                                                                  "wfActivityExternalName": this.myTodo.workflowData.wfActivityExternalName,
                                                                  "bcId": businessCondition.relTo.id,
                                                                  "user": this.myTodo.workflowData.user,
                                                                  "bcExternalName":businessConditionName,
                                                                  "status":"failed",
                                                                  "mappedEntityTypesString": this.myTodo.workflowData.mappedEntityTypesString,
                                                                  "mappedContextsString": this.myTodo.workflowData.mappedContextsString
                                                              }
                                                          };

                                                          businessConditions.push(businessConditionItem);
                                                      }
                                                  }
                                              }
                                          }
                                      }
                                  }, this);
                              }
                          }
                      }, this);
                      if(bcIds && bcIds.length){
                          this._bCsExist=true;
                          let bcId=bcIds.join("#@#");
                          this._passedBC={
                              "text":"Ready for transition",
                              "data": {
                                  "wfName": this.myTodo.workflow,
                                  "wfShortName": this.myTodo.workflowName,
                                  "wfActivityName": this.myTodo.workflowData.wfActivityName,
                                  "wfActivityExternalName": this.myTodo.workflowData.wfActivityExternalName,
                                  "user": this.myTodo.workflowData.user,
                                  "bcId": bcId,
                                  "status":"passed",
                                  "bcExternalName":"Ready for transition",
                                  "mappedEntityTypesString": this.myTodo.workflowData.mappedEntityTypesString,
                                  "mappedContextsString": this.myTodo.workflowData.mappedContextsString
                              }
                          };
                      }
                      this._prepareBusinessConditions(businessConditions);
                  }
              }
          } else {
              let noBusinessCondditionsMessageDiv = this.shadowRoot.querySelector("#noBusinessCondditionsMessage");
              if(noBusinessCondditionsMessageDiv) {
                  noBusinessCondditionsMessageDiv.hidden = false;
              }
          }
      } else {
          this.logError("Dashboard-My To-Do's Summary - Some problem with businessConditions mapping Get response", e.detail);
      }
  }

  _onBusinessConditionsMappingGetError (e) {
      this.logError("Dashboard-My To-Do's Summary - BusinessConditions mapping Get Exception", e.detail);
  }

  _prepareBusinessConditions (businessConditions) {
      if (businessConditions && businessConditions.length) {
          this._businessConditionMappings = businessConditions;
      }
  }

  _showBusinessConditions () {
      this._detailsToggleText = "Hide details";
      this._businessConditionButtons = [];
      let contexts = this._getContextFromTypeCriterion();
      let valContexts = [DataHelper.getDefaultValContext()];

      if (this.myTodo) {
          let req = {
              "params": {
                  "query": {
                      "contexts": contexts,
                      "valueContexts": valContexts,
                      "filters": {
                          "typesCriterion": [
                              "ruleContextMappings"
                          ],
                          "relationshipsCriterion": [
                              {
                                  "hasBusinessConditions": {
                                      "attributes": [
                                          {
                                              "stepName": {
                                                  "eq": this.myTodo.workflowData.wfActivityName
                                              }
                                          }
                                      ]
                                  }
                              }
                          ]
                      }
                  },
                  "fields": {
                      "relationships": [
                          "hasBusinessConditions"
                      ],
                      "relationshipAttributes": [
                          "stepName"
                      ],
                      "relatedEntityAttributes":["impactRoles"]
                  }
              }
          };

          let initBusinessConditionsMapingGet = this.shadowRoot.querySelector('#initBusinessConditionsMappingGet');

          if (typeof (initBusinessConditionsMapingGet) === "undefined" || initBusinessConditionsMapingGet == null) {
              this.logError("Dashboard-My To-Do's Summary - Init BusinessConditions mappings liquid not found");
              return;
          }
          this._businessConditionMappingRequest = req;
          initBusinessConditionsMapingGet.generateRequest();
      }
  }

  _getBusinessConditionCount () {
      if (!_.isEmpty(this._businessConditionMappings)) {
          if (this._allowedEntityTypes && this._allowedEntityTypes.length) {
              let contexts = this._getContextFromTypeCriterion();
              if(!_.isEmpty(contexts) && !_.isEmpty(this.myTodo.mappedContexts) && !("self" in this.myTodo.mappedContexts[0])) {
                  contexts = contexts.concat(this.myTodo.mappedContexts);
              }
              let userId = "";
              let user = this.myTodo.workflowData.user;

              if (user.toLowerCase() == "all") {
                  userId = "";
              } else if (user.toLowerCase() == "currentuser") {
                  userId = DataHelper.getUserName();
              } else if (user.toLowerCase() == "unassigned") {
                  userId = "_UNASSIGNED";
              }
              let attributes = ["businessConditions", "status", "activities"];
              let passedBCOptions={};
            
              this._businessConditionMappings.forEach(function (businessCondition) {
                  let governGetLiquid = document.createElement('liquid-entity-govern-data-get');
                  governGetLiquid.addEventListener('response', this._getBusinessConditionCountResponse.bind(this));
                  governGetLiquid.addEventListener('error', this._getBusinessConditionCountFailed);
              
                  if (businessCondition && businessCondition.data) {
                      let options = {
                          "contexts": contexts,
                          "typesCriterion": this._allowedEntityTypes,
                          "userId": userId,
                          "workflowActivityName": businessCondition.data.wfActivityName,
                          "businessConditionName": businessCondition.data.bcId,
                          "attributes": attributes,
                          "excludeNonContextual": false
                      };
                      passedBCOptions=options;
                      let req = DataRequestHelper.createGovernGetRequest(options);
                      if (!_.isEmpty(req)) {
                          governGetLiquid.id = businessCondition.data.bcId;
                          governGetLiquid.operation = 'initiatesearchandgetcount';
                          governGetLiquid.requestData = req;
                          governGetLiquid.excludeInProgress = true;
                          governGetLiquid.generateRequest();
                      }
                  }
              }, this);
              delete  passedBCOptions.businessConditionName;
              this._getPassedBusinessConditionsCount(passedBCOptions,this._businessConditionMappings);
          } else {
              this.logError("Default entity types are empty or undefined in appsettings");
          }
      }
  }
  _getPassedBusinessConditionsCount (options,businessConditionMappings) {
      let bcIds=businessConditionMappings.map(function (businessCondition) {
         return businessCondition.data.bcId
      });
      options.businessConditionNames=bcIds;
      options.passedBusinessConditions=true;
      let req = DataRequestHelper.createGovernGetRequest(options);
      if (!_.isEmpty(req)) {
          let governGetLiquid = document.createElement('liquid-entity-govern-data-get');
          governGetLiquid.id = "passedBCGovernLiquid";
          governGetLiquid.operation = 'initiatesearchandgetcount';
          governGetLiquid.requestData = req;
          governGetLiquid.excludeInProgress = true;
          governGetLiquid.addEventListener('response', this._onGetPassedBusinessConditionsCountResponse.bind(this));
          governGetLiquid.addEventListener('error', this._onGetPassedBusinessConditionsCountError.bind(this));
          governGetLiquid.generateRequest();
      }
  }
  _addCountToBCButton (response,businessConditionButton) {
      let bcCount = 0;
      let totalRecords = response.content.totalRecords || 0;
      let maxRecords = response.content.maxRecords || 0;

      if (totalRecords > maxRecords) {
          bcCount = maxRecords + "+";
      } else {
          bcCount = totalRecords;
      }
      businessConditionButton.iconUrl = '';
      businessConditionButton.buttonText = bcCount + "  " + businessConditionButton.buttonText;
  }
  _onGetPassedBusinessConditionsCountResponse (e) {
      if (e && e.currentTarget && e.detail) {
          let businessConditionButton = this.$$('pebble-button[id=passedBCButton]');
          if(!businessConditionButton) {
              this.logError("Dashboard-My To-Do's Summary - Passed BusinessCondition button notfound");
              return;
          }
          let response = e.detail.response;
          if (response && response.content) {
             this._addCountToBCButton(response,businessConditionButton);
          } else {
              businessConditionButton.iconUrl = ''
              this.logError("Dashboard-My To-Do's Summary - Some problem with passed BusinessCondition count response", e.detail);
          }
      }
  }

  _onGetPassedBusinessConditionsCountError (e) {
      this.logError("Dashboard-My To-Do's Summary - Get Passed BusinessConditions Get Exception", e.detail);
  }

  _getBusinessConditionCountResponse (e) {
      if (e && e.currentTarget && e.detail) {
          let businessConditionButton = this.shadowRoot.querySelector('pebble-button[id=' + e.currentTarget.id + ']');
          if(!businessConditionButton) {
              this.logError("Dashboard-My To-Do's Summary - Passed BusinessCondition button notfound");
              return;
          }
          let response = e.detail.response;
          if (response && response.content) {
              this._addCountToBCButton(response,businessConditionButton);
          } else {
              businessConditionButton.iconUrl = ''
              this.logError("Dashboard-My To-Do's Summary - Some problem with BusinessCondition count response", e.detail);
          }
      }
  }

  _getBusinessConditionCountFailed (e) {
      this.logError("Dashboard-My To-Do's Summary - Get BusinessConditions count Exception", e.detail);
  }

  _isBusinessConditionExist (businessConditionName, businessConditions) {
      if (businessConditions && businessConditions.length) {
          let isExist = false;
          businessConditions.forEach(function (businessCondition) {
              if (businessCondition.businessConditionName && businessCondition.businessConditionName == businessConditionName) {
                  isExist = true;
              }
          }, this);
          return isExist;
      }
      return false;
  }

  _getContextFromTypeCriterion () {
      let contexts = [];
      if(this.myTodo && !_.isEmpty(this.myTodo.mappedContexts)) {
          contexts = DataHelper.cloneObject(this.myTodo.mappedContexts);
          contexts.forEach(function (context) {
              context.workflow = this.myTodo.workflowName;
          }, this);
      }
      return contexts;
  }

  _getAppNameToRedirect () {
      let appName = "search-thing";

      let entityTypeManager = EntityTypeManager.getInstance();

      if (this.myTodo.mappedEntityTypes && entityTypeManager) {
          this.myTodo.mappedEntityTypes.forEach(function (entityType) {
              let domain = entityTypeManager.getDomainByEntityTypeName(entityType) || "";
              if(domain !== ""){
                  appName = "search-" + domain.toLowerCase();
              }
          }, this);
      }

      return appName;
  }

  _getBusinessConditionName (businessConditionId) {
      let businessConditionName = "";

      if (this.businessConditions && this.businessConditions.length && businessConditionId) {
          for (let i = 0; i < this.businessConditions.length; i++) {
              let businessCondition = this.businessConditions[i];
              if (businessCondition.id == businessConditionId) {
                  if (businessCondition.data && businessCondition.data.attributes) {
                      let businessConditionNameAttribute = businessCondition.data.attributes["name"];

                      if (businessConditionNameAttribute && businessConditionNameAttribute.values && businessConditionNameAttribute.values.length) {
                          businessConditionName = businessConditionNameAttribute.values[0].value;
                      }
                  }
              }
          }
      }

      return businessConditionName;
  }
}
customElements.define(MyTodoSummary.is, MyTodoSummary);
