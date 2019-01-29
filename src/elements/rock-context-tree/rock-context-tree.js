/**
`rock-context-tree` Represents a component that renders the list of contexts in a hierarchical tree format.

@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-app-context-behavior/bedrock-app-context-behavior.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-helpers/entity-helper.js';
import '../bedrock-helpers/attribute-helper.js';
import '../bedrock-helpers/element-helper.js';
import '../bedrock-style-manager/styles/bedrock-style-scroll-bar.js';
import ContextModelManager from '../bedrock-managers/context-model-manager.js';
import EntityTypeManager from '../bedrock-managers/entity-type-manager.js';
import '../liquid-entity-data-get/liquid-entity-data-get.js';
import '../pebble-spinner/pebble-spinner.js';
import '../pebble-tree/pebble-tree.js';
import '../pebble-checkbox/pebble-checkbox.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockContextTree extends mixinBehaviors([RUFBehaviors.UIBehavior, RUFBehaviors.ComponentContextBehavior, RUFBehaviors.ComponentConfigBehavior], OptionalMutableData(PolymerElement)) {
  static get template() {
    return html`
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

            .status-text {
                float: left;
                font-size: var(--font-size-sm);
                margin-left: 15px;
                font-weight: var(--font-medium);
            }

            .modified-status-text {
                margin-left: 0px !important;
            }

            #newContextText:hover, #removedContextText:hover {
                color: var(--dropdown-selected-font, #036bc3);
                cursor: pointer;
            }

            .resetsearch pebble-button {
                height: auto;

                --pebble-button: {
                    font-size: var(--font-size-xs, 10px) !important;
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

            pebble-popover#selectedContextsPopover {
                font-weight: normal;
                text-transform: initial;
                text-align: left;
                margin-left: -12px;
                margin-top: 7px;
                --default-popup-b-p: 5px;
                --default-popup-t-p: 5px;
                --default-font-size: 12px;
                width: 180px;
                overflow-y: auto;
                overflow-x: auto;
            }

            pebble-popover#selectedContextsPopover::after,
            pebble-popover#selectedContextsPopover::before {
                bottom: 100%;
                left: 20px;
                border: solid transparent;
                content: " ";
                height: 0;
                width: 0;
                position: absolute;
                pointer-events: none;
            }

            pebble-popover#selectedContextsPopover::after {
                border-color: rgba(255, 255, 255, 0);
                border-bottom-color: #ffffff;
                border-width: 6px;
                margin-left: -6px;
            }

            pebble-popover#selectedContextsPopover::before {
                border-color: rgba(194, 225, 245, 0);
                border-bottom-color: rgb(216, 221, 228);
                border-width: 7px;
                margin-left: -7px;
            }

            .context-item {
                margin-left: 10px;
            }
        </style>
        <div class="base-grid-structure">
            <div class="base-grid-structure-child-1">
                <div class="search-container">
                    <rock-search-bar id="searchBar" placeholder="Enter Search text" hide-rbl="true"></rock-search-bar>
                    <div class="resetsearch" hidden\$="[[!_resetSearchEnabled]]">
                        <pebble-button icon="pebble-icon:reset" class="btn-link pebble-icon-color-blue" on-tap="resetSearch" button-text="Reset Search"></pebble-button>
                    </div>
                    <bedrock-pubsub event-name="rock-search" handler="_onSearch" target-id="searchBar"></bedrock-pubsub>
                </div>
                <template is="dom-if" if="[[showContextText]]">
                    <p class="status-text">[[selectedContextText]]</p><p id="newContextText" class="status-text modified-status-text" on-mouseover="_openPopover" on-mouseout="_closePopover">[[newContextText]]</p><p id="removedContextText" class="status-text modified-status-text" on-mouseover="_openPopover" on-mouseout="_closePopover">[[removedContextText]]</p>
                </template>
            </div>
            <div class="base-grid-structure-child-2">
                <div hidden\$="[[_contextsDataFound]]" class="default-message">No Contexts Found</div>
                <pebble-tree id="contextTree" hidden\$="[[!_contextsDataFound]]" class="contextTree" data="{{contextsData}}" check-child-nodes="[[checkChildNodes]]" default-child-depth="10" selected-items="{{selectedItems}}" selected-item="{{_selectedItem}}" multi-select="[[multiSelect]]" disable-child-node="[[disableChildNode]]" check-parent-nodes="[[checkParentNodes]]" select-parent-item="[[selectParentItem]]" leaf-node-only="[[leafNodeOnly]]" show-warning-on-unselect="[[showWarningOnUnselect]]"></pebble-tree>
            </div>
        </div>
        <pebble-popover id="selectedContextsPopover" no-overlap="">
            <template is="dom-repeat" items="[[modifiedContexts]]" as="item">
                <div class="context-item">[[item]]</div>
            </template>
        </pebble-popover>
        <pebble-dialog id="dirtyCheckDialog" dialog-title="Confirmation" button-ok-text="Yes" button-cancel-text="Cancel" modal="" alert-box="" show-cancel="" show-ok="" no-cancel-on-outside-click="" no-cancel-on-esc-key="">
            <p>Unsaved changes will be discarded. Do you want to continue?</p>
        </pebble-dialog>
        <bedrock-pubsub event-name="on-buttonok-clicked" handler="_resetSearch" target-id="dirtyCheckDialog"></bedrock-pubsub>

        <bedrock-pubsub event-name="tree-node-selected" handler="_onContextItemSelected"></bedrock-pubsub>
        <bedrock-pubsub event-name="tree-node-de-selected" handler="_onContextItemDeSelected"></bedrock-pubsub>
        <pebble-spinner active="[[loading]]"></pebble-spinner>
        <liquid-entity-model-get id="entityModelGet" operation="getbyids" request-data="{{_entityModelRequest}}" on-liquid-response="_onEntityModelGetResponse" on-liquid-error="_onEntityModelGetError"></liquid-entity-model-get>
        
        <liquid-entity-data-get id="initGetEntitySearch" operation="initiatesearch" on-response="_initContextSearchResponse" on-error="_onGetSearchError" exclude-in-progress=""></liquid-entity-data-get>
        <liquid-entity-data-get id="getEntitySearchResults" operation="getsearchresultdetail" on-response="_getContextSearchResultResponse" on-error="_onGetSearchError" exclude-in-progress="" include-type-external-name=""></liquid-entity-data-get>
        <liquid-entity-data-get id="relatedEntityGet" operation="getbyids" on-response="_getRelatedEntitiesResponse" on-error="_onGetRelatedEntitiesError" exclude-in-progress="" include-type-external-name=""></liquid-entity-data-get>
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

          _contextsDataFound: {
              type: Boolean,
              value: true
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

          entityCurrentContexts: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          /**
          * Specifies whether or not only leaf-node selection is enabled.
          */
          leafNodeOnly: {
              type: Boolean,
              value: false
          },
          checkChildNodes: {
              type: Boolean,
              value: false
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
          showWarningOnUnselect: {
              type: Boolean,
              value: true
          },
          selectedContextText: {
              type: String,
              value: ""
          },
          newContextText: {
              type: String,
              value: ""
          },
          removedContextText: {
              type: String,
              value: ""
          },
          currentEntityContexts: {
              type: Array,
              value: []
          },
          selectParentItem: {
              type: Boolean,
              value: true
          },
          showContextText: {
              type: Boolean,
              value: false
          },
          contextTypes: {
              type: Array,
              value: []
          },
          _contextHierarchy: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _searchKeyWord: {
              type: String,
              value: ''
          },
          newContexts: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          removedContexts: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          modifiedContexts: {
              type: Array,
              value: function () {
                  return [];
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

  connectedCallback() {
      super.connectedCallback();

      this.addEventListener("tree-node-expanded", this._treeNodeExpanded);
  }

  disconnectedCallback() {
      super.disconnectedCallback();

      this.removeEventListener("tree-node-expanded", this._treeNodeExpanded);
  }

  _onSearch(e) {
      if(e.detail.query) {
          let query = DataHelper.cloneObject(e.detail.query);
          let isValid = this._validateQuery(query);

          if(!isValid) {
              this.showWarningToast("Enter minimum 2 characters to search");
              return;
          }
      }
      if(e.detail.query === "") {
          this.resetSearch();
          return;
      }
      this._searchClicked = true;
      this._isSearchMode = !_.isEmpty(e.detail.query);
      this._searchKeyWord = e.detail.query;
      this.loading= true;
      this.executeRequest();
  }

  _validateQuery(query) {
      if(_.isEmpty(query) && query.length < 2) {
          return false;
      }
      if(query.substr(0,1) == '*') {
          query = query.substr(1, query.length-2);
      }

      if(query.substr(query.length - 1, 1) == '*') {
          query = query.substr(0, query.length-1);
      }

      if(query.length < 2) {
          return false;
      }

      return true;
  }

  get contextTree() {
      this._contextTree = this._contextTree || this.shadowRoot.querySelector("#contextTree");
      return this._contextTree;
  }

  resetSearch() {
      let isTreeDirty = this._checkForDirty();
      if(isTreeDirty) {
          this.shadowRoot.querySelector("#dirtyCheckDialog").open();
      } else {
          this._resetSearch();
      }
  }

  _checkForDirty() {
      let manageElement = ComponentHelper.getParentElement(this);
      if(manageElement) {
          return manageElement.isComponentDirty;
      }
  }

  _resetSearch() {
      this._isSearchMode = false;
      this._searchKeyWord = "";
      this._clearSelectedItems();
      this.loading= true;
      this.contextsData = [];
      this.executeRequest();
      this._searchBarElement = this.shadowRoot.querySelector("#searchBar");
      this._searchBarElement.clear();
      this._searchBarElement.$.input.value = "";
  }

  _onSelectedItemsChange(selectedItems, _selectedItem) {
      DataHelper.sort(this.selectedItems, "text");
      //Set the output
      if (selectedItems != undefined || _selectedItem != undefined) {
          let currentSelectedItems = _.uniq(this.selectedItems, function(item, key, id) {
              return item.id;
          });
          if (this.multiSelect) {
              this.selectedContextsData = DataHelper.cloneObject(currentSelectedItems);
          } else {
              this.selectedContextsData = !_.isEmpty(this._selectedItem) ? [this._selectedItem] : [];
          }
          let contextsCount = 0;
          let newContextsCount = 0;
          let removedContextsCount = 0;
          let newlyAddedContexts = [];
          let remainingExistingContexts = [];
          let removedContexts = [];
          this.newContextText = "";
          this.removedContextText = "";

          let itemExistCount = 0;
          
          let preSelectedItems = this.currentEntityContexts;
          for (let i = 0; i < currentSelectedItems.length; i++) {
              let value = currentSelectedItems[i].value;
              if (preSelectedItems.indexOf(value) == -1) {
                  newContextsCount++;
                  if(newlyAddedContexts.indexOf(value) == -1) {
                      newlyAddedContexts.push(value);
                  }
              } else {
                  itemExistCount++;
                  if(remainingExistingContexts.indexOf(value) == -1) {
                      remainingExistingContexts.push(value);
                  }
              }
          }
          removedContextsCount = (preSelectedItems.length - itemExistCount);
          removedContexts = preSelectedItems.reduce(function(prev, next) {
              if(remainingExistingContexts.indexOf(next) == -1) {
                  prev.push(next);
              }
              return prev;
          }, removedContexts);
          let _selectedContextText = currentSelectedItems.length + " contexts selected";
          if (newContextsCount > 0 && !_.isEmpty(newlyAddedContexts)) {
              this.newContexts = newlyAddedContexts.sort();
              this.newContextText += " ( " + newContextsCount + " new )";
          }
          if (removedContextsCount > 0 && !_.isEmpty(removedContexts)) {
              this.removedContexts = removedContexts.sort();
              this.removedContextText += " ( " + removedContextsCount + " removed )"
          }
          this.selectedContextText = _selectedContextText;
      }
  }

  _clearSelectedItems() {
      this.selectedItems = [];
  }

  async reloadTree() {
      this.loading = true;
      this.currentEntityContexts = [];
      let domain = "";
      let domainContext = ContextHelper.getFirstDomainContext(this.contextData);
      if (domainContext) {
          domain = domainContext.domain;
      } else {
          let itemContext = ContextHelper.getFirstItemContext(this.contextData);
          let entityTypeManager = EntityTypeManager.getInstance();
          if (entityTypeManager && itemContext) {
              domain = await entityTypeManager.getDomainByType(itemContext.type);
          }
      }

      if (!_.isEmpty(domain)) {
          if (_.isEmpty(this.appName)) {
              this.appName = ComponentHelper.getCurrentActiveAppName();
          }
          this._processContextModel(domain)
      }
  }

  async _processContextModel(domain) {
      let _ctxKeys = [];

      let contextHierarchyInfo = await ContextModelManager.getContextHeirarchyInfoBasedOnDomain(domain);
      this.contextTypes = await ContextModelManager.getContextTypesBasedOnDomain(domain);
      let contextHierarchy = {};
      if (!_.isEmpty(this.contextTypes)) {
          this.contextTypes.forEach(function (type) {
              let ctxObj = contextHierarchyInfo.find(obj => obj.contextKey === type);
              if (ctxObj) {
                  contextHierarchy[type] = ctxObj;
                  let childCtxObjects = contextHierarchyInfo.filter(obj => obj.parentContextKey === type);

                  if(!_.isEmpty(childCtxObjects)) {
                      ctxObj.childCtxObjects = childCtxObjects;
                  }
              }
          }, this);

          this.set("_contextHierarchy", contextHierarchy);

          this._entityModelRequest = DataRequestHelper.createGetManageModelRequest(this.contextTypes);

          let entityModelGetComponent = this.$$("#entityModelGet");

          if (entityModelGetComponent) {
              entityModelGetComponent.generateRequest();
          } else {
              this.logError(this.appName + "-Context Selector - Entity model get liquid not found");
          }
      } else {
          this.logError(this.appName + "-Context Selector - There are no context types available for domain " + domain, {}, true);
      }
  }

  _onEntityModelGetResponse(e) {
      if (DataHelper.isValidObjectPath(e, "detail.response.content.entityModels")) {
          this._prepareDynamicConfigBasedOnModelForContextsTreeToBeRendered(e.detail.response.content.entityModels);
      } else {
          this.logError(this.appName + "-Context Selector - Entity Model get response exception", e.detail, true);
      }
  }

  _prepareDynamicConfigBasedOnModelForContextsTreeToBeRendered(entityModels) {
      if (entityModels && entityModels.length) {
          let modelsData = {};
          entityModels.forEach((entityModel) => {
              let externalAttrName = undefined;
              let externalNameAndExternalNameAttr = AttributeHelper.getExternalNameAndExternalNameAttr(entityModel);
              let ctxKey = entityModel.id.replace("_entityManageModel", "");
              modelsData[ctxKey] = {};
              if (externalNameAndExternalNameAttr) {
                  externalAttrName = externalNameAndExternalNameAttr.externalNameAttr;
                  modelsData[ctxKey]["externalAttrName"] = externalAttrName;
              }
          }, this);

          this.set("_modelsData", modelsData);
          this.executeRequest()
      }
  }

  _getParentContextTypes() {
      let contextTypes = [];
      if(!_.isEmpty(this._contextHierarchy)) {
          for(let entityType in this._contextHierarchy) {
              if(_.isEmpty(this._contextHierarchy[entityType].parentContextKey)) {
                  contextTypes.push(entityType);
              }
          }
      }

      return contextTypes;
  }

  executeRequest(parentNode) {
      let types = [];
      let relationshipsCriterion = [];
      let searchKeyword = this._searchKeyWord;
      let parentContextData = parentNode ? parentNode.nodeData : undefined;
      if(!_.isEmpty(parentContextData)) {
          let ctxObj = this._contextHierarchy[parentContextData.type];
          let childCtxObjects = ctxObj ? ctxObj.childCtxObjects : undefined;
          if(childCtxObjects) {
              childCtxObjects.forEach(function(childCtxObj) {
                  types.push(childCtxObj.contextKey);
                  let relType = childCtxObj.contextRelationship;
                  let relCriterion = {};
                  relCriterion[relType] = {"relTo": { "id": parentContextData.id, "type": parentContextData.type } };
                  relationshipsCriterion.push(relCriterion);
              }, this);
          }
      } else {
          types = this._getParentContextTypes();
      }

      if(_.isEmpty(types) && !_.isEmpty(parentNode)) {
          parentNode.changeToLeafMode();
          parentNode.set('nodeData.children', []);
          if(!this._isSearchMode) {
              parentNode.refreshChildList();
          }
          this.loading = false;
          return;
      }
      let contextData = DataHelper.cloneObject(this.contextData);
      let attributeNames = [];
      let relationships = [];
      if(searchKeyword && _.isEmpty(parentNode)) {
          types = this.contextTypes;
      }
      types.forEach(function(type) {
          let attributeName = this._modelsData[type].externalAttrName;
          if(attributeNames.indexOf(attributeName) < 0) {
              attributeNames.push(attributeName);
          }
          let ctxObj = this._contextHierarchy[type];
          let relName = ctxObj ? ctxObj.contextRelationship : undefined;
          if(relName) {
              relationships.push(relName);
          }
      }, this);
      let itemContext = { "attributeNames": attributeNames, "type": types, "relationships": relationships };
      if(!_.isEmpty(relationshipsCriterion)) {
          itemContext.relationshipsCriterion = relationshipsCriterion;
      }

      contextData[ContextHelper.CONTEXT_TYPE_ITEM] = [itemContext];
      contextData[ContextHelper.CONTEXT_TYPE_DATA] = [];
      let req = DataRequestHelper.createEntityGetRequest(contextData, true);

      if (searchKeyword) {
          let attributesCriterion = this._prepareAttributesCriterion(searchKeyword, attributeNames);
          if(!_.isEmpty(attributesCriterion)) {
              req.params.query.filters.attributesCriterion = attributesCriterion;
              if(attributesCriterion.length > 1) {
                  req.params.query.filters["isAttributesCriterionOR"] = true;
              }
          }
      }

      let initGetEntitySearchLiquid = this.shadowRoot.querySelector("#initGetEntitySearch");

      if (initGetEntitySearchLiquid) {
          initGetEntitySearchLiquid.requestData = req;
          initGetEntitySearchLiquid.generateRequest();
      }
  }

  _initContextSearchResponse(e) {
      if (DataHelper.isValidObjectPath(e, "detail.response.content.requestId")) {
          let getEntitySearchResultsLiquid = this.shadowRoot.querySelector("#getEntitySearchResults");
      
          if (getEntitySearchResultsLiquid) {
              getEntitySearchResultsLiquid.requestId = e.detail.response.content.requestId;
              getEntitySearchResultsLiquid.requestData = e.detail.request.requestData;
              getEntitySearchResultsLiquid.generateRequest();
          }
      }
  }

  _onEntityInitSearchError(e) {
      console.logError('Context initiate search failed', e.detail);
  }

  _getContextSearchResultResponse(e) {
      let currentNode;
      if(DataHelper.isValidObjectPath(e, "detail.request.requestData.params.query.filters.relationshipsCriterion.0")) {
          let relationshipCriterion = e.detail.request.requestData.params.query.filters.relationshipsCriterion[0];
          currentNode = this._getCurrentNode(relationshipCriterion);
      }
      if (DataHelper.isValidObjectPath(e, "detail.response.content.entities")) {
          let entities = e.detail.response.content.entities;
          if(!_.isEmpty(entities)) {
              this._contextsDataFound = true;
              let allNodes = this._transformEntitiesToNodes(entities);
              allNodes.sort(function (a, b) { return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0); });

              this._selectedDataContexts = [];
              if(currentNode) {
                  if (!allNodes.length) {
                      currentNode.changeToLeafMode();
                  }

                  allNodes.forEach(function(node) {
                      let existingNode = this.contextsData.find(obj => obj.id === node.id);
                      if(existingNode) {
                          let index = this.contextsData.indexOf(existingNode);
                          this.splice('contextsData', index, 1);
                      }
                      let existingSelectedItem = this.selectedItems.find(obj => obj.id === node.id);
                      if(existingSelectedItem) {
                          let index = this.selectedItems.indexOf(existingSelectedItem);
                          this.splice('selectedItems', index, 1);
                      }
                      if(!_.isEmpty(this.entityCurrentContexts)) {
                          this.entityCurrentContexts.forEach((selectedContext) => {
                              if (selectedContext && selectedContext[0] === node.name) {
                                  let selectedCtx = DataHelper.cloneObject(selectedContext);
                                  selectedCtx.unshift(currentNode.nodeData.name);
                                  this._selectedDataContexts.push(selectedCtx);
                              }
                          }, this);
                      }
                  }, this);

                  if(this._isSearchMode) {
                      this.contextTree.refreshTree();
                  }

                  currentNode.set('nodeData.children', allNodes);
                  currentNode.refreshChildList();
              } else {
                  allNodes.forEach(function(node) {
                      this.entityCurrentContexts.forEach((selectedContext) => {
                          if (selectedContext && selectedContext[0] === node.name) {
                              this._selectedDataContexts.push(selectedContext);
                          }
                      })
                  }, this);
                  this.contextsData = allNodes;
              }

              if(this._isSearchMode) {
                  this._expandAllNodes(allNodes);
              }

              this.currentEntityContexts = this.currentEntityContexts || [];
              this._selectedDataContexts.forEach((contexts) => {
                  contexts.forEach((context) => {
                      if(this.currentEntityContexts.indexOf(context) < 0) {
                          this.currentEntityContexts.push(context);
                      }
                  }, this);
              }, this);

              this.loading = false;

              this._checkForSelectedContext();

              this._searchClicked = false;
              this.showContextText = true;

              return;
          } else {
              if(currentNode) {
                  currentNode.changeToLeafMode();
                  currentNode.set('nodeData.children', []);
                  if(!this._isSearchMode) {
                      currentNode.refreshChildList();
                  }
                  this.loading = false;
                  return;
              }
          }
      }

      this.contextsData = [];
      this.loading = false;
      this.showContextText = false;
      this._contextsDataFound = false;
  }

  _onSearchResultError(e) {
      console.logError('Context search result get failed', e.detail);
  }

  _getCurrentNode(relationshipCriterion) {
      let currentNode;
      let rel = Object.keys(relationshipCriterion)[0];
      let currentNodeId;
      if(DataHelper.isValidObjectPath(relationshipCriterion[rel], "relTo.id")) {
          currentNodeId = relationshipCriterion[rel].relTo.id;
      }
      if(currentNodeId) {
          currentNode = this.contextTree.getElementNodeById(currentNodeId);
      }

      return currentNode;
  }

  _prepareAttributesCriterion(searchKeyWord, attributeNames) {
      let attributesCriterion = [];
      if(!_.isEmpty(attributeNames)) {
          attributeNames.forEach((attributeName) => {
            let attrCriterion = DataRequestHelper.createFilterCriteria("attributesCriterion",searchKeyWord,attributeName)
            attributesCriterion.push(attrCriterion.attributesCriterion[0]);
          }, this);
      }

      return attributesCriterion;
  }

  _transformEntitiesToNodes(entities) {
      let allNodes = [];
      entities.forEach(function (entity) {
          let nodeData = {
              "id": entity.id,
              "name": entity.name,
              "type": entity.type
          };
          let ctxObj = this._contextHierarchy[entity.type];
          let externalAttrName = this._modelsData[entity.type].externalAttrName;
          let parentContextKey = ctxObj.parentContextKey;
          let contextRelation = ctxObj.contextRelationship;
          let externalNameAttr = EntityHelper.getAttribute(entity, externalAttrName);
          let externamName = AttributeHelper.getFirstAttributeValue(externalNameAttr);
          let entityTypeExternalName = entity.typeExternalName || entity.type;
          nodeData.typeExternalName = entityTypeExternalName;
          nodeData.text = (externamName || entity.name) + " (" + entityTypeExternalName + ")";
          nodeData.value = externamName || entity.name;

          if(contextRelation && DataHelper.isValidObjectPath(entity, "data.relationships." + contextRelation + ".0")) {
              let relObj = entity.data.relationships[contextRelation][0];
              if(DataHelper.isValidObjectPath(relObj, "relTo.id")) {
                  nodeData.parentNodeId = relObj.relTo.id;
                  nodeData.parentNodeType = relObj.relTo.type;
              }
          }
          allNodes.push(nodeData);
      }, this);

      return allNodes;
  }

  //If _selectedCOntextsPaths available, then only pre selection process triggers
  _checkForSelectedContext() {
      if (this.contextsData.length == 0 || !this._selectedDataContexts || !this._selectedDataContexts.length || this._contextsDataIndex == this._selectedDataContexts.length) {
          return;
      }
      
      this._selectedDataContexts.forEach((selectedContextsPaths) => {
          let contextPath = selectedContextsPaths.join("#@#");
          let node = this.contextTree.getElementNodeByPath(contextPath);

          if(node) {
              node.selectItem();
              node.expand();
          }
      }, this);
  }

  _treeNodeExpanded(e) {
      let node = e.detail;
      if (!node.nodeData.children || node.nodeData.children.length == 0) {
          this.loading = true;
          this.executeRequest(node);
      }
  }

  _onContextItemSelected(e) {
      if(this._isSearchMode && DataHelper.isValidObjectPath(e, "detail.data.nodeData.parentNodeId")) {
          let selectedNodeParentNodeId = e.detail.data.nodeData.parentNodeId;
          let existingSelectedItem = this.selectedItems.find(obj => obj.id === selectedNodeParentNodeId);
          let parentNodeData = e.detail.data.nodeData;
          if(!existingSelectedItem) {
              this.loading = true;
              this._requestForRelatedEntity(parentNodeData);
          } else {
              this._appendContextPath(e.detail.data.nodeData.id, existingSelectedItem);
          }
      }
  }

  _onContextItemDeSelected(e) {
      if(this._isSearchMode && DataHelper.isValidObjectPath(e, "detail.data.nodeData.id")) {
          let deSelectedNodeDataId = e.detail.data.nodeData.id;
          let existingSelectedItems = this.selectedItems.filter(function(obj) {
              if(obj.parentNodeId === deSelectedNodeDataId) {
                  return true;
              }
          }, this);
          if(!_.isEmpty(existingSelectedItems)) {
              existingSelectedItems.forEach((selectedItem) => {
                  let selectedItemIndex = this.selectedItems.indexOf(selectedItem);
                  if(selectedItemIndex > -1) {
                      this.splice("selectedItems", selectedItemIndex, 1);
                  }
              }, this);
          }
      }
  }

  _requestForRelatedEntity(parentNodeData) {
      let type = parentNodeData.parentNodeType;
      let itemContext = {"id": parentNodeData.parentNodeId, "type": type, "attributeNames": [this._modelsData[type].externalAttrName] };
      let contextData = DataHelper.cloneObject(this.contextData);
      contextData[ContextHelper.CONTEXT_TYPE_ITEM] = [itemContext];
      contextData[ContextHelper.CONTEXT_TYPE_DATA] = [];
      let req = DataRequestHelper.createEntityGetRequest(contextData);

      let relatedEntityGetLiquid = this.shadowRoot.querySelector("#relatedEntityGet");

      if (relatedEntityGetLiquid) {
          relatedEntityGetLiquid.requestData = req;
          relatedEntityGetLiquid.generateRequest();
      }
  }

  _getRelatedEntitiesResponse(e) {
      if(DataHelper.isValidObjectPath(e, "detail.response.content.entities.0")) {
          let entities = e.detail.response.content.entities;
          let nodes = this._transformEntitiesToNodes(entities);
          if(DataHelper.isValidObjectPath(e, "detail.request.requestData.params.query.id")) {
              let nodeId = e.detail.request.requestData.params.query.id;
              let currentNodeItem = this.selectedItems.find(obj => obj.parentNodeId === nodeId);
              if(currentNodeItem) {
                  this._appendContextPath(currentNodeItem.id, nodes[0]);
              }
          }
          this.push("selectedItems", nodes[0]);
      }
      this.loading = false;
  }

  _expandAllNodes(nodes) {
      nodes.forEach((node) => {
          let ctxObj = this._contextHierarchy[node.type];
          let childCtxObjects = ctxObj ? ctxObj.childCtxObjects : undefined;
          let currentNode = this.contextTree.getElementNodeById(node.id);
          if(currentNode) {
              if(!_.isEmpty(childCtxObjects)) {
                  currentNode.expand();
              } else {
                  currentNode.changeToLeafMode();
                  currentNode.set('nodeData.children', []);
              }
          }
      }, this);
  }

  _appendContextPath(nodeId, parentNodeData) {
      let currentNode =this.contextTree.getElementNodeById(nodeId);
      if(currentNode) {
          let node = currentNode.shadowRoot.getElementById(currentNode.nodeData.id);
          if(node) {
              let parentNodeDataType = parentNodeData.typeExternalName || parentNodeData.type;
              node.innerHTML = "( " + parentNodeDataType + " : " + parentNodeData.value + " )";
          }
      }
  }

  _openPopover(e) {
      let popOver = this.shadowRoot.querySelector("#selectedContextsPopover");
      if(popOver) {
          popOver.for = e.currentTarget.id;
          if(e.currentTarget.id === "newContextText") {
              this.modifiedContexts = this.newContexts;
          }
          if(e.currentTarget.id === "removedContextText") {
              this.modifiedContexts = this.removedContexts;
          }
          popOver.show();
      }
  }

  _closePopover(e) {
      let popOver = this.shadowRoot.querySelector("#selectedContextsPopover");
      if(popOver) {
          this.modifiedContexts = [];
          popOver.close();
      }
  }
}

customElements.define(RockContextTree.is, RockContextTree);
