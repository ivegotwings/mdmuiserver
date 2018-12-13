/**
<b><i>Content development is under progress... </b></i> 
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

class PebbleSpinner extends PolymerElement {
  static get template() {
    return html`
    <style>      
        :host {
          position: absolute;
          background: rgba(255, 255, 255, 0.66);
          left: 0;          
          top: 0;
          right: 0;
          bottom: 0;
          margin:auto;
          opacity: 0;
          z-index:-1;
          @apply --pebble-spinner-position;
        }
        img{
          position: absolute;
          left: 0;
          top: 0;
          right: 0;
          bottom: 0;
          margin:auto;
        }
        :host([active]) {
          opacity: 1;
          z-index: 999;
        }
    </style>
    <!-- SVG spinner will add soon -->
   <img src="../../../src/images/loading.svg">
`;
  }

  static get is() {
      return "pebble-spinner";
  }
  static get properties() {
      return {
          active: {
              type: Boolean,
              reflectToAttribute: true,
              value: false
          }
      }
  }
}
customElements.define(PebbleSpinner.is, PebbleSpinner);
