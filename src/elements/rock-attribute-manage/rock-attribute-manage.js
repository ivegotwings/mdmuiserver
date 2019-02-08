/**
`rock-attribute-manage` Represents the component to manage the attribute values.
It renders the `rock-attribute-list` with the specified context parameters. 
It is responsible to "get" and "save" the attributes.

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
import '../bedrock-helpers/component-helper.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-helpers/data-request-helper.js';
import '../bedrock-helpers/data-transform-helper.js';
import MessageHelper from '../bedrock-helpers/message-helper.js';
import '../bedrock-helpers/data-merge-helper.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../liquid-entity-data-get/liquid-entity-data-get.js';
import '../liquid-entity-govern-data-get/liquid-entity-govern-data-get.js';
import '../liquid-entity-data-save/liquid-entity-data-save.js';
import '../liquid-entity-model-composite-get/liquid-entity-model-composite-get.js';
import '../liquid-rest/liquid-rest.js';
import '../liquid-dataobject-utils/liquid-dataobject-utils.js';
import '../pebble-button/pebble-button.js';
import '../pebble-spinner/pebble-spinner.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-buttons.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import '../rock-attribute-list/rock-attribute-list.js';
import EntityCompositeModelManager from '../bedrock-managers/entity-composite-model-manager.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockAttributeManage extends mixinBehaviors(
    [
        RUFBehaviors.UIBehavior,
        RUFBehaviors.ComponentContextBehavior,
        RUFBehaviors.ComponentBusinessFunctionBehavior,
        RUFBehaviors.ComponentConfigBehavior
    ],
    OptionalMutableData(PolymerElement)) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-scroll-bar bedrock-style-grid-layout bedrock-style-padding-margin bedrock-style-buttons">
            :host {
                display: block;
                height: 100%;
                @apply --rock-attribute-manage;
            }

            .defaultButton {
                width: 100%;
            }

            .dataFunctionButton {
                width: 100%;
                bottom: 0;
                text-align: center;
                z-index: 9999;
            }

            #errorsDialog {
                --popup-header-color: var(--palette-pinkish-red, #ee204c);
            }
            .buttonContainer-top-right {
                text-align: right;
                padding-top: 10px;
            }

            #rock-attribute-list-container {
                height: 100%;
                overflow-y: auto;
                overflow-x: hidden;
            }
            .error-list{
                overflow: auto;
                max-height: 200px;
            }
            .buttons{
                text-align: center;
            }

            
        </style>
        <pebble-spinner active="[[_loading]]"></pebble-spinner>
        <pebble-dialog id="errorsDialog" modal="" small="" vertical-offset="1" 50="" horizontal-align="auto" vertical-align="auto" no-cancel-on-outside-click="" no-cancel-on-esc-key="" dialog-title="Errors on page">
            <p>Found below errors in entity details: </p>
            <ul class="error-list">
                <template is="dom-repeat" items="[[_syncValidationErrors]]">
                    <li>[[item.attributeExternalName]] with error: [[item.message]]</li>
                </template>
            </ul>
            <p>Do you want to fix the errors or continue?</p>
            <div class="buttons">
                <pebble-button id="skip" class="close btn btn-secondary m-r-5" button-text="Skip &amp; Continue" on-tap="_skipServerErrors"></pebble-button>
                <pebble-button id="ok" class="apply btn btn-success" button-text="Fix" on-tap="_fixServerErrors"></pebble-button>
            </div>
        </pebble-dialog>
        <pebble-dialog id="cancelDialog" dialog-title="Confirmation" modal="" alert-box="" show-cancel="" show-ok="" no-cancel-on-outside-click="" no-cancel-on-esc-key="">
            <p>Are you sure you want to discard the unsaved changes.</p>
        </pebble-dialog>
        <bedrock-pubsub event-name="on-buttonok-clicked" handler="_revertAll" target-id="cancelDialog"></bedrock-pubsub>
        <liquid-entity-data-get name="attributeGetDataService" operation="getbyids" apply-locale-coalesce="[[applyLocaleCoalesce]]" data-index="[[dataIndex]]" last-response="{{_attributeResponse}}" on-response="_onEntityDataGetReceived" on-error="_onEntityDataGetFailed"></liquid-entity-data-get>
        <liquid-entity-govern-data-get id="entityGovernDataGet" operation="getbyids" request-data="{{_entityGovernDataGetRequest}}" on-response="_onEntityGovernDataGetReceived" on-error="_onEntityGetFailed" no-cache=""></liquid-entity-govern-data-get>
        <liquid-entity-data-save name="attributeSaveDataService" operation="[[_entityDataOperation]]" data-index="[[dataIndex]]" request-data="{{_saveRequest}}" last-response="{{_saveResponse}}" on-response="_onSaveResponse" on-error="_onSaveError"></liquid-entity-data-save>

        <liquid-rest id="entityGovernService" url="/data/pass-through/entitygovernservice/validate" method="POST" request-data="{{_entityGovernRequest}}" on-liquid-response="_onGovernResponse" on-liquid-error="_onGovernFailed">
        </liquid-rest>
        <liquid-rest id="modelGovernService" url="/data/pass-through/modelgovernservice/validate" method="POST" request-data="{{_modelGovernRequest}}" on-liquid-response="_onGovernResponse" on-liquid-error="_onGovernFailed">
        </liquid-rest>
        <liquid-rest id="entityMatchService" url="/data/pass-through/matchservice/search" method="POST" request-data="{{_entityMatchRequest}}" on-liquid-response="_onMatchSuccess" on-liquid-error="_onMatchFailure">
        </liquid-rest>
        <div class="base-grid-structure">
            <div class="base-grid-structure-child-1">
                <template is="dom-if" if="[[_showNoAttributeMessage]]">
                    <div align="center">[[_attributesMessage]]</div>
                </template>
                <div id="buttonContainer" class="buttonContainer-top-right" align="center">
                        <template is="dom-if" if="[[!isPartOfBusinessFunction]]">
                            <pebble-button class="action-button btn btn-secondary m-l-5" id="cancel" button-text="Cancel" raised="" on-tap="_openCancelDialog"></pebble-button>
                        </template>
                        <pebble-button class="action-button-focus dropdownText btn btn-success m-l-5" id="next" button-text="[[_saveButtonText]]" raised="" on-tap="_save"></pebble-button>
                </div>
            </div> 
            <div class="base-grid-structure-child-2">
                <template is="dom-if" if="{{hasComponentErrored(isComponentErrored)}}">
                    <div id="error-container"></div>
                </template>

                <template is="dom-if" if="{{!hasComponentErrored(isComponentErrored)}}">
                    <div id="rock-attribute-list-container"></div>
                </template>
            </div>
        </div>
        <liquid-entity-data-get name="relatedEntityGet" operation="getbyids" on-response="_relatedEntityGetResponse" exclude-in-progress=""></liquid-entity-data-get>

        <bedrock-pubsub event-name="global-edit" handler="_onGlobalEdit"></bedrock-pubsub>
        <bedrock-pubsub event-name="source-info-open" handler="_onSourceInfoOpen"></bedrock-pubsub>
`;
  }

  static get is() {
      return "rock-attribute-manage";
  }
  static get properties() {
      return {
          /**
           * Indicates whether the attribute is rendered in the "edit" mode or "view mode. 
           * The two possible values are <b>view</b> and <b>edit</b>.
           */
          mode: {
              type: String,
              value: "view",
              notify: true
          },
          /**
           * If set as true , it indicates the component is in read only mode
           */
          readonly: {
              type: Boolean,
              value: false
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
          /**
           * <b><i>Content development is under progress... </b></i> 
           */
          configContext: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          /**
           * Indicates the number of columns in which the attributes are rendered. Possible values are one, two,
            and three.
           */
          noOfColumns: {
              type: Number,
              value: 1
          },
          /**
           * <b><i>Content development is under progress... </b></i> 
           */
          allowSaveOnError: {
              type: Boolean,
              value: false
          },
          isPartOfBusinessFunction: {
              type: Boolean,
              value: false
          },                    
          _saveButtonText: {
              type: String,
              value: "Save"
          },
          /**
           * <b><i>Content development is under progress... </b></i> 
           */
          doSyncValidation: {
              type: Boolean,
              value: false
          },
          /**
           * <b><i>Content development is under progress... </b></i> 
           */
          successMessage: {
              type: String,
              value: ''
          },
          /**
           * Indicates the response object that is received from the data element for the attribute `get request`.
           */
          _attributeResponse: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          /**
           * Indicates the response object that is received from the data element for the attribute get request.
           */
          _attributeModelResponse: {
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
          _saveResponse: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _attributeValues: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          _attributeModels: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          /**
           * <b><i>Content development is under progress... </b></i> 
           */
          showGroupName: {
              type: Boolean,
              value: false
          },
          /**
           * <b><i>Content development is under progress... </b></i> 
           */
          groupName: {
              type: String,
              value: "My Attributes"
          },
          /**
           * Specifies whether or not to write the logs.
           */
          verbose: {
              type: Boolean,
              value: false
          },
          /**
           * Indicates the attribute value objects which renders the attributes.
           * JSON sample to be added here.
           */
          _attributeMessages: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          /**
           * <b><i>Content development is under progress... </b></i> 
           */
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
          /**
           * <b><i>Content development is under progress... </b></i> 
           */
          functionalMode: {
              type: "String",
              value: "default"
          },
          _showNoAttributeMessage: {
              type: Boolean,
              value: false
          },
          _entityDataOperation: {
              type: String,
              value: 'update'
          },
          _entityMatchRequest: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          applyLocaleCoalesce: {
              type: Boolean,
              value: false
          },

          applyContextCoalesce: {
              type: Boolean,
              value: false
          },

          _relatedEntityGetResponse: {
              type: Object
          },
          dataIndex: {
              type: String,
              value: "entityData"
          },
          loadGovernData: {
              type: Boolean,
              value: true
          },
          _modelGovernRequest: {
              type: Object,
              value: function () {
                  return {}
              }
          },
          needAttributesGrouping: {
              type: Boolean,
              value: false
          },
          _dependentAttributeModels: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _dependentAttributeValues: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          _isDependentModelsResponse: {
              type: Boolean,
              value: false
          },
          _attributesMessage: {
              type: String,
              value: "Attributes are not available"
          },
          _loading: {
              type: Boolean,
              value: true
          },
          hideRevert: {
              type: Boolean,
              value: false
          },
          hideHistory: {
              type: Boolean,
              value: false
          },
          _isTaxonomyCreationProcess: {
              type: Boolean,
              value: false
          },
          _attributeModelRequestDetails: {
              type: Object,
              value: function () {
                  return {
                      "properties": {
                          "externalName": "",
                          "dataType": "string",
                          "groupName": "Enhancer Attributes",
                          "displayType": "path",
                          "isCollection": true,
                          "pathEntityInfo": {
                              "group": [{
                                  "pathRelationshipName": "belongsTo",
                                  "pathEntityType": "classification",
                                  "rootNode": "",
                                  "pathSeperator": ""
                              }]
                          }
                      },
                      "relationships": {
                          "listedUnder": [{
                              "id": "",
                              "direction": "both",
                              "relationshipType": "aggregation",
                              "relTo": {
                                  "id": "thingdomainattributemodels",
                                  "type": "list"
                              }
                          }]
                      }
                  }
              }
          }
      }
  }
  connectedCallback() {
      super.connectedCallback();
      this._cancelDialog = this.shadowRoot.querySelector("#cancelDialog");
  }
  disconnectedCallback() {
      super.disconnectedCallback();
      if (this.loadContentFrameId) cancelAnimationFrame(this.loadContentFrameId);
  }
  static get observers() {
      return [
          '_attributeResponseChanged(_attributeResponse)',
          '_contextChanged(contextData)',
          '_modeChanged(mode)'
      ]
  }
  refresh() {
      this._contextChanged(this.contextData.ValContexts);
  }
  _getButtonsClass(functionalMode) {
      if (functionalMode == "dataFunction") {
          return "dataFunctionButton";
      } else {
          return "defaultButton"
      }
  }
  _onListModeChanged(e) {
      this._modeChanged(e.detail.mode);
  }
  get attributeList() {
      return this.shadowRoot.querySelector('rock-attribute-list');
  }
  _modeChanged(mode, updateList) {
      if (!mode) return;
      this.mode = mode;
      if(!this.isPartOfBusinessFunction) {
          let setAttributeValue =  mode === 'edit' ? "true" : "false";
          this.$.buttonContainer.setAttribute("show",setAttributeValue);
      } else {
          //always keep in edit mode for business function dialog
          this.set('mode', "edit");
          this.$.buttonContainer.setAttribute("show", true);
      }

      if (updateList && this.attributeList) {
          this.attributeList.mode = mode;
      }
  }
  async _contextChanged(valueContexts) {
      if (valueContexts != undefined) {

          if (_.isEmpty(valueContexts) || _.isEmpty(this.contextData)) {
              return;
          }

          if (_.isEmpty(this.configContext)) {
              this._attributesMessage =
                  "No default attributes are configured, select a group from the menu."
              this._showNoAttributeMessage = true;
              this._loading = false;
              return;
          }

          this.groupName = this.configContext.groupName ? this.configContext.groupName :
              this.groupName;
          let compositeModelGetRequest = DataRequestHelper.createEntityModelCompositeGetRequest(
              this.contextData);
          let compositeModel = await this._getCompositeModel(compositeModelGetRequest);
          let writePermission = true;
          let itemContext = this.getFirstItemContext();
          if (DataHelper.isValidObjectPath(itemContext, "permissionContext.writePermission")) {
              writePermission = itemContext.permissionContext.writePermission;
          }

          this._attributeModels = await DataTransformHelper.transformAttributeModels(compositeModel, this.contextData, writePermission);
          let dependentAttributeNames = this._getDependentAttributeNames(this._attributeModels);

          if (dependentAttributeNames.length > 0) {
              let clonedContextData = DataHelper.cloneObject(this.contextData);
              let itemContext = ContextHelper.getFirstItemContext(clonedContextData);
              itemContext.attributeNames = dependentAttributeNames;
              let compositeModelGetRequest = DataRequestHelper.createEntityModelCompositeGetRequest(clonedContextData);

              let compositeModel = await this._getCompositeModel(compositeModelGetRequest);
              let transformedModels = await DataTransformHelper.transformAttributeModels(
                  compositeModel, this.contextData,writePermission);
              this._dependentAttributeModels = this._dependentAttributeModels || {};
              for (let modelName in transformedModels) {
                  this._dependentAttributeModels[modelName] = transformedModels[
                      modelName];
              }
          }

          if(this.isPartOfBusinessFunction) {
              let context = DataHelper.cloneObject(this.contextData);
              //App specific
              let appName = "";
              appName = ComponentHelper.getCurrentActiveAppName(this);
              if (appName) {
                  context[ContextHelper.CONTEXT_TYPE_APP] = [{
                      "app": appName
                  }];
              }
              this.requestConfig(this.nodeName.toLowerCase(), context);
          } else {
              this._getEntityData();
          }
      }                
  }

  onConfigLoaded(componentConfig) {
      this._getEntityData();
  }

  async _getCompositeModel(compositeModelGetRequest) {
      let compositeModel = {};
      let entityCompositeModelManager = new EntityCompositeModelManager();
      if(entityCompositeModelManager && compositeModelGetRequest) {
          entityCompositeModelManager.addEventListener('composite-model-manager-error', this._onEntityModelCompositeGetFailed.bind(this));
          compositeModelGetRequest.applyEnhancerCoalesce = true;
          compositeModel = await entityCompositeModelManager.get(compositeModelGetRequest, this.contextData);
      }
      entityCompositeModelManager = null;
      return compositeModel;
  }

  _getContextDataWithDefaultLocale() {
      const defaultLocale = DataHelper.getDefaultLocale();
      let clonedContextData = DataHelper.cloneObject(this.contextData);

      if (clonedContextData && !clonedContextData[ContextHelper.CONTEXT_TYPE_VALUE]) {
          let defaultContext = clonedContextData[ContextHelper.CONTEXT_TYPE_VALUE].find(
              context => context.locale === defaultLocale);
          if (!defaultContext) {
              let firstValueContext = ContextHelper.getFirstValueContext(
                  clonedContextData);
              let defaultLocaleValueContext = DataHelper.cloneObject(
                  firstValueContext);
              defaultLocaleValueContext.locale = defaultLocale;
              clonedContextData[ContextHelper.CONTEXT_TYPE_VALUE].push(
                  defaultLocaleValueContext);
          }
      }

      return clonedContextData;
  }
  async _getEntityData() {
      let itemContext = this.getFirstItemContext();
      let entityId = itemContext.id;

      let attributeNames = Object.keys(this._attributeModels);

      if (!_.isEmpty(this._dependentAttributeModels)) {
          let dependentAttributeNames = Object.keys(this._dependentAttributeModels);
          attributeNames = attributeNames.concat(dependentAttributeNames);
      }

      if (attributeNames.length > 0) {

          if (entityId && entityId != "-1") {
              //add attribute names in item context
              itemContext.attributeNames = attributeNames;

              let contextData = this._getContextDataWithDefaultLocale();
              let req = DataRequestHelper.createEntityGetRequest(contextData,
                  true);

              let entityGovernDataGetReq = DataHelper.cloneObject(req);

              delete entityGovernDataGetReq.params.query.valueContexts;

              let governAttributeNames = Object.keys(this._attributeModels);
              entityGovernDataGetReq.params.fields.attributes =
                  governAttributeNames;

              let liquidDataGet = this.shadowRoot.querySelector("[name=attributeGetDataService]");
              liquidDataGet.useDataCoalesce = !!this.applyContextCoalesce;
              liquidDataGet.requestData = req;

              this.set("_entityGovernDataGetRequest", entityGovernDataGetReq);
              let liquidGovernGet = this.$.entityGovernDataGet;
              if (liquidGovernGet && this.loadGovernData && (this.dataIndex != "entityModel")) {
                  liquidGovernGet.generateRequest();
              } else {
                  liquidDataGet.generateRequest();
              }
              this._showNoAttributeMessage = false;
          } else {
              let values = DataTransformHelper.transformAttributes({}, this._attributeModels, this.contextData, "array", true);
              this.set("_attributeValues", values);
              this.mode = 'edit';
              this._loadAttributeList();
          }
      } else {
          if(this.functionalMode == "default") {
              this._attributesMessage = this._attributesMessage + " or there is no permission. Contact administrator";
          }
          this._showNoAttributeMessage = true;
          this._loading = false;
      }
  }

  _getDependentAttributeNames(attributeModels) {
      let dependentAttributeNames = [];
      this._dependentAttributeModels = this._dependentAttributeModels || {};
      if(!_.isEmpty(attributeModels)) {
          for (let attributeName in attributeModels) {
              let model = attributeModels[attributeName];
              if (model.dataType.toLowerCase() === "nested" && !_.isEmpty(model.group)) {
                  let childAttrModels = model.group[0];
                  let childDependentAttributeNames = this._getDependentAttributeNames(
                      childAttrModels);
                  if (!_.isEmpty(childDependentAttributeNames)) {
                      dependentAttributeNames = dependentAttributeNames.concat(
                          childDependentAttributeNames);
                  }
              } else if (DataHelper.isValidObjectPath(model,
                      "properties.dependencyInfo.0.dependentOn")) {
                  let attrName = model.properties.dependencyInfo[0].dependentOn;
                  if (this._attributeModels[attrName]) {
                      this._dependentAttributeModels[attrName] = this._attributeModels[
                          attrName];
                  } else if (dependentAttributeNames.indexOf(attrName) === -1) {
                      dependentAttributeNames.push(attrName);
                  }
              }
          }
      }

      return dependentAttributeNames;
  }

  _onEntityGovernDataGetReceived(e) {
      //TODO: Needs to check with Vishal.
      this._attributeMessages = {};
      let res = e.detail.response;
      let itemContext = this.getFirstItemContext();
      let entityId;
      if (itemContext) {
          entityId = itemContext.id;
      }
      let entity = DataHelper.findEntityById(res.content.entities, entityId);

      let attrMessages = this._getAttributeMessages(entity);
      this.set('_attributeMessages', attrMessages);


      let liquidDataGet = this.shadowRoot.querySelector(
          "[name=attributeGetDataService]");
      if (liquidDataGet) {
          liquidDataGet.generateRequest();
      } else {
          this._loading = false;
      }
  }
  _onEntityGetFailed(e) {
      this.logError("AttributeManageGetFail", e);
      this._loading = false;
  }
  async _attributeResponseChanged(_attributeResponse) {
      if (_.isEmpty(_attributeResponse)) return;

      let attributes = [];
      let dependentAttributes = [];

      if (DataHelper.validateGetEntitiesResponse(_attributeResponse) && this._attributeModels) {
          let entity = _attributeResponse.content.entities[0];

          if (entity) {
              attributes = DataTransformHelper.transformAttributes(entity, this
                  ._attributeModels, this.contextData, "array", true);
              if (!_.isEmpty(this._dependentAttributeModels)) {
                  dependentAttributes = DataTransformHelper.transformAttributes(
                      entity, this._dependentAttributeModels, this.contextData,
                      "array", true);
              }
          }
      }
      this._attributeValues = attributes;
      this._dependentAttributeValues = dependentAttributes;

      if (this._attributeValues.length) {
          this._loadAttributeList();
      } else {
          this._loading = false;
      }
  }
  _loadAttributeList() {
      timeOut.after(100).run(() => {
          const listContainer = this.shadowRoot.querySelector(
              "#rock-attribute-list-container");
          for (let modelName in this._attributeModels) {
              this._dependentAttributeModels[modelName] = this._attributeModels[
                  modelName];
          }
          const meta = {
              "name": "rock-attribute-list",
              "path": "/../../src/elements/rock-attribute-list/rock-attribute-list.html",
              "properties": {
                  "readonly": this.readonly,
                  "show-group-name": true,
                  "group-name": this.groupName,
                  "mode": this.mode,
                  "attribute-values": this._attributeValues,
                  "attribute-models": this._attributeModels,
                  "attribute-messages": this._attributeMessages,
                  "dependent-attribute-models": this._dependentAttributeModels,
                  "dependent-attribute-values": this._dependentAttributeValues,
                  "attributes-chunk-length": this.attributesChunkLength || 10,
                  "no-of-columns": this.noOfColumns,
                  "context-data": this.contextData,
                  "apply-locale-coalesce": this.applyLocaleCoalesce,
                  "need-attributes-grouping": this.needAttributesGrouping,
                  "hide-revert": this.hideRevert,
                  "hide-history": this.hideHistory
              }
          };
          this.loadContentFrameId = requestAnimationFrame(() => {
              ComponentHelper.loadContent(listContainer, meta, this, (
                  content) => {
                  content.addEventListener('list-mode-changed',
                      this._onListModeChanged.bind(this));
              });
          });
      });
      this._loading = false;
  }
  createNewEntity(attributesJSON) {
      let newEntity = {};
      let firstItemContext = this.getFirstItemContext();

      let entityType = firstItemContext.type && firstItemContext.type;
      let entityId = "e" + ElementHelper.getRandomString();
      let entityName;
      /**
       * For any model the id should be <<model.name>>_<<model.type>>. Hence name for the
       * model is the value of attribute which has "isEntityIdentifier" flag.
       * For any entity, name should be the value of the attribute which has "isExternalName" flag.
       * */
      if (this.dataIndex == "entityModel") {
          entityName = DataHelper.getNameForNewEntityFromAttributes(attributesJSON, this._attributeModels, "isEntityIdentifier");
          if (this._isEmptyValue(entityName)) {
              entityId = entityId + "_" + entityType;
          } else {
              entityId = entityName + "_" + entityType;
          }
      } else {
          entityName = DataHelper.getNameForNewEntityFromAttributes(attributesJSON, this._attributeModels, "isExternalName");
      }

      firstItemContext.id = entityId;
      let modelDomain;
      if (DataHelper.getParamValue('state')) {
          modelDomain = JSON.parse(DataHelper.getParamValue('state')).modelDomain;
      }

      newEntity = DataTransformHelper.prepareEntityForCreate(entityId, entityType,
          attributesJSON, this.contextData, DataHelper.getUserName(), {}, this._attributeModels,
          modelDomain);
      if(entityName) {
          newEntity.name = entityName;
      }

      this._entityDataOperation = "create";
      this._saveRequest = {
          "entities": [newEntity]
      };

      this.set('_entityMatchRequest', {
          "entity": newEntity
      });

      const entityMatchService = this.shadowRoot.querySelector("#entityMatchService");
      if (entityMatchService) {
          entityMatchService.generateRequest();
      }
      return newEntity;
  }
  showNoChangesToast() {
      RUFUtilities.pebbleAppToast.fitInto = RUFUtilities.appCommon.$.toastArea;;
      RUFUtilities.appCommon.toastText = "No changes to save";
      let toastElement = RUFUtilities.pebbleAppToast;
      toastElement.toastType = "information";
      toastElement.heading = "Information";
      toastElement.autoClose = true;
      toastElement.show();
  }
  async updateEntity(attributesJSON) {
      let newEntity = {};
      let originalEntity = this._attributeResponse.content.entities[0];
      newEntity = await DataTransformHelper.prepareEntityForAttributesSave(
          originalEntity, attributesJSON, this.contextData, this._attributeModels
      );
      this._entityDataOperation = "update";

      if (!_.isEmpty(newEntity)) {
          let clonedNewEntity = DataHelper.cloneObject(newEntity);
          let firstDataContext = ContextHelper.getFirstDataContext(this.contextData);
          if (!_.isEmpty(firstDataContext)) {
              clonedNewEntity.data.webProcessingOptions = {
                  "prepareCoalescedResponse": true,
                  "currentSelectedContext": firstDataContext
              }
          }

          //set requestObject for save liquid
          this._saveRequest = {
              "entities": [clonedNewEntity]
          };

          //Add hotline flag if hotline is enabled
          if (DataHelper.isHotlineModeEnabled()) {
              this._saveRequest["hotline"] = true;
          }

          if (this.functionalMode == "quickManage") {
              let clientState = {};
              clientState.notificationInfo = {};
              clientState.notificationInfo.showNotificationToUser = false;
              this._saveRequest["clientState"] = clientState;
          }
          if (this.doSyncValidation) {
              if (this.dataIndex == "entityModel") {
                  let liquidModelGovernGet = this.$.modelGovernService;
                  if (liquidModelGovernGet) {
                      let clonedOriginalEntity = DataHelper.cloneObject(
                          originalEntity);
                      let mergedEntity = DataMergeHelper.mergeDataObjects(
                          clonedOriginalEntity, newEntity);
                      let modelReq = DataRequestHelper.createSyncValidationRequest(
                          mergedEntity.id, mergedEntity.type, mergedEntity.data,
                          "entityModel");
                      this.set("_modelGovernRequest", modelReq);
                      liquidModelGovernGet.generateRequest();
                  }
              } else {
                  let liquidGovernGet = this.$.entityGovernService;
                  if (liquidGovernGet && this.loadGovernData) {
                      let req = DataRequestHelper.createSyncValidationRequest(
                          newEntity.id, newEntity.type, newEntity.data);
                      this.set("_entityGovernRequest", req);
                      liquidGovernGet.generateRequest();
                  }
              }
          } else {
              this._saveEntity();
          }
      }
      return newEntity;
  }
  responseHasEntities() {
      return this._attributeResponse && this._attributeResponse.content && this._attributeResponse
          .content.entities && this._attributeResponse.content.entities.length > 0;
  }
  isNewEntity() {
      let firstItemContext = this.getFirstItemContext();
      return firstItemContext && firstItemContext.id == '-1';
  }
  extractAttributes(changedAttributeElements) {
      let attributesJSON = [];
      for (let i = 0; i < changedAttributeElements.length; i++) {
          let attributeElement = changedAttributeElements[i];
          let attributeJSON = undefined;
          if (attributeElement.attributeObject.action == "delete" || this._isEmptyValue(
                  attributeElement.attributeObject.value)) {
              let isNullValue = attributeElement.attributeObject.isNullValue;
              attributeJSON = DataHelper.cloneObject(attributeElement.originalAttributeObject);
              if(isNullValue) {
                  if(_.isArray(attributeJSON.value)) {
                      attributeJSON.value = [ConstantHelper.NULL_VALUE];
                  } else {
                      attributeJSON.value = ConstantHelper.NULL_VALUE;
                  }
              }
              attributeJSON.action = "delete";
          } else {
              attributeJSON = attributeElement.attributeObject;
              if (attributeElement.attributeModelObject && attributeElement.attributeModelObject
                  .referenceEntityTypes) {
                  let attributeRefEntityTypes = attributeElement.attributeModelObject
                      .referenceEntityTypes;
                  if (attributeRefEntityTypes instanceof Array &&
                      attributeRefEntityTypes.length > 0) {
                      attributeJSON.referenceEntityType = attributeRefEntityTypes[0];
                  }
              }
          }
          attributesJSON.push(attributeJSON);
      }
      return attributesJSON;
  }
  _isEmptyValue(value) {
      if (typeof (value) === "string") {
          return value === "" || value.trim().length === 0;
      } else {
          return _.isEmpty(value);
      }
  }

  _setAllGroupFieldsInChangeAttributes(changedAttributeElements){
      let mappedAttributeCollection = {
        "range":     ["rangeFrom", "rangeTo", "rangeFromInclusive", "rangeToInclusive"],
        "pattern":["regexPattern", "regexHint"]
      }
      changedAttributeElements = [].slice.call(changedAttributeElements); //Node list to array
      let attributeList = this.attributeList.shadowRoot.querySelectorAll('rock-attribute');
      attributeList = [].slice.call(attributeList); //Node list to array
      for(let mappedAttributeGroup in mappedAttributeCollection){
            let mappedAttributes = mappedAttributeCollection[mappedAttributeGroup];
            let mappedAttributesInChangedList = changedAttributeElements.filter(attributeElement => {
                return attributeElement.attributeModelObject && mappedAttributes.indexOf(attributeElement.attributeModelObject.name) != -1
            }).map(attributeElement => {
                return attributeElement.attributeModelObject.name;
            }) || [];

            if(mappedAttributesInChangedList.length) {
                let remainingMappedAttributes = _.difference(mappedAttributes, mappedAttributesInChangedList);
                let remainingMappedAttributeNodeList = attributeList.filter(attributeElement => {
                    return (attributeElement.attributeModelObject && remainingMappedAttributes.indexOf(attributeElement.attributeModelObject.name) != -1);
                }) || [];
                if(remainingMappedAttributeNodeList.length){
                    changedAttributeElements = changedAttributeElements.concat(remainingMappedAttributeNodeList);
                }
            }
      }
    return changedAttributeElements;
  }
  async _save(e) {
      if (e.currentTarget.disabled == true) {
          return;
      }
      //TODO: Needs to check with Vishal.
      //check if any changes
      //if none, then return operationResult with warning message else proceed

      //If have errors return
      if (!this.allowSaveOnError && this.attributeList && this.attributeList.hasModelErrors()) {
          this.showWarningToast("Cannot save the entity, resolve the errors.");
          return;
      }

      let changedAttributeElements = this.attributeList && this.attributeList.getChangedAttributeElements();
      if (!changedAttributeElements || changedAttributeElements.length == 0) {
          this.showNoChangesToast();
          return {
              "message": "No changes to save"
          }; //TODO: Prepare OR
      }
      let firstItemContext = ContextHelper.getFirstItemContext(this.contextData)
      if (this.dataIndex == "entityModel" && firstItemContext && firstItemContext.type == "attributeModel") {
          changedAttributeElements = this._setAllGroupFieldsInChangeAttributes(changedAttributeElements);
      }

      //Show the spinner
      this._loading = true;

      //TODO: Temporary, need to send all the attributes for save as API is not supporting delta comparion within entity content and replacing complete entity object...
      //changedAttributeElements = attributeList.root.querySelectorAll('rock-attribute');
      //validate - if error then return operationResult, else proceed
      //prepare attribute JSON from changed attributes
      let attributesJSON = this.extractAttributes(changedAttributeElements);

      let newEntity = {};
      if (this.responseHasEntities()) {
          newEntity = await this.updateEntity(attributesJSON);
      } else if (this.isNewEntity()) {
          newEntity = this.createNewEntity(attributesJSON);
      }
  }
  _saveEntity() {
      let liquidSave = this.shadowRoot.querySelector(
          "[name=attributeSaveDataService]");
      if (liquidSave) {
          liquidSave.generateRequest();
      } else {
          this._loading = false;
          this.logError(
              "Save failed: Not able to access attributeSaveDataService liquid");
      }
  }
  _onSaveResponse(e) {
      if (e.detail.response.status == "success") {
          let liquidGet = this.shadowRoot.querySelector(
              "[name=attributeGetDataService]");
          let liquidSave = this.shadowRoot.querySelector(
              "[name=attributeSaveDataService]");

          if (liquidGet) {
              this.attributeList && this.attributeList.resetChanged();

              if (!_.isEmpty(liquidGet.requestData)) {
                  liquidGet.generateRequest();
              } else {
                  this._loading = false;
              }
          }

          if (!(liquidSave && liquidSave.operation == 'create')) {
              let liquidGovernGet = this.$.entityGovernDataGet;
              if (liquidGovernGet && this.loadGovernData) {
                  liquidGovernGet.generateRequest();
              }
          }

          let currentRequest = e.detail.request.requestData;
          if (!_.isEmpty(currentRequest.entities) && liquidSave.operation == 'create') {
              let taxonomyRequests = currentRequest.entities.filter(entity => {
                  return entity.type == "taxonomy";
              }, this);
              if (taxonomyRequests.length) {
                  this._isTaxonomyCreationProcess = true;
                  this.async(function () {
                      this._triggerClassificationCreation(taxonomyRequests);
                  }, 150);
                  return;
              }

              let classificationRequests = currentRequest.entities.filter(entity => {
                  return entity.type == "classification";
              }, this);
              if (classificationRequests.length && this._isTaxonomyCreationProcess) {
                  this.async(function () {
                      this._triggerAttributeModelCreation(classificationRequests);
                  }, 150);
                  return;
              }
          }

          let message = this.successMessage ? this.successMessage :
              "Attribute save request is submitted successfully!!";
          this.showSuccessToast(message, 5000);
          this.mode = "view";

          //Raise event on attributes save
          this.fireBedrockEvent("on-attribute-save", null, {
              ignoreId: true
          });

          let itemCtx = this.getFirstItemContext();
          let data = {};
          if (itemCtx) {
              data = { "id": itemCtx.id, "type": itemCtx.type };
          }
          let eventDetails = [];
          this.dataFunctionComplete(data, eventDetails, true);
      } else {
          this._loading = false;
          this.showWarningToast("Attribute save failed");
          this.logError("Attribute save failed. Response status is error", e.detail);
      }
  }
  _onSaveError(e) {
      this._loading = false;
      this.logError("entity update failed", e.detail);
      this.showWarningToast("Attribute save failed");
  }
  _triggerClassificationCreation(taxonomyRequests) {
      this._saveRequest.entities = [];
      taxonomyRequests.forEach(taxonomyRequest => {
          let request = DataHelper.cloneObject(taxonomyRequest);
          request.id = "e" + ElementHelper.getRandomString();
          let externalNameAttribute = undefined;
          if (DataHelper.isValidObjectPath(request, "data.attributes.externalName")) {
              externalNameAttribute = request.data.attributes.externalName;
          }
          if (DataHelper.isValidObjectPath(request, "data.attributes.identifier.values.0.value")) {
              if (!externalNameAttribute) {
                  externalNameAttribute = DataHelper.cloneObject(request.data.attributes.identifier);
              }
              request.data.attributes["identifier"].values[0].value += "root";
          }
          //Create rootexternalname, externalnamepath attributes based on externalName attribute
          if (!_.isEmpty(externalNameAttribute)) {
              request.data.attributes["rootexternalname"] = request.data.attributes["externalnamepath"] = externalNameAttribute;
          }
          request.type = "classification";
          request.data.relationships = {
              "belongstotaxonomy": [{
                  "relTo": {
                      "id": taxonomyRequest.id,
                      "type": "taxonomy"
                  }
              }]
          }
          this._saveRequest.entities.push(request);
      }, this);

      this._saveEntity();
  }
  _prepareAttributesForModel(properties) {
      let valContexts = ContextHelper.getValueContexts(this.contextData);
      let attributeValues = AttributeHelper.getEmptyValues(valContexts);
      let attributes = {};
      for (let key in properties) {
          //Nested
          if (properties[key] && properties[key].group) {
              let attrValues = [];
              for (let grp of properties[key].group) {
                  let childProperties = {};
                  for (let grpAttrKey in grp) {
                      let childAttrValues = DataHelper.cloneObject(attributeValues);
                      childAttrValues.values.forEach(attributeValue => {
                          attributeValue.value = grp[grpAttrKey];
                      }, this);
                      childProperties[grpAttrKey] = childAttrValues;
                  }
                  attrValues.push(childProperties);
              }
              attributes[key] = {"group": attrValues};
          } else { //Other than Nested
              let attrValues = DataHelper.cloneObject(attributeValues);
              attrValues.values.forEach(attributeValue => {
                  attributeValue.value = properties[key];
              }, this);
              attributes[key] = attrValues;
          }
      }
      return attributes;
  }
  _triggerAttributeModelCreation(classificationRequests) {
      this._saveRequest.entities = [];
      classificationRequests.forEach(classificationRequest => {
          let request = DataHelper.cloneObject(classificationRequest);
          if (!DataHelper.isValidObjectPath(request, "data.attributes.identifier.values.0.value")) {
              return;
          }

          let rootNode = request.data.attributes["identifier"].values[0].value;
          let id = (request.name || rootNode).replace(/ /g, "").toLowerCase();
          request.type = "attributeModel";
          request.id = id + "_" + request.type;
          request.domain = "thing";
          //Prepare properties
          let attributeModelDetails = DataHelper.cloneObject(this._attributeModelRequestDetails);
          let properties = attributeModelDetails.properties;
          properties.externalName = request.name;
          properties.pathEntityInfo.group.forEach(grp => {
              grp.rootNode = rootNode;
              grp.pathSeperator = this.appSetting('dataDefaults').categoryPathSeparator || ">>"
          }, this);
          //Prepare attributes from properties
          request.data.attributes = this._prepareAttributesForModel(properties);
          //These relationships will not be added until we consider these in BaseModelService.js
          request.data.relationships = attributeModelDetails.relationships;

          this._saveRequest.entities.push(request);
      }, this);

      this._isTaxonomyCreationProcess = false;
      this.dataIndex = "entityModel";
      this._saveEntity();
  }
  _openCancelDialog() {
      if (this.getIsDirty()) {
          this._cancelDialog.open();
      } else {
          this._revertAll();
      }
  }
  _revertAll() {
      if (this.functionalMode == "dataFunction") {
          let eventName = "onSkip";
          let eventDetail = {
              name: eventName
          };
          this.fireBedrockEvent(eventName, eventDetail, {
              ignoreId: true
          });
      } else {
          this.attributeList && this.attributeList.revertAll();
          this._modeChanged('view');
          this._resetErrors();
      }
  }
  _resetErrors() {
      if (this.attributeList) {
          this.attributeList.updateDependentAttributesAndResetErrors();
      }
  }
  _setTitleBar(values) {
      let mainApp = RUFUtilities.mainApp;
      if (mainApp && mainApp.contentViewManager) {
          let activeContentView = mainApp.contentViewManager.activeContentView;
          if (activeContentView) {
              let contentComponent = activeContentView.shadowRoot.querySelector(
                  "app-entity-manage");
              if (contentComponent) {
                  contentComponent.setTitleBar(values);
              }
          }
      }
  }
  _onGovernResponse(e) {
      if (e && e.detail && e.detail.response && e.detail.response.response && e.detail
          .response.response.status == "success") {
          let res = e.detail.response.response;
          let itemContext = this.getFirstItemContext();
          let entityId;
          if (itemContext) {
              entityId = itemContext.id;
          }
          let entity;
          if (this.dataIndex == "entityModel") {
              entity = DataHelper.findEntityById(res.entityModels, entityId);
          } else {
              entity = DataHelper.findEntityById(res.entities, entityId);
          }
          let attrMessages = this._getAttributeMessages(entity);

          if (!_.isEmpty(attrMessages)) {
              let errorMessages = MessageHelper.getErrorsFromAttrMessages(
                  attrMessages, this._attributeModels);
              let formattedErrorMessages = [];
              
              if(!_.isEmpty(errorMessages)) {
                  errorMessages.forEach(errMsg => {
                      let attrModel = this._attributeModels[errMsg.attributeName];

                      if(attrModel && attrModel.dataType.toLowerCase() == "nested") {
                          errMsg.message = errMsg.message[errMsg.attributeName];
                          formattedErrorMessages.push(errMsg);
                      } else {
                          formattedErrorMessages.push(errMsg);
                      }
                  });
              }
              
              this.set("_syncValidationErrors", formattedErrorMessages);
              this.$.errorsDialog.open();
              return;
          } else {
              this._saveEntity();
          }
      } else {
          this._loading = false;
          this.logError(
              "AttributeManageValidationFail:- There is a problem in validation service.",
              e.detail);
      }
  }
  _onGovernFailed(e) {
      this._loading = false;
      this.logError(
          "AttributeManageGovernFail:- There is a problem in validation service.",
          e.detail);
  }
  _onEntityModelCompositeGetFailed(e) {
      this._loading = false;
      this.logError(
          "EntityModelCompositeGetFail:- There is a problem with entity data service (EntityModelCompositeGet).",
          "", true);
  }
  _onEntityDataGetFailed(e) {
      this._loading = false;
      this.logError(
          "EntityDataGetFailed:- There is a problem in entity data service. Received empty response.",
          e.detail, true);
  }
  _onEntityDataGetReceived(e) {
      let {
          response
      } = e.detail;
      if (response.content && !response.content.entities.length) {
          this._loading = false;
          this._onEntityDataGetFailed(e);
      }
  }
  _closeErrorsDialog() {
      this.$.errorsDialog._close();
  }
  _skipServerErrors() {
      this._closeErrorsDialog();
      this._saveEntity();
  }
  _fixServerErrors() {
      this._loading = false;
      this._closeErrorsDialog();
      let newAttributeMessages = {};
      if (this._syncValidationErrors) {
          for (let i = 0; i < this._syncValidationErrors.length; i++) {
              let attributeMessages = this._syncValidationErrors[i];
              let attributeName = attributeMessages.attributeName;
              let message = attributeMessages.message;
              if (attributeName && message) {
                  let newMessages = [];
                  newAttributeMessages[attributeName] = newMessages;
                  if (newMessages.indexOf(message) < 0) {
                      newMessages.unshift(message);
                  }
              }
          }
      }
      this.set('_attributeMessages', newAttributeMessages);
      this._resetErrors();
  }
  /**
   * Can be used to get the elements if they are dirty.
   */
  getIsDirty() {
      if (this.attributeList) {
          return this.attributeList.getIsDirty();
      }
  }
  /**
   * Can be used to get the controls if they are dirty.
   */
  getControlIsDirty() {
      if (this.attributeList) {
          return this.attributeList.getControlIsDirty();
      }
  }
  _hasErrors(detail) {
      return !detail || !detail.response ||
          (detail.response.dataObjectOperationResponse && detail.response.dataObjectOperationResponse
              .status && detail.response.dataObjectOperationResponse.status.toLowerCase() ==
              "error") ||
          (detail.response.response.dataObjectOperationResponse && detail.response.response
              .dataObjectOperationResponse.status &&
              detail.response.response.dataObjectOperationResponse.status.toLowerCase() ==
              "error");
  }
  _onMatchSuccess(e, detail) {
      if (detail.response) {
          let response = detail.response.response;

          if (this._hasErrors(detail)) {
              this._loading = false;
              this.logError("Failed to request match service with error:", detail);
              return;
          }

          if (response.status && response.status.toLowerCase() == "success") {
              if (response.entities) {
                  if (response.entities.length >= 1) {
                      this.showWarningToast(
                          "We found one or multiple entites matching in our system. Check entity details or contact your administrator.",
                          e.detail);
                      let itemContext = this.getFirstItemContext();
                      if (itemContext) {
                          itemContext.id = -1;
                      }
                      this._loading = false;
                      return;
                  }
              } else {
                  let governReq = DataHelper.cloneObject(this._entityMatchRequest);

                  this.set("_entityGovernRequest", governReq);
                  let liquidSave = this.shadowRoot.querySelector(
                      "[name=attributeSaveDataService]");
                  if (liquidSave) {
                      liquidSave.operation = "create";
                  }
                  let liquidGovernGet = this.$.entityGovernService;
                  if (liquidGovernGet && this.loadGovernData) {
                      liquidGovernGet.generateRequest();
                  }
              }
          }
      }
  }
  _onMatchFailure(e, detail) {
      this._loading = false;
      this.logError("There is a problem in match service.", detail);
  }

  _getAttributeMessages(entity) {
      let attrMessages = {};
      let firstDataContext = ContextHelper.getFirstDataContext(this.contextData);

      let mergedAttributes = {};

      if(!_.isEmpty(firstDataContext)) {
          mergedAttributes = SharedUtils.DataObjectFalcorUtil.getAttributesByCtx(
              entity, firstDataContext);
      } else if (entity && entity.data && entity.data.attributes){
          mergedAttributes = entity.data.attributes;
      }

      attrMessages = MessageHelper.getAttributeMessages(mergedAttributes, this._attributeModels,
          this.messageCodeMapping, this.localize());

      return attrMessages;
  }
  _onGlobalEdit(e) {
      if (this.areAttributesEditable) {
          this._modeChanged('edit', true);
      }
  }

  _onSourceInfoOpen(e) {
      let data = e.detail.data;
      let callback = e.detail.callback;
      let relatedEntityGetElement = this.$$("[name=relatedEntityGet]");

      this._relatedEntityGetResponse = function (e) {
          if (e.detail && e.detail.response && e.detail.response.content) {
              let entities = e.detail.response.content.entities;

              if (!_.isEmpty(entities)) {
                  callback(entities[0]);
              }
          }
      }

      if (!_.isEmpty(data) && relatedEntityGetElement) {
          let req = {
              "params": {
                  "query": {
                      "id": data.id,
                      "filters": {
                          "typesCriterion": [
                              data.type
                          ]
                      }
                  }
              }
          }
          relatedEntityGetElement.requestData = req;
          relatedEntityGetElement.generateRequest();
      }
  }

  get areAttributesEditable() {
      let hasWritePermissionValues = [];

      for (let attr in this._attributeModels) {
          if (this._attributeModels.hasOwnProperty(attr)) {
              hasWritePermissionValues.push(this._attributeModels[attr].hasWritePermission);
          }
      }

      return !hasWritePermissionValues.every(val => val === false);
  }
}
customElements.define(RockAttributeManage.is, RockAttributeManage);
