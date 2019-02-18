import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-buttons.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import '../bedrock-style-manager/styles/bedrock-style-scroll-bar.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../liquid-rest/liquid-rest.js';
import '../pebble-spinner/pebble-spinner.js';
import '../pebble-card/pebble-card.js';
import '../pebble-accordion/pebble-accordion.js';
import '../pebble-dialog/pebble-dialog.js';
import '../rock-bulk-edit-grid/rock-bulk-edit-grid.js';
import '../rock-attribute-list/rock-attribute-list.js';
import '../rock-scope-selector/rock-scope-selector.js';
import '../rock-component-config-behavior/rock-component-config-behavior.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import EntityModelManager from '../bedrock-managers/entity-model-manager.js';
class RockEntityBulkEdit extends mixinBehaviors([RUFBehaviors.UIBehavior,
RUFBehaviors.ComponentContextBehavior, RUFBehaviors.ComponentConfigBehavior], PolymerElement) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-scroll-bar bedrock-style-grid-layout bedrock-style-padding-margin bedrock-style-buttons">
            :host {
                display: block;
                height: 100%;
                --attribute-list-content: {
                    height: 150px/* nested grid temp fix need to think new approach to show nested grid*/
                }
            }

            #container {
                @apply --layout-horizontal;
                height: 100%;
                overflow-x: hidden;
                overflow-y: auto;
            }

            #left-container,
            #right-container {
                width: 50%;
                min-height: 200px;
            }

            .message {
                text-align: center;
            }

            #card {
                height: 100%;
                padding-bottom: 20px;
            }

            #attributes-card {
                height: 100%;
                padding-bottom: 20px;
                padding-left: 20px;
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
                    overflow: hidden;
                }
            }

            .card-content {
                height: 100%;
                overflow: hidden;
            }
            .overflow-auto-y {
                overflow-x: hidden;
                overflow-y: auto;
            }
        </style>
        <pebble-spinner active="[[_loading]]"></pebble-spinner>
        <div class="base-grid-structure">
            <div class="base-grid-structure-child-1">
                <div class="message">[[_message]]</div>
            </div>
            <div class="base-grid-structure-child-2">
                <div class="base-grid-structure overflow-auto-y button-siblings">
                    <div class="base-grid-structure-child-1">
                        <liquid-rest id="bulkEntityEdit" url="/data/pass-through/bulkentityservice/createtask" method="POST" request-data="{{_bulkEntityEditRequest}}" on-liquid-response="_onBulkEntityEditSuccess" on-liquid-error="_onBulkEntityEditFailure"></liquid-rest>
                        <pebble-card id="card" no-header="">
                            <rock-scope-selector id="scopeSelector" selected-scope="[[_selectedItems]]" context-data="[[contextData]]" scope-tags-actions-settings="[[scopeTagsActionsSettings]]" show-title="" allow-manage-scope="" show-settings="" slot="pebble-card-content">
                            </rock-scope-selector>
                            <bedrock-pubsub event-name="rock-scope-click" handler="_onScopeTagClicked"></bedrock-pubsub>
                        </pebble-card>
                    </div>
                    <div class="base-grid-structure-child-2">
                        <div id="container">
                            <div id="left-container">
                                <pebble-card id="card" no-header="">
                                    <rock-bulk-edit-grid id="attributesGrid" context-data="[[contextData]]" selected-items="[[_selectedItems]]" config="[[_gridConfig]]" edit-attributes-only="[[editAttributesOnly]]" edit-relationship-attributes-only="[[editRelationshipAttributesOnly]]" slot="pebble-card-content"></rock-bulk-edit-grid>
                                </pebble-card>
                                <bedrock-pubsub event-name="grid-selecting-item" handler="_onSelectingGridItem" target-id="attributeModelGrid"></bedrock-pubsub>
                                <bedrock-pubsub event-name="grid-deselecting-item" handler="_onDeSelectingGridItem" target-id="attributeModelGrid"></bedrock-pubsub>
                            </div>
                            <div id="right-container">
                                <pebble-card id="attributes-card" no-header="">
                                    <pebble-accordion header-text="[[groupName]]" slot="pebble-card-content">
                                        <div slot="accordion-content" class="full-height">
                                            <rock-attribute-list id="attributeList" group-name="" context-data="[[contextData]]" no-of-columns="1" mode="edit" attribute-values="[[_attributeValues]]" attribute-models="[[_attributeModels]]" dependent-attribute-values="[[_attributeValues]]" dependent-attribute-models="[[_attributeModels]]" show-delete-icon="" hide-history="[[hideHistory]]" apply-locale-coalesce="true"></rock-attribute-list>
                                        </div>
                                    </pebble-accordion>
                                </pebble-card>
                                <bedrock-pubsub event-name="attribute-control-delete" handler="_onAttributeControlDelete" target-id=""></bedrock-pubsub>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="buttonContainer" align="center" class="buttonContainer-static">
                    <pebble-button id="cancel" class="btn btn-secondary m-r-5" button-text="Cancel" on-tap="_onCancelTap" elevation="1" raised=""></pebble-button>
                    <pebble-button id="reset" class="btn btn-primary m-r-5" button-text="Reset" on-tap="_onResetTap" elevation="1" raised=""></pebble-button>
                    <pebble-button id="save" class="focus btn btn-success" button-text="Save" on-tap="_onSaveTap" elevation="1" raised=""></pebble-button>
                </div>
            </div>
        </div>
        <pebble-dialog id="cancelDialog" dialog-title="Confirmation" modal="" alert-box="" show-cancel="" show-ok="" no-cancel-on-outside-click="" no-cancel-on-esc-key="">
            <p>Are you sure you want to discard the unsaved changes.</p>
        </pebble-dialog>
        <bedrock-pubsub event-name="on-buttonok-clicked" handler="_revertAll" target-id="cancelDialog"></bedrock-pubsub>
        <pebble-dialog id="clearValueDialog" dialog-title="Confirmation" modal="" alert-box="" show-cancel="" show-ok="" button-cancel-text="No, do not clear" button-ok-text="Yes, clear from all entities" no-cancel-on-outside-click="" no-cancel-on-esc-key="">
            <p>Do you want to clear values from all selected entities?</p>
        </pebble-dialog>
        <bedrock-pubsub event-name="on-buttoncancel-clicked" handler="_cancelClearValue" target-id="clearValueDialog"></bedrock-pubsub>
        <bedrock-pubsub event-name="attribute-value-cleared" handler="_onClearValue" target-id=""></bedrock-pubsub>
`;
  }

  static get is() {
      return "rock-entity-bulk-edit";
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

          workflowCriterion: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          _attributeValues: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          _selectedItems: {
              type: Array,
              value: function () { return []; }
          },

          _attributeModels: {
              type: Object,
              value: function () {
                  return {};
              }
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

          _bulkEntityEditRequest: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          _loading: {
              type: Boolean,
              value: false
          },

          _gridConfig: {
              type: Object
          },

          _request: {
              type: Object
          },

          groupName: {
              type: String,
              value: "Selected Attributes"
          },

          editRelationshipAttributesOnly: {
              type: Boolean,
              value: false
          },

          editAttributesOnly: {
              type: Boolean,
              value: false
          },

          originalEntity: {
              type: Object,
              value: function () { return {}; }
          },

          relationship: {
              type: String,
              value: ""
          },

          // hide icons in scope selection
          scopeTagsActionsSettings: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          hideHistory:{
              type:Boolean,
              value:false
          },
          _clearValueAttributeObject:{
              type:Object,
              value: function(){
                  return {};
              }
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

  _onContextDataChange() {
      if (!_.isEmpty(this.contextData)) {
          if (!_.isEmpty(this.contextData)) {
              let context = DataHelper.cloneObject(this.contextData);
              //App specific
              let appName = ComponentHelper.getCurrentActiveAppName();
              if (appName) {
                  context[ContextHelper.CONTEXT_TYPE_APP] = [{
                      "app": appName
                  }];
              }
              this.requestConfig("rock-wizard-entity-bulk-edit", context);
          }
      }
  }

  onConfigLoaded(componentConfig) {
      if (componentConfig && componentConfig.config) {
          let gridConfig = componentConfig.config.gridConfig;
          let requestData = componentConfig.config.requestData;
          let fields = DataHelper.convertObjectToArray(gridConfig.itemConfig.fields);
          gridConfig.itemConfig.fields = fields;
          this._gridConfig = gridConfig;
          this._request = requestData;
      }
  }
  _onClearValue(ev){
    this._clearValueAttributeObject = ev.detail;
    this.$$("#clearValueDialog").open();
  }
  _cancelClearValue(e){
    delete this._clearValueAttributeObject.action;
    this.set("_clearValueAttributeObject.value", "");
    this.set("_clearValueAttributeObject.referenceDataId", "");
  }
  async _onSelectingGridItem(e, detail) {
      let selectedItem = detail.item;
      if (!(this._selectedItems.find(obj => obj.name === selectedItem.name))) {
          this._selectedItems.push(selectedItem);
      }
      selectedItem["hasWritePermission"] = true;
      await this._updateNestedChildAttributes(selectedItem);
      if (!this._attributeModels[selectedItem.name]) {
          this._attributeModels[selectedItem.name] = selectedItem;
          let values = DataTransformHelper.transformAttributes({}, this._attributeModels, this.contextData, "array", true);
          let value = values.find(obj => obj.name === selectedItem.name);
          value.isBulkEdit = true;
          if (value) {
              this.push("_attributeValues", value);
          }
      }
  }

  async _updateNestedChildAttributes(selectedItem){
    if(selectedItem && selectedItem.dataType && selectedItem.dataType == "nested" && !selectedItem.group){
        let entityModelManager = new EntityModelManager();
        let request = DataRequestHelper.createGetAttributeModelRequest(selectedItem.childAttributes);
        let childAttributeModels = {};
        if(entityModelManager && request) {
            childAttributeModels = await entityModelManager.get(request);
        }
        if(!_.isEmpty(childAttributeModels)){
            let childAttrModelObj = {};
            childAttributeModels.forEach((elem) => {
                childAttrModelObj[elem.name] = elem;
            });
            let attributeDataModels = {"data": {"attributes":childAttrModelObj}};
            let attributeModels = DataTransformHelper.transformAttributeModels(attributeDataModels, {});
                    
            selectedItem.group = [childAttrModelObj];
        }
    }
}

  _onDeSelectingGridItem(e, detail) {
      let deSelectedItem = detail.item;
      if (this._selectedItems.find(obj => obj.name === deSelectedItem.name)) {
          let index = this._selectedItems.indexOf(deSelectedItem);
          this._selectedItems.splice(index, 1);
      }
      if (this._attributeModels[deSelectedItem.name]) {
          delete this._attributeModels[deSelectedItem.name];
      }
      let attr = this._attributeValues.find(obj => obj.name === deSelectedItem.name);
      if (attr) {
          let index = this._attributeValues.indexOf(attr);
          if (index !== -1) {
              this.splice("_attributeValues", index, 1);
          }
      }
  }

  async _onScopeTagClicked(e, detail) {

      if (detail && detail.data) {
          let attributesGrid = this.shadowRoot.querySelector("#attributesGrid");

          attributesGrid.clearSelection();
          this._selectedItems = [];
          let scopeItems = detail.data.scope;
          let gridItems = attributesGrid.getData();
          //Since loading attributeModels instead of compositeModel no need to filter context attributes
          this._selectedItems = scopeItems;
          attributesGrid.selectItems(this._selectedItems);
          this._attributeModels = {};
          for (let i = 0; i < this._selectedItems.length; i++) {
              let selectedItem = this._selectedItems[i];
              selectedItem["hasWritePermission"] = true;
              await this._updateNestedChildAttributes(selectedItem);
              if (!this._attributeModels[selectedItem.name]) {
                  this._attributeModels[selectedItem.name] = selectedItem;
              }
          }
          let values = DataTransformHelper.transformAttributes({}, this._attributeModels, this.contextData, "array", true);
          if(!_.isEmpty(values)){
            values.forEach( value => {
                value.isBulkEdit = true;
            })
          }
          this._resetListGroupName(detail.data.name);
          this._attributeValues = values;
      }
  }

  _onCancelTap(e) {
      let attributeList = this.$$("#attributeList");
      if (attributeList.getIsDirty()) {
          this.$$("#cancelDialog").open();
      } else {
          this._revertAll();
      }
  }

  _revertAll() {
      let eventName = "onCancel";
      let eventDetail = {
          name: eventName
      }

      this.fireBedrockEvent(eventName, eventDetail, {
          ignoreId: true
      });
  }
  _isEmptyValue(value) {
        if (typeof (value) === "string") {
            return value === "" || value.trim().length === 0;
        } else {
            return _.isEmpty(value);
        }
  }
  async _onSaveTap(e) {
      if (!_.isEmpty(this.selectionQuery)) {
          this._loading = true;

          let attributeList = this.shadowRoot.querySelector("#attributeList");
          let changedAttributeElements = attributeList.getChangedAttributeElements();
          if (changedAttributeElements == undefined || changedAttributeElements.length == 0) {
              this.showInformationToast("No changes to save.");
              this._loading = false;
              return;
          }

          let attributesJSON = [];
          for (let i = 0; i < changedAttributeElements.length; i++) {
              let attributeElement = changedAttributeElements[i];
              let attributeJSON;
              if (attributeElement.attributeObject.action == "delete" || this._isEmptyValue(
                attributeElement.attributeObject.value)) {
                let isNullValue = attributeElement.attributeObject.isNullValue;
                attributeJSON = DataHelper.cloneObject(attributeElement.originalAttributeObject);
                if(isNullValue) {
                    if(_.isArray(attributeJSON.value)) {
                        attributeJSON.value = [ConstantHelper.NULL_VALUE];
                    } else {
                        attributeJSON.value = ConstantHelper.NULL_VALUE;
                    }
                }
                attributeJSON.action = "delete";
              } else {
                  attributeJSON = attributeElement.attributeObject;
                  if (attributeElement.attributeModelObject && attributeElement.attributeModelObject
                    .referenceEntityTypes) {
                    let attributeRefEntityTypes = attributeElement.attributeModelObject
                        .referenceEntityTypes;
                    if (attributeRefEntityTypes instanceof Array &&
                        attributeRefEntityTypes.length > 0) {
                        attributeJSON.referenceEntityType = attributeRefEntityTypes[0];
                    }
                }
              }
              attributesJSON.push(attributeJSON);
          }

          let newEntity = {};
          let firstValueContext = this.getFirstValueContext();

          if (this.editAttributesOnly) {
              let firstDataContext = ContextHelper.getFirstDataContext(this.contextData);
              if (!_.isEmpty(firstDataContext)) {
                attributesJSON.forEach( (attribute) => {
                    delete attribute.selfContext;
                })
              }
              newEntity = await DataTransformHelper.prepareEntityForAttributesSave({}, attributesJSON, this.contextData, this._attributeModels);
          } else if (this.editRelationshipAttributesOnly) {
              newEntity = DataHelper.cloneObject(this.originalEntity);
              let relationships = EntityHelper.getRelationshipByType(newEntity, this.getFirstDataContext(), this.relationship, true);

              let attributes = {};
              for (let i = 0; i < attributesJSON.length; i++) {
                  let attributeJSON = attributesJSON[i];
                  let attr = DataTransformHelper.createAttributeInstance(attributeJSON, firstValueContext);
                  attributes[attributeJSON.name] = attr;
              }

              let modifiedRelationships = [];
              for (let i = 0; i < this.selectedEntities.length; i++) {
                  let selectedEntity = this.selectedEntities[i];
                  let relationship = relationships.find(obj => obj.relTo.id === selectedEntity.id);
                  if (relationship) {
                      let modifiedRel = {
                          "attributes": attributes,
                          "relTo": {
                              "id": relationship.relTo.id,
                              "type": relationship.relTo.type
                          }
                      }
                      modifiedRelationships.push(modifiedRel);
                  }
              }

              if (newEntity.data) {
                  newEntity.data.relationships = newEntity.data.relationships || {};
                  newEntity.data.relationships[this.relationship] = modifiedRelationships;
                  delete newEntity.data.attributes;
                  delete newEntity.data.contexts;
              }
          }
          
          let data = newEntity.data ? newEntity.data : {};
          let req = {
              "params": {
                  "operationType": "inboundService",
                  "data": data
              }
          };

          //Add hotline flag if hotline is enabled
          if (DataHelper.isHotlineModeEnabled()) {
              req.hotline = true;
          }

          const bulkEditLiquid = this.shadowRoot.querySelector("#bulkEntityEdit");

          if (this.selectionQuery.ids) {
              req.params.taskType = "process-query";
              req.params.query = this.selectionQuery;
          } else {
              if (_.isEmpty(this.workflowCriterion) || this.workflowCriterion == "undefined") {
                  req.params.taskType = "process-query";
                  req.params.query = this.selectionQuery.params ? this.selectionQuery.params.query : this.selectionQuery;
              } else {
                  bulkEditLiquid.url = "/data/pass-through-combined-query/bulkentityservice/createtask";
                  req.params.taskType = "process-multi-query";
                  req.entities = [this.selectionQuery.entity];
              }
          }

          //Add clientAttributes
          let valueContext = ContextHelper.getFirstValueContext(this.contextData);
          let userContext = ContextHelper.getFirstUserContext(this.contextData);
          let clientMessage = "Bulk attributes edit";

          req.clientAttributes = {
              "taskName": {
                  "values": [{
                      "source": valueContext.source,
                      "locale": valueContext.locale,
                      "value": clientMessage
                  }]
              }
          };

          this.set("_bulkEntityEditRequest", req);
          bulkEditLiquid.generateRequest();
      }
  }

  _onBulkEntityEditSuccess(e) {
      let response = e.detail.response && e.detail.response.response ? e.detail.response.response : e.detail.response;
      let request = e.detail.response ? e.detail.response.request : undefined;

      if ((!response || _.isEmpty(response)) ||
          (DataHelper.isValidObjectPath(response, "dataObjectOperationResponse.status") && response.dataObjectOperationResponse.status.toLowerCase() == "error") ||
          (response.status && response.status.toLowerCase() == "error")) {
          this.logError("rock-entity-bulk-edit - Bulk edit of entities failed", e.detail);
          this._message = "Bulk edit request failed";
          this._loading = false;
          return;
      } else {
          if (response.status && response.status.toLowerCase() == "success") {
              if (request && request.taskId) {
                  this._taskId = request.taskId;
              }
          }

          this._message = "Bulk Edit request triggered successfully";
          this._triggerFinishStep();
      }
  }

  _onBulkEntityEditFailure(e) {
      this._loading = false;
      this._message = "Failed to perform the Bulk entity edit. Contact administrator.";
      this.logError("rock-entity-bulk-edit - Buld edit of entities failed", e.detail);
  }

  _triggerFinishStep() {
      let message = "Entity process is started, you can review the progress of the task " + this._taskId + " in task details.";
      let messages = [
          {
              "message": message
          }
      ]
      let actions = [
          {
              "name": "goBack",
              "text": "Take me back to where I started",
              "isNotApp": true
          },
          {
              "name": "gotoJobDetails",
              "text": "Show me the task details",
              "isNotApp": true,
              "dataRoute": "task-detail",
              "queryParams": {
                  "id": this._taskId
              }
          }
      ];

      let data = {
          "messages": messages,
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

  _resetListGroupName(groupName) {
      if (groupName) {
          this.set("groupName", groupName);
      } else {
          this.set("groupName", "Selected Attributes");
      }
  }

  _onResetTap(e) {
      this._selectedItems = [];
      this._attributeModels = {};
      this.shadowRoot.querySelector("#attributesGrid").clearSelection();
      this._resetListGroupName();
      this._attributeValues = [];
  }

  _onAttributeControlDelete(e, detail) {
      let attribute = detail.data;
      let grid = this.shadowRoot.querySelector("#attributesGrid");
      let selectedItems = grid.getSelectedItems();
      let item = selectedItems.find(obj => obj.name === attribute.name);
      delete this._attributeModels[item.name];
      let selectedItem = this._selectedItems.find(obj => obj.name === item.name);
      if (selectedItem) {
          let index = this._selectedItems.indexOf(selectedItem);
          this._selectedItems.splice(index, 1);
      }
      grid.deselectItem(item);
  }
}

customElements.define(RockEntityBulkEdit.is, RockEntityBulkEdit);
