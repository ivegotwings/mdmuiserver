/**
`rock-context-lov` Represents a component that renders the context data in the list of values control.
@demo demo/index.html 
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-helpers/element-helper.js';
import '../bedrock-lov-behavior/bedrock-lov-behavior.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../liquid-rest/liquid-rest.js';
import '../pebble-lov/pebble-lov.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockContexLov extends mixinBehaviors([RUFBehaviors.UIBehavior,RUFBehaviors.LovBehavior], PolymerElement) {
  static get template() {
    return Polymer.html`
        <liquid-rest id="contextLiquid" auto="[[auto]]" method="POST" request-data="{{requestData}}" on-liquid-response="_onResponseReceived" exclude-in-progress="">
        </liquid-rest>
        <pebble-lov id="contextLov" readonly="[[readonly]]" page-size="[[pageSize]]" multi-select="[[multiSelect]]" show-image="[[showImage]]" show-color="[[showColor]]" no-sub-title="[[noSubTitle]]" show-action-buttons="[[showActionButtons]]" items="[[items]]" selected-item="{{selectedItem}}" selected-items="{{selectedItems}}" on-selection-changed="_onLovSelectionChanged" on-lov-confirm-button-tap="_onLovConfirmButtonTapped" on-lov-close-button-tap="_onLovCloseButtonTapped">
        </pebble-lov>
`;
  }

  static get is() {
      return "rock-context-lov";
  }
  static get properties() {
      return {
          /**
           * <b><i>Content development is under progress... </b></i> 
          */
          entityId: {
              type: String,
              value: ""
          },

          /**
           * If set as true , it indicates the component is in read only mode
           */
          readonly: {
              type: Boolean,
              value: false
          },
          /**
           * <b><i>Content development is under progress... </b></i> 
          */
          entityType: {
              type: String,
              value: ""
          },

          dataObjectType: {
              type: String,
              value: "data"
          },
          /**
           * <b><i>Content development is under progress... </b></i> 
          */
          selectedItemInfo: {
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
           * <b><i>Content development is under progress... </b></i> 
          */
          contextName: {
              type: String,
              value: ""
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
          showActionButtons: {
              type: Boolean,
              value: false
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
          items: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          externalDataFormatter: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          _preSelectedItems: {
              type: Array,
              value: function() {
                  return [];
              }
          },

          _preSelectedItemInfo: {
              type: Object,
              value: function() {
                  return {};
              }
          }
      }
  }

  static get observers() {
      return [
      '_prepareRequest(entityId,entityType,contextName)'
      ]
  }

  _prepareRequest(entityId, entityType, contextName) {
      if (entityId && entityType && contextName) {
          let req = {};
          if(_.isEmpty(entityId) && _.isEmpty(entityType) &&  !_.isEmpty(this.requestData)){
              req = this.requestData;
          }else{
              req = {
                  "params": {
                      "query": {
                          "filters": {
                              "typesCriterion": [
                                  entityType
                              ]
                          },
                          "id": entityId
                      }
                  }
              };
          }

          this.set('requestData', req);
          this.generateRequest();
          this._preSelectedItems = DataHelper.cloneObject(this.selectedItems);
          //this._preSelectedItemInfo = DataHelper.cloneObject(this.selectedItemInfo);
      }
  }
  reset() {
      this.resetLOV();
      this.generateRequest();
  }
  /**
    * <b><i>Content development is under progress... </b></i> 
    */
  generateRequest() {
      let liquidElement = this.shadowRoot.querySelector('#contextLiquid');

      if (liquidElement) {
          if (!_.isEmpty(this.dataObjectType) && this.dataObjectType.toLowerCase() == "entitymodel") {
              liquidElement.url = "/data/pass-through/entitymodelservice/getcontext";
          } else {
              liquidElement.url = "/data/pass-through/entityservice/getcontext";
          }
          liquidElement.generateRequest();
      }
  }
  /**
    * <b><i>Content development is under progress... </b></i> 
    */
  resetLOV() {
      this.shadowRoot.querySelector('#contextLov').items = [];
  }

  _onResponseReceived(e) {
      let items = [];
      if (e.detail && e.detail.response) {
          let res = e.detail.response.response;
          if (res) {
              let dataCollection = res.entities || res.entityModels;
              if (!_.isEmpty(dataCollection)) {
                  let selectedItems = !_.isEmpty(this._preSelectedItems) ? this._preSelectedItems : [];
                  //this.selectedItemInfo = !_.isEmpty(this._preSelectedItemInfo) ? this._preSelectedItemInfo : {};
                  let entity = dataCollection[0];
                  if(_.isEmpty(this.entityId) && _.isEmpty(this.entityType)){
                      dataCollection.forEach(element => {
                              items.push({ "id": element.name, "title": element.name, "type": element.type, "value": element.id });
                          });
                  }else if (entity && entity.data && !_.isEmpty(entity.data.contexts)) {
                      let contexts = entity.data.contexts;
                      for (let i in contexts) {
                          let context = contexts[i].context;
                          let item = context[this.contextName];
                          if (item) {
                              if (!this._isItemPresent(items, item)) {
                                  items.push({ "id": item, "title": item, "type": this.contextName });

                                  if (this.selectedItemInfo && !_.isEmpty(this.selectedItemInfo)) {
                                      let isMatch = true;
                                      for (let key in this.selectedItemInfo) {
                                          if (context[key] != this.selectedItemInfo[key]) {
                                              isMatch = false;
                                              break;
                                          }
                                      }
                                      if (isMatch) {
                                          selectedItems.push({ "id": item, "title": item, "type": this.contextName });
                                      }
                                  }
                              }
                          }
                      }
                  }

                  if (items && this.externalDataFormatter && typeof this.externalDataFormatter == "function") {
                      items = this.externalDataFormatter(items);
                  }

                  if (!_.isEmpty(items)) {
                      if (_.isEmpty(selectedItems)) {
                          selectedItems = this.selectedItems;
                      }

                      if (!_.isEmpty(selectedItems)) {
                          let existingSelectedItems = selectedItems.filter(function (v) {
                              let item = items.find(u => u.title == v.title);
                              if(item) {
                                  if(item.value) {
                                      v.value = item.value;
                                  }

                                  return v;
                              }
                          }, this);
                          this.selectedItems = existingSelectedItems ? existingSelectedItems : [];
                      }
                  } else {
                      this.selectedItems = [];
                      this.selectedItemInfo = undefined;
                  }

                  if(!this.multiSelect) {
                      this.selectedItem = !_.isEmpty(this.selectedItems) ? this.selectedItems[0] : {};
                  }
              }
          }
      }

      (!this.selectedItems || !this.selectedItems.length) && (this.selectedItem = undefined);

      let eventDetail = {
          selectedItems: this.selectedItems
      }
      this.fireBedrockEvent("context-lov-selected-info-applied", eventDetail);

      this.items = items;
  }
  _isItemPresent(items, id) {
      let presentItem = items.find(function (item) {
          return item.id == id;
      });
      return !!presentItem;
  }
  _onLovSelectionChanged(event) {
      let eventDetail = {
          data: event.detail.item
      }

      this.fireBedrockEvent("context-lov-selection-changed", eventDetail);
  }

  _onLovConfirmButtonTapped(event) {
      this.selectedItemInfo = undefined;
      this._preSelectedItems = [];
      let eventDetail = {
          data: {
              id: this.id
          },
          name: "context-lov-confirm-button-tap"
      }

      this.fireBedrockEvent("context-lov-confirm-button-tap", eventDetail);
  }

  _onLovCloseButtonTapped(event) {
      let eventDetail = {
          data: {
              id: this.id
          },
          name: "context-lov-close-button-tap"
      }

      this.fireBedrockEvent("context-lov-close-button-tap", eventDetail);
  }
  /**
    * <b><i>Content development is under progress... </b></i> 
    */
  refershTemplate() {
      this.shadowRoot.querySelector("#contextLov").refereshTemplate();
  }
}
customElements.define(RockContexLov.is, RockContexLov);
