/**
`rock-relationship-attribute-manage` Represents the component to manage the relationship attribute values.
It renders the `rock-attribute-list` with the specified context parameters.
It is responsible to "get" and "save" the relationship attributes.

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
import '../bedrock-helpers/data-request-helper.js';
import '../bedrock-helpers/data-transform-helper.js';
import MessageHelper from '../bedrock-helpers/message-helper.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-buttons.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import '../liquid-entity-data-get/liquid-entity-data-get.js';
import '../liquid-entity-govern-data-get/liquid-entity-govern-data-get.js';
import '../liquid-entity-data-save/liquid-entity-data-save.js';
import '../liquid-entity-model-composite-get/liquid-entity-model-composite-get.js';
import '../liquid-rest/liquid-rest.js';
import '../pebble-button/pebble-button.js';
import '../pebble-dialog/pebble-dialog.js';
import '../rock-attribute-list/rock-attribute-list.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockRelationshipAttributeManage
    extends mixinBehaviors([
        RUFBehaviors.UIBehavior,
        RUFBehaviors.ComponentContextBehavior
    ], OptionalMutableData(PolymerElement)) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-grid-layout bedrock-style-padding-margin bedrock-style-buttons">
            :host {
                display: block;
                height: 100%;
                @apply --rock-attribute-manage;
            }

            #errorsDialog {
                --popup-header-color: var(--palette-pinkish-red, #ee204c);
            }
            .buttonContainer-top-right {
                text-align: right;
                padding-top: 10px;
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
                    <li>
                        <template is="dom-if" if="[[item.attributeExternalName]]">
                            [[item.relationshipRelToId]] [[item.attributeExternalName]] with error: [[item.message]]
                        </template>
                        <template is="dom-if" if="[[!item.attributeExternalName]]">
                            [[item.relationshipRelToId]] with error: [[item.message]]
                        </template>
                    </li>
                </template>
            </ul>
            <p>Do you want to fix the errors or continue?</p>
            <div class="buttons">
                <pebble-button id="ok" dialog-confirm="" class="btn btn-success" button-text="Fix" on-tap="_fixServerErrors"></pebble-button>
                <pebble-button id="skip" dialog-confirm="" class="btn btn-secondary" button-text="Skip &amp; Continue" on-tap="_skipServerErrors"></pebble-button>
            </div>
        </pebble-dialog>
        <pebble-dialog id="cancelDialog" dialog-title="Confirmation" modal="" alert-box="" show-cancel="" show-ok="" no-cancel-on-outside-click="" no-cancel-on-esc-key="">
            <p>Are you sure you want to discard the unsaved changes.</p>
        </pebble-dialog>
        <bedrock-pubsub event-name="on-buttonok-clicked" handler="_revertAll" target-id="cancelDialog"></bedrock-pubsub>
        <liquid-entity-data-get name="attributeGetDataService" data-index\$="[[dataIndex]]" operation="getbyids" request-data="{{_attributeRequest}}" last-response="{{_attributeResponse}}"></liquid-entity-data-get>
        <liquid-entity-govern-data-get id="attributeGetMessageService" operation="getbyids" request-data="{{_attributeMessageRequest}}" on-response="_onAttributesMessageReceived" on-error="_onEntityGetFailed"></liquid-entity-govern-data-get>
        <liquid-entity-data-save name="attributeSaveDataService" data-index\$="[[dataIndex]]" operation="[[_entityDataOperation]]" request-data="{{_saveRequest}}" last-response="{{_saveResponse}}" on-response="_onSaveResponse" on-error="_onSaveError"></liquid-entity-data-save>
        <liquid-entity-model-composite-get name="compositeAttributeModelGet" request-data="{{_attributeModelRequest}}" on-entity-model-composite-get-response="_onCompositeModelGetResponse">
        </liquid-entity-model-composite-get>
        <liquid-rest id="entityGovernService" url="/data/pass-through/entitygovernservice/validate" method="POST" request-data="{{_entityGovernRequest}}" on-liquid-response="_onEntityGovernResponse" on-liquid-error="_onEntityGovernFailed">
        </liquid-rest>
        <div class="base-grid-structure">
            <div class="base-grid-structure-child-1">
                <template is="dom-if" if="[[_showNoAttributeMessage]]">
                    <div align="center"> No attributes Found</div>
                </template>
            </div>
            <div class="base-grid-structure-child-2">
                <div class="base-grid-structure">
                    <div class="base-grid-structure-child-1">
                        <div id="buttonContainer" align="center" class="buttonContainer-top-right">
                            <pebble-button id="cancel" class="btn btn-secondary m-r-5" button-text="Cancel" on-tap="_openCancelDialog" elevation="1" raised=""></pebble-button>
                            <pebble-button id="save" class="focus btn btn-success" disabled="[[readonly]]" button-text="Save" on-tap="_save" elevation="1" raised=""></pebble-button>
                        </div>
                    </div>
                    <div class="base-grid-structure-child-2">
                        <rock-attribute-list context-data="[[contextData]]" readonly="[[readonly]]" show-group-name\$="[[showGroupName]]" group-name="[[groupName]]" attribute-values="[[_attributeValues]]" attribute-models="[[relationshipAttributeModels]]" dependent-attribute-values="[[_attributeValues]]" dependent-attribute-models="[[relationshipAttributeModels]]" no-of-columns="[[noOfColumns]]" mode="[[mode]]" attribute-messages="[[_attributeMessages]]" on-list-mode-changed="_onListModeChanged" need-attributes-grouping=""></rock-attribute-list>
                    </div>
                </div>
            </div>
        </div>
        <liquid-rest id="contextModelGet" url="/data/pass-through/entitymodelservice/getcontext" method="POST" request-data="{{_contextModelGetReq}}" on-liquid-response="_onContextModelGetResponse" on-liquid-error="_onContextModelGetFailed"></liquid-rest>
`;
  }

  static get is() { return 'rock-relationship-attribute-manage' }

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
          applyContextCoalesce: {
              type: Boolean,
              value: false
          },
          /**
           * Indicates the request object that is passed to the data element to retrive the attribute data.
           Sample: {
                      action: "getAttributes"
                    }
           */
          _attributeRequest: {
              type: Object,
              value: function () {
                  return {};
              }
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
           * Indicates the request object that is passed to the data element to retrive attribute model data.
           Sample: {
                    }
           */
          _attributeModelRequest: {
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
          relationshipAttributeModels: {
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
              value: "Relationship Attributes"
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
              value: function () { return {}; }
          },
          _syncValidationErrors: {
              type: Array,
              value: function () { return []; }
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
          _relationshipName: {
              type: String
          },
          _relationshipId: {
              type: String
          },
          /**
           * If set as true , it indicates the component is in read only mode
           */
          readonly: {
              type: Boolean,
              value: false
          },

          _contextModelGetReq: {
              type: Object,
              value: function () { return {}; }
          },

          _contextModels: {
              type: Object,
              value: function () { return {}; }
          },

          _relationshipModels: {
              type: Object,
              value: function () { return {}; }
          },

          dataIndex: {
              type: String,
              value: "entityData"
          },

          loadGovernData: {
              type: Boolean,
              value: true
          }

      }
  }


  static get observers() {
      return [
          '_attributeResponseChanged(_attributeResponse)',
          '_contextChanged(contextData.ValContexts)',
          '_modeChanged(mode)'
      ]
  }
  _onListModeChanged(e) {
      this._modeChanged(e.detail.mode);
  }

  _modeChanged(mode) {
      if (!mode) return;

      this.mode = mode;

      this.$.buttonContainer.hidden = mode !== 'edit';
  }
  _contextChanged(valueContexts) {

      if (_.isEmpty(valueContexts) || _.isEmpty(this.contextData)) {
          return;
      }

      if (this.configContext) {
          this.groupName = this.configContext.groupName ? this.configContext.groupName : this.groupName;
          this.dataIndex = this.configContext.dataIndex ? this.configContext.dataIndex : this.dataIndex;
          this.loadGovernData = this.configContext.loadGovernData ? this.configContext.loadGovernData : this.loadGovernData;
      }
      let itemContext = this.contextData[ContextHelper.CONTEXT_TYPE_ITEM][0];
      itemContext.attributeNames = [];
      if (!itemContext || !itemContext.relationships || !itemContext.relationshipAttributes) {
          return;
      }
      this._relationshipName = itemContext.relationships[0];
      this._relationshipId = itemContext.relationshipId;
      this._relationshipType = itemContext.relationshipType;

      this._contextModelGetReq = DataRequestHelper.createContextModelGetRequest(itemContext.type);
      let liquidElement = this.$$('#contextModelGet');
      if (liquidElement) {
          liquidElement.generateRequest();
      }

      let compositeModelGetRequest = DataRequestHelper.createEntityModelCompositeGetRequest(this.contextData);
      this.set("_attributeModelRequest", compositeModelGetRequest);
      let liquidModelGet = this.shadowRoot.querySelector("[name=compositeAttributeModelGet]");
      if (liquidModelGet && compositeModelGetRequest) {
          liquidModelGet.generateRequest();
      }
  }
  _onCompositeModelGetResponse(e) {
      let itemContext = this.getFirstItemContext();
      if (e && e.detail && DataHelper.validateGetModelsResponse(e.detail.response)) {
          let relType = "";
          if (e.detail.request) {
              relType = e.detail.request.requestData.params.fields.relationships[0];
          }
          let compositeModel = e.detail.response.content.entityModels[0];
          if (relType && compositeModel && compositeModel.data) {
              let relationships = this._relationshipModels = DataTransformHelper.transformRelationshipModels(compositeModel, this.contextData);

              if (relationships && relationships[relType]) {
                  let rel = relationships[relType] && relationships[relType].length ? relationships[relType][0] : undefined;
                  this._selfContext = relationships[relType].selfContext;
                  if (rel && rel.attributes) {
                      let relData = {};
                      relData.data = {};
                      relData.data.attributes = rel.attributes;
                      this.relationshipAttributeModels = DataTransformHelper.transformAttributeModels(relData, {});
                      let attributeNames = Object.keys(this.relationshipAttributeModels);
                      if (attributeNames.length > 0) {
                          //add attribute names in item context
                          itemContext.relationshipAttributes = attributeNames;

                          let req = DataRequestHelper.createEntityGetRequest(this.contextData);
                          
                          DataRequestHelper.addDefaultContext(req);
                          this.set("_attributeRequest", req);

                          let messageReq = DataHelper.cloneObject(req);

                          delete messageReq.params.query.valueContexts;

                          this.set("_attributeMessageRequest", messageReq);
                          let liquidGovernGet = this.$.attributeGetMessageService;
                          if (liquidGovernGet && this.loadGovernData) {
                              liquidGovernGet.generateRequest();
                          }
                          let liquidDataGet = this.shadowRoot.querySelector("[name=attributeGetDataService]");
                          if (liquidDataGet) {
                              liquidDataGet.useDataCoalesce = this.applyContextCoalesce;
                              liquidDataGet.generateRequest();
                          }
                          this._showNoAttributeMessage = false;
                      } else {
                          if (this.functionalMode == "dataFunction") {
                              this._showNoAttributeMessage = true;
                          }
                      }
                  }
              }
          }
      }
  }
  _onAttributesMessageReceived(e) {
      this._attributeMessages = {};
      let res = e.detail.response;
      let itemContext = this.getFirstItemContext();
      let entityId;
      let relationship;
      let allRelationships;
      if (itemContext) {
          entityId = itemContext.id;
      }
      let entity = DataHelper.findEntityById(res.content.entities, entityId);
      if (!entity || !entity.data || !entity.data.attributes) {
          this._attributeMessages = {};
          return;
      }
      let relationshipId = this._relationshipId;
      allRelationships = entity.data.relationships;
      if (allRelationships && !_.isEmpty(allRelationships)) {
          relationship = this._getCurrentRelationship(allRelationships);
      }
      if (relationship) {
          let attributes = relationship.attributes;
          let attrMessages = MessageHelper.getAttributeMessages(attributes, this.relationshipAttributeModels, this.messageCodeMapping, this.localize());
          this.set('_attributeMessages', attrMessages);
      } else {
          this._attributeMessages = {};
      }
  }
  _onEntityGetFailed(e) {
      this.logError("RelationshipAttributeManageGetFail", e);
  }
  async _attributeResponseChanged(_attributeResponse) {

      let attributes = [];

      if (DataHelper.validateGetEntitiesResponse(_attributeResponse) && this.relationshipAttributeModels) {
          let entity = _attributeResponse.content.entities[0];
          let relationships = EntityHelper.getCoalescedRelationshipByType(entity, this.contextData, this._relationshipName);
          let relationshipId = this._relationshipId;
          if (relationships && !_.isEmpty(relationships)) {
              let relationship = relationships.find(function (rel) {
                  return rel.relTo.id == relationshipId;
              });
              let relData = { "data": {} };
              if (relationship) {
                  relData.data.attributes = relationship.attributes;
              }
              attributes = DataTransformHelper.transformAttributes(relData, this.relationshipAttributeModels, {}, "array", true);
              //Removed the code for rock-title bar
          }
      }
      this._attributeValues = attributes;
  }
  extractAttributes(changedAttributeElements) {
      let attributesJSON = [];
      for (let changedAttributeElementsIndex = 0; changedAttributeElementsIndex < changedAttributeElements.length; changedAttributeElementsIndex++) {
          let attributeElement = changedAttributeElements[changedAttributeElementsIndex];
          let attributeJSON = undefined;
          if (attributeElement.attributeObject.action == "delete" || _.isEmpty(attributeElement.attributeObject.value)) {
              attributeJSON = DataHelper.cloneObject(attributeElement.originalAttributeObject);
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
  async _save(e) {
      //TODO: Needs to check with Vishal.
      if (e.currentTarget.disabled) {
          return;
      }

      //check if any changes
      //if none, then return operationResult with warning message else proceed
      let attributeList = this.shadowRoot.querySelector('rock-attribute-list');

      //If have errors return
      if (!this.allowSaveOnError && attributeList.hasModelErrors()) {
          this.showWarningToast("Cannot save the entity, resolve the errors.");
          return;
      }

      let changedAttributeElements = attributeList.getChangedAttributeElements();
      if (changedAttributeElements == undefined || changedAttributeElements.length == 0) {
          let toastElement = RUFUtilities.pebbleAppToast;
          toastElement.fitInto = RUFUtilities.appCommon.shadowRoot.querySelector("#toastArea");
          toastElement.toastType = "information";
          toastElement.heading = "Information";
          toastElement.autoClose = true;

          RUFUtilities.appCommon.toastText = "No changes to save";

          toastElement.show();
          return {
              "message": "No changes to save"
          };
      }

      let relationshipAttributesJSON = this.extractAttributes(changedAttributeElements);

      let firstValueContext = this.getFirstValueContext();
      let newEntity = {};
      if (this._attributeResponse && this._attributeResponse.content && this._attributeResponse.content.entities && this._attributeResponse.content.entities.length > 0) {
          let originalEntity = this._attributeResponse.content.entities[0];
          newEntity = await DataTransformHelper.prepareEntityForRelationshipSave(originalEntity, relationshipAttributesJSON, this.contextData, this._relationshipModels, this._contextModels);
          this._entityDataOperation = "update";

          if (!_.isEmpty(newEntity)) {
              //set requestObject for save liquid
              this._saveRequest = {
                  "entities": [newEntity]
              };
              if (this.functionalMode == "quickManage") {
                  let clientState = {};
                  clientState.notificationInfo = {};
                  clientState.notificationInfo.showNotificationToUser = true;


                  let firstDataContext = ContextHelper.getFirstDataContext(this.contextData);
                  let firstItemContext = ContextHelper.getFirstItemContext(this.contextData);
                  if (firstItemContext && !_.isEmpty(firstItemContext)) {
                      let relationshipName = firstItemContext.relationships[0];
                      let relationshipId = firstItemContext.relationshipId;
                      let relToType = firstItemContext.relatedEntityType;
                      let _newEntity = DataHelper.cloneObject(originalEntity);
                      let relationships = EntityHelper.getRelationshipByRelationshipType(_newEntity, firstDataContext, relationshipName);
                      let relationship = relationships.find(function (rel) {
                          return rel.relTo.id == relationshipId;
                      });
                      if (relationshipId && relToType) {
                          clientState.notificationInfo.quickManageInfo = {
                              id: relationshipId,
                              type: relToType
                          }
                      }
                  }

                  this._saveRequest["clientState"] = clientState;
              }
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
  }
  _saveEntity() {
      let liquidSave = this.shadowRoot.querySelector("[name=attributeSaveDataService]");
      if (liquidSave) {
          liquidSave.generateRequest();
      }
  }
  _onSaveResponse(e) {
      let liquidGet = this.shadowRoot.querySelector("[name=attributeGetDataService]");
      let liquidSave = this.shadowRoot.querySelector("[name=attributeSaveDataService]");

      if (liquidGet) {
          this.mode = "view";
          let attributeList = this.shadowRoot.querySelector('rock-attribute-list');
          attributeList.resetChanged();
          liquidGet.generateRequest();
      }

      if (!(liquidSave && liquidSave.operation == 'create')) {
          let liquidGovernGet = this.$.attributeGetMessageService;
          if (liquidGovernGet && this.loadGovernData) {
              liquidGovernGet.generateRequest();
          }
      }

      let message = this.successMessage ? this.successMessage : "Attribute save request is submitted successfully!!";
      this.showSuccessToast(message, 5000);

      //Raise event on attributes save
      this.fireBedrockEvent("on-attribute-save", null, { ignoreId: true });
      if (this.functionalMode == "dataFunction") {
          let eventName = "onSave";
          let eventDetail = {
              name: eventName
          };
          this.fireBedrockEvent(eventName, eventDetail, { ignoreId: true });
      }
      if (this.functionalMode == "quickManage") {
          this.fireBedrockEvent("on-attribute-save-quickmanage", null, { ignoreId: true }); 
      }
          
  }
  _onSaveError(e) {
      this.logError("Failed to update entity", e.detail);
  }
  _openCancelDialog() {
      if (this.getIsDirty()) {
          this.shadowRoot.querySelector("#cancelDialog").open();
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
          this.fireBedrockEvent(eventName, eventDetail, { ignoreId: true });
      } else {
          let attributeList = this.shadowRoot.querySelector('rock-attribute-list');
          attributeList.revertAll();
          this.mode = "view";
          this._resetErrors();
      }
  }
  _resetErrors() {
      this.shadowRoot.querySelector('rock-attribute-list').updateDependentAttributesAndResetErrors();
  }
  _getCurrentRelationship(allRelationships) {
      let relationshipName, relationshipId, relationships, relationship
      relationshipName = this._relationshipName
      relationshipId = this._relationshipId
      if (relationshipName && relationshipId && allRelationships) {
          relationships = allRelationships[relationshipName];
          if (relationships && relationships.length) {
              relationship = relationships.find(function (rel) {
                  return rel.relTo.id == relationshipId;
              });
          }
      }
      return relationship;
  }
  _getRelatioshipGovernMessage(allRelationships) {
      let relationshipGovernMessages = {}, relationshipMessages, relationship;
      relationship = this._getCurrentRelationship(allRelationships);
      if (relationship) {
          relationshipMessages = MessageHelper.getRelationshipMessages(relationship, this.messageCodeMapping, this.localize());
          let attrModels = this.relationshipAttributeModels;
          let relAttributes = relationship.attributes;
          relationshipGovernMessages = {
              "relMessage": relationshipMessages,
              "attrModels": attrModels,
              "relAttributes": relAttributes,
              "relationship": [relationship]
          };
      }
      return relationshipGovernMessages;
  }
  _getGovernErrorMessages(relationshipGovernMessages) {
      let governErrorMessage = {}, relationshipName, relAttributeMessage = {};
      relationshipName = this._relationshipName
      if (relationshipName) {
          relAttributeMessage[relationshipName] = relationshipGovernMessages
          if (!_.isEmpty(relAttributeMessage)) {
              governErrorMessage = MessageHelper.getErrorsFromRelMessages(relAttributeMessage, this.messageCodeMapping, this.localize());
          }
      }
      return governErrorMessage;
  }
  _getGovernMessages(allRelationships) {
      let relationshipGovernMessages, governMessage;
      relationshipGovernMessages = this._getRelatioshipGovernMessage(allRelationships);
      governMessage = this._getGovernErrorMessages(relationshipGovernMessages);
      return governMessage;
  }
  _onEntityGovernResponse(e) {
      if (e && e.detail && e.detail.response && e.detail.response.response && e.detail.response.response.status == "success") {
          let res = e.detail.response.response;
          let itemContext = this.getFirstItemContext();
          let governMessage;
          let entityId;
          if (itemContext) {
              entityId = itemContext.id;
          }
          let entity = DataHelper.findEntityById(res.entities, entityId);
          if (entity && entity.data && entity.data.relationships) {
              let allRelationships = entity.data.relationships;
              governMessage = this._getGovernMessages(allRelationships)
          }
          if (!_.isEmpty(governMessage)) {
              this.set("_syncValidationErrors", governMessage);
              this.shadowRoot.querySelector('#errorsDialog').open();
          } else {
              this._saveEntity();
          }
      } else {
          this.logError("There is a problem in validation service.", e.detail);
      }
  }
  _onEntityGovernFailed(e) {
      this.logError("RelationshipAttributeManageGovernFail:- There is a problem in validation service.", e.detail);
  }
  _skipServerErrors() {
      let errorDialog = this.$.errorsDialog;
      if (errorDialog) {
          errorDialog.close();
      }
      this._saveEntity();
  }
  _fixServerErrors() {
      let errorDialog = this.$.errorsDialog;
      if (errorDialog) {
          errorDialog.close();
      }

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
  refresh() {
      this._contextChanged(this.contextData.ValContexts);
  }
  /**
   * Can be used to get the elements if they are dirty.
   */
  getIsDirty() {
      let attributeList = this.shadowRoot.querySelector("rock-attribute-list");
      if (attributeList && attributeList.getIsDirty) {
          return attributeList.getIsDirty();
      }
  }
  /**
   * Can be used to get the controls if they are dirty.
   */
  getControlIsDirty() {
      let attributeList = this.shadowRoot.querySelector("rock-attribute-list");
      if (attributeList && attributeList.getControlIsDirty) {
          return attributeList.getControlIsDirty();
      }
  }
  _onContextModelGetResponse(e) {
      let response = e.detail.response.response;

      if (response) {
          let entityModels = response.entityModels;

          if (entityModels && entityModels.length) {
              this._contextModels = entityModels[0].data ? entityModels[0].data.contexts : undefined;
          }
      }
  }
}
customElements.define(RockRelationshipAttributeManage.is, RockRelationshipAttributeManage)
