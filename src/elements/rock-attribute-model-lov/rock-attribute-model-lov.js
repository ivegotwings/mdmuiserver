/**
`rock-attribute-model-lov` Represents a component that renders the list of values control for the attribute models.
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
import '../bedrock-helpers/data-transform-helper.js';
import '../bedrock-helpers/element-helper.js';
import '../bedrock-lov-behavior/bedrock-lov-behavior.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import DomainManager from '../bedrock-managers/domain-manager.js';
import '../liquid-entity-model-get/liquid-entity-model-get.js';
import '../pebble-lov/pebble-lov.js';
import '../rock-grid-data-sources/attribute-model-datasource.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockAttributeModelLov extends mixinBehaviors([RUFBehaviors.UIBehavior, RUFBehaviors.LovBehavior], OptionalMutableData(PolymerElement)) {
  static get template() {
    return html`
        <liquid-entity-model-get id="getReferenceModels" operation="getbyids" request-data="[[_getRefModelsRequest]]" on-response="_onRefModelsReceived" on-error="_onRefModelsGetFailed"></liquid-entity-model-get>
        <attribute-model-datasource id="attributeModelDataSource" mode="[[mode]]" request="[[requestData]]" r-data-source="{{rDataSource}}" r-data-formatter="{{_dataFormatter}}" filter-criterion-builder="{{_filterCriterionBuilder}}" schema="lov">
        </attribute-model-datasource>
        <pebble-lov id="attributeModelLov" page-size="[[pageSize]]" multi-select="[[multiSelect]]" show-image="[[showImage]]" show-color="[[showColor]]" no-sub-title="[[noSubTitle]]" show-action-buttons="[[showActionButtons]]" r-data-source="{{rDataSource}}" items="[[items]]" selected-item="{{selectedItem}}" selected-items="{{selectedItems}}" on-selection-changed="_onLovSelectionChanged" deleted-items-count="[[_getDeletedItemsCount(deletedItems)]]">
        </pebble-lov>
`;
  }

  static get is() {
      return "rock-attribute-model-lov";
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
           * <b><i>Content development is under progress... </b></i> 
           */
          requestData: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          _currentIndex: {
              type: Number,
              value: function () {
                  return {};
              }
          },

          _currentItems: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          _lovColumnNameValueCollection: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          /*
           * Indicates an identifier for the item.
           */
          idField: {
              type: String,
              value: ""
          },

          /*
           * Indicates the title for the item.
           */
          titlePattern: {
              type: String,
              value: ""
          },

          /*
           * Indicates the sub-title for the item.
           */
          subTitlePattern: {
              type: String,
              value: ""
          },

          /*
           * Indicates an image for the item.
           */
          imageField: {
              type: String,
              value: ""
          },

          /*
           * Indicates the color for the item.
           */
          colorField: {
              type: String,
              value: ""
          },

          /*
           * Indicates the value for the item.
           */
          valueField: {
              type: String,
              value: ""
          },

          /*
           * Indicates the "type" for the item.
           */
          typeField: {
              type: Array,
              value: []
          },

          _dataFormatter: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          /**
              * <b><i>Content development is under progress... </b></i> 
          */
          mode: {
              type: String,
              value: ""
          },

          rDataSource: {
              type: Object,
              value: function () {
                  return {}
              }
          },

          _getRefModelsRequest: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          _selectedItem: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          showNestedChildAttributes: {
              type: Boolean,
              value: false,
          },

          showNestedAttributes: {
              type: Boolean,
              value: true,
          },

          excludeNestedAttributes: {
              type: Boolean,
              value: false
          },

          deletedItems: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          isModelGetInitiated: {
              type: Boolean,
              value: false,
              notify: true
          },
          modelGetRequest:{
              type:Object,
              value: {
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
                          "attributes": [""]
                      }
                  }
              
              }
          },
          domains:{
              type:Array,
              value:[]
          },
          _domainIndex:{
              type:Number,
              value:0
          },
          _combineEntityModels:{
              type:Array,
              value:[]
          }
      };
  }

  static get observers() {
      return [
          '_getAttributeModels(contextData, sortDetails)'
      ];
  }

  constructor() {
      super();
  }

  ready() {
      super.ready();

      this._filterCriterionBuilder = this._getFilterCriterion.bind(this);
      this._prepareAttributeMaps();

      if (!_.isEmpty(this.mode)) {
          if (this.mode === "all") {
              this._dataFormatter = this._getAttributeFormattedData.bind(this);
          } else if(this.mode === "domainMapped") {
              this._dataFormatter = this._getAttributeFormattedDataForDomainMapped.bind(this);
          } else {
              this._dataFormatter = this._getAttributeFormattedDataForCompositeModel.bind(this);
          }
      }

  }

  connectedCallback() {
      super.connectedCallback();
  }

  disconnectedCallback() {
      super.disconnectedCallback();
  }

  reTriggerRequest() {
      this.shadowRoot.querySelector('#attributeModelDataSource').reTriggerRequest();
  }

  getColumnNameValueCollection(){
      return this._lovColumnNameValueCollection;
  }

  _prepareAttributeMaps() {
      this._lovColumnNameValueCollection.id = this.idField;
      this._lovColumnNameValueCollection.title = this.titlePattern;
      this._lovColumnNameValueCollection.subtitle = this.subTitlePattern;
      this._lovColumnNameValueCollection.image = this.imageField;
      this._lovColumnNameValueCollection.color = this.colorField;
      this._lovColumnNameValueCollection.value = this.valueField;
  }

  _getAttributeModels(contextDataIn) {
      if (!_.isEmpty(this.contextData)) {
          let firstDomainContext = ContextHelper.getFirstDomainContext(this.contextData);
          this.domain = firstDomainContext && firstDomainContext.domain ? firstDomainContext.domain : undefined;
          if (this.mode === "all") {
              this.requestData = undefined;
              this.requestData = this.modelGetRequest;
              this.isModelGetInitiated = true;
          } else if(this.mode === "domainMapped") {
              this._initiateDomainMappedRequest(this.domain);
          } else {
              let contextData = DataHelper.cloneObject(this.contextData);

              if (this.contextData.ItemContexts) {
                  let index = 0;
                  for (let i = 0; i < contextData.ItemContexts.length; i++) {
                      if (contextData.ItemContexts[i].type) {
                          index++;
                      }
                  }
                  this._currentIndex = index;
                  this._currentItems = [];
                  this._notFoundEntityTypes = [];
              }

              if (contextData && contextData.ItemContexts) {
                  for (let i = 0; i < this.contextData.ItemContexts.length; i++) {

                      contextData.ItemContexts = [this.contextData.ItemContexts[i]];
                      let compositeModelGetRequest = DataRequestHelper.createEntityModelCompositeGetRequest(
                          contextData);
                      if (compositeModelGetRequest && compositeModelGetRequest.params) {
                          compositeModelGetRequest.params.fields.attributes = ["_ALL"];
                      }
                      this.set('requestData', compositeModelGetRequest);
                      this.reTriggerRequest();
                  }
                  this.isModelGetInitiated = true;
              } else {
                  //ItemContext not available to fetch the attribute models
                  this.isModelGetInitiated = false;
              }
          }
      }
  }

  _initiateDomainMappedRequest(domain) {
      this.pageSize = 101;
      if(DataHelper.isValidObjectPath(this.modelGetRequest,"params.query") && domain){
          this.modelGetRequest.params.query["domain"] = domain;
      }
      if(DataHelper.isValidObjectPath(this.modelGetRequest,"params.fields.attributes")){
          this.modelGetRequest.params.fields.attributes = ["_ALL"];
      }
      this.modelGetRequest.params.fields.sort = {"properties":[{"externalName":"_ASC","sortType":"_STRING"}]};
      this.requestData = undefined;
      this.requestData = this.modelGetRequest;
      /**
      * Initially this.isModelGetInitiated will be false and request will go from
      * attribute-model-datasource function. From 2nd time onwards,
      * retriggerRequest has to be called for further requests.
      * */
      if(this.isModelGetInitiated) {
          this.reTriggerRequest();
      }
      this.isModelGetInitiated = true;
  }

  _getAttributeFormattedData(data) {
      if (data && data.content && !_.isEmpty(data.content.entityModels)) {
          let items = [];
          let attributeModels = this.excludeNestedAttributes ? this._excludeNestedAttributeModels(data.content.entityModels) : data.content.entityModels;
          for (let i = 0; i < attributeModels.length; i++) {
              let attributeModel = attributeModels[i];
              let item = {
                  "id": attributeModel.name,
                  "value": attributeModel.name,
                  "title": attributeModel.properties.externalName
              };
              items.push(item);
          }
          return items;
      }
  }

  _getAttributeFormattedDataForCompositeModel(data, requestData) {
      if (data && data.content && data.content.entityModels) {
          let attributeModels = DataTransformHelper.transformAttributeModels(data.content.entityModels[0], this.contextData);
          if (!_.isEmpty(attributeModels)) {
              if (this._currentIndex == 1) {
                  this._currentItems = [];
              }
              this.push('_currentItems', DataTransformHelper.transformAtributeModelsToLovSchema(attributeModels, this._lovColumnNameValueCollection));
          } else if (DataHelper.isValidObjectPath(requestData, "params.query.name")) {
              this._notFoundEntityTypes.push(requestData.params.query.name);
          }

          let responseLength = this._currentItems.length + this._notFoundEntityTypes.length;

          if (responseLength == this._currentIndex) {
              let currentItems = this._currentItems;
              currentItems = currentItems.reduce(function (array1, array2) {
                  return array1.concat(array2);
              });
              let filteredCurrentItems = [];
              currentItems = _.uniq(currentItems, function (item, key, id) {
                  return item.id && item.externalName;
              });

              let property, dataType, sortType, multiSortProperties;
              if (!_.isEmpty(this.sortDetails)) {
                  property = this.sortDetails.property;
                  dataType = this.sortDetails.dataType;
                  sortType = this.sortDetails.sortType;
              }

              //Default sort
              if (!property) {
                  property = "displaySequence";
                  dataType = "integer";
              }

              //multi sort
              if (property != "title") {
                  multiSortProperties = [{
                      "name": "title",
                      "dataType": "string"
                  }];
              }
              this.items = DataHelper.sort(currentItems, property, dataType, sortType, multiSortProperties);
              for (let i = 0; i < this.items.length; ++i) {
                  let currentItem = this.items[i];
                  if (currentItem.dataType == "nested") {
                      if (this.showNestedChildAttributes || this.showNestedAttributes) {
                          let nestedAttributeItems = [];
                          nestedAttributeItems = DataHelper.getNestedAttributeItems(currentItem, this.showNestedAttributes, this.showNestedChildAttributes, property);
                          if (nestedAttributeItems.length > 0) {
                              filteredCurrentItems = filteredCurrentItems.concat(nestedAttributeItems)
                          }
                      }
                  } else {
                      filteredCurrentItems.push(currentItem);
                  }
              }
              this.set("items", filteredCurrentItems);
              if (this._notFoundEntityTypes && this._notFoundEntityTypes.length) {
                  let messageContent = this._notFoundEntityTypes.join(", ");
                  this.logError("rock-attribute-model-lov - Attribute models not found for entity type(s) " + messageContent);
              }
          }
      }
  }

  _getAttributeFormattedDataForDomainMapped(data, error, isNestedChildUpdate) {
      if (data && data.content) {
          let items = [];
          let entityModels = !_.isEmpty(data.content.entityModels) ? data.content.entityModels : [];
          this._combineEntityModels = this._combineEntityModels.concat(entityModels);
          if(this.mode == "domainMapped" && DataHelper.isValidObjectPath(this.modelGetRequest, "params.query.domain")){
              let requestedDomain = this.modelGetRequest.params.query.domain;
              let systemDomains = DomainManager.getInstance().getSystemDomains();                      
              if(requestedDomain === this.domain && (systemDomains && (systemDomains instanceof Array) && systemDomains.indexOf(this.domain) == -1)) {
                  this._initiateDomainMappedRequest("taxonomyModel");
                  return false;
              } else{
                  if(_.isEmpty(this._combineEntityModels)) {	
                      this.set("items",[]);	
                  } else {
                      let attrModelObj = {};
                      this._combineEntityModels = this.excludeNestedAttributes ? this._excludeNestedAttributeModels(this._combineEntityModels) : this._combineEntityModels;
                      this._combineEntityModels.forEach((elem) => {
                          attrModelObj[elem.name] = elem;
                      });
                      let attributeDataModels = {"data": {"attributes":attrModelObj}};
                      let attributeModels = DataTransformHelper.transformAttributeModels(attributeDataModels, {});
                      if (!_.isEmpty(attributeModels)) {
                          let items = DataTransformHelper.transformAtributeModelsToLovSchema(attributeModels, this._lovColumnNameValueCollection);
                          this.set("items", items);
                      }
                      let requiredNestedChildAttrs = this._getNestedChildAttributes();
                      if(!_.isEmpty(requiredNestedChildAttrs) && !isNestedChildUpdate){
                          let _attrDataSource = this.shadowRoot.querySelector('#attributeModelDataSource');
                          if(_attrDataSource){
                              let attrModelGetRequest = DataRequestHelper.createGetAttributeModelRequest(requiredNestedChildAttrs);
                              if(!_.isEmpty(attrModelGetRequest)){
                                  _attrDataSource.triggerNestedAttrRequest(attrModelGetRequest);
                              }
                          }
                      }else{
                          this._processNestedAttributeModels();
                      }
                  }
              }
              
          }
      }
  }

  _getNestedChildAttributes(){
      let currentItems = this._combineEntityModels;
      let requiredNestedChildAttrs = [];
      for (let i = 0; i < currentItems.length; ++i) {
          let currentItem = currentItems[i];
          if (currentItem.dataType == "nested") {
              if (this.showNestedChildAttributes || this.showNestedAttributes) {
                  //filter child attributes
                  if(!_.isEmpty(currentItem.childAttributes)){
                      if(typeof currentItem.childAttributes === 'string'){
                          currentItem.childAttributes = [currentItem.childAttributes]
                      }
                      currentItem.childAttributes.forEach(childAttrId => {
                          let availChildAttrs = currentItems.filter( availAttrItem => { return availAttrItem.id == childAttrId; })
                          if(!_.isEmpty(availChildAttrs)){
                              if(!currentItem.group){
                                  currentItem.group = [{}];
                              }
                              let attrId = availChildAttrs[0]['id'];
                              currentItem.group[0][attrId] = availChildAttrs[0];
                              this._combineEntityModels = this._combineEntityModels.filter(removalChild => { return removalChild.id != attrId});
                          }else{
                              requiredNestedChildAttrs.push(childAttrId);
                          }
                      });
                  }
              }
          }
      }
      return requiredNestedChildAttrs;
  }
  _processNestedAttributeModels(){
      let currentItems = this.items;
      let filteredCurrentItems = [];
  
      currentItems = _.uniq(currentItems, function (item, key, id) {
          return item.id && item.externalName;
      });

      let property, dataType, sortType, multiSortProperties;
      if (!_.isEmpty(this.sortDetails)) {
          property = this.sortDetails.property;
          dataType = this.sortDetails.dataType;
          sortType = this.sortDetails.sortType;
      }

      //Default sort
      if (!property) {
          property = "displaySequence";
          dataType = "integer";
      }

      //multi sort
      if (property != "title") {
          multiSortProperties = [{
              "name": "title",
              "dataType": "string"
          }];
      }

      this.items = DataHelper.sort(currentItems, property, dataType, sortType, multiSortProperties);
      for (let i = 0; i < this.items.length; ++i) {
          let currentItem = this.items[i];
          if (currentItem.dataType == "nested") {
              if (this.showNestedChildAttributes || this.showNestedAttributes) {
                  let nestedAttributeItems = [];
                  nestedAttributeItems = DataHelper.getNestedAttributeItems(currentItem, this.showNestedAttributes, this.showNestedChildAttributes, property);
                  if (nestedAttributeItems.length > 0) {
                      filteredCurrentItems = filteredCurrentItems.concat(nestedAttributeItems)
                  }
              }
          } else {
              filteredCurrentItems.push(currentItem);
          }
      }
      if(!_.isEmpty(filteredCurrentItems)){
          filteredCurrentItems = _.uniq(filteredCurrentItems, (attr) => { return attr.id; } );
      }

      if(DataHelper.isValidObjectPath(this.requestData, 'params.query.filters.keywordsCriterion.keywords')){
          let searchText = this.requestData.params.query.filters.keywordsCriterion.keywords;
          if(searchText.substr(0,1) == '*'){
              //For keyword search, we are adding * in front and end of search text
              //So below code will remove * to perform local search
              searchText = searchText.substr(1, searchText.length-2);
          }
          let searchFilteredItems = filteredCurrentItems.filter(searchItem => {
              let _searchTarget = searchItem.title ? searchItem.title : searchItem.name;
              if(_searchTarget) {
                  _searchTarget = _searchTarget.replace(/[{(/)}\[\]]/g, ' ');
              }
              return (_searchTarget.search(new RegExp(searchText, "i")) > -1);
          })
          this.set("items", searchFilteredItems);
      }else{
          this.set("items", filteredCurrentItems);
      }

      if (this._notFoundEntityTypes && this._notFoundEntityTypes.length) {
          let messageContent = this._notFoundEntityTypes.join(", ");
          this.logError("rock-attribute-model-lov - Attribute models not found for entity type(s) " + messageContent);
      }
  }

  _excludeNestedAttributeModels(attributeModels) {
      let models = [];
      attributeModels.forEach(function (attributeModel) {
          if (!attributeModel.properties || attributeModel.properties.dataType != "nested") {
              models.push(attributeModel);
          } else {
              this.deletedItems.push(attributeModel);
              //Notify deleted items to LOV
              let temp = this.deletedItems;
              this.deletedItems = [];
              this.deletedItems = temp;
          }
      }, this);

      return models;
  }

  _getDeletedItemsCount() {
      return this.deletedItems ? this.deletedItems.length : 0;
  }
  _getFilterCriterion (searchText) {                   
    this._combineEntityModels = [];
    let filterCri = DataRequestHelper.createFilterCriteria("propertiesCriterion",searchText, this.titlePattern,null,this.showNestedChildAttributes)
    if(this.mode == "domainMapped") {
        this.modelGetRequest.params.query["domain"] = this.domain;
    }
    return filterCri;
    }


  _onLovSelectionChanged(event) {
      let item = event.detail.item;
      this.set("_selectedItem", item);

      if (item.isReferenceType) {
          this._updateRefEntityInfo(item);
      } else {
          this._fireSelectionChangedEvent(item);
      }
  }

  refresh() {
      this._getAttributeModels(this.contextData, this.sortDetails);
  }

  clearSelectedItem(){
      let modelLOV = this.shadowRoot.querySelector('#attributeModelLov');
      if (modelLOV) {
          modelLOV.selectedItem = [];
      }
  }

  reset() {
      let modelLOV = this.shadowRoot.querySelector('#attributeModelLov');
      if (modelLOV) {
          modelLOV.reset();
      }
  }

  _fireSelectionChangedEvent(item) {
      let eventDetail = {
          data: item
      }

      this.fireBedrockEvent("attribute-model-lov-selection-changed", eventDetail);
  }

  _updateRefEntityInfo(model) {
      let refEntityType = DataHelper.getRefEntityType(model);

      if (refEntityType) {
          let req = DataRequestHelper.createGetManageModelRequest([refEntityType]);

          this.set("_getRefModelsRequest", req);

          let refModelsGetLiquid = this.shadowRoot.querySelector("[id=getReferenceModels]");
          if (refModelsGetLiquid) {
              refModelsGetLiquid.generateRequest();
          }
      }
  }

  _onRefModelsReceived(e, detail) {
      let referenceModels = {};
      let responseContent = DataHelper.validateAndGetResponseContent(detail.response)
      if (responseContent && !_.isEmpty(responseContent.entityModels)) {
          referenceModels = DataTransformHelper.transformEntityModelsToReferenceModels(responseContent.entityModels);

          if (!_.isEmpty(referenceModels)) {
              let item = DataHelper.cloneObject(this._selectedItem);
              DataHelper.updateRefEntityInfo(item, referenceModels);

              this._fireSelectionChangedEvent(item);
          }
      }
  }

  _onRefModelsGetFailed(e) {
      this.logWarning("ReferenceManageModelGetFail", e);
  }
}

customElements.define(RockAttributeModelLov.is, RockAttributeModelLov);
