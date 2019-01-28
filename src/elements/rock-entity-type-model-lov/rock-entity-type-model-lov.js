/**
`<rock-entity-type-model-lov> Represents a component that renders the model entities in the entity type. 
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '../bedrock-app-context-behavior/bedrock-app-context-behavior.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-helpers/element-helper.js';
import '../bedrock-lov-behavior/bedrock-lov-behavior.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../liquid-entity-model-get/liquid-entity-model-get.js';
import '../rock-grid-data-sources/attribute-model-datasource.js';
import '../pebble-lov/pebble-lov.js';
import './entity-type-model-datasource.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockEntityTypeModelLov extends mixinBehaviors([RUFBehaviors.UIBehavior, 
RUFBehaviors.LovBehavior], PolymerElement) {
  static get template() {
    return html`
        <attribute-model-datasource id="entityModelDataSource" is-request-by-id="[[isRequestById]]" mode="all" request="[[requestData]]" r-data-source="{{rDataSource}}" r-data-formatter="{{_dataFormatter}}" filter-criterion-builder="{{_filterCriterionBuilder}}" schema="lov" sort-criterion-builder="{{_sortCriterionBuilder}}">
        </attribute-model-datasource>

        <pebble-lov id="entityTypeModelLov" select-all="[[selectAll]]" page-size="[[pageSize]]" multi-select="{{multiSelect}}" show-image="[[showImage]]" show-color="[[showColor]]" no-sub-title="" show-action-buttons="[[showActionButtons]]" r-data-source="{{rDataSource}}" items="[[items]]" selected-item="{{selectedItem}}" selected-items="{{selectedItems}}" on-selection-changed="_onSelectedItemChange" on-lov-confirm-button-tap="_onLovConfirmButtonTapped" on-lov-close-button-tap="_onLovCloseButtonTapped">
        </pebble-lov>
`;
  }

  static get is() {
      return "rock-entity-type-model-lov";
  }

  static get properties() {
      return {
          selectedItems: {
              type: Array,
              value: function () {
                  return [];
              },
          },

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

          requestData: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          domain: {
              type: String
          },

          multiSelect: {
              type: Boolean,
              value: false,
              computed: '_getMultiSelect(settings)'
          },

          allowedEntityTypes: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          _dataFormatter: {
              notify: true,
              value: function () {
                  return this._getEntityTypeFormattedData.bind(this);
              }
          },

          selectAll: {
              type: Boolean,
              value: false
          },

          pageSize: {
              type: Number,
              value: 100
          },

          sortField: {
              type: String,
              value: ""
          },
          _filterCriterionBuilder: {
            notify: true,
            value: function () {
                return this._prepareFilterCriterionBuilder.bind(this);
            }
        },
        titlePattern: {
            type: String,
            value: ""
        },

        _sortCriterionBuilder: {
            type: Object,
            value: function () {
                return this._getSortCriterion.bind(this);
            }
        },

          settings: {
              type: Object
          },
          isRequestById: {
              type: Boolean,
              value: false
          }
      };
  }

  constructor() {
      super();
  }

  connectedCallback() {
      super.connectedCallback();
      this._getEntityTypeModels();
      this.resetData();
  }

  disconnectedCallback() {
      super.disconnectedCallback();
  }

  resetData() {
      let lov = this.shadowRoot.querySelector("#entityTypeModelLov");
      if (lov) {
          lov.reset();
      }
  }

  _onInitResponse() {
      this.shadowRoot.querySelector('#getEntitiesSearchResults').generateRequest();
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
          //PUBSUB is handled only in reference discovery
          this.fireBedrockEvent("entity-type-selection-changed", eventDetail);
      }
  }

  _prepareFilterCriterionBuilder (searchText) {                   
        let filterCri = DataRequestHelper.createFilterCriteria("propertiesCriterion",searchText, this.titlePattern)
        return filterCri;
    }

  _getSortCriterion() {
      if (this.sortField) {
          let sortObj = { "sortType": "_STRING" }
          sortObj[this.sortField] = "_ASC";
          return {
              "properties": [sortObj]
          }
      }
      return undefined;
  }

  _getEntityTypeModels() {
      let contextData = {};
      let itemContext = {
          "type": "entityType"
      };

      if (this.domain) {
          itemContext.domain = this.domain;
      }
      contextData[ContextHelper.CONTEXT_TYPE_ITEM] = [itemContext];

      contextData[ContextHelper.CONTEXT_TYPE_VALUE] = [];
      contextData[ContextHelper.CONTEXT_TYPE_DATA] = [];
      let req = DataRequestHelper.createEntityGetRequest(contextData);
      delete req.params.options.maxRecords;
      req.params.sort = {
          "properties": [{
              "externalName": "_ASC",
              "sortType": "_STRING"
          }]
      };
      if (req.params.fields.attributes && req.params.fields.attributes.length > 0) {
          req.params.fields.attributes.push("externalName")
      } else {
          req.params.fields.attributes = ["externalName"];
      }
      if(this.domain && this.domain === "generic" && this.allowedEntityTypes && this.allowedEntityTypes.length){
          this.set("isRequestById", true);
          req.params.query.ids = [];
          for(let entityType of this.allowedEntityTypes){
              req.params.query.ids.push(entityType + "_entityType")
          }
      }
      this.set('requestData', req);
  }

  _getEntityTypeFormattedData(data) {
      let entityModels = data.content.entityModels;
      if (_.isEmpty(entityModels)) {
          this.logError("rock-entity-type-model-lov - entity type models are empty", data);
      }
      let filteredEntityTypes = [];
      if (this.allowedEntityTypes && this.allowedEntityTypes.length) {
          for (let i = 0; i < entityModels.length; i++) {
              let entityModel = entityModels[i];
              if (this._isEntityTypePresent(this.allowedEntityTypes, entityModel.name)) {
                  if (!this._isItemPresent(filteredEntityTypes, entityModel.name)) {
                      filteredEntityTypes.push({
                          "title": entityModel.properties && entityModel.properties.externalName ?
                              entityModel.properties.externalName : entityModel.name,
                          "id": entityModel.name
                      });
                  }
              }
          }
      } else {
          for (let i = 0; i < entityModels.length; i++) {
              let entityModel = entityModels[i];
              if (!this._isItemPresent(filteredEntityTypes, entityModel.name)) {
                  filteredEntityTypes.push({
                      "title": entityModel.properties && entityModel.properties.externalName ?
                          entityModel.properties.externalName : entityModel.name,
                      "id": entityModel.name
                  });
              }
          }
      }
      let typesCriterion = this.__dataHost._typesCriterion;
      if (_.isEmpty(typesCriterion) && _.isEmpty(this.selectedItem)) {
          let eventDetail = {
              detail: {
                  item: filteredEntityTypes[0]
              }
          };
          this._onSelectedItemChange(eventDetail);
      }
      return filteredEntityTypes;
  }

  _isItemPresent(items, id) {
      let presentItem = items.find(function (item) {
          return item.id == id;
      });
      return !!presentItem;
  }

  _isEntityTypePresent(items, id) {
      let presentItem = items.find(function (item) {
          return item == id;
      });
      return !!presentItem;
  }

  _onLovConfirmButtonTapped(event) {
      let eventDetail = { name: "entity-type-model-lov-confirm-button-tap" }
      if (this.multiSelect) {
          if (this.selectedItems.length > 0) {
              eventDetail["data"] = this.selectedItems;
          }
      }
      else {
          if (!_.isEmpty(this.selectedItem)) {
              eventDetail["data"] = this.selectedItem;
          }
      }
      /*else{
            var lov = this.shadowRoot.querySelector("#entityTypeModelLov");
             eventDetail["data"] = lov.items;
       }*/
      this.fireBedrockEvent(eventDetail.name, eventDetail);
  }

  _onLovCloseButtonTapped(event) {
      let eventDetail = {
          data: this.id,
          name: "entity-type-model-lov-close-button-tap"
      }
      this.fireBedrockEvent(eventDetail.name, eventDetail);
  }

  _getMultiSelect(settings) {
      if (settings) {
          if (!_.isEmpty(settings)) {
              return settings.multiSelect;
          }
          return true;
      }
  }
}

customElements.define(RockEntityTypeModelLov.is, RockEntityTypeModelLov);
