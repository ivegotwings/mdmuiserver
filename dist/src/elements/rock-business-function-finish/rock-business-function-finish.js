/**
<b><i>Content development is under progress... </b></i>

@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import '../liquid-entity-data-get/liquid-entity-data-get.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-business-function-behavior/bedrock-component-business-function-behavior.js';
import '../bedrock-helpers/component-helper.js';
import '../pebble-data-table/pebble-data-table.js';
import '../pebble-button/pebble-button.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-buttons.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockBusinessFunctionFinish
    extends mixinBehaviors([
        RUFBehaviors.UIBehavior,
        RUFBehaviors.ComponentContextBehavior,
        RUFBehaviors.ComponentBusinessFunctionBehavior,
    ], OptionalMutableData(PolymerElement)) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-tooltip bedrock-style-grid-layout bedrock-style-padding-margin bedrock-style-buttons">
            :host {
                height: 100%;
                padding-top: 20px;
            }

            pebble-data-table {
                --pebble-data-table-header: {
                    min-height: 40px;
                    padding-top: 0px;
                    padding-right: 0;
                    padding-bottom: 0px;
                    padding-left: 0;
                }

                --pebble-data-table-row-odd: {
                    background-color: var(--secondary-button-color, #ffffff);
                }
            }

            pebble-data-table[loading] {
                pointer-events: none;
            }

            pebble-data-table data-table-row[header] {
                font-weight: var(--font-bold, bold);
                color: var(--palette-cerulean, #036bc3);
                border-bottom: none;
                text-transform: uppercase;
                font-size: var(--table-head-font-size, 11px);
            }

            pebble-data-table data-table-row:not([header]) {
                color: var(--palette-dark, #1a2028);
                font-size: var(--default-font-size, 12px);
                height: 100%;
                background-color: var(--palette-white, #ffffff);
            }

            pebble-data-table data-table-row:not([header]):hover,
            data-table-row[selected] {
                background-color: var(--table-row-selected-color, #c1cad4) !important;
            }

            pebble-data-table data-table-row.value-updated {
                background-color: var(--edit-attribute-bgcolor, #EDF8FE) !important;
            }

            pebble-data-table data-table-row:not([header]):hover data-table-checkbox,
            data-table-row[selected] data-table-checkbox {
                background-color: var(--palette-white, #ffffff) !important;
            }

            #grid-container pebble-data-table data-table-cell .cell {
                overflow: visible;
            }

            #grid-container pebble-data-table data-table-cell span {
                text-overflow: ellipsis;
                white-space: nowrap;
                overflow: hidden;
                display: block;
            }

            data-table-cell,
            data-table-cell[header] {
                padding: 10px 10px 10px 0;
                min-width: 0 !important;
                flex-basis: 150px;
                /* Set minimum width for columns */
            }

            data-table-cell:not([header]) [slot=cell-slot-content] {
                width: 100%;
            }

            data-table-cell[header] {
                font-size: var(--font-size-sm, 12px);
                color: var(--palette-cerulean, #036bc3);
                text-transform: uppercase;
                cursor: default;
                align-items: center;
            }

            data-table-row:not([header]) data-table-cell {
                min-height: 40px !important;
                height: 40px !important;
                z-index: auto !important;
            }

            .cell {
                font-size: 14px;
                display: inline-block;
                vertical-align: middle;
                max-height: 100px;
                overflow-y: auto;
                max-width: 100%;
            }

            #inputDiv {
                width: 250px;
                border-bottom: 1px solid var(--textbox-border, #d2d8de);
                height: 42px;
            }

            .attributes-span .context-span {
                line-height: 56px;
            }

            #iconDiv {
                align-self: flex-end;
                -webkit-align-self: flex-end;
                padding-bottom: 5px;
                margin-left: -20px;
                cursor: pointer;
            }

            pebble-data-table data-table-cell .cell {
                overflow: visible;
            }

            pebble-data-table data-table-cell span {
                text-overflow: ellipsis;
                white-space: nowrap;
                overflow: hidden;
                display: block;
            }
        </style>

        <div class="base-grid-structure">
            <div class="base-grid-structure-child-1">
                <template is="dom-repeat" items="[[businessFunctionData.messages]]" as="message">
                    <p align="center">[[message.message]]</p>
                </template>
            </div>
            <div class="base-grid-structure-child-2">
                <template is="dom-if" if="[[isGrid]]">
                    <div id="grid-container" class="button-siblings">
                        <pebble-data-table id="bulk-results-grid" items="[[_gridData]]">
                            <template is="dom-repeat" items="[[_gridColumns]]" as="column">
                                <data-table-column slot="column-slot" name="[[column]]">
                                    <template>
                                        <div slot="cell-slot-content" class="cell" title\$="[[_itemValue(item, column)]]"><span>[[_itemValue(item, column)]]</span></div>
                                    </template>
                                </data-table-column>
                            </template>
                        </pebble-data-table>
                    </div>
                </template>
                <div id="user-actions" align="center" class="buttonContainer-static">
                    <template is="dom-repeat" items="[[_getActionsPerRoute(businessFunctionData.actions)]]" as="action">
                        <pebble-button class="action-button-focus dropdownText btn btn-success m-r-5" icon="pebble-icon:action-take-task" button-text="[[action.text]]" data="[[action]]" on-tap="_onActionTap"></pebble-button>
                    </template>
                </div>
            </div>
        </div>
        <liquid-entity-data-get name="entityGetService" operation="getbyids" request-data="{{entityRequest}}" on-response="_onEntityGetResponse" on-error="_onEntityGetError"></liquid-entity-data-get>
`;
  }

  static get is() {
      return 'rock-business-function-finish';
  }
  static get observers() {
      return [
          'onBusinessFunctionChange(businessFunctionData)'
      ]
  }
  static get properties() {
      return {
          contextData: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          businessFunctionData: {
              type: Object,
              value: function () { return {}; }
          },

          resultAttributes: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          _gridColumns: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          _gridData: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          isGrid: {
              type: Boolean,
              value: false
          },

          queryParams: {
              type: Object,
              value: function () {
                  return {};
              }
          }
      }
  }

  _itemValue(item, column) {
      if (!_.isEmpty(item)) {
          if (!_.isEmpty(this.resultAttributes)) {
              //Column name is external name, so need name to fetch data 
              let resultAttr = this.resultAttributes.find(attr => attr.externalName == column.name);
              if (resultAttr) {
                  return item[resultAttr.name];
              }
          }
          return item[column.name];
      }
  }
  /**
    * <b><i>Content development is under progress... </b></i>
    */
  onBusinessFunctionChange() {
      if (!_.isEmpty(this.businessFunctionData)) {
          let contextData = this.businessFunctionData.contextData;
          let processedEntities = this.businessFunctionData.processedEntities;
          let messages = this.businessFunctionData.messages;

          if (!_.isEmpty(this.resultAttributes) && !_.isEmpty(contextData)
              && !_.isEmpty(processedEntities) && !_.isEmpty(messages)) {
              //Prepare request
              let entityIds = [...new Set(processedEntities.map((obj) => obj.id))];
              let entityTypes = [...new Set(processedEntities.map((obj) => obj.type))];
              let entityAttributes = [...new Set(this.resultAttributes.map((obj) => obj.name))];

              contextData.ItemContexts = [{
                  "attributeNames": entityAttributes
              }];

              this.entityRequest = DataRequestHelper.createEntityGetRequest(contextData);
              this.entityRequest.params.query.ids = entityIds;
              this.entityRequest.params.query.filters.typesCriterion = entityTypes;
              delete this.entityRequest.params.options;
              let liquidDataGet = this.$$("[name=entityGetService]");
              if (liquidDataGet) {
                  liquidDataGet.generateRequest();
              }
          } else {
              this._setBulkResponse();
          }
      }
  }

  _onEntityGetResponse(e) {
      if (DataHelper.isValidObjectPath(e, "detail.response.content.entities") &&
          !_.isEmpty(e.detail.response.content.entities)) {
          let entites = e.detail.response.content.entities;
          let messages = this.businessFunctionData.messages;
          let key = this.businessFunctionData.messageKey;

          this._setColumnsForGrid(messages);

          for (let i = 0; i < messages.length; i++) {
              let entity = entites.find(obj => obj.id == messages[i][key]);
              if (entity) {
                  for (let j = 0; j < this.resultAttributes.length; j++) {
                      messages[i][this.resultAttributes[j].name] = AttributeHelper.getFirstAttributeValue(entity.data.attributes[this.resultAttributes[j].name]);
                  }
              }
          }
      }

      this._setBulkResponse();
  }

  _setColumnsForGrid(messages) {
      if (_.isEmpty(messages)) {
          return;
      }

      let columns = [];
      for (let key in messages[0]) {
          columns.push(key);
      }

      for (let i = 0; i < this.resultAttributes.length; i++) {
          let index = i + 1; // after first column
          columns.splice(index, 0, this.resultAttributes[i].externalName);
      }

      this._gridColumns = columns;
  }

  _onEntityGetError(e) {
      this.logError("Entity get failed");
      this._setBulkResponse();
  }

  _setBulkResponse() {
      if (!this.isGrid && this.businessFunctionData && typeof this.businessFunctionData.isGrid == "boolean") {
          this.isGrid = this.businessFunctionData.isGrid;
      }

      if (this.isGrid) {
          let messages = this.businessFunctionData.messages;

          if (_.isEmpty(messages)) {
              return;
          }

          if (_.isEmpty(this._gridColumns)) {
              let columns = [];
              for (let key in messages[0]) {
                  columns.push(key);
              }

              this._gridColumns = columns;
          }

          this._gridData = messages;
      }
      else {
          let messages = [];
          if (this.businessFunctionData.message && (!this.businessFunctionData.messages || this.businessFunctionData.messages.length == 0)) {
              this.businessFunctionData.messages = [{
                  "message": this.businessFunctionData.message
              }];
          }
      }
  }

  _onActionTap(e) {
      if (e && e.currentTarget && e.currentTarget.data) {
          let actionData = e.currentTarget.data;
          actionData.closeBusinessFunction = true;
          let eventName = "onNext";
          this.fireBedrockEvent(eventName, actionData, {
              ignoreId: true
          });
      }
  }

  _getActionsPerRoute(actions) {
      if (!actions || _.isEmpty(this.componentResult)) {
          return;
      }

      for (let action of actions) {
          if (!action || !action.dataRoute ||
              (action.dataRoute && !_.isEmpty(action.queryParams))) {
              continue;
          }

          let queryParams = {};
          switch (action.dataRoute) {
              case "entity-create":
                  this.setState(this.queryParams);
                  queryParams = {
                      "state": this.getQueryParamFromState()
                  }
                  break;
              case "entity-manage":
                  queryParams = {
                      "id": this.componentResult.id || "",
                      "type": this.componentResult.type || ""
                  }
                  break;
              case "task-detail":
                  queryParams = {
                      "id": this.componentResult.id || ""
                  }
                  break;
          }
          action.queryParams = queryParams;
      }

      return actions;
  }
}
customElements.define(RockBusinessFunctionFinish.is, RockBusinessFunctionFinish);
