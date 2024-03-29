/**
@group rock Elements
@element rock-entity-titlebar
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '../bedrock-helpers/attribute-helper.js';
import '../bedrock-helpers/context-helper.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-helpers/entity-helper.js';
import '../liquid-entity-data-get/liquid-entity-data-get.js';
import '../rock-layout/rock-titlebar/rock-titlebar.js';
import '../rock-context-selector/rock-context-selector.js';
import '../rock-component-config-behavior/rock-component-config-behavior.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import EntityTypeManager from '../bedrock-managers/entity-type-manager.js'
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';

class RockEntityTitlebar
    extends mixinBehaviors([RUFBehaviors.UIBehavior, RUFBehaviors.ComponentContextBehavior, RUFBehaviors.ComponentConfigBehavior], PolymerElement) {
  static get template() {
    return html`
        <style include="bedrock-style-common">
            rock-titlebar {
                color: var(--pagetitle-text-color, #034c89);
                font-weight: var(--font-bold, bold);
            }

            rock-context-selector {
                margin-right: 10px;
                --dimesion-selector-container-popover: {
                    width: 70px;
                }
                ;
                --dimesion-selector-source-popover: {
                    width: 55px;
                }
                ;
                --dimesion-selector-date-dropdown: {
                    width: 60px;
                }
                ;
                --dimesion-selector-locale-popover: {
                    width: 65px;
                }
                ;
            }

            #contextContainer {
                align-self: center;
                -webkit-align-self: center;
                width: 100%;
            }
        </style>
        <style>
        </style>
            <template is="dom-if" if="{{hasComponentErrored(isComponentErrored)}}">
                <div id="error-container"></div>
            </template>
            <template is="dom-if" if="{{!hasComponentErrored(isComponentErrored)}}">
                <rock-titlebar icon="pebble-icon:view-dashboard" main-title="[[mainTitle]]" sub-title="[[subTitle]]" config="[[_titlebarConfig]]" non-minimizable="[[appConfig.nonMinimizable]]" non-closable="[[appConfig.nonClosable]]">
                    <div id="contextContainer" align="right">
                        <rock-context-selector id="contextSelector" navigation-data="[[navigationData]]" entity-id="[[_entityId]]" entity-type="[[_entityType]]" app-name="[[appName]]" domain="[[domain]]" context-data="[[contextData]]" enable-select-all=""></rock-context-selector>
                    </div>
                </rock-titlebar>
            </template>
        <liquid-entity-data-get name="attributeGetDataServiceForTitleBar" operation="getbyids" data-index="[[dataIndex]]" on-response="_onTitleAttributesGetResponse" on-error="_onTitleAttributesGetError"></liquid-entity-data-get>
        <bedrock-pubsub event-name="context-selector-data-changed" handler="_onContextsChanged" target-id="contextSelector"></bedrock-pubsub>
`;
  }

  static get is() { return 'rock-entity-titlebar' }
  ready() {
      super.ready();
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
          appConfig: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          appName: {
              type: String,
              value: null
          },
          domain: {
              type: String,
              value: null
          },
          _entityId: {
              type: String,
              value: null
          },
          _entityType: {
              type: String,
              value: null
          },
          mainTitle: {
              type: String,
              value: null
          },
          subTitle: {
              type: String,
              value: null
          },
          _titlebarConfig: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          titleAttributeRequest: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          dataIndex: {
              type: String,
              value: "entityData"
          },
          navigationData: {
              type: Object,
              value: function () {
                  return {};
              }
          }
      }
  }
  /**
  *
  */
  connectedCallback() {
      super.connectedCallback();
  }

  get attributeGetDataServiceForTitleBarLiq() {
      this._attributeGetDataServiceForTitleBar = this._attributeGetDataServiceForTitleBar || this.shadowRoot.querySelector("[name=attributeGetDataServiceForTitleBar]");
      return this._attributeGetDataServiceForTitleBar;
  }
  /**
  *
  */
  disconnectedCallback() {
      super.disconnectedCallback();
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
          
          let navContextObj = this.contextData[ContextHelper.CONTEXT_TYPE_NAVIGATION];
          if(!_.isEmpty(navContextObj) && navContextObj[0]["rock-context-selector"]){
              this.navigationData = navContextObj[0]["rock-context-selector"];
          }
          if (!_.isEmpty(context.DomainContexts)) {
              this.requestConfig('rock-entity-titlebar', context);
          }
      }
  }
  onConfigLoaded(componentConfig) {
      if (componentConfig && componentConfig.config) {
          this._titlebarConfig = componentConfig.config;

          //Set the data-index and data-sub-index for liquid-entity-model-get call using liquid-entity-data-get
          if (componentConfig.config["dataIndex"]) {
              this.dataIndex = componentConfig.config["dataIndex"];
          }
          if (this.contextData && this.contextData.ItemContexts && this.contextData.ItemContexts.length) {
              let entity = this.contextData.ItemContexts[0];
              this._entityId = entity.id;
              this._entityType = entity.type;
          }
          this.refreshTitleBar();
      }
      
  }

  refreshTitleBar() {
      let config = this._titlebarConfig;
      if (_.isEmpty(config) || !this.attributeGetDataServiceForTitleBarLiq) return;

      let attributeNames = [];
      if (config.titleAttribute != "") {
          attributeNames.push(config.titleAttribute);
      }
      if (config.subtitleAttribute != "") {
          attributeNames.push(config.subtitleAttribute);
      }
      if (attributeNames.length > 0) {
          if (this.contextData && this.contextData.ItemContexts && this.contextData.ItemContexts.length > 0) {
              let itemContext = this.contextData.ItemContexts[0];
              //add attribute names in item context
              itemContext.attributeNames = attributeNames;
              let req = DataRequestHelper.createEntityGetRequest(this.contextData, true);
              this.attributeGetDataServiceForTitleBarLiq.requestData = req;
              this.attributeGetDataServiceForTitleBarLiq.generateRequest();
          }
      }
  }

  _onTitleAttributesGetResponse(e) {
      let titleAttributeResponse = e.detail.response;

      let attributesData = [];
      if (DataHelper.validateGetEntitiesResponse(titleAttributeResponse)) {

          let entity = titleAttributeResponse.content.entities[0];

          if (entity) {
              this.setTitleBar(entity);
          }
      } else {
          this.set("mainTitle", "Title could not be loaded");
          this.logError("rock-entity-titlebar - Title attribute get response error", e.detail);
      }
  }

  _onTitleAttributesGetError(e) {
      this.set("mainTitle", "Title could not be loaded");
      this.logError("rock-entity-titlebar - Title attribute get response error", e.detail);
  }

  async setTitleBar(entity) {
      let config = this._titlebarConfig;

      let titleAttribute = !_.isEmpty(config.titleAttribute) ? EntityHelper.getAttribute(entity, config.titleAttribute) : undefined;
      let subtitleAttribute = !_.isEmpty(config.subtitleAttribute) ? EntityHelper.getAttribute(entity, config.subtitleAttribute) : undefined;

      let mainTitle = this._getTitlebarValueFromAttribute(titleAttribute);
      let subTitle = this._getTitlebarValueFromAttribute(subtitleAttribute);

      //Check for the entity property 
      if(!mainTitle && entity[config.titleAttribute]){
          mainTitle = entity[config.titleAttribute];  
      }
      
      mainTitle = (mainTitle && mainTitle != ConstantHelper.NULL_VALUE) ? mainTitle : entity.id;

      if (!subTitle) {
          subTitle = await EntityTypeManager.getInstance().getTypeExternalNameByIdAsync(entity.type);
      }

      if (!mainTitle || mainTitle == "") {
          mainTitle = "No Title";
      }
      if (!subTitle || subTitle == "") {
          subTitle = "No Sub-Title";
      }

      this.mainTitle = mainTitle;
      this.subTitle = subTitle;

      //after setting the title raise an event
      this.fireBedrockEvent('on-set-titlebar', { "mainTitle": this.mainTitle });
  }

  _getTitlebarValueFromAttribute(attribute) {
      let firstValueContext = ContextHelper.getFirstValueContext(this.contextData);
      let defaultValCtx = DataHelper.getDefaultValContext();
      let value = undefined;

      if (attribute && attribute.values) {
          let currentValues = AttributeHelper.getAttributeValues(attribute.values, firstValueContext);
          if (_.isEmpty(currentValues)) {
              currentValues = AttributeHelper.getAttributeValues(attribute.values, defaultValCtx);
          }
          if (!_.isEmpty(currentValues)) {
              value = currentValues[0];
          }
      }

      return value;
  }

  _onContextsChanged(e) {
      this.fireBedrockEvent('context-selector-data-changed', e.detail);
  }

  get contextSelector() {
      this._contextSelector = this._contextSelector || this.shadowRoot.querySelector("#contextSelector");

      return this._contextSelector;
  }

  getContextSelectorConfig() {
      return this.contextSelector ? this.contextSelector.getcontextSelectorConfig() : null;
  }

  getSelectedDimension() {
      return this.contextSelector ? this.contextSelector.getSelectedDimensions() : null;
  }
}
customElements.define(RockEntityTitlebar.is, RockEntityTitlebar);
