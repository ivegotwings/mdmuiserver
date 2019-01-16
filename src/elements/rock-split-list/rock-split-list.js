/**
`rock-split-list`

@demo demo/index.html 
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-helpers/attribute-helper.js';
import '../bedrock-helpers/context-helper.js';
import '../pebble-split-list/pebble-split-list.js';
import '../rock-grid-data-sources/attribute-model-datasource.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockSplitList
    extends mixinBehaviors([
        RUFBehaviors.UIBehavior
    ], PolymerElement) {
  static get template() {
    return html`
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
            <attribute-model-datasource id="[[objectType]]" mode="all" request="[[requestData]]" r-data-source="{{rDataSource}}" total-count="{{totalCount}}" buffer-record-size="{{size}}" current-record-size="{{currentRecordSize}}" result-record-size="{{resultRecordSize}}" r-data-formatter="{{_dataFormatter}}" schema="grid" filter-criterion-builder="{{_filterCriterionBuilder}}" sort-criterion-builder="{{_sortCriterionBuilder}}">
            </attribute-model-datasource>
            <pebble-split-list r-data-source-id="[[objectType]]" deleted-items="{{deletedItems}}" page-size="[[pageSize]]" size="{{size}}" selected-items="{{selectedItems}}" retain-selected-items="{{retainSelectedItems}}" move-up-down-enabled="{{moveUpDownEnabled}}" config="[[config]]" r-data-source="{{rDataSource}}" unique-id="{{objectType}}"></pebble-split-list>
        </template>
`;
  }

  static get is() { return 'rock-split-list' }
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
          },
          objectType: {
              type: String,
              value: "attribute"
          },
          disableSplitList: {
              type: Boolean,
              value: false,
              observer: '_onDisableSplitList'
          }
      }
  }

  /**
   * onReady Function
   */
  ready () {
      super.ready();
      this._dataFormatter = this._getFormattedData.bind(this);
      this._filterCriterionBuilder = this._getFilterCriterion.bind(this);
      this._sortCriterionBuilder = this._getSortCriterion.bind(this);  
      this.requestData = {};
      let typesCriterion = "attributeModel";
      if(this.objectType == "relationship"){
          typesCriterion = "relationshipModel";
      }              
      let modelGetRequest = {
          "params": {
              "query": {
                  "filters": {
                      "typesCriterion": [
                          typesCriterion
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
      
      this.set("requestData", modelGetRequest);   
  }

  /**
   *  Function to handle sort criterion 
   */
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
                  let model = this.attributeModels[sortOrder.path];
                  property["sortType"] = ConstantHelper.getDataTypeConstant(model.dataType);
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

  /**
   *  Function to handle filter criterion search
   */
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

  /**
   *  Function to get formatted data
   */
  _getFormattedData (data) {   
     // if(!this.config) {
       //   return;
      //}                
      let idField = this.config.tabular.settings.idField;
      let formattedData=[];
      let deletedCount=0;
      let gridColumns = DataHelper.convertObjectToArray(this.config.tabular.fields);
      let valContext = ContextHelper.getFirstValueContext(this.contextData);
      let isMissingItems = false;
      if (data && data.content && !_.isEmpty(data.content.entityModels)) {
          let models = data.content.entityModels;

          for (let i = 0; i < models.length; i++) {
              let model = models[i];
              for(let key in model.properties){
                  if(!model[key]) {
                      model[key] = model.properties[key];
                  }
              }


              let attributes = model.data && model.data.attributes ? model.data.attributes : undefined;
              if(!_.isEmpty(attributes)) {
                  for(let j=0; j < gridColumns.length; j++) {
                      let column = gridColumns[j];
                      if(column.readFrom === "attributes") {
                          let attribute = attributes[column.name];
                          if(attribute && attribute.values) {
                              model[column.name] = AttributeHelper.getAttributeValues(attribute.values, valContext);
                          }
                      }
                  }
              }
              

              let _this = this;
              let match = undefined;
              if(this.selectedItems && this.selectedItems.length) {
                  match = this.selectedItems.find(function (item) {
                      if (item && item[idField] === model[idField]) {
                          if (_this.deletedItems.indexOf(item) === -1) {
                              _this.push("deletedItems", item);
                          }
                          deletedCount++;
                          return true;
                      }
                      return false;
                  });
              }
              
              //Disable the rock grid contents based on the disableSplitList flag
              model.disabled = false;
              if(this.disableSplitList) {
                  model.disabled = true;
              }

              //Check if the columnNames are described in the model
              for(let j=0; j<gridColumns.length; j++) {
                  let column = gridColumns[j];
                  if(!model[column.name]) {
                      match = true;
                      isMissingItems = true;
                      break;
                  }
              }

              if(!match){
                  formattedData.push(model);
              }
          }

          formattedData.deletedCount=deletedCount;
          //Display the warming message only once if there are missing items in the split screen
          if(isMissingItems && !this.warningShown){                            
              this.showWarningToast("Some attributes/relationships may not be listed because they do not have external name");
              this.warningShown = true; 
          }                        
          return formattedData;
      } else {
          this.logError("models are not found for the request ", this.requestData);
      }
      
  }

  /**
   *  Function to rerender grid
   */
  rerenderGrid () {
      if(this.$$("pebble-split-list")) {
          this.$$("pebble-split-list").rerenderGrid();
      }
  }

  /**
   *  Function to disable or enable split list grid contents
   */
  _onDisableSplitList() {
      if(this.$$("pebble-split-list")) {
          this.$$("pebble-split-list").resetGridItems(this.disableSplitList);                       
      }
  }
}

customElements.define(RockSplitList.is, RockSplitList);
