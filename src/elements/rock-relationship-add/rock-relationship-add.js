/**
 `rock-relationship-add` Represents an element that selects the assets or entities from the list of assets or entities and provides a link to the selected entity.
 @demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import { microTask } from '@polymer/polymer/lib/utils/async.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-helpers/data-request-helper.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-business-function-behavior/bedrock-component-business-function-behavior.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-flex-layout.js';
import '../bedrock-style-manager/styles/bedrock-style-buttons.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import '../bedrock-style-manager/styles/bedrock-style-heading.js';
import '../liquid-entity-data-save/liquid-entity-data-save.js';
import '../liquid-dataobject-utils/liquid-dataobject-utils.js';
import '../pebble-button/pebble-button.js';
import '../pebble-icons/pebble-icons.js';
import '../pebble-accordion/pebble-accordion.js';
import '../pebble-spinner/pebble-spinner.js';
import '../rock-search-bar/rock-search-bar.js';
import '../rock-entity-search-filter/rock-entity-search-filter.js';
import '../rock-entity-search-result/rock-entity-search-result.js';
import '../rock-assets-search-grid/rock-assets-search-grid.js';
import '../rock-search-query-parser/rock-search-query-parser.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockRelationshipAdd
    extends mixinBehaviors([
        RUFBehaviors.UIBehavior,
        RUFBehaviors.ComponentContextBehavior,
        RUFBehaviors.ComponentConfigBehavior
    ], OptionalMutableData(PolymerElement)) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-heading bedrock-style-grid-layout bedrock-style-padding-margin bedrock-style-buttons bedrock-style-flex-layout">
            :host {
                height: 100%;
                display: block;
            }

            /* Search */

            .resetsearch {
                position: absolute;
                right: 0;
                bottom: -14px;
                font-size: var(--font-size-xs, 10px);
                color: var(--link-text-color);
            }

            .resetsearch pebble-button {
                height: auto;
                --pebble-button: {
                    font-size: var(--font-size-xs, 10px) !important;
                    height: auto;
                    padding-bottom: 0;
                }

                --pebble-icon-color: {
                    fill: var(--palette-deep-sea-blue, #034c89);
                }

                --pebble-icon-dimension: {
                    width: 12px;
                    height: 12px;
                }

                --pebble-button-left-icon: {
                    margin-right: 5px;
                }
            }
            .buttonContainer-top-right {
                text-align: right;
                padding-top: 10px;
                padding-bottom: 10px;
                margin-bottom: 0px;
                margin-top: 0px;
            }

            .search-container {
                position: relative;
                display: block;
                width: 100%;
            }
            .min-width-0 {
                min-width: 0px;
            }
        </style>
        <div class="base-grid-structure">
            <div class="base-grid-structure-child-1">
            <div id="buttonContainer" class="buttonContainer-top-right base-grid-structure-child-1" align="center">
             <template is="dom-if" if="[[showActionButtons]]">
                    <!-- <template is="dom-if" if="[[!isPartOfBusinessFunction]]"> -->
                        <pebble-button class="action-button btn btn-secondary m-l-5" id="cancel" button-text="Cancel" raised="" on-tap="_onCancelTap"></pebble-button>
                    <!-- </template> -->
                    <pebble-button class="action-button-focus dropdownText btn btn-success m-l-5" id="next" button-text="Save" raised="" on-tap="_onSaveTap"></pebble-button>
            </template>
            </div>
                <h3 class="heading" align="center" hidden\$="[[!_isheading()]]">[[heading]] </h3>
                <div class="layout horizontal">
                    <div class="flex">
                        <!-- search bar-->
                        <bedrock-pubsub event-name="rock-search" handler="_onSearch" target-id="searchBar"></bedrock-pubsub>
                        <bedrock-pubsub event-name="rock-search-update" handler="_showResetSearch" target-id="searchBar"></bedrock-pubsub>
                        <div class="search-container">
                            <rock-search-bar id="searchBar" placeholder="Enter Search text"></rock-search-bar>
                            <div class="resetsearch" hidden\$="[[!_resetSearchEnabled]]">
                                <pebble-button icon="pebble-icon:reset" class="btn-link" on-tap="_resetSearch" button-text="Reset Search"></pebble-button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flex searchFilterTag min-width-0">
                    <!-- Search Filter Tags -->
                    <rock-entity-search-filter id="searchFilter" _selected-search-filters="{{_selectedSearchFilters}}" context-data="[[_getFilterContextData(contextData, mode)]]" types-criterion="[[typesCriterion]]" tags="{{tags}}" attributes-type="domainMapped"></rock-entity-search-filter>
                    <bedrock-pubsub event-name="tag-item-added" handler="_showResetSearch"></bedrock-pubsub>
                    <bedrock-pubsub event-name="tag-item-remove" handler="_showResetSearch"></bedrock-pubsub>
                    <bedrock-pubsub event-name="build-query" handler="_searchFiltersChanged"></bedrock-pubsub>
                </div>
            </div>
            <div class="base-grid-structure-child-2">
                <div class\$="[[_getGridClass()]]">
                    <template is="dom-if" if="{{_isAssetMode(mode)}}">
                        <rock-assets-search-grid id="assetsSearchGrid" context-data="[[_getContextData(contextData, isRelationshipsByContext)]]" types-criterion="[[typesCriterion]]" grid-config="[[addRelationshipGridConfig]]" search-filters="[[_selectedSearchFilters]]" search-query="[[_searchQuery]]"></rock-assets-search-grid>
                    </template>
                    <template is="dom-if" if="{{!_isAssetMode(mode)}}">
                        <rock-entity-search-result id="entitySearchGrid" context-data="[[_getContextData(contextData, isRelationshipsByContext)]]" types-criterion="[[typesCriterion]]" grid-config="{{addRelationshipGridConfig}}" pre-selected-items="[[preSelectedItems]]" search-filters="[[_selectedSearchFilters]]" search-query="[[_searchQuery]]"></rock-entity-search-result>
                    </template>
                </div>
                <pebble-spinner active="[[_loading]]"></pebble-spinner>
                <liquid-entity-data-save name="entitySaveService" data-index="[[dataIndex]]" request-data="{{_saveRequest}}" last-response="{{_saveResponse}}" on-response="_onSaveResponse" on-error="_onSaveError">
                </liquid-entity-data-save>
                <rock-search-query-parser id="queryParser" context-data="[[contextData]]"></rock-search-query-parser>
                <bedrock-pubsub id="parser-event" event-name="on-search-filters" handler="_onSearchFiltersChange" target-id="queryParser"></bedrock-pubsub>
                <liquid-entity-model-composite-get name="compositeAttributeModelGet" request-data="{{_attributeModelRequest}}" on-entity-model-composite-get-response="_onCompositeModelGetResponse">
                </liquid-entity-model-composite-get>
            </div>
        </div>
`;
  }

  static get is() { return 'rock-relationship-add' }

  static get properties() {
      return {
          /**
            * <b><i>Content development is under progress... </b></i> 
            */
          mode: {
              type: String,
              value: ""
          },
          /*
           *  Indicates the context data.
           */
          contextData: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          /**
            * <b><i>Content development is under progress... </b></i> 
            */
          typesCriterion: {
              type: Array,
              value: function () { return []; }
          },
          /**
            * <b><i>Content development is under progress... </b></i> 
            */
          config: {
              type: Object,
              value: function () { return {}; }
          },
          _searchQuery: {
              type: String,
              notify: true,
              value: ''
          },
          _selectedSearchFilters: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          _resetSearchEnabled: {
              type: Boolean,
              value: false
          },
          /**
            * <b><i>Content development is under progress... </b></i> 
            */
          direction: {
              type: String,
              value: "up"
          },
          /**
            * <b><i>Content development is under progress... </b></i> 
            */
          title: {
              type: String
          },
          /**
            * <b><i>Content development is under progress... </b></i> 
            */
          relationshipType: {
              type: String
          },
          /**
            * <b><i>Content development is under progress... </b></i> 
            */
          selectedEntities: {
              type: Array,
              value: function () {
                  return []
              }
          },
          /**
            * <b><i>Content development is under progress... </b></i> 
            */
          selfContext: {
              type: Boolean,
              value: false
          },
          _loading: {
              type: Boolean,
              value: false
          },
          showActionButtons: {
              type: Boolean,
              value: true
          },
          addRelationshipGridConfig: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _entityContextData: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _attributeModelRequest: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _relationshipModels: {
              type: Object,
              value: function () { return {}; }
          },
          isRelationshipsByContext: {
              type: Boolean,
              value: false
          },
          dataIndex: {
              type: String,
              value: "entityData"
          },
          preSelectedItems: {
              type: Array,
              value: []
          },
          filterRules: {
              type: Object,
              value: {}
          },
          _attributeModels: {
              type: Object,
              value: {}

          }
      }
  }
  static get observers() {
      return [
          '_contextDataChanged(contextData,typesCriterion,mode)'
      ]
  }
  disconnectedCallback() {
      super.disconnectedCallback();
      this.removeEventListener("view-mode-changed", this.onViewModeChanged);
  }
  connectedCallback() {
      super.connectedCallback();
      this.addEventListener("view-mode-changed", this.onViewModeChanged);
  }
  /**
    * <b><i>Content development is under progress... </b></i> 
    */
  ready() {
      super.ready();
      if (this.parentElement) {
          //Grid config need to add for rock-relationship-add 
          this.config = this.parentElement.__dataHost.config;
          if (!_.isEmpty(this.config) && this.config.steps[0].component.properties.dataIndex) {
              this.dataIndex = this.config.steps[0].component.properties.dataIndex;
          }
      }

  }
  _isheading() {
      return !!this.heading;
  }
  _getGridClass() {
      let _gridWithActionButtons = "full-height"
      if (this.showActionButtons) {
          _gridWithActionButtons = "full-height button-siblings"
      }
      return _gridWithActionButtons;
  }
  _contextDataChanged() {
      if (!_.isEmpty(this.contextData) && this.typesCriterion && this.typesCriterion.length) {
          let itemContexts = [];

          //Selected entity specific context data to search results
          if (this.selectedEntities && this.selectedEntities.length > 0) {
              let entityContextData = DataHelper.cloneObject(this.contextData);
              entityContextData[ContextHelper.CONTEXT_TYPE_ITEM] = [{
                  'type': this.selectedEntities[0].type,
                  'relationships': [this.relationshipType]
              }];

              this._entityContextData = entityContextData;
          }

          for (let i in this.typesCriterion) {
              let itemContext = {
                  'type': this.typesCriterion[i]
              };
              itemContexts.push(itemContext);
          }
          this.contextData[ContextHelper.CONTEXT_TYPE_ITEM] = itemContexts;
          this._refreshGrid();
          this._buildQueryString();
          let compositeModelGetRequest = DataRequestHelper.createEntityModelCompositeGetRequest(this.contextData);
          if (DataHelper.isValidObjectPath(compositeModelGetRequest, 'params.fields.attributes')) {
              compositeModelGetRequest.params.fields.attributes = "_ALL";
          }
          this.set("_attributeModelRequest", compositeModelGetRequest);
          let liquidModelGet = this.shadowRoot.querySelector("[name=compositeAttributeModelGet]");
          if (liquidModelGet && compositeModelGetRequest) {
              liquidModelGet.generateRequest();
          }
      }
  }
  _onSearch(e, detail, sender) {
      if (!_.isEmpty(detail)) {
          this._searchQuery = detail.query;
      }
      this._searchTimeStamp = new Date().toLocaleString();
      this._buildQueryString();
      this._refreshGrid();
  }

  //Rock search clear
  _resetSearch() {
      let rockSearchBar = this.shadowRoot.querySelector('#searchBar');
      if (rockSearchBar) {
          rockSearchBar.query = "";
          rockSearchBar.searchText = "";
          rockSearchBar.setAttribute("placeholder", "");
      }
      this._searchQuery = '';
      this._selectedSearchFilters = [];
      this.$.searchFilter.clearSearchFilters();
      this._resetSearchEnabled = false;
      this._refreshGrid();
      this._buildQueryString();
  }
  _showResetSearch(e) {
      let rockSearchBar = this.shadowRoot.querySelector('#searchBar');
      let rockSearchFilter = this._getElement('rockSearchFilter');
      let query = '';
      let tags = [];

      if (rockSearchBar) {
          query = rockSearchBar.query;
      }

      if (rockSearchFilter) {
          tags = rockSearchFilter.tags;
      }

      if (!_.isEmpty(query) || tags.length > 0 || this.inputQueryString != "") {
          this._resetSearchEnabled = true;
      } else {
          this._resetSearchEnabled = false;
      }
  }
  _getElement(element) {
      if (element == "rockEntitySearchFilter") {
          if (!this._rockEntitySearchFilter) {
              this._rockEntitySearchFilter = this.shadowRoot.querySelector("#searchFilter");
          }

          return this._rockEntitySearchFilter
      }

      if (element == "rockSearchFilter") {
          if (!this._rockSearchFilter) {
              let entitySearchFilter = this._getElement("rockEntitySearchFilter");
              if (entitySearchFilter && entitySearchFilter.shadowRoot) {
                  this._rockSearchFilter = entitySearchFilter.shadowRoot.querySelector("rock-search-filter");
              }
          }

          return this._rockSearchFilter
      }
  }
  _isAssetMode(mode) {
      return mode == "asset";
  }
  _onSaveResponse(e, detail) {
      this._loading = false;
      this.showSuccessToast('Relationships save request is submitted successfully!!');
      let data = {};
      let eventDetails = [{
          "action": {
              "name": "refresh-relationship-grid",
              "relationshipType": this.relationshipType
          }
      }];
      this.dataFunctionComplete(data, eventDetails, true);
  }
  _onCancelTap() {
      this.fire("cancel-event");
  }
  _onSaveError(e, detail) {
      this._loading = false;
      this.showErrorToast("Relationships save request failed.");
      this.logError("Unable to add relationship now, contact administrator.", e.detail);
      console.warn(e);
  }
  _getGrid() {
      if (this.mode == "asset") {
          return this.shadowRoot.querySelector("#assetsSearchGrid");
      }
      return this.shadowRoot.querySelector("#entitySearchGrid")
  }
  // lot-sku (isChildOf)
  async _createRelationshipsUp(_targetList) {
      let firstContextData = ContextHelper.getFirstDataContext(this.contextData);
      let utils = SharedUtils.DataObjectFalcorUtil;
      if (this.selectedEntities && this.selectedEntities.length > 0 && _targetList && _targetList.length > 0) {
          let _relationshipList = [];
          for (let i = 0; i < _targetList.length; i++) {
              let rel = {
                  "direction": "both",
                  "relationshipType": this.relationshipType,
                  "relTo": {
                      "id": _targetList[i].id,
                      "type": _targetList[i].type
                  }
              };
              if(_targetList[i].type == "attributeModel"){
                  rel.relTo.externalName = (_targetList[i].properties && _targetList[i].properties.externalName) ? _targetList[i].properties.externalName :  _targetList[i].name;
              }
              _relationshipList.push(rel);
          }
          let upRelationshipRequests = [];
          for (let i = 0; i < this.selectedEntities.length; i++) {
              let entity = this.selectedEntities[i];
              let relationships = EntityHelper.getRelationshipByRelationshipType(entity, firstContextData, this.relationshipType);
              relationships = _relationshipList.reduce(function (coll, item) {
                  coll.push(item);
                  return coll;
              }, relationships);

              DataTransformHelper.prepareEntityForContextSave(entity.data, {}, this._relationshipModels, this._entityContextData);

              upRelationshipRequests.push(entity);
          }

          this._saveRequest = {
              "entities": upRelationshipRequests
          };

          let liquidSave = this.shadowRoot.querySelector("[name=entitySaveService]");
          if (liquidSave) {
              liquidSave.operation = "update";
              liquidSave.generateRequest();
          }
      }
  }

  // ensembletopp
  // productpresentationtolot
  async _createRelationshipsDown(_targetList) {
      let firstContextData = ContextHelper.getFirstDataContext(this.contextData);
      let utils = SharedUtils.DataObjectFalcorUtil;
      if (this.selectedEntities && this.selectedEntities.length > 0 && _targetList && _targetList.length > 0) {
          let relationshipRequests = [];
          let _relationshipList = [];
          for (let i = 0; i < this.selectedEntities.length; i++) {
              let rel = {
                  "direction": "both",
                  "relationshipType": this.relationshipType,
                  "relTo": {
                      "id": this.selectedEntities[i].id,
                      "type": this.selectedEntities[i].type
                  }
              };

              _relationshipList.push(rel);
          }

          for (let i = 0; i < _targetList.length; i++) {
              let entity = _targetList[i];
              let relationships = EntityHelper.getRelationshipByRelationshipType(entity, firstContextData, this.relationshipType);
              relationships = _relationshipList.reduce(function (coll, item) {
                  coll.push(item);
                  return coll;
              }, relationships);
              DataTransformHelper.prepareEntityForContextSave(entity.data, {}, this._relationshipModels, this._entityContextData);
              relationshipRequests.push(entity);
          }

          this._saveRequest = {
              "entities": relationshipRequests
          };

          let liquidSave = this.shadowRoot.querySelector("[name=entitySaveService]");
          if (liquidSave) {                       
              liquidSave.operation = "update";
              liquidSave.generateRequest();
          }
      }
  }
  _onSaveTap() {
      let grid = this._getGrid();
      if (grid) {
          let selectedItems = grid.getSelectedItems();
          if (!selectedItems.length) {
              this.showInformationToast("Select at least 1 entity to link.");
              return false;
          }
          
          if (this.direction == "up") {
              this._createRelationshipsUp(selectedItems);
          } else {
              this._createRelationshipsDown(selectedItems);
          }
      }
      
      this._loading = true;
  }

  _searchFiltersChanged(e, detail) {
      let tags = detail;
      let _selectedSearchFilters = [];
      if (tags && tags.length > 0) {
          for (let i = 0; i < tags.length; i++) {
              let tag = tags[i];
              let attrCond = {};
              if (tag.options && !tag.options.isLocalizable) {
                  let defaultValCtx = DataHelper.getDefaultValContext();
                  tag.value["valueContexts"] = [defaultValCtx];
              }
              attrCond[tag.name] = tag.value;
              _selectedSearchFilters.push(attrCond);
          }
      }
      this.set('_selectedSearchFilters', _selectedSearchFilters);
      //this._refreshGrid();
      this._buildQueryString(tags);
  }

  _buildQueryString(attributeList) {
      let attributeListArray = [];
      let keywordSearchStr = "";
      if (this._searchQuery) {
          keywordSearchStr = this._searchQuery;
      }

      if (attributeList) {
          let displayValue = "";
          if (this._searchQuery) {
              keywordSearchStr = this._searchQuery;
          }
          let queryParser = this.shadowRoot.querySelector("[id=queryParser]");
          for (let i = 0; i < attributeList.length; i++) {
              let value = attributeList[i].displayValue;
              if ((DataHelper.isValidObjectPath(attributeList[i], 'options.dataType')) && attributeList[i].options.dataType == "boolean") {
                  value = attributeList[i].booleanSearchValue;
              }
              let _displayType = "";
              if (DataHelper.isValidObjectPath(attributeList[i], 'options.displayType')) {
                  _displayType = attributeList[i].options.displayType;
              }
              if (queryParser && _displayType != "RichTextEditor" && _displayType != "TextArea") {
                  value = queryParser.formatValue(value);
              }
              let newItem = {
                  name: attributeList[i].longName,
                  value: value,
                  attributeModel: attributeList[i].options
              }
              attributeListArray.push(newItem);
          }
          this.attributeGridData = attributeListArray;
      }

      let queryString = RUFBehaviors.QueryBuilderBehavior.buildQuery(this.typesCriterion, attributeListArray, {}, false, keywordSearchStr);
      
      let parsableString = RUFBehaviors.QueryBuilderBehavior.buildQuery(this.typesCriterion, attributeListArray, {}, true, keywordSearchStr);

      this._displayQuery(queryString, parsableString);
      this._parseQuery(parsableString);
  }

  _displayQuery(queryStr, parsableQueryStr) {
      let searchBarElement = this.shadowRoot.querySelector("#searchBar");
      if (!searchBarElement) {
          return;
      }
      if (queryStr) {
          searchBarElement.searchText = this._searchQuery;
          searchBarElement.setAttribute("placeholder", "");
          if (queryStr.indexOf("!%&") > -1) {
              queryStr = queryStr.replace(/!%&/g, "");
          }
          searchBarElement.setAttribute("placeholder", queryStr);
      }
      this._showResetSearch();
  }

  _parseQuery(query) {
      let queryParser = this.shadowRoot.querySelector("[id=queryParser]");
      if (queryParser) {
          queryParser.parseQueryToFilters(query);
      }
  }

  _onSearchFiltersChange(e, detail) {
      if(detail && detail.attributesCriterion){
          this.set('_selectedSearchFilters', detail.attributesCriterion);
      }
      this._refreshGrid();
  }

  _refreshGrid() {
      microTask.run(() => {
          let grid = this._getGrid();
          if (grid) {
              grid.refresh();
          }
      });
  }
  onViewModeChanged(event) {
    if (event && event.detail && event.detail.data) {
        let mode = event.detail.data.toLowerCase();
        let viewMode = this.addRelationshipGridConfig && this.addRelationshipGridConfig.viewConfig ?
                this.addRelationshipGridConfig.viewConfig[mode] : undefined;
        if (viewMode === undefined) {
            this.showActionButtons = false;
        }
        else {
            this.showActionButtons = true;
        }
    }
}

  _onCompositeModelGetResponse(e) {
      let itemContext = this.getFirstItemContext();
      if (e && e.detail && DataHelper.validateGetModelsResponse(e.detail.response)) {
          let compositeModel = e.detail.response.content.entityModels[0];
          if (compositeModel && compositeModel.data) {
              this._attributeModels = DataTransformHelper.transformAttributeModels(compositeModel, this.contextData);
              //354678 :If attribute models are not available at context level,fall back to self level.
              let firstDataContext = ContextHelper.getFirstDataContext(this.contextData);
              if(!_.isEmpty(firstDataContext) && _.isEmpty(this._attributeModels)){
                  let clonedContextData = DataHelper.cloneObject(this.contextData);
                  clonedContextData[ContextHelper.CONTEXT_TYPE_DATA] = [];
                  this._attributeModels = DataTransformHelper.transformAttributeModels(compositeModel, clonedContextData);
              }
              if (!_.isEmpty(this._attributeModels) && !_.isEmpty(this.filterRules) && !_.isEmpty(this.filterRules.filterAttributesCriterion[0])) {
                  let filteredAttribute = Object.keys(this.filterRules.filterAttributesCriterion[0])[0];
                  if(this._attributeModels.hasOwnProperty(filteredAttribute)){
                      this._formatFilterRulesTags(this.filterRules.filterAttributesCriterion, this._attributeModels);
                  }else{
                      this.showWarningToast("Filter rule attribute missing - " + filteredAttribute);
                  }
              }
              this._relationshipModels = DataTransformHelper.transformRelationshipModels(compositeModel, this._entityContextData);
          }
      }
  }

  _formatFilterRulesTags(searchFilters, attributeModels) {
      let rockSearchFilter = this._getElement('rockSearchFilter');
      let tags = [];
      // searchFilters = this.getFilterValue(searchFilters);
      for (let i = 0; i < searchFilters.length; i++) {
          let filter = searchFilters[i];
          if (!_.isEmpty(filter)) {
              let tag = {};
              for (let attrName in filter) {
                  let keys = Object.keys(this.filterRules.filterAttributesCriterion[0]);
                  let attrModel = attributeModels[keys[0]]
                  let attribute = filter[attrName];
                  if (attrModel) {
                      if (attrModel.dataType.toLowerCase() == "integer" || attrModel.dataType.toLowerCase() == "decimal") {
                          attrModel.displayType = "numeric";
                      }
                      tag.name = attrName;
                      tag.longName = attrModel.externalName;
                      tag.options = DataHelper.cloneObject(attrModel);
                  }
                  tag.value = attribute;
                  if (attribute.hasvalue != undefined) {
                      tag.displayValue = attribute.hasvalue ? "!%&has value!%&" : "!%&has no value!%&";
                  } else if (attribute.type === "_STRING") {
                      if (attribute.exacts) {
                          tag.displayValue = rockSearchFilter.formatFilterCollectionDisplay(attribute.exacts);
                      } else if (attribute.contains) {
                          tag.displayValue = rockSearchFilter.formatFilterCollectionDisplay(attribute.contains.split(" "));
                      } else if (attribute.exact) {
                          tag.displayValue = attribute.exact;
                      }
                  } else if (attribute.type === "_DECIMAL" || attribute.type === "_INTEGER") {
                      if (attribute.lte && attribute.gte) {
                          tag.displayValue = attribute.gte + " - " + attribute.lte;
                      } else if (attribute.contains) {
                          tag.displayValue = rockSearchFilter.formatFilterCollectionDisplay(attribute.contains.split(" "));
                      }
                  } else if (attribute.type === "_BOOLEAN") {
                      tag.displayValue = attribute.eq;
                  } else if (attribute.type === "_DATETIME") {
                      if (attribute.lte === attribute.gte) {
                          tag.displayValue = FormatHelper.convertFromISODateTime(attribute.gte, tag.options.dataType);
                      } else {
                          tag.displayValue = FormatHelper.convertFromISODateTime(attribute.gte, tag.options.dataType) + " - " + FormatHelper.convertFromISODateTime(attribute.lte, tag.options.dataType);
                      }
                  }
                  tag.value.hasvalue = true;
              }
              //Set no popover for saved searches
              if (tag.options) {
                  tag.options.noPopoverOnAttach = true;
              } else {
                  tag.options = { "noPopoverOnAttach": true };
              }

              tags.push(tag);
          }
      }

      rockSearchFilter.tags = tags;
      this._searchFiltersChanged(null, tags);
  }

  _getFilterContextData(contextData, mode) {
      if (mode && contextData) {
          if (mode == "asset") {
              let contextWithoutDataContext = DataHelper.cloneObject(contextData);
              contextWithoutDataContext.Contexts = [];
              return contextWithoutDataContext;
          } else {
              return contextData
          }
      }
  }

  _getContextData(contextData) {
      if (this.isRelationshipsByContext) {
          return contextData;
      }
      let contexts = [];
      let clonedContextData = DataHelper.cloneObject(contextData);
      if (!_.isEmpty(this.filterRules.filterContexts)) {
          contexts.push(this.filterRules.filterContexts);
      }
      clonedContextData[ContextHelper.CONTEXT_TYPE_DATA] = contexts;
      return clonedContextData;
  }
}
customElements.define(RockRelationshipAdd.is, RockRelationshipAdd)
