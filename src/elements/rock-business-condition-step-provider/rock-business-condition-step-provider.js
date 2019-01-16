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
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../liquid-entity-model-get/liquid-entity-model-get.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockBusinessConditionStepProvider extends mixinBehaviors([RUFBehaviors.UIBehavior], OptionalMutableData(PolymerElement)) {
  static get template() {
    return html`
        <style include="bedrock-style-common">
        /* */
        </style>
        <liquid-entity-model-get id="businessConditionsGet" operation="getbyids" request-id="businessConditionsGet" on-response="_onBusinessConditionsGetResponse" on-error="_onBusinessConditionsGetError"></liquid-entity-model-get>
        <liquid-entity-model-get id="getRelDomains" operation="getbyids" on-response="_onRelModelsReceived" on-error="_onModelGetFailed"></liquid-entity-model-get>
        <liquid-entity-model-get id="getEntityModel" operation="getbyids" on-response="_onEntityModelReceived" on-error="_onEntityModelGetFailed"></liquid-entity-model-get>
`;
  }

  static get is() {
      return "rock-business-condition-step-provider";
  }

  static get properties() {
      return {
          businessConditionId: {
              type: String,
              value: ""
          },

          contextData: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          configContext: {
              type: Object,
              value: function () {
                  return {}
              }
          },

          _impactAttributes: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          _impactRelationships: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          _impactTaxonomies: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          _callback: {
              type: Function
          },

          _relationshipDomain: {
              type: String,
              value: ""
          },

          entityModel: {
              type: Object,
              value: function () {
                  return {}
              }
          }
      };
  }

  static get observers() {
      return [
          '_initialConditionsLoaded(businessConditionId,contextData)'
      ];
  }

  constructor(){
      super();
  }

  connectedCallback() {
      super.connectedCallback();                
  }

  disconnectedCallback() {
      super.disconnectedCallback();
  }

  _initialConditionsLoaded(businessConditionId, contextData) {
      if (businessConditionId && contextData && !_.isEmpty(contextData)) {    
          this._requestBusinessConditions();
      }
  }

  _requestBusinessConditions() {
      let clonedContextData = DataHelper.cloneObject(this.contextData);
      // Prepare ItemContext
      let itemContext = ContextHelper.getFirstItemContext(clonedContextData);
      itemContext.id = this.businessConditionId;
      itemContext.type = "businessCondition";
      itemContext.attributeNames = ["impactAttributes", "impactRelationships", "impactTaxonomies"];
      clonedContextData[ContextHelper.CONTEXT_TYPE_ITEM] = [itemContext];
      //business condition models are defined with default value context. Hence the request is set with default value context.
      clonedContextData[ContextHelper.CONTEXT_TYPE_VALUE] = [DataHelper.getDefaultValContext()];
      // Create Request and Get
      let businessConditionsGet = this.shadowRoot.querySelector('#businessConditionsGet');
      if (businessConditionsGet) {
          businessConditionsGet.requestData = DataRequestHelper.createEntityGetRequest(clonedContextData);
          businessConditionsGet.generateRequest();
      }
  }

  _onBusinessConditionsGetResponse(e) {
      let responseContent = DataHelper.validateAndGetResponseContent(e.detail.response);
      if (responseContent) {
          let businessConditions = responseContent.entityModels;
          if (typeof (businessConditions) !== "undefined" && businessConditions.length > 0) {
              let businessCondition = businessConditions[0];
              this.configContext = { "groupName": businessCondition.name };
              let impactAttributesObj = EntityHelper.getAttribute(businessCondition, "impactAttributes");
              let impactRelationshipsObj = EntityHelper.getAttribute(businessCondition, "impactRelationships");
              let impactTaxonomiesObj = EntityHelper.getAttribute(businessCondition, "impactTaxonomies");
              // impactTaxonomiesObj = {
              //     values: [
              //         {
              //             value: "Product Setup Taxonomy"
              //         }
              //     ]
              // };
              if (impactAttributesObj) {
                  this._impactAttributes = AttributeHelper.getAttributeValues(impactAttributesObj.values, this.contextData[ContextHelper.CONTEXT_TYPE_VALUE]);
              }
              if (impactRelationshipsObj) {
                  this._impactRelationships = AttributeHelper.getAttributeValues(impactRelationshipsObj.values, this.contextData[ContextHelper.CONTEXT_TYPE_VALUE]);
              }
              if (impactTaxonomiesObj) {
                  this._impactTaxonomies = AttributeHelper.getAttributeValues(impactTaxonomiesObj.values, this.contextData[ContextHelper.CONTEXT_TYPE_VALUE]);
              }
          }
      }
      if (this._impactRelationships && this._impactRelationships.length) {
          this._generateCheckDomainRequest(this._impactRelationships);
          return;
      }
      this._prepareSteps();
  }

  _generateCheckDomainRequest(relationshipTypeNames) {
      let req = {
          "params": {
              "query": {
                  "id": relationshipTypeNames[0] + "_relationshipModel",
                  "filters": {
                      "typesCriterion": ["relationshipModel"]
                  }
              },
              "fields": {}
          }
      };
      req.params.query.domain = "digitalAsset";
      let checkDomainLiquid = this.shadowRoot.querySelector("#getRelDomains");
      if (checkDomainLiquid) {
          checkDomainLiquid.requestData = req;
          checkDomainLiquid.generateRequest();
      }
  }

  _onRelModelsReceived(e) {
      let responseContent = DataHelper.validateAndGetResponseContent(e.detail.response)
      if (responseContent) {
          let models = responseContent.entityModels;
          if (models[0] && models[0].domain == "digitalAsset") {
              this._isAsset = true;
              this._relationshipDomain = models[0].domain;
          }
      }
      this._requestEntityModel();                
  }

  _requestEntityModel(){
      let clonedContextData = DataHelper.cloneObject(this.contextData);
      let itemContext = ContextHelper.getFirstItemContext(clonedContextData);
      let entityModelLiquid = this.shadowRoot.querySelector("#getEntityModel");
      if (entityModelLiquid) {
          let req = DataRequestHelper.createGetManageModelRequest([itemContext.type]);
          req.params.fields.attributes = [];
          req.params.fields.relationships = [this._impactRelationships[0]];
          entityModelLiquid.requestData = req;
          entityModelLiquid.generateRequest();
      }
  }

  _onEntityModelReceived(e) {
      if(e && e.detail && DataHelper.isValidObjectPath(e.detail, "response.content.entityModels.0.data")) {
          this.entityModel = e.detail.response.content.entityModels[0];
      }
      this._prepareSteps();                
  }

  _onEntityModelGetFailed(e) {
      this.logError("Entity model get response error", e.detail);
  }

  _prepareSteps() {
      let steps = [];
      let itemContext = ContextHelper.getFirstItemContext(this.contextData);   
      let dynamicDataForSteps = {};        
      if (!_.isEmpty(this._impactTaxonomies)) {
          let stepConfig = {
              "name": "step-1-rock-context-manage",
              "label": "Manage context for a New Entity",
              "component": {
                  "name": "rock-context-manage",
                  "path": "/../../src/elements/rock-context-manage/rock-context-manage.html"
              }
          }
          dynamicDataForSteps.taxonomy = this._impactTaxonomies[0];
          dynamicDataForSteps["functional-mode"] = "dataFunction";
          steps.push(stepConfig);
      }
      if (!_.isEmpty(this._impactAttributes)) {
          //step config for attribute manage
          itemContext.attributeNames = this._impactAttributes;
          let stepConfig =
              {
                  "name": "fix-attribute-errors",
                  "label": "Fix attribute errors for an entity",
                  "component": {
                      "name": "rock-attribute-manage",
                      "path": "/../../src/elements/rock-attribute-manage/rock-attribute-manage.html"
                  }
              }
              dynamicDataForSteps["config-context"] = this.configContext;
          steps.push(stepConfig);
      }
      if (!_.isEmpty(this._impactRelationships)) {
          itemContext.relationships = this._impactRelationships;
          //Handle whereused scenario
          let direction = "";
          let fromEntityType = "";
          if(!_.isEmpty(this.entityModel) && this.entityModel.data && this.entityModel.data.relationships){
              let relObj = this.entityModel.data.relationships[this._impactRelationships[0]][0];
              if(relObj.properties.relationshipOwnership.toLowerCase() == "whereused"){
                  direction = "up";
                  fromEntityType = relObj.properties.relatedEntityInfo[0].relEntityType;
              }
          }

          let stepConfig =
              {
                  "name": "fix-relationships-errors",
                  "label": "Fix relationships errors for an entity",
                  "component": {
                      "name": "rock-relationship-manage",
                      "path": "/../../src/elements/rock-relationship-manage/rock-relationship-manage.html"
                  }
              }
              dynamicDataForSteps["relationship-type-name"] = this._impactRelationships[0];
              dynamicDataForSteps["direction"] = direction;
              dynamicDataForSteps["from-entity-type"] = fromEntityType;                                            
          if (this._isAsset) {
              dynamicDataForSteps["add-relationship-mode"] = "businessFunction";
          } else {
              dynamicDataForSteps["add-relationship-mode"] = "lov";
          }

          if (!_.isEmpty(this._relationshipDomain)) {
              dynamicDataForSteps["domain"] = this._relationshipDomain;
          }
          steps.push(stepConfig);
      }
      this._callback(steps, dynamicDataForSteps);
  }

  getSteps(data, callback) {
      this._callback = callback;
      if (!_.isEmpty(data) && data["business-condition-id"] && data["context-data"]) {
          this.contextData = data["context-data"];
          this.businessConditionId = data["business-condition-id"];
      }
  }
}
customElements.define(RockBusinessConditionStepProvider.is, RockBusinessConditionStepProvider);
