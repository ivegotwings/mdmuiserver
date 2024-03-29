/**
`rock-entity-create-single` Represents a component that renders a panel with the initial set of 
attributes during the single entity creation. 

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
import '../bedrock-helpers/element-helper.js';
import '../bedrock-helpers/data-transform-helper.js';
import MessageHelper from '../bedrock-helpers/message-helper.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-business-function-behavior/bedrock-component-business-function-behavior.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import '../liquid-entity-model-composite-get/liquid-entity-model-composite-get.js';
import '../liquid-entity-data-save/liquid-entity-data-save.js';
import '../liquid-entity-govern-data-get/liquid-entity-govern-data-get.js';
import '../liquid-rest/liquid-rest.js';
import '../liquid-entity-data-get/liquid-entity-data-get.js';
import '../pebble-button/pebble-button.js';
import '../pebble-spinner/pebble-spinner.js';
import '../pebble-dialog/pebble-dialog.js';
import '../rock-attribute-list/rock-attribute-list.js';
import '../rock-compare-entities/rock-compare-entities.js';
import EntityTypeManager from '../bedrock-managers/entity-type-manager.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockEntityCreateSingle
    extends mixinBehaviors([
        RUFBehaviors.UIBehavior,
        RUFBehaviors.ComponentContextBehavior,
        RUFBehaviors.ComponentBusinessFunctionBehavior
    ], OptionalMutableData(PolymerElement)) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-grid-layout bedrock-style-padding-margin">
            :host {
                display: block;
                height: 100%;
            }

            #errorsDialog {
                --popup-header-color: var(--palette-pinkish-red, #ee204c);
            }

            .buttonContainer-top-right {
                text-align: right;
                padding-top: 10px;
                margin-bottom: 0px;
                margin-top: 0px;
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
        <liquid-rest id="entityMatchService" url="/data/pass-through/matchservice/search" method="POST" request-data="{{_entityMatchRequest}}" on-liquid-response="_onMatchSuccess" on-liquid-error="_onMatchFailure">
        </liquid-rest>
        <liquid-rest id="entityGovernService" url="/data/pass-through/entitygovernservice/validate" method="POST" request-data="{{_entityGovernRequest}}" on-liquid-response="_onEntityGovernResponse" on-liquid-error="_onEntityGovernFailed">
        </liquid-rest>
        <liquid-rest id="modelGovernService" url="/data/pass-through/modelgovernservice/validate" method="POST" request-data="{{_modelGovernRequest}}" on-liquid-response="_onEntityGovernResponse" on-liquid-error="_onEntityGovernFailed">
        </liquid-rest>
        <pebble-dialog id="updateConfirmDialog" modal="" small="" vertical-offset="1" 50="" horizontal-align="auto" vertical-align="auto" no-cancel-on-outside-click="" no-cancel-on-esc-key="" dialog-title="Found Match">
            <p>Found the below matching entity with high accuracy in the system: </p>
            <ul class="error-list">
                <li>Id: [[_matchedEntity.id]]</li>
                <li>Type: [[_getExternalEntityType(_matchedEntity.type)]]</li>
            </ul>
            <p>Do you want to update the entity?</p>
            <div class="buttons">
                <pebble-button id="ok" class="close btn btn-secondary m-r-5" button-text="Update" on-tap="_updateEntity"></pebble-button>
                <pebble-button id="skip" class="apply btn btn-success" button-text="Cancel" on-tap="_cancelProcess"></pebble-button>
            </div>
        </pebble-dialog>
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
        <div id="content-entity-create" class="base-grid-structure">
            <div id="content-actions" class="buttonContainer-top-right base-grid-structure-child-1" align="center">
                <template is="dom-if" if="[[!isPartOfBusinessFunction]]">
                    <pebble-button class="action-button btn btn-secondary m-l-5" id="cancel" button-text="Cancel" raised="" on-tap="_onCancelTap"></pebble-button>
                </template>
                <pebble-button class="action-button-focus dropdownText btn btn-success m-l-5" id="next" button-text="[[_saveButtonText]]" raised="" on-tap="_onSaveTap"></pebble-button>
            </div>
            <div class="base-grid-structure-child-2">
                <rock-attribute-list attribute-values="[[_attributeValues]]" attribute-models="[[_attributeModels]]" context-data="[[contextData]]" no-of-columns="3" mode="[[mode]]" attribute-messages="[[_attributeMessages]]" dependent-attribute-values="[[_attributeValues]]" dependent-attribute-models="[[_attributeModels]]" hide-revert="" hide-history=""></rock-attribute-list>
            </div>
        </div>
        <div id="content-entity-match" hidden="" class="full-height">
            <rock-compare-entities id="matchEntities" enable-relationships-match-merge="[[enableRelationshipsMatchMerge]]" compare-entities-context="[[compareEntitiesContext]]" attribute-names="[[attributeNames]]" show-action-buttons="" enable-column-select="" is-part-of-business-function\$="[[isPartOfBusinessFunction]]" show-all-attributes></rock-compare-entities>
        </div>
        <liquid-entity-model-composite-get name="compositeAttributeModelGet" request-data="{{attributeModelRequest}}" on-entity-model-composite-get-response="_onCompositeModelGetResponse">
        <liquid-entity-data-save name="entitySaveService" operation="create" data-index="[[dataIndex]]" data-sub-index="[[dataSubIndex]]" request-data="{{_saveRequest}}" last-response="{{_saveResponse}}" on-response="_onSaveResponse" on-error="_onSaveError"></liquid-entity-data-save>
        <liquid-entity-data-get name="entityGetDataService" operation="getbyids" data-index="[[dataIndex]]" data-sub-index="[[dataSubIndex]]" request-data="{{entityGetRequest}}" on-response="_onEntityGetResponse" on-error="_onEntityGetError" include-type-external-name=""></liquid-entity-data-get>
        <bedrock-pubsub event-name="error-length-changed" handler="_errorLengthChanged"></bedrock-pubsub>
        <bedrock-pubsub event-name="compare-entities-back" handler="_onCompareEntitiesBack" target-id="matchEntities"></bedrock-pubsub>
        <bedrock-pubsub event-name="compare-entities-discard" handler="_onCompareEntitiesDiscard" target-id="matchEntities"></bedrock-pubsub>
        <bedrock-pubsub event-name="compare-entities-create" handler="_onCompareEntitiesCreate" target-id="matchEntities"></bedrock-pubsub>
        <bedrock-pubsub event-name="compare-entities-merge" handler="_onCompareEntitiesMerge" target-id="matchEntities"></bedrock-pubsub>
        <bedrock-pubsub event-name="entity-model-created" handler="_onEntityModelCreated"></bedrock-pubsub>
    </liquid-entity-model-composite-get>
`;
  }

  static get is() {
      return 'rock-entity-create-single';
  }
  static get observers() {
      return [
          '_contextChanged(attributeNames, contextData)'
      ]
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
           * Indicates the names of the attributes that are rendered while creating a single entity.
           */
          attributeNames: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          /**
           * Indicates the mode in which the attributes are rendered.
           */
          mode: {
              type: String,
              value: "edit",
              notify: true
          },
          /**
           * Specifies the request object for the attribute model request.
           */
          attributeModelRequest: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          /**
           * Specifies the response object for the attribute models.
           */
          attributeModelResponse: {
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
          enableRelationshipsMatchMerge: {
              type: Boolean,
              value: false
          },
          _attributeMessages: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _saveRequest: {
              type: Object,
              value: function () { return {}; }
          },
          _loading: {
              type: Boolean,
              value: false
          },
          /**
           * Specifies the length of the error message.
           */
          errorLength: {
              type: Number,
              notify: true,
              value: 0
          },
          _entityMatchRequest: {
              type: Object,
              value: function () { return {}; }
          },
          _matchedEntity: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          compareEntitiesContext: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _syncValidationErrors: {
              type: Array,
              value: function () { return []; }
          },
          /**
           * <b><i>Content development is under progress... </b></i> 
           */
          messageCodeMapping: {
              type: Object,
              value: function () { return {}; }
          },
          skipNext: {
              type: Boolean,
              value: false
          },
          matchConfig: {
              type: Object,
              value: function () { return {}; }
          },
          enableMatchStep: {
              type: Boolean,
              value: true
          },
          matchType: {
              type: String,
              value: "deterministic"
          },
          defaultEntity: {
              type: Object,
              value: function () { return {}; }
          },
          dataIndex: {
              type: String,
              value: "entityData"
          },
          entityDomain: {
              type: String,
              value: ""
          },
          _onEntityModelCreated: {
              type: Function,
              value: function () {
                  return "";
              }
          },
          savedEntity: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _saveButtonText: {
              type: String,
              value: "Create"
          },
          isReviewProcess: {
              type: Boolean,
              value: false
          },
          _mlBasedResults: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          _matchPermissions: {
              type: Object,
              value: function () {
                  return {
                      "submitPermission": false,
                      "mergePermission": true
                  };
              }
          },
          _matchThreshold: {
              type: Object,
              value: function () {
                  return {
                      "create": 0,
                      "merge": 100
                  }
              }
          },
          _isMergeProcess: {
              type: Boolean,
              value: true
          }
      }
  }
  disconnectedCallback() {
      super.disconnectedCallback();
  }
  _contextChanged(attributeNames, contextData) {
      if (attributeNames && attributeNames.length > 0 && !_.isEmpty(contextData)) {
          let firstItemContext = this.getFirstItemContext();

          if (typeof (firstItemContext) != "undefined") {
              firstItemContext.attributeNames = attributeNames;
          }

          if(firstItemContext.id) {
              this._saveButtonText = "Update";
              this._triggerEntityGet();
          } else {
              this._triggerAttributeModelGet();
          }
      }
  }

  _triggerEntityGet() {
      let req = DataRequestHelper.createEntityGetRequest(this.contextData);
      let itemContext = ContextHelper.getFirstItemContext(this.contextData);
      if (this.isReviewProcess && itemContext && DataHelper.isValidObjectPath(req, "params.query.filters.typesCriterion")) {
          req.params.query.filters.typesCriterion[0] = "rsdraft" + itemContext.type;
      }
      this.set("entityGetRequest", req);
      let liquidModelGet = this.shadowRoot.querySelector("[name=entityGetDataService]");
      if (liquidModelGet) {
          liquidModelGet.generateRequest();
      }
  }

  _triggerAttributeModelGet() {
      let req = DataRequestHelper.createEntityModelCompositeGetRequest(this.contextData);
      this.set("attributeModelRequest", req);
      let liquidModelGet = this.shadowRoot.querySelector("[name=compositeAttributeModelGet]");
      if (liquidModelGet) {
          liquidModelGet.generateRequest();
      }
  }

  _onEntityGetResponse(e, detail) {
      if (DataHelper.isValidObjectPath(detail, "response.content.entities.0") && detail.response.status == "success") {
          this.savedEntity = detail.response.content.entities[0];
      }
      this._triggerAttributeModelGet();
  }

  _onEntityGetError(e) {
      this.logError("Entity get failed", e.detail);
  }

  async _onCompositeModelGetResponse(e) {
      let values = [];
      if (e && e.detail && DataHelper.validateGetAttributeModelsResponse_New(e.detail.response)) {
          let entityModel = e.detail.response.content.entityModels[0];
          this._attributeModels = DataTransformHelper.transformAttributeModels(entityModel, this.contextData);
          values = DataTransformHelper.transformAttributes(this.savedEntity, this._attributeModels, this.contextData, "array", true);
          if (!_.isEmpty(entityModel.properties)) {
              this._matchPermissions.submitPermission = typeof entityModel.properties.submitPermission == "boolean" ? entityModel.properties.submitPermission : this._matchPermissions.submitPermission;
              this._matchPermissions.mergePermission = typeof entityModel.properties.mergePermission == "boolean" ?  entityModel.properties.mergePermission : this._matchPermissions.mergePermission;
          }
      }
      this._attributeValues = values;
  }

  _onSaveTap(e) {
      //raise event with name given for onNextAction in configuration
      let attributeList = this.shadowRoot.querySelector('rock-attribute-list');
      let attributeModels = attributeList ? attributeList.attributeModels : {};
      let changedAttributeElements = attributeList.getChangedAttributeElements();

      if (!_.isEmpty(this.matchConfig)) {
          this.enableMatchStep = this.matchConfig["enable-match-step"];
      }

      if (attributeList.hasModelErrors()) {
          this.showWarningToast("Cannot save. Resolve the errors.");
          return;
      }
      if (changedAttributeElements == undefined || changedAttributeElements.length == 0) {
          this.showWarningToast("No changes to save.");
          return;
      }

      let attributesJSON = [];
      for (let i = 0; i < changedAttributeElements.length; i++) {
          let attributeElement = changedAttributeElements[i];
          let attributeJSON = attributeElement.attributeObject;
          attributesJSON.push(attributeJSON);
      }

      let itemCtx = this.getFirstItemContext();
      let entityType = itemCtx.type;
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
          if(_.isEmpty(this.entityDomain)){	
             let firstDomainContext = ContextHelper.getFirstDomainContext(this.contextData);	
             if(!_.isEmpty(firstDomainContext) && firstDomainContext.domain){	
               this.entityDomain = firstDomainContext.domain;	
             }	
          }        
      } else {
          entityName = DataHelper.getNameForNewEntityFromAttributes(attributesJSON, this._attributeModels, "isExternalName");
      }

      //When it is not a new entity
      if(!_.isEmpty(this.savedEntity)) {
          entityId = this.savedEntity.id;
          entityType = this.savedEntity.type;
          this._matchedEntity = DataHelper.cloneObject(this.savedEntity);
      }

      let domain;
      if (this.entityDomain && this.entityDomain != "" && this.entityDomain != "undefined") {
          domain = this.entityDomain;
      }
      itemCtx.id = entityId;
      let newEntity = DataTransformHelper.prepareEntityForCreate(entityId, entityType, attributesJSON, this.contextData, DataHelper.getUserName(), this.defaultEntity, attributeModels, domain);
      if (entityName) {
          newEntity.name = entityName;
      }

      ComponentHelper.getParentElement(this).onSaveContextChange = true;
      ComponentHelper.getParentElement(this).contextData = this.contextData;

      if (newEntity.type == "classification") {
          this._resetEntityAdditionalAttributes(newEntity);
      }

      this._saveRequest = {
          "entities": [newEntity]
      };

      if (this.dataIndex == "entityModel") {
          let clientState = {};
          clientState.notificationInfo = {};
          clientState.notificationInfo.showNotificationToUser = true;
          this._saveRequest["clientState"] = clientState;
      }

      //Add hotline flag if hotline is enabled
      if (DataHelper.isHotlineModeEnabled()) {
          this._saveRequest["hotline"] = true;
      }

      //Set match request
      this.set('_entityMatchRequest', {
          "entity": newEntity
      });

      //Trigger entity updated instead of match
      if(!_.isEmpty(this.savedEntity)) {
          this._isMergeProcess = false;
          this._updateEntity();
          return;
      }
      let entityMatchService = this.shadowRoot.querySelector("#entityMatchService");
      if (entityMatchService) {
          entityMatchService.generateRequest();
      }
  }



  _resetEntityAdditionalAttributes(entity) {
      if (!DataHelper.isValidObjectPath(entity, "data.attributes")) {
          return;
      }

      let pathSeperator = this.appSetting('dataDefaults').categoryPathSeparator || ">>";
      //Update path attributes
      if (entity.data.attributes["externalnamepath"]) {
          entity.data.attributes["externalnamepath"].values.forEach(item => {
              item.value = item.value + pathSeperator + entity.name;
          })
      }
      if (entity.data.attributes["path"]) {
          entity.data.attributes["path"].values.forEach(item => {
              item.value = item.value + pathSeperator + entity.id;
          })
      }
  }

  _isEmptyValue(value) {
      if (typeof (value) === "string") {
          return value === "" || value.trim().length === 0;
      } else {
          return _.isEmpty(value);
      }
  }

  _onMatchSuccess(e, detail) {
      if (detail.response) {
          let response = detail.response.response;
          if (!response || (response.status && response.status.toLowerCase() == "error")) {
              this.logError("MatchServiceRequestFail", e.detail);
              return;
          }
          //No matches found, create entity along with sync validation
          if (_.isEmpty(response.entities)) {
              this._triggerGovernRequest();
              return
          }

          let type = "deterministic";
          if (response.statusDetail) {
              if (response.statusDetail.probabilisticMatch) {
                  type = "mlbased";
                  this._matchThreshold.create = response.statusDetail.createThreshold || 0;
                  this._matchThreshold.merge = response.statusDetail.mergeThreshold || 100;
              }
          }

          //Match process starts
          let matchedEntities = response.entities;
          if (!this.enableMatchStep && matchedEntities.length) {
              this.showWarningToast("We found matched entities in our system. Check entity details or contact your administrator.");
              return;
          }
          if (!this.matchConfig) {
              this.matchConfig = { "matchMerge": {} }
          } else {
              this.matchConfig["matchMerge"] = {};
          }
          this.matchConfig.matchMerge.type = type;
          if (type == "deterministic") {
              let entities = this._prepareEntities(matchedEntities, type);
              if (entities.fullList.length == 1) {
                  this._matchedEntity = entities.fullList[0];
                  this.shadowRoot.querySelector('#updateConfirmDialog').open();
                  return;
              } else {
                  this.matchConfig.matchMerge.canDiscard = true;
                  this._showCompareWindow(entities.fullList);
              }
          }
          if (type == "mlbased") {
              this._mlBasedResults = this._prepareEntities(matchedEntities, type);
              if (!this._mlBasedResults.fullList.length || this._mlBasedResults.fullList.length == this._mlBasedResults.createList.length) {
                  this._triggerGovernRequest();
              } else if (this._mlBasedResults.mergeList.length) {
                  let highestRankedEntity = _.max(this._mlBasedResults.mergeList, function (entity) { return entity.score; });
                  let highestRankedEntityList = this._mlBasedResults.mergeList.filter(entity => {
                      return entity.score == highestRankedEntity.score;
                  })
                  if (highestRankedEntityList.length == 1) {
                      this._matchedEntity = highestRankedEntity;
                      this.shadowRoot.querySelector('#updateConfirmDialog').open();
                  } else {
                      this.matchConfig.matchMerge.canDiscard = true;
                      this._showCompareWindow(this._mlBasedResults.mergeList);
                  }
              } else if (this._mlBasedResults.createOrMergeList.length) {
                  this._showCompareWindowBasedOnPermissions(this._mlBasedResults.createOrMergeList);
              }
          }
      }
  }

  _onMatchFailure(e, detail) {
      this.logError("MatchServiceRequestFail", "response", JSON.stringify(detail));
  }

  _showCompareWindowBasedOnPermissions(entities) {
      this.matchConfig.matchMerge.canMerge = this._matchPermissions.mergePermission;
      this.matchConfig.matchMerge.canCreateReview = this._matchPermissions.submitPermission && !this.matchConfig.matchMerge.canMerge;
      this._showCompareWindow(entities);
  }

  _prepareEntities(matchedEntities, type) {
     let entities = {
         "fullList": [],
         "createList": [],
         "mergeList": [],
         "createOrMergeList": []
     };
     for (let entity of matchedEntities) {
         let mEntity = {
             "id": entity.id,
             "type": entity.type || ""
         }
         if (type == "mlbased") {
             mEntity.score = AttributeHelper.getFirstAttributeValue(entity.data.attributes.score);
             if (mEntity.score < this._matchThreshold.create) {
                 entities.createList.push(mEntity);
             } else if (mEntity.score > this._matchThreshold.merge) {
                 entities.mergeList.push(mEntity);
             } else {
                 entities.createOrMergeList.push(mEntity);
             }
         }
         entities.fullList.push(mEntity);
     }
     return entities;
  }

  _showCompareWindow(entities) {
     let matchedEntityIds = entities.map(entity => entity.id);
     let entityType = ContextHelper.getFirstItemContext(this.contextData).type;
     this.compareEntitiesContext = {
         "newEntity": DataHelper.cloneObject(this._entityMatchRequest.entity),
         "entityIds": matchedEntityIds,
         "entityTypes": [entityType],
         "contextData": DataHelper.cloneObject(this.contextData),
         "matchConfig": this.matchConfig,
         "entities-data": entities
     }
     this._hideView("entity-create");
     this._showView("entity-match");
  }

  _triggerGovernRequest(operation) {
      let governReq = DataHelper.cloneObject(this._entityMatchRequest);

      let liquidSave = this.shadowRoot.querySelector("[name=entitySaveService]");
      if (liquidSave) {
          liquidSave.operation = operation || "create";
      }
      if (this.dataIndex == "entityModel") {
          // let liquidModelGovernGet = this.$.modelGovernService;
          // if(liquidModelGovernGet){
          //     let reqObj = {};
          //     reqObj["entityModel"] = governReq["entity"];
          //     this.set("_modelGovernRequest", reqObj);
          //     liquidModelGovernGet.generateRequest();
          // }
          liquidSave.generateRequest();
      } else {
          let liquidGovernGet = this.$.entityGovernService;
          if (liquidGovernGet) {
              this.set("_entityGovernRequest", governReq);
              liquidGovernGet.generateRequest();
          }
      }
  }

  _updateEntity() {
      this._cancelProcess(); //Close dialog
      let clientState = {};
      clientState.notificationInfo = {};
      clientState.notificationInfo.showNotificationToUser = false;
      this._saveRequest["clientState"] = clientState;
      this._saveRequest.entities[0].id = this._matchedEntity.id;
      let itemCtx = this.getFirstItemContext();
      itemCtx.id = this._matchedEntity.id;

      this._triggerGovernRequest("update");
  }
  _cancelProcess() {
      let updateConfirmDialog = this.$.updateConfirmDialog;
      if (updateConfirmDialog) {
          updateConfirmDialog.close();
      }
  }

  _onSaveResponse(e) {
      let operation = e.detail.request.operation;
      this._loading = true;
      let msg = "";

      if (operation == "create" && !this.isReviewProcess) {
          msg = "Entity created successfully.";
      }
      if (operation == "update") {
          msg = "Entity updated successfully.";
          if(this._isMergeProcess) {
            this._triggerEntityGet(); //Trigger entity get for latest details
          }
      }

      if (this.dataIndex != "entityModel") {
          this._setBusinessFunctionData(operation, msg, true);
      } else {
          let timeout = setTimeout(function () {
              let status = operation == "create" ? "creation": "updation";
              msg = `Entity ${operation} request has been sent successfully but ${status} is taking longer than expected. Please come after some time and do mapping manually.`
              this._setBusinessFunctionData(operation, msg, false);
          }.bind(this), 5000);

          this._onEntityModelCreated = function (e) {
              clearTimeout(timeout);
              this._setBusinessFunctionData('create', msg, true);
          }.bind(this)
      }
  }

  _setBusinessFunctionData(operation, msg, isEntityCreated) {
      let itemCtx = this.getFirstItemContext();
      let entityCreateElement = ComponentHelper.getParentElement(this); //rock-entity-create
      this.savedEntity = { "id": itemCtx.id, "type": this.isReviewProcess ? "rsdraft" + itemCtx.type : itemCtx.type };
      //If review process, then trigger finish step directly
      entityCreateElement.dataFunctionComplete(this.savedEntity, [], false, this.isReviewProcess);
      this._saveButtonText = "Update";
      this._hideView("entity-match");
      this._showView("entity-create");
      this.resetChanged();

      if (isEntityCreated) {
          ComponentHelper.fireBedrockEvent("entity-created", { "id": itemCtx.id, "type": itemCtx.type }, { ignoreId: true });
      }

      setTimeout(() => {
          this._loading = false;
          if (msg) {
            this.showSuccessToast(msg);
          }
      }, 100);
  }
  _onSaveError(e) {
      // To Remove
      this.logError("Failed to update entity", e.detail);
  }
  _onCancelTap(e) {
      //raise event with name given for onbackAction in configuration	
      let data;
      let eventName = "onCancel";
      let eventDetail = {
          name: eventName,
          data: data
      }
      this.fireBedrockEvent(eventName, eventDetail, {
          ignoreId: true
      });
  }
  _errorLengthChanged(e) {
      this.errorLength = e.detail.data;
  }
  _onEntityGovernResponse(e) {
      let response = e.detail.response;
      if (DataHelper.isValidObjectPath(response, "response.status") && response.response.status.toLowerCase() == "success") {
          let res = response.response;
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
          let attrMessages = {};
          if (entity && entity.data && entity.data.attributes) {
              let attributes = entity.data.attributes;
              attrMessages = MessageHelper.getAttributeMessages(attributes, this._attributeModels, this.messageCodeMapping, this.localize());
          }
          if (!_.isEmpty(attrMessages)) {
              let errorMessages = MessageHelper.getErrorsFromAttrMessages(attrMessages, this._attributeModels);
              this.set("_syncValidationErrors", errorMessages);
              this.shadowRoot.querySelector('#errorsDialog').open();
              return;
          } else {
              let liquidSave = this.shadowRoot.querySelector("[name=entitySaveService]");
              if (liquidSave) {
                  this._updateRequestForReview();
                  liquidSave.generateRequest();
              }
          }
      } else {
          this.logError("There is a problem in validation service.", e.detail);
      }
  }
  _onEntityGovernFailed(e) {
      this.logError("There is a problem in validation service.", e.detail);
  }
  _updateRequestForReview() {
      if (!this.isReviewProcess) {
          return;
      }
      let itemContext = ContextHelper.getFirstItemContext(this.contextData);
      if (DataHelper.isValidObjectPath(this._saveRequest, "entities.0.type") && itemContext) {
          this._saveRequest.entities[0].type = "rsdraft" + itemContext.type;
      }
  }
  _skipServerErrors() {
      let errorDialog = this.$.errorsDialog;
      if (errorDialog) {
          errorDialog.close();
      }
      let liquidSave = this.shadowRoot.querySelector("[name=entitySaveService]");
      if (liquidSave) {
          this._updateRequestForReview();
          liquidSave.generateRequest();
      }
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
                  newAttributeMessages[attributeName] = [message];
              }
          }
      }
      this.set('_attributeMessages', newAttributeMessages);
  }
  //   * <b><i>Content development is under progress... </b></i> 
  //   */
  getIsDirty() {
      let attributeList = this.shadowRoot.querySelector('rock-attribute-list');
      let changedAttributeElements = attributeList.getChangedAttributeElements();
      return changedAttributeElements && changedAttributeElements.length > 0;
  }

  resetChanged() {
      let attributeList = this.shadowRoot.querySelector('rock-attribute-list');
      if(attributeList) {
          attributeList.resetChanged();
      }
  }

  _showView(viewName) {
      if (viewName) {
          let contentView = this.shadowRoot.querySelector("#content-" + viewName);
          if (contentView) {
              contentView.removeAttribute("hidden");
          }
      }
  }

  _hideView(viewName) {
      if (viewName) {
          let contentView = this.shadowRoot.querySelector("#content-" + viewName);
          if (contentView) {
              contentView.setAttribute("hidden", "");
          }
      }
  }

  _onCompareEntitiesBack(e, detail) {
      this._hideView("entity-match");
      this._showView("entity-create");
  }

  _onCompareEntitiesDiscard(e, detail) {
      ComponentHelper.closeCurrentApp();
  }

  _onCompareEntitiesCreate(e, detail) {
      ComponentHelper.getParentElement(this).isReviewProcess = this.isReviewProcess = detail.isReviewProcess;
      this._triggerGovernRequest();
  }

  _onCompareEntitiesMerge(e, detail) {
      this._matchedEntity = detail.matchedEntity;
      this._updateEntity();
  }

  _getExternalEntityType(entityTypeId) {
      let entityType = entityTypeId;
      let entityTypeManager = EntityTypeManager.getInstance();
      if (entityTypeManager) {
        entityType = entityTypeManager.getTypeExternalNameById(entityTypeId);
      }
      return entityType;
  }
}
/**
 * <b><i>Content development is under progress... </b></i> 
 */
customElements.define(RockEntityCreateSingle.is, RockEntityCreateSingle)
