/* <link rel="import" href="../bedrock-style-manager/styles/bedrock-style-common.html">


<link rel="import" href="../liquid-entity-data-get/liquid-entity-data-get.html">
<link rel="import" href="../liquid-entity-model-composite-get/liquid-entity-model-composite-get.html">
<link rel="import" href="../liquid-entity-govern-data-get/liquid-entity-govern-data-get.html">
<link rel="import" href="../liquid-entity-model-get/liquid-entity-model-get.html">
<link rel="import" href="../liquid-dataobject-utils/liquid-dataobject-utils.html">
<link rel="import" href="../liquid-rest/liquid-rest.html">

<link rel="import" href="../pebble-actions/pebble-actions.html">
<link rel="import" href="../pebble-button/pebble-button.html">
<link rel="import" href="../pebble-image-viewer/pebble-image-viewer.html">
<link rel="import" href="../pebble-toolbar/pebble-toolbar.html">
<link rel="import" href="../pebble-popover/pebble-popover.html">
<link rel="import" href="../pebble-horizontal-divider/pebble-horizontal-divider.html">
<link rel="import" href="../pebble-info-icon/pebble-info-icon.html"> */
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import '@polymer/iron-ajax/iron-ajax.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-helpers/data-request-helper.js';
import '../bedrock-helpers/data-transform-helper.js';
import '../bedrock-helpers/context-helper.js';
import '../bedrock-helpers/attribute-helper.js';
import '../bedrock-helpers/component-helper.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-helpers/format-helper.js';
import '../rock-component-config-behavior/rock-component-config-behavior.js';
import '../rock-tabs/rock-tabs.js';
import '../bedrock-logger-behavior/bedrock-logger-behavior.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockEntitySidebar
    extends mixinBehaviors([
    RUFBehaviors.ComponentContextBehavior,
    RUFBehaviors.UIBehavior,
    RUFBehaviors.ComponentConfigBehavior,
    RUFBehaviors.LoggerBehavior
    ], PolymerElement) {
  static get template() {
    return Polymer.html`
        <style>
            :host {
                width: 100%;
                height:100%;
                display: -webkit-box;
                display: -webkit-flex;
                display: -ms-flexbox;
                display: flex;
                padding-right: 0;
                padding-left: 0;
                box-sizing: border-box;
                @apply --rock-sidebar-contents;
            }
            rock-tabs{                
                width:100%;
                --pebble-tab:{
                    margin-left:20px;
                }
                --pebble-tab-group:{
                    margin-bottom: 0px;
                };
            }
        </style>
            <template is="dom-if" if="{{hasComponentErrored(isComponentErrored)}}">
                <div id="error-container"></div>
            </template>
            
            <template is="dom-if" if="{{!hasComponentErrored(isComponentErrored)}}">
                <rock-tabs id="sidebarTabs" view-mode="{{viewMode}}" view-mode-sub-menu="{{viewModeSubMenu}}" config="{{config}}" readonly="[[readonly]]"></rock-tabs>
                <bedrock-pubsub event-name="tab-nav-change" handler="_onNavigationChange"></bedrock-pubsub>
            </template>
`;
  }

  static get is() {
      return 'rock-entity-sidebar';
  }

  static get properties() {
          return {
              contextData: {
                  type: Object,
                  value: function () {
                      return {};
                  },
                  observer: '_onContextDataChange'
              },
              /**
               * If set as true , it indicates the component is in read only mode
               */
              readonly: {
                  type: Boolean,
                  value: false
              },
              /**
               * Indicates the attributes that gets displayed in the header section.
               */
              config: {
                  type: Object,
                  value: function () {
                      return {};
                  }
              },

              collapse: {
                  type: Boolean,
                  value: false
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
   * <b><i>Content development is under progress... </b></i>
   */
  getTabConfig() {
      if (this.config && this.config.tabItems) {
          return this.config.tabItems;
      }
  }

  connectedCallback(){
      super.connectedCallback();    
      if (!_.isEmpty(this.contextData)) {
          let context = DataHelper.cloneObject(this.contextData);
          //Set the default navigation for rock-tabs
          let navContextObj = context.NavigationContexts;
          if(!_.isEmpty(navContextObj)){
              let navCtxObj = navContextObj[0][RockEntitySidebar.is];
              if(navCtxObj && navCtxObj["rock-tabs"]) {
                  this.viewMode = navCtxObj["rock-tabs"].viewMode;
                  this.viewModeSubMenu = navCtxObj["rock-tabs"].viewModeSubMenu;
              }
          }
      }
  }

  _onContextDataChange() {
      if (!_.isEmpty(this.contextData)) {
          let context = DataHelper.cloneObject(this.contextData);
          //App specific
          let appName = ComponentHelper.getCurrentActiveAppName();
          if (appName) {
              context[ContextHelper.CONTEXT_TYPE_APP] = [{
                  "app": appName
              }];
          }

          this.requestConfig("rock-entity-sidebar", context);
      }
  }
  onConfigLoaded (componentConfig) {
      if(componentConfig && componentConfig.config) {
          componentConfig.config.tabItems = DataHelper.convertObjectToArray(componentConfig.config.tabItems);;
          
          this.config = componentConfig.config;
          //Read the navigationContext and give preference to that
          if(this.collapse){
              this.fireBedrockEvent("collapse-sidebar","",{ ignoreId: true });
          } else if(componentConfig.config.collapse){
              this.fireBedrockEvent("collapse-sidebar","",{ ignoreId: true });
          }
      } else {
          this.logError(this.tagName + " Component configuration is missing", "", true);
      }
  }

  _onNavigationChange(e) {
      if(e.detail && e.detail.targetId && e.detail.targetId == "sidebarTabs") {
          let eventDetail = {
              "parentElement" : RockEntitySidebar.is,
              "childElement" : "rock-tabs",
              "properties" : e.detail 
          }                   
          ComponentHelper.fireBedrockEvent("navigation-change", eventDetail , { ignoreId: true });
      }
  }
}
customElements.define(RockEntitySidebar.is, RockEntitySidebar)
