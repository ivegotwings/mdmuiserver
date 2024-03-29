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

import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../liquid-dataobject-utils/liquid-dataobject-utils.js';
import '../liquid-entity-data-save/liquid-entity-data-save.js';
import '../liquid-rest/liquid-rest.js';
import '../pebble-spinner/pebble-spinner.js';
import '../pebble-button/pebble-button.js';
import '../rock-entity-lov/rock-entity-lov.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockRollUp extends mixinBehaviors([RUFBehaviors.UIBehavior, RUFBehaviors.ComponentContextBehavior],
    PolymerElement) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-padding-margin">
            rock-entity-lov {
                --pebble-lov: {
                    width: 250px;
                    border: 1px solid rgba(27, 31, 35, 0.15);                  
                }
            }

            rock-entity-lov {
                margin: 0 auto;
                display: inline-block;
                padding: 20px;
            }

            .lovContainer {
                text-align: center;
            }

            .message {
                text-align: center;
            }

            .buttons {
                text-align: center;
            }
        </style>
        <pebble-spinner active="[[_loading]]"></pebble-spinner>
        <div class="message">[[_validationMessage]]</div>
        <template is="dom-if" if="[[_isValidForProcess(selectedEntities, sourceEntityType, _initiated)]]">
            <div class="buttons">
                <pebble-button class="btn btn-success m-r-5" on-tap="_onTapProcess" data-args="new" button-text\$="Group to New [[entityTypeExternalName]]"></pebble-button>
                <pebble-button class="btn btn-success" on-tap="_onTapProcess" data-args="existing" button-text\$="Group to Existing [[entityTypeExternalName]]"></pebble-button>
            </div>
        </template>
        <template is="dom-if" if="[[_isInitiated(_initiated)]]">
            <div class="message p-t-10">[[_message]]</div>
            <template is="dom-if" if="[[!_isNewRollup(_newRollup)]]">
                <template is="dom-if" if="[[!_doNotallowUserActions]]">
                    <div class="lovContainer p-t-10">
                        <div>Select the entity to add relationship</div>
                        <rock-entity-lov id="rockEntityLovForDropdown" request-data="[[_lovRequestData]]" selected-items="{{selectedItems}}" id-field="[[_lovValueField]]" title-pattern="[[titlePattern]]" value-field="[[_lovValueField]]" multi-select="">
                        </rock-entity-lov>
                        <div class="buttons">
                            <pebble-button class="btn btn-secondary" on-tap="_onCancel" button-text="Cancel"></pebble-button>
                            <pebble-button class="btn btn-success" on-tap="_onAddRelationships" button-text="Save"></pebble-button>
                        </div>
                    </div>
                </template>
            </template>
        </template>
        <liquid-entity-data-save name="entitySaveService" request-data="{{_saveRequest}}" last-response="{{_saveResponse}}" on-response="_onSaveResponse" on-error="_onSaveError">
        </liquid-entity-data-save>
        <liquid-rest id="entityGovernService" url="/data/pass-through-bulk/entitygovernservice/validate" method="POST" request-data="{{_entityGovernRequest}}" on-liquid-response="_onEntityGovernResponse" on-liquid-error="_onEntityGovernFailed">
        </liquid-rest>
`;
  }

  static get is() {
      return "rock-roll-up";
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
          /**
           * <b><i>Content development is under progress... </b></i> 
           */
          selectedEntities: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          _newRollup: {
              type: Boolean
          },

          _initiated: {
              type: Boolean,
              value: false
          },

          _lovRequestData: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          /**
           * <b><i>Content development is under progress... </b></i> 
           */
          businessFunctionData: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          /**
           * <b><i>Content development is under progress... </b></i> 
           */
          entityType: {
              type: String
          },
          /**
           * <b><i>Content development is under progress... </b></i> 
           */
          entityTypeExternalName: {
              type: String
          },
          /**
           * <b><i>Content development is under progress... </b></i> 
           */
          relationshipType: {
              type: String
          },
          /**
           * <b><i>Content development is under progress... </b></i> 
           */
          relationshipName: {
              type: String
          },
          /**
           * <b><i>Content development is under progress... </b></i> 
           */
          sourceEntityType: {
              type: String
          },
          /**
           * <b><i>Content development is under progress... </b></i> 
           */
          direction: {
              type: String
          },
          /**
           * <b><i>Content development is under progress... </b></i> 
           */
          titlePattern: {
              type: String
          },

          syncValidations: {
              type: Array
          },

          _loading: {
              type: Boolean,
              value: false
          },

          _message: {
              type: String
          },

          _doNotallowUserActions: {
              type: Boolean,
              value: false
          },

          _lovValueField: {
              type: String,
              value: "id"
          },

          _redirectEntity: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          _responseMessages: {
              type: Array,
              value: function () {
                  return [];
              }
          }
      }
  }
  _onTapProcess(e) {
      let _processType = e.currentTarget.getAttribute('data-args');

      if (_processType == "new") {
          this._newRollup = true;
      } else {
          this._newRollup = false;
      }

      this._initiated = true;
      this._executeRollupProcess();
  }

  _isInitiated() {
      return this._initiated;
  }

  _isNewRollup() {
      return this._newRollup;
  }

  _executeRollupProcess() {
      // Start process when all the details are available
      if (this.contextData && !_.isEmpty(this.contextData) &&
          this.selectedEntities && this.selectedEntities.length > 0 &&
          this.entityType && this.relationshipType && this.relationshipName &&
          this.sourceEntityType && this._newRollup != undefined &&
          this.direction) {

          this._loading = true;

          if (this._newRollup) // No LOV
          {
              this._createEntity();
          } else // LOV
          {
              this._loadEntitiesPerType();
          }
      }
  }

  _isValidForProcess() {

      if (this._initiated) //Already initiated, then validation process not needed
      {
          return false;
      }

      if (!this.selectedEntities || this.selectedEntities.length <= 0 || !this.sourceEntityType) {
          return false;
      }

      for (let i = 0; i < this.selectedEntities.length; i++) {
          if (this.selectedEntities[i].type != this.sourceEntityType) {
              this._validationMessage = "All selected entities should be " + this.sourceEntityType +
                  " type for the process, select valid entities."
              return false;
          }
      }

      return true;
  }

  _loadEntitiesPerType() {
      let _clonedContextData = DataHelper.cloneObject(this.contextData);
      let _entityRequest = DataRequestHelper.createEntityGetRequest(_clonedContextData);
      if (_entityRequest && DataHelper.isValidObjectPath(_entityRequest,
              "params.query.filters.typesCriterion")) {
          //Prepare request to get all entities of the type
          _entityRequest.params.query.filters.typesCriterion = [];
          _entityRequest.params.query.filters.typesCriterion.push(this.entityType);
          delete _entityRequest.params.query.contexts;
          delete _entityRequest.params.fields;

          this._lovRequestData = _entityRequest;
      }

      this._loading = false;
  }

  // Entity can be created for lot, pp and ensemble
  _createEntity() {
      this._message = this.direction == "up" ? "Creating the new entity" :
          "Creating the new entity with relationships";

      let _clonedContextData = DataHelper.cloneObject(this.contextData);
      let userContext = ContextHelper.getFirstUserContext(_clonedContextData);

      let entityId = "e" + ElementHelper.getRandomString();
      let itemCtx = ContextHelper.getFirstItemContext(_clonedContextData);
      itemCtx.id = entityId;
      itemCtx.type = this.entityType;

      let defaultLocale = DataHelper.getDefaultLocale();
      let defaultSource = DataHelper.getDefaultSource();
      // Todo - should be removed, once able to create entity without attributes
      let tempAttributes = [{
          "value": entityId,
          "source": defaultSource,
          "locale": defaultLocale,
          "selfContext": 1,
          "name": "id"
      }];

      let newEntity = DataTransformHelper.prepareEntityForCreate(entityId, this.entityType,
          tempAttributes, _clonedContextData, userContext.user);

      // If direction is down, then add relationships while entity create
      if (this.direction == "down") {
          let relationships = this._prepareRelationships();
          newEntity.data["relationships"] = {};
          newEntity.data["relationships"][this.relationshipName] = relationships;
      }

      this._saveRequest = {
          "entities": [newEntity]
      };

      this._triggerEntitySave("create");
  }

  _addClientStatus() {
      let clientState = {};
      clientState.notificationInfo = {};
      clientState.notificationInfo.showNotificationToUser = false;
      this._saveRequest["clientState"] = clientState;

  }

  _onSaveResponse(e, detail) {
      if (detail.request.operation != "update") // Once entity is created, then create relationships
      {
          if (DataHelper.isValidObjectPath(detail, "request.requestData.entities.0")) {
              let _entity = detail.request.requestData.entities[0];
              this._redirectEntity = {
                  "id": _entity.id,
                  "type": _entity.type
              };

              if (this.direction == "up") {
                  let _targetList = [];
                  _targetList.push({
                      "id": _entity.id,
                      "type": _entity.type
                  });
                  this._createRelationshipsUp(_targetList);
              } else {
                  this._triggerFinishStep();
              }
          }
      } else {
          this._triggerFinishStep();
      }
  }

  _onSaveError(e, detail) {
      this.logError("Unable to procecss the rollups now, contact administrator.", e.detail);
      this._loading = false;
  }

  // lot-sku (isChildOf)
  _createRelationshipsUp(_targetList) {
      let _clonedContextData = DataHelper.cloneObject(this.contextData);
      let utils = SharedUtils.DataObjectFalcorUtil;

      if (this.selectedEntities && this.selectedEntities.length > 0 && _targetList && _targetList.length >
          0) {
          let _relationshipList = [];
          for (let i = 0; i < _targetList.length; i++) {
              let rel = {
                  "direction": "both",
                  "relationshipType": this.relationshipType,
                  "relTo": {
                      "id": _targetList[i].id,
                      "type": _targetList[i].type
                  }
              };
              _relationshipList.push(rel);
          }

          let upRelationshipRequests = [];
          for (let i = 0; i < this.selectedEntities.length; i++) {
              let upRelationshipRequest = {
                  "id": this.selectedEntities[i].id,
                  "type": this.selectedEntities[i].type,
                  "data": {
                      "relationships": {}
                  }
              };

              upRelationshipRequest.data.relationships[this.relationshipName] = _relationshipList;
              upRelationshipRequests.push(upRelationshipRequest);
          }

          this._saveRequest = {
              "entities": upRelationshipRequests
          };
          this._addClientStatus();

          if (this.syncValidations && this.syncValidations.length > 0) {
              this._message = "Validating grouping entity";
              this.set("_entityGovernRequest", this._saveRequest);
              this._triggerValidationRequest();
          } else {
              this._message = "Creating relationships";
              this._triggerEntitySave("update");
          }
      }
  }

  // ensembletopp
  // productpresentationtolot
  _createRelationshipsDown(_targetList) {
      this._message = "Creating relationships";
      let _clonedContextData = DataHelper.cloneObject(this.contextData);
      let utils = SharedUtils.DataObjectFalcorUtil;

      if (this.selectedEntities && this.selectedEntities.length > 0 && _targetList && _targetList.length >
          0) {
          let relationshipRequests = [];
          let relationships = this._prepareRelationships();

          for (let i = 0; i < _targetList.length; i++) {
              let relReq = {
                  "id": _targetList[i].id,
                  "type": _targetList[i].type,
                  "data": {
                      "relationships": {}
                  }
              };
              relReq.data.relationships[this.relationshipName] = relationships;
              relationshipRequests.push(relReq);
          }

          this._saveRequest = {
              "entities": relationshipRequests
          };
          this._addClientStatus();
          this._triggerEntitySave("update");
      }
  }

  _onEntityGovernResponse(e) {
      if (e && DataHelper.isValidObjectPath(e, "detail.response")) {
          let validationResponse = e.detail.response;
          if (validationResponse.length > 0) {
              for (let i = 0; i < validationResponse.length; i++) {
                  if (this.syncValidations && this.syncValidations.length > 0) {
                      for (let j = 0; j < this.syncValidations.length; j++) {
                          if (DataHelper.isValidObjectPath(validationResponse[i],
                                  "operationResponse.response.entities.0.data.attributes." + this.syncValidations[
                                      j].attribute + ".properties.messages")) {
                              let attrMessages = validationResponse[i].operationResponse.response.entities[
                                      0].data.attributes[this.syncValidations[j].attribute].properties
                                  .messages;

                              if (attrMessages.length > 0 && attrMessages.find(obj => obj.messageCode ==
                                      this.syncValidations[j].code)) {
                                  let entityId = validationResponse[i].operationResponse.response.entities[
                                      0].id;
                                  let entity = this._responseMessages.find(obj => obj["Entity Id"] ==
                                      entityId);

                                  if (entity) {
                                      entity.Message = entity.Message + ", " + this.syncValidations[j]
                                          .message;
                                  } else {
                                      this._responseMessages.push({
                                          "Entity Id": entityId,
                                          "Message": this.syncValidations[j].message
                                      });
                                  }
                              }
                          }
                      }
                  }
              }
          }

          // No response messages means no errors, so do the save process
          if (_.isEmpty(this._responseMessages)) {
              this._message = "Creating relationships";
              this._triggerEntitySave("update");
          } else {
              this._triggerFinishStep(true); //true - has validation errors, so stop the process
          }
      }
  }

  _triggerEntitySave(operation) {
      let liquidSave = this.shadowRoot.querySelector("[name=entitySaveService]");
      if (liquidSave) {
          liquidSave.operation = operation;
          liquidSave.generateRequest();
      }
  }

  _triggerValidationRequest() {
      let liquidGovernGet = this.$.entityGovernService;
      if (liquidGovernGet) {
          liquidGovernGet.generateRequest();
      }
  }

  _onEntityGovernFailed(e) {
      this.logError("AttributeManageGovernFail:- There is a problem in validation service.", e.detail);
      this._loading = false;
  }

  _prepareRelationships(_targetList) {
      let relationships = [];

      for (let i = 0; i < this.selectedEntities.length; i++) {
          let rel = {
              "direction": "both",
              "relationshipType": this.relationshipType,
              "relTo": {
                  "id": this.selectedEntities[i].id,
                  "type": this.selectedEntities[i].type
              }
          };
          relationships.push(rel);
      }

      return relationships;
  }

  _onAddRelationships() {
      if (!this.selectedItems || this.selectedItems.length == 0) {
          return;
      }

      if (this.selectedItems.length == 1) {
          this._redirectEntity = {
              "id": this.selectedItems[0].id,
              "type": this.entityType
          };
      }

      let _targetList = [];
      this._loading = true;

      for (let i = 0; i < this.selectedItems.length; i++) {
          _targetList.push({
              "id": this.selectedItems[i].id,
              "type": this.entityType
          });
      }

      if (this.direction == "up") {
          this._createRelationshipsUp(_targetList);
      } else {
          this._createRelationshipsDown(_targetList);
      }
  }

  _onCancel() {
      //Reset
      this._message = "";
      this._doNotallowUserActions = false;

      let eventName = "onCancel";
      let eventDetail = {
          name: eventName
      }

      this.fireBedrockEvent(eventName, eventDetail, {
          ignoreId: true
      });
  }

  _triggerFinishStep(hasValidationErrors) {
      let noGrid = false;
      let message = "";
      let actions = [{
          "name": "goBack",
          "text": "Take me back to where I started",
          "isNotApp": true
      }];

      if (!hasValidationErrors) {
          noGrid = true;
          if (this._newRollup) {
              message = "Completed the " + this.entityType +
                  " creation with relationships. What do you want to do now?";
          } else {
              message =
                  "Completed the relationship creation with selected entities. What do you want to do now?";
          }

          if (this._redirectEntity && !_.isEmpty(this._redirectEntity)) {
              actions.push({
                  "name": "showEntity",
                  "text": "Show me the entity",
                  "isNotApp": true,
                  "dataRoute": "entity-manage",
                  "queryParams": {
                      "id": encodeURIComponent(this._redirectEntity.id),
                      "type": encodeURIComponent(this._redirectEntity.type)
                  }
              });
          }
      }

      let data = {
          "messages": this._responseMessages,
          "message": message,
          "noGrid": noGrid,
          "actions": actions,
          "contextData": this.contextData,
          "processedEntities": this.selectedEntities,
          "messageKey": "Entity Id"
      };

      this.businessFunctionData = data;
      let eventName = "onComplete";
      let eventDetail = {
          name: eventName
      }

      this.fireBedrockEvent(eventName, eventDetail, {
          ignoreId: true
      });

      this._message = "About to complete, please wait...";
      this._loading = true;

      //Reset contextData, selectedEntities, currentWorkflow
      this.contextData = {};
      this.selectedEntities = [];
      this.currentWorkflow = {};
  }
}
customElements.define(RockRollUp.is, RockRollUp);
