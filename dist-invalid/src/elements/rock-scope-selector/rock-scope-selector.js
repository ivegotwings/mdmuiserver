/**
`rock-scope-selector` Represents an element that displays the scopes.

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
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-helpers/data-request-helper.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../bedrock-style-manager/styles/bedrock-style-floating.js';
import '../liquid-config-get/liquid-config-get.js';
import '../liquid-config-save/liquid-config-save.js';
import '../pebble-icons/pebble-icons.js';
import '../pebble-button/pebble-button.js';
import '../pebble-horizontal-divider/pebble-horizontal-divider.js';
import '../pebble-popover/pebble-popover.js';
import '../pebble-spinner/pebble-spinner.js';
import '../rock-tabs/rock-tabs.js';
import './rock-scope-tags.js';
import './rock-scope-create-edit.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
let tabScopes = {
    "favScope": {
        "name": "favourites",
        "index": 0
    },
    "myScope": {
        "name": "my-scopes",
        "index": 1
    },
    "sharedScope": {
        "name": "shared-scopes",
        "index": 2
    }
}

let scopeTypeName = "scope";
let scopeMappingsTypeName = "scopeMappings";
let favScopesName = "favouriteScopes"
class RockScopeSelector extends mixinBehaviors([RUFBehaviors.UIBehavior], OptionalMutableData(
    PolymerElement)) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-tooltip bedrock-style-floating bedrock-style-icons bedrock-style-padding-margin">
            #newScope {
                font-weight: var(--font-bold, bold);
                line-height: 14px;
            }

            #manageScope {
                float: right;
                margin-right: 10px;
                line-height: 10px;
                height: auto;
                --pebble-button: {
                    font-size: var(--font-size-sm, 12px) !important;
                    color: var(--link-text-color, #036Bc3) !important;
                    font-weight: 500;
                    padding-top: 0;
                    padding-right: 0;
                    padding-bottom: 0;
                    padding-left: 0;
                }
                ;
                --pebble-icon-dimension: {
                    width: 12px;
                    height: 12px;
                }
                ;
                --pebble-icon-color: {
                    fill: var(--palette-cerulean-two, #026bc3);
                }
            }

            pebble-horizontal-divider {
                --pebble-horizontal-divider-color: #ccc;
            }

            .scopeLabel {
                color: var(--title-text-color, #191e22);
                font-weight: var(--font-bold, bold);
                font-size: var(--default-font-size, 14px);
                display: inline-block;
            }

            rock-tabs {
                --pebble-tab-group: {
                    margin-bottom: 10px;
                    width: 100%;
                }
                ;
                --pebble-tab: {
                    margin-left: 0;
                }
                ;
            }

            rock-tabs {
                --rock-tab-content: {
                    max-height: 80px;
                    overflow-y: auto;
                }
                ;
            }

            #scopePopover {
                width: 400px;
                max-height: none !important;
                --pebble-popover-max-width: 100%;
                --pebble-popover-max-height: 360px;
                overflow: auto;
            }
        </style>
        <!--Liquid start-->
        <liquid-config-get id="liqInitiateScope" operation="initiatesearch" request-data="{{initiateScopeRequestData}}" last-response="{{initiateScopeResponse}}" on-response="_onInitiateScopeResponse">
        </liquid-config-get>
        <liquid-config-get id="liqGetScopeResultDetail" operation="getsearchresultdetail" on-response="_onGetScopeResultDetailResponse">
        </liquid-config-get>

        <liquid-config-get id="liqInitiateNameScope" operation="initiatesearch" request-data="{{initiateNameScopeRequestData}}" last-response="{{initiateNameScopeResponse}}" on-response="_onInitiateNameScopeResponse">
        </liquid-config-get>
        <liquid-config-get id="liqGetNameScopeResultDetail" operation="getsearchresultdetail" on-response="_onGetNameScopeResultDetailResponse">
        </liquid-config-get>

        <liquid-config-save name="configSaveService" on-response="_onSaveScopeResponse"></liquid-config-save>
        <!--Liquid end-->
        <bedrock-pubsub event-name="component-creating" handler="_onComponentCreating"></bedrock-pubsub>
        <bedrock-pubsub event-name="favourite-scope" handler="_onTapScopeFavourite" target-id=""></bedrock-pubsub>
        <bedrock-pubsub event-name="delete-scope" handler="_onTapScopeDelete" target-id=""></bedrock-pubsub>
        <bedrock-pubsub event-name="edit-scope" handler="_onTapScopeEdit" target-id=""></bedrock-pubsub>
        <bedrock-pubsub event-name="actions-parent-button-tap" handler="_onTagItemSelect" target-id=""></bedrock-pubsub>
        <!--Title, Settings and Create/Edit link-->
        <div id="newScope" class="clearfix">
            <template is="dom-if" if="[[showTitle]]">
                <div class="scopeLabel">[[title]]</div>
            </template>
            <template is="dom-if" if="[[showSettings]]">
                <pebble-icon id="refreshButton" icon="pebble-icon:refresh" title="Refresh" class="pebble-icon-color-blue pebble-icon-size-16 pull-right" on-tap="refresh"></pebble-icon>
            </template>
            <template is="dom-if" if="[[allowManageScope]]">
                <pebble-button id="manageScope" icon="pebble-icon:action-add" button-text="Create or Edit Scope Selection" noink="" class="createEditSavedSearch icon" on-tap="_onManageScopeTap"></pebble-button>
            </template>
        </div>
        <pebble-spinner active="[[_loading]]"></pebble-spinner>
        <!--Tabs section-->
        <rock-tabs id="rock-scope-tabs" config="[[tabConfig]]" selected-tab="{{_selectedTab}}"></rock-tabs>
        <!--Create/Update section-->
        <pebble-popover id="scopePopover" class="p-r-20 p-l-20" for="manageScope" no-overlap="" horizontal-align="right">
            <rock-scope-create-edit scope-id="[[scopeId]]" scopes="[[scopes]]"></rock-scope-create-edit>
        </pebble-popover>
        <bedrock-pubsub event-name="save-scope" handler="_onSaveScope"></bedrock-pubsub>
        <bedrock-pubsub event-name="cancel-scope" handler="_onCancelScope"></bedrock-pubsub>
`;
  }

  static get is() {
      return "rock-scope-selector";
  }
  static get properties() {
      return {
          /**
           * Indicates the config for the tabs.
           */
          tabConfig: {
              type: Object,
              notify: true,
              value: function () {
                  return {
                      "scrollable": false,
                      "tabItems": [{
                              "name": "favourite-scopes",
                              "title": "Favourites",
                              "selected": true,
                              "enableDropdownMenu": false,
                              "component": {
                                  "name": "rock-scope-tags",
                                  "path": "/src/elements/rock-scope-selector/rock-scope-tags.html",
                                  "properties": {
                                      "scope-category": "favourites"
                                  }
                              }
                          },
                          {
                              "name": "my-scopes",
                              "title": "My Scope Selections",
                              "enableDropdownMenu": false,
                              "component": {
                                  "name": "rock-scope-tags",
                                  "path": "/src/elements/rock-scope-selector/rock-scope-tags.html",
                                  "properties": {
                                      "scope-category": "my-scopes"
                                  }
                              }
                          },
                          {
                              "name": "shared-scopes",
                              "title": "Shared Scope Selections",
                              "enableDropdownMenu": false,
                              "component": {
                                  "name": "rock-scope-tags",
                                  "path": "/src/elements/rock-scope-selector/rock-scope-tags.html",
                                  "properties": {
                                      "scope-category": "shared-scopes"
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

          _loading: {
              type: Boolean,
              value: false
          },

          /**
           * Indicates the scope identification which the consumer selects.
           */
          scopeId: {
              type: Number,
              value: null,
              notify: true
          },

          /**
           * Indicates scopes.
           */
          scopes: {
              type: Object,
              value: function () {
                  return {};
              },
              notify: true,
              observer: '_onScopesChange'
          },

          _allScopes: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          // Selected tab details
          _selectedTab: {
              type: Object,
              value: function () {
                  return {};
              },
              notify: true,
              observer: '_onSelectedTabChange'
          },

          /**
           * <b><i>Content development is under progress... </b></i>
           */
          allowManageScope: {
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
          showTitle: {
              type: Boolean,
              value: false
          },

          title: {
              type: String,
              value: "Quick Select"
          },

          /**
           * <b><i>Content development is under progress... </b></i>
           */
          initiateScopeRequestData: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          /**
           * <b><i>Content development is under progress... </b></i>
           */
          initiateScopeResponse: {
              type: Object,
              value: function () {
                  return {};
              },
              notify: true
          },

          /**
           * <b><i>Content development is under progress... </b></i>
           */
          pageSize: {
              type: Number,
              value: 100
          },

          _originalScopes: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          _originalScopeMappings: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          /**
           * <b><i>Content development is under progress... </b></i>
           */
          appName: {
              type: String,
              value: "app-entity-discovery"
          },

          _scopeRequest: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          _mappingRequest: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          _toastMessage: {
              type: String,
              value: null
          },

          _scopeInfo: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          selectedScope: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          roleIndex: {
              type: Number,
              value: 0
          },

          // hide icons in scope selection
          scopeTagsActionsSettings: {
              type: Object,
              value: function () {
                  return {};
              }
          }
      }
  }
  connectedCallback() {
      super.connectedCallback();
      this.addEventListener('tag-item-select', this._onTagItemSelect);
  }
  disconnectedCallback() {
      super.disconnectedCallback();
      this.removeEventListener('tag-item-select', this._onTagItemSelect);
  }
  static get observers() {
      return [
          '_onContextDataChange(contextData, appName)'
      ]
  }
  ready() {
      super.ready();
      let scopeTagsActionsSettings = this.scopeTagsActionsSettings;
      if (!_.isEmpty(scopeTagsActionsSettings)) {
          let tabConfig = this.tabConfig;

          if (!_.isEmpty(tabConfig)) {
              let tabItems = tabConfig.tabItems;

              if (tabItems && tabItems.length) {
                  tabItems.forEach(tabItem => {
                      if (tabItem && DataHelper.isValidObjectPath(tabItem,
                              "component.properties")) {
                          // add scope-tags-actions-settings
                          tabItem.component.properties["scope-tags-actions-settings"] =
                              scopeTagsActionsSettings;
                      }
                  });
              }

              this.set('tabConfig', "");
              this.set('tabConfig', tabConfig);
          }
      }
  }

  _onContextDataChange() {
      if (this.contextData && !_.isEmpty(this.contextData)) {
          this._setLoading(true);
          let clonedContextData = DataHelper.cloneObject(this.contextData);
          let scopeCtxData = DataHelper.cloneObject(this._prepareContext(clonedContextData));
          let mappingCtxData = DataHelper.cloneObject(this._prepareContext(clonedContextData,
              "scopemappings"));

          this._scopeRequest = DataRequestHelper.createConfigInitialRequest(scopeCtxData);
          this._mappingRequest = DataRequestHelper.createConfigInitialRequest(mappingCtxData);

          //Initial scope for shared
          let request = DataHelper.cloneObject(this._scopeRequest);
          //Raise initial request for scopes and on scopes response raise request for mappings
          this.generateRequest(request);
      }
  }

  //Prepare context for mappings
  _prepareContext(clonedContextData, type) {
      let context = {};
      let typesCriterion = [];
      let userContext = ContextHelper.getFirstUserContext(clonedContextData);

      if (type == "scopemappings" && userContext) {
          context = {
              "app": this.appName,
              "service": "_ALL",
              "component": "_ALL",
              "subComponent": "_ALL",
              "user": userContext.user,
              "role": userContext.defaultRole
          };
          typesCriterion.push(scopeMappingsTypeName);
      } else {
          context = {
              "app": this.appName,
              "service": "_ALL",
              "component": "_ALL",
              "subComponent": "_ALL",
              "user": "all",
              "role": "all"
          };
          typesCriterion.push(scopeTypeName);
      }

      //Set context
      clonedContextData[ContextHelper.CONTEXT_TYPE_DATA] = [context];
      clonedContextData[ContextHelper.CONTEXT_TYPE_ITEM] = typesCriterion;

      return clonedContextData;
  }

  _triggerScopeTransform() {
      if (this._originalScopes && this._originalScopeMappings) {
          let userContext = ContextHelper.getFirstUserContext(this.contextData);
          this.scopes = DataTransformHelper.transformScopes(this._originalScopes, this._originalScopeMappings,
              userContext, favScopesName, "scope");

          this.async(function () {
              //Reload tabs to get updated tags
              let tabs = this.shadowRoot.querySelector("rock-tabs");
              if (tabs) {
                  tabs.readyToRender(true);
                  tabs.reloadTabs();
              }
              this.fireBedrockEvent("rock-scope-loaded", {}, {
                  ignoreId: true
              });

              this._setLoading(false);
          });
      }
  }

  _onManageScopeTap(e) {
      this.shadowRoot.querySelector("#scopePopover").show();
      this.async(function () {
          //This is to execute the logic for all scenarios on create/edit link on-click
          this.shadowRoot.querySelector('rock-scope-create-edit').OnCreateEditButtonClick();
      });
      this.fireBedrockEvent("rock-scope-create-edit-clicked", {}, {
          "ignoreId": true
      });
  }

  // Fired when rock-tabs creates component
  _onComponentCreating(e, detail, sender) {
      let component = detail.data;
      component.properties["context-data"] = this.contextData;
      if (!_.isEmpty(this.scopes)) {
          component.properties["scopes"] = this.scopes;
      }
  }

  /**
   * Fired when filter tag triggers a tag-item-select event.
   */
  _onTagItemSelect(e) {
      let eventName = "rock-scope-click";
      let eventDetail = {
          data: e.detail
      }
      this.fireBedrockEvent(eventName, eventDetail, {
          ignoreId: true
      });
  }

  // On tab change populate scopes
  _onSelectedTabChange() {
      let tabs = this.shadowRoot.querySelector('rock-tabs');
      // if (tabs) {
      //     this.async(function () {
      //         tabs.shadowRoot.querySelector('pebble-tab-group').notifyResize();
      //     }, 600); //Delayed to populate the tabs properly
      // }
  }

  // On scope change, populate scopes and select respected scope tab
  _onScopesChange() {
      this._populateAllScopes();
      let tabs = this.shadowRoot.querySelector('rock-tabs');

      if (this.scopeId && tabs) {
          let listName = this._getScopeListNameByScopeId();
          tabs.selectedTabIndex = tabScopes[listName].index;
      }
      if (tabs) {
          tabs.readyToRender(true);
          tabs.reloadTabs();
      }
  }

  // Populate all scopes
  _populateAllScopes() {
      if (!_.isEmpty(this.scopes)) {
          for (let key in tabScopes) {
              let currentScope = tabScopes[key];
              if (!this._allScopes[currentScope.name]) {
                  this._allScopes[currentScope.name] = {};
              }

              for (let idx = 0; idx < this.scopes[currentScope.name].length; idx++) {
                  this._allScopes[currentScope.name][this.scopes[currentScope.name][idx].id] = this.scopes[
                      currentScope.name][idx];
              }
          }
      }
  }

  // Get scope list name
  _getScopeListNameByScopeId() {
      for (let key in tabScopes) {
          let currentScope = tabScopes[key];
          if (this._allScopes[currentScope.name][this.scopeId]) {
              return key;
          }
      }
  }
  /**
   * <b><i>Content development is under progress... </b></i>
   */
  generateRequest(requestData) {
      if (requestData) {
          this.initiateScopeRequestData = requestData;
          this.shadowRoot.querySelector('#liqInitiateScope').generateRequest();
      }
  }
  /**
   * <b><i>Content development is under progress... </b></i>
   */
  generateNameScopeRequest(requestData) {
      if (requestData) {
          this.initiateNameScopeRequestData = requestData;
          this.shadowRoot.querySelector('#liqInitiateNameScope').generateRequest();
      }
  }

  _onInitiateNameScopeResponse(e) {
      let totalRecords = this.initiateNameScopeResponse.content.totalRecords;
      let getDetailOptions = {
          'from': 0,
          'to': totalRecords
      };
      this._makeGetNameScopeResultDetailCall(getDetailOptions);
  }

  _makeGetNameScopeResultDetailCall(options) {
      let liqGetNameScopeResultDetail = this.shadowRoot.querySelector('#liqGetNameScopeResultDetail');

      let searchResultId = this.initiateNameScopeResponse.content.requestId;

      let reqData = this.initiateNameScopeRequestData;
      reqData.params.options = options;

      liqGetNameScopeResultDetail.requestId = searchResultId;
      liqGetNameScopeResultDetail.requestData = reqData;

      liqGetNameScopeResultDetail.generateRequest();
  }

  _onGetNameScopeResultDetailResponse(e, detail) {

      let type = this._scopeInfo.type;
      let scopeInfo = this._scopeInfo.details;

      //Compare scope name and display toast message based on that
      if (DataHelper.isValidObjectPath(detail, "response.content.configObjects")) {
          let scopeItems = detail.response.content.configObjects;

          const _error = () => {
              this._setLoading(false);
              this.showWarningToast(
                  "Scope name already exists, create scope with a different name.");
          };

          if (scopeItems.length > 0 && type == "create") {
              return _error();
          }
          for (let i = 0; i < scopeItems.length; i++) {
              if (scopeItems[i] && scopeItems[i].id != scopeInfo["scope-info"].selectedScope.scopeid) {
                  return _error();
              }
          }
      }

      //Prepare request
      if (type == "create") {
          let clonedContextData = DataHelper.cloneObject(this.contextData);
          let scopeContextName = this._getScopeContextName(scopeInfo["scope-info"].name);

          let _createRequestData = DataRequestHelper.getConfigCreateRequest(this._prepareCreateContext(
              clonedContextData, scopeInfo), scopeTypeName, this.appName, scopeContextName);

          let reqData = {
              "configObjects": [_createRequestData]
          }
          this.generateSaveRequest(reqData, "create");
          this._toastMessage = scopeInfo["scope-info"].name + " is saved successfully";
      }
      //update
      else {
          let selectedScope = scopeInfo["scope-info"].selectedScope;
          let originalScope = {};
          //Find original scope based on scopeInfo - _originalScopes
          for (let i = 0; i < this._originalScopes.length; i++) {
              if (!this._originalScopes[i].data) {
                  continue; //next scope
              }

              let originalName = this._originalScopes[i].data.contexts[0].jsonData.config.scopename;
              if (originalName == selectedScope.scopename) {
                  originalScope = this._originalScopes[i];
                  break;
              }
          }

          this._setScopeDetailsForUpdate(originalScope, scopeInfo);

          let reqData = {
              "configObjects": [originalScope]
          }

          this.generateSaveRequest(reqData, "update");
          this._toastMessage = scopeInfo["scope-info"].name + " is updated";
      }
  }

  _setScopeDetailsForUpdate(originalScope, scopeInfo) {
      let userContext = ContextHelper.getFirstUserContext(this.contextData);
      let user = this._getUserRolePerAccessType(scopeInfo["scope-info"], userContext);

      // Original scope details updated based on the changes
      originalScope.name = this._getScopeContextName(scopeInfo["scope-info"].name);
      originalScope.data.contexts[0].jsonData.config.name = scopeInfo["scope-info"].name;
      originalScope.data.contexts[0].jsonData.config.accesstype = scopeInfo["scope-info"].accesstype;
      originalScope.data.contexts[0].jsonData.config.scope = scopeInfo["scope"];
      delete originalScope.data.contexts[0].jsonData.config.scopename;
      delete originalScope.data.contexts[0].jsonData.config.scopeid;
      originalScope.data.contexts[0].context.user = user.user;
      originalScope.data.contexts[0].context.role = user.defaultRole;
  }

  _onInitiateScopeResponse(e) {
      let totalRecords = this.initiateScopeResponse.content.totalRecords;
      let getDetailOptions = {
          'from': 0,
          'to': totalRecords
      };
      this._makeGetScopeResultDetailCall(getDetailOptions);
  }

  _makeGetScopeResultDetailCall(options) {
      let liqGetScopeResultDetail = this.shadowRoot.querySelector('#liqGetScopeResultDetail');

      let searchResultId = this.initiateScopeResponse.content.requestId;

      let reqData = this.initiateScopeRequestData;
      reqData.params.options = options;

      liqGetScopeResultDetail.requestId = searchResultId;
      liqGetScopeResultDetail.requestData = reqData;

      liqGetScopeResultDetail.generateRequest();
  }

  _onGetScopeResultDetailResponse(e) {
      let requestType;
      if (DataHelper.isValidObjectPath(e,
              "detail.request.requestData.params.query.filters.typesCriterion")) {
          requestType = e.detail.request.requestData.params.query.filters.typesCriterion[0];
      }
      let userContext = ContextHelper.getFirstUserContext(this.contextData);
      let numberOfRoles = 0;
      if (userContext.roles && userContext.roles.length > 0) {
          numberOfRoles = userContext.roles.length
      }
      let userRoles = DataHelper.getUserRoles();
      //Transform data and keep the data in scopes
      if (e.detail.response &&
          e.detail.response.status == "success" &&
          e.detail.response.content &&
          e.detail.response.content.configObjects) {
          if (requestType == scopeMappingsTypeName) {
              if (this.roleIndex == 0) { //Initial response, so reset searches
                  this._originalScopeMappings = [];
              }
              this._originalScopeMappings.push.apply(this._originalScopeMappings, e.detail.response.content
                  .configObjects);
              if (this.roleIndex < numberOfRoles) {
                  this.roleIndex++;
                  let request = DataHelper.cloneObject(this._scopeRequest);
                  request.params.query.contexts[0].user = userContext.user;
                  request.params.query.contexts[0].role = userContext.roles[this.roleIndex];
                  this.generateRequest(request);
              } else {
                  this.roleIndex = 0;
                  this._triggerScopeTransform();
              }
          } else {
              if (DataHelper.isValidObjectPath(e, "detail.request.requestData.params.query.contexts")) {
                  let context = e.detail.request.requestData.params.query.contexts[0];
                  let request = DataHelper.cloneObject(this._scopeRequest);

                  if (context.user == "all") //Initial response, so reset scopes
                  {
                      this._originalScopes = [];
                  }

                  this._originalScopes.push.apply(this._originalScopes, e.detail.response.content.configObjects);

                  if (context.user == "all") {
                      //generate request for role
                      request.params.query.contexts[0].user = "role";
                      request.params.query.contexts[0].role = userContext.roles[this.roleIndex];
                  } else if (context.user == "role") {
                      //generate request for individual user
                      request.params.query.contexts[0].user = userContext.user;
                      request.params.query.contexts[0].role = e.detail.request.requestData.params.query
                          .contexts[0].role;
                  } else {
                      //generate request for mapping
                      let mappingRequest = DataHelper.cloneObject(this._mappingRequest);
                      mappingRequest.params.query.contexts[0].role = e.detail.request.requestData.params
                          .query.contexts[0].role;

                      if (DataHelper.isValidObjectPath(mappingRequest, "params.options")) {
                          delete this._mappingRequest.params.options;
                      }
                      this.generateRequest(this._mappingRequest);
                      return;
                  }

                  this.generateRequest(request);
              }
          }
      }
  }

  _onTapScopeFavourite(e, detail, sender) {
      let foundInFav = false;
      let tag = detail.parentButton;
      this._setLoading(true);
      let actionsPopover = e.target.querySelector("#actionsPopover");
      if (actionsPopover) {
          actionsPopover.hide();
      }

      // If mappings available then update
      if (this._originalScopeMappings && this._originalScopeMappings.length > 0) {
          let favourites = this._originalScopeMappings[0].data.contexts[0].jsonData.config[
              favScopesName];

          for (let i = 0; i < favourites.length; i++) {
              if (favourites[i] == tag.scopename) {
                  favourites.splice(i, 1);
                  foundInFav = true;
                  this._toastMessage = tag.name + " is removed from favourites";
                  break;
              }
          }

          if (!foundInFav) //Its not fav, then make it fav now
          {
              favourites.push(tag.scopename);
              this._toastMessage = tag.name + " is added to favourites";
          }

          let reqData = {
              "configObjects": [this._originalScopeMappings[0]]
          } //Mapping have only one record
          this.generateSaveRequest(reqData, "update");
      } else // When no mapping, then create request and submit
      {
          let clonedContextData = DataHelper.cloneObject(this.contextData);
          let createMappingRequestData = DataRequestHelper.getConfigCreateRequest(this._prepareCreateMappingContext(
              clonedContextData, tag), scopeMappingsTypeName, this.appName);

          let reqData = {
              "configObjects": [createMappingRequestData]
          }
          
          this.generateSaveRequest(reqData, "create");
          this._toastMessage = tag.name + " is added to favourites";
      }
  }

  _onTapScopeDelete(e, detail, sender) {
      this._setLoading(true);
      this._hideActionPopover(e);

      let scopeDeleteObj = {
          "id": detail.parentButton.scopeid,
          "type": scopeTypeName
      }
      let reqData = {
          "configObjects": [scopeDeleteObj]
      }
      this.generateSaveRequest(reqData, "delete");

      this._toastMessage = detail.parentButton.name + " has been deleted";
  }

  _onTapScopeEdit(e, detail, sender) {
      let eventName = "rock-scope-edit";
      this._hideActionPopover(e);

      let eventDetail = {
          data: detail.parentButton
      }
      this.scopeId = eventDetail.data.id;
      this.fireBedrockEvent(eventName, eventDetail, {
          ignoreId: true
      });
  }

  get configSaveServiceLiq() {
      this._configSaveServiceLiq = this._configSaveServiceLiq || this.shadowRoot.querySelector(
          '[name="configSaveService"]');
      return this._configSaveServiceLiq;
  }

  // Can be used to generate the save requests.
  generateSaveRequest(reqData, operation) {
      let configSaveService = this.configSaveServiceLiq;

      if (configSaveService) {
          configSaveService.operation = operation;
          configSaveService.requestData = reqData;
          configSaveService.generateRequest();
      }
  }

  _onSaveScopeResponse(e) {
      this._originalScopeMappings = [];
      this._originalScopes = [];

      if (this._toastMessage) {
          this.showSuccessToast(this._toastMessage);
          this._toastMessage = "";
      }

      if (DataHelper.isValidObjectPath(this._scopeRequest, "params.options")) {
          delete this._scopeRequest.params.options;
      }
      this.async(function () {
          this.generateRequest(this._scopeRequest);
      }, 1000); //Todo - This async will be removed once Notification is integrated
  }

  _onSaveScope(e, detail, sender) {
      if (!this.selectedScope || _.isEmpty(this.selectedScope)) {
          this.showWarningToast("Scope can not be saved without any data");
          return;
      }
      this._setLoading(true);
      this._onCancelScope();
      this._triggerSaveProcess(detail);
  }

  _onCancelScope() {
      this.shadowRoot.querySelector("#scopePopover").hide();
      this.scopeId = ""; //reset
  }

  /**
   * Save process
   */
  _triggerSaveProcess(detail) {
      if (detail) {

          let _isUpdate = false;

          //Check for permission to Update
          if (!_.isEmpty(detail.selectedScope)) {
              let _currentUser = ContextHelper.getFirstUserContext(this.contextData);
              _isUpdate = true;

              if (_currentUser &&
                  _currentUser.user != detail.selectedScope.createdby &&
                  _currentUser.role != "admin") //Todo: admin role may changed
              {
                  this._setLoading(false);
                  this.logError("You do not have permissions to update the scope.", detail);
                  return;
              }
          }

          //Initiate
          let _scopeDetails = {
              "scope-info": detail,
              "scope": this.selectedScope
          };

          if (detail.selectedScope && !_.isEmpty(detail.selectedScope)) {
              this.createUpdateScope(_scopeDetails, "update");
          } else {
              this.createUpdateScope(_scopeDetails, "create");
          }
      }
  }

  // Can be used to create and update the scope.
  createUpdateScope(scopeInfo, type) {

      this._scopeInfo = {
          "details": scopeInfo,
          "type": type
      };

      let request = DataHelper.cloneObject(this._scopeRequest);
      request.params.query.name = this._getScopeContextName(scopeInfo["scope-info"].name);
      delete request.params.query.contexts[0].user;
      delete request.params.query.contexts[0].role;

      this.generateNameScopeRequest(request);
  }

  _getScopeContextName(scopeName) {
      if (scopeName && scopeName.trim().length > 0) {
          return "scope_" + scopeName.replace(/\s/g, '').toLowerCase();
      }
  }

  _getUserRolePerAccessType(scopeInfo, userContext) {

      if (!scopeInfo || !userContext) {
          return;
      }

      if (scopeInfo.accesstype) {
          let user = userContext.user;
          let role = userContext.defaultRole;

          if (scopeInfo.accesstype == "_ALL") {
              user = "all"; // all users
              role = "all"; // any role
          } else if (scopeInfo.accesstype == "_ROLE") {
              user = "role"; // role based users
          }

          return {
              "user": user,
              "defaultRole": role
          };
      }
  }

  // Context for create scope
  _prepareCreateContext(_clonedContextData, _scopeDetails) {
      let userContext = ContextHelper.getFirstUserContext(_clonedContextData);
      let user = this._getUserRolePerAccessType(_scopeDetails["scope-info"], userContext);

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
              "accesstype": _scopeDetails["scope-info"].accesstype,
              "name": _scopeDetails["scope-info"].name,
              "icon": "pebble-icon:saved-search",
              "createdby": userContext.user,
              "createdbyrole": userContext.defaultRole,
              "ownershipData": userContext.ownershipData,
              "scope": _scopeDetails["scope"]
          }
      };

      return this._prepareContextsData(_clonedContextData, context, data);
  }

  // Context for create mappings
  _prepareCreateMappingContext(clonedContextData, tag) {
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
          "config": {}
      };
      data.config[favScopesName] = [tag.scopename];

      return this._prepareContextsData(clonedContextData, context, data);
  }

  _prepareContextsData(clonedContextData, context, data) {
      let contextsObject = {
          "context": context,
          "jsonData": data
      }

      //Set context
      clonedContextData[ContextHelper.CONTEXT_TYPE_DATA] = [contextsObject];
      return clonedContextData;
  }

  refresh() {
      this._setLoading(true);
      let request = DataHelper.cloneObject(this._scopeRequest);
      this.generateRequest(request);
  }

  _setLoading(flag) {
      this._loading = flag;

      this.async(function () {
          let scopeTabs = this.querySelector("#rock-scope-tabs");
          if (scopeTabs) {
              let tagComponentList = scopeTabs.querySelectorAll("rock-scope-tags");
              if (tagComponentList) {
                  for (let i = 0; i < tagComponentList.length; i++) {
                      tagComponentList[i].loading = flag;
                  }
              }
          }
      }, 150);
  }

  _hideActionPopover(e) {
      let actionsPopover = e.composedPath()[0].shadowRoot.querySelector("#actionsPopover");
      if (actionsPopover) {
          actionsPopover.hide();
      }
  }
}
customElements.define(RockScopeSelector.is, RockScopeSelector);
