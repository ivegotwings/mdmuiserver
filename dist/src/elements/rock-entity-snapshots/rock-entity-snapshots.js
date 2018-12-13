/**
<b><i>Content development is under progress... </b></i>

@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import '@polymer/polymer/lib/utils/async.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-helpers/data-request-helper.js';
import '../bedrock-helpers/entity-helper.js';
import '../bedrock-helpers/data-transform-helper.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-helpers/entity-helper.js';
import '../bedrock-helpers/context-helper.js';
import '../bedrock-helpers/attribute-helper.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-buttons.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../liquid-entity-model-composite-get/liquid-entity-model-composite-get.js';
import '../liquid-entity-data-save/liquid-entity-data-save.js';
import '../liquid-rest/liquid-rest.js';
import '../liquid-config-get/liquid-config-get.js';
import '../liquid-config-save/liquid-config-save.js';
import '../pebble-file-upload/pebble-file-upload.js';
import '../pebble-dialog/pebble-dialog.js';
import '../pebble-icons/pebble-icons.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-spinner/pebble-spinner.js';
import '../pebble-checkbox/pebble-checkbox.js';
import '../pebble-button/pebble-button.js';
import '../rock-grid/rock-grid.js';
import '../rock-classification-tree/rock-classification-tree.js';
import '../rock-context-mappings/rock-context-mappings-grid.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';

class RockEntitySnapshots
    extends mixinBehaviors([
        RUFBehaviors.UIBehavior,
        RUFBehaviors.ComponentContextBehavior
    ], PolymerElement) {
  static get template() {
    return Polymer.html`
        <style include="bedrock-style-common bedrock-style-grid-layout bedrock-style-padding-margin bedrock-style-buttons">
            :host {
                display: block;
                height: 100%;
            }

            .check-filter {
                flex-basis: 35px!important;
                flex-grow: 0!important;
                overflow: visible!important;
                position: relative;
                padding: 0;
            }

            data-table-checkbox {
                border-right: none;
                padding: 0 10px 0 0;
                height: auto;
                flex-basis: 35px;
                background: var(--palette-white, #ffffff);
                justify-content: flex-start;
            }

            data-table-cell,
            data-table-cell[header] {
                padding: 10px 10px 10px 0;
                min-width: 0!important;
                flex-basis: 150px;
                /* Set minimum width for columns */
                @apply --data-table-cell-width;
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
                height: auto !important;
            }

            pebble-data-table {
                --pebble-data-table-header: {
                    height: auto;
                }
            }

            pebble-data-table {
                --pebble-data-table-header: {
                    min-height: 40px;
                    padding-top: 10px;
                    padding-right: 0;
                    padding-bottom: 10px;
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
        </style>

        <template is="dom-if" if="[[_isGridConfigLoaded(_gridConfig)]]">
            <div class="button-siblings">
                <pebble-data-table id="snapshots-grid" items="{{_gridData}}" multi-selection="" selected-items="{{_selectedItems}}">
                    <template is="dom-repeat" items="[[_gridConfig]]" as="col" index-as="colIndex">
                        <data-table-column slot="column-slot" name="[[col.header]]" column-index="{{colIndex}}" column-object="[[col]]">
                            <template>
                                <div id="inputExcelDiv" slot="cell-slot-content" index="[[index]]">
                                    <span>[[_columnValue(item, column.columnIndex)]]</span>
                                </div>
                            </template>
                        </data-table-column>
                    </template>

                </pebble-data-table>
            </div>
        </template>
        <div id="buttonContainer" align="center" class="buttonContainer-static">
            <pebble-button id="cancel" class="btn btn-secondary m-r-5" button-text="Cancel" on-tap="_onCancelTap" elevation="1" raised=""></pebble-button>
            <pebble-button id="save" class="focus btn btn-success" button-text="Compare" on-tap="_onNextTap" elevation="1" raised=""></pebble-button>
        </div>

        <liquid-rest id="getEntitySnapshots" url="/data/pass-through-snapshot/getsnapshot" method="POST" on-liquid-response="_onSnapshotsReponse">
        </liquid-rest>
`;
  }

  static get is() {
      return "rock-entity-snapshots";
  }

  static get properties() {
      return {
          entitySnapshotRequest: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          _gridConfig: {
              type: Object,
              value: function () {
                  return {}
              }
          },

          _gridData: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          _selectedItems: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          _contexts: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          maximamSnapshotCount: {
              type: Number,
              value: 5
          }
      };
  }

  constructor() {
      super();
  }

  connectedCallback() {
      super.connectedCallback();

      this._gridConfig = [
          {
              "name": "label",
              "header": "Label"
          }, {
              "name": "published",
              "header": "Created On"
          }]
      this._getEntitySnapshotCall();
  }

  disconnectedCallback() {
      super.disconnectedCallback();
  }

  _isGridConfigLoaded() {
      return (this._gridConfig && !_.isEmpty(this._gridConfig));
  }

  _getEntitySnapshotCall() {
      let liquidRest = this.shadowRoot.querySelector("#getEntitySnapshots");
      let contextData = DataHelper.cloneObject(this.contextData);
      let req = DataRequestHelper.createEntityGetRequest(contextData)

      req.params.fields.attributes = ["originalObjectId", "originalObjectType", "snapshotLabel", "version"]
      req.params.fields.properties = ["modifiedDate"];
      req.params.options.maxRecords = 200;
      req.params.options.snapshotGetMode = "all";
      req.params.options.nonContextual = false;
      let dataContexts = ContextHelper.getDataContexts(contextData);

      if (_.isEmpty(dataContexts)) {
          req.params.options.nonContextual = true;
      }
      req.params.query.contexts = dataContexts;
      req.params.sort = {
          "properties": [
              {
                  "modifiedDate": "_DESC",
                  "sortType": "_DATETIME"
              }
          ]
      }
      liquidRest.requestData = req;
      liquidRest.generateRequest();
  }

  _onSnapshotsReponse(ev) {
      let entities = [{
          label: "Current Version"
      }];
      if (DataHelper.isValidObjectPath(ev, "detail.response.response.entities")) {
          let responseEntities = ev.detail.response.response.entities;
          responseEntities.forEach((entity) => {
              if (DataHelper.isValidObjectPath(entity, "data.contexts")) {
                  let contexts = entity.data.contexts;
                  let modifiedDate;
                  if (entity.properties && entity.properties.modifiedDate) {
                      modifiedDate = entity.properties.modifiedDate;
                      modifiedDate = FormatHelper.convertFromISODateTime(modifiedDate, 'datetime');
                  }
                  if (contexts && contexts.length) {
                      contexts.forEach((contextObj) => {
                          if (contextObj && contextObj.context && contextObj.context.snapshot) {
                              let obj = {};
                              obj.label = this._getSnapshotLabel(contextObj);
                              obj.version = AttributeHelper.getFirstAttributeValue(contextObj.attributes["version"]);
                              obj.snapshotId = entity.id;
                              obj.type = entity.type;
                              obj.published = modifiedDate;
                              entities.push(obj);
                          }
                      });
                  }
              }

          })

      }
      this.set("_gridData", entities);
  }

  _getSnapshotLabel(contextObj) {
      let label = AttributeHelper.getFirstAttributeValue(contextObj.attributes["snapshotLabel"]);
      if (_.isEmpty(label)) {
          return "No Label";
      }
      return label;
  }

  _onCancelTap(e) {
      let eventName = "onCancel";
      let eventDetail = {
          name: eventName
      };

      this.fireBedrockEvent(eventName, eventDetail, {
          ignoreId: true
      });
  }

  _onNextTap(e) {
      let pebbleDataTable = this.shadowRoot.querySelector('#snapshots-grid');
      let invertedPropertyPDTStatus = pebbleDataTable.selectedItems.inverted;
      let data;
      if (invertedPropertyPDTStatus) { //when all rows are selected and selected items in PDT will be empty

          let tableData = pebbleDataTable.getSelectedItems();
          this._selectedItems = tableData;
      }

      if (this._selectedItems) {
          if (this._selectedItems.length < 2) {
              this.showWarningToast("Select minimum 2 versions for comparison.");
              return;
          } else if (this._selectedItems.length > 5) {
              this.showWarningToast("Maximum 5 versions can be selected for comparison.");
              return;
          }
      }
      data = { selectedItems: this._selectedItems };

      let eventName = "onNext";
      let eventDetail = {
          name: eventName
      };
      this.businessFunctionData = data;
      this.fireBedrockEvent(eventName, eventDetail, {
          ignoreId: true
      });
  }

  _columnValue(gridData, index) {
      if (gridData && !_.isEmpty(gridData)) {
          let columnName = this._gridConfig[index].name;
          return gridData[columnName];
      }
      return "";
  }
}

customElements.define(RockEntitySnapshots.is, RockEntitySnapshots);
