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

import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../pebble-button/pebble-button.js';
import '../pebble-dialog/pebble-dialog.js';
import '../pebble-vertical-divider/pebble-vertical-divider.js';
import '../rock-attribute-mapping-grid/rock-attribute-mapping-grid.js';
class RockAttributeMapping
    extends PolymerElement {
  static get template() {
    return Polymer.html`
        <style include="bedrock-style-common">
            :host {
                display: block;
                height: 100%;
            }
        </style>
        <rock-attribute-mapping-grid context-data="[[contextData]]" mapping-config="[[mappingConfig]]" mapping-data="[[mappingData]]" cop-context="[[copContext]]"></rock-attribute-mapping-grid>
`;
  }

  static get is() { return 'rock-attribute-mapping' }
  static get properties() {
      return {
          contextData: {
              type: Object,
              value: function () { return {}; }
          },

          businessFunctionData: {
              type: Object,
              value: function () { return {}; },
              observer: "_onBusinessFunctionDataChange"
          },
          /**
            * <b><i>Content development is under progress... </b></i> 
            */
          mappingConfig: {
              type: Object,
              value: function () { return {}; }
          },

          mappingData: {
              type: Object,
              value: function () { return {}; }
          },

          copContext: {
              type: Object,
              value: function () { return {}; }
          }
      }
  }

  _onBusinessFunctionDataChange() {
      if (!_.isEmpty(this.businessFunctionData) && this.businessFunctionData["attribute-mapping-data"]) {
          this.mappingData = this.businessFunctionData["attribute-mapping-data"];
      }
  }
}
customElements.define(RockAttributeMapping.is, RockAttributeMapping);
