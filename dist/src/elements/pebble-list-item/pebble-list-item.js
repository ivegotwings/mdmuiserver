/**
`pebble-list-item` Represents an element that displays an item in the list of items.

@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import '../bedrock-style-manager/styles/bedrock-style-common.js';
class PebbleLisItem extends PolymerElement {
  static get template() {
    return Polymer.html`
        <style include="bedrock-style-common">/* empty ref */</style>
        <slot></slot>
`;
  }

  static get is() {
      return "pebble-list-item";
  }
  static get properties() {
      return {

          /**
           * Indicates the index of the list item in list view.
           */
          index: {
              type: Number,
              notify: true,
              reflectToAttribute: true
          }
      }
  }
}
customElements.define(PebbleLisItem.is, PebbleLisItem);
