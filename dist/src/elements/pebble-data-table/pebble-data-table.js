import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import '@polymer/iron-list/iron-list.js';
import { IronResizableBehavior } from '@polymer/iron-resizable-behavior/iron-resizable-behavior.js';
import { IronScrollTargetBehavior } from '@polymer/iron-scroll-target-behavior/iron-scroll-target-behavior.js';
import { timeOut, microTask } from '@polymer/polymer/lib/utils/async.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { FlattenedNodesObserver } from '@polymer/polymer/lib/utils/flattened-nodes-observer.js';
import '../pebble-spinner/pebble-spinner.js';
import '../bedrock-style-manager/styles/bedrock-style-scroll-bar.js';
import '../bedrock-style-manager/styles/bedrock-style-tooltip.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-helpers/component-helper.js';
import '../pebble-icons/pebble-icons.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-spinner/pebble-spinner.js';
import './data-table-column.js';
import './data-table-column-sort.js';
import './data-table-cell.js';
import './data-table-row.js';
import './data-table-checkbox.js';
import './data-table-row-detail.js';
import './grid-selection-popover.js';
import { Base } from '@polymer/polymer/polymer-legacy.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { Settings } from '@polymer/polymer/lib/utils/settings.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
function ArrayDataSource(arr) {
  function _filter(items, filter) {
    if (filter.length === 0) {
      return items;
    }

    return Array.prototype.filter.call(items, function(item, index) {
      for (let i = 0; i < filter.length; i++) {
        let value = Base.get(filter[i].path, item);
        if ([undefined, null, ''].indexOf(filter[i].filter) > -1) {
          continue;
        } else if ([undefined, null].indexOf(value) > -1 ||
                    value.toString().toLowerCase().indexOf(filter[i].filter.toString().toLowerCase()) === -1) {
          return false;
        }
      }
      return true;
    });
  }

  function _compare(a, b) {
    return (a===undefined)-(b===undefined) ||  (a==='')-(b==='') || (a===null)-(b===null) || +(a>b)||-(a<b);
  }

  function _sort(items, sortOrder) {
    if (!sortOrder || sortOrder.length === 0) {
      return items;
    }

    let multiSort = function() {
      return function(a, b) {
        return sortOrder.map(function(sort) {
          if (sort.direction === 'asc') {
            return _compare(Base.get(sort.path, a), Base.get(sort.path, b));
          } else if (sort.direction === 'desc') {
            return _compare(Base.get(sort.path, b), Base.get(sort.path, a));
          }
          return 0;
        }).reduce(function firstNonZeroValue(p, n) {
          return p ? p : n;
        }, 0);
      };
    };

    // make sure a copy is used so that original array is unaffected.
    return Array.prototype.sort.call(items.slice(0), multiSort(sortOrder));
  }

  return function(opts, cb, err) {
    let filteredItems = _filter(arr, opts.filter);

    let sortedItems = _sort(filteredItems, opts.sortOrder);

    let start = opts.page * opts.pageSize;
    let end = start + opts.pageSize;
    let slice = sortedItems.slice(start, end);

    cb(slice, filteredItems.length);
  };
}
class PebbleDataTable extends mixinBehaviors([RUFBehaviors.UIBehavior, IronResizableBehavior,
IronScrollTargetBehavior
],
  OptionalMutableData(PolymerElement)) {
  static get template() {
    return Polymer.html`
    <style include="bedrock-style-scroll-bar bedrock-style-tooltip bedrock-style-icons bedrock-style-padding-margin">
      :host {
        display: block;
        position: relative;
        overflow-x: auto;
        overflow-y: hidden;
        height: 100%;
        @apply --pebble-data-table;

        --pebble-data-table-header: {
          min-height: 40px;
        }

        --pebble-data-table-row-odd: {
          background-color: var(--secondary-button-color, #ffffff);
        }

        --pebble-data-table-row: {
          align-items: center;
        }

        --text-collection-container: {
          margin-top: 0px;
        }

        --text-collection-container-readyonly-table: {
          margin-top: -6px;
        }

        --pebble-textbox-paper-input-style-table: {
          width: calc(100% - 25px);
        }
        --paper-input-container-input-table:{
          height: 26px;
        }

        --tags-container: {
          max-height: 28px;
          overflow-x:hidden;
          overflow-y:auto;
        }
        --autogrowtextarea: {
          min-height: 26px;
          box-sizing: border-box;
        }

        --tag-item-container: {
          height: 20px;
          line-height: 18px;
          margin-bottom: 2px;
        }
        --text-collection-container-table: {
          min-height: 22px;
        }
      }

      :host([loading]) {
        pointer-events: none;
      }

      :host([loading]) #list {
        opacity: 0.25;
      }

      :host(:not([loading])) pebble-spinner {
        display: none;
      }

      /* :host([loading]) pebble-spinner {
        position: absolute;
        top: 45%;
        left: 50%;
        --paper-spinner-color: var(--default-primary-color);
      } */

      #container {
        position: var(--data-table-container-position, absolute);
        left: 0;
        top: 0;
        bottom: 0;
        right: 0;
        display: -webkit-box;
        display: -moz-box;
        display: -ms-flexbox;
        display: -webkit-flex;
        display: flex;
        -webkit-box-orient: vertical;
        -moz-box-orient: vertical;
        -webkit-box-direction: normal;
        -moz-box-direction: normal;
        -webkit-flex-direction: column;
        -moz-flex-direction: column;
        -ms-flex-direction: column;
        flex-direction: column;
        @apply --data-table-container-position-dialog;
      }

      data-table-row[header] {
        font-weight: var(--font-bold, bold);
        color: var(--palette-cerulean, #036bc3);
        border-bottom: none;
        text-transform: uppercase;
        font-size: var(--table-head-font-size, 11px);
        position: fixed;
      }

      data-table-row:not([header]) {
        color: var(--palette-dark, #1a2028);
        font-size: var(--default-font-size, 12px);
        height: 100%;
        background-color: var(--palette-white, #ffffff);
        position: relative;
      }

      data-table-row:not([header]):hover,
      data-table-row[selected] {
        background-color: var(--table-row-selected-color, #c1cad4) !important;
      }

      data-table-row:not([header]):hover data-table-checkbox,
      data-table-row[selected] data-table-checkbox {
        background-color: var(--palette-white, #ffffff) !important;
      }

      data-table-row[header] {
        --pebble-direction-icon-button: {
          opacity: 0.7 !important;
        }
      }

      data-table-row data-table-cell {
        padding: 0 0 0 10px !important;
        justify-content: center;
      }

      data-table-row data-table-cell.check-filter {
        padding: 0 !important;
        flex-basis: 48px !important;
        flex-grow: 0;
        -webkit-box-orient: horizontal;
        -moz-box-orient: horizontal;
        -webkit-box-direction: normal;
        -moz-box-direction: normal;
        -webkit-flex-direction: row;
        -ms-flex-direction: row;
        flex-direction: row;
      }

      #header {
        box-shadow: 0 1px 0 rgba(0, 0, 0, 0.1);
        transition: box-shadow 200ms;
        -webkit-transition: box-shadow 200ms;
        background-color: var(--palette-white, #fff);
        @apply --pebble-data-table-header;
      }

      #header.scrolled {
        box-shadow: 0 1px 0 rgba(0, 0, 0, 0.06), 0 2px 0 rgba(0, 0, 0, 0.075), 0 3px 0 rgba(0, 0, 0, 0.05), 0 4px 0 rgba(0, 0, 0, 0.015);
      }

      #list {
        overflow-x: hidden !important;
        overflow-y: auto !important;
        flex: 1;
        transition: opacity 200ms;
        -webkit-transition: opacity 200ms;
        @apply --list;
      }

      /* IE edge specific fix for #list */

      _:-ms-lang(x),
      _:-webkit-full-screen,
      #list {
        transition: initial;
        -webkit-transition: initial;
      }

      .data-table-cell {
        position: relative;
      }

      #rowTracker {
        position: fixed;
        left: var(--tracker-left, 0px);
        top: var(--tracker-top, 0px);
        background-color: var(--bgColor-hover, #e8f4f9);
        z-index: 99999999;
        border: 2px solid var(--palette-cloudy-blue, #c1cad4);
        opacity: 0;
        pointer-events: none;
      }

      #rowTracker ul {
        list-style-type: none;
        padding: 0px;
        margin: 0px;
        display: -moz-box;
        display: -webkit-box;
        display: -webkit-flex;
        display: -ms-flexbox;
        display: flex;
      }

      #rowTracker ul li {
        padding: 10px 5px;
        min-width: 50px;
        text-align: center;
        max-width: 200px;
        text-overflow: ellipsis;
        /* overflow: hidden; commented as part of Edge perf. */
        white-space: nowrap;
      }

      /* cursor:var(--tracker-cursor,'pointer');*/

      :host>* {
        --pebble-data-table-row-cell: {
          background-color: var(--bgColor-hover, #e8f4f9);
        }

        --pebble-data-table-row-cell-after: {
          content: '';
          width: 100%;
          position: absolute;
          left: 0;
          bottom: 0px;
          border-bottom: var(--tracker-border-bottom, 0px) dotted #036bc3 !important;
        }

        --pebble-data-table-row-cell-after-header: {
          border-bottom: 0px !important;
        }
      }

      #rowTracker.fader {
        opacity: 1;
      }
    </style>
    <div id="container">
      <div id="header">
        <data-table-row header="" slot="header">
          <data-table-cell slot="data-table-cell-slot" class="check-filter" hidden\$="[[!enableMultiSelection]]">
            <template is="dom-if" if="[[!disableSelectAll]]">
              <data-table-checkbox header="" on-tap="_toggleSelectAll" slot="cell-slot-content" checked="[[_isSelectAllChecked(selectedItems.length, selectedItems.inverted, size)]]" indeterminate="[[_isSelectAllIndeterminate(selectedItems.length, size)]]"></data-table-checkbox>
              <template is="dom-if" if="[[advanceSelectionEnabled]]">
                <grid-selection-popover slot="cell-slot-content" selection-options="[[advanceSelectionOptions]]" id="gridSelectionPopover" on-selection-changed="_onPopoverSelectionChange"></grid-selection-popover>
              </template>
            </template>
          </data-table-cell>
          <template is="dom-repeat" items="[[columns]]" as="column" index-as="headIndex">
            <template is="dom-if" if="[[_isRowHeader(column)]]">
              <data-table-cell header="" frozen="" slot="data-table-cell-slot" align-right="[[column.alignRight]]" before-bind="[[beforeCellBind]]" column="[[column]]" classes="[[column.classes]]" flex="[[column.flex]]" hidden="[[column.hidden]]" order="[[column.order]]" table="[[_this]]" template="[[column.headerTemplate]]" width="[[column.width]]">
                <data-table-column-sort slot="cell-slot-content" sort-order="[[sortOrder]]" path="[[column.sortBy]]" on-sort-direction-changed="_sortDirectionChanged" hidden\$="[[!column.sortBy]]" direction="[[column.sortType]]" data-type="[[column.dataType]]"></data-table-column-sort>
              </data-table-cell>
            </template>
            <template is="dom-if" if="[[!_isRowHeader(column)]]">
              <data-table-cell header="" slot="data-table-cell-slot" align-right="[[column.alignRight]]" before-bind="[[beforeCellBind]]" column="[[column]]" classes="[[column.classes]]" flex="[[column.flex]]" hidden="[[column.hidden]]" order="[[column.order]]" table="[[_this]]" template="[[column.headerTemplate]]" width="[[column.width]]">
                <data-table-column-sort slot="cell-slot-content" sort-order="[[sortOrder]]" path="[[column.sortBy]]" on-sort-direction-changed="_sortDirectionChanged" hidden\$="[[!column.sortBy]]" direction="[[column.sortType]]" data-type="[[column.dataType]]"></data-table-column-sort>
              </data-table-cell>
            </template>
          </template>
        </data-table-row>
      </div>

      <!--Starts - Column select - Adds a row with checkboxes OR icons, on select will trigger an event-->
      <template is="dom-if" if="[[enableColumnSelect]]">
        <div class="item">
          <data-table-row name="columnSelectableRow">
            <template is="dom-repeat" items="[[columns]]" as="column" index-as="headIndex">
              <data-table-cell header="" slot="data-table-cell-slot" hidden="[[column.hidden]]">
                <div slot="cell-slot-content">
                  <template is="dom-if" if="[[!column.columnObject.selectable.isAction]]">
                    [[column.columnObject.selectable.text]]
                  </template>
                  <template is="dom-if" if="[[column.columnObject.selectable.isAction]]">
                    <template is="dom-if" if="[[!column.columnObject.selectable.actionIcon]]">
                      <pebble-checkbox id="cb_[[column.columnObject.name]]" value\$="[[column.columnObject.name]]" disabled\$="[[column.columnObject.selectable.disable]]" on-change="_onColumnSelectionChanged"></pebble-checkbox>
                    </template>
                    <template is="dom-if" if="[[column.columnObject.selectable.actionIcon]]">
                      <pebble-icon id="columnSelectionIcon" class="pebble-icon-size-16 tooltip-bottom m-l-20" data-tooltip\$="[[column.columnObject.selectable.actionIconTooltip]]" icon="[[column.columnObject.selectable.actionIcon]]" value\$="[[column.columnObject.name]]" hidden\$="[[column.columnObject.selectable.disable]]" on-tap="_onColumnSelectionChanged"></pebble-icon>
                    </template>
                  </template>
                </div>
              </data-table-cell>
            </template>
          </data-table-row>
        </div>
      </template>
      <!--Ends - Column select-->

      <iron-list id="list" as="item" items="[[_cachedItems]]" on-scroll="_onVerticalScroll">
        <template>
          <div class="item">
            <data-table-row class\$="{{_computePrimaryClass(item)}}" row-drag-drop-enabled="[[rowDragDropEnabled]]" before-bind="[[beforeRowBind]]" even="[[!_isEven(index)]]" expanded="[[_isExpanded(item, _expandedItems, _expandedItems.*)]]" index="[[index]]" item="[[item]]" selected="[[_isSelected(item, selectedItems, selectedItems.*)]]">
              <template is="dom-if" if="[[_isMultiSelectEnabled(enableMultiSelection)]]">
                <data-table-checkbox slot="data-table-checkbox-slot" hidden\$="[[!enableMultiSelection]]" tabindex="0" checked="[[_isSelected(item, selectedItems, selectedItems.*)]]" on-tap="_onCheckBoxTap" disabled\$="[[isDisabled(item)]]"></data-table-checkbox>
              </template>

              <template is="dom-if" if="[[_isRowFrozen(index)]]">
                <template is="dom-repeat" items="[[columns]]" as="column" index-as="colIndex">
                  <template is="dom-if" if="[[_isRowHeader(column)]]">
                    <data-table-cell frozen="" frozen-row="" class="data-table-cell" header="" slot="row-header" template="[[column.template]]" table="[[_this]]" align-right="[[column.alignRight]]" column="[[column]]" expanded="[[_isExpanded(item, _expandedItems, _expandedItems.*)]]" classes="[[column.classes]]" flex="[[column.flex]]" hidden="[[column.hidden]]" index="[[index]]" item="[[item]]" on-click="_onCellClick" order="[[column.order]]" selected="[[_isSelected(item, selectedItems, selectedItems.*)]]" width="[[column.width]]" before-bind="[[beforeCellBind]]" on-dblclick="_rowDblClicked"></data-table-cell>
                  </template>
                  <template is="dom-if" if="[[!_isRowHeader(column)]]">
                    <data-table-cell frozen-row="" class="data-table-cell" slot="data-table-cell-slot" template="[[column.template]]" table="[[_this]]" align-right="[[column.alignRight]]" column="[[column]]" expanded="[[_isExpanded(item, _expandedItems, _expandedItems.*)]]" classes="[[column.classes]]" flex="[[column.flex]]" hidden="[[column.hidden]]" index="[[index]]" item="[[item]]" on-click="_onCellClick" order="[[column.order]]" selected="[[_isSelected(item, selectedItems, selectedItems.*)]]" width="[[column.width]]" before-bind="[[beforeCellBind]]" on-dblclick="_rowDblClicked"></data-table-cell>
                  </template>
                </template>

              </template>

              <template is="dom-if" if="[[!_isRowFrozen(index)]]">

                <template is="dom-repeat" items="[[columns]]" as="column" index-as="colIndex">
                  <template is="dom-if" if="[[_isRowHeader(column)]]">
                    <data-table-cell frozen="" class="data-table-cell" header="" slot="row-header" template="[[column.template]]" table="[[_this]]" align-right="[[column.alignRight]]" column="[[column]]" expanded="[[_isExpanded(item, _expandedItems, _expandedItems.*)]]" classes="[[column.classes]]" flex="[[column.flex]]" hidden="[[column.hidden]]" index="[[index]]" item="[[item]]" on-click="_onCellClick" order="[[column.order]]" selected="[[_isSelected(item, selectedItems, selectedItems.*)]]" width="[[column.width]]" before-bind="[[beforeCellBind]]" on-dblclick="_rowDblClicked"></data-table-cell>
                  </template>
                  <template is="dom-if" if="[[!_isRowHeader(column)]]">
                    <data-table-cell class="data-table-cell" slot="data-table-cell-slot" template="[[column.template]]" table="[[_this]]" align-right="[[column.alignRight]]" column="[[column]]" expanded="[[_isExpanded(item, _expandedItems, _expandedItems.*)]]" classes="[[column.classes]]" flex="[[column.flex]]" hidden="[[column.hidden]]" index="[[index]]" item="[[item]]" on-click="_onCellClick" order="[[column.order]]" selected="[[_isSelected(item, selectedItems, selectedItems.*)]]" width="[[column.width]]" before-bind="[[beforeCellBind]]" on-dblclick="_rowDblClicked"></data-table-cell>
                  </template>
                </template>

              </template>

              <template is="dom-if" if="[[_isExpanded(item, _expandedItems)]]" on-dom-change="_updateSizeForItem">
                <data-table-row-detail slot="data-table-row-detail-slot" index="[[index]]" item="[[item]]" expanded="[[_isExpanded(item, _expandedItems, _expandedItems.*)]]" selected="[[_isSelected(item, selectedItems, selectedItems.*)]]" before-bind="[[beforeDetailsBind]]" table="[[_this]]" template="[[rowDetail]]" on-dblclick="_rowDblClicked"></data-table-row-detail>
              </template>
            </data-table-row>
          </div>
        </template>
      </iron-list>
      <div id="rowTracker">
        <ul></ul>
      </div>
    </div>
    <pebble-spinner active="{{loading}}"></pebble-spinner>
    <bedrock-pubsub event-name="row-dropped" handler="_onRowDropped" target-id=""></bedrock-pubsub>
    <bedrock-pubsub event-name="drag-started" handler="_onDragStarted" target-id=""></bedrock-pubsub>
    <bedrock-pubsub event-name="drag-inprogress" handler="_onDragInProgress" target-id=""></bedrock-pubsub>
    <bedrock-pubsub event-name="drag-ended" handler="_onDragEnd" target-id=""></bedrock-pubsub>
    <slot name="column-slot"></slot>
    <slot name="row-detail"></slot>
`;
  }

  static get is() {
    return "pebble-data-table";
  }
  static get properties() {
    return {

      /**
       * Timeout after which the data on the currently visible page will be automatically
       * refreshed after an item has been changed through a two-way binding.
       */
      autoRefresh: {
        type: Number
      },

      /**
       * A function that is called before data is bound to a row or header cell.
       * Can be used to customize the cell element depending on the data.
       * #### Example:
       * ```js
       * function(data, cell) {
       *   cell.toggleClass('custom', data.useCustomClass);
       * }
       * ```
       */
      beforeCellBind: {
        type: Object
      },

      /**
       * A function that is called before data is bound to a row details element.
       * Can be used to customize the element depending on the data.
       * #### Example:
       * ```js
       * function(data, details) {
       *   details.toggleClass('custom', data.useCustomClass);
       * }
       * ```
       */
      beforeDetailsBind: {
        type: Object
      },

      /**
       * A function that is called before data is bound to a row.
       * Can be used to customize the row element depending on the data.
       * #### Example:
       * ```js
       * function(data, row) {
       *   row.toggleClass('custom', data.useCustomClass);
       * }
       * ```
       */
      beforeRowBind: {
        type: Object
      },

      /**
       * An array containing the items which will be stamped to the column template
       * instances.
       */
      items: {
        type: Array,
        notify: true,
      },

      /**
       * If `true`, tapping a row will expand the item details, if available.
       */
      detailsEnabled: {
        type: Boolean,
        value: false
      },

      /**
       * An array containing path/filter value pairs that are used to filter the items
       */
      filter: {
        type: Array,
        notify: true,
        value: function () {
          return [];
        }
      },

      /**
       * When `true`, multiple items may be selected at once (in this case,
       * `selected` is an array of currently selected items).  When `false`,
       * only one item may be selected at a time.
       */
      multiSelection: {
        type: Boolean,
        value: false
      },

      enableMultiSelection: {
        type: Boolean,
        value: false
      },
      /**
       * When `true`, All items cannot be selected at once, 
       * but with multiSelection multiple items can be selected. When `false`,
       * with multiSelection multiple items may be selected at once
       */
      disableSelectAll: {
        type: Boolean,
        value: false
      },

      /**
       * Number of items fetched at a time from the datasource.
       */
      pageSize: {
        type: Number,
        value: 50
      },

      /**
       * If `true`, tapping a row will select the item.
       */
      selectionEnabled: {
        type: Boolean,
        value: false
      },

      /**
       * This is the currently selected item, or `null`
       * if no item is selected.
       */
      selectedItem: {
        type: Object,
        readOnly: true,
        notify: true
      },

      /**
       * When `multiSelection` is true, this is an array that contains the selected items.
       * If `selectedItems.inverted` is `true`, the array contains deselected items instead.
       * `selectedItems.filters` contains an array of filters that were active when the selection changed.
       */
      selectedItems: {
        type: Object,
        notify: true,
        readOnly: true,
        value: function () {
          let items = [];
          items.filters = [];

          return items;
        }
      },

      /**
       * Size of the data set.
       */
      size: {
        type: Number,
        notify: true,
        value: 0,
        observer: '_sizeChanged'
      },

      /**
       * An array with a path/sortorder ('asc' or 'desc') pairs that are used to sort the items.
       */
      sortOrder: {
        type: Array,
        notify: true,
        value: function () {
          return [];
        }
      },

      /**
       * An array of `data-table-column` elements which contain the templates
       * to be stamped with items.
       */
      columns: {
        type: Array,
        notify: true,
        value: function () {
          return [];
        },
        observer: '_columnsChanged'
      },

      rows: {
        type: Array,
        notify: true,
        value: function () {
          return [];
        }
      },

      /**
       * Function that provides items lazily. Receives parameters `opts`, `callback`, `err`
       *
       * `opts.page` Requested page index
       *
       * `opts.pageSize` Current page size
       *
       * `opts.filter` Current filter parameters
       *
       * `opts.sortOrder` Current sorting parameters
       */
      rDataSource: {
        type: Object,
        notify: true
      },

      _pagesLoading: {
        type: Array,
        value: function () {
          return [];
        },
      },

      /**
       * `true` if the table is currently loading data from the data source.
       */
      loading: {
        type: Boolean,
        notify: true,
        reflectToAttribute: true,
        value: false
      },

      _cachedItems: {
        type: Array,
        value: function () {
          return [];
        }
      },

      _cachedPages: {
        type: Array,
        value: function () {
          return [];
        }
      },

      _currentPage: {
        type: Number,
        value: 0
      },
      advanceSelectionEnabled: {
        type: Boolean,
        value: false
      },
      advanceSelectionOptions: {
        type: Array,
        value: function () {
          return [];
        }
      },
      _expandedItems: {
        type: Array,
        value: function () {
          return [];
        }
      },
      _this: {
        type: Object,
        value: function () {
          return this;
        }
      },
      selectionInfo: {
        type: Object,
        value: function () {
          return {}
        },
        notify: true
      },
      deletedItems: {
        type: Array,
        value: function () {
          return [];
        },
        notify: true
      },
      minFilterLength: {
        type: Number,
        value: 2
      },
      rowDetail: {
        type: Object,
        value: function () {
          return this;
        }
      },
      _disableGridCheckbox: {
        type: Boolean,
        value: false
      },
      rowDragDropEnabled: {
        type: Boolean
      },
      topVirtualDomRowCount: {
        type: Number
      },
      setIntervelDragDownFlag: {
        type: Boolean
      },
      setIntervelDragDown: {
        type: Number
      },
      setIntervelDragUpFlag: {
        type: Boolean
      },
      setIntervelDragUp: {
        type: Number
      },
      enableColumnSelect: {
        type: Boolean,
        value: false
      },
      enableColumnMultiSelect: {
        type: Boolean,
        value: false
      }
    }
  }
  static get observers() {
    return [
      '_itemsChanged(items.*)',
      '_currentPageChanged(rDataSource, _currentPage, filter)',
      '_resetData(rDataSource, filter.*, sortOrder.*)'
    ]
  }
  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('column-filter-changed', this._onColumnFilterChanged);
    this.addEventListener('iron-resize', this._resizeCellContainers);
    this.addEventListener('item-changed', this._itemChanged);
    this.addEventListener('scroll', this._onHorizontalScroll);
    this._observer = new FlattenedNodesObserver(this, function (info) {
      let hasColumns = function (node) {
        return (node.nodeType === Node.ELEMENT_NODE && node.tagName.toUpperCase() === 'DATA-TABLE-COLUMN');
      };

      let hasDetails = function (node) {
        return (node.nodeType === Node.ELEMENT_NODE &&
          node.tagName.toUpperCase() === 'TEMPLATE' && node.hasAttribute('is') &&
          node.getAttribute('is') === 'row-detail');
      };

      if (info.addedNodes.filter(hasColumns).length > 0 ||
        info.removedNodes.filter(hasColumns).length > 0) {
        let cols = this.shadowRoot.querySelector('[name=column-slot]')
          .assignedNodes({
            flatten: true
          }).filter(n => n.nodeType === Node.ELEMENT_NODE);

        this.set('columns', cols);
        //this.set('columns', this.shadowRoot.querySelector('slot[select=data-table-column]').assignedNodes({flatten:true})
        //            .filter(n => n.nodeType === Node.ELEMENT_NODE));
        //this.$.list.notifyResize();
      }

      if (info.addedNodes.filter(hasDetails).length > 0) {
        let rowDetails = this.shadowRoot.querySelector('[name=row-detail]').assignedNodes({
          flatten: true
        }).filter(n => n.nodeType === Node.ELEMENT_NODE);
        if (rowDetails.length > 0) {
          this.set('rowDetail', rowDetails[0]);
        }
        // assuming parent element is always a Polymer element.
        // set dataHost to the same context the template was declared in
        let parent = dom(this.rowDetail).parentNode;
        this.rowDetail._rootDataHost = parent.dataHost ? (parent.dataHost._rootDataHost || parent.dataHost) :
          parent;
      }

    }.bind(this));

    this.scrollTarget = this;

    this._rowTracker = this.shadowRoot.getElementById('rowTracker');
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('column-filter-changed', this._onColumnFilterChanged);
    this.removeEventListener('iron-resize', this._resizeCellContainers);
    this.removeEventListener('item-changed', this._itemChanged);
    this.removeEventListener('scroll', this._onHorizontalScroll);
  }
  notifyResize() {
    //this.$.list.notifyResize();
  }
  _stopPropagation(e) {
    e.stopImmediatePropagation();
  }

  /**
   * Select the list item at the given index.
   *
   * @method selectItem
   * @param {(Object|number)} item The item object or its index
   */
  selectItem(item) {
    if (this.advanceSelectionEnabled == true) {
      this._resetAdvanceSelection();
    }
    if (typeof item === 'number' && item >= 0 && this.items && this.items.length > item) {
      this._selectItem(this.items[item]);
    } else {
      this._selectItem(item);
    }
  }

  _selectItem(item) {
    this._setSelectedItem(item);

    if (this.multiSelection) {
      if (this.selectedItems.inverted) {
        let index;
        if ((index = this.selectedItems.indexOf(item)) > -1) {
          this.splice('selectedItems', index, 1);
        }
      } else {
        this.push('selectedItems', item);
      }
    } else {
      this.splice('selectedItems', 0, this.selectedItems.length, item);
    }
  }

  _onPopoverSelectionChange(e) {
    this.clearSelection();
    this._disableGridCheckbox = false;
    this.$.list.scrollToIndex(0);
    if (e.detail) {
      if (e.detail.mode == "count") {
        let selectionCount = e.detail.itemCount;
        let entityList = this._cachedItems;
        let searchSelectedItems
        if (entityList.length >= selectionCount) {
          searchSelectedItems = entityList.slice(0, selectionCount);
          searchSelectedItems.forEach(function (value, key) {
            if (value) {
              this._selectItem(value);
            }
          }.bind(this));
        } else {
          this.selectAll();
        }
      }
      if (e.detail.mode == "query") {
        this.selectAll();
        this._disableGridCheckbox = true;
      }
      this.set('selectionInfo', e.detail);
    }
  }

  /**
   * Deselects the given item list if it is already selected.
   *
   * @method deselect
   * @param {(Object|number)} item The item object or its index
   */
  deselectItem(item) {
    if (this.advanceSelectionEnabled == true) {
      this._resetAdvanceSelection();
    }
    if (typeof item === 'number' && item >= 0 && this.items && this.items.length > item) {
      this._deselectItem(this.items[item]);
    } else {
      this._deselectItem(item);
    }
  }

  _deselectItem(item) {
    this.checkAll = false;
    this._setSelectedItem(null);

    let index = this.selectedItems.indexOf(item);

    if (this.selectedItems.inverted) {
      if (index === -1) {
        if (this.items) {
          this.selectedItems.inverted = false;
          let selectedItems = this.items;
          let unselectedIndex = selectedItems.indexOf(item);
          this._setSelectedItems(selectedItems);
          this.splice('selectedItems', unselectedIndex, 1);
        } else {
          this.push('selectedItems', item);
        }
      }
    } else {
      if (index > -1) {
        this.splice('selectedItems', index, 1);
      }
    }
  }

  _isSelected(item, selectedItems) {
    //if everything is checked we do not need
    //to compute for each and every checkbox
    // simply return true.
    if (this.checkAll) {
      return true;
    }
    let selected = selectedItems.indexOf(item) > -1;
    return selectedItems.inverted ? !selected : selected;
  }

  isDisabled(item) {
    return item.disabled;
  }
  /*
   * Selects all the items in the list.
   */
  selectAll() {
    //When the filter is enabled, fetch the all selected items from the filtered list
    if (this.items) {
      let selectedItems = this._getValidSelectedItems();
      this._setSelectedItems(selectedItems);
      return;
    }

    let selectedItems = [];
    selectedItems.inverted = true;
    // use a copy of filter so that we can safely send separate changed
    // notifications for both filter and selectedItems.filter
    selectedItems.filters = this.filter.slice(0) || [];

    if (selectedItems.inverted === true && selectedItems.filters.length === 0) {
      this.checkAll = true;
    }
    this._setSelectedItems(selectedItems);
  }

  /**
   * Clears the current selection state.
   */
  clearSelection() {
    let selectedItems = [];
    selectedItems.inverted = false;
    // use a copy of filter so that we can safely send separate changed
    // notifications for both filter and selectedItems.filter
    selectedItems.filters = this.filter.slice(0) || [];

    //Clear the selection even if the filter is changed
    if (selectedItems.inverted === false) {
      this.checkAll = false;
    }

    this._setSelectedItems(selectedItems);

    if (this.selectedItem !== undefined) {
      this._setSelectedItem(null);
    }
  }
  resetAdvanceSelection() {
    this._resetAdvanceSelection();
  }
  _resetAdvanceSelection() {
    this._gridSelectionPopover = this._gridSelectionPopover || this.querySelector("#gridSelectionPopover");
    if (this._gridSelectionPopover) {
      this._gridSelectionPopover.resetSelection();
      this.set('selectionInfo', '{}');
      this._disableGridCheckbox = false;
    }
  }

  _toggleSelectAll() {
    this._resetAdvanceSelection();

    //If disabled item exists, select or unselect the active items only
    let isItemDisabled = _.find(this.items, function (item) {
      return item.disabled == true;
    });
    if (isItemDisabled) {
      if (this._isSelectAllChecked(this.selectedItems.length, this.selectedItems.inverted, this.selectedItems.length)) {
        this.clearSelection();
      } else {
        let selectedItems = this._getValidSelectedItems();
        this._setSelectedItems(selectedItems);
      }
    } else {
      if (this._isSelectAllChecked(this.selectedItems.length, this.selectedItems.inverted, this.size)) {
        this._fireEvent("deselecting-all-items", {
          items: this.selectedItems
        }, this.clearSelection);
      } else {
        this._fireEvent("selecting-all-items", {
          items: this.selectedItems
        }, this.selectAll);
      }
    }
  }

  /**
   *  Function to get the enabled and/or filtered items if any
   */
  _getValidSelectedItems() {

    if (this.items) {
      //Ignore the disabled items
      let enabledItems = [];
      //When the filter is enabled, fetch the all selected items from the filtered list
      if (this.selectedItems && this.selectedItems.filters && this.selectedItems.filters.length > 0) {
        let filterItems = _.filter(this.selectedItems.filters, function (item) {
          return item.filter != ""
        });
        if (!_.isEmpty(filterItems)) {
          enabledItems = _.filter(this.$.list.items, function (currentElement) {
            if (!currentElement.disabled) {
              return currentElement;
            }
          });
          return enabledItems;
        }
      }
      enabledItems = _.filter(this.items, function (currentElement) {
        if (!currentElement.disabled) {
          return currentElement;
        }
      });
      return enabledItems;
    } else {
      this.logWarning("Items not loaded in the pebble-data-table");
    }

  }

  _isSelectAllChecked(selectedItemsLength, inverted, size) {
    return size > 0 && selectedItemsLength === (inverted ? 0 : size);
  }

  _isSelectAllIndeterminate(length, size) {
    return size > 0 && length > 0 && length < size;
  }

  _isEven(index) {
    return index % 2 === 0;
  }

  _isMultiSelectEnabled(enableMultiSelection) {
    return this.enableMultiSelection;
  }
  _resetData(rDataSource, filter, sortOrder) {
    // Resetting scroll position and selection for consistency here. They are
    // both reset implicitly when a new _cachedItems is set to iron-list, but
    // that doesn't happen when size of the dataset changes only by a few items.
    this.clearSelection();
    this.clearCache(filter);
    if (this.deletedItems && this.deletedItems.length) {
      this.deletedItems = [];
      this._currentPage = 0;
    }
    this.$.list.scrollToIndex(0);

  }

  _sortDirectionChanged(e) {
    // Sorting added in UI instead of RDF 
    if (e.detail.path && e.detail.direction) {
      let path = e.detail.path;
      let sortedArray = DataHelper.cloneObject(this._cachedItems);
      sortedArray = DataHelper.sort(sortedArray, path, e.detail.dataType, e.detail.direction);
      this.set("items", sortedArray);
    }
  }

  _columnsChanged(columns, oldColumns) {
    if (oldColumns) {
      oldColumns.forEach(function (column) {
        this.unlisten(column, 'filter-value-changed');
      }.bind(this));
    }

    if (columns) {
      columns.forEach(function (column) {
        column.table = this;
        this.listen(column, 'filter-value-changed', '_onColumnFilterChanged');
      }.bind(this));
    }
  }

  _onColumnFilterChanged(e) {

    this._debounceFilterChanged = Debouncer.debounce(this._debounceFilterChanged, timeOut
      .after(500), () => {
        let str = e.detail.value;
        if (typeof (str) === "string") {
          let length = str.replace(/\s/g, '').length;
          if (length > 0 && length < this.minFilterLength) {
            return;
          }
        }

        for (let i = 0; i < this.filter.length; i++) {
          if (this.filter[i].path === e.detail.filterBy) {
            this.set('filter.' + i + '.filter', e.detail.value);

            // selectedItems.filter is actually already set at this point when
            // clearSelection is called after filter is set.
            this.set('selectedItems.filters.' + i + '.filter', e.detail.value);
            return;
          }
        }

        if ((this.filter.length == 0 && e.detail.value != "") || (this.filter.length && !this.filter.find(v => v.path == e.detail.filterBy))) {
          this.push('filter', {
            path: e.detail.filterBy,
            filter: e.detail.value
          });

          this.push('selectedItems.filters', {
            path: e.detail.filterBy,
            filter: e.detail.value
          });
        }
      });
  }

  getFilteredItems() {
    if (this.size == this._cachedItems.length)
      return this._cachedItems;
  }
  _resizeCellContainers() {
    // reset header width first to make the cells and scroll width to reset their widths.
    this.$.container.style.width = '';

    microTask.run(() => {
      this.$.container.style.width = Math.min(this.scrollWidth, this.clientWidth + this.scrollLeft) + 'px';

      // add scrollbar width as padding
      this.$.header.style.paddingRight = this.$.list.offsetWidth - this.$.list.clientWidth + 'px';
    });
  }

  _onHorizontalScroll() {
    if (!this.isDebouncerActive('scrolling')) {
      this.$.container.style.width = this.scrollWidth + 'px';
      this._debouncerScroll = Debouncer.debounce(this._debouncerScroll, timeOut.after(
        1000), () => {
          this.$.container.style.width = Math.min(this.scrollWidth, this.clientWidth + this.scrollLeft) +
            'px';
          // long timeout here to prevent jerkiness with the rubberband effect on iOS especially.
        });
    }

    this._freezeDataTableCells();
  }
  _deletedItemsChanged() {
    //This function will add an offset to current page value so that if we have deleted items then also our datasource logic may work fine
    if (this.deletedItems && this.deletedItems.length && this.$.list._physicalAverage > 0) {
      let currentElementIndex = this.$.list.scrollTop / this.$.list._physicalAverage;
      this._currentPage = Math.max(0, Math.floor((currentElementIndex + this.deletedItems.length) / this.pageSize));
    }
  }

  _onVerticalScroll(e) {
    // Toggle shadow when at the top
    this.toggleClass("scrolled", this.$.list.scrollTop >= 1, this.$.header);

    if (this.deletedItems && this.deletedItems.length) {
      let currentElementIndex = this.$.list.scrollTop / this.$.list._physicalAverage;
      this._currentPage = Math.max(0, Math.floor((currentElementIndex + this.deletedItems.length) / this.pageSize));
    } else {
      this._currentPage = Math.max(0, Math.floor(this.$.list.scrollTop / this.$.list._physicalAverage / this.pageSize));
    }

    this._freezeDataTableCells(true);
  }
  /**
   * Lazy loading
   */
  _itemsChanged(items) {
    if (items != undefined) {
      if ((items.path === 'items' || items.path === 'items.splices') && Array.isArray(items.base)) {
        this.size = items.base.length;
        this.rDataSource = new ArrayDataSource(items.base);
        this.set('_cachedItems', DataHelper.cloneObject(items.base));
      } else if (items.path.indexOf('items.#') === 0 && Array.isArray(items.base)) {
        let index = items.path.split('.')[1].substring(1);
        let item = this.items[index];

        let cachedIndex = this._cachedItems.indexOf(item);

        if (cachedIndex >= 0) {
          this.set(items.path.replace('items.', '_cachedItems.').replace('#' + index, cachedIndex), items.value);
        }
      }
    }
  }

  _itemChanged(e) {
    if (this.items) {
      let index = this.items.indexOf(e.detail.item);
      if (index >= 0) {
        this.set('items.' + index + '.' + e.detail.path, e.detail.value);
      }
    }

    if (this.autoRefresh !== undefined) {
      this._debouncerItemChanged = Debouncer.debounce(this._debouncerItemChanged, timeOut
        .after(this.autoRefresh), () => {
          this.refreshPage(this._currentPage);
        });
    }
  }

  _currentPageChanged(rDataSource, page, filter) {
    if (!(rDataSource === undefined || page === undefined)) {
      if (!this._isPageCached(page)) {
        this.loading = true;
      }

      this._debouncerPageChanged = Debouncer.debounce(this._debouncerPageChanged, timeOut
        .after(100), () => {
          this._loadPage(rDataSource, page);
          if (page + 1 < (this.size / this.pageSize)) {
            this._loadPage(rDataSource, page + 1);
          }

          if (page > 0) {
            this._loadPage(rDataSource, page - 1);
          }

          if (filter && filter.base && filter.base.length > 0) {
            this._fireEvent('items-filtered');
          }
        });
    }
  }

  _isPageLoading(page) {
    return this._pagesLoading.indexOf(page) > -1;
  }

  _addLoadingPage(page) {
    if (!this._isPageLoading(page)) {
      this.push('_pagesLoading', page);
    }

    this.loading = this._pagesLoading.length > 0;
  }

  _removeLoadingPage(page) {
    let index = this._pagesLoading.indexOf(page);
    if (index !== -1) {
      this.splice('_pagesLoading', index, 1);
    }

    this.loading = this._pagesLoading.length > 0;
  }

  _isPageCached(page) {
    return this._cachedPages && this._cachedPages.indexOf(page) > -1;
  }

  _loadPage(rDataSource, page) {
    if (this._isPageCached(page)) {
      this._removeLoadingPage(page);
    } else if (!this._isPageLoading(page)) {
      this._addLoadingPage(page);
      this._fireEvent('is-data-loaded', false);
      rDataSource({
        page,
        pageSize: this.pageSize,
        filter: this.filter,
        sortOrder: this.sortOrder,
        viewMode: "tabular"
      }, this.success.bind(this, page), err => this._removeLoadingPage(page));
    }
  }

  success(page, items, size) {
    this.push('_cachedPages', page);

    if (size !== undefined) {
      this.size = size;
    }
    let start = this.deletedItems && page ? page * this.pageSize - this.deletedItems.length : page * this.pageSize;

    for (let i = 0; i < items.length; i++) {
      let index = start + i;
      let item = items[i];

      this.set('_cachedItems.' + index, item);

      // TODO: send an issue/pr to iron-list, that makes sure the internal
      // collection stays up-to-date when `items` change.
      // When _collection gets out-of-sync things like selection and
      // notifying [[item]] bindings break.
      if (this.$.list._collection) {
        this.$.list._collection.store[index] = item;
        if (item && typeof item == 'object') {
          this.$.list._collection.omap.set(item, index);
        } else {
          this.$.list._collection.pmap[item] = index;
        }
      }

    }

    if (items.length < this.pageSize && this.deletedItems.length) {
      //In case, we get less items then pagesize and there are some deleted items. Then calling this function which  will add an offset to current page value so that if we have deleted items then also our datasource logic may work fine
      this._deletedItemsChanged();
    }
    // resize required for variable row height items.
    // debouncing for optimizing when multiple requests are running at
    // the same time.
    this._debouncerLoadPage = Debouncer.debounce(this._debouncerLoadPage, timeOut.after(
      100), () => {
        //this.$.list.notifyResize();
        this.$.list._resizeHandler();
      });

    this._removeLoadingPage(page);
    this._fireEvent('is-data-loaded', true);

    this.enableMultiSelection = !!(this.multiSelection && this._cachedItems && this._cachedItems.length);
  }

  _sizeChanged(size, oldSize) {
    // Optimization: Calling `set` on _cachedItems will reset the scroll position and selections,
    // using `push` and `pop` with large changes (more than 1000 items) is a heavy operation
    // that jams things up.
    if (this._cachedItems && Math.abs(this._cachedItems.length - size) < this.pageSize * 2) {
      while (this._cachedItems.length < size) {
        this.push('_cachedItems', {});
      }

      while (this._cachedItems.length > size) {
        this.pop('_cachedItems');
      }
    } else {
      let items = [];

      while (items.length < size) {
        items.push({});
      }

      this.set('_cachedItems', items);
    }

    // when size increases, old last page needs to be refreshed.
    if (size > oldSize) {
      let oldLastPage = Math.floor(oldSize / this.pageSize);
      let offset = 0;
      if (this.deletedItems.length) {
        offset = (this.deletedItems.length / this.pageSize) + 1;
      }
      if (this._isPageCached(oldLastPage) || oldLastPage - offset === 0) {
        this.refreshPage(oldLastPage);
      }
    }
  }

  /**
   * Clears the cached pages and reloads data from datasource when needed.
   */
  clearCache(filter) {
    this._cachedPages = [];
    this._currentPage = 0;

    // Force reload on currently visible pages.
    this.refreshPage(this._currentPage, filter);
  }

  /**
   * Clears the cache for a page and reloads the data from datasource.
   */
  refreshPage(page, filter) {
    if (this._cachedPages) {
      let index = this._cachedPages.indexOf(page);
      if (index > -1) {
        this.splice('_cachedPages', index, 1);
      }
    }

    // When ever refresh request comes to pebble-data-table this variable has to be empty.
    // If it's not getting reset then in case of 2 sequential request it will fail and grid will be keep on loading.
    // pebble-data-table loads two pages on first load so this variable will be filled with first [0] and then [0,1] and as soon as 0th page get loaded
    // this array value will be [1] and so on it will be come empty on 2 pages load complete. 
    // SO in case of two request first is running and _pagesLoading state is [1] then for first page it will add and remove "0" an will become [0, 1] 
    // but for second page "1" will not be added newly in this variable and considered as it's still loading and grid will get stuck.
    this._pagesLoading = [];

    this._currentPageChanged(this.rDataSource, page, filter);
  }

  _updateSizeForItem(event) {
    if (event.model.get('item')) {
      // notifyResize() doesn't do anything on iOS if the viewport size hasn't changed
      // so calling updateSizeForItem(item) is more reliable.

      // TODO: However, since we're reusing the same items array in most cases,
      // the _collection item map inside <iron-list> gets out of sync and
      // that breaks things like selection and updateSizeForItem.
      // To mitigate the issue, we'll update height of every row element.
      // Can be optimized later if needed to update only the row that has
      // expanded or collapsed.
      let itemSet = [];
      for (let i = 0; i < this.$.list._physicalItems.length; i++) {
        itemSet.push(i);
      }

      // extracted from updateSizeFromItem(item) in <iron-list>
      this.$.list._updateMetrics(itemSet);
      this.$.list._positionItems();
    }
  }

  /**
   * Expands the row details for this item, if available.
   */
  expandItem(item) {
    if (this.rowDetail && this._expandedItems && !this._isExpanded(item, this._expandedItems)) {

      // replacing the whole array here to simplify the observers.
      this._expandedItems.push(item);
      this._expandedItems = this._expandedItems.slice(0);
    }
  }

  /**
   * Collapses the row details for this item, if expanded.
   */
  collapseItem(item) {
    if (this.rowDetail && this._expandedItems && this._isExpanded(item, this._expandedItems)) {
      let index = this._expandedItems.indexOf(item);

      // replacing the whole array here to simplify the obsevers.
      this._expandedItems.splice(index, 1);
      this._expandedItems = this._expandedItems.slice(0);
    }
  }

  _isExpanded(item, items) {
    return items && items.indexOf(item) > -1;
  }

  _isFocusable(target) {
    if (Settings.useNativeShadow) {
      // https://nemisj.com/focusable/
      // tabIndex is not reliable in IE.
      return target.tabIndex >= 0;
    }
    // unreliable with Shadow, document.activeElement doesn't go inside
    // the shadow root.
    return target.contains(dom(document.activeElement).node) || target.tagName.toUpperCase() === 'A';
  }

  /**
   * Fired when user clicks on a item to select it.
   *
   * @event selecting-item
   * @param {Object} detail
   * @param {Object} detail.item item to be selected
   */

  /**
   * Fired when user clicks on a item to deselect it.
   *
   * @event deselecting-item
   * @param {Object} detail
   * @param {Object} detail.item item to be deselected
   */

  /**
   * Fired when user clicks on the select all checkbox to select items.
   *
   * @event selecting-all-items
   * @param {Object} detail
   * @param {Object} detail.items currently selected items
   */

  /**
   * Fired when user clicks on the select all checkbox to deselect items.
   *
   * @event deselecting-all-items
   * @param {Object} detail
   * @param {Object} detail.items currently selected items
   */

  /**
   * Fired when user clicks on a item to expand it.
   *
   * @event expanding-item
   * @param {Object} detail
   * @param {Object} detail.item item to be expanded
   */

  /**
   * Fired when user clicks on a item to collapse it.
   *
   * @event collapsing-item
   * @param {Object} detail
   * @param {Object} detail.item item to be collapsed
   */

  // we need to listen to click instead of tap because on mobile safari, the
  // document.activeElement has not been updated (focus has not been shifted)
  // yet at the point when tap event is being executed.
  _onCellClick(e) {
    // Prevent item selection if row itself is not focused. This means that
    // an element inside the row has been focused.
    // Mobile devices don't move focus from body unless it's an input element that is focused, so this element will never get focused.
    if (this._isFocusable(e.target)) {
      return;
    }
    if (this.rowDetail && this.detailsEnabled) {
      if (this._isExpanded(e.model.item, this._expandedItems)) {
        this._fireEvent('collapsing-item', e.model.item, this.collapseItem);
      } else {
        this._fireEvent('expanding-item', e.model.item, this.expandItem);
      }
    }

    if (this.selectionEnabled) {
      this._debounceSelectionChanged = Debouncer.debounce(this._debounceSelectionChanged, timeOut.after(250), () => {
          this._toggleSelectingEvent(e);
        });
    }
  }

  _fireEvent(eventName, item, defaultAction) {
    let e = this.dispatchEvent(new CustomEvent(eventName, {
      detail: {
        item: item
      },
      cancelable: true,
      bubbles: true,
      composed: true
    }));
    if (!e.defaultPrevented && defaultAction) {
      defaultAction.call(this, item);
    }
  }

  _onCheckBoxTap(e) {
    //If the checkbox is disabled do not handle click
    if (e.model.item.disabled) {
      return;
    }
    if (this.selectionInfo && this.selectionInfo.mode == "query") {
      return;
    }
    this._resetAdvanceSelection();
    this._toggleSelectingEvent(e);
  }

  _toggleSelectingEvent(e) {
    if (this._isSelected(e.model.item, this.selectedItems)) {
      this._fireEvent('deselecting-item', e.model.item, this.deselectItem);
    } else {
      this._fireEvent('selecting-item', e.model.item, this.selectItem);
    }
  }

  getCachedItems(){
    let allData = this._cachedItems;
    return allData;
  }

  getData() {
    let filteredData = [];
    let allData = this._cachedItems;
    if (allData && allData.length > 0) {
      let lastPageData = allData.slice(allData.length - this.pageSize, allData.length);
      let lastPageFilteredData = lastPageData.filter(function (element) {
        if (element != undefined) {
          let keys = Object.keys(element);
          if (!(keys.length <= 0 || (keys.length == 1 && keys[0] == "errors"))) {
            return element;
          }
        }
      });
      if (allData.length > this.pageSize) {
        filteredData = allData.slice(0, allData.length - this.pageSize);
        if (lastPageFilteredData && lastPageFilteredData.length) {
          lastPageFilteredData.forEach(function (item) {
            filteredData.push(item);
          }, this);
        }
      } else {
        filteredData = lastPageFilteredData;
      }
    }
    return filteredData;
  }
  getSelectedItems() {
    if (!this.selectedItems.inverted) {
      return this.selectedItems;
    }
    let items = this.getData();
    this.selectedItems.forEach(function (item) {
      let index = items.indexOf(item);
      if (index > -1) {
        items.splice(index, 1);
      }
    });
    return items;
  }
  deleteItems(items) {
    for (let i = 0; i < items.length; i++) {
      if (this.items.length) {
        let index = this.items.indexOf(items[i]);
        this.push("deletedItems", items[i]);
        this.splice("items", index, 1);
        continue;
      }

      let index = this._cachedItems.indexOf(items[i]);
      this.push("deletedItems", items[i]);
      this.splice("_cachedItems", index, 1);
    }

    this._deletedItemsChanged();
  }
  _rowDblClicked(e) {
    let detail = {
      "item": e.currentTarget.item,
      "index": e.currentTarget.index
    };
    this.dispatchEvent(new CustomEvent('row-dbl-clicked', {
      detail: detail,
      bubbles: true,
      composed: true
    }));
  }
  _getRowHeader(index) {
    if (this.rows && this.rows.length && this.rows[index]) {
      return this.rows[index].header;
    }
    return "";
  }
  _isRowHeader(column) {
    if (column && column.columnObject) {
      return column.columnObject.isRowHeader;
    }
  }

  _isRowFrozen(index) {
    if (this.rows && this.rows.length) {
      return this.rows[index].isFrozen;
    }
  }

  _freezeDataTableCells(isVertical) {

    if (isVertical) {
      let frozenRowCells = this.querySelectorAll("data-table-cell[frozen-row]");
      let frozenCellTransform = this._getTranslate(0, this.$.list._scrollTop);
      this._transformCells(frozenRowCells, frozenCellTransform, 1);
    } else {
      let frozenColumnCells = this.querySelectorAll("data-table-cell[frozen]");
      let frozenCellTransform = this._getTranslate(this._scrollLeft, 0);
      this._transformCells(frozenColumnCells, frozenCellTransform, 1);
    }

    let frozenCrossCells = this.querySelectorAll("data-table-cell[frozen-row][frozen]");
    let frozenCellTransform = this._getTranslate(this._scrollLeft, this.$.list._scrollTop);
    this._transformCells(frozenCrossCells, frozenCellTransform, 2);
  }

  _transformCells(frozenDataTableCells, transform, zIndex) {
    if (frozenDataTableCells && frozenDataTableCells.length && transform) {
      for (let i = 0; i < frozenDataTableCells.length; i++) {
        frozenDataTableCells[i].style.transform = transform;
        frozenDataTableCells[i].style.backgroundColor = "white";
        frozenDataTableCells[i].style.zIndex = zIndex;
      }
    }
  }

  _getTranslate(x, y) {
    return 'translate(' + x + 'px,' + y + 'px)';
  }

  _getRowTranslate(y) {
    return 'translateY(' + y + 'px)';
  }
  _calculateRowCount(event) {
    let pebbleDataTableOffsetY, mouseEventOffSetTop, gridTopHeight;
    let gridRowHeight = 0,
      gridHeaderHeight = 0;
    gridHeaderHeight = this.querySelectorAll('data-table-row')[0].offsetHeight;
    let paths = ElementHelper.getElementPath(event);
    if (paths) {
      for (let key = 0; key < paths.length; key++) {
        if (paths[key].tagName) {
          if (paths[key].tagName.toUpperCase() == "DATA-TABLE-ROW") {
            gridRowHeight = paths[key].offsetHeight;
            break;
          }
        }
      }
    }
    pebbleDataTableOffsetY = this.getBoundingClientRect().y;
    mouseEventOffSetTop = event.pageY - event.target.offsetTop;
    gridTopHeight = mouseEventOffSetTop - (pebbleDataTableOffsetY + gridHeaderHeight)
    this.topVirtualDomRowCount = Math.floor(gridTopHeight / gridRowHeight);
  }
  _onRowDropped(e, detail) {
    let event, item;
    let cachedItems = DataHelper.cloneObject(this._cachedItems);
    event = detail.event;
    item = this._cachedItems[detail.pickedRowIndex];
    cachedItems.splice(detail.pickedRowIndex, 1);
    cachedItems.splice(detail.droppedAtIndex, 0, item);
    detail["dragDropItems"] = [];
    detail.dragDropItems.push(cachedItems);
    this._calculateRowCount(event);
    this.dispatchEvent(new CustomEvent("row-drop-event", {
      detail: detail,
      bubbles: true,
      composed: true
    }));
  }
  _emptyChildNode() {
    let ulNode = this._rowTracker.querySelector('ul');
    ComponentHelper.clearNode(ulNode);
  }
  _onDragStarted(e) {
    let itemPicked;
    let rowListHTML;
    this._emptyChildNode();
    if (e.detail && e.detail.pickedIndex != undefined) {
      if (this._cachedItems) {
        itemPicked = this._cachedItems[e.detail.pickedIndex];
        let columns = this.columns;
        const frag = document.createDocumentFragment();
        for (let i = 0; i < columns.length; i++) {
          if (columns[i] && this.columns[i].modelObject && columns[i].modelObject.name) {
            let columnData = itemPicked[columns[i].modelObject.name] || '';
            let li = document.createElement("li");
            li.innerHTML = columnData;
            frag.appendChild(li);
          }
        }
        this._rowTracker.querySelector('ul').appendChild(frag);
        this._rowTracker.classList.add('fader');
      }
    }
    this.updateStyles({
      '--tracker-left': e.detail.x + 5 + 'px',
      '--tracker-top': e.detail.y + 5 + 'px'
    });
  }
  _onDragInProgress(e) {
    let gridHeaderHeight = 0,
      gridTopPosition = 0,
      gridbottomPosition = 0
    this.updateStyles({
      '--tracker-left': e.detail.x + 5 + 'px',
      '--tracker-top': e.detail.y + 5 + 'px',
      "--tracker-border-bottom": 2 + "px"
    });
    gridHeaderHeight = this.querySelectorAll('data-table-row')[0].offsetHeight;
    gridTopPosition = this.getBoundingClientRect().y + gridHeaderHeight;
    gridbottomPosition = gridTopPosition + this.$.list.offsetHeight;
    if (e.detail.y > gridbottomPosition) {
      if (this.setIntervelDragDownFlag) {
        this.setIntervelDragDown = setInterval(function () {
          this.$.list.scrollTop = 5 + this.$.list.scrollTop;
        }.bind(this), 35);
        this.setIntervelDragDownFlag = false;
      }
    } else {
      this.setIntervelDragDownFlag = true;
      clearInterval(this.setIntervelDragDown);
    }
    if (e.detail.y < gridTopPosition) {
      if (this.setIntervelDragUpFlag) {
        this.setIntervelDragUp = setInterval(function () {
          this.$.list.scrollTop = this.$.list.scrollTop - 5;
        }.bind(this), 35);
        this.setIntervelDragUpFlag = false;
      }
    } else {
      this.setIntervelDragUpFlag = true;
      clearInterval(this.setIntervelDragUp);
    }

  }
  _onDragEnd(e) {
    this.updateStyles({
      "--tracker-border-bottom": 0 + "px"
    });
    clearInterval(this.setIntervelDragUp);
    clearInterval(this.setIntervelDragDown);

    this._rowTracker.classList.remove('fader');
  }
  updateData(data, detail) {
    if (!_.isEmpty(data)) {
      this.loading = true;
      setTimeout(() => {
        this.loading = false;
        this.set("_cachedItems", data);
        this.$.list.scrollToIndex(detail.droppedAtIndex - this.topVirtualDomRowCount);
      }, 300);
    }
  }
  _computePrimaryClass(item) {
    if (item.isprimary == "true") {
      return "isPrimary"
    }
    return "";
  }
  _onColumnSelectionChanged(e, detail) {
    if (!this.enableColumnMultiSelect && e.currentTarget.nodeName == "PEBBLE-CHECKBOX") {
      let colSelectableRow = this._getParentElement(e.currentTarget, "DATA-TABLE-ROW");
      let colSelectableRowCheckList = colSelectableRow.querySelectorAll("pebble-checkbox");
      let currentTargetStatus = e.currentTarget.checked;

      for (let i = 0; i < colSelectableRowCheckList.length; i++) {
        colSelectableRowCheckList[i].checked = false;
      }
      e.currentTarget.checked = currentTargetStatus;
    }

    let eventDetails = {
      "value": e.currentTarget.getAttribute("value")
    };
    if (e.currentTarget.nodeName == "PEBBLE-CHECKBOX") {
      eventDetails["checked"] = e.currentTarget.checked;
    }

    this.dispatchEvent(new CustomEvent('column-selection-changed', {
      detail: eventDetails,
      bubbles: true,
      composed: true
    }));
  }
  _getParentElement(currentElement, nodeName) {
    let element = currentElement;
    while (element.nodeName != nodeName) {
      element = element.parentElement;
    }
    return element;
  }
}
customElements.define(PebbleDataTable.is, PebbleDataTable);
