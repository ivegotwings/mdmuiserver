import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-buttons.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-helpers/data-request-helper.js';
import '../bedrock-helpers/data-transform-helper.js';
import '../liquid-entity-model-get/liquid-entity-model-get.js';
import '../liquid-entity-data-get/liquid-entity-data-get.js';
import '../liquid-rest/liquid-rest.js';
import '../liquid-entity-data-save/liquid-entity-data-save.js';
import '../pebble-spinner/pebble-spinner.js';
import '../pebble-button/pebble-button.js';
import '../pebble-card/pebble-card.js';
import '../pebble-accordion/pebble-accordion.js';
import '../rock-scope-selector/rock-scope-selector.js';
import '../rock-split-list/rock-split-list.js';
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

            .scope-manage-list-wrapper {
                min-height: 320px;
            }

            pebble-card {
                --pebble-card-widget-box: {
                    height: 100%;
                    overflow: auto;
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

            .header-content{
                display: flex;
                align-items: center;
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

                                <pebble-accordion id="attrAccordion" is-collapsed="{{!_isOpened}}" header-text="[[_getHeaderText(_selectedScope,'attributes')]]" slot="pebble-card-content">
                                    <!--div slot="header-content" class="header-content">
                                        <pebble-checkbox id="includeAllAttributesChkBox" class="checkbox-label-color m-r-10" checked="[[_isIncludeAllChecked('attributes',_includeAllAttributes)]]" on-change="_onIncludeAllAttributesChange">Include All</pebble-checkbox>
                                    </div-->     
                                    <div slot="accordion-content" class="full-height overflow-auto-y">
                                        <template is="dom-if" if="[[_isOpened]]">
                                            <div class="scope-manage-list-wrapper full-height">
                                                <template is="dom-if" if="[[_isConfigLoaded]]">
                                                    <rock-split-list id="attributeSplitList" disable-split-list="[[_isSplitListDisabled('attributes',_includeAllAttributes)]]" context-data="[[contextData]]" retain-selected-items="[[retainselectedAttributes]]" selected-items="{{selectedAttributes}}" config="[[attributeSplitListConfig]]" object-type="attribute"></rock-split-list>
                                                </template>
                                            </div>
                                        </template>
                                    </div>
                                </pebble-accordion>
                           
                                <pebble-accordion id="relAccordion" is-collapsed="{{!_isRelOpened}}" header-text="[[_getHeaderText(_selectedScope,'relationships')]]" slot="pebble-card-content">
                                    <div slot="header-content" class="header-content">
                                        <pebble-checkbox id="includeAllRelationshipsChkBox" class="checkbox-label-color m-r-10" checked="[[_isIncludeAllChecked('relationships',_includeAllRelationships)]]" on-change="_onIncludeAllRelationshipsChange">Include All</pebble-checkbox>
                                    </div>  
                                    <div slot="accordion-content" class="full-height overflow-auto-y">
                                        <template is="dom-if" if="[[_isRelOpened]]">
                                            <div class="scope-manage-list-wrapper full-height">
                                                <template is="dom-if" if="[[_isConfigLoaded]]">
                                                    <rock-split-list id="relationshipSplitList" disable-split-list="[[_isSplitListDisabled('relationships',_includeAllRelationships)]]" context-data="[[contextData]]" retain-selected-items="[[retainSelectedRelationships]]" selected-items="{{selectedRelationships}}" config="[[relationshipSplitListConfig]]" object-type="relationship"></rock-split-list>
                                                </template>
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
        <liquid-entity-data-save name="entitySaveDataService" operation="[[_entityDataOperation]]" data-index="[[dataIndex]]" request-data="{{_saveRequest}}" last-response="{{_saveResponse}}" on-response="_onSaveResponse" on-error="_onSaveResponse"></liquid-entity-data-save>      
`;
  }

  static get is() { return 'rock-entity-paste' }

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
          _targetEntitiesModels: {
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
          attributeSplitListConfig: {
              type: Object
          },
          relationshipSplitListConfig: {
              type: Object
          },
          selectedItems: {
              type: Array,
              computed: '_computeSelectedItems(selectedAttributes.length,selectedRelationships.length,_includeAllAttributes,_includeAllRelationships)'
          },
          selectedAttributes: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          retainselectedAttributes: {
              type: Boolean,
              value: false
          },
          selectedRelationships: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          retainSelectedRelationships: {
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
          _isRelOpened: {
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
          },
          _attributes: {
              type: String,
              value: "attributes"
          },
          _relationships: {
              type: String,
              value: "relationships"
          },
          _includeAllAttributes: {
              type: Boolean,
              value: false
          },
          _includeAllRelationships: {
              type: Boolean,
              value: false
          },
          _isConfigLoaded: {
              type: Boolean,
              value: false
          }
      }
  }

  /**
   * Function to handle contextdata change
   */
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

  /**
   * Function to read the configData 
   */
  onConfigLoaded(componentConfig) {
      this._isConfigLoaded = false;                        
      if(componentConfig) {
          if (DataHelper.isValidObjectPath(componentConfig, "config.attributeSplitListConfig.tabular.fields")) {
              let attributeSplitListConfig = componentConfig.config.attributeSplitListConfig;
              attributeSplitListConfig.tabular.fields = DataHelper.convertObjectToArray(attributeSplitListConfig.tabular.fields);
              this.set("attributeSplitListConfig",attributeSplitListConfig);
              this._isConfigLoaded = true;
          } else {
              this.logError("rock-scope-manage - Attribute split list config is not available/proper in config", componentConfig);
          }

          if (DataHelper.isValidObjectPath(componentConfig, "config.relationshipSplitListConfig.tabular.fields")) {
              let relationshipSplitListConfig = componentConfig.config.relationshipSplitListConfig;
              relationshipSplitListConfig.tabular.fields = DataHelper.convertObjectToArray(relationshipSplitListConfig.tabular.fields);
              this.set("relationshipSplitListConfig",relationshipSplitListConfig);
              this._isConfigLoaded = true;                    
          } else {
              this.logError("rock-scope-manage - Relationship split list config is not available/proper in config", componentConfig);
          }              
      } else {
          this.logError("rock-scope-manage - Split list config is not available/proper in config", componentConfig);
      }
      
      //Fetch all attribute and relationship models
      let clonedContextData = DataHelper.cloneObject(this.contextData);                
      if(clonedContextData.ItemContexts && clonedContextData.ItemContexts.length) {
          clonedContextData.ItemContexts[0].attributeNames = ["_ALL"];
          clonedContextData.ItemContexts[0].relationships = ["_ALL"];                    
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


  /**
   * Function to handle composite model get success
   */
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
          let relationshipModels = DataTransformHelper.transformRelationshipModels(
              e.detail.response.content.entityModels[0], this.contextData);
          //Format it according to usage
          this._relationshipModels = {};
          if(!_.isEmpty(relationshipModels)){
              for(let relationship in relationshipModels){
                  this._relationshipModels[relationship] = relationshipModels[relationship][0];
              }
          } else {
              this._loading = false;
              this.logError("Entity model composite get request failed to fetch relationships", e.detail);
          }
      }
      else {
          this._onEntityModelCompositeGetFailed();
      }
  }

  /**
   * Function to handle composite model get failure
   */
  _onEntityModelCompositeGetFailed(e){
      this._loading = false;
      this.logError("Entity model composite get request failed", e.detail);
  }

  /**
   * Function to handle click on cancel button
   */
  _onCancelTap() {
     let eventDetail = {
         name: "onCancel"
     };
     this.fireBedrockEvent("onCancel", eventDetail, { "ignoreId": true });
 }

  /**
   * Function to get the text to be displayed as accordion title
   */
  _getHeaderText(_selectedScope, itemType) {
      if(!_.isEmpty(this._selectedScope) && this._selectedScope.name){
          return "Editing scope:  " + this._selectedScope.name
      } else if (itemType) {
          return "Select " + itemType + " for paste";
      }

      return;
  }

  /**
   * Function to handle click on paste button
   */
  _executePaste(e) {
      let data = sessionStorage.getItem('copyEntityData'); 
      if(_.isEmpty(data)){
          this.showWarningToast('Copy an entity before pasting it');
          return;
      }
                                     
      if(!this._includeAllAttributes && !this._includeAllRelationships) {
          if ((!this.selectedAttributes || !this.selectedAttributes.length) && (!this.selectedRelationships || !this.selectedRelationships.length)) {
              this.showWarningToast("Select at least 1 attribute or relationship for paste");
              return;
          }
      }
      
      let copiedEntityContext, entityGetRequest; 
      copiedEntityContext = JSON.parse(data);

      this.targetEntities = [];
      if(this.selectedItemsForPaste && this.selectedItemsForPaste.length > 0){
          this.targetEntities = this.selectedItemsForPaste;
      } else {
          let firstItemContext = this.getFirstItemContext();
          if (!_.isEmpty(firstItemContext) && firstItemContext.id) {
              this.targetEntities = [{
                  "id": firstItemContext.id,
                  "type": firstItemContext.type,
                  "name": firstItemContext.name
              }];
          }                    
      }

      this.uniqueEntityTypes = [];
      this.uniqueEntityTypes = this.targetEntities.map(item => {return item.type;});
      this._loading = true;                
      this._getEntityCompositeModels(copiedEntityContext);             
  }

  /**
   * Function to get the composite model of the target entities
   */
  async _getEntityCompositeModels(copiedEntityContext) {
      this._targetEntitiesModels = [];                
      for(let item of this.uniqueEntityTypes) {                    
          let clonedContextData = DataHelper.cloneObject(this.contextData);                   
          let compositeModelGetRequest = DataRequestHelper.createEntityModelCompositeGetRequest(clonedContextData);
          compositeModelGetRequest.params.query.name = item;
          compositeModelGetRequest.params.fields.attributes = this._getAttributesForRequestQuery(); 
          compositeModelGetRequest.params.fields.relationships = this._getRelationshipsForRequestQuery();                    
          let compositeModel = await this._getCompositeModel(compositeModelGetRequest,copiedEntityContext);                    
          this._targetEntitiesModels.push(compositeModel);                
      }
                      
      this._onEntityGetRequest();
  }

  /**
   * Function to get the composite model for the given request from the EntityCompositeModelManager
   */
  async _getCompositeModel(compositeModelGetRequest,copiedEntityContext) {
      let compositeModel = {};
      let entityCompositeModelManager = new EntityCompositeModelManager();
      if(entityCompositeModelManager && compositeModelGetRequest) {
          compositeModelGetRequest.applyEnhancerCoalesce = true;
          compositeModel = await entityCompositeModelManager.get(compositeModelGetRequest, copiedEntityContext);
      }
      entityCompositeModelManager = null;
      return compositeModel;
  }

  /**
   * Function to get the copied entity data with selected attributes and relationships
   */
  _onEntityGetRequest() {
      let copiedEntityContext, entityGetRequest;  
      let data = sessionStorage.getItem('copyEntityData');
      copiedEntityContext = JSON.parse(data);
      let copiedItemContext = this._getUpdatedItemContextWithSelectedEntities(copiedEntityContext);
      copiedEntityContext.ItemContexts = [copiedItemContext];

      entityGetRequest = DataRequestHelper.createEntityGetRequest(copiedEntityContext);
      let liquidDataElement = this.shadowRoot.querySelector('#getEntity');
      
      let attributes = this._getAttributesForRequestQuery(); 
      let relationships = this._getRelationshipsForRequestQuery();                

      entityGetRequest.params.fields.attributes = attributes;
      entityGetRequest.params.fields.relationships = relationships;
      entityGetRequest.params.fields.relationshipAttributes = [];
      
     //Read the relationshipattributes from the targetEntitiesModels for the relationships
     if(!_.isEmpty(relationships) && !_.isEmpty(this._targetEntitiesModels)){                
          let relAttributes = [];
          for(let i=0; i<this._targetEntitiesModels.length;i++){
              if(DataHelper.isValidObjectPath(this._targetEntitiesModels[i], "data.relationships")){
                  let relObj = this._targetEntitiesModels[i].data.relationships;
                  for(let relName in relObj){
                      if(!_.isEmpty(relObj[relName][0].attributes)){
                          relAttributes = _.union(Object.keys(relObj[relName][0].attributes),relAttributes);
                      }
                  }
              }
          }
          entityGetRequest.params.fields.relationshipAttributes = relAttributes;
      }
      
      //setting non-coalesce flag
      entityGetRequest.params.query.filters.nonContextual = false;

      liquidDataElement.requestData = entityGetRequest;
      liquidDataElement.generateRequest();                    
  }

  /**
   * Function to get the attributes for request query
   */
  _getAttributesForRequestQuery(){
      let attributes = [];
      if(this._includeAllAttributes) {  //fetch all attributes
          attributes = ["_ALL"];
      } else {  //fetch the selected attributes                        
          if(this.selectedAttributes.length > 0){
              attributes = this.selectedAttributes.map(elm => {
                  return elm.name;
              });
          }
      }          
      return attributes;
  }

  /**
   * Function to get the relationships for request query
   */
  _getRelationshipsForRequestQuery(){
      let relationships = [];
      if(this._includeAllRelationships) {  //fetch all relationships
          relationships = ["_ALL"];
      } else {  //fetch the selected relationships
          if(this.selectedRelationships.length > 0){ 
              relationships = this.selectedRelationships.map(elm => {
                  return elm.name;
              });
          }
      }
      return relationships;
  }

  /**
   * Function to handle entity get success
   */
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

      if (_.isEmpty(copiedEntity) || _.isEmpty(copiedEntity[0].data)) {
          this._loading = false;                
          this.logError("Entity get request - Copied entity details missing", copiedEntity);
          this.showWarningToast("Copied entity details are missing.Contact Administrator");
          return;
      }
      
      //copied entity details
      copiedEntity = copiedEntity[0]; 
     
      //handle scenario if attributes are copied
      let clonedAttributes = {};
      if(DataHelper.isValidObjectPath(copiedEntity, 'data.attributes') && !_.isEmpty(copiedEntity.data.attributes)) {
          let attributes = copiedEntity.data.attributes;
          let currentLocale = this.contextData.ValContexts[0].locale;
          //changing the locale to pasteEntity in all self attributes
          this._setAttributesToCurrentLocale(attributes, currentLocale);

          //changing the locale to pasteEntity in all context attributes
          if (DataHelper.isValidObjectPath(copiedEntity, 'data.contexts.0')) {

              let contextsInResponse = copiedEntity.data.contexts;
              contextsInResponse.forEach(context => {
                  if (!_.isEmpty(context.attributes)) {
                      let attributes = context.attributes;
                      this._setAttributesToCurrentLocale(attributes, currentLocale);
                  }
              }, this);
          }
          
          if (DataHelper.isValidObjectPath(copiedEntity, 'data.attributes')) {
              clonedAttributes = DataHelper.cloneObject(copiedEntity.data.attributes);
          }
          //Attributes permission check
          if (!this._isAllHaveEditPermissions(clonedAttributes,this._attributes)) {
              this._loading = false;                
              return;
          }

      } 
      
      //handle scenario if relationships are copied
      let clonedRelationships = {};
      if(DataHelper.isValidObjectPath(copiedEntity, 'data.relationships') && !_.isEmpty(copiedEntity.data.relationships)) {
          
          clonedRelationships = this._getNonCoalescedRelationships(copiedEntity.data.relationships);
          
          //Attributes permission check
          if (!this._isAllHaveEditPermissions(clonedRelationships,this._relationships)) {
              this._loading = false;                
              return;
          }
      }

      let dataContexts = ContextHelper.getDataContexts(this.contextData)
      if (!_.isEmpty(dataContexts)) {
          if (!_.isEmpty(copiedEntity.data.contexts)) {
              if(copiedEntity.data.contexts[0].attributes) {
                  clonedAttributes = copiedEntity.data.contexts[0].attributes;
              }
              if (copiedEntity.data.contexts[0].relationships) {
                  clonedRelationships = this._getNonCoalescedRelationships(copiedEntity.data.contexts[0].relationships);
              }
          }                    
          let dataContext = {
              "context": dataContexts[0],
              "attributes": clonedAttributes,
              "relationships": clonedRelationships
          }
          copiedEntity.data.contexts.push(dataContext);
          copiedEntity.data.attributes = {};
          copiedEntity.data.relationships = {};
      } else {
          let contextCloneAttributes = {};
          let contextCloneRelationships = {};
          if (DataHelper.isValidObjectPath(copiedEntity, 'data.contexts.0')) {
              // extracting attributes from context of source entity
              if(copiedEntity.data.contexts[0].attributes) {
                  copiedEntity.data.contexts.forEach(dataContext => {
                      if (!_.isEmpty(dataContext.attributes)) {
                          Object.assign(contextCloneAttributes, dataContext.attributes);
                      }
                  })
                  //Attributes permission check
                  if (!this._isAllHaveEditPermissions(contextCloneAttributes,this._attributes)) {
                      this._loading = false;                
                      return;
                  }
              }
                                      
              // extracting relationships from context of source entity
              if(copiedEntity.data.contexts[0].relationships) {
                  let tempRelationships;
                  copiedEntity.data.contexts.forEach(dataContext => {
                      if (!_.isEmpty(dataContext.relationships)) {
                          Object.assign(tempRelationships, dataContext.relationships);
                      }
                  })
                  contextCloneRelationships = this._getNonCoalescedRelationships(tempRelationships);
                  //Attributes permission check
                  if (!this._isAllHaveEditPermissions(contextCloneRelationships,this._relationships)) {
                      this._loading = false;                
                      return;
                  }
              }
              
              copiedEntity.data.attributes = contextCloneAttributes;
              copiedEntity.data.relationships = contextCloneRelationships;
              copiedEntity.data.contexts = [];
          }
      }
      
      //Start update process
      this._prepareRequestAndTriggerSave(copiedEntity);
  }

  /**
   * Function to get only non-coalesced relationships
   */
  _getNonCoalescedRelationships(relationshipObject){
      if(!_.isEmpty(relationshipObject)) {
          let clonedRelationshipObject = DataHelper.cloneObject(relationshipObject);
              Object.keys(relationshipObject).forEach(relationshipName=> {
                  if(relationshipObject[relationshipName].length > 0) {
                      let relArrayList = relationshipObject[relationshipName];
                      let nonCoalescedRelationships = relArrayList.filter(item=> {
                          return (item.os != "instanceCoalesce" && item.os != "contextCoalesce");
                      }); 
                      if(nonCoalescedRelationships.length > 0){
                          clonedRelationshipObject[relationshipName] = {};
                          clonedRelationshipObject[relationshipName] = nonCoalescedRelationships;
                      } else {
                          delete clonedRelationshipObject[relationshipName];
                      }
                  }                            
          })
          return clonedRelationshipObject;
      }
  }

  /**
   * Function to set the attributes to current locale
   */
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

  /**
   * Function to get unique nested attributes
   */
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

  /**
   * Function to handle entity get fail
   */
  _onEntityGetFailed(e) {
      this._loading = false;                
      this.logError("Copied entities data get failed", e.detail);
  }

  /**
   * Function to get the ItemContext for the selected entities
   */
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

  /**
   * Function to check if the item has writepermission
   */
  _isAllHaveEditPermissions(items, itemType) {
      let itemsWithNoPermissions = [];
      //logic to check permissions of attributes - entity manage only

      if(items && itemType) {  
          let models = this._attributeModels;                  
          if(itemType == this._relationships){
              models = this._relationshipModels;
          }
          for (let itemName in items) {
              if (models.hasOwnProperty(itemName) &&
                  DataHelper.isValidObjectPath(models[itemName], 'properties.hasWritePermission') &&
                  !models[itemName].properties.hasWritePermission) {
                      itemsWithNoPermissions.push(models[itemName].externalName);
              }
          }

          if (itemsWithNoPermissions.length) {
              this._loading = false;  
              let message = `You do not have permissions to edit [${itemsWithNoPermissions.join(", ")}] `+itemType;
              this.showWarningToast(message);                                      
              return false;
          }
      }

      return true;
  }

  /**
   * Function to trigger save
   */
  _prepareRequestAndTriggerSave(sourceEntity) {
      let clonedSourceEntity = DataHelper.cloneObject(sourceEntity);
      let entityTypesNotToSendForSave = [];
      this._entityTypesNotToSendForSave = [];
                      
      if(!_.isEmpty(this._targetEntitiesModels)){
          let selectedAttributes;
          let selectedRelationships;
          if(!_.isEmpty(this.uniqueEntityTypes)) {                        
              this.uniqueEntityTypes.forEach(entityType=> {

                  let attributeModels = this._getDataFromTargetEntityModels(entityType,sourceEntity,"attributeModel");
                  let relationshipModels = this._getDataFromTargetEntityModels(entityType,sourceEntity,"relationshipModel");
                  selectedAttributes = this._getDataFromTargetEntityModels(entityType,sourceEntity,"selectedAttributes");
                  selectedRelationships = this._getDataFromTargetEntityModels(entityType,sourceEntity,"selectedRelationships");
                  
                  if(!_.isEmpty(selectedAttributes) && !_.isEmpty(attributeModels)) {
                      Object.keys(attributeModels).forEach(attributeName=> {
                          let externalName = this._getExternalName(attributeName,this._attributes);                                    
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
                  if(!_.isEmpty(selectedRelationships) && !_.isEmpty(relationshipModels)) {
                      Object.keys(relationshipModels).forEach(relationshipName=> {
                          let externalName = this._getExternalName(relationshipName,this._relationships);
                          if(DataHelper.isValidObjectPath(relationshipModels[relationshipName][0], 'properties.hasWritePermission')) {
                              if(!relationshipModels[relationshipName][0].properties.hasWritePermission) {
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
      }
       
      if (!_.isEmpty(this.targetEntities)) {
          this.targetEntities.forEach(item => {
              if( Object.keys(entityTypesNotToSendForSave).indexOf(item.type) == -1) {
                  this._entitiesEligibleForSave++;
                  //Pick id, type and name from target entities for update
                  clonedSourceEntity.id = item.id;
                  clonedSourceEntity.type = item.type;
                  clonedSourceEntity.name = item.name;
                  if(!_.isEmpty(this._nestedAttributes)) {
                      this._updateNestedAttributesForEntity(clonedSourceEntity);
                  }
                  
                  if(clonedSourceEntity.data && !_.isEmpty(this._targetEntitiesModels)){
                      let attributeList;
                      let relationshipList;
                      if(DataHelper.isValidObjectPath(clonedSourceEntity, 'data.contexts.0')) {
                          let dataContext = clonedSourceEntity.data.contexts[0];
                          if(!_.isEmpty(dataContext.attributes)) {
                              attributeList = this._removeUnrelatedAttributes(item.type,dataContext.attributes);
                              clonedSourceEntity.data.contexts[0].attributes = {};
                              clonedSourceEntity.data.contexts[0].attributes = attributeList;
                          }
                          if(!_.isEmpty(dataContext.relationships)) {
                              relationshipList = this._removeUnrelatedRelationships(item.type,dataContext.relationships);
                              clonedSourceEntity.data.contexts[0].relationships = {};
                              clonedSourceEntity.data.contexts[0].relationships = relationshipList;
                          }
                      } else {
                          if (!_.isEmpty(clonedSourceEntity.data.attributes)) {
                              attributeList = this._removeUnrelatedAttributes(item.type,clonedSourceEntity.data.attributes);
                              clonedSourceEntity.data.attributes = {};
                              clonedSourceEntity.data.attributes = attributeList;
                          }
                          if (!_.isEmpty(clonedSourceEntity.data.relationships)) {
                              relationshipList = this._removeUnrelatedRelationships(item.type,clonedSourceEntity.data.relationships);
                              clonedSourceEntity.data.relationships = {};
                              clonedSourceEntity.data.relationships = relationshipList;
                          }
                      }
                      if(!_.isEmpty(clonedSourceEntity.relationshipsTotalCount)){
                         delete clonedSourceEntity.relationshipsTotalCount;
                      }
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

  /**
   * Function to remove unrelated attributes (those attributes which are not present in the targetModel) from the given attribute object list
   */
  _removeUnrelatedAttributes(entityType,attributeList) {
     if(!_.isEmpty(this._targetEntitiesModels)) {
         let attributeModels = this._getDataFromTargetEntityModels(entityType,{},"attributeModel");
         if(!_.isEmpty(attributeModels)) {
             let attributesObj = DataHelper.cloneObject(attributeList);                              
             Object.keys(attributeList).forEach(attributeName=> {
                 if(!attributeModels[attributeName]) {
                     delete attributesObj[attributeName];
                 }
             })
             return attributesObj;
         }
     }
     return attributeList;
 }

  /**
   * Function to remove unrelated relationships (those relationships which are not present in the targetModel) from the given relationship object list
   */
  _removeUnrelatedRelationships(entityType,relationshipList) {
      if(!_.isEmpty(this._targetEntitiesModels)) {
          let relationshipModels = this._getDataFromTargetEntityModels(entityType,{},"relationshipModel");
          if(!_.isEmpty(relationshipModels)){
              let relationshipObj = DataHelper.cloneObject(relationshipList);
              Object.keys(relationshipList).forEach(relationshipName=> {
                  if(!relationshipModels[relationshipName]) {
                      delete relationshipObj[relationshipName];
                  }
              })
              return relationshipObj;
          }
      }
      return relationshipList;
  }

  /**
   * Function to fetch attributeModel,relationshipModel,selectedAttributes,selectedRelationships from the targetEntityModel & sourceEntity
   */
  _getDataFromTargetEntityModels(entityType,sourceEntity,itemType){
      
      if(_.isEmpty(this._targetEntitiesModels)) {
          return;
      }
      let currentEntityModel = this._targetEntitiesModels.filter(elm=> {
          return elm.id === entityType + "_entityCompositeModel";
      });  
      let firstDataContext = ContextHelper.getFirstDataContext(this.contextData);
      let attributeModels = {};
      let relationshipModels = {};
      let selectedAttributes = {};
      let selectedRelationships = {};
              
      switch (itemType) {
          case "attributeModel":                       
              if(firstDataContext) {
                  attributeModels = SharedUtils.DataObjectFalcorUtil.getAttributesByCtx(currentEntityModel[0], firstDataContext);
              } else if(DataHelper.isValidObjectPath(currentEntityModel[0], 'data.attributes')) {
                  attributeModels = currentEntityModel[0].data.attributes;                         
              }
              return attributeModels;                        
          case "relationshipModel":                       
              if(firstDataContext) {
                  relationshipModels = SharedUtils.DataObjectFalcorUtil.getRelationshipsByCtx(currentEntityModel[0], firstDataContext);
              } else if(DataHelper.isValidObjectPath(currentEntityModel[0], 'data.relationships')) {
                  relationshipModels = currentEntityModel[0].data.relationships;
              }
              return relationshipModels;                        
          case "selectedAttributes":                        
              if(firstDataContext) {
                  selectedAttributes = SharedUtils.DataObjectFalcorUtil.getAttributesByCtx(sourceEntity, firstDataContext);
              } else if(DataHelper.isValidObjectPath(sourceEntity, 'data.attributes')) {
                  selectedAttributes = sourceEntity.data.attributes;
              }
              return selectedAttributes;                        
          case "selectedRelationships":
              if(firstDataContext) {
                  selectedRelationships = SharedUtils.DataObjectFalcorUtil.getRelationshipsByCtx(sourceEntity, firstDataContext);
              } else if(DataHelper.isValidObjectPath(sourceEntity, 'data.relationships')) {
                  selectedRelationships = sourceEntity.data.relationships;
              } 
              return selectedRelationships;         
      }
  }

  /**
   * Function to get the external name
   */
  _getExternalName(itemName, itemType) {
      let nameToExternalNameObject;
      let itemList = this.selectedAttributes;
      if(itemType == this._relationships){
          itemList = this.selectedRelationships;
      }
      if(!this._nameToExternalNameDictionary[itemName]) {
          for (let index = 0; index < itemList.length; index++) {
              if(itemName === itemList[index].name) {
                  this._nameToExternalNameDictionary[itemName] = itemList[index].externalName;
                  break;
              }
          }
          return this._nameToExternalNameDictionary[itemName]
      } else {
          return this._nameToExternalNameDictionary[itemName]
      }
  }

  /**
   * Function to update nested attributes for entity save
   */
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

  /**
   * Function to generate a request for entity save
   */
  _saveEntity() {
      let liquidSave = this.shadowRoot.querySelector("[name=entitySaveDataService]");
      if (liquidSave) {
         liquidSave.generateRequest();
      } else {
          this._loading = false;
          this.logError("Save failed: Not able to access entitySaveDataService liquid");
      }
  }

  /**
   * Function to handle entity save success
   */
  _onSaveResponse(e, detail) {
      this._loading = false;                
      this._bulkSaveTracker++;
      let message;
      let parsedData = this._sourceEntityData;
      if(DataHelper.isValidObjectPath(e, 'detail.request') && DataHelper.isValidObjectPath(e, 'detail.response')) {
          let req = e.detail.request;
          let entity = {};
          if(DataHelper.isValidObjectPath(req, 'originalRequest.requestData.entities.0')) {
              entity = req.originalRequest.requestData.entities[0];
          } else {
              entity = req.requestData.entities[0];
          }
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
      } else {
          this.logError("Save failed: Error in SaveResponse "+ e.detail);
      }
  }

  /**
   * Function to prepare messages for non eligible entities
   */
  _prepareMessagesForNonEligibleEntities() {
      let messages = [];
      this._entitiesNotEligibleForSave.forEach(entity=> {
          let message = {
              "Entity Name" : entity.name ? entity.name : entity.id,
              "Message": `Permissions Denied. You do not have permissions for [${this._entityTypesNotToSendForSave[entity.type].join(", ")}] attributes or relationships`,
              "Status": "Error"
          }
          messages.push(message);
      });
      return messages;
  }

  /**
   * Function to handle display of final page for bulk process
   */
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

  /**
   * Function to handle display of final page for paste functionality
   */
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

  showNoChangesToast() {
      RUFUtilities.pebbleAppToast.fitInto = RUFUtilities.appCommon.$.toastArea;;
      RUFUtilities.appCommon.toastText = "No changes to save";
      let toastElement = RUFUtilities.pebbleAppToast;
      toastElement.toastType = "information";
      toastElement.heading = "Information";
      toastElement.autoClose = true;
      toastElement.show();
  }

  /**
   * Scope Selector related functions
   */

  /**
   * Function to update the selectedItems for the scope selector
   */
  _computeSelectedItems() {
      let selectedItems = [];
      selectedItems = _.union(this.selectedAttributes,this.selectedRelationships);
      if(this._includeAllAttributes) {
          selectedItems.push({"type":"attributes","value":"_ALL"});
      }
      if(this._includeAllRelationships){
          selectedItems.push({"type":"relationships","value":"_ALL"});
      }

      return selectedItems;
  }

  /**
   * Function to handle click on tag in the scope selector
   */
  _onScopeTagClicked(e, detail) {
      if (detail && detail.data) {                   
          this._updateScopedItems(detail.data.scope); 
          this._executePaste();
      }
  }

  /**
   * Function to handle click on edit inside a tag in the scope selector
   */
  _onScopeEditClicked(e, detail) {
      if (detail && detail.data) {
          this.set("_selectedScope", detail.data);
          if (!this._isOpened) {
              this.$.attrAccordion.showContainer();
              this.$.attrAccordion._transitionEnd();
          }
          if (!this._isRelOpened) {
              this.$.relAccordion.showContainer();
              this.$.relAccordion._transitionEnd();
          }
         
          this.async(function () {
              this._updateScopedItems(detail.data.scope);                        
              if (!this.retainselectedAttributes) {
                  let attributeSplitList = this.shadowRoot.querySelector("#attributeSplitList");
                  if (attributeSplitList) {
                      attributeSplitList.rerenderGrid();
                  }
              }
              if (!this.retainSelectedRelationships) {
                  let relationshipSplitList = this.shadowRoot.querySelector("#relationshipSplitList");
                  if (relationshipSplitList) {
                      relationshipSplitList.rerenderGrid();
                  }
              }
          });
      }
  }

  /**
   * Function to update the selectedAttributes and selectedRelationships based on the scopeSelector selection
   */
  _updateScopedItems(items){
      this.selectedAttributes = [];
      this.selectedRelationships = [];
      if(!_.isEmpty(items)) {
          for(let item in items) {
              if(items[item].type == "attributeModel") {
                  this.selectedAttributes.push(items[item]);
              } else if(items[item].type == "relationshipModel") {
                  this.selectedRelationships.push(items[item]);
              } else if(items[item].type == this._attributes && items[item].value == "_ALL") {
                  this._includeAllAttributes = true;
              } else if(items[item].type == this._relationships && items[item].value == "_ALL") {
                  this._includeAllRelationships = true;
              }
          }
      }          
  }

  /**
   * Function to handle scopeSelector load
   */
  _onScopeLoad() {
      this._selectedScope = undefined;
      if (typeof this.$.attrAccordion.hideContainer === 'function') {
          this.$.attrAccordion.hideContainer();
      }
      if (typeof this.$.relAccordion.hideContainer === 'function') {
          this.$.relAccordion.hideContainer();
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

  /**
   * IncludeAll functions
   */
  _isIncludeAllChecked(itemType){

      if(itemType == this._attributes) {
          return this._includeAllAttributes;
      } else if (itemType == this._relationships) {
          return this._includeAllRelationships;
      }
      return false;
  }

  /**
   * Function to set _includeAllAttributes flag if includeAll is checked
   */
  _onIncludeAllAttributesChange(e) {
      //Prevent accordion close               
      e.detail.stopPropagation();                  
      this._includeAllAttributes = false;
      if(e.target.checked){
          this._includeAllAttributes = true;                   
      }               
  }

  /**
   * Function to set _includeAllRelationships flag if includeAll is checked
   */
  _onIncludeAllRelationshipsChange(e) {
      //Prevent accordion close 
      e.detail.stopPropagation();                
      this._includeAllRelationships = false;
      if(e.target.checked){
          this._includeAllRelationships = true;                   
      }               
  }

  /**
   * Function to set disable the split list grids
   */
  _isSplitListDisabled(itemType, flag) {
      if (itemType == this._attributes){
          return this._includeAllAttributes;
      } else if (itemType == this._relationships) {
          return this._includeAllRelationships;
      }
  }
}
customElements.define(RockEntityPaste.is, RockEntityPaste)
