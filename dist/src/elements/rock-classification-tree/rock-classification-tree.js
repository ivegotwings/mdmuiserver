/**
`rock-classification-tree` Represents a component that renders the list of classifications in a hierarchical tree format.

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
import '../liquid-rest/liquid-rest.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockClassificationTree extends mixinBehaviors([RUFBehaviors.UIBehavior], OptionalMutableData(PolymerElement)) {
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
        <liquid-entity-data-get id="lineagepath" operation="getbyids" request-data="{{lineagerequest}}" on-error="_onLineagePathError" on-response="_onLineagePathResponse" exclude-in-progress=""></liquid-entity-data-get>
        <liquid-entity-data-get id="rootNodeGet" operation="getbyids" on-error="_onRootNodeGetError" on-response="_onRootNodeGetResponse" exclude-in-progress=""></liquid-entity-data-get>
        <liquid-entity-data-get id="initiateSearch" operation="initiatesearch" request-data="{{request}}" last-response="{{initiateSearchResponse}}" on-error="_onGetSearchError" on-response="_onInitiateSearchResponse" exclude-in-progress=""></liquid-entity-data-get>
        <liquid-entity-data-get id="getSearchResultDetail" operation="getsearchresultdetail" request-data="{{request}}" request-id="[[initiateSearchResponse.content.requestId]]" last-response="{{getEntitySearchResultsResponse}}" on-error="_onGetSearchError" on-response="_onGetSearchResultDetailResponse" exclude-in-progress=""></liquid-entity-data-get>
        <div class="base-grid-structure">
            <div class="base-grid-structure-child-1">
                <div class="search-container">
                    <bedrock-pubsub event-name="rock-search" handler="_onSearch" target-id="classificationSearchBar"></bedrock-pubsub>
                    <template is="dom-if" if="{{_showSearchBar}}">
                        <rock-search-bar id="classificationSearchBar" placeholder="Enter Search text" hide-rbl="true"></rock-search-bar>
                        <div class="resetsearch" hidden\$="[[!_resetSearchEnabled]]">
                            <pebble-button icon="pebble-icon:reset" class="btn-link pebble-icon-color-blue" on-tap="resetSearch" button-text="Reset Search"></pebble-button>
                        </div>
                    </template>
                </div>
            </div>
            <div hidden\$="[[_classificationsFound]]" class="status-error">No Classifications Found</div>
            <div class="base-grid-structure-child-2" hidden\$="[[!_classificationsFound]]">
                <pebble-tree id="contextTree" class="contextTree" leaf-node-only="[[leafNodeOnly]]" data="{{classifications}}" check-child-nodes="[[checkChildNodes]]" default-child-depth="10" selected-items="{{_selectedItems}}" selected-item="{{_selectedItem}}" multi-select="[[multiSelect]]" disable-child-node="[[disableChildNode]]" hide-leaf-node-checkbox="[[hideLeafNodeCheckbox]]" check-parent-nodes="[[checkParentNodes]]"></pebble-tree>
            </div>
        </div>
        <bedrock-pubsub event-name="tree-node-child-list-refreshed" handler="_childListRefreshed"></bedrock-pubsub>
        <liquid-rest id="classificationModelGet" url="/data/pass-through/entitymodelservice/get" method="POST" request-data="{{_classificationModelRequest}}" on-liquid-response="_onClassificationModelGetResponse"></liquid-rest>
        <pebble-spinner active="[[_loading]]"></pebble-spinner>
`;
  }

  static get is() {
      return "rock-classification-tree";
  }

  static get properties() {
      return {
          request: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          lineagerequest: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          _dataFormatter: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          _isSearchMode: {
              type: Boolean,
              value: false
          },

          _loading: {
              type: Boolean,
              value: false
          },

          _showSearchBar: {
              type: Boolean,
              value: false
          },

          _classificationsFound: {
              type: Boolean,
              value: true
          },

          contextData: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          rootClassificationId: {
              type: String,
              value: "_root"
          },

          _currentNode: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          rootNode: {
              type: String
          },

          selectedClassifications: {
              type: Array,
              value: function () {
                  return [];
              },
              notify: true
          },

          _selectedItems: {
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
              value: false
          },

          classifications: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          _selectedClassificationPaths: {
              type: Array
          },

          /**
          * Specifies whether or not only leaf-node selection is enabled.
          */
          leafNodeOnly: {
              type: Boolean,
              value: false
          },

          hideLeafNodeCheckbox: {
              type: Boolean,
              value: false
          },

          _classificationModelRequest: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          disableChildNode: {
              type: Boolean,
              value: false
          },

          enableNodeClick: {
              type: Boolean,
              value: false
          },

          _rootNodeGetRequest: {
              type: Object
          },

          isModelTree: {
              type: Boolean,
              value: false
          },

          rootNodeData: {
              type: Object,
              value: function () {
                  return {}
              }
          },
          pathEntityType:{
              type:String,
              value:""
          },
          pathRelationshipName:{
              type:String,
              value:""
          },
          checkChildNodes:{
              type:Boolean,
              value:true
          },
          checkParentNodes: {
              type: Boolean,
              value: false
          },
          rootNodeExternalName: {
              type: String,
              value: "",
              notify: true
          }
      }
  }

  static get observers() {
      return [
          '_onSelectedItemsChange(_selectedItems.length, _selectedItem)',
          '_onRootNodeChange(rootNode, _classificationExtNameAttr)'
      ];
  }

  constructor() {
      super();
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
      this._isSearchMode = true;
      this._searchClicked = true;
      this._searchBarElement = this.shadowRoot.querySelector("#classificationSearchBar");
      if(this._searchBarElement && this._searchBarElement.$.input.value == ""){
          this._isSearchMode = false;
      }
      this._loading= true;
      this.executeRequest("", e.detail.query);
      this.clearSelectedItems();
  }

  resetSearch() {
      this._isSearchMode = false;
      this.clearSelectedItems();
      this.executeRequest("");
      this._loading= true;
      this._searchBarElement = this.shadowRoot.querySelector("#classificationSearchBar");
      this._searchBarElement.clear();
      this._searchBarElement.$.input.value = "";
  }

  _onSelectedItemsChange(selectedItems, _selectedItem) {
      //Set the output
      if(this._searchClicked) return;

      if (selectedItems != undefined || _selectedItem != undefined) {
          if (this.multiSelect) {
              let classificationTreeEl = this.shadowRoot.querySelector("#contextTree");
              this.selectedClassifications = classificationTreeEl ? classificationTreeEl.getSelectedItems() : DataHelper.cloneObject(this._selectedItems);
          } else {
              this.selectedClassifications = !_.isEmpty(this._selectedItem) ? [this._selectedItem] : [];
          }
      }
      if (this._isSearchMode) {
          let req = {
              "params": {
                  "query": {
                      "filters": {
                          "typesCriterion": [
                              "classification"
                          ]
                      }
                  },
                  "fields": {
                      "relationships": [
                          "belongsto"
                      ],
                      "relationshipAttributes": [
                          "lineagepath"
                      ]
                  }
              }
          };
          DataRequestHelper.addDefaultContext(req);
          if (this.selectedClassifications) {
              req.params.query.ids = [];
              this.selectedClassifications.forEach((classification) => {
                  req.params.query.ids.push(classification.id);
              });
              this.lineagerequest = req;
              let lineagepathElement = this.$$("#lineagepath");
              if (lineagepathElement) {
                  this._loading = true;
                  lineagepathElement.generateRequest();
              }
          }
      }
  }

  clearSelectedItems() {
      this._selectedItems = [];
  }

  //Trigger generateRequest from consumer to load the classifications
  generateRequest() {
      //Capture the input details and set to empty for output
      this._selectedClassificationPaths = this.selectedClassifications;
      this.selectedClassifications = [];
      this._searchBarElement = this.shadowRoot.querySelector("#classificationSearchBar");
      if(this._searchBarElement && this._searchBarElement.$.input.value != ""){
          this._searchBarElement.clear();
          this._searchBarElement.$.input.value = "";
          this._isSearchMode = false;
      }
      this._getClassificationManageModel();
  }

  _getClassificationManageModel() {
      this._classificationModelRequest = DataRequestHelper.createGetManageModelRequest(["classification"]);

      let classificationModelGetElement = this.$$("#classificationModelGet");
      if (classificationModelGetElement) {
          classificationModelGetElement.generateRequest();
      }
  }

  _onClassificationModelGetResponse(e) {
      let response = e.detail.response.response;

      if (response && response.entityModels) {
          let entityModel = response.entityModels[0];
          let externalNameAndExternalNameAttr = AttributeHelper.getExternalNameAndExternalNameAttr(entityModel);

          if (externalNameAndExternalNameAttr && externalNameAndExternalNameAttr.externalNameAttr) {
              this._classificationExtNameAttr = externalNameAndExternalNameAttr.externalNameAttr;

              this.executeRequest();

          } else {
              this.showWarningToast("Attribute not found with isExternalName in classification entity manage model.");
              this.logError("Attribute not found with isExternalName in classification entity manage model.", e.detail);
          }
      } else {
          this.showWarningToast("Entity manage model not found for classification.");
          this.logError("Entity manage model not found for classification.", e.detail);
      }
  }

  _onLineagePathResponse(e) {
      if (DataHelper.isValidObjectPath(e, 'detail.response')) {
          let response = e.detail.response;
          if (response.content && response.content.entities) {
              let entities = response.content.entities;
              let map = {};
              entities.forEach(e => {
                  if (DataHelper.isValidObjectPath(e, 'data.relationships.belongsto.0.attributes.lineagepath.values.0.value')) {
                      map[e.id] = e.data.relationships.belongsto[0].attributes.lineagepath.values[0].value;
                  }
              })

              this.selectedClassifications.forEach((classification) => {
                  if (!_.isEmpty(map[classification.id])) {
                      classification.valuePath = map[classification.id];
                  }
              });
              let eventData = {
                  name: "detailresponsereceived",
                  data: map
              }
              this._loading = false;
              this.dispatchEvent(new CustomEvent('bedrock-event', { detail: eventData, bubbles: true, composed: true }));
          }
      }
  }

  executeRequest(parentClassificationId, searchKeyword) {
      let relEntityType = "classification";
      let relType = "belongsto";

      if (!parentClassificationId) {
          this.classifications = [];
          this._currentNode = {};
          this._classificationIndex = 0;
          this._currentIndex = 0;
          parentClassificationId = this.rootNode;
          relEntityType = this.pathEntityType;
          relType = this.pathRelationshipName;
      }

      let contextData = DataHelper.cloneObject(this.contextData);
      let itemContext = { "attributeNames": [this._classificationExtNameAttr], "type": "classification" };

      let classificationCriteria = {};
      classificationCriteria[relType] = { "relTo": { "id": parentClassificationId, "type": relEntityType } };
      itemContext.relationshipsCriterion = [classificationCriteria];
      contextData[ContextHelper.CONTEXT_TYPE_ITEM] = [itemContext];
      contextData[ContextHelper.CONTEXT_TYPE_DATA] = [];

      if (searchKeyword) {
          delete itemContext.relationshipsCriterion;
      }

      let req = DataRequestHelper.createEntityGetRequest(contextData);
      if (searchKeyword) {
          let attributesCriterion = [];
          //To avaoid other rootNode classifcations search
          attributesCriterion.push({
              "rootexternalname": {
                  "eq": this.rootNodeExternalName,
                  "type": "_STRING"
              }
          });
          //externalName search
          if (this._classificationExtNameAttr) {
              let attrObj = {};
              attrObj[this._classificationExtNameAttr] = {
                  "contains": searchKeyword,
                  "type": "_STRING"
              }
              attributesCriterion.push(attrObj);
          }
          req.params.query.filters.attributesCriterion = attributesCriterion;
      }
      delete req.params.options;

      this.set('request', req);
      this.shadowRoot.querySelector("#initiateSearch").generateRequest();
  }

  _onInitiateSearchResponse(e) {
      this._currentRecord = 0;
      this._totalRecords = this.initiateSearchResponse.content.totalRecords;
      this._classificationsList = [];
      this._loading= true;
      this._makeNextBatchSearchDetailCall();
  }

  _makeNextBatchSearchDetailCall() {
      let start = this._currentRecord;
      let end = this._currentRecord + 19;
      if (start > this._totalRecords) {
          return;
      }
      if (end > this._totalRecords) {
          end = this._totalRecords;
      }
      let getDetailOptions = { 'from': start, 'to': end };
      this.set('request.params.options', getDetailOptions);
      this._loading= true;
      let liqGetSearchResultDetail = this.shadowRoot.querySelector('#getSearchResultDetail');
      liqGetSearchResultDetail.generateRequest();
  }

  _onGetSearchResultDetailResponse(e) {
      this._loading= false;
      this._showSearchBar = true;
      let res = e.detail.response;
      let classifications = res.content.entities;
      this._classificationsFound = true;
      if (this._searchClicked && _.isEmpty(classifications)) {
          this._classificationsFound = false;
      }
      for (let i in classifications) {
          let classification = classifications[i];
          let externalNameAttr = EntityHelper.getAttribute(classification, this._classificationExtNameAttr);
          let externamName = AttributeHelper.getFirstAttributeValue(externalNameAttr);
          classification.text = externamName || classification.name;
          classification.value = classification.name;
          classification.children = [];
      }

      this._classificationsList = this._classificationsList.concat(classifications);

      this._currentRecord += 20;
      if (this._currentRecord < this._totalRecords) {
          this._makeNextBatchSearchDetailCall();
      } else {
          this._classificationsList.sort(function (a, b) { return (a.text > b.text) ? 1 : ((b.text > a.text) ? -1 : 0); });
          if (!this._currentNode || _.isEmpty(this._currentNode)) {
              if (this.isModelTree && this.rootNodeData && !_.isEmpty(this.rootNodeData)) {
                  this.rootNodeData.children = this._classificationsList;
                  this.classifications = [this.rootNodeData];
              } else {
                  this.classifications = this._classificationsList;
              }
              this._checkForSelectedClassification();
          } else {
              if (!this._classificationsList.length) {
                  this._currentNode.changeToLeafMode();
              }
              this._currentNode.set('nodeData.children', this._classificationsList);
              this._currentNode.refreshChildList();
          }
      }
      this._searchClicked = false;
  }

  //If _selectedClassificationPaths available, then only pre selection process triggers
  _checkForSelectedClassification() {
      if (this.classifications.length == 0 || !this._selectedClassificationPaths || !this._selectedClassificationPaths.length || this._classificationIndex == this._selectedClassificationPaths.length) {
          return;
      }
      if (!this._currentClassification) {
          this._classificationIndex = 0;
          this._currentIndex = 0;
      }
      this._currentClassification = this._selectedClassificationPaths[this._classificationIndex];
      let name = this._currentClassification[this._currentIndex];
      if (this._currentIndex == 0) {
          this._currentNode = this.shadowRoot.querySelector("#contextTree").getElementNodeByPath(name);
      } else if (this._currentIndex == this._currentClassification.length) {
          if (this.enableNodeClick) {
              this._currentNode.triggerNodeClick();
          } else {
              this._currentNode.selectItem(true);
          }
          this._classificationIndex++;
          this._currentIndex = 0;
          this._checkForSelectedClassification();
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
              this._classificationIndex++;
              this._currentIndex = 0;
              this._checkForSelectedClassification();
              return;
          }
      }
      this._currentIndex++;
      if (this._currentNode) {
          if (this._currentNode.expanded) {
              this._checkForSelectedClassification();
          } else {
              this._currentNode.expand();
          }
      }
  }

  _treeNodeExpanded(e) {
      this._currentNode = e.detail;
      if (!this._currentNode.nodeData.children || this._currentNode.nodeData.children.length == 0) {
          this.executeRequest(this._currentNode.nodeData.id);
          this._currentNode.startLoading();
      }
  }

  _treeNodeClicked(ev) {
      if (this.enableNodeClick) {
          //fire event for node click
          if (ev.detail.data) {
              let _node = ev.detail.data;
              this.fireBedrockEvent("classification-item-clicked", _node, { targetId: true })
          }
      }
  }

  _childListRefreshed() {
      this._checkForSelectedClassification();
  }

  _onRootNodeChange() {
      if (this.rootNode && this._classificationExtNameAttr) {
          let classificationReq = this._getClassificationsEntityGetRequest();
          let liquidDataElement = this.shadowRoot.querySelector("#rootNodeGet");
          if (liquidDataElement) {
              liquidDataElement.requestData = classificationReq;
              liquidDataElement.generateRequest();
          }
      }
  }

  _getClassificationsEntityGetRequest() {
      let request = DataRequestHelper.createEntityGetRequest(this.contextData, true);
      //Update attributes type and id
      request.params.fields.attributes = [this._classificationExtNameAttr];
      request.params.query.filters.typesCriterion = ["classification"];
      request.params.query.id = this.rootNode;

      return request;
  }

  _onRootNodeGetResponse(e, detail) {
      let entities = [];
      if (DataHelper.isValidObjectPath(detail, "response.content.entities")) {
          entities = detail.response.content.entities;
      }

      let attributeValue = "";
      if (_.isEmpty(entities) ||
          !(attributeValue = AttributeHelper.getFirstAttributeValue(EntityHelper.getAttribute(entities[0], this._classificationExtNameAttr)))) {
          this.logError("Classification entity/extenalName missing for the save process");
          return;
      }

      this.rootNodeExternalName = attributeValue;
  }

  _onRootNodeGetError(e) {
      this.logError("Classification entity data get failed", e.detail);
  }
}

customElements.define(RockClassificationTree.is, RockClassificationTree);
