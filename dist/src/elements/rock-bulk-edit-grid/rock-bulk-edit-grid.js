import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-helpers/data-transform-helper.js';
import '../bedrock-helpers/element-helper.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../liquid-entity-model-get/liquid-entity-model-get.js';
import '../pebble-spinner/pebble-spinner.js';
import '../rock-grid/rock-grid.js';
import '../rock-grid-data-sources/attribute-model-datasource.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockBulkEditGrid
    extends mixinBehaviors([
        RUFBehaviors.UIBehavior,
        RUFBehaviors.ComponentContextBehavior
    ], OptionalMutableData(PolymerElement)) {
  static get template() {
    return Polymer.html`
        <pebble-spinner active="[[_loading]]"></pebble-spinner>
        <attribute-model-datasource id="attributeModelDataSource" mode="self" request="[[requestData]]" r-data-formatter="[[_dataFormatter]]" schema="grid">
        </attribute-model-datasource>
        <liquid-entity-model-get id="getAttributeModels" operation="getbyids" request-id="getAttributeModelsReq" request-data="[[request]]" on-response="_onAttributeModelsReceived" on-error="_onAttributeModelsGetFailed"></liquid-entity-model-get>
        <rock-grid id="attributeModelGrid" no-header="" config="[[config]]" data="[[_gridData]]" page-size="200" max-configured-count="200" selected-items="[[selectedItems]]"></rock-grid>
`;
  }

  static get is() { return 'rock-bulk-edit-grid' }
  static get properties() {
      return {
          config: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          requestData: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _dataFormatter: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          contextData: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          selectedItems: {
              type: Array,
              value: function () { return []; }
          },
          _gridData: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          _loading: {
              type: Boolean,
              value: false
          },
          editRelationshipAttributesOnly: {
              type: Boolean,
              value: false
          },
          editAttributesOnly: {
              type: Boolean,
              value: false
          }
      }
  }
  static get observers() {
  return [
  '_getAttributeModels(contextData)'
  ]
}


  ready () {
      super.ready();
      this._dataFormatter = this._getAttributeFormattedData.bind(this);
      this.logInfo("AttributeModelReady", "id", this.idField, "requestData", this.requestData);
  }
  _getAttributeModelGrid () {
      return ElementHelper.getElement(this, "#attributeModelGrid");
  }
  _getAttributeModelDataSource () {
      return this.shadowRoot.querySelector('#attributeModelDataSource');
  }
  _getAttributeModels (contextData0) {
      if (!_.isEmpty(this.contextData)) {
          this._loading = true;

          let attributeModelDataSource = this._getAttributeModelDataSource();
          let contextDataX = DataHelper.cloneObject(this.contextData);
          if (contextDataX.ItemContexts) {

              let index = 0;
              for(let i=0; i < contextDataX.ItemContexts.length; i++){
                  if(contextDataX.ItemContexts[i].type){
                      index++;
                  }
              }

              this._currentIndex = index;
              this._currentItems = [];
              this._notFoundEntityTypes = [];
          }

          if (this.contextData && this.contextData.ItemContexts) {
              for (let i = 0; i < this.contextData.ItemContexts.length; i++) {

                  contextDataX.ItemContexts = [this.contextData.ItemContexts[i]];
                  let compositeModelGetRequest = DataRequestHelper.createEntityModelCompositeGetRequest(contextDataX);
                  
                  if(this.editAttributesOnly) {
                      compositeModelGetRequest.params.fields.attributes = compositeModelGetRequest.params.fields.attributes ? compositeModelGetRequest.params.fields.attributes : ["_ALL"];
                      compositeModelGetRequest.params.fields.relationships = undefined;
                      compositeModelGetRequest.params.fields.relationshipAttributes = undefined;
                  }

                  if(this.editRelationshipAttributesOnly) {
                      compositeModelGetRequest.params.fields.attributes = undefined;
                      compositeModelGetRequest.params.fields.relationships = compositeModelGetRequest.params.fields.relationships ? compositeModelGetRequest.params.fields.relationships : ["_ALL"];
                      compositeModelGetRequest.params.fields.relationshipAttributes = compositeModelGetRequest.params.fields.relationshipAttributes ? compositeModelGetRequest.params.fields.relationshipAttributes : ["_ALL"];
                  }
                  
                  this.set('requestData', compositeModelGetRequest);

                  if(attributeModelDataSource) {
                      attributeModelDataSource.reTriggerRequest();
                  }
              }
          }
      }
  }
  _getAttributeFormattedData (data, requestData) {
      if (data && data.content && data.content.entityModels) {
          let attributeModels = DataTransformHelper.transformAttributeModels(data.content.entityModels[0], this.contextData);
          let relationshipModels = DataTransformHelper.transformRelationshipModels(data.content.entityModels[0], this.contextData);
          let relationshipAttributeModels = {};
          if (!_.isEmpty(attributeModels)) {
              if (this._currentIndex == 1) {
                  this._currentItems = [];
              }
              this.push('_currentItems', attributeModels);
          }

          if (!_.isEmpty(relationshipModels)) {
              let relType = requestData.params.fields.relationships[0];
              let rel = relationshipModels[relType] && relationshipModels[relType].length ? relationshipModels[relType][0] : undefined;
              relationshipAttributeModels = DataTransformHelper.transformRelationshipAttributeModels(rel, this.contextData, true);
              if (this._currentIndex == 1) {
                  this._currentItems = [];
              }
              this.push('_currentItems', relationshipAttributeModels);
          }

          if ((!attributeModels || _.isEmpty(attributeModels)) && (!relationshipAttributeModels || _.isEmpty(relationshipAttributeModels)) && DataHelper.isValidObjectPath(requestData, "params.query.name")) {
              this._notFoundEntityTypes.push(requestData.params.query.name);
          }

          let responseLength = this._currentItems.length + this._notFoundEntityTypes.length;

          if (responseLength == this._currentIndex) {
              let compositeModels = [];
              for(let i=0; i<this._currentItems.length; i++) {
                  let currentItem = this._currentItems[i];
                  let keys = Object.keys(currentItem);
                  if(keys && keys.length > 0) {
                      for(let j=0; j<keys.length; j++) {
                          let key = keys[j];
                          if(!(compositeModels.find(obj => obj.name === key))) {
                              compositeModels.push(currentItem[key]);
                          }
                      }
                  }
              }

              this.set("_gridData", compositeModels);
              this._loading = false;
              if (this._notFoundEntityTypes && this._notFoundEntityTypes.length) {
                  let messageContent = this._notFoundEntityTypes.join(", ");
                  this.logError("rock-bulk-edit-grid - Attribute models not found for entity type(s) " + messageContent);
              }
          }
      }
  }

  getSelectedItems () {
      let grid = this._getAttributeModelGrid();
      return grid.getSelectedItems();
  }

  reRenderGrid() {
      let grid = this._getAttributeModelGrid();
      grid.reRenderGrid();
  }

  clearSelection() {
      let grid = this._getAttributeModelGrid();
      grid.clearSelection();
  }
  getData() {
      return this._gridData;
  }
  deselectItem(item) {
      let grid = this._getAttributeModelGrid();
      grid.deselectItem(item);
  }
  selectItems(items) {
      if(!_.isEmpty(items)) {
          for(let i=0; i<items.length; i++) {
              this.selectItem(items[i]);
          }
      }
  }
  selectItem(item) {
      let grid = this._getAttributeModelGrid();
      grid.selectItem(item);
  }
}
customElements.define(RockBulkEditGrid.is, RockBulkEditGrid);
