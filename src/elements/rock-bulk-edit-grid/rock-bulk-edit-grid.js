import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
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
import EntityTypeManager from '../bedrock-managers/entity-type-manager.js'
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockBulkEditGrid
    extends mixinBehaviors([
        RUFBehaviors.UIBehavior,
        RUFBehaviors.ComponentContextBehavior
    ], OptionalMutableData(PolymerElement)) {
  static get template() {
    return html`
        <pebble-spinner active="[[_loading]]"></pebble-spinner>
        <attribute-model-datasource id="attributeModelDataSource" mode="[[_dataSourceMode]]" request="[[requestData]]" r-data-formatter="[[_dataFormatter]]" r-data-source="{{rDataSource}}"
         schema="grid" filter-criterion-builder="{{_filterCriterionBuilder}}" sort-criterion-builder="{{_sortCriterionBuilder}}" domain="[[_dataSourceDomain]]"></attribute-model-datasource>
        <liquid-entity-model-get id="getAttributeModels" operation="getbyids" request-id="getAttributeModelsReq" request-data="[[request]]" on-response="_onAttributeModelsReceived" on-error="_onAttributeModelsGetFailed"></liquid-entity-model-get>
        <template is="dom-if" if="[[editAttributesOnly]]">
                <rock-grid id="attributeModelGrid" no-header config="[[config]]" page-size="100" max-configured-count="100" selected-items="[[selectedItems]]" r-data-source="{{rDataSource}}" grid-data-size="{{_gridDataSize}}"></rock-grid>
        </template>
        <template is="dom-if" if="[[editRelationshipAttributesOnly]]">
            <rock-grid id="attributeModelGrid" no-header config="[[config]]" page-size="100" max-configured-count="100" selected-items="[[selectedItems]]" data="[[_gridData]]"></rock-grid>
        </template>
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
          },
          rDataSource:{
              type:Function,
              notify:true
          },
          _gridDataSize: {
              type:Number,
              value:0
          },
          _dataSourceMode:{
              type:String,
             value:"DomainAndTaxonomy"
          },
          _dataSourceDomain: {
              type:String
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
      this._filterCriterionBuilder = this._getFilterCriterion.bind(this);
      this._sortCriterionBuilder = this._getSortCriterion.bind(this);
  }
    _getSortCriterion(){
        return DataHelper.prepareAttributeModelSortCriterion('externalName');
    }
  _getFilterCriterion (filters) { 
    let attributesCriterion=[];
    let propertiesCriterion=[];
    let fields = this.config && this.config.itemConfig ? this.config.itemConfig.fields : {};
    let gridColumns = DataHelper.convertObjectToArray(fields || {});
    if (filters && filters.length) {
        for (let i = 0; i < filters.length; i++) {
            let path = filters[i].path;
            let column=gridColumns.find(function (col) {
                return col.name===path;
            });
            if(column) {
                let filter = filters[i].filter;
                let cri = {};
                if (filter) {
                    cri[path] = {eq: filter + "*"};
                    if(column.readFrom === "attributes") {
                        attributesCriterion.push(cri);
                    } else{
                        propertiesCriterion.push(cri);
                    }
                }
            }
        }
    }
    let filterCri={};
    if(attributesCriterion.length) {
        filterCri.attributesCriterion=attributesCriterion;
    }
    if(propertiesCriterion.length) {
        filterCri.propertiesCriterion=propertiesCriterion;
    }
    return filterCri;
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
            if(this.editAttributesOnly) {
                let firstItemContext = ContextHelper.getFirstItemContext(this.contextData);
                let entityType = firstItemContext && firstItemContext.type ? firstItemContext.type : undefined;
                let attrRequestData = DataRequestHelper.createGetAttributeModelRequest();
                let entityTypeManager = EntityTypeManager.getInstance();
                if(entityType && entityTypeManager){
                    this._dataSourceDomain = entityTypeManager.getDomainByEntityTypeName(entityType);
                }
                this.set('requestData', attrRequestData);
            }else if(this.editRelationshipAttributesOnly){
                this._dataSourceMode = "self";
                let clonedContextData = DataHelper.cloneObject(this.contextData);
                if (clonedContextData.ItemContexts) {
                    let index = 0;
                    for(let itemContext of clonedContextData.ItemContexts){
                        if(itemContext && itemContext.type){
                            index++;
                        }
                    }
                    this._currentIndex = index;	
                    this._currentItems = [];	
                    this._notFoundEntityTypes = [];
                }
                if(this.contextData.ItemContexts){
                    for (let i = 0; i < this.contextData.ItemContexts.length; i++) {	
                        clonedContextData.ItemContexts = [this.contextData.ItemContexts[i]];	
                        let compositeModelGetRequest = DataRequestHelper.createEntityModelCompositeGetRequest(clonedContextData);	
                        compositeModelGetRequest.params.query.id = compositeModelGetRequest.params.query.name + "_entityCompositeModel";
                        delete compositeModelGetRequest.params.query.name;
                        compositeModelGetRequest.params.fields.attributes = undefined;	
                        compositeModelGetRequest.params.fields.relationships = compositeModelGetRequest.params.fields.relationships ? compositeModelGetRequest.params.fields.relationships : ["_ALL"];	
                        compositeModelGetRequest.params.fields.relationshipAttributes = compositeModelGetRequest.params.fields.relationshipAttributes ? compositeModelGetRequest.params.fields.relationshipAttributes : ["_ALL"];	
                        this.set('requestData', compositeModelGetRequest);	
                        if(attributeModelDataSource) {	
                            attributeModelDataSource.reTriggerRequest();	
                        }	
                    }
                }
            }
        }
    }
  _getAttributeFormattedData (data, requestData) {
    if (data && data.content && data.content.entityModels) {
        this._loading = false;
        if(this.editAttributesOnly) {
            let attrModelObj = {};
            let entityModels = data.content.entityModels;
            entityModels.forEach((elem) => {
                attrModelObj[elem.name] = elem;
            });
            let attributeDataModels = {"data": {"attributes":attrModelObj}};
            let attributeModels = DataTransformHelper.transformAttributeModels(attributeDataModels, {});
            
            let formatedAttributeModels = [];
            if (!_.isEmpty(attributeModels)) {
                let keys = Object.keys(attributeModels);
                if(keys && keys.length > 0) {
                    for(let j=0; j<keys.length; j++) {
                        let key = keys[j];
                        formatedAttributeModels.push(attributeModels[key]);
                    }
                }
            }
            let sortDetails = DataHelper.prepareAttributeModelSortCriterion('externalName');
            formatedAttributeModels = DataHelper.sort(formatedAttributeModels, "externalName", ConstantHelper.DATATYPE_STRING, null, sortDetails.properties);
        
            this._gridDataSize = formatedAttributeModels.length;
            return formatedAttributeModels;
        }else if(this.editRelationshipAttributesOnly){
            let relationshipModels = DataTransformHelper.transformRelationshipModels(data.content.entityModels[0], this.contextData);
            let relationshipAttributeModels = {};
            
            if (!_.isEmpty(relationshipModels)) {	
                let relType = requestData.params.fields.relationships[0];	
                let rel = relationshipModels[relType] && relationshipModels[relType].length ? relationshipModels[relType][0] : undefined;	
                relationshipAttributeModels = DataTransformHelper.transformRelationshipAttributeModels(rel, this.contextData, true);	
                if (this._currentIndex == 1) {	
                    this._currentItems = [];	
                }	
                this.push('_currentItems', relationshipAttributeModels);	
            }	
            if ((!relationshipAttributeModels || _.isEmpty(relationshipAttributeModels)) && DataHelper.isValidObjectPath(requestData, "params.query.id")) {	
                this._notFoundEntityTypes.push(requestData.params.query.id);	
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
            }
        }
        if (this._notFoundEntityTypes && this._notFoundEntityTypes.length) {
            let messageContent = this._notFoundEntityTypes.join(", ");
            this.logError("rock-bulk-edit-grid - Attribute models not found for entity type(s) " + messageContent);
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
