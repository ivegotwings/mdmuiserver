/**
`rock-entity-header` Represents an entity header in the entity manage App. It contains the following items:

      1. The attributes of the entity that needs display in the header section.

      2. The percentage completion of the entity with the notifications that also indicates warnings.

      3. An Invalid and missed fields of an entity.

      4. A button toolbar with different actions performed on the entity.

An element accepts the attribute list of the respective entity, entity's profile completion, and actions to be
performed.

@group rock Elements
@element rock-entity-header
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

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
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-buttons.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import LiquidDataObjectUtils from '../liquid-dataobject-utils/liquid-dataobject-utils.js'
import '../liquid-entity-data-get/liquid-entity-data-get.js';
import '../liquid-dataobject-utils/liquid-dataobject-utils.js';
import '../liquid-entity-data-save/liquid-entity-data-save.js';
import '../liquid-entity-model-composite-get/liquid-entity-model-composite-get.js';
import '../pebble-actions/pebble-actions.js';
import '../pebble-button/pebble-button.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-image-viewer/pebble-image-viewer.js';
import '../pebble-toolbar/pebble-toolbar.js';
import '../pebble-echo-html/pebble-echo-html.js';
import '../pebble-horizontal-divider/pebble-horizontal-divider.js';
import '../pebble-info-icon/pebble-info-icon.js';
import '../rock-entity-thumbnail/rock-entity-thumbnail.js';
import '../rock-business-actions/rock-business-actions.js';
import '../rock-entity-actions/rock-entity-actions.js';
import '../rock-component-config-behavior/rock-component-config-behavior.js';
import '../rock-classification-tree/rock-classification-tree.js';
import './progress-icons.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockEntityHeader
extends mixinBehaviors([
    RUFBehaviors.ComponentContextBehavior,
    RUFBehaviors.UIBehavior,
    RUFBehaviors.ComponentConfigBehavior
], PolymerElement) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-icons bedrock-style-grid-layout bedrock-style-padding-margin bedrock-style-buttons">
            :host {
                width: 100%;
                display: -webkit-box;
                display: -webkit-flex;
                display: -ms-flexbox;
                display: flex;
                padding-top: 10px;
                padding-right: 0;
                padding-bottom: 10px;
                padding-left: 0;
                box-sizing: border-box;

                --paper-menu-background-color: #ffffff;
                --pebble-horizontal-divider-color: #616161;
            }

            pebble-toolbar {
                --pebble-button: {
                    padding-top: 0;
                    padding-right: 0;
                    padding-bottom: 0;
                    padding-left: 0;
                    margin-top: 0;
                    margin-right: 0;
                    margin-bottom: 0;
                    margin-left: 0;
                }
            }

            #headerSection {
                width: 100%;
                display: flex;
                position: relative;
                transition: 0.3s ease all;
                padding: 0px 20px;
                height: 100px;
                max-height: 200px;
                -webkit-transition: all 0.3s;
                -moz-transition: all 0.3s;
                -o-transition: all 0.3s;
                transition: all 0.3s;
            }

            #attributePanel,
            #attributeErrorPanel {
                display: flex;
                flex-wrap: wrap;
                -webkit-flex-wrap: wrap;
                width: 70%;
                -webkit-transition: all 0.3s;
                -moz-transition: all 0.3s;
                -o-transition: all 0.3s;
                transition: all 0.3s;
                overflow: hidden;
                height: 100%;
                padding: 13px 0px;
            }

            .attribute {
                width: 25%;
                line-height: 16px;
                padding-right: 20px;
                -webkit-transition: all 0.4s;
                -moz-transition: all 0.4s;
                -o-transition: all 0.4s;
                transition: all 0.4s;
                padding-bottom: 10px;
            }

            .attribute pebble-icon {
                display: none;
            }

            .attribute:hover pebble-icon:hover {
                cursor: pointer;

                --pebble-icon-color: {
                    fill: var(--primary-icon-color, #75808b);
                }
            }

            .attribute:hover pebble-icon {
                display: block;
                transition: all 0.3s;
                -webkit-transition: all 0.3s;
                -ms-transition: all 0.3s;

                --pebble-icon-color: {
                    fill: var(--secondary-icon-color, #c1cad4);
                }
            }

            #attrName {
                font-family: var(--default-font-family);
                font-size: var(--font-size-sm, 12px);
                font-weight: normal;
                font-style: normal;
                font-stretch: normal;
                color: var(--attribute-name-color, #839cb1);
                display: flex;
            }




            #attrVal {
                font-size: 13px;
                font-weight: normal;
                color: var(--text-primary-color, #364653);
                display: flex;
                min-height: 16px;
            }

            #buttonPanel {
                display: flex;
                display: -webkit-flex;
                position: relative;
                width: 30%;
                justify-self: flex-end;
                justify-content: flex-end;
                transition: all 0.3s;
                -webkit-transition: all 0.3s;
                -ms-transition: all 0.3s;
            }

            rock-entity-thumbnail {
                width: 90px;
                height: 60px;
                align-self: center;
                padding-right: 20px;
                -webkit-transition: all 0.3s;
                -moz-transition: all 0.3s;
                -o-transition: all 0.3s;
                transition: all 0.3s;
            }

            #headerSection.header-collapse {
                height: 45px;
                padding: 0 20px;
            }

            .header-collapse #attributePanel {
                padding-top: 12px;
            }

            .info-icon {
                margin-left: 3px;
                margin-top: -2px;
            }

            .header-collapse rock-entity-thumbnail {
                width: 40px;
                height: 30px;
                padding-right: 15px;
                -webkit-transition: all 0.3s;
                -moz-transition: all 0.3s;
                -o-transition: all 0.3s;
                transition: all 0.3s;
            }

            .toggle-area-outside {
                background: transparent;
                position: absolute;
                height: 1px;
                bottom: 1px;
                width: 100%;
            }

            .toggle-area {
                position: absolute;
                left: 50%;
                height: 20px;
                width: 40px;
                bottom: -1px;
                background: var(--palette-pale-grey, #e6ebf0);
                border-top-left-radius: 100px;
                border-top-right-radius: 100px;
                transition: transform 0.4s linear;
                transform-origin: bottom center;
                transform-style: preserve-3D;
                z-index: 1;
            }

            .icon-wrapper {
                line-height: 20px;
                cursor: pointer;
                width: 12px;
                margin: 1px auto;
            }

            .attr-item--value {
                max-width: calc(100% - 20px);
            }

            .attribute:not(.trim) .attr-item--value {
                display: -webkit-box;
                word-break: break-word;
                -webkit-box-orient: vertical;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: normal;
                -webkit-line-clamp: 4;
             }	           

            .header-collapse .toggle-area {
                transform: rotatex(180deg);
                -webkit-transform: rotatex(180deg);
                -moz-transform: rotatex(180deg);
                -ms-transform: rotatex(180deg);
                -o-transform: rotatex(180deg);
            }

            .icon-wrapper pebble-icon {
                text-align: center;
            }

            @supports (-ms-ime-align:auto) {

                #headerSection,
                .attribute,
                rock-entity-thumbnail,
                #attributePanel,
                #attributeErrorPanel {
                    transition: initial;
                }
            }

            .header-right-panel {
                display: flex;
                width: calc(100% - 90px);
                align-items: center;
                -webkit-transition: all 0.3s;
                -moz-transition: all 0.3s;
                -o-transition: all 0.3s;
                transition: all 0.3s;
            }

            .header-collapse .header-right-panel {
                width: calc(100% - 35px);
            }
            .trim .ellipsis{
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }	            

            rock-entity-actions {
                display: flex;
                align-items: center;
            }
        </style>
        <div id="headerSection" class\$="[[_getCollapseClass()]]">
            <template is="dom-if" if="[[collapsable]]">
                <div class="toggle-area-outside">
                    <div class="toggle-area">
                        <div class="icon-wrapper" on-tap="_toggleCollapse">
                            <pebble-icon icon="pebble-icon:action-less" class="pebble-icon-size-12"></pebble-icon>
                        </div>
                    </div>
                </div>
            </template>
            <rock-entity-thumbnail id="entityThumbnail" config="[[thumbnailConfig]]" default-thumbnail-id="[[_defaultThumbnailId]]"></rock-entity-thumbnail>
            <div class="header-right-panel">
                <div id="attributePanel" hidden\$="[[_showErrorMessage]]">
                    <template id="headerAttributes" is="dom-repeat" items="[[_headerAttributeValues]]">
                        <div id="attribute" class$="[[_computeAttributeClass(item)]]">
                            <div id="attrName">
                                <span class="text-ellipsis">[[_getAttributeLabel(item)]]</span>
                                <template is="dom-if" if="[[_getDescriptionInfo(item)]]">
                                    <pebble-info-icon description-object="[[_getDescriptionInfo(item)]]" class="info-icon"></pebble-info-icon>
                                </template>
                            </div>
                            <div id="attrVal" title="[[item.value]]">
                                <div class="attr-item--value ellipsis">
                                <template is="dom-if" if="[[!_isPathAttributeAndLessThanFour(item)]]">
                                     [[item.value]]
                                </template>
                                <template is="dom-if" if="[[_isPathAttributeAndLessThanFour(item)]]">
                                    <pebble-echo-html html="[[_getItemValue(item)]]"></pebble-echo-html>
                                </template>                                
                                </div>
                                <template is="dom-if" if="[[_isPathAttributeAndHasWritePermission(item)]]">
                                    <pebble-icon icon="pebble-icon:Open-window" class="pebble-icon-size-14 m-l-5" on-tap="_onPathAttributeEdit" attribute-name="[[item.name]]"></pebble-icon>
                                </template>
                            </div>
                        </div>
                    </template>
                </div>
                <div id="attributeErrorPanel" hidden\$="[[!_showErrorMessage]]"></div>
                <div id="buttonPanel">
                    <template is="dom-if" if="[[writePermission]]">
                        <template is="dom-if" if="[[businessActionsConfig.showActions]]">
                            <rock-business-actions id="businessActions" context-data="[[contextData]]" workflow-info="[[workflowInfo]]" show-workflow-actions="" is-single-entity-process=""></rock-business-actions>
                        </template>
                    </template>
                    <rock-entity-actions id="entityActions" context-data="[[contextData]]"></rock-entity-actions>
                    <bedrock-pubsub event-name="rock-toolbar-button-event" handler="_onToolbarEvent" target-id="entityActions"></bedrock-pubsub>
                    <bedrock-pubsub event-name="rock-toolbar-reset" handler="_resetToolbarButtons" target-id="entityActions"></bedrock-pubsub>
                    <bedrock-pubsub event-name="tabs-change" handler="_onTabsChange"></bedrock-pubsub>
                </div>
            </div>

            <pebble-dialog id="attributeEditDialog" modal="" show-close-icon="" no-cancel-on-outside-click="" no-cancel-on-esc-key="">
                <div id="classificationContent" style="height:85vh">
                    <div id="categoryTreeContainer" title="dialog-title" class="button-siblings">
                        <rock-classification-tree id="classification-contextTree" context-data="[[contextData]]" disable-child-node="" root-node-external-name="{{rootNodeExternalName}}"></rock-classification-tree>
                    </div>
                    <div id="exportActions" class="buttonContainer-static" align="center">
                        <pebble-button class="btn btn-secondary m-r-5" id="cancel" button-text="Cancel" raised="" on-tap="_onCancelHeaderSave"></pebble-button>
                        <pebble-button class="btn btn-success" id="save" button-text="Save" raised="" on-tap="_onSaveHeaderAttribute"></pebble-button>
                    </div>
                </div>
            </pebble-dialog>


        </div>
        <liquid-entity-data-get name="attributeGetDataService" operation="getbyids" request-data="{{headerAttributeRequest}}" last-response="{{_headerAttributesGetResponse}}" on-response="_onHeaderAttributesGetResponse" on-error="_onHeaderAttributesGetResponseError" include-type-external-name=""></liquid-entity-data-get>
        <liquid-entity-model-composite-get name="compositeAttributeModelGet" request-data="{{headerAttributeModelRequest}}" on-entity-model-composite-get-response="_onCompositeModelGetResponse"></liquid-entity-model-composite-get>
        <liquid-entity-data-save name="attributeSaveDataService" operation="[[_entityDataOperation]]" request-data="{{_saveRequest}}" last-response="{{_saveResponse}}" on-response="_onSaveResponse" on-error="_onSaveError"></liquid-entity-data-save>
`;
  }

  static get is() {
      return 'rock-entity-header'
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
          headerConfig: {
              type: Array,
              value: []
          },

          /**
           * Indicates the request object that is passed to the data element to retrieve the attribute data.
           Sample: {
                      action: "getAttributes"
                      }
           */
          headerAttributeRequest: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          /**
           * Indicates the request object that is passed to the data element to retrieve the attribute model data.
           Sample: {
                      action: "getAttributeModels"
                      }
           */
          headerAttributeModelRequest: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _entityDataOperation: {
              type: String,
              value: 'update'
          },
          _currentAttributeInEdit: {
              type: String,
              value: 'update'
          },
          _saveResponse: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _saveRequest: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _headerAttributeValues: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          _headerAttributeModels: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          /**
           * Specifies whether or not to write the logs.
           */
          verbose: {
              type: Boolean,
              value: false
          },
          _entityAttributes: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          _referenceAttributeModels: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          _messageAttribute: {
              type: String,
              value: null
          },
          _messageAttributeValue: {
              type: String,
              value: null
          },
          collapse: {
              type: Boolean,
              value: false
          },
          collapsable: {
              type: Boolean,
              value: false
          },
          workflowInfo: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _headerAttributesGetResponse: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          dataIndex: {
              type: String,
              value: "entityData"
          },
          writePermission: {
              type: Boolean,
              value: false
          },
          _currentTab: {
              type: String,
              value: ""
          },
          rootNodeExternalName: {
              type: String,
              value: ""
          },
          metaDataColumnFound : {
            type: Boolean,
            value: false
          },
          _showErrorMessage: {
              type: Boolean,
              value: false
          }
      }
  }
  static get observers() {
      return [
          '_setHeaderValuesAsPerConfig(_headerAttributeValues)'
      ]
  }
  ready() {
      super.ready();
  }
  _getDescriptionInfo(item) {
      return this._headerAttributeModels[item.name] && this._headerAttributeModels[item.name].properties || {};
  }

  _onContextDataChange() {
      if (!_.isEmpty(this.contextData)) {
          let context = DataHelper.cloneObject(this.contextData);
          this._setWritePermission();
          //App specific
          let appName = ComponentHelper.getCurrentActiveAppName();
          if (appName) {
              context[ContextHelper.CONTEXT_TYPE_APP] = [{
                  "app": appName
              }];
          }

          //Updating the navigation state
          let navContextObj = this.contextData[ContextHelper.CONTEXT_TYPE_NAVIGATION];
          if (!_.isEmpty(navContextObj)) {
              let navCtxObj = navContextObj[0][RockEntityHeader.is];
              if (navCtxObj && navCtxObj.headerCollapse) {
                  let headerCollapse = navCtxObj.headerCollapse;
                  if (headerCollapse) {
                      let headerSection = this.shadowRoot.querySelector('#headerSection');
                      if (headerSection) {
                          headerSection.classList.remove('header-collapse');
                          this._toggleCollapse();
                      }
                  }
              }
          }

          if (this.contextData.DomainContexts &&
              this.contextData.DomainContexts.length !== 0) {
              this.requestConfig('rock-entity-header', context);
          }
      }
  }

  _isPathAttributeAndHasWritePermission(item) {
      if (!_.isEmpty(this._headerAttributeModels) &&
          this._headerAttributeModels.hasOwnProperty(item.name)) {
          let attrModel = this._headerAttributeModels[item.name];
          return attrModel && attrModel.displayType === "path" && attrModel.hasWritePermission;
      }
      return false;
  }
  _isPathAttributeAndLessThanFour(item){
    if (!_.isEmpty(this._headerAttributeModels) &&
          this._headerAttributeModels.hasOwnProperty(item.name)) {
          let attrModel = this._headerAttributeModels[item.name];
          return attrModel && attrModel.displayType === "path" && this._headerAttributeValues.length <=4;
      }
      return false;
}
  _getItemValue(item){
      let attributeValue;
      if(item && !_.isEmpty(item.value)){
        attributeValue = Array.isArray(item.value)?item.value[0]:item.value;
        return attributeValue.split('>>').join('>><wbr/>');
      }
      return "";
  }

  onConfigLoaded(componentConfig) {
      if (componentConfig && componentConfig.config) {
          this.headerConfig = DataHelper.convertObjectToArray(componentConfig.config.headerConfig);
          this.thumbnailConfig = componentConfig.config.thumbnailConfig;
          this.businessActionsConfig = componentConfig.config.businessActionsConfig;
          //Set the data-index and data-sub-index for liquid-entity-model-get call using liquid-entity-data-get
          if (componentConfig.config["dataIndex"]) {
              this.dataIndex = componentConfig.config["dataIndex"];
          }

          this._debouncer = Debouncer.debounce(this._debouncer, timeOut.after(100), () => {
              this.refresh(false);
          });
      }
  }

  _setHeaderValuesAsPerConfig() {
      if (this._headerAttributeValues && this._headerAttributeValues.length > 0 && this._messageAttribute) {
          for (let i = 0; i < this._headerAttributeValues.length; i++) {
              if (this._headerAttributeValues[i].name == this._messageAttribute) {
                  let configItem = this._getConfigItem(this.headerConfig, this._headerAttributeValues[i].name);
                  this._messageAttributeValue = this._headerAttributeValues[i].value;

                  //Remove if attribute not for header
                  if (!configItem) {
                      this._headerAttributeValues.splice(i, 1);

                  }

                  break;
              }
          }
      }
  }
  _getCollapseClass() {
      if (this.collapsable && this.collapse) {
          return "header-collapse";
      } else {
          return "";
      }
  }
  _toggleCollapse() {
      let headerSection = this.shadowRoot.querySelector('#headerSection');
      let mainApp = RUFUtilities.mainApp;
      let windowInnerHeight;
      let headerCollapse = false;
      if (headerSection.classList.contains('header-collapse')) {
          headerSection.classList.remove('header-collapse');
          if (!(window.navigator.userAgent.indexOf("Edge") > -1)) {
              windowInnerHeight = window.innerHeight;
              mainApp.updateStyles({
                  '--window-inner-height': windowInnerHeight + 'px'
              });
          }
      } else {
          headerSection.classList.add('header-collapse');
          headerCollapse = true;
          if (!(window.navigator.userAgent.indexOf("Edge") > -1)) {
              windowInnerHeight = window.innerHeight + 45;
              mainApp.updateStyles({
                  '--window-inner-height': windowInnerHeight + 'px'
              });
          }
      }

      //Set navigationContext
      let eventDetail = {
          "parentElement": RockEntityHeader.is,
          "properties": {
              "headerCollapse": headerCollapse
          }
      }
      this.fireBedrockEvent("navigation-change", eventDetail, {
          ignoreId: true
      });
  }
  /**
   * <b><i>Content development is under progress... </b></i>
   */
  refresh(invalidateEntityCache = true) {

      if (invalidateEntityCache) {
          //Invalidate entity cache
          let entity = this._getEntityObject();
          LiquidDataObjectUtils.invalidateDataObjectCache(entity, this.dataIndex);
      }

      //refreshing rock-business-actions
      let rockBusinessActions = this.shadowRoot.querySelector('#businessActions');

      if (rockBusinessActions) {
          rockBusinessActions.reloadComponent();
      }

      // ContextHelper.isValidContext(itemContext.type, dataContext, valueContext, valid, invalid);
      this._startDataLoad();
      this._refreshEntityThumbnail();
  }
  _refreshEntityThumbnail() {
      let entityThumbnailComp = this.shadowRoot.querySelector("rock-entity-thumbnail");
      if (entityThumbnailComp) {
          entityThumbnailComp.contextData = this.contextData;
      }
  }
  _onToolbarEvent(e, detail) {
      this.fireBedrockEvent("toolbar-button-event", detail);
  }
  _startDataLoad() {
      let headerConfig = this.headerConfig;

      if (headerConfig && headerConfig.length > 0 && this.contextData) {
          let attributeNames = [];

          for (let i = 0; i < headerConfig.length; i++) {
              if (headerConfig[i].attributeName) {
                  attributeNames.push(headerConfig[i].attributeName);
              }
          }

          //Add messageAttribute if not available in the request attributes list
          if (this.businessActionsConfig && this.businessActionsConfig.messageAttribute) {
              this._messageAttribute = this.businessActionsConfig.messageAttribute;
              if (attributeNames.indexOf(this._messageAttribute) == -1) {
                  attributeNames.push(this._messageAttribute);
              }
          }

          let itemContext = this.getFirstItemContext();
          //add attribute names in item context
          itemContext.attributeNames = attributeNames;

          let compositeModelGetRequest = DataRequestHelper.createEntityModelCompositeGetRequest(this.contextData);
          // adding enhancer attribute names fromcontextModel call.
          this.set("headerAttributeModelRequest", compositeModelGetRequest);
          let liquidModelGet = this.shadowRoot.querySelector("[name=compositeAttributeModelGet]");
          if (liquidModelGet) {
              liquidModelGet.generateRequest();
          }
      }
  }
  _onCompositeModelGetResponse(e) {
      if (e && e.detail && DataHelper.validateGetAttributeModelsResponse_New(e.detail.response)) {
          let entityModel = e.detail.response.content.entityModels[0];
          let properties = entityModel.properties;
          let headerAttributeModels;
          let headerAttributeSortByConfig = {};
          let attributeNames = [];
          if (properties.hasOwnProperty("defaultThumbnailId")) {
              this._defaultThumbnailId = properties.defaultThumbnailId;
          }
          headerAttributeModels = DataTransformHelper.transformAttributeModels(e.detail.response.content.entityModels[0], this.contextData, this.writePermission);
          if (this.headerConfig && this.headerConfig.length > 0 && headerAttributeModels) {
              let attributeName;
              for (let i = 0; i < this.headerConfig.length; i++) {
                  let attributeName = this.headerConfig[i].attributeName;
                  if (attributeName && headerAttributeModels[attributeName]) {
                      headerAttributeSortByConfig[attributeName] = headerAttributeModels[attributeName];
                      attributeNames.push(attributeName);
                  }
              }
              this._headerAttributeModels = headerAttributeSortByConfig;
          } else {
              this._headerAttributeModels = headerAttributeModels;
          }
          let clonedContextData = DataHelper.cloneObject(this.contextData);
          if (clonedContextData) {
              //add attribute names in item context
              let itemContext = this.getFirstItemContext();
              itemContext.attributeNames = attributeNames;
              clonedContextData[ContextHelper.CONTEXT_TYPE_ITEM] = [itemContext];
              this.set("headerAttributeRequest", DataRequestHelper.createEntityGetRequest(clonedContextData, true));
              this.shadowRoot.querySelector("liquid-entity-data-get").generateRequest();
          }
      } else {
          this._showMessage();
          let attrErrorContainer = this.$$('#attributeErrorPanel');
          this.logError("rock-entity-header - Header attribute models get response error", e.detail, true, "", attrErrorContainer);
      }
  }
  async _onHeaderAttributesGetResponse(e) {
      let headerAttributeResponse = e.detail.response;

      let attributesData = [];
      if (DataHelper.validateGetEntitiesResponse(headerAttributeResponse) && this._headerAttributeModels) {
          let entity = headerAttributeResponse.content.entities[0];

          if (entity) {
              attributesData = DataTransformHelper.transformAttributes(entity, this._headerAttributeModels, this.contextData, "array", false);
              this._entityAttributes = attributesData;

              let self = this;
              //Find the date attributes and change the values from ISO
              Object.keys(this._headerAttributeModels).map(function (attributeModel) {
                  if (self._headerAttributeModels[attributeModel] &&
                      (self._headerAttributeModels[attributeModel].dataType == "datetime" ||
                          self._headerAttributeModels[attributeModel].dataType == "date")) {
                      let datatype = self._headerAttributeModels[attributeModel].dataType;
                      for (let i = 0; i < attributesData.length; i++) {
                          if (self._headerAttributeModels[attributeModel].name == attributesData[i].name) {
                              attributesData[i].value = FormatHelper.convertFromISODateTime(attributesData[i].value, datatype);
                              break;
                          }
                      }
                  }
              });

              this._setMetadataAttributes(entity);
              this.set("_headerAttributeValues", this._entityAttributes);
              if(_.isEmpty(this._headerAttributeModels) && !this.metaDataColumnFound){
                    this._showMessage("Attributes are not available or there is no permission. Contact administrator");
                }
                else{
                    this._showErrorMessage = false;
                    this.$.headerAttributes.render();
                }
          }
      } else {
          this._showMessage();
          let attrErrorContainer = this.$$('#attributeErrorPanel');
          this.logError("rock-entity-header - Header attributes get response error", e.detail, true, "", attrErrorContainer);
      }
  }

  _onHeaderAttributesGetResponseError(e) {
      this._showMessage();
      let attrErrorContainer = this.$$('#attributeErrorPanel');
      this.logError("rock-entity-header - Header attributes get response error", e.detail, true, "", attrErrorContainer);
  }

  _setMetadataAttributes(entity) {
      if (this.headerConfig && this.headerConfig.length > 0) {
          for (let i = 0; i < this.headerConfig.length; i++) {
              if (this.headerConfig[i].isMetadataAttribute) {
                  let value = entity[this.headerConfig[i].attributeName];
                    let attrObj = {
                        "name": this.headerConfig[i].attributeName,
                        "value": !_.isEmpty(value) ? value : ""
                    };
                    this.metaDataColumnFound = true;
                    this._entityAttributes.push(attrObj);
              }
          }
      }
  }

  _getAttributeLabel(attributeItem) {
      let configItem = this._getConfigItem(this.headerConfig, attributeItem.name);

      if (configItem && configItem.label) {
          return configItem.label;
      }

      let attributeModel = this._headerAttributeModels[attributeItem.name];

      if (attributeModel && attributeModel.properties && attributeModel.properties.externalName) {
          return attributeModel.properties.externalName;
      }
  }
  _getAttributeValue(values, configItem) {
      let attrValue = "";
      for (let i = 0; i < values.length; i++) {
          let attributes = values[i].attributes;
          for (let j = 0; j < attributes.length; j++) {
              if (attributes[j].name == configItem.attributeName) {
                  attrValue = attributes[j].value;
              }
          }
      }
  }
  _onPathAttributeEdit(e) {
      let attributeName = e.currentTarget.attributeName;
      this._currentAttributeInEdit = attributeName;
      let attrEditDialog = this.$.attributeEditDialog;

      if (this._headerAttributeModels[attributeName].displayType === "path") {
          // path type attribute Edit
          if (attrEditDialog) {
              let classificationDialog = this.shadowRoot.querySelector("#classification-contextTree");
              let selectedClassifications = [];
              let contextTree = this.shadowRoot.querySelector("#classification-contextTree");
              let pathSeperatorElement;
              if (contextTree) {
                  if (DataHelper.isValidObjectPath(this._headerAttributeModels[attributeName], 'properties.pathEntityInfo.0')) {
                      let properties = this._headerAttributeModels[attributeName].properties;
                      let {
                          pathEntityType,
                          pathRelationshipName,
                          rootNode,
                          pathSeperator
                      } = properties.pathEntityInfo[0];
                      pathSeperatorElement = pathSeperator;
                      contextTree.pathEntityType = pathEntityType;
                      contextTree.pathRelationshipName = pathRelationshipName;
                      contextTree.rootNode = rootNode;
                      contextTree.multiSelect = properties.isCollection;
                      contextTree.leafNodeOnly = properties.isLeafNodeOnly;
                  }
                  //setting pebble-dialog title
                  let classificationElements;
                  attrEditDialog.dialogTitle = "Edit" + " " + pathSeperatorElement + " " + this._headerAttributeModels[attributeName].externalName;
                  if (!_.isEmpty(this._headerAttributeValues)) {
                      this._headerAttributeValues.forEach(valueObject => {
                          if (valueObject.name === this._currentAttributeInEdit) {
                              classificationElements = _.isArray(valueObject.value) ? valueObject.value : [valueObject.value];
                          }
                      })
                  }
                  if (!_.isEmpty(classificationElements)) {
                      classificationElements.forEach(classificationElement => {
                          let classificationTags = classificationElement.split(pathSeperatorElement);
                          classificationTags.shift();
                          selectedClassifications.push(classificationTags);
                      })
                  }
                  contextTree.selectedClassifications = selectedClassifications;
                  contextTree.generateRequest();
                  contextTree.clearSelectedItems();

                  attrEditDialog.open();
              } else {
                  this.logError("Cannot find rock-classification-selector in DOM");
              }

          }
      }
  }

  _isDirtyCheck(pathTypeAttributeValues) {
      let selectedAttributeValues;
      if (DataHelper.isValidObjectPath(pathTypeAttributeValues, 'values.0')) {
          selectedAttributeValues = pathTypeAttributeValues.values.map(valueObject => {
              return valueObject.value;
          });
      }
      let headerAttributeValues = this._headerAttributeValues;

      for (let i = 0; i < headerAttributeValues.length; i++) {
          if (headerAttributeValues[i].name === this._currentAttributeInEdit) {
              if (DataHelper.compareObjects(headerAttributeValues[i].value, selectedAttributeValues)) {
                  return false;
              }
          }
      }
      return true;
  }

  _onSaveHeaderAttribute() {
    if (DataHelper.isValidObjectPath(this._headerAttributesGetResponse, 'content.entities.0.data.attributes') ||
        DataHelper.isValidObjectPath(this._headerAttributesGetResponse, 'content.entities.0.data.contexts.0.attributes')) {
          let classificationTree = this.shadowRoot.querySelector('#classification-contextTree');
          let selectedItems;
          if (!this.rootNodeExternalName) {
              this.logError("Classification root node extenal name missing, cannot process save.");
              return;
          }
          if (classificationTree) {
              selectedItems = classificationTree.selectedClassifications;
              let classificationPaths = selectedItems.map(elm => {
                return elm.externalNamePath;
              });
              let attributeForSave = this._currentAttributeInEdit;
              let headerAttributeModel = this._headerAttributeModels[attributeForSave];
              if (headerAttributeModel && headerAttributeModel.displayType === "path") {
                  let pathTypeAttributeValues;
                  pathTypeAttributeValues = this._getFormattedPathTypeObject(classificationPaths, headerAttributeModel.isLocalizable);
                  let isDelete = false;
                  if (_.isEmpty(classificationPaths)) {
                      /**
                       * If classificationPaths are empty, either none are selected or
                       * all selected paths are unselected. If none are selected, we show 
                       * No changes toast message. If all selected paths are un selected
                       * then we need to send action delete flag for each path in update request
                       * in respective context.
                       * **/
                      isDelete = true;
                  }
                  let isDirty = this._isDirtyCheck(pathTypeAttributeValues);
                  if (!isDirty) {
                      this.showInformationToast('No changes to save');
                      return;
                  }
                  let entityForSave = DataHelper.cloneObject(this._headerAttributesGetResponse);
                  let firstDataContext = this.getFirstDataContext();
                  let data = entityForSave.content.entities[0].data;
                  // contextual save
                  if (!_.isEmpty(firstDataContext)) {
                      if (isDelete && !_.isEmpty(data.contexts)) {
                          data.contexts.forEach(contextItem => {
                              if (_.isEqual(firstDataContext, contextItem.context)) {
                                  this._setDeleteFlagForValues(contextItem.attributes, attributeForSave);
                              }
                          })
                      } else {
                          data.contexts = [];
                          let attributes = {};
                          attributes[attributeForSave] = pathTypeAttributeValues;
                          let ctxObj = {
                              "context": firstDataContext,
                              "attributes": attributes
                          }
                          data.contexts.push(ctxObj);
                      }
                  } else {
                      if (isDelete) {
                          this._setDeleteFlagForValues(data.attributes, attributeForSave);
                      } else {
                          data.attributes = {}
                          data.attributes[attributeForSave] = pathTypeAttributeValues;
                      }

                  }
                  this._saveRequest = {
                      "entities": entityForSave.content.entities
                  };
                  this._saveAttribute();
              } else {
                  //Save logic for all non-path type attributes goes here
              }
          } else {
              this.logError('Cannot find rock-classification-tree element in dom');
          }
      }
  }

  /**
   * Update all the values of the path attribte with action: delete
   * flag to delete the values.
   * **/
  _setDeleteFlagForValues(attributes, attributeForSave) {
      let attribute = attributes[attributeForSave];
      if (attribute && !_.isEmpty(attribute.values)) {
          attribute.values.forEach((value) => {
              value.action = "delete";
          });
      }
  }

  _getFormattedPathTypeObject(classificationPaths, isLocalizable) {
      let pathTypeAttributeValues = {
          values: []
      }

      let firstValueContext = isLocalizable ? ContextHelper.getFirstValueContext(this.contextData) : DataHelper.getDefaultValContext();
      if (!_.isEmpty(classificationPaths)) {
          classificationPaths.forEach(path => {
              let valueObject = {
                  value: path
              }
              AttributeHelper.populateValueContext(valueObject, firstValueContext);

              pathTypeAttributeValues.values.push(valueObject);
          })
      } else {
          let valueObject = {
              value: ""
          }
          AttributeHelper.populateValueContext(valueObject, firstValueContext);
          pathTypeAttributeValues.values.push(valueObject);
      }
      return pathTypeAttributeValues;

  }

  _saveAttribute() {
      let liquidSave = this.shadowRoot.querySelector(
          "[name=attributeSaveDataService]");
      if (liquidSave) {
          liquidSave.generateRequest();
      } else {
          this.logError(
              "Save failed: Not able to access attributeSaveDataService liquid");
      }
  }

  _onSaveResponse(e, detail) {
      if (e.detail.response.status == "success") {
          this.showSuccessToast(detail.response.content.msg);
          let attrEditDialog = this.$.attributeEditDialog;
          if (attrEditDialog) {
              attrEditDialog.close();
          }
          this.refresh(true);
      } else {
          this.showWarningToast("Attribute save failed");
          this.logError("Attribute save failed. Response status is error", e.detail);
      }
  }

    _onCancelHeaderSave() {
        let attrEditDialog = this.$.attributeEditDialog;
        if (attrEditDialog) {
            attrEditDialog.close();
        }
    }
    _computeIcon(percentage) {
        let per = Math.round(percentage / 10) * 10;
        return "pebble-icon:percentage-circle";
    }
    _computeAttributeClass(attributeValue) {
        let configItem = this._getConfigItem(this.headerConfig, attributeValue.name);
        if (configItem) {
            if (configItem.noTrim && this._headerAttributeValues && this._headerAttributeValues.length <=4){
                return "attribute";
            } else {
                return "attribute trim";
            }
        }
    }
  _getConfigItem(headerConfig, attributeName) {
      if (!headerConfig) {
          return;
      }

      for (let i = 0; i < headerConfig.length; i++) {
          if (headerConfig[i].attributeName == attributeName) {
              return headerConfig[i];
          }
      }
  }

  _getEntityObject() {
      let itemCtx = ContextHelper.getFirstItemContext(this.contextData);
      let entity = {
          "id": itemCtx.id,
          "type": itemCtx.type
      };
      return entity;
  }

  _onTabsChange(event) {
      if (event && event.detail) {
          let ignoreList = ["workflow", "recentActivity"];
          if (ignoreList.indexOf(event.detail) != -1) {
              return;
          }
          this._currentTab = event.detail;
          this._resetToolbarButtons();
      }
  }

  _resetToolbarButtons(event) {
      let hideButton = false;
      if (this._currentTab == 'summary' || this._currentTab == 'entity-graph') {
          hideButton = true;
      }

      let toolbar = this.shadowRoot.querySelector('#entityActions');
      if (toolbar) {
          toolbar.setAttributeToToolbarButton("edit", "hidden", hideButton);
      }
  }

  refreshThumbnail() {
      let entityThumbnail = this.shadowRoot.querySelector('#entityThumbnail');
      if (entityThumbnail) {
          entityThumbnail.refreshThumbnail();
      }
  }

  _setWritePermission() {
      let writePermission = true;
      let itemContext = this.getFirstItemContext();
      if (DataHelper.isValidObjectPath(itemContext, "permissionContext.writePermission")) {
          writePermission = itemContext.permissionContext.writePermission;
      }

      this.set("writePermission", writePermission);
  }

  _showMessage(message) {
      if(message) {
          let attrErrorContainer = this.$$('#attributeErrorPanel');
          if(attrErrorContainer) {
            attrErrorContainer.innerHTML = message;
          }
      }
      this._showErrorMessage = true;
  }
}
customElements.define(RockEntityHeader.is, RockEntityHeader)
