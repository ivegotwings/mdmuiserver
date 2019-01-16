import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-helpers/entity-helper.js';
import '../bedrock-helpers/attribute-helper.js';
import EntityTypeManager from '../bedrock-managers/entity-type-manager.js';
import '../liquid-entity-model-get/liquid-entity-model-get.js';
import '../liquid-entity-data-get/liquid-entity-data-get.js';
import '../pebble-tree/pebble-tree.js';
import '../pebble-spinner/pebble-spinner.js';
import './entity-graph-tree-datasource.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockEntityGraphTree
    extends mixinBehaviors([
        RUFBehaviors.UIBehavior
    ], PolymerElement) {
  static get template() {
    return html`
         <style>
             :host{           
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
         </style>
        <liquid-entity-model-get id="liquidModeleGet" operation="getbyids" request-data="[[_modelRequest]]" on-response="_onModelReceived" on-error="_onModelGetFailed"></liquid-entity-model-get>
        <liquid-entity-data-get id="titleAttributeGet" operation="getbyids" request-data="[[_titleRequest]]" on-response="_onTitleAttributesGetResponse"></liquid-entity-data-get>

        <entity-graph-tree-datasource where-used-request="{{_whereUsedRequest}}" where-used-data-source="{{_whereUsedDataSource}}" owned-relationships-request="{{_ownedRelationshipsRequest}}" owned-data-source="{{_ownedDataSource}}"></entity-graph-tree-datasource>

        <pebble-spinner active="[[_loading]]"></pebble-spinner>
        <pebble-tree id="tree" leaf-node-only="[[leafNodeOnly]]" data="{{_graphs}}" default-child-depth="10" multi-select="[[multiSelect]]" expand-collapse-icon-object="[[_expandCollapseIconObject]]"></pebble-tree>
        <bedrock-pubsub event-name="tree-node-child-list-refreshed" handler="_childListRefreshed"></bedrock-pubsub>
`;
  }

  static get is() { return 'rock-entity-graph-tree' }
  static get properties() {
      return {
          contextData: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          treeConfig: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          leafNodeOnly: {
              type: Boolean,
              value: true
          },
          _graphs: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          _graphData: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _selectedItems: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          _selectedItem: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          multiSelect: {
              type: Boolean,
              value: false
          },
          _currentNode: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _whereUsedRequest: {
              type: Object,
              value: function () {
                  return {}
              }
          },
          _whereUsedDataSource: {
              type: Object,
              notify: true
          },
          _ownedDataSource: {
              type: Function,
              notify: true
          },
          _ownedRelationshipsRequest: {
              type: Object,
              notify: true
          },
          _currentNodeData: {
              type: Object
          },
          itemData: {
              type: Object,
              value: function () {
                  return {};
              },
              notify: true
          },
          _modelRequest: {
              type: Object
          },
          _titleRequest: {
              type: Object,
              value: function () {
                  return {}
              }
          },
          _entityModels: {
              type: Array,
              value: function () {
                  return []
              }
          },
          _pageSize: {
              type: Number,
              value: 10
          },
          _selectedNode: {
              type: Object
          },
          _preSelectedItemId: {
              type: Object
          },
          _pebbleTree: {
              type: Element
          },
          _loading: {
              type: Boolean,
              value: false
          },
          _expandCollapseIconObject: {
              type: Object,
              value: function () {
                  return {
                      expand: "pebble-icon:action-expand",
                      collapse: "pebble-icon:action-scope-take-selection"
                  }
              }
          },
          excludeNonContextual: {
              type: Boolean,
              value: false
          },
          _selectedGraphPaths: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          enableNodeClick: {
              type: Boolean,
              value: false
          },
          _currentGraphItem: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          _graphIndex: {
              type: Number,
              value: 0
          },
          _currentIndex: {
              type: Number,
              value: 0
          }
      }
  }

  connectedCallback() {
      super.connectedCallback();
      this.addEventListener('tree-node-expanded', this._treeNodeExpanded)
      this.addEventListener('tree-node-clicked', this._treeNodeClicked)
      this.addEventListener('node-search-updated', this._nodeSearchUpdated)
      this.addEventListener('node-pagination-handler', this._nodePaginationHandler)
  }
  disconnectedCallback() {
      super.disconnectedCallback();
      this.removeEventListener('tree-node-expanded', this._treeNodeExpanded)
      this.removeEventListener('tree-node-clicked', this._treeNodeClicked)
      this.removeEventListener('node-search-updated', this._nodeSearchUpdated)
      this.removeEventListener('node-pagination-handler', this._nodePaginationHandler)
  }
  ready(){
      super.ready();
      this._loading = true;
      this._pebbleTree = this.shadowRoot.querySelector("#tree");
      if(!_.isEmpty(this.treeConfig)){
          this.treeConfig.id = DataHelper.getParamValue('id');
          this.treeConfig.type = DataHelper.getParamValue('type');
          if(this.treeConfig.pageSize){
              this._pageSize = this.treeConfig.pageSize;
          }

          let entityModelElement = this.shadowRoot.querySelector("#liquidModeleGet");
          if(entityModelElement){
              this._modelRequest = this._getModelRequest();
              entityModelElement.generateRequest();
          }
      }
      
  }
  _initiateGraphTree(_title){
      let graphData = DataHelper.cloneObject(this.treeConfig); 
      graphData.text = _title; 
      this._updateConfigWithGraphModel(graphData);
      graphData.expanded = true;
      graphData.viewMode = "";
      graphData.value = _title;
      graphData.children = graphData.relationships;
      graphData.dataLoaded = true;
      this._graphData = {};
      this._graphData = graphData;
      // this._currentNodeData = this._graphData;
      this._graphs = [this._graphData];
      this._loading = false;
      this._selectedGraphPaths = this.domHost.getGraphItemsFromNavigationData("rock-entity-graph-tree");
      this._checkForSelectedGraphItem();
  }
  _initiateTitleGet(){
      let titleAttributeGet = this.shadowRoot.querySelector("#titleAttributeGet");
      if(titleAttributeGet){
          if (this.contextData && this.contextData.ItemContexts && this.contextData.ItemContexts.length > 0) {
              let itemContext = this.contextData.ItemContexts[0];
              //add attribute names in item context
              let attribute = this._parseNodeTitle(this.treeConfig.treeNodeTitle);
              if(attribute){
                  itemContext.attributeNames = [attribute];
              }
              this._titleRequest = DataRequestHelper.createEntityGetRequest(this.contextData, true);
              titleAttributeGet.generateRequest();
          }
      }
  }
  _onTitleAttributesGetResponse(ev){
      if(ev && ev.detail && ev.detail.response){
          const res = ev.detail.response;
          if(!_.isEmpty(res)){
              let entityValidation = DataHelper.validateGetEntitiesResponse(res);
              if(entityValidation){
                  let ent_id = DataHelper.getParamValue('id');
                  let entity = DataHelper.findEntityById(res.content.entities, this.treeConfig.id);
                  if(entity){
                      let nodeTitle = this.treeConfig.treeNodeTitle;
                      let attribute = this._parseNodeTitle(this.treeConfig.treeNodeTitle);
                      if(attribute){
                          nodeTitle = this._getNodeTitle(entity, this.treeConfig.treeNodeTitle);
                      }
                      this.treeConfig.title = nodeTitle;
                      this._initiateGraphTree(nodeTitle);
                  }
              }
          }
      }
  }
  _childListRefreshed() {
      this._checkForSelectedGraphItem();
  }
  //If _selectedGraphPaths available, then only pre selection process triggers
  _checkForSelectedGraphItem() {
      if (_.isEmpty(this._graphs) || _.isEmpty(this._selectedGraphPaths) || this._graphIndex == this._selectedGraphPaths.length) {
          return;
      }
      if (!this._currentGraphItem) {
          this._graphIndex = 0;
          this._currentIndex = 0;
      }
      this._currentGraphItem = this._selectedGraphPaths[this._graphIndex];
      let name = this._currentGraphItem[this._currentIndex];
      if (this._currentIndex == 0) {
          this._currentNode = this.shadowRoot.querySelector("#tree").getElementNodeByPath(name);
      } else if (this._currentIndex == this._currentGraphItem.length) {
          if (this.enableNodeClick) {
              this._currentNode.triggerNodeClick();
          } else {
              this._currentNode.selectItem();
          }
          this._graphIndex++;
          this._currentIndex = 0;
          this._checkForSelectedGraphItem();
          return;
      } else {
          let childNodes = this._currentNode.getChildNodes();
          let matchedChild;
          for (let i in childNodes) {
              if (childNodes[i].nodeData.text == name) {
                  matchedChild = childNodes[i];
                  break;
              }
          }
          if (matchedChild) {
              this._currentNode = matchedChild;
          } else {
              this._graphIndex++;
              this._currentIndex = 0;
              this._checkForSelectedGraphItem();
              return;
          }
      }
      this._currentIndex++;
      if (this._currentNode) {
          if (this._currentNode.expanded) {
              this._checkForSelectedGraphItem();
          } else {
              this._currentNode.expand();
          }
      }
  }
  _treeNodeExpanded (e) {
      this._currentNode = e.detail;
      if (this._currentNode.nodeData) {
          if (!this._currentNode.nodeData.dataLoaded) {
              this._currentNodeData = this._currentNode.nodeData;
              this._executeRequest();
              this._currentNode.startLoading();
          } else {
              this._checkForSelectedGraphItem();
          }
      }
  }
  _treeNodeClicked (e){
      if(e && e.detail && e.detail.data){
          let node = e.detail.data;
          this._currentNode = node;
          if(node.nodeData){
              this._currentNodeData = node.nodeData;
              this._deselectAllTreeNodes();
              if(this._selectedNode){
                  this._selectedNode.highlightNode = false;
                  this._selectedNode = null;
              }
              this._selectedNode = node;
              this._selectedNode.highlightNode = true;

              this.itemData = {};
              this.itemData = node.nodeData;
              this.domHost.setGraphNavigationData("rock-entity-graph-tree", node.nodeData);
          }else{
              this.itemData = {}
          }
      }
      
  }
  _nodeSearchUpdated(ev){

      if(ev.detail && ev.detail.query){
          let _searchQuery = ev.detail.query;
      }
  }
  _deselectAllTreeNodes(){
      if(this._currentNode && !_.isEmpty(this._currentNode)){
          let nodes = this._currentNode.getChildNodes();
          let highLightedNodes = nodes.filter((node) => { return node.nodeData.highlightNode || node.highlightNode; });
          if(highLightedNodes && highLightedNodes.length){
              highLightedNodes.forEach(nodeItem => {
                  nodeItem.highlightNode = false;
                  if(nodeItem.nodeData && nodeItem.nodeData.highlightNode){
                      delete nodeItem.nodeData.highlightNode;
                  }
                  let itemPath = nodeItem.itemPath;
                  nodeItem.itemPath = "";
                  nodeItem.itemPath = itemPath;
              });
          }
      }
  }
  _nodePaginationHandler(ev){
      if(ev && ev.detail && ev.detail.data && ev.detail.data.nodeData){
          let nodeData = ev.detail.data.nodeData;
          this._currentNodeData = nodeData;
          if(ev.detail.mode){
              let mode = ev.detail.mode;
              if(mode == "NEXT"){
                  this._currentNodeData.page++;
              }else if(mode == "PREV"){
                  this._currentNodeData.page--;
              }
              if(this._selectedNode){
                  this._selectedNode.highlightNode = false;
                  if(this._selectedNode.nodeData && this._selectedNode.nodeData.id){
                      this._preSelectedItemId = this._selectedNode.nodeData.id;
                  }
                  this._selectedNode = null;
              }
              this._executeRequest();
              this._currentNode = ev.detail.data;
              this._currentNode.startLoading();
          }
      }
  }
  _getModelRequest(){
      if(_.isEmpty(this.treeConfig))
      {
          return;
      }
      let params = {
                      "query": {
                          
                          "filters": {
                              "typesCriterion": [
                                  "entityManageModel"
                              ]
                          }
                      },
                      "fields": {
                          "relationships": []
                      },
                      "options": {
                          "maxRecords": 200
                      }
                  }
      let relationships = [];
      function getRelationshipName(_obj){
          if(_obj && !_.isEmpty(_obj)){
              if(_obj.relationshipName){
                  relationships.push(_obj.relationshipName);
              }
              if(_obj.relationships && _obj.relationships.length > 0){
                  for (let i = 0; i < _obj.relationships.length; i++) {
                      const rel = _obj.relationships[i];
                      getRelationshipName(rel);
                  }
              }
          }
      }
      getRelationshipName(this.treeConfig);
      params.fields.relationships = relationships;
      //adding manage model ids
      let domainContext = ContextHelper.getFirstDomainContext(this.contextData);
      if(domainContext.domain){
          let entityTypes = EntityTypeManager.getInstance().getTypesByDomain(domainContext.domain);
          if(!_.isEmpty(entityTypes)){
              let manageModelIds = [];
              entityTypes.forEach((entityType) => {
                  manageModelIds.push(entityType+'_entityManageModel');
              })
              params.query.ids = manageModelIds;
          }
      }
      let req = {params:params};
      return req;
  }
  _onModelReceived(ev){
      if(ev && ev.detail && ev.detail.response){
          const res = ev.detail.response;
          if(res.content && (res.status == "success")){
              if(res.content.entityModels){
                  this._entityModels = [];
                  this._entityModels = res.content.entityModels;
                  this._initiateTitleGet();
              }
             
          }
      }
  }
  _updateConfigWithGraphModel(relObj){
      if(relObj && !_.isEmpty(relObj) && relObj.type){
          let modelId = relObj.type+"_entityManageModel";
          let entity = DataHelper.findEntityById(this._entityModels, modelId);
          if(entity){
              if(relObj.relationships){
                  for (let i = 0; i < relObj.relationships.length; i++) {
                      let relationship = relObj.relationships[i];
                      
                      if(relationship && relationship.relationshipName){
                          let _relationshipDataArray = EntityHelper.getRelationshipByType(entity, null, relationship.relationshipName, true);
                          if(_relationshipDataArray && _relationshipDataArray.length > 0){
                              let _relProperties = _relationshipDataArray[0].properties;
                              if(_relProperties.externalName){
                                  relationship.displayName = "All "+_relProperties.externalName+" of ";
                              }
                              if(relObj.title){
                                  relationship.text = relationship.displayName + relObj.title;
                              }
                              // relationship.searchNode = true;
                              if(_relProperties.relationshipOwnership){
                                  relationship.relationshipOwnership = _relProperties.relationshipOwnership;
                                  if(relationship.relationshipOwnership == "whereused"){
                                      relationship.direction = "up";
                                      if(_relProperties.relatedEntityInfo && _relProperties.relatedEntityInfo.length){
                                          if(_relProperties.relatedEntityInfo[0].relEntityType){
                                              relationship.fromEntityType = _relProperties.relatedEntityInfo[0].relEntityType;
                                          }
                                      }
                                  }
                              }
                              if(_relProperties.relatedEntityInfo && _relProperties.relatedEntityInfo.length > 0){
                                  relationship.type = _relProperties.relatedEntityInfo[0].relEntityType;
                              }
                              if(relObj.id){
                                  relationship.id = relObj.id;
                              }
                              if(relObj.id){
                                  relationship.parentType = relObj.type;
                              }
                              if(relationship.treeNodeTitle){
                                  relationship.attribute = this._parseNodeTitle(relationship.treeNodeTitle);
                              }
                              relationship.page = 0;
                              relationship.dataLoaded = false;
                          }
                          this._updateConfigWithGraphModel(relationship);
                      }
                  
                  }   
                  // relObj.children = relObj.relationships;
                  relObj.attribute = this._parseNodeTitle(relObj.treeNodeTitle);
                  relObj.page = 0;
                  relObj.dataLoaded = false;
              }
              relObj.viewMode = "GRID";
          }
      }
  }
  _onModelGetFailed(e){
      //Need to log error
  }
  _updatePaginationNode(){
      if(this._currentNode && !_.isEmpty(this._currentNodeData)){
          if(this._currentNodeData.totalCount > this._pageSize){
              // this._currentNode.searchNode = true;
              let nextTitle = "";
              let prevTitle = "";
              let startIndex = ((this._currentNodeData.page+1)*this._pageSize) + 1; 
              let endIndex = (startIndex + this._pageSize - 1);
              if(startIndex <= this._currentNodeData.totalCount){
                  if(endIndex > this._currentNodeData.totalCount){
                      endIndex = this._currentNodeData.totalCount;
                  }
                  if(endIndex <= this._currentNodeData.totalCount){
                      nextTitle = "Next ( "+startIndex+" - "+endIndex+" / "+ this._currentNodeData.totalCount+" )";
                  }
              }
              
              if(startIndex > (this._pageSize+1)){
                  startIndex = ((this._currentNodeData.page-1)*this._pageSize)+1;
                  prevTitle = "Previous ( "+(startIndex)+" - "+(startIndex+this._pageSize-1)+" / "+ this._currentNodeData.totalCount+" )";
              }
              if(this._currentNodeData.maxRecords){
                  if((((this._currentNodeData.page+1) * this._pageSize) % this._currentNodeData.maxRecords) == 0){
                      nextTitle = "";
                  }
              }
              this._currentNode.paginationObj = {nextTitle:nextTitle, prevTitle:prevTitle};
          }else{
              this._currentNode.paginationObj = {};
          }
      }
  }
  _executeRequest(){
      if(this._currentNodeData){     
          if(this._currentNodeData.relationshipOwnership && (this._currentNodeData.relationshipOwnership == "owned")){
              //For owned
              this._ownedRelationshipsRequest = this._getRelationshipsRequest();
              this._ownedDataSource({page:this._currentNodeData.page, pageSize:this._pageSize}, this._onOwnedRelationshipsResponse.bind(this), this._onOwnedDataSourceError.bind(this))
          }else{
              //For whereUsed 
              this._whereUsedRequest = this._getRelationshipsRequest();
              let whereUsedOptions = {
                  page:this._currentNodeData.page, 
                  pageSize:this._pageSize,
                  initResponse:this._currentNodeData.initResponse
              }
              this._whereUsedDataSource(whereUsedOptions, this._onWhereUsedRelationshipsResponse.bind(this), this._onWhereUsedDataSourceError.bind(this));
          }
      }
  }
  _getRelationshipsRequest(){
      let req = DataRequestHelper.createEntityGetRequest(this.contextData, true);
      if(req && req.params){
           
          req.params.fields.attributes = [this._currentNodeData.attribute];
          req.params.fields.relationships = [this._currentNodeData.relationshipName];
          req.params.fields.relationshipAttributes = [this._currentNodeData.attribute];
          req.params.fields.relatedEntityAttributes = [this._currentNodeData.attribute];

          if(this._currentNodeData.relationshipOwnership == "whereused"){                
              //Where used criterion
              let relationshipsCriterion = [];
              let relCriterion = {};
              let dataContexts = ContextHelper.getDataContexts(this.contextData);
              let relationships = this.treeConfig.relationships;
              this.excludeNonContextual = false;
              for(let relationshipIndex = 0 ;relationshipIndex < relationships.length ; relationshipIndex++){
                  if(relationships[relationshipIndex].relationshipName && relationships[relationshipIndex].relationshipName == this._currentNodeData.relationshipName){
                      if(relationships[relationshipIndex].excludeNonContextual){
                          this.excludeNonContextual = relationships[relationshipIndex].excludeNonContextual
                      }
                      break;
                  }
              }
              let relTo = {
                  "relTo":{
                      id:this._currentNodeData.id,
                      type:this._currentNodeData.parentType
                  }
              }
           
              relCriterion[this._currentNodeData.relationshipName] = relTo;
              if (dataContexts && dataContexts.length && this.excludeNonContextual) {
                  relCriterion[this._currentNodeData.relationshipName]["contexts"] = dataContexts,
                  relCriterion[this._currentNodeData.relationshipName]["excludeNonContextual"] = !this.excludeNonContextual
                  req.params.query.filters.excludeNonContextual = this.excludeNonContextual;
              }
              relationshipsCriterion.push(relCriterion);
              req.params.query.filters.relationshipsCriterion = relationshipsCriterion;
              req.params.query.filters.typesCriterion = [this._currentNodeData.type];
              delete req.params.query.ids;
          }else{
              //assign entity ID
              req.params.query.ids = [this._currentNodeData.id];
              //assign entity type
              req.params.query.filters.typesCriterion = [this._currentNodeData.parentType];
          }
          delete req.params.query.id;
      }
      return req;
  }
  _onOwnedRelationshipsResponse(res){
      if(!_.isEmpty(res)){
          let entityValidation = DataHelper.validateGetEntitiesResponse(res);
          if(entityValidation){
              let entity = DataHelper.findEntityById(res.content.entities, this._currentNodeData.id);
              if(entity){
                  
                  let tempArray = [];
                  let _relationshipDataArray = EntityHelper.getRelationshipByType(entity, null, this._currentNodeData.relationshipName, true);
                  if(_relationshipDataArray && _relationshipDataArray.length > 0){
                      _relationshipDataArray.forEach(function(_relTo) {
                          if(_relTo && _relTo.relTo){
                              let _relToObj = _relTo.relTo;
                              _relToObj.text = this._getNodeTitle(_relToObj, this._currentNodeData.treeNodeTitle);
                              _relToObj.value = _relToObj.text;
                              _relToObj.viewMode = "QUICK_MANAGE";
                              _relToObj.parentType = this._currentNodeData.type;
                              _relToObj.dataLoaded = true;
                              
                              if(this._preSelectedItemId && (_relToObj.id == this._preSelectedItemId)){
                                  _relToObj.highlightNode = true;
                                  this._preSelectedItemId = "";
                              }
                              let configRelationships = [];
                              if(this._currentNodeData.relationships && this._currentNodeData.relationships.length > 0){
                                  for (let i = 0; i < this._currentNodeData.relationships.length; i++) {
                                      const rel = DataHelper.cloneObject(this._currentNodeData.relationships[i]);
                                      rel.id = _relToObj.id;
                                      rel.text = rel.displayName + _relToObj.text;
                                      configRelationships.push(rel);
                                  }
                                  _relToObj.relationships = configRelationships;
                                  _relToObj.children = configRelationships;
                              }
                              tempArray.push(_relToObj);
                          }
                      }, this);
                      this._currentNodeData.children = [];
                      this._currentNodeData.children = tempArray;
                  }

                  if(entity.relationshipsTotalCount){
                      if(entity.relationshipsTotalCount[this._currentNodeData.relationshipName]){
                          this._currentNodeData.totalCount = entity.relationshipsTotalCount[this._currentNodeData.relationshipName];
                      }
                      this._updatePaginationNode();
                  }

              }
          }
      }
      this._currentNodeData.dataLoaded = true;
      if(this._currentNode && this._currentNode.refreshChildList){
          this._currentNode.refreshChildList();
      }
      if(this._selectedNode){
          this._selectedNode.refreshChildList();
      }
  }

  _onWhereUsedRelationshipsResponse(res){
      if(res && !_.isEmpty(res) && res.result){
          let entityValidation = DataHelper.validateGetEntitiesResponse(res.result);
          this._currentNodeData.children = [];
          if(entityValidation && res.result.content && res.result.content.entities){
              let entities = res.result.content.entities;
              let tempArray = [];
              entities.forEach(function(entity) {
                  if(entity){
                      entity.text = this._getNodeTitle(entity, this._currentNodeData.treeNodeTitle);
                      entity.value = entity.text;
                      entity.viewMode = "QUICK_MANAGE";
                      entity.parentType = this._currentNodeData.type;
                      entity.dataLoaded = true;
                      if(this._preSelectedItemId && (entity.id == this._preSelectedItemId)){
                          entity.highlightNode = true;
                          this._preSelectedItemId = "";
                      }
                      let configRelationships = [];
                      if(this._currentNodeData.relationships && this._currentNodeData.relationships.length > 0){
                          for (let i = 0; i < this._currentNodeData.relationships.length; i++) {
                              const rel = DataHelper.cloneObject(this._currentNodeData.relationships[i]);
                              rel.id = entity.id;
                              rel.text = rel.displayName + entity.text;
                              configRelationships.push(rel);
                          }
                          entity.relationships = configRelationships;
                          entity.children = configRelationships;
                      }
                      tempArray.push(entity);
                  }
              }, this);
              
              this._currentNodeData.children = tempArray;   
          }
          if(res.totalCount){
              this._currentNodeData.totalCount = res.totalCount;
              this._updatePaginationNode();
          }
          if(res.initResponse){
              this._currentNodeData.initResponse = res.initResponse;
          }
          if(res.maxRecords){
              this._currentNodeData.maxRecords = res.maxRecords;
          }
      }
      this._currentNodeData.dataLoaded = true;
      if (this._currentNode && this._currentNode.refreshChildList) {
          this._currentNode.refreshChildList();
      }
      if(this._selectedNode){
          this._selectedNode.refreshChildList();
      }
  }
  _onOwnedDataSourceError(ev){
  }
  _onWhereUsedDataSourceError(ev){
  }
  _parseNodeTitle(_title){
      if(_title && (_title.indexOf("attribute:") > -1)){
          return _title.substr(10, _title.length);
      }
      return "";
  }
  _getNodeTitle(entity, attribute){
      let _title = "";
      if(entity){
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
              if(_attribute && !_.isEmpty(_attribute.values)){
                  let firstValueContext = ContextHelper.getFirstValueContext(this.contextData);
                  let selectedLocaleValues = AttributeHelper.getAttributeValues(_attribute.values, firstValueContext);
                  if(!_.isEmpty(selectedLocaleValues)){
                      _title = selectedLocaleValues[0];
                  }
                  if(!_title){
                      let defaultValueContext = DataHelper.getDefaultValContext();
                      let defaultLocaleValues = AttributeHelper.getAttributeValues(_attribute.values, defaultValueContext);
                      if(!_.isEmpty(defaultLocaleValues)){
                          _title = defaultLocaleValues[0];
                      }
                  }
              }
          }else{
              _title = attribute;
          }
      }
      if(!_title && entity.id){
          _title = entity.id;
      }
      return _title;
  }
  reRenderTreeChildList(){
      if(this._selectedNode){
          this._currentNodeData = this._selectedNode.nodeData;
          this._currentNodeData.children = [];
          this._executeRequest();
          this._selectedNode.startLoading();
      }
  }
  reRenderFirstNode(){
      if(this._pebbleTree){
          let firstNode = this._pebbleTree.getElementNodeByItemPath("0.0");
          if(firstNode){
              if(firstNode.nodeData && firstNode.nodeData.initResponse){
                  delete firstNode.nodeData.initResponse;
              };
              this._selectedNode = firstNode;
              this.reRenderTreeChildList()
          }
      }
  }
  // _refreshGraphTree: function(){
  //     this._graphs = [];
  //     this._graphs = [this._graphData];

  //     if(this._pebbleTree && this._selectedNode && this._selectedNode.valuePath){
  //         this._selectedNode = this._pebbleTree.getElementNodeByPath(this._selectedNode.valuePath);
  //         this._selectedNode.highlightNode = true;
  //     }
  // }
}
customElements.define(RockEntityGraphTree.is, RockEntityGraphTree);
