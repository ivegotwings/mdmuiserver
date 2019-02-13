/**
`<pebble-textbox-collection>` Represents an element which contains the tags with the "manage" option.

### Example

    <pebble-collection-container label="[[label]]" values="{{values}}" is-readonly="[[isReadonly]]">
        <div class="tag-container">
            <pebble-textbox id='txtInputTag' label="[[_getLabel(_isEdit)]]" value="{{_tagInputText}}" on-keyup="_onEnter">
                <pebble-icon icon="[[_getIcon(_isEdit)]]" suffix on-tap="_onTapIcon"></pebble-icon>
            </pebble-textbox>
            <span class="message" hidden="[[!_showMessage]]">Already exists</span>
        </div>
    </pebble-collection-container>

### Styling
The following custom properties and mixins are available for styling:

Custom property | Description | Default
----------------|-------------|----------
`--text-collection-container` | Mixin applied to component | {}
`--line-with-icon` | Mixing for a line and dropdown icon section | {}
`--line-with-icon-readonly` | Mixing for a line and dropdown icon section when readonly | {}
`--text-collection-label` | Mixin applied to component label | {}
`--tags-container` | Mixin applied to tags container | {}
`--tag-value` | Mixin applied to tag value | {}
`--tag-close-icon` | Mixin applied to tag close | {}
`--text-collection-popover` | Mixin applied to tags collection popover | {}
`--dropdown-icon` | Mixin applied to dropdown icon | {}

@group rock Elements
@element pebble-collection-container
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import '@polymer/polymer/lib/utils/async.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-icons/pebble-icons.js';
import '../pebble-popover/pebble-popover.js';
import '../pebble-tags/pebble-tags.js';
import '../pebble-info-icon/pebble-info-icon.js';
import { flush } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class PebbleCollectionContainer extends
    mixinBehaviors([RUFBehaviors.UIBehavior], OptionalMutableData(PolymerElement)) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-scroll-bar bedrock-style-icons bedrock-style-padding-margin">
            #line-with-icon {
                border-bottom: 1px solid var(--default-border-color, #c1cad4);
                text-align: right;
                position: absolute;
                right: 0;
                left: 0;
                bottom: 0;
            }

            #line-with-icon .dropdown-icon {
                color: var(--default-icon-color, #7f7f7f);
                cursor: pointer;
            }

            :host([is-readonly]) #line-with-icon {
                border: 0px !important;
                @apply --line-with-icon-readonly;
            }

            :host([is-readonly]) .text-collection-container {
                border-bottom: 1px solid #E0E0E0;
                box-shadow: 0 2px 6px -6px #000;
                -webkit-box-shadow: 0 2px 6px -6px #000;
                -moz-box-shadow: 0 2px 6px -6px #000;
                -ms-box-shadow: 0 2px 6px -6px #000;
                @apply --text-collection-container-readyonly-table;

            }

            .text-collection-container {
                position: relative;
                min-height: 28px;
                margin-top: 4px;
                @apply --text-collection-container;
                @apply --text-collection-container-table;
            }

            .text-collection-container .tags-container {
                position: relative;
                z-index: 1;
                min-height: 26px;
                margin-right: 15px;
                display: block;
                @apply --layout-horizontal;
                @apply --layout-wrap;
                @apply --tags-container;
            }

            .text-collection-label {
                font-size: var(--font-size-md, 16px) !important;
                color: var(--input-label-color, #96b0c6);
                line-height: 17px;
                transition: all 0.2s;
                position: absolute;
                top: 6px;
                width:calc(100% - 100px);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                @apply --text-collection-label;
            }

            :host([is-readonly]) .text-collection-label {
                font-size: var(--font-size-xs, 12px) !important;
                position: relative;
                top: 0;
            }

            :host([is-readonly]) {
                --pebble-tag-value: {
                    cursor: default;
                }
            }

            :host([is-readonly]) .text-collection-container.have-values .text-collection-label {
                top: 0;
                font-size: var(--font-size-sm, 12px) !important;
            }

            .text-collection-container.have-values .text-collection-label {
                top: -16px;
                font-size: 12px !important;
            }

            pebble-popover {
                --pebble-popover-width: 260px;
                --pebble-popover-max-width: 400px;
                @apply --text-collection-popover;
            }

            pebble-popover {
                --popover: {
                    min-width: 260px;
                }
            }
            .attribute-view-wrapper {
                font-size: var(--font-size-sm, 12px);
                font-family: 'Roboto', Helvetica, Arial, sans-serif;
                font-weight: normal;
                font-style: normal;
                font-stretch: normal;
                line-height: 16px;
                text-transform: capitalize;
                color: var(--label-text-color, #96b0c6);
                width:calc(100% - 100px);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                @apply --context-coalesce-label;
            }
            .attribute-view-label{
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                display:inline-block;
                max-width:calc(100% - 20px)
            }
        </style>
        <div class\$="text-collection-container [[_valuesClass]]" id="collection_container_wrapper">
            <div class\$="[[_getLabelClassName()]]" title$="[[label]]">
                <span class="attribute-view-label">[[label]]</span>
                <template is="dom-if" if="[[descriptionObject]]">
                    <pebble-info-icon description-object="[[descriptionObject]]"></pebble-info-icon>
                </template>
            </div>
            <div class="tags-container">
                <bedrock-pubsub event-name="on-tap-tag-item" handler="_onTapTag"></bedrock-pubsub>
                <bedrock-pubsub event-name="on-tap-tag-remove" handler="_onTapRemove"></bedrock-pubsub>
                <!-- Disabled default edit to implement custom edit -->
                <pebble-tags tags="{{values}}" display-limit="[[displayLimit]]" show-remove-icon="[[!isReadonly]]" show-seperator="[[showSeperator]]" seperator="[[seperator]]" class="m-t-5"></pebble-tags>
            </div>
            <template is="dom-if" if="[[!noPopover]]">
                <div id="line-with-icon">
                    <pebble-icon hidden\$="[[isReadonly]]" class="dropdown-icon pebble-icon-size-12" icon="[[collectionIcon]]" suffix=""></pebble-icon>
                </div>
                <template is="dom-if" if="[[_isReadyToShowPopover]]">
                    <pebble-popover id="tagPopover" for="line-with-icon">
                        <slot></slot>
                    </pebble-popover>
                </template>
            </template>
            <template is="dom-if" if="[[noPopover]]">
                <slot></slot>
            </template>
            <!-- <bedrock-pubsub event-name="on-popover-open" handler="_onPopoverOpen"></bedrock-pubsub>
            <bedrock-pubsub event-name="on-popover-close" handler="_onPopoverClose"></bedrock-pubsub> -->
        </div>
`;
  }

  static get is() {
      return "pebble-collection-container";
  }

  static get properties() {
      return {
          /**
           * Indicates the tag items.
           */
          values: {
              type: Array,
              value: function () {
                  return [];
              },
              notify: true
          },
          /**
           * Indicates the label for the textbox collection.
           */
          label: {
              type: String,
              value: null
          },
          /**
           * Specifies whether or not the control is "read-only".
           */
          isReadonly: {
              type: Boolean,
              value: false,
              reflectToAttribute: true
          },
          /**
           * Indicates the display limit for tags.
           */
          displayLimit: {
              type: Number,
              value: 5
          },

          _showMoreMessage: {
              type: Boolean,
              value: false
          },
          _valuesClass: {
              type: String
          },
          /**
           * Indicates whether to disable the floating label or not.
           * Set the value as <b>true</b> to disable the floating label.
           */
          noLabelFloat: {
              type: Boolean,
              value: false
          },
          noPopover: {
              type: Boolean,
              value: false
          },
          /**
           * Description object should contain non-empty
           * description field (type type: Array or String)
           */
          descriptionObject: {
              type: Object,
              notify: true,
              value: function () {
                  return {};
              }
          },
          showSeperator: {
              type: Boolean,
              value: false
          },

          seperator: {
              type: String,
              value: null
          },
          collectionIcon:{
              type:String,
              value:"pebble-icon:navigation-action-down"
          },
          _isReadyToShowPopover: {
              type: Boolean,
              value: false
          }
      };
  }

  static get observers() {
      return [
          '_onValuesChange(values.*)'
      ];
  }

  constructor() {
      super();
  }

  /**
   * Can be used to add the tag item.
   */
  add(item) {
      if (!this.isExists(item)) {
          this.push('values', item);

          // setTimeout(() => {
          //     if (this._getPopover()) {
          //         this._getPopover().refitPopover();
          //     }
          // }, 10);

          //Trigger add event
          this.fireBedrockEvent("on-tag-added-collection", item, { ignoreId: true });
      }
  }

  /**
   * Can be used to know whether or not the tag exists.
   */
  isExists(tag) {
      if (!tag) {
          return false;
      }

      if (this._getTagIndex(tag) != -1) {
          return true;
      }

      return false;
  }

  /**
   * Can be used to remove the tag item.
   */
  remove(tag) {
      if (tag) {
          let index = this._getTagIndex(tag);

          if (index != -1) {
              this.splice('values', index, 1);

              //Trigger remove event
              this.fireBedrockEvent("on-tag-removed-collection", tag, { ignoreId: true });
          }
      }
  }

  /**
   * Can be used to open the popover.
   */
  openPopover(e) {
      this._isReadyToShowPopover = true;
      flush();
      let tagPopover = this._getPopover();
      if (!this.noPopover && tagPopover && !this.isReadonly) {
          tagPopover.show();
          this.fireBedrockEvent("collection-container-open");
      }
  }

  /**
   * Can be used to close the popover.
   */
  closePopover(e) {
      let tagPopover = this._getPopover();
      if (!this.noPopover && tagPopover) {
          tagPopover.hide();
          this.fireBedrockEvent("collection-container-close");
      }
      this._isReadyToShowPopover = false;
  }

  _onValuesChange() {
      if (this.values && this.values.length > 0) {
          this._valuesClass = "have-values";
      }
      else {
          this._valuesClass = "no-values";
      }
  }

  _onTapRemove(e, detail) {
      this.fireBedrockEvent("on-tap-remove-collection", detail, { ignoreId: true });
  }

  _onTapTag(e) {
      if (!this.isReadonly) {
          let selectedTag = { "index": e.detail.index }; //Current edit item                    
          this.fireBedrockEvent("on-tap-tag-collection", selectedTag, { ignoreId: true });
      }
  }

  _getTagIndex(tag) {
      let index = this.values.indexOf(tag);
      if (index == -1) {
          for (let i = 0; i < this.values.length; i++) {
              if (this.values[i].name.trim().toLowerCase() == tag.name.trim().toLowerCase()) {
                  return i;
              }
          }
      }
      else {
          return index;
      }

      return -1; //Not find the tag
  }

  // _setPopoverSize(event) {
  //     let popoverElement = this._getPopover();
  //     let thisElementWidth;
  //     if (popoverElement) {
  //         thisElementWidth = this.shadowRoot.querySelector("#collection_container_wrapper").offsetWidth;
  //         popoverElement.shadowRoot.querySelector(".popover").style.width = thisElementWidth + 'px'
  //     }
  // }

  // _onPopoverOpen() {
  //     this.fireBedrockEvent("collection-container-open");

  //     Polymer.Async.microTask.run(() => {
  //         if (this._getPopover()) {
  //             this._setPopoverSize();
  //             this._getPopover().refitPopover();
  //         }
  //     }); //Applied refit after opening the popover
  // }

  // _onPopoverClose() {
  //   this.fireBedrockEvent("collection-container-close");
  // }

  _getLabelClassName() {
      return this.noLabelFloat ? "attribute-view-wrapper" : "text-collection-label";
  }

  _getPopover() {
      this._tagPopover = this._tagPopover || this.shadowRoot.querySelector('#tagPopover');
      return this._tagPopover;
  }
}

customElements.define(PebbleCollectionContainer.is, PebbleCollectionContainer);
