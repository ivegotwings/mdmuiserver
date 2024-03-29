/**
    @group rock Elements
    @element pebble-info-icon
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import '@polymer/iron-ajax/iron-ajax.js';
import '../bedrock-style-manager/styles/bedrock-style-list.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-icons/pebble-icons.js';
import '../pebble-popover/pebble-popover.js';
import '../pebble-button/pebble-button.js';
import { flush } from '@polymer/polymer/lib/legacy/polymer.dom.js';
class PebbleInfoIcon extends OptionalMutableData(PolymerElement){
  static get template() {
    return html`
        <style include="bedrock-style-list">
            :host {                
                height: 14px;
            }
            
            pebble-popover {
                font-weight: normal;
                text-transform: initial;
                --default-popup-b-p: 5px;
                --default-popup-t-p: 5px;
                --default-font-size: 12px;
            }

            .description-image-wrapper {
                cursor: pointer;
                vertical-align: top;
                display: inline-block;
                position: relative;
            }

            .attributes-description {
                padding-left: 5px;
                padding-right: 5px;
            }

            .description-list {
                margin: 0;
                padding: 0;
                max-width: 450px;
            }

            .description-item {
                list-style: none;
                white-space: pre-wrap;
            }

            #show-description-icon {
                width: 12px;
                height: 12px;
            }

            .icon-large {
                width: 14px;
                height: 14px;
            }

            .icon-normal {
                width: 12px;
                height: 12px;
            }

            .icon-small {
                width: 10px;
                height: 10px;
            }

            .image-position {
                position: absolute;
                top: 0;
                right: 0;
                height: 14px;
            }
        </style>

        <template is="dom-if" if="[[_items.length]]">
            <div class="description-image-wrapper" id="show-description-icon" on-mousedown="_showDescriptionClicked" on-tap="_showDescriptionClicked">
                &nbsp;&nbsp;
                <div class="image-position">
                    <img src\$="../../../src/images/[[icon]]" class\$="[[_getIconSizeClass()]]">
                </div>
            </div>
            <template is="dom-if" if="[[_showPopover]]">
                <pebble-popover id="description-popover" for="show-description-icon">
                    <div class="attributes-description">
                        <ul class="description-list">
                            <template is="dom-repeat" items="{{_items}}" as="item">
                                <li class="description-item">{{item}}</li>
                            </template>
                        </ul>
                    </div>
                </pebble-popover>
            </template>
        </template>
`;
  }

  static get is() {
      return "pebble-info-icon";
  }
  static get properties() {
      return {
          /**
           * Description object should contain non-empty
           * description field (type type: Array or String)
           */
          descriptionObject: {
              type: Object,
              notify: true,
              value: function () {
                  return {};
              },
              observer: "_descriptionObjectChanged"
          },
          /**
           * List of item will be rendered line-by-line
           */
          _items: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          /**
           * Image name in folder source folder (../../../src/images/)
           */
          icon: {
              type: String,
              value: "info-icon.svg"
          },
          /**
           * Possible values: 'large', 'normal', 'small'
           */
          iconSize: {
              type: String,
              value: "normal"
          },
          _showPopover: {
              type: Boolean,
              value: false
          }
      }
  }

  _getIconSizeClass() {
      return "icon-" + this.iconSize;
  }

  _descriptionObjectChanged(newValue) {
      if (newValue && newValue.description) {
          if (newValue.description instanceof Array) {
              this._items = newValue.description;
          } else {
              this._items = [newValue.description];
          }
      }
  }

  _showDescriptionClicked(e) {
      this._showPopover = true;
      flush();
      let descriptionPopover = this.shadowRoot.querySelector("#description-popover");
      if (descriptionPopover) {
          descriptionPopover.show();
      }

      e.stopPropagation();
  }
}

customElements.define(PebbleInfoIcon.is, PebbleInfoIcon);
