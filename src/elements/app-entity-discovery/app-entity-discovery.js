import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import '../bedrock-app-behavior/bedrock-app-behavior.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-navigation-behavior/bedrock-navigation-behavior.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../rock-layout/rock-titlebar/rock-titlebar.js';
import '../rock-layout/rock-layout.js';
import '../rock-layout/rock-titlebar/rock-titlebar.js';
import '../rock-context-selector/rock-context-selector.js';
import '../rock-layout/rock-header/rock-header.js';
import '../rock-entity-search-discovery/rock-entity-search-discovery.js';
import '../rock-component-config-behavior/rock-component-config-behavior.js';
import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class AppEntityDiscovery
    extends mixinBehaviors([
        RUFBehaviors.AppBehavior,
        RUFBehaviors.ComponentConfigBehavior,
        RUFBehaviors.NavigationBehavior
    ], OptionalMutableData(PolymerElement)) {
  static get template() {
    return html`
        <style include="bedrock-style-common">
            rock-entity-search-discovery {
                padding-top: 20px;
                --search-result-height: {
                    @apply --app-entity-discovery-content-height;
                }
            }
            .contextContainer{
                width:100%;
            }

            rock-layout {
                --scroller: {
                    overflow-x: hidden;
                    overflow-y: hidden;
                }
            }
        </style>
        <rock-layout>
            <rock-titlebar slot="rock-titlebar" icon="pebble-icon:search-entity" main-title="[[titlebarHeader]]" non-minimizable="[[appConfig.nonMinimizable]]" non-closable="[[appConfig.nonClosable]]">
                <div id="contextContainer" align="right" class="contextContainer">
                    <rock-context-selector id="contextSelector" navigation-data="[[navigationData]]" context-data="[[contextData]]" app-name="app-entity-discovery" domain="[[domain]]" all-single-select="" selected-dimensions-detail="{{_selectedDimensions}}" pre-selected-contexts="[[_preSelectedContexts]]"></rock-context-selector>
                </div>
            </rock-titlebar>
            <template is="dom-if" if="{{isElementLoaded}}">
                <rock-entity-search-discovery domain="[[domain]]" model-domain="[[modelDomain]]" id="entitySearchDiscoveryGrid" context-data="[[contextData]]" selected-dimensions="{{_selectedDimensions}}" allowed-entity-types="[[_allowedEntityTypes]]" search-query="[[_searchQuery]]" saved-search-id="[[_savedSearchId]]" workflow-name="[[_workflowName]]" workflow-short-name="[[_workflowShortName]]" workflow-activity-name="[[_workflowActivityName]]" workflow-activity-external-name="[[_workflowActivityExternalName]]" business-condition-name="[[_businessConditionName]]" business-condition-external-name="[[_businessConditionExternalName]]" user="[[_user]]" status="[[_status]]" requested-entity-types="[[_scopedEntityTypes]]" workflow-mapped-contexts="[[_mappedContexts]]" on-load="updateAppCurrentStatus" external-search-entity-types="[[_externalSearchEntityTypes]]" external-search-relationships="[[_externalSearchRelationships]]" external-search-attributes="[[_externalSearchAttributes]]">
                </rock-entity-search-discovery>
            </template>
        </rock-layout>
        <bedrock-pubsub event-name="grid-link-clicked" handler="_onEntitySearchDiscoveryLinkClicked"></bedrock-pubsub>
        <bedrock-pubsub event-name="context-selector-data-changed" handler="_onContextsChanged" target-id="contextSelector"></bedrock-pubsub>
`;
  }

  static get is() { return 'app-entity-discovery' }

  static get properties() {
      return {
          _selectedDimensions: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          appConfig: {
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
          isElementLoaded: {
              type: Boolean,
              value: false
          },
          domain: {
              type: String,
              value: "thing"
          },
          modelDomain: {
              type: String,
              value: ""
          },
          queryParams: {
              type: String,
              value: ""
          },
          _scopedEntityTypes: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          _mappedContexts: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          titlebarHeader: {
              type: String,
              value: ""
          },
          navigationData: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _preSelectedContexts: {
              type: Object,
              value: function () {
                  return {};
              }
          }
      }
  }

  static get observers() {
      return [
          '_onContextDataChange(contextData,domain)'
      ]
  }

  ready() {
      super.ready();
      let domain = this.getProp("domain");
      //var domain = DataHelper.getParamValue('domain');
      if (domain) {
          this.set("domain", domain);
      }
      this._allowedEntityTypes = this.appSetting("dataDefaults").entityTypes[this.domain];
      // Read query string values
      let stateData = DataHelper.getStateFromQueryParams(true);
      this._searchQuery = DataHelper.getParamValue("searchtext");
      this._savedSearchId = DataHelper.getParamValue("_savedSearchId");
      this._externalSearchEntityTypes = (stateData && stateData.entityTypes) ? stateData.entityTypes : DataHelper.getParamValue("entityTypes");
      this._externalSearchRelationships = (stateData && stateData.relationships) ? stateData.relationships : DataHelper.getParamValue("relationships");
      this._externalSearchAttributes = (stateData && stateData.attributes) ? stateData.attributes : DataHelper.getParamValue("attributes");
      this._workflowName = (stateData && stateData.wfName) ? stateData.wfName : DataHelper.getParamValue("wfName");
      this._workflowShortName = (stateData && stateData.wfShortName) ? stateData.wfShortName : DataHelper.getParamValue("wfShortName");
      this._workflowActivityName = (stateData && stateData.wfActivityName) ? stateData.wfActivityName : DataHelper.getParamValue("wfActivityName");
      this._workflowActivityExternalName = (stateData && stateData.wfActivityExternalName) ? stateData.wfActivityExternalName : DataHelper.getParamValue("wfActivityExternalName");
      this._businessConditionName = (stateData && stateData.bcId) ? stateData.bcId : DataHelper.getParamValue("bcId");
      this._businessConditionExternalName = (stateData && stateData.bcExternalName) ? stateData.bcExternalName : DataHelper.getParamValue("bcExternalName");
      this._user = (stateData && stateData.user) ? stateData.user : DataHelper.getParamValue("user");
      this._status = (stateData && stateData.status) ? stateData.status : DataHelper.getParamValue("status");
      let mappedEntityTypes = (stateData && stateData.mappedEntityTypesString) ? stateData.mappedEntityTypesString : DataHelper.getParamValue("mappedEntityTypesString");
      let mappedContexts = (stateData && stateData.mappedContextsString) ? stateData.mappedContextsString : DataHelper.getParamValue("mappedContextsString");
      if (stateData) {
          if (stateData.type) {
              this.push("_scopedEntityTypes", stateData.type);
          }
          if (stateData.modelDomain) {
              this.set("modelDomain", stateData.modelDomain);
          }
      }
      if (mappedEntityTypes && mappedEntityTypes !== "") {
          this._scopedEntityTypes = mappedEntityTypes.split("#@#");
      }

      this._mappedContexts = mappedContexts && mappedContexts !== "" ? JSON.parse(mappedContexts) : [];
      let preSelectedContexts = this._preparepreSelectedContexts();
      this.set("_preSelectedContexts", preSelectedContexts);
  }

  _onContextDataChange() {
      if (!_.isEmpty(this.contextData) && this.domain) {
          let context = DataHelper.cloneObject(this.contextData);
          //App specific
          let appName = ComponentHelper.getCurrentActiveAppName();
          if (appName) {
              context[ContextHelper.CONTEXT_TYPE_APP] = [{
                  "app": appName
              }];
          }
          context[ContextHelper.CONTEXT_TYPE_DOMAIN] = [{
              "domain": this.domain
          }];
          this.requestConfig("rock-entity-discovery-titlebar", context);
      }
  }

  get contextSelector() {
      this._contextSelector = this._contextSelector || this.shadowRoot.querySelector("#contextSelector");
      return this._contextSelector;
  }

  onConfigLoaded(componentConfig) {
      if (componentConfig && componentConfig.config) {
          this.titlebarHeader = componentConfig.config.title;
      }
  }

  constructor() {
      super();
      let userContext = {
          "roles": this.roles,
          "user": this.userId,
          "ownershipData": this.ownershipData,
          "tenant": this.tenantId,
          "defaultRole": this.defaultRole
      };

      this.contextData[ContextHelper.CONTEXT_TYPE_USER] = [userContext];

      this.preloadEntityManage();
  }

  preloadEntityManage() {
      afterNextRender(this, () => {
          import("../app-entity-manage/app-entity-manage.js");
      });
  }

  disconnectedCallback() {
      super.disconnectedCallback();
  }

  connectedCallback() {
      super.connectedCallback();
      this._searchTimeStamp = new Date().toLocaleString();
      if (!_.isEmpty(this.contextData)) {
          let navContextArr = this.contextData[ContextHelper.CONTEXT_TYPE_NAVIGATION];
          if(!_.isEmpty(navContextArr) && navContextArr[0]["rock-context-selector"]){
              this.navigationData = navContextArr[0]["rock-context-selector"];
          }
      }
  }

  _preparepreSelectedContexts() {
      let preSelectedContexts = {};
      if(!_.isEmpty(this._mappedContexts) && !("self" in this._mappedContexts[0])) {
          this._mappedContexts.forEach(function (context) {
              Object.keys(context).forEach((key) => {
                  let ctxObj = {
                      "id": context[key],
                      "title": context[key],
                      "type": key
                  };
                  preSelectedContexts[key] = preSelectedContexts[key] || [];
                  if(!preSelectedContexts[key].find(obj => obj.id === ctxObj.id)) {
                      preSelectedContexts[key].push(ctxObj);
                  }
              }, this);
          }, this);
      }

      return preSelectedContexts;
  }

  getAppCurrentStatus(customArgs) {
      if (customArgs && customArgs.queryParams) {
          this.queryParams = customArgs.queryParams;
      }
      return {
          title: "Search & Refine",
          subTitle: "Last Opened",
          subTitleValue: this._searchTimeStamp ? this._searchTimeStamp : new Date().toLocaleString(),
          queryParams: this.queryParams,
          appId: this.appId
      };
  }

  updateAppCurrentStatus(e, customArgs) {
      let appStatus = this.getAppCurrentStatus();
      appStatus.title = customArgs.title;
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

  _onContextDataChanged() {
      /***TODO: Discuss why we had to reset the whole context data here?
          In contextData change obesrver, we have only config get request which is solely
          dependent on app and domain. On dimensions change we don't need to request for config.
          Hence commenting out.**/
      // var contextData = this.contextData;
      // this.contextData = {}; // To notify
      // this.contextData = contextData;
      this.isElementLoaded = true;
      this._searchDiscoveryEl = this._searchDiscoveryEl || this.shadowRoot.querySelector("#entitySearchDiscoveryGrid");
      if(this._searchDiscoveryEl){
          this._searchDiscoveryEl.reload();
      }else{
          Debouncer.debounce(this._debouncer, timeOut.after(200), () => {
              if (this.isElementLoaded && this._searchDiscoveryEl) {
                  this._searchDiscoveryEl.reload();
              }
          });
      }
  }

  _onContextsChanged(e) {
      let newDimensions = DataHelper.cloneObject(e.detail.dimensions);
      newDimensions["app"] = ["app-entity-discovery"];
      if(e.detail && e.detail.selectedDimensionsDetail) {
          let selectedDimensionsDetail = e.detail.selectedDimensionsDetail;
          this.setNavigationData("rock-context-selector", selectedDimensionsDetail);
          this.navigationData = selectedDimensionsDetail;
      }

      if (this.domain) {
          newDimensions["domain"] = [this.domain];
      }

      ContextHelper.updateContextData(this.contextData, newDimensions);                
      this._onContextDataChanged();
  }

  _onEntitySearchDiscoveryLinkClicked(e){
      if(e && e.detail && e.detail.link && e.detail.link.indexOf("entity-manage") > -1 && e.detail.id && !_.isEmpty(this.navigationData)){
          this.setNavigationData("rock-context-selector", this.navigationData, null ,"entity-manage",e.detail.id);
      }
  }
}
customElements.define(AppEntityDiscovery.is, AppEntityDiscovery)
