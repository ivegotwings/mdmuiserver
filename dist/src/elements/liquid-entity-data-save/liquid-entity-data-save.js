import '@polymer/polymer/polymer-legacy.js';
import '../liquid-dataobject-save-behavior/liquid-dataobject-save-behavior.js';
import { Polymer as Polymer$0 } from '@polymer/polymer/lib/legacy/polymer-fn.js';

Polymer$0({
  _template: Polymer.html`

`,

  is: "liquid-entity-data-save",
  behaviors: [RUFBehaviors.LiquidDataObjectSaveBehavior],

  /**
    * Content is not appearing - Content development is under progress.
    */
  attached: function () {
  },

  /**
    * Content is not appearing - Content development is under progress.
    */
  ready: function () {
  },

  properties: {
      /**
        * <b><i>Content development is under progress... </b></i>
        */
      dataIndex: {
          type: String,
          value: "entityData"
      },

      objectsCollectionName: {
          type: String,
          value: "entities"
      }
  }
});
