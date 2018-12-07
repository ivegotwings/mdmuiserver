/**
<b><i>Content development is under progress... </b></i> 
@demo demo/index.html 
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import '../liquid-dataobject-get-behavior/liquid-dataobject-get-behavior.js';

class LiquidConfigGet
    extends mixinBehaviors([
      RUFBehaviors.LiquidDataObjectGetBehavior
    ], PolymerElement) {
  static get template() {
    return Polymer.html`
    `;
  }
  static get is() { return 'liquid-config-get' }

  constructor() {
    super();
  }

  static get properties() {
    return {
        dataIndex: {
          type: String,
          value: "config"
      }
    }
  }
}

customElements.define(LiquidConfigGet.is, LiquidConfigGet);