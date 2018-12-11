/**
`rock-saved-searches` Represents an element that displays the saved searches.

@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import '@polymer/iron-ajax/iron-ajax.js';
import { timeOut, microTask } from '@polymer/polymer/lib/utils/async.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../bedrock-style-manager/styles/bedrock-style-floating.js';
import '../liquid-config-get/liquid-config-get.js';
import '../liquid-config-save/liquid-config-save.js';
import '../pebble-icons/pebble-icons.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-button/pebble-button.js';
import '../pebble-horizontal-divider/pebble-horizontal-divider.js';
import '../pebble-popover/pebble-popover.js';
import '../rock-tabs/rock-tabs.js';
import './rock-saved-searches-tags.js';
import './rock-create-edit-saved-searches.js';
import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';

let _favSearch = 'favourites';
let _mySearch = 'my-searches';
let _sharedSearch = 'shared-searches';
let tabs = { "favourites": 0, "my-searches": 1, "shared-searches": 2 };

class RockSavedSearches
    extends mixinBehaviors([
        RUFBehaviors.UIBehavior
    ], OptionalMutableData(PolymerElement)) {
  static get template() {
    return html`
            <style include="bedrock-style-common bedrock-style-tooltip bedrock-style-floating bedrock-style-icons">
                #newSavedSearch {
                    font-weight: var(--font-bold, bold);
                    line-height: 14px;
                }

                #createEditSavedSearch {
                    float: right;
                    margin-right: 10px;
                    line-height: 10px;
                    height: auto;
                    --pebble-button: {
                        font-size: var(--font-size-sm, 12px) !important;
                        color: var(--link-text-color, #036Bc3)!important;
                        font-weight: 500;
                        padding-top: 0;
                        padding-right: 0;
                        padding-bottom: 0;
                        padding-left: 0;
                    };
                }

                pebble-horizontal-divider {
                    --pebble-horizontal-divider-color: #ccc;
                }

                rock-tabs {
                    --pebble-tab-group: {
                        margin-bottom: 10px;
                        width: 100%;
                    }
                    --pebble-tab: {
                        margin-left: 0;
                    }
                }

                .savedSearchLabel {
                    color: var(--title-text-color, #191e22);
                    font-weight: var(--font-bold, bold);
                    font-size: var(--default-font-size, 14px);
                    display: inline-block;
                    line-height: 18px;
                }

                rock-tabs {
                    --rock-tab-content: {
                        @apply --saved-search-tab-content;
                        max-height: 165px;
                        overflow-y: auto;
                    }
                }
            </style>
        <!--Liquid start-->
        <template is="dom-if" if="[[_load]]">
            <liquid-config-get id="liqInitiateSearch" operation="initiatesearch" request-data="{{initiateSearchRequestData}}" last-response="{{initiateSearchResponse}}" on-response="_onInitiateSearchResponse">
            </liquid-config-get>
            <liquid-config-get id="liqGetSearchResultDetail" operation="getsearchresultdetail" on-response="_onGetSearchResultDetailResponse">
            </liquid-config-get>

            <liquid-config-get id="liqInitiateNameSearch" operation="initiatesearch" request-data="{{initiateNameSearchRequestData}}" last-response="{{initiateNameSearchResponse}}" on-response="_onInitiateNameSearchResponse">
            </liquid-config-get>
            <liquid-config-get id="liqGetNameSearchResultDetail" operation="getsearchresultdetail" on-response="_onGetNameSearchResultDetailResponse">
            </liquid-config-get>

            <liquid-config-save name="configSaveService" on-response="_onSaveSearchResponse"></liquid-config-save>
        </template>
        <!--Liquid end-->
        <bedrock-pubsub event-name="component-creating" handler="_onComponentCreating"></bedrock-pubsub>
        <bedrock-pubsub event-name="favourite-saved-search" handler="_onTapSavedSearchFavourite" target-id=""></bedrock-pubsub>
        <bedrock-pubsub event-name="delete-saved-search" handler="_onTapSavedSearchDelete" target-id=""></bedrock-pubsub>
        <bedrock-pubsub event-name="actions-parent-button-tap" handler="_onTagItemSelect" target-id=""></bedrock-pubsub>
        <!--Title, Settings and Create/Edit link-->
        <div id="newSavedSearch" class="clearfix">
            <template is="dom-if" if="[[showTitle]]">
                <div class="savedSearchLabel">Saved Searches</div>
            </template>
            <template is="dom-if" if="[[showSettings]]">
                <pebble-icon id="refreshButton" icon="pebble-icon:refresh" title="Refresh" class="pebble-icon-color-blue pebble-icon-size-16 pull-right" on-tap="refresh"></pebble-icon>
            </template>
            <template is="dom-if" if="[[allowCreateEditSearch]]">
                <pebble-button id="createEditSavedSearch" icon="pebble-icon:action-add" button-text="Create or Edit Saved Search" noink="" class="createEditSavedSearch pebble-icon-color-blue icon" on-tap="_onCreateEditSavedSearchTap"></pebble-button>
            </template>
        </div>
        <!--Tabs section-->
        <template is="dom-if" if="[[!noTabs]]">
            <rock-tabs id="rock-saved-searches-tabs" config="[[_tabConfig]]" deferred-render=""></rock-tabs>
        </template>
        <!--Create/Update section-->
        <template is="dom-if" if="[[noTabs]]">
            <rock-create-edit-saved-searches edit-mode="{{noTabs}}" saved-search-id="[[savedSearchId]]" create-edit-model="[[savedSearches]]"></rock-create-edit-saved-searches>
        </template>
`;
  }

  static get is() {
      return 'rock-saved-searches';
  }
  static get observers() {
      return [
          '_onContextDataChange(contextData, appName)'
      ]
  }
  static get properties() {
      return {
          _tabConfig: {
              type: Object,
              notify: true,
              value: function () {
                  return {
                      "scrollable": false,
                      "tabItems": [
                          {
                              "name": "favourites",
                              "title": "Favourites",
                              "selected": true,
                              "enableDropdownMenu": false,
                              "component": {
                                  "name": "rock-saved-searches-tags",
                                  "path": "/src/elements/rock-saved-searches/rock-saved-searches-tags.html",
                                  "properties": {
                                      "saved-search-category": "favourites"
                                  }
                              }
                          },
                          {
                              "name": "my-searches",
                              "title": "My Searches",
                              "enableDropdownMenu": false,
                              "component": {
                                  "name": "rock-saved-searches-tags",
                                  "path": "/src/elements/rock-saved-searches/rock-saved-searches-tags.html",
                                  "properties": {
                                      "saved-search-category": "my-searches"
                                  }
                              }
                          },
                          {
                              "name": "shared-searches",
                              "title": "Shared Searches",
                              "enableDropdownMenu": false,
                              "component": {
                                  "name": "rock-saved-searches-tags",
                                  "path": "/src/elements/rock-saved-searches/rock-saved-searches-tags.html",
                                  "properties": {
                                      "saved-search-category": "shared-searches"
                                  }
                              }
                          }
                      ]
                  }
              }
          },
          /**
            * <b><i>Content development is under progress... </b></i> 
            */
          contextData: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          _load: {
              type: Boolean,
              value: false
          },

          /**
           * Indicates the search identification which the consumer selects.
           */
          savedSearchId: {
              type: Number,
              value: null,
              notify: true
          },

          /** 
            * Indicates the saved searches.
            */
          savedSearches: {
              type: Object,
              value: function () {
                  return {};
              },
              notify: true
          },

          // Indicates saved searches
          _allSavedSearches: {
              type: Object,
              value: function () { return { "favourites": {}, "my-searches": {}, "shared-searches": {} }; }
          },

          /**
            * <b><i>Content development is under progress... </b></i> 
            */
          allowCreateEditSearch: {
              type: Boolean,
              value: false
          },
          /**
            * <b><i>Content development is under progress... </b></i> 
            */
          showSettings: {
              type: Boolean,
              value: false
          },
          /**
            * <b><i>Content development is under progress... </b></i> 
            */
          noTabs: {
              type: Boolean,
              value: false
          },
          /**
            * <b><i>Content development is under progress... </b></i> 
            */
          showTitle: {
              type: Boolean,
              value: false
          },
          /**
            * <b><i>Content development is under progress... </b></i> 
            */
          initiateSearchRequestData: {
              type: Object,
              value: function () { return {}; }
          },
          /**
            * <b><i>Content development is under progress... </b></i> 
            */
          initiateSearchResponse: {
              type: Object,
              value: function () { return {}; },
              notify: true
          },
          /**
            * <b><i>Content development is under progress... </b></i> 
            */
          resultedEntities: {
              type: Object,
              value: function () { return []; },
              notify: true
          },
          /**
            * <b><i>Content development is under progress... </b></i> 
            */
          pageSize: {
              type: Number,
              value: 100
          },
          _originalSearches: {
              type: Array,
              value: function () { return []; }
          },
          _originalSearchMappings: {
              type: Array,
              value: function () { return []; }
          },
          /**
            * <b><i>Content development is under progress... </b></i> 
            */
          appName: {
              type: String,
              value: "app-entity-discovery"
          },
          _searchRequest: {
              type: Object,
              value: function () { return {}; }
          },
          _mappingRequest: {
              type: Object,
              value: function () { return {}; }
          },
          _toastMessage: {
              type: String,
              value: null
          },
          _searchInfo: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _isSearchRequestInProcess: {
              type: Boolean,
              value: false
          },
          roleIndex: {
              type: Number,
              value: 0
          }
      }
  }
  /**
  * Fired when the saved search is tapped in the 
  * saved search widget with the name as `rock-saved-search-click`. 
  * Here, data is the data of the clicked saved search.
  *
  * @event bedrock-event
  */

  /**
  * Fired when the user taps or clicks on the save button inside the `Create New Saved Search popover` 
  * with the name as "saved-search-save".
  *
  * @event bedrock-event	
  */
  /**
  * Indicates the config for the tabs.
  */


  connectedCallback() {
      super.connectedCallback();
      this.addEventListener('tag-item-select', this._onTagItemSelect);
  }

  disconnectedCallback() {
      super.disconnectedCallback();
      this.removeEventListener('tag-item-select', this._onTagItemSelect);
  }


  get rockTabs() {
      this._rockTabs = this._rockTabs || this.shadowRoot.querySelector('rock-tabs');
      return this._rockTabs;
  }

  _onContextDataChange (contextData, appName) {
      afterNextRender(this,()=>{
              if (contextData && !_.isEmpty(contextData) && appName != undefined) {
              let clonedContextData = DataHelper.cloneObject(this.contextData);
              let searchCtxData = DataHelper.cloneObject(this._prepareContext(clonedContextData));
              let mappingCtxData = DataHelper.cloneObject(this._prepareContext(clonedContextData, "searchmapping"));

              this._searchRequest = DataRequestHelper.createConfigInitialRequest(searchCtxData);
              this._mappingRequest = DataRequestHelper.createConfigInitialRequest(mappingCtxData);

              //Initial search for shared
              let request = DataHelper.cloneObject(this._searchRequest);
              if (!this._isSearchRequestInProcess) {
                  //Raise initial request for search and on search response raise for mappings
                  this._load = true;
                      timeOut.after(10).run(() => {
                              this.generateRequest(request);
                              this._isSearchRequestInProcess = true;
                      });
              }
          }
      });
  }

  //Prepare context for mappings
  _prepareContext (clonedContextData, type) {
      let context = {};
      let typesCriterion = [];
      let userContext = ContextHelper.getFirstUserContext(clonedContextData);

      if (type == "searchmapping" && userContext) {
          context = {
              "app": this.appName,
              "service": "_ALL",
              "component": "_ALL",
              "subComponent": "_ALL",
              "user": userContext.user,
              "role": userContext.defaultRole
          };
          typesCriterion.push("savedSearchMappings");
      }
      else {
          context = {
              "app": this.appName,
              "service": "_ALL",
              "component": "_ALL",
              "subComponent": "_ALL",
              "user": "all",
              "role": "all"
          };
          typesCriterion.push("savedSearch"); // , "workflowSavedSearch"
      }

      //Set context
      clonedContextData[ContextHelper.CONTEXT_TYPE_DATA] = [context];
      clonedContextData[ContextHelper.CONTEXT_TYPE_ITEM] = typesCriterion;

      return clonedContextData;
  }

  _triggerSearchTransform () {
      if (this._originalSearches && this._originalSearchMappings) {
          let userContext = ContextHelper.getFirstUserContext(this.contextData);
          this.savedSearches = DataTransformHelper.transformScopes(this._originalSearches, this._originalSearchMappings, userContext, "favoriteSavedSearches");
          this._onSavedSearchesChange();
      }
  }

  _onCreateEditSavedSearchTap (e) {
      this.noTabs = true;
     microTask.run(() => {
          //This is to execute the logic for all scenarios on create/edit link on-click
          this.shadowRoot.querySelector('rock-create-edit-saved-searches').OnCreateEditButtonClick();
     });
  }

  // Fired when rock-tabs creates component
  _onComponentCreating (e, detail, sender) {
      let component = detail.data;
      if (this.savedSearches) {
          component.properties["saved-searches"] = this.savedSearches;
          component.properties["context-data"] = this.contextData;
      }
  }

  /**
  * Fired when filter tag triggers a tag-item-select event.
  */
  _onTagItemSelect (e) {
      let eventName = "rock-saved-search-click";
      this.fireBedrockEvent(eventName, e.detail, { ignoreId: true });
  }

  // On saved searches change, populate searches and select respected search tab
  _onSavedSearchesChange () {
      this._populateAllSearches();
      if (this.savedSearchId && this.rockTabs) {
          let listName = this._getSearchListNameBySearchId();
          this.rockTabs.selectedTabIndex = tabs[listName];
      }
      this.reloadTabs();
  }

  reloadTabs() {
      this._debouncer = Debouncer.debounce(this._debouncer, timeOut.after(1000), () => {
          if(this.rockTabs) {
              this.rockTabs.readyToRender(true);
              this.rockTabs.reloadTabs();
          }
      });
  }

  // Populate all searches
  _populateAllSearches () {
      if (this.savedSearches) {
          this._populateSearchesByType(_mySearch);
          this._populateSearchesByType(_favSearch);
          this._populateSearchesByType(_sharedSearch);
      }
  }

  _populateSearchesByType(searchType) {
      if (this.savedSearches[searchType]) {
          for (let idx = 0, l = this.savedSearches[searchType].length; idx < l; idx++) {
              this._allSavedSearches[searchType][this.savedSearches[searchType][idx].id] = this.savedSearches[searchType][idx];
          }
      }
  }

  // Get search list name
  _getSearchListNameBySearchId () {
      if (this._allSavedSearches[_favSearch][this.savedSearchId]) {
          return _favSearch;
      }

      if (this._allSavedSearches[_mySearch][this.savedSearchId]) {
          return _mySearch;
      }

      if (this._allSavedSearches[_sharedSearch][this.savedSearchId]) {
          return _sharedSearch;
      }
  }
  /**
    * <b><i>Content development is under progress... </b></i> 
    */
  generateRequest (requestData) {
      if (requestData) {
          this.initiateSearchRequestData = requestData;
          this.shadowRoot.querySelector('#liqInitiateSearch').generateRequest();
      }
  }
  /**
    * <b><i>Content development is under progress... </b></i> 
    */
  generateNameSearchRequest (requestData) {
      if (requestData) {
          this.initiateNameSearchRequestData = requestData;
          this.shadowRoot.querySelector('#liqInitiateNameSearch').generateRequest();
      }
  }

  _onInitiateNameSearchResponse (e) {
      let totalRecords = this.initiateNameSearchResponse.content.totalRecords;
      let getDetailOptions = { 'from': 0, 'to': totalRecords };
      this._makeGetNameSearchResultDetailCall(getDetailOptions);
  }

  _makeGetNameSearchResultDetailCall (options) {
      let liqGetNameSearchResultDetail = this.shadowRoot.querySelector('#liqGetNameSearchResultDetail');

      let searchResultId = this.initiateNameSearchResponse.content.requestId;

      let reqData = this.initiateNameSearchRequestData;
      reqData.params.options = options;

      liqGetNameSearchResultDetail.requestId = searchResultId;
      liqGetNameSearchResultDetail.requestData = reqData;

      liqGetNameSearchResultDetail.generateRequest();
  }

  _onGetNameSearchResultDetailResponse (e, detail) {

      let type = this._searchInfo.type;
      let searchInfo = this._searchInfo.details;

      //Compare search name and display toast message based on that
      if (DataHelper.isValidObjectPath(detail, "response.content.configObjects")) {
          let searchItems = detail.response.content.configObjects;

          const _error = () => this.showWarningToast("Search name is already exists, create search with different name.");

          if (searchItems.length > 0 && type == "create") {
              return _error();
          }
          
          for (let i = 0; i < searchItems.length; i++) {
              if (searchItems[i] && searchItems[i].id != searchInfo["saved-search-info"].selectedSearch.searchid) {
                  return _error();
              }
          }
      }

      //Prepare request
      if (type == "create") {
          let clonedContextData = DataHelper.cloneObject(this.contextData);
          let savedSearchContextName = this._getSavedSearchContextName(searchInfo["saved-search-info"].name);

          let _createRequestData = DataRequestHelper.getConfigCreateRequest(this._prepareCreateContext(clonedContextData, searchInfo), "savedSearch", this.appName, savedSearchContextName);

          let reqData = { "configObjects": [_createRequestData] }
          this.generateSaveRequest(reqData, "create");
          this._toastMessage = searchInfo["saved-search-info"].name + " is saved successfully";
      }
      //update
      else {
          let selectedSearch = searchInfo["saved-search-info"].selectedSearch;
          let originalSearch = {};
          //Find original search based on searchInfo - _originalSearches
          for (let i = 0; i < this._originalSearches.length; i++) {
              if (!this._originalSearches[i].data) {
                  continue; //next search
              }

              let originalName = this._originalSearches[i].data.contexts[0].jsonData.config.searchname;
              if (originalName == selectedSearch.searchname) {
                  originalSearch = this._originalSearches[i];
                  break;
              }
          }

          this._setSearchDetailsForUpdate(originalSearch, searchInfo);

          let reqData = { "configObjects": [originalSearch] }
          this.generateSaveRequest(reqData, "update");
          this._toastMessage = searchInfo["saved-search-info"].name + " is updated";
      }
  }

  _setSearchDetailsForUpdate (originalSearch, searchInfo) {
      let userContext = ContextHelper.getFirstUserContext(this.contextData);
      let user = this._getUserRolePerAccessType(searchInfo["saved-search-info"], userContext);

      // Original search details updated based on the changes
      originalSearch.name = this._getSavedSearchContextName(searchInfo["saved-search-info"].name);

      const { jsonData, context } = originalSearch.data.contexts[0];
      jsonData.config.name = searchInfo["saved-search-info"].name;
      jsonData.config.accesstype = searchInfo["saved-search-info"].accesstype;
      jsonData.config.dimensions = searchInfo["dimensions"];
      jsonData.config.displayQuery = searchInfo["display-query"];
      jsonData.config.internalQuery = searchInfo["internal-query"];
      jsonData.config.governData = searchInfo["govern-data"];
      context.user = user.user;
      context.role = user.defaultRole;
  }

  _onInitiateSearchResponse (e) {
      let totalRecords = this.initiateSearchResponse.content.totalRecords;
      let getDetailOptions = { 'from': 0, 'to': totalRecords };
      this._makeGetSearchResultDetailCall(getDetailOptions);
  }

  _makeGetSearchResultDetailCall (options) {
      let liqGetSearchResultDetail = this.shadowRoot.querySelector('#liqGetSearchResultDetail');

      let searchResultId = this.initiateSearchResponse.content.requestId;

      let reqData = this.initiateSearchRequestData;
      reqData.params.options = options;
      liqGetSearchResultDetail.requestId = searchResultId;
      liqGetSearchResultDetail.requestData = reqData;

      liqGetSearchResultDetail.generateRequest();
  }

  _onGetSearchResultDetailResponse (e) {
      let requestType;
      let userContext = ContextHelper.getFirstUserContext(this.contextData);
      if (DataHelper.isValidObjectPath(e, "detail.request.requestData.params.query.filters.typesCriterion")) {
          requestType = e.detail.request.requestData.params.query.filters.typesCriterion[0];
      }
      let numberOfRoles = 0;
      if(userContext.roles && userContext.roles.length > 0){
          numberOfRoles = userContext.roles.length;
      }
      //Transform data and keep the data in savedSearches
      if (e.detail.response &&
          e.detail.response.status == "success" &&
          e.detail.response.content &&
          e.detail.response.content.configObjects) {
          if (requestType == "savedSearchMappings") {
              //reset
              if (this.roleIndex == 0){//Initial response, so reset searches
                  this._originalSearchMappings = [];
              }
              this._originalSearchMappings.push.apply(this._originalSearchMappings, e.detail.response.content.configObjects);
              if(this.roleIndex < numberOfRoles){
                  this.roleIndex++;
                  let request = DataHelper.cloneObject(this._searchRequest);
                  request.params.query.contexts[0].user =  userContext.user;
                  request.params.query.contexts[0].role = userContext.roles[this.roleIndex];
                  this.generateRequest(request);
              }else{
                  this.roleIndex = 0;
                  this._triggerSearchTransform();
                  this._isSearchRequestInProcess = false;
              }
          }
          else {
              if (DataHelper.isValidObjectPath(e, "detail.request.requestData.params.query.contexts")) {
                  let context = e.detail.request.requestData.params.query.contexts[0];
                  let request = DataHelper.cloneObject(this._searchRequest);

                  if (this.roleIndex == 0 && context.user == "all") { //Initial response, so reset searches
                      this._originalSearches = [];
                  }

                  this._originalSearches.push.apply(this._originalSearches, e.detail.response.content.configObjects);

                  if (context.user == "all") {
                      //generate request for role
                      request.params.query.contexts[0].user = "role";
                      request.params.query.contexts[0].role = userContext.roles[this.roleIndex];
                  }
                  else if (context.user == "role") {
                      //generate request for individual user
                      request.params.query.contexts[0].user = userContext.user;
                      request.params.query.contexts[0].role = e.detail.request.requestData.params.query.contexts[0].role;
                  }else{
                      //generate request for mapping
                      let mappingRequest = DataHelper.cloneObject(this._mappingRequest);
                      mappingRequest.params.query.contexts[0].role = e.detail.request.requestData.params.query.contexts[0].role;

                      if (DataHelper.isValidObjectPath(mappingRequest, "params.options")) {
                          delete this._mappingRequest.params.options;
                      }
                      this.generateRequest(mappingRequest);
                      return;
                  }

                  this.generateRequest(request);
              }
          }
      }
  }

  _onTapSavedSearchFavourite (e, detail, sender) {
      let foundInFav = false;
      let tag = detail.parentButton;

      // If mappings available then update
      if (this._originalSearchMappings && this._originalSearchMappings.length > 0) {
          let favourites = this._originalSearchMappings[0].data.contexts[0].jsonData.config.favoriteSavedSearches;

          for (let i = 0; i < favourites.length; i++) {
              if (favourites[i] == tag.searchname) {
                  favourites.splice(i, 1);
                  foundInFav = true;
                  this._toastMessage = tag.name + " is removed from favourites";
                  break;
              }
          }

          if (!foundInFav) //Its not fav, then make it fav now
          {
              favourites.push(tag.searchname);
              this._toastMessage = tag.name + " is added to favourites";
          }

          let reqData = { "configObjects": [this._originalSearchMappings[0]] } //Mapping have only one record
          this.generateSaveRequest(reqData, "update");
      }
      else // When no mapping, then create request and submit
      {
          let clonedContextData = DataHelper.cloneObject(this.contextData);
          let createMappingRequestData = DataRequestHelper.getConfigCreateRequest(this._prepareCreateMappingContext(clonedContextData, tag), "savedSearchMappings", this.appName);

          let reqData = { "configObjects": [createMappingRequestData] }
          this.generateSaveRequest(reqData, "create");
          this._toastMessage = tag.name + " is added to favourites";
      }
  }

  _onTapSavedSearchDelete (e, detail, sender) {
      let savedSearchDeleteObj = {
          "id": detail.parentButton.searchid,
          "type": "savedSearch"
      }
      let reqData = { "configObjects": [savedSearchDeleteObj] }
      this.generateSaveRequest(reqData, "delete");

      this._toastMessage = detail.parentButton.name + " has been deleted";
  }

  // Can be used to generate the save requests.
  generateSaveRequest (reqData, operation) {
      let configSaveService = this.shadowRoot.querySelector('[name="configSaveService"]');

      if (configSaveService) {
          configSaveService.operation = operation;
          configSaveService.requestData = reqData;
          configSaveService.generateRequest();
      }
  }

  _onSaveSearchResponse (e) {
      this._originalSearchMappings = [];
      this._originalSearches = [];

      if (this._toastMessage) {
          this.showSuccessToast(this._toastMessage);
          this._toastMessage = "";
      }

      if (DataHelper.isValidObjectPath(this._searchRequest, "params.options")) {
          delete this._searchRequest.params.options;
      }
      setTimeout(() => {
          this.generateRequest(this._searchRequest);
      }, 0); //Todo - This async will be removed once Notification is integrated
  }

  // Can be used to create and update the saved search.
  createUpdateSavedSearch (searchInfo, type) {

      this._searchInfo = {
          "details": searchInfo,
          "type": type
      };

      let request = DataHelper.cloneObject(this._searchRequest);
      request.params.query.name = this._getSavedSearchContextName(searchInfo["saved-search-info"].name);
      delete request.params.query.contexts[0].user;
      delete request.params.query.contexts[0].role;

      this.generateNameSearchRequest(request);
  }

  // Context for create saved search
  _prepareCreateContext (_clonedContextData, searchInfo) {
      let userContext = ContextHelper.getFirstUserContext(_clonedContextData);
      let user = this._getUserRolePerAccessType(searchInfo["saved-search-info"], userContext);
      let context = {
          "app": this.appName,
          "service": "_ALL",
          "component": "_ALL",
          "subComponent": "_ALL",
          "user": user.user,
          "role": user.defaultRole
      };

      let data = {
          "config": {
              "id": ElementHelper.getRandomString(),
              "accesstype": searchInfo["saved-search-info"].accesstype,
              "name": searchInfo["saved-search-info"].name,
              "icon": "pebble-icon:saved-search",
              "createdby": userContext.user,
              "createdbyrole": userContext.defaultRole,
              "ownershipData": userContext.ownershipData,
              "dimensions": searchInfo["dimensions"],
              "displayQuery": searchInfo["display-query"],
              "internalQuery": searchInfo["internal-query"],
              "governData": searchInfo["govern-data"]
          }
      };

      return this._prepareContextData(_clonedContextData, context, data);
  }

  _prepareContextData(clonedContextData, context, data) {
      let _contextsObject = {
          "context": context,
          "jsonData": data
      }

      //Set context
      clonedContextData[ContextHelper.CONTEXT_TYPE_DATA] = [_contextsObject];

      return clonedContextData;
  }

  _getSavedSearchContextName (searchName) {
      if (searchName && searchName.trim().length > 0) {
          return "savedsearch_" + searchName.replace(/\s/g, '').toLowerCase();
      }
  }

  _getUserRolePerAccessType (searchInfo, userContext) {

      if (!searchInfo || !userContext) {
          return;
      }

      if (searchInfo.accesstype) {
          let user = userContext.user;
          let role = userContext.defaultRole;

          if (searchInfo.accesstype == "_ALL") {
              user = "all"; // all users
              role = "all"; // any role
          }
          else if (searchInfo.accesstype == "_ROLE") {
              user = "role"; // role based users
          }

          return {
              "user": user,
              "defaultRole": role
          };
      }
  }

  // Context for create mappings
  _prepareCreateMappingContext (clonedContextData, tag) {
      let userContext = ContextHelper.getFirstUserContext(clonedContextData);
      let context = {
          "app": this.appName,
          "service": "_ALL",
          "component": "_ALL",
          "subComponent": "_ALL",
          "role": userContext.defaultRole,
          "user": userContext.user
      };

      let data = {
          "config": {
              "favoriteSavedSearches": [tag.searchname]
          }
      };

      return this._prepareContextData(clonedContextData, context, data);
  }

  refresh () {
      let request = DataHelper.cloneObject(this._searchRequest);
      if (!this._isSearchRequestInProcess) {
          this.generateRequest(request);
          this._isSearchRequestInProcess = true;
      }
  }
}
customElements.define(RockSavedSearches.is, RockSavedSearches);
