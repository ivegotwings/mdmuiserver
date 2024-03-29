import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import './data-table-column-filter.js';
import '../pebble-info-icon/pebble-info-icon.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class DataTableColumn extends mixinBehaviors([RUFBehaviors.UIBehavior], OptionalMutableData(
    PolymerElement)) {
  static get template() {
    return html`
        <template id="header">
            <style>
                data-table-cell.fixedWidth {

                    justify-content: center;
                }

                data-table-cell.fixedWidth .cell-content {
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

                .subheader {
                    color: var(--data-column-sub-header-color, #36b44a);
                    font-weight: bold;
                    @apply --data-column-sub-header;
                }
            </style>
            <template is="dom-if" if="[[column.filterBy]]">
                <data-table-column-filter slot="cell-slot-content" label="[[column.name]]" value="{{column.filterValue}}" hidden\$="[[!column.filterBy]]" filter-type="[[column.filterType]]"></data-table-column-filter>
            </template>
            <div slot="cell-slot-content" class="cell-content" hidden\$="[[column.filterBy]]" title\$="[[column.name]]">
                <div class="cell-content-text text-ellipsis">
                    <template is="dom-if" if="[[_columHasLink(column.columnObject)]]">
                        <a href="#" on-tap="_columnLinkClicked">[[column.name]]</a>
                    </template>
                    <template is="dom-if" if="[[!_columHasLink(column.columnObject)]]">
                        <span>[[column.name]]</span>
                    </template>
                    <template is="dom-if" if="[[column.columnObject.subheader]]">
                        <span class="subheader">[[column.columnObject.subheader]]</span>
                    </template>
                </div>
                <template is="dom-if" if="[[columnObject.headerDescription]]">
                    <pebble-info-icon description-object="[[columnObject.headerDescription]]"></pebble-info-icon>
                </template>
            </div>
        </template>`;
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
          classes: {
              type: String,
              value: ""
          },
          _table: {
              type: Object,
              value: function () {
                  return {};
              }
          }
      }
  }
  static get observers() {
      return [
          '_alignRightChanged(alignRight)',
          '_filterValueChanged(filterValue, filterBy)',
          '_filterByChanged(filterBy)',
          '_flexChanged(flex)',
          '_headerTemplateChanged(headerTemplate)',
          '_hiddenChanged(hidden)',
          '_nameChanged(name)',
          '_orderChanged(order)',
          '_sortByChanged(sortBy)',
          '_templateChanged(template)',
          '_widthChanged(width)'
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

      this._addFilterChangedPubSub()
  }

  _notifyTable(path, value) {
      let table = this._getParentDataTable();
      if (table && table.columns) {
          let index = table.columns.indexOf(this);
          table.notifyPath('columns.' + index + '.' + path, value);
      }
  }

  _alignRightChanged(alignRight) {
      if (typeof alignRight != 'undefined') {
          this._notifyTable('alignRight', alignRight);
      }
  }

  _nameChanged(name) {
      let tableId = this._getParentDataTable().id;
      if (typeof name != 'undefined'  && !_.isEmpty(tableId)) {
          this._notifyTable('name', name);

          if(!_.isEmpty(name)) {
              this._addFilterChangedPubSub();
          }
      }
  }

  _filterEvent(e) {
      this.filterValue = e.detail.filter;
  }

  _sortByChanged(sortBy) {
      if (typeof sortBy != 'undefined') {
          this._notifyTable('sortBy', sortBy);
      }
  }

  _flexChanged(flex) {
      if (typeof flex != 'undefined') {
          this._notifyTable('flex', flex);
      }
  }

  _headerTemplateChanged(headerTemplate) {
      if (typeof headerTemplate != 'undefined') {
          this._notifyTable('headerTemplate', headerTemplate);
      }
  }

  _hiddenChanged(hidden) {
      if (typeof hidden != 'undefined') {
          this._notifyTable('hidden', hidden);
      }
  }

  _orderChanged(order) {
      if (typeof order != 'undefined') {
          this._notifyTable('order', order);
      }
  }

  _templateChanged(template) {
      if (typeof template != 'undefined') {
          this._notifyTable('template', template);
      }
  }

  _widthChanged(width) {
      if (typeof width != 'undefined') {
          this._notifyTable('width', width);
      }
  }

  _filterByChanged(filterBy) {
      if (typeof filterBy != 'undefined') {
          this._notifyTable('filterBy', filterBy);
      }
  }

  _filterValueChanged(filterValue, filterBy) {
      if (typeof filterValue != 'undefined' || typeof filterBy != 'undefined') {
          this._notifyTable('filterValue', filterValue);
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

  _getParentDataTable() {
      if (_.isEmpty(this._table)) {
          let parentElement = ComponentHelper.getParentElement(this);
          if (parentElement && parentElement.tagName.toLowerCase() == "pebble-data-table") {
              this._table = parentElement;
          }
      }

      return this._table;
  }

  _addFilterChangedPubSub() {
      let pubsub = this.querySelector('bedrock-pubsub');

      if (!pubsub) {
          let pubsubEle = customElements.get("bedrock-pubsub");
          pubsub = new pubsubEle();
      }

      let eventName = this.name.replace(/ /g, '').toLowerCase() + 'filterchange' + '_' + this._getParentDataTable().id;
      pubsub.setAttribute('event-name', eventName);
      pubsub.setAttribute('handler', '_filterEvent');
      pubsub._filterEvent = this._filterEvent;
      dom(this).appendChild(pubsub);
  }

  _columnLinkClicked(e) {
    if (!_.isEmpty(this.columnObject) && this.columnObject.link) {
        window.history.pushState("", "", this.columnObject.link);
        window.dispatchEvent(new CustomEvent('location-changed'));
    }
  }

  _columHasLink(columnObject) {
      if (!_.isEmpty(columnObject) && columnObject.link) {
          return true;
      }
      return false;
  }
}
customElements.define(DataTableColumn.is, DataTableColumn);
