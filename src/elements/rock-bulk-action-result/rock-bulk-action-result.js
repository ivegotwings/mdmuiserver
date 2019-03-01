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
import '../bedrock-helpers/component-helper.js';
import '../pebble-data-table/pebble-data-table.js';
import '../pebble-button/pebble-button.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-buttons.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockBulkActionResult
    extends mixinBehaviors([
        RUFBehaviors.UIBehavior,
        RUFBehaviors.ComponentContextBehavior
    ], OptionalMutableData(PolymerElement)) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-grid-layout bedrock-style-padding-margin bedrock-style-buttons">
            :host {
                height:100%;
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

			data-table-row[header] {
				font-weight: var(--font-bold, bold);
				color: var(--palette-cerulean, #036bc3);
				border-bottom: none;
				text-transform: uppercase;
				font-size: var(--table-head-font-size, 11px);
			}

			data-table-row:not([header]) {
				color: var(--palette-dark, #1a2028);
				font-size: var(--default-font-size, 12px);
				height: 100%;
				background-color: var(--palette-white, #ffffff);
			}

			data-table-row:not([header]):hover,			
			data-table-row[selected] {
				background-color: var(--table-row-selected-color, #c1cad4) !important;
			}

			data-table-row.value-updated {
				background-color: var(--edit-attribute-bgcolor, #EDF8FE) !important;
			}

			data-table-row:not([header]):hover data-table-checkbox,
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
				min-width: 0!important;
				flex-basis: 150px; /* Set minimum width for columns */
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
				min-height: 40px!important;
				height: 40px !important;
				z-index:auto !important;
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

            pebble-data-table data-table-cell .cell{
                overflow: visible;
            }

            pebble-data-table data-table-cell span{
                text-overflow: ellipsis;
                white-space: nowrap;
                overflow: hidden;
                display: block;
            }
        </style>
        <div class="base-grid-structure">
            <div class="base-grid-structure-child-1">
                <div align="center">[[message]]</div>
            </div>
            <div class="base-grid-structure-child-2">
                <div id="grid-container" hidden="[[_noGrid]]" class="button-siblings">
                    <pebble-data-table id="bulk-results-grid" items="[[_gridData]]">
                        <template is="dom-repeat" items="[[_gridColumns]]" as="column">
                            <data-table-column slot="column-slot" name="[[column]]">
                                <template>
                                    <template is="dom-if" if="[[_hasLinkTemplate(column)]]">
                                        <a item="[[item]]" slot="cell-slot-content" href="#" on-tap="_rowLinkClicked">
                                            <div class="cell" title\$="[[_itemValue(item.message, column)]]"><span>[[_itemValue(item.message, column)]]</span></div>
                                        </a>
                                    </template>

                                    <template is="dom-if" if="[[!_hasLinkTemplate(column)]]">
                                        <div slot="cell-slot-content" class="cell" title\$="[[_itemValue(item.message, column)]]"><span>[[_itemValue(item.message, column)]]</span></div>
                                    </template>
                                </template>
                            </data-table-column>
                        </template>
                    </pebble-data-table>
                </div>                
                <div id="user-actions" align="center" class="buttonContainer-static">
                    <template is="dom-repeat" items="[[businessFunctionData.actions]]" as="action">
                        <pebble-button class="action-button-focus dropdownText btn btn-success m-r-5" icon="pebble-icon:action-take-task" button-text="[[action.text]]" data="[[action]]" on-tap="_onActionTap"></pebble-button>
                    </template>
                </div>
            </div>
        </div>
`;
  }

  static get is() {
      return 'rock-bulk-action-result';
  }
  static get observers() {
      return [
          'onBusinessFunctionChange(businessFunctionData)'
      ]
  }
  static get properties() {
      return {
          businessFunctionData: {
              type: Object,
              value: function () { return {}; }
          },

          _gridColumns: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          _linkTemplate: {
              type: String,
              value: "entity-manage?id={id}&type={type}"
          },

          _gridData: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          _noGrid: {
              type: Boolean,
              value: false
          }
      }
  }


  _itemValue(item, column) {
      if (!_.isEmpty(item)) {
          return item[column.name];
      }
  }
  /**
    * <b><i>Content development is under progress... </b></i>
    */
  onBusinessFunctionChange() {
      if (!_.isEmpty(this.businessFunctionData) && this.businessFunctionData.processedEntities) {
              let entities = this.businessFunctionData.processedEntities?this.businessFunctionData.processedEntities: [];
              let messages = this.businessFunctionData.messages;
              let key = this.businessFunctionData.messageKey;

              this._setColumnsForGrid(messages);

              for (let i = 0; i < messages.length; i++) {
                  let entity = entities.find(obj => obj.id == messages[i][key]);
                  if (entity) {
                      messages[i].name = !_.isEmpty(entity.name)?entity.name:"_Empty";
                  }
              }

          this._setBulkResponse();
      } else {
          this.logError('The requested entities in processing not getting passed to bulk-action-result');
      }
  }

  _hasLinkTemplate(column) {
      if(column.name == "name") {
          return true;
      }
      return false;
  }
  _rowLinkClicked(e) {
      let detail = e.detail.item ? e.detail : e.currentTarget;
          let item = detail.item.data;
          if (this._linkTemplate) {
              let link = this._getLink(this._linkTemplate, item);
              this.fireBedrockEvent("grid-link-clicked", {
                  "link": link,
                  "id": item.id
              }, {
                  ignoreId: true
              });
              window.history.pushState("", "", link);
              window.dispatchEvent(new CustomEvent('location-changed'));
          }
          this._closeBusinessFunctionDialog()
    }

    _closeBusinessFunctionDialog() {
        let eventData = {
            name: "on-buttonclose-clicked"
        };
        this.dispatchEvent(new CustomEvent('bedrock-event', {
            detail: eventData,
            bubbles: true,
            composed: true
        }));
    }


    _getLink(linkTemplate, item) {
        let _this = this;

        if (linkTemplate) {
    return linkTemplate.replace(/\{\S+?\}/g,
        function (match) {
            let attrName = match.replace("{", "").replace("}", "");
            if (attrName.toLowerCase() == "id") {
                return encodeURIComponent(item.id);
            }
            if (attrName.toLowerCase() == "type") {
                return encodeURIComponent(item.type);
            }

            let colModels = _this._fields;
            let index = -1;
            for (let i = 0; i < colModels.length; i++) {
                if (colModels[i].name == attrName) {
                    index = i;
                    break;
                }
            }
            if (index > -1) {
                return encodeURIComponent(_this._columnValue(item, index));
            }
            return encodeURIComponent(match);
        });
        }

        return "";
}

  _setColumnsForGrid(messages) {
      if (_.isEmpty(messages)) {
          return;
      }

      let columns = [];
      for (let key in messages[0]) {
          if(key!=='entityData') {
              columns.push(key);
          }
      }

      this._gridColumns = columns;
  }


  _setBulkResponse() {
      if (this.businessFunctionData.noGrid) {
          this._noGrid = this.businessFunctionData.noGrid;
      }

      if (!this._noGrid) {
          let messages = this.businessFunctionData.messages;

            this._setColumnsForGrid(messages);
            this._setFormattedGridData(messages);


      }
      else {
          if (this.businessFunctionData.message) {
              this.message = this.businessFunctionData.message;
          }
      }
  }

  _setFormattedGridData(messages) {
    let formattedGridData = []; 
    this.businessFunctionData.processedEntities.forEach(entity=> {
        messages.forEach((gridDataItem, index)=> {

            if(entity.id == gridDataItem["Entity Id"]) {
              formattedGridData[index] = {
                  data: entity,
                  message: gridDataItem
              }
            }
        })
    })
    this._gridData = formattedGridData;
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
}
customElements.define(RockBulkActionResult.is, RockBulkActionResult);
