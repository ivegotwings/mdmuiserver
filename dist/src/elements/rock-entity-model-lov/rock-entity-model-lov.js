/**
`rock-entity-model-lov` Represents a component that renders the list of values control for the entity models.
It filters data as per filter criteria.

@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-helpers/data-transform-helper.js';
import '../bedrock-lov-behavior/bedrock-lov-behavior.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../pebble-lov/pebble-lov.js';
import './entity-model-lov-datasource.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockEntityModelLov
extends mixinBehaviors([
RUFBehaviors.UIBehavior,
RUFBehaviors.LovBehavior
], OptionalMutableData(PolymerElement)) {
  static get template() {
    return Polymer.html`
        <style>
        :host{
            display:block;
            height:100%;
        }
        </style>
        <entity-model-lov-datasource id="entityModelLovDataSource" request="[[requestData]]" r-data-source="{{rDataSource}}" r-data-formatter="{{_dataFormatter}}" keywords-criterion-builder="{{_keywordsCriterionBuilder}}">
        </entity-model-lov-datasource>
        <pebble-lov id="entityModelLov" readonly="[[readonly]]" page-size="[[pageSize]]" multi-select="[[multiSelect]]" show-image="[[showImage]]" show-color="[[showColor]]" no-sub-title="[[noSubTitle]]" show-action-buttons="[[showActionButtons]]" r-data-source="{{rDataSource}}" items="[[items]]" selected-item="{{selectedItem}}" selected-items="{{selectedItems}}" on-selection-changed="_onLovSelectionChanged" on-lov-confirm-button-tap="_onLovConfirmButtonTapped" on-lov-close-button-tap="_onLovCloseButtonTapped" no-popover="[[noPopover]]" deleted-items-count="{{deletedItemsCount}}">
        </pebble-lov>
`;
  }

  static get is() {
      return 'rock-entity-model-lov';
  }
  static get observers() {
      return [
      '_prepareAttributes(idField, titlePattern, subTitlePattern, imageField, colorField, valueField, typeField)'
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
          configDataItemId: {
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
          rDataSource: {
              type: Object,
              value: function () {
                  return {}
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
          _lovColumnNameValueCollection: {
              type: Object,
              value: function () {
                  return {};
              }
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
              value: function () {
                  return [];
              }
          },
          externalDataFormatter: {
              type: Object,
              value: function() {
                  return {};
              }
          },
          noPopover: {
              type: Boolean,
              value: false
          },
          deletedItemsCount: {
              type: Number,
              value: 0,
              notify: true
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
      // Note: This file contains lot of duplicate code..... Confirm with Jimmy and Prepare Rock Lov Behavior which inherits Base Lov Behavior
      super.ready();
      this._prepareAttributeMaps();
      this._keywordsCriterionBuilder = this._prepareKeywordsCriteria.bind(this);
      this._dataFormatter = this._getAttributeFormattedData.bind(this);

      // Todo..  Id may not be available every time
      this.logInfo("AttributeModelReady", "id", this.idField, "requestData", this.requestData);
  }
  _prepareAttributes(idField, titlePattern, subTitlePattern, imageField, colorField,
      valueField) {
      let defaultAttributes = this._attributes;
      this._attributes = [];
      let attributes = [];

      if (typeof (this.idField) !== 'undefined' && this.idField !== "") {
          attributes.push(this.idField);
      }

      if (typeof (this.titlePattern) !== 'undefined' && this.titlePattern !== "") {
          if (!attributes.includes(this.titlePattern)) {
              let titleFields = DataHelper.getAttributesBetweenCurlies(this.titlePattern);
              if (titleFields && titleFields instanceof Array) {
                  attributes.push(...titleFields);
                  this._isAttributeFilter = true;
              }
          }
      }

      if (typeof (this.subTitlePattern) !== 'undefined' && this.subTitlePattern !== "") {
          if (!attributes.includes(this.subTitlePattern)) {
              attributes.push(this.subTitlePattern);
          }
      }

      if (typeof (this.imageField) !== 'undefined' && this.imageField !== "") {
          if (!attributes.includes(this.imageField)) {
              attributes.push(this.imageField);
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
          if (typeof (this.requestData.params.fields) === "undefined") {
              this.set('requestData.params.fields', {});
          }
          this.set('requestData.params.fields.attributes', attributes);
      }
  }

  _prepareAttributeMaps() {
      this._lovColumnNameValueCollection.id = this.idField;
      this._lovColumnNameValueCollection.title = this.titlePattern;
      this._lovColumnNameValueCollection.subtitle = this.subTitlePattern;
      this._lovColumnNameValueCollection.image = this.imageField;
      this._lovColumnNameValueCollection.color = this.colorField;
      this._lovColumnNameValueCollection.value = this.valueField;
      this._lovColumnNameValueCollection.type = this.typeField;
  }

  _getAttributeFormattedData(data) {
      if (data && data.content.entityModels) {
          let entityModels = data.content.entityModels;
          if (entityModels) {
              entityModels = DataTransformHelper.transformEntityModelSchemaToLovSchema(entityModels, this._lovColumnNameValueCollection);             
              if (this.externalDataFormatter && typeof this.externalDataFormatter == "function") {
                  entityModels = this.externalDataFormatter(entityModels, data.content.entityModels);
              }
          }
          return entityModels;
      }
  }

  _prepareAttributesCriteria(searchText) {
      if (searchText) {
          let attributesCriterion = [];
          let searchKey = new Object();
          let searchValue = new Object();
          searchValue.eq = searchText ? searchText : '';

          // Todo.. When Pattern comes into picture this one is effected
          searchKey[this.titlePattern] = searchValue;
          attributesCriterion.push(searchKey);
          return attributesCriterion;
      }
  }

  _prepareKeywordsCriteria(searchText) {
      if (searchText) {
          let keywordsCriterion = {};

          keywordsCriterion.keywords = "*"+searchText+"*";
          keywordsCriterion.operator = "AND";

          return keywordsCriterion;
      }
  }

  _onLovSelectionChanged(event) {
      let eventDetail = {
          data: event.detail.item
      }

      this.fireBedrockEvent("entity-model-lov-selection-changed", eventDetail);
  }

  _onLovConfirmButtonTapped(event) {
      let eventDetail = {
          data: {
              id: this.id
          },
          name: "entity-model-lov-confirm-button-tap"
      }

      this.fireBedrockEvent("entity-model-lov-confirm-button-tap", eventDetail);
  }

  _onLovCloseButtonTapped(event) {
      let eventDetail = {
          data: {
              id: this.id
          },
          name: "entity-model-lov-close-button-tap"
      }

      this.fireBedrockEvent("entity-model-lov-close-button-tap", eventDetail);
  }
  /**
    * <b><i>Content development is under progress... </b></i> 
    */
  refershTemplate() {
      this.shadowRoot.querySelector("#entityModelLov").refereshTemplate();
  }
  reset() {
      this.shadowRoot.querySelector('#entityModelLov').reset();
  }
}
customElements.define(RockEntityModelLov.is, RockEntityModelLov)
