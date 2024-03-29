/**
<b><i>Content development is under progress... </b></i>

@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-helpers/context-helper.js';
import '../bedrock-helpers/data-request-helper.js';
import '../bedrock-helpers/data-transform-helper.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-flex-layout.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import '../pebble-button/pebble-button.js';
import '../pebble-dialog/pebble-dialog.js';
import '../pebble-icons/pebble-icons.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-image-viewer/pebble-image-viewer.js';
import '../pebble-vertical-divider/pebble-vertical-divider.js';
import '../pebble-toolbar/pebble-toolbar.js';
import '../pebble-horizontal-divider/pebble-horizontal-divider.js';
import '../rock-entity-quick-manage-elements/rock-entity-quick-manage-elements.js';
import '../rock-tabs/rock-tabs.js';
import '../rock-image-viewer/rock-image-viewer.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import EntityCompositeModelManager from '../bedrock-managers/entity-composite-model-manager.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockEntityQuickManage extends mixinBehaviors([RUFBehaviors.UIBehavior,
    RUFBehaviors.ComponentContextBehavior, RUFBehaviors.ComponentConfigBehavior
], OptionalMutableData(PolymerElement)) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-grid-layout bedrock-style-icons bedrock-style-padding-margin bedrock-style-flex-layout">
            :host {
                display: block;
                height: 100%;
            }

            .thumb-image {
                width: 50px;
                height: 50px;
            }

            .product-head {
                padding-left: 5px;
                font-size: 13px;
                color: var(--palette-cloudy-blue, #c1cad4);
            }

            .product-name {
                padding-left: 5px;
                font-weight: var(--font-bold, bold);
            }

            .product-right {
                text-align: right;
            }

            rock-entity-header {
                --attribute-panel-width: 60%;
                --attribute-width: 100%;
                @apply --rock-entity-manage-header;
            }

            .trim {
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;
            }

            .first-row {
                padding-top: 10px;
                font-size: var(--default-font-size, 14px);
            }

            .right-section {
                text-align: right;
            }

            .right-section pebble-button {
                --pebble-button: {
                    min-width: 2em;
                }
            }

            #attrName {
                font-size: var(--font-size-sm, 12px);
                color: var(--palette-cloudy-blue, #c1cad4);
            }

            #attrVal {
                font-weight: var(--font-bold, bold);
                max-width: 250px;
            }

            #quick-manage-header {
                border-bottom: 1px solid var(--palette-cloudy-blue, #c1cad4);
                @apply --quick-manage-header;
            }

            #maximize {
                color: var(--icon-color, #757575);
                padding: 0 5px;
            }

            #quick-manage-entity {
                position: relative;
                height: 100%;
            }

            #previous {
                padding: 0px 5px;
            }

            #next {
                padding: 0px 0px 0px 5px;
            }

            rock-tabs {
                --rock-tab-content: {
                    overflow-y: auto;
                    overflow-x: hidden;
                    padding: 10px;
                    height: 100%;
                }
                ;
                --default-button-container: {
                    position: relative;
                    bottom: 20px;
                }
                ;
                --rock-attribute-manage: {
                    position: relative;
                }
                ;
                --rock-attribute-list-container: {
                    padding: 0px 0px 20px 0px;
                }
            }

            #selected-item {
                font-size: var(--font-size-sm, 12px);
                color: var(--primary-icon-color, #75808b);
            }

            #quick-manage-entity rock-tabs {
                --rock-tab-content-height: {
                    height: 100%;
                }
            }

            .header-content {
                display: flex;
                flex-flow: column;
            }

            .item-container {
                display: flex;
                flex-flow: column;
            }

            .item-details {
                display: flex;
                align-items: stretch;
                margin-bottom: -20px;
            }

            .description {
                flex-basis: 60%;
            }

            .thumbnail {
                flex-basis: 40%;
                max-height: 100px;
            }

            .image-container {
                width: 100%;
                height: 100%;
            }

            #itemName {
                font-family: var(--default-font-family);
                font-size: 13px;
                font-weight: normal;
                font-style: normal;
                font-stretch: normal;
                color: var(--attribute-name-color, #839cb1);
            }

            #itemVal {
                font-size: var(--default-font-size, 14px);
                font-weight: normal;
                color: var(--text-primary-color, #364653);
                display: flex;
                max-width: 250px;
            }
            pebble-toolbar{
                --pebble-button-icon-dimension:{
                    width: 14px;
                    height: 14px;
                }
            }
        </style>
        <div class="base-grid-structure">
            <template is="dom-if" if="[[_showComponent(selectedEntity,_entityId)]]">
                <div class="base-grid-structure-child-1">
                    <div id="quick-manage-header">
                        <div class="first-row layout horizontal">
                            <template is="dom-if" if="[[!noHeader]]">
                                <div class="header-content">
                                    <span id="attrName">[[selectedEntityType]]</span>
                                    <span id="attrVal">[[_selectedEntityTitle]]</span>
                                </div>
                            </template>
                            <div class="layout flex right-section">
                                <span id="selected-item">[[_getSelectedItemIndex(currentIndex, currentRecordSize)]]</span>
                                <span id="previous">
                                    <pebble-icon icon="pebble-icon:navigation-action-up" class="pebble-icon-size-14" on-tap="_onTapNavigation" data-args="previous" disabled\$="[[_setFlag('previous', currentIndex, currentRecordSize)]]"></pebble-icon>
                                </span>
                                <span id="next">
                                    <pebble-icon icon="pebble-icon:navigation-action-down" class="pebble-icon-size-14 m-r-5" on-tap="_onTapNavigation" data-args="next" disabled\$="[[_setFlag('next', currentIndex, currentRecordSize)]]"></pebble-icon>
                                </span>

                                <template is="dom-if" if="[[showExpandIcon]]">
                                    <span id="maximize">
                                        <pebble-icon icon="pebble-icon:window-action-expand" class="pebble-icon-size-14" title="Expand" on-tap="_onTapMaximize"></pebble-icon>
                                    </span>
                                </template>
                            </div>
                            <div id="buttonPanel" class="m-r-5">
                                <pebble-toolbar id="quickManageToolbar" config-data="[[toolbarConfig]]"></pebble-toolbar>
                                <bedrock-pubsub event-name="toolbar-button-event" handler="_onToolbarEvent" target-id="quickManageToolbar"></bedrock-pubsub>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="base-grid-structure-child-2">
                    <div class="base-grid-structure">
                        <div class="base-grid-structure-child-1">
                            <template is="dom-if" if="[[showThumbnailAndHeader]]">
                                <div class="item-details m-t-20 m-l-10">
                                    <div class="description">
                                        <template is="dom-repeat" items="[[itemDescription]]">
                                            <div class="item-container">
                                                <div id="itemName" class="text-ellipsis">
                                                    [[item.name]]
                                                    <template is="dom-if" if="[[_getDescriptionInfo(item)]]">
                                                        <pebble-info-icon description-object="[[item]]"></pebble-info-icon>
                                                    </template>
                                                </div>
                                                <div id="itemVal" title="[[item.value]]">
                                                    <div class="text-ellipsis">[[item.value]]</div>
                                                </div>
                                            </div>
                                            <br>
                                        </template>

                                    </div>
                                    <div class="thumbnail">
                                        <rock-image-viewer class="image-container" sizing="contain" thumbnail-id="[[itemThumbnailId]]" src="[[src]]">
                                        </rock-image-viewer>
                                    </div>
                                </div>

                            </template>
                        </div>
                        <div class="base-grid-structure-child-2">
                            <div id="quick-manage-entity">
                                <bedrock-pubsub event-name="error-length-changed" handler="_errorLengthChanged"></bedrock-pubsub>
                                <rock-tabs id="rockTabs" readonly="[[readonly]]" config="{{tabConfig}}">
                                </rock-tabs>
                                <bedrock-pubsub event-name="component-creating" handler="_onComponentCreating"></bedrock-pubsub>
                            </div>
                        </div>
                    </div>
                </div>
            </template>

            <div class="default-message" hidden\$="[[_showComponent(selectedEntity,_entityId)]]">
                <span>[[_errorMessage]]</span>
            </div>
            <liquid-entity-data-get id="headerAttributesGet" operation="getbyids" request-data="{{_headerAttributesRequest}}" on-error="_onHeaderAttributesGetError" on-response="_onHeaderAttributesResponse" exclude-in-progress=""></liquid-entity-data-get>
        </div>
`;
  }

  static get is() {
      return "rock-entity-quick-manage";
  }

  static get properties() {
      return {
          contextData: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          /**
           * If set as true , it indicates the component is in read only mode
           */
          readonly: {
              type: Boolean,
              value: false
          },

          /*
           * Indicates the configuration for the "tab" element.
           */
          tabConfig: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          toolbarConfig: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          fixes: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          _entityId: {
              type: String,
              value: null
          },

          _entityType: {
              type: String,
              value: null
          },

          showExpandIcon: {
              type: Boolean,
              value: true
          },

          /**
           * Indicates the index for the currently selected item.
           */
          currentIndex: {
              type: Number,
              value: -1,
              notify: true
          },

          /**
           * Indicates the total count of the records.
           */
          currentRecordSize: {
              type: Number,
              value: 0
          },

          /**
           * Indicates the selected item.
           */
          selectedEntity: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          /**
           * Specifies whether or not to to write the logs.
           */
          verbose: {
              type: Boolean,
              value: false
          },

          noHeader: {
              type: Boolean,
              value: false
          },

          /**
           * Specifies whether we are showing entity attributes or relationship attributes. Possible values: 'default', 'relationship'.
           */
          dataObjectType: {
              type: String,
              value: "default"
          },

          _errorMessage: {
              type: String,
              value: "Loading..."
          },

          //When QM is for relationship
          relationship: {
              type: String
          },
          showThumbnailAndHeader: {
              type: Boolean,
              value: false
          },
          attributeModels: {
              type: Object,
              value: function () {
                  return {}
              }
          },
          itemDescription: {
              type: Array,
              value: function () {
                  return []
              }
          },
          quickManageEnabled:{
              type: Boolean,
              notify:true
          },
          itemThumbnailId: {
              type: String,
              value: ""
          },
          src: {
              type: String,
              value: ""
          },
          selectedEntityType: {
              type: String,
              value: ""
          },
          thumbnailConfig: {
             type: Object,
             value: function () {
                return {}
            }
          },
          _headerAttributesRequest: {
              type: Object,
              value: function () {
                  return {}
              }
          },
          _headerAttributeModels: {
            type: Object,
            value: function () {
                return {};
            }
          },
          _selectedEntityTitle: {
              type: String,
              value: ""
          }
      };
  }

  static get observers() {
      return [
          '_onContextDataChange(contextData.*)',
          '_onSelectedEntityChange(selectedEntity, showThumbnailAndHeader)'
      ];
  }

  constructor() {
      super();
  }

  connectedCallback() {
      super.connectedCallback();
  }

  disconnectedCallback() {
      super.disconnectedCallback();
  }


  _onContextDataChange() {
      if (!_.isEmpty(this.contextData)) {
          let context = DataHelper.cloneObject(this.contextData);

          let config = "rock-entity-quick-manage";
          if (this._isRelMode(this.dataObjectType)) {
              if (this.relationship) {
                  let itemContext = ContextHelper.getFirstItemContext(context);
                  if (!_.isEmpty(itemContext)) {
                      itemContext.relationship = this.relationship;
                  } else {
                      context[ContextHelper.CONTEXT_TYPE_ITEM] = [{
                          "relationship": this.relationship
                      }];
                  }
              }
              config = "rock-entity-relationship-quick-manage";
          }

          this.requestConfig(config, context);
      }
  }

  onConfigLoaded(componentConfig) {
      if (componentConfig && componentConfig.config) {
          //set tabConfig                        
          let tabConfig = componentConfig.config.tabConfig;
          this.showThumbnailAndHeader = componentConfig.config.showThumbnailAndHeader;
          //Should come from configuration, delete it once nearest get is enabled (Enable below stmt for reference-discovery testing)
          //tabConfig.tabItems.attributes.component.properties["config-context"].attributeNames = ["_ALL"];
          //This property tells which attribute to consider as image source
          this.thumbnailConfig = componentConfig.config.thumbnailConfig;
          tabConfig.tabItems = DataHelper.convertObjectToArray(tabConfig.tabItems);
          this.tabConfig = tabConfig;

          //set toolbarConfig
          let toolbarConfig = componentConfig.config.toolbarConfig;
          let buttonItems = DataHelper.convertObjectToArray(toolbarConfig.buttonItems);
          for (let i = 0; i < buttonItems.length; i++) {
              buttonItems[i].buttons = DataHelper.convertObjectToArray(buttonItems[i].buttons);
          }
          this.toolbarConfig = {
              "buttonItems": buttonItems
          };

          this.reload();
      }
  }

  reload() {
      this._setHeader();
      if (this.getIsDirty()) {
          if (window.confirm("There are unsaved changes. Do you want to discard the changes?")) {
              this._reloadTab();
          }
      } else {
          this._reloadTab();
      }
  }

  _reloadTab() {
      const tabs = this.shadowRoot.querySelector('#rockTabs');
      if (tabs && (this._entityId || (this.dataObjectType == "relationship"))) {
          tabs.readyToRender(true);
          tabs.reloadCurrentTab(true);
      }
  }

  reset() {
      this.set("tabConfig", {});
      this.set("toolbarConfig", {});
      this.currentIndex = -1;
      this._setHeader();
      const tabs = this.shadowRoot.querySelector('#rockTabs');
      if (this._entityId && tabs) {
          //Passing true will execute the reload as per configuration
          tabs.reset();
      }
  }

  reloadHeader() {
      this._setHeader();
  }

  getIsDirty() {
      let tabs = this.$$("#rockTabs");
      if (tabs && tabs.getIsDirty) {
          return tabs.getIsDirty();
      }
  }

  getControlIsDirty() {
      let tabs = this.$$("#rockTabs");
      if (tabs && tabs.getControlIsDirty) {
          return tabs.getControlIsDirty();
      }
  }

  _onToolbarEvent(e, detail) {
      let event = detail.name;

      switch (event.toLowerCase()) {
          case "refresh":
              this._refreshEvent(e, detail);
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
          case "close":
              this._closeEvent(e, detail);
              break;
          case "edit":
              this._editEvent(e, detail);
              break;
          default:
              this.fireBedrockEvent("grid-custom-toolbar-event", detail);
              break;
      }
  }

  _addEvent(e, detail, sender) {
      alert("event triggered: " + detail.name);
  }

  _deleteEvent(e, detail, sender) {
      alert("event triggered: " + detail.name);
  }

  _cutEvent(e, detail, sender) {
      alert("event triggered: " + detail.name);
  }

  _editEvent(e, detail, sender) {
      alert("event triggered: " + detail.name);
  }

  _refreshEvent(e, detail, sender) {
      this.reload();
  }

  _computeIcon(percentage) {
      let per = Math.round(percentage / 10) * 10;
      return "pebble-icon:percentage-circle";
  }

  _onTapNavigation(e) {
      let target;
      if (e.path) {
          target = e.target;
      } else {
          target = e.currentTarget;
      }
      let eventName = 'on-tap-' + target.attributes["data-args"].value;
      this.fireBedrockEvent(eventName, {
          data: this.currentEntityIndex
      });
  }

  _onTapMaximize() {
      if (this.selectedEntity && this.selectedEntity.id && this.selectedEntity.type) {
          let params = {
              "id": this.selectedEntity.id,
              "type": this.selectedEntity.type
          };
          ComponentHelper.appRoute("entity-manage", params);
      }
  }

  _getSelectedItemIndex() {
      if (this.currentIndex == -1 && this.currentRecordSize == 0) {
          return "";
      } else {
          return (this.currentIndex + 1) + " - " + this.currentRecordSize;
      }
  }

  _onComponentCreating(e, detail, sender) {
      let component = detail.data;

      if (component.name.indexOf("attribute") != -1 && component.properties) {
          // Set attribute names to context
          let _contextData = DataHelper.cloneObject(this.contextData);
          let itemContext = ContextHelper.getFirstItemContext(_contextData);

          if (itemContext && component.properties["config-context"]) {
              itemContext.attributeNames = component.properties["config-context"].attributeNames;
              itemContext.relationshipAttributes = component.properties["config-context"].relationshipAttributes;
              _contextData[ContextHelper.CONTEXT_TYPE_ITEM] = [itemContext];
          }
          component.properties['context-data'] = _contextData;
      } else if (component.name.indexOf("classification") != -1 && component.properties) {
          let _contextData = DataHelper.cloneObject(this.contextData);
          component.properties['context-data'] = _contextData;
      }
  }

  _setHeader() {
      let itemContext = this.getFirstItemContext();
      if (itemContext) {
          if (this.dataObjectType == "relationship") {
              let relationshipAttribute = itemContext.relationshipAttributes
              //TODO: Verify below bug fix and fix it again in devline
              //var relAttrFromConfig = this._getRelationshipAttributesFromConfig();
              //relationshipAttribute = relationshipAttribute.concat(relAttrFromConfig);

              if (relationshipAttribute && relationshipAttribute.length == 0 && !_.isEmpty(this.selectedEntity)) {
                  this.set('_errorMessage', "Attributes are not available for this relationship.");
              } else if (this.selectedEntity == null || _.isEmpty(this.selectedEntity)) {
                  this.set('_errorMessage', "Select a relationship from grid.");
              } else {
                  this._entityId = itemContext.relationshipId;
                  this._entityType = this.selectedEntity.type;
              }
          } else {
              this.set('_errorMessage', "Select an entity from grid.");
              this._entityId = itemContext.id;
              this._entityType = itemContext.type;

              if (this.tabConfig && this.tabConfig.tabItems && this.tabConfig.tabItems.length > 0) {
                  let tabItem = this.tabConfig.tabItems[0];
                  if (tabItem && tabItem.component && tabItem.menuProviderComponent) {
                      tabItem.component.properties["context-data"] = this.contextData;
                  }
              }
          }
      }
  }

  _getRelationshipAttributesFromConfig() {
      if (this.tabConfig && this.tabConfig.tabItems) {
          let relAttributes = this.tabConfig.tabItems.find(function (item) {
              if (item.name == "relationshipAttributes") {
                  return item;
              }
          });

          if (relAttributes.component &&
              relAttributes.component.properties &&
              relAttributes.component.properties["config-context"]) {
              return relAttributes.component.properties["config-context"].relationshipAttributes;
          }
      }
  }

  _errorLengthChanged(e, detail) {
      this.shadowRoot.querySelector('#rockTabs')._currentTabErrorLength = detail;
  }

  _setFlag(nav) {
      if (nav == "previous" && this.currentIndex == 0) {
          return true;
      } else if (nav == "next" && this.currentIndex == (this.currentRecordSize - 1)) {
          return true;
      }

      return false;
  }

  refresh() {
      this._refreshEvent();
  }

  _showComponent(selectedEntity, entityId) {
      if (!_.isEmpty(selectedEntity) || entityId == "-1") {
          return true;
      }

      return false;
  }

  _isRelMode() {
      return this.dataObjectType == "relationship";
  }
  _prepareCompositeModelGetRequest() {
      let firstItemContext = this.getFirstItemContext();
      if (!firstItemContext) {
          return;
      }
      let entityType = firstItemContext.type;

      let req = {
          "params": {
              "query": {
                  "name": entityType,
                  "filters": {
                      "typesCriterion": ["entityCompositeModel"]
                  }
              },
              "fields": {
                  //we need to request all the attriibute and find out identifier and external name
                  "attributes": ["_ALL"]
              }
          }
      };
      return req;
  }
  async _getCompositeModel() {
      let compositeModelRequest = this._prepareCompositeModelGetRequest();
      let compositeModel = {};
      let entityCompositeModelManager = new EntityCompositeModelManager();
      if (entityCompositeModelManager) {
          compositeModel = await entityCompositeModelManager.get(compositeModelRequest);
      }
      return compositeModel;
  }
  async _onSelectedEntityChange(entity, showThumbnailAndHeader) {
    //show the thumbnail and header if its enabled from configuration
    if (!_.isEmpty(entity) && showThumbnailAndHeader) {
        this._onContextDataChange();
        let compositeModel = await this._getCompositeModel();
        let clonedContextData = DataHelper.cloneObject(this.contextData);
        if (compositeModel) {
            clonedContextData[ContextHelper.CONTEXT_TYPE_DATA] = [];
            this.attributeModels = await DataTransformHelper.transformAttributeModels(
                compositeModel, clonedContextData);
        }
        this.selectedEntityType = entity.typeExternalName;
        this.itemThumbnailId = "";
        this.src="";
        let thumbnailIdentifier = "thumbnailid";
        if(!_.isEmpty(this.thumbnailConfig) && this.thumbnailConfig.thumbnailIdentifier){
            thumbnailIdentifier = this.thumbnailConfig.thumbnailIdentifier;
        }
        //for tile view item comes as properties, for table view it is attributes
        if (entity[thumbnailIdentifier]) {
            this.itemThumbnailId = entity[thumbnailIdentifier];
        } else {
            let imageSourceObject = EntityHelper.getEntityImageObject(entity, thumbnailIdentifier, this.contextData);
            if(imageSourceObject && imageSourceObject.value){
                if(imageSourceObject.isPublicUrl){
                    this.src = imageSourceObject.value;
                }
                else{
                    this.itemThumbnailId = imageSourceObject.value;
                }
            }
        }

        if (!_.isEmpty(this.attributeModels)) {
            let entityIdentifierFound = false;
            let externalNameFound = false;
            let attributeNames = [];
            this._headerAttributeModels = {};
            for (let modelName in this.attributeModels) {
                if (this.attributeModels.hasOwnProperty(modelName)){
                    let attribute = this.attributeModels[modelName];
                    if (attribute.isEntityIdentifier || attribute.isExternalName) {
                        entityIdentifierFound = entityIdentifierFound || attribute.isEntityIdentifier;
                        externalNameFound = externalNameFound || attribute.isExternalName;
                        attributeNames.push(attribute.name);
                        this._headerAttributeModels[attribute.name] = attribute;
                        //No need to loop though all the attribute models
                        if (entityIdentifierFound && externalNameFound) {
                            break;
                        }
                    }
                }
            }

            if(!_.isEmpty(attributeNames)) {
                let firstItemContext = ContextHelper.getFirstItemContext(clonedContextData);
                firstItemContext.attributeNames = attributeNames;
                let req = DataRequestHelper.createEntityGetRequest(clonedContextData, true);
                this.set("_headerAttributesRequest", req);
                let headerAttributesGet = this.shadowRoot.querySelector("#headerAttributesGet");
                if(headerAttributesGet) {
                    headerAttributesGet.generateRequest();
                }
            }
        }
    }
  }

  _onHeaderAttributesResponse(e) {
    let itemDescription = [];
    if(DataHelper.isValidObjectPath(e, "detail.response.content.entities.0")) {
        let entity = e.detail.response.content.entities[0];
        let attributesData = DataTransformHelper.transformAttributes(entity, this._headerAttributeModels, this.contextData, "array", false);
        if(!_.isEmpty(attributesData)) {
            for(let idx=0; idx<attributesData.length; idx++) {
                let attrData = attributesData[idx];
                let itemValue = attrData.value;
                let model = this._headerAttributeModels[attrData.name];
                itemDescription.push({
                    name: model.externalName,
                    value: itemValue,
                    description: model.description
                });
                if(model.isExternalName) {
                    this.set("_selectedEntityTitle", itemValue);
                }
            }
        }
    }
    this.set("itemDescription", itemDescription);
  }

  _onHeaderAttributesGetError(e) {
    this.logError("Entity data get failed with following error", e.detail);
    this.set("itemDescription", []);
  }
  _getDescriptionInfo(item) {
      return !_.isEmpty(item) && item.description;
  }
  _closeEvent(){
      this.quickManageEnabled = false;
  }
}

customElements.define(RockEntityQuickManage.is, RockEntityQuickManage);
