import '../liquid-dataobject-save-behavior/liquid-dataobject-save-behavior.js';
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';

class LiquidEntityDataSave
    extends mixinBehaviors([
      RUFBehaviors.LiquidDataObjectSaveBehavior
    ], PolymerElement) {
  static get template() {
    return html`
    `;
  }
  static get is() { return 'liquid-entity-data-save' }

  constructor() {
    super();
  }

  static get properties() {
    return {
        dataIndex: {
          type: String,
          value: "entityData"
      },

      objectsCollectionName: {
          type: String,
          value: "entities"
      }
    }
  }
}

customElements.define(LiquidEntityDataSave.is, LiquidEntityDataSave);