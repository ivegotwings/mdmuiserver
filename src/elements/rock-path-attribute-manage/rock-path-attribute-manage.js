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
import '@polymer/polymer/lib/utils/async.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-helpers/data-request-helper.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-helpers/context-helper.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import EntityTypeManager from '../bedrock-managers/entity-type-manager.js';
import '../liquid-entity-data-save/liquid-entity-data-save.js';
import '../liquid-entity-model-get/liquid-entity-model-get.js';
import '../liquid-entity-data-get/liquid-entity-data-get.js';
import '../pebble-spinner/pebble-spinner.js';
import '../pebble-button/pebble-button.js';
import '../rock-classification-tree/rock-classification-tree.js';
import '../rock-component-config-behavior/rock-component-config-behavior.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockPathAttributeManage
    extends mixinBehaviors([
        RUFBehaviors.UIBehavior,
        RUFBehaviors.ComponentContextBehavior,
        RUFBehaviors.ComponentConfigBehavior
    ], OptionalMutableData(PolymerElement)) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-grid-layout">
            :host {
                display: block;
                height: 100%;
            }

            .buttonContainer-top-right {
                text-align: right;
                padding-top: 10px;
                margin-bottom: 0px;
                margin-top: 0px;
            }

            .title {
                font-size: 12px;
                font-weight: bold;
                text-align: left;
                text-transform: capitalize;
            }
        </style>
        <pebble-spinner active="[[_loading]]"></pebble-spinner>
        <div id="buttonContainer" align="center" class="buttonContainer-top-right">
            <pebble-button id="save" class="action-button-focus btn btn-success" button-text="Save" on-tap="_onSave" elevation="1" raised=""></pebble-button>
        </div>
        <div class="button-siblings">
            <div class="base-grid-structure" align="center">
                <div class="tree-heading base-grid-structure-child-1">
                    <p class="title" hidden\$="[[hideTitle]]">[[_getAttributeExternalName(pathAttributeModels)]]</p>
                </div>
                <div class="base-grid-structure-child-2">
                    <rock-classification-tree id="contextTree" multi-select="[[multiSelect]]" root-node="[[pathRootNode]]" path-entity-type="[[pathEntityType]]" path-relationship-name="[[pathRelationshipName]]" context-data="[[contextData]]" selected-classifications="{{_selectedCategories}}" leaf-node-only="[[leafNodeOnly]]" root-node-external-name="{{rootNodeExternalName}}"></rock-classification-tree>
                </div>
            </div>
        </div>
        <liquid-entity-model-get id="liquidAttributeModelGet" operation="getbyids" on-error="_onAttributeModelGetError" on-response="_onAttributeModelGetResponse" exclude-in-progress=""></liquid-entity-model-get>
        <liquid-entity-data-get id="getEntity" operation="getbyids" data-index="entityData" on-response="_onEntityGetResponse" on-error="_onEntityGetFailed" no-cache="true"></liquid-entity-data-get>
        <liquid-entity-data-save id="attributeSaveDataService" operation="update" data-index="entityData" last-response="{{_saveResponse}}" on-response="_onSaveResponse" on-error="_onSaveError"></liquid-entity-data-save>
`;
  }

  static get is() {
      return 'rock-path-attribute-manage';
  }
  static get observers() {
      return [
          '_contextChanged(contextData)',
          '_onSelectedItemsChange(_selectedCategories.*)'
      ]
  }
  static get properties() {
      return {
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

          _selectedCategories: {
              type: Array,
              value: function () {
                  return [];
              },
              notify: true
          },

          multiSelect: {
              type: Boolean,
              value: false
          },

          leafNodeOnly: {
              type: Boolean,
              value: false
          },

          pathRootNode: {
              type: String,
              value: ""
          },

          pathEntityType: {
              type: String,
              value: ""
          },

          pathRelationshipName: {
              type: String,
              value: ""
          },

          pathAttributeModels: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          pathAttribute: {
              type: String,
              value: ""
          },

          _initialClassifications: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          _currentEntity: {
              type: Object,
              value: function () {
                  return {
                      "id": "",
                      "type": "",
                      "data": {
                          "contexts": [],
                          "attributes": {}
                      }
                  };
              }
          },

          _pathSeperator: {
              type: String,
              value: ""
          },

          _valuePathSeperator: {
              type: String,
              value: "#@#"
          },

          hideTitle: {
              type: Boolean,
              value: false
          },

          rootNodeExternalName: {
              type: String,
              value: ""
          }
      }
  }

  /**
   * <b><i>Content development is under progress... </b></i> 
   */
  ready() {
      super.ready();
      this._pathSeperator = this.appSetting('dataDefaults').categoryPathSeparator || ">>";
  }

  async _contextChanged(contextData) {
      if (!_.isEmpty(contextData)) {
          this._loading = true;
          if (this.isPartOfBusinessFunction) {
              let context = DataHelper.cloneObject(this.contextData);
              let itemContext = ContextHelper.getFirstItemContext(context);
              if (itemContext) {
                  let entityTypeManager = EntityTypeManager.getInstance();
                  let domain = "";
                  if (entityTypeManager) {
                      domain = await entityTypeManager.getDomainByType(itemContext.type);
                  }
                  if (domain) {
                      context[ContextHelper.CONTEXT_TYPE_DOMAIN] = [{
                          "domain": domain
                      }]
                  }
              }
              //App specific
              let appName = "";
              appName = ComponentHelper.getCurrentActiveAppName(this);
              if (appName) {
                  context[ContextHelper.CONTEXT_TYPE_APP] = [{
                      "app": appName
                  }];
              }
              this.requestConfig('rock-path-attribute-manage', context);
          } else {
              this._triggerGetClassificationsProcess();
          }
      }
  }

  onConfigLoaded(componentConfig) {
      if (!this.pathAttribute) {
          this.logError("Path attribute missing from config");
          this._loading = false;
          return;
      }
      this._triggerGetClassificationsProcess();
  }

  async _triggerGetClassificationsProcess() {
      this._liquidAttributeModelGetElement = this.$$('#liquidAttributeModelGet');
      if (this._liquidAttributeModelGetElement) {
          this._liquidAttributeModelGetElement.requestData = DataRequestHelper.createGetAttributeModelRequest([this.pathAttribute]);
          this._liquidAttributeModelGetElement.generateRequest();
      }
  }

  _onAttributeModelGetResponse(e) {
      let response = e.detail.response;
      if (response && response.content && response.content.entityModels) {
          let attributeModels = response.content.entityModels;
          let pathModels = [];
          attributeModels.forEach(function (model) {
              if (DataHelper.isValidObjectPath(model, "properties.displayType") &&
                  (model.properties.displayType || "").toLowerCase() == "path" &&
                  DataHelper.isValidObjectPath(model.properties, "pathEntityInfo.0.rootNode") &&
                  model.properties.pathEntityInfo[0].rootNode) {
                  pathModels.push(model);
              }
          }, this);

          if (_.isEmpty(pathModels)) {
              this.logError("Path attribute model not available for the process");
              this._loading = false;
              return;
          }

          this.pathAttributeModels = pathModels;
          //To get current entity details
          let entityRequest = DataRequestHelper.createEntityGetRequest(this.contextData);
          entityRequest.params.fields.attributes = [this.pathAttribute];
          this._triggerEntityGetRequest(entityRequest);
      }
  }

  _onAttributeModelGetError(e) {
      this.logError("Attribute model get error", e.detail);
      this._loading = false;
  }

  async _onEntityGetResponse(e, detail) {
      let entities = [];
      if (DataHelper.isValidObjectPath(detail, "response.content.entities")) {
          entities = detail.response.content.entities;
      }

      if (!_.isEmpty(entities)) {
          //Current Entity get for already saved classifications
          this._currentEntity = entities[0];
          if (DataHelper.isValidObjectPath(entities[0], "data.attributes")) {
              let attributes = entities[0].data.attributes;
              let classifications = [];
              if (attributes[this.pathAttribute]) {
                  attributes[this.pathAttribute].values.forEach(item => {
                      this._initialClassifications.push(item.value);
                      let paths = item.value.split(this._pathSeperator) || [];
                      paths.shift(); //Remove root node
                      classifications.push(paths);
                  }, this)
              }
              this._selectedCategories = classifications;
          }
      } else {
          //current entity details required for save, so preparing from contextData
          let itemContext = ContextHelper.getFirstItemContext(this.contextData);
          if (itemContext) {
              this._currentEntity.id = itemContext.id;
              this._currentEntity.type = itemContext.type;
          }
      }

      //If component opened in rock BF, then set title
      let activeBusinessFunctionDialog = RUFUtilities.activeBusinessFunctionDialog;
      if (activeBusinessFunctionDialog) {
          activeBusinessFunctionDialog.setTitle("Select classifications for - " + this.pathAttributeModels[0].properties.externalName);
      }

      this._showClassificationTree();
  }

  _onEntityGetFailed(e) {
      this.logError("Entities data get failed", e.detail);
      this._loading = false;
  }

  _triggerEntityGetRequest(request) {
      let liquidDataElement = this.shadowRoot.querySelector('#getEntity');
      if (liquidDataElement) {
          liquidDataElement.requestData = request;
          liquidDataElement.generateRequest();
      }
  }

  _showClassificationTree() {
      let pathEntityInfo = this.pathAttributeModels[0].properties.pathEntityInfo[0];
      this.pathEntityType = pathEntityInfo.pathEntityType;
      this.pathRelationshipName = pathEntityInfo.pathRelationshipName;
      this.pathRootNode = pathEntityInfo.rootNode;

      let contextTree = this.shadowRoot.querySelector('#contextTree');
      if (contextTree) {
          contextTree.generateRequest();
      }
      this._loading = false;
  }

  _onSelectedItemsChange() {
      this.isComponentDirty = this._isSelectedItemsChanged(this._selectedCategories);
  }

  _isSelectedItemsChanged(selectedItems) {
      selectedItems = selectedItems || [];
      if (selectedItems.length != this._initialClassifications.length) {
          return true;
      }
      selectedItems = selectedItems.map(item => item.externalNamePath || item);
      return !DataHelper.areEqualArrays(selectedItems, this._initialClassifications);
  }

  async _onSave(e) {
      if (!this.isComponentDirty) {
          this.showInformationToast("No changes to save.");
          return;
      }

      if(!this.rootNodeExternalName) {
          this.logError("Classification root node extenal name missing, cannot process save.");
          return;
      }

      //Add root node for classifications
      let attributesJSON = this._prepareAttributesForSave();
      let saveEntityRequest = await DataTransformHelper.prepareEntityForAttributesSave(this._currentEntity, attributesJSON, this.contextData, this.pathAttributeModels);
      this._setDeleteActionForAttributeValues(saveEntityRequest);
      let liquidDataElement = this.shadowRoot.querySelector('#attributeSaveDataService');
      if (liquidDataElement) {
          liquidDataElement.requestData = {
              "entities": [saveEntityRequest]
          };
          liquidDataElement.generateRequest();
      }
  }

  _onSaveResponse(e) {
      if (DataHelper.isValidObjectPath(e, "detail.response.status") &&
          e.detail.response.status == "success") {
          let itemCtx = ContextHelper.getFirstItemContext(this.contextData) || {};
          this.dataFunctionComplete({ "id": itemCtx.id, "type": itemCtx.type });
          this._updateInitialClassifications();
          this.showSuccessToast("Classifications save request submitted successfully.");
      }
  }

  _onSaveError(e) {
      this.logError("entity update failed", e.detail);
      this.showWarningToast("Attribute save failed");
  }

  _prepareAttributesForSave() {
      let values = [];
      let attributes = [];

      //Add selected categories
      this._selectedCategories.forEach(category => {
        values.push(category.externalNamePath);
    }, this);

      //Add initial categories - further add delete action based on selected categories
      this._initialClassifications.forEach(category => {
          if (category && values.indexOf(category) == -1) {
              values.push(category);
          }
      }, this);

      //Prepare values
      let valueCtxs = ContextHelper.getValueContexts(this.contextData);
      if (!_.isEmpty(valueCtxs)) {
          valueCtxs.forEach(valueCtx => {
              attributes.push({
                  "value": values,
                  "source": valueCtx.source,
                  "locale": valueCtx.locale,
                  "selfContext": 1,
                  "name": this.pathAttribute
              })
          }, this)
      }

      return attributes;
  }

  //Set delete action to attribute values based on selected categories
  _setDeleteActionForAttributeValues(saveEntityRequest) {
      if (DataHelper.isValidObjectPath(saveEntityRequest, "data.attributes") &&
          saveEntityRequest.data.attributes[this.pathAttribute] &&
          saveEntityRequest.data.attributes[this.pathAttribute].values) {
          let attributeValues = saveEntityRequest.data.attributes[this.pathAttribute].values;
          attributeValues.forEach(attributeValue => {
              let path = attributeValue.value
              let filterResults = this._selectedCategories.filter(category => {
                  return category.externalNamePath == path;
              })
              if (_.isEmpty(filterResults)) {
                  attributeValue.action = "delete";
              }
          }, this);
      }
  }

  _updateInitialClassifications() {
      let initialClassifications = [];
      this._selectedCategories.forEach(category => {
          initialClassifications.push(category.externalNamePath);
      }, this);
      this._initialClassifications = initialClassifications;
  }

  _getAttributeExternalName(pathAttributeModels) {
      let externalName = "";
      if (DataHelper.isValidObjectPath(pathAttributeModels, "0.properties.externalName")) {
          externalName = pathAttributeModels[0].properties.externalName;
      }
      return externalName;
  }
}
customElements.define(RockPathAttributeManage.is, RockPathAttributeManage);
