/**
`rock-entity-lov` Represents a component that renders the entities in the list of values control.
It filters the data as per the filter criteria.

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
import '../liquid-entity-model-get/liquid-entity-model-get.js';
import '../pebble-lov/pebble-lov.js';
import '../rock-image-source-provider/rock-image-source-provider.js';
import './entity-lov-datasource.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockEntityLov
    extends mixinBehaviors([
        RUFBehaviors.UIBehavior,
        RUFBehaviors.LovBehavior
    ], OptionalMutableData(PolymerElement)) {
  static get template() {
    return html`
        <entity-lov-datasource id="entityLovDataSource" apply-locale-coalesce="[[applyLocaleCoalesce]]" data-index\$="[[dataIndex]]" base-request="[[requestData]]" r-data-source="{{rDataSource}}" r-data-formatter="{{_dataFormatter}}" keywords-criterion-builder="{{_keywordsCriterionBuilder}}" sort-criterion-builder="{{_sortCriterionBuilder}}" attributes-criterion-builder="{{_attributesCriterionBuilder}}" lazy-loading-disabled="[[lazyLoadingDisabled]]">
        </entity-lov-datasource>
        <rock-image-source-provider image-source="{{imageSource}}"></rock-image-source-provider>
        <pebble-lov id="entityLov" readonly="[[readonly]]" image-source="{{imageSource}}" page-size="[[pageSize]]" select-all="[[enableSelectAll]]" multi-select="[[multiSelect]]" show-image="[[_showImage(imageField,imageIdField)]]" show-color="[[showColor]]" no-sub-title="[[noSubTitle]]" show-action-buttons="[[showActionButtons]]" r-data-source="{{rDataSource}}" items="[[items]]" allow-favourites="[[allowFavourites]]" selected-item="{{selectedItem}}" selected-items="{{selectedItems}}" allow-search-query-format="" on-selection-changed="_onLovSelectionChanged" on-lov-confirm-button-tap="_onLovConfirmButtonTapped" on-lov-close-button-tap="_onLovCloseButtonTapped" on-lov-favourite-icon-tap="_onLovItemFavouriteIconTapped" disable-selection="[[disableSelection]]">
        </pebble-lov>
        <liquid-entity-model-get id="getReferenceModels" operation="getbyids" request-data="[[_getRefModelsRequest]]"></liquid-entity-model-get>
`;
  }

  static get is() {
      return 'rock-entity-lov';
  }
  static get observers() {
      return [
          '_prepareAttributes(idField, titlePattern, subTitlePattern, imageField,imageIdField, colorField, valueField, typeField, sortField, requestData)'
      ]
  }
  static get properties() {
      return {
          requestData: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          /**
           * If set as true , it indicates the component is in read only mode
           */
          readonly: {
              type: Boolean,
              value: false
          },
          configDataItemId: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          rDataSource: {
              type: Object,
              value: function () {
                  return {}
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
          _titlePattern: {
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
          imageIdField: {
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
          _attributesCriterionBuilder: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _keywordsCriterionBuilder: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _sortCriterionBuilder: {
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
          selectedItem: {
              type: Object,
              notify: true,
              value: function () {
                  return {};
              }
          },
          selectedItems: {
              type: Array,
              notify: true,
              value: function () {
                  return [];
              }
          },
          imageSource: {
              type: Object
          },
          externalDataFormatter: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          sortField: {
              type: String,
              value: ""
          },
          applyLocaleCoalescedStyle: {
              type: Boolean,
              value: false
          },
          applyContextCoalescedStyle: {
              type: Boolean,
              value: false
          },
          excludedIds: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          dataIndex: {
              type: String,
              value: "entityData"
          },
          multiSelect: {
              type: Boolean,
              value: true
          },
          _attributes: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          disableSelection: {
              type: Boolean,
              value: false
          },
          _getRefModelsRequest: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          getTitleFromModel: {
              type: Boolean,
              value: false
          },
          lazyLoadingDisabled: {
              type: Boolean,
              value: false
          },
          allowFavourites: {
              type: Boolean,
              value: false
          },
          enableSelectAll: {
              type: Boolean,
              value: false
          },
          _maxConfiguredCount: {
              type: Number,
              value: function () {
                  return DataObjectFalcorUtil.getPathKeys().dataIndexInfo.entityData.maxRecordsToReturn;
              }
          },
          applyLocaleCoalesce: {
              type: Boolean,
              value: false
          }
      }
  }

  /**
    * <b><i>Content development is under progress... </b></i> 
    */

  /**
    * <b><i>Content development is under progress... </b></i> 
    */
  ready() {
      super.ready();
      this._attributesCriterionBuilder = this._prepareAttributesCriteria.bind(this);
      this._keywordsCriterionBuilder = DataHelper.getSearchCriteria.bind(this);
      this._sortCriterionBuilder = this._prepareSortCriterion.bind(this);
      this._dataFormatter = this._getAttributeFormattedData.bind(this);
  }

  async _prepareAttributes(idField, titlePattern, subTitlePattern, imageField, imageIdField, colorField,
      valueField, typeField, sortField, requestData) {
      let defaultAttributes = this._attributes;
      this._attributes = [];
      let attributes = [];

      if (_.isEmpty(this.requestData)) {
          return;
      }

      if (typeof (this.idField) !== 'undefined' && this.idField !== "") {
          attributes.push(this.idField);
      }

      if (this.getTitleFromModel && !this._titlePattern) {
          try {
              await new Promise((resolve, reject) => {
                  this._setLovTitleField(resolve, reject);
              });
          } catch (e) {
              this.logWarning(e);
          }
      }

      if (!this._titlePattern) {
          this._titlePattern = this.titlePattern;
      }

      if (typeof (this._titlePattern) !== 'undefined' && this._titlePattern !== "") {
          if (!attributes.includes(this._titlePattern)) {
              let titleFields = DataHelper.getAttributesBetweenCurlies(this._titlePattern);
              if (titleFields && titleFields instanceof Array) {
                  attributes.push(...titleFields);
              }
          }
      }

      if (typeof (this.subTitlePattern) !== 'undefined' && this.subTitlePattern !== "") {
          if (!attributes.includes(this.subTitlePattern)) {
              let subtitleFields = DataHelper.getAttributesBetweenCurlies(this.subTitlePattern);
              if (subtitleFields && subtitleFields instanceof Array) {
                  attributes.push(...subtitleFields);
              }
          }
      }

      if (typeof (this.sortField) !== 'undefined' && this.sortField !== "") {
          if (!attributes.includes(this.sortField)) {
              let sortFields = DataHelper.getAttributesBetweenCurlies(this.sortField);
              if (sortFields && sortFields instanceof Array) {
                  this._sortField = sortFields.length > 0 ? sortFields[0] : "";
              }
          } else if (attributes.includes(this.sortField)) {
              this._sortField = this.sortField;
          }
      }

      if (typeof (this.imageField) !== 'undefined' && this.imageField !== "") {
          if (!attributes.includes(this.imageField)) {
              attributes.push(this.imageField);
          }
      }
      if (typeof (this.imageIdField) !== 'undefined' && this.imageIdField !== "") {
          if (!attributes.includes(this.imageIdField)) {
              attributes.push(this.imageIdField);
          }
      }

      if (typeof (this.colorField) !== 'undefined' && this.colorField !== "") {
          if (!attributes.includes(this.colorField)) {
              attributes.push(this.colorField);
          }
      }

      if (typeof (this.valueField) == 'undefined' && this.valueField !== "") {
          if (!attributes.includes(this.valueField)) {
              attributes.push(this.valueField);
          }
      }

      DataHelper.arrayRemove(attributes, "id");
      DataHelper.arrayRemove(attributes, "name");

      if (attributes.length == 0) {
          this._attributes = defaultAttributes;
      } else {
          // Todo.. This will not work in a scenario where request object is not initialized
          if (!DataHelper.isEmptyObject(this.requestData) && typeof (this.requestData.params.fields) === "undefined") {
              this.set('requestData.params.fields', {});
          }
          //this.set('requestData.params.fields.attributes', attributes);
          this._attributes = attributes;
      }


      if (this.requestData && !DataHelper.isEmptyObject(this.requestData) && this.requestData.params.fields) {
          this.requestData.params.fields.attributes = this._attributes;
      }

      this.reset(); //Reset lov after request update
      this._prepareAttributeMaps();
  }
  _prepareSortCriterion() {
      if (!DataHelper.isEmptyObject(this._sortField) && this._sortField !== "name") {
          let sortAttributes = [];

          let sortAttribute = {};
          sortAttribute[this._sortField] = "_ASC";
          sortAttribute["sortType"] = "_STRING"; // How to determine this?
          sortAttributes.push(sortAttribute);

          let sort = {};
          sort.attributes = sortAttributes;
          return sort;
      }
      return undefined;
  }
  /**
    * <b><i>Content development is under progress... </b></i> 
    */
  reTriggerRequest() {
      this.shadowRoot.querySelector('#entityLovDataSource').reTriggerRequest();
  }
  /**
    * <b><i>Content development is under progress... </b></i> 
    */
  resetLOV() {
      this.shadowRoot.querySelector('#entityLov').items = [];
  }
  /**
    * <b><i>Content development is under progress... </b></i> 
    */
  refreshLOVData() {
      this.shadowRoot.querySelector('#entityLov').refreshData();
  }
  /**
    * <b><i>Content development is under progress... </b></i> 
    */
  reset() {
      this.resetLOV();
      if (this.lazyLoadingDisabled) {
          this.pageSize = this._maxConfiguredCount;
          let sortCriterion = this._prepareSortCriterion();
          if (sortCriterion) {
              this.set("requestData.params.sort", sortCriterion);
          }
      }
      this.shadowRoot.querySelector('#entityLov').reset();
  }
  _prepareAttributeMaps() {
      this._lovColumnNameValueCollection.entityId = "id"; 
      this._lovColumnNameValueCollection.id = this.idField;
      this._lovColumnNameValueCollection.title = this._titlePattern;
      this._lovColumnNameValueCollection.subtitle = this.subTitlePattern;
      this._lovColumnNameValueCollection.image = this.imageField;
      this._lovColumnNameValueCollection.imageId = this.imageIdField;
      this._lovColumnNameValueCollection.color = this.colorField;
      this._lovColumnNameValueCollection.value = this.valueField;
      this._lovColumnNameValueCollection.type = this.typeField;

      if (this.applyLocaleCoalescedStyle) {
          this._lovColumnNameValueCollection.textColor = this._titlePattern;
      }

      if (this.applyContextCoalescedStyle) {
          this._lovColumnNameValueCollection.fontStyle = this._titlePattern;
      }
  }

  _getAttributeFormattedData(data) {
      let entities = undefined;
      //checking for selected Items and replace them with actual object from data.
      
      if (data && data.content.entities) {
          entities = data.content.entities;

          if (entities) {
              entities = DataTransformHelper.transformEntitySchemaToLovSchema(entities, this._lovColumnNameValueCollection);
          }

          if (entities && this.externalDataFormatter && typeof this.externalDataFormatter == "function") {
              entities = this.externalDataFormatter(entities, data.content.entities);
          }
      }
      if (!_.isEmpty(this.selectedItems) && !_.isEmpty(entities)) {
          let selectedItems = DataHelper.cloneObject(this.selectedItems);
          selectedItems.forEach(selectedItem => {
              entities.forEach(entity => {
                  if (!selectedItem.hasOwnProperty('id') && (entity.name === selectedItem || entity.value === selectedItem)) {
                      //removing the string and replacing with entity obj
                      let index = this.selectedItems.indexOf(selectedItem);
                      if (index > -1) {
                          this.selectedItems.splice(index, 1);
                          this.selectedItems.push(entity);
                      }
                  }
              });
          });
      }
      if (entities && this.excludedIds && this.excludedIds.length > 0) {
          entities = entities.filter(entity => {
              return this.excludedIds.indexOf(entity.id) == -1;
          });
      };
      return entities;
  }

  _prepareAttributesCriteria(searchText,criterionKey) {
    return DataRequestHelper.createFilterCriteria(criterionKey,searchText, this._titlePattern, this.subTitlePattern);
}

  _onLovSelectionChanged(event) {
      let eventDetail = {
          data: event.detail.item
      }

      this.fireBedrockEvent("entity-lov-selection-changed", eventDetail);
  }

  _onLovConfirmButtonTapped(event) {
      let eventDetail = {
          data: {
              id: this.id
          },
          name: "entity-lov-confirm-button-tap"
      }

      this.fireBedrockEvent("entity-lov-confirm-button-tap", eventDetail);
  }

  _onLovCloseButtonTapped(event) {
      let eventDetail = {
          data: {
              id: this.id
          },
          name: "entity-lov-close-button-tap"
      }

      this.fireBedrockEvent("entity-lov-close-button-tap", eventDetail);
  }
  /**
  * <b><i>Content development is under progress... </b></i> 
  */
  refershTemplate() {
      this.shadowRoot.querySelector("#entityLov").refereshTemplate();
  }
  _showImage() {
      return (this.imageField || this.imageIdField);
  }

  _setLovTitleField(resolve, reject) {
      let typesCriterion = [];
      if (DataHelper.isValidObjectPath(this.requestData, "params.query.filters.typesCriterion")) {
          typesCriterion = this.requestData.params.query.filters.typesCriterion;
      }

      let _onRefModelsReceived = function (e) {
          let responseContent = DataHelper.validateAndGetResponseContent(e.detail.response);
          let externalNameAttributeName;

          if (responseContent && !_.isEmpty(responseContent.entityModels)) {
              let responseData = responseContent.entityModels[0];
              externalNameAttributeName = DataHelper.getExternalNameAttributeFromModel(responseData);
          }

          this._titlePattern = externalNameAttributeName ? "{entity.attributes." + externalNameAttributeName + "}" : "";

          if (resolve) {
              resolve();
          }
      }

      let _onRefModelsGetFailed = function (e) {
          this.logWarning("ReferenceManageModelGetFail", e);
          if (reject) {
              reject();
          }
      }

      if (!DataHelper.isEmptyObject(typesCriterion)) {
          let req = DataRequestHelper.createGetManageModelRequest(typesCriterion);
          this.set("_getRefModelsRequest", req);

          let refModelsGetLiquid = this.shadowRoot.querySelector("[id=getReferenceModels]");
          if (refModelsGetLiquid) {
              refModelsGetLiquid.addEventListener("response", _onRefModelsReceived.bind(this));
              refModelsGetLiquid.addEventListener("error", _onRefModelsGetFailed.bind(this));
              refModelsGetLiquid.generateRequest();
          }
      } else {
          if (reject) {
              reject("ReferenceManageModelGetFail - TypesCriterion not available for request.");
          }
      }
  }

  _onLovItemFavouriteIconTapped(e) {
      let eventDetail = {
          id: this.id,
          data: e.detail
      }
      this.fireBedrockEvent("entity-lov-favourite-icon-tapped", eventDetail);
  }

  updateFavouriteItems(favouriteContexts, sortField) {
      let LOV = this.shadowRoot.querySelector('#entityLov');
      if(LOV) {
          let items = LOV.items;
          if (!_.isEmpty(items)) {
              items.forEach(function (item) {
                  if (favouriteContexts.find(ctx => ctx[item.type] === item.title)) {
                      item.isFavourite = true;
                  } else {
                      delete item.isFavourite;
                  }
              }, this);

              DataHelper.sort(items, sortField);
              LOV.items = [];
              LOV.items = items;
          }
      }
  }
}
customElements.define(RockEntityLov.is, RockEntityLov)
