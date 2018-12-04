/**
`rock-attribute-split-list`

@demo demo/index.html 
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-helpers/attribute-helper.js';
import '../bedrock-helpers/context-helper.js';
import '../pebble-split-list/pebble-split-list.js';
import '../rock-grid-data-sources/attribute-model-datasource.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockAttributeSplitList
    extends mixinBehaviors([
        RUFBehaviors.UIBehavior
    ], PolymerElement) {
  static get template() {
    return Polymer.html`
        <style include="bedrock-style-common">
             :host {
                display: block;
                height: 100%;
            }
        </style>
                            <template is="dom-if" if="{{hasComponentErrored(isComponentErrored)}}">
                                <div id="error-container"></div>
                            </template>
                            
                            <template is="dom-if" if="{{!hasComponentErrored(isComponentErrored)}}">
                                <attribute-model-datasource id="attributeModelDataSource" mode="all" request="[[requestData]]" r-data-source="{{rDataSource}}" total-count="{{totalCount}}" buffer-record-size="{{size}}" current-record-size="{{currentRecordSize}}" result-record-size="{{resultRecordSize}}" r-data-formatter="{{_dataFormatter}}" schema="grid" filter-criterion-builder="{{_filterCriterionBuilder}}" sort-criterion-builder="{{_sortCriterionBuilder}}">
                                </attribute-model-datasource>
                                <pebble-split-list r-data-source-id="attributeModelDataSource" deleted-items="{{deletedItems}}" page-size="[[pageSize]]" size="{{size}}" selected-items="{{selectedItems}}" retain-selected-items="{{retainSelectedItems}}" move-up-down-enabled="{{moveUpDownEnabled}}" config="[[config]]" r-data-source="{{rDataSource}}"></pebble-split-list>
                            </template>
`;
  }

  static get is() { return 'rock-attribute-split-list' }
  static get properties() {
      return {
          contextData: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          rDataSource: {
              type: Function,
              notify: true
          },
          items: {
              type: Array,
              value: function () {
                  return [];
              },
              notify: true
          },
          selectedItems: {
              type: Array,
              value: function () {
                  return [];
              },
              notify: true
          },
          retainSelectedItems: {
              type: Boolean,
              value: false
          },
          moveUpDownEnabled: {
              type: Boolean,
              value: false
          },
          requestData: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          pageSize: {
              type: Number,
              value: 50
          },
          deletedItems: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          config: {
              type: Object
          }
      }
  }
  ready () {
      super.ready();
      this._dataFormatter = this._getAttributeFormattedData.bind(this);
      this._filterCriterionBuilder = this._getFilterCriterion.bind(this);
      this._sortCriterionBuilder = this._getSortCriterion.bind(this);
      let modelGetRequest = {
          "params": {
              "query": {
                  "filters": {
                      "typesCriterion": [
                          "attributeModel"
                      ]
                  }
              },
              "fields": {
                  "ctxTypes": [
                      "properties"
                  ],
                  "attributes":[""]
              }
          }
      };
      this.requestData = modelGetRequest;
  }
  _getSortCriterion (sortOrders) {
      if (sortOrders && sortOrders.length) {
          let sortOrder = sortOrders[sortOrders.length - 1];
          let gridColumns = DataHelper.convertObjectToArray(this.config.tabular.fields);
          let attributes = [];
          let property = {};
          let direction = "_ASC";
          if (sortOrder.direction ) {
              if (sortOrder.direction == "asc") {
                  direction = "_ASC";
              } else if (sortOrder.direction == "desc") {
                  direction = "_DESC";
              }
              property[sortOrder.path] = direction;
              if(this.attributeModels){
                  let attributeModel = this.attributeModels[sortOrder.path];
                  property["sortType"] = ConstantHelper.getDataTypeConstant(attributeModel.dataType);
              }
              if(!property["sortType"]){
                  property["sortType"] = ConstantHelper.DATATYPE_STRING;
              }
              attributes.push(property);
              for(let i=0;i<gridColumns.length;i++){
                  let col=gridColumns[i];
                  if(col.name==sortOrder.path){
                      if(col.readFrom === "attributes") {
                          return { "attributes": attributes };
                      } else{
                          return { "properties": attributes };
                      }
                  }
              }
              return { "properties": attributes };
          }
      }
      return undefined;
  }
  _getFilterCriterion (filters) {
      let attributesCriterion=[];
      let propertiesCriterion=[];
      let fields = this.config && this.config.tabular ? this.config.tabular.fields : {};
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
  _getAttributeFormattedData (data) {
      let idField=this.config.tabular.settings.idField;
      let formattedData=[];
      let deletedCount=0;
      let gridColumns = DataHelper.convertObjectToArray(this.config.tabular.fields);
      let valContext = ContextHelper.getFirstValueContext(this.contextData);
      if (data && data.content && !_.isEmpty(data.content.entityModels)) {
          let attributeModels = data.content.entityModels;

          for (let i = 0; i < attributeModels.length; i++) {
              let attributeModel = attributeModels[i];
              for(let key in attributeModel.properties){
                  if(!attributeModel[key]) {
                      attributeModel[key] = attributeModel.properties[key];
                  }
              }
              let attributes = attributeModel.data && attributeModel.data.attributes ? attributeModel.data.attributes : undefined;
              if(!_.isEmpty(attributes)) {
                  for(let j=0; j < gridColumns.length; j++) {
                      let column = gridColumns[j];
                      if(column.readFrom === "attributes") {
                          let attribute = attributes[column.name];
                          if(attribute && attribute.values) {
                              attributeModel[column.name] = AttributeHelper.getAttributeValues(attribute.values, valContext);
                          }
                      }
                  }
              }

              let _this = this;
              let match = undefined;
              if(this.selectedItems && this.selectedItems.length) {
                  match = this.selectedItems.find(function (item) {
                      if (item && item[idField] === attributeModel[idField]) {
                          if (_this.deletedItems.indexOf(item) === -1) {
                              _this.push("deletedItems", item);
                          }
                          deletedCount++;
                          return true;
                      }
                      return false;
                  });
              }
              if(!match){
                  formattedData.push(attributeModel);
              }
          }
          formattedData.deletedCount=deletedCount;
          return formattedData;
      } else {
          this.logError("attributeModels are not found for the request ", this.requestData);
      }
      
  }
  rerenderGrid () {
      this.$$("pebble-split-list").rerenderGrid();
  }
}
customElements.define(RockAttributeSplitList.is, RockAttributeSplitList);