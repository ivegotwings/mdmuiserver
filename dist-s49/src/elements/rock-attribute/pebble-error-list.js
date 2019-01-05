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

import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../pebble-button/pebble-button.js';
import '../pebble-image-viewer/pebble-image-viewer.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-icons/pebble-icons.js';
import '../pebble-horizontal-divider/pebble-horizontal-divider.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-text-alignment.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class PebbleErrorList extends mixinBehaviors([RUFBehaviors.UIBehavior], PolymerElement) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-icons bedrock-style-text-alignment">
            pebble-horizontal-divider {
                --pebble-horizontal-divider-color: var(--palette-pale-grey-three, #e7ebf0);
                @apply --entity-tofix-horizontal-divider;
            }

            .container {
                @apply --layout-horizontal;
                align-items: center;
                -webkit-align-items: center;
                /* Safari 7.0+ */
                max-height: 250px;
                max-width: 288px;
                padding: 5px 0;
                cursor: pointer;
                @apply --entity-container;
            }

            .entity-icon-outer {
                @apply --layout;
                @apply --layout-center-center;
                @apply --paper-font-common-base;
                @apply --entity-icon-outer-circle;
                padding: 0px;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                margin-right: 10px;
            }

            .error {
                background-color: var(--error-button-color, #f30440);
            }

            .warning {
                background-color: var(--warning-button-color, #f78e1e);
            }

            .entity-content {
                align-self: flex-center;
                -webkit-align-self: flex-center;
                @apply --entity-content;
            }

            .entity-content {
                font-size: var(--font-size-sm, 12px) !important;
            }

            .outer-container {
                width: 296px;
                word-wrap: break-word;
                padding: 0 20px;
            }
        </style>
        <div class="outer-container">
            <template is="dom-repeat" items="[[messages]]">
                <div class="container" data="[[item]]">
                    <div class\$="entity-icon-outer [[_getMessageClass(item)]]">
                        <pebble-icon icon="pebble-icon:notification-warning" class="pebble-icon-size-12 pebble-icon-color-white"></pebble-icon>
                    </div>
                    <template is="dom-if" if="{{_isObject(item)}}">
                        <div class="entity-content">
                            [[item.externalName]]: [[item.message]]
                        </div>
                    </template>
                    <template is="dom-if" if="{{!_isObject(item)}}">
                        <div class="entity-content">
                            [[item]]
                        </div>
                    </template>
                </div>
            </template>
            <div class="text-right">
                <pebble-button hidden\$="[[!showFixNow]]" id="fixNow" class="btn btn-sm btn-primary" button-text="Fix Now" on-tap="_fixNow" elevation="1" raised=""></pebble-button>
            </div>
        </div>
`;
  }

  static get is() {
      return "pebble-error-list";
  }
  static get properties() {
      return {
          /**
           * <b><i>Content development is under progress... </b></i> 
           */
          messages: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          errors: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          warnings: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          showFixNow: {
              type: Boolean,
              value: false
          },
      }
  }
  _fixNow(e) {
      this.fireBedrockEvent('fix-error', {
          "data": this.errors
      });
  }
  _isObject(item) {
      return item !== null && typeof item === 'object'
  }
  _getMessageClass(item) {
      if ((this.errors || []).indexOf(item) == -1 && (this.warnings || []).indexOf(item) != -1) {
          return "warning";
      }

      return "error";
  }
}
customElements.define(PebbleErrorList.is, PebbleErrorList);
