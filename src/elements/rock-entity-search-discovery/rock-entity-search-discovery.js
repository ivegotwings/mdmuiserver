import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { microTask } from '@polymer/polymer/lib/utils/async.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-app-behavior/bedrock-app-behavior.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-query-builder-behavior/bedrock-query-builder-behavior.js';
import '../bedrock-helpers/context-helper.js';
import '../bedrock-helpers/element-helper.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-flex-layout.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import '../bedrock-style-manager/styles/bedrock-style-gridsystem.js';
import '../pebble-button/pebble-button.js';
import '../pebble-actions/pebble-actions.js';
import '../pebble-popover/pebble-popover.js';
import '../pebble-vertical-divider/pebble-vertical-divider.js';
import '../rock-search-query-parser/rock-search-query-parser.js';
import '../rock-search-bar/rock-search-bar.js';
import '../rock-saved-searches/rock-saved-searches.js';
import '../rock-entity-type-model-lov/rock-entity-type-model-lov.js';
import '../rock-entity-search-filter/rock-entity-search-filter.js';
import '../rock-entity-search-result/rock-entity-search-result.js';
import '../rock-business-actions/rock-business-actions.js';
import '../rock-entity-quick-manage/rock-entity-quick-manage.js';
import '../rock-component-config-behavior/rock-component-config-behavior.js';
import EntityTypeManager from '../bedrock-managers/entity-type-manager.js';
import { flush } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockEntitySearchDiscovery
extends mixinBehaviors([
    RUFBehaviors.AppBehavior,
    RUFBehaviors.QueryBuilderBehavior,
    RUFBehaviors.ComponentConfigBehavior
], PolymerElement) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-gridsystem bedrock-style-grid-layout bedrock-style-icons bedrock-style-padding-margin bedrock-style-flex-layout">
            :host {
                display: block;
                height: 100%;
            }

            .grid-min-height {
                min-height: 0px;
            }

            #savedSearchPopover {
                width: 400px;
                max-height: none !important;
                --pebble-popover-max-width: 100%;
                --pebble-popover-max-height: 360px;
                overflow: auto;
            }

            #rockSavedSearch {
                --saved-search-tab-content: {
                    max-height: 250px;
                    overflow-x: auto;
                    overflow-y: auto;
                }
            }

            .grid-filters {
                padding: 0 20px;
            }

            .entity-type-filter-container {
                width: 70%;
                padding-right: 10px;
            }

            pebble-popover paper-item {
                cursor: pointer;
                font-size: var(--default-font-size, 14px);
                padding: 0 0 0 0;
                min-height: 40px;
            }

            .quick-manage-container {
                width: 31%;
                height: auto;
                display: block;
                position: relative;
                padding-left: 1%;
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

            #entityTypeFilterPopover {
                --pebble-popover-width: 260px;
                --pebble-popover-max-width: 100%;
                width: 248px;
            }

            /* Search */

            .resetsearch {
                position: absolute;
                right: 0;
                bottom: -14px;
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
                display: inline-block;
                width: 100%;
            }

            .advancedsearch {
                position: absolute;
                top: 2px;
                right: 36px;
                z-index: 3;
                background: var(--palette-white, #ffffff);
                padding-left: 10px;
            }

            .advancedsearch pebble-button {
                font-size: 12px;
            }

            .underline {
                height: 16px;

                --pebble-button: {
                    text-decoration: underline;
                    padding-top: 0;
                    padding-right: 0;
                    padding-bottom: 0;
                    padding-left: 0;
                }
            }

            #entityTypeFilterButton {
                letter-spacing: 0.5px;
            }

            #entityGridComponents {
                width: 100%;
                display: inline-flex;
            }

            #entityGridInfo {
                position: absolute;
                top: 0;
                left: 30px;
                right: 30px;
                bottom: auto;
                display: none;
            }

            #entityTypeMsg {
                position: absolute;
                top: 0;
                left: 30px;
                right: 30px;
                bottom: auto;
            }

            #entityGridComponents {
                @apply --search-result-height;
            }
            .min-width-0 {
                min-width: 0px;
            }
            .right-actions{
                display: flex;
                margin-left: auto;
            }
        </style>
        <template is="dom-if" if="[[_processTemplate]]">
            <div class="base-grid-structure">
                <div class="base-grid-structure-child-1">
                    <div class="layout horizontal p-r-10 p-l-10">
                        <template is="dom-if" if="[[_getVisibility('rock-entity-type-model-lov')]]">
                            <div class="entityTypeFilterContainer m-r-10">
                                <pebble-button id="entityTypeFilterButton" button-text="[[entityTypeFilterText]]" dropdown-icon="" noink="" class="dropdownText dropdownIcon btn dropdown-outline-primary dropdown-trigger" on-tap="_openEntityTypeFilterLov"></pebble-button>
                                <template is="dom-if" if="[[_entityTypeFilterPopover]]">
                                    <pebble-popover id="entityTypeFilterPopover" for="entityTypeFilterButton" no-overlap="" vertical-align="auto" horizontal-align="auto">
                                        <rock-entity-type-model-lov id="entityTypeModelLov" settings="[[_getComponentSettings('rock-entity-type-model-lov')]]" domain="[[domain]]" select-all="true" allowed-entity-types="[[allowedEntityTypes]]" selected-items="{{_selectedEntityTypes}}" selected-item="{{_selectedEntityType}}" title-pattern="externalName" show-action-buttons="">
                                        </rock-entity-type-model-lov>
                                    </pebble-popover>
                                    <bedrock-pubsub event-name="entity-type-model-lov-confirm-button-tap" handler="_onSelectedEntityTypesChange" target-id="entityTypeModelLov"></bedrock-pubsub>
                                    <bedrock-pubsub event-name="entity-type-model-lov-close-button-tap" handler="_onEntityTypePopoverClose" target-id="entityTypeModelLov"></bedrock-pubsub>
                                </template>
                            </div>
                        </template>
                        <template is="dom-if" if="[[_getVisibility('rock-search-bar')]]">
                            <div class="search-container flex">
                                <rock-search-bar id="searchBar" placeholder="Enter Search text" max-allowed-values-for-search="[[maxAllowedValuesForSearch]]"></rock-search-bar>
                                <div class="resetsearch" hidden\$="[[!_resetSearchEnabled]]">
                                    <pebble-button icon="pebble-icon:reset" class="btn-link pebble-icon-color-blue" on-tap="_resetSearch" button-text="Reset Search"></pebble-button>
                                </div>
                                <template is="dom-if" if="[[_getVisibility('rock-query-builder')]]">
                                    <div class="advancedsearch">
                                        <pebble-button class="btn-link underline pebble-icon-color-blue" on-tap="_showQueryBuilder" dropdown-icon="" button-text="Advanced Search"></pebble-button>
                                        <template is="dom-if" if="[[_queryBuilderEnabled]]">
                                            <rock-query-builder id="queryBuilder" domain="[[domain]]" context-data="[[contextData]]" allowed-entity-types="{{allowedEntityTypes}}" selected-entity-types="{{_currentEntityTypes}}" input-query-string="{{inputQueryString}}" attribute-grid-data="{{attributeGridData}}" relationship-name="{{relationshipName}}" workflow-criterion="[[_workflowCriterion]]" relationships-data="[[_relationshipsData]]" rel-entity-data="[[_relEntityData]]" search-query="{{searchQuery}}" lov-settings="[[_getComponentSettings('rock-entity-type-model-lov')]]" entity-type-filter-text="[[entityTypeFilterText]]" settings="[[_getComponentSettings('rock-query-builder')]]" relationship-exists-search-criterion-data="[[relationshipExistsSearchCriterionData]]" max-allowed-values-for-search="[[maxAllowedValuesForSearch]]">
                                            </rock-query-builder>
                                        </template>
                                    </div>
                                    <bedrock-pubsub event-name="rock-search" handler="_onSearch" target-id="searchBar"></bedrock-pubsub>
                                    <bedrock-pubsub event-name="rock-search-update" handler="_showResetSearch" target-id="searchBar"></bedrock-pubsub>
                                    <bedrock-pubsub event-name="hide-query-builder" handler="_hideQueryBuilder" target-id="queryBuilder"></bedrock-pubsub>
                                    <bedrock-pubsub event-name="on-query-build" handler="_onQueryBuild" target-id="queryBuilder"></bedrock-pubsub>
                                </template>
                            </div>
                            <bedrock-pubsub event-name="rock-search" handler="_onSearch" target-id="searchBar"></bedrock-pubsub>
                            <bedrock-pubsub event-name="rock-search-update" handler="_showResetSearch" target-id="searchBar"></bedrock-pubsub>

                        </template>
                        <template is="dom-if" if="[[_getVisibility('rock-saved-searches')]]">
                            <pebble-button id="savedSearchButton" icon="pebble-icon:saved-search" button-text="Load Saved Search" noink="" raised="" dropdown-icon="" on-tap="_onSavedSearchTap" class="dropdownIcon dropdownText btn m-l-10 dropdown-outline-primary"></pebble-button>
                            <template is="dom-if" if="[[_savedSearchPopover]]">
                                <pebble-popover class="p-r-20 p-l-20" id="savedSearchPopover" for="savedSearchButton" no-overlap="" horizontal-align="right" allow-multiple="">
                                    <rock-saved-searches id="rockSavedSearch" saved-searches="{{savedSearches}}" saved-search-id="{{savedSearchId}}" show-title="" allow-create-edit-search="" show-settings=""></rock-saved-searches>
                                </pebble-popover>
                                <bedrock-pubsub event-name="saved-search-save" handler="_onCreateEditSavedSearch" target-id=""></bedrock-pubsub>
                                <bedrock-pubsub event-name="saved-search-cancel" handler="_onCancelSavedSearch" target-id=""></bedrock-pubsub>
                                <bedrock-pubsub event-name="rock-saved-search-click" handler="_loadSavedSearch" target-id=""></bedrock-pubsub>
                            </template>
                        </template>
                    </div>
                    <div class="layout horizontal p-r-10 p-l-10 p-t-10">
                        <template is="dom-if" if="[[_getVisibility('rock-entity-search-filter')]]">
                            <div class="flex searchFilterTag min-width-0">
                                <rock-entity-search-filter id="entitySearchFilter" attributes-type="domainMapped" selected-search-filters="{{_selectedSearchFilters}}" context-data="{{contextData}}" types-criterion="[[_typesCriterion]]" tags="{{tags}}" filters-config="[[_getAttributeSortDetails(configData)]]" settings="[[_getComponentSettings('rock-entity-search-filter')]]" max-allowed-values-for-search="[[maxAllowedValuesForSearch]]"></rock-entity-search-filter>
                                <bedrock-pubsub event-name="tag-item-added" handler="_showResetSearch"></bedrock-pubsub>
                                <bedrock-pubsub event-name="tag-item-remove" handler="_showResetSearch"></bedrock-pubsub>
                                <bedrock-pubsub event-name="build-query" handler="_buildQueryString"></bedrock-pubsub>
                            </div>
                        </template>
                        <div class="right-actions">
                            <template is="dom-if" if="[[_getVisibility('rock-business-actions')]]">
                                <div class="action-buttons">
                                    <rock-business-actions id="businessActions" context-data="[[contextData]]" context-model-type="[[domain]]" show-workflow-actions="[[_showWorkflowActions(_workflowCriterion)]]"></rock-business-actions>
                                    <bedrock-pubsub event-name="business-actions-action-click" handler="_onActionItemTap" target-id="businessActions"></bedrock-pubsub>
                                </div>
                            </template>
                            <template is="dom-if" if="[[_getVisibility('pebble-add-new')]]">
                                <pebble-button icon="pebble-icon:action-add" class="btn btn-primary m-l-10" button-text="Add New" on-click="_onAddNew"></pebble-button>
                            </template>
                        </div>
                    </div>
                </div>
                <div class="base-grid-structure-child-2">
                    <div class="row-wrap p-relative grid-min-height full-height">
                        <div id="entityTypeMsg" class="default-message" hidden\$="[[_isEntityTypeSelected(_typesCriterion)]]"> Select entity type </div>
                        <div id="entityGridInfo" class="default-message"> No results found for the given criteria.</div>
                        <div id="entityGridComponents" class="full-height" hidden\$="[[!_isEntityTypeSelected(_typesCriterion)]]">
                            <template is="dom-if" if="[[_getVisibility('rock-entity-search-result')]]">
                                <div class\$="[[_applyClass(_quickManageEnabled)]]">
                                    <rock-entity-search-result id="entitySearchGrid" domain="[[domain]]" model-domain="[[modelDomain]]" context-data="[[contextData]]" search-query="{{searchQuery}}" saved-search-id="[[savedSearchId]]" workflow-criterion="[[_workflowCriterion]]" govern-data-criterion="[[_governDataCriterion]]" search-filters="[[_selectedSearchFilters]]" relationship-search-filters="[[_relationshipSearchFilters]]" current-record-size="{{_gridFullLength}}" types-criterion="[[_typesCriterion]]" entity-id-list="[[entityIdList]]" filter-criterion-key="[[filterCriterionKey]]">
                                    </rock-entity-search-result>
                                    <bedrock-pubsub event-name="grid-selecting-item" handler="_onSelectingGridItem" target-id="entityGrid"></bedrock-pubsub>
                                    <bedrock-pubsub event-name="grid-deselecting-item" handler="_onDeSelectingGridItem" target-id="entityGrid"></bedrock-pubsub>
                                    <bedrock-pubsub event-name="grid-refresh-items" handler="_onRefreshGrid" target-id="entityGrid"></bedrock-pubsub>
                                    <bedrock-pubsub event-name="govern-grid-selecting-item" handler="_onSelectingGridItem" target-id="governGrid"></bedrock-pubsub>
                                    <bedrock-pubsub event-name="empty-grid" handler="_onEntityGridEmpty" target-id="entitySearchGrid"></bedrock-pubsub>
                                    <bedrock-pubsub event-name="grid-with-data" handler="_onEntityGridFull" target-id="entitySearchGrid"></bedrock-pubsub>
                                    <bedrock-pubsub event-name="grid-load-error" handler="_onEntityGridError" target-id="entitySearchGrid"></bedrock-pubsub>
                                    <bedrock-pubsub event-name="quick-manage-event" handler="_onTapQuickManage"></bedrock-pubsub>
                                </div>
                            </template>
                            <template is="dom-if" if="[[_getVisibility('rock-entity-quick-manage')]]">
                                <template is="dom-if" if="[[_quickManageEnabled]]">
                                    <div>
                                        <pebble-vertical-divider>
                                        </pebble-vertical-divider>
                                    </div>
                                    <div class="quick-manage-container">
                                        <rock-entity-quick-manage id="entityQuickManage" context-data="[[contextData]]" current-index="{{_currentIndex}}" current-record-size="[[_gridFullLength]]" selected-entity="[[_selectedEntity]]" quick-manage-enabled="{{_quickManageEnabled}}"></rock-entity-quick-manage>
                                        <bedrock-pubsub event-name="on-attribute-save" handler="_onAttributeSave"></bedrock-pubsub>
                                        <bedrock-pubsub event-name="on-tap-previous" handler="_onClickPrevious" target-id="entityQuickManage"></bedrock-pubsub>
                                        <bedrock-pubsub event-name="on-tap-next" handler="_onClickNext" target-id="entityQuickManage"></bedrock-pubsub>
                                    </div>
                                </template>
                            </template>
                        </div>
                    </div>
                </div>
            </div>
            <rock-search-query-parser id="queryParser" relationship-name="{{relationshipName}}" context-data="[[contextData]]" filter-criterion-key="[[filterCriterionKey]]"></rock-search-query-parser>
            <bedrock-pubsub id="parser-event" event-name="on-search-filters" handler="_onSearchFiltersChange" target-id="queryParser"></bedrock-pubsub>
            <liquid-entity-model-get id="attrModelGet" operation="getbyids" on-error="_onError" on-response="_onAttrModelResponse" exclude-in-progress=""></liquid-entity-model-get>
        </template>
`;
  }

  static get is() {
      return 'rock-entity-search-discovery'
  }

  static get properties() {
      return {
          configData: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          contextData: {
              type: Object,
              value: function () {
                  return {};
              },
              observer: '_onContextDataChange'
          },
          selectedDimensions: {
              type: Object,
              notify: true,
              value: function () {
                  return {};
              }
          },
          searchQuery: {
              type: String,
              value: ""
          },
          _searchQuery: {
              type: String,
              value: ""
          },
          savedSearchId: {
              type: String,
              value: ""
          },
          savedSearches: {
              type: Object,
              value: function () {
                  return {};
              },
              observer: '_savedSeachesChanged'
          },
          workflowName: {
              type: String,
              value: ""
          },
          workflowShortName: {
              type: String,
              value: ""
          },
          workflowActivityName: {
              type: String,
              value: ""
          },
          workflowActivityExternalName: {
              type: String,
              value: ""
          },
          businessConditionName: {
              type: String,
              value: ""
          },
          user: {
              type: String,
              value: ""
          },
          entityIdList: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          allowedEntityTypes: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          requestedEntityTypes: {
              type: Array,
              value: function () {
                  return [];
              },
              observer: "_onRequestedEntityTypesChange"
          },
          _processTemplate: {
              type: Boolean,
              value: false
          },
          _resetSearchEnabled: {
              type: Boolean,
              value: false
          },
          _lastSavedSearchId: {
              type: String,
              value: ""
          },
          _selectedEntityTypes: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          _selectedEntityType: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _currentEntityTypes: {
              type: Array,
              computed: "_getActiveEntityTypes(_typesCriterion)"
          },
          _typesCriterion: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          _selectedSearchFilters: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          _workflowCriterion: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _governDataCriterion: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _gridFullLength: {
              type: Number,
              value: 0
          },
          _quickManageEnabled: {
              type: Boolean,
              value: false
          },
          _selectedEntity: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _selectedEntities: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          _entityTypes: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          _currentIndex: {
              type: Number,
              value: -1
          },
          domain: {
              type: String,
              observer: "_onDomainChange"
          },
          modelDomain: {
              type: String
          },
          _queryBuilderEnabled: {
              type: Boolean,
              value: false
          },
          inputQueryString: {
              type: String,
              value: ""
          },
          attributeGridData: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          _relationshipsData: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _relEntityData: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _relationshipSearchFilters: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          entityTypeFilterText: {
              type: String,
              value: "Type"
          },
          relationshipExistsSearchCriterionData: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          workflowMappedContexts: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          filterCriterionKey: {
              type: String,
              value: "attributesCriterion"
          },
          externalSearchEntityTypes: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          externalSearchRelationships: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          externalSearchAttributes: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          maxAllowedValuesForSearch: {
              type: Number
          },
          _isSearchFilterChanged:{
              type:Boolean,
              value:false
          },
          _isExternalSearchDataLoaded:{
              type:Boolean,
              value:false
          }
      }
  }

  _onContextDataChange() {
      if (!_.isEmpty(this.contextData)) {
          this.requestConfig('rock-entity-search-discovery', this.contextData);
      }
  }

  _onDomainChange() {
      this.filterCriterionKey = this.domain == "baseModel" ? "propertiesCriterion" : "attributesCriterion";
  }

  async onConfigLoaded(componentConfig) {
      if (componentConfig && componentConfig.config) {
          this.configData = componentConfig.config;
          let configuredSelectedEntityTypes = this.configData.selectedEntityTypes;
          this.maxAllowedValuesForSearch = this.configData.maxAllowedValuesForSearch;
          let _externalEntityTypes = null;
          if (!_.isEmpty(this.externalSearchEntityTypes)) {
              _externalEntityTypes = this._getExternalSearchCriterion(this.externalSearchEntityTypes, true)
          }
          let entityTypeManager = EntityTypeManager.getInstance();
          if (this.requestedEntityTypes.length == 0) {
              if (!_.isEmpty(_externalEntityTypes)) {
                  this.set('requestedEntityTypes', _externalEntityTypes);
              } else if (configuredSelectedEntityTypes && configuredSelectedEntityTypes.length > 0) {
                  this.set('requestedEntityTypes', configuredSelectedEntityTypes);
              } else {
                  this.set('requestedEntityTypes', this.allowedEntityTypes);
              }
              if (this.requestedEntityTypes.length > 0) {
                  await entityTypeManager.getTypeExternalNameByIdAsync(this.requestedEntityTypes[0]);
              }
          } else {
              if (this.allowedEntityTypes.length > 0) {
                  await entityTypeManager.getTypeExternalNameByIdAsync(this.allowedEntityTypes[0]);
              }
          }
          this._configDataChanged();
      }
  }

  _getAttributeModels(){
      let attrIds = Object.keys(this.externalSearchAttributes);
      let requestData = DataRequestHelper.createGetAttributeModelRequest(attrIds);
      let attrModelGet = this.shadowRoot.querySelector("#attrModelGet");
      if(attrModelGet){
          attrModelGet.requestData = requestData;
          attrModelGet.generateRequest();
      }
  }
  _onError(err){
      this._buildQueryString();
      this.logError("Attribute Filter Values Empty", err);
  }
  _onAttrModelResponse(ev){
      if(DataHelper.isValidObjectPath(ev, 'detail.response.content.entityModels')){
          let entityModels = ev.detail.response.content.entityModels;
          if(!_.isEmpty(entityModels)){
              let attrModelObj = {};
              entityModels.forEach((elem) => {
                  elem["preselectedValues"] = this.externalSearchAttributes[elem.name];
                  attrModelObj[elem.name] = elem;
              });

              let lovColumnNameValueCollection = {};
              if(this._entityTypeModelLov){
                  lovColumnNameValueCollection = this._entityTypeModelLov.getColumnNameValueCollection();
              } 
              let attributeDataModels = {"data": {"attributes":attrModelObj}};
              let attributeModels = DataTransformHelper.transformAttributeModels(attributeDataModels, {});
              if (!_.isEmpty(attributeModels)) {
                  let items = DataTransformHelper.transformAtributeModelsToLovSchema(attributeModels, lovColumnNameValueCollection);
                  if(!_.isEmpty(items) && this._entitySearchFilterElement){
                      let rockSearchFilter = this._entitySearchFilterElement.$$("rock-search-filter");
                      if (rockSearchFilter) {
                          rockSearchFilter.preselectedFilters(items)
                      }
                  }
              }
          }else{
              this._buildQueryString();
              this.logWarning("AttributeFilterValuesEmpty");
          }
      }else{
          this._buildQueryString();
          this.logError("AttributeFilterValuesEmpty");
      }
  }

  _getExternalSearchCriterion(inputArray, isInternal) {
      let filteredArray = [];
      if (!_.isEmpty(inputArray)) {
          filteredArray = inputArray.reduce((items, n) => {
              let _value = isInternal ? n.internal : n.external;
              items.push(_value);
              return items;
          }, []);
      }
      return filteredArray;
  }

  _getAttributeSortDetails(config) {
      if (!_.isEmpty(config)) {
          return config.attributesFilterSortDetails;
      }
  }

  _configDataChanged() {
      if (!DataHelper.isEmptyObject(this.configData)) {
          if (this.configData && this.configData.componentSettings && this.configData.componentSettings["rock-entity-type-model-lov"]) {
              let entityTypeConfig = this.configData.componentSettings["rock-entity-type-model-lov"];
              if (entityTypeConfig.title) {
                  this.entityTypeFilterText = entityTypeConfig.title;
              }
          }
          this._processTemplate = true;
          //Enabling the _savedSearchElement if savedSearchId is available, to load the selected saved search 
          if (this.savedSearchId) {
              this._savedSearchPopover = true;
          }
          flush();

          this._initializeComponent();
          if (this._savedSearchElement) {
              this._savedSearchElement.contextData = this.contextData;
          }
          this._searchBarElement.searchInput = [];
          if (this.searchQuery) {
              this._searchQuery = this.searchQuery;
          }

          if (this.savedSearchId && this.savedSearchId !== this._lastSavedSearchId) {
              this._lastSavedSearchId = this.savedSearchId;
          } else if (!DataHelper.isEmptyObject(this.workflowName)) {
              let userId = "";
              if (this.user.toLowerCase() == "all") {
                  userId = "";
              } else if (this.user.toLowerCase() == "currentuser") {
                  userId = DataHelper.getUserName();
              } else if (this.user.toLowerCase() == "unassigned") {
                  userId = "_UNASSIGNED";
              }

              let workflowCriterion = {
                  "workflowName": this.workflowName,
                  "workflowActivityName": this.workflowActivityName,
                  "workflowActivityExternalName": this.workflowActivityExternalName
              };

              let governDataCriterion = {
                  "userId": userId,
                  "status": this.status,
                  "businessConditionExternalName": this.businessConditionExternalName
              }
              //WF short name should be added only when it is available
              if (this.workflowShortName) {
                  workflowCriterion["workflowShortName"] = this.workflowShortName;
              }

              if (!_.isEmpty(this.workflowMappedContexts)) {
                  workflowCriterion["mappedContexts"] = this.workflowMappedContexts;
              }

              if (this.businessConditionName) {
                  let businessConditionNames = this.businessConditionName.split("#@#");
                  if (businessConditionNames.length > 1) {
                      governDataCriterion.businessConditionNames = businessConditionNames;
                  } else {
                      governDataCriterion.businessConditionName = this.businessConditionName;
                  }
              }

              if (!DataHelper.isEmptyObject(workflowCriterion)) {
                  this.set("_workflowCriterion", workflowCriterion);
              }
              if (!DataHelper.isEmptyObject(governDataCriterion)) {
                  this.set("_governDataCriterion", governDataCriterion);
              }
          }
          if (!_.isEmpty(this.externalSearchRelationships) && _.isEmpty(this.externalSearchAttributes)) {
              this._isExternalSearchDataLoaded = true;
              let firstRelationship = this.externalSearchRelationships[0];
              if (firstRelationship.internal && firstRelationship.external) {
                  let attributeListArray = [];
                  let queryBuilderData = {
                      relationship: firstRelationship.external,
                      relationshipShortName: firstRelationship.internal
                  }
                  let entityTypes = RUFBehaviors.QueryBuilderBehavior.getSelectedEntityTypes(this._selectedEntityTypes)
                  let queryString = RUFBehaviors.QueryBuilderBehavior.buildQuery(entityTypes, attributeListArray, queryBuilderData, false, "");
                  let parsableString = RUFBehaviors.QueryBuilderBehavior.buildQuery(entityTypes, attributeListArray, queryBuilderData, true, "");

                  this._displayQuery(queryString, parsableString);
                  this._parseQuery(parsableString);
                  return;
              }
          }
          if(!_.isEmpty(this.externalSearchAttributes)){
              microTask.run(() => {
                  this._getAttributeModels();
              });
          }else if (!this.savedSearchId) {
              this._buildQueryString();
          }
      }
  }

  _initializeComponent() {
      this._searchBarElement = this.shadowRoot.querySelector("#searchBar");
      this._savedSearchButton = this.shadowRoot.querySelector("#savedSearchButton");
      this._savedSearchPopoverElement = this.shadowRoot.querySelector("#savedSearchPopover");
      this._savedSearchElement = this.shadowRoot.querySelector("#rockSavedSearch");
      this._entityTypeModelLov = this.shadowRoot.querySelector("#entityTypeModelLov");
      this._entitySearchFilterElement = this.shadowRoot.querySelector("#entitySearchFilter");
      this._searchGridElement = this.shadowRoot.querySelector("#entitySearchGrid");
  }

  _getVisibility(componentName) {
      if (typeof (this.configData) == "object") {
          if (this.configData.componentsVisibility) {
              return this.configData.componentsVisibility[componentName];
          }
      }
  }

  _onRequestedEntityTypesChange() {
      if (this.requestedEntityTypes && this.requestedEntityTypes.length > 0) {

          this._typesCriterion = this.requestedEntityTypes;

          if (this._typesCriterion && this._typesCriterion.length > 0) {
              let itemContexts = [];
              for (let i in this._typesCriterion) {
                  let itemContext = {
                      'type': this._typesCriterion[i]
                  };
                  itemContexts.push(itemContext);
              }
              this.contextData[ContextHelper.CONTEXT_TYPE_ITEM] = itemContexts;
          }

          if (this.entityIdList && this.entityIdList.length > 0) {
              let itemContexts = ContextHelper.getItemContexts(this.contextData);
              for (let i in this.entityIdList) {
                  let itemContext = {
                      'id': this.entityIdList[i]
                  };
                  itemContexts.push(itemContext);
              }
          }

          if (this._entitySearchFilterElement && this._entitySearchFilterElement.refresh) {
              this._entitySearchFilterElement.refresh();
          }

          this._selectedEntityTypes = this._getSelectedEntityTypes(this._typesCriterion);
          this._buildQueryString();

          //Add the tags of the selected entity types
          /*var rockSearchFilter = this._entitySearchFilterElement.$$("rock-search-filter");
          if (rockSearchFilter) {
              rockSearchFilter.addEntityTypeTag(this._getSelectedEntityTypeTitles(this._selectedEntityTypes));
          }*/
      }
  }

  _updateContextData(typesCriterion) {
      if (typesCriterion && typesCriterion.length > 0) {
          let itemContexts = [];
          for (let i in typesCriterion) {
              let itemContext = {
                  'type': typesCriterion[i]
              };
              itemContexts.push(itemContext);
          }
          this.set('contextData.' + ContextHelper.CONTEXT_TYPE_ITEM, itemContexts);
      }
  }

  _getSelectedEntityTypes(entityTypes) {
      let selectedEntityTypesForLOV = [];
      for (let i = 0; i < entityTypes.length; i++) {
          let itemObj = {
              "id": entityTypes[i]
          };
          itemObj.title = EntityTypeManager.getInstance().getTypeExternalNameById(entityTypes[i]);
          if (!this._isItemPresent(selectedEntityTypesForLOV, entityTypes[i])) {
              selectedEntityTypesForLOV.push(itemObj);
          }
      }

      return selectedEntityTypesForLOV;
  }

  /**
   *  Returns an array of selected entity titles
   */
  _getSelectedEntityTypeTitles(selectedEntities) {
      let selectedEntityTypeTitles = selectedEntities.map(function (selectedEntity) {
          return selectedEntity['title'];
      });
      return selectedEntityTypeTitles;
  }
  _isItemPresent(items, id) {
      let presentItem = items.find(function (item) {
          return item.id == id;
      });
      return !!presentItem;
  }


  // Rock search bar
  _onSearch(e, detail, sender) {
      if (!_.isEmpty(detail)) {
          this._searchQuery = detail.query;
      }

      this._buildQueryString();
      // this.fireBedrockEvent("search-criteria-changed");
      // this._searchTimeStamp = new Date().toLocaleString();
  }

  _showResetSearch(e) {
      let tags = [];
      if(this._entitySearchFilterElement){
          let rockSearchFilter = this._entitySearchFilterElement.$$("rock-search-filter");
          if (rockSearchFilter) {
              tags = rockSearchFilter.tags;
          }
      }

      //Preventing the reset search button from disappearing when there is a saved search selected/ search bar query/ refine more tag
      if (!DataHelper.isEmptyObject(this._searchBarElement.query) || tags.length > 0 || this.savedSearchId != "" || this.inputQueryString != "") {
          this._resetSearchEnabled = true;
      } else {
          this._resetSearchEnabled = false;
      }
  }

  _showQueryBuilder(e) {
      /*
      //TODO : Handling the user input query
      var inputQueryString = this._searchBarElement.query.toLowerCase();
      if(inputQueryString && (inputQueryString.substring(0, 4) == "show"){
          this.inputQueryString = this._searchBarElement.query;
      } */
      import('../rock-query-builder/rock-query-builder.js').then(() => {
              let queryBuilder = this.shadowRoot.querySelector("#queryBuilder");
              if (queryBuilder) {
                  queryBuilder.onOpenQueryBuilder();
              }
              this._queryBuilderEnabled = true;
          });
  }

  _hideQueryBuilder(e) {
      this._queryBuilderEnabled = false;
  }

  _resetSearch() {
      // Clear SearchBar
      this.searchQuery = "";
      this._searchQuery = "";
      this._searchBarElement.query = "";
      this._searchBarElement.setAttribute("placeholder", "");


      // Clear SearchFilter
      this.tags = []; // Todo
      this._selectedSearchFilters = [];
      if(this._entitySearchFilterElement){
          this._entitySearchFilterElement.clearSearchFilters();
      }
      this._resetSearchEnabled = false;

      //Reset the entityTypes according to the _gridConfig 
      let entityTypes = this._getSelectedEntityTypes(this.requestedEntityTypes);
      this._typesCriterion = this._selectedEntityTypes = entityTypes;

      //Clear the advanced search options
      this.inputQueryString = "";
      this.attributeGridData = [];
      if (!this.workflowName) {
          this.set("_workflowCriterion", new Object());
      }
      this.set("_governDataCriterion", new Object());
      this._isSearchFilterChanged = false;

      let queryBuilder = this.shadowRoot.querySelector("#queryBuilder");
      if (queryBuilder) {
          queryBuilder.resetQueryBuilder();
      }
      
      if(this.savedSearchId){
          this._savedSeachesChanged(true, false);
      }else{
          this._buildQueryString();
      }
      

  }

  // Saved Search
  _onSavedSearchTap(e) {
      this._savedSearchPopover = true;
      flush();

      this._savedSearchElement = this.shadowRoot.querySelector("#rockSavedSearch");
      this._savedSearchPopoverElement = this.shadowRoot.querySelector("#savedSearchPopover");

      this._savedSearchElement.contextData = this.contextData;
      this._savedSearchPopoverElement.show();
  }

  _onCreateEditSavedSearch(e, detail, sender) {
      if (detail) {
          let _isUpdate = false;

          //Check for permission to Update
          if (!DataHelper.isEmptyObject(detail.selectedSearch)) {
              let _currentUser = ContextHelper.getFirstUserContext(this.contextData);
              _isUpdate = true;

              //Todo: admin role may changed 
              if (_currentUser && _currentUser.user != detail.selectedSearch.createdby &&
                  _currentUser.role != "admin") {
                  this.showErrorToast(
                      "You do not have permissions to update the saved search, contact administrator."
                  );
                  return;
              }
          }

          let displayQuery = this._searchBarElement.placeholder;
          let internalQuery = this._searchBarElement.internalQuery;

          //Initiate
          let _savedSearchDetails = {
              "saved-search-info": "",
              "dimensions": {},
              "display-query": "",
              "internal-query": ""
          };

          let selectedDimensions = {};
          let currentActiveApp = ComponentHelper.getCurrentActiveApp();
          if (currentActiveApp) {
              let contextSelector = currentActiveApp.contextSelector;
              if (contextSelector) {
                  selectedDimensions = contextSelector.selectedDimensionsDetail;
              }
          }

          // create or edit form info
          _savedSearchDetails["saved-search-info"] = detail;

          // dimension selectors info
          _savedSearchDetails["dimensions"] = selectedDimensions;

          // display query Info
          _savedSearchDetails["display-query"] = displayQuery;

          // Internal query info
          _savedSearchDetails["internal-query"] = internalQuery;

          // business conditions data info
          _savedSearchDetails["govern-data"] = this._governDataCriterion;

          if (detail.selectedSearch && !DataHelper.isEmptyObject(detail.selectedSearch)) {
              this._savedSearchElement.createUpdateSavedSearch(_savedSearchDetails,
                  "update");
              return;
          }

          // Use rock-saved-searches to create new search
          this._savedSearchElement.createUpdateSavedSearch(_savedSearchDetails, "create");
      }
  }

  _onCancelSavedSearch(e, detail, sender) {
      // this._savedSearchElement.shadowRoot.querySelector('rock-tabs').shadowRoot.querySelector('pebble-tab-group').notifyResize(); //To load tabs properly
  }

  _loadSavedSearch(e, detail, sender) {
      if (detail) {
          if(this.savedSearchId && (this.savedSearchId == detail.id)){
              this._resetSearch();
              this._savedSearchPopoverElement.close();
          }else{
              ComponentHelper.setQueryParams({
                  "_savedSearchId": detail.id
              });
          }
      }
  }

  _savedSeachesChanged(newValue, oldValue) {
      if (newValue != oldValue) {
          if (this.savedSearchId && this.savedSearches) {
              let savedSearch = this._getSavedSearches(this.savedSearches, this.savedSearchId);
              if (savedSearch) {
                  this._savedSearch = savedSearch;
                  if (!_.isEmpty(savedSearch.dimensions)) {
                      this.selectedDimensions = DataHelper.cloneObject(savedSearch.dimensions);
                  } 
                  this._processSavedSearch(savedSearch);
              }
          }
      }

  }

  _processSavedSearch(savedSearch) {
      this._isSavedSearchLoad = true;
      this._savedSearchButton.buttonText = savedSearch.name;
      this._governDataCriterion = savedSearch.governData;
      
      let displayQuery = savedSearch.displayQuery;
      let internalQuery = savedSearch.internalQuery;

      if(this._isSearchFilterChanged){
          displayQuery = this._searchBarElement.placeholder;
          internalQuery = this._searchBarElement.internalQuery;
      }
      this._displayQuery(displayQuery, internalQuery);
      this._parseQuery(internalQuery);
  }

  _getSavedSearches(savedSearches, savedSearchId) {
      let savedSearch;
      if (savedSearches) {
          for (let category in savedSearches) {
              let categorySavedSearches = savedSearches[category];
              if (categorySavedSearches && categorySavedSearches.length > 0) {
                  for (let i = 0; i < categorySavedSearches.length; i++) {
                      if (categorySavedSearches[i].id == savedSearchId) {
                          savedSearch = categorySavedSearches[i];
                          break;
                      }
                  }
                  if (savedSearch) {
                      break;
                  }
              }
          }
      }
      return savedSearch;
  }

  _populateHeaderControls(attributeModels) {
      if (!_.isEmpty(this._typesCriterion)) {
          this._showResetSearch();
      }

      if (!_.isEmpty(this._selectedSearchFilters)) {
          this._showResetSearch();
          if(this._entitySearchFilterElement){
              this._entitySearchFilterElement.tags = this._formatSavedSearchTags(this._selectedSearchFilters, attributeModels);
          }
      }

      if (this.searchQuery && this._searchBarElement) {
          this._searchQuery = this.searchQuery;
          this._searchBarElement.searchText = this._searchQuery;
      }
      //this._searchGridElement.savedSearchCriterion = this._savedSearch;
  }

  /*_updateSearchEntityTypeTag: function(selectedItems){
      if (this._entitySearchFilterElement) {
          var searchFilterElement = this._entitySearchFilterElement.$$("rock-search-filter");
          searchFilterElement.onEntityTypeChange(selectedItems);
      }
  },*/

  /**
   * Fallback logic for existing saved searches
   * textbox to textbox collection
   * lov display
   */
  _formatSavedSearchTags(searchFilters, attributeModels) {
      if (searchFilters.length > 0) {
          let tags = [];
          let clonedSearchFilters = DataHelper.cloneObject(searchFilters);
          clonedSearchFilters = this.getFilterValue(clonedSearchFilters);
          for (let i = 0; i < clonedSearchFilters.length; i++) {
              let filter = clonedSearchFilters[i];
              if (!_.isEmpty(filter)) {
                  let tag = {};
                  for (let attrName in filter) {
                      let attrModel = attributeModels.find(obj => obj.name === attrName);
                      let attribute = filter[attrName];
                      if (attrModel) {
                          if (attrModel.dataType.toLowerCase() == "integer" || attrModel.dataType.toLowerCase() == "decimal") {
                              attrModel.displayType = "numeric";
                          }
                          tag.name = attrName;
                          tag.longName = attrModel.externalName;
                          tag.options = DataHelper.cloneObject(attrModel);
                      }
                      tag.value = DataHelper.cloneObject(attribute);
                      if (attribute.hasvalue != undefined) {
                          tag.displayValue = attribute.hasvalue ? "!%&has value!%&" : "!%&has no value!%&";
                      } else if (attribute.type === "_STRING") {
                        if (attribute.eq) {
                            let _tagValue = attribute.eq.replace(/[()*]+/g, '');
                            let valSplitByPipe = _tagValue.split("|");
                            if(valSplitByPipe.length > 1){
                                tag.displayValue = this._entitySearchFilterElement.formatFilterCollectionDisplay(valSplitByPipe);
                            }else{
                                tag.displayValue = _tagValue
                            }
                        }else if (attribute.exacts) {
                              tag.displayValue = this._entitySearchFilterElement.formatFilterCollectionDisplay(attribute.exacts);
                          } else if (attribute.contains) {
                            if(tag.options.displayType.toLowerCase() == "richtexteditor"){
                                tag.displayValue = attribute.contains;
                            } else {
                                tag.displayValue = this._entitySearchFilterElement.formatFilterCollectionDisplay(attribute.contains.split(" "));
                            }
                          } else if (attribute.exact) {
                              tag.displayValue = '"' + attribute.exact + '"';
                          } else if (attribute.eq && attribute.pathCollection) {
                              tag.displayValue = this._entitySearchFilterElement.formatFilterCollectionDisplay(attribute.pathCollection);
                          }
                      } else if (attribute.type === "_DECIMAL" || attribute.type === "_INTEGER") {
                          if (attribute.lte && attribute.gte) {
                              tag.displayValue = attribute.gte + " - " + attribute.lte;
                          } else if (attribute.contains) {
                              tag.displayValue = this._entitySearchFilterElement.formatFilterCollectionDisplay(attribute.contains.split(" "));
                          } else if (attribute.eq) {
                              tag.displayValue = attribute.eq;
                          } else if (attribute.exacts) {
                                if(attribute.exacts instanceof Array) {
                                    tag.displayValue = this._entitySearchFilterElement.formatFilterCollectionDisplay(attribute.exacts);
                                } else {
                                    tag.displayValue = attribute.exacts;
                                }
                            }
                      } else if (attribute.type === "_BOOLEAN") {
                          tag.displayValue = attribute.eq;
                      } else if (attribute.type === "_DATETIME" || attribute.type === "_DATE") {
                          if (attribute.lte === attribute.gte) {
                              tag.displayValue = FormatHelper.convertFromISODateTime(attribute.gte, tag.options.dataType);
                          } else {
                              tag.displayValue = FormatHelper.convertFromISODateTime(attribute.gte, tag.options.dataType) + " - " + FormatHelper.convertFromISODateTime(attribute.lte, tag.options.dataType);
                          }
                      }
                      tag.value.hasvalue = true;
                      if(attribute.hasvalue == false){
                        tag.value.hasvalue = false; 
                      }
                  }
                  //Set no popover for saved searches
                  if (tag.options) {                    
                      tag.options.hasValueChecked = tag.value.hasvalue;                      
                      tag.options.noPopoverOnAttach = true;
                  } else {
                      tag.options = {
                          "noPopoverOnAttach": true
                      };
                      tag.options.hasValueChecked = tag.value.hasvalue; 
                  }

                  tags.push(tag);
              }
          }
          return tags;
      }
  }

  // Quick Manage
  _onSelectingGridItem(e, detail, sender) {
      if (this._quickManageEnabled) {
          
          let selectedEntityItem = detail.item;
          if (!DataHelper.isEmptyObject(selectedEntityItem)) {
              let itemContext = {
                  'id': selectedEntityItem.id,
                  'type': selectedEntityItem.type
              };

              this.contextData[ContextHelper.CONTEXT_TYPE_ITEM] = [itemContext];
              this._selectedEntity = selectedEntityItem;

              this._searchGridElement.clearSelection();
              microTask.run(() => {
                  this._currentIndex = this._searchGridElement.getSelectedItemIndex();
                  this.refresh();
              });
          }
      }
  }

  _onDeSelectingGridItem(e, detail, sender) {
      if (this._quickManageEnabled) {
          this._selectedEntity = {};
      }
  }

  _onRefreshGrid() {
      if (this._quickManageEnabled) {
          this._quickManageEnabled = false;
          this._selectedEntity = {};
          // this._searchGridElement.notifyResize();
      }
  }

  _onTapQuickManage() {
      this._quickManageEnabled = !this._quickManageEnabled;

      let selectedCount = this._searchGridElement.getSelectedItems();
      if (selectedCount.length > 1) {
          this.showWarningToast("Cannot use multiple entities for Quick Manage");
      }
      if (this._quickManageEnabled) {
          let selectedItem = selectedCount[selectedCount.length - 1];

          if (!DataHelper.isEmptyObject(selectedItem)) {
              let itemContext = {
                  'id': selectedItem.id,
                  'type': selectedItem.type
              };

              this.contextData[ContextHelper.CONTEXT_TYPE_ITEM] = [itemContext];
              this._selectedEntity = selectedItem;

              this._searchGridElement.clearSelection(); //Clear current selection
              this._searchGridElement.selectItem(selectedItem); //Select item
              this._currentIndex = this._searchGridElement.getSelectedItemIndex();
              let entityQuickManage = this.shadowRoot.querySelector("#entityQuickManage");
              if (entityQuickManage) {
                  entityQuickManage.contextData = [];
                  entityQuickManage.contextData = this.contextData;
              }

              
          }
      } else {
          this._currentIndex = this._searchGridElement.getSelectedItemIndex();
      }
      //Grid need to wait for sometime to quickmanage container to fit, because
      //the grid is relative to quick manage container.After quick manage rendered,
      //we can move to the specified index.
     // this._gridRePosition()

      // this._searchGridElement.notifyResize();
  }

  _gridRePosition(){
      if(this._currentIndex < 0){
          this._currentIndex = 0
      }
      this.async(function () {
          this._searchGridElement.scrollToIndex(this._currentIndex);
      }, 500);
  }

  _applyClass(quickManageEnabled) {
      this._gridRePosition();
      if (quickManageEnabled) {
          return "col-8";
      }

      return "col-12";
  }

  _selectEntity(index, nav) {
      if (!(index < 0)) {
          let gridData = this._searchGridElement.getData();

          if (gridData.length > 0 && index < this._gridFullLength) {
              if (!_.isEmpty(gridData[index])) {
                  let selectedGridItem = gridData[index];

                  let itemContext = {
                      'id': selectedGridItem.id,
                      'type': selectedGridItem.type
                  };

                  this.contextData[ContextHelper.CONTEXT_TYPE_ITEM] = [itemContext];

                  this._selectedEntity = selectedGridItem;
                  this._currentIndex = index;
                  this._searchGridElement.clearSelection();
                  this._searchGridElement.selectItem(gridData[index]);

                  //On previous click already data got loaded, so directly we can set scroll index
                  //but for next, data will loaded as per page size, so scroll as per allow scroll
                  if (nav == 'previous' || this._isAllowedToScroll()) {
                      this._searchGridElement.scrollToIndex(this._currentIndex);
                  }
              } else {
                  let nextScrollIndex = this._searchGridElement.totalRecords + this._searchGridElement
                      .pageSize;
                  // Todo: nextScrollIndex will be based on the grid total count
                  this._searchGridElement.scrollToIndex(nextScrollIndex);

                  setTimeout(() => {
                      this._selectEntity(index);
                  }, 10);
              }
          }

          this.refresh();
      }
  }

  _isAllowedToScroll() {
      if (((this._currentIndex) % this._searchGridElement.pageSize) == 0) {
          return true;
      }

      return false;
  }

  _onClickPrevious(e, detail, sender) {
      if (this._currentIndex > 0) {
          this._selectEntity(this._currentIndex - 1, 'previous');
      }
  }

  _onClickNext(e, detail, sender) {
      let currentIndex = this._currentIndex + 1;
      if (currentIndex < this._gridFullLength) {
          this._selectEntity(currentIndex);
      }
  }

  _onAttributeSave(e, detail, sender) {
      //Changing the row style of the updated record
      let selectedRow = this._searchGridElement.getSelectedGridRow();
      if (selectedRow) {
          selectedRow.style['font-style'] = 'italic';
      }
  }


  // Entity Type Filter
  _openEntityTypeFilterLov() {
      this._entityTypeFilterPopover = true;
      flush();
      this.shadowRoot.querySelector("#entityTypeFilterPopover").open();
  }

  _onSelectedEntityTypesChange(e, detail) {
      this._onEntityTypePopoverClose();
      if (this.configData && this.configData.componentSettings && this.configData.componentSettings["rock-entity-type-model-lov"]) {
          let entityTypeConfig = this.configData.componentSettings["rock-entity-type-model-lov"]
          if (!entityTypeConfig.multiSelect) {
              this._selectedEntityTypes = [this._selectedEntityType];
          }
      }
      this._buildQueryString();
  }

  _onEntityTypePopoverClose(e, detail) {
      this.shadowRoot.querySelector("#entityTypeFilterPopover").close();
      this._entityTypeFilterPopover = false;
  }


  // Actions Buttons
  _onActionsTap(e) {
      this.$$('#actionsPopover').show();
  }

  // Revisit
  _onActionItemTap(e, detail, sender) {

      let copContext = {};
      if (detail && detail["data"] && detail["data"]["cop-context"]) {
          copContext = detail["data"]["cop-context"];
          let valContexts = ContextHelper.getValueContexts(this.contextData);
          if (copContext.source) {
              copContext.source = valContexts[0].source;
          }
      }

      let selectedDetails = {
          "selectedItems": this._searchGridElement.getSelectedItems(),
          "selectionMode": this._searchGridElement.getSelectionMode(),
          "selectionQuery": this._searchGridElement.getSelectedItemsAsQuery(),
          "selectedItemsCount": this._searchGridElement.getSelectedItemsCount(),
          "copContext": copContext
      };

      let businessActionsEl = this.shadowRoot.querySelector("#businessActions");
      if (businessActionsEl) {
          businessActionsEl.triggerProcess(selectedDetails, this._workflowCriterion);
      }
  }

  _showToastMessage(msgObject) {
      if (msgObject) {
          if (msgObject.type == "error") {
              this.showErrorToast(msgObject.message, 10000);
          } else if (msgObject.type == "success") {
              this.showSuccessToast(msgObject.message, 10000);
          }
      }
  }

  _showWorkflowActions(wfCriterion) {
      if (!DataHelper.isEmptyObject(wfCriterion)) {
          return true;
      }

      return false;
  }

  refresh() {
      if (!this._quickManageEnabled && !DataHelper.isEmptyObject(this.contextData)) {
          if (this._typesCriterion && this._typesCriterion.length > 0) {
              let itemContexts = [];
              for (let i in this._typesCriterion) {
                  let itemContext = {
                      'type': this._typesCriterion[i]
                  };
                  itemContexts.push(itemContext);
              }
              this.contextData[ContextHelper.CONTEXT_TYPE_ITEM] = itemContexts
          }

          if (this.entityIdList && this.entityIdList.length > 0) {
              let itemContexts = ContextHelper.getItemContexts(this.contextData);
              for (let i in this.entityIdList) {
                  let itemContext = {
                      'id': this.entityIdList[i]
                  };
                  itemContexts.push(itemContext);
              }
          }
      }

      if (this._quickManageEnabled) {
          const entityQuickManage = this.shadowRoot.querySelector("#entityQuickManage");
          if (entityQuickManage) {
              entityQuickManage.reload();
          }
      } else {
          if (this._searchGridElement) {
              this._searchGridElement.refresh();
          }
      }
  }
  reload() {
      if (this.savedSearchId && !_.isEmpty(this.savedSearches)){
          let savedSearch = this._getSavedSearches(this.savedSearches, this.savedSearchId);
          if (savedSearch) {
              this._processSavedSearch(savedSearch);
          }
      } else {
          this._buildQueryString();
      }
  }
  /**
   * When the grid data is empty, hide the grid,action buttons and show the "no data" info
   **/
  _onEntityGridEmpty() {
      let gridComponents = this.shadowRoot.querySelector("#entitySearchGrid");
      gridComponents.style['visibility'] = "hidden";
      let actionBtns = this.shadowRoot.querySelector(".action-buttons");
      if (actionBtns) {
          actionBtns.style['visibility'] = "hidden";
      }

      let gridInfo = this.shadowRoot.querySelector("#entityGridInfo");
      gridInfo.style['display'] = "block";

      this._quickManageEnabled = false;
  }

  /**
   * When the grid data is not empty, show the grid,action buttons and hide the "no data" info
   **/
  _onEntityGridFull() {
      let gridInfo = this.shadowRoot.querySelector("#entityGridInfo");
      gridInfo.style['display'] = "none";

      let gridComponents = this.shadowRoot.querySelector("#entitySearchGrid");
      gridComponents.style['visibility'] = "visible";
      let actionBtns = this.shadowRoot.querySelector(".action-buttons");
      if (actionBtns) {
          actionBtns.style['visibility'] = "visible";
      }
  }

  _onEntityGridError() {
      let gridComponents = this.shadowRoot.querySelector("#entitySearchGrid");
      gridComponents.style['visibility'] = "hidden";
      let actionBtns = this.shadowRoot.querySelector(".action-buttons");
      if (actionBtns) {
          actionBtns.style['visibility'] = "hidden";
      }

      let gridInfo = this.shadowRoot.querySelector("#entityGridInfo");
      gridInfo.innerHTML = "Failed to fetch search results for the given criteria. Try after some time";
      gridInfo.style['display'] = "block";

      this._quickManageEnabled = false;
  }
  /**
   * Getting the active selected entities when typescriterion changes
   **/
  _getActiveEntityTypes(activeEntities) {
      let selectedEntityTypes = [];
      if (activeEntities && !_.isEmpty(activeEntities)) {
          selectedEntityTypes = this._getSelectedEntityTypes(activeEntities);
      }
      return selectedEntityTypes;
  }
  /**
   * When Refine more tags get added/updated, search query needs to be built and advanced search options need to be incorporated
   */
  _buildQueryString(e, detail) {
      //Closing the quick manage to enable search if it is opened when search query is built
      if (this._quickManageEnabled) {
          this._onTapQuickManage();
      }
      let workflowGridData = this._setWorkflowGridData(this._workflowCriterion);

      let queryBuilder = this.shadowRoot.querySelector("#queryBuilder");
      let queryBuilderData = {};
      if (queryBuilder) {
          queryBuilderData = queryBuilder.getQueryBuilderData();
      }
      queryBuilderData.workflowGridData = workflowGridData;

      //User has input some keyword search criteria
      let keywordSearchStr = "";
      if (this._searchQuery) {
          keywordSearchStr = this._searchQuery;
      }
      //this binding not working it returns null
      //hardbinding directly to behavior
      let entityTypes = RUFBehaviors.QueryBuilderBehavior.getSelectedEntityTypes(this._selectedEntityTypes);
      let attributeListArray = [];

      if (detail) {
          let attributeList = detail;
          let displayValue = "";
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
          if(!this._isExternalSearchDataLoaded){
            this._isExternalSearchDataLoaded = true;
            if(!_.isEmpty(this.externalSearchRelationships) && _.isEmpty(queryBuilderData.relationship)){
                let firstRelationship = this.externalSearchRelationships[0];
                if (firstRelationship.internal && firstRelationship.external) {
                    queryBuilderData.relationship = firstRelationship.external;
                    queryBuilderData.relationshipShortName = firstRelationship.internal;
                }
            }
        }
      } else if (this.attributeGridData) {
          attributeListArray = this.attributeGridData;
      }
      //this binding not working it returns null
      //hardbinding directly to behavior                   
      let queryString = RUFBehaviors.QueryBuilderBehavior.buildQuery(entityTypes, attributeListArray, queryBuilderData, false, keywordSearchStr);
      //this binding not working it returns null
      //hardbinding directly to behavior
      let parsableString = RUFBehaviors.QueryBuilderBehavior.buildQuery(entityTypes, attributeListArray, queryBuilderData, true, keywordSearchStr);

      this._displayQuery(queryString, parsableString);
      this._parseQuery(parsableString);
  }

  /**
   * When search query is built from the query-builder, display query on the search bar
   */
  _onQueryBuild(e, detail) {
      let displayQuery = detail.displayQuery;
      let prasableQuery = detail.parsableQuery;
      let queryBuilder = this.shadowRoot.querySelector("#queryBuilder");
      if (!_.isEmpty(queryBuilder.workflowGridData)) {
          let workflowListArray = queryBuilder.workflowGridData;
          this._updateWorkflowCriterion(workflowListArray);
      }
      this._displayQuery(displayQuery, prasableQuery);
      this._parseQuery(prasableQuery);
  }

  _updateWorkflowCriterion(workflowList) {
      let workflowCriterion = {
          "workflowName": workflowList[0].workflowExternalName,
          "workflowActivityExternalName": workflowList[0].workflowActivityExternalName
      };
      this.set("_workflowCriterion", workflowCriterion);
  }

  /**
   * Function to display the query on the search bar
   */
  _displayQuery(queryStr, parsableQueryStr) {
      if (!this._searchBarElement) {
          return;
      }
      this.inputQueryString = queryStr;
      this._searchBarElement.searchInput = [];
      if (queryStr) {
          this._searchBarElement.searchText = this._searchQuery;
          this._searchBarElement.setAttribute("placeholder", "");
          if (queryStr.indexOf("!%&") > -1) {
              queryStr = queryStr.replace(/!%&/g, "");
          }
          this._searchBarElement.setAttribute("placeholder", queryStr);
      }
      if (parsableQueryStr) {
          this._searchBarElement.internalQuery = parsableQueryStr;
      }
      this._showResetSearch();

      if (this.savedSearchId || this._workflowCriterion) {
          //update the nav menu contents
          this.dispatchEvent(new CustomEvent('load', {
              detail: {
                  "title": this.inputQueryString
              },
              bubbles: true,
              composed: true
          }));
      }
  }

  /**
   * Function to parse the query
   */
  _parseQuery(query) {
      let parserPubsub = this.shadowRoot.querySelector("[id=parser-event]");
      let queryParser = this.shadowRoot.querySelector("[id=queryParser]");
      if (parserPubsub) {
          parserPubsub.registerEvent();
      }
      if (queryParser) {
          queryParser.parseQueryToFilters(query);
      }
  }

  _onSearchFiltersChange(e, detail) {
      this._entityTypes = detail.typesCriterion;
      this._searchFilters = detail;
      this._isSearchFilterChanged = true;
      //this.shadowRoot.querySelector("#entityTypeFilterPopover").close();
      this._updateProperties(this._searchFilters);
  }
  _updateProperties(searchFilters) {
      let typesCriterion = searchFilters.typesCriterion;
      let selectedSearchFilters = searchFilters[this.filterCriterionKey];
      let relationshipSearchFilters = searchFilters.relationshipsCriterion;
      let workflowCriterion = searchFilters.workflowCriterion ? searchFilters.workflowCriterion : undefined;
      let searchQuery = searchFilters.searchQuery ? searchFilters.searchQuery : "";
      this.set("_typesCriterion", typesCriterion);
      this._updateContextData(this._typesCriterion);
      this.set("_selectedSearchFilters", selectedSearchFilters);
      this.set("_relationshipSearchFilters", relationshipSearchFilters);
      if (workflowCriterion) {
          this._workflowCriterion.workflowShortName = workflowCriterion.workflowShortName;
          this._workflowCriterion.workflowActivityName = workflowCriterion.workflowActivityName;
          this.set("_workflowCriterion", this._workflowCriterion);
      } else {
          this.set("_workflowCriterion", workflowCriterion);
      }

      this.set("searchQuery", searchQuery);
      this.set("_selectedEntityTypes", "");
      let selectedEntityTypes = this._getSelectedEntityTypes(typesCriterion);
      this.set("_selectedEntityTypes", selectedEntityTypes);
      if (this._isSavedSearchLoad) {
          this._queryBuilderEnabled = true;
          let attributeModels = searchFilters.attributeModels;
          let relationshipModels = searchFilters.relationshipModels;
          this.set("_workflowCriterion", workflowCriterion);
          this._isSavedSearchLoad = false;
          this._setRelationshipsData(relationshipSearchFilters, relationshipModels, attributeModels);
          this._populateHeaderControls(attributeModels);
          this._queryBuilderEnabled = false;
      }
      this.refresh();
  }
  getFilterValue(value, prevKey) {
      let filerValues = [];
      for (let i = 0; i < value.length; i++) {
          let currentKey = Object.keys(value[i]);
          let currentAttribute = value[i][currentKey].attributes;
          let updatedKey = prevKey ? prevKey + "." + currentKey : currentKey
          if (!currentAttribute) {
              let filerValue = {};
              filerValue[updatedKey] = value[i][currentKey];
              filerValues.push(filerValue);
          } else {
              filerValues = filerValues.concat(this.getFilterValue(currentAttribute, updatedKey));
          }
      }
      return filerValues;
  }
  _setWorkflowGridData(workflowCriterion) {
      let workflowListArray = [];

      let workflowData = {
          "name": "",
          "value": ""
      };

      if (!_.isEmpty(workflowCriterion)) {
          workflowData = {
              "name": workflowCriterion.workflowName,
              "value": workflowCriterion.workflowActivityExternalName,
              "workflowShortName": workflowCriterion.workflowShortName,
              "workflowExternalName": workflowCriterion.workflowName,
              "workflowActivityShortName": workflowCriterion.workflowActivityName,
              "workflowActivityExternalName": workflowCriterion.workflowActivityExternalName
          };
      }

      workflowListArray.push(workflowData);

      return workflowListArray;
  }
  _setRelationshipsData(relationshipSearchFilters, relationshipModels, compositeModels) {
      let relationshipsData = {};
      let relEntityData = {};
      this.relationshipExistsSearchCriterionData = {};
      if (!_.isEmpty(relationshipSearchFilters)) {
          let relationshipfilterObj = relationshipSearchFilters[0];
          let relationshipName = Object.keys(relationshipfilterObj)[0];
          let relationshipLongName = relationshipModels[relationshipName][0].properties.externalName;
          let relData = relationshipfilterObj[relationshipName];
          let attributes = relData.attributes;
          let attrModels = [];
          for (let key in relationshipModels[relationshipName][0].attributes) {
              attrModels.push(relationshipModels[relationshipName][0].attributes[key]);
          }
          if (DataHelper.isValidObjectPath(relationshipModels[relationshipName][0], "properties.relationshipOwnership")) {
              this.relationshipExistsSearchCriterionData.relationshipOwnership = relationshipModels[relationshipName][0].properties.relationshipOwnership;
          }

          if (relData.relTo && relData.relTo.type) {
              relEntityData.relEntityType = relData.relTo.type;
              if (DataHelper.isValidObjectPath(relData, "query.filters") && relData.query.filters[this.filterCriterionKey]) {
                  let relEntityTags = this._formatSavedSearchTags(relData.query.filters[this.filterCriterionKey], compositeModels);
                  relEntityData.selectedAttributes = relEntityTags;
              }
          } else if (relData.hasvalue != undefined && !relData.hasvalue) {
              this.relationshipExistsSearchCriterionData.hasRelationshipChecked = false;
          }

          relationshipsData.relationshipName = relationshipName;
          relationshipsData.relationshipLongName = relationshipLongName;
          if (!_.isEmpty(attributes)) {
              let relationshipTags = this._formatSavedSearchTags(attributes, attrModels);
              relationshipsData.selectedAttributes = relationshipTags;
          }

          this.set("_relationshipsData", relationshipsData);

          if (!_.isEmpty(relEntityData)) {
              this.set("_relEntityData", relEntityData);
          }
      }
  }

  _isEntityTypeSelected(_typesCriterion) {
      if (_typesCriterion && _typesCriterion.length > 0) {
          return true;
      }

      return false;
  }

  _onAddNew() {
      let attributeNames;
      let searchGrid = this.shadowRoot.querySelector("#entitySearchGrid");
      let attributeModels = searchGrid.attributeModels;
      if (attributeModels) {
          attributeNames = Object.keys(attributeModels);
      }

      let itemContext = {
          'id': "-1",
          'type': this._typesCriterion[0],
          'attributeNames': attributeNames
      };
      this.set("_quickManageEnabled", true);
      this.updateContext(ContextHelper.CONTEXT_TYPE_ITEM, [itemContext]);
  }
  updateContext(contextType, contexts) {
      this.contextData[contextType] = contexts;
      setTimeout(() => {
          let quickManage = this.shadowRoot.querySelector("#entityQuickManage");
          if (quickManage) {
              quickManage.reload();
              quickManage.showExpandIcon = false;
          }
      }, 0);
  }
  _getComponentSettings(componentName) {
      if (typeof (this.configData) == "object") {
          if (this.configData.componentSettings) {
              return this.configData.componentSettings[componentName];
          }
      }
  }
}
customElements.define(RockEntitySearchDiscovery.is, RockEntitySearchDiscovery)
