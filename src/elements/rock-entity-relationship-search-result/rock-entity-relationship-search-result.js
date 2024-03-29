/**
@group rock Elements
@element rock-entity-relationship-search-result
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '../bedrock-helpers/component-helper.js';
import '../pebble-toolbar/pebble-toolbar.js';
import '../pebble-spinner/pebble-spinner.js';
import '../rock-relationship-grid/rock-relationship-grid.js';
import '../rock-where-used-grid/rock-where-used-grid.js';
import '../rock-component-config-behavior/rock-component-config-behavior.js';
import '../liquid-entity-model-composite-get/liquid-entity-model-composite-get.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-logger-behavior/bedrock-logger-behavior.js';
import '../bedrock-toast-behavior/bedrock-toast-behavior.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockEntityRelationshipSearchResult
    extends mixinBehaviors([
        RUFBehaviors.AppBehavior,
        RUFBehaviors.ComponentContextBehavior,
        RUFBehaviors.ComponentConfigBehavior,
        RUFBehaviors.LoggerBehavior,
        RUFBehaviors.ToastBehavior
    ], PolymerElement) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-grid-layout">
            :host{
                display:block;
                height:100%;
            }
            #messageCard {
                text-align: center;
                padding: 15px;
                margin: 0 auto;
            }
        </style>
        <pebble-spinner active="[[_loading]]"></pebble-spinner>
        <div class="base-grid-structure">
            <div class="base-grid-structure-child-1">
                <div id="messageCard" hidden="[[!_isMessageAvailable]]"></div>
            </div>
            <div class="base-grid-structure-child-2">

                <template is="dom-if" if="{{hasComponentErrored(isComponentErrored)}}">
                    <div id="error-container"></div>
                </template>
                
                <template is="dom-if" if="{{!hasComponentErrored(isComponentErrored)}}">
                    <template is="dom-if" if="{{_isRelGridConfigAvailable(relGridConfig)}}">
                        <template is="dom-if" if="{{!_isUpdirection(relationship)}}">
                            <rock-relationship-grid id="entityRelationshipGrid_[[relationship]]" is-collapsed="{{isCollapsed}}" readonly="[[readonly]]" show-accordion="[[showAccordion]]" relationship="[[relationship]]" add-relationship-mode="[[_getRelationshipMode(_relConfig.addRelationConfig)]]" relationship-type="[[configContext.relationshipType]]" relationship-title="[[configContext.relationshipTitle]]" rel-req="[[requestObj]]" relationship-grid-config="[[relGridConfig]]" page-size="[[pageSize]]" domain="[[_getDomain(configContext, domain)]]" context-data="[[contextData]]" do-sync-validation="[[doSyncValidation]]" functional-mode="[[functionalMode]]" type-thumbnail-mapping="[[_typeThumbnailMapping]]" global-edit="{{globalEdit}}" add-relationship-grid-config="[[addRelationshipGridConfig]]" load-govern-data\$="[[loadGovernData]]" data-index\$="[[dataIndex]]" is-part-of-business-function="[[isPartOfBusinessFunction]]">
                            </rock-relationship-grid>
                        </template>
                        <template is="dom-if" if="{{_isUpdirection(relationship)}}">
                            <rock-where-used-grid id="entityRelationshipGrid_[[relationship]]" is-collapsed="{{isCollapsed}}" readonly="[[readonly]]" relationship="[[relationship]]" relationship-title="[[configContext.relationshipTitle]]" add-relationship-mode="[[_getRelationshipMode(_relConfig.addRelationConfig)]]" rel-req="[[requestObj]]" relationship-grid-config="[[relGridConfig]]" page-size="[[pageSize]]" context-data="[[contextData]]" do-sync-validation="[[doSyncValidation]]" global-edit="{{globalEdit}}" load-govern-data\$="[[loadGovernData]]" data-index\$="[[dataIndex]]" exclude-non-contextual="[[excludeNonContextual]]" show-accordion="[[showAccordion]]" is-part-of-business-function="[[isPartOfBusinessFunction]]">
                            </rock-where-used-grid>
                            <bedrock-pubsub event-name="govern-grid-action-click" handler="_onWorkflowActionTap" target-id="entityRelationshipGrid_[[relationship]]"></bedrock-pubsub>
                        </template>
                    </template>
                </template>    
            </div>            
        </div>
`;
  }

  static get is() { return 'rock-entity-relationship-search-result' }

  static get properties() {
      return {
          contextData: {
              type: Object,
              value: function () {
                  return {};
              },
              observer: '_onContextDataChange'
          },
          readonly: {
              type: Boolean,
              value: false
          },
          relationship: {
              type: String,
              value: null
          },
          domain: {
              type: String,
              value: null
          },
          configContext: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          relGridConfig: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _isMessageAvailable: {
              type: Boolean,
              value: false,
              notify: true
          },
          requestObj: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          doSyncValidation: {
              type: Boolean,
              value: true
          },
          messageCodeMapping: {
              type: Object,
              value: function () { return {}; }
          },
          functionalMode: {
              type: String,
              value: "default"
          },
          globalEdit: {
              type: Boolean,
              notify: false
          },
          showAccordion: {
              type: Boolean,
              notify: false
          },
          pageSize: {
              type: Number,
              value: 100
          },
          addRelationshipGridConfig: {
              type: Object,
              value: function () {
                  return {}
              }
          },
          relationshipItems: {
              type: Array,
              value: function () { return [] },
              observer: '_onRelationshipItemsChange'
          },
          dataIndex: {
              type: String,
              value: "entityData"
          },
          loadGovernData: {
              type: Boolean,
              value: true
          },
          _relatedEntityRequestTracker: {
              type: Number,
              value: 0
          },
          excludeNonContextual: {
              type: Boolean,
              value: false
          },
          _loading: {
              type: Boolean,
              value: false
          },
          _isAttrModelReqInitiated: {
              type: Boolean,
              value: false
          },
          isCollapsed:{
              type:Boolean,
              value:false,
              observer:'onAccordionEnd'
          },
          relatedEntityAttributeModel:{
              type: Object,
              value: function(){
                  return {};
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
          this._loading = true;
          let context = DataHelper.cloneObject(this.contextData);
          //App specific
          let appName = ComponentHelper.getCurrentActiveAppName();
          if (appName) {
              context[ContextHelper.CONTEXT_TYPE_APP] = [{
                  "app": appName
              }];
          }

          if (this.relationship) {
              let itemContext = ContextHelper.getFirstItemContext(context);
              if (!_.isEmpty(itemContext)) {
                  itemContext.relationship = this.relationship;
              } else {
                  context[ContextHelper.CONTEXT_TYPE_ITEM] = [{
                      "relationship": this.relationship
                  }];
              }
          }

          this.requestConfig('rock-entity-relationship-search-result', context);
      }
  }
  _onRelationshipItemsChange() {
      this.showAccordion = this.relationshipItems.length > 1;
  }
  onAccordionEnd(){
       if(this.isCollapsed){
           this.setAttribute('style', 'height:auto !important');
       }else{
           this.setAttribute('style', 'height:100%');
      }
  }
  _prepareAddRelationConfig(config) {
      if (config.addRelationshipMode && _.isEmpty(config.addRelationConfig)) {
          config.addRelationConfig = {
              "mode": config.addRelationshipMode
          }
      }
  }
  onConfigLoaded(componentConfig) {
      if (componentConfig && componentConfig.config) {
          if (!_.isEmpty(this.configContext) && this.configContext.direction == "up") {
              let config = this._getConfigForUpDirection(componentConfig.config);
              if (!config) {
                  this._loading = false;
                  return;
              }

              this._relConfig = config;
          } else {
              // //When entity type specific config needed on top of relType
              let config = componentConfig.config;
              // if(!_.isEmpty(config.changeInFields)) {
              //     var itemContext = ContextHelper.getFirstItemContext(this.contextData);
              //     if(config.changeInFields[itemContext.type]) {
              //         config.gridConfig.itemConfig.fields = config.changeInFields[itemContext.type].fields;
              //     }
              // }
              this._prepareAddRelationConfig(config); //Support backward compatibility
              this._relConfig = config;
          }
          //add asset configuration if any
          if (!_.isEmpty(componentConfig.config.addRelAssetConfig)) {
              this.addRelationshipGridConfig = componentConfig.config.addRelAssetConfig;
          }
          this.initiateRelationshipManage();
      } else {
          this._showMessage("Relationships are not configured for current entity type");
          this._loading = false;
          return;
      }
  }
  _getDomain() {
      if(!_.isEmpty(this.configContext) && this.configContext.domain) {
          return this.configContext.domain;
      } else {
          return this.domain;
      }
  }
  _showMessage(message) {
      this._isMessageAvailable = true;
      let messageDiv = this.$.messageCard;
      if (messageDiv) {
          messageDiv.textContent = message + ": " + this.configContext.relationshipTitle;
      }
  }
  _getConfigForUpDirection(config) {
      if (!_.isEmpty(config.upDirectionConfig) &&
          this.configContext.fromEntityType) {
          let upConfig = config.upDirectionConfig.gridConfig;

          if (upConfig.title && config.gridConfig) {
              config.gridConfig.title = upConfig.title;
          }
          if (upConfig.fields && (DataHelper.isValidObjectPath(config, 'gridConfig.itemConfig'))) {
              config.gridConfig.itemConfig.fields = upConfig.fields;
          }
          if (upConfig.lovTitlePattern && config.addRelLovConfig) {
              config.addRelLovConfig.titlePattern = upConfig.lovTitlePattern;
          }
          if(this.configContext.fromEntityType){
              config.fromEntityTypes = [this.configContext.fromEntityType];
          }
          
          if (this.configContext.direction) {
              config.direction = this.configContext.direction;
          }
          if (upConfig.viewMode && config.gridConfig) {
              config.gridConfig.viewMode = upConfig.viewMode;
          }
          if (upConfig.copyActionConfig) {
              config.copyActionConfig = upConfig.copyActionConfig;
          } else {
              delete config.copyActionConfig;
          }
          if (upConfig.governDataConfig) {
              config.governDataConfig = upConfig.governDataConfig;
          } else {
              delete config.governDataConfig;
          }
          if (upConfig.addRelationshipMode || upConfig.addRelationConfig) {
              if (_.isEmpty(upConfig.addRelationConfig)) {
                  config.addRelationConfig = {
                      "mode": upConfig.addRelationshipMode || "lov"
                  }
              } else {
                  config.addRelationConfig = upConfig.addRelationConfig;
              }
          } else {
              delete config.addRelationConfig
          }
          if (upConfig.addNewRelationConfig) {
              config.addNewRelationConfig = upConfig.addNewRelationConfig;
          } else {
              delete config.addNewRelationConfig;
          }
          if(config.upDirectionConfig.excludeNonContextual != undefined && !this.excludeNonContextual){
              this.excludeNonContextual = config.upDirectionConfig.excludeNonContextual
          }

          return config;
      } else {
          this._showMessage("Relationships are not configured for current entity type");
          this._loading = false;
          return;
      }
  }
  _isRelGridConfigAvailable(relGridConfig) {
      if (!_.isEmpty(relGridConfig)) {
          return true;
      }
      return false;
  }
  initiateRelationshipManage() {
      let gridConfig = this._relConfig.gridConfig;
      if (!_.isEmpty(gridConfig)) {
          let relatedEntityAttributes = [];
          let relationshipAttributes = [];

          //No fields
          if (_.isEmpty(gridConfig.itemConfig)) {
              this._loading = false;
              return;
          }

          if (gridConfig.viewMode == "Tabular") {
              let columns = DataHelper.convertObjectToArray(gridConfig.itemConfig.fields);
              if (columns) {
                  columns.forEach(function (col) {
                      if (col && (col.name != "Related Entity" || col.name != "From Entity" || col.name != "Entity Type")) {
                          if (col.isRelatedEntityAttribute || col.isFromEntityAttribute) {
                              relatedEntityAttributes.push(col.name);
                          } else {
                              relationshipAttributes.push(col.name);
                          }
                      }
                  }, this);
              }
          } else { //Tile or List
              let itemConfig = gridConfig.itemConfig;
              relatedEntityAttributes.push(itemConfig.image);
              relatedEntityAttributes.push(itemConfig.thumbnailId);
              relatedEntityAttributes.push(itemConfig.title);
              relatedEntityAttributes.push(itemConfig.subtitle);
              relatedEntityAttributes.push(itemConfig.id);
              relatedEntityAttributes.push("property_objectkey");

              let fields = DataHelper.convertObjectToArray(gridConfig.itemConfig.fields);

              //Sort details
              let sortDetails = gridConfig.itemConfig.sort;
              if (sortDetails && sortDetails.default) {
                  let sortDefaults = DataHelper.cloneObject(sortDetails.default);
                  for (let i = 0; i < sortDefaults.length; i++) {
                      if (!fields.find(obj => obj.name == sortDefaults[i].field)) {
                          sortDefaults[i].name = sortDefaults[i].field;
                          fields.push(sortDefaults[i]);
                      }
                  }
              }

              for (let i = 0; i < fields.length; i++) {
                  if (fields[i].isRelatedEntityAttribute) {
                      relatedEntityAttributes.push(fields[i].name);
                  } else {
                      relationshipAttributes.push(fields[i].name);

                  }
              }

              if (!this._relationshipTypeAndAttributes) {
                  this._relationshipTypeAndAttributes = {};
              }
          }

          this._relationshipTypeAndAttributes = {
              'relationshipAttributes': relationshipAttributes,
              'relatedEntityAttributes': relatedEntityAttributes
          }
          this._relConfig.relationshipTypeAndAttributes = this._relationshipTypeAndAttributes;

          if (this._relConfig.gridConfig && this._relConfig.gridConfig.itemConfig) {
              let columns = this._relConfig.gridConfig.itemConfig.fields;
              if (columns) {
                  for (let key in columns) {
                      if (columns[key].isRelatedEntityAttribute) {
                          columns[key].readOnly = true;
                      }
                  }
              }
          }

          this._prepareRequest();
          this._initiateRelationshipModelRequest(this.relationship, relationshipAttributes);
      } else {
          this._loading = false;
      }
  }

  _prepareRequest() {
      this.requestObj = {};
      let contextData = DataHelper.cloneObject(this.contextData);
      ContextHelper.addDefaultValContext(contextData);
      this.requestObj = DataRequestHelper.createEntityGetRequest(contextData);
  }
  _initiateRelationshipModelRequest(relationshipType, relationshipAttributes) {
      let compositeModelGetRequest = {};

      if (this._relConfig && this._relConfig.direction == "up") {
          let contextData = DataHelper.cloneObject(this.contextData);
          let itemContext = contextData[ContextHelper.CONTEXT_TYPE_ITEM][0];

          itemContext.attributeNames = [];
          itemContext.type = this._relConfig.fromEntityTypes[0];
          itemContext.relationships = [relationshipType];
          itemContext.relationshipAttributes = relationshipAttributes;

          compositeModelGetRequest = DataRequestHelper.createEntityModelCompositeGetRequest(contextData);
      } else {
          let itemContext = this.getFirstItemContext();

          itemContext.attributeNames = [];
          itemContext.relationships = [relationshipType];
          itemContext.relationshipAttributes = relationshipAttributes;

          compositeModelGetRequest = DataRequestHelper.createEntityModelCompositeGetRequest(this.contextData);
      }

      let modelCompositeGet = this.shadowRoot.querySelector('#rel_' + relationshipType);
      if (modelCompositeGet) {
          modelCompositeGet.generateRequest();
      } else {
          let liquidCustomElement = customElements.get("liquid-entity-model-composite-get");
          let liquidElement = new liquidCustomElement();
          liquidElement.name = relationshipType;
          liquidElement.id = "rel_" + relationshipType;

          liquidElement.requestData = compositeModelGetRequest;
          liquidElement.addEventListener("entity-model-composite-get-response", this._onRelationshipModelGetResponse.bind(this));
          this.shadowRoot.appendChild(liquidElement);
          setTimeout(() => {
              liquidElement.generateRequest();
          }, 10);
      }
  }
  _onRelationshipModelGetResponse(e) {
      if (e && e.detail && DataHelper.validateGetModelsResponse(e.detail.response)) {
          let relType = "";
          if (e.detail.request) {
              relType = e.detail.request.requestData.params.fields.relationships[0];
          }
          let compositeModel = e.detail.response.content.entityModels[0];
          if (relType && compositeModel && compositeModel.data) {
              let relationships = DataTransformHelper.transformRelationshipModels(compositeModel, this.contextData);
              DataHelper.prepareOwnershipBasedRelationships(relationships);
              if (relationships && relationships[relType] && relationships[relType].length) {
                  let rel = null;
                  for (let relationshipObj of relationships[relType]) {
                        if(DataHelper.isValidObjectPath(relationshipObj, 'properties.relatedEntityInfo')){
                          let ownership = relationshipObj.properties.relationshipOwnership
                          //Fall back ownership is needed when there is no ownership data(Happens for entity grap)
                          let fallBackOwnership = "owned";
                          let selectedRelOwnership = this.configContext.ownership;
                          //Composite model when returned for rel entity type which is where used, we need consider as owned to get the model
                          if(ownership !== selectedRelOwnership && selectedRelOwnership == "whereused"){
                            selectedRelOwnership= "owned";
                          }
                          if ((relType == this.configContext.relationshipTypeName) &&
                              (ownership == (selectedRelOwnership || fallBackOwnership))) {
                              rel = relationshipObj;
                              break;
                          }
                      }
                  }
                  if (rel) {
                      if (this._relConfig) {
                          this._relConfig.selfContext = relationships[relType].selfContext;
                          this._relConfig.relatedEntityModel = {};
                          this._relConfig.relatedEntityModel.relatedEntityAttributeModels = {};
                          this._relConfig.relationshipAttributeModels = {};
                          this._relConfig.relationshipModel = rel;
                      }
                      let relatedEntityInfo = [];
                      if (rel.properties && Object.keys(rel.properties).length) {
                          relatedEntityInfo = rel.properties.relatedEntityInfo;
                          if (relatedEntityInfo && relatedEntityInfo.length) {
                              this._relConfig.relatedEntityModel.relatedEntityContexts = relatedEntityInfo;
                              let relEntityTypes = relatedEntityInfo.map(function (relContext) {
                                  if (relContext.relEntityType) {
                                      return relContext.relEntityType;
                                  }
                              });
                              this._relConfig.relatedEntityTypes = relEntityTypes;
                          }
                          this._relConfig.gridConfig.description = this._relConfig.gridConfig.description || rel.properties.description;

                          let hasWritePermission = rel.properties.hasWritePermission;
                          let writePermission = true;
                          let itemContext = this.getFirstItemContext();
                          if (DataHelper.isValidObjectPath(itemContext, "permissionContext.writePermission")) {
                              writePermission = itemContext.permissionContext.writePermission;
                          }
                          if (writePermission === false) {
                              hasWritePermission = false;
                          }

                          if (this._relConfig.gridConfig) {
                              this._relConfig.gridConfig["hasWritePermission"] = hasWritePermission;
                          }
                          this._relConfig.relationshipAttributeModels = DataTransformHelper.transformRelationshipAttributeModels(rel, this.contextData, hasWritePermission);

                          if (this._relationshipTypeAndAttributes) {
                              let relatedEntityAttributes = this._relationshipTypeAndAttributes.relatedEntityAttributes;
                              if (relatedEntityAttributes && relatedEntityAttributes.length) {
                                  //Initiate attr model get
                                  this._initiateAttributeModelRequest(relType, relatedEntityInfo, relatedEntityAttributes);
                                  this._isAttrModelReqInitiated = true;
                              } else {
                                  this._relConfig.relatedEntityModel.relatedEntityAttributeModels = {};
                                  this.relGridConfig = this._relConfig;
                              }
                          }
                      }
                  }
                  else{
                      this.logError("Related entity information is not available", e, true);
                  }
              }
              else {
                this.logError("Relationship models not found", e, true);
              }
          } else {
              this.logError("Composite model not found", e, true);
          }
      } else {
          this.logError("Relationship model get request failed", e, true);
      }
      if(!this._isAttrModelReqInitiated) {
          this._loading = false;
      }
  }

  _initiateAttributeModelRequest(relationshipType, relatedEntityContexts, relatedEntityAttributes) {

      let clonedContextData = DataHelper.cloneObject(this.contextData);

      if (relatedEntityContexts) {
          relatedEntityContexts.forEach(function (relContext) {
              if (relContext) {

                  let itemContext = {
                      "type": relContext.relEntityType,
                      "attributeNames": relatedEntityAttributes
                  };
                  if(this.configContext.direction == "up"){
                      itemContext.type = this.configContext.fromEntityType;
                  }
                  clonedContextData[ContextHelper.CONTEXT_TYPE_ITEM] = [itemContext];

                  let req = DataRequestHelper.createEntityModelCompositeGetRequest(clonedContextData);

                  let modelCompositeGet = this.shadowRoot.querySelector('#attr_' + relContext.relEntityType);
                  if (modelCompositeGet) {
                      modelCompositeGet.generateRequest();
                  } else {
                      let liquidCustomElement = customElements.get("liquid-entity-model-composite-get");
                      let liquidElement = new liquidCustomElement();
                      liquidElement.name = relContext.relEntityType;
                      liquidElement.id = "attr_" + relContext.relEntityType;

                      liquidElement.requestData = req;
                      liquidElement.addEventListener("entity-model-composite-get-response", this._onRelatedEntityAttributeModelGetResponse.bind(this));
                      liquidElement.addEventListener("error", this._onRelatedEntityAttributeModelGetResponseFailed.bind(this));
                      this.shadowRoot.appendChild(liquidElement);
                      setTimeout(() => {
                          liquidElement.generateRequest();
                          this._relatedEntityRequestTracker++;
                      }, 10);
                  }
              }
          }, this);
      } else {
          this._loading = false;
      }
  }
  _onRelatedEntityAttributeModelGetResponse(e) {
      if (!this._typeThumbnailMapping) {
          this._typeThumbnailMapping = {};
      }
      
      this._relatedEntityRequestTracker--;
      let compositeModel;
      if (e && e.detail && DataHelper.validateGetModelsResponse(e.detail.response)) {
          compositeModel = e.detail.response.content.entityModels[0];
          let attributeModels = DataTransformHelper.transformAttributeModels(compositeModel, this.contextData);
          _.extend(this.relatedEntityAttributeModel, attributeModels);
          let properties = compositeModel.properties;

          if (properties.hasOwnProperty("defaultThumbnailId")) {
              this._typeThumbnailMapping[compositeModel.name] = properties.defaultThumbnailId;
          }

          if (this._relConfig && this.relatedEntityAttributeModel) {
              if (!("relatedEntityAttributeModels" in this._relConfig.relatedEntityModel)) {
                  this._relConfig.relatedEntityModel.relatedEntityAttributeModels = {};
              }
              Object.keys(this.relatedEntityAttributeModel).forEach(function (attrKey) {
                  if (!(attrKey in this._relConfig.relatedEntityModel.relatedEntityAttributeModels)) {
                      this._relConfig.relatedEntityModel.relatedEntityAttributeModels[attrKey] = this.relatedEntityAttributeModel[attrKey];
                  }
              }, this);
          }
      } else {
          this.logError("Failed to get model of related entity type:", e.detail, true);
      }

      if(_.isEmpty(this.relatedEntityAttributeModel)) {
          this.logError("Attribute models are not available for related entity in current context", e.detail);
      }

      /**
       * If no attributemodels present either in relationship or
       * related entity, then combined attributeModels will be empty.
       * For the rel grid schema we use, attributeModels are mandatory to render grid.
       * Even though relationship has entities, grid won't load.
       * In that case, getting attribute with 'isExternalName' flag from 
       * related entity model and pushing it to the relatedEntityAttributeModels
       * in relConfig and updating gridConfig accordingly just to render grid
       * */
      if(this._noAttributeModelsPresent()) {
          this._updateConfigWithAttributeModel(compositeModel);
      }

      if (this._relatedEntityRequestTracker == 0) {
          this.relGridConfig = this._relConfig;
          this._resetSpinner();
      }
  }
  _onRelatedEntityAttributeModelGetResponseFailed(e) {
      if (DataHelper.isValidObjectPath(e, "detail.request.requestData.params.query.name")) {
          //TODO:: Need to handle this message properly.
          this.logError("Failed to get model of related entity type:", e.detail, true);

      }
      this._relatedEntityRequestTracker--;
      if (this._relatedEntityRequestTracker == 0) {
          this.relGridConfig = this._relConfig;
          this._resetSpinner();
      }
  }
  _resetSpinner() {
      // After rel config update give a pause to stop spinner
      this.async(function () {
          this._loading = false;
      }, 1000);
  }
  _isUpdirection() {
      return this._relConfig && this._relConfig.direction == "up";
  }
  _onWorkflowActionTap(e, detail) {
      let selectedItems;
      let relationship = detail.data.relationship;
      let selectionMode = "count"; //set default
      let selectionQuery = {};

      const relationShipGrid = this.shadowRoot.querySelector(`rock-where-used-grid[id=entityRelationshipGrid_${relationship}`);

      if (relationShipGrid) {
          selectedItems = relationShipGrid.getSelectedItems();
      }

      //SelectedItems should not be blank, because using count
      if (_.isEmpty(selectedItems)) {
          this.showWarningToast("Select at least one entity for which you want to perform this action.");
          return;
      }

      //Workflow and activity name should be same for the selected items to process Transitions or Assignments
      if (!this._isSelectedItemsValid(selectedItems)) {
          this.showWarningToast("All selected entities should be under same workflow and activity to perform this action");
          return;
      }

      //Prepare selectedItems as per business function requirement
      let businessFunctionSelectedItems = [];
      let entityIds = [];
      let entityTypes = [];

      //Pick the workflow details from one of the selectedItems
      let wfDetails = {
          "workflowName": selectedItems[0].workflowName,
          "workflowLongName": selectedItems[0].workflowLongName,
          "activityName": selectedItems[0].activityName,
          "activityLongName": selectedItems[0].activityLongName
      };

      //Prepare required details for BF process
      for (let i = 0; i < selectedItems.length; i++) {
          businessFunctionSelectedItems.push({
              "id": selectedItems[i].id,
              "type": selectedItems[i].type
          });
      }

      //Prepare selectionQuery - Remove when selection implemented for the govern grid
      selectionQuery.ids = [...new Set(selectedItems.map((obj) => obj.id))];
      selectionQuery.filters = {
          "typesCriterion": [...new Set(selectedItems.map((obj) => obj.type))]
      };

      if (detail.data.eventName == "action-takeTask" || detail.data.eventName == "action-releaseTask") {
          let action = detail.data.eventName == "action-takeTask" ? "take" : "release";
          this._showAssignmentDialog(detail, action, selectionMode, selectionQuery, businessFunctionSelectedItems, wfDetails);
      } else if (detail.data.eventName == "action-wfTransitions") {
          let action = "action-wftransition";
          this._showTransitionDialog(detail, action, selectionMode, selectionQuery, businessFunctionSelectedItems, wfDetails);
      }
  }
  _isSelectedItemsValid(selectedItems) {
      let isValid = true;
      for (let i = 1; i < selectedItems.length; i++) {
          if (selectedItems[i].workflowName != selectedItems[i - 1].workflowName ||
              selectedItems[i].activityName != selectedItems[i - 1].activityName) {
              isValid = false;
              break;
          }
      }

      return isValid;
  }
  _showAssignmentDialog(detail, action, selectionMode, selectionQuery, selectedItems, wfDetails) {
      const { workflowLongName, activityLongName, workflowName, activityName } = wfDetails;

      const sharedData = {
          "selection-mode": selectionMode,
          "selection-query": selectionQuery,
          "selected-entities": selectedItems,
          "assignment-action": action,
          "workflow-external-name": workflowLongName,
          "workflow-activity-external-name": activityLongName,
          "workflow-name": workflowName,
          "workflow-activity-name": activityName
      };

      this.openBusinessFunctionDialog({ name: 'rock-wizard-workflow-assignment' }, sharedData);
  }
  _showTransitionDialog(detail, action, selectionMode, selectionQuery, selectedItems, wfDetails) {
      const { workflowLongName, activityName, activityLongName } = wfDetails;

      const sharedData = {
          "selection-mode": selectionMode,
          "selection-query": selectionQuery,
          "selected-entities": selectedItems,
          "current-workflow": {
              name: workflowLongName,
              activityName: activityName,
              activityExternalName: activityLongName
          }
      };

      this.openBusinessFunctionDialog({
          name: 'rock-wizard-workflow-transition',
          title: wfDetails.activityLongName,
          mergeTitle: true,
      }, sharedData);
  }
  getIsDirty() {
      let relGrid = this.shadowRoot.querySelector('rock-relationship-grid');
      if (relGrid && relGrid.getIsDirty) {
          return relGrid.getIsDirty();
      }
      return false;
  }
  getControlIsDirty() {
      let relGrid = this.$$('rock-relationship-grid');
      let whereusedGrid = this.$$("rock-where-used-grid");
      if (relGrid && relGrid.getControlIsDirty) {
          return relGrid.getControlIsDirty();
      } else if (whereusedGrid && whereusedGrid.getControlIsDirty) {
          return whereusedGrid.getControlIsDirty();
      }

      return false;
  }
  refresh(options) {
      let relGrid = this.$$("rock-relationship-grid");
      let whereusedGrid = this.$$("rock-where-used-grid");
      if (relGrid && relGrid.refresh) {
          relGrid.refresh(options);
      } else if (whereusedGrid && whereusedGrid.refresh) {
          whereusedGrid.refresh(options);
      }
  }
  _getRelationshipMode(gridRelConfig) {
      if(!_.isEmpty(gridRelConfig)) {
          return gridRelConfig.mode;
      }

      return null;
  }
  _noAttributeModelsPresent() {
      if(this._relConfig) {
          let relAttributesEmpty = _.isEmpty(this._relConfig.relationshipAttributeModels);
          let relatedEntityAttributesEmpty = !DataHelper.isValidObjectPath(this._relConfig, "relatedEntityModel.relatedEntityAttributeModels") || _.isEmpty(this._relConfig.relatedEntityModel.relatedEntityAttributeModels);

          return relAttributesEmpty && relatedEntityAttributesEmpty;
      }
  }

  _updateConfigWithAttributeModel(entityModel) {
      if(!_.isEmpty(entityModel) && this._relConfig) {
          let externalNameAndExternalNameAttr = AttributeHelper.getExternalNameAndExternalNameAttr(entityModel);
          if(!_.isEmpty(externalNameAndExternalNameAttr)) {
              let externalNameAttr = externalNameAndExternalNameAttr.externalNameAttr;
              let transformAttributeModels = DataTransformHelper.transformAttributeModels(entityModel, {});
              let externalNameAttrModel = transformAttributeModels[externalNameAttr];
              if(externalNameAttrModel) {
                  this._relConfig.relatedEntityModel = this._relConfig.relatedEntityModel || {};
                  this._relConfig.relatedEntityModel.relatedEntityAttributeModels = {};
                  this._relConfig.relatedEntityModel.relatedEntityAttributeModels[externalNameAttr] = externalNameAttrModel;

                  this._relConfig.gridConfig = this._relConfig.gridConfig || {};
                  this._relConfig.gridConfig.itemConfig = this._relConfig.gridConfig.itemConfig || {};
                  this._relConfig.gridConfig.itemConfig.fields = this._relConfig.gridConfig.itemConfig.fields || {};
                  let columnData = {
                      "dataType": externalNameAttrModel.dataType,
                      "header": externalNameAttrModel.externalName,
                      "isMetaDataColumn": false,
                      "linkTemplate": "entity-manage?id={id}&type={type}",
                      "name": externalNameAttr,
                      "visible": true,
                      "readOnly": true
                  };
                  this._relConfig.gridConfig.itemConfig.fields[externalNameAttr] = columnData;
              }
          }
      }
  }
}
customElements.define(RockEntityRelationshipSearchResult.is, RockEntityRelationshipSearchResult);
