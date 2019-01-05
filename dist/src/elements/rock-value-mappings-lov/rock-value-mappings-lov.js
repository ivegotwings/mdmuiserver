/**
`<rock-value-mappings-lov> Represents a component that renders the attributes from manage models. 
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-lov-behavior/bedrock-lov-behavior.js';
import '../liquid-entity-model-get/liquid-entity-model-get.js';
import './value-mappings-model-datasource.js';
import '../pebble-lov/pebble-lov.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockValueMappingsLov extends mixinBehaviors([RUFBehaviors.UIBehavior, RUFBehaviors.LovBehavior],
    PolymerElement) {
  static get template() {
    return Polymer.html`
        <value-mappings-model-datasource id="entityModelDataSource" request="[[requestData]]" r-data-source="{{rDataSource}}" r-data-formatter="{{_dataFormatter}}" keywords-criterion-builder="{{_keywordsCriterionBuilder}}" schema="lov">
        </value-mappings-model-datasource>

        <pebble-lov id="valueMappingsLov" select-all="[[selectAll]]" page-size="[[pageSize]]" multi-select="{{multiSelect}}" show-image="[[showImage]]" show-color="[[showColor]]" no-sub-title="" show-action-buttons="[[showActionButtons]]" r-data-source="{{rDataSource}}" items="[[items]]" selected-item="{{selectedItem}}" selected-items="{{selectedItems}}" on-selection-changed="_onSelectedItemChange" on-lov-confirm-button-tap="_onLovConfirmButtonTapped" on-lov-close-button-tap="_onLovCloseButtonTapped">
        </pebble-lov>
`;
  }

  static get is() {
      return "rock-value-mappings-lov";
  }
  static get properties() {
      return {
          /**
           * <b><i>Content development is under progress... </b></i> 
          */
          selectedItems: {
              type: Array,
              value: function () {
                  return [];
              },
          },
          /**
           * <b><i>Content development is under progress... </b></i> 
          */
          selectedItem: {
              type: Object,
              value: function () {
                  return {}
              }
          },
          rDataSource: {
              type: Object,
              value: function () {
                  return {}
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
          /**
           * <b><i>Content development is under progress... </b></i> 
          */
          domain: {
              type: String,
              value: null,
              observer: "_domainsChanged"
          },
          /**
           * <b><i>Content development is under progress... </b></i> 
          */
          multiSelect: {
              type: Boolean,
              value: true
          },

          /**
           * <b><i>Content development is under progress... </b></i> 
          */
          allowedEntityTypes: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          _dataFormatter: {
              notify: true,
              value: function () {
                  return this._getValueMappingsFormattedData.bind(this);
              }
          },
          _keywordsCriterionBuilder: {
              notify: true,
              value: function () {
                  return this._prepareKeywordsCriteria.bind(this);
              }
          },
          selectAll: {
              type: Boolean,
              value: false
          },
          pageSize: {
              type: Number,
              value: 30
          },
          showActionButtons: {
              type: Boolean,
              value: false
          }
      }
  }
  _domainsChanged() {
      this._getEntityManageModels();
      this.resetData();
  }
  /**
    * <b><i>Content development is under progress... </b></i> 
    */
  resetData() {
      let lov = this.shadowRoot.querySelector("#valueMappingsLov");
      if (lov) {
          lov.reset();
      }
  }

  _onError() {
      this.items = [];
  }
  _onSelectedItemChange(e) {
      this.set("selectedItem", e.detail.item);
      if (!_.isEmpty(this.selectedItem)) {
          let eventDetail = {
              data: this.selectedItem
          };
          this.fireBedrockEvent("value-mappings-selection-changed", eventDetail);
      }
  }
  _getEntityManageModels() {
      let contextData = {};
      let itemContext = {
          "type": "entityManageModel"
      };

      //Prepare ids
      let ids = [];
      //if(this.domain) {
      //domain specific entity types
      //} else {
      let entityTypes = this.appSetting('dataDefaults').entityTypes;
      for(let key in entityTypes) {
          for (let i = 0; i < entityTypes[key].length; i++) {
              ids.push(entityTypes[key][i] + "_entityManageModel");
          }
      }
      //}

      contextData[ContextHelper.CONTEXT_TYPE_ITEM] = [itemContext];

      contextData[ContextHelper.CONTEXT_TYPE_VALUE] = [];
      contextData[ContextHelper.CONTEXT_TYPE_DATA] = [];
      let req = DataRequestHelper.createEntityGetRequest(contextData);
      delete req.params.options.maxRecords;
      //Add ids
      req.params.query.ids = ids;
      //Model attributes
      req.params.fields = {
          "attributes": ["_ALL"]
      }

      // req.params.sort = {
      //     "properties": [{
      //         "externalName": "_ASC",
      //         "sortType": "_STRING"
      //     }]
      // };

      this.set('requestData', req);
  }

  //Here LOV shows the item based on entityManageModel attribute properties
  _getValueMappingsFormattedData(data) {
      let entityModels = data.content.entityModels;
      let filteredEntityTypes = [];
      if (entityModels && entityModels.length) {
          for (let i = 0; i < entityModels.length; i++) {
              let entityModel = entityModels[i];
              if (entityModel.data && !_.isEmpty(entityModel.data.attributes)) {
                  let modelAttributes = entityModel.data.attributes;
                  for (let key in modelAttributes) {
                      let attribute = modelAttributes[key];
                      if (attribute && attribute.properties && attribute.properties.supportsValueMapping) {
                          let typeName = attribute.properties.valueMappingTypeName;
                          if (this._isSearchFound(typeName) && !this._isItemPresent(filteredEntityTypes, typeName)) {
                              filteredEntityTypes.push({
                                  "title": typeName,
                                  "id": typeName
                              });
                          }
                      }
                  }
              }
          }
      }

      return filteredEntityTypes;
  }

  _isItemPresent(items, id) {
      let presentItem = items.find(function (item) {
          return item.id == id;
      });
      return !!presentItem;
  }

  _isSearchFound(typeName) {
      if (!this._searchText) {
          return true;
      }

      if (typeName.indexOf(this._searchText) == -1) {
          return false;
      }

      return true;
  }

  //Keyword search won't work on attribute properties, 
  //so explicitly do the filter while formatting
  _prepareKeywordsCriteria(searchText) {
      this._searchText = "";
      if (searchText) {
          this._searchText = searchText.trim().toLowerCase();
      }

      // if (searchText) {
      //     var keywordsCriterion = {};

      //     keywordsCriterion.keywords = "*" + searchText + "*";
      //     keywordsCriterion.operator = "_AND";
      //     return keywordsCriterion;
      // }
  }
  _onLovConfirmButtonTapped(event) {
      let eventDetail = { name: "value-mappings-model-lov-confirm-button-tap" }
      if (this.selectedItems.length > 0) {
          eventDetail["data"] = this.selectedItems;
      }
      /*else{
            var lov = this.shadowRoot.querySelector("#valueMappingsLov");
             eventDetail["data"] = lov.items;
       }*/
      this.fireBedrockEvent(eventDetail.name, eventDetail);
  }
  _onLovCloseButtonTapped(event) {
      let eventDetail = {
          data: this.id,
          name: "value-mappings-model-lov-close-button-tap"
      }
      this.fireBedrockEvent(eventDetail.name, eventDetail);
  }
}
customElements.define(RockValueMappingsLov.is, RockValueMappingsLov);
