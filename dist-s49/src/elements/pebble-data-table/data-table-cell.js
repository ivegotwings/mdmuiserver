import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import saulis from './data-table-templatizer-behavior.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class DataTableCell extends mixinBehaviors([saulis.DataTableTemplatizerBehavior], OptionalMutableData(
  PolymerElement)) {
  static get template() {
    return html`
    <style>
      :host {
        flex: 1 0 100px;
        padding: 0 24px 0 24px;
        min-height: 10px;
        /* Prevent iron-list from looping when item height is really small */
        display: -webkit-box;
        display: -moz-box;
        display: -ms-flexbox;
        display: -webkit-flex;
        display: flex;
        align-items: center;
        /*overflow: hidden;*/
        transition: flex-basis 200ms, flex-grow 200ms;
      }

      _:-ms-lang(x),
      _:-webkit-full-screen,
      :host {
        transition: inital;
        -ms-transition: inital;
      }

      :host([hidden]) {
        display: none;
      }
    </style>
    <slot name="cell-slot-content"></slot>
`;
  }

  static get is() {
    return "data-table-cell";
  }
  static get properties() {
    return {
      alignRight: {
        type: Boolean
      },
      column: {
        type: Object
      },
      flex: {
        type: Number
      },
      classes:{
        type:String
      },
      header: {
        type: Boolean
      },
      hidden: {
        type: Boolean
      },
      order: {
        type: Number
      },
      template: {
        type: Object
      },
      width: {
        type: String
      },

      beforeBind: {
        type: Object,
        value: function () {
          return function (data, cell) {};
        }
      }
    }
  }
  static get observers() {
    return [
      '_beforeBind(beforeBind, column.*, index, item.*, expanded, selected)',
      '_beforeBindHeader(beforeBind, column.*)',
      '_alignRightChanged(alignRight)',
      '_columnChanged(_instance, column)',
      '_flexChanged(flex)',
      '_hiddenChanged(hidden)',
      '_orderChanged(order)',
      '_widthChanged(width)',
      '_columnClassChanged(classes)'
    ]
  }
  connectedCallback() {
    super.connectedCallback();
  }

  /**
   * Remove all non polymer elements in the slot 
   * from receiving observer triggers
   * */

  _alignRightChanged(alignRight) {
    if (alignRight != undefined && !_.isEmpty(alignRight)) {
      this.style.flexDirection = alignRight ? 'row-reverse' : 'row';
    }
  }

  _beforeBind(beforeBind, column, index, item, expanded, selected) {
    //TODO need to check functionally what all combinations should aloow to execute this function instead waiting for all params with some other values.
    if (!(beforeBind === undefined || column === undefined || index === undefined || item == undefined ||
        expanded === undefined || selected === undefined)) {
      let data = {
        column: column.base,
        index: index,
        item: item.base,
        expanded: expanded,
        selected: selected
      };

      beforeBind(data, this);
    }
  }

  // header cells aren't bound with item, index etc. so _beforeBind is never
  // called for them so we need a separate observer.
  _beforeBindHeader(beforeBind, column) {
    if (!(beforeBind === undefined || column === undefined)) {
      if (this.header) {
        let data = {
          column: column.base
        };

        beforeBind(data, this);
      }
    }
  }

  _hiddenChanged(hidden) {
    if (hidden != undefined) {
      this.toggleAttribute('hidden', hidden);
    }
  }

  _orderChanged(order) {
    if (order != undefined && !_.isEmpty(order)) {
      this.style.order = order;
    }
  }

  _flexChanged(flex) {
    if (flex != undefined) {
      this.style.flexGrow = flex;
    }
  }
  _columnClassChanged(classes){
    if(classes){
      this.className += " " + classes;
    }
  }

  _widthChanged(width) {
    if (width != undefined && !_.isEmpty(width)) {
      this.style.flexBasis = width; /* Flex basis value affected alignment between header and corresponding content in column for rock grid */
    }
  }

  _columnChanged(instance, column) {
    if (!(instance === undefined || column === undefined)) {
      instance.column = column;
    }
  }
}
customElements.define(DataTableCell.is, DataTableCell);
