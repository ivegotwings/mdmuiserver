/**
`rock-entity-combo-box` Represents a component that renders the entities in a combo-box control.

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
import '../liquid-entity-model-get/liquid-entity-model-get.js';
import '../pebble-combo-box/pebble-combo-box.js';
import '../rock-entity-lov/entity-lov-datasource.js';
import '../rock-image-source-provider/rock-image-source-provider.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockEntityComboBox extends mixinBehaviors([RUFBehaviors.UIBehavior, RUFBehaviors.LovBehavior], OptionalMutableData(PolymerElement)) {
  static get template() {
    return html`
        <liquid-entity-model-get id="getReferenceModels" operation="getbyids" request-data="[[_getRefModelsRequest]]" on-response="_onRefModelsReceived" on-error="_onRefModelsGetFailed"></liquid-entity-model-get>
        <entity-lov-datasource id="entityLovDataSource" apply-locale-coalesce="[[applyLocaleCoalesce]]" base-request="[[requestData]]" r-data-source="{{rDataSource}}" domain="[[_domain]]" r-data-formatter="{{_dataFormatter}}" attributes-criterion-builder="{{_attributesCriterionBuilder}}" keywords-criterion-builder="{{_keywordsCriterionBuilder}}" sort-criterion-builder="{{_sortCriterionBuilder}}">
        </entity-lov-datasource>
        <rock-image-source-provider image-source="{{imageSource}}"></rock-image-source-provider>
        <pebble-combo-box id="comboBox" label="[[label]]" page-size="[[pageSize]]" multi-select="[[multiSelect]]" show-image="[[_showImage(imageField,imageIdField)]]" show-color="[[showColor]]" no-sub-title="[[noSubTitle]]" no-popover="[[noPopover]]" show-action-buttons="[[showActionButtons]]" is-readonly="[[isReadonly]]" r-data-source="{{rDataSource}}" image-source="{{imageSource}}" selected-values-color="[[selectedValuesColor]]" selected-values-font-style="[[selectedValuesFontStyle]]" selected-values-locale="{{selectedValuesLocale}}" selected-ids="{{selectedIds}}" selected-id="{{selectedId}}" selected-values="{{selectedValues}}" no-label-float="[[noLabelFloat]]" description-object="[[descriptionObject]]" selected-value="{{selectedValue}}" tabindex\$="[[_getTabIndex(_tabIndex)]]" on-focus="_onFocusCombo" on-blur="_onBlurCombo" on-tap="_onFocusCombo">
        </pebble-combo-box>
`;
  }

  static get is() {
      return "rock-entity-combo-box";
  }
  static get properties() {
      return {
          /**
           * <b><i>Content development is under progress... </b></i> 
           */
          requestData: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          /**
           * <b><i>Content development is under progress... </b></i> 
           */
          contextData: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          /**
           * Specifies whether or not to generate the console logs.
           */
          verbose: {
              type: Boolean,
              value: false
          },
          /*
          * Indicates an identifier for the item.
          */
          idField: {
              type: String,
              value: ""
          },
          imageIdField: {
              type: String,
              value: ""
          },
          rDataSource: {
              type: Function
          },
          /*
          * Indicates the title for the item.
          */
          titlePattern: {
              type: String,
              value: ""
          },
          /*
          * Indicates sub-title for the item.
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

          selectedValues: {
              type: Array,
              value: function () {
                  return [];
              },
              notify: true
          },

          selectedValue: {
              type: String,
              value: "",
              notify: true
          },

          /**
           * Specifies whether or not the control is "read-only".
           */
          isReadonly: {
              type: Boolean,
              value: false
          },

          _lovColumnMap: {
              type: Object,
              value: function () {
                  return {
                      "id": "",
                      "title": "",
                      "subtitle": "",
                      "image": "",
                      "color": "",
                      "value": "",
                      "type": [],
                  };
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
          /*
          * Indicates the attribute of an entity which will be used for sorting the items
          */
          _sortField: {
              type: String,
              value: ""
          },
          imageSource: {
              type: Object
          },

          pebbleComboBox: {
              type: Object
          },
          pebbleCollectionContainer: {
              type: Object
          },
          _comboBox: {
              type: Object
          },
          _collectionContainer: {
              type: Object
          },

          /**
           * Indicates whether to disable the floating label or not.
           * Set the value as <b>true</b> to disable the floating label.
           */
          noLabelFloat: {
              type: Boolean,
              value: false
          },

          /**
           * Description object should contain non-empty
           * description field (type type: Array or String)
           */
          descriptionObject: {
              type: Object,
              notify: true,
              value: function () {
                  return {};
              }
          },
          applyLocaleCoalesce: {
              type: Boolean,
              value: false
          },
          applyLocaleCoalescedStyle: {
              type: Boolean,
              value: false
          },
          applyContextCoalescedStyle: {
              type: Boolean,
              value: false
          },
          selectedValuesColor: {
              type: String,
              value: ""
          },
          selectedValuesFontStyle: {
              type: String,
              value: ""
          },
          selectedValuesLocale: {
              type: Array,
              value: function () {
                  return [];
              },
              notify: true
          },
          _getRefModelsRequest: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _domain: {
              type: String,
              value: ""
          },
          noPopover: {
              type: Boolean,
              value: false
          },
          mode: {
              type: String,
              value: "view",
              notify: true
          },
          _tabIndex: {
              type: Number,
              value: 0,
              notify: true
          },
          hasWritePermission: {
              type: Boolean,
              value: true
          }
      }
  }
  static get observers() {
      return [
          '_prepareAttributes(idField,imageIdField, titlePattern, subTitlePattern, imageField, colorField, valueField, typeField, requestData)'
      ]
  }

  /**
   * <b><i>Content development is under progress... </b></i> 
   */
  selectedValueChanged() {
      // we cannot reset the selectedid in any case. Re-setting id means updating attribute object data which causes unnecessary observer calls
      // and update parent attribute control changed mode. Even though attribute not updated by user, it still reflects as changed control.
      let selectedId = this.selectedId;
      this.set("selectedId", "");
      this.selectedId = selectedId;
  }
  ready() {
      super.ready();
      this._keywordsCriterionBuilder = this._prepareKeywordsCriteria.bind(this);
      this._attributesCriterionBuilder = this._prepareAttributesCriteria.bind(this);
      this._sortCriterionBuilder = this._preparesortCriterionBuilder.bind(this);
      this._dataFormatter = this._getAttributeFormattedData.bind(this);
      this._domain = this.contextData && this.contextData[ContextHelper.CONTEXT_TYPE_DOMAIN] ? this.contextData[ContextHelper.CONTEXT_TYPE_DOMAIN][0].domain : undefined;
  }

  get pebbleComboBox() {
      this._comboBox = this._comboBox || this.shadowRoot.querySelector("pebble-combo-box");
      return this._comboBox;
  }

  get pebbleCollectionContainer() {
      let container = undefined;

      if (this.pebbleComboBox) {
          this._collectionContainer = this._collectionContainer || this.pebbleComboBox.shadowRoot.querySelector('#collectionContainer');
          container = this._collectionContainer;
      }

      return container;
  }

  _prepareAttributes(idField, imageIdField, titlePattern, subTitlePattern, imageField, colorField, valueField, requestData) {
      let defaultAttributes = this._attributes;
      this._attributes = [];
      let attributes = []; // Attributes which will be part of Request Object

      if (typeof (this.idField) !== 'undefined' && this.idField !== "") {
          let idField = DataHelper.readAttributeFromPath(this.idField);
          attributes.push(idField);
          this._lovColumnMap.id = this.idField;
      }
      if (typeof (this.imageIdField) !== 'undefined' && this.imageIdField !== "") {
          if (!attributes.includes(this.imageIdField)) {
              let imageIdField = DataHelper.readAttributeFromPath(this.imageIdField);
              attributes.push(imageIdField);
          }
          this._lovColumnMap.imageId = this.imageIdField;
      }

      if (typeof (this.titlePattern) !== 'undefined' && this.titlePattern !== "") {
          if (!attributes.includes(this.titlePattern)) {
              let titleFields = DataHelper.getAttributesBetweenCurlies(this.titlePattern);
              if (titleFields && titleFields instanceof Array) {
                  attributes.push(...titleFields);
                  this._lovColumnMap.title = this.titlePattern;
                  this._sortField = titleFields.length > 0 ? titleFields[0] : "";
              }
          }
      }

      if (typeof (this.subTitlePattern) !== 'undefined' && this.subTitlePattern !== "") {
          if (!attributes.includes(this.subTitlePattern)) {
              let subtitleFields = DataHelper.getAttributesBetweenCurlies(this.subTitlePattern);
              if (subtitleFields && subtitleFields instanceof Array) {
                  attributes.push(...subtitleFields);
                  this._lovColumnMap.subtitle = this.subTitlePattern;
              }
          }
      }

      if (typeof (this.imageField) !== 'undefined' && this.imageField !== "") {
          if (!attributes.includes(this.imageField)) {
              let imageField = DataHelper.readAttributeFromPath(this.imageField);
              attributes.push(imageField);
          }
          this._lovColumnMap.image = this.imageField;
      }

      if (typeof (this.colorField) !== 'undefined' && this.colorField !== "") {
          if (!attributes.includes(this.colorField)) {
              let colorField = DataHelper.readAttributeFromPath(this.colorField);
              attributes.push(colorField);
          }
          this._lovColumnMap.color = this.colorField;

      }

      if (typeof (this.valueField) !== 'undefined' && this.valueField !== "") {
          if (!attributes.includes(this.valueField)) {
              let valueField = DataHelper.readAttributeFromPath(this.valueField);
              attributes.push(valueField);
          }
          this._lovColumnMap.value = this.valueField;
          if (this.applyLocaleCoalescedStyle) {
              this._lovColumnMap.textColor = this._lovColumnMap.locale = this.valueField;
          }

          if (this.applyContextCoalescedStyle) {
              this._lovColumnMap.fontStyle = this.valueField;
          }
      }

      if (attributes.length == 0) {
          this._attributes = defaultAttributes;
      } else {
          this._attributes = attributes;
      }

      if (this._lovColumnMap.title && this._lovColumnMap.title !== "") {
          this._attributes.push(this._lovColumnMap.title);
          this._prepareRequest();
      }
  }

  _onFocusCombo(e) {
      // adding mode here to check before opening popover. Even though attribute mode is view, because of the focus
      // popover is getting opened on load/click.
      if (this.mode === "edit" && this.hasWritePermission) {
          if (_.isEmpty(this._lovColumnMap.title)) {
              this._setLovTitleField();
          } else {
              if (this.pebbleCollectionContainer) {
                  this.pebbleCollectionContainer.openPopover();
              }
          }

          e.stopPropagation();
      }

      this._tabIndex = -1;
  }
  _onBlurCombo(e) {
      this._tabIndex = 0;
  }
  _getTabIndex() {
      return this._tabIndex;
  }
  _setLovTitleField() {
      let typesCriterion = [];
      if (this.requestData && this.requestData.params && this.requestData.params.query && this.requestData.params.query.filters) {
          typesCriterion = this.requestData.params.query.filters.typesCriterion;
      }

      if (!DataHelper.isEmptyObject(typesCriterion)) {
          let req = DataRequestHelper.createGetManageModelRequest(typesCriterion);

          this.set("_getRefModelsRequest", req);

          let refModelsGetLiquid = this.shadowRoot.querySelector("[id=getReferenceModels]");
          if (refModelsGetLiquid) {
              refModelsGetLiquid.generateRequest();
          }
      }
  }

  _onRefModelsReceived(e, detail) {
      let referenceModels = {};
      let responseContent = DataHelper.validateAndGetResponseContent(detail.response);
      let externalNameAttributeName;

      if (responseContent && !_.isEmpty(responseContent.entityModels)) {
          let responseData = responseContent.entityModels[0];
          externalNameAttributeName = DataHelper.getExternalNameAttributeFromModel(responseData);

          if (externalNameAttributeName) {
              this._lovColumnMap.title = this._lovColumnMap.value = this.titlePattern = this.valueField = externalNameAttributeName;

              this._attributes.push(externalNameAttributeName);

              //data type of isExternal attribute
              let attributeData = responseData.data.attributes[externalNameAttributeName];
              if (DataHelper.isValidObjectPath(attributeData, "properties.dataType")) {
                  this.titlePatternDataType = attributeData.properties.dataType.toUpperCase();
              }
          }
      }

      if (!externalNameAttributeName) {
          this._lovColumnMap.title = this._lovColumnMap.value = this.titlePattern = this.valueField = "{entity.name}";
      }

      if (this.applyLocaleCoalescedStyle) {
          this._lovColumnMap.textColor = this.valueField;
      }

      if (this.applyContextCoalescedStyle) {
          this._lovColumnMap.fontStyle = this.valueField;
      }
      this._prepareRequest();

      if (this.pebbleCollectionContainer) {
          this.pebbleCollectionContainer.openPopover();
      }
  }

  _onRefModelsGetFailed(e) {
      this.logWarning("ReferenceManageModelGetFail", e);
  }

  _prepareRequest() {
      if (!this.requestData || !this.requestData.params) {
          return;
      }
      // Todo.. This will not work in a scenario where request object is not initialized

      if (typeof (this.requestData.params.fields) === "undefined") {
          this.set('requestData.params.fields', {});
      }
      this.set('requestData.params.fields.attributes', this._attributes);

      if (!DataHelper.isEmptyObject(this._sortField) && this._sortField !== "name") {
          let sortAttributes = [];

          let sortAttribute = {};
          sortAttribute[this._sortField] = "_ASC";
          sortAttribute["sortType"] = "_STRING"; // How to determine this?
          sortAttributes.push(sortAttribute);

          if (DataHelper.isEmptyObject(this.requestData.params.sort)) {
              this.set('requestData.params.sort', {});
          }

          let domain = this.contextData[ContextHelper.CONTEXT_TYPE_DOMAIN] ? this.contextData[ContextHelper.CONTEXT_TYPE_DOMAIN][0].domain : undefined;

          if (domain && domain == "baseModel") {
              this.set('requestData.params.sort.properties', sortAttributes)
          } else {
              this.set('requestData.params.sort.attributes', sortAttributes);
          }
      }
  }
  _getAttributeFormattedData(data) {
      let entities = [];
      if (data && data.content) {
          entities = data.content.entities;
          if (entities) {
              entities = DataTransformHelper.transformReferenceEntitySchemaToLovSchema(entities, this._lovColumnMap, this.contextData);
          }
      }
      return entities;
  }

  _prepareAttributesCriteria(searchText,criterionKey) {
    return DataRequestHelper.createFilterCriteria(criterionKey,searchText, this.titlePattern, this.subTitlePattern);
  }

  _prepareKeywordsCriteria(searchText) {
      if (searchText) {
          let keywordsCriterion = {};

          keywordsCriterion.keywords = searchText;
          keywordsCriterion.operator = "_OR";

          return keywordsCriterion;
      }
  }

  _preparesortCriterionBuilder(sortData) {
      let domain = this.contextData[ContextHelper.CONTEXT_TYPE_DOMAIN] ? this.contextData[ContextHelper.CONTEXT_TYPE_DOMAIN][0].domain : undefined;
      if (!sortData) {
          let sortAttributes = [];
          let sortAttribute = {};
          sortAttribute[this.titlePattern] = "_ASC";
          sortAttribute["sortType"] = (this.titlePatternDataType) ? "_" + this.titlePatternDataType : "_STRING";
          sortAttributes.push(sortAttribute);

          let sortCriterion;
          if (domain && domain == "baseModel") {
              sortCriterion = {
                  "properties": sortAttributes
              };
          } else {
              sortCriterion = {
                  "attributes": sortAttributes
              };
          }
          return sortCriterion;
      }
  }

  /**
   * <b><i>Content development is under progress... </b></i> 
   */
  refreshData() {
      this.shadowRoot.querySelector('pebble-combo-box').refreshData();
  }
  clear() {
      this.shadowRoot.querySelector('pebble-combo-box').clear();
  }
  _showImage() {
      return (this.imageField || this.imageIdField);
  }
}
customElements.define(RockEntityComboBox.is, RockEntityComboBox);
