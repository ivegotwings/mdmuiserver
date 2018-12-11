/**
`pebble-tags` Represents a group of tag items which together forms a selection.

### Example

        <template>
          <pebble-tags id="exPebbleTags" disable-delete is-non-editable></pebble-tags>
          <script>

            var data = [
                {
                  "name": "Brand",
                  "value":"Levis",
                  "icon":"settings"
                },
                {
                  "name": "Color",
                  "value": "Red",
                }
              ];

            window.addEventListener('WebComponentsReady', function(e) {
              Polymer.dom(document).querySelector("#exPebbleTags").tags = data;
            });
            
          </script>
        </template>

### Styling
The following custom properties and mixins are available for styling:

Custom property | Description | Default
----------------|-------------|----------
`--tag-item-container` | Mixin applied to tag container | {}
`--tag-name` | Mixin applied to tag display name | {}
`--tag-value` | Mixin applied to tag display value | {}
`--expand-more-icon-styles` | Mixin applied to expand icon | {}
`--close-icon-styles` | Mixin applied to close icon | {}
`--expand-icon-section` | Mixin applied to expand section | {}
`--close-icon-section` | Mixin applied to close section | {}

@group Pebble Elements
@element pebble-tags
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../pebble-tag-item/pebble-tag-item.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class PebbleTags extends mixinBehaviors([RUFBehaviors.UIBehavior], OptionalMutableData(PolymerElement)) {
  static get template() {
    return html`
    <style include="bedrock-style-common">
      :host {
        display: block;
        width: 100%;
      }

      .more-values-message {
        display: inline-block;
        font-size: 12px;
        color: var(--palette-deep-sea-blue, #036bc3);
        cursor: pointer;
      }
      .tag-wrap-seperator{
          padding-right: 5px
      }
    </style>
    <div>
      <template is="dom-repeat" items="{{tags}}">
        <template is="dom-if" if="[[_showItem(index, displayLimit)]]">
          <template is="dom-if" if="[[_showSeperator(index)]]">
            <span class="tag-wrap-seperator">
              [[seperator]]
            </span>
          </template>
          <pebble-tag-item id\$="tag[[index]]" index="{{index}}" name\$="{{item.name}}" long-name="{{item.longName}}" value="{{item.value}}" display-value="{{item.displayValue}}" icon="[[item.icon]]" src="[[item.src]]" tag-color="[[item.color]]" text-color="[[item.textColor]]" font-style="[[item.fontStyle]]" options="[[item.options]]" show-icon="[[showIcon]]" show-expand-icon="[[showExpandIcon]]" show-remove-icon="[[showRemoveIcon]]" is-child-tag="[[item.isChildTag]]">
          </pebble-tag-item>
        </template>
      </template>
      <span class="more-values-message" hidden\$="[[!_enableShowMore]]" on-tap="_onTapShowMore">[[_limitMessage]]</span>
      <bedrock-pubsub event-name="tag-item-remove" handler="_onTagItemRemove"></bedrock-pubsub>
      <bedrock-pubsub event-name="tag-item-tap" handler="_onTagItemTap"></bedrock-pubsub>
      <bedrock-pubsub event-name="tag-item-attached" handler="_onTagItemAttached"></bedrock-pubsub>
    </div>
`;
  }

  static get is() {
    return "pebble-tags";
  }

  static get properties() {
    return {
        /**
         * Indicates the list of strings that holds the tags. Values in this array must be identical. 
         * Avoid duplicates due to the definition of the tags. Icons for individual tag can also be passed in this list.
         */
        tags: {
          type: Array,
          notify: true,
          value: function () { return []; }
        },

        /**
          * Specifies whether or not an icon is shown.
        */
        showIcon: {
          type: Boolean,
          value: false
        },

        /**
          * Specifies whether or not the deletion of a tag is allowed.
        */
        showRemoveIcon: {
          type: Boolean,
          value: false
        },

        /**
         * Specifies whether or not addition of more tags is allowed.
        */
        showExpandIcon: {
          type: Boolean,
          value: false
        },

        /**
         *  Indicates the reference to the currently opened tag.
         */
        currentTag: {
          type: Object,
          notify: true
        },

        /**
         * Indicates how many tags are displayed initially.
         * Default is zero and it indicates that there is no limit.
         */
        displayLimit: {
          type: Number,
          value: 0
        },

        _enableShowMore: {
          type: Boolean,
          value: false
        },

        _limitMessage: {
          type: String,
          values: "more values..."
        },

        showSeperator: {
          type: Boolean,
          value: false
        },

        seperator: {
          type: String,
          value: null
        }
    };
  }

  static get observers() {
    return [
      '_onTagsChange(tags.*)'
    ];
  }

  // Element Behavior
  /**
   * Can be used to add a new tag to the list.
   *
   * @param {JSON} the tag that needs to be added.
   */
  addTag(tag) {
    if (typeof (this.tags) == 'undefined') {
      this.tags = [];
    }
    if (typeof tag != "object") {
      this.logWarning("PebbleTagsAdd");
      return;
    }
    else {
      for (let i = 0; i < this.tags.length; i++) {
        if (this.tags[i].name == tag.name) {
          this.logWarning("PebbleTagsAddCheck", "tagName", tag.name);
          return;
        }
      }
    }

    this.push('tags', tag);
  }

  /**
    * <b><i>Content development is under progress... </b></i> 
    */
  removeAllTags() {
    this.tags = [];
  }

  /**
   * Handler for 'tag-item-remove' event, which is fired when a <tag-item> is being removed.
   *
   * @param {Object} event object.
   */
  _onTagItemRemove(e, detail) {
    //Clear values before removing
    this.set('tags.' + detail.index + '.displayParams', []);
    this.set('tags.' + detail.index + '.value', {});
    this.splice('tags', detail.index, 1);
    this.fireBedrockEvent('on-tap-tag-remove', detail, { ignoreId: true }); //Re-triggering from pebble-tag-item
  }

  _onTagItemTap(e, detail) {
    this.fireBedrockEvent('on-tap-tag-item', detail, { ignoreId: true }); //Re-triggering from pebble-tag-item
  }

  _onTagItemAttached(e, detail) {
    this.fireBedrockEvent('on-attached-tag-item', detail, { ignoreId: true }); //Re-triggering from pebble-tag-item
  }

  _showItem(index) {
    if (index < this.displayLimit || this.displayLimit == 0) {
      this._enableShowMore = false;
      return true;
    }

    this._enableShowMore = true;
    return false;
  }

  _onTapShowMore() {
    this._enableShowMore = false;
    this.displayLimit = 0;
    this.fireBedrockEvent('on-tap-show-more', null, { ignoreId: true });
  }

  _onTagsChange() {
    if (this.tags != undefined) {
      if (this.displayLimit != 0 && this.displayLimit < this.tags.length) {
        this._limitMessage = this.tags.length - this.displayLimit + " more values...";
      }
      else {
        this._limitMessage = "";
      }
    }
  }

  _showSeperator(index) {
    if (!this.showSeperator || !this.seperator) {
      return false;
    }

    if (index > 0) {
      return true;
    }

    return false;
  }
}
customElements.define(PebbleTags.is, PebbleTags);
