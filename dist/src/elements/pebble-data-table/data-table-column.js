import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import './data-table-column-filter.js';
import '../pebble-info-icon/pebble-info-icon.js';
import '../bedrock-style-manager/styles/bedrock-style-tooltip.js';
import { dom, flush } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class DataTableColumn extends mixinBehaviors([RUFBehaviors.UIBehavior], OptionalMutableData(
    PolymerElement)) {
  static get template() {
    return Polymer.html`
        <template id="header">
            <style include="bedrock-style-tooltip">
                data-table-cell.fixedWidth{
                   
                    justify-content: center;
                }
                data-table-cell.fixedWidth .cell-content{
                    padding-right: 0px;
                    max-width: 100%;
                }
                .cell-content {
                    position: relative;
                    padding-right: 15px;
                    /* Space for infor Icon */
                    max-width: calc(100% - 14px);
                }

                .cell-content-text {
                    max-width: 100%;
                    cursor: default;
                }

                pebble-info-icon {
                    position: absolute;
                    top: 1px;
                    right: 0px;
                }
            </style>
            <template is="dom-if" if="[[column.filterBy]]">
                <data-table-column-filter slot="cell-slot-content" label="[[column.name]]" value="{{column.filterValue}}" hidden\$="[[!column.filterBy]]" filter-type="[[filterType]]"></data-table-column-filter>
            </template>
            <div slot="cell-slot-content" class="cell-content tooltip-bottom" hidden\$="[[column.filterBy]]" data-tooltip\$="[[column.name]]">
                <div class="cell-content-text text-ellipsis">[[column.name]]</div>
                <template is="dom-if" if="[[columnObject.headerDescription]]">
                    <pebble-info-icon description-object="[[columnObject.headerDescription]]"></pebble-info-icon>
                </template>
            </div>
        </template>
`;
  }

  static get is() {
      return "data-table-column";
  }
  static get properties() {
      return {
          /**
           * If `true`, cell contents will be aligned on the right
           */
          alignRight: {
              type: Boolean,
              value: false
          },

          /**
           * Name of the column. This value is displayed in the header cell of the column
           */
          name: {
              type: String,
              value: ''
          },

          /**
           * Path to a property that will be filtered by this column. If set, a filter input
           * will be automaticelly placed on the header cell of the column.
           */
          filterBy: {
              type: String
          },

          /**
           * Filter value that will be used to filter the items using the property defined
           * in `filterBy` property.
           */
          filterValue: {
              type: String
          },

          /**
           * Minimum width of the column
           */
          width: {
              type: String,
              value: "100"
          },

          /**
           * Ratio of how the extra space between columns is distributed. If every cell
           * has the same `flex` value, the space will be distributed evenly.
           */
          flex: {
              type: Number,
              value: 1
          },

          /**
           * If `true`, the cells of this column will be hidden.
           */
          hidden: {
              type: Boolean,
              value: false
          },

          /**
           * Display order of the column in relation with the other columns.
           */
          order: {
              type: Number,
              notify: true
          },

          /**
           * Path to a property that will be sorted by this column. If set, a sorting
           * indicator will be automatically placed in the header cell of this column.
           */
          sortBy: {
              type: String
          },

          /*
           * Reference to the parent <pebble-data-table> element.
           */
          table: {
              type: Object
          },

          /**
           * Template for the header cell
           */
          headerTemplate: {
              type: Object,
              // readOnly: true,
              // value: function() {
              //   var custom = Polymer.dom(this).querySelector('template[is=header]');
              //   if (custom && custom.parentElement) {
              //     // set dataHost to the context where template has been defined
              //     var column = custom.parentElement;
              //     custom._rootDataHost = column.dataHost._rootDataHost || column.dataHost;
              //     return custom;
              //   }
              //   return Polymer.dom(this).querySelector('#header');
              // }
          },

          /**
           * Template for the row item cell
           */
          template: {
              type: Object,
              // readOnly: true,
              // value: function() {
              //     var template = Polymer.dom(this).querySelector('template:not([is=header])');
              //     if (template) {
              //       if (this.dataHost) {
              //         // set dataHost to the context where template has been defined
              //         template._rootDataHost = this.dataHost._rootDataHost || this.dataHost;
              //       }
              //       return template;
              //     }
              // }
          },
          columnObject: {
              type: Object,
              value: function () {
                  return {}
              }
          },
          column: {
              type: Object,
              value: function () {
                  return {}
              }
          },
          columnIndex: {
              type: Number,
              notify: true
          },
          item: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          filterType: {
              type: String,
              value: "textbox"
          },
          dataType: {
              type: String,
              value: ""
          },
          classes:{
              type:String,
              value:""
          }
      }
  }
  static get observers() {
      return [
          '_alignRightChanged(table, alignRight)',
          '_filterValueChanged(table, filterValue, filterBy)',
          '_filterByChanged(table, filterBy)',
          '_flexChanged(table, flex)',
          '_headerTemplateChanged(table, headerTemplate)',
          '_hiddenChanged(table, hidden)',
          '_nameChanged(table, name)',
          '_orderChanged(table, order)',
          '_sortByChanged(table, sortBy)',
          '_templateChanged(table, template)',
          '_widthChanged(table, width)'
      ]
  }
  connectedCallback() {
      super.connectedCallback();
      // var _template = Polymer.dom(this).querySelector('template:not([is=header])');
      let _template = dom(this).querySelector('template:not(header)');
      if (_template) {
          if (this.__dataHost) {
              // set dataHost to the context where template has been defined
              _template._rootDataHost = this.__dataHost._rootDataHost || this.__dataHost;
          }
          this.template = _template;
      }

      let custom = dom(this).querySelector('template.header');
      if (custom && custom.parentElement) {
          // set dataHost to the context where template has been defined
          let column = custom.parentElement;
          custom._rootDataHost = column.__dataHost._rootDataHost || column.__dataHost;
          this.headerTemplate = custom;
      } else {
          this.headerTemplate = this.shadowRoot.querySelector('#header');
      }
  }

  _notifyTable(table, path, value) {
      if (table.columns) {
          let index = table.columns.indexOf(this);
          table.notifyPath('columns.' + index + '.' + path, value);
      }
  }

  _alignRightChanged(table, alignRight) {
      if (!(table === undefined || alignRight === undefined)) {
          this._notifyTable(table, 'alignRight', alignRight);
      }
  }

  _nameChanged(table, name) {
      if (!(table === undefined || name === undefined)) {
          this._notifyTable(table, 'name', name);
          /*
           *Once we receive name
           *Create a pubsub listener
           *for filter events
           */
          const pubsub = document.createElement("bedrock-pubsub");
          let eventName = name.replace(/ /g, '').toLowerCase() + 'filterchange' + '_' + table
              .id;
          pubsub.setAttribute('event-name', eventName);
          pubsub.setAttribute('handler', '_filterEvent');
          pubsub._filterEvent = this._filterEvent;
          dom(this).appendChild(pubsub);
          flush();
      }
  }

  _filterEvent(e) {
      this.filterValue = e.detail.filter;
  }

  _sortByChanged(table, sortBy) {
      if (!(table === undefined || sortBy === undefined)) {
          this._notifyTable(table, 'sortBy', sortBy);
      }
  }

  _flexChanged(table, flex) {
      if (!(table === undefined || flex === undefined)) {
          this._notifyTable(table, 'flex', flex);
      }
  }

  _headerTemplateChanged(table, headerTemplate) {
      if (!(table === undefined || headerTemplate === undefined)) {
          this._notifyTable(table, 'headerTemplate', headerTemplate);
      }
  }

  _hiddenChanged(table, hidden) {
      if (!(table === undefined || hidden === undefined)) {
          this._notifyTable(table, 'hidden', hidden);
      }
  }

  _orderChanged(table, order) {
      if (!(table === undefined || order === undefined)) {
          this._notifyTable(table, 'order', order);
      }
  }

  _templateChanged(table, template) {
      if (!(table === undefined || template === undefined)) {
          this._notifyTable(table, 'template', template);
      }
  }

  _widthChanged(table, width) {
      if (!(table === undefined || width === undefined)) {
          this._notifyTable(table, 'width', width);
      }
  }

  _filterByChanged(table, filterBy) {
      if (!(table === undefined || filterBy === undefined)) {
          this._notifyTable(table, 'filterBy', filterBy);
      }
  }

  _filterValueChanged(table, filterValue, filterBy) {
      if (!(table === undefined || filterValue === undefined || filterBy === undefined)) {
          this._notifyTable(table, 'filterValue', filterValue);
          this.dispatchEvent(new CustomEvent('column-filter-changed', {
              detail: {
                  value: filterValue,
                  filterBy: filterBy
              },
              bubbles: true,
              composed: true
          }));
      }
  }
}
customElements.define(DataTableColumn.is, DataTableColumn);
