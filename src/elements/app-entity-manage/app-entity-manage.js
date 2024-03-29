import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import '../bedrock-app-behavior/bedrock-app-behavior.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-navigation-behavior/bedrock-navigation-behavior.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-helpers/component-helper.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-navigation-behavior/bedrock-navigation-behavior.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-logger-behavior/bedrock-logger-behavior.js';
import '../bedrock-toast-behavior/bedrock-toast-behavior.js';
import '../liquid-entity-model-composite-get/liquid-entity-model-composite-get.js';
import '../liquid-entity-model-get/liquid-entity-model-get.js';
import '../liquid-entity-data-get/liquid-entity-data-get.js';
import '../pebble-button/pebble-button.js';
import '../pebble-dialog/pebble-dialog.js';
import '../pebble-vertical-divider/pebble-vertical-divider.js';
import '../pebble-spinner/pebble-spinner.js';
import '../rock-layout/rock-layout.js';
import '../rock-entity-titlebar/rock-entity-titlebar.js';
import '../rock-layout/rock-header/rock-header.js';
import '../rock-layout/rock-sidebar/rock-sidebar.js';
import '../rock-entity-detail-tabs/rock-entity-detail-tabs.js';
import '../rock-entity-header/rock-entity-header.js';
import '../rock-entity-sidebar/rock-entity-sidebar.js';
import '../rock-dimension-grid/rock-dimension-grid.js';
import '../rock-entity-manage-elements/rock-entity-manage-elements.js';
import EntityTypeManager from '../bedrock-managers/entity-type-manager.js'
import EntityCompositeModelManager from '../bedrock-managers/entity-composite-model-manager.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import ProgressTracker from '../app-main/ProgressTracker.js';

class AppEntityManage
    extends mixinBehaviors([
        RUFBehaviors.AppBehavior,
        RUFBehaviors.LoggerBehavior,
        RUFBehaviors.ComponentContextBehavior,
        RUFBehaviors.ComponentConfigBehavior,
        RUFBehaviors.ToastBehavior,
        RUFBehaviors.NavigationBehavior
    ], OptionalMutableData(PolymerElement)) {
  static get template() {
    return html`
        <style include="bedrock-style-common">
            rock-entity-detail-tabs {
                --rock-tab-content-height: {
                    @apply --app-entity-manage-tab-content-height;
                }
            }

            rock-entity-header {
                border-bottom: 1px solid var(--default-border-color, #c1cad4);
                padding: 0px;
            }

            .stepper-style {
                --connected-badge-width: 50px;
                --connected-badge-height: 50px;
                --connected-badge-background: var(--cloudy-blue-color, #c1cad4);
                --connected-childBadge-width: 18px;
                --connected-childBadge-height: 18px;
                --connected-childBadge-background: var(--connected-childBadge-background, #0abf21);
                --connectorLine-width: 3px;
                --divider-color: #212121;
            }

            .sidebar-title {
                font-weight: var(--font-medium, 500);
                font-family: var(--default-font-family);
                clear: both;
                padding: 10px;
                margin: 10px;
                font-size: var(--default-font-size);
                font-weight: var(--font-bold, bold);
                font-style: normal;
                font-stretch: normal;
                color: var(--title-text-color, #191e22);
                width: 161px;
                height: 19px;
            }

            pebble-vertical-divider {
                --pebble-vertical-divider-color: var(--divider-color, #212121);
                min-width: 1px;
                margin-top: 10px;
                margin-right: 5px;
                margin-bottom: 10px;
                margin-left: 5px;
                min-height: 18px;
            }

            .content {
                @apply --app-entity-manage-content-height;
                -webkit-transition: height 0.3s;
                -moz-transition: height 0.3s;
                -o-transition: height 0.3s;
                transition: height 0.3s;
            }

            rock-sidebar {
                @apply --app-entity-manage-content-height;
                -webkit-transition: height 0.3s;
                -moz-transition: height 0.3s;
                -o-transition: height 0.3s;
                transition: height 0.3s;
            }

            .tab-wrap {
                position: relative;
            }

            rock-layout {
                --scroller: {
                    overflow-x: hidden;
                    overflow-y: hidden;
                }
            }

            @supports (-ms-ime-align:auto) {
                .content,
                rock-sidebar {
                    transition: initial;
                }
            }
        </style>
        <rock-layout hide-footer="">
            <pebble-spinner active="[[_loading]]"></pebble-spinner>
            <template is="dom-if" if="{{hasComponentErrored(isComponentErrored)}}">
                <div id="error-container"></div>
            </template>
            <template is="dom-if" if="{{!hasComponentErrored(isComponentErrored)}}">
                <template is="dom-if" if="[[_domainReceived]]">
                    <rock-entity-titlebar id="entityTitlebar" slot="rock-titlebar" context-data="[[contextData]]" app-config="[[appConfig]]" app-name="app-entity-manage" domain="[[domain]]">
                    </rock-entity-titlebar>
                    <bedrock-pubsub event-name="on-set-titlebar" handler="_onSetTitlebar" target-id="entityTitlebar"></bedrock-pubsub>
                    <bedrock-pubsub event-name="context-selector-data-changed" handler="_onContextsChanged" target-id="entityTitlebar"></bedrock-pubsub>
                </template>
                <template is="dom-if" if="[[_loadComponents]]">
                    <rock-header frozen="" slot="rock-header">
                        <div slot="fixed-content" class="fixed-content">
                            <rock-entity-header id="entityManageHeader" context-data="[[contextData]]" workflow-info="[[_workflowInfo]]" collapsable=""></rock-entity-header>
                            <bedrock-pubsub event-name="toolbar-button-event" handler="_onToolbarEvent" target-id="entityManageHeader"></bedrock-pubsub>
                        </div>
                    </rock-header>
                </template>
                <bedrock-pubsub event-name="refresh-entity-thumbnail" handler="_refreshEntityThumbnail"></bedrock-pubsub>
                <bedrock-pubsub event-name="on-context-manage-tap" handler="_onContextManageTap"></bedrock-pubsub>
                <bedrock-pubsub event-name="on-snapshot-view-tap" handler="_onSnapshotViewTap"></bedrock-pubsub>
                <bedrock-pubsub event-name="on-copy-tap" handler="_onCopyActionTap"></bedrock-pubsub>
                <bedrock-pubsub event-name="on-paste-tap" handler="_onPasteActionTap"></bedrock-pubsub>
                <bedrock-pubsub event-name="on-preview-template-tap" handler="_onPreviewTemplateTap"></bedrock-pubsub>
                <template is="dom-if" if="[[_loadComponents]]">
                    <rock-sidebar id="rockSideBar" position="right" context-data="[[contextData]]" slot="rock-sidebar" collapsable="" on-rock-sidebar-attached="_onRockSidebarAttached">
                        <rock-entity-sidebar id="entityManageSidebar" context-data="[[contextData]]"></rock-entity-sidebar>
                    </rock-sidebar>
                </template>

                <div id="tabsContent" class="content p-relative">
                    <template is="dom-if" if="[[_loadComponents]]" id="tabsTemplate">
                        <rock-entity-detail-tabs id="rockDetailTabs" view-mode="{{viewMode}}" context-data="[[contextData]]" readonly="[[readonly]]"></rock-entity-detail-tabs>
                        <bedrock-pubsub event-name="component-creating" handler="_onComponentCreating"></bedrock-pubsub>
                        <bedrock-pubsub on-bedrock-event-trigger-todo-action="summaryTodoTap" name="bedrock-event-trigger-todo-action"></bedrock-pubsub>
                        <bedrock-pubsub on-bedrock-event-tofixtap="summaryTofixTap" name="bedrock-event-tofixtap"></bedrock-pubsub>
                        <bedrock-pubsub event-name="error-length-changed" handler="errorLengthChanged"></bedrock-pubsub>
                        <bedrock-pubsub event-name="dimension-grid-open" handler="onDimensionGridOpen"></bedrock-pubsub>
                    </template>
                </div>
                <pebble-dialog id="confirmationDialog" dialog-title="Confirmation" modal="" alert-box="" show-cancel="" show-ok="" no-cancel-on-outside-click="" no-cancel-on-esc-key="">
                    <p>Are you sure you want to delete?</p>
                </pebble-dialog>
            </template>
        </rock-layout>
        <bedrock-pubsub event-name="workflow-transition-complete" handler="_onWorkflowTransitionComplete"></bedrock-pubsub>
        <bedrock-pubsub event-name="workflow-assignment-complete" handler="_onWorkflowAssignmentComplete"></bedrock-pubsub>
        <bedrock-pubsub event-name="on-workflow-available" handler="_onWorkflowAvailable"></bedrock-pubsub>
        <bedrock-pubsub event-name="on-attribute-save" handler="_refreshHeaderAndNavBars"></bedrock-pubsub>
        <bedrock-pubsub event-name="on-buttonok-clicked" handler="_onDeleteConfirm" target-id="confirmationDialog"></bedrock-pubsub>
        <bedrock-pubsub event-name="govern-complete" handler="_onGovernComplete"></bedrock-pubsub>
        <bedrock-pubsub event-name="quick-manage-save-complete" handler="_onQuickManageSaveComplete"></bedrock-pubsub>
        <bedrock-pubsub event-name="navigation-change" handler="_onNavigationChange"></bedrock-pubsub>
        <bedrock-pubsub event-name="on-download" handler="_downloadEvent"></bedrock-pubsub>
                        
        <liquid-rest id="entityDeleteLiquidRest" url="/data/pass-through/[[appService]]/delete" method="POST" on-liquid-response="_deleteSuccess" on-liquid-error="_deleteFailure"></liquid-rest>
        <liquid-entity-model-composite-get id="compositeRelModelGet" on-entity-model-composite-get-response="_onRelationshipCompositeModelGetResponse" on-error="_onCompositeModelGetError"></liquid-entity-model-composite-get>
        <liquid-entity-model-composite-get id="compositeAttrModelGet" on-entity-model-composite-get-response="_onAttributeCompositeModelGetResponse" on-error="_onCompositeModelGetError"></liquid-entity-model-composite-get>
        <liquid-entity-model-get id="getRelDomains" operation="getbyids" on-response="_onRelModelsReceived" on-error="_onModelGetFailed"></liquid-entity-model-get>
        <liquid-entity-model-get id="getEntityDomain" operation="getbyids" on-response="_onDomainReceived" on-error="_onDomainGetFailed"></liquid-entity-model-get>
        <liquid-entity-data-get id="getEntity" operation="getbyids" data-index="entityData" data-sub-index="data" on-response="_onEntityGetResponse" on-error="_onEntityGetFailed"></liquid-entity-data-get>
`;
  }

  static get is() { return 'app-entity-manage' }

  static get properties() {
      return {

          readonly: {
              type: Boolean,
              value: false
          },
          /*
           * Indicates the config for tab element
           */
          _tabConfig: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _entityResponseContent: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          /*
           * Indicates the items for stepper element
           */
          _stepItems: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _compositeModel: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _entityType: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _entityId: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          contextData: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _lastSavedTime: {
              value: ""
          },
          verbose: {
              type: Boolean,
              value: false
          },
          _loading: {
              type: Boolean,
              value: false
          },
          _invalidateEntityCache: {
              type: Boolean,
              value: true
          },
          appConfig: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _showNotificationToast: {
              type: Boolean,
              value: false
          },
          queryParams: {
              type: String,
              value: ""
          },
          viewMode: {
              type: String,
              value: ""
          },
          domain: {
              type: String,
              value: ""
          },
          appService: {
              type: String,
              value: "entityappservice"
          },
          dataIndex: {
              type: String,
              value: "entityData"
          },
          _entityReceived: {
              type: Boolean,
              value: false
          },
          _domainReceived: {
              type: Boolean,
              value: false
          },
          _loadComponents: {
              type: Boolean,
              value: false
          },
          rendercms: {
              type: Boolean,
              value: false
          },
          _isContextReceived:{
              type:Boolean,
              value:false
          }
      }
  }
  static get observers() {
      return [
          "_componentsReceived(domain, _entityReceived,_isContextReceived)"
      ]
  }
  disconnectedCallback() {
      super.disconnectedCallback();
  }
  connectedCallback() {
      super.connectedCallback();
      
      this._searchTimeStamp = new Date().toLocaleString();
      // Do not load any components for deleted entities.
      if (this._entityType && this._entityType.indexOf("delete") !== 0) {
          //Get the domain and set it
          this.getDomain();
      } else {
          this.showInformationToast("This entity has been deleted and hence cannot be viewed/edited.");
      }

  }

  get entityTitleBar() {
      this._entityTitlebar = this._entityTitlebar || this.shadowRoot.querySelector("#entityTitlebar");
      return this._entityTitlebar;
  }

  get confirmationDialog() {
      this._confirmationDialog = this._confirmationDialog || this.shadowRoot.querySelector("#confirmationDialog");
      return this._confirmationDialog;
  }

  get entityHeader() {
      this._entityHeader = this._entityHeader || this.shadowRoot.querySelector("rock-entity-header");
      return this._entityHeader;
  }

  /**
   * Function to raise a request to get the domain of the given entity type
   */
  getDomain() {
      let req = {
          "params": {
              "query": {
                  "id": this._entityType + "_entityType",
                  "filters": {
                      "typesCriterion": ["entityType"]
                  }
              },
              "fields": {}
          }
      };

      let domainGet = this.shadowRoot.querySelector("#getEntityDomain");
      if (domainGet) {
          domainGet.requestData = req;
          domainGet.generateRequest();
      }
  }

  getEntity() {
      let req = {
          "params": {
              "intent": "write",
              "query": {
                  "id": this._entityId,
                  "valueContexts": [DataHelper.getDefaultValContext()],
                  "filters": {
                      "typesCriterion": [this._entityType]
                  }
              }
          }
      };

      let entityGet = this.shadowRoot.querySelector("#getEntity");
      if (entityGet) {
          entityGet.requestData = req;
          entityGet.generateRequest();
      }
  }

  /**
   * Function to set the domain in the contextData
   */
  _onDomainReceived(e, detail) {
      let responseContent = DataHelper.validateAndGetResponseContent(detail.response);
      if (responseContent && responseContent.entityModels && responseContent.entityModels
          .length > 0) {
          this.domain = responseContent.entityModels[0].domain;
      } else {
          let contentDiv = this.shadowRoot.querySelector("[class='content']");
          this.logError("app-entity-manage - Domain get response error", e.detail, true, contentDiv);
      }
      if (this.domain) {
          this.contextData[ContextHelper.CONTEXT_TYPE_DOMAIN] = [{
              "domain": this.domain
          }];

          //Reset the context data to notify the children
          let contextData = DataHelper.cloneObject(this.contextData);
          this._domainReceived = true;
          this.requestConfig("rock-entity-manage", contextData);
          //Update NavigationContexts into contextData
          this.refreshNavigationContexts();
      }
  }
  onConfigLoaded(componentConfig) {
      if (componentConfig && componentConfig.config) {
          let config = componentConfig.config;
          let entityGet = this.shadowRoot.querySelector("#getEntity");
          if (entityGet && config) {
              entityGet.dataIndex = config.dataIndex;
          }
          this.getEntity();
      }
  }
  _onEntityGetResponse(e, detail) {
      let responseContent = DataHelper.validateAndGetResponseContent(detail.response);
      this._entityResponseContent = responseContent;
      if (responseContent && responseContent.entities && responseContent.entities.length >
          0) {
          let entity = responseContent.entities[0];
          this._entityName = entity.name == "_EMPTY" ? "" : entity.name;
          //Update itemContext with name
          let itemContext = ContextHelper.getFirstItemContext(this.contextData);
          if (!_.isEmpty(itemContext)) {
              itemContext.name = this._entityName;
              itemContext.domain = entity.domain;
              this.contextData[ContextHelper.CONTEXT_TYPE_ITEM] = [itemContext];
          }
          if (entity.properties && DataHelper.isValidObjectPath(entity.properties,
              "writePermission") && entity.properties.writePermission === false) {
              let firstItemContext = ContextHelper.getFirstItemContext(this.contextData) ||
                  {};
              firstItemContext["permissionContext"] = {
                  "writePermission": false
              };
          }

          //Reset the context data to notify the children
          this._entityReceived = true;
      } else {
          let contentDiv = this.shadowRoot.querySelector("[class='content']");
          this.logError("app-entity-manage - Entity get response error", e.detail, true, "No entity found with requested information", contentDiv);
      }
  }

  _onEntityGetFailed(e) {
      let contentDiv = this.shadowRoot.querySelector("[class='content']");
      this.logError("app-entity-manage - Entity get response exception", e.detail, true, "No entity found with requested information", contentDiv);
  }

  _componentsReceived() {
      if (this.domain && this._entityReceived && this._isContextReceived) {
          this.set("_loadComponents", true);
      }
  }

  /**
   * Function to handle error during domain get
   */
  _onDomainGetFailed(e) {
      let contentDiv = this.shadowRoot.querySelector("[class='content']");
      this.logError("app-entity-manage - Domain get response exception", e.detail, true, contentDiv);
  }

  get contextSelector() {
      this._contextSelector = this._contextSelector || this.shadowRoot.querySelector("rock-context-selector");
      return this._contextSelector;
  }

  get detailTabs() {
      this._detailTabs = this._detailTabs || this.shadowRoot.querySelector("#rockDetailTabs");
      return this._detailTabs;
  }

  get entityDeleteLiquidRestLiq() {
      this._entityDeleteLiquidRest = this._entityDeleteLiquidRest || this.shadowRoot
          .querySelector("#entityDeleteLiquidRest");
      return this._entityDeleteLiquidRest;
  }

  get compositeRelModelGetLiq() {
      this._compositeRelModelGet = this._compositeRelModelGet || this.shadowRoot.querySelector("#compositeRelModelGet");
      return this._compositeRelModelGet;
  }

  get compositeAttrModelGetLiq() {
      this._compositeAttrModelGet = this._compositeAttrModelGet || this.shadowRoot
          .querySelector("#compositeAttrModelGet");
      return this._compositeAttrModelGet;
  }

  get getRelDomainsLiq() {
      this._getRelDomains = this._getRelDomains || this.shadowRoot.querySelector("#getRelDomains");
      return this._getRelDomains;
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


      this._entityId = DataHelper.getParamValue("id");
      this._entityType = DataHelper.getParamValue("type");

      let itemContext = {
          "id": this._entityId,
          "type": this._entityType
      };

      this.viewMode = DataHelper.getParamValue("viewMode");

      this.contextData[ContextHelper.CONTEXT_TYPE_ITEM] = [itemContext];

      //Update NavigationContexts into contextData
      this.refreshNavigationContexts();          
  }
  refresh() {
      let isDirty = this.getIsDirty();

      const _refresh = () => {
          this.contextSelector && this.contextSelector.refresh();
          this._reRenderOnDimensionChange();

          this.detailTabs.readyToRender(true);
          this.detailTabs.reloadCurrentTab();
      };

      if (isDirty) {
          // eslint-disable-next-line no-alert
          if (window.confirm("There are unsaved changes. Do you want to discard the changes?")) {
              _refresh();
          }
          return;
      }
      _refresh();
  }
  /**
   * Function to display the left nav info
   */
  getAppCurrentStatus(customArgs) {
      if (customArgs && customArgs.queryParams) {
          this.queryParams = customArgs.queryParams;
      }
      return {
          title: this.entityTitleBar ? this.getNavbarTitle(this.entityTitleBar.mainTitle) : "",
          subTitle: this.getIsDirty() ? "Draft" : this._lastSavedTime && this._lastSavedTime != "" ? "Last Saved" : "Last Opened",
          subTitleValue: this._lastSavedTime && this._lastSavedTime != "" ? this._lastSavedTime : new Date().toLocaleString(),
          queryParams: this.queryParams,
          appId: this.appId
      };
  }
  /**
   * Function to get the left nav title
   */
  getNavbarTitle(pTitle) {
      let title = EntityTypeManager.getInstance().getTypeExternalNameById(this._entityType) +
          ": ";
      if (pTitle) {
          title += pTitle;
      } else {
          title += this._entityId;
      }
      return title;
  }

  /**
   *  After the page has loaded, update the title to display on the left nav
   */
  updateAppCurrentStatus(title) {
      let appStatus = this.getAppCurrentStatus();
      appStatus.title = this.getNavbarTitle(title);
      let eventData = {
          name: "appstatusupdated",
          data: appStatus
      };
      this.dispatchEvent(new CustomEvent("bedrock-event", {
          detail: eventData,
          bubbles: true,
          composed: true
      }));
  }

  _onPreviewTemplateTap(e, detail) {
      let state = {
          contextData: this.contextData,
          _entityType: this._entityType,
          _entityId: this._entityId,
          templateId: detail.data.properties.templateId
      };
      this.setState(state);
      let params = this.getQueryParamFromState();
      let path = location.pathname.substring(0, location.pathname.lastIndexOf("/"));
      window.open(path + "/entity-preview?state=" + params);

  }

  _onContextManageTap(e, detail) {
      if (!detail || !detail.data) {
          return;
      }

      const {
          componentName,
          properties
      } = detail.data;

      this.openBusinessFunctionDialog({
          name: componentName,
          title: detail.data.title,
      });
  }

  _onSnapshotViewTap(e, detail) {
      if (!detail || !detail.data) {
          return;
      }

      const {
          componentName
      } = detail.data;
      this.openBusinessFunctionDialog({
          name: componentName,
          mergeTitle: true,
          title: this._entityName
      });
  }

  _onCopyActionTap() {
      //saving entity details in session storage so we can use this later for paste
      let contexts = this.getDataContexts();
      let valContexts = this.getValueContexts();
      if( (contexts && contexts.length>1) ||  (valContexts && valContexts.length>1)) {
          this.showWarningToast("Entity paste functionality is not supported for multiple contexts");
          return;
      }
      sessionStorage.setItem('copyEntityData', JSON.stringify(this.contextData));
      this.showSuccessToast('Entity copied successfully');
  }

  _areAttributesEditable() {
      let hasWritePermissionValues = [];
      let firstDataContext = ContextHelper.getFirstDataContext(this.contextData);

      if(_.isEmpty(firstDataContext)) {
          // check for self attributes permissions
          let attributes;
          if(DataHelper.isValidObjectPath(this._compositeModel, 'data.attributes')) {
              attributes= this._compositeModel.data.attributes;
          }
          if(!_.isEmpty(attributes)) {
              for (let attrName in attributes) {
                  hasWritePermissionValues.push(attributes[attrName].properties.hasWritePermission);
              }
          }
      } else {
          // check for context attributes permissions
              let attributes = SharedUtils.DataObjectFalcorUtil.getAttributesByCtx(
                  this._compositeModel, firstDataContext);
              if(!_.isEmpty(attributes)) {
                  for (let attrName in attributes) {
                      hasWritePermissionValues.push(attributes[attrName].properties.hasWritePermission);
                  }
              }
      }
      return !hasWritePermissionValues.every(val => val === false);
  }
  async _onPasteActionTap(e, detail) {
      if (!detail || !detail.data) {
          return;
      }
      let contexts = this.getDataContexts();
      let valContexts = this.getValueContexts();
      await this._getCompositeModel();
      if( (contexts && contexts.length>1) ||  (valContexts && valContexts.length>1)) {
          this.showWarningToast("Entity paste functionality is not supported for multiple contexts");
          return;
      }

      if(!this._areAttributesEditable()) {
          this.showWarningToast("You do not have permissions to edit this entity");
          return;
      }

      //check to make sure user cannot copy and paste on same entity
      let data = sessionStorage.getItem('copyEntityData');
      let parsedData;
      if (data) {
          parsedData = JSON.parse(data);
      }
      if (DataHelper.isValidObjectPath(parsedData, 'ItemContexts.0.id')) {
          let copyEntityId = parsedData.ItemContexts[0].id;
          let pasteEntityId;
          let firstItemContext = this.getFirstItemContext();
          let valContexts = ContextHelper.getValueContexts(this.contextData);
          let firstDataContext = ContextHelper.getFirstDataContext(this.contextData);
          if(firstItemContext && !_.isEmpty(firstItemContext.id)) {
              pasteEntityId = firstItemContext.id;
          }
          if ( (copyEntityId === pasteEntityId) && (DataHelper.compareObjects(parsedData.Contexts, firstDataContext))  && 
               (DataHelper.compareObjects(parsedData.ValContexts, valContexts))) {
              this.showWarningToast("Cannot copy and paste on the same entity in same context");
              return;
          }
      } else {
          this.showWarningToast("No Item Copied");
          return;
      }
      let clonedContextData = DataHelper.cloneObject(this.contextData);
      clonedContextData[ContextHelper.CONTEXT_TYPE_ITEM] = this.contextData.ItemContexts;
      clonedContextData[ContextHelper.CONTEXT_TYPE_DATA] = [];

      const sharedData = {
          sharedContextData: this.contextData
      };

      const {
          componentName
      } = detail.data;
      this.openBusinessFunctionDialog({
          name: componentName,
          mergeTitle: true,
          title: this._entityName
      }, sharedData);
  }
  _onToolbarEvent(e, detail) {
      let event = detail.name;
      switch (event.toLowerCase()) {
          case "search":
              this._searchEvent(e, detail);
              break;
          case "refresh":
              this._refreshEvent(e, detail);
              break;
          case "copy":
              this._copyEvent(e, detail);
              break;
          case "paste":
              this._pasteEvent(e, detail);
              break;
          case "clone":
              this._cloneEvent(e, detail);
              break;
          case "add":
              this._addEvent(e, detail);
              break;
          case "delete":
              this._deleteEvent(e, detail);
              break;
          case "cut":
              this._cutEvent(e, detail);
              break;
          case "upload":
              this._openEntityUploadBF(e, detail);
              break;
          case "download":
              this._downloadEvent(e, detail);
              break;
          case "edit":
              this._editEvent(e, detail);
              break;
          case "republish":
              this._rePublishEvent(e, detail);
              break;
          default:
              this.fireBedrockEvent("grid-custom-toolbar-event", detail);
              break;
      }
  }

  _onContextDataChanged() {
      //reset to notify contextData change to other components
      let contextData = DataHelper.cloneObject(this.contextData);
      this.contextData = {};
      this._isContextReceived = true;
      this.contextData = contextData;
      let valContexts = ContextHelper.getValueContexts(this.contextData);

      this._reRenderOnDimensionChange(false);
  }
  _onComponentCreating(e, detail) {
      let component = detail.data;

      if (component.properties) {
          //set context-data for all components no matter what
          if (!component.properties["context-data"] || _.isEmpty(component.properties[
              "context-data"])) {
              component.properties["context-data"] = this.contextData;
          }
      }
  }
  _refreshEvent() {
      let isDirty = false;
      if (this.getIsDirty) {
          isDirty = this.getIsDirty();
      }
      if (isDirty) {
          // eslint-disable-next-line no-alert
          if (window.confirm("There are unsaved changes. Do you want to discard the changes?")) {
              this._refreshView();
          }
      } else {
          this._refreshView();
      }
  }
  _copyEvent() {
      RUFUtilities.pebbleAppToast.fitInto = RUFUtilities.appCommon.$.toastArea;
      RUFUtilities.appCommon.toastText = "Attribute Data Copied successfully!!";
      RUFUtilities.pebbleAppToast.show();
  }
  _pasteEvent(e, detail) {
      console.log("event triggered: " + detail.name);
  }
  _cloneEvent(e, detail) {
      console.log("event triggered: " + detail.name);
  }
  _addEvent(e, detail) {
      console.log("event triggered: " + detail.name);
  }
  _deleteEvent(e, detail) {
      if (detail.dataIndex) {
          this.dataIndex = detail.dataIndex;
      }
      this.confirmationDialog.open();
  }
  _onDeleteConfirm() {
      if (!this.entityDeleteLiquidRestLiq) {
          return;
      }

      let itemContexts = DataHelper.cloneObject(this.getItemContexts());

      //Prepare request
      let req = {
          "params": {
              "softDelete": true
          },
          entity: {},
          entityModel: {}
      };

      if (this.dataIndex.toLowerCase() == "entitymodel") {
          this.appService = "entitymodelservice";
          req.entityModel.id = itemContexts[0].id;
          req.entityModel.type = itemContexts[0].type;
      } else {
          req.entity.id = itemContexts[0].id;
          req.entity.type = itemContexts[0].type;
      }

      //Send request to delete the entity
      this.entityDeleteLiquidRestLiq.requestData = req;
      this.entityDeleteLiquidRestLiq.generateRequest();
  }
  _deleteSuccess(e) {
      if (e.detail && e.detail.response && e.detail.response.response) {
          let response = e.detail.response.response;
          if (response.status == "success") {
              this.readonly = true;
              this.showSuccessToast("Entity delete request submitted successfully");
          } else {
              if (response.status == "error") {
                  let messageCode;
                  if (response.statusDetail && response.statusDetail.messages &&
                      response.statusDetail
                          .messages.length > 0) {
                      let message = response.statusDetail.messages[0];
                      if (message) {
                          messageCode = message.messageCode;
                      }
                  }

                  if (messageCode == "PD001") {
                      this.showErrorToast("You do not have permission to delete an entity!");
                      this.logError("You do not have permission to delete an entity!", e.detail);
                  } else {
                      this.showErrorToast("Failed to perform delete on the entity");
                      this.logError("Failed to perform delete on the entity", e.detail);
                  }
              } else {
                  this.logError("Failed to perform delete on the entity", e.detail);
                  this.showErrorToast("Failed to perform delete on the entity");
              }
          }
      }
  }
  _deleteFailure(e) {
      //console.warn("Failed to perform delete with error: ", e.detail);
      this.logError("Failed to perform delete on the entity", e.detail);
  }
  _cutEvent(e, detail) {
      console.log("event triggered: " + detail.name);
  }
  _downloadEvent(e) {
      let copContext = {};
      if (e && e.detail && e.detail["cop-context"]) {
          copContext = e.detail["cop-context"];
          if (copContext.source) {
              let valContexts = ContextHelper.getValueContexts(this.contextData);
              copContext.source = valContexts[0].source;
          }
      }

      let itemContexts = this.getItemContexts();

      if (!itemContexts || !itemContexts.length) {
          this.logError("item context not found.", e.detail);
          return;
      }

      const {
          id,
          type
      } = itemContexts[0];

      const sharedData = {
          "selected-entities": [{
              id,
              type
          }],
          "cop-context": copContext
      };

      this.openBusinessFunctionDialog({
          name: "rock-wizard-entity-download",
          mergeTitle: true,
          title: DataHelper.concatValuesFromArray([
              ContextHelper.getDataContexts(this.contextData),
              this._entityName
          ])
      }, sharedData);
  }
  _rePublishEvent() {
      const sharedData = {
          "selected-entities": DataHelper.cloneObject(this.getItemContexts())
      };

      this.openBusinessFunctionDialog({
          name: "rock-wizard-re-publish"
      }, sharedData);
  }
  _onCOPDownloadFailure(e) {
      this.logError("Failed to download entity data.", e.detail);
      this._loading = false;
  }
  _onRockSidebarAttached(){
      this._toggleStepper();
  }
    _toggleStepper() {
        let rockSideBar = this.shadowRoot.querySelector("#rockSideBar");
        if (rockSideBar) {
            let valContexts = ContextHelper.getValueContexts(this.contextData);
            let dataContexts = ContextHelper.getDataContexts(this.contextData);

            if ((valContexts && valContexts.length > 1) || (dataContexts && dataContexts.length > 1)) {
                rockSideBar.setAttribute("show", "false");
            } else {
                rockSideBar.setAttribute("show", "true");
            }

        }
    }
  async summaryTodoTap(e, detail) {
      if (!detail || !detail.type) {
          this.logError("Configuration missing.", e.detail);
          return;
      }
      this.todoActionDialogTitle = detail.label;
      if (detail.type == "linkAssets") {
          if (detail && detail.config && detail.config.relationshipTypeName) {
              this._triggerLinkAssets(detail.config.relationshipTypeName);
          } else {
              this.logError("Relationships are not configured for this action.", e.detail);
              this.showWarningToast("Relationships are not configured for this action. Contact administrator.");
              return;
          }
      } else if (detail.type == "manageAttributes") {
          this.manageAttrLabel = detail.label || "Manage Attributes";
          this.manageAttrNames = detail.config.attributeNames || [];
          this.manageAttrGroups = detail.config.attributeGroupNames || [];
          this.manageAttributeByProperty = detail.config.propertyInfo || {};

          if (this.manageAttrGroups.length > 0 || !_.isEmpty(this.manageAttributeByProperty)) {
              await this._triggerManageAttributes();
          } else {
              if (this.manageAttrNames.length > 0) {
                  this._openManageAttributesDialog(this.manageAttrLabel, this.manageAttrNames);
              } else {
                  this.logError("Attributes are not configured for this action.", detail);
                  this.showWarningToast("Attributes are not configured for this action. Contact administrator.");
              }
          }
      } else if (detail.type == "manageRelationships") {
          if (detail && detail.config && detail.config.relationshipTypeName) {
              this._triggerManageRelationships(detail.config.relationshipTypeName);
          } else {
              this.logError("Relationships are not configured for this action.", e.detail);
              this.showWarningToast("Relationships are not configured for this action. Contact administrator.");
              return;
          }
      }
  }
  _triggerLinkAssets(relationshipTypeName) {
      if (!this.compositeRelModelGetLiq) {
          return;
      }

      let request = DataRequestHelper.createEntityModelCompositeGetRequest(this.contextData);
      delete request.params.fields.attributes;
      request.params.fields.relationships = [relationshipTypeName];

      this.compositeRelModelGetLiq.requestData = request;
      this.compositeRelModelGetLiq.generateRequest();
  }
  _onRelationshipCompositeModelGetResponse(e, detail) {
      let relationshipDetails = {};
      if (detail && DataHelper.validateGetModelsResponse(detail.response)) {
          let relType = "";
          if (detail.request) {
              relType = detail.request.requestData.params.fields.relationships[0];
              relationshipDetails.relType = relType; // Set relationshipType
          }
          let compositeModel = detail.response.content.entityModels[0];
          if (relType && compositeModel && compositeModel.data) {
              let relationships = DataTransformHelper.transformRelationshipModels(compositeModel, this.contextData);
              if (relationships && relationships[relType]) {
                  relationshipDetails.selfContext = relationships[relType].selfContext; // Set selfContext
                  let rel = relationships[relType] && relationships[relType].length ? relationships[relType][0] : undefined;
                  if (rel) {
                      let relatedEntityInfo = [];

                      if (rel.properties && Object.keys(rel.properties).length) {
                          relatedEntityInfo = rel.properties.relatedEntityInfo;
                          if (relatedEntityInfo && relatedEntityInfo.length) {
                              let relEntityTypes = relatedEntityInfo.map(function (relContext) {
                                  let relContextET = undefined;
                                  if (relContext.relEntityType) {
                                      relContextET = relContext.relEntityType;
                                  }
                                  return relContextET;
                              });
                              relationshipDetails.relatedEntityTypes =
                                  relEntityTypes; // Set relatedEntityTypes
                          }

                          relationshipDetails.mode = "asset"; // Set mode
                      }
                  }
              }
          }
      }

      if (!_.isEmpty(relationshipDetails)) {
          this._openLinkAssetsDialog(relationshipDetails);
      } else {
          this.logError("Link Assets - Composite model get response error", detail);
      }
  }

  async _triggerManageAttributes() {
      if(_.isEmpty(this._compositeModel)) {
          await this._getCompositeModel();
      }
      this._onAttributeCompositeModelGetResponse();
  }
  async _getCompositeModel() {
      let compositeModel = {};
      let entityCompositeModelManager = new EntityCompositeModelManager();
      let request = DataRequestHelper.createEntityModelCompositeGetRequest(this.contextData);
      delete request.params.fields.relationships;
      delete request.params.fields.relationshipAttributes;
      request.params.fields.attributes = ["_ALL"];
      if(entityCompositeModelManager && request) {
          compositeModel = await entityCompositeModelManager.get(request, this.contextData);
      }
      entityCompositeModelManager = null;
      this.set("_compositeModel", compositeModel);
      return compositeModel;
  }
  _onAttributeCompositeModelGetResponse() {
      let groupAttributes = [];
      let attributeModel = DataTransformHelper.transformAttributeModels(this._compositeModel, this.contextData);
      this.manageAttrGroups = this.manageAttrGroups.map(item => item.toLowerCase());
      let isManageAttrByProperty = !_.isEmpty(this.manageAttributeByProperty);
      let isManageAttrByGroup = !_.isEmpty(this.manageAttrGroups);

      //If props and group is not configured then no need go inside
      if (isManageAttrByProperty || isManageAttrByGroup) {
          for (let key in attributeModel) {
              if (isManageAttrByProperty) {
                  if (attributeModel[key].properties[this.manageAttributeByProperty.propertyName] == this.manageAttributeByProperty.propertyValue) {
                      groupAttributes.push(key);
                      continue;
                  }
              }
              if (isManageAttrByGroup) {
                  if (DataHelper.isValidObjectPath(attributeModel[key], 'properties.groupName') &&
                      this.manageAttrGroups.indexOf(attributeModel[key].properties.groupName.toLowerCase()) != -1) {
                      groupAttributes.push(key);
                  }
              }
          }
      }

      let allAttrNames = [];
      if (isManageAttrByProperty) {
          allAttrNames = groupAttributes;
      } else {
          // Merge config attributes and group attributes
          allAttrNames = (this.manageAttrNames || []).concat(groupAttributes);
      }

      if (allAttrNames.length > 0) {
          this._openManageAttributesDialog(this.manageAttrLabel, allAttrNames);
      } else {
          this.logError("Manage Attributes - Composite model get response error", this._compositeModel);
      }
  }
  _triggerManageRelationships(relationshipTypeName) {
      if (!this.getRelDomainsLiq) {
          return;
      }

      let req = {
          "params": {
              "query": {
                  "id": relationshipTypeName + "_relationshipModel",
                  "filters": {
                      "typesCriterion": ["relationshipModel"]
                  }
              },
              "fields": {}
          }
      };

      this.getRelDomainsLiq.requestData = req;
      this.getRelDomainsLiq.generateRequest();
  }
  _onRelModelsReceived(e, detail) {
      let responseContent = DataHelper.validateAndGetResponseContent(detail.response);
      if (responseContent) {
          let models = responseContent.entityModels;
          if (models && models.length > 0) {
              this._openManageRelationshipsDialog(models[0]);
          }
      } else {
          this.logError("Manage Relationships - relationship model get response error",
              detail);
      }
  }
  _onModelGetFailed(e) {
      this.logError("Manage Relationships - relationship model get response error", e.detail);
  }
  _onCompositeModelGetError(e) {
      this.logError("Composite model get exception", e.detail);
  }
  _openLinkAssetsDialog(relationshipDetails) {
      const {
          relType,
          relatedEntityTypes,
          mode,
          selfContext
      } = relationshipDetails;

      const {
          id,
          type
      } = ContextHelper.getFirstItemContext(this.contextData);

      const sharedData = {
          mode,
          "types-criterion": relatedEntityTypes,
          "relationship-type": relType,
          "selected-entities": [{
              id,
              type
          }],
          "self-context": selfContext
      };

      this.openBusinessFunctionDialog({
          name: "rock-wizard-entity-relationship-add",
          title: DataHelper.concatValuesFromArray([
              this.todoActionDialogTitle,
              this._entityName
          ])
      }, sharedData);
  }
  _openManageAttributesDialog(label, attributeNames) {
      let clonedContextData = DataHelper.cloneObject(this.contextData);

      let itemContext = ContextHelper.getFirstItemContext(clonedContextData);
      itemContext.attributeNames = attributeNames;

      const sharedData = {
          "context-data": clonedContextData,
          "config-context": {
              "groupName": label
          }
      };

      this.openBusinessFunctionDialog({
          name: "rock-wizard-attribute-manage",
          title: DataHelper.concatValuesFromArray([
              this.todoActionDialogTitle,
              ContextHelper.getDataContexts(this.contextData),
              this._entityName
          ])
      }, sharedData);
  }
  _openManageRelationshipsDialog(model) {
      const sharedData = {
          "config-context": {
              "addRelationshipMode": model.domain == "digitalAsset" ? "businessFunction" : "lov",
              "relationshipTypeName": model.name,
              "domain": model.domain
          }
      };

      this.openBusinessFunctionDialog({
          name: "rock-wizard-relationship-manage",
          title: DataHelper.concatValuesFromArray([
              this.todoActionDialogTitle,
              this._entityName
          ])
      }, sharedData);
  }
  _setDialogTitle(dialog) {
      if (this.todoActionDialogTitle) {
          dialog.setTitle(this.todoActionDialogTitle);
      }
  }
  summaryTofixTap(e, detail) {
      console.log("event triggered: " + detail.type + " >> " + detail.eventName + " >> " + detail.label);
  }
  onDimensionGridOpen(e, detail) {
      const sharedData = {
          "attribute-model-object": detail.data,
          "data-id": DataHelper.getParamValue("id"),
          "data-type": DataHelper.getParamValue("type"),
          "app-name": "app-entity-manage"
      };

      const dialogTitle =
          `Detailed Dimensional Edit for : ${detail.data.externalName}`;

      this.openBusinessFunctionDialog({
          name: "rock-wizard-dimension-grid",
          title: DataHelper.concatValuesFromArray([
              dialogTitle,
              this._entityName
          ])
      }, sharedData);
  }
  _editEvent(e) {
      if (e) {
          ComponentHelper.fireBedrockEvent("global-edit", e.detail, {
              ignoreId: true
          });
      }
  }
  errorLengthChanged(e, detail) {
      if (this.detailTabs) {
          this.detailTabs.errorLengthChanged(detail);
      }
  }
  _refreshView() {
      this._refreshRockEntityHeader();
      this._refreshRightSidePanel();
      if (this.detailTabs) {
          this.detailTabs.readyToRender(true);
          this.detailTabs.reloadCurrentTab();
      }
  }
  _refreshHeaderAndNavBars() {
      this._invalidateEntityCache = false;
      this._refreshRockEntityHeader();
      this._refreshActiveMenuItems();
      this._invalidateEntityCache = true;
  }
  getIsDirty() {
      if (this.detailTabs) {
          return this.detailTabs.getIsDirty();
      }
  }
  getControlIsDirty() {
      if (this.detailTabs) {
          return this.detailTabs.getControlIsDirty();
      }
  }

  _refreshTitleBar() {
      this.entityTitleBar.refreshTitleBar();
  }

  _onSetTitlebar(e, detail) {
      this.updateAppCurrentStatus(detail.mainTitle);
  }

  _reRenderOnDimensionChange(refreshEntityHeader = true) {
      if(refreshEntityHeader) {
          this._refreshRockEntityHeader();
      }
      this._refreshRightSidePanel();
      this._refreshTitleBar();
      this._toggleStepper();
      //Loading the details tab
      this._loadDetailTabs(1);
  }
  

  /**
   * Function to retry loading the detailTabs
   */
  _loadDetailTabs(retryCount, reloadTabs) {
      const maxRetryCount = 50;
      timeOut.after(ConstantHelper.MILLISECONDS_30).run(() => {
          if (!this.detailTabs) {
              if (retryCount < maxRetryCount) {
                  this._loadDetailTabs(++retryCount, reloadTabs);
              } else {
                  if(!this.isComponentErrored) {
                      this.showWarningToast("Click on the refresh button to reload the details tab");
                  }
                  let contentDiv = this.shadowRoot.querySelector("#tabsContent");
                  this.logError("app-entity-manage - The details tab did not load for entity id " +
                      this._entityId + " with entity type " + this._entityType, {},
                      true, "", contentDiv);
              }
          } else {
              this._debouncer = Debouncer.debounce(this._debouncer,
                  timeOut.after(ConstantHelper.MILLISECONDS_30), () => {
                      this.detailTabs.readyToRender(true);
                      if(reloadTabs) {
                          this.detailTabs.reloadTabs();
                      }
                  });
              return;
          }
      });
  }

  _onWorkflowTransitionComplete() {
      this._refreshRockEntityHeader();
      this._refreshRightSidePanel();
      ComponentHelper.fireBedrockEvent("workflow-panel-refreshed", "", {
          ignoreId: true
      });
  }
  _onWorkflowAssignmentComplete() {
      this._refreshRightSidePanel();
  }
  _refreshRockEntityHeader(e) {
      this._refreshTitleBar();
      this.entityHeader.refresh(this._invalidateEntityCache);

      if (e) {
          this._lastSavedTime = new Date().toLocaleString();
      }
      this._refreshEntityThumbnail();
  }
  _refreshRightSidePanel() {
      let data = {
          "contextData": this.contextData
      };
      ComponentHelper.fireBedrockEvent("workflow-refresh", data, {
          ignoreId: true
      });
      ComponentHelper.fireBedrockEvent("entity-history-refresh", data, {
          ignoreId: true
      });
  }
  _openEntityUploadBF() {
      this.openBusinessFunctionDialog({
          name: "rock-wizard-entity-upload"
      });
  }
  _refreshEntityThumbnail() {
      this.entityHeader.refreshThumbnail();
  }
  _refreshActiveMenuItems() {
      this._lastSavedTime = new Date().toLocaleString();
      let contentView = RUFUtilities.mainApp.contentViewManager.activeContentView;
      this.fireBedrockEvent("app-status-changed", {
          "viewName": contentView.name,
          "contentView": contentView,
          "config": undefined
      }, {
              appId: "main-app",
              ignoreId: true
          });
  }
  /*
   * Handling notification on quick manage save complete
   */
  _onQuickManageSaveComplete(e, data) {
      let dataIsDirty = false;
      let controlIsDirty = false;
      //Check if data is dirty
      if (this.getIsDirty) {
          dataIsDirty = this.getIsDirty();
      }
      //Check if controls are dirty
      if (this.getControlIsDirty) {
          controlIsDirty = this.getControlIsDirty();
      }
      let notificationObj = RUFUtilities.mainApp.$$("bedrock-dataobject-notification-handler");
      if (this._showNotificationToast) {
          notificationObj.showToast(data);
      } else if (dataIsDirty || controlIsDirty) {
          notificationObj.showToast(data);
      } else {
          //Refresh the current tab
          if (this.detailTabs) {
              if (data.quickManageInfo && !_.isEmpty(data.quickManageInfo)) {
                  let refreshOptions = {};
                  let quickManageInfo = data.quickManageInfo;
                  if (quickManageInfo.id && quickManageInfo.type) {
                      refreshOptions.partialRefresh = true;
                      refreshOptions.selectedItem = {
                          id: quickManageInfo.id,
                          type: quickManageInfo.type
                      };
                      if (data.description) {
                          refreshOptions.toastData = data;
                      }
                  }
                  this.detailTabs.refresh(refreshOptions);
              } else {
                  this.detailTabs.refresh();
              }
          }
      }

      //Refresh the Rightsidebar
      this._refreshRightSidePanel();
  }
  /*
   * Handling notification on govern complete
   */
  _onGovernComplete(e, data) {
      let dataIsDirty = false;
      let controlIsDirty = false;

      //refresh dimension selector
      if (data && data.actionType && data.actionType == "addContext") {
          ComponentHelper.fireBedrockEvent("refresh-context-selector", e.detail, {
              ignoreId: true
          });
          return true;
      }

      //Check if data is dirty
      if (this.getIsDirty) {
          dataIsDirty = this.getIsDirty();
      }

      //Check if controls are dirty
      if (this.getControlIsDirty) {
          controlIsDirty = this.getControlIsDirty();
      }

      let notificationObj = RUFUtilities.mainApp.$$("bedrock-dataobject-notification-handler");

      //Showing the toast message when _showNotificationToast property is set to true or if the tab is dirty, else refresh the current tab
      if (this._showNotificationToast) {
          notificationObj.showToast(data);
      } else if (dataIsDirty || controlIsDirty) {
          notificationObj.showToast(data);
      } else {
          ProgressTracker.resetProgress(true);

          //Reload all the tabs as enhancer attribute update may result
          //in more/less groups or more/less attributes in few groups
          this._loadDetailTabs(1, true);
          //Refresh the Rightsidebar
          this._refreshRightSidePanel();
          this._refreshRockEntityHeader();
      }
  }

  _onContextsChanged(e) {
      let newDimensions = e.detail.dimensions;
      ContextHelper.updateContextData(this.contextData, newDimensions);
      let selectedDimensionsDetail = e.detail.selectedDimensionsDetail;
      this.setNavigationData("rock-context-selector", selectedDimensionsDetail);
      this._onContextDataChanged();
  }

  _onWorkflowAvailable(e) {
      if (!_.isEmpty(this.contextData)) {
          if (this.contextData.ItemContexts && this.contextData.ItemContexts.length > 0) {
              let runtimeInstanceEntities = e.detail.response && e.detail.response.content && e.detail.response.content.entities ? e.detail.response.content.entities : [];
              this._workflowInfo = runtimeInstanceEntities[0];
          }
      }
  }

  /**
   * Set the navigationData
  **/
  _onNavigationChange(e) {
      if(e && e.detail) {
          this.setChildNavigationData(e.detail.parentElement,e.detail.childElement,e.detail.properties);
      }
  }
}
customElements.define(AppEntityManage.is, AppEntityManage)
