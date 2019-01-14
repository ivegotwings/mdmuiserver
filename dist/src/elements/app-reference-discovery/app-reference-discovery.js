import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { microTask } from '@polymer/polymer/lib/utils/async.js';
import '../bedrock-app-behavior/bedrock-app-behavior.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-helpers/component-helper.js';
import '../bedrock-query-builder-behavior/bedrock-query-builder-behavior.js';
import '../bedrock-logger-behavior/bedrock-logger-behavior.js';
import '../bedrock-toast-behavior/bedrock-toast-behavior.js';
import '../bedrock-navigation-behavior/bedrock-navigation-behavior.js';
import '../liquid-rest/liquid-rest.js';
import '../liquid-entity-model-composite-get/liquid-entity-model-composite-get.js';
import '../pebble-actions/pebble-actions.js';
import '../pebble-button/pebble-button.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-popover/pebble-popover.js';
import '../pebble-vertical-divider/pebble-vertical-divider.js';
import '../rock-entity-search-result/rock-entity-search-result.js';
import '../rock-context-selector/rock-context-selector.js';
import '../rock-business-actions/rock-business-actions.js';
import '../rock-layout/rock-layout.js';
import '../rock-layout/rock-titlebar/rock-titlebar.js';
import '../rock-layout/rock-header/rock-header.js';
import '../rock-search-bar/rock-search-bar.js';
import '../rock-entity-search-filter/rock-entity-search-filter.js';
import '../rock-entity-quick-manage/rock-entity-quick-manage.js';
import '../rock-entity-type-model-lov/rock-entity-type-model-lov.js';
import '../rock-search-query-parser/rock-search-query-parser.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-flex-layout.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../rock-component-config-behavior/rock-component-config-behavior.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class AppReferenceDiscovery
    extends mixinBehaviors([
        RUFBehaviors.QueryBuilderBehavior,
        RUFBehaviors.AppBehavior,
        RUFBehaviors.ComponentConfigBehavior,
        RUFBehaviors.LoggerBehavior,
        RUFBehaviors.ToastBehavior,
        RUFBehaviors.NavigationBehavior
    ], PolymerElement) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-icons bedrock-style-padding-margin bedrock-style-flex-layout">
            #dimensionContainer {
                width:100%;
                align-self: center;
                -webkit-align-self: center;
            }

            :host {
                display: block;
                height: 100%;
            }

            pebble-popover {
                --pebble-popover-width: 260px;
                --pebble-popover-max-width: 100%;
            }

            pebble-popover paper-item {
                cursor: pointer;
                font-size: var(--default-font-size, 14px);
                padding: 0 0 0 0;
                min-height: 40px;
            }

            .badge {
                font-weight: normal;
                border-radius: 50%;
                margin-right: 10px;
                width: 25px;
                height: 25px;
                background-color: var(--default-notification-color, #ed204c);
                opacity: 1.0;
                color: var(--default-notification-text-color, #ffffff);
                @apply --layout;
                @apply --layout-center-center;
                @apply --paper-font-common-base;
            }

            rock-header {
                padding: 20px 20px 0 20px;
                display: block;
            }

            .quick-manage-container {
                height: 100%;
                width: 31%;
                display: block;
                padding-right: 15px;
                position: relative;
            }

            .grid-quick-manage-container {
                width: 70%;
            }

            pebble-vertical-divider {
                --pebble-vertical-divider-color: #c1cad4;
                height: 100%;
                border: 0px;
                min-height: 0px;
                width: 2px;
                margin-top: 0px;
                margin-right: 0px;
                margin-bottom: 0px;
                margin-left: 0px;
            }

            .container {
                width: 100%;
            }

            pebble-actions {
                --popover: {
                    color: var(--palette-white, #fff);
                }
                --popover-paper-item: {
                    padding-top: 5px;
                    padding-right: 10px;
                    padding-bottom: 5px;
                    padding-left: 10px;
                    text-align: left;
                }
                --popover-action-item: {
                    font-size: var(--font-size-sm, 12px);
                    color: var(--palette-steel-grey);
                }
                --popover-action-item-hover: {
                    color: var(--focused-line, #026bc3);
                    background-color: var(--bgColor-hover, #e8f4f9);
                }
                --popover-action-item-focus: {
                    color: var(--primary-button-color, #09c021);
                }
                --pebble-manual-actions: {
                    margin-top: 0;
                }
            }

            .contentContainer {
                @apply --app-reference-discovery-content-height;
            }

            /* Search */

            .resetsearch {
                position: absolute;
                right: 0;
                bottom: -12px;
                font-size: var(--font-size-xs, 10px);
                color: var(--link-text-color, #036Bc3);
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

            .search-container {
                position: relative;
                display: block;
                width: 100%;
            }

            #refTypeMsg {
                top: 0;
                left: 30px;
                right: 30px;
                bottom: auto;
            }
            .font-italic {
                font-style:italic;
            }

            rock-layout {
                --scroller: {
                    overflow-x: hidden;
                    overflow-y: hidden;
                }
            }
            .min-width-0 {
                min-width: 0px;
            }
        </style>
        <rock-layout>
            <liquid-entity-model-composite-get name="compositeAttributeModelGet" on-entity-model-composite-get-response="_onCompositeModelGetResponse">
            </liquid-entity-model-composite-get>
            <rock-titlebar slot="rock-titlebar" icon="pebble-icon:data-model" main-title="Reference Search &amp; Refine" non-minimizable="[[appConfig.nonMinimizable]]" non-closable="[[appConfig.nonClosable]]">
                <div id="dimensionContainer" align="right">
                    <rock-context-selector id="contextSelector" navigation-data="[[navigationData]]" context-data="[[contextData]]" app-name="app-reference-discovery" domain="[[domain]]" all-single-select="" selected-dimensions-detail="{{_selectedDimensions}}"></rock-context-selector>
                </div>
            </rock-titlebar>

            <template is="dom-if" if="[[isContextLoaded]]">
                <rock-header slot="rock-header">
                    <div class="fixed-content" slot="fixed-content">
                        <div class="layout horizontal">
                            <div class="action-buttons m-r-10">
                                <!-- Actions buttons and its popover -->
                                <div>
                                    <pebble-button id="actions" class="dropdownText btn dropdown-outline-primary m-r-5" button-text="{{_mainTitle}}" noink="" dropdown-icon="" on-tap="_onActionsTap"></pebble-button>
                                    <pebble-popover id="actionsPopover" for="actions" no-overlap="" horizontal-align="left">
                                        <rock-entity-type-model-lov multi-select="{{_multiSelect}}" domain="[[domain]]" id="referenceDataLov" sort-field="externalName" selected-item="[[lovSelectedItem]]"></rock-entity-type-model-lov>
                                    </pebble-popover>
                                    <bedrock-pubsub event-name="entity-type-selection-changed" handler="_onReferenceDataChange" target-id="referenceDataLov"></bedrock-pubsub>
                                </div>
                            </div>
                            <div class="flex">
                                <!-- search bar-->
                                <bedrock-pubsub event-name="rock-search" handler="_onSearch" target-id="searchBar"></bedrock-pubsub>
                                <bedrock-pubsub event-name="rock-search-update" handler="_showResetSearch" target-id="searchBar"></bedrock-pubsub>
                                <div class="search-container">
                                    <rock-search-bar id="searchBar" placeholder="Enter Search text"></rock-search-bar>
                                    <div class="resetsearch" hidden\$="[[!_resetSearchEnabled]]">
                                        <pebble-button icon="pebble-icon:reset" class="btn-link pebble-icon-color-blue" on-tap="_resetSearch" button-text="Reset Search"></pebble-button>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <!-- Saved Search button & its popover-->
                            </div>
                        </div>
                        <template is="dom-if" if="[[_processTemplate]]">
                            <div class="layout horizontal p-t-10">
                                <div class="flex searchFilterTag min-width-0">
                                    <!-- Search Filter Tags -->
                                    <rock-entity-search-filter id="searchFilter" selected-search-filters="{{_selectedSearchFilters}}" context-data="[[contextData]]" types-criterion="[[_typesCriterion]]" tags="{{tags}}" settings="[[_getComponentSettings('rock-entity-search-filter')]]"></rock-entity-search-filter>
                                    <bedrock-pubsub event-name="tag-item-added" handler="_showResetSearch"></bedrock-pubsub>
                                    <bedrock-pubsub event-name="tag-item-remove" handler="_showResetSearch"></bedrock-pubsub>
                                    <bedrock-pubsub event-name="build-query" handler="_buildQueryString"></bedrock-pubsub>
                                </div>
                                <template is="dom-if" if="[[showAddNew]]">
                                    <pebble-button icon="pebble-icon:action-add" class="btn btn-primary m-r-10" button-text="Add New" on-click="_onQuickManageAdd"></pebble-button>
                                </template>
                                <rock-business-actions id="businessActions" context-data="[[contextData]]" class="m-r-10"></rock-business-actions>
                                <bedrock-pubsub event-name="business-actions-action-click" handler="_onBusinessActionItemTap" target-id="businessActions"></bedrock-pubsub>
                            </div>
                        </template>
                    </div>
                    <div class="shrunk-content" slot="shrunk-content">
                    </div>
                </rock-header>
                <div class="layout horizontal contentContainer">
                    <div id="entityGridContainer" class\$="[[_applyClass(_quickManageEnabled)]]">
                        <div id="refTypeMsg" class="default-message" hidden\$="[[_isTypesCriterionAvailable(_typesCriterion)]]"> Select reference type </div>
                        <rock-entity-search-result id="entitySearchGrid" context-data="[[contextData]]" search-filters="[[_selectedSearchFilters]]" types-criterion="[[_typesCriterion]]" search-query="[[_searchQuery]]" process-with-dynamic-fields="" dynamic-fields="[[_dynamicFields]]" current-record-size="{{_gridFullLength}}">
                        </rock-entity-search-result>
                        <bedrock-pubsub event-name="grid-selecting-item" handler="_onSelectingGridItem" target-id="entityGrid"></bedrock-pubsub>
                        <bedrock-pubsub event-name="grid-deselecting-item" handler="_onDeSelectingGridItem" target-id="entityGrid"></bedrock-pubsub>
                        <bedrock-pubsub event-name="grid-refresh-items" handler="_onRefreshGrid" target-id="entityGrid"></bedrock-pubsub>
                        <bedrock-pubsub event-name="quick-manage-event" handler="_onTapManage"></bedrock-pubsub>
                    </div>
                    <template is="dom-if" if="[[_quickManageEnabled]]" restamp="">
                        <div>
                            <pebble-vertical-divider></pebble-vertical-divider>
                        </div>
                        <div class="quick-manage-container p-l-15">
                            <rock-entity-quick-manage id="entityQuickManage" show-expand-icon="{{_showExpandIcon}}" no-header="" context-data="[[_quickManageContextData]]" current-index="{{_currentIndex}}" current-record-size="[[_gridFullLength]]" selected-entity="[[_selectedEntity]]" quick-manage-enabled="{{_quickManageEnabled}}"></rock-entity-quick-manage>
                            <bedrock-pubsub event-name="on-attribute-save" handler="_onAttributeSave"></bedrock-pubsub>
                            <bedrock-pubsub target-id="entityQuickManage" event-name="on-tap-previous" handler="_onClickPrevious"></bedrock-pubsub>
                            <bedrock-pubsub target-id="entityQuickManage" event-name="on-tap-next" handler="_onClickNext"></bedrock-pubsub>
                        </div>
                    </template>
                </div>
                <rock-search-query-parser id="queryParser" context-data="[[contextData]]"></rock-search-query-parser>
                <bedrock-pubsub id="parser-event" event-name="on-search-filters" handler="_onSearchFiltersChange" target-id="queryParser"></bedrock-pubsub>
            </template>
        </rock-layout>
        <bedrock-pubsub event-name="context-selector-data-changed" handler="_onContextsChanged" target-id="contextSelector"></bedrock-pubsub>
`;
  }

  static get is() { return 'app-reference-discovery' }

  static get properties() {
      return {
          contextData: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          domain: {
              type: String,
              value: "referenceData"
          },
          appConfig: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          publish: {
              type: Boolean,
              value: false
          },
          lovSelectedItem:{
              type: Object,
              value: function () {
                  return {};
              }
          },
          _searchResultResponse: {
              type: Object,
              value: function () {
                  return {};
              },
              notify: true
          },
          _gridAttributes: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          _multiSelect: {
              type: Boolean,
              value: false
          },
          _currentIndex: {
              type: Number,
              value: -1
          },
          _gridFullLength: {
              type: Number,
              value: 0
          },
          _mainTitle: {
              type: String,
              value: "Select Reference Type"
          },
          _showExpandIcon: {
              type: Boolean,
              value: false
          },
          /**
            * Indicates selected item
            */
          _selectedEntity: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _searchQuery: {
              type: String,
              notify: true,
              value: ""
          },
          _rockEntitySearchFilter: {
              type: Object
          },
          _rockSearchFilter: {
              type: Object
          },
          _rockSavedSearch: {
              type: Object
          },
          _currentWorkflowAction: {
              type: String
          },
          _currentEntityIndex: {
              type: Number,
              value: 0
          },
          _selectedEntities: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          _failedEntities: {
              type: Number,
              value: 0
          },
          _doneEntities: {
              type: Number,
              value: 0
          },
          _selectedSearchFilters: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          _typesCriterion: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          _resetSearchEnabled: {
              type: Boolean,
              value: false
          },
          _failedEntityTypes: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          /**
          * Indicates the request object that is passed to the data element to retrive attribute model data.
            Sample: {
                    }
          */
          _attributeModelRequest: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _selectedReferenceType: {
              type: String,
              value: ""
          },
          _quickManageEnabled: {
              type: Boolean,
              value: false
          },
          inputQueryString: {
              type: String,
              value: ""
          },
          _attributeListArray: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          _searchBarElement: {
              type: Element
          },
          _entitySearchFilterElement: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _quickManageContextData: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          isContextLoaded: {
              type: Boolean,
              value: false
          },
          configData: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _processTemplate: {
              type: Boolean,
              value: false
          },
          showAddNew: {
              type: Boolean,
              value: false
          },
          _selectedDimensions: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          navigationData: {
              type: Object,
              value: function () {
                  return {};
              }
          }
      }
  }



  ready() {
      super.ready();
      if (this._searchBarElement) {
          this._searchBarElement.searchInput = [];
      }
      //get saved search id from query string
      this._searchQuery = DataHelper.getParamValue("searchtext") || "";
  }

  constructor() {
      super();
      let userContext = {
          "roles": this.roles,
          "user": this.userId,
          "tenant": this.tenantId,
          "defaultRole": this.defaultRole
      };
      this.contextData[ContextHelper.CONTEXT_TYPE_USER] = [userContext];               
  }

  disconnectedCallback() {
      super.disconnectedCallback();
  }

  connectedCallback() {
      super.connectedCallback();
      if (!_.isEmpty(this.contextData)) {
          let navContextArr = this.contextData[ContextHelper.CONTEXT_TYPE_NAVIGATION];
          if(!_.isEmpty(navContextArr) && navContextArr[0]["rock-context-selector"]){
              this.navigationData = navContextArr[0]["rock-context-selector"];
          }
      }
  }
  _onContextDataChange() {
      if (!_.isEmpty(this.contextData)) {
          this._quickManageContextData = DataHelper.cloneObject(this.contextData);

          this.requestConfig("rock-reference-discovery", this._quickManageContextData);
      }
  }

  onConfigLoaded(componentConfig) {
      if (componentConfig && componentConfig.config) {

          this.configData = componentConfig.config;
          this._processTemplate = true;
          this._initializeComponent();
          let defaultReferenceType = componentConfig.config.defaultReferenceType;
          //get saved search id from query string
          if (!DataHelper.isEmptyObject(this._searchQuery) && this._searchBarElement) {
              this._searchBarElement.query = this._searchQuery;
          }
          if(defaultReferenceType){
              this._typesCriterion =[defaultReferenceType];
          }
          this.publish = componentConfig.config.showPublish;
          this.showAddNew = componentConfig.config.showAddNew;
          this._buildQueryString();
      }
      //this._prepareContext();
  }

  _onBusinessActionItemTap(e) {
      if (e && "detail" in e) {
          let data = "data" in e.detail && e.detail.data;
          if (!_.isEmpty(data)) {
              if (data.eventName == "action-re-publish") {
                  this._rePublish(data.subComponentName);
              }
          }
      }
  }

  _rePublish(subComponentName) {
      let selectedItems = this._searchGridElement.getSelectedItems();
      let selectionMode = this._searchGridElement.getSelectionMode();
      let selectionQuery = this._searchGridElement.getSelectedItemsAsQuery();

      let asyncAvailable = false;

      if (!asyncAvailable || (asyncAvailable && selectionMode == "count")) {
          if (DataHelper.isEmptyObject(selectedItems)) {
              this.showWarningToast("Select at least one entity for which you want to perform this action.");
              return;
          }
      }
      const maxSelectedItems = 200;
      if (!DataHelper.isEmptyObject(selectedItems) && selectedItems.length > maxSelectedItems) {
          this.showWarningToast("Maximum " + maxSelectedItems + " entities can be selected.");
          return;
      }
      if (!DataHelper.isEmptyObject(selectedItems)) {
          this._selectedEntities = selectedItems;
      }

      const sharedData = {
          "context-data": this._quickManageContextData,
          "selected-entities": this._selectedEntities,
          "selection-query": selectionQuery,
          "selection-mode": selectionMode
      };

      this.openBusinessFunctionDialog({ name: "rock-wizard-re-publish", subName: subComponentName }, sharedData);
  }
  _showToastMessage(msgObject) {
      if (msgObject) {
          if (msgObject.type == "error") {
              let messageCode = "10000";
              this.logError(msgObject.message, messageCode);
          } else if (msgObject.type == "success") {
              this.showSuccessToast(msgObject.message, ConstantHelper.MILLISECONDS_10000);
          }
      }
  }

  _initializeComponent() {
      this._rockLayout = this.shadowRoot.querySelector("rock-layout");
      this._entityTypeModelLov = this.shadowRoot.querySelector("#referenceDataLov");
      this._searchGridElement = this.shadowRoot.querySelector("#entitySearchGrid");
      this._searchBarElement = this.shadowRoot.querySelector("#searchBar");
      this._entitySearchFilterElement = this.shadowRoot.querySelector("#searchFilter");
      this._popover = this.shadowRoot.querySelector("#actionsPopover");
      this._grid = this.shadowRoot.querySelector("rock-entity-search-result");
      this._parserPubsub = this.shadowRoot.querySelector("#parser-event");
      this._queryParser = this.shadowRoot.querySelector("#queryParser");
  }
  _onReferenceDataChange(e, detail) {
      let selectedItem = detail.data.id;
      this.set("_typesCriterion", [selectedItem]);
      /***
       * TODO: Need to discuss this. There is/are existing attribute filter(s), when reference entity
       * type changed, what should we do with the existing attribute filter tag(s). Keep them or remove?
       * For now removing the existing filters.
       * */
      this._selectedSearchFilters = [];
      let searchFilterElement = this.shadowRoot.querySelector("#searchFilter");
      if(searchFilterElement){
          searchFilterElement.clearSearchFilters();
      }
      //this._prepareContext();
      this._buildQueryString();

      if (this._popover) {
          this._popover.hide();
      }
  }

  async _prepareContext() {
      if (!_.isEmpty(this.contextData)) {
          if (this._typesCriterion) {
              let typeExternalName = await EntityTypeManager.getInstance().getTypeExternalNameByIdAsync(this._typesCriterion[0]);
              this._mainTitle = typeExternalName;

              this._selectedReferenceType = this._typesCriterion[0];
              if(_.isEmpty(this.lovSelectedItem)){
                  this.lovSelectedItem = {
                      title: this._mainTitle,
                      id: this._selectedReferenceType
                  }
              }
              let itemContext = {};
              itemContext.type = this._typesCriterion[0];
              itemContext.attributeNames = ["_ALL"];
              this.contextData[ContextHelper.CONTEXT_TYPE_ITEM] = [itemContext];
              let compositeModelGetRequest = DataRequestHelper.createEntityModelCompositeGetRequest(this.contextData);

              this._liquidModelGet = this._liquidModelGet || this.shadowRoot.querySelector("[name=compositeAttributeModelGet]");
              if (this._liquidModelGet) {
                  this._liquidModelGet.requestData = compositeModelGetRequest;
                  this._liquidModelGet.generateRequest();
              }
          }
      }
  }

  _onCompositeModelGetResponse(e) {
      let _attributeModelResponse = e.detail.response || {};
      let entityId = this._selectedEntity.id;

      if (e && e.detail && DataHelper.validateGetAttributeModelsResponse_New(e.detail.response)) {

          let attributeModels = DataTransformHelper.transformAttributeModels(e.detail.response
              .content.entityModels[0], this.contextData);

          let attributeNames = Object.keys(attributeModels);

          if (attributeNames && attributeNames.length > 0) {

              let itemContext = ContextHelper.getFirstItemContext(this.contextData);
              itemContext.attributeNames = attributeNames;
              this.contextData[ContextHelper.CONTEXT_TYPE_ITEM] = [itemContext];
              this._quickManageContextData[ContextHelper.CONTEXT_TYPE_ITEM] = [itemContext];

              let columns = {};
              for (let attrNameIndex = 0; attrNameIndex < attributeNames.length; attrNameIndex++) {
                  let linkTemplate = "";
                  //Set the first item of the grid as a link to the entity manage screen
                  if (attrNameIndex == 0) {
                      linkTemplate = "entity-manage?id={id}&type={type}";
                  }
                  let model = attributeModels[attributeNames[attrNameIndex]];
                  columns[model.name] = {
                      "header": model.externalName,
                      "name": model.name,
                      "sortable": true,
                      "linkTemplate": linkTemplate
                  };
              }

              this._gridAttributes = attributeNames;
              this._dynamicFields = columns; //Fields are prepared based on reference type change
              this._refreshGrid();
          }
      }
  }
  _onSearch(e, detail) {
      if (!_.isEmpty(detail)) {
          this._searchQuery = detail.query;
          this._buildQueryString();
      }
  }
  _resetSearch() {
      this._searchQuery = "";
      this.tags = [];

      if (this._searchBarElement) {
          this._searchBarElement.query = "";
          this._searchBarElement.searchText = "";
          //TODO: Temperory fix to show keyword in search bar. Will be removed once advanced search implemented here
          this._searchBarElement.setAttribute("placeholder", "Enter Search text");
      }

      this.inputQueryString = "";
      this._attributeListArray = [];
      this._selectedSearchFilters = [];
      if (this.shadowRoot.querySelector("#searchFilter")) {
          this.shadowRoot.querySelector("#searchFilter").clearSearchFilters();
      }

      this._resetSearchEnabled = false;
      //this._refreshGrid();
      this._buildQueryString();
  }
  _getSearchGrid() {
      return ElementHelper.getElement(this, "#entitySearchGrid");
  }
  _onSelectingGridItem(e, detail) {
      if (this._quickManageEnabled) {
          this._selectedEntity = detail.item;
          if (!_.isEmpty(this._selectedEntity)) {
              let itemContext = {
                  "id": this._selectedEntity.id,
                  "type": this._selectedEntity.type,
                  "attributeNames": this._gridAttributes
              };

              this._quickManageContextData[ContextHelper.CONTEXT_TYPE_ITEM] = [itemContext];

              this._getSearchGrid().clearSelection();
              microTask.run(() => {
                  this._currentIndex = this._getSearchGrid().getSelectedItemIndex();
                  this._refreshQuickManage();
              });
          }
      }
  }
  _onDeSelectingGridItem() {
      if (this._quickManageEnabled) {
          this._selectedEntity = {};
      }
  }
  _onRefreshGrid(event) {
      if (event.detail.invalidateEntityCache) {
          if (this._typesCriterion && this._typesCriterion[0]) {
              let entity = {
                  "type": this._typesCriterion[0]
              };
              LiquidDataObjectUtils.invalidateDataObjectCache(entity);
          }
          if (this._quickManageEnabled) {
              this._quickManageEnabled = false;
              this._selectedEntity = {};
              //this._getSearchGrid().notifyResize();
          }
      }
  }

  _onAttributeSave() {
      //Reseting the context to load the updated grid
      let itemContext = {
          "id": "",
          "type": this._selectedReferenceType,
          "attributeNames": this._gridAttributes
      };
      this.contextData[ContextHelper.CONTEXT_TYPE_ITEM] = [itemContext];

      //Changing the row style of the updated record
      let searchGrid = this._getSearchGrid();
      if (searchGrid) {
          let selectedRow = searchGrid.getSelectedGridRow();
          if (selectedRow) {
              selectedRow.classList.add("font-italic");
          }
      }
  }

  _onClickPrevious() {
      if (this._currentIndex > 0) {
          this._selectEntity(this._currentIndex - 1, "previous");
      }
  }
  _onClickNext() {
      let currentIndex = this._currentIndex + 1;
      if (currentIndex < this._gridFullLength) {
          this._selectEntity(currentIndex);
      }
  }
  _selectEntity(index, nav) {
      if (!(index < 0)) {
          let grid = this._getSearchGrid();
          let gridData = grid.getData();

          if (gridData.length > 0 && index < this._gridFullLength) {
              if (gridData[index].attributes) {
                  this._selectedEntity = gridData[index];

                  let itemContext = {
                      "id": this._selectedEntity.id,
                      "type": this._selectedEntity.type,
                      "attributeNames": this._gridAttributes
                  };
                  this._quickManageContextData[ContextHelper.CONTEXT_TYPE_ITEM] = [itemContext];

                  this._currentIndex = index;
                  grid.clearSelection();
                  grid.selectItem(gridData[index]);

                  //On previous click already data got loaded, so directly we can set scroll index
                  //but for next, data will loaded as per page size, so scroll as per allow scroll
                  if (nav == "previous" || this._isAllowedToScroll()) {
                      grid.scrollToIndex(this._currentIndex);
                  }
              } else {
                  let nextScrollIndex = grid.currentRecordSize + grid.pageSize;
                  // Todo: nextScrollIndex will be based on the grid total count
                  grid.scrollToIndex(nextScrollIndex);

                  setTimeout(() => {
                      this._selectEntity(index);
                  }, ConstantHelper.MILLISECONDS_10);
              }
          }

          this._refreshQuickManage();
      }
  }
  _isAllowedToScroll() {
      let grid = this._getSearchGrid();

      if (((this._currentIndex) % grid.pageSize) == 0) {
          return true;
      }

      return false;
  }
  _onActionsTap() {
      this._popover.show();
  }
  _refreshGrid() {
      let grid = this._getSearchGrid();
      if (grid) {
          grid.refresh();
      }
  }
  _refreshComponent() {
      this._refreshQuickManage();
      this._refreshGrid();
  }

  _refreshQuickManage() {
      this._quickManage = this._quickManage || this.shadowRoot.querySelector("#entityQuickManage");
      if (this._quickManage) {
          this._quickManage.reload();
      }
  }

  _showResetSearch() {
      let rockSearchFilter = undefined;
      if (!_.isEmpty(this._entitySearchFilterElement)) {
          rockSearchFilter = this._entitySearchFilterElement.$$("rock-search-filter");
      }
      let query = "";
      let tags = [];

      if (!_.isEmpty(this._searchBarElement)) {
          query = this._searchBarElement.query;
      }

      if (rockSearchFilter) {
          tags = rockSearchFilter.tags;
      }

      if (!_.isEmpty(query) || tags.length > 0 || this.inputQueryString != "") {
          this._resetSearchEnabled = true;
      }
  }
  _onQuickManageAdd() {
      if (!this._selectedReferenceType || _.isEmpty(this._gridAttributes)) {
          this.logError("Missing reference type for the process");
          return;
      }
      this._quickManageEnabled = true;
      let itemContext = {
          "id": "-1",
          "type": this._selectedReferenceType,
          "attributeNames": this._gridAttributes
      };
      let contextData = DataHelper.cloneObject(this._quickManageContextData);
      contextData[ContextHelper.CONTEXT_TYPE_ITEM] = [itemContext];
      this._quickManageContextData = {};
      this.set("_quickManageContextData", contextData);
      this._refreshQuickManage();

      this._getSearchGrid().clearSelection();
  }
  _onTapManage() {
      if (!_.isEmpty(this._selectedReferenceType)) {
          this._quickManageEnabled = !this._quickManageEnabled;
          let grid = this._getSearchGrid();
          let selectedCount = grid.getSelectedItems();
          if (selectedCount.length > 1) {
              this.showWarningToast("Cannot use multiple records for Quick Manage");
          }

          if (this._quickManageEnabled) {
              let selectedItem = grid.selectedItem;
              this._selectedEntity = selectedItem;

              if (!_.isEmpty(selectedItem)) {

                  let itemContext = {
                      "id": selectedItem.id,
                      "type": selectedItem.type
                  };

                  this._quickManageContextData[ContextHelper.CONTEXT_TYPE_ITEM] = [itemContext];

                  grid.clearSelection(); //Clear current selection
                  grid.selectItem(selectedItem); //Select item
                  this._currentIndex = this._getSearchGrid().getSelectedItemIndex();
                  grid.scrollToIndex(this._currentIndex);
              }

              this._refreshQuickManage();
          } else {
              this._currentIndex = -1;
          }

          //grid.notifyResize();
      } else {
          this.showInformationToast("Select reference type to manage.");
      }
  }
  _applyClass(quickManageEnabled) {
      if (quickManageEnabled) {
          return "grid-quick-manage-container";
      }

      return "container";
  }
  _onContextsChanged(e) {
      let newDimensions = e.detail.dimensions;
      newDimensions["app"] = ["app-reference-discovery"];
      if(e.detail && e.detail.selectedDimensionsDetail) {
          let selectedDimensionsDetail = e.detail.selectedDimensionsDetail;
          this.setNavigationData("rock-context-selector", selectedDimensionsDetail);
          this.navigationData = selectedDimensionsDetail;
      }
      if (this.domain) {
          newDimensions["domain"] = [this.domain];
      }

      // Created seperate copy of context data for action functionality who needs selected entity info.
      // May be need to correct it in proper way.
      ContextHelper.updateContextData(this.contextData, newDimensions);
      ContextHelper.updateContextData(this._quickManageContextData, newDimensions);
      if (this.isContextLoaded) {
          this._refreshComponent();
      } else {
          this.set("isContextLoaded", true);
          this._onContextDataChange();
      }
  }
  _isTypesCriterionAvailable(typesCriterion) {
      if (!_.isEmpty(typesCriterion)) {
          return true;
      }
      return false;
  }
  async _buildQueryString(e, detail) {
      //Closing the quick manage to enable search if it is opened when search query is built
      if (this._quickManageEnabled) {
          this._onTapManage();
      }
      this._queryBuilder = this._queryBuilder || this.shadowRoot.querySelector("#queryBuilder");
      let queryBuilderData = {};
      if (this._queryBuilder) {
          queryBuilderData = this._queryBuilder.getQueryBuilderData();
      }
      //User has input some keyword search criteria
      let keywordSearchStr = "";
      if (this._searchQuery) {
          keywordSearchStr = this._searchQuery;
      }

      let attributeListArray = [];
      if (detail) {
          let attributeList = detail;

          for (let attrIndex = 0; attrIndex < attributeList.length; attrIndex++) {
              let newItem = {
                  name: attributeList[attrIndex].longName,
                  value: (attributeList[attrIndex].displayValue).replace(/"|'/g, ""),
                  attributeModel: attributeList[attrIndex].options
              };
              attributeListArray.push(newItem);
          }
      }

      this.set("_attributeListArray", attributeListArray);
      //show externalName in placeholder
      if (this._typesCriterion.length > 0) {
          await EntityTypeManager.getInstance().getTypeExternalNameByIdAsync(this._typesCriterion[0]);
      }
      //this binding not working it returns null
      //hardbinding directly to behavior
      let queryString = RUFBehaviors.QueryBuilderBehavior.buildQuery(this._typesCriterion, this._attributeListArray, queryBuilderData, false, keywordSearchStr);
      //this binding not working it returns null
      //hardbinding directly to behavior
      let parsableString = RUFBehaviors.QueryBuilderBehavior.buildQuery(this._typesCriterion, this._attributeListArray, queryBuilderData, true, keywordSearchStr);

      this._displayQuery(queryString, parsableString);
      this._parseQuery(parsableString);
  }
  /**
  * Function to display the query on the search bar
  */
  _displayQuery(queryStr, parsableQueryStr) {
      this.inputQueryString = queryStr;

      if (this._searchBarElement) {
          this._searchBarElement.searchInput = [];
          if (queryStr) {
              this._searchBarElement.query = this._searchQuery;
              this._searchBarElement.searchText = this._searchQuery;
              this._searchBarElement.setAttribute("placeholder", "");
              if (queryStr.indexOf("!%&") > -1) {
                  queryStr = queryStr.replace(/!%&|=/g, "");
              }
              this._searchBarElement.setAttribute("placeholder", queryStr);
          }
          if (parsableQueryStr) {
              this._searchBarElement.internalQuery = parsableQueryStr;
          }
      }

      this._showResetSearch();
  }
  /**
  * Function to parse the query
  */
  _parseQuery(query) {
      if(this._parserPubsub){
          this._parserPubsub.registerEvent();
      }
      if(this._queryParser){
          this._queryParser.parseQueryToFilters(query);
      }
  }
  _onSearchFiltersChange(e, detail) {
      this._updateProperties(detail);
  }
  _updateProperties(searchFilters) {
      let typesCriterion = searchFilters.typesCriterion;
      let selectedSearchFilters = searchFilters.attributesCriterion;
      let searchQuery = searchFilters.searchQuery ? searchFilters.searchQuery : "";
      this.set("_typesCriterion", typesCriterion);
      this.set("_selectedSearchFilters", selectedSearchFilters);
      this.set("_searchQuery", searchQuery);
      this._entitySearchFilterElement = this.shadowRoot.querySelector("#searchFilter");
      if (this._entitySearchFilterElement && this._entitySearchFilterElement.refresh) {
          this._entitySearchFilterElement.refresh();
      }
      this._prepareContext();
  }
  _getComponentSettings(componentName) {
      if (typeof (this.configData) == "object") {
          if (this.configData.componentSettings) {
              return this.configData.componentSettings[componentName];
          }
      }
  }
}
customElements.define(AppReferenceDiscovery.is, AppReferenceDiscovery)
