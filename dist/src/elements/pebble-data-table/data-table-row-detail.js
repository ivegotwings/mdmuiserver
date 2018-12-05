import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import './data-table-templatizer-behavior.js';
import * as Settings  from '@polymer/polymer/lib/utils/settings.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class DataTableRowDetail extends mixinBehaviors([saulis.DataTableTemplatizerBehavior], OptionalMutableData(
  PolymerElement)) {
  static get template() {
    return Polymer.html`
    <style>
      :host {
        padding: 0 24px 0 24px;
        display: flex;
        display: -webkit-flex;
        align-items: center;
      }
    </style>
    <slot></slot>
`;
  }

  static get is() {
    return "data-table-row-detail";
  }
  static get properties() {
    return {
      beforeBind: Object
    }
  }
  static get observers() {
    return [
      '_beforeBind(beforeBind, item.*, index, selected, expanded)'
    ]
  }
  connectedCallback() {
    super.connectedCallback();
    if (!Settings.useShadow) {
      // details is supposed to be placed outside the local dom of pebble-data-table.
      Polymer.StyleTransformer.dom(this, 'pebble-data-table', this._scopeCssViaAttr, true);
      if (this.domHost) {
        Polymer.StyleTransformer.dom(this, this.domHost.tagName.toLowerCase(), this._scopeCssViaAttr, false);
      }
    }
  }

  _beforeBind(beforeBind, item, index, selected, expanded) {
    //TODO need to check functionally what all combinations should aloow to execute this function instead waiting for all params with some other values.

    if (!(beforeBind === undefined || item === undefined || index === undefined || selected === undefined ||
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
customElements.define(DataTableRowDetail.is, DataTableRowDetail);
