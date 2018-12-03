/**
`rock-context-tree` Represents a component that renders the list of contexts in a hierarchical tree format.

@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-app-context-behavior/bedrock-app-context-behavior.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-helpers/entity-helper.js';
import '../bedrock-helpers/attribute-helper.js';
import '../bedrock-helpers/element-helper.js';
import '../bedrock-style-manager/styles/bedrock-style-scroll-bar.js';
import '../liquid-entity-data-get/liquid-entity-data-get.js';
import '../pebble-spinner/pebble-spinner.js';
import '../pebble-tree/pebble-tree.js';
import '../pebble-checkbox/pebble-checkbox.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockContextTree extends mixinBehaviors([RUFBehaviors.UIBehavior,RUFBehaviors.ComponentContextBehavior,RUFBehaviors.ComponentConfigBehavior], OptionalMutableData(PolymerElement)) {
  static get template() {
    return Polymer.html`
        <style include="bedrock-style-common bedrock-style-scroll-bar bedrock-style-grid-layout bedrock-style-icons">
            :host {
                display: block;
                height: 100%;
            }

            .contextTree {
                overflow-y: auto;
                overflow-x: hidden;
                height: 100%;
            }

            .search-container {
                position: relative;
                display: block;
                width: 100%;
                padding: 10px 10px 0 10px;
                margin-bottom: 5px;
            }

            .checkbox-label-color {
                --pebble-checkbox-label-color: #75808b;
            }

            .resetsearch {
                position: absolute;
                right: 10px;
                bottom: -12px;
                font-size: var(--font-size-xs, 10px);
                color: var(--link-text-color, #036Bc3);
            }
            .status-error {
                color: var(--palette-pinkish-red);
            }
            .status-text{
                float: left;
                font-size: var(--font-size-sm);
                margin-left: 15px;
                font-weight: var(--font-medium);
            }

            .resetsearch pebble-button {
                height: auto;
                --pebble-button: {
                    font-size: var(--font-size-xs, 10px)!important;
                    height: auto;
                    padding-bottom: 0;
                }
                --pebble-icon-dimension: {
                    width: 12px;
                    height: 12px;
                }
                --pebble-button-left-icon: {
                    margin-right: 5px;
                }
            }
        </style>
        <div class="base-grid-structure">
            <div class="base-grid-structure-child-1">
                    <p class="status-text" hidden\$="[[!showContextText]]">[[selectedContextText]]</p>
                <div class="search-container">

                    <template is="dom-if" if="{{_showSearchBar}}">
                        <rock-search-bar id="searchBar" placeholder="Enter Search text" hide-rbl="true"></rock-search-bar>
                        <div class="resetsearch" hidden\$="[[!_resetSearchEnabled]]">
                            <pebble-button icon="pebble-icon:reset" class="btn-link pebble-icon-color-blue" on-tap="resetSearch" button-text="Reset Search"></pebble-button>
                        </div>
                    <bedrock-pubsub event-name="rock-search" handler="_onSearch" target-id="searchBar"></bedrock-pubsub>
                    </template>
                </div>
            </div>
            <div hidden\$="[[_contextsDataFound]]" class="status-error">No Contexts Found</div>
            <div class="base-grid-structure-child-2">
                <pebble-tree id="contextTree" class="contextTree" data="{{contextsData}}" check-child-nodes="[[checkChildNodes]]" default-child-depth="10" selected-items="{{selectedItems}}" selected-item="{{_selectedItem}}" multi-select="[[multiSelect]]" disable-child-node="[[disableChildNode]]" check-parent-nodes="[[checkParentNodes]]" select-parent-item="[[selectParentItem]]" leaf-node-only="[[leafNodeOnly]]" show-warning-on-unselect="[[showWarningOnUnselect]]"></pebble-tree>
            </div>
        </div>
        <bedrock-pubsub event-name="tree-node-child-list-refreshed" handler="_childListRefreshed"></bedrock-pubsub>
        <pebble-spinner active="[[loading]]"></pebble-spinner>
    <liquid-entity-model-get id="entityModelGet" operation="getbyids" request-data="{{_entityModelRequest}}" on-liquid-response="_onEntityModelGetResponse" on-liquid-error="_onEntityModelGetError"></liquid-entity-model-get>
     
    <liquid-entity-data-get id="entitySearchAndGet" operation="searchandget" request-data="[[request]]" on-response="_onEntitySearchAndGetResponse" last-response="{{entitySearchAndGetResponse}}" on-error="_onGetSearchError" exclude-in-progress="" include-type-external-name=""></liquid-entity-data-get>
`;
  }

  static get is() {
      return "rock-context-tree";
  }

  static get properties() {
      return {
          _isSearchMode: {
              type: Boolean,
              value: false
          },

          loading: {
              type: Boolean,
              value: false
          },

          _showSearchBar: {
              type: Boolean,
              value: false
          },

          _contextsDataFound: {
              type: Boolean,
              value: true
          },

          _currentNode: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          selectedContextsData: {
              type: Array,
              value: function () {
                  return [];
              },
              notify: true
          },

          selectedItems: {
              type: Array,
              value: function () {
                  return [];
              },
              notify: true
          },

          _selectedItem: {
              type: Object,
              value: function () {
                  return {};
              },
              notify: true
          },

          multiSelect: {
              type: Boolean,
              value: true
          },

          contextsData: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          _selectedContextsDataPath: {
              type: Array
          },

          /**
          * Specifies whether or not only leaf-node selection is enabled.
          */
          leafNodeOnly: {
              type: Boolean,
              value: false
          },
          checkChildNodes:{
              type:Boolean,
              value:false
          },
          checkParentNodes: {
              type: Boolean,
              value: false
          },
          appName: {
              type: String,
              value: ""
          },
          contextData: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          request: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          showWarningOnUnselect:{
              type:Boolean,
              value:true
          },
          selectedContextText:{
              type:String,
              value:""
          },
          currentEntityContexts:{
              type:Array,
              value:[]
          },
          selectParentItem:{
              type: Boolean,
              value:true
          },
          _reqData:{
              type:Object,
              value:{}
          },
          showContextText:{
              type:Boolean,
              value:false
          },
          contextTypes:{
              type:Array,
              value:[]
          },
          elementInfo:{
              type:Array,
              value:[]
          },
          _contextHierarchy: {
              type: Object,
              value: function () {
                  return {};
              }
          }

      }
  }
  static get observers() {
      return [
          '_onSelectedItemsChange(selectedItems.*, _selectedItem)'
      ];
  }

  constructor() {
      super();
  }

  ready() {
      super.ready();
  }

  connectedCallback() {
      super.connectedCallback();

      this.addEventListener("tree-node-expanded", this._treeNodeExpanded);
      this.addEventListener("tree-node-clicked", this._treeNodeClicked);
  }

  disconnectedCallback() {
      super.disconnectedCallback();

      this.removeEventListener("tree-node-expanded", this._treeNodeExpanded);
      this.removeEventListener("tree-node-clicked", this._treeNodeClicked);
  }

  _onSearch(e) {
      this._searchClicked = true;
      this._isSearchMode = !_.isEmpty(e.detail.query);
      this.executeRequest(e.detail.query);
  }

  resetSearch() {
      this._isSearchMode = false;
      this.executeRequest("");
      this._searchBarElement = this.shadowRoot.querySelector("#searchBar");
      this._searchBarElement.clear();
      this._searchBarElement.$.input.value = "";
  }

  _onSelectedItemsChange(selectedItems, _selectedItem) {
      //Set the output
      if (selectedItems != undefined || _selectedItem != undefined) {
          if (this.multiSelect) {
              this.selectedContextsData = DataHelper.cloneObject(this.selectedItems);
          } else {
              this.selectedContextsData = !_.isEmpty(this._selectedItem) ? [this._selectedItem] : [];
          }
          let contextsCount = 0;
          let newContextsCount = 0;
          let removedContextsCount = 0;

          let itemExistCount = 0;
          let selectedItems = this.selectedItems;
          let preSelectedItems = this.currentEntityContexts;
          for(let i = 0;i<selectedItems.length;i++){
              let valuePath = selectedItems[i].valuePath;
              if(preSelectedItems.indexOf(valuePath) == -1){
                  newContextsCount++; 
              }else{
                  itemExistCount++; 
              }
          }
          removedContextsCount = (preSelectedItems.length-itemExistCount);
          let _selectedContextText = this.selectedItems.length + " contexts selected";
          if(newContextsCount > 0){
              _selectedContextText += " ( " + newContextsCount + " new )"
          }
          if(removedContextsCount > 0){
              _selectedContextText += " ( " + removedContextsCount + " removed )"
          } 
          this.selectedContextText = _selectedContextText;
      }
  }

  _clearSelectedItems() {
      this.selectedItems = [];
  }

  async reloadTree() {
      this.loading = true;
      let domain = "";
      let domainContext = ContextHelper.getFirstDomainContext(this.contextData);
      if(domainContext) {
          domain = domainContext.domain;
      } else {
          let itemContext = ContextHelper.getFirstItemContext(this.contextData);
          let entityTypeManager = EntityTypeManager.getInstance();
          if (entityTypeManager && itemContext) {
              domain = await entityTypeManager.getDomainByType(itemContext.type);
          }
      }

      if (!_.isEmpty(domain)) {
          if(_.isEmpty(this.appName)){
              this.appName = ComponentHelper.getCurrentActiveAppName();
          }
          this._processContextModel(domain)
      }
  }

  async _processContextModel(domain) {
      let _ctxKeys = [];

      let contextHierarchyInfo = await ContextModelManager.getContextHeirarchyInfoBasedOnDomain(domain);
      this.contextTypes = await ContextModelManager.getContextTypesBasedOnDomain(domain);
      let ctxIds = [];
      let contextHierarchy = {};
      if(!_.isEmpty(this.contextTypes)){
          this.contextTypes.forEach(function(type) {
              ctxIds.push(type + "_entityManageModel");
              let ctxObj = contextHierarchyInfo.find(obj => obj.contextKey === type);
              if(ctxObj) {
                  contextHierarchy[type] = ctxObj;
              }
          }, this);

          this.set("_contextHierarchy", contextHierarchy);

          if (ctxIds && ctxIds.length) {
              this._entityModelRequest = {
                  "params": {
                      "query": {
                          "ids": ctxIds,
                          "filters": {
                              "typesCriterion": [
                                  "entityManageModel"
                              ]
                          }
                      },
                      "fields": {
                          "attributes": [
                              "_ALL"
                          ],
                          "relationships": [
                              "_ALL"
                          ],
                          "relationshipAttributes": [
                              "_ALL"
                          ]
                      }
                  }
              };

              let entityModelGetComponent = this.$$("#entityModelGet");

              if (entityModelGetComponent) {
                  entityModelGetComponent.generateRequest();
              } else {
                  this.logError(this.appName + "-Context Selector - Entity model get liquid not found");
              }
          }
      } else {
          this.logError(this.appName + "-Context Selector - There are no context types available for domain " + domain, {}, true);
      }
  }

  _onEntityModelGetResponse(e) {
      if(DataHelper.isValidObjectPath(e,"detail.response.content.entityModels")) {
          this._prepareDynamicConfigBasedOnModelForContextsTreeToBeRendered(e.detail.response.content.entityModels);
      } else {
          this.logError(this.appName + "-Context Selector - Entity Model get response exception", e.detail, true);
      }
  }

  _prepareDynamicConfigBasedOnModelForContextsTreeToBeRendered(entityModels) {
      if (entityModels && entityModels.length) {
          let types = this.contextTypes;
          let attributeNames = [];
          let relationships = [];
          entityModels.forEach((entityModel) => {
              let externalAttrName = undefined;
              let externalNameAndExternalNameAttr = AttributeHelper.getExternalNameAndExternalNameAttr(entityModel);
              let ctxKey = entityModel.id.replace("_entityManageModel", "");
              if (externalNameAndExternalNameAttr) {
                  externalAttrName = externalNameAndExternalNameAttr.externalNameAttr;
                  if(this._contextHierarchy[ctxKey]) {
                      this._contextHierarchy[ctxKey].externalAttrName = externalAttrName;
                      let rel = this._contextHierarchy[ctxKey].contextRelationship;
                      if(!_.isEmpty(rel) && relationships.indexOf(rel) < 0) {
                          relationships.push(rel);
                      }
                  }
                  if(attributeNames.indexOf(externalAttrName) == -1){
                      attributeNames.push(externalAttrName);
                  }
              }
          })
          let reqData = {
              "params": {
                  "query": {
                      "filters": {
                          "typesCriterion": types
                      },
                      "valueContexts": []
                  },
                  "fields": {
                      "attributes": attributeNames,
                      "relationships": relationships
                  }
              }
          };
          reqData.params.query.valueContexts.push(DataHelper.getDefaultValContext());
          this._selectedContextsDataPath = this.selectedContextsData;
          this.selectedContextsData = [];
          this._reqData = reqData;
          this.executeRequest()
      }
  }

  executeRequest(searchKeyword) {
      let req = DataHelper.cloneObject(this._reqData);
      if (searchKeyword) {
          req.params.query.filters.keywordsCriterion = { "operator": "_AND", "keywords": searchKeyword };
      }
      this.set('request', req);
      this.shadowRoot.querySelector("#entitySearchAndGet").generateRequest();
  }

  _onEntitySearchAndGetResponse(e) {
      if(DataHelper.isValidObjectPath(e, "detail.response.content.entities")) {
          let entities = e.detail.response.content.entities;
          if(!_.isEmpty(entities)) {
              this._contextsDataFound = true;
              if (this._searchClicked) {
                  this._contextsDataFound = false;
              }
              let allNodes = this._transformEntitiesToNodes(entities);
              this._prepareContextTreeData(allNodes);
              let parentNodes = allNodes.filter(function(node) {
                  return _.isEmpty(node.parentData);
              });
              parentNodes.sort(function (a, b) { return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0); });
              let _currentEntityContexts = [];
              this._selectedContextsDataPath.forEach((path) =>{
                  _currentEntityContexts.push(path.join("#@#"))
              })
              this.currentEntityContexts = undefined;
              this.currentEntityContexts = _currentEntityContexts;

              this.contextsData = parentNodes;
              this.loading = false;

              this._checkForSelectedContext();

              this._searchClicked = false;
              this.showContextText = true;
          }
      }
  }

  _transformEntitiesToNodes(entities) {
      let allNodes = [];
      entities.forEach(function(entity) {
          let nodeData = {
              "id": entity.id,
              "name": entity.name,
              "type": entity.type
          };
          let ctxObj = this._contextHierarchy[entity.type];
          let externalAttrName = ctxObj.externalAttrName;
          let parentContextKey = ctxObj.parentContextKey;
          let contextRelation = ctxObj.contextRelationship;
          let externalNameAttr = EntityHelper.getAttribute(entity, externalAttrName);
          let externamName = AttributeHelper.getFirstAttributeValue(externalNameAttr);
          nodeData.text = (externamName || entity.name) + " (" + entity.type + ")";
          nodeData.value = externamName || entity.name;
          let relPath = "data.relationships." + contextRelation;
          if(parentContextKey && contextRelation && DataHelper.isValidObjectPath(entity, relPath)) {
              let rels = entity.data.relationships[contextRelation];
              if(!_.isEmpty(rels)) {
                  rels.forEach(function(relData) {
                      if(relData.relTo && relData.relTo.id && relData.relTo.type) {
                          let parentData = {
                              "id": relData.relTo.id,
                              "type": relData.relTo.type
                          };
                          nodeData.parentData = nodeData.parentData || [];
                          nodeData.parentData.push(parentData);
                      }
                  }, this);
              }
          }

          allNodes.push(nodeData);
      }, this);

      return allNodes;
  }

  _prepareContextTreeData(allNodes) {
      allNodes.forEach(function(node) {
          if(!_.isEmpty(node.parentData)) {
              let parentData = node.parentData;
              for(let i=0; i<parentData.length; i++) {
                  let parentId = parentData[i].id;
                  let parentType = parentData[i].type;
                  let parentNode = allNodes.find(obj => obj.id === parentId && obj.type === parentType);
                  if(parentNode) {
                      parentNode.children = parentNode.children || [];
                      parentNode.children.push(node);
                      this._selectedContextsDataPath.forEach((selectedContext) => {
                          if(selectedContext && selectedContext[0] === node.name) {
                              selectedContext.unshift(parentNode.name);
                          }
                      })
                  }
              }
          }
      }, this);
  }

  //If _selectedCOntextsPaths available, then only pre selection process triggers
  _checkForSelectedContext() {
      if (this.contextsData.length == 0 || !this._selectedContextsDataPath || !this._selectedContextsDataPath.length || this._contextsDataIndex == this._selectedContextsDataPath.length) {
          return;
      }
      if (!this._currentContext) {
          this._contextsDataIndex = 0;
          this._currentIndex = 0;
      }
      this._currentContext = this._selectedContextsDataPath[this._contextsDataIndex];
      let name = this._currentContext[this._currentIndex];
      if (this._currentIndex == 0) {
          this._currentNode = this.shadowRoot.querySelector("#contextTree").getElementNodeByPath(name);
      } else if (this._currentIndex == this._currentContext.length) {
          this._currentNode.selectItem();
          this._contextsDataIndex++;
          this._currentIndex = 0;
          this._checkForSelectedContext();
          return;
      } else {
          let childNodes = this._currentNode.getChildNodes();
          let matchedChild;
          for (let i in childNodes) {
              if (childNodes[i].nodeData.value == name) {
                  matchedChild = childNodes[i];
                  break;
              }
          }
          if (matchedChild) {
              this._currentNode = matchedChild;
          } else {
              this._contextsDataIndex++;
              this._currentIndex = 0;
              this._checkForSelectedContext();
              return;
          }
      }
      this._currentIndex++;
      if (this._currentNode) {
          if (this._currentNode.expanded) {
              this._checkForSelectedContext();
          } else {
              this._currentNode.expand();
          }
      }
  }

  _treeNodeExpanded(e) {
       this._currentNode = e.detail;
      if (!this._currentNode.nodeData.children || this._currentNode.nodeData.children.length == 0) {
          this._currentNode.changeToLeafMode();
      }
      this._currentNode.refreshChildList();
      
  }

  _treeNodeClicked(ev) {
  }

  _childListRefreshed() {
      this._checkForSelectedContext();
  }
}

customElements.define(RockContextTree.is, RockContextTree);
