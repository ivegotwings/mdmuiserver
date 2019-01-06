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
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import '../liquid-dataobject-save-behavior/liquid-dataobject-save-behavior.js';

class LiquidConfigSave
    extends mixinBehaviors([
      RUFBehaviors.LiquidDataObjectSaveBehavior
    ], PolymerElement) {
  static get template() {
    return html`
    `;
  }
  static get is() { return 'liquid-config-save' }

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

customElements.define(LiquidConfigSave.is, LiquidConfigSave);
