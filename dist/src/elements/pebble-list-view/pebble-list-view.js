/**
`pebble-list-view` Represents an element that displays the list of items.

@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import '../bedrock-style-manager/styles/bedrock-style-common.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
class PebbleLisView extends PolymerElement {
  static get template() {
    return Polymer.html`
        <style include="bedrock-style-common">/* empty ref */</style>
        <slot id="templates" name="pebble-list-item"></slot>
`;
  }

  static get is() {
      return "pebble-list-view";
  }
  static get properties() {
      return {
          /**
           *  Indicates the total number of list items in the list view.
           */
          length: Number
      }
  }
  ready() {
      super.ready();
      let templates = dom(this.$.templates).getDistributedNodes();
      if (templates && templates.length > 0) {
          this.length = templates.length;
          for (let i = 0; i < templates.length; i++) {
              templates[i].index = i;
          }
      }
  }
}
customElements.define(PebbleLisView.is, PebbleLisView);
