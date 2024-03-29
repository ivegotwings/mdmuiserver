import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import '../bedrock-app-behavior/bedrock-app-behavior.js';
import '../bedrock-style-manager/styles/bedrock-style-scroll-bar.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../pebble-resizable-panels/pebble-resizable-panels.js';
import '../pebble-vertical-divider/pebble-vertical-divider.js';
import '../pebble-button/pebble-button.js';
import '../rock-relationship-manage/rock-relationship-manage.js';
import '../rock-entity-quick-manage/rock-entity-quick-manage.js';
import '../rock-entity-graph-tree/rock-entity-graph-tree.js';
import '../rock-relationship-detail-tabs/rock-relationship-detail-tabs.js';
import '../rock-component-config-behavior/rock-component-config-behavior.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-text-alignment.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import '../bedrock-style-manager/styles/bedrock-style-floating.js';
import '../rock-classification-tree/rock-classification-tree.js';
import '../bedrock-helpers/data-request-helper.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-helpers/component-helper.js';
import '../bedrock-helpers/context-helper.js';
import { timeOut, microTask } from '@polymer/polymer/lib/utils/async.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';

class RockEntityGraph
    extends mixinBehaviors([
                RUFBehaviors.ComponentContextBehavior,
                RUFBehaviors.UIBehavior,
                RUFBehaviors.ComponentConfigBehavior,
                RUFBehaviors.AppBehavior,
                RUFBehaviors.NavigationBehavior
            ], OptionalMutableData(PolymerElement)) {
  static get template() {
    return html`
        <style include="bedrock-style-scroll-bar bedrock-style-common bedrock-style-grid-layout bedrock-style-floating bedrock-style-padding-margin bedrock-style-text-alignment">
            :host{
                display: block;
                height: 100%;
                --rock-where-used-grid-govern-toggle:{
                    display: none;
                }
                --pebble-vertical-divider: {
                    background-color: #c1cad4;
                    height: 100%;
                    border: 0px;
                    min-height: 0px;
                    width: 2px;
                    margin-top: 0px;
                    margin-right: 0px;
                    margin-bottom: 0px;
                    margin-left: 0px;
                }
                --pebble-tree: {
                    padding-right: 20px;
                    padding-left: 20px;
                };
                --pebble-tree-node:{
                    padding-top: 0px;
                    padding-bottom: 0px;
                    margin-top: 0;
                    margin-bottom: 0;
                };
                --pebble-tree-node-list: {
                    padding-top: 5px;
                    padding-bottom: 5px;
                };
                --pebble-tree-node-nodetext:{
                    font-size: var(--font-size-sm, 12px);
                    font-weight: var(--font-medium, 500);
                    color: var(--buttontext-color, #616161);
                    text-align:left;
                    display: -webkit-box;
                    display: -webkit-flex;
                    display: -ms-flexbox;
                    display: flex;
                    align-items: flex-start;
                    -webkit-align-items: flex-start;
                    margin-left:5px;
                }
                --pebble-tree-node-pagination-button:{
                    font-size: var(--font-size-sm, 12px);
                    font-weight: var(--font-medium, 500);
                    text-align:left;
                    display: -webkit-box;
                    display: -webkit-flex;
                    display: -ms-flexbox;
                    display: flex;
                    align-items: flex-start;
                    -webkit-align-items: flex-start;
                }
                --pebble-tree-node-holder: {
                    position: relative;
                }
            }
            .graph-container{
                height: 100%;
                position:relative;
            }
            .only-attribute .only-attribute-container{
                display: -ms-grid;
                display: grid;                
                -ms-grid-rows: max-content 1fr;
                grid-template-rows: max-content 1fr;
                -ms-grid-columns: 1fr;
                grid-template-columns: 1fr;
                height: 100%;
            }

            .only-attribute .only-attribute-container .col-8-4-grid-child-1 {
                -ms-grid-row: max-content;
                -ms-grid-column: 1;
                min-width:0px;                
            }

            .only-attribute .only-attribute-container .col-8-4-grid-child-2 {
                -ms-grid-row: 2;
                -ms-grid-column: 1;
                min-width:0px;
                min-height: 0px;
            }

            .message {
                padding: 10px;
                margin: 10px 20px;
                background: var(--palette-pale-grey-four, #eff4f8);
                text-align: center;
                border-radius: 3px;
            }
            .graph-grid-wrapper,.grid-container{
                height:100%;
            }
            .left-panel{
                height: 100%;
                overflow: auto;
            }
            .right-panel{
                height: 100%;
            }
            #variantGen {
                float: right;               
            }
            .col-8-4-grid {
                display: -ms-grid;
                display: grid;
                -ms-grid-rows: 1fr;
                grid-template-rows: 1fr;
                -ms-grid-columns: 8fr 4fr;
                grid-template-columns: 8fr 4fr;
                height: 100%;
            }

            .col-8-4-grid .col-8-4-grid-child-1 {
                -ms-grid-row: 1;
                -ms-grid-column: 1;
                height: auto;
                min-height: 0px;
                min-width: 0px;
            }

            .col-8-4-grid .col-8-4-grid-child-2 {
                -ms-grid-row: 1;
                -ms-grid-column: 2;
                min-height: 0px;
                min-width: 0px;
            }
            rock-relationship-detail-tabs{
                --rock-tab-content-height: {
                    height:100%;
                }
            }
           
        </style>
        <div class="graph-container">
            <liquid-entity-data-get id="rootNodeInitialGet" operation="initiatesearch" request-data="{{_rootNodeGetRequest}}" last-response="{{initiateSearchResponse}}" on-error="_onRootNodeGetError" on-response="_onInitiateSearchResponse" exclude-in-progress=""></liquid-entity-data-get>
            <liquid-entity-data-get id="rootNodeSearchResultDetail" operation="getsearchresultdetail" request-data="{{_rootNodeGetRequest}}" request-id="[[initiateSearchResponse.content.requestId]]" on-error="_onRootNodeGetError" on-response="_onRootNodeGetResponse" exclude-in-progress=""></liquid-entity-data-get>
            <liquid-entity-model-get id="liquidModelGet" operation="getbyids" request-data="[[_modelRequest]]" on-response="_onModelReceived" on-error="_onModelGetFailed"></liquid-entity-model-get>
            <template is="dom-if" if="[[!_showEntityGraphContents]]">
                <div class="title p-t-20 text-center">
                    Select one context to view entity graph.
                </div>
            </template>
            <template is="dom-if" if="[[_isGraphTreeConfigAvailable(_graphTreeConfig)]]" restamp="">
                <pebble-resizable-panels>
                    <div class="left-panel" panel-width="30%">
                        <template is="dom-if" if="[[_isClassificationTree(_graphTreeConfig)]]">
                            <rock-classification-tree id="classificationTree" is-model-tree="[[isModelTree]]" context-data="[[contextData]]" multi-select="[[multiSelect]]" leaf-node-only="[[leafNodeOnly]]" enable-node-click="true" hide-leaf-node-checkbox="[[hideLeafNodeCheckbox]]" root-node-data="{{_rootNodeData}}" root-node="[[_rootNode]]" path-entity-type="[[_rootEntityType]]" path-relationship-name="[[_rootRelationshipName]]"></rock-classification-tree>
                        </template>
                        <template is="dom-if" if="[[!_isClassificationTree(_graphTreeConfig)]]">
                            <rock-entity-graph-tree id="graphTree" tree-config="[[_graphTreeConfig]]" context-data="[[contextData]]" item-data="{{selectedItem}}" enable-node-click=""></rock-entity-graph-tree> 
                        </template>
                    </div>
                    <div class="right-panel" panel-width="70%">
                        <div class="base-grid-structure">
                            <div class="base-grid-structure-child-1">
                                <template is="dom-if" if="[[_getVisibility('rock-variant-configurator')]]">
                                    <pebble-button id="variantGen" class="btn btn-primary m-t-10 m-r-20 auto-width" button-text="Variant Configurator" raised="" on-tap="_onConfigureVariantsTap"></pebble-button>
                                    <div class="clearfix"></div>
                                </template>
                            </div>
                            <div class\$="base-grid-structure-child-2 [[onlyAttribute]]">
                                <template is="dom-if" if="{{!_visibleMessageCard(selectedItem)}}" restamp="">
                                    <div class="graph-grid-wrapper only-attribute-container">	
                                        <div class="grid-container col-8-4-grid-child-1">
                                                <template is="dom-if" if="[[_visibleGridView(selectedItem.viewMode, _panelContentLoaded)]]">
                                                    <template is="dom-if" if="[[_isClassificationTree(_graphTreeConfig)]]">
                                                        <rock-relationship-detail-tabs id="rockRelationshipTabs" view-mode="{{viewMode}}" context-data="[[_tabContextData]]" readonly="[[readonly]]"></rock-relationship-detail-tabs>
                                                    </template>
                                                    <template is="dom-if" if="[[!_isClassificationTree(_graphTreeConfig)]]">
                                                        <rock-relationship-manage id="relationshipManage" exclude-non-contextual="[[excludeNonContextual]]"></rock-relationship-manage>
                                                    </template>
                                                </template>  
                                        </div>
                                        <div class="col-8-4-grid-child-2">               
                                            <template is="dom-if" if="[[_visibleQuickManageView(selectedItem.viewMode, _panelContentLoaded)]]">
                                                <rock-entity-quick-manage id="entityQuickManage" no-header=""></rock-entity-quick-manage>
                                            </template>
                                        </div>   
                                    </div>
                                </template>
                                <template is="dom-if" if="{{_visibleMessageCard(selectedItem)}}">
                                    <div class="m-10"><div class="default-message">Select left section to see results.</div></div>
                                </template>
                            </div>
                        </div>
                    </div>
                </pebble-resizable-panels>
            </template>
            <bedrock-pubsub event-name="classification-item-clicked" handler="_onClassificationClickHandler" target-id="classificationTree"></bedrock-pubsub>
            <bedrock-pubsub event-name="grid-data-refreshed" handler="_onRefreshTree"></bedrock-pubsub>
        </div>
`;
  }

  static get is() { return 'rock-entity-graph' }

  static get properties() {
      return {
          contextData: {
              type: Object,
              value: function () {
                  return {};
              },
              observer: "_onContextDataChange"
          },
          _tabContextData: {
              type: Object,
              value: function () {
                  return {};
              },
              notify: true
          },
          configData: {
              type: Object,
              value: function () { 
                  return {}; 
              }
          },
          configContext: {
              type: Object,
              value: function() {
                  return {};
              }
          },
          viewMode: {
                  type: String,
                  value: ""
          },
          onlyAttribute:{
              type:String,
              value:""
          },

          /**
           * If set as true , it indicates the component is in read only mode
           */
              readonly: {
              type: Boolean,
              value: false
          },
          selectedItem:{
              type:Object,
              value: function() {
                  return {};
              },
              observer: "_onTreeItemChange"
          },
          _graphTreeConfig: {
              type: Object,
              value: function() {
                  return {};
              }
          },
          _gridConfigLoaded:{
              type:Boolean,
              value:false
          },
          _panelContentLoaded:{
              type:Boolean,
              value:false
          },
          _entityContextData:{
              type:Object,
              value: function(){
                  return {};
              }
          },
                              /*
               * Indicates the configuration for the "tab" element.
               */
          tabConfig: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          multiSelect:{
              type:Boolean,
              value:false
          },
          leafNodeOnly:{
              type:Boolean,
              value:true
          },
          hideLeafNodeCheckbox:{
              type:Boolean,
              value:true
          },
          _selectedClassificationNode:{
              type:Object
          },
          isModelTree:{
              type:Boolean,
              value:true
          },
          _rootNodeData:{
              type:Object,
              value: function(){
                  return {}
              },
              notify:true
          },
          _rootNode: {
              type: String,
              value: ""
          },
          _rootEntityType: {
              type: String,
              value: ""
          },
          _rootRelationshipName: {
              type: String,
              value: ""
          },
          _showEntityGraphContents: {
              type:Boolean,
              value:true
          },
          excludeNonContextual: {
              type: Boolean,
              value: false
          },
          _valuePathRegEx: {
              type: String,
              value: /#@#|>>/
          }
      }
  }
  static get observers(){
      return [
          
      ]
  }
  _onContextDataChange(){
      if(!_.isEmpty(this.contextData)) {
          //Preventing displaying the entity graph screen when user has selected more than 1 context.
          if(!_.isEmpty(this.contextData.Contexts) && this.contextData.Contexts.length > 1){
              this._graphTreeConfig = {};
              this._showEntityGraphContents = false;
              return;
          }

          this._showEntityGraphContents = true;
          let context = DataHelper.cloneObject(this.contextData);
          //App specific
          let appName = ComponentHelper.getCurrentActiveAppName();
          if(appName) {
              context[ContextHelper.CONTEXT_TYPE_APP] = [{
                  "app": appName
              }];
          }                
          this.requestConfig('rock-entity-graph', context);
      }
  }
  onConfigLoaded(componentConfig) {
      if(componentConfig && componentConfig.config) {
          let currentActiveApp = ComponentHelper.getCurrentActiveApp();
          if(currentActiveApp) {
            let sideBar = currentActiveApp.shadowRoot.querySelector("rock-sidebar");
            if(sideBar && !sideBar.collapse) {
                ComponentHelper.fireBedrockEvent("collapse-sidebar","",{ ignoreId: true });      
            }
          }
              this.configData = componentConfig.config;
              if(_.isEmpty(this._graphTreeConfig)){
                  this._graphTreeConfig = componentConfig.config.entityGraphTreeConfig;
                  if(this._graphTreeConfig.isClassificationTree){
                      this._initiateClassificationTree();    
                  }
              }else{
                  this._onGridConfigLoaded(componentConfig.config);
              }                
      }   
  }
  _isClassificationTree(){
      if(this._graphTreeConfig && this._graphTreeConfig.isClassificationTree){
          return true;
      }
      return false;
  }
  _initiateClassificationTree() {
      let rootNodeInitialGet = this.shadowRoot.querySelector("#rootNodeInitialGet");
      if (rootNodeInitialGet) {
          let contextData = DataHelper.cloneObject(this.contextData);
          if (_.isEmpty(this._graphTreeConfig.rootEntitySearchCriteria)) {
              this.logError("Config - Root entity search details missing.");
              return;
          }
          let relType = this._graphTreeConfig.rootEntitySearchCriteria.relationshipType;
          let type = this._graphTreeConfig.rootEntitySearchCriteria.type;
          let firstItemContext = ContextHelper.getFirstItemContext(contextData) || {};
          let itemContext = { "attributeNames": ["_ALL"], "type": type };

          let classificationCriteria = {};
          classificationCriteria[relType] = { "relTo": { "id": firstItemContext.id, "type": firstItemContext.type } };
          itemContext.relationshipsCriterion = [classificationCriteria];
          contextData[ContextHelper.CONTEXT_TYPE_ITEM] = [itemContext];
          contextData[ContextHelper.CONTEXT_TYPE_DATA] = [];

          this._rootNodeGetRequest = DataRequestHelper.createEntityGetRequest(contextData);
          rootNodeInitialGet.generateRequest();
      }
  }

  get detailTabs() {
      this._detailTabs = this._detailTabs || this.shadowRoot.querySelector("#rockRelationshipTabs");
      return this._detailTabs;
  }

  _refreshView() {
      if (this.detailTabs) {
          this.detailTabs.readyToRender(true);
          this.detailTabs.reloadCurrentTab();
      }
  }

  _onInitiateSearchResponse(e) {
      let totalRecords = this.initiateSearchResponse.content.totalRecords;
      if (totalRecords) {
          let rootNodeDetailsGet = this.shadowRoot.querySelector("#rootNodeSearchResultDetail");
          if (rootNodeDetailsGet) {
              rootNodeDetailsGet.generateRequest();
          }
      } else {
          this.logError("Process failed - Root classification not available for this taxonomy.");
      }
  }
  _onRootNodeGetResponse(ev) {
      let rootNodeData = {}
      if (!DataHelper.isValidObjectPath(ev, "detail.response.content.entities.0")) {
          this.logError("Entity details not available.");
          return;
      }
      let entity = ev.detail.response.content.entities[0];
      if (entity.data) {
          rootNodeData['text'] = this._getNodeTitle(entity, this._graphTreeConfig.treeNodeTitle);
      }
      rootNodeData.isRootNode = true;
      rootNodeData.expanded = true;
      this._rootNode = rootNodeData.id = entity.id;
      this._rootEntityType = rootNodeData.type = entity.type;
      if (DataHelper.isValidObjectPath(this._graphTreeConfig, "relationships.0.relationshipName")) {
          let relationshipName = this._graphTreeConfig.relationships[0].relationshipName;
          this._rootRelationshipName = rootNodeData.relationshipName = relationshipName;
          rootNodeData.relationshipOwnership = "whereused";
      }

      if (rootNodeData.id) {
          timeOut.after(30).run(() => {
              this.set("_rootNodeData", rootNodeData);
              const contextTree = this.shadowRoot.querySelector("#classificationTree");
              if (contextTree) {
                  contextTree.selectedClassifications = this.getGraphItemsFromNavigationData("rock-entity-graph");
                  contextTree.generateRequest();
              }
          })
      } else {
          console.warn("No taxonomy found.")
      }
  }
  _onRootNodeGetError(e) {
      this.logError("Root node get failed.", e);
  }
  getGraphItemsFromNavigationData(componentName) {
      let graphItems = [];
      let navigationData = this.getNavigationData(componentName);
      if (!_.isEmpty(navigationData) && navigationData.valuePath) {
          let pathList = navigationData.valuePath.split(this._valuePathRegEx);
          graphItems.push(pathList);
      }
      return graphItems;
  }
  setGraphNavigationData(componentName, data) {
      this.setNavigationData(componentName, data);
  }
  _getNodeTitle(entity, attribute){
      let _title = "";
      if(entity && attribute){
          if(attribute.indexOf("attribute:") > -1){
              let _keyName = attribute.substr(10, attribute.length);
              let _attribute;
              if(entity.data){
                  _attribute = EntityHelper.getAttribute(entity, _keyName);
              }else{
                  if(entity.attributes && entity.attributes[_keyName]){
                      _attribute = entity.attributes[_keyName];
                  }
              }
              _title = AttributeHelper.getFirstAttributeValue(_attribute);
          }else{
              _title = attribute;
          }
      }
      if(!_title && entity.id){
          _title = entity.id;
      }
      return _title;
  }
  _onClassificationClickHandler(ev){
      let selectedNode = ev.detail;
      if(selectedNode){
          selectedNode.highlightNode = true;
          if(!_.isEmpty(this._selectedClassificationNode)){
              this._selectedClassificationNode.highlightNode = false;
          }
          this._selectedClassificationNode = selectedNode;
          if(selectedNode.nodeData){
              let clonedClassification = DataHelper.cloneObject(selectedNode.nodeData);
              clonedClassification.viewMode = "GRID";
              this.set("selectedItem", clonedClassification);
              this.setGraphNavigationData("rock-entity-graph", this.selectedItem);
          }
      }
  }
  _initiateModelRequest(){
      if(!this.selectedItem.modelLoaded){
          let entityModelElement = this.shadowRoot.querySelector("#liquidModelGet");
          if(entityModelElement){
              if(this.selectedItem.isRootNode){
                  let ids = [this.selectedItem.relationshipName+"_relationshipModel"];
                  entityModelElement.requestData = DataRequestHelper.createGetModelRequest("relationshipModel", ids);
                  entityModelElement.generateRequest();
              }
          }
      }else{
          this._onGridConfigLoaded();
      }
  }
  _onModelReceived(ev){

      // this.selectedItem.modelResponse = ev.
      this.selectedItem.modelLoaded = true;
      this._onGridConfigLoaded();
  }
  /**
   * Checks if the given component is visible or not
   */
  _getVisibility(componentName) {           
     if (typeof (this.configData) == "object") {
         if(this.configData.componentsVisibility) {
             return this.configData.componentsVisibility[componentName];
         }
     }
 }

  refresh(){
      this._onRefreshGrid();
      this._onRefreshClassificationTree();
  }
  _onRefreshTree(ev){
      let graphTree = this.shadowRoot.querySelector("#graphTree");
      if(graphTree){
          if(this.selectedItem && !_.isEmpty(this.selectedItem)){
              graphTree.reRenderTreeChildList();
          }else if(ev && ev.detail && ev.detail.refreshFirstNode){
              graphTree.reRenderFirstNode();
          }
      }
  }
  _onRefreshClassificationTree(){
      let classificationTree = this.shadowRoot.querySelector("#classificationTree");
      if(classificationTree){
          classificationTree.resetSearch();
      }
  }
  _onRefreshGrid(ev){
      let relationshipManage = this.shadowRoot.querySelector("#relationshipManage");
      if(relationshipManage){
          relationshipManage.refresh()
      }
      let quickManageDom = this.shadowRoot.querySelector('#entityQuickManage');
      if(quickManageDom){
          quickManageDom.refresh();
      }
  }
  _isGraphTreeConfigAvailable(graphTreeConfig) {
      if(!_.isEmpty(graphTreeConfig)) {
          return true;
      }
      return false;
  }
  _onTreeItemChange(){
      if(!_.isEmpty(this.selectedItem) && this.selectedItem.viewMode){
          let entityContextData = this._getEntityContextData();
          this.set("_entityContextData", entityContextData);
          if(this._isClassificationTree()) {
              let context = DataHelper.cloneObject(this._entityContextData);
                  this._tabContextData = DataHelper.cloneObject({});
                  this._tabContextData = DataHelper.cloneObject(context);
                  this.set("_panelContentLoaded", true);
                  timeOut.after(100).run(() => {
                      this._refreshView();
                  });
          }
          if(this._isGridView()){
              this.set("_panelContentLoaded", false);
              let context = DataHelper.cloneObject(this._entityContextData);
                  context[ContextHelper.CONTEXT_TYPE_APP] = [{
                      "app": "app-entity-manage"
                  }];
                  this.requestConfig("rock-entity-detail-tabs", context);
          }else{
              this.set("_panelContentLoaded", true);
              timeOut.after(100).run(() => {
                  this._reloadQuickManage();
              })
          }
          //this.set("_panelContentLoaded", true);

      }else{
          this.set("_entityConfigContext", {});
          this.set("_entityContextData", {});
      }
  }
  _reloadQuickManage(){
      let quickManageDom = this.shadowRoot.querySelector('#entityQuickManage');
      if(quickManageDom){
          quickManageDom.reset();
          quickManageDom.contextData= this._entityContextData;
          quickManageDom.selectedEntity = {id:this.selectedItem.id, type:this.selectedItem.type}
          quickManageDom.reloadHeader();
      }
  }
  _reloadGrid(mode, doSyncValidation, noOfColumns, configContext){
      let relationshipManage = this.shadowRoot.querySelector("#relationshipManage");
      if(relationshipManage){
          relationshipManage.reset();
          microTask.run(() => {
              relationshipManage.mode = mode;
              relationshipManage.doSyncValidation = doSyncValidation;
              relationshipManage.noOfColumns = noOfColumns;
              if(this.selectedItem.relationshipName){
                  relationshipManage.relationship = this.selectedItem.relationshipName;
              }
              relationshipManage.configContext = configContext;
              relationshipManage.contextData = this._entityContextData;
          });
      }
  }
  _visibleMessageCard(_selectedItem){
      if(_selectedItem && _selectedItem.viewMode){
          return false;
      }
      return true;
  }
  _visibleGridView(_selectedItem){
      if(this.selectedItem && this.selectedItem.viewMode  && this._isGridView() && this._panelContentLoaded){
          return true;
      }
      return false;
  }
  _visibleQuickManageView(){
      this.set("onlyAttribute","");
      if(this.selectedItem && this.selectedItem.viewMode  && !this._isGridView() && this._panelContentLoaded){
          this.set("onlyAttribute","only-attribute");
          return true;
      }            
      return false;
  }
  _isGridView(){
      return this.selectedItem && (this.selectedItem.viewMode == "GRID");
  }
  _isAssets(){
      if(this.selectedItem && this.selectedItem.type){
          if(this.selectedItem.type == "image" || this.selectedItem.type == "video" ||
                          this.selectedItem.type == "document" || this.selectedItem.type == "audio"){
              return true;
          }
      }
      return false;
  }
  _onGridConfigLoaded(tabConfig){
      let configContext = {};
      let mode, doSyncValidation, noOfColumns;

      if(tabConfig && !_.isEmpty(tabConfig)){
          let componentProperties;
          if(tabConfig.tabItems){
              if(this._isAssets() && tabConfig.tabItems.assets){
                  let assetComponent = tabConfig.tabItems.assets;
                  if(assetComponent.component && assetComponent.component.properties){
                      componentProperties = assetComponent.component.properties;
                  }
              }else if(tabConfig.tabItems.relationships && !configContext.direction){
                  let relComponent = tabConfig.tabItems.relationships;
                  if(relComponent.component && relComponent.component.properties){
                      componentProperties = relComponent.component.properties;
                  }
              }
          }
          if(componentProperties && !_.isEmpty(componentProperties)){
              if(componentProperties['config-context']){
                  let _configContext =  componentProperties['config-context'];
                  if(_configContext.addRelationshipMode){
                      configContext["addRelationshipMode"] = _configContext.addRelationshipMode;
                  }
                  if(_configContext.relationshipType){
                      configContext["relationshipType"] = _configContext.relationshipType;
                  }
                  if(_configContext.domain){
                      configContext["domain"] = _configContext.domain;
                  }
              }
              if(componentProperties['mode']){
                  mode = componentProperties['mode'];
              }
              if(componentProperties['do-sync-validation']){
                  doSyncValidation = componentProperties['do-sync-validation'];
              }
              if(componentProperties['no-of-columns']){
                  noOfColumns = componentProperties['no-of-columns'];
              }
          }
      }else if(this._isClassificationTree()){
          if(this.selectedItem.isRootNode){
              if(this.selectedItem){
                  if(this.selectedItem.relationshipName){
                      configContext.relationshipNames = [this.selectedItem.relationshipName];
                      configContext.relationshipTypeName = this.selectedItem.relationshipName;
                      configContext["relationshipType"] = this.selectedItem.relationshipName;
                  }
                  if(this.selectedItem.relationshipOwnership && this.selectedItem.relationshipOwnership == "whereused"){
                      configContext.direction = "up";
                      if(this.selectedItem.type){
                          configContext.fromEntityType = this.selectedItem.type
                      }
                  }
              }
          }
          else{
              configContext.relationshipNames = ["belongsto"];
              configContext.direction = "up";
              configContext.relationshipTypeName = "belongsto";
              configContext.fromEntityType = "classification";
          }
      }
      if(this.selectedItem){
          if(this.selectedItem.direction){
              configContext.direction = this.selectedItem.direction;
          }
          if(this.selectedItem.fromEntityType){
              configContext.fromEntityType = this.selectedItem.fromEntityType;
          }
          if(this.selectedItem.relationshipName){
              configContext["relationshipTypeName"] = this.selectedItem.relationshipName;
          }
          this.set('excludeNonContextual',this.selectedItem.excludeNonContextual)
      }
      this.set("_panelContentLoaded", true);
      timeOut.after(100).run(() => {
          this._reloadGrid(mode, doSyncValidation, noOfColumns, configContext);
      })
  
  }
  _getEntityContextData(){
      let contextData = DataHelper.cloneObject(this.contextData);
      let domain = DataHelper.isValidObjectPath(this.contextData, "ItemContexts.0.domain") ? this.contextData.ItemContexts[0].domain : undefined;
      
      if(this.selectedItem && !_.isEmpty(this.selectedItem)){
          let itemContext = {}
          if(this.selectedItem.id){
              itemContext.id = this.selectedItem.id;
          }
          if(this.selectedItem.relationshipName){
              itemContext.relationships = [this.selectedItem.relationshipName];
          }
          if(this.selectedItem.type){
              itemContext.type = this.selectedItem.type;
          }
          
          if(this._isGridView()){
              if(this.selectedItem.parentType){
                  itemContext.type = this.selectedItem.parentType;
              }
          }
          if(this._isAssets()){
              if(!this._isGridView()){
                  contextData[ContextHelper.CONTEXT_TYPE_DOMAIN] = [{domain:"digitalAsset"}];
              }
          }
          itemContext.domain = domain;
          contextData[ContextHelper.CONTEXT_TYPE_ITEM] = [itemContext];
      }else{
          delete contextData['ItemContexts'];
      }
      return contextData;
  }

  _onConfigureVariantsTap() {
      this.openBusinessFunctionDialog({name: 'rock-wizard-variant-configurator'});
  }
}

customElements.define(RockEntityGraph.is, RockEntityGraph)
