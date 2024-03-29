/**
`pebble-tag-item` Represents a tag item which is used in the filters. It indicates the selections performed.

### Example

        <pebble-tag-item id="ex1" 
                         name="Brand"   
                         show-icon 
                         icon="settings" 
                         show-expand-icon 
                         show-remove-icon 
                         index="0">
        </pebble-tag-item>

### Styling
The following custom properties and mixins are available for styling:

Custom property | Description | Default
----------------|-------------|----------
`--tag-container` | Mixin applied to tag container | {}
`--tag-name` | Mixin applied to tag display name | {}
`--tag-value` | Mixin applied to tag display value | {}
`--expand-more-icon-styles` | Mixin applied to expand icon | {}
`--close-icon-styles` | Mixin applied to close icon | {}
`--expand-icon-section` | Mixin applied to expand section | {}
`--close-icon-section` | Mixin applied to close section | {}

@group Pebble Elements
@element pebble-tag-item
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../bedrock-style-manager/styles/bedrock-style-floating.js';
import '../pebble-icons/pebble-icons.js';
import '../pebble-icon/pebble-icon.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class PebbleTagItem extends mixinBehaviors([RUFBehaviors.UIBehavior], PolymerElement) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-floating bedrock-style-icons bedrock-style-padding-margin">
            :host {
                display: inline-flex;
                display: -webkit-inline-flex;
                margin-right: var(--default-margin-right, 6px);
                vertical-align: top;
                max-width: calc(100% - var(--default-margin-right, 6px));
            }

            .tag-value {
                @apply --pebble-tag-value;
            }

            .tag-item-container {
                border: solid 1px var(--default-tag-border);
                border-left: solid 4px var(--tag-color);
                border-radius: var(--default-border-radius);
                color: var(--palette-dark);
                padding: 0 15px 0px 5px;
                font-size: var(--font-size-sm, 12px);
                position: relative;
                background: var(--palette-white, #fff);
                margin-bottom: 4px;
                max-width: 100%;
                height: 22px;
                line-height: 20px;
                @apply --tag-item-container;
            }

            .tag-name-value {
                color: var(--text-primary-color, #1a2028);
                font-style: var(--text-font-style, normal);
                text-overflow: ellipsis;
                white-space: nowrap;
                max-width: 100%;
                float: left;
                overflow: hidden;
                cursor: default;
            }

            .tag-item {
                display: flex;
            }

            .expand-more {
                padding-right: 3px;
            }

            .close-icon {
                position: absolute;
                top: 0px;
                bottom: 0px;
                right: 4px;
            }
          
            .cursor-pointer {
                cursor: pointer;
            }
        </style>
        <div id="pebble-tag" class="tag-item-container border" title\$="[[_getNameValueTile(longName,_displayValue)]]">
            <template is="dom-if" if="{{_displayIcon(showIcon)}}">
                <pebble-icon id="icon" src="[[src]]" icon="[[icon]]"></pebble-icon>
            </template>
            <div class="tag-item" on-tap="_onTapEvent">
                <div class="tag-name-value">
                    <div class="inline-block">{{longName}}</div>
                    <template is="dom-if" if="{{displayValue}}">
                        <div class="inline-block value">
                            :&nbsp;{{_displayValue}}
                        </div>
                    </template>
                </div>
                <template is="dom-if" if="{{showExpandIcon}}">
                    <div class="expand-more pull-left">
                        <pebble-icon icon="pebble-icon:navigation-action-down" class="pebble-icon-size-10 m-l-5 cursor-pointer"></pebble-icon>
                    </div>
                </template>
            </div>
            <template is="dom-if" if="{{showRemoveIcon}}">
                <div class="close-icon">
                    <pebble-icon on-tap="_removeItem" icon="pebble-icon:window-action-close" class="pebble-icon-size-8 cursor-pointer"></pebble-icon>
                </div>
            </template>
        </div>
`;
  }

  static get is() {
      return "pebble-tag-item";
  }

  static get properties() {
      return {
          /**
           * Indicates the value of the attribute shown in the tag.
           */
          index: {
              type: Number,
              notify: true
          },

          /**
           * Indicates the display value of the attribute.
           */
          displayValue: {
              type: String,
              value: "",
              notify: true,
              observer: '_getDisplayValue'
          },

          /**
           * Indicates the display value of the parameters.
           */
          displayParams: {
              type: Array,
              value: function () { return []; },
              notify: true
          },

          _displayValue: {
              type: String,
              value: "",
          },

          /**
           * Indicates the value of the attributes shown in the tag.
           */
          value: {
              type: Object,
              value: function () { return {}; },
              notify: true
          },

          /**
           * Indicates the name of the attribute shown in the tag.
           */
          name: {
              type: String,
              value: null,
              notify: true
          },

          /**
           * Indicates the long name of the attribute shown in the tag.
           */
          longName: {
              type: String,
              value: null,
              notify: true
          },

          /**
           * Indicates the color of the tag.
           */
          tagColor: {
              type: String,
              notify: true,
              observer: '_colorChanged'
          },

          /**
           * Indicates "more options".
           */
          options: {
              type: Object,
              value: function () { return {}; }
          },

          /**
          * Specifies whether or not to show the remove icon on the tag.
          */
          showRemoveIcon: {
              type: Boolean,
              value: false
          },

          /**
           * Specifies the icon name or index in the set of icons available in
           * the icon set. Note that you must not specify the `src` property when the `icon` property is specified.
           */
          icon: {
              type: String,
              value: ''
          },

          /**
           * Indicates the URL of an image for the icon. Note that you must not specify the `src` property when the `icon` property is specified.
           */
          src: {
              type: String,
              value: ''
          },

          /**
          * Specifies whether or not to show an icon on the tag.
          */
          showIcon: {
              type: Boolean,
              value: false
          },

          /**
          * Specifies whether or not to show an expand icon on the tag.
          */
          showExpandIcon: {
              type: Boolean,
              value: false
          },

          textColor: {
              type: String,
              observer: '_textColorChanged'
          },

          fontStyle: {
              type: String,
              observer: '_fontStyleChanged'
          },

          isChildTag: {
              type: Boolean,
              value: false
          }
      }
  }

  constructor() {
      super();
  }

  connectedCallback() {
      super.connectedCallback();

      if (!this.longName && this.name) {
          this.longName = this.name;
      }

      if (!this.displayType) {
          this.displayType = "textArea";
      }
      this.fireBedrockEvent('tag-item-attached', this._getCurrentTag(), { ignoreId: true });
  }

  disconnectedCallback() {
      super.disconnectedCallback();
  }

  /**
   * This method is called when someone taps on the tag. If tag is editable, then the tag is switched to edit mode otherwise tag-item-select event is fired
   */
  _onTapEvent(e) {
      this.fireBedrockEvent('tag-item-tap', this._getCurrentTag(), { ignoreId: true });
  }

  /**
   * Handler for removing the tag item
   */
  _removeItem(e) {
      this.fireBedrockEvent('tag-item-remove', this._getCurrentTag(), { ignoreId: true });
      ElementHelper.noBubble(e);
  }

  _getCurrentTag() {
      return {
          "name": this.name,
          "longName": this.longName,
          "value": this.value,
          "index": this.index,
          "options": this.options,
          "isChildTag": this.isChildTag
      };
  }

  /**
   * Handler for checking if tagColor attribute is changed and if changed, change the color of the tag to the new color
   */
  _colorChanged() {
      if (this.tagColor) {
          this.updateStyles({ '--tag-color': this.tagColor });
      }
  }

  /**
   * Handler for checking if tagColor attribute is changed and if changed, change the color of the tag to the new color
   */
  _textColorChanged() {
      if (this.textColor) {
          this.updateStyles({ '--text-primary-color': this.textColor });
      } else {
          this.updateStyles({ '--text-primary-color': "" });
      }
  }

  _fontStyleChanged() {
      if (this.fontStyle) {
          this.updateStyles({ '--text-font-style': this.fontStyle });
      } else {
          this.updateStyles({ '--text-font-style': "normal" });
      }
  }

  _displayIcon() {
      if (this.showIcon && (this.icon || this.src)) {
          return true;
      }
      return false;
  }

  _getNameValueTile(name, value) {
      let nameValueTitle = ""
      if (name) {
          nameValueTitle += name;
      }
      if (value) {
          nameValueTitle += " " + value;
      }
      return nameValueTitle;
  }

  _getDisplayValue() {
      if (this.displayValue) {
          if (this.displayValue.indexOf("!%&") > -1) {
              this._displayValue = this.displayValue.replace(/!%&/g, "")
          } else {
              this._displayValue = this.displayValue;
          }
      }
  }
}
customElements.define(PebbleTagItem.is, PebbleTagItem);
