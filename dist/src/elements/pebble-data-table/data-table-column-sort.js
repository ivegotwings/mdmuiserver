import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import './data-table-icons.js';
import '../pebble-icon/pebble-icon.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
class DataTableColumnSort extends OptionalMutableData(PolymerElement) {
  static get template() {
    return Polymer.html`
    <style include="bedrock-style-common bedrock-style-icons">
      :host {
        display: block;
        margin: 0 4px;
        cursor: pointer;
      }

      :host([hidden]) {
        display: none;
      }

      pebble-icon {
        position: relative;
        opacity: .84;
        transition: all .2s;
      }

      @supports (-ms-ime-align: auto) {
        /* For EDGE browser */
        pebble-icon {
          padding: 0 !important;
        }
      }

      pebble-icon:hover,
      pebble-icon[focused] {
        color: var(--default-primary-color);
      }

      pebble-icon:not([direction]) {
        opacity: .26;
        position: relative;
        @apply --pebble-icon-opacity;
      }

      pebble-icon[direction='desc'] {
        transform: rotate(-180deg);
      }

      pebble-icon[hidden] {
        display: none;
      }

      .order {
        font-size: 9px;
        font-weight: bold;
        position: absolute;
        right: 4px;
        bottom: 8px;
        @apply --data-table-column-sort-order;
      }

      .wrapper {
        position: relative;
        top: -1px;
      }
    </style>

    <div class="wrapper">
      <pebble-icon id="sortIcon" class="pebble-icon-size-10 pebble-icon-color-blue" on-tap="_sort" icon="pebble-icon:sort-desc" direction\$="[[direction]]"></pebble-icon>
      <div class="order">[[order]]</div>
    </div>
`;
  }

  static get is() {
    return "data-table-column-sort";
  }
  static get properties() {
    return {
      direction: {
        type: String,
        notify: true
      },
      path: {
        type: String
      },
      order: {
        type: Number,
        computed: '_order(path, sortOrder, sortOrder.length)'
      },
      sortOrder: {
        type: Array
      },
      dataType: {
        type: String
      }
    }
  }
  static get observers() {
    return [
      '_sortOrderChanged(sortOrder.*)'
    ]
  }
  _order(path, sortOrder, length) {
    if (length <= 1) {
      return '';
    }

    for (let i = 0; i < length; i++) {
      if (sortOrder[i].path === path) {
        return i + 1;
      }
    }
  }

  _sortOrderChanged(sortOrder) {
    if (sortOrder != undefined) {
      // TODO: if sortOrder for this column has been removed from outside, direction is not updated.
      if (sortOrder.base) {
        sortOrder.base.forEach(function (sort) {
          if (sort.path === this.path) {
            this.direction = sort.direction;
            return;
          }
        }.bind(this));
      }
    }
  }

  _sort() {
    switch (this.direction) {
      case 'asc':
        this.direction = 'desc';
        break;

      case 'desc':
        this.direction = 'asc';
        break;

      default:
        this.direction = 'asc';
        break;
    }

    this.dispatchEvent(new CustomEvent('sort-direction-changed', {
      detail: {
        path: this.path,
        direction: this.direction,
        dataType: this.dataType
      },
      bubbles: true,
      composed: true
    }));
  }
}
customElements.define(DataTableColumnSort.is, DataTableColumnSort);
