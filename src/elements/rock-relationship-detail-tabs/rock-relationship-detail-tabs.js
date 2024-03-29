/**
@group rock Elements
@element rock-relationship-detail-tabs
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '../rock-tabs/rock-tabs.js';
import '../rock-component-config-behavior/rock-component-config-behavior.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockRelationshipDetailTabs
    extends mixinBehaviors([RUFBehaviors.UIBehavior, RUFBehaviors.ComponentContextBehavior, RUFBehaviors.ComponentConfigBehavior], PolymerElement) {
  static get template() {
    return html`
        <style include="bedrock-style-common">
            :host{
                display:block;
                height:100%;
            }
            rock-tabs {
                --rock-tab-content: {
                    overflow-y: auto;
                    font-size: var(--default-font-size, 14px);                   
                }
                --tab-error-circle: {
                    margin-bottom: 8px;
                }
            }
        </style>
        <rock-tabs id="rockTabs" view-mode="{{viewMode}}" view-mode-sub-menu="{{viewModeSubMenu}}" context-data="[[contextData]]" config="[[_tabsConfig]]" readonly="[[readonly]]" deferred-render=""></rock-tabs>
        <bedrock-pubsub event-name="tab-nav-change" handler="_onNavigationChange"></bedrock-pubsub>
`;
  }

  static get is() { return 'rock-relationship-detail-tabs' }
  ready() {
     
      super.ready();
  }
  static get properties() {
      return {
          contextData: {
              type: Object,
              value: function() {
                  return {};
              },
              observer: '_onContextDataChange'
          },
          readonly: {
              type: Boolean,
              value: false
          },
          _tabsConfig: {
              type: Object,
              value: function() {
                  return {};
              }
          },
          viewMode:{
              type:String,
              value:""
          },
          viewModeSubMenu: {
              type: String,
              value: ""
          }
      }
  }
  /**
  *
  */
  connectedCallback() {
      super.connectedCallback();
  }
  /**
  *
  */
  disconnectedCallback() {
      super.disconnectedCallback();
  }
  _onContextDataChange() {
      if(!_.isEmpty(this.contextData)) {
          let context = DataHelper.cloneObject(this.contextData);
          //App specific
          if(!context.hasOwnProperty(ContextHelper.CONTEXT_TYPE_APP)){
              let appName = ComponentHelper.getCurrentActiveAppName();
              if(appName) {
                  context[ContextHelper.CONTEXT_TYPE_APP] = [{
                      "app": appName
                  }];
              }
          }
          
          //Set the default navigation for rock-tabs
          let navContextObj = this.contextData[ContextHelper.CONTEXT_TYPE_NAVIGATION];
          if(!_.isEmpty(navContextObj)) {
          let navCtxObj = navContextObj[0][RockRelationshipDetailTabs.is];
              if(navCtxObj && navCtxObj["rock-tabs"]){
                  this.viewMode = navCtxObj["rock-tabs"].viewMode;
                  this.viewModeSubMenu = navCtxObj["rock-tabs"].viewModeSubMenu;
              }
          }
              this.requestConfig('rock-relationship-detail-tabs', context);
      }
  }
  onConfigLoaded(componentConfig) {
      if(componentConfig && componentConfig.config) {
          let config = componentConfig.config;
          if(!_.isEmpty(config.tabItems) && !_.isEmpty(this.contextData)) {
          // adding context-data to menu-provider for relationships
              if(DataHelper.isValidObjectPath(config, 'tabItems.relationships.menuProviderComponent.properties')) {
                  config.tabItems.relationships.menuProviderComponent.properties['context-data'] = this.contextData;
              }
              
              // adding context-data to child classification
              if(DataHelper.isValidObjectPath(config, 'tabItems.relationships.menuItems.0.component.properties')) {
                  config.tabItems.relationships.menuItems[0].component.properties['context-data'] = this.contextData;
              }

              if(DataHelper.isValidObjectPath(config, 'tabItems.relationships.component.properties')) {
                  config.tabItems['relationships'].component.properties['context-data'] = this.contextData;
              }
          }
          config.tabItems = DataHelper.convertObjectToArray(config.tabItems);    

          this._tabsConfig = config;
      }
  }
  errorLengthChanged(detail) {
      let rockTabs = this.shadowRoot.querySelector('rock-tabs');
      if(rockTabs) {
          rockTabs._currentTabErrorLength = detail;
      }
  }
  reloadCurrentTab() {
      let rockTabs = this.shadowRoot.querySelector('rock-tabs');
      if(rockTabs) {
          rockTabs.reloadCurrentTab(); 
      }
  }
  reloadTabs() {
      let rockTabs = this.shadowRoot.querySelector('rock-tabs');
      if(rockTabs) {
          rockTabs.reloadTabs();
      }
  }
  readyToRender(ready) {
      let rockTabs = this.shadowRoot.querySelector('rock-tabs');
      if(rockTabs) {
          rockTabs.readyToRender(ready);
      }   
  }
  refresh(options) {
      let rockTabs = this.shadowRoot.querySelector('rock-tabs');
      if(rockTabs) {
          rockTabs.refresh(options);
      }    
  }
  getIsDirty() {
      let tabs = this.shadowRoot.querySelector("rock-tabs");
      if (tabs && tabs.getIsDirty) {
          return tabs.getIsDirty();
      }
  }
  getControlIsDirty() {
      let tabs = this.$$("rock-tabs");
      if (tabs && tabs.getControlIsDirty) {
          return tabs.getControlIsDirty();
      }
  }
  _onNavigationChange(e) {
      if(e.detail && e.detail.targetId && e.detail.targetId == "rockTabs") {
          let eventDetail = {
              "parentElement" : RockRelationshipDetailTabs.is,
              "childElement" : "rock-tabs",
              "properties" : e.detail 
          }                   
          ComponentHelper.fireBedrockEvent("navigation-change", eventDetail , { ignoreId: true });
      }
  }
}
customElements.define(RockRelationshipDetailTabs.is, RockRelationshipDetailTabs);
