import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class DataTableRow extends mixinBehaviors([RUFBehaviors.UIBehavior], OptionalMutableData(
  PolymerElement)) {
  static get template() {
    return html`
    <style>
      :host {
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
        opacity: 1;
        cursor: pointer;

        @apply --pebble-data-table-row;
      }

      :host([selected]) .cells {
        @apply --pebble-data-table-row-selected;
      }

      :host(:not([header])[even]) {
        @apply --pebble-data-table-row-even;
      }

      :host(:not([header]):not([even])) {
        @apply --pebble-data-table-row-odd;
      }

      :host(:focus) {
        outline: none;
        @apply --pebble-data-table-row-focused;
      }

      :host(:not([header]):hover) {
        @apply --pebble-data-table-row-hover;
      }

      :host(:focus):after {
        @apply --pebble-data-table-row-focused-after;
      }

      :host:after {
        @apply --pebble-data-table-row-after;
      }

      .cells {
        display: -webkit-box;
        display: -moz-box;
        display: -ms-flexbox;
        display: -webkit-flex;
        display: flex;
        -webkit-box-orient: horizontal;
        -moz-box-orient: horizontal;
        -webkit-box-direction: normal;
        -moz-box-direction: normal;
        -webkit-flex-direction: row;
        -ms-flex-direction: row;
        flex-direction: row;
        width: 100%;
      }

      .activebg {
        @apply --pebble-data-table-row-cell;
      }

      :host([header]) .cells:hover::after {
        @apply --pebble-data-table-row-cell-after-header;
      }

      .cells:hover::after {
        @apply --pebble-data-table-row-cell-after;
      }

      .cells {
        -moz-user-select: text;
        -ms-user-select: text;
        -webkit-user-select: text;
        user-select: text;

      }

      :host(.isPrimary) {
        background-color: #e8ecf1 !important;
      }
    </style>
    <div class="cells" on-mousedown="dragMouseDown" on-mouseup="closeDragElement" on-track="handleTrack">
      <slot name="row-header"></slot>
      <slot name="data-table-checkbox-slot"></slot>
      <slot name="data-table-cell-slot"></slot>
    </div>
    <div class="details">
      <slot name="data-table-row-detail-slot"></slot>
    </div>
`;
  }

  static get is() {
    return "data-table-row";
  }
  static get properties() {
    return {
      beforeBind: {
        type: Object
      },
      expanded: {
        type: Boolean,
        reflectToAttribute: true
      },
      index: {
        type: Number
      },
      item: {
        type: Object
      },
      selected: {
        type: Boolean,
        reflectToAttribute: true
      },
      _static: {
        type: Object,
        value: {
          id: 0
        }
      },
      rowDragDropEnabled: {
        type: Boolean
      },
      pickedIndex: {
        type: Number
      }
    }
  }
  static get observers() {
    return [
      '_beforeBind(beforeBind, index, item.*, selected, expanded)'
    ]
  }
  connectedCallback() {
    super.connectedCallback();
    if (this.domHost && this.domHost.tagName && this.domHost.tagName.toUpperCase() === 'PEBBLE-DATA-TABLE') {
      let id = this._static.id++;

      let item = this.parentElement;
      if (!item._rowId) {
        let _contentElement = document.createElement('slot');

        this.id = 'item' + id;
        if (this.hasAttribute('header')) {
          _contentElement.setAttribute('name', "header");
        } else {
          _contentElement.setAttribute('name', "#" + this.id);
          this.slot = "#" + this.id;
        }
        // if(this.slot && (this.slot == 'data-table-list-item')){
        //   this._contentElement.setAttribute('name', "#"+this.id);
        // this.slot = "#"+this.id;
        // }else{
        //   this._contentElement.setAttribute('name', 'data-table-header');
        // }
        dom(item).node.appendChild(_contentElement);
        item._rowId = id;
        dom(this.domHost).node.appendChild(this);

        // reset the cached value for shady root owner to make this.domHost
        // return correct value.  `
        this._ownerShadyRoot = undefined;
      }
    }
  }
  dragMouseDown(e) {
    if (this.rowDragDropEnabled) {
      this.pickedIndex = this.index;
      this.parentNode["pickedRowIndex"] = this.index;
    }
  }
  _getAnchorTag(event) {
    let paths = ElementHelper.getElementPath(event);

    let isAnchorTagAvailable = false;
    for (let key = 0; key < paths.length; key++) {
      if (paths[key].tagName) {
        if (paths[key].tagName.toUpperCase() == "A") {
          isAnchorTagAvailable = true;
          break;
        }
      }
    }
    return isAnchorTagAvailable;
  }
  handleTrack(e) {
    if (this.rowDragDropEnabled) {
      if (!this._getAnchorTag(e)) {
        switch (e.detail.state) {
          case 'start':
            e.detail.pickedIndex = this.pickedIndex;
            this._addPickedBackgroundColor();
            this.fireBedrockEvent("drag-started", e.detail, {
              ignoreId: true
            });
            break;
          case 'track':
            this.fireBedrockEvent("drag-inprogress", e.detail, {
              ignoreId: true
            });
            break;
          case 'end':
            this.fireBedrockEvent("drag-ended", e.detail, {
              ignoreId: true
            });
        }
      }
    }
  }
  closeDragElement(e) {
    if (this.rowDragDropEnabled) {
      let eventDetail = {
        "pickedRowIndex": this.parentNode["pickedRowIndex"],
        "droppedAtIndex": this.index,
        "event": e
      };
      this._removeBackgroundColor();
      if (eventDetail.pickedRowIndex !== eventDetail.droppedAtIndex) {
        this.fireBedrockEvent("row-dropped", eventDetail, {
          ignoreId: true
        });
      }
    }
  }
  _addPickedBackgroundColor() {
    this._removeBackgroundColor();
    this.shadowRoot.querySelector('.cells').classList.add('activebg');
  }
  /* for remove*/
  /* _addDropBackgroundColor: function (event) {
     this._removeBackgroundColor();
     var dataTableRows;
     for (var key = 0; key < event.path.length; key++) {
       if (event.path[key].tagName) {
         if (event.path[key].tagName.toUpperCase() == "DATA-TABLE-ROW") {
           dataTableRows = event.path[key];
           break;
         }
       }
     }
     dataTableRows.shadowRoot.querySelector('.cells').classList.add('activebg');
   },*/
  _removeBackgroundColor() {
    let dataTableRows = this.parentElement.querySelectorAll('data-table-row');
    for (let i = 0; i < dataTableRows.length; i++) {
      const cells = dataTableRows[i].shadowRoot.querySelector('.cells');
      if (cells) {
        cells.classList.remove('activebg');
      }
    }
  }
  _beforeBind(beforeBind, index, item, selected, expanded) {
    //TODO need to check functionally what all combinations should aloow to execute this function instead waiting for all params with some other values.
    if (!(beforeBind === undefined || index === undefined || item === undefined || selected === undefined ||
        expanded === undefined)) {
      let data = {
        index: index,
        item: item.base,
        expanded: expanded,
        selected: selected
      };

      beforeBind(data, this);
    }
  }
}
customElements.define(DataTableRow.is, DataTableRow);
