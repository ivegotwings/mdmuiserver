import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '@polymer/polymer/lib/utils/async.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-helpers/data-request-helper.js';
import '../bedrock-helpers/entity-helper.js';
import '../bedrock-helpers/data-transform-helper.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-helpers/entity-helper.js';
import '../bedrock-helpers/context-helper.js';
import '../bedrock-helpers/attribute-helper.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-helpers/data-merge-helper.js';
import '../liquid-entity-model-composite-get/liquid-entity-model-composite-get.js';
import '../liquid-entity-data-save/liquid-entity-data-save.js';
import '../liquid-config-get/liquid-config-get.js';
import '../pebble-dialog/pebble-dialog.js';
import '../pebble-icons/pebble-icons.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-spinner/pebble-spinner.js';
import '../pebble-checkbox/pebble-checkbox.js';
import '../pebble-button/pebble-button.js';
import '../rock-grid/rock-grid.js';
import '../rock-context-mappings/rock-context-mappings-grid.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';

class RockSnapshotRelationshipGrid
extends mixinBehaviors([
    RUFBehaviors.UIBehavior,
    RUFBehaviors.ComponentContextBehavior,
    RUFBehaviors.ComponentConfigBehavior
], PolymerElement) {
  static get template() {
    return html`
        <style>
            :host {
                display: block;
                height: 100%;
                --pebble-data-table: {
                    height: 100%;
                }
            }
        </style>

        <rock-grid config="[[_gridConfig]]" data="[[gridData]]" multi-selection="false" page-size="20"></rock-grid>

        <liquid-entity-data-get id="getRelEntities" operation="getbyids" data-index="entityData" data-sub-index="data" on-response="_onEntityGetResponse"></liquid-entity-data-get>
        <liquid-entity-data-get id="getRelAttributes" operation="getbyids" data-index="entityData" data-sub-index="data" on-response="_onRelAttrsResponse"></liquid-entity-data-get>
        <liquid-entity-model-composite-get name="liquidModelGet" request-data="{{relationshipRequest}}" on-entity-model-composite-get-response="_onModelReceived" on-error="_onModelGetFailed" exclude-in-progress=""></liquid-entity-model-composite-get>
`;
  }

  static get is() {
      return 'rock-snapshot-relationship-grid'
  }

  static get properties() {
      return {
          _gridConfig: {
              type: Object,
              value: function () {
                  return {}
              }
          },
          _attributes: {
              type: Object,
              value: function () {
                  return {}
              }
          },
          entityReqData: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          entityType: {
              type: String,
              value: ""
          },
          relationshipRequest: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _relationshipModels: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _contextsObj: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _contexts: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          gridData: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          _entityData: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          _rowsModel: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          _relationshipType: {
              type: String,
              value: ""
          },
          _entityAttributes: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          _relationshipAttributes: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          _ids: {
              type: Array,
              value: function () {
                  return [];
              }
          }
      }

  }

  connectedCallback() {
      super.connectedCallback();
      let context = DataHelper.cloneObject(this.contextData);
      let appName = ComponentHelper.getCurrentActiveAppName();
      if (appName) {
          context[ContextHelper.CONTEXT_TYPE_APP] = [{
              "app": appName
          }];
      }
      let _relationshipType = this._getRelationshipType();
      this.set('_relationshipType', _relationshipType);
      context.ItemContexts[0].relationship = this._relationshipType;
      this.requestConfig('rock-entity-relationship-search-result', context);

      //forming ids array for liquid call
      if (this.entityReqData.length > 0) {
          let ids = this.entityReqData.map(elm => {
              return elm.relTo.id
          })
          this._ids = ids;
      }

      //composite Model Call
      this._getCompositeModel()
  }

  _getCompositeModel() {
      let entityContextData = DataHelper.cloneObject(this.contextData);
      entityContextData[ContextHelper.CONTEXT_TYPE_ITEM] = [{
          'type': this.contextData.ItemContexts[0].type,
          'relationships': [this._relationshipType],
      }];

      let compositeModelGetRequest = DataRequestHelper.createEntityModelCompositeGetRequest(
          entityContextData);
      this.set("relationshipRequest", compositeModelGetRequest);
      let liquidModelGet = this.shadowRoot.querySelector("[name=liquidModelGet]");
      if (liquidModelGet && compositeModelGetRequest) {
          liquidModelGet.generateRequest();
      }

  }

  _onModelReceived(e) {
      let itemContext = this.getFirstItemContext();
      if (e && e.detail && DataHelper.validateGetModelsResponse(e.detail.response)) {
          let compositeModel = e.detail.response.content.entityModels[0];
          if (DataHelper.isValidObjectPath(compositeModel, 'data.relationships')) {
              this._relationshipModels = compositeModel.data.relationships[this._relationshipType];
              // this._relationshipModels = DataTransformHelper.transformRelationshipModels(compositeModel, this._entityContextData);
          }
      }
  }

  _getRelationshipType() {
      let entityType;
      if (!_.isEmpty(this.entityReqData) && DataHelper.isValidObjectPath(this.entityReqData[0],
              'properties.relationshipType')) {
          return this.entityReqData[0].properties.relationshipType;
      } else if (!_.isEmpty(this.entityReqData) && DataHelper.isValidObjectPath(this.entityReqData[0],
              'relTo.type')) {
          let relType = this.entityReqData[0].relTo.type;
          let relToTypesArr = this.entityReqData.relToRelationshipTypes;

          relToTypesArr.forEach(relItem => {
              if (relItem.relEntityType == relType) {
                  entityType = relItem.relEntityId;
              }
          });
          return entityType;
      } else {
          this.showWarningToast("RelationshipType does not exist contact your administrator");
      }
  }

  onConfigLoaded(componentConfig) {
      let gridConfig = componentConfig.config.gridConfig;
      gridConfig.schemaType = "simple"
      gridConfig.advanceSelectionEnabled = false;
      gridConfig.itemConfig.isMultiSelect = false;
      gridConfig.itemConfig.selectionEnabled = false;
      //to disable navigation from compare screen to the entity being displayed
      delete gridConfig.itemConfig.linkTemplate;
      this.set('_gridConfig', gridConfig);

      let attributes = this._getEntityAttributes();
      this._attributes = attributes;
      this._entityAttributes = [...attributes.relatedEntityAttributes, ...attributes.relationshipAttributes];
      this._relationshipAttributes = attributes.relationshipAttributes;
      this._rowsModel = this._getRowModel(componentConfig.config);
      this.getEntityData();
  }

  _getEntityAttributes() {
      let _attrs = [];
      let _relAttrs = [];
      let fields = this._gridConfig.itemConfig.fields;
      for (let prop in fields) {
          //remove link template
          delete fields[prop].linkTemplate;
          if (fields[prop].isRelatedEntityAttribute == true) {
              _attrs.push(fields[prop].name);
          } else {
              _relAttrs.push(fields[prop].name);
          }
      }

      if (this._gridConfig.viewMode !== 'Tabular') {
          let itemConfig = this._gridConfig.itemConfig;
          _attrs.push(itemConfig.image);
          _attrs.push(itemConfig.thumbnailId);
          _attrs.push(itemConfig.title);
          _attrs.push(itemConfig.subtitle);
          _attrs.push(itemConfig.id);
          _attrs.push("property_objectkey");
      }

      let attributes = {
          relatedEntityAttributes: _attrs,
          relationshipAttributes: _relAttrs
      }
      return attributes;

  }

  _getRowModel(config) {
      let rows = [];

      this._entityAttributes.forEach(attr => {
          let row = {
              header: attr,
              name: attr,
              isFrozen: false
          }
          rows.push(row);
      });
      return rows;
  }

  getEntityData() {
      let contextWithoutDataContext = DataHelper.cloneObject(this.contextData);
      if(!_.isEmpty(contextWithoutDataContext.Contexts)){
        contextWithoutDataContext.Contexts = [];
      }
      let req = DataRequestHelper.createEntityGetRequest(contextWithoutDataContext);
      DataRequestHelper.addDefaultContext(req);
      let liqDataElement = this.shadowRoot.querySelector("#getRelEntities");
      req.params.query.ids = this._ids;
      delete req.params.query.id;
      req.params.fields.attributes = this._entityAttributes;
      req.params.query.filters.typesCriterion = [this.entityType];
      req.params.fields.relationship = this._relationshipType;
      liqDataElement.requestData = req;
      liqDataElement.generateRequest();
  }

  //call to get the relationshipAttributes like order and isPrimary.
  getRelationshipAttributes(relationshipAttributes) {
      let req = DataRequestHelper.createEntityGetRequest(this.contextData);
      let liqDataElement = this.shadowRoot.querySelector("#getRelAttributes");
      req.params.query.id = this.contextData.ItemContexts[0].id;
      req.params.fields.relationships = [this._relationshipType];
      req.params.fields.relationshipAttributes = relationshipAttributes;
      liqDataElement.requestData = req;
      liqDataElement.generateRequest();
  }

  _onEntityGetResponse(e, detail) {
      let data = detail.response.content.entities;
      this._entityData = data;
      if (this.entityReqData.isSnapshot) {
          this.getRelationshipAttributes(this._attributes.relationshipAttributes);
      } else {
          this._prepareGridColumnData(this._entityData);
      }
  }

  async snapshotTransformRelationships(entity, relationshipModels, contextData, outputSchema, applySort) {
      let firstDataContext = ContextHelper.getFirstDataContext(contextData);

      let mergedRelationships = {};

      let sortedAttributeModels = relationshipModels;
      if (applySort) {
          sortedAttributeModels = this.sortAttributeModels(relationshipModels);
      }

      mergedRelationships = entity.data.relationships;

      if (firstDataContext) {
          let dataContexts = ContextHelper.getDataContexts(contextData);
          mergedRelationships = entity.data.relationships;

          for (let dataContext of dataContexts) {
              if (dataContext) {
                  let ctxRelationships = SharedUtils.DataObjectFalcorUtil.getRelationshipsByCtx(
                      entity, dataContext);

                  if (!_.isEmpty(ctxRelationships)) {
                      Object.keys(ctxRelationships).forEach((relName) => {
                          mergedRelationships[relName] = DataHelper.cloneObject(ctxRelationships[relName]);
                      });
                  }
              }
          }

      }

      let outputData = undefined;

      if (outputSchema == "array") {
          //manage returns output as array...instead of keyed attributes
          outputData = _.map(mergedRelationships, function (value, index) {
              return value;
          });
      } else {
          outputData = mergedRelationships;
      }

      return outputData;
  }

  async _onRelAttrsResponse(e, detail) {
      let relAttributeData = undefined;

      if (DataHelper.isValidObjectPath(detail, 'response.content.entities')) {
          relAttributeData = detail.response.content.entities;
      }

      //get primary and secondary context
      if (this._relationshipModels && this._relationshipModels.length) {
          let compositeModel = DataHelper.cloneObject(this._relationshipModels[0]);
      }

      if (!_.isEmpty(relAttributeData)) {
          let rels = await this.snapshotTransformRelationships(relAttributeData[0], this._relationshipModels, this.contextData);
          this._updateEntDataAttrsWithRelAttributes(rels);
          if (!_.isEmpty(this._entityData)) {
              this._prepareGridColumnData(this._entityData);
          }
      }
  }

  //updating _entityData to have relationshiAttributes and it's values. This is then directly used to prepare grid
  _updateEntDataAttrsWithRelAttributes(relationshipAttributes) {
      relationshipAttributes[this._relationshipType].forEach(elm => {
          if (!_.isEmpty(elm.attributes)) {
              this._entityData.forEach(entity => {
                  if (elm.id.includes(entity.id)) {
                      // entity.data.attributes = {...entity.data.attributes, ...elm.attributes};
                      DataMergeHelper.mergeAttributes(entity.data.attributes, elm.attributes,
                          true);
                  }
              })
          }
      });
  }

  _prepareGridColumnData(entities) {
      let items = [];
      let rowModel = this._rowsModel;
      entities.forEach(function (relItem) {
          if (relItem) {
              let record = {};
              let lovItem = {};
              if (relItem.data.attributes) {
                  rowModel.forEach(function (row) {
                      if (row && relItem.data.attributes[row.name]) {
                          let valueObjs = relItem.data.attributes[row.name].values;
                          if (!_.isEmpty(valueObjs)) {
                              if (valueObjs.length > 1) {
                                  let values = [];
                                  for (let valueIndex = 0; valueIndex < valueObjs.length; valueIndex++) {
                                      values.push(valueObjs[valueIndex].value);
                                  }
                                  record[row.name] = values;
                              } else {
                                  record[row.name] = valueObjs[0].value;
                              }
                          }
                      } else {
                          record[row.name] = "";
                      }
                  }, this);
              }
              //If navigation to displayed entity is needed in future un-comment this and enable linkTemplate in config
              // record.id=relItem.id;
              // record.type = relItem.type;
              items.push(record);
          }
      })

      this.set('gridData', items);
  }
}

customElements.define(RockSnapshotRelationshipGrid.is, RockSnapshotRelationshipGrid);
