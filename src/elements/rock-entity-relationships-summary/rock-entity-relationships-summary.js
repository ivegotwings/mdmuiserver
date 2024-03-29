/**
    @group rock Elements
    @element rock-entity-relationships-summary
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '@polymer/iron-ajax/iron-ajax.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-style-manager/styles/bedrock-style-scroll-bar.js';
import '../bedrock-style-manager/styles/bedrock-style-list.js';
import '../liquid-entity-model-get/liquid-entity-model-get.js';
import '../pebble-spinner/pebble-spinner.js';
import './child-items/rock-entity-relationships-summary-item.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockEntityRelationshipSummary
extends mixinBehaviors([
    RUFBehaviors.UIBehavior,
    RUFBehaviors.ComponentContextBehavior

], PolymerElement) {
  static get template() {
    return html`
        <style include="bedrock-style-scroll-bar bedrock-style-list">
            :host {
                display: block;
                height: 100%;
                position: relative;
            }
            .relationships-summary__items {
                text-align: center;
                margin: 0px;
                padding: 0px;
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                align-items: center;
                height: 100%;
            }

            .relationships-summary__item-wrapper {
                padding-bottom: 10px;
                text-align: center;
                cursor: pointer;
                list-style: none;
                padding-right: 10px;
            }

            .relationships-summary__items-wrapper {
                height: 100%;
                overflow-y: auto;
                overflow-x: hidden;
                box-sizing: border-box;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            pebble-spinner {
                background: var(--white, #fff);
                margin: 5px 20px 30px;
                box-sizing: border-box;
            }
        </style>

        <liquid-entity-model-get id="liquidModeleGet" operation="getbyids" request-data="{{_request}}" on-response="_onModelReceived" on-error="_onModelGetFailed"></liquid-entity-model-get>

        <liquid-entity-model-get id="getRelDomains" operation="getbyids" on-response="_onRelModelsReceived" on-error="_onModelGetFailed"></liquid-entity-model-get>

        <liquid-entity-data-get exclude-in-progress="" id="getRelations" on-error="_onError" operation="getbyids" use-data-coalesce="[[applyContextCoalesce]]" data-index\$="[[dataIndex]]"></liquid-entity-data-get>
        <pebble-spinner active="[[_loading]]"></pebble-spinner>

        <template is="dom-if" if="{{hasComponentErrored(isComponentErrored)}}">
            <div id="error-container"></div>
        </template>

        <template is="dom-if" if="{{!hasComponentErrored(isComponentErrored)}}">
            <div class="relationships-summary__items-wrapper">
                <ul class="relationships-summary__items">
                    <template is="dom-repeat" items="[[values]]" filter="isWhereUsedItem">
                        <li class="relationships-summary__item-wrapper">
                            <rock-entity-relationships-summary-item entity="[[entity]]" color="[[_getStyle(0, index)]]" data="[[item]]" data-index\$="[[dataIndex]]" context-data="[[contextData]]" on-tap="_onTap" apply-context-coalesce="[[applyContextCoalesce]]"></rock-entity-relationships-summary-item>
                        </li>
                    </template>
                    <template is="dom-repeat" items="[[ownedItems]]">
                        <li class="relationships-summary__item-wrapper">
                            <rock-entity-relationships-summary-item color="[[_getStyle(0, index)]]" on-tap="_onTap" value="[[item.count]]" description="[[item.description]]"></rock-entity-relationships-summary-item>
                        </li>
                    </template>
                </ul>
            </div>
        </template>
`;
  }

  static get is() {
      return 'rock-entity-relationships-summary';
  }

  static get properties() {
      return {
          data: {
              type: Object,
              notify: true,
              value: function () {
                  return {};
              }
          },

          contextData: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          values: {
              type: Array,
              value: []
          },
          ownedItems: {
              type: Array,
              value: []
          },
          excludeItems: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          domain: {
              type: String,
              value: "thing"
          },

          dataIndex: {
              type: String,
              value: "entityData"
          },
          entity: {
              type: Object,
              value: {}
          },

          _loading: {
              type: Boolean,
              value: true
          },

          applyContextCoalesce: {
              type: Boolean,
              value: false
          },

          linkTab: {
              type: String,
              value: ""
          },
          downRequest: {
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
                      }
                  }
              }
          }
      }
  }



  /**
   *  Indicates the list of entities in the "JSON" format.
   */

  _getStyle(offset, index) {
      return "color-variant-" + ((offset + index + 1) % 9);
  }

  ready() {
      super.ready();
      this.getData();
  }

  getData() {
      this._loading = true;
      this._setRequestObject();
      let liquid = this.$.liquidModeleGet;
      this.entity = this.getFirstItemContext();
      if (liquid) {
          liquid.generateRequest();
      }
  }

  refresh() {
      this.getData();
  }

  //TODO: copy-paste section follows. This code is need to be extracted and generalized.
  _onModelReceived(e) {
      let responseContent = DataHelper.validateAndGetResponseContent(e.detail.response);
      if (responseContent) {
          this._relationshipEntityTypeMappings = this._getRelationshipEntityTypeMappings(
              responseContent.entityModels);
          let relationshipTypeNames = this._relationshipEntityTypeMappings.map(function (rel) {
              return rel.relationshipTypeName + "_relationshipModel";
          });
          this._generateCheckDomainRequest(relationshipTypeNames);
      } else {
          this.logError("Models not found", e.detail, true);
          this._loading = false;
      }
  }

  _generateCheckDomainRequest(relationshipTypeNames) {
      let req = DataHelper.cloneObject(this._request);
      delete req.params.query.id;
      req.params.query.ids = relationshipTypeNames;
      req.params.query.domain = this.domain;
      req.params.query.filters = {
          "typesCriterion": ["relationshipModel"]
      };
      req.params.fields = {};
      let checkDomainLiquid = this.shadowRoot.querySelector("#getRelDomains");
      if (checkDomainLiquid) {
          checkDomainLiquid.requestData = req;
          checkDomainLiquid.generateRequest();
      }
  }
  _onRelModelsReceived(e) {
      let responseContent = DataHelper.validateAndGetResponseContent(e.detail.response)
      if (responseContent) {
          let models = responseContent.entityModels;
          let relationshipTypeNames = [];
          for (let i = 0; i < models.length; i++) {
              if (models[i].domain == this.domain) {
                  relationshipTypeNames.push(models[i].name);
              }
          }

          let relationshipMappings = [];
          for (let rel of this._relationshipEntityTypeMappings) {
              if (relationshipTypeNames.indexOf(rel.relationshipTypeName) > -1 && this.excludeItems.indexOf(
                      rel.relationshipTypeName) == -1) {
                  let relEntitytypes = rel.relatedEntityTypes;
                  for (let relEntityType of relEntitytypes) {
                      let relationshipMapping = {
                          relationshipTypeName: rel.relationshipTypeName,
                          relEntityType: relEntityType
                      };
                      relationshipMappings.push(relationshipMapping);
                  }
              }
          }

          this.set("values", [])
          this.values = relationshipMappings;


          this._generateRelationshipCountRequest(relationshipMappings);
          //adding a delay of half second since if data is severd from cache its
          //immediate so we dont see the loader.
          timeOut.after(500).run(() => {
              this._loading = false;
          });
          // TODO: following lines are presenting in original source
          // this._buildMenuItems(this._relationshipEntityTypeMappings);
          // this._callback(menuItems);
      } else {
          this.logError("Relationship models not found", e.detail, true);
          this._loading = false;
      }
  }
  isWhereUsedItem(item) {
      if (DataHelper.isValidObjectPath(item,'relEntityType.properties.relationshipOwnership')) {
          let ownership = item.relEntityType.properties.relationshipOwnership;
          return ownership !== "owned";
      }
      return false;
  }
  _generateRelationshipCountRequest(relationshipMappings) {
      let downDirectionRequest = null;
      let relationshipTypes = [];
      if (relationshipMappings) {
          relationshipMappings.forEach((mapping) => {
              if (DataHelper.isValidObjectPath(mapping,'relEntityType.properties.relationshipOwnership')) {
                  let ownership = mapping.relEntityType.properties.relationshipOwnership;
                  if (ownership == "owned") {
                      relationshipTypes.push(mapping.relationshipTypeName);
                  }
              }
          });
          
          downDirectionRequest = this.prepareDownRequestObject(relationshipTypes);
          let liquid = this.$.getRelations;
          if (liquid && downDirectionRequest) {
              DataHelper.oneTimeEvent(liquid, 'response', this.onResponseGetByIdData.bind(this));
              liquid.requestData = downDirectionRequest;
              liquid.generateRequest();
          }
      }

  }
  prepareDownRequestObject(relationshipTypes) {
      let downDirectionRequest = null;
      if(relationshipTypes){
          downDirectionRequest = DataHelper.cloneObject(this.downRequest);
          downDirectionRequest.params.query.id = this.entity.id;
          downDirectionRequest.params.query.filters.typesCriterion = [this.entity.type];
          downDirectionRequest.params.fields.relationships = relationshipTypes;
          let firstDataContext = this.getFirstDataContext();
          downDirectionRequest.params.query.contexts = [firstDataContext];
      }
      
      return downDirectionRequest;
  }

  onResponseGetByIdData(e) {
      if (e.detail && e.detail.response) {
          let response = e.detail.response;

          if (DataHelper.isValidObjectPath(response, 'content.entities.0')) {

              let relationshipsTotalCounts = e.detail.response.content.entities[0].relationshipsTotalCount;
              let ownedItems = [];
              this.values.forEach((mapping) => {
                  if (DataHelper.isValidObjectPath(mapping,'relEntityType.properties.relationshipOwnership')) {
                      let ownership = mapping.relEntityType.properties.relationshipOwnership;
                      if (ownership == "owned") {
                          let relationshipTypeName = mapping.relationshipTypeName;
                          let description = mapping.relEntityType.properties.externalName ||
                              mapping.relEntityType.id;
                          let data;
                          if (relationshipsTotalCounts) {
                              data = {
                                  count: relationshipsTotalCounts[relationshipTypeName],
                                  description: description
                              }
                          } else {
                              data = {
                                  count: 0,
                                  description: description
                              }
                          }
                          ownedItems.push(data);
                      }
                  }
              })
              this.ownedItems = ownedItems;
          }
      }
  }
  _onError(e) {
      this.logError("Failed to get Entity data", e.detail, true);
  }
  _onModelGetFailed(e) {
      this.logError("TabMenuError", e.detail, true);
      this._loading = false;
  }

  _getRelationshipEntityTypeMappings(entityModels) {
      let relationshipEntityTypeMappings = [];
      if (entityModels && entityModels.length > 0) {
          if (entityModels[0].data && entityModels[0].data.relationships) {
              let relationshipModels = entityModels[0].data.relationships;
              DataHelper.prepareOwnershipBasedRelationships(relationshipModels);
              Object.keys(relationshipModels).map(function (relationshipTypeName) {
                  let relationshipModel = {};
                  relationshipModel.relationshipTypeName = relationshipTypeName;
                  relationshipModel.relatedEntityTypes = relationshipModels[
                      relationshipTypeName];
                  relationshipEntityTypeMappings.push(relationshipModel);
              });
          }
      }
      return relationshipEntityTypeMappings;
  }

  _setRequestObject() {
      let firstDataContext = this.getFirstDataContext();
      let firstItemContext = this.getFirstItemContext();

      let entityType = firstItemContext.type;

      let req = {
          "params": {
              "query": {
                  "id": entityType + "_entityManageModel",
                  "filters": {
                      "typesCriterion": ["entityManageModel"]
                  }
              },
              "fields": {
                  "relationships": ["_ALL"]
              }
          }
      };

      if (this.contextData) {
          DataRequestHelper.addContextsToModelRequest(req, this.contextData);
      } else if (!_.isEmpty(firstDataContext)) {
          req.params.query.contexts = [firstDataContext];
      }

      this._request = req;
  }
  // TODO: ends

  /**
   * Handling tap on rock-entity-relationships-summary-item.
   */
  _onTap(e) {
      if (e && e.target) {
          let eventDetail = {
              "defaultTab": this.linkTab,
              "defaultSubMenu": e.target.description
          }
          ComponentHelper.fireBedrockEvent("selection-changed", eventDetail, {
              ignoreId: true
          });
      }
  }
}

customElements.define(RockEntityRelationshipSummary.is, RockEntityRelationshipSummary)
