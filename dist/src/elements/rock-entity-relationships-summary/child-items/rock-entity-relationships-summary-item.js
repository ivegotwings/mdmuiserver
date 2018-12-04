/**
    @group rock Elements
    @element rock-entity-relationships-summary-item
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import '@polymer/iron-ajax/iron-ajax.js';
import '../../bedrock-helpers/data-helper.js';
import '../../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../../bedrock-helpers/data-request-helper.js';
import '../../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../../bedrock-style-manager/styles/bedrock-style-common.js';
import '../../bedrock-style-manager/styles/bedrock-style-tooltip.js';
import '../../liquid-entity-data-get/liquid-entity-data-get.js';
import '../../rock-grid-data-sources/entity-relationship-grid-datasource.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockEntityRelationshipsSummaryItem
    extends mixinBehaviors([
    RUFBehaviors.UIBehavior,
    RUFBehaviors.ComponentContextBehavior
    ], PolymerElement) {
  static get template() {
    return Polymer.html`
        <style include="bedrock-style-common bedrock-style-tooltip">
            .relationships-summary__item {
                border-radius: 50%;
                border: solid var(--border-black, #000) 2px;
                width: 65px;
                height: 65px;
                box-sizing: border-box;
                text-align: center;
            }

            .relationships-summary__item-value {
                font-weight: var(--font-bold, bold);
                color: var(--border-black, #000);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                height: 100%;
            }

            .relationships-summary__item-description {
                margin-top: 10px;
                font-size: 11px;
                font-weight: var(--font-bold, bold);
                max-width: 70px;
            }
            .color-variant-1 {
                border-color:#0bb2e8;
                color: #0bb2e8;
            }
            .color-variant-2 {
                border-color:#36b44a;
                color: #0bb2e8;
            }
            .color-variant-3 {
                border-color:#785da7;
                color: #785da7;
            }
            .color-variant-4 {
                border-color:#f68d1e;
                color: #f68d1e;
            }
            .color-variant-5 {
                border-color:#f5d30c;
                color: #f5d30c;
            }
            .color-variant-6 {
                border-color:#ed204c;
                color: #ed204c;
            }
            .color-variant-7 {
                border-color:#1ccad5;
                color: #1ccad5;
            }
            .color-variant-8 {
                border-color: #54abe4;
                color: #54abe4;
            }
            .color-variant-9 {
                border-color:#42c9b6;
                color: #42c9b6;
            }
        </style>
        <!-- Get request section -->
        <liquid-entity-data-get exclude-in-progress="" id="getRelations" request-data="[[request]]" on-error="_onError" data-index\$="[[dataIndex]]"></liquid-entity-data-get>
        <!-- Get request section ends-->

        <div class\$="[[getSummaryItemColor('true')]]">
            <div class\$="[[getSummaryItemColor()]]">
                <template is="dom-if" if="[[!_loading]]">
                    [[value]]
                </template>
                <template is="dom-if" if="[[_loading]]">
                    <div id="taskCountLoading">
                        <img id="loadingIcon" src="../../../../src/images/loading.svg">
                    </div>
                </template>

            </div>
        </div>

        <div class="relationships-summary__item-description tooltip-top" data-tooltip\$="[[description]]"><div class="text-ellipsis">[[description]]</div></div>
`;
  }

  static get is() { return 'rock-entity-relationships-summary-item' }
  static get properties() {
      return {
          color: {
              type: String,
              // value: ""
          },

          /**
           *  Indicates the list of entities in the "JSON" format.
           */
          data: {
              type: Object,
              notify: true,
              value: function () {
                  return {};
              }
          },

          request: {
              type: Object,
              value: {}
          },

          downRequestTemplate: {
              type: Object,
              value: {
                  "params": {
                      "query": {
                          "id": "",
                          "filters": {
                              "typesCriterion": []
                          }
                      },
                      "fields": {
                          "relationships": []
                      },
                      "options": {
                          "maxRecords": 1
                      }
                  }
              }
          },

          upRequestTemplate: {
              type: Object,
              value: {
                  "params": {
                      "query": {
                          "filters": {
                              "typesCriterion": [],
                              "relationshipsCriterion": [
                              ]
                          }
                      },
                      "fields": {
                          "relationships": []
                      }
                  }
              }
          },

          _loading: {
              type: Boolean,
              value: true
          },

          dataIndex: {
              type: String,
              value: "entityData"
          },

          contextData: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          applyContextCoalesce: {
              type: Boolean,
              value: false
          }
      }
  }

  ready () {
      super.ready();
      let liquid;
      this._loading = true;
      let ownership = this.data.relEntityType.properties.relationshipOwnership;
      this.description = this.data.relEntityType.properties.externalName || this.data.relEntityType.id;
      if (ownership == "owned") {
          this.request = this.generateDownRequestObject(this.downRequestTemplate);
          liquid = this.$.getRelations;
          liquid.operation = "getbyids";
          liquid.useDataCoalesce = this.applyContextCoalesce;
          DataHelper.oneTimeEvent(liquid, 'response', this.onResponseGetByIdData.bind(this));
      } else{
          this.request = this.generateUpRequestObject(this.upRequestTemplate,this.data.relationshipTypeName);
          liquid = this.$.getRelations;
          liquid.operation = "initiatesearchandgetcount";
          DataHelper.oneTimeEvent(liquid, 'response', this.onResponseSearchData.bind(this));
      }
      if(liquid) {
          liquid.generateRequest();
      }
  }
  getSummaryItemColor(arg){
      if(arg){
          return "relationships-summary__item " + this.color
      }else{
          return "relationships-summary__item-value " + this.color
      }
      
  }
  generateDownRequestObject (template) {
      let request = DataHelper.cloneObject(template);
      request.params.query.id = this.entity.id;
      request.params.query.filters.typesCriterion = [this.entity.type];
      let relationship = this.data.relationshipTypeName;

      request.params.fields.relationships = [relationship];
      let firstDataContext = this.getFirstDataContext();
      request.params.query.contexts = [firstDataContext];
      return request;
  }

  generateUpRequestObject (template,relationshipType) {
      let request = DataHelper.cloneObject(template);
      let entityType;
      if(DataHelper.isValidObjectPath(this.data, 'relEntityType.properties.relatedEntityInfo.0.relEntityType')){
          entityType = this.data.relEntityType.properties.relatedEntityInfo[0].relEntityType;
      }
      request.params.query.filters.typesCriterion = [entityType];
      let relationshipTypeObject = {};
      relationshipTypeObject[relationshipType] = {
          "relTo": {
              "id": this.entity.id,
              "type": this.entity.type
          }
      };
      request.params.query.filters.relationshipsCriterion.push(relationshipTypeObject)
      request.params.fields.relationships = entityType;
      let firstDataContext = this.getFirstDataContext();
      if(firstDataContext){
          request.params.query.contexts = [firstDataContext];
      }
      return request;
  }

  onResponseGetByIdData (e) {
      if (e.detail && e.detail.response) {
          let response = e.detail.response;
          if (response && response.content) {
              let countOfRelations = 0;
              if (e.detail.response.content.entities &&
                  e.detail.response.content.entities[0] &&
                  e.detail.response.content.entities[0].data) {
                  let currentItemData = e.detail.response.content.entities[0].data;
                  let relationshipData = {};
                  if (currentItemData.contexts && currentItemData.contexts.length > 0) {
                      relationshipData = currentItemData.contexts[0].relationships;
                  } else {
                      relationshipData = currentItemData.relationships;
                  }
                  if (relationshipData &&
                      relationshipData[this.data.relationshipTypeName]) {
                      countOfRelations = relationshipData[this.data.relationshipTypeName].length;
                  }
              }
              this.value = countOfRelations;
              this._loading = false;
          }
      }
  }

  onResponseSearchData (e) {
      this.value = 0;
      if (e.detail && e.detail.response) {
          let response = e.detail.response;
          if (response && response.content) {
              this.value = response.content.totalRecords || 0;
          }
      }
      this._loading = false;
  }

  _onError (e) {
      this.logError("Failed to get Entity data", e.detail);
  }
}
customElements.define(RockEntityRelationshipsSummaryItem.is, RockEntityRelationshipsSummaryItem);