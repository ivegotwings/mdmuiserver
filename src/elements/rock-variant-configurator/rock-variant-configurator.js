import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import MessageHelper from '../bedrock-helpers/message-helper.js';
import '../bedrock-app-behavior/bedrock-app-behavior.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-business-function-behavior/bedrock-business-function-behavior.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-helpers/component-helper.js';
import '../bedrock-helpers/context-helper.js';
import '../bedrock-helpers/data-request-helper.js';
import '../bedrock-helpers/data-transform-helper.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-buttons.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import EntityCompositeModelManager from '../bedrock-managers/entity-composite-model-manager.js';
import '../liquid-config-get/liquid-config-get.js';
import '../liquid-entity-data-get/liquid-entity-data-get.js';
import '../liquid-entity-model-get/liquid-entity-model-get.js';
import '../liquid-entity-model-composite-get/liquid-entity-model-composite-get.js';
import '../liquid-entity-data-save/liquid-entity-data-save.js';
import '../liquid-rest/liquid-rest.js';
import '../rock-component-config-behavior/rock-component-config-behavior.js';
import '../rock-attribute/rock-attribute.js';
import '../pebble-icons/pebble-icons.js';
import '../pebble-data-table/pebble-data-table.js';
import '../pebble-data-table/data-table-row.js';
import '../pebble-spinner/pebble-spinner.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockVariantConfigurator
    extends mixinBehaviors([
        RUFBehaviors.AppBehavior,
        RUFBehaviors.BusinessFunctionBehavior,
        RUFBehaviors.ComponentConfigBehavior,
        RUFBehaviors.UIBehavior
    ], PolymerElement) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-grid-layout bedrock-style-icons bedrock-style-padding-margin bedrock-style-buttons">
            :host {
                display: block;
                height: 100%;
            }

            pebble-data-table {
                width: 90%;
                margin: 0 auto;
            }

            data-table-row[selected] {
                background-color: var(--table-row-selected-color, #c1cad4) !important;
            }

            data-table-row[header] {
                font-weight: var(--font-bold, bold);
                color: var(--palette-cerulean, #036bc3);
                border-bottom: none;
                text-transform: uppercase;
                font-size: var(--table-head-font-size, 11px);
            }

            data-table-row:not([header]) {
                color: var(--palette-dark, #1a2028);
                font-size: var(--default-font-size, 12px);
                height: 100%;
                background-color: var(--palette-white, #ffffff);
            }

            data-table-row:not([header]):hover,
            data-table-row[selected] {
                background-color: var(--table-row-selected-color, #c1cad4) !important;
            }

            data-table-row:not([header]):hover data-table-checkbox,
            data-table-row[selected] data-table-checkbox {
                background-color: var(--palette-white, #ffffff) !important;
            }

            data-table-row[header] {
                --pebble-direction-icon-button: {
                    opacity: 0.7 !important;
                }
            }

            data-table-row data-table-cell {
                padding: 0 30px 0 0px;
            }

            data-table-row data-table-cell:last-of-type {
                padding: 0 0px 0 0px;
            }

            data-table-cell {
                height: 50px;
                padding-left: 20px;
                padding-right: 0;
                position: relative;
                flex-basis: 0;
            }

            data-table-cell #iconDiv {
                right: 5px;
                bottom: 13px;
            }

            .add-icon {
                margin-left: 10px;
                margin-top: 10px;
            }

            .title {
                font-size: var(--default-font-size, 14px);
                text-align: center;
                color: var(--palette-steel-grey, #75808b);
            }

            #errorsDialog {
                --popup-header-color: var(--palette-pinkish-red, #ee204c);
            }
            .rock-attribute-wrapper{
                width:100%;
            }
            .w-80{
                width:80%;
            }
            .error-list{
                overflow: auto;
                max-height: 200px;
            }
            .buttons{
                text-align: center;
            }
        </style>

        <pebble-dialog id="errorsDialog" modal="" small="" vertical-offset="1" 50="" horizontal-align="auto" vertical-align="auto" no-cancel-on-outside-click="" no-cancel-on-esc-key="" dialog-title="Errors on page">
            <p>Found below errors in entity details: </p>
            <ul class="error-list">
                <template is="dom-repeat" items="[[_syncValidationErrors]]">
                    <li>[[item.attributeExternalName]] with error: [[item.message]]</li>
                </template>
            </ul>
            <p>Do you want to fix the errors or continue ? </p>
            <div class="buttons">
                <pebble-button id="skip" class="close btn btn-secondary m-r-5" button-text="Skip &amp; Continue" on-tap="_skipServerErrors"></pebble-button>
                <pebble-button id="ok" class="apply btn btn-success" button-text="Fix" on-tap="_closeErrorsDialog"></pebble-button>
            </div>
        </pebble-dialog>

        <pebble-dialog id="confirmationDialog" dialog-title="Confirmation" modal="" alert-box="" show-cancel="" show-ok="" no-cancel-on-outside-click="" no-cancel-on-esc-key="">
            <p>There are unsaved changes.Are you sure you want to continue?</p>
        </pebble-dialog>


        <div class="variantAttributesGridContainer base-grid-structure">
            <div class="base-grid-structure-child-1">
                <div id="content-description" align="center">
                    <!-- description message here -->
                    <div class="title m-0 w-80">
                        You can select multiple options to create variants.
                    </div>
                </div>
                <template is="dom-if" if="[[_isValidDisplayMessage]]">
                    <div class="m-20" align="center">
                        [[displayMessage]]
                    </div>
                </template>
            </div>
            <pebble-spinner active="[[isSpinnerActive]]"></pebble-spinner>
            <template is="dom-if" if="[[isVariantAttributesGridLoaded]]">
                <div class="base-grid-structure-child-2">
                    <div class="button-siblings">
                        <pebble-data-table id="variant-attributes-grid" items="[[variantAttributesGridData]]">
                            <!-- <data-table-column slot="column-slot" flex="0">
                    <template>
                        <pebble-icon slot="cell-slot-content" icon="pebble-icon:goveranance-indeterminate" target-id="variant-attributes-grid" on-tap="_onDeleteRowClick"></pebble-icon>                        
                    </template>
                    </data-table-column>!-->
                            <data-table-column slot="column-slot" name="OPTION" flex="3">
                                <template>
                                    <div id="inputDiv" slot="cell-slot-content" on-tap="" index="[[index]]">
                                        <pebble-textbox readonly="" id="variant-text_[[index]]" row-id="[[index]]" value="{{item.externalName}}" no-label-float="true"></pebble-textbox>
                                    </div>
                                    <!--<div id="iconDiv" slot="cell-slot-content">
                                <pebble-icon class="dropdown-icon pebble-icon-size-10" id="vtxtDropdownIcon_[[index]]" row-id="[[index]]" icon="pebble-icon:navigation-action-down" on-tap="_openVariantAttributeLov"></pebble-icon>
                            </div>  !-->
                                </template>
                            </data-table-column>
                            <data-table-column slot="column-slot" name="VALUES" flex="7">
                                <template>
                                    <div slot="cell-slot-content" on-tap="" index="[[index]]" class="rock-attribute-wrapper">
                                        <rock-attribute class="variantAttributes" row-id="[[index]]" attribute-model-object\$="[[item]]" attribute-object\$="{{_getAttributeObject(item.name)}}" context-data="[[contextData]]" mode="edit" functional-mode="grid"></rock-attribute>
                                    </div>
                                </template>
                            </data-table-column>
                        </pebble-data-table>
                    </div>
                    <div class="buttonContainer-static" align="center">
                        <pebble-button id="cancelButton" class="close btn btn-secondary m-r-5" button-text="Cancel" noink="" elevation="2" on-tap="_onCancel"></pebble-button>
                        <pebble-button id="skipButton" class="close btn btn-secondary m-r-5" button-text="Skip &amp; Continue" on-tap="_onSkip"></pebble-button>
                        <pebble-button id="confirmButton" class="apply btn btn-success" button-text="Save" noink="" elevation="2" on-tap="_onSave"></pebble-button>
                    </div>
                </div>

                <!--pebble-icon slot="cell-slot-content" icon="pebble-icon:action-add-fill" class="pebble-icon-color-success add-icon" target-id="variant-attributes-grid" on-tap="_onAddRowClick"></pebble-icon-->
            </template>
        </div>

        <liquid-entity-model-get id="getVariantModelSettings" operation="getbyids" on-response="_onVariantModelSettingsReceived" on-error="_onVariantModelSettingsGetFailed"></liquid-entity-model-get>
        <liquid-entity-data-get id="getEntity" operation="getbyids" data-index="entityData" data-sub-index="data" on-response="_onEntityGetResponse" on-error="_onEntityGetFailed"></liquid-entity-data-get>
        <liquid-rest id="variantModelGet" url="/data/pass-through/entityappmodelservice/getnearest" method="POST" on-liquid-response="_onDimentionAttributeListReceived" on-liquid-error="_onDimentionAttributeListGetFailed"></liquid-rest>
        <liquid-entity-data-get operation="getbyids" id="variantAttributesOptionsGet" apply-locale-coalesce="" on-response="_onVariantAttributesOptionsGetReceived" on-error="_onVariantAttributesOptionsGetFailed" exclude-in-progress=""></liquid-entity-data-get>
        <liquid-rest id="entityGovernService" url="/data/pass-through/entitygovernservice/validate" method="POST" request-data="{{_entityGovernRequest}}" on-liquid-response="_onEntityGovernResponse" on-liquid-error="_onEntityGovernFailed"></liquid-rest>
        <liquid-entity-data-save id="variantAttributesOptionsSave" operation="[[_entityDataOperation]]" request-data="{{_saveVariantAttributeOptionsReq}}" on-response="_onSaveVariantAttributeOptions" data-index="[[dataIndex]]" on-error="_onSaveVariantAttributeOptionsError"></liquid-entity-data-save>
        <bedrock-pubsub event-name="govern-complete" handler="_onGovernComplete"></bedrock-pubsub>
        <bedrock-pubsub event-name="on-buttonok-clicked" handler="_onSkipConfirm" target-id="confirmationDialog"></bedrock-pubsub>
`;
  }

  static get is() {
      return 'rock-variant-configurator'
  }

  connectedCallback() {
      super.connectedCallback();
  }
  static get properties() {
      return {
          contextData: {
              type: Object,
              value: function () {
                  return {};
              },
              observer: '_contextChanged'
          },

          config: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          variantAttributesGridData: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          _attributeResponse: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _entityDataOperation: {
              type: String,
              value: 'update'
          },
          _saveVariantAttributeOptionsReq: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          doSyncValidation: {
              type: Boolean,
              value: true
          },
          dataIndex: {
              type: String,
              value: "entityData"
          },
          loadGovernData: {
              type: Boolean,
              value: true
          },
          isVariantAttributesGridLoaded: {
              type: Boolean,
              value: false
          },
          _attributes: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          messageCodeMapping: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _syncValidationErrors: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          variantModelObj: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          saveNotification: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          isSpinnerActive: {
              type: Boolean,
              value: false
          },

          applyContextCoalesce: {
              type: Boolean,
              value: true
          },

          _isValidDisplayMessage: {
              type: Boolean,
              value: false
          },

          displayMessage: {
              type: String,
              value: ""
          },

          variantPath: {
              type: String,
              value: ""
          }

      }
  }

  /**
   *  Generate a request to get the variant-model-settings
   */
  _contextChanged() {
      this.isSpinnerActive = true;
      let req = DataRequestHelper.createVariantModelSettingsGetRequest(DataHelper.getParamValue('type'));
      if (req) {
          let variantModelSettingsGet = this.shadowRoot.querySelector("#getVariantModelSettings");
          if (variantModelSettingsGet) {
              variantModelSettingsGet.requestData = req;
              variantModelSettingsGet.generateRequest();
          }
      }
  }

  /**
   *  Function to handle success of variant-model-settings get 
   *  Generate a request to fetch the entity's enhancer attributes
   */
  _onVariantModelSettingsReceived(e, detail) {
      this.variantPath = "";
      this.contextKeys = [];
      this.enhancerAttributes = [];
      if (e && e.detail && DataHelper.isValidObjectPath(e, "detail.response") && e.detail.response.status == "success" && DataHelper.isValidObjectPath(e.detail.response, "content.entityModels")) {
          let response = e.detail.response.content.entityModels[0];
          if (response && response.properties) {
              if (response.properties.variantPath) {
                  this.variantPath = response.properties.variantPath;
              }
              if (response.properties.contextKeys) {
                  this.contextKeys = response.properties.contextKeys;
              }
              if (response.properties.enhancerAttributes) {
                  this.enhancerAttributes = response.properties.enhancerAttributes;
              }
          }

          if (!this.variantPath) {
              this.isSpinnerActive = false;
              this.logWarning("Incorrect variant model settings. Contact administrator for further detail.", "response", JSON.stringify(e.detail));
              this.displayMessage = "Incorrect variant model. Contact administrator for further detail.";
              this._isValidDisplayMessage = true;
              return;
          }

          if (!_.isEmpty(this.enhancerAttributes)) {

              let req = DataRequestHelper.createEntityGetRequest(this.contextData);
              req.params.fields.attributes = DataHelper.cloneObject(this.enhancerAttributes);
              let entityGet = this.shadowRoot.querySelector("#getEntity");
              if (entityGet) {
                  entityGet.requestData = req;
                  entityGet.generateRequest();
              }
          } else {
              this._requestVariantModel();
          }

      } else {
          this._onVariantModelSettingsGetFailed(e);
      }
  }

  /**
   *  Function to handle failure of variant-model-settings get
   */
  _onVariantModelSettingsGetFailed(e) {
      this.logError("Unable to fetch variant model settings. Contact administrator for further detail.", e.detail);
      this.isSpinnerActive = false;
      this.displayMessage = "Unable to fetch variant model. Contact administrator for further detail.";
      this._isValidDisplayMessage = true;
  }

  /**
   *  Function to handle success of entity get for fetching enhancer attributes
   */
  _onEntityGetResponse(e, detail) {
      let responseContent = DataHelper.validateAndGetResponseContent(detail.response);
      if (responseContent && responseContent.entities && responseContent.entities.length > 0) {
          let entityAttributes = [];
          if (responseContent.entities[0].data) {
              let entityData = responseContent.entities[0].data;
              if (!_.isEmpty(this.contextData.Contexts) && !_.isEmpty(entityData.contexts)) {
                  entityAttributes = entityData.contexts[0].attributes;
              } else {
                  if (!_.isEmpty(entityData.attributes)) {
                      entityAttributes = entityData.attributes;
                  }
              }
          }
          this._requestVariantModel(entityAttributes);
      } else {
          this._onEntityGetFailed(e);
      }
  }

  /**
   *  Function to handle failure of entity data get
   */
  _onEntityGetFailed(e) {
      this.isSpinnerActive = false;
      this.logWarning("Unable to fetch root entity. Contact administrator for further detail.", "response", JSON.stringify(e.detail));
      this.displayMessage = "Unable to fetch entity. Contact administrator for further detail.";
      this._isValidDisplayMessage = true;
  }

  /**
   *  Generate a request to fetch the variant model
   */
  _requestVariantModel(entityAttributes) {
      let contextData = this._getVariantContext(entityAttributes);
      let req = DataRequestHelper.createVariantModelGetRequest(contextData, this.variantPath);
      if (req) {
          let variantModelGet = this.shadowRoot.querySelector("#variantModelGet");
          if (variantModelGet) {
              variantModelGet.requestData = req;
              variantModelGet.generateRequest();
          }
      }
  }
  /**
   *  Function to fetch the context data for variant model get request
   */
  _getVariantContext(entityAttributes) {
      let variantContext = {};

      if (!_.isEmpty(this.enhancerAttributes)) {
          for (let attributeName of this.enhancerAttributes) {
              if (!_.isEmpty(entityAttributes[attributeName])) {
                  //Fetching the 1st enhancer attribute value
                  variantContext[attributeName] = AttributeHelper.getFirstAttributeValue(entityAttributes[attributeName]);
              } else {
                  variantContext[attributeName] = "_DEFAULT";
              }
          }
      }

      if (!_.isEmpty(this.contextKeys)) {
        if(Array.isArray(this.contextKeys)) {
          for (let key of this.contextKeys) {
              //Fetching the 1st context value
              let filteredArray = _.find(this.contextData.Contexts, function (item) { return item[key] });
              if (!_.isEmpty(filteredArray)) {
                  variantContext[key] = filteredArray[key];
              } else {
                  variantContext[key] = "_DEFAULT";
              }
          }
        } else {
          variantContext[this.contextKeys] = this.contextKeys
      }
    }

      variantContext["entityType"] = DataHelper.getParamValue('type');

      return variantContext;
  }

  /**
   *  Function to handle success of variant model get 
   *  Fetch the entity composite model for the given dimention attributes
   *  Call the function to generate the dimention attributes values
   */
  async _onDimentionAttributeListReceived(e, detail) {
      if (e && e.detail && DataHelper.isValidObjectPath(e, "detail.response.response") && e.detail.response.response.status == "success" && DataHelper.isValidObjectPath(e.detail.response, "response.entityModels")) {
          let response = e.detail.response.response.entityModels[0];
          response = this._mergeAllContextualLevelsIntoSelf(response);
          this.displayMessage = "";
          this._isValidDisplayMessage = false;
          if (response.properties.levels.length > 0) {
              this.dimentionAttributesList = this._getDimentionAttributeList(response);
              let compositeModelGetRequest = DataRequestHelper.createEntityModelCompositeGetRequest(this.contextData);
              this.variantModelObj.attributeModels = {};
              if (compositeModelGetRequest) {
                  compositeModelGetRequest.params.fields.attributes = this.dimentionAttributesList;
                  let tempCompositeModel = await this._getCompositeModel(compositeModelGetRequest);
                  let compositeModel = this._getSortedCompositeModel(tempCompositeModel, this.dimentionAttributesList);
                  if (!_.isEmpty(compositeModel)) {
                      this._attributeModels = DataTransformHelper.transformAttributeModels(compositeModel, this.contextData);
                      this.variantModelObj.attributeModels = this._attributeModels;                                
                      if (this._attributeModels && !_.isEmpty(this._attributeModels)) {
                          this.getVariantAttributesOptions(this.dimentionAttributesList);
                      }
                  } else {
                      this.logWarning("Entity composite model get failed");
                      this.isSpinnerActive = false;
                  }
              }
          } else {
              this.isSpinnerActive = false;
              this.logWarning(
                  "Missing levels in the variant model. Contact administrator for further detail.",
                  "response", JSON.stringify(e.detail));
              this.displayMessage =
                  "Inconsistencies in the variant model. Contact administrator for further detail.";
              this._isValidDisplayMessage = true;
          }
      } else {
          this.isSpinnerActive = false;
          this.logWarning("Unable to fetch variant model. Contact administrator for further detail.",
              "response", JSON.stringify(e.detail));
          this.displayMessage =
              "Unable to fetch variant model. Contact administrator for further detail.";
          this._isValidDisplayMessage = true;
      }
  }

  /**
   *  Function to get the entity composite model for the given dimention attributes
   */
  async _getCompositeModel(compositeModelGetRequest) {
      let compositeModel = {};
      let entityCompositeModelManager = new EntityCompositeModelManager();
      if (entityCompositeModelManager && compositeModelGetRequest) {
          compositeModelGetRequest.applyEnhancerCoalesce = true;
          compositeModel = await entityCompositeModelManager.get(compositeModelGetRequest, this.contextData);
      }
      entityCompositeModelManager = null;
      return compositeModel;
  }

  /**
   *  Function to sort the entity-composite-model object attributes list according to the dimention attributes order given in the variant model
   */
  _getSortedCompositeModel(compositeModel, attributeList) {
      let sortedCompositeModel = {};
      if (!_.isEmpty(compositeModel) && !_.isEmpty(attributeList)) {
          let compositeModelData = compositeModel.data;

          if (!_.isEmpty(compositeModelData)) {
              sortedCompositeModel = DataHelper.cloneObject(compositeModel);
              sortedCompositeModel.data.attributes = {};
              for (let i = 0; i < attributeList.length; i++) {
                  let key = attributeList[i];
                  if (!_.isEmpty(compositeModelData.attributes)) {
                      sortedCompositeModel.data.attributes[key] = compositeModelData.attributes[key];
                  }
              }

              if (!_.isEmpty(compositeModelData.contexts)) {
                  let contexts = compositeModelData.contexts;
                  let sortedContextCompositeModels = sortedCompositeModel.data.contexts = [];

                  contexts.forEach((ctx) => {
                      if (ctx && !_.isEmpty(ctx.attributes)) {
                          let sortedCtx = {};
                          sortedCtx.context = ctx.context;
                          sortedCtx.attributes = {};
                          for (let i = 0; i < attributeList.length; i++) {
                              let key = attributeList[i];
                              if (!_.isEmpty(ctx.attributes)) {
                                  sortedCtx.attributes[key] = ctx.attributes[key];
                              }
                          }
                          sortedContextCompositeModels.push(sortedCtx);
                      }
                  });
              }
          }
      }
      return sortedCompositeModel;
  }

  /**
   *  Function to handle failure of variant model get
   */
  _onDimentionAttributeListGetFailed(e) {
      this.logError(
          "Unable to fetch variant attributes list. Contact administrator for further detail.", e
              .detail);
      this.isSpinnerActive = false;
  }

  /**
   *  Function to get the dimention atrributes from the given list
   *  Update the variantModelObj to be used in the next screen
   */
  _getDimentionAttributeList(response) {
      this.variantModelObj.attributeList = [];
      this.variantModelObj.targetEntities = [];
      this.variantModelObj.mandatoryAttributes = [];
      let list = response.properties.levels;

      for (let listItem = 0; listItem < list.length; listItem++) {
          let dimentions = list[listItem].dimensionAttributes;
          this.variantModelObj.targetEntities.push({
              "targetEntity": list[listItem].targetEntityType
          });
          let tempAttributeList = [];
          for (let dimensionAttributeListItem = 0; dimensionAttributeListItem < dimentions.length; dimensionAttributeListItem++) {
              if (dimentions[dimensionAttributeListItem].mandatory) {
                  this.variantModelObj.mandatoryAttributes.push(dimentions[dimensionAttributeListItem]
                      .name)
              }
              this.variantModelObj.attributeList.push(dimentions[dimensionAttributeListItem].name);
              tempAttributeList.push(dimentions[dimensionAttributeListItem].name);
          }
          this.variantModelObj.targetEntities[listItem].attributeNames = tempAttributeList;
          this.variantModelObj.targetEntities[listItem].levelNumber = list[listItem].levelNumber;
      }

      //Remove duplicate target entities if any
      this.variantModelObj.targetEntities = _.uniq(this.variantModelObj.targetEntities, function (
          item, key, id) {
          return item.targetEntity;
      });

      return this.variantModelObj.attributeList;
  }

  /**
   *  Handles delete row click
   */
  _onDeleteRowClick(e) {
      let gridId = e.target.getAttribute("target-id");
      let grid = this.shadowRoot.querySelector("#" + gridId);
      let row = this._getParentRow(e.currentTarget);
      let index = row.index;
      grid.items.splice(index, 1);
      grid.clearCache();
  }

  /**
   *  Handles the add row click
   */
  _onAddRowClick(e) {
      let gridId = e.target.getAttribute("target-id");
      let grid = this.shadowRoot.querySelector("#" + gridId);
      let newRowItem = {
          "name": "",
          "value": ""
      }
      newRowItem.id = grid.items.length;
      grid.items.push(newRowItem);
      grid.clearCache();
  }

  /**
   *  Get the parent row
   */
  _getParentRow(element) {
      if (element) {
        let dataTableRow = customElements.get('data-table-row');
          if (dataTableRow !== "undefined" && element instanceof dataTableRow) {
              return element;
          } else {
              return this._getParentRow(element.parentNode);
          }
      }
      return undefined;
  }

  /**
   * Function to generate a request to fetch the entity data for the given attribute options
   */
  getVariantAttributesOptions(variantAttrList) {
      let clonedContextData = DataHelper.cloneObject(this.contextData);
      let itemContexts = [];
      let itemContext = {};
      itemContext.type = DataHelper.getParamValue('type');
      itemContext.id = DataHelper.getParamValue('id');
      itemContexts.push(itemContext);
      clonedContextData[ContextHelper.CONTEXT_TYPE_ITEM] = itemContexts;
      let request = DataRequestHelper.createEntityGetRequest(clonedContextData);
      request.params.fields.attributes = variantAttrList;

      let variantAttributesOptionsGet = this.shadowRoot.querySelector("#variantAttributesOptionsGet");
      if (variantAttributesOptionsGet) {
          variantAttributesOptionsGet.useDataCoalesce = this.applyContextCoalesce;
          variantAttributesOptionsGet.requestData = request;
          variantAttributesOptionsGet.generateRequest();
      }
  }

  /**
   *  Handles success of entity get for given variant attribute options
   */
  async _onVariantAttributesOptionsGetReceived(e, detail) {
      let response = e.detail.response;
      this.originalEntity = e.detail.response.content.entities[0];
      this.variantModelObj.id = this.originalEntity.id;
      this.variantModelObj.type = this.originalEntity.type;
      this.variantModelObj.name = this.originalEntity.name;
      this._attributes = DataTransformHelper.transformAttributes(e.detail.response.content.entities[
          0], this._attributeModels, this.contextData);

      let attributes = new Array();
      for (let obj in this._attributeModels) {
          attributes.push(this._attributeModels[obj]);
      }
      this.variantAttributesGridData = attributes;
      this.isVariantAttributesGridLoaded = true;
      this.isSpinnerActive = false;
  }

  /**
   *  Handles failure of entity get for given variant attribute options
   */
  _onVariantAttributesOptionsGetFailed(e) {
      this.logWarning("variant attribute get failed with error", "response", JSON.stringify(e.detail));
  }

  /**
   *  Function to get the attributeObject for the given name
   */
  _getAttributeObject(param) {
      return this._attributes[param];
  }

  /**
   *  Close variant options configurator
   */
  _onCancel() {
      let eventName = "onCancel";
      let eventDetail = {
          name: eventName
      }

      this.fireBedrockEvent(eventName, eventDetail, {
          ignoreId: true
      });
  }

  /**
   *  Handle save click
   *  Do sync validation 
   */
  async _onSave(e) {
      let mandatoryCheckFailed = this.mandatoryAttributesCheck();
      if (mandatoryCheckFailed) {
          this.showWarningToast("Update values for the following required fields : " + this.mandatoryFields.join());
          this.logError("Update values for the following required fields : " + this.mandatoryFields.join(),
              e.detail);
          return;
      }
      let newEntity = {};
      let attributesJSON = this._getAttributesJSON();
      newEntity = await DataTransformHelper.prepareEntityForAttributesSave(this.originalEntity, attributesJSON, this.contextData, this._attributeModels);
      if (!_.isEmpty(newEntity)) {
          //set requestObject for save liquid
          this._saveVariantAttributeOptionsReq = {
              "entities": [newEntity]
          };

          //Update the no. of variants that can be generated
          this._updateVariantCount();

          //Add hotline flag                     
          this._saveVariantAttributeOptionsReq["hotline"] = true;

          //Do sync validation
          if (this.doSyncValidation) {
              let req = DataRequestHelper.createSyncValidationRequest(newEntity.id, newEntity.type, newEntity.data);
              this.set("_entityGovernRequest", req);
              let liquidGovernGet = this.$.entityGovernService;
              if (liquidGovernGet && this.loadGovernData) {
                  liquidGovernGet.generateRequest();
              }
          } else {
              this._saveEntity();
          }
      }
  }

  /**
   *  Check if the mandatory fields are empty 
   */
  mandatoryAttributesCheck(isOriginalAttribute) {
      let mandatoryCheckFailed = false;
      this.mandatoryFields = [];
      let mandatoryFieldExternalName = "";
      let rockAttributeObjList = this.shadowRoot.querySelectorAll(".variantAttributes");
      if (this.variantModelObj && this.variantModelObj.mandatoryAttributes.length > 0 &&
          rockAttributeObjList) {
          //Mandatory field check against the saved original data done during 'skip and continue'
          if (isOriginalAttribute) {
              for (let j = 0; j < this.variantModelObj.mandatoryAttributes.length; j++) {
                  let attributeName = this.variantModelObj.mandatoryAttributes[j];                            
                  if (isOriginalAttribute && this._attributes[attributeName]) {
                      mandatoryFieldExternalName = "";
                      let count = this._attributes[attributeName].value.length;
                      if (count <= 0) {
                          mandatoryCheckFailed = true;
                          mandatoryFieldExternalName = this.variantModelObj.attributeModels[attributeName].externalName ? this.variantModelObj.attributeModels[attributeName].externalName : attributeName;
                          this.mandatoryFields.push(mandatoryFieldExternalName);
                      }
                  }
              }
          } else {
              for (let i = 0; i < rockAttributeObjList.length; i++) {
                  let temp = this.variantModelObj.mandatoryAttributes.find(item => item ==
                      rockAttributeObjList[i].attributeObject.name);
                  mandatoryFieldExternalName = "";
                  if (temp) {
                      let count = rockAttributeObjList[i].attributeObject.value.length;
                      if (count <= 0) {
                          mandatoryCheckFailed = true;
                          mandatoryFieldExternalName = this.variantModelObj.attributeModels[temp].externalName ? this.variantModelObj.attributeModels[temp].externalName : temp;
                          this.mandatoryFields.push(mandatoryFieldExternalName);
                      }
                  }
              }
          }
      }
      return mandatoryCheckFailed;
  }
  /**
   *  Handle skip click
   *  If there are unsaved changes, show the confirmation dialog, else go to next step
   */
  _onSkip() {
      //If there  is change in the dimention attributes list, then show the message
      let rockAttributeObjList = this.shadowRoot.querySelectorAll(".variantAttributes");
      let isAttributesChanged = _.find(rockAttributeObjList, function (item) {
          return item.changed == true;
      });
      if (isAttributesChanged) {
          this._confirmationDialog = this.shadowRoot.querySelector("#confirmationDialog");
          this._confirmationDialog.open();
      } else {
          this._onSkipConfirm();
      }
  }

  /**
   * Go to next step
   */
  _onSkipConfirm() {
      let isOriginalAttribute = true;
      let mandatoryCheckFailed = this.mandatoryAttributesCheck(isOriginalAttribute);
      if (mandatoryCheckFailed) {
          this.showWarningToast("Save values for the following required fields : " + this.mandatoryFields
              .join());
          return;
      }
      this._updateVariantCount(isOriginalAttribute);
      this.goToNextStep();
  }

  /**
   *  Calculate the total no. of variants that can be generated from the selected dimention attributes 
   */
  _updateVariantCount(isOriginalAttribute) {
      let totalVariantsCount = 1;
      let tempLevelCount = 1;
      let totalLevelCount = 0;
      let rockAttributeObjList = this.shadowRoot.querySelectorAll(".variantAttributes");
      for (let i = 0; i < this.variantModelObj.targetEntities.length; i++) {
          let targetEntity = this.variantModelObj.targetEntities[i];
          tempLevelCount = 1;
          for (let j = 0; j < targetEntity.attributeNames.length; j++) {
              let attributeName = targetEntity.attributeNames[j];
              //Handling the updated dimention attribute list
              if (!isOriginalAttribute) {
                  for (let k = 0; k < rockAttributeObjList.length; k++) {
                      if (attributeName == rockAttributeObjList[k].attributeObject.name) {
                          let count = this._getAttributeValuesCount(rockAttributeObjList[k].attributeObject.value);
                          if (count > 0) {
                              tempLevelCount = tempLevelCount * count;
                              totalVariantsCount = totalVariantsCount * count;
                              break;
                          }
                      }
                  }
              } else { //Handling the original dimention attribute list
                  if (this._attributes[attributeName]) {
                      let count = this._getAttributeValuesCount(this._attributes[attributeName].value);
                      if (count > 0) {
                          tempLevelCount = tempLevelCount * count;
                          totalVariantsCount = totalVariantsCount * count;
                      }
                  }
              }
          }

          if (i >= this.variantModelObj.targetEntities.length - 1) {
              continue;
          }
          //Displaying only leaf level entities on the variant grid 
          //totalLevelCount = totalLevelCount+tempLevelCount;                
      }

      //totalVariantsCount = totalVariantsCount+totalLevelCount;

      this.variantModelObj.totalVariantsCount = totalVariantsCount;
  }

  /**
   * Check the type of the attributeValue and return the count accordingly
   */
  _getAttributeValuesCount(attributeValue) {

      if (attributeValue) {
          if (typeof attributeValue == "object") {
              //If the attributeValue is an array return its length
              return attributeValue.length;
          } else {
              //If the attributeValue is string/integer/decimal or boolean, length will be 1
              return 1;
          }
      } else {
          return 0;
      }
  }

  /**
   *  Generate request to save the variant attributes selection 
   */
  _saveEntity() {
      let variantAttrOptSave = this.shadowRoot.querySelector("#variantAttributesOptionsSave");
      if (variantAttrOptSave) {
          variantAttrOptSave.generateRequest();
      }

      //Reset the save notification flag
      this.saveNotificationReceived = false;

      //Show the spinner 
      this.isSpinnerActive = true;

      //If the notification is not received within the given time, go to next screen
      this.saveNotification = setTimeout(() => {
          if (!this.saveNotificationReceived) {
              this.variantModelObj.noNotification = true;
              this.goToNextStep();
          }
          clearTimeout(this.saveNotification);
      }, 5000);
  }

  /**
   *  Handles success of variant attribute options save
   */
  _onSaveVariantAttributeOptions() {
      this.showSuccessToast("Variant attributes options saved successfully");
  }

  /**
   * After the save, notification is received from server, go to next step
   */
  _onGovernComplete() {
      this.saveNotificationReceived = true;
      clearTimeout(this.saveNotification);
      this.goToNextStep();
  }

  /**
   *  Trigger next step
   */
  goToNextStep() {

      this.isSpinnerActive = false;
      this.businessFunctionData = this.variantModelObj;

      //Move to next step
      let eventName = "onSave";
      let eventDetail = {
          name: eventName
      }

      this.fireBedrockEvent(eventName, eventDetail, {
          ignoreId: true
      });
  }

  /**
   *  Handles failure of variant attribute options save
   */
  _onSaveVariantAttributeOptionsError(e) {
      let reason = e.detail.response.reason;
      this.logError("variant attributes options save failed with error", e.detail);

  }

  /**
   *  Function to get the list of attributes from the variant grid  
   */
  _getAttributesJSON() {
      let attributesJSON = [];
      let attributeElements = dom(this).node.shadowRoot.querySelectorAll('.variantAttributes');
      for (let i = 0; i < attributeElements.length; i++) {
          let attributeElement = attributeElements[i];
          let attributeJSON = undefined;

          //Handling delete for empty attributes
          if (attributeElement.attributeObject.action == "delete" || this._isEmptyValue(attributeElement.attributeObject.value)) {
              attributeJSON = DataHelper.cloneObject(this._attributes[attributeElement.attributeObject.name]);
              attributeJSON.action = "delete";
          } else {
              attributeJSON = attributeElement.attributeObject;
              if (attributeElement.attributeModelObject && attributeElement.attributeModelObject.referenceEntityTypes) {
                  let attributeRefEntityTypes = attributeElement.attributeModelObject.referenceEntityTypes;
                  if (attributeRefEntityTypes instanceof Array && attributeRefEntityTypes.length > 0) {
                      attributeJSON.referenceEntityType = attributeRefEntityTypes[0];
                  }
              }
          }

          attributesJSON.push(attributeJSON);
      }

      return attributesJSON;
  }

  /**
   *  Empty check 
   */
  _isEmptyValue(value) {
      if (typeof (value) === "string") {
          return value === "" || value.trim().length === 0;
      } else {
          return _.isEmpty(value);
      }
  }

  /**
   *  Handles success of govern get
   */
  _onEntityGovernResponse(e) {
      if (e && e.detail && e.detail.response && e.detail.response.response && e.detail.response.response
          .status == "success") {
          let res = e.detail.response.response;
          let itemContext = ContextHelper.getFirstItemContext(this.contextData);
          let entityId;
          if (itemContext) {
              entityId = itemContext.id;
          }
          let entity = DataHelper.findEntityById(res.entities, entityId);
          let attrMessages = this._getAttributeMessages(entity);

          if (!_.isEmpty(attrMessages)) {
              let errorMessages = MessageHelper.getErrorsFromAttrMessages(attrMessages, this._attributeModels);
              this.set("_syncValidationErrors", errorMessages);
              this.$.errorsDialog.open();
              return;
          } else {
              this._saveEntity();
          }
      } else {
          this.logError(
              "AttributeManageValidationFail:- There is a problem in validation service. Contact administrator for further detail.",
              e.detail);
      }
  }

  /**
   *  Function to get the attribute messages
   */
  _getAttributeMessages(entity) {
      let attrMessages = {};
      let firstDataContext = ContextHelper.getFirstDataContext(this.contextData);

      let mergedAttributes = {};

      if (entity && entity.data && entity.data.attributes) {
          mergedAttributes = DataMergeHelper.mergeAttributes(mergedAttributes, entity.data.attributes,
              true);
      }

      if (firstDataContext) {
          let ctxAttributes = SharedUtils.DataObjectFalcorUtil.getAttributesByCtx(entity,
              firstDataContext);
          if (!_.isEmpty(ctxAttributes)) {
              mergedAttributes = DataMergeHelper.mergeAttributes(mergedAttributes, ctxAttributes,
                  true);
          }
      }

      attrMessages = MessageHelper.getAttributeMessages(mergedAttributes, this._attributeModels, this
          .messageCodeMapping, this.localize());

      return attrMessages;
  }

  /**
   *  Handles failure of variant attribute get
   */
  _onEntityGovernFailed(e) {
      this.logError("variant attribute manage govern failed with error :", e.detail);
  }

  /**
   * Function to close the error dialog
   */
  _closeErrorsDialog() {
      this.$.errorsDialog._close();
  }

  /**
   * Function to handle skip click on the error dialog
   */
  _skipServerErrors() {
      this._closeErrorsDialog();
      this._saveEntity();
  }

  _mergeAllContextualLevelsIntoSelf(entityModel) {
      if (entityModel) {
          let mergedLevels = [];
          let levels = [];

          if (entityModel.properties && entityModel.properties.levels) {
              levels = entityModel.properties.levels;
          }

          if (entityModel.data && entityModel.data.contexts) {
              for (let ctx of entityModel.data.contexts) {
                  if (ctx.properties && ctx.properties.levels) {
                      for (let level of ctx.properties.levels) {
                          levels.push(level);
                      }
                  }
              }
          }

          if (levels) {
              for (let i = 1; i < i + 1; i++) {
                  let ilevels = levels.filter(v => v.levelNumber == i);

                  if (!_.isEmpty(ilevels)) {
                      if (ilevels.length == 1) {
                          mergedLevels.push(ilevels[0]);
                      } else {
                          let tempLevel = ilevels[0];
                          for (let ilevel of ilevels) {
                              if (ilevel.dimensionAttributes) {
                                  for (let dimAttr of ilevel.dimensionAttributes) {
                                      let isExist = tempLevel.dimensionAttributes.find(v => v.name ==
                                          dimAttr.name);
                                      if (!isExist) {
                                          tempLevel.dimensionAttributes.push(dimAttr);
                                      }
                                  }
                              }
                          }
                          mergedLevels.push(tempLevel);
                      }
                  } else {
                      break;
                  }
              }
          }

          delete entityModel.data;
          if (!entityModel.properties) {
              entityModel.properties = {};
              entityModel.properties.levels = [];
          }
          entityModel.properties.levels = mergedLevels;
      }
      return entityModel;
  }
}

customElements.define(RockVariantConfigurator.is, RockVariantConfigurator)
