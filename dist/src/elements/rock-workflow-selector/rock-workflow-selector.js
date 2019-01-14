import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-text-alignment.js';
import '../bedrock-style-manager/styles/bedrock-style-buttons.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import '../bedrock-helpers/attribute-helper.js';
import '../bedrock-helpers/context-helper.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-helpers/data-request-helper.js';
import '../liquid-entity-model-get/liquid-entity-model-get.js';
import '../pebble-button/pebble-button.js';
import '../pebble-data-table/pebble-data-table.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-lov/pebble-lov.js';
import '../pebble-popover/pebble-popover.js';
import '../pebble-spinner/pebble-spinner.js';
import '../pebble-textbox/pebble-textbox.js';
import { Base } from '@polymer/polymer/polymer-legacy.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockWorkflowSelector extends mixinBehaviors([RUFBehaviors.UIBehavior, RUFBehaviors.ComponentContextBehavior], PolymerElement) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-grid-layout bedrock-style-icons bedrock-style-padding-margin bedrock-style-buttons bedrock-style-text-alignment">
            data-table-row[header] {
                display: none;
            } 
            data-table-row:not([header]) {
                color: var(--palette-dark, #1a2028);
                font-size: var(--default-font-size, 12px);
                height: 100%;
                background-color: var(--palette-white, #ffffff);
            }        
            data-table-row:not([header]):hover,
            data-table-row[selected] {
                background-color: var(--table-row-selected-color, #c1cad4) !important;
            }        
            data-table-row:not([header]):hover data-table-checkbox,
            data-table-row[selected] data-table-checkbox {
                background-color: var(--palette-white, #ffffff) !important;
            }
            pebble-data-table {
                /*width: 50%;*/
                /**
                * TODO: Giving min-height to pebble-data-table is a temporary fix. 
                * Since pebble-data-table is not required here
                * as number of rows are static and its always one row.
                * Pebble-data-table should be removed and keep required controls.
                * */
                min-height: 70px;
                --data-table-container-position: relative;
                --pebble-data-table-header : {
                    display: none;
                };
                --list:{
                    min-height:70px;
                }           
            }

            data-table-cell {
                height: 35px;
                padding-left: 20px;
                padding-right: 0;
                position: relative;
                flex-basis: auto!important;
            }
            data-table-cell #iconDiv {
                position: absolute;
                right: 6px;
                bottom: 5px;
            }
            data-table-cell #inputDiv {
                width: 100%;
            }
            .actionButtons {
                text-align: center;
            }
            pebble-textbox {
                --paper-input-container: {
                    padding-top: 0px;
                    padding-right: 0px;
                    padding-bottom: 0px;
                    padding-left: 0px;
                    position: relative;
                }
            }        
            #inputDiv  pebble-textbox {
                --pebble-textbox-paper-input-style : {  
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    width: 90%;
                }
            }
            .workflowGridContainer {
                padding: 0 25% 0 25%;
            }
        </style>
        <pebble-spinner active="[[_loading]]"></pebble-spinner>
        <div class="text-center">[[_message]]</div>
        <liquid-entity-model-get id="getWorkflowDefinition" operation="getbyids" request-id="req1" on-response="_onDefinitionReceived" on-error="_onDefinitionGetFailed"></liquid-entity-model-get>
        <template is="dom-if" if="[[_enableWorkflowSelection]]">
            <div class="workflowGridContainer base-grid-structure-child-2">
                <div class="p-10">
                    <pebble-data-table id="workflow-grid" items="[[workflowGridData]]">
                        <data-table-column slot="column-slot">
                            <template>
                                <div id="inputDiv" slot="cell-slot-content">
                                    <pebble-textbox readonly="" id="workflow-text" value="[[item.name]]" no-label-float="true"></pebble-textbox>
                                </div>
                                <div id="iconDiv" slot="cell-slot-content">
                                    <pebble-icon class="dropdown-icon pebble-icon-size-10" id="wtxtDropdownIcon" icon="pebble-icon:navigation-action-down" on-tap="_openWorkflowModelLov"></pebble-icon>
                                </div>
                            </template>
                        </data-table-column>
                        <data-table-column slot="column-slot">
                            <template>
                                <div id="inputDiv" slot="cell-slot-content">
                                    <pebble-textbox readonly="" id="activity-text" value="[[item.value]]" no-label-float="true"></pebble-textbox>
                                </div>
                            </template>
                        </data-table-column>
                    </pebble-data-table>
                </div>
                <pebble-popover id="workflowPopover" for="workflow-text" no-overlap="" vertical-align="auto" horizontal-align="auto">
                    <pebble-lov id="workflowModelLov" items="[[_workflowModels]]" on-selection-changed="_onWorkflowLovSelectionChanged"></pebble-lov>
                </pebble-popover>
            </div>
            <div id="buttonContainer" class="buttonContainer-static">
                <pebble-button id="cancelButton" class="btn btn-secondary m-r-5" button-text="Cancel" on-tap="_onCancelTap" elevation="1" raised=""></pebble-button>
                <pebble-button id="next" class="focus btn btn-success" button-text="Next" on-tap="_onNextTap" elevation="1" raised=""></pebble-button>
            </div>
        </template>
`;
  }

  static get is() { return 'rock-workflow-selector' }

  static get properties() {
      return {
          selectedEntities: {
              type: Array,
              value: function() {
                  return {};
              }
          },
          contextData: {
              type: Object,
              value: function() {
                  return {};
              }
          },
          workflowInfo: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          workflowGridData:{
              type: Array,
              value: function () {
                  return [
                      {
                          "name": "",
                          "value": ""
                      }    
                  ];
              } 
          },
          _workflowModels: {
              type: Array,
              value:function(){
                  return [];
              }
          },
          assignmentAction: {
              type: String,
              value: ""
          },
          workflowName: {
              type: String,
              value: ""
          },
          /**
          * Represents workflow external name
          */
          workflowExternalName: {
              type: String,
              value: ""
          },
          /**
          * Represents workflow activity name
          */
          workflowActivityName: {
              type: String,
              value: ""
          },
          /**
          * Represents workflow activity external name
          */
          workflowActivityExternalName: {
              type: String,
              value: ""
          },
          allowedRoles: {
              type: Array,
              value: function() {
                  return [];
              }
          },
          currentUser: {
              type: String,
              value: ""
          },
          userToBeAssigned: {
              type:Object,
              value: function() {
                  return {};
              }
          },
          _loading: {
              type: Boolean,
              value: true
          },
          _message: {
              type: String
          },
          _enableWorkflowSelection: {
              type: Boolean,
              value: false
          },
          _selectedWorkflowData: {
              type: Object,
              value: function() {
                  return {};
              }
          },
          workflowContext: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          isSingleEntityProcess: {
              type: Boolean,
              value: false
          },
          contextModelType: {
              type: String,
              value: ""
          }
      }
  }

  static get observers() {
      return [
          '_workflowDataChanaged(contextData, workflowInfo)'
      ]
  }

  connectedCallback() {
      super.connectedCallback();
  }

  _workflowDataChanaged(contextData, workflowInfo) {
      if(!_.isEmpty(contextData) && !_.isEmpty(workflowInfo)) {
          let foundWorkflowNames = this._getWorkflowNames(workflowInfo);
          this._message = "Setting up the workflow Data...";
          let firstItemContext = ContextHelper.getFirstItemContext(contextData) || {};
          firstItemContext.workflowNames = foundWorkflowNames;

          let workflowDefGetRequest = DataRequestHelper.createWorkflowDefinitionGetRequest(contextData);
          let workflowDefGetLiquid = this.shadowRoot.querySelector("#getWorkflowDefinition");
          if(workflowDefGetLiquid) {
              workflowDefGetLiquid.requestData = workflowDefGetRequest;
              workflowDefGetLiquid.generateRequest();
          }
      }
  }

  _getEntityName() {
      if (!_.isEmpty(this.contextData)) {
          let itemContext = ContextHelper.getFirstItemContext(this.contextData);
          return itemContext.name || "";
      }
  }

  _getWorkflowNames(workflowInfo) {
      let workflowNames = [];
      for(let idx = 0; idx < workflowInfo.length; idx++) {
          let wfName = workflowInfo[idx].name;
          workflowNames.push(wfName);
      }

      return workflowNames;
  }

  _onDefinitionReceived(e) {
      let workflowDefinitionResponse = e.detail.response;
      if(DataHelper.isValidObjectPath(workflowDefinitionResponse, "content.entityModels") && workflowDefinitionResponse.content.entityModels.length > 0) {
          let entityModels = workflowDefinitionResponse.content.entityModels;
          this._prepareWorkflowLovData(entityModels);
      }
  }

  _onDefinitionGetFailed(e) {
      Base._error('workflow definition get failed with error ', e.detail);
  }

  _prepareWorkflowLovData(entityModels) {
      let workflowLovData = [];
      for(let wfIdx = 0; wfIdx < this.workflowInfo.length; wfIdx++) {
          let workflowData = this.workflowInfo[wfIdx];
          let wfName = workflowData.name;
          let wfActivityName = workflowData.activityName;
          let wfExternalName = undefined;
          let wfActivityExternalName  = undefined;
          let allowedRoles  = undefined;
          let assignedUser = workflowData.activityAssignedUser;
          let defModel = entityModels.find(obj => obj.name === wfName);
          if(DataHelper.isValidObjectPath(defModel, "data.attributes.activities.group") && defModel.data.attributes.activities.group.length > 0) {
              wfExternalName = AttributeHelper.getFirstAttributeValue(defModel.data.attributes.workflowName);
              let group = defModel.data.attributes.activities.group;
              let activityRow = group.find(function(obj) {
                  if(AttributeHelper.getFirstAttributeValue(obj.activityName) === wfActivityName) {
                      return obj;
                  }
              });

              if(activityRow) {
                  wfActivityExternalName = AttributeHelper.getFirstAttributeValue(activityRow.externalName);
                  allowedRoles = DataHelper.isValidObjectPath(activityRow, "allowedRoles.values") && AttributeHelper.getAttributeValues(activityRow.allowedRoles.values);

                  let workflowRowData = {
                      name: wfName,
                      title: wfExternalName,
                      data: {
                          wfName : wfName,
                          wfExternalName: wfExternalName,
                          wfActivityName: wfActivityName,
                          wfActivityExternalName: wfActivityExternalName,
                          allowedRoles: allowedRoles,
                          assignedUser: assignedUser
                      }
                  }

                  workflowLovData.push(workflowRowData);
              }
          }
      }

      this.set("_workflowModels", workflowLovData);

      if(this._workflowModels && this._workflowModels.length == 1) {
          this._selectedWorkflowData = this._workflowModels[0].data;
          this._onNextTap();
      } else {
          this._message = "Select workflow for assignment.";
          this._enableWorkflowSelection = true;
          this._loading = false;
      }
  }

  _openWorkflowModelLov(e) {
      let popover = this.shadowRoot.querySelector("#workflowPopover");
      if(popover) {
          popover.show();
      }
  }

  _onWorkflowLovSelectionChanged(e) {
      let wfTxtBox = this.root.querySelector("#workflow-text");
      let wfActivityTxtbox = this.root.querySelector("#activity-text");
      if(!wfTxtBox) {
          wfTxtBox = this.shadowRoot.querySelector("#workflow-text");
      }
      if(!wfActivityTxtbox) {
          wfActivityTxtbox = this.shadowRoot.querySelector("#activity-text");
      }

      if(DataHelper.isValidObjectPath(e, "detail.item.data")) {
          if(wfTxtBox) {
              wfTxtBox.value = e.detail.item.data.wfExternalName;
          }

          if(wfActivityTxtbox) {
              wfActivityTxtbox.value = e.detail.item.data.wfActivityExternalName;
          }
      }

      let popover = this.shadowRoot.querySelector("#workflowPopover");
      if(popover) {
          popover.hide();
      }
  }

  _onNextTap(e) {
      if(_.isEmpty(this._selectedWorkflowData)) {
          let workflowModelLov = this.shadowRoot.querySelector("#workflowModelLov");

          if(workflowModelLov) {
              this._selectedWorkflowData = workflowModelLov.selectedItem ? workflowModelLov.selectedItem.data : {};
          }
      }

      if(!_.isEmpty(this._selectedWorkflowData)) {
          let eventData = {};

          if(this.assignmentAction !== "reassign") {
              eventData["skipNext"] = true;
              let loggedUser = ContextHelper.getFirstUserContext(this.contextData);
              let userToBeAssigned = {};
              if(loggedUser && loggedUser.user){
                  userToBeAssigned["id"] = loggedUser.user;
                  this.set("userToBeAssigned", userToBeAssigned);
              }
          }

          let selectedWorkflowInfo = this.workflowInfo.find(obj => obj.name === this._selectedWorkflowData.wfName);
          let selectedWorkflowContext = selectedWorkflowInfo ? selectedWorkflowInfo.context : {};

          this.set("workflowName", this._selectedWorkflowData.wfName);
          this.set("workflowExternalName", this._selectedWorkflowData.wfExternalName);
          this.set("workflowActivityName", this._selectedWorkflowData.wfActivityName);
          this.set("workflowActivityExternalName", this._selectedWorkflowData.wfActivityExternalName);
          this.set("allowedRoles", this._selectedWorkflowData.allowedRoles);
          this.set("currentUser", this._selectedWorkflowData.assignedUser);
          this.set("workflowContext", selectedWorkflowContext);

          let activeBusinessFunctionDialog = RUFUtilities.activeBusinessFunctionDialog;
          if(activeBusinessFunctionDialog && activeBusinessFunctionDialog.setTitle) {
              let dialogTitle = activeBusinessFunctionDialog.title;
              dialogTitle = DataHelper.concatValuesFromArray([
                  dialogTitle,
                  this.workflowExternalName,
                  this.workflowActivityExternalName,
                  ContextHelper.getDataContexts(this.contextData),
                  this.isSingleEntityProcess ? this._getEntityName() : this.selectedEntities.length + " entities"
              ]);
              activeBusinessFunctionDialog.setTitle(dialogTitle);
          }

          let eventName = "onNext";
          let eventDetail = {
              name: eventName,
              data: eventData
          }

          this._loading = false;
          this.fireBedrockEvent(eventName, eventDetail, {
              ignoreId: true
          });
      } else {
          this.showWarningToast("Select a workflow for changing assignment.");
      }
  }

  _onCancelTap() {
      let eventName = "onCancel";
      this.fireBedrockEvent(eventName, {}, {
          ignoreId: true
      });
  }
}

customElements.define(RockWorkflowSelector.is, RockWorkflowSelector);
